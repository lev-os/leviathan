#!/usr/bin/env python3
"""
E2E BDD Tests for Leviathan Adapter API
Tests the complete flow from API request to response
"""

import pytest
import httpx
import asyncio
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:7894"
TIMEOUT = httpx.Timeout(10.0)

@pytest.fixture
async def client():
    """Create async HTTP client for testing"""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=TIMEOUT) as client:
        yield client

class TestHealthEndpoints:
    """
    Feature: System Health Monitoring
    As a system administrator
    I want to check the health of all components
    So that I can ensure the system is operational
    """
    
    @pytest.mark.asyncio
    async def test_adapter_health_check(self, client):
        """
        Scenario: Check adapter health
        Given the adapter is running
        When I request the health endpoint
        Then I should receive a healthy status
        And the response should include component statuses
        """
        # When
        response = await client.get("/health")
        
        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["adapter_status"] == "healthy"
        assert "leviathan_connection" in data
        assert "config" in data
        assert "cache_stats" in data

class TestChatCompletions:
    """
    Feature: Chat Completion with Memory
    As a user
    I want to chat with Leviathan through Open WebUI
    So that I can leverage its memory capabilities
    """
    
    @pytest.mark.asyncio
    async def test_basic_chat_completion(self, client):
        """
        Scenario: Basic chat interaction
        Given I have a chat message
        When I send it to the chat completions endpoint
        Then I should receive a properly formatted response
        """
        # Given
        request_data = {
            "messages": [
                {"role": "user", "content": "Hello, how are you?"}
            ],
            "model": "leviathan-agent",
            "session_id": "test-e2e-chat"
        }
        
        # When
        response = await client.post("/v1/chat/completions", json=request_data)
        
        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["object"] == "chat.completion"
        assert data["model"] == "leviathan-agent"
        assert len(data["choices"]) > 0
        assert data["choices"][0]["message"]["role"] == "assistant"
        assert data["session_id"] == "test-e2e-chat"
    
    @pytest.mark.asyncio
    async def test_memory_query_routing(self, client):
        """
        Scenario: Memory query detection
        Given I ask about memories
        When I send a memory-related question
        Then the system should route it as a memory query
        """
        # Given
        request_data = {
            "messages": [
                {"role": "user", "content": "What do you remember about React hooks?"}
            ],
            "model": "leviathan-agent",
            "session_id": "test-e2e-memory"
        }
        
        # When
        response = await client.post("/v1/chat/completions", json=request_data)
        
        # Then
        assert response.status_code == 200
        data = response.json()
        # Even if Leviathan isn't running, adapter should handle gracefully
        assert "choices" in data
        assert data["session_id"] == "test-e2e-memory"

class TestMemoryDashboard:
    """
    Feature: Memory System Visualization
    As a developer
    I want to see the state of all memory types
    So that I can monitor system health
    """
    
    @pytest.mark.asyncio
    async def test_memory_dashboard_structure(self, client):
        """
        Scenario: View memory dashboard
        Given the memory system is active
        When I request the dashboard
        Then I should see all 5 memory types
        And each should have health metrics
        """
        # When
        response = await client.get("/v1/memory/dashboard")
        
        # Then
        assert response.status_code == 200
        data = response.json()
        
        # Check all 5 memory types present
        assert "memory_types" in data
        memory_types = data["memory_types"]
        assert "semantic" in memory_types
        assert "episodic" in memory_types
        assert "procedural" in memory_types
        assert "working" in memory_types
        assert "temporal" in memory_types
        
        # Check health scores
        for memory_type, info in memory_types.items():
            assert "health_score" in info
            assert 0 <= info["health_score"] <= 1
    
    @pytest.mark.asyncio
    async def test_memory_graph_visualization(self, client):
        """
        Scenario: View memory relationships
        Given I want to explore memory connections
        When I request the memory graph
        Then I should receive node and edge data
        """
        # When
        response = await client.get("/v1/memory/graph", params={
            "center_concept": "React",
            "max_nodes": 20
        })
        
        # Then
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert "metadata" in data
        assert isinstance(data["nodes"], list)
        assert isinstance(data["edges"], list)

class TestMemoryTypeQueries:
    """
    Feature: Individual Memory Type Access
    As a user
    I want to query specific memory types
    So that I can get targeted information
    """
    
    @pytest.mark.asyncio
    @pytest.mark.parametrize("memory_type", [
        "semantic", "episodic", "procedural", "working", "temporal"
    ])
    async def test_individual_memory_type_query(self, client, memory_type):
        """
        Scenario Outline: Query specific memory type
        Given I want to query <memory_type> memory
        When I request that memory type
        Then I should receive type-specific data
        """
        # When
        response = await client.get(f"/v1/memory/types/{memory_type}")
        
        # Then
        assert response.status_code == 200
        data = response.json()
        assert "health_score" in data
        assert "last_updated" in data

class TestSessionManagement:
    """
    Feature: Session State Management
    As a user
    I want my sessions to be saved
    So that I can continue conversations later
    """
    
    @pytest.mark.asyncio
    async def test_session_checkpoint(self, client):
        """
        Scenario: Create session checkpoint
        Given I have an active session
        When I create a checkpoint
        Then my session state should be saved
        """
        # When
        response = await client.post("/v1/session/checkpoint", params={
            "session_id": "test-e2e-session",
            "context": "Testing session checkpoints"
        })
        
        # Then
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == "test-e2e-session"
        assert data["checkpoint_created"] is True
        assert data["context"] == "Testing session checkpoints"

class TestErrorHandling:
    """
    Feature: Graceful Error Handling
    As a system
    I want to handle errors gracefully
    So that users get helpful feedback
    """
    
    @pytest.mark.asyncio
    async def test_invalid_memory_type(self, client):
        """
        Scenario: Invalid memory type request
        Given I request an invalid memory type
        When I make the request
        Then I should receive a clear error message
        """
        # When
        response = await client.get("/v1/memory/types/invalid_type")
        
        # Then
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Invalid memory type" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_missing_required_fields(self, client):
        """
        Scenario: Missing required fields
        Given I send an incomplete request
        When the server processes it
        Then I should receive validation errors
        """
        # When
        response = await client.post("/v1/chat/completions", json={
            "model": "leviathan-agent"
            # Missing "messages" field
        })
        
        # Then
        assert response.status_code == 422  # Unprocessable Entity
        data = response.json()
        assert "detail" in data

# Performance tests
class TestPerformance:
    """
    Feature: Performance Requirements
    As a system
    I want to respond quickly
    So that users have a good experience
    """
    
    @pytest.mark.asyncio
    async def test_response_time_under_500ms(self, client):
        """
        Scenario: Fast response times
        Given the system is under normal load
        When I make a request
        Then the response should be under 500ms
        """
        import time
        
        # Given
        request_data = {
            "messages": [{"role": "user", "content": "Quick test"}],
            "model": "leviathan-agent"
        }
        
        # When
        start = time.time()
        response = await client.post("/v1/chat/completions", json=request_data)
        end = time.time()
        
        # Then
        assert response.status_code == 200
        response_time = (end - start) * 1000  # Convert to ms
        assert response_time < 500, f"Response took {response_time}ms (target: <500ms)"
        print(f"✅ Response time: {response_time:.2f}ms")

if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v", "--tb=short"])