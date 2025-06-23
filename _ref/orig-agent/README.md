# Kingly Agent System

**LLM-First AI Agent System with Fast Task Management & Confidence-Based Splitting**

## 🎯 Philosophy

**"Can an LLM do this?"** - If yes, we don't write JavaScript for it.

This system provides **fast MCP tools** for LLMs to:
- Route requests intelligently via agent capabilities
- Assess task confidence and split complex tasks automatically  
- Manage workspace context and task persistence
- Execute tasks only when confidence ≥ 80%

## 🚀 Quick Start

```javascript
import { KinglyAgent } from '@aiforge/kingly-agent';

const agent = new KinglyAgent();

// LLM creates complex task
await agent.createTask(
  'Build e-commerce platform', 
  'Full e-commerce with auth, catalog, cart, payments'
);

// LLM assesses confidence (30% - too complex)
await agent.assessTaskConfidence(taskId, 0.3, factors, reasoning);

// LLM splits into smaller tasks
await agent.splitTask(taskId, reason, [
  { title: 'Setup database', confidence: 0.85 },
  { title: 'Implement auth', confidence: 0.9 },
  // ... more subtasks
]);

// LLM executes high-confidence tasks
await agent.executeTask(subtaskId, 'dev', approach);
```

## 🧠 LLM-Driven Task Splitting

The core innovation: **LLM handles ALL complexity assessment and splitting logic**

### Confidence Flow
1. **LLM creates task** → `create_task(title, description)`
2. **LLM assesses confidence** → `assess_task_confidence(taskId, 0.3, factors)`
3. **If confidence < 80%** → `split_task(taskId, subtasks)`  
4. **Recursive splitting** → Until all tasks ≥ 80% confidence
5. **Execute ready tasks** → `execute_task(taskId, agent)`

### Example Splitting Chain
```
"Build e-commerce platform" (30% confidence)
├── "Setup infrastructure" (85% ✅ ready)
├── "Implement authentication" (90% ✅ ready)  
├── "Build product catalog" (80% ✅ ready)
├── "Create shopping cart" (75% ❌ split further)
│   ├── "Design cart API" (90% ✅ ready)
│   ├── "Build cart UI" (85% ✅ ready)
│   └── "Implement checkout" (80% ✅ ready)
└── "Integrate payments" (85% ✅ ready)
```

## 🔧 MCP Tools for LLMs

### Core Routing
- `get_route_table()` - Get agents, capabilities, routing guidance

### Task Management  
- `create_task(title, description, project)` - Create new task
- `assess_task_confidence(taskId, confidence, factors)` - Rate 0-1 confidence
- `split_task(taskId, subtasks)` - Split when confidence < 80%
- `execute_task(taskId, agent)` - Execute high-confidence tasks
- `get_task(taskId)` - Get task details
- `list_tasks(project, status)` - List and filter tasks

### Memory & Context
- `remember_context(key, value, category)` - Store context
- `recall_context(key)` - Retrieve context  
- `get_workspace_state()` - Get workspace statistics

## 📊 Fast Task Management

**Ported from agent-mcp for production speed:**

- ✅ **Fast persistence** - JSON storage, no SQL overhead
- ✅ **Task hierarchy** - Parent tasks → subtasks → sub-subtasks
- ✅ **Context preservation** - Task context flows through splits
- ✅ **Workspace memory** - Persistent state across sessions
- ✅ **Progress tracking** - Status, confidence, agent assignment

## 🧪 Testing

### Test Confidence Splitting
```bash
node test-confidence-splitting.js
```

Expected output:
```
🧪 Testing LLM-Driven Confidence-Based Task Splitting...
1️⃣ Creating complex task...
✅ Created task: "Build complete e-commerce platform"
2️⃣ LLM assesses task confidence...
🎯 Assessed confidence: 30% - split_required
3️⃣ LLM splits task into manageable pieces...
🔄 Split into 5 subtasks
4️⃣ Checking subtask confidence levels...
⚠️  Subtask has 75% confidence - further splitting
   🔄 Split into 3 smaller tasks  
✅ All tasks now ≥ 80% confidence
```

### Test Basic Routing
```bash
node test-llm-routing.js
```

## 🏗️ Architecture

### Minimal Core (`src/`)
- **`index.js`** (68 lines) - Main API
- **`mcp-server.js`** (207 lines) - MCP routing & tools
- **`mcp-tool-handlers.js`** (443 lines) - Fast task management

**Total: 718 lines** vs 2000+ simulation code = **65% reduction**

### YAML Agent Definitions
```yaml
# agents/dev.yaml
metadata:
  id: "dev"
  name: "Development Engineer"

tags:
  actions: [implement, debug, test, deploy]
  skills: [frontend, backend, devops, mobile]
  
capabilities:
  - id: "code_implementation"
    description: "Write and implement code"
    patterns: ["implement *", "code *", "build *"]
```

## 🎯 How It Works

### 1. LLM Gets Route Table
```javascript
const routeTable = await agent.getRouteTable();
// Returns: agents, capabilities, routing guidance + confidence threshold
```

### 2. LLM Routes Request
```javascript
// LLM sees: "Build user dashboard"
// LLM matches: dev agent (implement, build actions)
// LLM creates task with description
```

### 3. LLM Assesses Confidence
```javascript
// LLM evaluates: scope, complexity, clarity, dependencies
// If complex → low confidence → needs splitting
await agent.assessTaskConfidence(taskId, 0.4, factors, reasoning);
```

### 4. LLM Splits If Needed
```javascript
// LLM breaks into focused pieces
await agent.splitTask(taskId, 'Too complex', [
  { title: 'Design API', confidence: 0.9 },
  { title: 'Build UI', confidence: 0.85 }
]);
```

### 5. LLM Executes Ready Tasks
```javascript
// Only execute tasks with ≥ 80% confidence
await agent.executeTask(readyTaskId, 'dev', approach);
```

## 💾 Workspace Persistence

```
.kingly/
├── memory.json           # Context storage
├── tasks/               # Individual task files
│   ├── task_123.json    # Task details + history
│   └── task_124.json
└── workspace.json       # Workspace metadata
```

**Fast JSONL logging** for task history and workspace state.

## 🔄 Key Improvements from Seed

### ❌ Before (Simulation)
- JavaScript confidence algorithms
- Hardcoded splitting logic  
- Tag soup vocabulary lists
- Complex orchestration code

### ✅ After (LLM-First + Fast MCP)
- **LLM assesses confidence** based on context understanding
- **LLM creates splitting strategy** intelligently  
- **MCP tools** provide fast task management
- **Agent definitions** in readable YAML

## 🚀 Usage Examples

### Strategic Planning + Execution
```javascript
// 1. LLM routes to CEO for strategy
const routeTable = await agent.getRouteTable();
// LLM chooses 'ceo' based on 'plan' action tag

// 2. LLM creates task
const task = await agent.createTask(
  'Plan SaaS go-to-market strategy',
  'Define target market, pricing, launch sequence'
);

// 3. LLM assesses confidence (likely high for strategic work)
await agent.assessTaskConfidence(taskId, 0.85, factors);

// 4. LLM executes directly (≥ 80% confidence)
await agent.executeTask(taskId, 'ceo', 'market research first');
```

### Complex Technical Implementation
```javascript
// 1. LLM creates complex technical task
const task = await agent.createTask(
  'Build microservices architecture',
  'API gateway, auth service, user service, payment service, monitoring'
);

// 2. LLM assesses (likely low confidence)
await agent.assessTaskConfidence(taskId, 0.35, {
  scope: 'multiple_services',
  complexity: 'high_architectural'
});

// 3. LLM splits into focused services
await agent.splitTask(taskId, 'Too many moving parts', [
  { title: 'Setup API gateway', confidence: 0.8 },
  { title: 'Build auth service', confidence: 0.9 },
  { title: 'Implement user service', confidence: 0.85 }
]);

// 4. LLM executes each service individually
```

## 🎯 The Innovation

**JavaScript taught us the patterns. LLMs apply the intelligence.**

- **80% confidence threshold** → Proven from seed experiments
- **Recursive splitting** → Until all tasks executable  
- **Fast MCP tools** → Production workspace management
- **LLM-native operation** → No hardcoded logic

---

**Built on proven 77.8% self-evolution success rate** 🚀  
**Now optimized for LLM-native task management** 🧠