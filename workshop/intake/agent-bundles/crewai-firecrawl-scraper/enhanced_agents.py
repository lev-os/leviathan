"""Enhanced agent configurations with the new Analyzer agent."""

from crewai import Agent
from tools.firecrawl_tool import firecrawl_tool
from tools.analysis_tool import content_analysis_tool
from models import AgentConfig

# Enhanced agent configurations
CEO_CONFIG = AgentConfig(
    role="Chief Executive Officer",
    goal="Oversee web scraping operations and ensure high-quality data collection for strategic insights",
    backstory=(
        "You are an experienced CEO with a deep understanding of data-driven decision making. "
        "Your expertise lies in identifying valuable information sources, prioritizing scraping tasks, "
        "and ensuring the quality and relevance of collected data. You excel at strategic thinking "
        "and can break down complex data collection requirements into actionable tasks for your team. "
        "You can delegate to multiple specialists and coordinate their efforts effectively."
    ),
    verbose=True,
    allow_delegation=True,
    max_iter=15
)

CRAWLER_CONFIG = AgentConfig(
    role="Web Scraping Specialist", 
    goal="Execute web scraping tasks efficiently using Firecrawl API and deliver structured, high-quality data",
    backstory=(
        "You are a cutting-edge web scraping specialist with expertise in modern scraping technologies. "
        "Your strength is in using the Firecrawl API to extract clean, structured data from any website. "
        "You understand web technologies, can handle different content types, and always deliver "
        "well-formatted results. You're meticulous about data quality and extraction accuracy."
    ),
    verbose=True,
    allow_delegation=False,
    max_iter=25
)

ANALYZER_CONFIG = AgentConfig(
    role="Content Analyst",
    goal="Analyze scraped content for insights, sentiment, themes, and actionable intelligence",
    backstory=(
        "You are an expert content analyst with advanced skills in natural language processing, "
        "sentiment analysis, and information extraction. You excel at identifying key themes, "
        "entities, and insights from web content. Your analysis helps transform raw data into "
        "actionable intelligence. You can assess content quality, extract meaningful patterns, "
        "and provide strategic recommendations based on content analysis."
    ),
    verbose=True,
    allow_delegation=False,
    max_iter=20
)

def create_ceo_agent() -> Agent:
    """Create the CEO agent for strategic oversight."""
    return Agent(
        role=CEO_CONFIG.role,
        goal=CEO_CONFIG.goal,
        backstory=CEO_CONFIG.backstory,
        verbose=CEO_CONFIG.verbose,
        allow_delegation=CEO_CONFIG.allow_delegation,
        max_iter=CEO_CONFIG.max_iter,
        tools=[],  # CEO doesn't need direct tools, delegates to specialists
        llm=None,  # Will use default LLM
    )

def create_crawler_agent() -> Agent:
    """Create the crawler agent for web scraping execution."""
    return Agent(
        role=CRAWLER_CONFIG.role,
        goal=CRAWLER_CONFIG.goal,
        backstory=CRAWLER_CONFIG.backstory,
        verbose=CRAWLER_CONFIG.verbose,
        allow_delegation=CRAWLER_CONFIG.allow_delegation,
        max_iter=CRAWLER_CONFIG.max_iter,
        tools=[firecrawl_tool],  # Equipped with Firecrawl tool
        llm=None,  # Will use default LLM
    )

def create_analyzer_agent() -> Agent:
    """Create the analyzer agent for content analysis."""
    return Agent(
        role=ANALYZER_CONFIG.role,
        goal=ANALYZER_CONFIG.goal,
        backstory=ANALYZER_CONFIG.backstory,
        verbose=ANALYZER_CONFIG.verbose,
        allow_delegation=ANALYZER_CONFIG.allow_delegation,
        max_iter=ANALYZER_CONFIG.max_iter,
        tools=[content_analysis_tool],  # Equipped with content analysis tool
        llm=None,  # Will use default LLM
    )

# Agent registry for easy access
AGENT_REGISTRY = {
    "ceo": create_ceo_agent,
    "crawler": create_crawler_agent,
    "analyzer": create_analyzer_agent
}

def create_agent_by_name(agent_name: str) -> Agent:
    """Create an agent by name using the registry."""
    if agent_name not in AGENT_REGISTRY:
        raise ValueError(f"Unknown agent type: {agent_name}. Available: {list(AGENT_REGISTRY.keys())}")
    
    return AGENT_REGISTRY[agent_name]()

def list_available_agents() -> list:
    """Get list of available agent types."""
    return list(AGENT_REGISTRY.keys())