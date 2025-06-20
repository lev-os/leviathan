# ADR-010: Context Assembly Strategy

**Status:** TBD  
**Date:** 2025-06-18  
**Context:** Defining how whispers dynamically assemble context - from loose object whispers to recipe-based to semantic conditions

## Decision

**TBD** - Capture architectural concepts for context assembly evolution. Start with existing loose object whispers, evolve to recipe-based JS/YAML hybrid, eventually to semantic condition evaluation.

## Context

### Initial Vision: Mini System Prompts
**Original Concept**: Serve up mini system prompts at various workflow stages
- When workflow step 3 requests dev agent acting as debugger → return all debugger context
- Dynamic context injection based on workflow state
- Context assembly as intelligent prompt engineering

### Deployment Context Distinction

#### Claude Code Scenario
- **File References Work** - Can return file paths for context loading
- Context files stored locally, referenced by path
- Efficient for desktop/CLI environments

#### Internet UI Scenario  
- **Contexts Must Exist in Host** - Cannot reference local files
- Context content must be embedded or served remotely
- Different assembly strategy needed for web deployment

### Architecture Evolution Path

#### Phase 1: Loose Object Whispers (Current/Validated) ✅
**What we already have working**:
```yaml
# _whisper.md loose object structure - PROVEN
getting_started:
  rotate:
    - "💡 New to Leviathan? Run 'lev prime' to load context"
    - "💡 Not 100% confident? Try 'lev find <task>'"
  frequency: session_start

command_discovery:
  content: "→ Use 'lev find <describe-task>' for workflow discovery"
  frequency: every_3rd
```

**Success Metrics**: Foreign LLM onboarding in 4 commands ✅

#### Phase 2: Recipe-Based Assembly (Planned)
**Implementation Approach**: Option A + Option C hybrid
- **YAML Structure** - Define recipes declaratively  
- **JS Rules Engine** - Implement logic in JavaScript based on YAML
- **File Reference Support** - Claude Code file paths
- **Host Context Support** - Embedded content for web UI

**Example Architecture**:
```yaml
# recipes.yaml - Declarative structure
foreign_llm_onboarding:
  triggers:
    first_session: true
    help_frequency: "> 0.3"
    success_rate: "< 0.6"
  context_sources:
    constitutional: 'agent/contexts/constitutional/'
    commands: 'agent/docs/commands/'
    examples: 'plugins/@lev-os/workshop/examples/'
  assembly_strategy: progressive_disclosure
```

```javascript
// context-assembler.js - JS rules engine
class ContextAssembler {
  async assembleContext(recipe, sessionState, deployment) {
    const triggers = this.evaluateTriggers(recipe.triggers, sessionState);
    if (!triggers.match) return null;
    
    if (deployment === 'claude-code') {
      return this.assembleFileReferences(recipe.context_sources);
    } else {
      return this.assembleHostedContent(recipe.context_sources);
    }
  }
}
```

#### Phase 3: Semantic Conditions (Future Magic)
**Eventually evolve to**: FlowMind-style semantic evaluation
```yaml
# Future: Semantic condition evaluation
semantic_assembly:
  when_semantic: "user seems frustrated with command discovery"
  and: "technical_complexity > 0.7"
  load_context: "patient_debugging_with_encouragement"
```

## Architectural Options Captured

### Option A: Recipe-Based Assembly 📋
**Concept**: YAML-defined recipes with structured context assembly
- **Pros**: Structured, maintainable, debuggable
- **Implementation**: YAML + JS rules engine hybrid
- **Timeline**: 3-4 weeks after loose object validation

### Option B: Semantic Condition Evaluation 🧠  
**Concept**: LLM-evaluated natural language conditions
- **Pros**: Dynamic intelligence, handles complex scenarios
- **Implementation**: Future evolution from recipe-based
- **Timeline**: Research horizon after recipe system proven

### Option C: Simple Rule-Based 🔧
**Concept**: Direct JavaScript conditional logic
- **Pros**: Fast, predictable, easy to debug
- **Implementation**: JS rules engine component of hybrid approach
- **Timeline**: Immediate - part of recipe-based implementation

## Implementation Strategy: Progressive Evolution

### Immediate: Validate Loose Object Whispers
**Priority 1**: Ensure current whisper system works before evolving
- Implement loose object structure from `_whisper.md`
- Validate foreign LLM onboarding effectiveness  
- Establish baseline metrics for improvement

### Phase 4A: Recipe Foundation (Future)
**When**: After Phase 1-3 completion and validation
```javascript
// Minimal recipe system
class RecipeBasedAssembly {
  constructor(recipes, deployment) {
    this.recipes = yaml.load(recipes);
    this.deployment = deployment; // 'claude-code' | 'web-ui'
  }
  
  async assembleForSituation(situation, sessionState) {
    const matchingRecipe = this.findMatchingRecipe(situation, sessionState);
    if (!matchingRecipe) return this.getDefaultWhisper();
    
    return this.assembleContext(matchingRecipe, sessionState);
  }
}
```

### Phase 4B: Deployment-Aware Assembly (Future)
```javascript
// Handle Claude Code vs Web UI context delivery
class DeploymentAwareAssembly extends RecipeBasedAssembly {
  async assembleContext(recipe, sessionState) {
    if (this.deployment === 'claude-code') {
      return {
        type: 'file_references',
        contexts: recipe.context_sources.map(source => ({
          path: this.resolvePath(source),
          section: source.section || 'full'
        }))
      };
    } else {
      return {
        type: 'embedded_content',
        contexts: await Promise.all(
          recipe.context_sources.map(source => this.loadContent(source))
        )
      };
    }
  }
}
```

## Unresolved Questions & Research Areas

### Context Delivery Optimization
- **File Reference Efficiency**: How to optimize context loading for Claude Code
- **Host Context Caching**: Web UI context delivery and caching strategies
- **Context Size Limits**: Maximum context assembly size for different LLMs

### Recipe Complexity Management  
- **Recipe Composition**: How recipes combine and override each other
- **Conflict Resolution**: When multiple recipes match same situation
- **Recipe Debugging**: Tools for understanding why specific context was assembled

### Semantic Evolution Path
- **Condition Evaluation**: When to introduce LLM-based semantic evaluation
- **Performance Impact**: Cost/latency of semantic condition evaluation
- **Reliability**: How to make semantic conditions predictable enough for production

## Related Decisions
- ADR-008: Whisper System Architecture (defines phase-by-phase evolution)
- ADR-009: Whisper Learning Mechanisms (system effectiveness optimization)
- Future ADR-011: Dual LLM Integration (potential context assembly optimization)

## References
- Loose Object Validation: `_whisper.md` - Proven whisper structure
- FlowMind Context Assembly: `_ref/mcp-ceo/src/assembly/ContextAssembler.js`
- Foreign LLM Onboarding: `drafts/whisper-validation-examples.md`
- Implementation Research: `drafts/whisper-bi-directional-plan.md`

---

**Status: TBD** - Concepts captured for future implementation after loose object whispers validated and Phase 1-3 completed successfully.