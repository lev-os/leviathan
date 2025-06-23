# ADR-015: Emotional Evolution Personality System Integration

**Status**: Proposed  
**Date**: 2025-01-26  
**Deciders**: JP Smith, Kingly Architecture Team

## Context

We're integrating the Emotional Evolution Personality System (EEPS) from extensive Grok conversations into Kingly. This system models 8 personality types based on evolutionary survival instincts, creating a "Cognitive Parliament" where different perspectives debate decisions.

The system is novel and experimental, requiring careful integration with toggle controls to prevent overwhelming users or disrupting existing workflows.

## Decision

Implement EEPS as an optional workflow system with **4 verbosity modes**:

1. **OFF** - System disabled entirely
2. **SILENT** - Active but invisible (LLM uses internally, no output)
3. **MEDIUM** - Friendly names only ("Caregiver perspective", no MBTI codes)
4. **VERBOSE** - Full technical details (SFJ codes, neurotransmitters, etc.)

### Implementation Architecture

```yaml
# Configuration in context or MCP response
eeps_config:
  enabled: true
  verbosity: "medium"  # off | silent | medium | verbose
```

### Verbosity Mode Examples

#### VERBOSE Mode Output:
```
🧠 COGNITIVE PARLIAMENT ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SFJ CAREGIVER (Disgust/Sympathy):
- Neurotransmitter: Serotonin
- IGT Strategy: Win-Win
- Analysis: "This approach maintains group harmony..."

NFP ADVOCATE (Stress/Compassion):
- Neurotransmitter: Adrenaline
- IGT Strategy: Win-Lose
- Analysis: "We must consider who suffers if..."

ENTROPY LEVEL: 0.73 (High - Yang activation)
EMOTION SYNTHESIS: Joy emerging from SFJ+NFJ
```

#### MEDIUM Mode Output:
```
📊 Multiple Perspectives Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAREGIVER view: "This maintains stability and protects the team..."
ADVOCATE view: "Consider the human impact and suffering..."
VISIONARY view: "Long-term, this creates opportunities for..."

Synthesis: Balanced approach considering both stability and innovation.
```

#### SILENT Mode:
```
[No EEPS output - analysis happens internally]
Regular response without personality indicators
```

#### OFF Mode:
System bypassed entirely, no EEPS processing.

## Implementation Plan

### 1. Context Structure
```
contexts/
  workflows/
    cognitive-parliament/
      context.yaml          # Main workflow
      verbosity-modes.yaml  # Output templates per mode
    entropy-router/
      context.yaml
    emotion-synthesis/
      context.yaml
  agents/
    eeps/
      sfj-caregiver/
      nfp-advocate/
      nfj-visionary/
      stp-adapter/
      stj-leader/
      ntp-innovator/
      ntj-strategist/
      sfp-connector/
  patterns/
    personality/
      emotional-evolution.yaml  # Extends existing personality pattern
```

### 2. MCP Tool Updates

```javascript
// In MCP response
return {
  message: result,
  agentInstructions: assembleInstructions(context, eepsConfig),
  eepsAnalysis: eepsConfig.verbosity !== 'off' ? analysis : null,
  // Logging controlled by verbosity
  debugInfo: eepsConfig.verbosity === 'verbose' ? fullDetails : null
}
```

### 3. Workflow Triggers

```yaml
triggers:
  respect_config: true  # Always check eeps_config first
  automatic:
    - "confidence < 0.8 AND eeps_enabled"
    - "user_preference = 'multiple_perspectives'"
  manual:
    - "invoke parliament"
    - "eeps analysis"
```

### 4. Toggle Implementation

```yaml
# In any context or agent
eeps_override:
  enabled: false  # Local override
  verbosity: "silent"
  
# Global preference
contexts/preferences/eeps-settings/context.yaml:
  default_enabled: true
  default_verbosity: "medium"
  
  # Per-domain settings
  domain_overrides:
    technical_tasks: "silent"
    creative_tasks: "verbose"
    business_decisions: "medium"
```

## Consequences

### Positive
- Novel personality-based decision making
- Rich multi-perspective analysis
- Configurable to user preferences
- Can test effectiveness silently before full rollout
- Extends existing Kingly patterns naturally

### Negative
- Adds complexity to prompt engineering
- May increase token usage (mitigated by verbosity controls)
- Learning curve for users
- Potential for over-analysis on simple tasks

### Mitigation Strategies
1. Start with SILENT mode by default
2. Provide clear documentation on modes
3. Add shortcuts: "eeps on verbose", "eeps off"
4. Monitor performance impact
5. A/B test effectiveness

## Implementation Priority

1. **Phase 1**: Core YAML contexts (no verbosity controls)
2. **Phase 2**: Basic on/off toggle
3. **Phase 3**: 4-mode verbosity system
4. **Phase 4**: Domain-specific auto-configuration
5. **Phase 5**: Performance optimization

## Success Metrics

- User engagement with different modes
- Decision quality improvement (A/B testing)
- Token usage per mode
- User satisfaction ratings
- Adoption rate after silent testing

## References

- Original research: `kingly/drafts/research/josh1.md`, `josh2.md`
- Synthesis documents in `kingly/drafts/research/`
- Existing personality pattern: `contexts/patterns/personality/context.yaml`
- Multi-expert validation: `contexts/workflows/multi-expert-validation/`

## Notes

This is an experimental feature that could fundamentally change how Kingly makes decisions. The toggle system ensures we can:
1. Test safely in production
2. Gradually roll out to users
3. Customize per use case
4. Maintain backwards compatibility

The verbosity modes ensure accessibility - from technical users who want full details to business users who just want insights.

Looking at the existing context structure, here's how the EEPS would fit perfectly:

  1. Create New Workflow Context

  ```
  # kingly/contexts/workflows/cognitive-parliament/context.yaml
  metadata:
    type: "workflow"
    id: "cognitive-parliament"
    version: "1.0.0"
    description: "Multi-personality deliberation using Emotional Evolution framework"

  workflow_config:
    philosophy: "8 personality types debate decisions through evolutionary lenses"

    triggers:
      automatic:
        - "confidence_level < 0.8"
        - "complex_emotional_decision"
        - "requires_multiple_perspectives"
      manual:
        - "invoke parliament"
        - "debate this"

    personality_system:
      eeps_mapping:
        sfj_caregiver:
          core_emotion: "disgust"
          survival_instinct: "freeze"
          moral_projection: "sympathy"
          igt_strategy: "win_win"
          neurotransmitter: "serotonin"

        nfp_advocate:
          core_emotion: "stress"
          survival_instinct: "fight"
          moral_projection: "compassion"
          igt_strategy: "win_lose"
          neurotransmitter: "adrenaline"

        # ... other 6 personalities

    entropy_routing:
      assessment_prompt: |
        Evaluate situation entropy based on:
        - Uncertainty: {context_uncertainty}
        - Change rate: {change_velocity}
        - Complexity: {decision_complexity}

        Route to:
        - Low (0-0.3): Yin agents (S types) for stability
        - High (0.7-1): Yang agents (N types) for innovation

    emotion_synthesis:
      joy_formula:
        agents: ["sfj", "nfj"]
        combination: "disgust + fear"
        result: "left-brain harmony, serotonin + dopamine"
  ```
  
  2. Extend Existing Personality Pattern

  # kingly/contexts/patterns/personality/emotional-evolution.yaml
  metadata:
    type: "pattern"
    id: "emotional-evolution"
    extends: "personality"

  personalities:
    # Map existing personalities to EEPS
    cortisol_guardian:
      eeps_types: ["SFJ", "STJ"]  # Yin stability types

    abundance_amplifier:
      eeps_types: ["NFP", "NTP"]  # Yang innovation types

    sovereignty_architect:
      eeps_types: ["NTJ", "NFJ"]  # Strategic vision types

    empathetic_connector:
      eeps_types: ["SFP", "STP"]  # Adaptive bonding types

  # Add EEPS-specific dynamics
  eeps_dynamics:
    feedback_loops:
      yin_types: "negative feedback for stability"
      yang_types: "positive feedback for change"

    moral_projections:
      sympathy: "sfj"
      compassion: "nfp"
      empathy: "nfj"
      reciprocal_altruism: "sfp"

  3. Integration with Multi-Expert Validation

  The existing multi-expert-validation workflow already uses multiple lenses. We can enhance it:

  # Add to multi-expert-validation
  eeps_enhancement:
    personality_mapping:
      legal_lens: "STJ"  # Rule enforcement
      business_lens: "NTP"  # Strategic innovation
      psychology_lens: "NFJ"  # Empathetic understanding
      technical_lens: "STP"  # Practical adaptation
      adversarial_lens: "NTJ"  # Strategic control

  4. Create Agent Context Templates

  # kingly/contexts/agents/eeps/sfj-caregiver/context.yaml
  metadata:
    type: "agent"
    id: "sfj-caregiver"
    personality_framework: "eeps"

  agent_config:
    system_prompt: |
      You embody the SFJ Caregiver personality:
      - Core emotion: Disgust (maintaining order)
      - Moral lens: Sympathy (caring for others)
      - IGT strategy: Win-Win (stability)
      - Seek: Serotonin-based harmony

      When analyzing, always consider:
      - Group harmony and well-being
      - Established traditions and norms
      - Preventing disorder and chaos

  5. Key Integration Points

  1. Reuse Document Synthesis - The overlapping shard strategy could analyze conversations through different personality lenses
  2. Enhance Workflow Assembly - The root context already supports workflow invocation, perfect for parliament mode
  3. Leverage Existing Patterns - Decision matrix, SOAR analysis, etc. can be personality-enhanced
  4. Universal Context Inheritance - All EEPS components inherit memory, callbacks, and LLM-first principles

  Implementation Steps:

  1. Create contexts/workflows/cognitive-parliament/
  2. Create contexts/workflows/entropy-router/
  3. Create contexts/workflows/emotion-synthesis/
  4. Create contexts/agents/eeps/ with 8 subdirectories
  5. Add EEPS enhancement to existing workflows
  6. Update root context to include new types if needed