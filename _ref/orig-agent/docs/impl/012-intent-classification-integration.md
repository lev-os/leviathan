# Implementation Ticket: 012 - Intent Classification Integration

## 📋 Overview
Integrate intent classification system that automatically routes tasks based on intent type and complexity.

## 🔗 References
- **Previous**: [011 - Memory Context](011-memory-context.md)
- **Spec**: [Universal Context Architecture](../specs/core/universal-context-architecture.md) - Intent Types

## 🎯 Scope
Create intent classification that:
- Classifies intent into 4 types
- Determines complexity level
- Routes to appropriate handling
- Learns from outcomes

## ✅ Acceptance Criteria

### AC-012-1: Intent Classification
```yaml
Given: User request or expression
When: Intent is analyzed
Then: Intent type is classified correctly
And: Confidence score provided
And: Routing recommendations made
```

### AC-012-2: Complexity Analysis
```yaml
Given: Classified intent
When: Complexity assessed
Then: Scope, duration, dependencies analyzed
And: Stakeholder count estimated
And: Routing decision made
```

### AC-012-3: Dynamic Routing
```yaml
Given: Intent classification and complexity
When: Routing decision needed
Then: Appropriate handler selected
And: Context created if needed
And: Workflow initiated
```

### AC-012-4: Learning Integration
```yaml
Given: Completed tasks with outcomes
When: Feedback available
Then: Classification improves
And: Routing accuracy increases
And: Patterns recognized
```

## 🧪 Test Cases

### Unit Tests
1. **Basic classification** - Intent types detected
2. **Complexity scoring** - Levels calculated correctly
3. **Routing logic** - Right handlers selected
4. **Learning** - Accuracy improves over time
5. **Edge cases** - Ambiguous intents handled

### Integration Tests
1. **End-to-end** - Full classification to execution
2. **Context creation** - Complex intents create contexts
3. **Memory integration** - Past patterns applied

## 💻 Implementation

### Intent Classifier
```javascript
// src/application/intent-classifier.js
export class IntentClassifier {
  constructor(options = {}) {
    this.llmAdapter = options.llmAdapter;
    this.memoryContext = options.memoryContext;
    this.complexityAnalyzer = new ComplexityAnalyzer(options.llmAdapter);
    this.routingEngine = new RoutingEngine(options);
  }
  
  async classifyIntent(userExpression, context = {}) {
    // Step 1: Extract intent type
    const intentType = await this.extractIntentType(userExpression);
    
    // Step 2: Analyze complexity
    const complexity = await this.complexityAnalyzer.analyze(
      userExpression,
      intentType,
      context
    );
    
    // Step 3: Get routing recommendation
    const routing = await this.routingEngine.recommend(
      intentType,
      complexity,
      context
    );
    
    // Step 4: Check memory for similar patterns
    const patterns = await this.findSimilarPatterns(
      userExpression,
      intentType
    );
    
    return {
      intentType: intentType.type,
      confidence: intentType.confidence,
      complexity: complexity,
      routing: routing,
      patterns: patterns,
      analysis: {
        userExpression,
        context,
        timestamp: Date.now()
      }
    };
  }
  
  async extractIntentType(expression) {
    const prompt = `Classify this user expression into one of four intent types:

Expression: "${expression}"

Intent Types:
1. personal_experience - Individual needs, desires, personal growth
   Examples: "improve my health", "find romantic connection", "learn new skill"
   
2. business_growth - Revenue generation, customer value, operational efficiency  
   Examples: "increase sales", "improve user authentication", "optimize conversion"
   
3. organizational_coordination - Team productivity, resource allocation, internal systems
   Examples: "improve team collaboration", "plan Q4 strategy", "redesign architecture"
   
4. civilizational_impact - Governance, economic systems, planetary coordination
   Examples: "reform tax system", "coordinate climate response", "improve democracy"

Respond with JSON:
{
  "type": "one of the four types",
  "confidence": 0.0-1.0,
  "reasoning": "why you chose this type",
  "keywords": ["key", "words", "that", "indicated", "type"]
}`;

    const response = await this.llmAdapter.complete({
      prompt: prompt,
      temperature: 0.2,
      responseFormat: 'json'
    });
    
    return JSON.parse(response);
  }
  
  async findSimilarPatterns(expression, intentType) {
    if (!this.memoryContext) return [];
    
    // Search memory for similar intents
    const memories = await this.memoryContext.recall(
      `intent: ${intentType.type} ${expression}`,
      { type: 'intent_classification' },
      5
    );
    
    return memories.map(m => ({
      pattern: m.content,
      outcome: m.context.outcome,
      confidence: m.relevance
    }));
  }
  
  async learnFromOutcome(classification, outcome) {
    if (!this.memoryContext) return;
    
    // Store successful classification
    await this.memoryContext.addMemory({
      type: 'intent_classification',
      content: `${classification.intentType}: ${classification.analysis.userExpression}`,
      context: {
        classification: classification,
        outcome: outcome,
        success: outcome.success,
        duration: outcome.duration,
        complexity_actual: outcome.actualComplexity
      },
      metadata: {
        pattern_type: 'intent_classification',
        intent_type: classification.intentType
      }
    });
  }
}

// Complexity Analyzer
export class ComplexityAnalyzer {
  constructor(llmAdapter) {
    this.llm = llmAdapter;
  }
  
  async analyze(expression, intentType, context) {
    const prompt = `Analyze the complexity of this request:

Expression: "${expression}"
Intent Type: ${intentType.type}
Context: ${JSON.stringify(context, null, 2)}

Analyze these factors:
1. Scope - How many people/systems affected? (1-10 scale)
2. Duration - Timeline from start to completion? (hours/days/weeks/months)
3. Dependencies - How many external factors involved? (0-20)
4. Stakeholders - How many decision makers required? (1-100)
5. Uncertainty - How unclear are the requirements? (0.0-1.0)
6. Risk - Potential for failure or complications? (0.0-1.0)

Return JSON:
{
  "scope": 1-10,
  "duration": "hours|days|weeks|months|years",
  "dependencies": 0-20,
  "stakeholders": 1-100,
  "uncertainty": 0.0-1.0,
  "risk": 0.0-1.0,
  "overall_complexity": "low|medium|high|extreme",
  "reasoning": "explanation of complexity assessment"
}`;

    const response = await this.llm.complete({
      prompt: prompt,
      temperature: 0.3,
      responseFormat: 'json'
    });
    
    return JSON.parse(response);
  }
}

// Routing Engine
export class RoutingEngine {
  constructor(options = {}) {
    this.routingRules = this.loadRoutingRules();
    this.contextCreator = options.contextCreator;
    this.workflowExecutor = options.workflowExecutor;
  }
  
  loadRoutingRules() {
    return {
      personal_experience: {
        low: 'one_shot_execution',
        medium: 'mini_workflow',
        high: 'context_creation',
        extreme: 'multi_context_coordination'
      },
      business_growth: {
        low: 'mini_workflow',
        medium: 'context_creation',
        high: 'project_context',
        extreme: 'multi_project_coordination'
      },
      organizational_coordination: {
        low: 'context_creation',
        medium: 'project_context',
        high: 'multi_project_coordination',
        extreme: 'workspace_coordination'
      },
      civilizational_impact: {
        low: 'multi_project_coordination',
        medium: 'workspace_coordination',
        high: 'multi_workspace_coordination',
        extreme: 'institutional_coordination'
      }
    };
  }
  
  async recommend(intentType, complexity, context) {
    const complexityLevel = this.mapComplexityLevel(complexity);
    const routingType = this.routingRules[intentType][complexityLevel];
    
    return {
      type: routingType,
      reasoning: this.explainRouting(intentType, complexityLevel, routingType),
      actions: await this.generateActions(routingType, context),
      estimatedEffort: this.estimateEffort(complexity),
      suggestedWorkflow: this.suggestWorkflow(routingType, intentType)
    };
  }
  
  mapComplexityLevel(complexity) {
    // Convert detailed complexity to simple level
    const factors = [
      complexity.scope / 10,
      this.durationToScore(complexity.duration),
      complexity.dependencies / 20,
      Math.log(complexity.stakeholders) / Math.log(100),
      complexity.uncertainty,
      complexity.risk
    ];
    
    const avgScore = factors.reduce((a, b) => a + b) / factors.length;
    
    if (avgScore < 0.25) return 'low';
    if (avgScore < 0.5) return 'medium'; 
    if (avgScore < 0.75) return 'high';
    return 'extreme';
  }
  
  durationToScore(duration) {
    const scores = {
      'hours': 0.1,
      'days': 0.3,
      'weeks': 0.6,
      'months': 0.8,
      'years': 1.0
    };
    return scores[duration] || 0.5;
  }
  
  explainRouting(intentType, complexity, routingType) {
    return `${intentType} intent with ${complexity} complexity routes to ${routingType}`;
  }
  
  async generateActions(routingType, context) {
    const actionMap = {
      one_shot_execution: [
        'Execute directly using available tools'
      ],
      mini_workflow: [
        'Create simple workflow',
        'Execute steps sequentially'
      ],
      context_creation: [
        'Create project context',
        'Set up structure',
        'Create initial workflow'
      ],
      project_context: [
        'Create project with sub-contexts',
        'Setup team collaboration',
        'Create complex workflows'
      ],
      multi_project_coordination: [
        'Create workspace context',
        'Setup cross-project coordination',
        'Create governance workflows'
      ]
    };
    
    return actionMap[routingType] || ['Handle case by case'];
  }
  
  suggestWorkflow(routingType, intentType) {
    const workflowMap = {
      one_shot_execution: null,
      mini_workflow: `workflows/intent/${intentType}/simple.yaml`,
      context_creation: `workflows/intent/${intentType}/full-setup.yaml`,
      project_context: `workflows/intent/${intentType}/project-setup.yaml`,
      multi_project_coordination: `workflows/intent/${intentType}/coordination.yaml`
    };
    
    return workflowMap[routingType];
  }
  
  estimateEffort(complexity) {
    const base = {
      scope: complexity.scope * 2, // hours per scope point
      dependencies: complexity.dependencies * 0.5,
      stakeholders: Math.log(complexity.stakeholders) * 3,
      uncertainty: complexity.uncertainty * 20,
      risk: complexity.risk * 10
    };
    
    const totalHours = Object.values(base).reduce((a, b) => a + b);
    
    return {
      hours: Math.round(totalHours),
      days: Math.round(totalHours / 8),
      confidence: 1 - complexity.uncertainty
    };
  }
}

// Integration Tool
export const intentRouterTool = {
  name: 'route_by_intent',
  description: 'Classify intent and route to appropriate handling',
  inputSchema: {
    type: 'object',
    properties: {
      expression: { type: 'string' },
      context: { type: 'object' }
    }
  },
  handler: async (params) => {
    const classifier = new IntentClassifier({
      llmAdapter: llmAdapter,
      memoryContext: memoryContext,
      contextCreator: contextCreator,
      workflowExecutor: workflowExecutor
    });
    
    const classification = await classifier.classifyIntent(
      params.expression,
      params.context
    );
    
    // Execute the routing
    const result = await executeRouting(classification);
    
    // Learn from immediate feedback
    if (result.success) {
      await classifier.learnFromOutcome(classification, result);
    }
    
    return {
      success: true,
      classification: classification,
      result: result,
      _llm_instructions: formatRoutingInstructions(classification, result)
    };
  }
};

async function executeRouting(classification) {
  const { routing } = classification;
  
  switch (routing.type) {
    case 'one_shot_execution':
      return await executeDirectly(classification);
      
    case 'mini_workflow':
      return await createMiniWorkflow(classification);
      
    case 'context_creation':
      return await createContext(classification);
      
    default:
      return {
        success: false,
        error: `Routing type ${routing.type} not implemented yet`
      };
  }
}

function formatRoutingInstructions(classification, result) {
  if (!result.success) {
    return `Classification: ${classification.intentType} (${classification.confidence})
Routing failed: ${result.error}

Would you like me to try a different approach?`;
  }
  
  return `Intent classified as ${classification.intentType} with ${classification.complexity.overall_complexity} complexity.

Routed to: ${classification.routing.type}
${result.message || 'Processing initiated successfully.'}

${result.nextSteps ? `Next steps: ${result.nextSteps}` : ''}`;
}
```

### Intent-Based Context Templates
```yaml
# contexts/templates/business-growth-project.yaml
metadata:
  type: project
  name: "{project_name}"
  template_for: business_growth
  
intent_context:
  intent_type: business_growth
  business_goal: "{business_goal}"
  
behavior_rules:
  - trigger: context_created
    action: create_revenue_tracking
    
  - trigger: milestone_reached  
    action: measure_business_impact
    
polymorphic_config:
  project_config:
    success_metrics:
      - revenue_impact
      - customer_satisfaction
      - operational_efficiency
```

## 🧪 Test Implementation
```javascript
// tests/unit/intent-classifier.test.js
describe('IntentClassifier', () => {
  let classifier;
  let mockLLM;
  
  beforeEach(() => {
    mockLLM = {
      complete: jest.fn()
    };
    
    classifier = new IntentClassifier({
      llmAdapter: mockLLM
    });
  });
  
  it('should classify business intent correctly', async () => {
    mockLLM.complete.mockResolvedValueOnce(JSON.stringify({
      type: 'business_growth',
      confidence: 0.9,
      reasoning: 'mentions revenue and customers',
      keywords: ['sales', 'revenue', 'customers']
    }));
    
    mockLLM.complete.mockResolvedValueOnce(JSON.stringify({
      scope: 5,
      duration: 'weeks',
      dependencies: 8,
      stakeholders: 12,
      uncertainty: 0.4,
      risk: 0.3,
      overall_complexity: 'medium'
    }));
    
    const result = await classifier.classifyIntent(
      "Increase sales revenue by improving customer onboarding"
    );
    
    expect(result.intentType).toBe('business_growth');
    expect(result.confidence).toBe(0.9);
    expect(result.complexity.overall_complexity).toBe('medium');
    expect(result.routing.type).toBe('context_creation');
  });
  
  it('should handle personal intent', async () => {
    mockLLM.complete.mockResolvedValueOnce(JSON.stringify({
      type: 'personal_experience',
      confidence: 0.85,
      reasoning: 'personal health improvement',
      keywords: ['health', 'personal', 'improve']
    }));
    
    mockLLM.complete.mockResolvedValueOnce(JSON.stringify({
      scope: 1,
      duration: 'days',
      dependencies: 2,
      stakeholders: 1,
      uncertainty: 0.2,
      risk: 0.1,
      overall_complexity: 'low'
    }));
    
    const result = await classifier.classifyIntent(
      "Help me improve my daily exercise routine"
    );
    
    expect(result.intentType).toBe('personal_experience');
    expect(result.routing.type).toBe('one_shot_execution');
  });
});
```

## 🔧 Dependencies
- Uses LLM for classification and analysis
- Integrates with Memory Context
- Works with Context Creation system

## 📊 Effort Estimate
- Implementation: 3.5 hours
- Testing: 1.5 hours
- Total: 5 hours

## 🚀 Next Steps
After this ticket:
- 013: Task Entity Enhancement
- 014: Nano Agent Base

## 📝 Notes
- Intent drives all routing decisions
- Complexity determines context creation
- Learning improves accuracy over time
- Patterns enable rapid classification