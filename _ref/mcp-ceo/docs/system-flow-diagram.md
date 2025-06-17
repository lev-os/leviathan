# FlowMind System Flow Diagram
*Boot vs Runtime Architecture with Bidirectional MCP Flow*

## 🚀 BOOT PHASE (System Initialization)

```
┌─────────────────────────────────────────────────────────────────┐
│                           BOOT PHASE                           │
│                    (One-time Compilation)                      │
└─────────────────────────────────────────────────────────────────┘

📁 YAML Context Files
├── contexts/agents/ceo/context.yaml
├── contexts/workflows/document-synthesis/context.yaml  
├── contexts/patterns/echo-intelligence/context.yaml
├── contexts/types/workspace/context.yaml
└── contexts/agents/eeps/nfj-visionary/context.yaml
           │
           ▼
    ┌─────────────────┐
    │ ContextRegistry │ ────┐
    │ - Scan contexts │     │
    │ - Build catalog │     │
    │ - Map types     │     │
    └─────────────────┘     │
           │                │
           ▼                │
    ┌─────────────────┐     │
    │ ContextAssembler│     │ 
    │ - Load contexts │     │
    │ - Create FlowMind│    │
    │ - Validate YAML │     │
    └─────────────────┘     │
           │                │
           ▼                │
    ┌─────────────────┐     │
    │   FlowMind      │ ◄───┘
    │ - 1:1 YAML map  │
    │ - Type checking │
    │ - Validation    │
    └─────────────────┘
           │
           ▼
    ┌─────────────────┐
    │  Boot Registry  │
    │ - Cache loaded  │
    │ - Index by URI  │ 
    │ - Ready state   │
    └─────────────────┘
```

**Boot Components:**
- **ContextRegistry**: Discovers all `.yaml` files, catalogs by type
- **ContextAssembler**: Loads YAML → FlowMind instances  
- **FlowMind**: Universal context wrapper with validation
- **Boot Registry**: In-memory cache of all loaded contexts

---

## ⚡ RUNTIME PHASE (Request Processing)

```
┌─────────────────────────────────────────────────────────────────┐
│                         RUNTIME PHASE                          │
│                   (Per-Request Processing)                     │
└─────────────────────────────────────────────────────────────────┘

🌐 MCP Request: execute_workflow('deep_analysis', { data })
           │
           ▼
    ┌─────────────────┐
    │   MCP Server    │
    │ - Parse request │
    │ - Route to flow │ 
    │ - Session mgmt  │
    └─────────────────┘
           │
           ▼
    ┌─────────────────┐     ┌─────────────────┐
    │ Protocol Router │ ──→ │  Boot Registry  │
    │ - Resolve URI   │     │ - Lookup cache  │
    │ - Create recipe │     │ - Get contexts  │
    └─────────────────┘     └─────────────────┘
           │                         │
           ▼                         │
    ┌─────────────────┐              │
    │ Recipe Builder  │ ◄────────────┘
    │ - Define sources│
    │ - Set priorities│
    │ - Token limits  │
    └─────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Assembly Engine │
    │ (assembly-rules)│
    └─────────────────┘
```

---

## 🔄 BIDIRECTIONAL MCP FLOW (The Magic Loop)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIDIRECTIONAL FLOW LOOP                     │
│            (Where Intelligence Actually Happens)               │
└─────────────────────────────────────────────────────────────────┘

USER: "Analyze this complex business scenario"
  │
  ▼
┌─────────────────┐
│   MCP Server    │ ──── 1. Route Request
│ server.js       │
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Assembly Engine │ ──── 2. Build Context Recipe
│ assembly-rules  │      - Relevance Filter
│                 │      - Priority Rules  
│                 │      - Conflict Resolution
│                 │      - Token Optimization
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Context Recipe  │ ──── 3. Select Contexts
│ { sources: [    │      recipe = {
│   "ceo",        │        sources: ["ceo", "nfj-visionary"],
│   "nfj-vision"  │        stageConfig: { lead: "ceo" },
│ ]}              │        tokenLimit: 4000
└─────────────────┘      }
  │
  ▼
┌─────────────────┐
│  LLM (Claude)   │ ◄─── 4. Context Switch: "You are CEO"
│                 │      System: CEO philosophy + instructions
│ REASONING AS    │      User: Business scenario analysis
│ CEO PERSONALITY │      
│                 │      
│ - Strategic view│      🧠 MAXIMUM REASONING POWER
│ - Risk analysis │         as CEO perspective
│ - Decision logic│
└─────────────────┘
  │
  ▼ CEO Analysis Complete
┌─────────────────┐
│   MCP Server    │ ──── 5. Context Switch Decision
│                 │      "Need visionary perspective"
│ DECISION:       │      
│ "Get NFJ input" │      
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Assembly Engine │ ──── 6. NEW Recipe for NFJ
│                 │      recipe = {
│ NEW CONTEXT     │        sources: ["nfj-visionary"],  
│ ASSEMBLY        │        focus: "future_possibilities",
│                 │        tokenLimit: 2000
└─────────────────┘      }
  │
  ▼
┌─────────────────┐
│  LLM (Claude)   │ ◄─── 7. Context Switch: "You are NFJ-Visionary"
│                 │      System: NFJ psychology + philosophy
│ REASONING AS    │      User: CEO's analysis + vision request
│ NFJ-VISIONARY   │
│                 │      🌟 MAXIMUM REASONING POWER
│ - Future vision │         as NFJ-Visionary perspective
│ - Possibility   │
│ - Innovation    │
└─────────────────┘
  │
  ▼ NFJ Analysis Complete
┌─────────────────┐
│   MCP Server    │ ──── 8. Synthesis Decision
│                 │      "Combine perspectives"
│ SYNTHESIS:      │
│ "Merge insights"│
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Assembly Engine │ ──── 9. SYNTHESIS Recipe
│                 │      recipe = {
│ CONFLICT        │        sources: ["ceo", "nfj-visionary"],
│ RESOLUTION      │        mode: "synthesis",
│                 │        strategy: "weighted_merge"
└─────────────────┘      }
  │
  ▼
┌─────────────────┐
│  LLM (Claude)   │ ◄─── 10. Context Switch: "You are Synthesizer"
│                 │       System: Both perspectives + synthesis instructions
│ REASONING AS    │       User: Create unified recommendation
│ SYNTHESIZER     │
│                 │       🎯 MAXIMUM REASONING POWER
│ - Balance views │          for final synthesis
│ - Find harmony  │
│ - Action plan   │
└─────────────────┘
  │
  ▼ Final Analysis
┌─────────────────┐
│     USER        │ ◄─── 11. Return Complete Analysis
│                 │       "Strategic business recommendation that balances
│ GETS EMERGENT   │        CEO risk analysis with NFJ future vision"
│ INTELLIGENCE    │
└─────────────────┘

TOTAL INTELLIGENCE = CEO + NFJ + SYNTHESIS > Individual perspectives
```

---

## 🔍 RELEVANCE FILTER PURPOSE

**What It's Supposed To Do:**
```javascript
// CURRENT: Mock semantic relevance (BROKEN)
async filterByRelevance(contexts, currentTask) {
  // ❌ Fake embedding similarity
  const relevance = await this.calculateSemanticRelevance(text, taskEmbedding)
  
  // ✅ Real temporal decay (works)
  relevance *= this.applyTemporalDecay(context.timestamp)
  
  // ✅ Real boost rules (works)  
  relevance *= this.applyBoostRules(context, currentTask)
}
```

**Purpose**: Filter from 50+ available contexts → 3-5 most relevant for current task

**Real-World Example:**
```
Available: [ceo, nfj-visionary, dev, doc-shepherd, technical-writer, ...]
Task: "Write API documentation"  
Relevance Filter Result: [doc-shepherd, technical-writer, dev]
```

**What We Should Replace Mock With:**
```javascript
// v0.1.0: Simple keyword/type matching (no embeddings)
filterByRelevance(contexts, currentTask) {
  return contexts.filter(context => {
    // Keyword relevance
    const keywords = currentTask.keywords || []
    const hasKeywords = keywords.some(k => 
      context.text.toLowerCase().includes(k.toLowerCase())
    )
    
    // Type preferences
    const typeMatch = currentTask.preferred_types?.includes(context.type)
    
    // Always include high priority
    const highPriority = context.effectivePriority >= 90
    
    return hasKeywords || typeMatch || highPriority
  })
}
```

---

## 📊 FILE RESPONSIBILITIES

### Boot Phase
- **ContextRegistry** (`context-registry.js`): Scan file system, build catalog
- **ContextAssembler** (`context-assembler.js`): Load YAML → FlowMind instances
- **FlowMind** (`flowmind.js`): Universal context wrapper

### Runtime Phase  
- **MCP Server** (`server.js` pattern): Route requests, manage sessions
- **AssemblyRules** (`assembly-rules.js`): Build context recipes
- **ContextTracker** (`context-tracker.js`): Track context lineage

### Bidirectional Flow
- **Protocol Router**: Resolve URIs to recipes
- **Recipe Builder**: Define context assembly instructions
- **Assembly Engine**: Execute priority/conflict/token rules
- **Context Switching**: LLM embodies different perspectives

---

## 🎯 KEY INSIGHTS

**1. Intelligence Through Context Switching**
- Each context switch = new LLM personality
- Multiple perspectives → emergent intelligence
- No "AI" in the code - LLM IS the intelligence

**2. Assembly Rules = Context Selection**
- Not semantic evaluation - just smart filtering
- Priority + relevance + conflict resolution
- Prepares contexts for LLM reasoning

**3. Boot vs Runtime Separation**
- Boot: Load and validate all contexts once
- Runtime: Fast lookup and assembly per request
- No file I/O during request processing

**4. MCP = Orchestration Protocol**
- Bidirectional flow enables context switching
- Each MCP call can trigger new context assembly
- Creates recursive intelligence loops

Sound good? This shows the hexagonal architecture with MCP as one adapter, and how the bidirectional flow creates emergent intelligence through systematic context switching.