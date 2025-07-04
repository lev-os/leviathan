# 🧙‍♂️ Wizard-Driven Concept Management

## Integration with Universal Concept System

The wizard experience becomes the intelligence layer for concept advancement:

### Concept Lifecycle Wizardry

**Automatic Detection Triggers**:
- Concepts in `ideation` stage > 7 days → Analysis wizard
- Analysis complete but no ADR → Specification wizard  
- Implementation stalled → Architecture wizard
- Related concepts discovered → Synthesis wizard

### Wizard Session Types

#### 1. **Concept Analysis Wizard**
```
🧙‍♂️: "I sense this concept seeks clarity! Let me understand..."

[Five-Fold Analysis]
**Question 1: Which aspect needs breakthrough?**
1. 🎯 Core problem definition
2. 🔗 System integration points  
3. 💎 Essential requirements
4. 🚀 Implementation strategy
5. ✨ Revolutionary insight needed
```

#### 2. **Concept Advancement Wizard**
```
🧙‍♂️: "Your concept is ready to evolve! Where shall we focus?"

**Question 1: What form should this concept take?**
1. 📋 ADR - Architectural decision
2. 🧪 BDD - Behavioral specification
3. 🔧 Prototype - Working implementation
4. 📚 Documentation - Knowledge capture
5. 🌊 Flow - Process or workflow
```

#### 3. **Concept Synthesis Wizard**
```
🧙‍♂️: "I see connections forming... These concepts desire unity!"

**Related Concepts Detected**: [A, B, C]

**Question 1: How should we unite them?**
1. 🔗 Merge - Single comprehensive concept
2. 🎭 Compose - Parent concept with children
3. 🌊 Sequence - Process chain A→B→C
4. 🎯 Extract - Common patterns across all
5. ⚡ Transform - Revolutionary synthesis
```

### Workshop Integration Points

**Automatic Scanning**:
```yaml
workshop_patterns:
  concept_readiness:
    - scan: "concepts/**/concept.yaml"
    - filter: status == "ideation" && age > 7d
    - trigger: concept_analysis_wizard
    
  advancement_opportunities:
    - scan: research/ folders with analysis complete
    - missing: ADR or specification
    - trigger: concept_advancement_wizard
    
  synthesis_detection:
    - analysis: tag overlaps and description similarity
    - threshold: 3+ shared concepts
    - trigger: concept_synthesis_wizard
```

**Natural Language Triggers**:
- "Help me understand this concept" → Analysis wizard
- "This concept is ready" → Advancement wizard
- "These concepts are related" → Synthesis wizard

### Success Patterns

**From Phase 0.5 Experience**:
- **"MVP all of it"** → Comprehensive concept advancement
- **Multi-perspective synthesis** → Rich concept development
- **45 minutes = 6 months work** → Breakthrough efficiency

### Implementation

**Workshop Engine Enhancement**:
```javascript
// @lev-os/workshop concept manager
conceptManager: {
  scanConcepts: () => /* Auto-detect advancement needs */,
  triggerWizard: (concept, wizardType) => /* Launch wizard session */,
  trackProgress: (concept, session) => /* Update lifecycle */
}
```

**Wizard Templates**:
- `concept-analysis.md` - Five-fold breakthrough template
- `concept-advancement.md` - Evolution guidance template  
- `concept-synthesis.md` - Multi-concept integration template

This transforms concept management from manual tracking to intelligent, wizard-guided evolution.