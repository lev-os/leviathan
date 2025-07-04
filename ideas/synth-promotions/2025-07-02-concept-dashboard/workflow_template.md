# Concept Lifecycle Dashboard Workflow Template

## 🎯 Purpose
Strategic concept portfolio evaluation and advancement planning for daily driver intelligence.

## 📋 Workflow Steps

### 1. Portfolio Scan
```yaml
input: concepts/index.yaml
action: Read all concept metadata (title, status, tags)
output: Complete concept inventory
```

### 2. Advancement Evaluation  
```yaml
criteria:
  ready_for_adr: status == "specification" AND architectural_decisions_made
  needs_analysis: status == "ideation" AND sufficient_exploration_done
  implementation_ready: status == "specification" AND clear_requirements
  research_required: complex_domain_knowledge_gaps_detected
```

### 3. Strategic Dashboard Generation
```yaml
format: |
  ✅ **Ready for ADR/Spec Advancement**: [concept_name] (reason)
  🟡 **Needs Analysis → ADR**: [concept_name] (what's needed)  
  📌 **Pin for Research**: [concept_name] (research topic)
  ❌ **Not Ready**: [concept_name] (current limitations)
```

### 4. Priority Recommendations
```yaml
immediate_action: concepts_with_clear_next_steps
candidates: concepts_requiring_decision_or_analysis  
research_queue: concepts_requiring_domain_investigation
backlog: concepts_in_early_ideation
```

## 🚀 Deployment Pattern

### Daily Driver Usage
- Run on project startup
- Weekly concept portfolio reviews
- Before resource allocation decisions
- Cross-project intelligence coordination

### Multi-Project Adaptation
```yaml
project_context:
  - Scan project-specific concept folder
  - Apply domain-appropriate evaluation criteria
  - Generate project-specific advancement recommendations
  - Identify cross-project learning opportunities
```

## 🎯 Success Metrics
- Immediate strategic clarity on concept advancement
- Reduced decision paralysis on next steps
- Efficient resource allocation to ready concepts
- Cross-project pattern recognition and reuse

## 🔧 Technical Integration
- Triggered by concept status requests
- Uses systematic-evaluation workflow pattern
- Outputs actionable strategic dashboard
- Integrates with wizard experience for advancement

This template enables the revolutionary concept intelligence across any development environment.