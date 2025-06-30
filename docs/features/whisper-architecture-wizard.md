# Whisper Architecture Decision Wizard

*Based on deep analysis of FlowMind bi-directional patterns from _ref/mcp-ceo*

## 🔍 Research Insights Summary

### FlowMind Revolution Discovered:
1. **LLM is the Runtime** - Not code, the LLM IS the execution engine
2. **Bi-Directional Flow** - Every component teaches every other component 
3. **Context Switching = Intelligence** - Each context switch gives LLM new capabilities
4. **Single Class Design** - Everything is a FlowMind context, behavior from YAML not inheritance
5. **Semantic Conditions** - LLM evaluates conditions through reasoning, not regex

### Dual LLM Architecture:
- **Beta LLM** (Claude/GPT-4): User interaction, variable extraction, orchestration
- **Alpha LLM** (Smaller/Faster): Semantic evaluation, context parsing, condition checking  
- **MCP Server**: Coordination hub with continuous learning loops

### FlowMind Control Language (YAML):
- Multi-personality activation based on triggers
- Hormone-based profiles (serotonin, dopamine, testosterone, oxytocin)
- Bootstrap sovereignty - scales from minimal hardware
- Progressive disclosure - complexity revealed when needed

---

## 🏗️ Current Whisper System State

### What We Have ✅
- Static breadcrumb navigation in `_01-whisper.md` (714 lines of analysis)
- Universal foreign LLM onboarding pattern: "Not 100% confident? Run 'lev <command>'"
- Fractal documentation: Complete docs → Whisper breadcrumbs → Help commands
- Core vs Plugin decision: **Core system integration** (whispers tightly coupled to execution)

### What We're Missing ⚠️
- **Bi-directional feedback loops** - whispers don't learn from effectiveness
- **Context assembly recipes** - whispers are static, not situation-aware
- **LLM-specific adaptations** - same whisper for Claude vs GPT-4 vs local models
- **Progressive refinement** - no teaching mechanisms for better whisper usage

---

## 🧙‍♂️ Decision Wizard

### Step 1: Architecture Foundation Choice

**Question**: How should whispers evolve from static breadcrumbs to intelligent guidance?

**Option A: Situation-Aware Whispers (Simple)**
- Detect: new user, stuck, success patterns
- Generate context-appropriate whispers
- Basic learning from session history
- **Timeline**: 1-2 weeks implementation

**Option B: FlowMind-Style Bi-Directional (Advanced)**  
- Full bi-directional flow: LLM ↔ Whisper System ↔ Context Assembly
- Continuous learning loops and progressive refinement
- Context assembly recipes with semantic conditions
- **Timeline**: 1-2 months implementation  

**Option C: Hybrid Approach (Recommended)**
- Start with situation-aware whispers (Phase 1)
- Add bi-directional patterns gradually (Phase 2+)
- Validate each phase before expanding
- **Timeline**: Iterative, validate-first approach

*Which approach aligns with your goals?*

---

### Step 2: Learning Mechanism Design

**Question**: How should whispers learn and improve over time?

**Option A: Session-Based Learning**
- Track what whispers lead to successful command execution
- Adapt whispers based on user success patterns
- Simple effectiveness scoring
- **Scope**: Individual user optimization

**Option B: Cross-LLM Learning Pool**
- Learn from all LLMs using the system (GPT-4, Claude, local models)
- Share effective whisper patterns across LLM types
- Build preference profiles per LLM provider
- **Scope**: Universal LLM optimization

**Option C: FlowMind Teaching Patterns**
- Implement progressive refinement like FlowMind Beta ↔ MCP
- Whispers provide guidance AND teach better whisper usage
- Context assembly recipes that adapt based on semantic conditions
- **Scope**: Emergent intelligence through bi-directional teaching

*What level of learning sophistication do you want?*

---

### Step 3: Context Assembly Implementation

**Question**: How should whispers dynamically assemble context for different situations?

**Option A: Recipe-Based Assembly**
```yaml
# Context recipes for different scenarios
foreign_llm_onboarding:
  triggers: [first_session, help_frequency > 0.3, success_rate < 0.6]
  context_sources: [constitutional_framework, command_discovery, quick_wins]
  whisper_tone: encouraging
  success_metrics: [commands_learned, time_to_first_success]

multi_tab_handoff:
  triggers: [session_resume, different_llm_detected, context_gap > 0.4]
  context_sources: [session_state, work_progression, llm_preferences]
  whisper_tone: seamless_continuation
  success_metrics: [context_continuity, handoff_success_rate]
```

**Option B: Semantic Condition Evaluation** 
```yaml
# FlowMind-style semantic conditions evaluated by LLM
whisper_activation:
  when_semantic: "user seems frustrated with command discovery"
  if: "urgency > 0.8" and_semantic: "user is new to system"
  load_context: "simplified_onboarding_with_encouragement"
  tone_override: "extra_patient_and_clear"
```

**Option C: Simple Rule-Based**
```javascript
// Basic conditional logic
if (newUser && helpCommandsUsed > 2) {
  return generateOnboardingWhisper();
} else if (successRate < 0.5) {
  return generateTroubleshootingWhisper();
}
```

*Which context assembly approach fits the Leviathan architecture?*

---

### Step 4: Dual LLM Integration

**Question**: Should whispers implement dual LLM architecture like FlowMind?

**Option A: Single LLM (Current)**
- User's chosen LLM handles everything
- Whispers generated by same LLM processing commands
- Simpler architecture, lower complexity
- **Trade-off**: No specialized optimization

**Option B: Dual LLM FlowMind Pattern**
- **Beta LLM** (User's choice): Command execution, user interaction
- **Alpha LLM** (TinyLlama/Fast): Whisper optimization, context analysis
- Continuous learning between LLMs
- **Trade-off**: Added complexity, requires two LLM providers

**Option C: Optional Dual Mode**
- Default: Single LLM mode
- Advanced: Dual LLM mode for optimization
- Feature flag to enable dual mode
- **Trade-off**: Complexity of supporting both modes

*Do you want to implement dual LLM architecture now or later?*

---

### Step 5: Implementation Priority

**Question**: What's the implementation order for maximum impact?

**Priority Option A: Foundation First**
1. Situation-aware whispers (detect new user, stuck, success)
2. Basic learning (track whisper effectiveness)  
3. Context assembly recipes
4. Cross-LLM optimization
5. Dual LLM architecture

**Priority Option B: Learning First**
1. Bi-directional feedback collection
2. Progressive refinement patterns
3. Context assembly with semantic conditions
4. Situation-aware whispers  
5. Dual LLM implementation

**Priority Option C: FlowMind All-In**
1. Implement full FlowMind patterns immediately
2. Dual LLM architecture from start
3. Complete bi-directional flow
4. Semantic condition evaluation
5. Progressive refinement teaching

*Which implementation priority makes most sense given Leviathan's current state?*

---

## 🎯 Next Steps

Based on your answers, I'll create specific ADRs:

1. **ADR-008: Whisper Architecture Foundation** - Your choice from Step 1
2. **ADR-009: Whisper Learning Mechanisms** - Your choice from Step 2  
3. **ADR-010: Context Assembly Strategy** - Your choice from Step 3
4. **ADR-011: Dual LLM Integration Plan** - Your choice from Step 4
5. **ADR-012: Implementation Roadmap** - Your choice from Step 5

Each ADR will follow the existing pattern (Status, Date, Context, Decision, Implementation) and reference the FlowMind research insights.

---

## 🤔 Recommendations Based on FlowMind Analysis

My recommendations after deep research:

1. **Step 1**: **Option C (Hybrid)** - Start simple, evolve to FlowMind patterns
2. **Step 2**: **Option B (Cross-LLM Learning)** - Maximum leverage from FlowMind insights
3. **Step 3**: **Option A (Recipe-Based)** initially, evolve to **Option B (Semantic)** 
4. **Step 4**: **Option C (Optional Dual)** - Feature flag approach
5. **Step 5**: **Option A (Foundation First)** - Validate each phase

**Rationale**: FlowMind patterns are revolutionary but complex. Start with proven foundations, then evolve to full bi-directional intelligence.

---

**Ready to go through the wizard step by step?**