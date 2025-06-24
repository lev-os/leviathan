"""Example of custom scraping configuration with CrewAI Firecrawl scraper."""

import os
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from models import ScrapeRequest
from crew import FirecrawlScrapingCrew

def main():
    """Example of custom scraping with specific parameters."""
    
    load_dotenv()
    
    # Custom scraping requests
    scrape_requests = [
        # High priority: News site with link extraction
        ScrapeRequest(
            url="https://techcrunch.com/category/startups/",
            priority=5,
            extract_links=True,
            include_markdown=True,
            include_html=False,
            wait_for=3  # Wait 3 seconds for dynamic content
        ),
        
        # Medium priority: Documentation site
        ScrapeRequest(
            url="https://docs.crewai.com/",
            priority=3,
            extract_links=True,
            include_markdown=True,
            include_html=False
        ),
        
        # Low priority: Blog post
        ScrapeRequest(
            url="https://blog.firecrawl.dev/",
            priority=2,
            extract_links=False,
            include_markdown=True,
            include_html=False
        ),
        
        # API documentation
        ScrapeRequest(
            url="https://docs.firecrawl.dev/",
            priority=4,
            extract_links=True,
            include_markdown=True,
            include_html=False
        )
    ]
    
    print("🔥 Custom CrewAI Firecrawl Scraping Example")
    print("=" * 50)
    
    # Initialize crew with verbose output
    crew = FirecrawlScrapingCrew(verbose=True)
    
    # Execute scraping
    report = crew.scrape_urls(scrape_requests)
    
    # Save report with custom filename
    filename = crew.save_report(report, "custom_scraping_report.json")
    
    print(f"\n🎯 Custom scraping completed!")
    print(f"📊 Results: {report.successful}/{report.total_tasks} successful")
    print(f"📄 Report: {filename}")

if __name__ == "__main__":
    main()