#!/usr/bin/env python3
"""
Memory Visualization Components for Open WebUI Integration
Generates UI-ready data structures for Leviathan's 5-type memory system
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

import httpx
from leviathan_adapter import LeviathanAdapter, LeviathanConfig, MCPToolCall, MCPResponse

class MemoryType(Enum):
    SEMANTIC = "semantic"
    EPISODIC = "episodic" 
    PROCEDURAL = "procedural"
    WORKING = "working"
    TEMPORAL = "temporal"

@dataclass
class MemoryNodeVisualization:
    """Data structure for memory graph nodes"""
    id: str
    type: MemoryType
    label: str
    content: str
    strength: float  # 0.0 to 1.0
    connections: int
    category: str
    created_at: str
    last_accessed: str
    access_count: int
    metadata: Dict[str, Any]

@dataclass
class MemoryEdgeVisualization:
    """Data structure for memory relationships"""
    source_id: str
    target_id: str
    relationship_type: str
    strength: float
    frequency: int
    created_at: str
    last_activated: str
    metadata: Dict[str, Any]

@dataclass
class MemoryDashboardData:
    """Complete dashboard data structure"""
    memory_types: Dict[str, Dict[str, Any]]
    system_health: Dict[str, Any]
    recent_queries: List[Dict[str, Any]]
    performance_metrics: Dict[str, Any]
    recommendations: List[str]

class MemoryVisualizer:
    """
    Generates visualization-ready data from Leviathan memory system
    """
    
    def __init__(self, adapter: LeviathanAdapter):
        self.adapter = adapter
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes
    
    async def get_memory_dashboard_data(self, session_id: Optional[str] = None) -> MemoryDashboardData:
        """
        Generate complete dashboard data for memory visualization
        """
        try:
            # Parallel queries for all memory types
            memory_queries = [
                self._query_memory_type(MemoryType.SEMANTIC, session_id),
                self._query_memory_type(MemoryType.EPISODIC, session_id),
                self._query_memory_type(MemoryType.PROCEDURAL, session_id),
                self._query_memory_type(MemoryType.WORKING, session_id),
                self._query_memory_type(MemoryType.TEMPORAL, session_id)
            ]
            
            memory_results = await asyncio.gather(*memory_queries, return_exceptions=True)
            
            # Process results
            memory_types = {}
            total_health = 0
            active_types = 0
            
            for i, result in enumerate(memory_results):
                memory_type = list(MemoryType)[i]
                if isinstance(result, Exception):
                    memory_types[memory_type.value] = self._get_error_memory_data(memory_type, str(result))
                else:
                    memory_types[memory_type.value] = result
                    if result.get("health_score", 0) > 0:
                        total_health += result["health_score"]
                        active_types += 1
            
            # System health calculation
            overall_health = total_health / active_types if active_types > 0 else 0
            
            # Recent queries (mock data for POC)
            recent_queries = await self._get_recent_memory_queries(session_id)
            
            # Performance metrics
            performance_metrics = await self._get_performance_metrics()
            
            # Recommendations
            recommendations = self._generate_recommendations(memory_types, performance_metrics)
            
            return MemoryDashboardData(
                memory_types=memory_types,
                system_health={
                    "overall_score": round(overall_health, 2),
                    "graphiti_connection": "healthy",
                    "file_system_status": "healthy", 
                    "neo4j_status": "connected",
                    "cache_hit_rate": performance_metrics.get("cache_hit_rate", 0.75),
                    "avg_response_time": performance_metrics.get("avg_response_time", 0.12)
                },
                recent_queries=recent_queries,
                performance_metrics=performance_metrics,
                recommendations=recommendations
            )
            
        except Exception as e:
            # Fallback dashboard with error state
            return self._get_fallback_dashboard_data(str(e))
    
    async def _query_memory_type(self, memory_type: MemoryType, session_id: Optional[str]) -> Dict[str, Any]:
        """Query specific memory type and return visualization data"""
        try:
            # Create memory query for this type
            mcp_call = MCPToolCall(
                name="query_memories",
                arguments={
                    "query": f"type:{memory_type.value}",
                    "query_type": memory_type.value,
                    "limit": 100,
                    "include_metadata": True
                },
                session_id=session_id
            )
            
            # Execute query through adapter
            response = await self.adapter.call_leviathan_mcp(mcp_call)
            
            if response.error:
                return self._get_error_memory_data(memory_type, response.error)
            
            # Process response based on memory type
            return self._process_memory_type_response(memory_type, response)
            
        except Exception as e:
            return self._get_error_memory_data(memory_type, str(e))
    
    def _process_memory_type_response(self, memory_type: MemoryType, response: MCPResponse) -> Dict[str, Any]:
        """Process memory query response for visualization"""
        content = response.content if isinstance(response.content, list) else [response.content]
        
        base_data = {
            "total_entries": len(content),
            "health_score": 0.85,  # Default healthy score
            "last_updated": datetime.utcnow().isoformat(),
            "response_time": response.metadata.get("processing_time", 0.1)
        }
        
        if memory_type == MemoryType.SEMANTIC:
            categories = set()
            confidence_scores = []
            
            for item in content:
                if isinstance(item, dict):
                    if "category" in item:
                        categories.add(item["category"])
                    if "confidence" in item:
                        confidence_scores.append(item["confidence"])
            
            base_data.update({
                "categories": list(categories)[:10],  # Top 10 categories
                "avg_confidence": sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.8,
                "unique_concepts": len(set(item.get("concept", "") for item in content if isinstance(item, dict))),
                "recent_activity": len([item for item in content if self._is_recent(item)])
            })
            
        elif memory_type == MemoryType.EPISODIC:
            sessions = set()
            outcomes = {"success": 0, "partial": 0, "failure": 0}
            
            for item in content:
                if isinstance(item, dict):
                    if "session_id" in item:
                        sessions.add(item["session_id"])
                    outcome = item.get("outcome", "unknown")
                    if "success" in outcome.lower():
                        outcomes["success"] += 1
                    elif "partial" in outcome.lower():
                        outcomes["partial"] += 1
                    elif "fail" in outcome.lower():
                        outcomes["failure"] += 1
            
            base_data.update({
                "total_sessions": len(sessions),
                "active_sessions": len([s for s in sessions if self._is_active_session(s)]),
                "success_rate": outcomes["success"] / max(sum(outcomes.values()), 1),
                "recent_learnings": len([item for item in content if self._has_learning(item)]),
                "outcome_distribution": outcomes
            })
            
        elif memory_type == MemoryType.PROCEDURAL:
            patterns = []
            success_rates = []
            
            for item in content:
                if isinstance(item, dict):
                    if "pattern_id" in item:
                        patterns.append(item["pattern_id"])
                    if "success_rate" in item:
                        success_rates.append(item["success_rate"])
            
            base_data.update({
                "total_patterns": len(set(patterns)),
                "avg_success_rate": sum(success_rates) / len(success_rates) if success_rates else 0.9,
                "recent_patterns": len([item for item in content if self._is_recent_pattern(item)]),
                "most_used_patterns": self._get_most_used_patterns(content)
            })
            
        elif memory_type == MemoryType.WORKING:
            if content and isinstance(content[0], dict):
                working_data = content[0]
                base_data.update({
                    "active_context_size": working_data.get("context_size", "N/A"),
                    "session_duration": working_data.get("session_duration", "N/A"), 
                    "variables_count": len(working_data.get("variables", {})),
                    "conversation_length": len(working_data.get("conversation_thread", [])),
                    "current_task": working_data.get("current_task", "None")
                })
            else:
                base_data.update({
                    "active_context_size": "0KB",
                    "session_duration": "0m",
                    "variables_count": 0,
                    "conversation_length": 0,
                    "current_task": "None"
                })
                
        elif memory_type == MemoryType.TEMPORAL:
            patterns = []
            events = []
            
            for item in content:
                if isinstance(item, dict):
                    if "pattern" in item:
                        patterns.append(item["pattern"])
                    if "events" in item:
                        events.extend(item["events"])
            
            base_data.update({
                "tracked_patterns": len(set(patterns)),
                "total_events": len(events),
                "time_range": "30_days",  # Default range
                "insights_generated": len([item for item in content if "insights" in item]),
                "pattern_strength": self._calculate_pattern_strength(content)
            })
        
        return base_data
    
    async def get_memory_graph_data(self, 
                                   center_concept: Optional[str] = None,
                                   max_nodes: int = 50,
                                   session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate graph visualization data for memory relationships
        """
        try:
            # Query for graph relationships
            mcp_call = MCPToolCall(
                name="get_memory_relationships", 
                arguments={
                    "center_concept": center_concept,
                    "max_nodes": max_nodes,
                    "include_strength": True,
                    "depth": 3
                },
                session_id=session_id
            )
            
            response = await self.adapter.call_leviathan_mcp(mcp_call)
            
            if response.error:
                return self._get_fallback_graph_data()
            
            # Process graph data
            return self._process_graph_response(response)
            
        except Exception as e:
            return self._get_fallback_graph_data(str(e))
    
    def _process_graph_response(self, response: MCPResponse) -> Dict[str, Any]:
        """Process graph response into visualization format"""
        content = response.content
        
        nodes = []
        edges = []
        
        if isinstance(content, dict):
            # Process nodes
            for node_data in content.get("nodes", []):
                node = MemoryNodeVisualization(
                    id=node_data.get("id", "unknown"),
                    type=MemoryType(node_data.get("type", "semantic")),
                    label=node_data.get("label", "Unknown"),
                    content=node_data.get("content", ""),
                    strength=node_data.get("strength", 0.5),
                    connections=node_data.get("connections", 0),
                    category=node_data.get("category", "general"),
                    created_at=node_data.get("created_at", datetime.utcnow().isoformat()),
                    last_accessed=node_data.get("last_accessed", datetime.utcnow().isoformat()),
                    access_count=node_data.get("access_count", 0),
                    metadata=node_data.get("metadata", {})
                )
                nodes.append(asdict(node))
            
            # Process edges
            for edge_data in content.get("edges", []):
                edge = MemoryEdgeVisualization(
                    source_id=edge_data.get("source", ""),
                    target_id=edge_data.get("target", ""),
                    relationship_type=edge_data.get("relationship", "related"),
                    strength=edge_data.get("strength", 0.5),
                    frequency=edge_data.get("frequency", 1),
                    created_at=edge_data.get("created_at", datetime.utcnow().isoformat()),
                    last_activated=edge_data.get("last_activated", datetime.utcnow().isoformat()),
                    metadata=edge_data.get("metadata", {})
                )
                edges.append(asdict(edge))
        
        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "max_depth": 3,
                "clustering_coefficient": self._calculate_clustering_coefficient(nodes, edges),
                "generated_at": datetime.utcnow().isoformat()
            }
        }
    
    # Helper methods
    def _is_recent(self, item: Dict[str, Any], hours: int = 24) -> bool:
        """Check if item is from recent timeframe"""
        if not isinstance(item, dict) or "timestamp" not in item:
            return False
        try:
            timestamp = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
            return (datetime.utcnow() - timestamp.replace(tzinfo=None)) < timedelta(hours=hours)
        except:
            return False
    
    def _is_active_session(self, session_id: str) -> bool:
        """Check if session is currently active"""
        # Mock implementation - in real system would check session status
        return len(session_id) > 10  # Simple heuristic
    
    def _has_learning(self, item: Dict[str, Any]) -> bool:
        """Check if episodic item contains learning"""
        return isinstance(item, dict) and "learning" in item and item["learning"]
    
    def _is_recent_pattern(self, item: Dict[str, Any]) -> bool:
        """Check if procedural pattern was used recently"""
        return self._is_recent(item, hours=168)  # Last week
    
    def _get_most_used_patterns(self, content: List[Dict[str, Any]]) -> List[str]:
        """Get most frequently used patterns"""
        pattern_usage = {}
        for item in content:
            if isinstance(item, dict) and "pattern_id" in item:
                usage = item.get("usage_count", 0)
                pattern_usage[item["pattern_id"]] = usage
        
        return sorted(pattern_usage.keys(), key=lambda x: pattern_usage[x], reverse=True)[:5]
    
    def _calculate_pattern_strength(self, content: List[Dict[str, Any]]) -> float:
        """Calculate overall pattern strength for temporal memory"""
        strengths = []
        for item in content:
            if isinstance(item, dict) and "strength" in item:
                strengths.append(item["strength"])
        return sum(strengths) / len(strengths) if strengths else 0.5
    
    def _calculate_clustering_coefficient(self, nodes: List[Dict], edges: List[Dict]) -> float:
        """Calculate graph clustering coefficient"""
        # Simplified calculation for POC
        if len(nodes) < 3:
            return 0.0
        
        total_possible_edges = len(nodes) * (len(nodes) - 1) / 2
        actual_edges = len(edges)
        
        return min(actual_edges / total_possible_edges, 1.0) if total_possible_edges > 0 else 0.0
    
    async def _get_recent_memory_queries(self, session_id: Optional[str]) -> List[Dict[str, Any]]:
        """Get recent memory queries for dashboard"""
        # Mock implementation for POC
        return [
            {
                "timestamp": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
                "query": "React optimization patterns",
                "type": "semantic",
                "results_count": 7,
                "response_time": 0.12
            },
            {
                "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
                "query": "Previous React session",
                "type": "episodic", 
                "results_count": 3,
                "response_time": 0.08
            }
        ]
    
    async def _get_performance_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        return {
            "cache_hit_rate": 0.78,
            "avg_response_time": 0.12,
            "total_queries_today": 156,
            "memory_usage": "2.3GB",
            "disk_usage": "45.2GB",
            "uptime": "7d 14h 23m"
        }
    
    def _generate_recommendations(self, memory_types: Dict, performance_metrics: Dict) -> List[str]:
        """Generate system recommendations"""
        recommendations = []
        
        # Check memory health scores
        for memory_type, data in memory_types.items():
            health = data.get("health_score", 0)
            if health < 0.8:
                recommendations.append(f"Consider optimizing {memory_type} memory - health score: {health:.2f}")
        
        # Check cache performance
        cache_hit_rate = performance_metrics.get("cache_hit_rate", 0)
        if cache_hit_rate < 0.7:
            recommendations.append(f"Cache hit rate low ({cache_hit_rate:.2f}) - consider increasing cache size")
        
        # Check response times
        response_time = performance_metrics.get("avg_response_time", 0)
        if response_time > 0.2:
            recommendations.append(f"Response time high ({response_time:.2f}s) - consider system optimization")
        
        return recommendations
    
    def _get_error_memory_data(self, memory_type: MemoryType, error: str) -> Dict[str, Any]:
        """Fallback data for memory type errors"""
        return {
            "total_entries": 0,
            "health_score": 0.0,
            "error": error,
            "status": "error",
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def _get_fallback_dashboard_data(self, error: str) -> MemoryDashboardData:
        """Fallback dashboard when system is unavailable"""
        return MemoryDashboardData(
            memory_types={
                "semantic": {"total_entries": 0, "health_score": 0.0, "status": "error"},
                "episodic": {"total_entries": 0, "health_score": 0.0, "status": "error"},
                "procedural": {"total_entries": 0, "health_score": 0.0, "status": "error"},
                "working": {"total_entries": 0, "health_score": 0.0, "status": "error"},
                "temporal": {"total_entries": 0, "health_score": 0.0, "status": "error"}
            },
            system_health={
                "overall_score": 0.0,
                "graphiti_connection": "error",
                "file_system_status": "error",
                "error": error
            },
            recent_queries=[],
            performance_metrics={"error": error},
            recommendations=[f"System error: {error}"]
        )
    
    def _get_fallback_graph_data(self, error: str = "Graph data unavailable") -> Dict[str, Any]:
        """Fallback graph when relationships unavailable"""
        return {
            "nodes": [],
            "edges": [],
            "metadata": {
                "total_nodes": 0,
                "total_edges": 0,
                "error": error,
                "generated_at": datetime.utcnow().isoformat()
            }
        }

# FastAPI endpoints for memory visualization
from fastapi import APIRouter, HTTPException, Query
from leviathan_adapter import adapter

memory_router = APIRouter(prefix="/v1/memory", tags=["memory"])

@memory_router.get("/dashboard")
async def get_memory_dashboard(session_id: Optional[str] = Query(None)):
    """Get complete memory dashboard data"""
    try:
        visualizer = MemoryVisualizer(adapter)
        dashboard_data = await visualizer.get_memory_dashboard_data(session_id)
        return asdict(dashboard_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

@memory_router.get("/graph")
async def get_memory_graph(
    center_concept: Optional[str] = Query(None),
    max_nodes: int = Query(50, ge=10, le=200),
    session_id: Optional[str] = Query(None)
):
    """Get memory relationship graph data"""
    try:
        visualizer = MemoryVisualizer(adapter)
        graph_data = await visualizer.get_memory_graph_data(center_concept, max_nodes, session_id)
        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph error: {str(e)}")

@memory_router.get("/types/{memory_type}")
async def get_memory_type_details(
    memory_type: str,
    session_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """Get detailed data for specific memory type"""
    try:
        if memory_type not in [t.value for t in MemoryType]:
            raise HTTPException(status_code=400, detail=f"Invalid memory type: {memory_type}")
        
        visualizer = MemoryVisualizer(adapter)
        memory_enum = MemoryType(memory_type)
        type_data = await visualizer._query_memory_type(memory_enum, session_id)
        return type_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Memory type error: {str(e)}")

if __name__ == "__main__":
    # Test memory visualizer
    import asyncio
    
    async def test_visualizer():
        config = LeviathanConfig()
        adapter = LeviathanAdapter(config)
        visualizer = MemoryVisualizer(adapter)
        
        print("Testing memory dashboard...")
        dashboard = await visualizer.get_memory_dashboard_data("test-session")
        print(f"Dashboard generated with {len(dashboard.memory_types)} memory types")
        print(f"Overall health: {dashboard.system_health['overall_score']}")
        
        print("\nTesting memory graph...")
        graph = await visualizer.get_memory_graph_data("React", max_nodes=20)
        print(f"Graph generated with {len(graph['nodes'])} nodes and {len(graph['edges'])} edges")
    
    asyncio.run(test_visualizer())