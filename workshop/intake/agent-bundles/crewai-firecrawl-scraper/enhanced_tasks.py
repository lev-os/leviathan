"""Enhanced task definitions with content analysis tasks."""

from crewai import Task
from typing import List, Dict, Any
from models import ScrapeRequest

def create_enhanced_planning_task(agent, scrape_requests: List[ScrapeRequest]) -> Task:
    """Create an enhanced planning task for the CEO agent."""
    
    urls_list = "\n".join([f"- {req.url} (priority: {req.priority})" for req in scrape_requests])
    
    return Task(
        description=f"""
        As the CEO, analyze the following web scraping requirements and create a comprehensive strategic plan:

        URLs to scrape:
        {urls_list}

        Your enhanced responsibilities:
        1. Prioritize the URLs based on their importance and priority levels
        2. Identify the type of content each URL likely contains
        3. Determine the best scraping approach for each URL
        4. Plan the delegation strategy for both crawler and analyzer agents
        5. Set quality standards and success criteria for scraping AND analysis
        6. Define what insights we should extract from each type of content
        7. Establish the workflow: scraping → analysis → reporting

        Provide a detailed strategic plan that includes:
        - Priority order for scraping
        - Expected content types and analysis requirements
        - Quality requirements for both scraping and analysis
        - Success metrics for the entire operation
        - Coordination between crawler and analyzer agents
        
        Be thorough and strategic in your enhanced planning.
        """,
        agent=agent,
        expected_output="A comprehensive strategic plan for web scraping and content analysis operations including prioritization, delegation strategy, and quality standards."
    )

def create_scraping_task(agent, scrape_request: ScrapeRequest) -> Task:
    """Create a scraping task for the crawler agent (unchanged)."""
    
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
        6. Prepare content for subsequent analysis

        Tool Parameters to use:
        - url: {scrape_request.url}
        - include_links: {scrape_request.extract_links}
        - include_markdown: {scrape_request.include_markdown}
        - include_html: {scrape_request.include_html}
        - wait_for: {scrape_request.wait_for}

        Return the complete scraped data including content, metadata, and any extracted links or images.
        This data will be passed to the analyzer agent for content analysis.
        """,
        agent=agent,
        expected_output="Complete scraped data in structured format including content, metadata, links, ready for content analysis."
    )

def create_analysis_task(agent, scraped_content: str, url: str, analysis_requirements: Dict[str, Any] = None) -> Task:
    """Create a content analysis task for the analyzer agent."""
    
    requirements = analysis_requirements or {}
    analysis_type = requirements.get('type', 'full')
    focus_areas = requirements.get('focus_areas', ['sentiment', 'themes', 'entities', 'quality'])
    
    focus_description = "\n".join([f"- {area.title()} analysis" for area in focus_areas])
    
    return Task(
        description=f"""
        Analyze the following scraped content from {url} using the content_analyzer tool:
        
        URL: {url}
        Content length: {len(scraped_content)} characters
        Analysis type: {analysis_type}
        
        Content preview: {scraped_content[:500]}...
        
        Your analysis tasks:
        {focus_description}
        
        Specific requirements:
        1. Use the content_analyzer tool with these parameters:
           - content: the full scraped content
           - url: {url}
           - analysis_type: {analysis_type}
        
        2. Provide comprehensive analysis including:
           - Sentiment analysis (positive, negative, neutral with confidence)
           - Key entity extraction (organizations, people, technologies)
           - Theme identification (main topics and subjects)
           - Content quality assessment (readability, structure, completeness)
           - Actionable insights and recommendations
        
        3. Generate strategic insights:
           - What makes this content valuable?
           - What are the key takeaways?
           - How can this information be used strategically?
           - What patterns or trends are evident?
        
        4. Assess content for:
           - Relevance to business objectives
           - Information density and value
           - Potential for further action
        
        Use the content_analyzer tool to perform deep analysis and return structured insights.
        """,
        agent=agent,
        expected_output="Comprehensive content analysis with sentiment, entities, themes, quality metrics, and strategic insights formatted for executive review."
    )

def create_enhanced_review_task(agent, total_urls: int, has_analysis: bool = True) -> Task:
    """Create an enhanced review task for the CEO agent."""
    
    analysis_section = """
        4. Review and synthesize content analysis results
        5. Extract strategic insights from the analyzed data
        6. Identify trends and patterns across all analyzed content
        7. Provide recommendations based on content analysis insights
    """ if has_analysis else ""
    
    return Task(
        description=f"""
        As the CEO, review all scraping and analysis results and create a comprehensive executive report.

        Operation Summary:
        - Total URLs processed: {total_urls}
        - Analysis included: {'Yes' if has_analysis else 'No'}
        
        Your comprehensive review tasks:
        1. Analyze the quality and completeness of all scraped data
        2. Assess the effectiveness of the scraping operation
        3. Identify any issues or gaps in the data collection
        {analysis_section}
        8. Evaluate whether all objectives were met
        9. Provide strategic recommendations for future operations
        10. Create an executive summary suitable for stakeholder presentation

        Your final executive report should include:
        
        **EXECUTIVE SUMMARY**
        - High-level overview of the operation
        - Key success metrics and achievements
        - Critical insights and findings
        
        **OPERATIONAL RESULTS**
        - Success/failure rates and detailed statistics
        - Quality assessment of collected data
        - Technical performance metrics
        
        **CONTENT INSIGHTS** (if analysis was performed)
        - Key themes and trends identified across all content
        - Sentiment analysis summary
        - Important entities and topics discovered
        - Strategic implications of the findings
        
        **STRATEGIC RECOMMENDATIONS**
        - Recommendations for future scraping operations
        - Content strategy insights
        - Operational improvements
        - Business opportunities identified
        
        **ISSUES AND RESOLUTIONS**
        - Any challenges encountered and how they were resolved
        - Lessons learned and process improvements
        
        Be thorough, strategic, and executive-focused in your analysis.
        """,
        agent=agent,
        expected_output="A comprehensive executive report including operational metrics, content insights, strategic analysis, and recommendations suitable for C-level presentation."
    )

def create_coordination_task(agent, operation_phase: str, context: Dict[str, Any]) -> Task:
    """Create a coordination task for managing multi-agent workflows."""
    
    return Task(
        description=f"""
        As the CEO, coordinate the {operation_phase} phase of the multi-agent operation.
        
        Current context: {context}
        
        Your coordination responsibilities:
        1. Ensure all agents are working efficiently toward common goals
        2. Monitor progress and quality of work
        3. Resolve any conflicts or issues between agents
        4. Optimize workflow and resource allocation
        5. Maintain communication and alignment across the team
        6. Make strategic decisions about process adjustments
        
        Phase-specific tasks for {operation_phase}:
        - Review current progress
        - Identify any bottlenecks or issues
        - Coordinate handoffs between agents
        - Ensure quality standards are maintained
        - Optimize remaining work allocation
        
        Provide clear direction and coordination to ensure successful completion.
        """,
        agent=agent,
        expected_output=f"Clear coordination directives and progress assessment for the {operation_phase} phase."
    )

# Task templates for different content types
CONTENT_TYPE_TASKS = {
    "news": {
        "analysis_focus": ["sentiment", "entities", "themes", "timeliness"],
        "insights_focus": ["breaking news", "trend analysis", "public sentiment"]
    },
    "documentation": {
        "analysis_focus": ["quality", "completeness", "structure"],
        "insights_focus": ["technical accuracy", "user experience", "information gaps"]
    },
    "blog": {
        "analysis_focus": ["sentiment", "themes", "engagement"],
        "insights_focus": ["audience engagement", "content strategy", "viral potential"]
    },
    "corporate": {
        "analysis_focus": ["entities", "themes", "sentiment"],
        "insights_focus": ["business intelligence", "competitive analysis", "market trends"]
    }
}

def create_content_type_specific_task(agent, content_type: str, scraped_content: str, url: str) -> Task:
    """Create analysis task optimized for specific content types."""
    
    template = CONTENT_TYPE_TASKS.get(content_type, CONTENT_TYPE_TASKS["corporate"])
    
    return create_analysis_task(
        agent=agent,
        scraped_content=scraped_content,
        url=url,
        analysis_requirements={
            "type": "focused",
            "focus_areas": template["analysis_focus"],
            "insights_focus": template["insights_focus"]
        }
    )