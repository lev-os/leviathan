# ADR-004: Integration Strategy

## Status
✅ **APPROVED** - December 19, 2024

## Context
Need to define how our universal testing framework integrates with existing agent frameworks (LangChain, OpenAI Evals, CrewAI, AutoGen, Swarm) while maintaining our core value proposition.

## Decision
**Build our universal testing patterns first, implement framework adapters as future enhancement**

## Strategy Evolution

### Initial Consideration: Full Bridge Architecture
- Attempted to design universal bridges to control other frameworks
- Realized this creates significant complexity and maintenance burden
- Framework-specific features would be lost in abstraction
- Better to focus on our core strengths first

### Refined Approach: Universal Patterns + Future Adapters ⭐ **SELECTED**

## Implementation Strategy

### Phase 1: Universal Testing Patterns (Current Focus)
```javascript
// Build patterns that work universally
class UniversalAgentTest {
  // LangChain-style trajectory evaluation
  async evaluateTrajectory(agent, scenario) {
    const trajectory = await agent.execute(scenario);
    return this.assessSteps(trajectory.steps);
  }
  
  // OpenAI Evals-style sample testing  
  async evalSample(agent, sample) {
    const result = await agent.process(sample.input);
    return { correct: result === sample.ideal };
  }
  
  // CrewAI-style role-based testing
  async testCrewWorkflow(crew, task) {
    const result = await crew.execute(task);
    return this.validateRolePerformance(result);
  }
  
  // AutoGen-style conversation testing
  async testConversation(agents, scenario) {
    const conversation = await this.orchestrateChat(agents, scenario);
    return this.analyzeConversationFlow(conversation);
  }
}
```

### Phase 2: Framework Adapters (Future Enhancement)
Document patterns for future implementation:

#### Observation Layer Approach
```javascript
// Monitor any running agent without controlling it
const observer = new AgentObserver({
  framework: 'langchain',
  agent: myLangChainAgent
});

// Capture execution traces for analysis
const trace = await observer.monitor(scenario);
expect(trace.performance.latency).toBeLessThan(2000);
```

#### Protocol Standards Approach  
```javascript
// Define interfaces that frameworks can implement
interface LevTestCompatible {
  execute(scenario: Scenario): Promise<Result>;
  getTrace(): ExecutionTrace;
  getMetrics(): PerformanceMetrics;
}

// Any framework implementing this interface works automatically
test('protocol compatible agent', async () => {
  const result = await compatibleAgent.execute(scenario);
  expect(result).toPassEvaluation('accuracy');
});
```

## Framework-Specific Patterns Identified

### LangChain/LangSmith
- **Pattern**: Trajectory evaluation with custom evaluators
- **Interface**: AgentTrajectoryEvaluator
- **Focus**: Multi-step workflow assessment

### OpenAI Evals
- **Pattern**: Registry-based sample testing
- **Interface**: Eval.eval_sample()
- **Focus**: Individual test case evaluation

### CrewAI
- **Pattern**: YAML-first role-based collaboration
- **Interface**: Crew.execute(task)
- **Focus**: Multi-agent role performance

### AutoGen/AG2
- **Pattern**: Conversation-driven testing
- **Interface**: Agent.initiate_chat()
- **Focus**: Dynamic collaboration assessment

### OpenAI Swarm
- **Pattern**: Lightweight handoff testing
- **Interface**: Swarm.run()
- **Focus**: Agent routing validation

## Integration Benefits

### Immediate Value (Phase 1)
- Universal testing patterns work with any agent system
- Developer learns one API, tests any framework
- Cross-framework performance comparison
- Consistent evaluation metrics

### Future Value (Phase 2)
- Native integration with popular frameworks
- Framework-specific optimization
- Ecosystem partnerships
- Reduced setup complexity

## Documentation Strategy
```markdown
# Framework Compatibility Guide

## Current Support (Universal Patterns)
- ✅ Any agent implementing standard interfaces
- ✅ Cross-framework evaluation and comparison
- ✅ Universal performance metrics

## Future Support (Native Adapters)
- 🔄 LangChain/LangSmith native integration
- 🔄 OpenAI Evals registry compatibility
- 🔄 CrewAI YAML workflow testing
- 🔄 AutoGen conversation monitoring
- 🔄 Swarm handoff validation
```

## Consequences
- **Positive**: Focus on core value proposition first
- **Positive**: Faster time to market with universal patterns
- **Positive**: Framework adapters become competitive moat later
- **Positive**: Clear roadmap for ecosystem expansion
- **Negative**: Framework-specific features not immediately available
- **Negative**: Some setup complexity for framework integration

## Related Decisions
- Links to ADR-003 (Core Value Proposition)
- Links to ADR-005 (Universal Agent Interface)
- Links to ADR-008 (Framework Adapter Architecture)