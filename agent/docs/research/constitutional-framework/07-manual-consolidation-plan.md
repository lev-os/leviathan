# Manual Context Consolidation Plan

## Why Manual Process is Required

### The Symlink Reality
- **Half the contexts are symlinks** across the system
- Complex interdependencies between canonical sources and links
- Intentional organizational structure that automated tools could break
- Risk of duplicating content that's meant to be shared via symlinks

### Innovation Scatter Pattern
- **Base agent concept** exists in mcp-mvp
- **Discord tooling concepts** exist elsewhere  
- **Complete EEPS system** exists in ~/c
- **Patterns and workflows** distributed across multiple locations
- **Tools and templates** in various directories

### Automated Tool Risks
Existing `context-consolidator.js` is **dangerous** because it:
- Doesn't understand symlink relationships
- Could break intentional linking architecture
- Might duplicate content inappropriately  
- No understanding of canonical vs referenced content

## Manual Consolidation Workflow

### Phase 1: Discovery and Mapping (Read-Only)

#### 1.1 Create Discovery Script
**File:** `tools/context-discovery.js` (READ-ONLY)

**Purpose:** Safe reconnaissance without any modifications
```javascript
// IMPORTANT: READ-ONLY - NO FILE MODIFICATIONS
// - Scan for all .yaml files and symlinks
// - Map symlink relationships (source → targets)
// - Identify canonical sources vs references
// - Categorize by innovation type and location
// - Generate tracking files for manual review
```

#### 1.2 Output Structure
```
context-consolidation/
├── tracker.csv              # Manual tracking spreadsheet
├── process.md               # This document + workflow steps
├── symlink-map.json         # Complete symlink relationship map
├── innovation-audit.md      # Scattered innovations catalog
├── canonical-sources.md     # True source files vs symlinks
└── consolidation-log.md     # Manual progress tracking
```

### Phase 2: Manual Analysis

#### 2.1 Tracker.csv Structure
```csv
file_path,symlink_target,canonical_source,innovation_type,location_category,review_status,consolidation_decision,priority,notes
/Users/jean/c/agents/base-agent.yaml,,TRUE,agent,c_system,pending,keep_canonical,high,"Complete base agent"
/Users/jean/mcp-mvp/contexts/agents/base-agent.yaml,,TRUE,agent,mcp_mvp,pending,merge_with_c,medium,"Newer version with constitutional framework"
```

#### 2.2 Review Categories
- **Innovation Type:** agent, workflow, pattern, tool, theme, template
- **Location Category:** c_system, mcp_mvp, discord, personal_global, project_local
- **Review Status:** pending, reviewed, approved, conflict
- **Consolidation Decision:** keep_canonical, merge_with_canonical, move_to_canonical, create_reference, archive

### Phase 3: Manual Consolidation Process

#### 3.1 Decision Framework
For each context file:

1. **Is it a symlink?**
   - YES: Map to canonical source, understand purpose
   - NO: Check if it has symlinks pointing to it

2. **Is it an innovation scatter?**
   - Compare with canonical version in ~/c
   - Identify improvements/differences
   - Plan integration strategy

3. **Constitutional compliance?**
   - Run validation manually
   - Document compliance score
   - Plan improvements if needed

4. **Consolidation strategy?**
   - Keep as canonical source
   - Merge improvements into canonical
   - Create reference to canonical
   - Archive as duplicate

#### 3.2 Manual Consolidation Steps

**For each high-priority item:**

1. **Backup** - Manual backup of source before changes
2. **Review** - Side-by-side comparison of versions  
3. **Merge** - Careful manual integration of improvements
4. **Validate** - Constitutional compliance check
5. **Update references** - Adjust symlinks if needed
6. **Test** - Verify inheritance and functionality
7. **Document** - Record decision and changes made

### Phase 4: Symlink Preservation Strategy

#### 4.1 Symlink Relationship Types
- **Canonical → References:** One true source, multiple symlinks
- **Cross-project sharing:** Same context used in multiple projects
- **Template inheritance:** Base contexts with specializations
- **Tool integration:** Contexts shared with external tools

#### 4.2 Preservation Rules
1. **Never break existing symlinks** without understanding purpose
2. **Preserve canonical sources** - Don't move them lightly
3. **Update symlinks atomically** - All references updated together
4. **Test after changes** - Verify all links still work
5. **Document relationships** - Explain why symlinks exist

### Phase 5: Quality Assurance

#### 5.1 Manual Testing Checklist
- [ ] All symlinks resolve correctly
- [ ] Constitutional validation passes
- [ ] YAML inheritance works
- [ ] MCP integration functional
- [ ] No duplicate canonical sources
- [ ] Innovation improvements preserved

#### 5.2 Rollback Plan
- Complete backup before any changes
- Document all symlink relationships
- Test restoration procedure
- Quick rollback if issues discovered

## Implementation Timeline

### Week 1: Discovery
- Create read-only discovery script
- Generate tracker.csv and maps
- Manual review of all findings
- Categorize and prioritize

### Week 2: High-Priority Consolidation  
- Manual merge of critical innovations
- Base agent concept integration
- Constitutional compliance updates
- Symlink relationship preservation

### Week 3: Integration Testing
- Verify all systems working
- Test MCP integration
- Validate constitutional compliance
- Documentation updates

### Week 4: Final Cleanup
- Archive duplicates safely
- Optimize symlink structure
- Complete integration testing
- Prepare for next phase (packaging)

## Safety Guidelines

### Never Do Automatically
- Move canonical source files
- Remove symlinks without understanding
- Bulk modifications
- Assume symlink purposes

### Always Do Manually
- Compare file contents carefully
- Understand symlink relationships  
- Test changes incrementally
- Document decisions thoroughly
- Backup before modifications

## Success Criteria
1. **Zero broken symlinks** after consolidation
2. **All innovations preserved** and integrated
3. **Constitutional compliance** maintained/improved
4. **Single source of truth** for each context type
5. **Clear documentation** of final structure
6. **MCP integration** fully functional

This manual approach ensures we safely consolidate scattered innovations while preserving the intentional symlink architecture that exists in the current system.