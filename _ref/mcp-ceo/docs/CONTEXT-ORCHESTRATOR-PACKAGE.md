# Context Orchestrator - Core Package Design

## Vision
A standalone npm package for LLM-first context orchestration that can be consumed by:
- MCP-CEO (current project)
- Kingly Agent
- Any LLM-first system

## Package: `@llm-first/context-orchestrator`

### Core Responsibilities
1. **Context File Management** - Load .md/.yaml files from anywhere
2. **Dynamic Assembly** - Combine contexts using rules
3. **Workflow Orchestration** - Execute multi-step context flows
4. **Bidirectional Flow** - Context → LLM → New Context
5. **Session Persistence** - Track context evolution

### Clean API

```javascript
import { ContextOrchestrator } from '@llm-first/context-orchestrator';

// Initialize with config
const orchestrator = new ContextOrchestrator({
  contextRoot: './contexts',
  sessionStore: './sessions',
  assemblyRules: './rules.yaml'
});

// Execute a workflow
const session = await orchestrator.createSession();
const step1 = await orchestrator.executeStep('workflow.step', {
  sessionId: session.id,
  input: { challenge: 'How to scale?' }
});

// Get instructions for LLM
console.log(step1.instructions); // Full assembled context

// Process LLM response
await orchestrator.processResponse(session.id, step1.id, {
  response: 'LLM response here...'
});
```

### Package Structure

```
@llm-first/context-orchestrator/
├── src/
│   ├── ContextOrchestrator.js    # Main class
│   ├── ContextLoader.js          # File loading
│   ├── ContextAssembler.js       # Assembly logic
│   ├── SessionManager.js         # Persistence
│   └── RulesEngine.js            # Assembly rules
├── schemas/
│   ├── workflow.schema.yaml      # Workflow definition schema
│   ├── personality.schema.yaml   # Personality definition schema
│   └── rules.schema.yaml         # Assembly rules schema
└── examples/
    ├── simple-chatbot/           # Basic usage
    ├── multi-personality/        # Like MCP-CEO
    └── agent-system/             # Like Kingly

```

### How Projects Use It

#### MCP-CEO Integration
```javascript
// mcp-ceo/server.js
import { ContextOrchestrator } from '@llm-first/context-orchestrator';

class ArchitectOfAbundanceCEO {
  constructor() {
    this.orchestrator = new ContextOrchestrator({
      contextRoot: './contexts',
      config: './ceo-config.yaml'
    });
  }
  
  async executeWorkflowStep(workflow, step, sessionId, input) {
    return this.orchestrator.executeStep(`${workflow}.${step}`, {
      sessionId,
      input
    });
  }
}
```

#### Kingly Agent Integration
```javascript
// kingly/agent.js
import { ContextOrchestrator } from '@llm-first/context-orchestrator';

class KinglyAgent {
  constructor() {
    this.orchestrator = new ContextOrchestrator({
      contextRoot: './agent-contexts',
      config: './agent-config.yaml'
    });
  }
  
  async processTask(task) {
    // Use same orchestrator for different context style
    return this.orchestrator.executeStep('task.analysis', {
      input: task
    });
  }
}
```

### Key Benefits

1. **Separation of Concerns**
   - Core package: Context orchestration
   - MCP-CEO: Personality system implementation
   - Kingly: Agent system implementation

2. **Reusability**
   - Any project can use the same context orchestration
   - Consistent patterns across projects
   - Shared improvements benefit all

3. **Clean Testing**
   - Test orchestrator separately
   - Test implementations separately
   - Mock orchestrator for unit tests

4. **Evolution Path**
   - Start simple in MCP-CEO
   - Extract to package when stable
   - Enhance based on multiple use cases

### Migration Plan

1. **Phase 1**: Build in MCP-CEO (current)
2. **Phase 2**: Extract core classes to separate module
3. **Phase 3**: Create npm package
4. **Phase 4**: Refactor MCP-CEO to use package
5. **Phase 5**: Use in Kingly and other projects

This modular approach is exactly right - build the core context orchestration once, use it everywhere!