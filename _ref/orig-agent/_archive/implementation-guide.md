# 🛠️ Kingly Agent Implementation Guide

## 📋 Implementation Process

### Step 0: Refresh Memory
Follow the Kingly-specific refresh protocol in CLAUDE.md

### For Each Ticket:

1. **Load Implementation Context**
   - The specific impl ticket (docs/impl/###-*.md)
   - Referenced spec(s) from the ticket
   - Previous impl tickets if dependencies exist
   - Run Reality Check Protocol

2. **Verify Understanding**
   - Run Reality Check Protocol
   - Confirm LLM-first approach
   - Check context inheritance
   - Review acceptance criteria

3. **BDD/TDD Process**
   ```javascript
   // Step 1: Write BDD test from spec
   describe('Feature: ${feature}', () => {
     it('should ${acceptance_criteria}', async () => {
       // Given
       // When  
       // Then
     });
   });
   
   // Step 2: See it fail
   pnpm test:bdd
   
   // Step 3: Implement minimally
   // Step 4: See it pass
   // Step 5: Refactor if needed
   ```

4. **Direct Communication Pattern**
   ```javascript
   // For development speed, use ClaudeCodeAdapter
   class ClaudeCodeAdapter {
     async call(method, params) {
       // Direct LLM call, skip MCP protocol
       return await this.llm[method](params);
     }
   }
   
   // MCP only for e2e testing
   ```

5. **Progress Updates**
   - Update tracker.md checkbox when complete
   - Note any blockers or deviations
   - Commit with meaningful message

6. **Escalation Points**
   - Stuck for >30 minutes
   - Architecture question unclear
   - Spec ambiguity found
   - Test failing unexpectedly

## 🔧 Technical Standards

### File Structure
```
src/
├── domain/           # Entities & business logic
├── application/      # Use cases & services  
├── adapters/
│   ├── primary/      # MCP, CLI, API
│   └── secondary/    # Storage, external services
├── ports/            # Interfaces
└── infrastructure/   # Framework & config
```

### Coding Standards
```javascript
// Every file starts with purpose comment
/**
 * Universal Context Loader
 * Loads and manages context.yaml files with inheritance
 */

// Use ES modules
import { readFile } from 'fs/promises';

// Async/await everywhere
async function loadContext(path) {
  // Implementation
}

// Export what's needed
export { loadContext };
```

### Testing Standards
```javascript
// BDD for features
describe('Feature: Context Loading', () => {
  // Acceptance criteria as tests
});

// Unit tests for adapters
describe('ContextLoader', () => {
  // Technical implementation tests
});

// E2E for workflows
describe('Workflow: Chain of Thought', () => {
  // Full MCP integration tests
});
```

## 🚀 Bi-directional Implementation

### MCP Tool Pattern
```javascript
const tools = {
  // User-facing tool
  async startChainOfThought(params) {
    const state = await stateManager.create('chain_of_thought', params);
    return {
      instruction: "Break down the problem into steps",
      next_action: {
        tool: "submitThought",
        with: "your_decomposition"
      },
      state_id: state.id
    };
  },
  
  // Callback tool
  async submitThought(params) {
    const { state_id, thought } = params;
    const state = await stateManager.get(state_id);
    
    // Save thought
    state.thoughts.push(thought);
    
    // Determine next step
    const nextStep = workflow.getNextStep(state);
    
    return {
      instruction: nextStep.instruction,
      next_action: nextStep.action,
      state_id: state.id
    };
  }
};
```

### Workflow Engine Pattern
```javascript
class WorkflowEngine {
  async loadWorkflow(name) {
    // Load from workflows/${name}.yaml
    const yaml = await readFile(`workflows/${name}.yaml`);
    return parseYaml(yaml);
  }
  
  async executeStep(workflow, state) {
    const step = workflow.steps[state.current_step];
    
    // Parse meta language
    const instruction = this.parseTemplate(step.instruction, state);
    
    // Build response
    return {
      instruction,
      next_action: {
        tool: step.next_tool || 'continueWorkflow',
        with: step.capture || 'acknowledgment'
      }
    };
  }
}
```

## 📊 Success Criteria

Each implementation should:
1. ✅ Follow LLM-first principles
2. ✅ Use context inheritance
3. ✅ Implement bi-directional callbacks
4. ✅ Have BDD tests passing
5. ✅ Be committable to main branch

## 🔄 Workflow States

Track these in your implementation:
- `pending` - Not started
- `in_progress` - Currently working
- `blocked` - Need help
- `testing` - Writing/running tests
- `complete` - Ready to commit

## 💡 Quick Reference

### LLM-First Check
```javascript
// Before writing any logic, ask:
// "Can the LLM decide this?"
// If yes → MCP call
// If no → Why not?
```

### Context Check  
```javascript
// Before creating any entity:
// "What context does this inherit from?"
// "How does intent flow to here?"
```

### Bi-directional Check
```javascript
// For any complex reasoning:
// "Is this one big call or multiple focused calls?"
// "Where are the callback points?"
```

---
*Remember: The goal is 0% failure rate. When in doubt, re-read core principles.*