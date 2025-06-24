"""CrewAI crew configuration for the Firecrawl scraper system."""

from crewai import Crew, Process
from typing import List, Dict, Any
import json
import time
from datetime import datetime

from agents import create_ceo_agent, create_crawler_agent
from tasks import create_planning_task, create_scraping_task, create_review_task
from models import ScrapeRequest, ScrapeResult, ScrapingReport, ScrapedContent

class FirecrawlScrapingCrew:
    """Main crew class for coordinating CEO and Crawler agents."""
    
    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self.ceo_agent = create_ceo_agent()
        self.crawler_agent = create_crawler_agent()
        
        # Storage for results
        self.scrape_results: List[ScrapeResult] = []
        self.start_time = None
        
    def scrape_urls(self, scrape_requests: List[ScrapeRequest]) -> ScrapingReport:
        """
        Execute the complete scraping workflow with CEO oversight and crawler execution.
        
        Args:
            scrape_requests: List of URLs and parameters to scrape
            
        Returns:
            ScrapingReport: Comprehensive report of all scraping operations
        """
        self.start_time = time.time()
        self.scrape_results = []
        
        print(f"🚀 Starting CrewAI Firecrawl scraping operation with {len(scrape_requests)} URLs")
        print("=" * 60)
        
        try:
            # Phase 1: CEO Planning
            print("📋 Phase 1: Strategic Planning (CEO Agent)")
            print("-" * 40)
            
            planning_task = create_planning_task(self.ceo_agent, scrape_requests)
            planning_crew = Crew(
                agents=[self.ceo_agent],
                tasks=[planning_task],
                process=Process.sequential,
                verbose=self.verbose
            )
            
            planning_result = planning_crew.kickoff()
            print(f"✅ Strategic plan completed")
            print(f"📝 Plan: {planning_result}")
            print()
            
            # Phase 2: Execution (Crawler Agent)
            print("🕷️ Phase 2: Web Scraping Execution (Crawler Agent)")
            print("-" * 40)
            
            # Sort requests by priority (higher priority first)
            sorted_requests = sorted(scrape_requests, key=lambda x: x.priority, reverse=True)
            
            for i, request in enumerate(sorted_requests, 1):
                print(f"\n🔄 Scraping {i}/{len(sorted_requests)}: {request.url}")
                
                scrape_start = time.time()
                
                try:
                    # Create individual scraping task
                    scraping_task = create_scraping_task(self.crawler_agent, request)
                    
                    scraping_crew = Crew(
                        agents=[self.crawler_agent],
                        tasks=[scraping_task],
                        process=Process.sequential,
                        verbose=self.verbose
                    )
                    
                    # Execute scraping
                    scraping_result = scraping_crew.kickoff()
                    duration = time.time() - scrape_start
                    
                    # Parse the result (CrewAI returns string output)
                    success = "success" in str(scraping_result).lower() and "error" not in str(scraping_result).lower()
                    
                    if success:
                        # Create scraped content (simplified for demo)
                        content = ScrapedContent(
                            url=str(request.url),
                            title=f"Content from {request.url}",
                            content=str(scraping_result)[:1000] + "..." if len(str(scraping_result)) > 1000 else str(scraping_result),
                            markdown=str(scraping_result) if request.include_markdown else None,
                            links=[],
                            images=[],
                            metadata={"scraped_by": "crewai_crawler"}
                        )
                        
                        result = ScrapeResult(
                            request=request,
                            content=content,
                            success=True,
                            error=None,
                            duration_seconds=duration
                        )
                        print(f"✅ Successfully scraped {request.url}")
                    else:
                        result = ScrapeResult(
                            request=request,
                            content=None,
                            success=False,
                            error="Scraping failed or returned error",
                            duration_seconds=duration
                        )
                        print(f"❌ Failed to scrape {request.url}")
                    
                    self.scrape_results.append(result)
                    
                except Exception as e:
                    duration = time.time() - scrape_start
                    result = ScrapeResult(
                        request=request,
                        content=None,
                        success=False,
                        error=str(e),
                        duration_seconds=duration
                    )
                    self.scrape_results.append(result)
                    print(f"❌ Error scraping {request.url}: {e}")
            
            # Phase 3: CEO Review and Reporting
            print("\n📊 Phase 3: Results Review and Reporting (CEO Agent)")
            print("-" * 40)
            
            review_task = create_review_task(self.ceo_agent, len(scrape_requests))
            review_crew = Crew(
                agents=[self.ceo_agent],
                tasks=[review_task],
                process=Process.sequential,
                verbose=self.verbose
            )
            
            review_result = review_crew.kickoff()
            
            # Generate final report
            successful_count = sum(1 for r in self.scrape_results if r.success)
            failed_count = len(self.scrape_results) - successful_count
            
            report = ScrapingReport(
                total_tasks=len(scrape_requests),
                successful=successful_count,
                failed=failed_count,
                results=self.scrape_results,
                summary=str(review_result)
            )
            
            total_duration = time.time() - self.start_time
            
            print(f"🎯 Scraping operation completed in {total_duration:.2f} seconds")
            print(f"📈 Success rate: {successful_count}/{len(scrape_requests)} ({successful_count/len(scrape_requests)*100:.1f}%)")
            print("=" * 60)
            
            return report
            
        except Exception as e:
            print(f"❌ Critical error in scraping operation: {e}")
            # Return partial report even if there's an error
            return ScrapingReport(
                total_tasks=len(scrape_requests),
                successful=sum(1 for r in self.scrape_results if r.success),
                failed=len(self.scrape_results) - sum(1 for r in self.scrape_results if r.success),
                results=self.scrape_results,
                summary=f"Operation failed with error: {e}"
            )
    
    def save_report(self, report: ScrapingReport, filename: str = None) -> str:
        """Save the scraping report to a JSON file."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"scraping_report_{timestamp}.json"
        
        # Convert to dict for JSON serialization
        report_dict = report.dict()
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report_dict, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"💾 Report saved to {filename}")
        return filename