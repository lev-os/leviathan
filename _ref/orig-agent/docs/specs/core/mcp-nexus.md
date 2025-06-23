# 🌐 MCP NEXUS SPECIFICATION

*Central intelligence coordination with plugin architecture*

## 📋 **BUSINESS CASE**

**Goal**: MCP as central intelligence nexus with dynamic agentInstructions injection and plugin hooks
**Value**: Smart context assembly, plugin-based extensibility, dynamic response enhancement
**Priority**: Critical - Core architecture (✅ IMPLEMENTED)

## 🎯 **ACCEPTANCE CRITERIA**

### **AC-MCP-NEXUS-001: agentInstructions Pattern**
```yaml
Given: Any MCP tool call
When: Tool completes processing
Then: Response includes agentInstructions field with contextual mini-prompts
And: Instructions are situation-aware (current workspace, active projects, etc.)
And: Instructions include next action options with exact syntax
And: Memory system provides persistent context across calls
```

### **AC-MCP-NEXUS-002: Plugin Architecture**
```yaml
Given: System needs dynamic functionality (bg process updates, spawn status, etc.)
When: Plugin registers with MCP pipeline
Then: Plugin hooks into pre/post execution phases
And: Plugin can inject content into agentInstructions
And: Plugin priority system controls execution order
And: Plugins run on EVERY MCP call for dynamic updates
```

### **AC-MCP-NEXUS-003: Smart Context Assembly**
```yaml
Given: MCP tool call with complex context needs
When: Response is generated
Then: System assembles context from memory, filesystem, and plugins
And: agentInstructions reflect current situation (workspace state, spawn updates, etc.)
And: Context capture strategies provide rich environmental awareness
And: Next actions are intelligently suggested based on current state
```### **AC-MCP-NEXUS-004: Memory Integration**
```yaml
Given: Need to persist decisions and context
When: Using memory system
Then: Key-value storage persists across sessions
And: Context capture strategies save/restore environmental state
And: Memory enhances agentInstructions with historical context
And: Memory enables intelligent suggestions based on past patterns
```

### **AC-MCP-NEXUS-005: Audit Logging Integration**
```yaml
Given: Any MCP tool call
When: Action is performed
Then: Audit entry is automatically logged
And: Audit includes type, target, params, timestamp
And: Audit trail is queryable through MCP tools
And: Logs capture plugin execution and context assembly
```

### **AC-MCP-NEXUS-006: Dynamic Plugin Registration**
```yaml
Given: New plugin needs to be added to MCP pipeline
When: Plugin is registered with system
Then: Plugin hooks are dynamically integrated without restart
And: Plugin can specify pre/post execution phases
And: Plugin priority determines execution order
And: Plugin errors don't break core MCP functionality
```

### **AC-MCP-NEXUS-007: Context Capture and Restoration**
```yaml
Given: Complex workspace state with multiple active contexts
When: MCP tool needs environmental awareness
Then: Context capture strategies gather current state
And: Context includes workspace info, active tasks, spawn status
And: Context is assembled token-efficiently for LLM consumption
And: Context restoration enables stateful operation across calls
```

### **AC-MCP-NEXUS-008: Intelligent agentInstructions**
```yaml
Given: MCP tool execution with current environmental context
When: Response is generated with agentInstructions
Then: Instructions are context-aware and situation-specific
And: Instructions include exact syntax for suggested next actions
And: Instructions prioritize most relevant actions for current state
And: Instructions adapt based on workspace type and active projects
```

### **AC-MCP-NEXUS-009: Plugin Chain Performance**
```yaml
Given: Multiple plugins registered in MCP pipeline
When: MCP tool is executed with plugin chain
Then: Total plugin execution time is <100ms
And: Plugin failures don't cascade to other plugins
And: Plugin execution is logged for performance monitoring
And: Critical plugins can be marked as required vs optional
```

## 🔌 **PLUGIN EXAMPLES**

### **Spawn Status Plugin**
```javascript
const spawnStatusPlugin = {
  name: 'spawn-status-checker',
  priority: 100,
  always: async (context) => {
    const statusUpdate = await spawnAgent.checkAllSpawns();
    if (statusUpdate.completed.length > 0) {
      context.result.agentInstructions += `\n\n⚡ SPAWN UPDATES:\n`;
      statusUpdate.completed.forEach(s => {
        context.result.agentInstructions += `- Spawn ${s.id} completed! Process with ${s.callbackTool}\n`;
      });
    }
  }
};
```

### **Context Awareness Plugin**
```javascript
const contextAwarenessPlugin = {
  name: 'context-awareness',
  priority: 90,
  post: async (context) => {
    const workspaceContext = await loadWorkspaceContext();
    context.result.agentInstructions += `\n\n📍 Current Context: ${workspaceContext.summary}`;
  }
};
```

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
```yaml
test_plugin_registration:
  scenario: "Register new plugin with MCP pipeline"
  given: "Plugin with pre/post hooks and priority"
  when: "Plugin is registered"
  then: "Plugin is integrated into execution chain"
  and: "Plugin hooks execute in correct order"
  
test_agent_instructions_injection:
  scenario: "agentInstructions added to MCP response"
  given: "MCP tool execution with context"
  when: "Response is generated"
  then: "agentInstructions field contains contextual guidance"
  and: "Instructions include situation-specific next actions"
  
test_memory_persistence:
  scenario: "Memory system maintains state across calls"
  given: "Data stored in memory system"
  when: "System restarts and memory is accessed"
  then: "Data is correctly restored from persistence"
  and: "Memory context enhances subsequent operations"
```

### **Integration Tests**
```yaml
test_plugin_pipeline_execution:
  scenario: "Multiple plugins execute in coordinated chain"
  given: "3 plugins registered with different priorities"
  when: "MCP tool is executed"
  then: "Plugins execute in priority order"
  and: "Plugin failures don't break chain"
  and: "Total execution time <100ms"
  
test_context_assembly_workflow:
  scenario: "Dynamic context assembly from multiple sources"
  given: "Workspace with active tasks, spawn processes, and memory"
  when: "MCP tool needs environmental awareness"
  then: "Context is assembled from all relevant sources"
  and: "Context is token-optimized for LLM consumption"
  and: "Assembly completes in <200ms"
  
test_spawn_status_integration:
  scenario: "Spawn status plugin provides real-time updates"
  given: "Background spawns in various states"
  when: "Any MCP tool is called"
  then: "agentInstructions include current spawn status"
  and: "Completed spawns suggest callback actions"
```

### **End-to-End Tests**
```yaml
test_complete_nexus_operation:
  scenario: "Full MCP nexus with memory, plugins, and context"
  flow:
    1. Execute MCP tool with multiple active contexts
    2. Plugin chain executes with spawn status and context plugins
    3. Memory system provides historical context
    4. agentInstructions generated with intelligent suggestions
    5. Audit logging captures complete operation chain
    
test_plugin_ecosystem_resilience:
  scenario: "System resilience under plugin failures"
  given: "Mix of critical and optional plugins"
  when: "One plugin fails during execution"
  then: "Core MCP functionality continues"
  and: "Other plugins execute successfully"
  and: "Error is logged but doesn't propagate"
  
test_context_aware_suggestions:
  scenario: "Intelligent next action suggestions based on state"
  given: "Workspace with specific project type and active tasks"
  when: "MCP tool execution generates agentInstructions"
  then: "Suggestions are relevant to current project context"
  and: "Suggestions include exact syntax for next actions"
  and: "Historical patterns influence suggestion priority"
```

### **Performance Tests**
```yaml
performance_benchmarks:
  plugin_execution: "<100ms for full plugin chain"
  context_assembly: "<200ms for complex environmental context"
  memory_operations: "<50ms for read/write operations"
  agent_instructions_generation: "<75ms for intelligent suggestions"
  audit_logging: "<25ms for audit entry creation"
```

## 📊 **IMPLEMENTATION STATUS**

**✅ Currently Working**:
- agentInstructions pattern in all tool responses
- Plugin architecture with pre/post/always hooks
- Memory system with persistent key-value storage
- Context capture strategies (filesystem, git, environment)

**🔄 In Progress**:
- Advanced plugin ecosystem
- Intelligent context assembly optimization
- Dynamic suggestion algorithms