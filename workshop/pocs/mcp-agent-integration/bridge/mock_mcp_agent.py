"""
Mock MCP Agent Implementation for POC Testing
Simulates MCP Agent functionality without requiring the actual package
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import asyncio
import uuid

@dataclass
class Tool:
    """Mock tool representation"""
    name: str
    description: str

@dataclass
class ListToolsResult:
    """Mock tools list result"""
    tools: List[Tool] = field(default_factory=list)

@dataclass
class Agent:
    """Mock MCP Agent for POC testing"""
    name: str
    instruction: str
    server_names: List[str]
    
    # Added by Lev integration
    lev_memory: Optional[Any] = None
    session_id: Optional[str] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        # Simulate connection to MCP servers
        await asyncio.sleep(0.1)  # Simulate connection time
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        # Simulate cleanup
        await asyncio.sleep(0.05)
        
    async def list_tools(self) -> ListToolsResult:
        """List available tools based on server names"""
        tools = []
        
        if "filesystem" in self.server_names:
            tools.extend([
                Tool("read_file", "Read contents of a file"),
                Tool("write_file", "Write content to a file"),
                Tool("list_directory", "List directory contents")
            ])
            
        if "fetch" in self.server_names:
            tools.extend([
                Tool("fetch_url", "Fetch content from a URL"),
                Tool("fetch_with_headers", "Fetch with custom headers")
            ])
            
        if "brave-search" in self.server_names:
            tools.extend([
                Tool("web_search", "Search the web using Brave"),
                Tool("news_search", "Search news articles")
            ])
            
        return ListToolsResult(tools=tools)
    
    async def generate_str(self, message: str, **kwargs) -> str:
        """Mock string generation"""
        # Simulate LLM response
        await asyncio.sleep(0.5)  # Simulate processing time
        return f"Mock response for: {message}"
    
    def attach_llm(self, llm_class):
        """Mock LLM attachment"""
        # Return self for chaining
        return self

@dataclass
class MCPApp:
    """Mock MCP Application"""
    name: str
    
    def run(self):
        """Return self as async context manager"""
        return self
    
    async def __aenter__(self):
        """Async context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        pass