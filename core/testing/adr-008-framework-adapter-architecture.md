# ADR-008: Framework Adapter Architecture (Future Feature)

## Status
📋 **DOCUMENTED** - December 19, 2024
*Future enhancement - not for immediate implementation*

## Context
Based on analysis of major agent frameworks (LangChain, OpenAI Evals, CrewAI, AutoGen, Swarm), document the architecture for future framework adapter implementation. This is a valuable future feature but not part of the initial release.

## Decision
**Document adapter patterns for future implementation using observation and protocol approaches**

## Framework Integration Patterns Identified

### 1. LangChain/LangSmith Integration
```javascript
// Future LangChain adapter pattern
class LangChainAdapter {
  constructor(langchainAgent) {
    this.agent = langchainAgent;
    this.type = 'langchain';
  }
  
  async executeTrajectory(scenario) {
    // Use LangChain's built-in tracing
    const result = await this.agent.invoke(scenario.input, {
      callbacks: [new LangSmithTracer()]
    });
    
    return {
      output: result.output,
      steps: result.intermediate_steps || [],
      trace: this.extractTrace(result),
      tools_used: this.extractToolUsage(result)
    };
  }
  
  // Map LangChain evaluators to our format
  async evaluate(result, evaluators) {
    const langsmithEvals = evaluators.map(e => this.mapToLangSmith(e));
    return await evaluate(this.agent, langsmithEvals);
  }
}
```

### 2. OpenAI Evals Integration  
```javascript
// Future OpenAI Evals adapter pattern
class OpenAIEvalsAdapter {
  constructor(evalName, completionFn) {
    this.evalName = evalName;
    this.completionFn = completionFn;
    this.type = 'openai_evals';
  }
  
  async executeSample(testCase) {
    // Use OpenAI Evals registry pattern
    const sample = {
      input: testCase.input,
      ideal: testCase.expected
    };
    
    const result = await this.evalRegistry.run(this.evalName, sample);
    
    return {
      input: sample.input,
      output: result.output,
      expected: sample.ideal,
      correct: result.correct,
      metadata: result.metadata
    };
  }
  
  // Batch evaluation using OpenAI Evals
  async evaluateDataset(dataset) {
    return await this.evalRegistry.runBatch(this.evalName, dataset);
  }
}
```

### 3. CrewAI Integration
```javascript
// Future CrewAI adapter pattern  
class CrewAIAdapter {
  constructor(crew) {
    this.crew = crew;
    this.type = 'crewai';
  }
  
  async executeRoleBasedTask(task) {
    const execution = await this.crew.kickoff(task);
    
    return {
      task: task,
      result: execution.result,
      agents_performance: this.extractAgentPerformance(execution),
      collaboration_metrics: this.analyzeCollaboration(execution),
      workflow: execution.workflow || []
    };
  }
  
  // Extract individual agent performance
  extractAgentPerformance(execution) {
    return this.crew.agents.map(agent => ({
      role: agent.role,
      tasks_completed: agent.tasks_completed,
      performance_score: this.calculateAgentScore(agent, execution),
      tools_used: agent.tools_used
    }));
  }
}
```

### 4. AutoGen Integration
```javascript
// Future AutoGen adapter pattern
class AutoGenAdapter {
  constructor(agents) {
    this.agents = agents;
    this.type = 'autogen';
  }
  
  async executeConversation(scenario) {
    const userProxy = this.agents.find(a => a.name === 'user_proxy');
    const assistant = this.agents.find(a => a.name === 'assistant');
    
    const conversation = await userProxy.initiate_chat(
      assistant,
      message: scenario.input,
      max_turns: scenario.max_turns || 10
    );
    
    return {
      turns: conversation.chat_history,
      final_result: conversation.summary,
      collaboration_quality: this.analyzeConversation(conversation),
      tokens_used: this.calculateTokenUsage(conversation)
    };
  }
}
```

### 5. OpenAI Swarm Integration
```javascript
// Future Swarm adapter pattern
class SwarmAdapter {
  constructor(swarmClient, agents) {
    this.client = swarmClient;
    this.agents = agents;
    this.type = 'swarm';
  }
  
  async executeHandoffFlow(request) {
    const response = await this.client.run({
      agent: this.agents.general,
      messages: [{ role: 'user', content: request.input }]
    });
    
    return {
      response: response.messages[response.messages.length - 1].content,
      agent_path: this.extractAgentPath(response),
      handoffs: this.analyzeHandoffs(response),
      efficiency: this.calculateEfficiency(response)
    };
  }
}
```

## Adapter Architecture Patterns

### 1. Observation Layer Approach ⭐ **PREFERRED**
```javascript
// Monitor running agents without controlling them
class AgentObserver {
  constructor(framework, agent) {
    this.framework = framework;
    this.agent = agent;
    this.traces = [];
  }
  
  async monitor(scenario) {
    // Wrap agent methods to capture execution data
    const wrappedAgent = this.wrapAgent(this.agent);
    
    const startTime = Date.now();
    const result = await wrappedAgent.execute(scenario);
    const endTime = Date.now();
    
    return {
      result,
      trace: this.traces,
      performance: {
        latency: endTime - startTime,
        steps: this.traces.length,
        tools_used: this.extractToolUsage()
      }
    };
  }
  
  wrapAgent(agent) {
    // Framework-specific wrapping logic
    return new Proxy(agent, {
      get: (target, prop) => {
        const original = target[prop];
        if (typeof original === 'function') {
          return (...args) => {
            this.traces.push({ method: prop, args, timestamp: Date.now() });
            return original.apply(target, args);
          };
        }
        return original;
      }
    });
  }
}
```

### 2. Protocol Standards Approach
```javascript
// Define interfaces that frameworks can implement
interface LevTestCompatible {
  execute(scenario: Scenario): Promise<Result>;
  getTrace(): ExecutionTrace;
  getMetrics(): PerformanceMetrics;
  evaluate(evaluators: string[]): Promise<EvaluationResult>;
}

// Frameworks implementing this interface work automatically
class ProtocolAdapter {
  constructor(compatibleAgent) {
    if (!this.isCompatible(compatibleAgent)) {
      throw new Error('Agent does not implement LevTestCompatible interface');
    }
    this.agent = compatibleAgent;
  }
  
  async test(scenario, evaluators) {
    const result = await this.agent.execute(scenario);
    const trace = await this.agent.getTrace();
    const metrics = await this.agent.getMetrics();
    const evaluation = await this.agent.evaluate(evaluators);
    
    return { result, trace, metrics, evaluation };
  }
}
```

### 3. Plugin-Based Extension
```javascript
// Framework adapters as plugins
class FrameworkAdapterRegistry {
  constructor() {
    this.adapters = new Map();
  }
  
  register(framework, adapterClass) {
    this.adapters.set(framework, adapterClass);
  }
  
  detect(agent) {
    // Auto-detect framework based on agent structure
    if (agent.invoke && agent.stream) return 'langchain';
    if (agent.initiate_chat) return 'autogen';
    if (agent.role && agent.backstory) return 'crewai';
    if (agent.run && agent.client) return 'swarm';
    return 'custom';
  }
  
  createAdapter(agent) {
    const framework = this.detect(agent);
    const AdapterClass = this.adapters.get(framework);
    
    if (!AdapterClass) {
      throw new Error(`No adapter available for framework: ${framework}`);
    }
    
    return new AdapterClass(agent);
  }
}
```

## Universal Adapter Interface

### Unified Testing Interface
```javascript
// Universal interface that all adapters implement
class UniversalFrameworkAdapter {
  constructor(agent, framework) {
    this.agent = agent;
    this.framework = framework;
  }
  
  // Required methods all adapters must implement
  async execute(scenario, options) {
    throw new Error('execute() must be implemented by framework adapter');
  }
  
  async evaluate(result, evaluators) {
    throw new Error('evaluate() must be implemented by framework adapter');
  }
  
  getCapabilities() {
    throw new Error('getCapabilities() must be implemented by framework adapter');
  }
  
  // Optional methods with default implementations
  async loadTest(scenario, options = {}) {
    const results = [];
    const concurrency = options.concurrency || 1;
    
    for (let i = 0; i < concurrency; i++) {
      results.push(this.execute(scenario, options));
    }
    
    return Promise.all(results);
  }
  
  async benchmark(scenarios, providers) {
    const results = new Map();
    
    for (const provider of providers) {
      const providerResults = [];
      for (const scenario of scenarios) {
        const result = await this.execute(scenario, { provider });
        providerResults.push(result);
      }
      results.set(provider, providerResults);
    }
    
    return this.analyzeBenchmark(results);
  }
}
```

### Usage with Adapters
```javascript
// Future usage pattern with framework adapters
test('cross-framework agent comparison', async () => {
  // Test the same scenario across multiple frameworks
  const scenario = { input: 'Plan a marketing campaign' };
  
  const langchainResult = await testWithFramework('langchain', myLangChainAgent, scenario);
  const crewaiResult = await testWithFramework('crewai', myCrewAIAgent, scenario);
  const customResult = await testWithFramework('custom', myCustomAgent, scenario);
  
  // Compare results across frameworks
  const comparison = compareFrameworkResults([
    { framework: 'langchain', result: langchainResult },
    { framework: 'crewai', result: crewaiResult },
    { framework: 'custom', result: customResult }
  ]);
  
  expect(comparison.winner).toBeDefined();
  expect(comparison.metrics.accuracy).toBeGreaterThan(0.8);
});
```

## Implementation Strategy (Future)

### Phase 1: Observation Layer
- Implement agent monitoring without control
- Capture execution traces and performance metrics
- Support basic evaluation of any running agent

### Phase 2: Protocol Standards
- Define LevTestCompatible interface
- Work with framework maintainers to implement
- Provide reference implementations

### Phase 3: Native Adapters
- Build framework-specific adapters
- Optimize for each framework's strengths
- Provide seamless integration experience

### Phase 4: Community Ecosystem
- Plugin marketplace for community adapters
- Framework partnerships and integrations
- Standardized testing protocols

## Benefits (When Implemented)

### Developer Experience
- Test any agent framework with same interface
- Easy migration between frameworks
- Cross-framework performance comparison
- Unified tooling and workflows

### Framework Ecosystem
- Encourages framework standardization
- Promotes testing best practices
- Enables ecosystem interoperability
- Drives innovation through competition

### Business Value
- Reduces vendor lock-in concerns
- Enables objective framework evaluation
- Simplifies technology stack decisions
- Future-proofs testing infrastructure

## Challenges and Considerations

### Technical Challenges
- Framework API differences and incompatibilities
- Performance overhead from abstraction layers
- Maintaining compatibility across framework versions
- Complex error handling across different systems

### Maintenance Burden
- Multiple framework APIs to track and support
- Breaking changes in upstream frameworks
- Community adapter quality and maintenance
- Documentation and example maintenance

### Strategic Considerations
- Relationship with framework maintainers
- Competitive dynamics in framework ecosystem
- Open source vs commercial licensing
- Resource allocation for adapter development

## Future Decision Points

### When to Implement
- After core testing framework is stable and adopted
- When community requests specific framework support
- When strategic partnerships with frameworks emerge
- When resources allow for sustained adapter maintenance

### Which Frameworks First
- **Priority 1**: LangChain (largest user base)
- **Priority 2**: OpenAI Evals (industry standard)
- **Priority 3**: CrewAI (growing multi-agent interest)
- **Priority 4**: AutoGen (Microsoft ecosystem)
- **Priority 5**: Swarm (if it moves beyond experimental)

## Consequences
- **Positive**: Comprehensive framework ecosystem integration
- **Positive**: Competitive differentiation from single-framework solutions
- **Positive**: Community ecosystem growth opportunities
- **Positive**: Industry leadership in testing standardization
- **Negative**: Significant development and maintenance overhead
- **Negative**: Complexity in managing multiple framework APIs
- **Negative**: Risk of framework changes breaking adapters
- **Negative**: Resource diversion from core features

## Related Decisions
- Links to ADR-004 (Integration Strategy)
- Links to ADR-005 (Universal Agent Interface)
- Links to ADR-003 (Core Value Proposition)