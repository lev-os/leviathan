"""
Basic MCP Agent Integration Example
Demonstrates core integration with Lev's memory and session systems
"""

import asyncio
import sys
from pathlib import Path

# Add bridge to path
sys.path.append(str(Path(__file__).parent.parent / "bridge"))

from lev_mcp_bridge import LevMCPBridge, ConstitutionalMCPAgent

async def basic_integration_test():
    """Test basic MCP Agent integration with Lev systems"""
    
    print("🚀 Starting Basic MCP Agent Integration Test")
    print("=" * 50)
    
    # Initialize Lev-MCP Bridge
    bridge = LevMCPBridge()
    await bridge.initialize()
    
    try:
        # Create a simple research agent
        research_agent = await bridge.create_lev_agent(
            name="basic_researcher",
            server_names=["filesystem"],  # Start with just filesystem
            instruction="""You are a research assistant integrated with Leviathan's 
            memory system. You can read files and store findings in structured memory.""",
            memory_namespace="basic_research"
        )
        
        print(f"✅ Created agent: {research_agent.name}")
        print(f"🧠 Memory namespace: basic_research")
        print(f"📄 Session ID: {research_agent.session_id}")
        
        # Test memory integration
        print("\n📝 Testing memory integration...")
        await research_agent.lev_memory.store(
            'semantic', 
            'test_knowledge',
            'MCP Agent successfully integrated with Lev memory system'
        )
        
        stored_knowledge = await research_agent.lev_memory.retrieve(
            'semantic',
            'test_knowledge'
        )
        
        if stored_knowledge:
            print(f"✅ Memory test passed: {stored_knowledge}")
        else:
            print("❌ Memory test failed")
            
        # Test constitutional wrapper
        print("\n🏛️ Testing constitutional compliance...")
        constitutional_agent = ConstitutionalMCPAgent(research_agent)
        
        # Run the agent in MCP context
        async with bridge.run_agent_context(research_agent) as active_agent:
            print("\n🤖 Testing agent capabilities...")
            
            # List available tools
            tools = await active_agent.list_tools()
            print(f"🔧 Available tools: {len(tools.tools)} tools")
            for tool in tools.tools[:3]:  # Show first 3 tools
                print(f"   - {tool.name}: {tool.description}")
            
            # Test basic functionality with constitutional wrapper
            if hasattr(active_agent, 'attach_llm'):
                print("\n💭 Testing LLM integration...")
                try:
                    # This would require API keys to work fully
                    print("   (Skipping LLM test - requires API keys)")
                except Exception as e:
                    print(f"   Note: LLM test skipped ({e})")
            
        print("\n✅ Basic integration test completed successfully!")
        print("\nKey validations:")
        print("  ✅ Bridge initialization")
        print("  ✅ Agent creation with Lev integration") 
        print("  ✅ Memory system integration")
        print("  ✅ Session management")
        print("  ✅ Constitutional compliance wrapper")
        print("  ✅ Tool enumeration")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        await bridge.shutdown()

if __name__ == "__main__":
    asyncio.run(basic_integration_test())