# Wizard Experience Implementation Guide

## Overview

This guide explains how to implement the Wizard Experience pattern in various contexts within the Leviathan ecosystem.

## Implementation Patterns

### 1. CLI Integration

```javascript
// In agent/bin/lev
export function registerWizardCommand(program) {
  program
    .command('wizard [topic]')
    .description('Start an interactive wizard session')
    .option('-d, --domain <domain>', 'Specific domain template')
    .option('-g, --goal <goal>', 'Define the wizard goal')
    .action(async (topic, options) => {
      const wizard = new WizardExperience({
        topic,
        domain: options.domain || 'auto-detect',
        goal: options.goal
      });
      
      await wizard.start();
    });
}
```

### 2. MCP Tool Implementation

```javascript
// In agent/src/tools/wizard-experience.js
export const wizardExperienceTool = {
  name: 'wizard_experience',
  description: 'Interactive wizard for complex problem solving',
  
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start', 'answer', 'research', 'pivot', 'complete']
      },
      topic: { type: 'string' },
      sessionId: { type: 'string' },
      response: { type: 'string' }
    }
  },
  
  async execute({ action, topic, sessionId, response }) {
    switch (action) {
      case 'start':
        return startWizardSession(topic);
      case 'answer':
        return processWizardAnswer(sessionId, response);
      case 'research':
        return conductWizardResearch(sessionId, response);
      case 'pivot':
        return handleWizardPivot(sessionId, response);
      case 'complete':
        return completeWizardSession(sessionId);
    }
  }
};
```

### 3. Workflow YAML Integration

```yaml
# In agent/workflows/wizard/
wizard_workflow:
  name: "Interactive Wizard Experience"
  version: "1.0"
  
  stages:
    - name: "initialization"
      steps:
        - load_domain_template
        - establish_session_context
        - present_greeting
    
    - name: "questioning"
      type: "iterative"
      max_iterations: 10
      steps:
        - present_question
        - await_response
        - process_answer
        - determine_next_action:
            branches:
              - research_needed: conduct_research
              - pivot_needed: handle_pivot
              - continue: next_question
              - complete: finalize_session
    
    - name: "synthesis"
      steps:
        - compile_decisions
        - generate_artifacts
        - present_summary
```

### 4. Core Wizard Class

```javascript
// Core implementation structure
class WizardExperience {
  constructor(config) {
    this.topic = config.topic;
    this.domain = config.domain;
    this.session = {
      id: generateSessionId(),
      questions: [],
      answers: [],
      context: {},
      insights: []
    };
  }
  
  async start() {
    const greeting = this.generateGreeting();
    console.log(greeting);
    
    const firstQuestion = await this.getNextQuestion();
    await this.askQuestion(firstQuestion);
  }
  
  async askQuestion(question) {
    // Format and present question
    const formatted = this.formatQuestion(question);
    console.log(formatted);
    
    // Await user response
    const response = await this.getUserInput();
    
    // Process response
    await this.processResponse(response, question);
  }
  
  async processResponse(response, question) {
    // Parse response (numbers, combinations, custom)
    const parsed = this.parseResponse(response);
    
    // Update session state
    this.session.answers.push({
      question: question.id,
      response: parsed,
      timestamp: new Date()
    });
    
    // Determine next action
    const nextAction = await this.determineNextAction(parsed, question);
    
    switch (nextAction.type) {
      case 'next_question':
        await this.askQuestion(nextAction.question);
        break;
      case 'research':
        await this.conductResearch(nextAction.query);
        break;
      case 'pivot':
        await this.handlePivot(nextAction.reason);
        break;
      case 'complete':
        await this.completeSession();
        break;
    }
  }
}
```

### 5. FlowMind Future Integration

```yaml
# Future: When FlowMind is implemented
flowmind:
  version: "2.0"
  name: "wizard_experience_flow"
  
  variables:
    user_confusion: "@semantic.analyze(context, 'user_clarity')"
    topic_complexity: "@semantic.analyze(topic, 'complexity_level')"
    
  flow:
    # Semantic trigger for wizard
    - when_semantic: "user needs guidance OR topic is overwhelming"
      confidence_threshold: 0.8
      then:
        invoke: "wizard_experience"
        with:
          style: "adaptive"
          depth: "@calculated.from(topic_complexity)"
    
    # Dynamic question selection
    - while: "not session.complete"
      and_semantic: "user remains engaged"
      do:
        - select_question:
            based_on: "@semantic.best_next_question(context)"
        - present_with_personality:
            style: "@semantic.match_user_preference()"
```

### 6. Integration Points

#### With Existing Tools

```javascript
// Research integration
async conductResearch(query) {
  // Use semantic search
  const results = await this.tools.semantic_search({
    query,
    limit: 5,
    context: this.session.context
  });
  
  // Present findings wizard-style
  console.log("🧙‍♂️: Let me consult the ancient scrolls... 🔍");
  console.log(`\nAh! I've discovered ${results.length} relevant insights:`);
  
  return this.presentResearchFindings(results);
}

// Checkpoint integration
async saveWizardCheckpoint() {
  await this.tools.session_checkpoint({
    context: `wizard_${this.topic}`,
    state: this.session,
    artifacts: this.getGeneratedArtifacts()
  });
}
```

#### With Memory Systems

```javascript
// Store wizard sessions for learning
async persistSession() {
  await this.memory.store({
    type: 'wizard_session',
    topic: this.topic,
    domain: this.domain,
    path_taken: this.session.questions.map(q => q.id),
    successful: this.session.completed,
    insights: this.session.insights
  });
}

// Learn from successful patterns
async loadSuccessfulPatterns() {
  const patterns = await this.memory.query({
    type: 'wizard_session',
    successful: true,
    domain: this.domain
  });
  
  return this.analyzePatterns(patterns);
}
```

## Testing the Wizard

```javascript
// Test harness
describe('WizardExperience', () => {
  it('should handle numeric responses', async () => {
    const wizard = new WizardExperience({ topic: 'test' });
    const response = await wizard.parseResponse('3');
    expect(response.type).toBe('single_selection');
    expect(response.choices).toEqual([3]);
  });
  
  it('should handle combined responses', async () => {
    const response = await wizard.parseResponse('1 and 3');
    expect(response.type).toBe('multiple_selection');
    expect(response.choices).toEqual([1, 3]);
  });
  
  it('should trigger research when needed', async () => {
    const wizard = new WizardExperience({ topic: 'complex' });
    const action = await wizard.determineNextAction(
      { needsResearch: true },
      { research_triggers: ['complex'] }
    );
    expect(action.type).toBe('research');
  });
});
```

## Production Considerations

1. **Session Persistence**
   - Store wizard sessions in Redis/memory
   - Enable resume capability
   - Track completion rates

2. **Analytics**
   - Which paths lead to success
   - Common pivot points
   - Research query patterns

3. **Personalization**
   - Adapt wizard personality to user
   - Remember preferences across sessions
   - Adjust question depth dynamically

4. **Error Handling**
   - Graceful recovery from confusion
   - Clear escape hatches
   - Helpful error messages

---

*"Implementation is where magic meets reality"* ✨