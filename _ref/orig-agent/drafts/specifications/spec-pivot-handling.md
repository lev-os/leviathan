# Pivot Handling Specification

## Business Case
Strategic changes are inevitable in complex projects. Rather than abandoning existing work, the system should intelligently transform affected tasks while preserving business goals and completed work.

## Core Concept
A pivot is a special task type that represents strategic direction changes. When executed, it analyzes dependent tasks and either transforms them to align with new direction or marks them as obsolete.

## Acceptance Criteria

### Given a project with established tasks
**When** a pivot task is created with new strategic direction
**Then** the system should:
- Identify all tasks that conflict with the new direction
- Propose transformations for salvageable tasks
- Mark truly obsolete tasks as "superseded"
- Preserve completed work that remains relevant

### Given a pivot task is executed
**When** the agent processes the pivot
**Then** it should:
- Update project context with new strategic direction
- Transform affected task descriptions to align with new goals
- Maintain dependency relationships where still valid
- Log the pivot reasoning for future reference

### Given multiple potential pivot approaches
**When** the system detects strategic ambiguity
**Then** it should:
- Present numbered options to the user
- Explain the business impact of each approach
- Wait for user decision before proceeding

## Implementation Notes
- Pivot tasks have type: "pivot" in YAML metadata
- They reference the tasks they affect via depends_on field
- Pivot execution generates an audit trail of transformations
- Original task content is preserved in git history

## Example Structure
```yaml
type: pivot
title: "Shift from SaaS to Open Source Model"
priority: critical
depends_on:
  - monetization-strategy
  - user-authentication
  - payment-processing
rationale: "Market research shows stronger adoption potential for open source approach"
```