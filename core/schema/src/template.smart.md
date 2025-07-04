# Concept Lifecycle Analysis Template

[[LLM: This template creates the "daily driver dashboard" that provides comprehensive concept readiness analysis. When using:
1. Replace {concept_portfolio} with actual concept list from concepts/index.yaml
2. Focus on ACTIONABLE next steps (ADR-ready, implementation-ready, needs-research)
3. Use this exact format for consistency across sessions
4. The goal is to eliminate decision paralysis by providing clear advancement pathways]]

## Concept Lifecycle Analysis - concept_lifecycle_analyst_synth activated

**Ready for ADR/Spec Advancement:**

✅ {concept-name} (status: specification)
- {key_achievement_1}
- {key_achievement_2} 
- {key_achievement_3}
- READY: {next_action}

**Needs Brief Analysis → ADR:**

🟡 {concept-name} (status: analysis)
- {current_progress}
- Needs {specific_requirement}
- CANDIDATE: {recommended_path}

**Pin for Research (as you suggested):**

📌 {concept-name} - {research_requirement}

**Not Ready (stay in current status):**
- {concept-list} ({current_stage} stage)

🎯 **Recommendation**: {primary_focus_recommendation}

**Question**: {decision_point_question}

---

**Template Notes:**
- Use exact status terminology: ideation → analysis → conceptualization → specification → implementation
- "Ready for ADR/Spec" = has architectural decisions locked, needs formalization
- "Needs Brief Analysis" = good progress but missing key architectural decisions
- "Pin for Research" = strategic pause pending external research/dependencies
- Always end with specific recommendation and decision point