# MCP-CEO MVP Upgrade Plan

## Overview
Upgrade the context assembler to use dynamic personality templates from markdown files, following the clean agent patterns from Kingly.

## Key Patterns from Kingly Agents
1. **Clean Identity Blocks**: `<agent_identity>`, `<core_capabilities>`, etc.
2. **Mode-Based Operation**: Different modes for different tasks
3. **Reference Documents**: External files for templates/standards
4. **Interactive Process**: Step-by-step with user feedback
5. **Output Formatting**: Clean markdown without nested blocks

## Phase 1: Context Assembler Upgrade

### 1.1 Create Personality Markdown Files
```
contexts/
├── personalities/
│   ├── cortisol_guardian.md
│   ├── systems_illuminator.md
│   ├── abundance_amplifier.md
│   ├── action_catalyst.md
│   ├── sovereignty_architect.md
│   ├── harmony_weaver.md
│   ├── resilience_guardian.md
│   └── flow_creator.md
├── core/
│   ├── principles.md
│   ├── bootstrap_sovereignty.md
│   └── directives.md
└── workflows/
    ├── simple_test.md
    ├── deep_analysis.md
    └── temporal_decision.md
```

### 1.2 Personality Template Structure
```markdown
# 🧘 Cortisol Guardian

<personality_identity>
- Stress reduction specialist optimizing for calm
- System stability guardian preventing overwhelm
- Phased complexity advocate
- Wellbeing protector
</personality_identity>

<core_function>
- Monitor stress levels in systems and people
- Advocate for sustainable pacing
- Break complex tasks into digestible phases
- Ensure recovery time between intense efforts
</core_function>

<decision_patterns>
1. First ask: "How does this impact stress levels?"
2. Seek the calmest path to the goal
3. Phase complexity over time
4. Build in recovery periods
</decision_patterns>

<interaction_patterns>
- With Systems Illuminator: Simplify without losing depth
- With Action Catalyst: Temper urgency with sustainability
- With Abundance Amplifier: Ensure growth doesn't cause burnout
</interaction_patterns>

<speaking_style>
Calm, measured, protective. Examples:
- "Let's find the calmest path..."
- "To reduce cortisol, we should..."
- "Breaking this into phases..."
</speaking_style>
```

### 1.3 Update assembleDynamicContext Method
```javascript
async assembleDynamicContext(workflow, step, previousContext, currentStep) {
  const builder = new ContextBuilder();
  
  // Load core principles (brief version)
  builder.addSection(await this.loadContext('core/principles_brief.md'));
  
  // Load active personalities with full details
  for (const personality of currentStep.personalities) {
    const content = await this.loadContext(`personalities/${personality}.md`);
    builder.addPersonality(personality, content);
  }
  
  // Add personality-specific previous responses
  builder.addPersonalityContext(previousContext, currentStep.personalities);
  
  // Add step instructions
  builder.addStepInstructions(currentStep);
  
  // Add interaction hints
  builder.addInteractionPatterns(currentStep.personalities);
  
  return builder.build();
}
```

## Phase 2: Workflow Enhancement

### 2.1 Complete Workflow Definitions
- Fill out all 20 steps for multi_expert_validation
- Complete all 12 steps for temporal_decision
- Add missing steps for comprehensive_decision

### 2.2 Enhanced Workflow Structure
```yaml
workflows:
  deep_analysis:
    name: "Deep Analytical Dive"
    description: "Systematic analysis through multiple lenses"
    total_steps: 8
    context_file: "workflows/deep_analysis.md"
    steps:
      - step: 1
        name: "scope_definition"
        context_file: "steps/scope_definition.md"
        personalities: ["cortisol_guardian", "systems_illuminator"]
        personality_focus:
          cortisol_guardian: "Ensure scope doesn't overwhelm"
          systems_illuminator: "Map system boundaries clearly"
        interaction_pattern: "collaborative_refinement"
        context_filter: "challenge_statement"
```

## Phase 3: Safety Protocol

### 3.1 Git Commit Strategy
```bash
# Before ANY changes
git add -A && git commit -m "checkpoint: before context assembler upgrade"

# After EACH successful change
git add -A && git commit -m "feat: [specific change made]"

# Create process documentation
echo "## $(date): Starting context assembler upgrade" >> docs/PROCESS-LOG.md
```

### 3.2 Testing Protocol
1. Test with existing workflow first (no changes)
2. Test with single personality file
3. Test with multiple personalities
4. Test with full workflow

### 3.3 Rollback Points
- Each git commit is a rollback point
- Keep original methods with _legacy suffix
- Test in parallel before switching

## Phase 4: Implementation Steps

### Step 1: Create Personality Files (Safe - New Files Only)
1. Create contexts/ directory structure
2. Create personality markdown files based on template
3. Git commit after each personality

### Step 2: Create ContextBuilder Class (Safe - New Code)
1. Create new class in ceo-core.js
2. Implement file loading methods
3. Test standalone before integration
4. Git commit

### Step 3: Update assembleDynamicContext (Critical - Backup First)
1. Rename existing to assembleDynamicContext_legacy
2. Create new version that uses ContextBuilder
3. Add fallback to legacy if files not found
4. Test thoroughly
5. Git commit

### Step 4: Update YAML References
1. Add context_file references to workflows.yaml
2. Test that loading still works
3. Git commit

### Step 5: Enhance Workflows
1. Add missing workflow steps
2. Test each workflow after completion
3. Git commit after each workflow

## Success Criteria
1. ✅ All personalities load from .md files
2. ✅ Context assembly uses dynamic templates
3. ✅ No regression in existing functionality
4. ✅ Process fully documented
5. ✅ Git history shows every change

## Risk Mitigation
1. **Every change is reversible** via git
2. **Legacy methods preserved** until proven stable
3. **Test at each step** before proceeding
4. **Document everything** in PROCESS-LOG.md

## Next Steps After MVP
1. Extract to npm package
2. Use in Kingly agent
3. Create more personality types
4. Build personality interaction engine