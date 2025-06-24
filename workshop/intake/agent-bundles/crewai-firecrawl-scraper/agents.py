"""CrewAI agents for the Firecrawl scraper system."""

from crewai import Agent
from tools.firecrawl_tool import firecrawl_tool
from models import AgentConfig

# Agent configurations
CEO_CONFIG = AgentConfig(
    role="Chief Executive Officer",
    goal="Oversee web scraping operations and ensure high-quality data collection for strategic insights",
    backstory=(
        "You are an experienced CEO with a deep understanding of data-driven decision making. "
        "Your expertise lies in identifying valuable information sources, prioritizing scraping tasks, "
        "and ensuring the quality and relevance of collected data. You excel at strategic thinking "
        "and can break down complex data collection requirements into actionable tasks for your team."
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

def create_ceo_agent() -> Agent:
    """Create the CEO agent for strategic oversight."""
    return Agent(
        role=CEO_CONFIG.role,
        goal=CEO_CONFIG.goal,
        backstory=CEO_CONFIG.backstory,
        verbose=CEO_CONFIG.verbose,
        allow_delegation=CEO_CONFIG.allow_delegation,
        max_iter=CEO_CONFIG.max_iter,
        tools=[],  # CEO doesn't need direct tools, delegates to crawler
        llm=None,  # Will use default LLM
    )

def create_crawler_agent() -> Agent:
    """Create the crawler agent for execution."""
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