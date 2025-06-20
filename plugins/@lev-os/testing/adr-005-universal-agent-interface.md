# ADR-005: Universal Agent Interface Design

## Status
📝 **DRAFT** - December 19, 2024

## Context
Based on analysis of major agent frameworks (LangChain, OpenAI Evals, CrewAI, AutoGen, Swarm), need to design a universal interface that abstracts common testing patterns while maintaining framework flexibility.

## Decision
**Create universal testing patterns that abstract common agent interaction models**

## Framework Pattern Analysis

### Identified Common Patterns

#### 1. **Trajectory Pattern** (LangChain Style)
- Multi-step execution with intermediate states
- Tool usage tracking
- Decision path analysis
- Step-by-step evaluation

#### 2. **Sample Pattern** (OpenAI Evals Style)  
- Single input → output evaluation
- Expected result comparison
- Batch processing capability
- Registry-based organization

#### 3. **Conversation Pattern** (AutoGen Style)
- Multi-turn dialogue simulation
- Agent-to-agent communication
- Dynamic collaboration
- Turn-based analysis

#### 4. **Role Pattern** (CrewAI Style)
- Specialized agent responsibilities
- Task-oriented execution
- Collaborative workflow assessment
- Performance by role evaluation

#### 5. **Handoff Pattern** (Swarm Style)
- Agent routing and delegation
- Simple state transitions
- Lightweight coordination
- Flow validation

## Universal Interface Design

### Core Abstract Interface
```javascript
class UniversalAgentInterface {
  // Framework-agnostic agent wrapper
  constructor(agent, options = {}) {
    this.agent = agent;
    this.framework = options.framework || 'custom';
    this.capabilities = this.detectCapabilities(agent);
  }
  
  // Detect what patterns this agent supports
  detectCapabilities(agent) {
    return {
      trajectory: this.supportsTrajectory(agent),
      sample: this.supportsSample(agent),
      conversation: this.supportsConversation(agent),
      role: this.supportsRole(agent),
      handoff: this.supportsHandoff(agent)
    };
  }
  
  // Universal execution method
  async execute(input, options = {}) {
    const pattern = options.pattern || this.selectBestPattern(input);
    return await this[pattern](input, options);
  }
}
```

### Pattern Implementation
```javascript
class UniversalAgentTest extends UniversalAgentInterface {
  // 1. Trajectory Pattern - Multi-step execution analysis
  async trajectory(scenario, options = {}) {
    const execution = await this.agent.execute(scenario);
    return {
      steps: execution.steps || [],
      tools_used: this.extractToolUsage(execution),
      decision_points: this.analyzeDecisions(execution),
      performance: this.measurePerformance(execution),
      evaluation: await this.evaluateTrajectory(execution, options.evaluators)
    };
  }
  
  // 2. Sample Pattern - Input/output evaluation
  async sample(testCase, options = {}) {
    const startTime = Date.now();
    const result = await this.agent.process(testCase.input);
    const endTime = Date.now();
    
    return {
      input: testCase.input,
      output: result,
      expected: testCase.expected,
      correct: this.compareResults(result, testCase.expected),
      metadata: {
        latency: endTime - startTime,
        tokens: result.usage || {},
        cost: this.calculateCost(result.usage)
      }
    };
  }
  
  // 3. Conversation Pattern - Multi-turn dialogue
  async conversation(participants, scenario, options = {}) {
    const conversation = new ConversationSimulator(participants);
    const dialogue = await conversation.simulate(scenario, options);
    
    return {
      turns: dialogue.turns,
      participants: dialogue.participants,
      flow_analysis: this.analyzeConversationFlow(dialogue),
      collaboration_metrics: this.measureCollaboration(dialogue),
      outcome: dialogue.final_result
    };
  }
  
  // 4. Role Pattern - Specialized agent assessment  
  async role(agents, task, options = {}) {
    const crew = new RoleBasedCrew(agents);
    const execution = await crew.execute(task);
    
    return {
      task: task,
      agents: agents.map(agent => ({
        role: agent.role,
        performance: this.evaluateRolePerformance(agent, execution),
        contribution: this.measureContribution(agent, execution)
      })),
      coordination: this.analyzeCoordination(execution),
      outcome: execution.result
    };
  }
  
  // 5. Handoff Pattern - Agent routing validation
  async handoff(swarm, request, options = {}) {
    const execution = await swarm.run(request);
    
    return {
      request: request,
      routing_path: execution.agent_path || [],
      handoffs: this.analyzeHandoffs(execution),
      efficiency: this.measureRoutingEfficiency(execution),
      outcome: execution.response
    };
  }
}
```

## Usage Examples

### Framework-Agnostic Testing
```javascript
import { UniversalAgentTest } from '@lev-os/testing';

// Works with any agent, auto-detects best pattern
test('universal agent testing', async () => {
  const universalAgent = new UniversalAgentTest(myAgent);
  
  // Auto-selects appropriate pattern based on scenario
  const result = await universalAgent.execute(scenario);
  
  expect(result.performance.latency).toBeLessThan(2000);
  expect(result.evaluation.accuracy).toBeGreaterThan(0.8);
});

// Explicit pattern selection
test('trajectory pattern testing', async () => {
  const universalAgent = new UniversalAgentTest(myLangChainAgent);
  
  const result = await universalAgent.trajectory(complexScenario, {
    evaluators: ['accuracy', 'efficiency', 'tool_usage']
  });
  
  expect(result.steps).toHaveLength.greaterThan(3);
  expect(result.tools_used).toContain('search_tool');
});
```

### Cross-Framework Comparison
```javascript
test('compare agents across frameworks', async () => {
  const langchainAgent = new UniversalAgentTest(myLangChainAgent);
  const crewaiAgent = new UniversalAgentTest(myCrewAIAgent);
  const customAgent = new UniversalAgentTest(myCustomAgent);
  
  const scenario = { input: 'Analyze this complex problem' };
  
  const results = await Promise.all([
    langchainAgent.execute(scenario),
    crewaiAgent.execute(scenario),
    customAgent.execute(scenario)
  ]);
  
  // Compare performance across frameworks
  const comparison = compareResults(results);
  expect(comparison.winner).toBeDefined();
});
```

## Capability Detection

### Framework Detection
```javascript
class CapabilityDetector {
  static detectFramework(agent) {
    if (agent.invoke && agent.stream) return 'langchain';
    if (agent.initiate_chat) return 'autogen';
    if (agent.role && agent.backstory) return 'crewai';
    if (agent.run && agent.client) return 'swarm';
    if (agent.eval_sample) return 'openai_evals';
    return 'custom';
  }
  
  static detectPatterns(agent) {
    return {
      trajectory: !!(agent.steps || agent.intermediate_steps),
      sample: !!(agent.process || agent.invoke),
      conversation: !!(agent.chat || agent.initiate_chat),
      role: !!(agent.role || agent.backstory),
      handoff: !!(agent.run || agent.transfer)
    };
  }
}
```

## Benefits

### Developer Experience
- One interface learns, test any framework
- Auto-detection reduces configuration
- Consistent patterns across different agents
- Framework comparison capabilities

### Framework Flexibility  
- Preserves framework-specific strengths
- No forced abstraction of unique features
- Graceful degradation for unsupported patterns
- Easy extension for new frameworks

### Testing Comprehensiveness
- Multiple evaluation patterns available
- Cross-framework performance comparison
- Unified metrics and reporting
- Pattern-specific optimizations

## Consequences
- **Positive**: Universal interface reduces learning curve
- **Positive**: Framework comparison enables better decisions
- **Positive**: Pattern detection automates configuration
- **Positive**: Extensible design supports future frameworks
- **Negative**: Abstraction may hide framework-specific features
- **Negative**: Pattern detection complexity
- **Negative**: Maintenance across multiple framework APIs

## Related Decisions
- Links to ADR-004 (Integration Strategy)
- Links to ADR-006 (YAML Configuration Standards)
- Links to ADR-007 (Evaluation System Design)