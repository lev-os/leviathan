"""CrewAI tasks for the Firecrawl scraper system."""

from crewai import Task
from typing import List
from models import ScrapeRequest

def create_planning_task(agent, scrape_requests: List[ScrapeRequest]) -> Task:
    """Create a planning task for the CEO agent."""
    
    urls_list = "\n".join([f"- {req.url} (priority: {req.priority})" for req in scrape_requests])
    
    return Task(
        description=f"""
        As the CEO, analyze the following web scraping requirements and create a strategic plan:

        URLs to scrape:
        {urls_list}

        Your responsibilities:
        1. Prioritize the URLs based on their importance and priority levels
        2. Identify the type of content each URL likely contains
        3. Determine the best scraping approach for each URL
        4. Plan the delegation strategy for the crawler agent
        5. Set quality standards and success criteria

        Provide a detailed strategic plan that includes:
        - Priority order for scraping
        - Expected content types and challenges
        - Quality requirements
        - Success metrics
        
        Be thorough and strategic in your planning.
        """,
        agent=agent,
        expected_output="A comprehensive strategic plan for web scraping operations including prioritization, approach, and quality standards."
    )

def create_scraping_task(agent, scrape_request: ScrapeRequest) -> Task:
    """Create a scraping task for the crawler agent."""
    
    return Task(
        description=f"""
        Execute web scraping for the following URL using the Firecrawl tool:

        URL: {scrape_request.url}
        Priority: {scrape_request.priority}
        Extract Links: {scrape_request.extract_links}
        Include Markdown: {scrape_request.include_markdown}
        Include HTML: {scrape_request.include_html}
        Wait Time: {scrape_request.wait_for or 'None'} seconds

        Your tasks:
        1. Use the firecrawl_scraper tool to scrape the specified URL
        2. Configure the tool with the specified parameters
        3. Extract clean, structured content
        4. Ensure data quality and completeness
        5. Handle any errors gracefully

        Tool Parameters to use:
        - url: {scrape_request.url}
        - include_links: {scrape_request.extract_links}
        - include_markdown: {scrape_request.include_markdown}
        - include_html: {scrape_request.include_html}
        - wait_for: {scrape_request.wait_for}

        Return the complete scraped data including content, metadata, and any extracted links or images.
        """,
        agent=agent,
        expected_output="Complete scraped data in structured format including content, metadata, links, and quality metrics."
    )

def create_review_task(agent, total_urls: int) -> Task:
    """Create a review task for the CEO agent."""
    
    return Task(
        description=f"""
        As the CEO, review all scraping results and create a comprehensive final report.

        You need to:
        1. Analyze the quality and completeness of all scraped data
        2. Identify any issues or gaps in the data collection
        3. Assess whether the scraping objectives were met
        4. Provide insights and recommendations based on the collected data
        5. Create an executive summary of the scraping operation

        Total URLs processed: {total_urls}

        Your final report should include:
        - Executive summary of the scraping operation
        - Success/failure rates and statistics
        - Quality assessment of collected data
        - Key insights from the scraped content
        - Recommendations for future scraping operations
        - Any issues encountered and how they were resolved

        Be thorough and strategic in your analysis.
        """,
        agent=agent,
        expected_output="A comprehensive executive report including success metrics, data quality assessment, insights, and strategic recommendations."
    )