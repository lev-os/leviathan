# claude-task-master Analysis for Unified PM System

## Executive Summary

claude-task-master excels at PRD-driven task generation with sophisticated complexity analysis and dependency management. Its MCP integration and AI-powered task expansion make it ideal for the task breakdown portion of the unified system.

## Key Strengths to Extract

### 1. Complexity-Based Task Management
```javascript
// Complexity scoring with AI reasoning
complexity: {
  score: 8,  // 1-10 scale
  reasoning: "Requires database schema changes, API design, and frontend integration",
  recommendedSubtasks: 5,
  expansionPrompt: "Break down into DB migration, API endpoints, UI components..."
}
```
- **What Works**: AI evaluates multiple factors to score complexity accurately
- **How to Use**: Integrate with agent routing - high complexity triggers architect review
- **Enhancement**: Add complexity thresholds that trigger different agent workflows

### 2. Intelligent Dependency Management
```javascript
// Automatic validation and cycle detection
dependencies: {
  validation: ["no-cycles", "exists", "no-self-ref"],
  autoFix: true,
  topologicalSort: true  // Finds optimal task order
}
```
- **What Works**: Prevents common dependency issues automatically
- **How to Use**: Extend to handle cross-project dependencies in cascading workflows
- **Enhancement**: Add dependency types (blocking, optional, parallel)

### 3. PRD Parsing with AI
```javascript
// Structured extraction using Zod schemas
const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  dependencies: z.array(z.number()),
  priority: z.enum(['high', 'medium', 'low']),
  details: z.string(),
  testStrategy: z.string()
});
```
- **What Works**: Reliable structured output from unstructured PRDs
- **How to Use**: Front-end for BMAD's PM agent outputs
- **Enhancement**: Add business metric extraction for KPI alignment

### 4. MCP Architecture Patterns
```javascript
// Clean tool → function mapping
tools: {
  'task-master.analyze': analyzeTaskComplexityDirect,
  'task-master.expand': expandTaskDirect,
  'task-master.next': findNextTaskDirect
}
```
- **What Works**: Consistent error handling and session management
- **How to Use**: Template for unified system's MCP server
- **Enhancement**: Add agent handoff tools and context sharing

## Key Weaknesses to Address

### 1. Linear Task Flow
**Problem**: Tasks go from pending → in-progress → done without pivot capability
**Solution**: 
```yaml
# Extended status model
status:
  - pending
  - in-progress
  - blocked         # New: waiting on dependency
  - needs-revision  # New: discovered issues
  - pivoted        # New: requirements changed
  - done
```

### 2. No Agent Integration
**Problem**: Tasks are executed by humans, not routed to specialized agents
**Solution**:
- Add `assignedAgent` field to tasks
- Implement agent capability matching
- Create handoff protocol between agents

### 3. Limited Context Awareness
**Problem**: Each task is isolated, no project-wide context
**Solution**:
- Add project context that cascades to all tasks
- Implement memory system for discoveries during execution
- Allow tasks to update parent PRD based on findings

## Integration Recommendations

### 1. Task Structure Extensions
```javascript
// Enhanced task model
{
  id: 1,
  title: "Implement OAuth",
  complexity: { score: 7, reasoning: "..." },
  dependencies: [2, 3],
  assignedAgent: "architect",  // New
  context: {                   // New
    projectType: "web-app",
    techStack: ["react", "firebase"],
    businessGoals: ["increase-conversion"]
  },
  discoveries: [],             // New: findings during execution
  pivotHistory: []            // New: track requirement changes
}
```

### 2. Complexity-Based Routing
```javascript
function routeTaskToAgent(task) {
  if (task.complexity.score < 3) return "coder";
  if (task.complexity.score < 6) return "architect-review → coder";
  if (task.complexity.score < 8) return "architect → po → coder";
  return "full-bmad-pipeline";
}
```

### 3. Workflow Interruption Support
```javascript
// When blocker discovered
async function handleBlocker(task, blocker) {
  const blockingTask = await generateBlockingTask(blocker);
  task.status = "blocked";
  task.blockedBy = blockingTask.id;
  
  // Cascade up if major pivot needed
  if (blocker.severity === "major") {
    await cascadePivot(task, blocker);
  }
}
```

### 4. PRD Evolution
```javascript
// Allow PRD to evolve based on discoveries
async function updatePRDFromDiscovery(discovery) {
  if (discovery.type === "tech-constraint") {
    // Update technical requirements
  } else if (discovery.type === "business-pivot") {
    // Trigger CEO/PM review
  }
}
```

## What to Keep vs Change

### Keep:
1. **Complexity Analysis** - Excellent for routing decisions
2. **Dependency Management** - Solid foundation for task ordering
3. **MCP Integration** - Clean patterns for tool exposure
4. **Structured AI Output** - Reliable task generation
5. **Research Mode** - Valuable for technical decisions

### Change:
1. **Static Tasks** → Dynamic tasks that can pivot
2. **Human Execution** → Agent-based execution
3. **Linear Flow** → Interruptible workflows
4. **Isolated Tasks** → Context-aware task network
5. **One-time Parse** → Continuous PRD refinement

## Implementation Priority

1. **Phase 1**: Integrate complexity scoring into agent routing
2. **Phase 2**: Extend task model with agent assignment
3. **Phase 3**: Add workflow interruption and pivoting
4. **Phase 4**: Implement discovery → PRD feedback loop
5. **Phase 5**: Enable cross-project dependency management

## Key Insight

claude-task-master's strength is turning vague requirements into concrete, well-structured tasks with proper dependencies. This is exactly what's needed for the "vibe coding" experience - users provide high-level goals, the system generates detailed implementation plans. The addition of agent routing based on complexity scores will make this even more powerful.

## Recommended Extraction

1. **Core Algorithms**:
   - Complexity scoring logic
   - Dependency validation and cycle detection
   - Topological sort for task ordering

2. **AI Patterns**:
   - Structured output schemas
   - Research mode integration
   - Multi-model fallback system

3. **MCP Patterns**:
   - Tool registration and mapping
   - Session handling
   - Error response structure

4. **Task Expansion**:
   - Subtask generation based on complexity
   - Automatic dependency inference
   - Test strategy generation