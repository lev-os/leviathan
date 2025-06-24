"""Data models for the CrewAI Firecrawl scraper."""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class ScrapeRequest(BaseModel):
    """Request model for scraping tasks."""
    url: HttpUrl = Field(..., description="URL to scrape")
    priority: int = Field(default=1, description="Task priority (1-5)")
    extract_links: bool = Field(default=False, description="Whether to extract all links")
    include_markdown: bool = Field(default=True, description="Include markdown content")
    include_html: bool = Field(default=False, description="Include raw HTML")
    wait_for: Optional[int] = Field(default=None, description="Wait time in seconds")
    
class ScrapedContent(BaseModel):
    """Model for scraped content data."""
    url: str = Field(..., description="Source URL")
    title: Optional[str] = Field(None, description="Page title")
    content: str = Field(..., description="Main content")
    markdown: Optional[str] = Field(None, description="Markdown version")
    html: Optional[str] = Field(None, description="Raw HTML")
    links: List[str] = Field(default_factory=list, description="Extracted links")
    images: List[str] = Field(default_factory=list, description="Image URLs")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
class ScrapeResult(BaseModel):
    """Complete scrape result with metadata."""
    request: ScrapeRequest = Field(..., description="Original request")
    content: Optional[ScrapedContent] = Field(None, description="Scraped content")
    success: bool = Field(..., description="Whether scraping succeeded")
    error: Optional[str] = Field(None, description="Error message if failed")
    scraped_at: datetime = Field(default_factory=datetime.now, description="Timestamp")
    duration_seconds: float = Field(..., description="Scraping duration")
    
class ScrapingTask(BaseModel):
    """Task model for agent delegation."""
    id: str = Field(..., description="Unique task ID")
    request: ScrapeRequest = Field(..., description="Scraping request")
    assigned_to: str = Field(..., description="Agent assigned to task")
    status: str = Field(default="pending", description="Task status")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation time")
    
class ScrapingReport(BaseModel):
    """CEO agent's final report."""
    total_tasks: int = Field(..., description="Total number of tasks")
    successful: int = Field(..., description="Successfully completed tasks")
    failed: int = Field(..., description="Failed tasks")
    results: List[ScrapeResult] = Field(..., description="All scraping results")
    summary: str = Field(..., description="Executive summary")
    generated_at: datetime = Field(default_factory=datetime.now, description="Report timestamp")
    
class AgentConfig(BaseModel):
    """Configuration for agents."""
    role: str = Field(..., description="Agent role")
    goal: str = Field(..., description="Agent goal")
    backstory: str = Field(..., description="Agent backstory")
    verbose: bool = Field(default=True, description="Verbose output")
    allow_delegation: bool = Field(default=False, description="Can delegate to other agents")
    max_iter: int = Field(default=25, description="Maximum iterations")
    max_execution_time: Optional[int] = Field(None, description="Max execution time in seconds")