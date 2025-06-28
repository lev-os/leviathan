"""
Lev-MCP Bridge
Integrates MCP Agent with Leviathan's memory and session systems
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Dict, Optional, Any
import uuid

# Use mock implementation for POC
try:
    from mcp_agent.agents.agent import Agent
    from mcp_agent.app import MCPApp
except ImportError:
    # Fallback to mock implementation for POC testing
    try:
        from .mock_mcp_agent import Agent, MCPApp
    except ImportError:
        from mock_mcp_agent import Agent, MCPApp

class LevMemoryAdapter:
    """Adapter to connect MCP Agent with Lev's memory system"""
    
    def __init__(self, memory_path: str = "~/lev/packages/memory/"):
        self.memory_path = Path(memory_path).expanduser()
        self.plugin_memories = {}
    
    def create_plugin_memory(self, plugin_name: str) -> 'LevPluginMemory':
        """Create scoped memory for MCP agent (mimics Lev's plugin system)"""
        if plugin_name not in self.plugin_memories:
            self.plugin_memories[plugin_name] = LevPluginMemory(
                plugin_name=plugin_name,
                memory_path=self.memory_path / "plugins" / plugin_name
            )
        return self.plugin_memories[plugin_name]

class LevPluginMemory:
    """Plugin-scoped memory that integrates with Lev's memory architecture"""
    
    def __init__(self, plugin_name: str, memory_path: Path):
        self.plugin_name = plugin_name
        self.memory_path = memory_path
        self.memory_path.mkdir(parents=True, exist_ok=True)
        
        # Memory type files (following Lev's 5 memory types)
        self.procedural_file = memory_path / "procedural.json"
        self.semantic_file = memory_path / "semantic.json"
        self.episodic_file = memory_path / "episodic.json"
        self.working_file = memory_path / "working.json"
        self.temporal_file = memory_path / "temporal.json"
    
    async def store(self, memory_type: str, key: str, value: Any):
        """Store data in specified memory type"""
        file_map = {
            'procedural': self.procedural_file,
            'semantic': self.semantic_file,
            'episodic': self.episodic_file,
            'working': self.working_file,
            'temporal': self.temporal_file
        }
        
        if memory_type not in file_map:
            raise ValueError(f"Unknown memory type: {memory_type}")
            
        # Load existing data
        memory_file = file_map[memory_type]
        data = {}
        if memory_file.exists():
            with open(memory_file, 'r') as f:
                data = json.load(f)
        
        # Store new data
        data[key] = {
            'value': value,
            'timestamp': asyncio.get_event_loop().time(),
            'plugin': self.plugin_name
        }
        
        # Save back to file
        with open(memory_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    async def retrieve(self, memory_type: str, key: str) -> Optional[Any]:
        """Retrieve data from specified memory type"""
        file_map = {
            'procedural': self.procedural_file,
            'semantic': self.semantic_file, 
            'episodic': self.episodic_file,
            'working': self.working_file,
            'temporal': self.temporal_file
        }
        
        if memory_type not in file_map:
            return None
            
        memory_file = file_map[memory_type]
        if not memory_file.exists():
            return None
            
        with open(memory_file, 'r') as f:
            data = json.load(f)
            
        return data.get(key, {}).get('value')

class LevSessionManager:
    """Session manager that integrates with Kingly session system"""
    
    def __init__(self, sessions_path: str = "~/.kingly/sessions/"):
        self.sessions_path = Path(sessions_path).expanduser()
        self.sessions_path.mkdir(parents=True, exist_ok=True)
        self.current_session_id = None
    
    def create_session(self, context: str = "mcp_agent_session") -> str:
        """Create new session (mimics Kingly session creation)"""
        session_id = f"mcp-{uuid.uuid4().hex[:8]}"
        session_dir = self.sessions_path / session_id
        session_dir.mkdir(exist_ok=True)
        
        # Create session metadata
        session_meta = {
            'session_id': session_id,
            'context': context,
            'created_at': asyncio.get_event_loop().time(),
            'type': 'mcp_agent_session'
        }
        
        with open(session_dir / 'meta.json', 'w') as f:
            json.dump(session_meta, f, indent=2)
            
        self.current_session_id = session_id
        return session_id
    
    def get_current_session(self) -> Optional[str]:
        """Get current session ID"""
        return self.current_session_id

class LevMCPBridge:
    """Main bridge connecting MCP Agent with Lev ecosystem"""
    
    def __init__(self, config_path: str = "setup/mcp_config.yaml"):
        self.config_path = config_path
        self.memory_adapter = LevMemoryAdapter()
        self.session_manager = LevSessionManager()
        self.mcp_app = None
        self.agents = {}
    
    async def initialize(self):
        """Initialize the bridge and MCP app"""
        # Create MCP app
        self.mcp_app = MCPApp(name="lev_mcp_bridge")
        
        # Start session for this bridge instance
        session_id = self.session_manager.create_session("lev_mcp_bridge_session")
        print(f"🔗 Lev-MCP Bridge initialized with session: {session_id}")
        
        return self
    
    async def create_lev_agent(
        self, 
        name: str, 
        server_names: list, 
        instruction: str,
        memory_namespace: Optional[str] = None
    ) -> Agent:
        """Create MCP Agent integrated with Lev systems"""
        
        if not self.mcp_app:
            raise RuntimeError("Bridge not initialized. Call initialize() first.")
        
        # Create MCP Agent
        agent = Agent(
            name=name,
            instruction=instruction,
            server_names=server_names
        )
        
        # Connect to Lev memory system
        memory_ns = memory_namespace or f"mcp-{name}"
        agent.lev_memory = self.memory_adapter.create_plugin_memory(memory_ns)
        
        # Connect to session system
        agent.session_id = self.session_manager.current_session_id
        
        # Store agent reference
        self.agents[name] = agent
        
        print(f"🤖 Created Lev-integrated agent: {name}")
        return agent
    
    async def run_agent_context(self, agent: Agent):
        """Run agent in MCP app context"""
        async with self.mcp_app.run() as agent_app:
            async with agent:
                yield agent
    
    async def shutdown(self):
        """Clean shutdown of bridge"""
        print("🔌 Shutting down Lev-MCP Bridge...")
        # Could add cleanup logic here
        self.agents.clear()

# Constitutional compliance wrapper
class ConstitutionalMCPAgent:
    """Wrapper ensuring MCP agents follow Lev's constitutional principles"""
    
    def __init__(self, agent: Agent):
        self.agent = agent
        self.principles = {
            'optimal_neurochemical_state_first': True,
            'bootstrap_sovereignty': True,
            'progressive_disclosure': True,
            'recursive_excellence': True,
            'economic_empowerment': True,
            'multi_verse_scaling': True
        }
    
    async def generate_str(self, message: str, **kwargs) -> str:
        """Generate response with constitutional validation"""
        # Pre-processing: Apply neurochemical optimization
        optimized_message = self._optimize_message(message)
        
        # Generate response through MCP agent
        response = await self.agent.generate_str(optimized_message, **kwargs)
        
        # Post-processing: Validate constitutional compliance
        validated_response = self._validate_response(response)
        
        # Store in episodic memory for learning
        await self.agent.lev_memory.store(
            'episodic', 
            f'interaction_{asyncio.get_event_loop().time()}',
            {
                'input': message,
                'output': validated_response,
                'constitutional_compliance': True
            }
        )
        
        return validated_response
    
    def _optimize_message(self, message: str) -> str:
        """Apply neurochemical optimization to input"""
        # Simulate neurochemical optimization
        # In real implementation, this would apply Lev's optimization patterns
        return f"[OPTIMIZED] {message}"
    
    def _validate_response(self, response: str) -> str:
        """Validate response against constitutional principles"""
        # Simulate constitutional validation
        # In real implementation, this would check against Lev's principles
        return response

# Export main classes
__all__ = [
    'LevMCPBridge',
    'LevMemoryAdapter', 
    'LevSessionManager',
    'ConstitutionalMCPAgent'
]