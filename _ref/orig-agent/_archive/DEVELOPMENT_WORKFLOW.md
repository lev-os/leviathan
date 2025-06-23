# Kingly Agent Development Workflow

**Standard workflow for future development and agent handoffs**

## 🎯 **Pre-Development Checklist**

### **1. Understand Current State**
- [ ] Read `CORE_PRINCIPLES.md` (immutable architectural decisions)
- [ ] Check `I_FILE_STATUS.md` for implementation status
- [ ] Review relevant i-*.md files for requirements
- [ ] Test current system: `node test-confidence-splitting.js`

### **2. Validate Approach**
- [ ] Apply "Can an LLM do this?" test
- [ ] Ensure bidirectional flow pattern maintained
- [ ] Confirm 80% confidence threshold preserved
- [ ] No simulation/replication of LLM capabilities

### **3. Setup Development Environment**
```bash
cd kingly-agent/
npm install
node test-llm-routing.js      # Verify base functionality
node test-confidence-splitting.js  # Verify task management
```

## 🔄 **Development Process**

### **Phase 1: Analysis & Design**
1. **Identify Requirement**: Which i-*.md file or feature?
2. **LLM-First Check**: What should LLM do vs infrastructure provide?
3. **MCP Tool Design**: What data access does LLM need?
4. **No Business Logic**: Ensure no decision-making in JavaScript

### **Phase 2: Implementation**
1. **Add MCP Tools**: Extend `mcp-tool-handlers.js` with data access only
2. **Update Tool Definitions**: Add to `getToolDefinitions()` 
3. **Update MCP Server**: Add routing in `handleToolCall()`
4. **Test Bidirectional Flow**: LLM → MCP → Kingly → MCP → LLM

### **Phase 3: YAML Integration** 
1. **Agent Definitions**: Update existing or create new YAML agents
2. **Capability Patterns**: Add patterns for LLM routing
3. **No JavaScript Classes**: Agents are YAML + existing MCP tools
4. **Test Route Table**: Verify `get_route_table()` includes new capabilities

### **Phase 4: Testing & Validation**
1. **Unit Tests**: Test MCP tools return correct data
2. **Integration Tests**: Test full bidirectional flow
3. **Confidence Tests**: Verify 80% threshold enforcement
4. **LLM Tests**: Test with actual LLM interactions

## 📋 **Implementation Templates**

### **Adding New MCP Tool**
```javascript
// mcp-tool-handlers.js
async handleNewFeature(args) {
  // ✅ Data access only
  const data = await this.loadSomeData(args);
  
  // ✅ Simple validation
  if (!data) throw new Error('Data not found');
  
  // ✅ Persistence
  await this.saveSomeData(data);
  
  // ✅ Return data for LLM
  return { data, message: 'Feature executed' };
}

// ❌ DON'T DO: Business logic
async handleNewFeature(args) {
  if (this.shouldDoComplexLogic(args)) {
    return this.makeDecisionForLLM(args);
  }
}
```

### **Adding Tool Definition**
```javascript
// mcp-tool-handlers.js - getToolDefinitions()
{
  name: "new_feature",
  description: "What this tool provides for LLM (not what LLM should do)",
  inputSchema: {
    type: "object", 
    properties: {
      required_param: { type: "string", description: "What LLM should provide" }
    },
    required: ["required_param"]
  }
}
```

### **Updating Agent YAML**
```yaml
# agents/agent-name.yaml
capabilities:
  - id: "new_capability"
    description: "What the agent can do with this capability"
    patterns: ["action patterns", "that llm", "can match"]
```

## 🧪 **Testing Standards**

### **Required Tests**
1. **MCP Tool Test**: Data access works correctly
2. **Bidirectional Test**: Full LLM conversation flow
3. **Confidence Test**: 80% threshold enforced
4. **Route Table Test**: New capabilities appear in routing

### **Test Template**
```javascript
// test-new-feature.js
async function testNewFeature() {
  const agent = new KinglyAgent();
  
  // Test MCP tool directly
  const result = await agent.newFeature(testArgs);
  assert(result.success);
  
  // Test bidirectional flow
  // 1. LLM gets route table
  const routes = await agent.getRouteTable();
  // 2. LLM sees new capability
  // 3. LLM uses new capability
  // 4. Verify expected outcome
  
  console.log('✅ New feature test passed');
}
```

## 📁 **File Organization**

### **Development Files**
- Work in: `kingly-agent/src/`
- Test in: `kingly-agent/test-*.js`
- Document in: `kingly-agent/README.md`

### **Strategic Files**
- Requirements: `i-*.md` (check I_FILE_STATUS.md first)
- Principles: `CORE_PRINCIPLES.md` (read-only)
- Status: `I_FILE_STATUS.md` (update after completion)

### **Archive Organization**
```
workshop/archive/
├── strategic-docs/
│   ├── completed/      # Implemented i-files
│   ├── future/         # Future implementation
│   ├── review/         # Need review/validation
│   └── reference/      # Historical/reference
└── experiments/        # Old simulation code
```

## 🚀 **Deployment Process**

### **Before Merge**
1. **All Tests Pass**: Run full test suite
2. **Bidirectional Flow**: Verify LLM → MCP → Kingly → LLM works
3. **No Simulation Code**: No hardcoded logic replicating LLM
4. **Documentation Updated**: README.md reflects new capabilities

### **Update Status**
1. Update `I_FILE_STATUS.md` with implementation progress
2. Move completed i-files to appropriate archive folder
3. Update `CORE_PRINCIPLES.md` if architectural decisions made

### **Version Management** 
1. Increment package.json version
2. Tag release with feature description
3. Update README.md with new MCP tools
4. Test production deployment

## 🎯 **Common Pitfalls to Avoid**

### **❌ Anti-Patterns**
1. **Building LLM Logic**: Don't replicate what LLMs do naturally
2. **Complex Abstractions**: Keep MCP tools simple and direct
3. **Business Logic**: No decision-making in JavaScript
4. **Simulation Code**: No confidence algorithms or routing logic

### **✅ Success Patterns**
1. **Data Access Only**: MCP tools provide data, LLM decides
2. **YAML Definitions**: Agents are declarative, not programmatic
3. **Bidirectional Flow**: LLM drives conversation until completion
4. **80% Confidence**: Maintain proven threshold from experiments

## 📋 **Handoff Protocol**

### **When Passing to Another Agent**
1. **Status Update**: Update `I_FILE_STATUS.md` with current progress
2. **Clear Documentation**: What's complete, what's pending, what's blocked
3. **Test State**: Ensure all tests pass before handoff
4. **Context Preservation**: Document any architectural decisions made

### **When Receiving Handoff**
1. **Read All Docs**: CORE_PRINCIPLES.md + I_FILE_STATUS.md + relevant i-files
2. **Test System**: Verify everything works before starting new work
3. **Understand Context**: Review previous agent's documentation
4. **Ask Questions**: Clarify requirements before implementation

---

**Remember**: We're building LLM-native infrastructure, not trying to replace LLM intelligence with code. The system should feel like a natural conversation between LLM and tools, not a complex software framework.