# ADR-008: Whisper System Architecture Evolution

**Status:** Proposed  
**Date:** 2025-06-18  
**Context:** Evolution from static breadcrumb navigation to intelligent bi-directional guidance system

## Decision

Implement **hybrid evolutionary approach** for whisper system architecture, starting with situation-aware whispers and evolving toward FlowMind-style bi-directional intelligence through validated phases.

## Context

### Current State Analysis ✅
- Static breadcrumb navigation working effectively (`_01-whisper.md` - 714 lines of validation)
- Universal foreign LLM onboarding proven: "Not 100% confident? Run 'lev <command>'"  
- Fractal documentation architecture: Complete docs → Whisper breadcrumbs → Help commands
- Core system integration decision validated (whispers tightly coupled to execution)
- Foreign LLM onboarding in 4 commands demonstrated

### FlowMind Research Insights 🚀
Deep analysis of `_ref/mcp-ceo` revealed revolutionary patterns:

1. **LLM IS THE RUNTIME** - LLM itself is the execution engine, not just text generator
2. **Bi-Directional Flow** - Every component teaches every other component continuously  
3. **Context Switching = Intelligence** - Each context switch gives LLM new capabilities
4. **Semantic Conditions** - LLM evaluates conditions like "user seems frustrated" through reasoning
5. **Progressive Refinement** - Systems teach users better interaction patterns

### Architecture Options Evaluated

#### Option A: Situation-Aware Whispers (Simple)
- **Scope**: Detect user states (new, stuck, successful) and adapt whispers
- **Timeline**: 1-2 weeks
- **Risk**: Low
- **Benefits**: Immediate improvement, proven patterns

#### Option B: FlowMind Bi-Directional (Advanced)  
- **Scope**: Full bi-directional learning, semantic conditions, context assembly
- **Timeline**: 1-2 months
- **Risk**: High complexity, unproven in whisper context
- **Benefits**: Revolutionary intelligence potential

#### Option C: Hybrid Evolutionary (Selected)
- **Scope**: Phase-by-phase evolution validating each step
- **Timeline**: 3-4 months total, benefits at each phase
- **Risk**: Moderate, validated progression
- **Benefits**: Combines safety with FlowMind innovation potential

## Architecture Decision: Hybrid Evolutionary Approach

### Core Principles
1. **Validate Before Evolving** - Prove each phase works before adding complexity
2. **Production Safety** - Leviathan is live, avoid disruption to working systems
3. **FlowMind Integration** - Apply proven FlowMind patterns gradually
4. **Bi-Directional End Goal** - Target full FlowMind intelligence through safe progression

### Phase-by-Phase Implementation

#### Phase 1: Situation-Aware Whispers (Weeks 1-2)
**Goal**: Basic intelligence - whispers adapt to user state

**Implementation**:
```javascript
// Basic situation detection
class SituationAwareWhispers {
  generateWhisper(command, sessionState) {
    const userProfile = this.analyzeUserState(sessionState);
    
    if (userProfile.isNewUser && userProfile.helpFrequency > 0.3) {
      return this.generateOnboardingWhisper(command);
    }
    
    if (userProfile.successRate < 0.5) {
      return this.generateTroubleshootingWhisper(command);
    }
    
    if (userProfile.flowState === 'productive') {
      return this.generateMinimalWhisper(command);
    }
    
    return this.generateStandardWhisper(command);
  }
}
```

**Success Metrics**:
- Whisper relevance improves by 40%
- New user onboarding time reduces by 25%
- Help command dependency decreases

#### Phase 2: Effectiveness Learning (Weeks 3-4)
**Goal**: Whispers learn from what actually works

**Implementation**:
```javascript
// Track whisper effectiveness
class LearningWhispers extends SituationAwareWhispers {
  async generateWhisper(command, sessionState) {
    const whisper = await super.generateWhisper(command, sessionState);
    
    // Set up effectiveness tracking
    this.trackWhisperEffectiveness(whisper.id, sessionState.llmProfile);
    
    // Adapt based on historical effectiveness
    const historicalData = await this.getWhisperHistory(sessionState.llmProfile);
    return this.optimizeWhisperContent(whisper, historicalData);
  }
  
  recordWhisperOutcome(whisperId, outcome) {
    // Learn from: command success, user feedback, next actions
    this.updateEffectivenessModel(whisperId, outcome);
  }
}
```

**Success Metrics**:
- Whisper effectiveness improves over time
- LLM-specific preferences emerge  
- Cross-session learning demonstrates value

#### Phase 3: Progressive Refinement (Weeks 5-8)
**Goal**: Implement FlowMind teaching patterns

**Implementation**:
```javascript
// FlowMind-style progressive refinement
class ProgressiveWhispers extends LearningWhispers {
  async generateWhisper(command, sessionState) {
    const baseWhisper = await super.generateWhisper(command, sessionState);
    
    // Add progressive teaching elements
    if (this.shouldProvideGuidance(sessionState)) {
      baseWhisper.teaching = {
        why: this.explainWhisperReasoning(baseWhisper),
        better_pattern: this.suggestImprovedPattern(command),
        learning_opportunity: this.identifyLearningGap(sessionState)
      };
    }
    
    return baseWhisper;
  }
  
  // Bi-directional feedback: whisper system teaches better usage
  async handleWhisperIgnored(whisperId, sessionState) {
    return {
      guidance: "This whisper suggests X because Y. Would you like to try it?",
      adaptive_tone: "more_direct",
      alternative_suggestions: await this.generateAlternatives(whisperId)
    };
  }
}
```

**Success Metrics**:
- Users learn better interaction patterns
- Whisper system teaches itself optimization
- Bi-directional feedback loops establish

#### Phase 4: Context Assembly Recipes (Weeks 9-12) 
**Goal**: Full FlowMind context assembly with semantic conditions

**Implementation**:
```yaml
# FlowMind-style context assembly recipes
foreign_llm_onboarding:
  triggers: 
    - first_session: true
    - help_frequency: "> 0.3" 
    - success_rate: "< 0.6"
  context_assembly:
    constitutional_framework:
      source: 'agent/contexts/constitutional/'
      priority: critical
      format: progressive_disclosure
    command_discovery:
      source: 'agent/docs/commands/'  
      priority: high
      format: pattern_based
  whisper_generation:
    tone: encouraging
    complexity: minimal
    confidence_building: true
  success_metrics: [commands_learned, time_to_first_success]

multi_tab_handoff:
  triggers:
    - session_resume: true
    - different_llm_detected: true
    - context_gap: "> 0.4"
  semantic_conditions:
    - when_semantic: "user switching between different AI tools"
    - if: "urgency > 0.8" and_semantic: "user needs immediate continuation"
  context_assembly:
    session_state:
      source: 'session_manager.getCurrentState()'
      priority: critical
      format: complete_restoration
```

**Success Metrics**:
- Dynamic context assembly working
- Semantic condition evaluation functional
- Full bi-directional intelligence demonstrated

## Implementation Strategy

### Development Approach
1. **Incremental Deployment** - Each phase can be deployed independently
2. **A/B Testing** - Compare new whisper intelligence against static baseline
3. **Rollback Safety** - Maintain static whisper fallback throughout evolution
4. **FlowMind Integration** - Gradually adopt FlowMind patterns with validation

### Risk Mitigation
- **Phase Gates** - Must achieve success metrics before proceeding to next phase
- **Production Monitoring** - Track whisper effectiveness and user satisfaction
- **Complexity Budget** - Maintain simplicity until bi-directional patterns proven
- **Backward Compatibility** - Static whispers remain available as fallback

### Success Criteria
- **Phase 1**: Situation detection improves whisper relevance  
- **Phase 2**: Learning mechanisms demonstrate effectiveness improvement
- **Phase 3**: Progressive refinement shows bi-directional value
- **Phase 4**: Full context assembly achieves FlowMind-level intelligence

## Related Decisions
- ADR-001: Session Intelligence (provides session state for whisper adaptation)
- ADR-007: ACI Optimization (chunking vs full-context trade-offs apply to whispers)
- Future ADR-009: Whisper Learning Mechanisms (detailed learning implementation)
- Future ADR-010: Context Assembly Strategy (recipe-based context generation)

## References
- FlowMind Research: `_ref/mcp-ceo/src/flowmind.js` - Core bi-directional patterns
- Whisper Analysis: `_01-whisper.md` - 714 lines of static whisper validation
- Validation Examples: `drafts/whisper-validation-examples.md` - Foreign LLM onboarding proof
- Implementation Plan: `drafts/whisper-bi-directional-plan.md` - Technical details

---

**Next Step**: Create ADR-009 for Learning Mechanisms once Phase 1 situation-aware whispers are implemented and validated.