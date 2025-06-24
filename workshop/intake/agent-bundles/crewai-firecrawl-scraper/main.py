"""Main entry point for the CrewAI Firecrawl scraper."""

import os
import sys
from dotenv import load_dotenv
from typing import List

from models import ScrapeRequest
from crew import FirecrawlScrapingCrew

def main():
    """Main function to run the CrewAI Firecrawl scraper."""
    
    # Load environment variables
    load_dotenv()
    
    # Check required environment variables
    required_vars = ['FIRECRAWL_API_KEY', 'OPENAI_API_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env file or environment.")
        print("See .env.template for reference.")
        sys.exit(1)
    
    print("🚀 CrewAI Firecrawl Scraper")
    print("=" * 50)
    print("🤖 Agents: CEO (Strategic) + Crawler (Execution)")
    print("🔥 Powered by Firecrawl API")
    print("=" * 50)
    
    # Example scraping requests (you can modify these)
    scrape_requests = [
        ScrapeRequest(
            url="https://news.ycombinator.com",
            priority=5,
            extract_links=True,
            include_markdown=True,
            include_html=False
        ),
        ScrapeRequest(
            url="https://github.com/trending",
            priority=4,
            extract_links=True,
            include_markdown=True,
            include_html=False
        ),
        ScrapeRequest(
            url="https://techcrunch.com",
            priority=3,
            extract_links=False,
            include_markdown=True,
            include_html=False
        ),
    ]
    
    print(f"📋 Configured {len(scrape_requests)} scraping tasks:")
    for i, req in enumerate(scrape_requests, 1):
        print(f"   {i}. {req.url} (priority: {req.priority})")
    print()
    
    try:
        # Initialize the crew
        crew = FirecrawlScrapingCrew(verbose=True)
        
        # Execute scraping operation
        report = crew.scrape_urls(scrape_requests)
        
        # Display results summary
        print("\n🎯 FINAL RESULTS SUMMARY")
        print("=" * 50)
        print(f"📊 Total URLs: {report.total_tasks}")
        print(f"✅ Successful: {report.successful}")
        print(f"❌ Failed: {report.failed}")
        print(f"📈 Success Rate: {(report.successful/report.total_tasks)*100:.1f}%")
        print()
        
        print("📝 CEO EXECUTIVE SUMMARY:")
        print("-" * 30)
        print(report.summary)
        print()
        
        # Save detailed report
        filename = crew.save_report(report)
        print(f"📄 Detailed report saved to: {filename}")
        
        # Display individual results
        print("\n📋 INDIVIDUAL RESULTS:")
        print("-" * 30)
        for i, result in enumerate(report.results, 1):
            status = "✅ SUCCESS" if result.success else "❌ FAILED"
            print(f"{i}. {result.request.url}")
            print(f"   Status: {status}")
            print(f"   Duration: {result.duration_seconds:.2f}s")
            if result.error:
                print(f"   Error: {result.error}")
            elif result.content:
                content_preview = result.content.content[:100] + "..." if len(result.content.content) > 100 else result.content.content
                print(f"   Content: {content_preview}")
            print()
        
        print("🎉 Scraping operation completed successfully!")
        
    except KeyboardInterrupt:
        print("\n⚠️  Operation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Critical error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()