# Perplexity MCP Tool Usage Strategy

## Overview

This document outlines the correct usage of Perplexity MCP tools for the Anti-Groupthink CDO pattern. It clarifies the distinction between simulated research (Task tool) and actual research (Perplexity MCP tools).

## Available Perplexity MCP Tools

### 1. mcp__perplexity-ask_1__perplexity_ask

**Purpose**: General conversational queries and quick answers

```javascript
// Example usage
const result = await mcp__perplexity-ask_1__perplexity_ask({
  messages: [
    {
      role: "user",
      content: "What are the latest developments in graph-based AI reasoning?"
    }
  ]
});
```

**Best for**:
- Quick factual queries
- Current events
- General knowledge questions
- Simple explanations

### 2. mcp__perplexity-ask_1__perplexity_research

**Purpose**: Deep research with comprehensive citations

```javascript
// Example usage
const result = await mcp__perplexity-ask_1__perplexity_research({
  messages: [
    {
      role: "system",
      content: "You are an AI researcher specializing in graph-based reasoning systems"
    },
    {
      role: "user",
      content: "Provide a comprehensive analysis of ThinkingGraphs compared to other graph-based reasoning approaches, including academic papers and implementation details"
    }
  ]
});
```

**Best for**:
- Academic research
- Technical deep dives
- Comparative analysis
- Literature reviews
- Implementation research

### 3. mcp__perplexity-ask_1__perplexity_reason

**Purpose**: Complex reasoning tasks using sonar-reasoning-pro model

```javascript
// Example usage
const result = await mcp__perplexity-ask_1__perplexity_reason({
  messages: [
    {
      role: "system",
      content: "You are a strategic analyst evaluating AI architectures"
    },
    {
      role: "user",
      content: "Analyze the trade-offs between different graph-based reasoning approaches and recommend the best architecture for a production system handling financial analysis"
    }
  ]
});
```

**Best for**:
- Strategic analysis
- Complex trade-off evaluation
- Architectural decisions
- Multi-factor reasoning

## Correct Usage Patterns

### Pattern 1: Layered Research Approach

```javascript
async function comprehensiveResearch(topic) {
  // Step 1: Quick overview
  const overview = await mcp__perplexity-ask_1__perplexity_ask({
    messages: [{
      role: "user",
      content: `Provide a brief overview of ${topic}`
    }]
  });
  
  // Step 2: Deep research
  const research = await mcp__perplexity-ask_1__perplexity_research({
    messages: [
      {
        role: "system",
        content: "You are an expert researcher"
      },
      {
        role: "user",
        content: `Based on this overview: ${overview}, provide comprehensive research on ${topic} with academic citations`
      }
    ]
  });
  
  // Step 3: Strategic reasoning
  const analysis = await mcp__perplexity-ask_1__perplexity_reason({
    messages: [
      {
        role: "system",
        content: "You are a strategic analyst"
      },
      {
        role: "user",
        content: `Given this research: ${research}, analyze the strategic implications and provide recommendations`
      }
    ]
  });
  
  return { overview, research, analysis };
}
```

### Pattern 2: Parallel Multi-Perspective Research

```javascript
async function multiPerspectiveResearch(topic) {
  const perspectives = [
    {
      role: "academic researcher",
      focus: "theoretical foundations and papers",
      tool: "perplexity_research"
    },
    {
      role: "industry practitioner",
      focus: "real-world implementations",
      tool: "perplexity_research"
    },
    {
      role: "strategic analyst",
      focus: "market implications",
      tool: "perplexity_reason"
    }
  ];
  
  const results = await Promise.all(
    perspectives.map(p => researchFromPerspective(topic, p))
  );
  
  return combineResults(results);
}
```

### Pattern 3: Citation-Driven Research

```javascript
async function citationDrivenResearch(topic) {
  // Get initial research with citations
  const initial = await mcp__perplexity-ask_1__perplexity_research({
    messages: [
      {
        role: "user",
        content: `Research ${topic} and provide key academic citations`
      }
    ]
  });
  
  // Extract citations
  const citations = extractCitations(initial);
  
  // Deep dive into each citation
  const citationAnalysis = await Promise.all(
    citations.map(citation => 
      mcp__perplexity-ask_1__perplexity_research({
        messages: [{
          role: "user",
          content: `Analyze this paper in detail: ${citation}`
        }]
      })
    )
  );
  
  return { initial, citations, citationAnalysis };
}
```

## Common Mistakes to Avoid

### Mistake 1: Using Task Tool for Research

```javascript
// WRONG - This doesn't actually research anything
async function fakeResearch(topic) {
  return await Task({
    name: "research_thinking_graphs",
    description: `Research ${topic}`,
    // This just simulates research without real data
  });
}

// CORRECT - Use actual Perplexity tools
async function realResearch(topic) {
  return await mcp__perplexity-ask_1__perplexity_research({
    messages: [
      {
        role: "user",
        content: `Research ${topic} comprehensively`
      }
    ]
  });
}
```

### Mistake 2: Wrong Tool for the Job

```javascript
// WRONG - Using 'ask' for deep research
async function insufficientResearch(topic) {
  return await mcp__perplexity-ask_1__perplexity_ask({
    messages: [{
      role: "user",
      content: `Do comprehensive research on ${topic}` // Won't get citations
    }]
  });
}

// CORRECT - Use 'research' for comprehensive analysis
async function properResearch(topic) {
  return await mcp__perplexity-ask_1__perplexity_research({
    messages: [{
      role: "user",
      content: `Do comprehensive research on ${topic}`
    }]
  });
}
```

### Mistake 3: Not Using System Prompts

```javascript
// SUBOPTIMAL - Generic research
async function genericResearch(topic) {
  return await mcp__perplexity-ask_1__perplexity_research({
    messages: [{
      role: "user",
      content: `Research ${topic}`
    }]
  });
}

// OPTIMAL - Specialized perspective
async function specializedResearch(topic) {
  return await mcp__perplexity-ask_1__perplexity_research({
    messages: [
      {
        role: "system",
        content: "You are a distributed systems architect with expertise in AI infrastructure"
      },
      {
        role: "user",
        content: `Research ${topic} from a production systems perspective`
      }
    ]
  });
}
```

## Integration with CDO Pattern

### Research Agent Configuration

```javascript
const researchAgents = [
  {
    name: "theoretical-researcher",
    systemPrompt: "You are an academic AI researcher focused on theoretical foundations",
    tool: "mcp__perplexity-ask_1__perplexity_research",
    focus: "Academic papers, theoretical models, mathematical foundations"
  },
  {
    name: "implementation-analyst",
    systemPrompt: "You are a senior engineer analyzing production implementations",
    tool: "mcp__perplexity-ask_1__perplexity_research",
    focus: "GitHub repos, technical blogs, implementation patterns"
  },
  {
    name: "strategic-analyst",
    systemPrompt: "You are a strategic technology analyst",
    tool: "mcp__perplexity-ask_1__perplexity_reason",
    focus: "Market analysis, competitive landscape, strategic implications"
  }
];
```

### Preventing Research Contamination

```javascript
class IsolatedResearchAgent {
  constructor(config) {
    this.config = config;
    this.outputFile = `./research/${config.name}.md`;
  }
  
  async research(topic) {
    // Each agent researches independently
    const result = await this.config.tool({
      messages: [
        {
          role: "system",
          content: this.config.systemPrompt
        },
        {
          role: "user",
          content: `Research ${topic} focusing on: ${this.config.focus}`
        }
      ]
    });
    
    // Write to isolated file
    await fs.writeFile(this.outputFile, this.formatResult(result));
    
    // No return value - prevents contamination
  }
}
```

## Advanced Patterns

### Pattern: Research Synthesis Pipeline

```javascript
async function researchSynthesisPipeline(topic) {
  // Phase 1: Broad research
  const broadResearch = await parallelResearch(topic, [
    "theoretical foundations",
    "practical implementations",
    "market landscape"
  ]);
  
  // Phase 2: Deep dive on interesting findings
  const deepDives = await Promise.all(
    extractKeyFindings(broadResearch).map(finding =>
      mcp__perplexity-ask_1__perplexity_research({
        messages: [{
          role: "user",
          content: `Deep dive into: ${finding}`
        }]
      })
    )
  );
  
  // Phase 3: Strategic synthesis
  const synthesis = await mcp__perplexity-ask_1__perplexity_reason({
    messages: [
      {
        role: "system",
        content: "You are a strategic synthesizer"
      },
      {
        role: "user",
        content: `Synthesize these research findings: ${JSON.stringify({broadResearch, deepDives})}`
      }
    ]
  });
  
  return synthesis;
}
```

### Pattern: Adversarial Research

```javascript
async function adversarialResearch(hypothesis) {
  // Research supporting evidence
  const supporting = await mcp__perplexity-ask_1__perplexity_research({
    messages: [{
      role: "user",
      content: `Find evidence supporting: ${hypothesis}`
    }]
  });
  
  // Research contradicting evidence
  const contradicting = await mcp__perplexity-ask_1__perplexity_research({
    messages: [{
      role: "user",
      content: `Find evidence contradicting: ${hypothesis}`
    }]
  });
  
  // Reason about the conflict
  const analysis = await mcp__perplexity-ask_1__perplexity_reason({
    messages: [{
      role: "user",
      content: `Analyze the conflict between: Supporting: ${supporting}, Contradicting: ${contradicting}`
    }]
  });
  
  return { supporting, contradicting, analysis };
}
```

## Performance Optimization

### Batch Research Strategies

```javascript
// Efficient: Parallel research
async function efficientResearch(topics) {
  const results = await Promise.all(
    topics.map(topic => 
      mcp__perplexity-ask_1__perplexity_research({
        messages: [{
          role: "user",
          content: `Research: ${topic}`
        }]
      })
    )
  );
  return results;
}

// Inefficient: Sequential research
async function inefficientResearch(topics) {
  const results = [];
  for (const topic of topics) {
    const result = await mcp__perplexity-ask_1__perplexity_research({
      messages: [{
        role: "user",
        content: `Research: ${topic}`
      }]
    });
    results.push(result);
  }
  return results;
}
```

## Conclusion

The correct usage of Perplexity MCP tools is crucial for the Anti-Groupthink CDO pattern. By using actual research tools instead of simulated ones, we ensure:

1. **Real Data**: Actual citations and current information
2. **Diverse Perspectives**: Different tools for different research needs
3. **Quality Results**: Professional-grade research outputs
4. **Verifiable Claims**: Citations enable fact-checking

Remember: **Always use real MCP tools for research. Never simulate with Task tool.**