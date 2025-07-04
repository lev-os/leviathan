# Session + Concept Dashboard

[[LLM: This is a unified dashboard template for both session progress and concept portfolio analysis. When using:
1. Load session intelligence from readme.yaml first
2. Scan concepts/index.yaml for concept portfolio
3. Activate concept_lifecycle_analyst_synth for strategic evaluation
4. Present dashboard with both session + concept status
5. Provide actionable next steps with wizard guidance]]

## 🎯 Session Status: {SESSION_ID}

**Current State**: {CURRENT_WORKFLOW_STEP}
**Synth Performance**: {ACTIVE_SYNTHS} active | {SUCCESS_RATE}% avg success
**Timeline**: {HISTORY_COUNT} events tracked

### 🔧 Active Rolling Synths
[[LLM: List synths with their current focus and confidence levels]]
- **{SYNTH_NAME}**: {CURRENT_CONTEXT} | Confidence: {CONFIDENCE}%

## 📊 Concept Portfolio Analysis

[[LLM: Use concept_lifecycle_analyst_synth pattern for systematic evaluation]]

### ✅ Ready for Advancement
[[LLM: Concepts with clear next steps, ready for wizard guidance]]
- **{CONCEPT_NAME}** → {NEXT_ACTION} (reason: {READINESS_CRITERIA})

### 🟡 Needs Analysis
[[LLM: Concepts requiring deeper exploration before advancement]]
- **{CONCEPT_NAME}** → Analysis needed (gap: {MISSING_ELEMENT})

### 📌 Research Queue
[[LLM: Concepts requiring domain investigation or external research]]
- **{CONCEPT_NAME}** → Research topic: {RESEARCH_FOCUS}

### 🔄 Session Crystallization Opportunities
[[LLM: Patterns/synths/insights from current session ready to become permanent]]
- **{PATTERN_NAME}** → Extract to {DESTINATION} (value: {STRATEGIC_VALUE})

## 🧙‍♂️ Wizard Guidance Recommendations

[[LLM: Based on dashboard analysis, suggest specific wizard sessions]]

### Immediate Actions
1. **{ACTION_TYPE}**: {SPECIFIC_RECOMMENDATION}
2. **{ACTION_TYPE}**: {SPECIFIC_RECOMMENDATION}

### Strategic Priorities
[[LLM: Higher-level guidance for session/concept progression]]
- Focus area: {STRATEGIC_FOCUS}
- Decision needed: {PENDING_DECISION}
- Opportunity: {BREAKTHROUGH_POTENTIAL}

## 🔗 Available Context Intelligence
[[LLM: Show relevant contexts for current work - use parallel loading with 10 workers]]
- **Agents**: {RELEVANT_AGENTS}
- **Patterns**: {RELEVANT_PATTERNS} 
- **Workflows**: {RELEVANT_WORKFLOWS}
- **Tools**: {RELEVANT_TOOLS}

---
*Dashboard generated with concept_lifecycle_analyst_synth + session intelligence*