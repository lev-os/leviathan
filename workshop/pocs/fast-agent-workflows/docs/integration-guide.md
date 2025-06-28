# Integration Guide: Fast-Agent Workflows in Leviathan

## Overview

This guide explains how to integrate fast-agent's workflow patterns into Leviathan's existing architecture.

## Architecture Alignment

### Leviathan's Hexagonal Architecture
```
Core SDK (Business Logic)
    ├── Agents
    ├── Sessions
    └── Discovery

Adapters (Interfaces)
    ├── CLI Adapter
    └── MCP Adapter
```

### Fast-Agent Workflow Integration Points
```
Core SDK Extension
    └── Workflows (NEW)
         ├── Chain
         ├── Orchestrator
         └── Evaluator

MCP Adapter Extension
    └── Workflow Tools (NEW)
         ├── workflow_chain
         ├── workflow_orchestrate
         └── workflow_refine
```

## Integration Steps

### 1. Install the POC
```bash
cd workshop/pocs/fast-agent-workflows
npm install
```

### 2. Register Workflows with Leviathan

In your Leviathan agent configuration:

```javascript
import { WorkflowEngine } from '@lev-os/fast-agent-workflows-poc';

// In your agent initialization
const workflowEngine = new WorkflowEngine(leviathanAgent);

// Register MCP tools
const workflowTools = workflowEngine.getMCPTools();
mcpServer.registerTools(workflowTools);
```

### 3. Use Workflows in Your Agents

#### Via MCP Tools
```javascript
// In your MCP tool calls
await agent.use_mcp_tool('workflow_chain', {
  sequence: ['agent1', 'agent2', 'agent3'],
  agents: { /* agent configs */ }
});
```

#### Direct API
```javascript
const result = await workflowEngine.execute('orchestrator', {
  objective: 'Research and analyze AI trends',
  agents: availableAgents
});
```

## Workflow Patterns

### Chain Workflow
- **Use Case**: Sequential processing through multiple agents
- **Example**: Research → Analyze → Report
- **Benefits**: Clear data flow, easy to debug

### Orchestrator Workflow
- **Use Case**: Complex tasks requiring dynamic planning
- **Example**: Multi-step project implementation
- **Benefits**: Adaptive execution, parallel processing

### Evaluator-Optimizer
- **Use Case**: Content that needs iterative refinement
- **Example**: Code generation with quality checks
- **Benefits**: Automatic quality improvement

## Session Integration

Workflows automatically integrate with Leviathan's session management:

```javascript
// Workflows create checkpoints automatically
const result = await workflowEngine.execute('chain', config);
// Session checkpoint created with workflow state

// Resume workflow from checkpoint
const session = await sessionManager.loadSession(sessionId);
const workflowState = session.getWorkflowState();
```

## Performance Considerations

1. **Workflow Overhead**: ~50-100ms per workflow initialization
2. **Agent Communication**: Use MCP tools for inter-agent communication
3. **Session Persistence**: Checkpoint after each major step
4. **Error Recovery**: Workflows include automatic retry logic

## Migration from 3-Tab System

### Current 3-Tab Pattern
```javascript
// Limited to 3 concurrent operations
const tabs = ['implementation', 'testing', 'research'];
```

### New Workflow Pattern
```javascript
// Unlimited agent orchestration
const workflow = await engine.execute('orchestrator', {
  objective: 'Complete feature implementation',
  agents: {
    implementation: { /* config */ },
    testing: { /* config */ },
    research: { /* config */ },
    documentation: { /* config */ },
    review: { /* config */ }
  }
});
```

## Best Practices

1. **Start Simple**: Begin with Chain workflows before Orchestrator
2. **Define Clear Objectives**: Orchestrator works best with specific goals
3. **Use Evaluator for Quality**: Add refinement loops for critical outputs
4. **Monitor Performance**: Track workflow execution times
5. **Checkpoint Frequently**: Enable recovery from failures

## Troubleshooting

### Common Issues

1. **Workflow Timeout**
   - Increase timeout in workflow config
   - Check individual agent performance

2. **Session Conflicts**
   - Ensure unique session IDs
   - Clear old sessions regularly

3. **MCP Tool Registration**
   - Verify tool names are unique
   - Check MCP server logs

## Next Steps

1. Run example workflows in `examples/`
2. Review performance benchmarks
3. Create custom workflow patterns
4. Submit feedback for production integration