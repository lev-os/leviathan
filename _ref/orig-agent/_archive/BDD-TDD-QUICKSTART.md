# 🚀 BDD/TDD QUICKSTART GUIDE

*How to implement core features using our direct adapter pattern*

## 📋 **STEP-BY-STEP WORKFLOW**

### **1. Install Dependencies**
```bash
pnpm install
```

### **2. Run Your First BDD Test (It Will Fail)**
```bash
pnpm test:bdd -- tests/bdd/task-intent.test.js
```

Expected output:
```
FAIL tests/bdd/task-intent.test.js
  ✕ should classify implementation tasks correctly
  TypeError: adapter.createTask is not a function
```

### **3. Implement Using TDD**

#### **Step 3.1: Create Intent Classifier**
```javascript
// src/domain/services/intent-classifier.js
export class IntentClassifier {
  static classifyTaskIntent(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    // Simple keyword-based classification
    if (text.match(/implement|build|create|add|fix/)) {
      return {
        type: 'implementation',
        confidence: 0.8,
        context: this.extractImplementationContext(text)
      };
    }
    
    if (text.match(/research|compare|analyze|investigate/)) {
      return {
        type: 'research',
        confidence: 0.8,
        context: this.extractResearchContext(text)
      };
    }
    
    if (text.match(/plan|roadmap|strategy|organize/)) {
      return {
        type: 'planning',
        confidence: 0.8,
        context: this.extractPlanningContext(text)
      };
    }
    
    // Default fallback
    return {
      type: 'general',
      confidence: 0.5,
      context: {}
    };
  }
  
  static extractImplementationContext(text) {
    return {
      domain: this.detectDomain(text),
      complexity: this.assessComplexity(text),
      keywords: this.extractKeywords(text)
    };
  }
  
  // ... other methods
}
```

#### **Step 3.2: Update Task Domain Entity**
```javascript
// src/domain/task.js
import { IntentClassifier } from './services/intent-classifier.js';

export class Task {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title;
    this.description = data.description;
    
    // Add intent classification
    const intent = IntentClassifier.classifyTaskIntent(
      data.title, 
      data.description
    );
    
    this.intent_type = intent.type;
    this.intent_context = intent.context;
    this.intent_candidates = data.intent_candidates || [intent];
    
    // Existing fields
    this.workspace_id = data.workspace_id;
    this.confidence = data.confidence || intent.confidence;
    this.status = data.status || 'pending';
  }
  
  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

#### **Step 3.3: Implement in ClaudeCodeAdapter**
```javascript
// src/adapters/primary/claude-code-adapter.js
import { Task } from '../../domain/task.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';

export class ClaudeCodeAdapter {
  constructor() {
    this.workspaceService = container.get('WorkspaceService');
    this.tasksPath = '.kingly/tasks';
  }
  
  async createTask(params) {
    // Create domain entity
    const task = new Task(params);
    
    // Save to file system (YAML + MD)
    await this.saveTaskFiles(task);
    
    // Save to service (in-memory)
    await this.workspaceService.createTask(task);
    
    return task;
  }
  
  async saveTaskFiles(task) {
    const taskDir = join(this.tasksPath, task.id);
    await mkdir(taskDir, { recursive: true });
    
    // Save YAML metadata
    const yamlContent = yaml.dump({
      version: '1.0',
      id: task.id,
      intent: {
        type: task.intent_type,
        context: task.intent_context
      },
      metadata: {
        created: new Date().toISOString(),
        status: task.status,
        confidence: task.confidence
      },
      relationships: {
        workspace: task.workspace_id,
        dependencies: []
      }
    });
    
    await writeFile(join(taskDir, 'metadata.yaml'), yamlContent);
    
    // Save Markdown with intent-specific template
    const mdContent = this.generateMarkdownTemplate(task);
    await writeFile(join(taskDir, 'implementation.md'), mdContent);
  }
  
  generateMarkdownTemplate(task) {
    const templates = {
      implementation: `# ${task.title}

## Implementation Plan
<!-- Describe the implementation approach -->

## Technical Approach
<!-- Detail the technical solution -->

## Testing Strategy
<!-- Define how to test this -->

## Acceptance Criteria
- [ ] AC-1: ...
- [ ] AC-2: ...
`,
      research: `# ${task.title}

## Research Goals
<!-- What are we trying to learn? -->

## Options Analysis
<!-- Compare different approaches -->

## Recommendations
<!-- Based on research findings -->
`,
      planning: `# ${task.title}

## Objectives
<!-- What are we planning to achieve? -->

## Timeline
<!-- Key milestones and dates -->

## Success Metrics
<!-- How do we measure success? -->
`
    };
    
    return templates[task.intent_type] || templates.implementation;
  }
}
```

### **4. Run Tests Again**
```bash
pnpm test:bdd -- tests/bdd/task-intent.test.js --verbose
```

Now tests should start passing as you implement each feature!

### **5. Direct Testing During Development**

For rapid development, create a test harness:

```javascript
// tests/direct/intent-test.js
import { ClaudeCodeAdapter } from '../../src/adapters/primary/claude-code-adapter.js';

async function testIntentClassification() {
  const adapter = new ClaudeCodeAdapter();
  
  console.log('Testing intent classification...');
  
  const task = await adapter.createTask({
    title: "Implement user authentication",
    description: "Add JWT-based auth"
  });
  
  console.log('Intent:', task.intent_type);
  console.log('Context:', task.intent_context);
  console.log('Files created:', await adapter.getTaskFiles(task.id));
}

testIntentClassification().catch(console.error);
```

Run directly:
```bash
node tests/direct/intent-test.js
```

### **6. E2E Testing with MCP**

Once direct tests pass, validate via MCP:

```javascript
// tests/e2e/mcp-task-intent.test.js
import { MCPTestClient } from '../utils/mcp-test-client.js';

describe('Task Intent via MCP', () => {
  const client = new MCPTestClient();
  
  it('should classify intent through MCP protocol', async () => {
    const response = await client.callTool('createTask', {
      title: 'Implement authentication',
      description: 'JWT-based auth'
    });
    
    expect(response.content[0].text).toContain('implementation');
  });
});
```

## 🔧 **DESKTOP COMMANDER SHORTCUTS**

```bash
# Run specific test
DC: execute_command "pnpm test:bdd -- --testNamePattern='should classify implementation'"

# Quick validation
DC: execute_command "node -e \"import('./src/adapters/primary/claude-code-adapter.js').then(m => new m.ClaudeCodeAdapter().createTask({title:'Test'}).then(console.log))\""

# Watch mode for TDD
DC: execute_command "pnpm test:watch tests/bdd/task-intent.test.js"
```

## 📈 **PROGRESS TRACKING**

### **Intent-Driven Task Structure**
- [ ] Intent classification (AC-TASK-001)
- [ ] Context metadata (AC-TASK-002)  
- [ ] YAML/MD format (AC-TASK-003)
- [ ] Context-aware handling (AC-TASK-004)

### **Universal Context Architecture**
- [ ] Context loading (AC-UNIVERSAL-001)
- [ ] Context inheritance (AC-UNIVERSAL-002)
- [ ] Polymorphic types (AC-UNIVERSAL-003)
- [ ] Recursive fractals (AC-UNIVERSAL-004)
- [ ] Rule composition (AC-UNIVERSAL-005)

## 🎯 **NEXT IMMEDIATE STEPS**

1. **Install Jest**: `pnpm install`
2. **Run first test**: `pnpm test:bdd`
3. **See it fail** (expected!)
4. **Implement IntentClassifier**
5. **Make test pass**
6. **Refactor and improve**
7. **Move to next AC**

---

*Remember: Red → Green → Refactor. Let the tests drive your implementation!*