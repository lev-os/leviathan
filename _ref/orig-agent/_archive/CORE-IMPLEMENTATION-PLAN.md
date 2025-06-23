# 🚀 CORE LAYER IMPLEMENTATION PLAN

*BDD/TDD approach with direct Claude Code integration*

## 📊 **EXECUTIVE SUMMARY**

We'll implement the core layer using a **direct adapter pattern** for development speed, with MCP for e2e testing only. Each component follows BDD acceptance criteria with TDD implementation.

## 🎯 **KEY INSIGHTS**

### **Development Approach**
```yaml
development:
  primary: ClaudeCodeAdapter (direct method calls)
  testing: BDD specs → TDD implementation → e2e verification
  deployment: MCP server for production

benefits:
  - 10-100x faster development cycles
  - Direct debugging with stack traces
  - BDD drives implementation
  - e2e validates MCP protocol
```

## 📋 **IMPLEMENTATION ORDER**

### **Phase 1: Universal Context Foundation** (Week 1)

#### **1.1 Intent-Driven Task Structure**
```yaml
acceptance_criteria: AC-TASK-001 to AC-TASK-004
dependencies: none
approach:
  - BDD: Write tests for each AC first
  - TDD: Implement Task entity changes
  - Direct: Use ClaudeCodeAdapter for rapid iteration
  - e2e: Verify via MCP after implementation
```

**BDD Test Example**:
```javascript
// tests/bdd/task-intent.test.js
describe('AC-TASK-001: Task Intent Classification', () => {
  it('should classify task intent on creation', async () => {
    // Given: task creation request
    const taskRequest = {
      title: "Implement user authentication",
      workspace_id: "project-123"
    };
    
    // When: task is created via direct adapter
    const task = await claudeAdapter.createTask(taskRequest);
    
    // Then: intent is classified
    expect(task.intent_type).toBe('implementation');
    expect(task.intent_context).toMatchObject({
      domain: 'security',
      complexity: 'medium',
      dependencies: ['user-model', 'session-management']
    });
  });
});
```

**Implementation Steps**:
1. Create `IntentClassifier` service
2. Update `Task` domain entity with intent fields
3. Modify `WorkspaceService.createTask()` to classify intent
4. Add YAML/MD file generation

#### **1.2 Universal Context Architecture**
```yaml
acceptance_criteria: AC-UNIVERSAL-001 to AC-UNIVERSAL-005
dependencies: yaml parser, file system
approach:
  - BDD: Test context loading, inheritance, composition
  - TDD: Build context registry incrementally
  - Direct: Fast context assembly via adapter
  - e2e: Validate full context cascade
```

**BDD Test Example**:
```javascript
// tests/bdd/universal-context.test.js
describe('AC-UNIVERSAL-002: Context Inheritance', () => {
  it('should cascade context properties', async () => {
    // Given: nested context structure
    const contexts = {
      'base': { theme: 'dark', lang: 'en' },
      'workspace': { extends: 'base', project: 'kingly' },
      'task': { extends: 'workspace', priority: 'high' }
    };
    
    // When: task context is resolved
    const resolved = await contextEngine.resolve('task');
    
    // Then: inherited properties cascade
    expect(resolved).toMatchObject({
      theme: 'dark',      // from base
      lang: 'en',         // from base
      project: 'kingly',  // from workspace
      priority: 'high'    // from task
    });
  });
});
```

### **Phase 2: Memory & Intelligence** (Week 2)

#### **2.1 Memory MVP Integration**
```yaml
acceptance_criteria: AC-MEM-001 to AC-MEM-005
dependencies: universal context, Ultimate MCP
approach:
  - BDD: Test hybrid routing logic
  - TDD: Build adapters for each storage type
  - Direct: Memory operations via ClaudeCode
  - e2e: Verify Ultimate MCP integration
```

**Direct Adapter Usage**:
```javascript
// Direct memory operations during development
const memory = await claudeAdapter.memory.search({
  query: "user authentication patterns",
  type: "semantic"  // routes to Ultimate MCP
});

// vs file-based for speed
const recent = await claudeAdapter.memory.getRecent({
  type: "episodic",  // routes to file storage
  limit: 10
});
```

#### **2.2 Agent as Context Pattern**
```yaml
acceptance_criteria: AC-AGENT-001 to AC-AGENT-006
dependencies: universal context
approach:
  - BDD: Test agent loading as contexts
  - TDD: Build agent registry and assembly
  - Direct: Rapid agent endpoint testing
  - e2e: Full agent protocol validation
```

### **Phase 3: Advanced Systems** (Week 3)

#### **3.1 Meta-Language System**
```yaml
acceptance_criteria: AC-META-001 to AC-META-003
dependencies: universal context, rule engines
approach:
  - BDD: Test multi-format rule parsing
  - TDD: Plugin architecture for parsers
  - Direct: Fast rule evaluation cycles
  - e2e: Complex rule chain validation
```

## 🧪 **TESTING STRATEGY**

### **1. BDD Test Structure**
```
tests/
├── bdd/                    # Acceptance criteria tests
│   ├── task-intent.test.js
│   ├── universal-context.test.js
│   ├── memory-mvp.test.js
│   └── agent-context.test.js
├── unit/                   # TDD unit tests
│   ├── intent-classifier.test.js
│   ├── context-engine.test.js
│   └── memory-router.test.js
└── e2e/                    # MCP protocol tests
    ├── mcp-task-flow.test.js
    └── mcp-context-cascade.test.js
```

### **2. Test Execution Flow**
```yaml
development_cycle:
  1_write_bdd: "Write BDD test for acceptance criteria"
  2_run_fail: "Verify test fails (red)"
  3_implement: "Use ClaudeCodeAdapter for rapid development"
  4_pass_bdd: "Make BDD test pass (green)"
  5_refactor: "Clean up implementation"
  6_e2e_test: "Validate via MCP server"
```

### **3. Direct vs MCP Testing**
```javascript
// Development: Direct adapter for speed
describe('Quick Development Tests', () => {
  const adapter = new ClaudeCodeAdapter();
  
  it('should create task instantly', async () => {
    const task = await adapter.createTask({ title: 'Test' });
    expect(task.id).toBeDefined();
  });
});

// e2e: MCP server for protocol validation
describe('MCP Protocol Tests', () => {
  const client = new MCPTestClient();
  
  it('should handle MCP task creation', async () => {
    const response = await client.callTool('createTask', {
      title: 'Test'
    });
    expect(response.content[0].text).toContain('Created task');
  });
});
```

## 🔧 **DEVELOPMENT WORKFLOW**

### **1. Claude Code Integration**
```javascript
// .kingly/claude-dev.js
import { ClaudeCodeAdapter } from './src/adapters/primary/claude-code-adapter.js';
import { WorkspaceService } from './src/application/workspace-service.js';

// Direct access for Claude Code
export const kingly = {
  // Task operations
  createTask: (params) => adapter.createTask(params),
  assessConfidence: (taskId) => adapter.assessTaskConfidence(taskId),
  
  // Context operations
  loadContext: (name) => adapter.loadContext(name),
  resolveContext: (name) => adapter.resolveContext(name),
  
  // Memory operations  
  search: (query) => adapter.memory.search(query),
  store: (data) => adapter.memory.store(data)
};
```

### **2. Desktop Commander Usage**
```bash
# Direct execution via Desktop Commander
DC: execute_command "node -e \"require('./.kingly/claude-dev.js').kingly.createTask({title: 'Test task'})\""

# Run BDD tests
DC: execute_command "pnpm test -- tests/bdd/task-intent.test.js"

# Quick validation
DC: execute_command "node tests/direct/validate-context.js"
```

## 📈 **SUCCESS METRICS**

### **Development Speed**
- [ ] BDD test → implementation: <30 min per AC
- [ ] Direct adapter calls: <10ms response time
- [ ] Hot reload for context changes
- [ ] Immediate feedback loops

### **Test Coverage**
- [ ] 100% of acceptance criteria have BDD tests
- [ ] 90%+ unit test coverage
- [ ] All MCP tools have e2e tests
- [ ] Integration tests for context cascade

### **Architecture Quality**
- [ ] Clean separation of concerns maintained
- [ ] No business logic in adapters
- [ ] Consistent error handling
- [ ] Audit trail for all operations

## 🚦 **NEXT STEPS**

1. **Set up BDD test framework** (Jest + custom matchers)
2. **Create ClaudeCodeAdapter** ✅ (already done)
3. **Write first BDD test** for AC-TASK-001
4. **Implement IntentClassifier** with TDD
5. **Validate via e2e MCP test**

---

*This plan enables rapid development with direct method calls while maintaining architectural integrity and comprehensive testing.*