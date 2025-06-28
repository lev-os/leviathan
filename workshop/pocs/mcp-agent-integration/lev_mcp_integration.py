
# Real MCP Agent + Lev Integration
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from pathlib import Path
import yaml

class LevMCPIntegration:
    """Real integration using MCP Agent with Lev's patterns"""
    
    def __init__(self):
        # Load Lev contexts
        self.contexts = self.load_contexts()
        
        # Initialize MCP App
        self.app = MCPApp(
            name="leviathan_bridge",
            settings=self.create_settings()
        )
    
    def load_contexts(self):
        """Load contexts from ~/c"""
        contexts = {}
        context_dir = Path("~/c/agents").expanduser()
        for yaml_file in context_dir.glob("*/context.yaml"):
            with open(yaml_file) as f:
                contexts[yaml_file.parent.name] = yaml.safe_load(f)
        return contexts
    
    def create_settings(self):
        """Create MCP settings with Lev's servers"""
        return Settings(
            mcp=MCPSettings(
                servers={
                    "filesystem": MCPServerSettings(
                        command="npx",
                        args=["-y", "@modelcontextprotocol/server-filesystem", "/"]
                    ),
                    "lev_memory": MCPServerSettings(
                        command="python",
                        args=[str(Path("~/lev/packages/memory/mcp_server.py").expanduser())]
                    ),
                    "lev_agent": MCPServerSettings(
                        command="node",
                        args=[str(Path("~/lev/agent/src/index.js").expanduser())]
                    )
                }
            )
        )
    
    async def bi_directional_execute(self, intent: str):
        """Execute with bi-directional flow"""
        async with self.app.run() as mcp_app:
            # Create agent based on intent and context
            agent = Agent(
                name="lev_integrated_agent",
                instruction=self.contexts["ceo"]["agent_config"]["instruction"],
                server_names=["filesystem", "lev_memory", "lev_agent"]
            )
            
            async with agent:
                # The 5-step bi-directional flow happens here
                # 1. LLM sends intent (already have it)
                # 2. System prepares (agent is ready)
                # 3. LLM executes
                result = await agent.generate_str(intent)
                # 4. Callback (result is ready)
                # 5. Next iteration based on result
                
                return result
