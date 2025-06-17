# ADR-012: FlowMind MCP Server Architecture
## src/index.js - FlowMind-First MCP Implementation

## Status
**PROPOSED** - New architecture for v0.1.0 (2025-01-08)

## Context
We need a new MCP server (src/index.js) that implements FlowMind-first architecture, replacing the legacy server.js which uses hardcoded configurations. The new server will use Context Registry for boot-time compilation and Context Assembler for runtime recipe assembly.

### Current Problem
- **server.js**: Hardcoded personalities, legacy workflows.yaml
- **Architectural debt**: Encourages hallucinations due to static configs
- **Performance issues**: Runtime loading, no pre-compilation

### Target Architecture
```
Boot: Registry.scan() → Pre-compile all contexts
Runtime: Registry.getContext() + Assembler.assemble() → Fast responses
```

## Decision
Build a new FlowMind-first MCP server that uses the Context Registry for boot-time compilation and provides clean bidirectional flow through context switching.

## Architecture

### Server Startup (src/index.js)
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createContextRegistry } from './context-registry.js'
import { ContextAssembler } from './context-assembler.js'

class FlowMindMCPServer {
  constructor() {
    this.registry = null
    this.assembler = null
    this.sessions = new Map()
  }

  async initialize() {
    console.log('🚀 FlowMind MCP Server - Initializing...')
    
    // 1. Boot-time compilation
    this.registry = createContextRegistry()
    const stats = await this.registry.scan()
    
    console.log(`✅ Compiled ${stats.total} contexts:`)
    console.log(`   - Agents: ${stats.byType.agent || 0}`)
    console.log(`   - Workflows: ${stats.byType.workflow || 0}`)
    console.log(`   - Patterns: ${stats.byType.pattern || 0}`)
    
    // 2. Create assembler with registry
    this.assembler = new ContextAssembler(this.registry)
    
    console.log('🎯 FlowMind MCP Server - Ready for bidirectional flow')
    return true
  }
}
```

### MCP Tool Definitions
```javascript
const TOOLS = [
  {
    name: 'architect_of_abundance',
    description: 'FlowMind-powered CEO analysis with context switching',
    inputSchema: {
      type: 'object',
      properties: {
        challenge: {
          type: 'string',
          description: 'Challenge to analyze'
        },
        workflow_request: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            step: { type: 'number' },
            session_id: { type: 'string' },
            previous_results: { type: 'object' }
          }
        }
      },
      required: ['challenge']
    }
  },
  {
    name: 'execute_workflow',
    description: 'Execute FlowMind workflow with context switching',
    inputSchema: {
      type: 'object',
      properties: {
        workflow_id: { type: 'string' },
        step: { type: 'number' },
        session_id: { type: 'string' },
        challenge: { type: 'string' },
        previous_results: { type: 'object' }
      },
      required: ['workflow_id', 'step', 'challenge']
    }
  },
  {
    name: 'list_workflows',
    description: 'List all available FlowMind workflows',
    inputSchema: { type: 'object', properties: {} }
  }
]
```

### Bidirectional Flow Implementation
```javascript
class FlowMindMCPServer {
  async handleExecuteWorkflow({ workflow_id, step, session_id, challenge, previous_results }) {
    // 1. Get pre-compiled workflow context (O(1) lookup)
    const workflow = this.registry.getContext(workflow_id)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflow_id}`)
    }

    // 2. Get step configuration
    const stepConfig = workflow.steps[step - 1]
    if (!stepConfig) {
      throw new Error(`Step ${step} not found in workflow ${workflow_id}`)
    }

    // 3. Build recipe for this step
    const recipe = {
      base: stepConfig.context || `agent://${stepConfig.agent}`,
      mix: stepConfig.additional_contexts || [],
      memory: session_id ? `memory://session/${session_id}/step-${step-1}` : null,
      validation: workflow.validation?.context
    }

    // 4. Assemble context for LLM
    const assembledContext = await this.assembler.assemble(recipe)

    // 5. Create context injection for LLM
    return this.createContextInjection(assembledContext, stepConfig, workflow, step)
  }

  createContextInjection(assembledContext, stepConfig, workflow, step) {
    return {
      content: [{
        type: 'text',
        text: this.buildPrompt(assembledContext, stepConfig)
      }],
      workflow: {
        id: workflow.id,
        name: workflow.name,
        current_step: step,
        total_steps: workflow.steps.length,
        step_name: stepConfig.name
      },
      context_injection: {
        system_prompt: assembledContext.system_prompt,
        step_instructions: stepConfig.prompt,
        active_context: assembledContext.metadata?.name,
        constraints: [
          'Reduce stress in every response',
          'Ensure bootstrap sovereignty',
          'Build on previous analysis'
        ]
      },
      callback_info: {
        next_step: step + 1,
        session_id: this.getOrCreateSession(workflow.id),
        workflow_complete: step >= workflow.steps.length
      }
    }
  }
}
```

### Session Management
```javascript
class SessionManager {
  constructor() {
    this.sessions = new Map()
    this.sessionTimeout = 30 * 60 * 1000 // 30 minutes
  }

  getOrCreateSession(workflowId) {
    const sessionId = `${workflowId}-${Date.now()}-${this.randomId()}`
    const session = {
      id: sessionId,
      workflow_id: workflowId,
      created_at: new Date(),
      last_active: new Date(),
      steps_completed: [],
      accumulated_insights: []
    }
    
    this.sessions.set(sessionId, session)
    this.scheduleCleanup(sessionId)
    
    return sessionId
  }

  updateSession(sessionId, stepResult) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.last_active = new Date()
      session.steps_completed.push(stepResult)
      if (stepResult.insights) {
        session.accumulated_insights.push(...stepResult.insights)
      }
    }
  }
}
```

### Tool Handler Implementation
```javascript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'execute_workflow':
        return await mcpServer.handleExecuteWorkflow(args)
        
      case 'architect_of_abundance':
        if (args.workflow_request) {
          // Workflow mode - multi-step analysis
          return await mcpServer.handleExecuteWorkflow({
            workflow_id: args.workflow_request.type,
            step: args.workflow_request.step || 1,
            session_id: args.workflow_request.session_id,
            challenge: args.challenge,
            previous_results: args.workflow_request.previous_results
          })
        } else {
          // Single-shot mode - direct CEO analysis
          return await mcpServer.handleCEOAnalysis(args.challenge, args.context)
        }
        
      case 'list_workflows':
        const workflows = mcpServer.registry.getContextsByType('workflow')
        return {
          content: [{
            type: 'text',
            text: mcpServer.formatWorkflowList(workflows)
          }]
        }
        
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    }
  }
})
```

## Key Features

### Boot-time Performance
- Context Registry scans and compiles all contexts at startup
- Schema validation with Zod ensures type safety
- O(1) context lookup at runtime
- Sub-second startup for 100+ contexts

### Runtime Performance  
- No file I/O during MCP requests
- Pre-compiled FlowMind instances
- Fast recipe assembly (< 20ms)
- Efficient session management

### Bidirectional Flow
- Context switching per workflow step
- LLM receives assembled context for deep reasoning
- Previous step results integrated into next context
- Session continuity across workflow steps

### Error Handling
```javascript
class FlowMindMCPServer {
  async safeExecute(operation) {
    try {
      return await operation()
    } catch (error) {
      console.error('FlowMind Error:', error)
      
      if (error.name === 'ContextValidationError') {
        return this.createValidationErrorResponse(error)
      } else if (error.name === 'ContextLoadError') {
        return this.createLoadErrorResponse(error)
      } else {
        return this.createGenericErrorResponse(error)
      }
    }
  }
}
```

## Implementation Plan

### Phase 1: Core Server (Week 1)
- [ ] Create src/index.js with FlowMind integration
- [ ] Implement boot-time compilation
- [ ] Add basic tool handlers
- [ ] Test with existing contexts

### Phase 2: Bidirectional Flow (Week 1)
- [ ] Implement workflow execution
- [ ] Add session management
- [ ] Context assembly integration
- [ ] Step-by-step context switching

### Phase 3: Polish (Week 2)
- [ ] Error handling and validation
- [ ] Performance optimization
- [ ] Logging and debugging
- [ ] Migration from server.js

## Success Criteria

- Boot time < 500ms for all contexts
- Runtime tool responses < 100ms
- All workflow types supported
- Session management working
- Clean bidirectional flow
- Zero hardcoded configurations

## Migration Strategy

### Gradual Migration
1. **Build new server alongside old** (src/index.js + server.js)
2. **Test with existing contexts** (validate compatibility)
3. **Switch MCP endpoint** (update startup script)
4. **Deprecate server.js** (move to archive/)

### Compatibility Testing
- All existing workflows must work
- Same MCP tool interface
- Session format compatibility
- Performance equal or better

## Key Principles

1. **FlowMind-First** - Registry and Assembler at core
2. **Boot-time Compilation** - No runtime loading delays
3. **Clean Architecture** - Clear separation of concerns
4. **Performance Focus** - Sub-100ms responses
5. **Forward Compatible** - Ready for v0.2.0 instruction sets

---

**This ADR defines the new FlowMind-first MCP server that replaces legacy hardcoded configurations with dynamic context assembly and bidirectional flow.**