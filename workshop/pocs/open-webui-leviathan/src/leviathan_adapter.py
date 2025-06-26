#!/usr/bin/env python3
"""
Leviathan Adapter for Open WebUI Integration
POC implementation for bridging Open WebUI (Python/FastAPI) to Leviathan Agent (Node.js/MCP)
"""

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
@dataclass
class LeviathanConfig:
    mcp_server_url: str = "http://localhost:3001"  # Leviathan agent MCP server
    adapter_port: int = 8081
    timeout_seconds: int = 30
    max_retries: int = 3
    enable_caching: bool = True
    cache_ttl_seconds: int = 300

config = LeviathanConfig()

# Pydantic models for type safety
class MCPToolCall(BaseModel):
    """MCP tool call request format"""
    name: str = Field(..., description="MCP tool name")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Tool arguments")
    session_id: Optional[str] = Field(None, description="Session identifier")

class MCPResponse(BaseModel):
    """MCP tool response format"""
    content: Any = Field(..., description="Tool response content")
    error: Optional[str] = Field(None, description="Error message if failed")
    session_id: Optional[str] = Field(None, description="Session identifier")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class OpenWebUIRequest(BaseModel):
    """Open WebUI request format"""
    messages: List[Dict[str, Any]] = Field(..., description="Chat messages")
    model: str = Field(..., description="Model identifier")
    stream: bool = Field(default=False, description="Streaming response")
    session_id: Optional[str] = Field(None, description="Session identifier")
    user_id: Optional[str] = Field(None, description="User identifier")

class LeviathanAdapter:
    """
    Core adapter class for bridging Open WebUI to Leviathan Agent
    """
    
    def __init__(self, config: LeviathanConfig):
        self.config = config
        self.http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(config.timeout_seconds),
            limits=httpx.Limits(max_connections=100, max_keepalive_connections=20)
        )
        self.session_cache: Dict[str, Dict[str, Any]] = {}
        self.tool_cache: Dict[str, Any] = {}
        
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()

    async def translate_openwebui_to_mcp(self, request: OpenWebUIRequest) -> MCPToolCall:
        """
        Translate Open WebUI request to MCP tool call format
        
        Strategy:
        - Chat completion requests → `chat_completion` MCP tool
        - Memory queries → `memory_query` MCP tool  
        - Session operations → `session_ping` MCP tool
        """
        
        # Extract last user message for analysis
        user_message = None
        for msg in reversed(request.messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
        
        if not user_message:
            raise ValueError("No user message found in request")
        
        # Determine appropriate MCP tool based on request content
        tool_name = "chat_completion"  # Default tool
        arguments = {
            "messages": request.messages,
            "model": request.model,
            "stream": request.stream,
            "user_message": user_message
        }
        
        # Detect memory operations
        if any(keyword in user_message.lower() for keyword in ["remember", "recall", "memory", "history"]):
            tool_name = "memory_query"
            arguments.update({
                "query": user_message,
                "query_type": "semantic"
            })
        
        # Detect session operations  
        elif any(keyword in user_message.lower() for keyword in ["session", "checkpoint", "save"]):
            tool_name = "session_ping"
            arguments.update({
                "context": user_message,
                "action": "checkpoint"
            })
        
        return MCPToolCall(
            name=tool_name,
            arguments=arguments,
            session_id=request.session_id
        )

    async def call_leviathan_mcp(self, tool_call: MCPToolCall) -> MCPResponse:
        """
        Call Leviathan agent via MCP protocol over HTTP
        """
        try:
            # Prepare MCP request payload
            payload = {
                "tool": tool_call.name,
                "arguments": tool_call.arguments,
                "session_id": tool_call.session_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Calling Leviathan MCP tool: {tool_call.name}")
            
            # Make HTTP request to Leviathan agent
            response = await self.http_client.post(
                f"{self.config.mcp_server_url}/mcp/tools/{tool_call.name}",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "OpenWebUI-Leviathan-Adapter/1.0"
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            return MCPResponse(
                content=result.get("content", ""),
                error=result.get("error"),
                session_id=result.get("session_id"),
                metadata=result.get("metadata", {})
            )
            
        except httpx.TimeoutException:
            logger.error(f"Timeout calling Leviathan MCP tool: {tool_call.name}")
            return MCPResponse(
                content="",
                error=f"Timeout calling {tool_call.name}",
                session_id=tool_call.session_id
            )
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error calling Leviathan: {e.response.status_code}")
            return MCPResponse(
                content="",
                error=f"HTTP {e.response.status_code}: {e.response.text}",
                session_id=tool_call.session_id
            )
        except Exception as e:
            logger.error(f"Unexpected error calling Leviathan: {e}")
            return MCPResponse(
                content="",
                error=f"Unexpected error: {str(e)}",
                session_id=tool_call.session_id
            )

    async def translate_mcp_to_openwebui(self, mcp_response: MCPResponse, stream: bool = False) -> Dict[str, Any]:
        """
        Translate MCP response back to Open WebUI format
        """
        if mcp_response.error:
            raise HTTPException(
                status_code=500,
                detail=f"Leviathan agent error: {mcp_response.error}"
            )
        
        # Format for Open WebUI chat completion response
        content = mcp_response.content
        if isinstance(content, dict) and "response" in content:
            content = content["response"]
        elif not isinstance(content, str):
            content = json.dumps(content)
        
        response = {
            "id": f"lev-{datetime.utcnow().timestamp()}",
            "object": "chat.completion",
            "created": int(datetime.utcnow().timestamp()),
            "model": "leviathan-agent",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": content
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": len(content.split()) if isinstance(content, str) else 0,
                "total_tokens": 0
            },
            "session_id": mcp_response.session_id,
            "metadata": mcp_response.metadata
        }
        
        return response

    async def health_check(self) -> Dict[str, Any]:
        """Check health of adapter and Leviathan connection"""
        try:
            health_response = await self.http_client.get(
                f"{self.config.mcp_server_url}/health",
                timeout=5.0
            )
            leviathan_healthy = health_response.status_code == 200
        except Exception as e:
            logger.warning(f"Leviathan health check failed: {e}")
            leviathan_healthy = False
        
        return {
            "adapter_status": "healthy",
            "leviathan_connection": "healthy" if leviathan_healthy else "unhealthy",
            "config": {
                "mcp_server_url": self.config.mcp_server_url,
                "adapter_port": self.config.adapter_port,
                "caching_enabled": self.config.enable_caching
            },
            "cache_stats": {
                "session_cache_size": len(self.session_cache),
                "tool_cache_size": len(self.tool_cache)
            }
        }

# FastAPI app for the adapter service
app = FastAPI(
    title="Leviathan Adapter",
    description="Bridge between Open WebUI and Leviathan Agent System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global adapter instance
adapter = LeviathanAdapter(config)

@app.post("/v1/chat/completions")
async def chat_completions(request: OpenWebUIRequest):
    """
    Main endpoint for Open WebUI chat completions
    Bridges to Leviathan agent via MCP protocol
    """
    try:
        # Step 1: Translate Open WebUI request to MCP format
        mcp_call = await adapter.translate_openwebui_to_mcp(request)
        
        # Step 2: Call Leviathan agent
        mcp_response = await adapter.call_leviathan_mcp(mcp_call)
        
        # Step 3: Translate response back to Open WebUI format
        openwebui_response = await adapter.translate_mcp_to_openwebui(
            mcp_response, 
            stream=request.stream
        )
        
        return openwebui_response
        
    except Exception as e:
        logger.error(f"Error in chat completions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """Health check endpoint"""
    return await adapter.health_check()

@app.get("/v1/models")
async def list_models():
    """List available models (Leviathan agent)"""
    return {
        "object": "list",
        "data": [
            {
                "id": "leviathan-agent",
                "object": "model",
                "created": int(datetime.utcnow().timestamp()),
                "owned_by": "leviathan",
                "permission": [],
                "root": "leviathan-agent",
                "parent": None
            }
        ]
    }

@app.post("/v1/memory/query")
async def memory_query(query: str, query_type: str = "semantic"):
    """
    Direct memory query endpoint for enhanced UI features
    """
    try:
        mcp_call = MCPToolCall(
            name="memory_query",
            arguments={
                "query": query,
                "query_type": query_type
            }
        )
        
        mcp_response = await adapter.call_leviathan_mcp(mcp_call)
        
        if mcp_response.error:
            raise HTTPException(status_code=500, detail=mcp_response.error)
        
        return {
            "query": query,
            "type": query_type,
            "results": mcp_response.content,
            "metadata": mcp_response.metadata
        }
        
    except Exception as e:
        logger.error(f"Error in memory query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/session/checkpoint")
async def session_checkpoint(session_id: str, context: str):
    """
    Session checkpoint endpoint for state management
    """
    try:
        mcp_call = MCPToolCall(
            name="session_ping",
            arguments={
                "session_id": session_id,
                "context": context,
                "action": "checkpoint"
            },
            session_id=session_id
        )
        
        mcp_response = await adapter.call_leviathan_mcp(mcp_call)
        
        if mcp_response.error:
            raise HTTPException(status_code=500, detail=mcp_response.error)
        
        return {
            "session_id": session_id,
            "checkpoint_created": True,
            "context": context,
            "metadata": mcp_response.metadata
        }
        
    except Exception as e:
        logger.error(f"Error in session checkpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting Leviathan Adapter on port {config.adapter_port}")
    logger.info(f"Connecting to Leviathan agent at {config.mcp_server_url}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=config.adapter_port,
        log_level="info"
    )