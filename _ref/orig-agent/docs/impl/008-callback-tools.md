# Implementation Ticket: 008 - Callback Tools

## 📋 Overview
Implement the bi-directional callback pattern that allows MCP tools to instruct the LLM on next actions, creating a conversational flow.

## 🔗 References
- **Previous**: [007 - Context Assembly](007-context-assembly.md)
- **Spec**: Bi-directional MCP Pattern

## 🎯 Scope
Create callback tools that:
- Return instructions for the LLM
- Maintain conversational flow
- Support chained actions
- Handle error states gracefully

## ✅ Acceptance Criteria

### AC-008-1: Basic Callback Pattern
```yaml
Given: Tool that needs LLM to perform next action
When: Tool returns callback instructions
Then: Response includes _llm_instructions field
And: Instructions are clear and actionable
And: Context is preserved between calls
```

### AC-008-2: Chain Multiple Callbacks
```yaml
Given: Workflow requiring multiple steps
When: Each step completes
Then: Next instructions are provided
And: State persists across calls
And: Chain can be interrupted gracefully
```

### AC-008-3: Error Handling
```yaml
Given: Tool encounters error or edge case
When: Cannot complete requested action
Then: Returns helpful instructions for recovery
And: Suggests alternative approaches
And: Maintains positive user experience
```

### AC-008-4: Context Awareness
```yaml
Given: Callback with assembled context
When: Generating instructions
Then: Uses context to personalize response
And: References relevant rules/behaviors
And: Adapts tone to situation
```

## 🧪 Test Cases

### Unit Tests
1. **Basic callback** - Returns instructions correctly
2. **State preservation** - Context maintained
3. **Error instructions** - Helpful recovery guidance
4. **Context usage** - Instructions use context
5. **Instruction clarity** - Clear, actionable steps

### Integration Tests
1. **Multi-step workflow** - Complete chain works
2. **Error recovery** - Graceful degradation
3. **Context switching** - Different contexts work

## 💻 Implementation

### Callback Tool Base
```javascript
// src/application/callback-tools.js
export class CallbackTool {
  constructor(name, options = {}) {
    this.name = name;
    this.stateManager = options.stateManager;
    this.contextAssembler = options.contextAssembler;
  }
  
  async execute(params, mcpContext) {
    try {
      // Get or create state
      const state = await this.getOrCreateState(params, mcpContext);
      
      // Assemble context
      const context = await this.assembleContext(state, params);
      
      // Execute tool logic
      const result = await this.performAction(params, state, context);
      
      // Update state
      await this.updateState(state, result);
      
      // Generate callback response
      return this.createCallbackResponse(result, state, context);
      
    } catch (error) {
      // Generate error recovery instructions
      return this.createErrorResponse(error, params);
    }
  }
  
  async getOrCreateState(params, mcpContext) {
    // Check if this is continuation of existing flow
    const sessionId = params._sessionId || mcpContext.sessionId;
    
    if (sessionId) {
      const existing = await this.stateManager.get(sessionId);
      if (existing) return existing;
    }
    
    // Create new state
    return await this.stateManager.create(this.name, {
      params: params,
      started_at: Date.now()
    });
  }
  
  async assembleContext(state, params) {
    return await this.contextAssembler.assembleContext({
      currentContext: params.context || state.context || 'default',
      situation: {
        tool: this.name,
        state: state,
        params: params
      },
      intent: state.intent || params.intent
    });
  }
  
  // Subclasses implement this
  async performAction(params, state, context) {
    throw new Error('Subclass must implement performAction');
  }
  
  async updateState(state, result) {
    const updates = {
      ...state,
      lastAction: result.action,
      lastResult: result.data,
      updated_at: Date.now()
    };
    
    await this.stateManager.update(state.id, updates);
  }
  
  createCallbackResponse(result, state, context) {
    const response = {
      success: true,
      data: result.data,
      _meta: {
        sessionId: state.id,
        toolName: this.name,
        timestamp: Date.now()
      }
    };
    
    // Add LLM instructions if needed
    if (result.nextAction) {
      response._llm_instructions = this.formatInstructions(
        result.nextAction,
        state,
        context
      );
    }
    
    return response;
  }
  
  formatInstructions(nextAction, state, context) {
    // Use context to personalize instructions
    const tone = context.behavior_rules?.find(r => r.trigger === 'tone')?.action || 'professional';
    
    const templates = {
      professional: {
        continue: "Please proceed by calling {tool} with {params}",
        complete: "Task completed successfully. {summary}",
        choose: "Please select one of these options: {options}",
        error: "I encountered an issue: {error}. Try {suggestion}"
      },
      friendly: {
        continue: "Great! Now let's {action} by calling {tool} 😊",
        complete: "All done! 🎉 {summary}",
        choose: "What would you like to do next? {options}",
        error: "Oops, hit a snag: {error}. How about {suggestion}?"
      }
    };
    
    const template = templates[tone] || templates.professional;
    
    return this.interpolateTemplate(
      template[nextAction.type],
      nextAction.data
    );
  }
  
  interpolateTemplate(template, data) {
    return template.replace(/{(\w+)}/g, (match, key) => {
      return data[key] || match;
    });
  }
  
  createErrorResponse(error, params) {
    return {
      success: false,
      error: error.message,
      _llm_instructions: this.formatErrorInstructions(error, params)
    };
  }
  
  formatErrorInstructions(error, params) {
    // Intelligent error recovery
    const suggestions = this.generateSuggestions(error, params);
    
    return `I encountered an issue: ${error.message}

${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Would you like me to try one of these approaches?`;
  }
  
  generateSuggestions(error, params) {
    const suggestions = [];
    
    if (error.code === 'ENOENT') {
      suggestions.push('Create the missing file or directory first');
      suggestions.push('Check if the path is correct');
    } else if (error.code === 'EACCES') {
      suggestions.push('Check file permissions');
      suggestions.push('Try a different location');
    } else if (error.message.includes('timeout')) {
      suggestions.push('Try with a shorter timeout');
      suggestions.push('Break the operation into smaller steps');
    } else {
      suggestions.push('Try a different approach');
      suggestions.push('Provide more specific parameters');
    }
    
    return suggestions;
  }
}

// Example: Project Setup Tool
export class ProjectSetupTool extends CallbackTool {
  constructor(options) {
    super('project_setup', options);
  }
  
  async performAction(params, state, context) {
    const { projectName, projectType } = params;
    
    // Multi-step project setup
    if (!state.step) {
      // Step 1: Create project context
      await this.createProjectContext(projectName, projectType);
      
      return {
        action: 'contextCreated',
        data: { projectName },
        nextAction: {
          type: 'continue',
          data: {
            tool: 'project_setup',
            params: `{ "_sessionId": "${state.id}", "step": "structure" }`,
            action: 'create the project structure'
          }
        }
      };
    }
    
    if (state.step === 'structure') {
      // Step 2: Create directory structure
      await this.createStructure(projectName, projectType);
      
      return {
        action: 'structureCreated',
        data: { directories: ['src', 'tests', 'docs'] },
        nextAction: {
          type: 'continue',
          data: {
            tool: 'project_setup',
            params: `{ "_sessionId": "${state.id}", "step": "dependencies" }`,
            action: 'install dependencies'
          }
        }
      };
    }
    
    if (state.step === 'dependencies') {
      // Step 3: Install dependencies
      const deps = await this.installDependencies(projectType);
      
      return {
        action: 'setupComplete',
        data: { dependencies: deps },
        nextAction: {
          type: 'complete',
          data: {
            summary: `Project ${projectName} is ready! Created structure and installed ${deps.length} dependencies.`
          }
        }
      };
    }
  }
}

// Example: Complex Decision Tool
export class DecisionTool extends CallbackTool {
  constructor(options) {
    super('make_decision', options);
  }
  
  async performAction(params, state, context) {
    const { question, options } = params;
    
    if (!state.analysis) {
      // First call - analyze options
      const analysis = await this.analyzeOptions(question, options, context);
      
      state.analysis = analysis;
      
      return {
        action: 'analysisComplete',
        data: analysis,
        nextAction: {
          type: 'choose',
          data: {
            options: analysis.recommendations.map(r => 
              `Option ${r.index}: ${r.option} (${r.score}/10) - ${r.reason}`
            ).join('\n')
          }
        }
      };
    }
    
    // User made choice
    const choice = params.choice;
    const result = await this.implementChoice(choice, state.analysis);
    
    return {
      action: 'choiceImplemented',
      data: result,
      nextAction: {
        type: 'complete',
        data: {
          summary: `Implemented option ${choice}: ${result.summary}`
        }
      }
    };
  }
}
```

### Integration with MCP
```javascript
// src/adapters/mcp-callback-adapter.js
export function wrapToolsWithCallbacks(tools, dependencies) {
  const wrappedTools = {};
  
  for (const [name, toolDef] of Object.entries(tools)) {
    wrappedTools[name] = {
      description: toolDef.description,
      inputSchema: toolDef.inputSchema,
      handler: async (params, mcpContext) => {
        // Check if this is a callback tool
        if (toolDef.isCallback) {
          const callbackTool = new toolDef.implementation(dependencies);
          return await callbackTool.execute(params, mcpContext);
        }
        
        // Regular tool - wrap response to add instructions if needed
        const result = await toolDef.handler(params);
        
        // Check if tool wants to provide instructions
        if (result._nextAction) {
          result._llm_instructions = formatNextAction(result._nextAction);
        }
        
        return result;
      }
    };
  }
  
  return wrappedTools;
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/callback-tools.test.js
describe('CallbackTools', () => {
  let projectSetup;
  let mockStateManager;
  let mockContextAssembler;
  
  beforeEach(() => {
    mockStateManager = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn()
    };
    
    mockContextAssembler = {
      assembleContext: jest.fn()
    };
    
    projectSetup = new ProjectSetupTool({
      stateManager: mockStateManager,
      contextAssembler: mockContextAssembler
    });
  });
  
  it('should create initial callback response', async () => {
    mockStateManager.create.mockResolvedValue({
      id: 'test-session',
      params: { projectName: 'test-app' }
    });
    
    mockContextAssembler.assembleContext.mockResolvedValue({
      behavior_rules: []
    });
    
    const result = await projectSetup.execute({
      projectName: 'test-app',
      projectType: 'web'
    });
    
    expect(result.success).toBe(true);
    expect(result._llm_instructions).toContain('project_setup');
    expect(result._meta.sessionId).toBe('test-session');
  });
  
  it('should continue from existing session', async () => {
    const existingState = {
      id: 'test-session',
      step: 'structure'
    };
    
    mockStateManager.get.mockResolvedValue(existingState);
    mockContextAssembler.assembleContext.mockResolvedValue({});
    
    const result = await projectSetup.execute({
      _sessionId: 'test-session',
      step: 'structure'
    });
    
    expect(result._llm_instructions).toContain('dependencies');
  });
  
  it('should handle errors gracefully', async () => {
    mockStateManager.create.mockRejectedValue(
      new Error('Database connection failed')
    );
    
    const result = await projectSetup.execute({
      projectName: 'test-app'
    });
    
    expect(result.success).toBe(false);
    expect(result._llm_instructions).toContain('encountered an issue');
    expect(result._llm_instructions).toContain('Try');
  });
});
```

## 🔧 Dependencies
- Uses StateManager from ticket 002
- Uses ContextAssembler from ticket 007

## 📊 Effort Estimate
- Implementation: 3 hours
- Testing: 1.5 hours
- Total: 4.5 hours

## 🚀 Next Steps
After this ticket:
- 009: Workflow Execution with callbacks
- 010: Meta Language Parser

## 📝 Notes
- Callbacks create conversational flow
- State persistence enables multi-step
- Error handling maintains UX
- Context makes responses intelligent