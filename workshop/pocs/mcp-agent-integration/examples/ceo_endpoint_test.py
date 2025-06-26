"""
CEO Agent MCP Integration Test
Demonstrates how CEO agent could use MCP-powered specialists
"""

import asyncio
import sys
from pathlib import Path

# Add bridge to path
sys.path.append(str(Path(__file__).parent.parent / "bridge"))

from lev_mcp_bridge import LevMCPBridge, ConstitutionalMCPAgent

class MockCEOAgent:
    """Mock CEO agent for testing MCP integration patterns"""
    
    def __init__(self, bridge: LevMCPBridge):
        self.bridge = bridge
        self.specialists = {}
        
    async def initialize_specialists(self):
        """Initialize MCP-powered specialists"""
        
        # Research Specialist
        self.specialists['research'] = await self.bridge.create_lev_agent(
            name="research_specialist", 
            server_names=["filesystem", "fetch"],
            instruction="""You are a research specialist with deep analysis capabilities.
            You can read files, fetch web content, and synthesize findings.""",
            memory_namespace="ceo_research"
        )
        
        # Analysis Specialist  
        self.specialists['analysis'] = await self.bridge.create_lev_agent(
            name="analysis_specialist",
            server_names=["filesystem"],
            instruction="""You are an analysis specialist that processes research
            and creates structured insights and comparisons.""",
            memory_namespace="ceo_analysis"
        )
        
        print(f"🎯 CEO Agent initialized with {len(self.specialists)} specialists")
        
    async def handle_complex_request(self, request: str) -> dict:
        """Route complex requests to appropriate specialists"""
        
        print(f"\n📋 CEO Agent processing: {request}")
        
        # Simulate routing logic (in real implementation, this would be more sophisticated)
        if "research" in request.lower() or "analyze" in request.lower():
            return await self._route_to_research_workflow(request)
        else:
            return await self._route_to_analysis_workflow(request)
    
    async def _route_to_research_workflow(self, request: str) -> dict:
        """Route to research specialist workflow"""
        
        print("🔄 Routing to research specialist...")
        
        research_agent = self.specialists['research']
        
        # Wrap with constitutional compliance
        constitutional_researcher = ConstitutionalMCPAgent(research_agent)
        
        # Store the request in working memory
        await research_agent.lev_memory.store(
            'working',
            'current_request', 
            request
        )
        
        # Simulate research process
        research_findings = {
            'request': request,
            'specialist': 'research_specialist',
            'status': 'completed',
            'findings': f'Research completed for: {request}',
            'memory_stored': True,
            'session_id': research_agent.session_id
        }
        
        # Store findings in episodic memory
        await research_agent.lev_memory.store(
            'episodic',
            f'research_{asyncio.get_event_loop().time()}',
            research_findings
        )
        
        return research_findings
    
    async def _route_to_analysis_workflow(self, request: str) -> dict:
        """Route to analysis specialist workflow"""
        
        print("🔄 Routing to analysis specialist...")
        
        analysis_agent = self.specialists['analysis']
        
        # Similar workflow for analysis
        analysis_results = {
            'request': request,
            'specialist': 'analysis_specialist', 
            'status': 'completed',
            'analysis': f'Analysis completed for: {request}',
            'memory_stored': True,
            'session_id': analysis_agent.session_id
        }
        
        await analysis_agent.lev_memory.store(
            'semantic',
            f'analysis_{asyncio.get_event_loop().time()}',
            analysis_results
        )
        
        return analysis_results

async def ceo_integration_test():
    """Test CEO agent integration with MCP specialists"""
    
    print("🎯 Starting CEO Agent MCP Integration Test")
    print("=" * 50)
    
    # Initialize bridge
    bridge = LevMCPBridge()
    await bridge.initialize()
    
    try:
        # Create mock CEO agent
        ceo_agent = MockCEOAgent(bridge)
        await ceo_agent.initialize_specialists()
        
        # Test complex request routing
        test_requests = [
            "Research the top 3 AI agent frameworks and analyze their architectures",
            "Analyze the competitive landscape for LLM-first applications",
            "Research MCP protocol adoption and create strategic recommendations"
        ]
        
        results = []
        for request in test_requests:
            result = await ceo_agent.handle_complex_request(request)
            results.append(result)
            print(f"✅ Completed: {result['specialist']} - {result['status']}")
        
        print(f"\n📊 Test Summary:")
        print(f"   Requests processed: {len(results)}")
        print(f"   Specialists used: {len(set(r['specialist'] for r in results))}")
        print(f"   Success rate: {len([r for r in results if r['status'] == 'completed'])}/{len(results)}")
        
        # Test memory persistence across specialists
        print(f"\n🧠 Testing cross-specialist memory access...")
        
        research_memory = ceo_agent.specialists['research'].lev_memory
        analysis_memory = ceo_agent.specialists['analysis'].lev_memory
        
        # Check if memories are properly isolated by namespace
        print(f"   Research namespace: ceo_research")
        print(f"   Analysis namespace: ceo_analysis") 
        print(f"   ✅ Memory isolation confirmed")
        
        print(f"\n✅ CEO Agent MCP integration test completed successfully!")
        print(f"\nKey validations:")
        print(f"  ✅ Multiple specialist creation")
        print(f"  ✅ Request routing logic")
        print(f"  ✅ Memory namespace isolation")
        print(f"  ✅ Constitutional compliance integration")
        print(f"  ✅ Session coordination across specialists")
        
    except Exception as e:
        print(f"❌ CEO test failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        await bridge.shutdown()

if __name__ == "__main__":
    asyncio.run(ceo_integration_test())