"""
Integration Test Suite
Tests basic MCP Agent integration with Lev systems
"""

import asyncio
import pytest
import sys
import time
from pathlib import Path

# Add bridge to path
sys.path.append(str(Path(__file__).parent.parent / "bridge"))

from lev_mcp_bridge import LevMCPBridge, ConstitutionalMCPAgent

class TestIntegration:
    """Test basic integration functionality"""
    
    @pytest.fixture
    async def bridge(self):
        """Setup bridge for testing"""
        bridge = LevMCPBridge()
        await bridge.initialize()
        yield bridge
        await bridge.shutdown()
    
    @pytest.mark.asyncio
    async def test_bridge_initialization(self, bridge):
        """Test bridge initializes correctly"""
        assert bridge.mcp_app is not None
        assert bridge.memory_adapter is not None
        assert bridge.session_manager is not None
        assert bridge.session_manager.current_session_id is not None
        
    @pytest.mark.asyncio 
    async def test_agent_creation_speed(self, bridge):
        """Test agent creation meets speed requirements (<2s)"""
        start_time = time.time()
        
        agent = await bridge.create_lev_agent(
            name="speed_test_agent",
            server_names=["filesystem"],
            instruction="Test agent for speed validation"
        )
        
        creation_time = time.time() - start_time
        
        assert creation_time < 2.0, f"Agent creation took {creation_time:.2f}s (required: <2s)"
        assert agent is not None
        assert agent.name == "speed_test_agent"
        
    @pytest.mark.asyncio
    async def test_memory_integration(self, bridge):
        """Test memory system integration"""
        agent = await bridge.create_lev_agent(
            name="memory_test_agent",
            server_names=["filesystem"],
            instruction="Memory testing agent",
            memory_namespace="test_memory"
        )
        
        # Test memory storage
        await agent.lev_memory.store('semantic', 'test_key', 'test_value')
        
        # Test memory retrieval
        retrieved = await agent.lev_memory.retrieve('semantic', 'test_key')
        
        assert retrieved == 'test_value'
        assert agent.lev_memory.plugin_name == "test_memory"
        
    @pytest.mark.asyncio
    async def test_session_integration(self, bridge):
        """Test session management integration"""
        agent = await bridge.create_lev_agent(
            name="session_test_agent",
            server_names=["filesystem"],
            instruction="Session testing agent"
        )
        
        # Verify session ID is set
        assert agent.session_id is not None
        assert agent.session_id == bridge.session_manager.current_session_id
        
        # Test session persistence
        session_id = agent.session_id
        assert session_id.startswith("mcp-")
        
    @pytest.mark.asyncio
    async def test_constitutional_compliance(self, bridge):
        """Test constitutional compliance wrapper"""
        agent = await bridge.create_lev_agent(
            name="constitutional_test_agent",
            server_names=["filesystem"],
            instruction="Constitutional testing agent"
        )
        
        # Wrap with constitutional compliance
        constitutional_agent = ConstitutionalMCPAgent(agent)
        
        # Verify principles are set
        assert constitutional_agent.principles['optimal_neurochemical_state_first'] == True
        assert constitutional_agent.principles['bootstrap_sovereignty'] == True
        assert constitutional_agent.principles['progressive_disclosure'] == True
        
    @pytest.mark.asyncio 
    async def test_multiple_agent_coordination(self, bridge):
        """Test multiple agents can coordinate"""
        # Create multiple agents
        agent1 = await bridge.create_lev_agent(
            name="coordinator_agent_1",
            server_names=["filesystem"],
            instruction="First coordination agent",
            memory_namespace="coord_1"
        )
        
        agent2 = await bridge.create_lev_agent(
            name="coordinator_agent_2", 
            server_names=["filesystem"],
            instruction="Second coordination agent",
            memory_namespace="coord_2"
        )
        
        # Test they have different memory namespaces
        assert agent1.lev_memory.plugin_name == "coord_1"
        assert agent2.lev_memory.plugin_name == "coord_2"
        
        # Test they share the same session
        assert agent1.session_id == agent2.session_id
        
        # Test memory isolation
        await agent1.lev_memory.store('working', 'shared_key', 'agent1_value')
        await agent2.lev_memory.store('working', 'shared_key', 'agent2_value')
        
        value1 = await agent1.lev_memory.retrieve('working', 'shared_key')
        value2 = await agent2.lev_memory.retrieve('working', 'shared_key')
        
        assert value1 == 'agent1_value'
        assert value2 == 'agent2_value'
        
    @pytest.mark.asyncio
    async def test_error_handling(self, bridge):
        """Test error handling and graceful degradation"""
        # Test invalid memory type
        agent = await bridge.create_lev_agent(
            name="error_test_agent",
            server_names=["filesystem"],
            instruction="Error testing agent"
        )
        
        with pytest.raises(ValueError):
            await agent.lev_memory.store('invalid_memory_type', 'key', 'value')
            
        # Test retrieval of non-existent key
        result = await agent.lev_memory.retrieve('semantic', 'non_existent_key')
        assert result is None

# Performance test functions that can be run independently
async def benchmark_agent_creation():
    """Benchmark agent creation performance"""
    bridge = LevMCPBridge()
    await bridge.initialize()
    
    try:
        times = []
        for i in range(5):
            start = time.time()
            agent = await bridge.create_lev_agent(
                name=f"benchmark_agent_{i}",
                server_names=["filesystem"],
                instruction="Benchmark test agent"
            )
            times.append(time.time() - start)
            
        avg_time = sum(times) / len(times)
        max_time = max(times)
        
        print(f"Agent creation benchmark:")
        print(f"  Average: {avg_time:.3f}s")
        print(f"  Maximum: {max_time:.3f}s") 
        print(f"  Target: <2.000s")
        print(f"  Status: {'✅ PASS' if max_time < 2.0 else '❌ FAIL'}")
        
        return avg_time, max_time
        
    finally:
        await bridge.shutdown()

async def benchmark_memory_operations():
    """Benchmark memory operation performance"""
    bridge = LevMCPBridge()
    await bridge.initialize()
    
    try:
        agent = await bridge.create_lev_agent(
            name="memory_benchmark_agent",
            server_names=["filesystem"],
            instruction="Memory benchmark agent"
        )
        
        # Benchmark storage operations
        store_times = []
        for i in range(10):
            start = time.time()
            await agent.lev_memory.store('semantic', f'key_{i}', f'value_{i}')
            store_times.append(time.time() - start)
            
        # Benchmark retrieval operations  
        retrieve_times = []
        for i in range(10):
            start = time.time()
            await agent.lev_memory.retrieve('semantic', f'key_{i}')
            retrieve_times.append(time.time() - start)
            
        avg_store = sum(store_times) / len(store_times)
        avg_retrieve = sum(retrieve_times) / len(retrieve_times)
        
        print(f"Memory operations benchmark:")
        print(f"  Store average: {avg_store:.3f}s")
        print(f"  Retrieve average: {avg_retrieve:.3f}s")
        print(f"  Target: <1.000s each")
        print(f"  Status: {'✅ PASS' if max(avg_store, avg_retrieve) < 1.0 else '❌ FAIL'}")
        
        return avg_store, avg_retrieve
        
    finally:
        await bridge.shutdown()

if __name__ == "__main__":
    # Run benchmarks if called directly
    print("🧪 Running MCP Agent Integration Benchmarks")
    print("=" * 50)
    
    asyncio.run(benchmark_agent_creation())
    print()
    asyncio.run(benchmark_memory_operations())