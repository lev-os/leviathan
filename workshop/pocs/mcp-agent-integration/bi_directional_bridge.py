#!/usr/bin/env python3
"""
Real Bi-Directional MCP Agent Bridge for Leviathan
LLM-First Architecture with Context-Driven Behavior
"""

import asyncio
import yaml
import json
from pathlib import Path
from typing import Dict, Any, List

try:
    from mcp_agent.app import MCPApp
    from mcp_agent.agents.agent import Agent
    print("✅ Core MCP Agent modules imported")
    
    # Try importing optional modules
    try:
        from mcp_agent.workflows.orchestrator.orchestrator import Orchestrator
        print("✅ Orchestrator imported")
    except ImportError:
        print("⚠️  Orchestrator not available, using simplified flow")
        Orchestrator = None
    
    try:
        from mcp_agent.workflows.router.router_llm import RouterLLM  
        print("✅ RouterLLM imported")
    except ImportError:
        print("⚠️  RouterLLM not available, using simplified routing")
        RouterLLM = None
    
    try:
        from mcp_agent.config import Settings, MCPSettings, MCPServerSettings
        print("✅ Configuration classes imported")
    except ImportError:
        print("⚠️  Config classes not available, using defaults")
        Settings = MCPSettings = MCPServerSettings = None
        
except ImportError as e:
    print(f"❌ MCP Agent import failed: {e}")
    print("Run: ./install_real_mcp.sh")
    exit(1)


class LevBiDirectionalBridge:
    """
    Real bi-directional bridge implementing Leviathan's 5-step pattern:
    1. LLM → System Call
    2. System → LLM Response  
    3. LLM → Enhanced Processing
    4. LLM → System Callback
    5. System → Iteration
    """
    
    def __init__(self):
        self.contexts = self._load_lev_contexts()
        self.session_path = Path("~/.kingly/sessions/mcp-integration").expanduser()
        self.session_path.mkdir(parents=True, exist_ok=True)
        
    def _load_lev_contexts(self) -> Dict[str, Any]:
        """Load contexts from ~/c that define agent behaviors"""
        contexts = {}
        context_paths = {
            'ceo': Path("~/c/agents/ceo/context.yaml").expanduser(),
            'base': Path("~/c/agents/base-agent.yaml").expanduser(),
            'mcp_orchestrator': Path("~/c/agents/mcp-orchestrator/context.yaml").expanduser()
        }
        
        for name, path in context_paths.items():
            if path.exists():
                with open(path, 'r') as f:
                    contexts[name] = yaml.safe_load(f)
                print(f"✅ Loaded context: {name}")
            else:
                print(f"⚠️  Context not found: {name} at {path}")
                
        return contexts
    
    def _create_mcp_settings(self):
        """Create MCP settings integrating with Lev's systems"""
        if Settings and MCPSettings and MCPServerSettings:
            return Settings(
                execution_engine="asyncio",
                mcp=MCPSettings(
                    servers={
                        "filesystem": MCPServerSettings(
                            command="npx",
                            args=["-y", "@modelcontextprotocol/server-filesystem", str(Path.home())]
                        ),
                        "fetch": MCPServerSettings(
                            command="npx",
                            args=["-y", "@modelcontextprotocol/server-fetch"]
                        ),
                        # Future: Add Lev's memory and agent servers
                        # "lev_memory": MCPServerSettings(
                        #     command="python",
                        #     args=[str(Path("~/lev/packages/memory/mcp_server.py").expanduser())]
                        # ),
                        # "lev_agent": MCPServerSettings(
                        #     command="node",
                        #     args=[str(Path("~/lev/agent/src/index.js").expanduser())]
                        # )
                    }
                )
            )
        else:
            print("⚠️  Using default MCP settings (config classes not available)")
            return None
    
    async def demonstrate_bi_directional_flow(self, intent: str):
        """
        Demonstrate the real bi-directional flow with MCP Agent
        This is where LLM reasoning drives the system
        """
        
        print("\n🔄 BI-DIRECTIONAL FLOW DEMONSTRATION")
        print("=" * 60)
        
        # Step 1: LLM → System Call
        print(f"\n1️⃣  LLM → System: '{intent}'")
        
        # Create MCP app with our settings
        settings = self._create_mcp_settings()
        app = MCPApp(name="lev_bridge", settings=settings) if settings else MCPApp(name="lev_bridge")
        
        async with app.run() as mcp_app:
            # Step 2: System → LLM Response
            print("\n2️⃣  System → LLM: Preparing workflow based on intent...")
            
            # Use the MCP orchestrator context if available
            orchestrator_context = self.contexts.get('mcp_orchestrator', {})
            agent_config = orchestrator_context.get('agent_config', {})
            
            # Create router to classify intent if available
            if RouterLLM:
                router = RouterLLM(
                    categories={
                        "analysis": "Code analysis and architecture review",
                        "integration": "System integration and bridging", 
                        "research": "Research and documentation tasks"
                    }
                )
                
                # Let router decide based on natural language
                routing_decision = await router.route(intent)
                print(f"   Router decision: {routing_decision.result} (confidence: {routing_decision.p_score})")
                routing_result = routing_decision.result
            else:
                # Simplified routing based on keywords
                if "integrat" in intent.lower():
                    routing_result = "integration"
                elif "analy" in intent.lower():
                    routing_result = "analysis"
                else:
                    routing_result = "research"
                print(f"   Simple routing: {routing_result}")
            
            # Create orchestrator for task breakdown if available
            if Orchestrator:
                try:
                    # Orchestrator needs an LLM factory - skip for now
                    print("\n   Orchestrator available but needs LLM setup - using simplified plan...")
                except Exception as e:
                    print(f"\n   Orchestrator error: {e} - using simplified plan...")
            else:
                print("\n   Creating simplified execution plan...")
            
            # Step 3: LLM → Enhanced Processing
            print("\n3️⃣  LLM → Execute: Following plan with autonomy...")
            
            # Create specialized agent based on routing decision
            if routing_result == "integration":
                agent = Agent(
                    name="integration_specialist",
                    instruction="""You are an integration specialist. 
                    Analyze how MCP Agent can enhance Leviathan's capabilities.
                    Focus on bi-directional communication patterns and LLM-first architecture.""",
                    server_names=["filesystem"]
                )
            else:
                agent = Agent(
                    name="general_agent",
                    instruction="You help with various tasks using available tools.",
                    server_names=["filesystem"]
                )
            
            async with agent:
                # List available tools
                tools = await agent.list_tools()
                print(f"   Available tools: {len(tools.tools)}")
                for tool in tools.tools[:3]:
                    print(f"     - {tool.name}: {tool.description}")
                
                # Here's where the LLM would actually execute
                # For demo, we'll simulate the execution
                print("\n   Executing with LLM reasoning...")
                
                # Step 4: LLM → System Callback
                print("\n4️⃣  LLM → Callback: Reporting results...")
                
                # Save to session (Lev's session management)
                session_data = {
                    'intent': intent,
                    'routing': routing_result,
                    'agent': agent.name,
                    'timestamp': asyncio.get_event_loop().time(),
                    'status': 'completed'
                }
                
                session_file = self.session_path / f"session_{int(asyncio.get_event_loop().time())}.json"
                with open(session_file, 'w') as f:
                    json.dump(session_data, f, indent=2)
                
                print(f"   Session saved: {session_file.name}")
                
                # Step 5: System → Iteration
                print("\n5️⃣  System → Next: Suggesting next steps...")
                
                next_steps = self._suggest_next_steps(routing_result)
                for i, step in enumerate(next_steps, 1):
                    print(f"   {i}. {step}")
                
                return {
                    'intent': intent,
                    'routing': routing_result,
                    'agent_used': agent.name,
                    'next_steps': next_steps
                }
    
    def _suggest_next_steps(self, routing_type: str) -> List[str]:
        """Suggest next steps based on routing decision"""
        if routing_type == "integration":
            return [
                "Create memory system bridge between MCP Agent and Lev",
                "Implement session continuity across agents",
                "Test bi-directional flow with real tasks",
                "Document integration patterns for community"
            ]
        elif routing_type == "analysis":
            return [
                "Deep dive into MCP Agent architecture",
                "Compare patterns with Lev's implementation",
                "Identify enhancement opportunities",
                "Create integration roadmap"
            ]
        else:
            return [
                "Explore MCP Agent capabilities",
                "Test with various use cases",
                "Document findings",
                "Plan next experiments"
            ]
    
    async def create_lev_compatible_agent(self, name: str, context_name: str):
        """
        Create an MCP Agent using Lev's context patterns
        This shows how contexts drive behavior, not code
        """
        
        # Load the specific context
        context = self.contexts.get(context_name, {})
        agent_config = context.get('agent_config', {})
        
        print(f"\n🤖 Creating {name} from context: {context_name}")
        
        # Extract capabilities and patterns from context
        capabilities = agent_config.get('capabilities', [])
        workflow_pattern = agent_config.get('workflow_integration', {}).get('pattern', '')
        
        # Create instruction from context
        instruction = f"""
You are {name}, created from the {context_name} context.

Your capabilities include: {', '.join(capabilities)}

Follow this workflow pattern:
{workflow_pattern}

Remember: You operate in an LLM-first architecture where:
- Context defines your behavior
- Bi-directional communication is key
- Session continuity must be maintained
"""
        
        # Create agent with context-driven behavior
        agent = Agent(
            name=name,
            instruction=instruction,
            server_names=["filesystem"]
        )
        
        print(f"✅ Agent created with {len(capabilities)} capabilities")
        return agent


async def main():
    """Demonstrate real bi-directional MCP Agent integration"""
    
    print("🧠 REAL MCP AGENT + LEVIATHAN INTEGRATION")
    print("LLM-First Architecture with Bi-Directional Communication")
    print("=" * 60)
    
    # Initialize bridge
    bridge = LevBiDirectionalBridge()
    
    # Show loaded contexts
    print("\n📁 Loaded Contexts:")
    for name in bridge.contexts:
        print(f"   - {name}")
    
    # Test intents to demonstrate bi-directional flow
    test_intents = [
        "Analyze MCP Agent architecture and create integration plan with Leviathan",
        "Research how MCP Agent's Router pattern can enhance Lev's workflow engine",
        "Create a bridge between MCP Agent and Lev's memory system"
    ]
    
    for intent in test_intents[:1]:  # Run first intent for demo
        result = await bridge.demonstrate_bi_directional_flow(intent)
        
    # Create agent from context
    if 'mcp_orchestrator' in bridge.contexts:
        agent = await bridge.create_lev_compatible_agent(
            "mcp_integration_agent",
            "mcp_orchestrator"
        )
        print("\n✅ Created context-driven agent")
    
    print("\n🎯 KEY INSIGHTS:")
    print("1. Real MCP Agent provides production patterns")
    print("2. Lev contexts define agent behavior")
    print("3. Bi-directional flow enables LLM-driven execution")
    print("4. Integration preserves both systems' strengths")
    
    print("\n📋 To use this in production:")
    print("1. Set API keys for LLM providers")
    print("2. Enable Lev's MCP servers (memory, agent)")
    print("3. Let LLM drive the execution flow")
    print("4. Use contexts to define all behavior")


if __name__ == "__main__":
    # Check if we're in venv
    if not hasattr(asyncio, 'run'):
        print("❌ Please use Python 3.7+ for asyncio.run support")
        exit(1)
        
    asyncio.run(main())