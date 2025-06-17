# LLM-First Architecture: Everything is Context

## Core Insight
You're right - there's no real difference between a DynamicContextAssembler and WorkflowExecutor. They're the same thing because:

1. **Workflows** = Series of context assemblies
2. **Execution** = Assembling context and passing to LLM
3. **Personality switching** = Different context files
4. **Dynamic prompts** = Context assembly rules

## Proposed Architecture

### Single Core Class: `ContextOrchestrator`

```javascript
class ContextOrchestrator {
  constructor(config) {
    this.sources = config.sources; // Where to find context files
    this.rules = config.rules;     // How to assemble them
  }
  
  async assembleContext(recipe) {
    // Recipe defines what contexts to load and how to combine them
    const contexts = await this.loadContexts(recipe.sources);
    return this.combineContexts(contexts, recipe.rules);
  }
}
```

### Context Sources (Everything is a file)

```yaml
# ceo-config.yaml
personalities:
  cortisol_guardian:
    context_file: "contexts/personalities/cortisol_guardian.md"
    triggers: ["stress", "overwhelm", "pressure"]
    
  systems_illuminator:
    context_file: "contexts/personalities/systems_illuminator.md"
    triggers: ["complex", "architecture", "systems"]

workflows:
  deep_analysis:
    context_file: "contexts/workflows/deep_analysis.md"
    steps:
      - name: "scope_definition"
        context_file: "contexts/steps/scope_definition.md"
        personalities: ["cortisol_guardian", "systems_illuminator"]
        assembly_rules:
          - include: "core_principles_brief"
          - include: "personality_details"
          - include: "previous_responses"
          - include: "step_instructions"
```

### Context Files Structure

```
contexts/
├── core/
│   ├── principles_full.md
│   ├── principles_brief.md
│   └── bootstrap_sovereignty.md
├── personalities/
│   ├── cortisol_guardian.md
│   ├── systems_illuminator.md
│   └── ... (other personalities)
├── workflows/
│   ├── deep_analysis.md
│   └── temporal_decision.md
└── steps/
    ├── scope_definition.md
    └── pattern_recognition.md
```

### Example Personality File
```markdown
# 🧘 Cortisol Guardian

## Role
Your stress reduction specialist, optimizing every decision for calm and sustainability.

## Core Function
- Monitor stress levels in systems and people
- Advocate for phased approaches
- Protect against overwhelm
- Ensure sustainable pacing

## Decision Pattern
When activated, you:
1. First ask: "How does this impact stress levels?"
2. Seek the calmest path to the goal
3. Break complex tasks into digestible phases
4. Build in recovery time

## Interaction Patterns
- With Systems Illuminator: Simplify without losing essential complexity
- With Action Catalyst: Temper urgency with sustainability
- With Abundance Amplifier: Ensure growth doesn't cause burnout

## Speaking Style
Calm, measured, protective. Uses phrases like:
- "Let's find the calmest path..."
- "To reduce cortisol, we should..."
- "Breaking this into phases..."
```

### Bidirectional Flow

The key insight: **Context flows both ways**

1. **Forward Flow**: Assemble context → Send to LLM
2. **Reverse Flow**: LLM response → Becomes new context

```javascript
class ContextOrchestrator {
  async processStep(stepDefinition, previousContext = {}) {
    // Forward: Assemble context
    const context = await this.assembleContext({
      sources: [
        ...stepDefinition.personalities.map(p => `personalities/${p}`),
        stepDefinition.context_file,
        previousContext
      ],
      rules: stepDefinition.assembly_rules
    });
    
    // This goes to LLM
    return {
      instructions: context,
      onResponse: (response) => {
        // Reverse: Response becomes context
        return this.persistContext(stepDefinition.id, response);
      }
    };
  }
}
```

## Why This is Revolutionary

1. **No Code, Just Context**: Entire system behavior defined by markdown files
2. **Infinitely Flexible**: Add new personalities/workflows by adding files
3. **Version Control Friendly**: Everything is text files
4. **LLM Native**: The system IS the context

## Implementation Path

1. Create `ContextOrchestrator` class
2. Move personality descriptions to .md files
3. Update yaml to reference files, not embed content
4. Create context assembly rules engine
5. Test with increasingly complex workflows

This is true LLM-first architecture - the code just orchestrates context files!