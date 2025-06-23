# Implementation Ticket: 007 - Context Assembly

## 📋 Overview
Build the dynamic context assembly system that gathers relevant context based on situation and injection rules.

## 🔗 References
- **Previous**: [006 - Context Inheritance](006-context-inheritance.md)
- **Spec**: [Universal Context Architecture](../specs/core/universal-context-architecture.md) - AC-UNIVERSAL-005

## 🎯 Scope
Create context assembler that:
- Evaluates injection rules
- Gathers relevant contexts
- Optimizes for token efficiency
- Provides assembled context to tools/agents

## ✅ Acceptance Criteria

### AC-007-1: Rule Evaluation
```yaml
Given: Context with injection rules
When: Situation is evaluated
Then: LLM determines which rules apply
And: Relevant contexts are identified
And: Conditions are semantically evaluated
```

### AC-007-2: Context Gathering
```yaml
Given: Set of applicable contexts
When: Assembly runs
Then: All contexts are loaded
And: Inheritance is resolved
And: Duplicates are removed
```

### AC-007-3: Token Optimization
```yaml
Given: Large context set
When: Optimization runs
Then: Redundant information removed
And: Most relevant kept
And: Token count reduced
```

### AC-007-4: Assembly Output
```yaml
Given: Assembled context
When: Provided to tool/agent
Then: Contains situation-specific guidance
And: Includes relevant history
And: Formatted for LLM consumption
```

## 🧪 Test Cases

### Unit Tests
1. **Rule evaluation** - Conditions properly checked
2. **Context gathering** - All relevant loaded
3. **Deduplication** - No redundant data
4. **Token counting** - Accurate estimates
5. **Formatting** - Proper LLM format

### Integration Tests
1. **Complex assembly** - Multiple rules and contexts
2. **Performance** - Assembly under 200ms
3. **Real scenarios** - Common use cases

## 💻 Implementation

### Context Assembler
```javascript
// src/application/context-assembler.js
export class ContextAssembler {
  constructor(contextLoader, llmAdapter) {
    this.loader = contextLoader;
    this.llm = llmAdapter;
  }
  
  async assembleContext(request) {
    const {
      currentContext,
      situation,
      intent,
      maxTokens = 4000
    } = request;
    
    // Start with current context
    const baseContext = await this.loader.loadContext(currentContext);
    
    // Evaluate injection rules
    const applicableRules = await this.evaluateRules(
      baseContext,
      situation
    );
    
    // Gather contexts from rules
    const contexts = await this.gatherContexts(
      baseContext,
      applicableRules
    );
    
    // Optimize for tokens
    const optimized = await this.optimizeForTokens(
      contexts,
      maxTokens
    );
    
    // Format for LLM
    return this.formatForLLM(optimized, situation);
  }
  
  async evaluateRules(context, situation) {
    const rules = context.injection_rules || [];
    const applicable = [];
    
    for (const rule of rules) {
      if (await this.evaluateCondition(rule.condition, situation)) {
        applicable.push(rule);
      }
    }
    
    // Also check parent contexts for rules
    if (context._meta?.inheritance_chain) {
      for (const parentPath of context._meta.inheritance_chain) {
        const parent = await this.loader.loadContext(parentPath);
        if (parent.injection_rules) {
          for (const rule of parent.injection_rules) {
            if (await this.evaluateCondition(rule.condition, situation)) {
              applicable.push(rule);
            }
          }
        }
      }
    }
    
    return applicable;
  }
  
  async evaluateCondition(condition, situation) {
    if (!condition) return true; // No condition = always applies
    
    // Use LLM for semantic evaluation
    const evaluation = await this.llm.evaluate({
      prompt: `Given this situation: ${JSON.stringify(situation)}
               
               Does this condition apply: "${condition}"?
               
               Answer only 'true' or 'false'.`,
      temperature: 0.1 // Low temperature for consistency
    });
    
    return evaluation.toLowerCase().includes('true');
  }
  
  async gatherContexts(baseContext, rules) {
    const contexts = new Map();
    
    // Add base context
    contexts.set(baseContext._meta.path, baseContext);
    
    // Add contexts from rules
    for (const rule of rules) {
      if (rule.inject) {
        for (const contextRef of rule.inject) {
          if (!contexts.has(contextRef)) {
            try {
              const ctx = await this.loader.loadContext(contextRef);
              contexts.set(contextRef, ctx);
            } catch (error) {
              console.warn(`Failed to load context ${contextRef}:`, error);
            }
          }
        }
      }
    }
    
    return Array.from(contexts.values());
  }
  
  async optimizeForTokens(contexts, maxTokens) {
    // Estimate tokens for each context
    const contextSizes = contexts.map(ctx => ({
      context: ctx,
      tokens: this.estimateTokens(ctx),
      priority: this.calculatePriority(ctx)
    }));
    
    // Sort by priority
    contextSizes.sort((a, b) => b.priority - a.priority);
    
    // Select contexts that fit
    const selected = [];
    let totalTokens = 0;
    
    for (const { context, tokens } of contextSizes) {
      if (totalTokens + tokens <= maxTokens) {
        selected.push(context);
        totalTokens += tokens;
      } else {
        // Try to fit partial context
        const partial = this.extractEssential(context, maxTokens - totalTokens);
        if (partial) {
          selected.push(partial);
          break;
        }
      }
    }
    
    return selected;
  }
  
  estimateTokens(context) {
    // Rough estimation: ~4 chars per token
    const jsonString = JSON.stringify(context);
    return Math.ceil(jsonString.length / 4);
  }
  
  calculatePriority(context) {
    let priority = 1.0;
    
    // Current context has highest priority
    if (context._meta?.current) {
      priority += 2.0;
    }
    
    // Direct parents have high priority
    if (context._meta?.inheritance_distance === 1) {
      priority += 1.0;
    }
    
    // Contexts with behavior rules are important
    if (context.behavior_rules?.length > 0) {
      priority += 0.5;
    }
    
    // Recent contexts are more relevant
    if (context._meta?.loaded_at) {
      const age = Date.now() - context._meta.loaded_at;
      const ageHours = age / (1000 * 60 * 60);
      priority += Math.max(0, 1 - ageHours / 24);
    }
    
    return priority;
  }
  
  extractEssential(context, maxTokens) {
    // Extract only the most essential parts
    const essential = {
      metadata: context.metadata,
      intent_context: {
        business_goal: context.intent_context?.business_goal,
        intent_type: context.intent_context?.intent_type
      }
    };
    
    if (this.estimateTokens(essential) <= maxTokens) {
      return essential;
    }
    
    return null;
  }
  
  formatForLLM(contexts, situation) {
    const sections = [];
    
    // Situation summary
    sections.push(`## Current Situation
${JSON.stringify(situation, null, 2)}`);
    
    // Context hierarchy
    sections.push(`## Active Contexts`);
    for (const ctx of contexts) {
      sections.push(`
### ${ctx.metadata.name} (${ctx.metadata.type})
- Business Goal: ${ctx.intent_context?.business_goal || 'N/A'}
- Intent Type: ${ctx.intent_context?.intent_type || 'N/A'}
${ctx._meta?.adaptations ? `- Adaptations: ${ctx._meta.adaptations}` : ''}`);
      
      // Include relevant behavior rules
      if (ctx.behavior_rules?.length > 0) {
        sections.push('- Behavior Rules:');
        for (const rule of ctx.behavior_rules) {
          sections.push(`  - ${rule.trigger}: ${rule.action}`);
        }
      }
    }
    
    // Assembly metadata
    sections.push(`
## Assembly Metadata
- Contexts Loaded: ${contexts.length}
- Assembly Time: ${new Date().toISOString()}`);
    
    return sections.join('\n');
  }
}

// Integration with MCP tools
export function createContextAwareTools(assembler, baseTools) {
  const contextAwareTools = {};
  
  for (const [name, tool] of Object.entries(baseTools)) {
    contextAwareTools[name] = {
      ...tool,
      handler: async (params) => {
        // Assemble context for this tool call
        const context = await assembler.assembleContext({
          currentContext: params.context || 'default',
          situation: {
            tool: name,
            params: params,
            timestamp: Date.now()
          },
          intent: params.intent
        });
        
        // Add context to params
        const enrichedParams = {
          ...params,
          _context: context
        };
        
        // Call original handler
        const result = await tool.handler(enrichedParams);
        
        // Add context to response
        if (result._meta) {
          result._meta.contextUsed = context;
        }
        
        return result;
      }
    };
  }
  
  return contextAwareTools;
}
```

## 🧪 Test Implementation
```javascript
// tests/unit/context-assembler.test.js
describe('ContextAssembler', () => {
  let assembler;
  let mockLoader;
  let mockLLM;
  
  beforeEach(() => {
    mockLoader = {
      loadContext: jest.fn()
    };
    mockLLM = {
      evaluate: jest.fn()
    };
    assembler = new ContextAssembler(mockLoader, mockLLM);
  });
  
  it('should evaluate injection rules', async () => {
    const context = {
      metadata: { name: 'Test Context' },
      injection_rules: [{
        name: 'complexity_check',
        condition: 'task is complex',
        inject: ['helpers/complexity-guide']
      }]
    };
    
    mockLoader.loadContext.mockResolvedValue(context);
    mockLLM.evaluate.mockResolvedValue('true');
    
    const rules = await assembler.evaluateRules(
      context,
      { task: 'Build distributed system' }
    );
    
    expect(rules).toHaveLength(1);
    expect(mockLLM.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('task is complex')
      })
    );
  });
  
  it('should optimize for token limit', async () => {
    const contexts = [
      {
        metadata: { name: 'Small' },
        _meta: { priority: 1 }
      },
      {
        metadata: { name: 'Large' },
        intent_context: { 
          business_goal: 'A'.repeat(1000) 
        },
        _meta: { priority: 0.5 }
      },
      {
        metadata: { name: 'Critical' },
        _meta: { current: true, priority: 3 }
      }
    ];
    
    const optimized = await assembler.optimizeForTokens(contexts, 500);
    
    // Should prioritize critical context
    expect(optimized[0].metadata.name).toBe('Critical');
    // Should fit within token limit
    const totalTokens = optimized.reduce(
      (sum, ctx) => sum + assembler.estimateTokens(ctx), 
      0
    );
    expect(totalTokens).toBeLessThanOrEqual(500);
  });
});
```

## 🔧 Dependencies
- Uses ContextLoader from tickets 005-006
- Needs LLM adapter for semantic evaluation

## 📊 Effort Estimate
- Implementation: 3 hours
- Testing: 1.5 hours
- Total: 4.5 hours

## 🚀 Next Steps
After this ticket:
- Phase 3: Bi-directional patterns
- Integration with workflow tools

## 📝 Notes
- LLM evaluates conditions semantically
- Token optimization is crucial
- Priority system ensures relevance
- Assembly happens on every tool call