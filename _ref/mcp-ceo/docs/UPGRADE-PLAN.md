# Dynamic Context Assembler Upgrade Plan

## Current Issues
1. Same system prompt repeated every step
2. Full personality list shown even when only 2-3 are active
3. No personality-specific context building
4. No dynamic evolution of the prompt

## Proposed Upgrades

### 1. Dynamic Personality Injection
Instead of the full system prompt, only inject:
- Core principles (shortened)
- **Detailed profiles** for active personalities only
- Personality-specific previous responses
- Personality interaction patterns

### 2. Context Evolution Pattern
```javascript
assembleDynamicContext(workflow, step, previousContext, currentStep) {
  // Core principles (brief)
  let prompt = this.getCoreDirectives(); // Shortened version
  
  // Active personality details
  const activePersonalities = currentStep.personalities;
  prompt += this.getPersonalityDetails(activePersonalities); // Full details
  
  // Personality-specific context
  prompt += this.extractPersonalityContext(previousContext, activePersonalities);
  
  // Step-specific instructions
  prompt += currentStep.prompt;
  
  // Personality interaction hints
  prompt += this.getInteractionPatterns(activePersonalities);
  
  return prompt;
}
```

### 3. Personality Detail Expansion
For each active personality, include:
- Full role description
- Cognitive patterns
- Decision-making style
- Interaction with other active personalities
- Previous responses from this personality

### 4. Workflow Definition Upgrades
Add to each step:
- `personality_focus`: What aspect to emphasize
- `interaction_pattern`: How personalities should interact
- `context_filter`: What previous context is most relevant

### 5. Smart Context Building
- Track which personality contributed what insight
- Build personality-specific memory
- Create interaction dynamics
- Enable personality conflicts/debates

## Example: Upgraded Step Instructions

Instead of:
```
You are The Architect of Abundance... [full system prompt]
Active Personalities:
- cortisol_guardian
- systems_illuminator
```

Generate:
```
## Active Personalities for This Step

### 🧘 CORTISOL GUARDIAN (Primary)
**Role**: Your stress reduction specialist, optimizing every decision for calm
**Current Focus**: Ensure migration plan doesn't overwhelm the team
**Cognitive Pattern**: Seeks simplicity, phases complexity, protects wellbeing
**From Previous Steps**: "Phased approach reduces team stress" (Step 7)

### 💡 SYSTEMS ILLUMINATOR (Supporting)  
**Role**: Your complexity navigator, finding elegant patterns in chaos
**Current Focus**: Map service boundaries for maximum clarity
**Interaction**: Work with Cortisol Guardian to simplify without losing depth
**From Previous Steps**: "Clear service boundaries emerge" (Step 7)

## Personality Dynamics This Step
- Cortisol Guardian leads with stress-reduction lens
- Systems Illuminator provides technical clarity
- Seek synthesis: Simple enough to reduce stress, clear enough to execute

## Your Task
[Step specific instructions]

## Relevant Context
[Filtered previous responses relevant to these personalities]
```

## Benefits
1. **Living System Prompt**: Truly dynamic and evolving
2. **Personality Depth**: Each personality becomes more real
3. **Better Responses**: LLM has clearer guidance on HOW to be each personality
4. **Emergent Behavior**: Personality interactions create new insights
5. **Reduced Tokens**: Only send what's needed for each step

This is the breakthrough - making the system prompt itself a dynamic, living thing!