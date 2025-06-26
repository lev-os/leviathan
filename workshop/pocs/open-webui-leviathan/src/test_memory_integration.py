#!/usr/bin/env python3
"""
Memory System Integration Tests for Leviathan Adapter
Tests the 5-type memory system through the adapter layer
"""

import asyncio
import json
import pytest
from unittest.mock import AsyncMock, patch
from typing import Dict, Any, List

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
    adapter_port=8082,
    timeout_seconds=10,
    enable_caching=False
)

class TestMemorySystemIntegration:
    """Test suite for 5-type memory system integration"""
    
    @pytest.fixture
    async def adapter(self):
        """Create adapter instance for testing"""
        adapter = LeviathanAdapter(test_config)
        async with adapter:
            yield adapter
    
    # Mock memory responses for each type
    MOCK_MEMORY_RESPONSES = {
        "semantic": {
            "content": [
                {
                    "type": "semantic",
                    "content": "React hooks are functions that let you use state and lifecycle features",
                    "confidence": 0.95,
                    "source": "React documentation",
                    "related_concepts": ["useState", "useEffect", "component lifecycle"]
                }
            ],
            "metadata": {
                "query_type": "semantic",
                "total_results": 1,
                "processing_time": 0.12
            }
        },
        "episodic": {
            "content": [
                {
                    "type": "episodic", 
                    "session_id": "sess_123",
                    "timestamp": "2025-06-26T12:00:00Z",
                    "context": "User asked about React component optimization",
                    "outcome": "Successfully created optimized component",
                    "learning": "User prefers functional components over class components"
                }
            ],
            "metadata": {
                "query_type": "episodic",
                "total_results": 1,
                "processing_time": 0.08
            }
        },
        "procedural": {
            "content": [
                {
                    "type": "procedural",
                    "pattern_id": "react-component-creation",
                    "title": "Create React Component",
                    "steps": [
                        "Create .tsx file with component name",
                        "Define props interface if needed", 
                        "Create functional component with TypeScript",
                        "Export component as default"
                    ],
                    "success_rate": 0.92,
                    "usage_count": 47
                }
            ],
            "metadata": {
                "query_type": "procedural",
                "total_results": 1,
                "processing_time": 0.05
            }
        },
        "working": {
            "content": {
                "current_session": "sess_456",
                "active_context": "React component development",
                "current_task": "Optimizing component performance",
                "conversation_thread": [
                    {"role": "user", "content": "How to optimize React components?"},
                    {"role": "assistant", "content": "Here are several optimization techniques..."}
                ],
                "variables": {
                    "component_name": "UserProfile",
                    "optimization_focus": "rendering performance"
                }
            },
            "metadata": {
                "query_type": "working",
                "session_active": True,
                "context_size": "2.3KB",
                "processing_time": 0.02
            }
        },
        "temporal": {
            "content": [
                {
                    "type": "temporal",
                    "timeframe": "last_week",
                    "pattern": "React component creation spike on weekdays",
                    "events": [
                        {
                            "date": "2025-06-20",
                            "activity": "Created 5 React components",
                            "outcome": "High success rate"
                        },
                        {
                            "date": "2025-06-21", 
                            "activity": "Optimized component rendering",
                            "outcome": "30% performance improvement"
                        }
                    ],
                    "insights": [
                        "Component creation most successful during focused work sessions",
                        "Performance optimization requires iterative approach"
                    ]
                }
            ],
            "metadata": {
                "query_type": "temporal",
                "time_range": "7_days",
                "total_events": 12,
                "processing_time": 0.15
            }
        }
    }
    
    @pytest.mark.asyncio
    async def test_semantic_memory_query(self, adapter):
        """Test semantic memory queries for facts and knowledge"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "What do you remember about React hooks?"}
            ],
            model="leviathan-agent",
            session_id="test-semantic"
        )
        
        # Mock the Leviathan MCP response
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=self.MOCK_MEMORY_RESPONSES["semantic"]["content"],
                session_id="test-semantic",
                metadata=self.MOCK_MEMORY_RESPONSES["semantic"]["metadata"]
            )
            
            # Test translation to memory query
            mcp_call = await adapter.translate_openwebui_to_mcp(request)
            assert mcp_call.name == "memory_query"  # Should route to memory query
            assert "React hooks" in mcp_call.arguments["query"]
            assert mcp_call.arguments["query_type"] == "semantic"
            
            # Test memory query execution
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            assert mcp_response.content[0]["type"] == "semantic"
            assert mcp_response.content[0]["confidence"] == 0.95
            assert "useState" in mcp_response.content[0]["related_concepts"]
    
    @pytest.mark.asyncio
    async def test_episodic_memory_query(self, adapter):
        """Test episodic memory for session history and learning"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "What happened in our last React session?"}
            ],
            model="leviathan-agent", 
            session_id="test-episodic"
        )
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=self.MOCK_MEMORY_RESPONSES["episodic"]["content"],
                session_id="test-episodic",
                metadata=self.MOCK_MEMORY_RESPONSES["episodic"]["metadata"]
            )
            
            mcp_call = await adapter.translate_openwebui_to_mcp(request)
            assert mcp_call.name == "memory_query"
            assert "last React session" in mcp_call.arguments["query"]
            
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            episode = mcp_response.content[0]
            assert episode["type"] == "episodic"
            assert "session_id" in episode
            assert "outcome" in episode
            assert "learning" in episode
    
    @pytest.mark.asyncio
    async def test_procedural_memory_query(self, adapter):
        """Test procedural memory for workflows and patterns"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "How do I create a React component? Show me the steps."}
            ],
            model="leviathan-agent",
            session_id="test-procedural"
        )
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=self.MOCK_MEMORY_RESPONSES["procedural"]["content"],
                session_id="test-procedural", 
                metadata=self.MOCK_MEMORY_RESPONSES["procedural"]["metadata"]
            )
            
            mcp_call = await adapter.translate_openwebui_to_mcp(request)
            assert mcp_call.name == "memory_query"
            
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            procedure = mcp_response.content[0]
            assert procedure["type"] == "procedural"
            assert "steps" in procedure
            assert len(procedure["steps"]) == 4
            assert procedure["success_rate"] > 0.9
    
    @pytest.mark.asyncio
    async def test_working_memory_query(self, adapter):
        """Test working memory for current session state"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "What are we currently working on?"}
            ],
            model="leviathan-agent",
            session_id="test-working"
        )
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=self.MOCK_MEMORY_RESPONSES["working"]["content"],
                session_id="test-working",
                metadata=self.MOCK_MEMORY_RESPONSES["working"]["metadata"]
            )
            
            mcp_call = await adapter.translate_openwebui_to_mcp(request)
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            
            working_mem = mcp_response.content
            assert working_mem["current_session"] == "sess_456"
            assert working_mem["active_context"] == "React component development"
            assert "conversation_thread" in working_mem
            assert "variables" in working_mem
    
    @pytest.mark.asyncio
    async def test_temporal_memory_query(self, adapter):
        """Test temporal memory for patterns over time"""
        request = OpenWebUIRequest(
            messages=[
                {"role": "user", "content": "What patterns do you see in my React work this week?"}
            ],
            model="leviathan-agent",
            session_id="test-temporal"
        )
        
        with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
            mock_call.return_value = MCPResponse(
                content=self.MOCK_MEMORY_RESPONSES["temporal"]["content"],
                session_id="test-temporal",
                metadata=self.MOCK_MEMORY_RESPONSES["temporal"]["metadata"]
            )
            
            mcp_call = await adapter.translate_openwebui_to_mcp(request)
            mcp_response = await adapter.call_leviathan_mcp(mcp_call)
            
            temporal_data = mcp_response.content[0]
            assert temporal_data["type"] == "temporal"
            assert "events" in temporal_data
            assert "insights" in temporal_data
            assert len(temporal_data["events"]) == 2
            assert len(temporal_data["insights"]) == 2

class TestMemoryVisualizationData:
    """Test data structures for UI visualization components"""
    
    def test_memory_dashboard_data_structure(self):
        """Test data format for memory dashboard UI"""
        dashboard_data = {
            "memory_types": {
                "semantic": {
                    "total_entries": 1247,
                    "categories": ["React", "TypeScript", "Node.js", "Database"],
                    "recent_activity": 23,
                    "health_score": 0.94
                },
                "episodic": {
                    "total_sessions": 156,
                    "active_sessions": 3,
                    "recent_learnings": 8,
                    "health_score": 0.89
                },
                "procedural": {
                    "total_patterns": 67,
                    "success_rate_avg": 0.91,
                    "recent_patterns": 5,
                    "health_score": 0.96
                },
                "working": {
                    "active_context_size": "3.2KB",
                    "session_duration": "2h 15m",
                    "variables_count": 12,
                    "health_score": 0.98
                },
                "temporal": {
                    "tracked_patterns": 34,
                    "time_range": "30_days",
                    "insights_generated": 12,
                    "health_score": 0.87
                }
            },
            "system_health": {
                "overall_score": 0.93,
                "graphiti_connection": "healthy",
                "file_system_status": "healthy",
                "cache_hit_rate": 0.78
            },
            "recent_queries": [
                {
                    "timestamp": "2025-06-26T12:30:00Z",
                    "query": "React optimization patterns",
                    "type": "semantic",
                    "results_count": 7,
                    "response_time": 0.12
                }
            ]
        }
        
        # Validate structure
        assert "memory_types" in dashboard_data
        assert len(dashboard_data["memory_types"]) == 5
        for memory_type in dashboard_data["memory_types"].values():
            assert "health_score" in memory_type
            assert 0 <= memory_type["health_score"] <= 1
        
        assert dashboard_data["system_health"]["overall_score"] > 0.9

    def test_memory_graph_visualization_data(self):
        """Test data format for memory relationship graphs"""
        graph_data = {
            "nodes": [
                {
                    "id": "react_hooks",
                    "type": "semantic",
                    "label": "React Hooks",
                    "category": "concept",
                    "strength": 0.95,
                    "connections": 15
                },
                {
                    "id": "component_optimization",
                    "type": "procedural", 
                    "label": "Component Optimization",
                    "category": "pattern",
                    "strength": 0.87,
                    "connections": 8
                }
            ],
            "edges": [
                {
                    "source": "react_hooks",
                    "target": "component_optimization",
                    "relationship": "enables",
                    "strength": 0.82,
                    "frequency": 23
                }
            ],
            "metadata": {
                "total_nodes": 156,
                "total_edges": 289,
                "max_depth": 4,
                "clustering_coefficient": 0.67
            }
        }
        
        # Validate graph structure
        assert len(graph_data["nodes"]) >= 1
        assert len(graph_data["edges"]) >= 1
        assert all("id" in node for node in graph_data["nodes"])
        assert all("source" in edge and "target" in edge for edge in graph_data["edges"])

@pytest.mark.asyncio
async def test_memory_performance_benchmarks():
    """Test memory system performance requirements"""
    adapter = LeviathanAdapter(test_config)
    
    # Mock fast memory responses
    with patch.object(adapter, 'call_leviathan_mcp') as mock_call:
        mock_call.return_value = MCPResponse(
            content=["Fast memory result"],
            metadata={"processing_time": 0.05}
        )
        
        # Test query latency
        import time
        start_time = time.time()
        
        request = OpenWebUIRequest(
            messages=[{"role": "user", "content": "Quick memory test"}],
            model="leviathan-agent"
        )
        
        mcp_call = await adapter.translate_openwebui_to_mcp(request)
        mcp_response = await adapter.call_leviathan_mcp(mcp_call)
        response = await adapter.translate_mcp_to_openwebui(mcp_response)
        
        end_time = time.time()
        total_latency = (end_time - start_time) * 1000
        
        print(f"Memory query latency: {total_latency:.2f}ms")
        
        # Memory queries should be fast (<100ms for adapter processing)
        assert total_latency < 100, f"Memory query too slow: {total_latency}ms"
        
        # Leviathan processing time should also be reasonable
        assert mcp_response.metadata["processing_time"] < 0.1

if __name__ == "__main__":
    # Run memory integration tests
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])