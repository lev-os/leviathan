"""Firecrawl tool for CrewAI agents."""

import os
import time
from typing import Dict, Any, Optional
from firecrawl import FirecrawlApp
from crewai_tools import BaseTool
from pydantic import Field, BaseModel

class FirecrawlInput(BaseModel):
    """Input schema for Firecrawl tool."""
    url: str = Field(..., description="URL to scrape")
    include_links: bool = Field(default=False, description="Extract all links from the page")
    include_markdown: bool = Field(default=True, description="Include markdown formatted content")
    include_html: bool = Field(default=False, description="Include raw HTML content")
    wait_for: Optional[int] = Field(default=None, description="Wait time in seconds before scraping")

class FirecrawlTool(BaseTool):
    """
    Firecrawl scraping tool for extracting content from web pages.
    
    This tool uses the Firecrawl API to scrape web pages and extract:
    - Clean text content
    - Markdown formatted content
    - Links and images
    - Metadata
    """
    
    name: str = "firecrawl_scraper"
    description: str = (
        "Scrape web pages using Firecrawl API. "
        "Extracts clean content, markdown, links, and metadata from any URL. "
        "Use this tool when you need to gather data from websites."
    )
    args_schema: type[BaseModel] = FirecrawlInput
    
    def __init__(self):
        super().__init__()
        self.api_key = os.getenv('FIRECRAWL_API_KEY')
        if not self.api_key:
            raise ValueError("FIRECRAWL_API_KEY environment variable is required")
        
        self.app = FirecrawlApp(api_key=self.api_key)
    
    def _run(self, **kwargs) -> Dict[str, Any]:
        """Execute the Firecrawl scraping."""
        try:
            # Extract parameters
            url = kwargs.get('url')
            include_links = kwargs.get('include_links', False)
            include_markdown = kwargs.get('include_markdown', True)
            include_html = kwargs.get('include_html', False)
            wait_for = kwargs.get('wait_for')
            
            if not url:
                return {
                    "success": False,
                    "error": "URL is required",
                    "url": None,
                    "content": None
                }
            
            print(f"🔥 Scraping URL: {url}")
            start_time = time.time()
            
            # Prepare scraping parameters
            params = {
                "formats": ["markdown"] if include_markdown else ["text"],
                "onlyMainContent": True,
                "includeTags": ["title", "meta"],
                "excludeTags": ["script", "style"],
            }
            
            if include_html:
                params["formats"].append("html")
            
            if include_links:
                params["includeTags"].extend(["a", "img"])
            
            if wait_for:
                params["waitFor"] = wait_for * 1000  # Convert to milliseconds
            
            # Perform the scrape
            result = self.app.scrape_url(url, params)
            duration = time.time() - start_time
            
            if not result.get('success'):
                return {
                    "success": False,
                    "error": result.get('error', 'Unknown scraping error'),
                    "url": url,
                    "content": None,
                    "duration_seconds": duration
                }
            
            # Extract content
            data = result.get('data', {})
            
            # Process markdown content
            markdown_content = data.get('markdown', '')
            
            # Extract metadata
            metadata = data.get('metadata', {})
            
            # Extract links if requested
            links = []
            images = []
            
            if include_links and 'links' in data:
                links = data.get('links', [])
            
            if 'images' in data:
                images = data.get('images', [])
            
            # Prepare result
            scraped_content = {
                "url": url,
                "title": metadata.get('title', ''),
                "content": data.get('text', markdown_content),
                "markdown": markdown_content,
                "html": data.get('html', '') if include_html else None,
                "links": links,
                "images": images,
                "metadata": {
                    "description": metadata.get('description', ''),
                    "keywords": metadata.get('keywords', ''),
                    "author": metadata.get('author', ''),
                    "language": metadata.get('language', ''),
                    "sourceURL": metadata.get('sourceURL', url),
                    "statusCode": metadata.get('statusCode'),
                    "contentType": metadata.get('contentType', ''),
                }
            }
            
            print(f"✅ Successfully scraped {url} in {duration:.2f}s")
            print(f"📊 Content length: {len(scraped_content['content'])} chars")
            print(f"🔗 Found {len(links)} links, {len(images)} images")
            
            return {
                "success": True,
                "url": url,
                "content": scraped_content,
                "duration_seconds": duration,
                "error": None
            }
            
        except Exception as e:
            error_msg = f"Firecrawl scraping failed: {str(e)}"
            print(f"❌ {error_msg}")
            
            return {
                "success": False,
                "error": error_msg,
                "url": kwargs.get('url'),
                "content": None,
                "duration_seconds": time.time() - start_time if 'start_time' in locals() else 0
            }

# Create tool instance
firecrawl_tool = FirecrawlTool()