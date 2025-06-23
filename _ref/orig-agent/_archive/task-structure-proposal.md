# Improved Task Structure - Separation of Concerns

## Problem with Current Implementation

**Mixed Concerns in Single YAML:**
- Business context + technical context + checklists + decision log = 80+ lines
- Developer never assessed complexity or did splitting
- Status not updated during implementation  
- Implementation details buried in business file

## Proposed Structure (Following i-* Pattern)

### **task.yaml** - Clean Contract (30 lines max)
```yaml
metadata:
  id: "feature-001"
  title: "Implement Project Hierarchy System"
  type: "feature"
  created: "2025-01-25T10:00:00Z"
  updated: "2025-01-25T15:30:00Z"

ownership:
  owner: "ceo"
  executors: ["dev"]

business_context:
  goal: "Add Workspace > Project > Task structure"
  business_value: "Better project organization"
  acceptance_criteria:
    - "Projects can contain multiple tasks"
    - "Tasks have embedded context"
    - "YAML-based storage"

status:
  current: "completed"  # Actually updated!
  progress: 100
  
dependencies:
  depends_on: []
  blocks: ["enhanced-workflows"]
```

### **task-context.md** - Technical Analysis & Splitting
```markdown
# Feature-001: Technical Context & Complexity Analysis

## Complexity Assessment (Following i-split.md)

**Initial Confidence: 4/10** ❌ (Below 8 threshold)
**Reason:** Multi-file system, new architecture, integration required

## Task Splitting Analysis

### Subtasks Identified:
1. **Create ProjectHierarchy class** (Confidence: 8/10) ✅
2. **Build YAML storage layer** (Confidence: 8/10) ✅  
3. **Integrate with MCP tools** (Confidence: 7/10) ⚠️
4. **Create migration tools** (Confidence: 8/10) ✅

### Split Decision: YES
**Approach:** Break into 4 subtasks, tackle sequentially

## Architecture Decisions
- YAML over JSON for human readability
- Separate ProjectHierarchy class from MCP tools
- Maintain backward compatibility with existing tasks

## Integration Points
- mcp-tool-handlers.js - add ProjectMCPTools
- Existing task system - migration path needed
```

### **task-impl.md** - Implementation Log
```markdown
# Feature-001: Implementation Notes

## Progress Log

### 2025-01-25 10:30 - Started Implementation
- Created src/project-hierarchy.js
- Implemented workspace initialization
- Status: 25% complete

### 2025-01-25 14:00 - Core Classes Complete  
- ProjectHierarchy class working
- YAML storage implemented
- Enhanced task format defined
- Status: 75% complete

### 2025-01-25 15:30 - Integration Complete
- ProjectMCPTools created
- Integrated with mcp-tool-handlers.js  
- Successfully tested
- Status: 100% complete ✅

## Technical Decisions
1. **File splitting:** Used chunked writes due to 50-line DC limit
2. **Error handling:** Added syntax fix for missing comma
3. **Testing:** Created kingly-test project for validation

## Blockers Encountered
- Syntax error in project-hierarchy.js (missing comma) - RESOLVED
- Desktop Commander file size limits - RESOLVED with chunking

## Files Created
- src/project-hierarchy.js (core system)
- src/project-mcp-tools.js (MCP integration)
- .kingly/workspace.yaml (test workspace)
```

## Benefits of This Approach

1. **Clean task.yaml** - Easy to read, stable contract
2. **Proper complexity assessment** - Following i-split.md methodology  
3. **Implementation tracking** - Developer decisions and progress
4. **Separation of concerns** - Business, technical, implementation separate
5. **Follows i-* pattern** - Consistent with existing architecture

## Integration with Kingly System

```javascript
// Enhanced task creation with separate files
await createEnhancedTask(projectId, {
  // Clean business definition
  task: taskData,
  
  // Technical analysis (auto-generated from splitting)
  context: complexityAssessment,
  
  // Implementation tracking (developer-maintained)
  implementation: progressLog
});
```

This matches the i-* pattern and keeps concerns cleanly separated!