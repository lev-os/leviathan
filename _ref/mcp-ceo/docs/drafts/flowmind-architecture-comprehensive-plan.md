# FlowMind Architecture Comprehensive Plan
*Generated: 2025-01-08*

## 🎯 EXECUTIVE SUMMARY

**Project**: FlowMind Architecture Refactor & Control Flow Analysis
**Status**: Deep analysis complete, ready for simulation and implementation
**Scope**: Boot-time compilation + Runtime orchestration + Control flow scenarios

## 🏗️ ARCHITECTURE PLAN

### BOOTUP PHASE (Compilation)
```
YAML Files → Zod Validation → FlowMind Parsing → Instruction Set Generation → Registry Cache
```

### RUNTIME PHASE (Execution)  
```
MCP Request → Context Assembler (Dependency Graph) → Instruction Set Assembly → LLM Response
```

### CONTROL FLOW SCENARIOS TO ANALYZE
- IF/WHEN/ELSE logic compilation
- RECURSE/LOOP handling  
- LINEAR/FLEXIBLE workflows
- Dependency graph traversal (transitive)

## 📊 CURRENT CONTEXT FILES ANALYZED

### ADR Documents
- `/docs/adr/000-flowmind-interface-spec.md` - FlowMind v0.1.0 specification
- `/docs/adr/002-context-assembler-core-v2.md` - Protocol-based loading system
- `/docs/adr/007-flowsense-semantic-control-language.md` - v0.2.0 control flow language
- `/docs/adr/008-llm-first-flowmind-bidirectional-control.md` - MCP orchestration patterns
- `/docs/adr/009-universal-validation-framework.md` - Validation as first-class citizen
- `/docs/adr/010-confidence-based-context-handoff-protocol.md` - Advanced v0.2.0+ features

### Source Code
- `/src/flowmind.js` - Current FlowMind implementation (712 lines)
- `/src/context-assembler.js` - Context loading and assembly (414 lines)  
- `/src/assembly-rules.js` - Priority, conflict resolution, relevance filtering (740 lines)
- `/src/context-registry.js` - Context discovery and indexing (229 lines)
- `/src/context-tracker.js` - Attribution and lineage tracking (531 lines)

### Context Examples
- `/contexts/workflows/document-synthesis/context.yaml` - 6-step complex workflow
- `/contexts/agents/writing/technical-writer/validation.yaml` - Validation context
- `/contexts/agents/ceo/context.yaml` - Multi-endpoint agent with workflow composition
- `/contexts/agents/eeps/nfj-visionary/context.yaml` - EEPS personality archetype
- `/contexts/types/workspace/context.yaml` - Type definition template

### Test Files
- Test failures: 33/94 failed due to context type mismatches
- Key issue: `workflow_step` vs `workflow` type confusion
- Assembly rules filtering out all contexts (relevance threshold too high)

## 🎯 SIMULATION PLAN (30+ Files)

### Context Analysis Files (tmp/)

**Individual Context Analysis:**
- agent-ceo-analysis.md
- agent-doc-shepherd-analysis.md  
- agent-dev-analysis.md
- agent-nfj-visionary-analysis.md (+ 7 other EEPS)
- workflow-document-synthesis-analysis.md
- workflow-multi-expert-validation-analysis.md
- workflow-adr-generation-analysis.md
- workflow-bdd-specification-analysis.md
- pattern-echo-intelligence-analysis.md
- pattern-personality-analysis.md
- type-workspace-analysis.md
- type-project-analysis.md
- validation-technical-writer-analysis.md

**Control Flow Analysis:**
- if-when-else-compilation.md
- recurse-loop-handling.md
- linear-flexible-workflows.md
- dependency-graph-transitive.md

**System Analysis:**
- context-tracker-purpose-analysis.md
- context-assembler-utility-analysis.md
- mcp-integration-patterns.md
- scaling-without-mini-llm.md
- instruction-set-compilation.md

**Final Synthesis:**
- flowmind-architecture-recommendations.md

## 🚨 CRITICAL ISSUES IDENTIFIED

### Issue #1: Unknown Context Type `workflow_step`
- **Root cause**: FlowMind execution returns `workflow_step` type
- **Assembly rules only recognize**: `agent`, `workflow`, `pattern`, `core_principles`
- **Fix**: Separate execution results from context types

### Issue #2: Assembly Rules Too Aggressive
- 3 contexts loaded → 0 after relevance filtering
- Mock embeddings returning 0 similarity
- Relevance threshold 0.6 too high for mocks

### Issue #3: Property Access Mismatch
- Tests expect `.name` to equal `metadata.id`
- FlowMind returns `metadata.name || metadata.id`
- ADR-000 specifies 1:1 YAML mapping

## 🔄 DEPENDENCY ANALYSIS

### Context Dependency Types
1. **Direct Dependencies**: Agent → Validation context
2. **Workflow Dependencies**: Workflow step → Personality agent
3. **Transitive Dependencies**: Agent → Pattern → Validation
4. **Recursive Dependencies**: CEO → Multi-expert-validation → CEO endpoints

## 💡 SCALING SOLUTIONS TO EVALUATE

### Option A: Dependency Graph Assembly
- For each request, traverse dependency tree
- Send related instruction sets as context
- Scales by selective loading

### Option B: System Prompt Compilation  
- Compile all instruction sets at boot
- Single comprehensive system prompt
- Token limit concerns

### Option C: Whisper-like Streaming
- Send instruction sets periodically
- LLM maintains internal state
- No mini LLM required

## 🏗️ CLARIFIED ARCHITECTURE (Based on User Input)

### Single FlowMind (Not Separate Classes)
```
FlowMind = One class that evolves from "lite" → "full" capabilities
- Boot: Compiled instruction sets (like OS bootloader)  
- Runtime: Uses Context Assembler utility as needed
```

### Service Boundaries
```
1. BOOTUP (Compilation Phase):
   - YAML load & validation
   - Process instruction sets 
   - Cache compiled contexts
   
2. RUNTIME (Execution Phase):
   - MCP request handler
   - Context Tracker (attribution/lineage)
   - Context Assembler (utility for dependency graphs)
```

### Control Flow Scenarios to Explore

**1. IF/WHEN/ELSE Logic:**
```yaml
# How does this compile at boot?
# When does LLM get notified?
when: "user frustrated"
then: activate_empathy_mode
else: continue_normal
```

**2. RECURSE/LOOP:**
```yaml
# Recursive workflow composition
while: "confidence < 0.8"
do: gather_more_context
max_iterations: 3
```

**3. LINEAR/FLEXIBLE WORKFLOWS:**
```yaml
# Step-by-step vs adaptive
workflow_type: "flexible"
steps: [analyze, decide, act]
adaptation: "skip_steps_if_confident"
```

## 🎯 CONTEXT ECOSYSTEM DISCOVERED

### Current Context Types in System
1. **`agent`** - Individual personalities/roles
   - CEO (complex multi-endpoint)
   - Doc-shepherd (documentation specialist)  
   - Dev (development agent)
   - EEPS personalities (8 psychological archetypes)
   - Writing team (technical-writer, technical-editor)

2. **`workflow`** - Multi-step processes
   - document-synthesis (6 steps)
   - multi-expert-validation (complex validation)
   - adr-generation, bdd-specification
   - cognitive-parliament, emotion-synthesis

3. **`pattern`** - Reusable templates
   - echo-intelligence-patterns (confidence, gap analysis)
   - personality patterns
   - Various thinking frameworks

4. **`type`** - Templates/schemas
   - workspace, project, portfolio
   - Define structure for new instances

5. **`validation`** - Specialized validators ⭐
   - technical-writer-validator
   - technical-editor-validator
   - Built-in validation workflows

6. **`workspace`** - Runtime containers ⭐
   - Project boundaries
   - Resource isolation
   - Agent assignment

### Sophisticated Architecture Patterns Found

**1. VALIDATION AS FIRST-CLASS CITIZENS**
```yaml
# Agents can have dedicated validators
contexts/agents/writing/technical-writer/
├── context.yaml
└── validation.yaml  # ⭐ Separate validation context

# In agent context.yaml
validation:
  context: "validation://technical-writer-validator"
  confidence_required: 0.95
```

**2. MULTI-ENDPOINT AGENTS**
```yaml
# CEO has multiple perspectives
endpoints:
  default: "Balanced executive"
  product: "Product Owner perspective"  
  crisis: "Emergency response"
  
  enhanced_workflows:
    strategic_analysis:
      workflow_reference: "document-synthesis + multi-expert-validation"
      activation_pattern: "WHEN major_strategic_decision"
```

**3. RECURSIVE WORKFLOW COMPOSITION**
```yaml
# CEO can compose workflows dynamically
recursive_composition: |
  COMPLEX_SCENARIO_PATTERN:
    1. ANALYZE scenario_complexity
    2. SELECT appropriate_workflows 
    3. COMPOSE workflows IN optimal_sequence
    4. EXECUTE recursive_workflow_chain
```

**4. SOPHISTICATED EEPS PSYCHOLOGY**
```yaml
# NFJ-Visionary has deep psychological modeling
core_attributes:
  mbti_type: "NFJ"
  core_emotion: "fear"
  survival_instinct: "flight"
  moral_projection: "empathy"
  
feedback_dynamics:
  type: "positive"
  mathematical_model: "dx/dt = kx"
  description: "Amplifies future possibilities"
```

## 📋 NEXT STEPS

1. **Execute simulation** - Generate 30+ analysis files in tmp/
2. **Analyze Context Tracker purpose** - Understand attribution/lineage role
3. **Fix Issue #1** - Separate execution from context types
4. **Implement proper control flow** - Based on simulation results
5. **Define dependency graph traversal** - Transitive dependencies
6. **Choose scaling solution** - Dependency graph vs compilation approaches

## 🔗 FILE REFERENCES

**All files currently in context:**
- ADRs: 6 architecture decision records
- Source: 5 core implementation files  
- Contexts: 8+ example context files
- Tests: Integration and unit test suites
- This analysis encompasses full system understanding

## 💡 KEY INSIGHTS

1. **Current system is more sophisticated than ADR-000 suggests**
2. **Validation is already first-class** (ADR-009 implemented)
3. **Multi-endpoint agents working**
4. **Complex workflow composition exists**
5. **Psychological modeling is sophisticated**
6. **Need to enhance, not regress the architecture**

## 🎯 SIMULATION REQUIREMENTS

- **Context Tracker Analysis**: Yes, analyze actual purpose
- **Dependency Depth**: Transitive dependencies 
- **Control Flow Priority**: All scenarios (if/when/else, recurse/loop, linear/flexible)
- **Mini LLM Assumption**: No, simulation should not assume mini LLM availability

---

*This document captures the complete state of FlowMind architecture analysis as of 2025-01-08. Ready for simulation and implementation phases.*