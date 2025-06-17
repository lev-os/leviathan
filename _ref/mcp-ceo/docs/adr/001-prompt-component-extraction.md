# ADR-001: Prompt Component Extraction and Organization

## Status
Proposed

## Context
The MCP-CEO project has accumulated various system prompts in the `ref/` directory and embedded prompts in YAML configuration files. To enable dynamic context assembly and prompt synthesis, we need to extract and organize these components into a structured library.

## Decision
We will implement Phase 1: Foundation - Extract & Organize by creating a hierarchical prompt component library.

## Architecture

### New Directory Structure
```
ref/
├── personalities/           # Individual personality prompts
│   ├── cortisol_guardian.md
│   ├── abundance_amplifier.md
│   ├── sovereignty_architect.md
│   ├── harmony_weaver.md
│   ├── systems_illuminator.md
│   ├── resilience_guardian.md
│   ├── flow_creator.md
│   └── action_catalyst.md
├── phases/                 # Reusable workflow phases
│   ├── research_phase.md
│   ├── validation_phase.md
│   ├── synthesis_phase.md
│   └── feedback_phase.md
├── experts/                # Domain expert templates
│   ├── legal_expert.md
│   ├── technical_architect.md
│   ├── business_strategist.md
│   ├── psychology_profiler.md
│   └── devils_advocate.md
├── patterns/               # Common prompt patterns
│   ├── recursive_analysis.md
│   ├── multi_agent_debate.md
│   ├── decision_tree.md
│   └── chain_of_thought.md
└── outputs/                # Output format templates
    ├── executive_summary.md
    ├── technical_analysis.md
    ├── action_plan.md
    └── structured_response.md
```

### Implementation Steps
1. Extract all embedded prompts from `ceo-config.yaml`
2. Break down complex prompts from `ref/` into reusable components
3. Create standardized component format with metadata
4. Update context files to reference external components
5. Create component validation and testing

### Benefits
- **Modularity**: Reusable components across different workflows
- **Maintainability**: Single source of truth for each component
- **Testability**: Individual components can be tested and validated
- **Extensibility**: Easy to add new components and combinations
- **Version Control**: Track changes to individual components

### Risks
- **Complexity**: Additional abstraction layer
- **Migration Effort**: Existing configurations need updating
- **Consistency**: Ensuring components work well together

## Consequences
This foundation enables the next phases of dynamic context assembly and prompt synthesis. It transforms our prompt system from embedded strings to a composable component library.

## Implementation Timeline
- Week 1: Extract and organize existing prompts
- Week 2: Create component metadata and validation
- Week 3: Update existing contexts to reference components
- Week 4: Testing and documentation