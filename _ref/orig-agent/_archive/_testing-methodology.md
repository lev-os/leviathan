# 🧪 TESTING METHODOLOGY

*How to properly test kingly-agent features to avoid simulation trap*

## 🎯 **TESTING PYRAMID FOR KINGLY-AGENT**

### **Unit Tests (70% of coverage)**
**What**: Test individual functions/classes in isolation
**When**: Every business logic function, domain entities, utilities
**Automation**: 100% automated, fast execution

**Examples**:
```javascript
// Domain entity validation
test('Task.isReadyForExecution() returns false when confidence < 0.8', () => {
  const task = new Task('title', 'desc', 'project');
  task.assessConfidence(0.7);
  expect(task.isReadyForExecution()).toBe(false);
});

// Workspace validation  
test('Workspace.isValidName() rejects names with slashes', () => {
  expect(Workspace.isValidName('my/workspace')).toBe(false);
});
```

### **Integration Tests (20% of coverage)**
**What**: Test how components work together
**When**: MCP tool calls, adapter integration, file system operations
**Automation**: 95% automated, moderate execution time

**Examples**:
```javascript
// MCP tool integration
test('create_workspace tool creates actual directory and .kingly entry', async () => {
  const result = await mcpAdapter.handleToolCall('create_workspace', {
    name: 'test-workspace', 
    path: '/tmp/test'
  });
  
  // Check both file system and memory
  expect(fs.existsSync('/tmp/test')).toBe(true);
  expect(result.workspace.name).toBe('test-workspace');
  
  // Cleanup
  fs.removeSync('/tmp/test');
});

// Project structure compliance
test('create_project creates folder structure per spec', async () => {
  await mcpAdapter.handleToolCall('create_project', {
    workspace: 'test-workspace',
    name: 'my-project'
  });
  
  // Check actual folder exists (not just JSON entry)
  expect(fs.existsSync(path.join(workspacePath, 'my-project/'))).toBe(true);
  expect(fs.existsSync(path.join(workspacePath, 'my-project/.project.yaml'))).toBe(true);
});
```

### **E2E Tests (10% of coverage)**
**What**: Test complete workflows through MCP protocol
**When**: Full user scenarios, cross-component workflows
**Automation**: 80% automated, slow execution

**Examples**:
```javascript
// Complete task workflow
test('confidence-based task splitting workflow', async () => {
  // 1. Create task with low confidence
  const task = await mcpCall('create_task', {
    title: 'Build payment system',
    confidence: 0.3
  });
  
  // 2. System should suggest splitting
  const assessment = await mcpCall('assess_task_confidence', {
    taskId: task.id,
    confidence: 0.3
  });
  expect(assessment.shouldSplit).toBe(true);
  
  // 3. Split task
  const split = await mcpCall('split_task', {
    taskId: task.id,
    subtasks: [/* ... */]
  });
  
  // 4. Verify subtasks created
  expect(split.subtasks.length).toBeGreaterThan(0);
  expect(split.subtasks.every(st => st.confidence > 0.8)).toBe(true);
});
```

## 🔧 **WHAT CAN WE REALISTICALLY AUTOMATE?**

### **100% Automated** ✅
- Unit tests (business logic, validation, calculations)
- File system operations (create/read/write/delete)
- JSON/YAML parsing and serialization
- MCP tool call responses
- Domain entity behavior
- Configuration loading

### **95% Automated** ⚠️
- Integration between components
- Database/persistence operations
- Process spawning (with mocks for Docker)
- Memory management
- Error handling and edge cases

### **80% Automated** ⚠️
- Docker container operations (need real Docker or good mocks)
- Background process management
- File watching and hot reload
- Network calls (Perplexity, external APIs)
- Cross-platform compatibility

### **Manual Testing Required** 🔴
- User experience workflows
- Performance under load  
- Real-world integration with Claude Code
- Visual verification of generated files
- Docker deployment in production environments

## 📝 **TEST FILE ORGANIZATION**

```
tests/
├── unit/                    # Fast, isolated tests
│   ├── domain/
│   │   ├── task.test.js
│   │   ├── workspace.test.js
│   │   └── project.test.js
│   ├── services/
│   │   └── workspace-service.test.js
│   └── utils/
│       └── validation.test.js
├── integration/            # Component interaction tests
│   ├── mcp-tools/
│   │   ├── workspace-tools.test.js
│   │   ├── task-tools.test.js
│   │   └── project-tools.test.js
│   ├── adapters/
│   │   ├── json-storage.test.js
│   │   └── process-adapter.test.js
│   └── persistence/
│       └── memory-management.test.js
├── e2e/                    # Full workflow tests
│   ├── task-lifecycle.test.js
│   ├── workspace-onboarding.test.js
│   └── confidence-splitting.test.js
└── fixtures/               # Test data
    ├── sample-workspaces/
    ├── sample-tasks/
    └── sample-projects/
```

## ⚡ **TESTING AUTOMATION PIPELINE**

### **Fast Feedback Loop** (< 30 seconds)
```bash
npm run test:unit          # Run all unit tests
npm run test:changed       # Only test changed files
npm run test:watch         # Watch mode for development
```

### **Integration Validation** (< 5 minutes)
```bash
npm run test:integration   # All integration tests
npm run test:mcp          # MCP tool-specific tests
npm run test:file-system  # File operations tests
```

### **Full Validation** (< 15 minutes)
```bash
npm run test:e2e          # End-to-end workflows
npm run test:all          # Everything
npm run test:coverage     # Coverage report
```

## 🎯 **ACCEPTANCE CRITERIA TESTING**

Each feature spec will have:

1. **Given/When/Then scenarios** that become integration tests
2. **Property-based tests** for validation rules  
3. **Contract tests** for MCP tool interfaces
4. **Regression tests** for previously broken functionality

**Example AC → Test mapping**:
```yaml
# Spec: Projects must be directories
acceptance_criteria:
  - Given a workspace exists
  - When I create a project named "my-app"  
  - Then a directory "my-app/" should exist in the workspace path
  - And a ".project.yaml" file should exist in that directory
  - And the project should appear in list_projects output

# Becomes this test:
test('AC: Projects must be directories', async () => {
  const workspace = await createTestWorkspace();
  const project = await mcpCall('create_project', {
    workspace: workspace.name,
    name: 'my-app'
  });
  
  expect(fs.existsSync(path.join(workspace.path, 'my-app/'))).toBe(true);
  expect(fs.existsSync(path.join(workspace.path, 'my-app/.project.yaml'))).toBe(true);
  
  const projects = await mcpCall('list_projects', { workspace: workspace.name });
  expect(projects.projects.find(p => p.name === 'my-app')).toBeDefined();
});
```

This methodology ensures we test **actual implementation against real specs**, not simulations against assumptions.