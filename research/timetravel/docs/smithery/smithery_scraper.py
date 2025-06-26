#!/usr/bin/env python3
"""
Smithery MCP Server Scraper
===========================

Scrapes the complete list of MCP servers from https://smithery.ai/
Uses browser automation to handle dynamic content loading.
"""

import asyncio
import json
import time
from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from playwright.async_api import async_playwright, Page, Browser


@dataclass
class MCPServer:
    """MCP Server information from Smithery"""

    name: str
    description: str
    category: str
    url: str
    author: Optional[str] = None
    github_url: Optional[str] = None
    usage_count: Optional[int] = None
    tags: Optional[List[str]] = None

    def to_dict(self) -> dict:
        return asdict(self)


class SmitheryScraper:
    """Scraper for Smithery.ai MCP servers"""

    def __init__(self, headless: bool = False):
        self.headless = headless
        self.base_url = "https://smithery.ai"
        self.servers: List[MCPServer] = []
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def setup(self):
        """Setup browser and page"""
        print("🌐 Setting up browser...")
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=self.headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-sandbox",
            ],
        )
        self.page = await self.browser.new_page()

        # Set realistic viewport and user agent
        await self.page.set_viewport_size({"width": 1920, "height": 1080})
        await self.page.set_extra_http_headers(
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
        )

    async def navigate_to_servers(self):
        """Navigate to the servers listing page"""
        print(f"📍 Navigating to {self.base_url}")

        # First go to the main page
        await self.page.goto(self.base_url, wait_until="networkidle")
        await asyncio.sleep(2)

        # Click on "View all" for one of the categories or find servers link
        print("🔍 Looking for servers listing...")

        # Try clicking "View all" link
        try:
            view_all_link = await self.page.wait_for_selector(
                'a:has-text("View all")', timeout=5000
            )
            if view_all_link:
                print("✅ Found 'View all' link, clicking...")
                await view_all_link.click()
                await self.page.wait_for_load_state("networkidle")
        except:
            print("⚠️  No 'View all' link found")

        # Check current URL
        current_url = self.page.url
        print(f"📍 Current URL: {current_url}")

        # If not on servers page, try direct navigation
        if "/servers" not in current_url and "/server" not in current_url:
            print(f"📍 Navigating directly to {self.base_url}/servers")
            await self.page.goto(f"{self.base_url}/servers", wait_until="networkidle")

        await asyncio.sleep(3)  # Give page time to load
        print("✅ Navigation complete")

    async def extract_from_homepage(self):
        """Extract servers from the homepage categories"""
        print("🏠 Extracting from homepage...")

        # Extract all visible servers from homepage
        servers_data = await self.page.evaluate("""
            () => {
                const servers = [];
                
                // Look for any links that point to /server/
                const serverLinks = document.querySelectorAll('a[href*="/server/"]');
                
                serverLinks.forEach(link => {
                    try {
                        const href = link.getAttribute('href');
                        if (!href || href === '/servers') return;
                        
                        // Get the card/container element
                        const card = link.closest('div[class*="rounded"], article, .group');
                        if (!card) return;
                        
                        // Extract name - try multiple selectors
                        let name = '';
                        const nameSelectors = ['h3', 'h4', '.font-semibold', '.text-lg', '.font-medium'];
                        for (const selector of nameSelectors) {
                            const nameEl = card.querySelector(selector);
                            if (nameEl && nameEl.textContent) {
                                name = nameEl.textContent.trim();
                                break;
                            }
                        }
                        
                        // Extract description
                        let description = '';
                        const descSelectors = ['p', '.text-sm', '.text-gray-600', '.text-muted-foreground'];
                        for (const selector of descSelectors) {
                            const descEl = card.querySelector(selector);
                            if (descEl && descEl.textContent && !descEl.textContent.includes('View all')) {
                                description = descEl.textContent.trim();
                                break;
                            }
                        }
                        
                        // Extract usage count
                        let usageCount = null;
                        const textElements = card.querySelectorAll('*');
                        for (const el of textElements) {
                            const text = el.textContent || '';
                            const match = text.match(/(\\d+)\\s*(uses?|calls?|invocations?)/i);
                            if (match) {
                                usageCount = parseInt(match[1]);
                                break;
                            }
                        }
                        
                        // Get category from section heading
                        let category = 'General';
                        const section = card.closest('section, div[class*="space-y"]');
                        if (section) {
                            const heading = section.querySelector('h2, h3');
                            if (heading) {
                                category = heading.textContent.trim()
                                    .replace('View all →', '')
                                    .replace(/\\d+$/, '')
                                    .trim();
                            }
                        }
                        
                        const url = href.startsWith('http') ? href : 'https://smithery.ai' + href;
                        
                        if (name) {
                            servers.push({
                                name: name,
                                description: description || 'No description available',
                                url: url,
                                usageCount: usageCount,
                                category: category
                            });
                        }
                    } catch (err) {
                        console.error('Error extracting server:', err);
                    }
                });
                
                return servers;
            }
        """)

        print(f"✅ Extracted {len(servers_data)} servers from homepage")

        # Convert to MCPServer objects
        for data in servers_data:
            server = MCPServer(
                name=data["name"],
                description=data["description"],
                category=data["category"],
                url=data["url"],
                usage_count=data.get("usageCount"),
            )
            self.servers.append(server)

    async def extract_all_categories(self):
        """Navigate through all category pages"""
        print("📂 Extracting all categories...")

        # Get all "View all" links
        view_all_links = await self.page.evaluate("""
            () => {
                const results = [];
                const links = document.querySelectorAll('a');
                links.forEach(link => {
                    if (link.textContent && link.textContent.includes('View all')) {
                        const href = link.getAttribute('href');
                        if (href && href !== '#') {
                            results.push({
                                href: href.startsWith('http') ? href : 'https://smithery.ai' + href,
                                category: link.closest('section')?.querySelector('h2')?.textContent?.trim() || 'Unknown'
                            });
                        }
                    }
                });
                return results;
            }
        """)

        print(f"📊 Found {len(view_all_links)} category links")

        # Visit each category page
        for link_info in view_all_links:
            try:
                print(f"📂 Visiting category: {link_info['category']}")
                await self.page.goto(link_info["href"], wait_until="networkidle")
                await asyncio.sleep(2)

                # Extract servers from this category page
                await self.extract_servers_from_current_page(link_info["category"])

            except Exception as e:
                print(f"⚠️  Error visiting {link_info['category']}: {e}")

    async def extract_servers_from_current_page(self, category: str = "General"):
        """Extract servers from the current page"""
        print(f"🔍 Extracting servers from current page (category: {category})...")

        # Scroll to load all content
        await self.scroll_to_load_all()

        # Extract server data
        servers_data = await self.page.evaluate("""
            () => {
                const servers = [];
                
                // Try multiple selector strategies
                const selectors = [
                    'a[href*="/server/"]:not([href="/servers"])',
                    'div[class*="grid"] > div > a',
                    'main a[href*="/server/"]'
                ];
                
                const processedUrls = new Set();
                
                for (const selector of selectors) {
                    document.querySelectorAll(selector).forEach(element => {
                        try {
                            const href = element.getAttribute('href');
                            if (!href || href === '/servers' || processedUrls.has(href)) return;
                            
                            processedUrls.add(href);
                            
                            // Find the container with server info
                            const container = element.querySelector('div') || element;
                            
                            // Extract name
                            const nameEl = container.querySelector('h3, h4, .font-semibold, .font-medium, .text-lg');
                            const name = nameEl ? nameEl.textContent.trim() : '';
                            
                            // Extract description
                            const descEl = container.querySelector('p, .text-sm, .text-muted-foreground');
                            const description = descEl ? descEl.textContent.trim() : '';
                            
                            // Extract usage
                            let usageCount = null;
                            const usageEl = container.querySelector('.text-xs, .text-sm');
                            if (usageEl) {
                                const match = usageEl.textContent.match(/(\\d+)/);
                                if (match) usageCount = parseInt(match[1]);
                            }
                            
                            const url = href.startsWith('http') ? href : 'https://smithery.ai' + href;
                            
                            if (name) {
                                servers.push({
                                    name: name,
                                    description: description || 'No description available',
                                    url: url,
                                    usageCount: usageCount
                                });
                            }
                        } catch (err) {
                            console.error('Error processing element:', err);
                        }
                    });
                }
                
                return servers;
            }
        """)

        print(f"✅ Found {len(servers_data)} servers on this page")

        # Add to our collection
        for data in servers_data:
            # Check if we already have this server
            existing = any(s.url == data["url"] for s in self.servers)
            if not existing:
                server = MCPServer(
                    name=data["name"],
                    description=data["description"],
                    category=category,
                    url=data["url"],
                    usage_count=data.get("usageCount"),
                )
                self.servers.append(server)

    async def scroll_to_load_all(self):
        """Scroll to load all servers (handle infinite scroll)"""
        print("📜 Scrolling to load all content...")

        previous_height = 0
        scroll_attempts = 0
        max_attempts = 10

        while scroll_attempts < max_attempts:
            # Get current page height
            current_height = await self.page.evaluate("document.body.scrollHeight")

            # If height hasn't changed, we're done
            if current_height == previous_height:
                break

            previous_height = current_height

            # Scroll to bottom
            await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

            # Wait for potential new content
            await asyncio.sleep(1)
            scroll_attempts += 1

        print(f"✅ Scrolling complete (attempts: {scroll_attempts})")

    async def run(self, enrich_details: bool = False):
        """Run the complete scraping process"""
        start_time = time.time()

        try:
            await self.setup()

            # First extract from homepage
            await self.page.goto(self.base_url, wait_until="networkidle")
            await self.extract_from_homepage()

            # Then try to get more from category pages
            await self.extract_all_categories()

            # Remove duplicates
            unique_servers = {}
            for server in self.servers:
                unique_servers[server.url] = server
            self.servers = list(unique_servers.values())

            elapsed_time = time.time() - start_time
            print(f"⏱️  Scraping completed in {elapsed_time:.2f} seconds")
            print(f"📊 Total unique servers found: {len(self.servers)}")

        except Exception as e:
            print(f"❌ Error during scraping: {e}")
            raise
        finally:
            await self.cleanup()

    async def cleanup(self):
        """Cleanup browser resources"""
        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        print("🧹 Cleanup completed")

    def save_results(self, output_file: str = "smithery_servers.json"):
        """Save results to JSON file"""
        output_path = Path(output_file)

        # Organize by category
        by_category = {}
        for server in self.servers:
            category = server.category
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(server.to_dict())

        result = {
            "metadata": {
                "source": "https://smithery.ai",
                "scraped_at": datetime.now().isoformat(),
                "total_servers": len(self.servers),
                "categories": list(by_category.keys()),
            },
            "servers_by_category": by_category,
            "all_servers": [s.to_dict() for s in self.servers],
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        print(f"💾 Results saved to {output_path}")
        print(f"📊 Total servers: {len(self.servers)}")
        print(f"📂 Categories: {len(by_category)}")

        # Print category summary
        for category, servers in sorted(by_category.items()):
            print(f"   - {category}: {len(servers)} servers")


async def main():
    """Main execution"""
    print("🚀 Smithery MCP Server Scraper")
    print("==============================")

    scraper = SmitheryScraper(headless=True)

    try:
        # Run scraping
        await scraper.run(enrich_details=False)

        # Save results
        scraper.save_results("docs/smithery/smithery_servers.json")

        # Also save a simple text list
        with open("docs/smithery/smithery_servers_list.txt", "w") as f:
            f.write(f"# Smithery MCP Servers List\n")
            f.write(f"# Generated: {datetime.now().isoformat()}\n")
            f.write(f"# Total: {len(scraper.servers)} servers\n\n")

            # Sort by category and name
            sorted_servers = sorted(scraper.servers, key=lambda s: (s.category, s.name))
            current_category = None

            for server in sorted_servers:
                if server.category != current_category:
                    current_category = server.category
                    f.write(f"\n## {current_category}\n\n")

                f.write(f"{server.name}\n")
                f.write(f"  Description: {server.description}\n")
                f.write(f"  URL: {server.url}\n")
                if server.usage_count:
                    f.write(f"  Usage: {server.usage_count:,}\n")
                f.write("\n")

        print("\n🎉 Scraping completed successfully!")

    except Exception as e:
        print(f"\n💥 Scraping failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
