# How to Use Real MCP Agent - LLM-First Integration

## The Right Way: LLM-First with Bi-Directional Communication

### 1. Install Real MCP Agent

```bash
cd ~/lev/workshop/pocs/mcp-agent-integration
python -m venv venv
source venv/bin/activate
pip install mcp-agent
```

### 2. Use the Generated Context

The POC created a proper MCP orchestrator context at:
`~/c/agents/mcp-orchestrator/context.yaml`

This follows Lev's pattern where **contexts define behavior**, not code.

### 3. Real Implementation Pattern

```python
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from mcp_agent.workflows.orchestrator import Orchestrator
from mcp_agent.workflows.router import RouterLLM

# The LLM reads the context and understands the pattern
context = load_yaml("~/c/agents/mcp-orchestrator/context.yaml")

# The bi-directional flow from the context:
# 1. LLM → MCP Agent: Natural language intent
# 2. MCP Agent → System: Parse intent, load context, prepare workflow
# 3. System → LLM: Return workflow + callback instructions
# 4. LLM → Execute: Follow workflow with full autonomy
# 5. LLM → System Callback: Report results and request next step
# 6. System → Iterate: Save progress and guide next iteration

async def llm_first_execution(intent: str):
    """The LLM drives this, not the code"""
    
    # Step 1: LLM sends intent
    app = MCPApp(name="lev_bridge")
    
    async with app.run() as mcp_app:
        # Step 2: System prepares workflow
        orchestrator = Orchestrator()
        plan = await orchestrator.create_plan(intent)
        
        # Step 3: Return workflow to LLM
        # The LLM sees the plan and decides how to execute
        
        # Step 4: LLM executes with autonomy
        for step in plan.steps:
            # LLM decides which agent to create based on context
            agent = Agent(
                name=step.agent_name,
                instruction=step.instruction,
                server_names=step.required_servers
            )
            
            async with agent:
                # LLM executes the step
                result = await agent.execute(step)
                
                # Step 5: Callback with results
                # This goes back to the LLM for decision
                
        # Step 6: System guides next iteration
        # Based on results, suggest next steps
```

### 4. Integration with Lev's Systems

```python
# Connect to Lev's memory system
memory_agent = Agent(
    name="memory_bridge",
    instruction="Bridge MCP Agent with Lev's 5-type memory system",
    server_names=["filesystem"]
)

# The agent reads Lev's memory implementation
memory_docs = await memory_agent.call_tool(
    "filesystem.read_file",
    {"path": "~/lev/packages/memory/README.md"}
)

# LLM understands the memory types and creates bridge
bridge_code = await memory_agent.generate_str(
    f"Create a bridge between MCP Agent and this memory system: {memory_docs}"
)
```

### 5. The Key Difference

**Mock POC (Wrong)**:
- Created fake classes
- Hard-coded behavior
- No LLM reasoning
- No bi-directional flow

**Real Integration (Right)**:
- Uses actual MCP Agent
- LLM drives decisions
- Contexts define behavior
- True bi-directional communication

## Example: Real Bi-Directional Session

```
Human: "Analyze the MCP Agent codebase and integrate it with Lev"

Claude (using MCP Agent):
1. I'll use the MCP orchestrator context to guide my approach
2. Creating plan with Orchestrator...
3. Routing to filesystem agent to read MCP Agent code...
4. Found Router, Orchestrator, and Tool User patterns
5. Comparing with Lev's architecture...
6. Creating integration bridge...

[Actual MCP Agent execution happening]

Claude: Based on the analysis, here's the integration plan:
- MCP Agent provides production-ready patterns
- Lev provides sophisticated memory and context systems
- Bridge creates bi-directional flow between them

Shall I proceed with implementation?