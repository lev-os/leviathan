# Simplified Documentation Structure 🎯

## Core Insight: Specs vs BDD

- **Spec**: Technical implementation details (HOW we build it)
- **BDD**: User-facing behaviors (WHAT it does for users)

## Proposed Structure

```
kingly/
├── src/                          # Code stays here
├── tests/                        # Test files stay here
├── docs/                         # ALL documentation
│   ├── README.md                 # Navigation & quick start
│   ├── architecture/             # Core system design
│   │   ├── universal-context.md  # The big idea
│   │   ├── memory-system.md      # Unified memory architecture
│   │   └── federation.md         # Data federation design
│   ├── features/                 # BDD - What users can do
│   │   ├── task-splitting.md     # Feature: Split complex tasks
│   │   ├── agent-routing.md      # Feature: Route to best agent
│   │   └── memory-recall.md      # Feature: Remember context
│   ├── specs/                    # Technical implementation
│   │   ├── mcp-tools.md          # How MCP tools work
│   │   ├── confidence-algo.md    # How confidence is calculated
│   │   └── spawn-system.md       # How background tasks run
│   └── decisions/                # ADRs - Why we chose X over Y
│       ├── adr-001-echo.md
│       ├── adr-002-languages.md
│       └── adr-003-grpc.md
└── _archive/                     # Old stuff (can delete later)
```

## What Stays When We're Done

### ✅ KEEP (High Value)
1. **Architecture docs** (3-4 files)
   - Universal context system
   - Memory architecture 
   - Federation protocol

2. **Feature descriptions** (5-6 files)
   - Core user-facing capabilities
   - Written as BDD-style behaviors

3. **Implementation specs** (8-10 files)
   - Technical details for developers
   - API specifications
   - Algorithm descriptions

4. **Decision records** (3-5 ADRs)
   - Major architectural choices
   - Trade-off analyses

### ❌ ARCHIVE/DELETE
- Duplicate memory specs (merge into one)
- Old agent routing concepts 
- Superseded confidence systems
- Early brainstorming docs
- Overlapping implementations

## Kingly OS Context Pattern 🧠

### The Realization
```yaml
context_hierarchy:
  feature:          # BDD - User need (WHAT)
    confidence: 95%
    owner: "Product/User"
    
  spec:            # Technical design (HOW) 
    confidence: 80%
    owner: "Architect"
    splits_into:
      - implementation_tasks
    
  task:            # Concrete work items
    confidence: 90%
    owner: "Developer"
    depends_on:
      - other_tasks
```

### Applied to Documentation
```yaml
doc_as_context:
  "features/task-splitting.md":
    type: "feature"
    behavior: "Users can split complex tasks"
    acceptance_criteria:
      - "Tasks below 80% confidence auto-split"
      - "Subtasks maintain relationships"
    
  "specs/confidence-algo.md":
    type: "spec"
    implements: "features/task-splitting.md"
    details:
      - "LLM evaluates scope, complexity, clarity"
      - "Returns 0-1 confidence score"
    splits_to:
      - "task: Implement confidence scorer"
      - "task: Add splitting logic"
      
  "task_001":
    type: "task"
    implements_spec: "specs/confidence-algo.md"
    confidence: 90%
    can_execute: true
```

### The Magic: Docs ARE Contexts!

Each document becomes a context that can:
1. **Inherit** from parent contexts (feature → spec → task)
2. **Split** when confidence is low
3. **Depend** on other contexts
4. **Route** to appropriate agents

```yaml
agent_routing_by_doc_type:
  feature_docs:
    agent: "product_designer"
    prompts_for: "user stories, acceptance criteria"
    
  spec_docs:
    agent: "architect" 
    prompts_for: "technical design, API specs"
    
  task_docs:
    agent: "developer"
    prompts_for: "implementation steps"
```

## Next Steps After Organization

1. **Run Kingly task splitting on docs themselves**
   ```yaml
   - confidence: assess_doc("specs/memory-system.md")
   - if low: split into subtask docs
   - track dependencies between docs
   ```

2. **Create doc-to-task pipeline**
   ```yaml
   feature.md → spec.md → task_001.yaml
              ↓
           task_002.yaml
   ```

3. **Apply agent-as-context pattern**
   - Each doc type gets specialized agent
   - Agents understand doc inheritance
   - Context flows through doc hierarchy

## The Simplification Win

**Before**: 89 scattered documents, unclear relationships
**After**: ~25 core docs in clear hierarchy

**Before**: Specs mixed with features mixed with tasks  
**After**: Clean separation - features (WHAT) vs specs (HOW) vs tasks (DO)

**Before**: No systematic organization
**After**: Docs themselves use Kingly's context system!

---

This isn't just organization - it's **dogfooding Kingly's context system on its own documentation!** 🚀