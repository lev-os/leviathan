# Hormonal Optimization Implementation Plan

**Source**: Stress Reduction vs. Hormonal Optimization Audit
**Date**: 2025-01-19
**Status**: Phase 1 Complete, Circadian Enhancement Added

## ✅ COMPLETED: Circadian Rhythm Integration

Enhanced the constitutional framework with sophisticated circadian awareness:

### Core Changes Made:
1. **Constitutional Framework** (`agent/src/core/constitutional-framework.js`):
   - Added `EVENING_WIND_DOWN` neurochemical profile with `cortisol: 'minimal_night_mode'`
   - Enhanced all profiles with `circadian_optimization` parameters
   - Updated `assessOptimalNeurochemicalProfile()` with time-of-day logic:
     - **Evening override**: Minimal cortisol after 8pm (unless emergency)
     - **Morning focus**: Enhanced analytical mode 6am-10am
     - **Afternoon creativity**: Optimized innovation hours 1pm-5pm
     - **Emergency override**: Crisis management regardless of time

2. **Constitutional Validation** (`agent/src/commands/constitutional-validate.js`):
   - Added circadian mode detection: `morning_clarity`, `midday_peak`, `afternoon_creativity`, `evening_execution`, `night_wind_down`
   - Enhanced neurochemical recommendations with time-aware guidance
   - Added circadian consideration to all assessments

### Key Behavioral Changes:
- **More cortisol during day when appropriate** ✅
- **Minimal cortisol at night** ✅ (unless emergency override)
- **Time-specific optimization** for creativity, focus, and energy
- **Respects natural circadian rhythms** while allowing emergency flexibility
- **LLM intelligent override** ✅ - Claude can override any automatic logic with contextual reasoning

### LLM Override Examples:
```javascript
// Claude can override evening wind-down for urgent deadline
{
  "llm_override": {
    "profile": "HIGH_ENERGY_ACTION",
    "reason": "User has critical deadline tomorrow morning, needs focused energy despite 10pm",
    "communication_style": "Supportive but energizing for late-night productivity"
  }
}

// Or override morning focus for creative breakthrough
{
  "llm_override": {
    "profile": "CREATIVE_FLOW", 
    "reason": "User just had insight, creative momentum more valuable than circadian schedule",
    "communication_style": "Encouraging creative exploration despite morning analytical hour"
  }
}
```

## Implementation Sequence

### Phase 1: Constitutional Framework Fixes (#1 - My Recommendation)
**Target**: Fix the foundational constitutional document inconsistencies
- `CLAUDE.md` line 132: "reduce developer stress" → "optimize hormonal/emotional balance for development tasks"
- `CLAUDE.md` line 411: "reduce or optimize stress appropriately" → "optimize neurochemical state appropriately for situation"

### Phase 2: MVP All Priority Issues (#4 - MVP All of It)
**Target**: Systematic fix of all identified patterns in priority order

#### High Priority Workflow Contexts
- `agent/contexts/workflows/emotion-synthesis/context.yaml` line 38: Reframe stress as situational tool
- `agent/contexts/workflows/cognitive-parliament/context.yaml` line 38: Replace "core_emotion: stress" with neurochemical target

#### Medium Priority Documentation  
- `docs/adr/core-packages-integration.md` lines 12, 87: Replace "stress reduction" with "neurochemical optimization"
- `docs/integration-guide.md` line 341: Update to new constitutional language

### Phase 3: Pattern Detection & Prevention (#3 - How About...?)
**Target**: Create automated validation to prevent regression
- Add neurochemical optimization pattern validation to CI/CD
- Create pattern detection tool for future audits
- Establish validation framework for new contexts

## Detailed Changes Required

### Constitutional Document Updates
```yaml
# CLAUDE.md line 132
OLD: "- Optimize for hormonal/emotional balance (reduce developer stress)"
NEW: "- Optimize for hormonal/emotional balance appropriate for development tasks"

# CLAUDE.md line 411  
OLD: "- **Balance Guardian**: Does this reduce or optimize stress appropriately?"
NEW: "- **Balance Guardian**: Does this optimize neurochemical state appropriately for situation?"
```

### Workflow Context Updates
```yaml
# emotion-synthesis/context.yaml line 38
OLD: "emotion_contribution: anger, stress"
NEW: "emotion_contribution: anger, situational_activation"

# cognitive-parliament/context.yaml line 38
OLD: "core_emotion: stress"
NEW: "neurochemical_state: adaptive_activation"
```

### Documentation Updates
```md
# docs/adr/core-packages-integration.md
OLD: "Constitutional AI framework for validation and stress reduction"
NEW: "Constitutional AI framework for validation and neurochemical optimization"

OLD: "Stress reduction through better debugging/monitoring"  
NEW: "Neurochemical optimization through enhanced debugging/monitoring"
```

## Success Criteria

- [ ] All constitutional documents use consistent "optimization" language
- [ ] No remaining "stress reduction" patterns in active codebase
- [ ] Workflow contexts reflect situational neurochemical awareness
- [ ] Documentation aligns with implemented core system approach
- [ ] Validation framework prevents future regression

## Notes

- **Core system already excellent**: The audit confirmed that `agent/src/core/constitutional-framework.js` and related validation logic properly implement neurochemical optimization
- **Documentation lag**: Main issue is documentation not reflecting the sophisticated implementation already in place
- **Reference material**: `_ref/mcp-ceo/` contains extensive legacy patterns but may be historical reference only

## Review Points

Each phase will be implemented iteratively with review checkpoints:
1. Constitutional fixes review
2. Priority workflow context fixes review  
3. Documentation updates review
4. Pattern detection implementation review

---

*This plan addresses the evolution from legacy "stress reduction" to sophisticated "neurochemical optimization for situational appropriateness" throughout the Leviathan ecosystem.*