# Claude Command Audit Findings

## Issues Identified

### 1. Missing Schema Embeddings
Both `/idea` and `/session` commands are missing embedded YAML schemas. This causes:
- Incorrect YAML structure when saving
- Wasted time on trial-and-error directory creation
- Inconsistent file naming (concept.yaml vs readme.yaml)

### 2. File Naming Inconsistency
- Sessions use: `readme.yaml`
- Ideas/Concepts use: `concept.yaml`
- Should standardize to `readme.yaml` across the board

### 3. Schema Definitions Not Embedded
The commands reference schemas but don't include them inline, leading to:
- LLM hallucinating structure
- Incorrect field names and nesting
- Missing required fields

## Required Schemas to Embed

### Session Schema (readme.yaml)
```yaml
session_id: "semantic-slug"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DDTHH:MM:SSZ"
semantic_summary: "Brief description of session purpose"

# Core session tracking
mission_statement: "Primary objective"
mission_context:
  why: "Reason for session"
  what: "What we're building/solving"
  how: "Approach being taken"

# Active synths
active_synths:
  primary: "synth_name"
  secondary: "synth_name"
  
  synth_name:
    role: "Role definition"
    job: "What it does"
    confidence_level: 90
    current_context: "Active work"

# Workflow tracking  
workflow_context:
  current_workflow: "workflow-name"
  current_step: "step-name"
  step_number: 1
  total_steps: 5
  
  workflow_definition:
    step_1: "Description"
    step_2: "Description"

# Human collaboration
collaboration_context:
  human_preference: "How human wants to work"
  decision_pending: "What needs approval"

# Next session instructions
next_session_instructions:
  1: "First action"
  2: "Second action"
```

### Idea/Concept Schema (rename to readme.yaml)
```yaml
id: "concept-id"
title: "Concept Title"
status: ideation|analysis|specification|implementation|archive
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
tags: [tag1, tag2]
description: "Brief description"

# Lifecycle tracking
lifecycle:
  current_stage: "ideation"
  next_action: "What needs to happen"
  readiness_criteria: "What makes it ready"
  
# Analysis results (if applicable)
analysis:
  five_fold_complete: false
  research_gaps: []
  key_insights: []

# Relationships
relationships:
  related_concepts: []
  parent_concept: null
  child_concepts: []
```

## Recommended Fixes

1. **Embed schemas directly in command files**
2. **Standardize to readme.yaml everywhere**
3. **Add validation hints in prompts**
4. **Include example structures**
5. **Add file mask patterns for loading**