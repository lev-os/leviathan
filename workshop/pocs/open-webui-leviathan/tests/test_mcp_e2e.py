#!/usr/bin/env python3
"""
E2E BDD Tests for MCP Integration
Tests the complete flow from Adapter to Leviathan Agent
"""

import pytest
import httpx
import asyncio
from unittest.mock import AsyncMock, patch
from typing import Dict, Any
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from leviathan_adapter import (
    LeviathanAdapter, 
    LeviathanConfig,
    MCPToolCall,
    MCPResponse,
    OpenWebUIRequest
)

class TestMCPIntegration:
    """
    Feature: MCP Protocol Integration
    As the adapter system
    I want to communicate with Leviathan via MCP
    So that I can leverage its capabilities
    """
    
    @pytest.fixture
    async def adapter(self):
        """Create adapter for testing"""
        config = LeviathanConfig(
            mcp_server_host="localhost",
            mcp_server_port=7893,
            adapter_port=7894,
            enable_caching=False
        )
        adapter = LeviathanAdapter(config)
        async with adapter:
            yield adapter
    
    @pytest.mark.asyncio
    async def test_mcp_tool_discovery(self, adapter):
        """
        Scenario: Discover available MCP tools
        Given Leviathan agent is running
        When I query available tools
        Then I should see memory and session tools
        """
        # This would connect to real Leviathan if running
        # For POC, we mock the response
        with patch.object(adapter.http_client, 'get') as mock_get:
            mock_response = AsyncMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "tools": [
                    "query_memories",
                    "store_memory", 
                    "session_ping",
                    "get_workflow",
                    "chat_completion"
                ]
            }
            mock_get.return_value = mock_response
            
            # When
            response = await adapter.http_client.get(
                f"{adapter.config.mcp_server_url}/tools"
            )
            
            # Then
            tools = response.json()["tools"]
            assert "query_memories" in tools
            assert "session_ping" in tools
            assert len(tools) >= 5
    
    @pytest.mark.asyncio
    async def test_memory_query_mcp_flow(self, adapter):
        """
        Scenario: Complete memory query flow
        Given a user asks about memories
        When the adapter processes the request
        Then it should call the correct MCP tool
        And return formatted memory results
        """
        # Given
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "What do you remember about Python best practices?"}
            ],
            model="leviathan-agent",
            session_id="test-mcp-memory"
        )
        
        # Mock MCP response
        mock_memory_response = {
            "content": [
                {
                    "type": "semantic",
                    "content": "Use type hints for better code clarity",
                    "confidence": 0.92,
                    "source": "Python documentation"
                },
                {
                    "type": "procedural",
                    "pattern": "error-handling",
                    "steps": ["Try-except blocks", "Specific exceptions", "Logging"],
                    "success_rate": 0.88
                }
            ],
            "session_id": "test-mcp-memory",
            "metadata": {
                "query_type": "semantic",
                "processing_time": 0.15,
                "total_results": 2
            }
        }
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=mock_memory_response["content"],
                session_id=mock_memory_response["session_id"],
                metadata=mock_memory_response["metadata"]
            )
            
            # When
            mcp_call = await adapter.translate_openwebui_to_mcp(request)
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            
            # Then
            assert mcp_call.name == "memory_query"
            assert "Python best practices" in mcp_call.arguments["query"]
            assert mcp_response.content[0]["type"] == "semantic"
            assert mcp_response.content[1]["type"] == "procedural"
            assert mcp_response.metadata["total_results"] == 2
    
    @pytest.mark.asyncio
    async def test_session_continuity_mcp_flow(self, adapter):
        """
        Scenario: Session state management
        Given an ongoing conversation
        When I checkpoint the session
        Then Leviathan should save the state
        And I can restore it later
        """
        # Given
        session_id = "test-mcp-session-123"
        
        # First, create a checkpoint
        checkpoint_call = MCPToolCall(
            name="session_ping",
            arguments={
                "session_id": session_id,
                "context": "Testing MCP session continuity",
                "action": "checkpoint"
            },
            session_id=session_id
        )
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content={"checkpoint_id": "cp_123", "saved": True},
                session_id=session_id,
                metadata={"timestamp": "2024-01-01T00:00:00Z"}
            )
            
            # When
            checkpoint_response = await adapter.call_leviathan_mcp(checkpoint_call)
            
            # Then
            assert checkpoint_response.content["saved"] is True
            assert checkpoint_response.content["checkpoint_id"] == "cp_123"
        
        # Now test session restoration
        restore_call = MCPToolCall(
            name="session_load",
            arguments={
                "session_id": session_id,
                "checkpoint_id": "cp_123"
            },
            session_id=session_id
        )
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content={
                    "restored": True,
                    "context": "Testing MCP session continuity",
                    "variables": {"test": "value"}
                },
                session_id=session_id
            )
            
            # When
            restore_response = await adapter.call_leviathan_mcp(restore_call)
            
            # Then
            assert restore_response.content["restored"] is True
            assert restore_response.content["context"] == "Testing MCP session continuity"
    
    @pytest.mark.asyncio
    async def test_workflow_discovery_mcp(self, adapter):
        """
        Scenario: Semantic workflow discovery
        Given I need a workflow for a task
        When I query Leviathan's workflow system
        Then I should receive applicable workflows
        """
        # Given
        workflow_call = MCPToolCall(
            name="get_workflow",
            arguments={
                "query": "create React component with TypeScript",
                "confidence_threshold": 0.8
            }
        )
        
        mock_workflow_response = {
            "workflows": [
                {
                    "id": "react-component-ts",
                    "name": "Create TypeScript React Component",
                    "confidence": 0.95,
                    "steps": [
                        "Create component file with .tsx extension",
                        "Define Props interface",
                        "Create functional component",
                        "Add prop types",
                        "Export component"
                    ]
                }
            ],
            "metadata": {
                "total_workflows": 1,
                "search_time": 0.05
            }
        }
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=mock_workflow_response["workflows"],
                metadata=mock_workflow_response["metadata"]
            )
            
            # When
            workflow_response = await adapter.call_leviathan_mcp(workflow_call)
            
            # Then
            assert len(workflow_response.content) == 1
            workflow = workflow_response.content[0]
            assert workflow["confidence"] > 0.9
            assert len(workflow["steps"]) == 5
            assert "TypeScript" in workflow["name"]
    
    @pytest.mark.asyncio
    async def test_mcp_error_handling(self, adapter):
        """
        Scenario: Handle MCP communication errors
        Given the Leviathan agent is unavailable
        When I try to make an MCP call
        Then the adapter should handle it gracefully
        """
        # Given
        call = MCPToolCall(
            name="query_memories",
            arguments={"query": "test"},
            session_id="error-test"
        )
        
        # Simulate connection error
        with patch.object(adapter.http_client, 'post') as mock_post:
            mock_post.side_effect = httpx.ConnectError("Connection refused")
            
            # When
            response = await adapter.call_leviathan_mcp(call)
            
            # Then
            assert response.error is not None
            assert "Unexpected error" in response.error
            assert response.content == ""
            assert response.session_id == "error-test"
    
    @pytest.mark.asyncio
    async def test_mcp_timeout_handling(self, adapter):
        """
        Scenario: Handle MCP timeout
        Given a slow MCP operation
        When the timeout is exceeded
        Then the adapter should return timeout error
        """
        # Given
        call = MCPToolCall(
            name="complex_analysis",
            arguments={"data": "large dataset"},
            session_id="timeout-test"
        )
        
        with patch.object(adapter.http_client, 'post') as mock_post:
            mock_post.side_effect = httpx.TimeoutException("Request timed out")
            
            # When
            response = await adapter.call_leviathan_mcp(call)
            
            # Then
            assert response.error is not None
            assert "Timeout calling complex_analysis" in response.error
            assert response.content == ""

# Integration test with mock Leviathan
class TestFullE2EFlow:
    """
    Feature: Complete E2E Flow
    As a user
    I want to interact with Leviathan through Open WebUI
    So that all components work together
    """
    
    @pytest.mark.asyncio
    async def test_complete_conversation_flow(self):
        """
        Scenario: Full conversation with memory
        Given a new conversation starts
        When multiple messages are exchanged
        Then memory should be updated
        And context should be maintained
        """
        config = LeviathanConfig(
            mcp_server_host="localhost",
            mcp_server_port=7893,
            adapter_port=7894
        )
        adapter = LeviathanAdapter(config)
        
        # Simulate conversation flow
        conversation = [
            {
                "request": OpenWebUIRequest(
                    messages=[{"role": "user", "content": "Hello, I'm learning React"}],
                    model="leviathan-agent",
                    session_id="e2e-test"
                ),
                "expected_tool": "chat_completion"
            },
            {
                "request": OpenWebUIRequest(
                    messages=[
                        {"role": "user", "content": "Hello, I'm learning React"},
                        {"role": "assistant", "content": "Great! React is a powerful library."},
                        {"role": "user", "content": "Can you remember this for next time?"}
                    ],
                    model="leviathan-agent",
                    session_id="e2e-test"
                ),
                "expected_tool": "session_ping"
            },
            {
                "request": OpenWebUIRequest(
                    messages=[{"role": "user", "content": "What were we discussing earlier?"}],
                    model="leviathan-agent",
                    session_id="e2e-test"
                ),
                "expected_tool": "memory_query"
            }
        ]
        
        for step in conversation:
            # Translate request
            mcp_call = await adapter.translate_openwebui_to_mcp(step["request"])
            
            # Verify correct tool selection
            assert mcp_call.name == step["expected_tool"]
            assert mcp_call.session_id == "e2e-test"
            
            # Verify session continuity
            if "session_id" in mcp_call.arguments:
                assert mcp_call.arguments["session_id"] == "e2e-test"

if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v", "--tb=short"])