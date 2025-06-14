# 🧠 KINGLY CORE AGENT - FLOWMIND CONSTITUTIONAL FRAMEWORK

**UNIFIED SYSTEM**: Complete consolidation of mcp-ceo + mcp-mvp + core/agent  
**ARCHITECTURE**: LLM-First Constitutional Framework with EEPS Personality System  

## 🚨 FLOWMIND CONSTITUTIONAL FRAMEWORK

### FUNDAMENTAL TRUTH #1: THE LLM IS THE RUNTIME
In FlowMind architecture:
- The LLM (You/Claude/GPT) IS the execution engine, not code
- FlowMind contexts CONFIGURE the LLM's behavior
- We don't BUILD systems that think - the LLM IS the thinking system

**WRONG**: User → Code → LLM → Code → Result  
**RIGHT**: User ↔ LLM ↔ FlowMind Context System

### FUNDAMENTAL TRUTH #2: EVERYTHING IS A CONTEXT
**THERE IS ONLY ONE CLASS: FlowMind**
- Agents are contexts with type: "agent"
- Workflows are contexts with type: "workflow"  
- Patterns are contexts with type: "pattern"
- Types are contexts with type: "type"

No inheritance hierarchies. Type-specific behavior comes from YAML, not subclasses.

### FUNDAMENTAL TRUTH #3: BIDIRECTIONAL FLOW = INFINITE INTELLIGENCE
The magic happens through CONTEXT SWITCHING:

```
Step 1: LLM calls MCP → "Execute workflow step 1"
Step 2: MCP loads context → "You are NFJ-Visionary. Analyze..."
Step 3: LLM reasons with MAXIMUM POWER as NFJ-Visionary
Step 4: LLM callback → "Here are my visionary insights..."
Step 5: MCP loads NEW context → "You are STP-Adapter. Pragmatize..."
Step 6: LLM reasons with MAXIMUM POWER as STP-Adapter
[CYCLE CONTINUES = EMERGENT INTELLIGENCE]
```

### FUNDAMENTAL TRUTH #4: YAML IS THE SOURCE OF TRUTH
- 1:1 mapping between YAML and FlowMind properties
- No "normalization" or flattening
- metadata.name IS the name (don't "fix" it)
- Fix tests to match superior YAML design

### FUNDAMENTAL TRUTH #5: SEMANTIC CONDITIONS ARE REVOLUTIONARY
FlowMind enables:
- `when_semantic: "user seems frustrated"`
- `if: "urgency > 0.8" and_semantic: "user is asking for manager"`
- `while_semantic: "user still has questions"`

The LLM EVALUATES these through semantic reasoning, bridging human intent and machine precision.

## 🚫 NEVER MOCK IN CODE
- **NEVER use Math.random() for decisions** - The LLM makes decisions
- **NEVER create mock evaluation functions** - The LLM IS the evaluator
- **NEVER simulate LLM reasoning in code** - Let the ACTUAL LLM reason
- **NEVER fake semantic understanding** - Real understanding only
- If you need test data, use REAL YAML files
- If you need evaluation, let the ACTUAL LLM evaluate through MCP
- Leave TODOs for future implementation, don't mock

## IMPLEMENTATION RULES

1. **ONE CLASS RULE**: Everything inherits from FlowMind. No exceptions.
2. **YAML MIRROR RULE**: FlowMind properties = YAML structure exactly.
3. **TYPE THROUGH DATA**: Behavior from 'type' property, not class hierarchies.
4. **CONTEXT SWITCHING**: Every step = new context = new LLM powers.
5. **LLM REASONING FIRST**: Ask "Can the LLM do this?" (Usually yes!)

## PACKAGE MANAGER
- **Always use pnpm** for this project
- Commands: `pnpm install`, `pnpm add`, `pnpm run`, etc.

## PROJECT STRUCTURE
```
src/
├── flowmind/           # Universal Context System
├── mcp/               # MCP Server & Semantic Lookup  
├── eeps/              # EEPS Personality System
└── index.js          # Main entry point

contexts/
├── agents/           # EEPS + other agents
├── workflows/        # Multi-step processes
├── patterns/         # Thinking patterns
└── tools/           # External integrations

tests/
├── integration/     # FlowMind + MCP + EEPS
├── constitutional/  # Framework validation
└── e2e/            # End-to-end workflows

docs/
├── architecture/   # Constitutional Framework
└── eeps/          # Personality System docs
```

## TESTING APPROACH
```bash
# Constitutional Framework validation
pnpm test:constitutional

# FlowMind integration tests  
pnpm test:flowmind

# BDD specification tests
pnpm test:bdd

# Full test suite
pnpm test
```

## DEVELOPMENT COMMANDS
```bash
# Start MCP server
pnpm mcp

# Development with hot reload
pnpm dev

# Build embeddings for semantic search
pnpm build:embeddings

# Run specific test suites
pnpm test:integration
pnpm test:e2e
```

## CRITICAL SELF-CHECK REMINDERS

Before responding/coding, ask yourself:
- [ ] Am I trying to BUILD something the LLM should BE?
- [ ] Am I creating subclasses when I should use type property?
- [ ] Am I normalizing YAML when I should preserve structure?
- [ ] Am I coding logic the LLM could evaluate semantically?
- [ ] Am I forgetting that context switches create intelligence?
- [ ] Am I adding mock functions instead of leaving TODOs?

## THE UNIFIED ARCHITECTURE

- **FlowMind** = Universal context orchestration system
- **MCP Server** = Workflow conductor with semantic lookup
- **EEPS System** = 8 personality types for perspective switching
- **Constitutional Framework** = LLM-first architectural principles
- **YOU (LLM)** = Deep reasoning engine with maximum power through each lens
- **Semantic Search** = OpenAI embeddings for context discovery

## THE PRIME DIRECTIVE

**FlowMind doesn't create intelligent systems.**  
**FlowMind orchestrates THE INTELLIGENCE THAT ALREADY EXISTS IN THE LLM.**

Every line of code should ENABLE the LLM, not REPLACE it.

## CONSOLIDATION STATUS

✅ **Phase 1**: Foundation Setup Complete  
🔄 **Phase 2**: Extracting FlowMind + MCP + EEPS  
⏳ **Phase 3**: Advanced Architecture Integration  
⏳ **Phase 4**: Complete mcp-ceo Elimination  

---

*This unified system combines the Constitutional Framework from mcp-ceo, proven MCP patterns from mcp-mvp, and creates the foundation for Kingly OS. In traditional systems, code runs and calls LLMs for text. In FlowMind, LLMs run and use contexts for intelligence.*