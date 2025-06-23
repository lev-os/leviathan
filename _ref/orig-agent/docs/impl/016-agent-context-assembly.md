# Implementation Ticket: 016 - Agent Context Assembly

## 📋 Overview
Create the final integration that assembles context-aware agents with dynamic capability injection and multi-agent coordination.

## 🔗 References
- **Previous**: [015 - Agent Registry](015-agent-registry.md)
- **Integrates**: All previous tickets into cohesive system

## 🎯 Scope
Create final integration that:
- Assembles context for agents
- Enables multi-agent workflows
- Provides intelligent agent selection
- Completes the system architecture

## ✅ Acceptance Criteria

### AC-016-1: Context-Aware Agent Assembly
```yaml
Given: Request requiring agent capabilities
When: Context assembled for agent
Then: Agent receives relevant context
And: Context includes domain knowledge
And: Agent adapts behavior accordingly
```

### AC-016-2: Multi-Agent Coordination
```yaml
Given: Complex task requiring multiple agents
When: Task decomposed across agents
Then: Agents work collaboratively
And: Results are synthesized
And: Context shared appropriately
```

### AC-016-3: Intelligent Agent Selection
```yaml
Given: Request with specific context
When: Agent selection occurs
Then: Best-fit agent chosen
And: Context match considered
And: Capability and health weighted
```

### AC-016-4: System Integration
```yaml
Given: Complete Kingly system
When: User makes request
Then: Intent classified correctly
And: Context assembled dynamically
And: Agents coordinate seamlessly
And: Results delivered efficiently
```

## 🧪 Test Cases

### Unit Tests
1. **Context assembly** - Agents get right context
2. **Agent selection** - Best agent chosen
3. **Multi-agent flow** - Coordination works
4. **Context sharing** - Information flows correctly
5. **Result synthesis** - Outputs combined properly

### Integration Tests
1. **End-to-end** - Full system workflow
2. **Complex scenarios** - Multi-step, multi-agent
3. **Error recovery** - Failures handled gracefully

## 💻 Implementation

### Agent Context Assembler
```javascript
// src/application/agent-context-assembler.js
export class AgentContextAssembler {
  constructor(dependencies) {
    this.contextAssembler = dependencies.contextAssembler;
    this.agentRegistry = dependencies.agentRegistry;
    this.memoryContext = dependencies.memoryContext;
    this.intentClassifier = dependencies.intentClassifier;
  }
  
  async assembleAgentContext(request) {
    const { capability, params, userContext } = request;
    
    // Step 1: Classify intent if not already done
    let intentClassification = request.intentClassification;
    if (!intentClassification) {
      intentClassification = await this.intentClassifier.classifyIntent(
        params.description || params.query || 'Perform task',
        userContext
      );
    }
    
    // Step 2: Find suitable agents
    const candidateAgents = await this.agentRegistry.findByCapability(capability);
    
    // Step 3: Assemble context for agent selection
    const selectionContext = await this.contextAssembler.assembleContext({
      currentContext: userContext.context || 'default',
      situation: {
        capability: capability,
        intent: intentClassification,
        agents: candidateAgents.map(a => a.getStatus()),
        params: params
      },
      intent: intentClassification.intentType
    });
    
    // Step 4: Select best agent
    const selectedAgent = await this.selectBestAgentWithContext(
      candidateAgents,
      selectionContext,
      intentClassification
    );
    
    // Step 5: Assemble specific context for chosen agent
    const agentContext = await this.assembleSpecificAgentContext(
      selectedAgent,
      request,
      intentClassification,
      selectionContext
    );
    
    return {
      agent: selectedAgent,
      context: agentContext,
      intentClassification: intentClassification,
      reasoning: this.explainSelection(selectedAgent, candidateAgents, agentContext)
    };
  }
  
  async selectBestAgentWithContext(candidates, context, intentClassification) {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    
    // Score each agent based on multiple factors
    const scored = await Promise.all(
      candidates.map(async (agent) => {
        const score = await this.scoreAgentForContext(
          agent,
          context,
          intentClassification
        );
        return { agent, score };
      })
    );
    
    // Sort by score and return best
    scored.sort((a, b) => b.score - a.score);
    return scored[0].agent;
  }
  
  async scoreAgentForContext(agent, context, intentClassification) {
    let score = agent.calculateHealth(); // Base health (0-1)
    
    // Factor 1: Load balancing (0-1)
    const loadFactor = 1 - (agent.state.requestCount / agent.config.maxRequests);
    score *= loadFactor;
    
    // Factor 2: Context specialization (0-2 multiplier)
    const specializationScore = await this.calculateSpecializationScore(
      agent,
      context,
      intentClassification
    );
    score *= specializationScore;
    
    // Factor 3: Recent performance (0.5-1.5 multiplier)
    const performanceScore = await this.getPerformanceScore(agent);
    score *= performanceScore;
    
    // Factor 4: Memory relevance (0.8-1.2 multiplier)
    if (this.memoryContext) {
      const memoryScore = await this.getMemoryRelevanceScore(
        agent,
        intentClassification
      );
      score *= memoryScore;
    }
    
    return score;
  }
  
  async calculateSpecializationScore(agent, context, intentClassification) {
    let score = 1.0; // Base score
    
    // Check if agent type matches intent type
    const typeAlignment = {
      'code': ['business_growth', 'organizational_coordination'],
      'data': ['business_growth', 'organizational_coordination', 'civilizational_impact'],
      'ui': ['personal_experience', 'business_growth']
    };
    
    if (typeAlignment[agent.type]?.includes(intentClassification.intentType)) {
      score *= 1.3;
    }
    
    // Check context alignment using behavior rules
    if (context.behavior_rules) {
      const relevantRules = context.behavior_rules.filter(rule => 
        agent.capabilities.some(cap => rule.action.includes(cap))
      );
      score *= (1 + relevantRules.length * 0.1);
    }
    
    // Check if agent has handled similar requests
    if (agent.config.primary_capability) {
      score *= 1.2; // Boost for specialized agents
    }
    
    return Math.min(2.0, score); // Cap at 2x
  }
  
  async getPerformanceScore(agent) {
    // Simple performance scoring based on request count and age
    const successRate = 1 - (agent.state.errorCount || 0) / Math.max(1, agent.state.requestCount);
    const freshness = Math.max(0.5, 1 - (Date.now() - agent.state.created) / (24 * 60 * 60 * 1000));
    
    return (successRate * 0.7 + freshness * 0.3) + 0.5; // 0.5 to 1.5 range
  }
  
  async getMemoryRelevanceScore(agent, intentClassification) {
    const memories = await this.memoryContext.recall(
      `agent:${agent.type} ${intentClassification.intentType}`,
      { agent_type: agent.type },
      3
    );
    
    if (memories.length === 0) return 1.0;
    
    // Boost if positive memories, penalize if negative
    const positiveMemories = memories.filter(m => 
      m.context.outcome?.success !== false
    );
    
    return 0.8 + (positiveMemories.length / memories.length) * 0.4; // 0.8 to 1.2 range
  }
  
  async assembleSpecificAgentContext(agent, request, intentClassification, baseContext) {
    // Start with base context
    let agentContext = { ...baseContext };
    
    // Add agent-specific context
    const agentSpecificContext = await this.contextAssembler.assembleContext({
      currentContext: `agents/${agent.type}-specialized`,
      situation: {
        agent: agent.getStatus(),
        request: request,
        intent: intentClassification
      }
    });
    
    // Merge contexts intelligently
    agentContext = this.mergeContexts(agentContext, agentSpecificContext);
    
    // Add relevant memories
    if (this.memoryContext) {
      const relevantMemories = await this.memoryContext.recall(
        `${agent.type} ${request.capability}`,
        { agent_type: agent.type, capability: request.capability },
        5
      );
      
      if (relevantMemories.length > 0) {
        agentContext.relevant_memories = relevantMemories.map(m => ({
          content: m.content,
          relevance: m.relevance,
          timestamp: m.timestamp
        }));
      }
    }
    
    // Add capability-specific guidance
    agentContext.capability_guidance = await this.generateCapabilityGuidance(
      agent,
      request.capability,
      intentClassification
    );
    
    return agentContext;
  }
  
  mergeContexts(base, specific) {
    // Intelligent context merging
    const merged = { ...base };
    
    // Merge behavior rules
    if (specific.behavior_rules) {
      merged.behavior_rules = [
        ...(merged.behavior_rules || []),
        ...specific.behavior_rules
      ];
    }
    
    // Merge metadata
    if (specific.metadata) {
      merged.metadata = {
        ...merged.metadata,
        ...specific.metadata
      };
    }
    
    // Add specific intent context
    if (specific.intent_context) {
      merged.intent_context = {
        ...merged.intent_context,
        ...specific.intent_context
      };
    }
    
    return merged;
  }
  
  async generateCapabilityGuidance(agent, capability, intentClassification) {
    const guidanceMap = {
      generate_code: {
        focus: 'Write clean, maintainable code that follows best practices',
        considerations: ['security', 'performance', 'testability'],
        output_format: 'code with comments and documentation'
      },
      analyze_data: {
        focus: 'Provide insights and actionable recommendations',
        considerations: ['accuracy', 'relevance', 'clarity'],
        output_format: 'structured analysis with visualizations'
      },
      create_layout: {
        focus: 'Design user-friendly and accessible interfaces',
        considerations: ['usability', 'accessibility', 'brand consistency'],
        output_format: 'design specifications with rationale'
      }
    };
    
    const baseGuidance = guidanceMap[capability] || {
      focus: 'Complete the task effectively and efficiently',
      considerations: ['quality', 'completeness'],
      output_format: 'structured response'
    };
    
    // Adapt guidance based on intent type
    if (intentClassification.intentType === 'business_growth') {
      baseGuidance.business_context = 'Focus on ROI and customer value';
    } else if (intentClassification.intentType === 'personal_experience') {
      baseGuidance.personal_context = 'Prioritize user satisfaction and ease of use';
    }
    
    return baseGuidance;
  }
  
  explainSelection(selectedAgent, allCandidates, context) {
    if (!selectedAgent) return 'No suitable agents available';
    
    const reasons = [];
    
    if (allCandidates.length === 1) {
      reasons.push('Only available agent for this capability');
    } else {
      reasons.push(`Selected from ${allCandidates.length} candidates`);
      reasons.push(`Agent health: ${(selectedAgent.calculateHealth() * 100).toFixed(0)}%`);
      reasons.push(`Current load: ${selectedAgent.state.requestCount}/${selectedAgent.config.maxRequests}`);
    }
    
    if (context.relevant_memories?.length > 0) {
      reasons.push(`${context.relevant_memories.length} relevant memories found`);
    }
    
    return reasons.join('; ');
  }
}

// Multi-Agent Coordinator
export class MultiAgentCoordinator {
  constructor(dependencies) {
    this.agentContextAssembler = dependencies.agentContextAssembler;
    this.workflowExecutor = dependencies.workflowExecutor;
    this.resultSynthesizer = new ResultSynthesizer();
  }
  
  async coordinateMultiAgentTask(task) {
    const { subtasks, coordination } = task;
    
    // Step 1: Assign agents to subtasks
    const assignments = await this.assignAgents(subtasks);
    
    // Step 2: Execute based on coordination strategy
    let results;
    if (coordination === 'parallel') {
      results = await this.executeParallel(assignments);
    } else if (coordination === 'sequential') {
      results = await this.executeSequential(assignments);
    } else {
      results = await this.executeWorkflow(assignments, task.workflow);
    }
    
    // Step 3: Synthesize results
    const synthesized = await this.resultSynthesizer.synthesize(
      results,
      task.synthesis_strategy
    );
    
    return {
      success: results.every(r => r.success),
      results: results,
      synthesized: synthesized,
      coordination: coordination,
      agents_used: assignments.map(a => a.agent.id)
    };
  }
  
  async assignAgents(subtasks) {
    const assignments = [];
    
    for (const subtask of subtasks) {
      const assignment = await this.agentContextAssembler.assembleAgentContext({
        capability: subtask.capability,
        params: subtask.params,
        userContext: subtask.context || {}
      });
      
      assignments.push({
        subtask: subtask,
        agent: assignment.agent,
        context: assignment.context
      });
    }
    
    return assignments;
  }
  
  async executeParallel(assignments) {
    const promises = assignments.map(assignment => 
      this.executeAssignment(assignment)
    );
    
    return await Promise.all(promises);
  }
  
  async executeSequential(assignments) {
    const results = [];
    let sharedContext = {};
    
    for (const assignment of assignments) {
      // Pass results from previous steps
      assignment.context.previous_results = results;
      assignment.context.shared_context = sharedContext;
      
      const result = await this.executeAssignment(assignment);
      results.push(result);
      
      // Update shared context for next step
      if (result.success && result.data.shared_data) {
        sharedContext = {
          ...sharedContext,
          ...result.data.shared_data
        };
      }
    }
    
    return results;
  }
  
  async executeAssignment(assignment) {
    const { subtask, agent, context } = assignment;
    
    const request = {
      capability: subtask.capability,
      params: subtask.params,
      context: context
    };
    
    try {
      const result = await agent.handleRequest(request);
      
      return {
        ...result,
        subtask_id: subtask.id,
        agent_id: agent.id
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        subtask_id: subtask.id,
        agent_id: agent.id
      };
    }
  }
}

// Result Synthesizer
export class ResultSynthesizer {
  async synthesize(results, strategy = 'combine') {
    switch (strategy) {
      case 'combine':
        return this.combineResults(results);
      case 'merge':
        return this.mergeResults(results);
      case 'prioritize':
        return this.prioritizeResults(results);
      case 'validate':
        return this.validateResults(results);
      default:
        return this.combineResults(results);
    }
  }
  
  combineResults(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return {
      combined_data: successful.map(r => r.data),
      success_count: successful.length,
      failure_count: failed.length,
      failures: failed.map(r => ({ agent: r.agent_id, error: r.error })),
      overall_success: failed.length === 0
    };
  }
  
  mergeResults(results) {
    const merged = {};
    const errors = [];
    
    for (const result of results) {
      if (result.success && result.data) {
        Object.assign(merged, result.data);
      } else {
        errors.push({ agent: result.agent_id, error: result.error });
      }
    }
    
    return {
      merged_data: merged,
      errors: errors,
      success: errors.length === 0
    };
  }
  
  prioritizeResults(results) {
    const successful = results.filter(r => r.success);
    
    // Sort by confidence or quality score
    successful.sort((a, b) => {
      const scoreA = a.data.confidence || a.data.quality || 0.5;
      const scoreB = b.data.confidence || b.data.quality || 0.5;
      return scoreB - scoreA;
    });
    
    return {
      primary_result: successful[0]?.data,
      alternatives: successful.slice(1).map(r => r.data),
      rejected: results.filter(r => !r.success)
    };
  }
}

// Main Integration Tool
export const kinglySystemTool = {
  name: 'kingly_system',
  description: 'Main entry point for the Kingly universal context system',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      context: { type: 'object' },
      mode: { 
        type: 'string',
        enum: ['auto', 'single_agent', 'multi_agent', 'workflow'],
        default: 'auto'
      }
    },
    required: ['query']
  },
  handler: async (params) => {
    try {
      // Initialize system components
      const system = getKinglySystem();
      
      // Step 1: Classify intent
      const intentClassification = await system.intentClassifier.classifyIntent(
        params.query,
        params.context || {}
      );
      
      // Step 2: Determine execution strategy
      const strategy = params.mode === 'auto' 
        ? determineStrategy(intentClassification)
        : params.mode;
      
      // Step 3: Execute based on strategy
      let result;
      
      if (strategy === 'single_agent') {
        result = await executeSingleAgent(system, params, intentClassification);
      } else if (strategy === 'multi_agent') {
        result = await executeMultiAgent(system, params, intentClassification);
      } else if (strategy === 'workflow') {
        result = await executeWorkflow(system, params, intentClassification);
      } else {
        throw new Error(`Unknown strategy: ${strategy}`);
      }
      
      // Step 4: Learn from execution
      await system.memoryContext.addMemory({
        type: 'execution',
        content: `${strategy}: ${params.query}`,
        context: {
          classification: intentClassification,
          result: result,
          strategy: strategy
        }
      });
      
      return {
        success: true,
        data: result,
        classification: intentClassification,
        strategy: strategy,
        _llm_instructions: formatKinglyResponse(result, strategy)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        _llm_instructions: `Kingly system encountered an error: ${error.message}
        
        Would you like me to try a different approach?`
      };
    }
  }
};

function determineStrategy(intentClassification) {
  const complexity = intentClassification.complexity.overall_complexity;
  const routing = intentClassification.routing.type;
  
  if (routing === 'one_shot_execution') return 'single_agent';
  if (routing === 'mini_workflow') return 'workflow';
  if (complexity === 'high' || complexity === 'extreme') return 'multi_agent';
  
  return 'single_agent';
}

function formatKinglyResponse(result, strategy) {
  let response = `Executed using ${strategy} strategy.\n\n`;
  
  if (strategy === 'single_agent') {
    response += `Agent ${result.agent_id} completed the task.`;
  } else if (strategy === 'multi_agent') {
    response += `Coordinated ${result.agents_used.length} agents: ${result.agents_used.join(', ')}`;
  } else {
    response += `Workflow completed with ${result.steps_completed || 'unknown'} steps.`;
  }
  
  return response;
}
```

## 🧪 Test Implementation
```javascript
// tests/integration/agent-context-assembly.test.js
describe('Agent Context Assembly Integration', () => {
  let system;
  
  beforeEach(async () => {
    system = await createTestKinglySystem();
  });
  
  it('should assemble context and select appropriate agent', async () => {
    const request = {
      capability: 'generate_code',
      params: {
        description: 'Create a login function for our e-commerce app',
        language: 'javascript'
      },
      userContext: {
        project: 'ecommerce-app',
        context: 'business/auth'
      }
    };
    
    const assembly = await system.agentContextAssembler.assembleAgentContext(request);
    
    expect(assembly.agent).toBeDefined();
    expect(assembly.agent.type).toBe('code');
    expect(assembly.context).toHaveProperty('capability_guidance');
    expect(assembly.reasoning).toContain('Selected from');
  });
  
  it('should coordinate multi-agent tasks', async () => {
    const task = {
      subtasks: [
        {
          id: 'design',
          capability: 'create_layout',
          params: { component: 'login-form' }
        },
        {
          id: 'implement',
          capability: 'generate_code',
          params: { component: 'login-form' }
        },
        {
          id: 'test',
          capability: 'write_tests',
          params: { component: 'login-form' }
        }
      ],
      coordination: 'sequential',
      synthesis_strategy: 'combine'
    };
    
    const result = await system.multiAgentCoordinator.coordinateMultiAgentTask(task);
    
    expect(result.success).toBe(true);
    expect(result.results).toHaveLength(3);
    expect(result.agents_used).toHaveLength(3);
    expect(result.synthesized).toHaveProperty('combined_data');
  });
  
  it('should handle complete system workflow', async () => {
    const result = await kinglySystemTool.handler({
      query: 'Create a user authentication system with login, logout, and session management',
      context: { project: 'web-app' },
      mode: 'auto'
    });
    
    expect(result.success).toBe(true);
    expect(result.classification).toHaveProperty('intentType');
    expect(result.strategy).toBeDefined();
    expect(result._llm_instructions).toContain('strategy');
  });
});
```

## 🔧 Dependencies
- All previous tickets (001-015)
- Complete system integration

## 📊 Effort Estimate
- Implementation: 4 hours
- Testing: 2 hours
- Total: 6 hours

## 🚀 System Complete
This completes the full Kingly implementation:
- Universal context architecture ✅
- Intent-driven routing ✅
- Agent-based execution ✅
- Memory and learning ✅
- Multi-agent coordination ✅

## 📝 Notes
- Final integration of all components
- Context-aware agent selection
- Multi-agent coordination
- Complete system architecture achieved