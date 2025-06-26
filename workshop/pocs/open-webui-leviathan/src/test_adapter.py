#!/usr/bin/env python3
"""
Test suite for Leviathan Adapter
POC validation and integration testing
"""

import asyncio
import json
import pytest
from unittest.mock import AsyncMock, patch
from typing import Dict, Any

import httpx
from fastapi.testclient import TestClient

from leviathan_adapter import (
    LeviathanAdapter, 
    LeviathanConfig, 
    OpenWebUIRequest, 
    MCPToolCall,
    MCPResponse,
    app
)

# Test configuration
test_config = LeviathanConfig(
    mcp_server_url="http://localhost:3001",
    adapter_port=8082,  # Different port for testing
    timeout_seconds=5,
    enable_caching=False  # Disable caching for tests
)

# Test client
client = TestClient(app)

class TestLeviathanAdapter:
    """Test suite for the core adapter functionality"""
    
    @pytest.fixture
    async def adapter(self):
        """Create adapter instance for testing"""
        adapter = LeviathanAdapter(test_config)
        async with adapter:
            yield adapter
    
    @pytest.mark.asyncio
    async def test_translate_openwebui_to_mcp_chat(self, adapter):
        """Test translation of chat request to MCP format"""
        # Get the actual adapter from the fixture
        test_adapter = adapter
        
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "Hello, how are you?"},
                {"role": "assistant", "content": "I'm doing well, thank you!"},
                {"role": "user", "content": "Can you help me with a Python question?"}
            ],
            model="leviathan-agent",
            stream=False,
            session_id="test-session-123"
        )
        
        mcp_call = await test_adapter.translate_openwebui_to_mcp(request)
        
        assert mcp_call.name == "chat_completion"
        assert mcp_call.session_id == "test-session-123"
        assert mcp_call.arguments["user_message"] == "Can you help me with a Python question?"
        assert mcp_call.arguments["model"] == "leviathan-agent"
        assert len(mcp_call.arguments["messages"]) == 3
    
    @pytest.mark.asyncio
    async def test_translate_openwebui_to_mcp_memory(self, adapter):
        """Test translation of memory request to MCP format"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "Can you remember our previous conversation about Python?"}
            ],
            model="leviathan-agent",
            session_id="test-session-456"
        )
        
        mcp_call = await adapter.translate_openwebui_to_mcp(request)
        
        assert mcp_call.name == "memory_query"
        assert mcp_call.session_id == "test-session-456"
        assert mcp_call.arguments["query"] == "Can you remember our previous conversation about Python?"
        assert mcp_call.arguments["query_type"] == "semantic"
    
    @pytest.mark.asyncio
    async def test_translate_openwebui_to_mcp_session(self, adapter):
        """Test translation of session request to MCP format"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "Please save this session for later"}
            ],
            model="leviathan-agent",
            session_id="test-session-789"
        )
        
        mcp_call = await adapter.translate_openwebui_to_mcp(request)
        
        assert mcp_call.name == "session_ping"
        assert mcp_call.session_id == "test-session-789"
        assert mcp_call.arguments["context"] == "Please save this session for later"
        assert mcp_call.arguments["action"] == "checkpoint"
    
    @pytest.mark.asyncio
    async def test_translate_mcp_to_openwebui_success(self, adapter):
        """Test translation of successful MCP response to Open WebUI format"""
        mcp_response = MCPResponse(
            content="This is a response from Leviathan agent",
            session_id="test-session-123",
            metadata={"tokens_used": 50, "processing_time": 1.2}
        )
        
        openwebui_response = await adapter.translate_mcp_to_openwebui(mcp_response)
        
        assert openwebui_response["object"] == "chat.completion"
        assert openwebui_response["model"] == "leviathan-agent"
        assert openwebui_response["choices"][0]["message"]["role"] == "assistant"
        assert openwebui_response["choices"][0]["message"]["content"] == "This is a response from Leviathan agent"
        assert openwebui_response["session_id"] == "test-session-123"
        assert openwebui_response["metadata"]["tokens_used"] == 50
    
    @pytest.mark.asyncio
    async def test_translate_mcp_to_openwebui_error(self, adapter):
        """Test translation of MCP error response"""
        mcp_response = MCPResponse(
            content="",
            error="Leviathan agent is unavailable",
            session_id="test-session-123"
        )
        
        with pytest.raises(Exception) as exc_info:
            await adapter.translate_mcp_to_openwebui(mcp_response)
        
        assert "Leviathan agent error" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_call_leviathan_mcp_success(self, adapter):
        """Test successful MCP call to Leviathan agent"""
        # Mock the HTTP response
        mock_response_data = {
            "content": "Hello from Leviathan!",
            "session_id": "test-session-123",
            "metadata": {"processing_time": 0.5}
        }
        
        with patch.object(adapter.http_client, 'post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.json.return_value = mock_response_data
            mock_response.raise_for_status.return_value = None
            mock_post.return_value = mock_response
            
            tool_call = MCPToolCall(
                name="chat_completion",
                arguments={"user_message": "Hello"},
                session_id="test-session-123"
            )
            
            response = await adapter.call_leviathan_mcp(tool_call)
            
            assert response.content == "Hello from Leviathan!"
            assert response.session_id == "test-session-123"
            assert response.error is None
            assert response.metadata["processing_time"] == 0.5
    
    @pytest.mark.asyncio
    async def test_call_leviathan_mcp_timeout(self, adapter):
        """Test MCP call timeout handling"""
        with patch.object(adapter.http_client, 'post') as mock_post:
            mock_post.side_effect = httpx.TimeoutException("Request timed out")
            
            tool_call = MCPToolCall(
                name="chat_completion",
                arguments={"user_message": "Hello"},
                session_id="test-session-123"
            )
            
            response = await adapter.call_leviathan_mcp(tool_call)
            
            assert response.content == ""
            assert "Timeout calling chat_completion" in response.error
            assert response.session_id == "test-session-123"
    
    @pytest.mark.asyncio
    async def test_call_leviathan_mcp_http_error(self, adapter):
        """Test MCP call HTTP error handling"""
        with patch.object(adapter.http_client, 'post') as mock_post:
            mock_response = AsyncMock()
            mock_response.status_code = 500
            mock_response.text = "Internal Server Error"
            mock_post.side_effect = httpx.HTTPStatusError(
                "Server error", 
                request=AsyncMock(), 
                response=mock_response
            )
            
            tool_call = MCPToolCall(
                name="chat_completion",
                arguments={"user_message": "Hello"},
                session_id="test-session-123"
            )
            
            response = await adapter.call_leviathan_mcp(tool_call)
            
            assert response.content == ""
            assert "HTTP 500" in response.error
            assert response.session_id == "test-session-123"

class TestAdapterAPI:
    """Test suite for the FastAPI endpoints"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["adapter_status"] == "healthy"
        assert "leviathan_connection" in data
        assert "config" in data
        assert "cache_stats" in data
    
    def test_list_models_endpoint(self):
        """Test model listing endpoint"""
        response = client.get("/v1/models")
        assert response.status_code == 200
        
        data = response.json()
        assert data["object"] == "list"
        assert len(data["data"]) == 1
        assert data["data"][0]["id"] == "leviathan-agent"
        assert data["data"][0]["owned_by"] == "leviathan"
    
    @patch('leviathan_adapter.adapter.call_leviathan_mcp')
    def test_chat_completions_endpoint(self, mock_mcp_call):
        """Test chat completions endpoint"""
        # Mock successful MCP response
        mock_mcp_call.return_value = MCPResponse(
            content="Test response from Leviathan",
            session_id="test-session",
            metadata={}
        )
        
        request_data = {
            "messages": [
                {"role": "user", "content": "Hello, test message"}
            ],
            "model": "leviathan-agent",
            "stream": False,
            "session_id": "test-session"
        }
        
        response = client.post("/v1/chat/completions", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["object"] == "chat.completion"
        assert data["model"] == "leviathan-agent"
        assert data["choices"][0]["message"]["content"] == "Test response from Leviathan"
        assert data["session_id"] == "test-session"
    
    @patch('leviathan_adapter.adapter.call_leviathan_mcp')
    def test_memory_query_endpoint(self, mock_mcp_call):
        """Test memory query endpoint"""
        # Mock successful MCP response
        mock_mcp_call.return_value = MCPResponse(
            content=["Memory result 1", "Memory result 2"],
            metadata={"total_results": 2}
        )
        
        response = client.post(
            "/v1/memory/query",
            params={"query": "test query", "query_type": "semantic"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["query"] == "test query"
        assert data["type"] == "semantic"
        assert data["results"] == ["Memory result 1", "Memory result 2"]
        assert data["metadata"]["total_results"] == 2
    
    @patch('leviathan_adapter.adapter.call_leviathan_mcp')
    def test_session_checkpoint_endpoint(self, mock_mcp_call):
        """Test session checkpoint endpoint"""
        # Mock successful MCP response
        mock_mcp_call.return_value = MCPResponse(
            content={"checkpoint_id": "cp_123"},
            metadata={"timestamp": "2024-01-01T00:00:00Z"}
        )
        
        response = client.post(
            "/v1/session/checkpoint",
            params={"session_id": "test-session", "context": "Test checkpoint"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_id"] == "test-session"
        assert data["checkpoint_created"] is True
        assert data["context"] == "Test checkpoint"

class TestIntegrationFlow:
    """End-to-end integration tests"""
    
    @pytest.mark.asyncio
    async def test_full_chat_flow(self):
        """Test complete chat flow: OpenWebUI → Adapter → Leviathan → Response"""
        # This would require a running Leviathan agent for full integration
        # For POC, we'll mock the external call
        
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "What is the capital of France?"}
            ],
            model="leviathan-agent",
            session_id="integration-test"
        )
        
        adapter = LeviathanAdapter(test_config)
        
        # Step 1: Translation
        mcp_call = await adapter.translate_openwebui_to_mcp(request)
        assert mcp_call.name == "chat_completion"
        
        # Step 2: Mock Leviathan call (would be real in full integration)
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content="The capital of France is Paris.",
                session_id="integration-test",
                metadata={"confidence": 0.95}
            )
            
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            assert mcp_response.content == "The capital of France is Paris."
        
        # Step 3: Response translation
        openwebui_response = await adapter.translate_mcp_to_openwebui(mcp_response)
        assert openwebui_response["choices"][0]["message"]["content"] == "The capital of France is Paris."
        assert openwebui_response["session_id"] == "integration-test"

# Performance benchmarks
@pytest.mark.asyncio
async def test_adapter_latency():
    """Test adapter latency to ensure <500ms requirement"""
    import time
    
    adapter = LeviathanAdapter(test_config)
    
    start_time = time.time()
    
    # Mock fast MCP response
    with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
        mock_call.return_value = MCPResponse(
            content="Fast response",
            session_id="latency-test"
        )
        
        request = OpenWebUIRequest(
            messages=[{"role": "user", "content": "Quick test"}],
            model="leviathan-agent"
        )
        
        # Full translation flow
        mcp_call = await adapter.translate_openwebui_to_mcp(request)
        mcp_response = await adapter.call_leviathan_mcp(mcp_call)
        response = await adapter.translate_mcp_to_openwebui(mcp_response)
    
    end_time = time.time()
    latency_ms = (end_time - start_time) * 1000
    
    print(f"Adapter latency: {latency_ms:.2f}ms")
    
    # Adapter overhead should be minimal (<50ms)
    # Full system latency target is <500ms
    assert latency_ms < 50, f"Adapter latency too high: {latency_ms}ms"

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])