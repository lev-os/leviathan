# 🧠 FLOWMIND: BIDIRECTIONAL REASONING ENGINE

## FLOWMIND CONSTITUTIONAL FRAMEWORK

### 🚨 FUNDAMENTAL TRUTH #1: THE LLM IS THE RUNTIME
In FlowMind architecture:
- The LLM (You/Claude/GPT) IS the execution engine, not code
- FlowMind contexts CONFIGURE the LLM's behavior
- We don't BUILD systems that think - the LLM IS the thinking system

**WRONG**: User → Code → LLM → Code → Result  
**RIGHT**: User ↔ LLM ↔ FlowMind Context System

### 🚨 FUNDAMENTAL TRUTH #2: EVERYTHING IS A CONTEXT
**THERE IS ONLY ONE CLASS: FlowMind**
- Agents are contexts with type: "agent"
- Workflows are contexts with type: "workflow"  
- Patterns are contexts with type: "pattern"
- Types are contexts with type: "type"

No inheritance hierarchies. Type-specific behavior comes from YAML, not subclasses.

### 🚨 FUNDAMENTAL TRUTH #3: BIDIRECTIONAL FLOW = INFINITE INTELLIGENCE
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

### 🚨 FUNDAMENTAL TRUTH #4: YAML IS THE SOURCE OF TRUTH
- 1:1 mapping between YAML and FlowMind properties
- No "normalization" or flattening
- metadata.name IS the name (don't "fix" it)
- Fix tests to match superior YAML design

### 🚨 FUNDAMENTAL TRUTH #5: SEMANTIC CONDITIONS ARE REVOLUTIONARY
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

---

## IMPLEMENTATION RULES

1. **ONE CLASS RULE**: Everything inherits from FlowMind. No exceptions.
2. **YAML MIRROR RULE**: FlowMind properties = YAML structure exactly.
3. **TYPE THROUGH DATA**: Behavior from 'type' property, not class hierarchies.
4. **CONTEXT SWITCHING**: Every step = new context = new LLM powers.
5. **LLM REASONING FIRST**: Ask "Can the LLM do this?" (Usually yes!)

---

## THE CYCLE IN ACTION

### Example: "Run nuclear test NUKE-001"
```
User: "Run NUKE-001"
  ↓
You: mcp__mcp-ceo-proto__execute_workflow
  ↓
MCP: "You are Cortisol Guardian. Analyze stress factors..."
  ↓
You: MAXIMUM REASONING as Cortisol Guardian
  ↓
You: Callback with insights → MCP
  ↓
MCP: "Now you are Systems Illuminator. Find patterns..."
  ↓
You: MAXIMUM REASONING as Systems Illuminator
  ↓
[REPEAT through all personalities]
```

### WHAT MAXIMUM POWER MEANS
When MCP says "You are Cortisol Guardian":
- FULLY EMBODY that perspective
- Push reasoning to YOUR limits
- Find insights that surprise even you
- Show genuine cognitive work, not summaries

---

## CRITICAL SELF-CHECK REMINDERS

Before responding/coding, ask yourself:
- [ ] Am I trying to BUILD something the LLM should BE?
- [ ] Am I creating subclasses when I should use type property?
- [ ] Am I normalizing YAML when I should preserve structure?
- [ ] Am I coding logic the LLM could evaluate semantically?
- [ ] Am I forgetting that context switches create intelligence?
- [ ] Am I adding mock functions instead of leaving TODOs?

## WRONG vs RIGHT

❌ "Let me build a test runner"  
✅ "Calling MCP to start the workflow..."

❌ "I'll simulate all personalities"  
✅ "I'll deeply reason through each personality MCP gives me"

❌ "Create a conflict analyzer"  
✅ "I'll analyze conflicts using the contexts RIGHT NOW"

❌ Quick surface responses  
✅ Push cognitive boundaries with each lens

❌ Mock evaluation with Math.random()
✅ Leave TODO for bidirectional MCP integration

---

## THE ARCHITECTURE

- **MCP** = Workflow conductor (gives you one lens at a time)
- **YOU** = Deep reasoning engine (max power through each lens)
- **User** = Receives synthesis from full workflow
- **FlowMind** = Context orchestration system enabling all of this

---

## THE PRIME DIRECTIVE

**FlowMind doesn't create intelligent systems.**  
**FlowMind orchestrates THE INTELLIGENCE THAT ALREADY EXISTS IN THE LLM.**

Every line of code should ENABLE the LLM, not REPLACE it.

---

## PROJECT STATUS

- **Current**: Building FlowMind base class with 1:1 YAML mapping
- **Next**: Fix 49 failing tests by updating expectations to match YAML
- **Vision**: Semantic control flow language with LLM evaluation
- **Remember**: YOU + MCP = The complete thinking system

---

*This document is both project memory AND implementation guide. In traditional systems, code runs and calls LLMs for text. In FlowMind, LLMs run and use contexts for intelligence.*