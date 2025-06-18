# /worktree - Interactive Git Worktree Creation Wizard

## MISSION: Context-Aware Worktree Management with AI Assistance

When user says "/worktree" or "/worktree [slug-hint]":

1. **Context Analysis & Slug Generation**
   - Analyze recent conversation for project context, tasks, and themes
   - Generate semantic slug from context (e.g., "constitutional-framework-integration")
   - If $ARGUMENTS provided: use as slug if valid, otherwise as context hint
   - Extract key context elements for worktree initialization

2. **Interactive Worktree Wizard**
   ```
   🌳 WORKTREE CREATION WIZARD
   
   **Context Detected:** Kingly Agency constitutional framework integration
   **Generated from:** Recent discussion about base agent validation and constitutional patterns
   
   **Proposed Configuration:**
   📁 **Worktree Name:** constitutional-framework-integration
   📂 **Location:** /Users/user/digital/worktrees/constitutional-framework-integration
   🌿 **Branch Strategy:** feature/constitutional-framework-integration (new branch)
   📋 **Context Capture:** Last 10 messages about constitutional patterns and validation
   
   ⚡ **Options:**
   1. ✅ Create with proposed settings
   2. 📝 Customize worktree name/slug
   3. 📁 Change base location
   4. 🌿 Modify branch strategy  
   5. 📋 Review/edit captured context
   6. 🔄 Re-analyze recent context
   7. ❌ Cancel and return
   
   **Choice (1-7):** _
   ```

3. **Smart Configuration Flows**

   **Option 2 - Customize Name:**
   ```
   📝 **Custom Worktree Name**
   Current: constitutional-framework-integration
   
   Enter new name (or press Enter to keep current):
   > agency-base-validation
   
   ✅ Updated: agency-base-validation
   📂 New location: /Users/user/digital/worktrees/agency-base-validation
   🌿 New branch: feature/agency-base-validation
   ```

   **Option 3 - Change Location:**
   ```
   📁 **Worktree Location**
   Current base: /Users/user/digital/worktrees/
   
   Options:
   1. ~/digital/worktrees/ (current)
   2. ~/digital/kingly/experiments/
   3. ~/digital/temp-work/
   4. Custom path...
   
   Choice: _
   ```

   **Option 5 - Review Context:**
   ```
   📋 **Captured Context Review**
   
   **Key Topics Identified:**
   • Constitutional framework integration
   • Base agent validation system  
   • Specialist agent inheritance patterns
   • Token usage optimization concerns
   • Existing ~/c system analysis
   
   **Recent Messages Summary:**
   - User wants base agent for validation across specialists
   - Discussion about constitutional principles implementation
   - Research into existing ~/lev/agent architecture
   - Plans for systematic agent development
   
   ⚡ **Actions:**
   1. ✅ Context looks good, proceed
   2. ✏️ Add additional context notes
   3. 🔄 Re-analyze with different message range
   4. ⬅️ Back to main wizard
   ```

4. **Worktree Creation Process**
   ```bash
   # Internal command flow (user sees progress)
   🌳 Creating worktree...
   
   ✅ Analyzing git repository state
   ✅ Validating worktree location  
   ✅ Creating feature branch: feature/constitutional-framework-integration
   ✅ Setting up worktree at: /Users/user/digital/worktrees/constitutional-framework-integration
   ✅ Copying context files and session state
   ✅ Initializing development environment
   
   🎯 **Worktree Ready!**
   
   **Next Steps:**
   • cd /Users/user/digital/worktrees/constitutional-framework-integration
   • Continue work in isolated environment
   • Merge back when ready: git push origin feature/constitutional-framework-integration
   
   **Context Available:**
   • Session notes saved to: .worktree-context.md
   • Recent conversation: .conversation-context.md  
   • Task summary: .task-context.md
   ```

5. **Error Handling & Validation**
   ```
   ❌ **Worktree Creation Failed**
   
   **Issue:** Directory already exists
   **Path:** /Users/user/digital/worktrees/constitutional-framework-integration
   
   **Options:**
   1. 🗑️ Remove existing and recreate
   2. 📝 Choose different name
   3. 📁 Use different location
   4. 🔄 Back to wizard
   5. ❌ Cancel operation
   
   **Safe Actions:** Options 2-5 (Option 1 requires confirmation)
   ```

## Smart Context Detection Logic:

```javascript
// Pseudo-code for context analysis
function analyzeRecentContext(messages, userHint = null) {
  const contextAnalysis = {
    topics: extractKeyTopics(messages),
    tasks: identifyActiveTasks(messages),
    technologies: detectTechnologies(messages),
    urgency: assessUrgencyLevel(messages),
    complexity: estimateComplexity(messages)
  };
  
  const semanticSlug = generateSemanticSlug(contextAnalysis, userHint);
  
  return {
    slug: semanticSlug,
    branchName: `feature/${semanticSlug}`,
    context: contextAnalysis,
    suggestedLocation: inferOptimalLocation(contextAnalysis)
  };
}
```

## Git Worktree Integration:

```bash
# Core worktree commands used
git worktree add -b [branch-name] [worktree-path] [start-point]
git worktree list --porcelain
git worktree remove [worktree-path]

# Integration with existing ~/lev/_worktree system
kingly cmd worktree create [name] --context-file=.worktree-context.md
kingly cmd worktree track [path] --session-id=[current-session]
```

## Context Preservation Strategy:

1. **Session Context** - Current conversation and task state
2. **Project Context** - Repository state, branch info, recent commits  
3. **Environment Context** - Working directory, environment variables
4. **Task Context** - Extracted goals, requirements, and next steps

## Smart Follow-ups:

```
⚡ **After Worktree Creation:**
• "continue here" - Switch to worktree and continue current task
• "sync main" - Keep worktree updated with main branch changes
• "merge ready" - Create pull request when work is complete
• "cleanup" - Remove worktree and clean up branches
• "list worktrees" - Show all active worktrees and their status
• "checkpoint" - Save progress and session state
```

## Error Recovery Patterns:

- **Git conflicts** → Offer merge strategy options
- **Permission issues** → Suggest location alternatives  
- **Invalid names** → Auto-sanitize and confirm
- **Existing worktrees** → Show options to reuse, rename, or remove
- **Context extraction failures** → Manual context entry option

## Integration Points:

- **Leviathan Debug System** → Full operation tracing
- **~/lev/_worktree Manager** → Leverage existing worktree infrastructure
- **Constitutional AI** → Validate operations before execution
- **Job System** → Coordinate with existing workflows

---

*Intelligent worktree management that understands context and streamlines parallel development workflows*