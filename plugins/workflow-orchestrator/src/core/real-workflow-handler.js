/**
 * Real Workflow Handler
 * 
 * Generates actual tool instructions for LLMs instead of simulations
 * Provides concrete steps with real tool calls and file paths
 */

export class RealWorkflowHandler {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  /**
   * Generate instructions for QnA Wizard step
   */
  async generateQnAWizardInstruction(session, step, input) {
    const stepNumber = session.currentStepNumber + 1;
    const stepPath = await this.sessionManager.ensureStepDirectory(session, stepNumber);
    const filename = this.sessionManager.getOutputFilename(0, 'qna-wizard-discovery');
    const filePath = `${stepPath}/${filename}`;
    
    return {
      stepId: step.id,
      stepNumber: stepNumber,
      instruction: `You are a research discovery wizard. Your task:

1. **Execute initial web search** using WebSearch tool:
   \`\`\`javascript
   await WebSearch({ query: "${input.topic || input.input}" })
   \`\`\`

2. **Analyze the results** to identify:
   - Key themes and concepts
   - Areas needing clarification
   - Potential research directions

3. **Generate 3-5 clarifying questions** to focus the research

4. **Propose 5 discovery search queries** based on your analysis

5. **Save your complete analysis** to: \`${filePath}\`

**Output Format for the file:**
\`\`\`markdown
# Initial Discovery: ${input.topic || input.input}

## Web Search Results
[Summarize what you found]

## Key Themes Identified
- Theme 1
- Theme 2
- etc.

## Clarifying Questions
1. Question 1?
2. Question 2?
3. etc.

## Proposed Discovery Searches
1. "search query 1"
2. "search query 2"
3. "search query 3"
4. "search query 4"
5. "search query 5"
\`\`\`

After saving the file, callback with the session ID and step completion.`,
      
      callbackCommand: `workflow-orchestrator callback ${session.id} qna-wizard-complete -f "${filePath}"`,
      savePath: stepPath,
      filename: filename,
      fullPath: filePath
    };
  }

  /**
   * Generate instructions for parallel discovery searches
   */
  async generateDiscoveryInstructions(session, step, previousOutputs) {
    const stepNumber = session.currentStepNumber + 1;
    const stepPath = await this.sessionManager.ensureStepDirectory(session, stepNumber);
    
    // Extract search queries from QnA wizard output
    const qnaOutput = previousOutputs.find(o => o.context?.stepId === 'qna_wizard');
    let searchQueries = [
      'AI workflow orchestration patterns 2024',
      'context injection callback mechanisms',
      'multi-agent workflow architectures',
      'tool-calling patterns for LLM systems',
      'agent communication protocols'
    ];
    
    if (qnaOutput?.content) {
      // Try to extract actual queries from the QnA output
      const queryMatches = qnaOutput.content.match(/"([^"]+)"/g);
      if (queryMatches && queryMatches.length >= 5) {
        searchQueries = queryMatches.slice(0, 5).map(q => q.replace(/"/g, ''));
      }
    }
    
    // Generate parallel instructions
    const instructions = searchQueries.map((query, index) => {
      const filename = this.sessionManager.getOutputFilename(index, this.slugify(query));
      const filePath = `${stepPath}/${filename}`;
      const callbackId = `discovery-${index + 1}`;
      
      return {
        stepId: `discovery_${index + 1}`,
        callbackId: callbackId,
        stepNumber: stepNumber,
        instruction: `Execute discovery search ${index + 1}/5:

**Your task:** Use WebSearch or perplexity_ask to research: "${query}"

**Tool to use:**
\`\`\`javascript
await WebSearch({ query: "${query}" })
// OR
await mcp__perplexity-ask_1__perplexity_ask({
  messages: [
    { role: "user", content: "Research and analyze: ${query}" }
  ]
})
\`\`\`

**Save your findings** to: \`${filePath}\`

**Output Format:**
\`\`\`markdown
# Discovery Search: ${query}

## Search Results Summary
[What you found from the search]

## Key Findings
- Finding 1
- Finding 2
- Finding 3

## Notable Sources
- Source 1 description
- Source 2 description
- Source 3 description

## Insights for Next Steps
- Insight 1
- Insight 2
- Insight 3
\`\`\`

After saving, callback: \`workflow-orchestrator callback ${session.id} ${callbackId} -f "${filePath}"\``,
        
        callbackCommand: `workflow-orchestrator callback ${session.id} ${callbackId} -f "${filePath}"`,
        savePath: stepPath,
        filename: filename,
        fullPath: filePath,
        query: query
      };
    });
    
    return {
      stepId: step.id,
      stepNumber: stepNumber,
      parallelTasks: instructions,
      totalTasks: instructions.length
    };
  }

  /**
   * Generate instructions for deep research prompt building
   */
  async generatePromptBuildingInstruction(session, step, previousOutputs) {
    const stepNumber = session.currentStepNumber + 1;
    const stepPath = await this.sessionManager.ensureStepDirectory(session, stepNumber);
    const filename = this.sessionManager.getOutputFilename(0, 'deep-research-prompts');
    const filePath = `${stepPath}/${filename}`;
    
    // Get discovery outputs for context
    const discoveryOutputs = previousOutputs.filter(o => o.context?.stepId?.startsWith('discovery_'));
    const discoveryContext = discoveryOutputs.map(o => o.content).join('\n\n---\n\n');
    
    return {
      stepId: step.id,
      stepNumber: stepNumber,
      instruction: `Based on the discovery phase results, build 10 sophisticated research prompts.

**Discovery Context:**
\`\`\`
${discoveryContext.substring(0, 2000)}${discoveryContext.length > 2000 ? '...' : ''}
\`\`\`

**Your task:** Generate 10 deep research prompts using advanced techniques:

1. **Chain-of-Thought Technique**: Break complex topics into logical steps
2. **Tree-of-Thoughts Pattern**: Create branching exploration paths  
3. **Multi-angle Analysis**: Consider different perspectives and hypotheses

**Prompt Structure for each:**
- Context from discovery phase
- Specific investigation angle
- Expected insight types
- Suggested tools (perplexity_research, WebSearch, firecrawl_search)

**Save to:** \`${filePath}\`

**Output Format:**
\`\`\`yaml
research_prompts:
  - id: 1
    prompt: "Detailed research prompt 1..."
    technique: "chain-of-thought"
    angle: "historical_evolution"
    suggested_tool: "perplexity_research"
  - id: 2
    prompt: "Detailed research prompt 2..."
    technique: "comparative_analysis"
    angle: "implementation_patterns"
    suggested_tool: "mcp__firecrawl__firecrawl_search"
  # ... continue for all 10 prompts
\`\`\`

After saving: \`workflow-orchestrator callback ${session.id} prompt-building-complete -f "${filePath}"\``,
      
      callbackCommand: `workflow-orchestrator callback ${session.id} prompt-building-complete -f "${filePath}"`,
      savePath: stepPath,
      filename: filename,
      fullPath: filePath
    };
  }

  /**
   * Generate instructions for parallel deep research execution
   */
  async generateDeepResearchInstructions(session, step, previousOutputs) {
    const stepNumber = session.currentStepNumber + 1;
    const stepPath = await this.sessionManager.ensureStepDirectory(session, stepNumber);
    
    // Load research prompts from previous step
    const promptOutput = previousOutputs.find(o => o.context?.stepId === 'deep_prompt_building');
    let researchPrompts = [];
    
    if (promptOutput?.content) {
      try {
        // Try to parse YAML prompts
        const yaml = await import('js-yaml');
        const parsed = yaml.load(promptOutput.content);
        if (parsed.research_prompts) {
          researchPrompts = parsed.research_prompts;
        }
      } catch (err) {
        // Fallback to default prompts
        researchPrompts = this.getDefaultResearchPrompts();
      }
    } else {
      researchPrompts = this.getDefaultResearchPrompts();
    }
    
    // Generate parallel research instructions
    const instructions = researchPrompts.slice(0, 10).map((prompt, index) => {
      const filename = this.sessionManager.getOutputFilename(index, prompt.angle || `research-${index + 1}`);
      const filePath = `${stepPath}/${filename}`;
      const callbackId = `research-${index + 1}`;
      
      return {
        stepId: `research_${index + 1}`,
        callbackId: callbackId,
        stepNumber: stepNumber,
        instruction: `Execute deep research ${index + 1}/10:

**Research Prompt:** ${prompt.prompt}

**Technique:** ${prompt.technique}
**Angle:** ${prompt.angle}

**Suggested Tool:** Use ${prompt.suggested_tool || 'perplexity_research'}

**Tool Usage:**
\`\`\`javascript
await mcp__perplexity-ask_1__perplexity_research({
  messages: [
    { role: "user", content: "${prompt.prompt}" }
  ]
})
\`\`\`

**Save comprehensive analysis** to: \`${filePath}\`

**Output Format:**
\`\`\`markdown
# Deep Research: ${prompt.angle}

## Research Question
${prompt.prompt}

## Key Findings
[Detailed findings from your research]

## Supporting Evidence
[Sources and validation]

## Contradictions Found
[Any conflicting information]

## Implementation Considerations
[Practical implications]

## Confidence Level
[Your confidence in these findings: X%]
\`\`\`

Callback: \`workflow-orchestrator callback ${session.id} ${callbackId} -f "${filePath}"\``,
        
        callbackCommand: `workflow-orchestrator callback ${session.id} ${callbackId} -f "${filePath}"`,
        savePath: stepPath,
        filename: filename,
        fullPath: filePath,
        prompt: prompt
      };
    });
    
    return {
      stepId: step.id,
      stepNumber: stepNumber,
      parallelTasks: instructions,
      totalTasks: instructions.length
    };
  }

  /**
   * Generate final synthesis instruction
   */
  async generateFinalSynthesisInstruction(session, step, previousOutputs) {
    const stepNumber = session.currentStepNumber + 1;
    const stepPath = await this.sessionManager.ensureStepDirectory(session, stepNumber);
    const filename = this.sessionManager.getOutputFilename(0, 'comprehensive-research-report');
    const filePath = `${stepPath}/${filename}`;
    
    return {
      stepId: step.id,
      stepNumber: stepNumber,
      instruction: `Create final comprehensive research synthesis combining all previous research.

**Your task:** Synthesize ALL outputs from the entire research workflow:
- QnA wizard initial discovery
- 5 discovery searches
- 10 deep research investigations

**Create comprehensive report** saved to: \`${filePath}\`

**Report Structure:**
\`\`\`markdown
# Research Synthesis: [Topic]

Generated: ${new Date().toISOString()}

## Executive Summary
- Key finding 1
- Key finding 2  
- Key finding 3
- Strategic recommendation
- Confidence level: X%

## Detailed Findings

### Discovery Phase Insights
[Synthesize from discovery searches]

### Deep Research Revelations
[Synthesize from 10 deep research outputs]

## Knowledge Graph
\`\`\`
[Visual representation of concepts and relationships]
\`\`\`

## Implementation Roadmap

### Immediate Actions
1. Action 1
2. Action 2

### Further Research Needed
- Research area 1
- Research area 2

### Risk Considerations
- Risk 1
- Risk 2

## Appendices

### Search Queries Used
[List all queries executed]

### Source Quality Assessment
[Evaluation of source reliability]

### Methodology Notes
[How the research was conducted]
\`\`\`

Final callback: \`workflow-orchestrator callback ${session.id} synthesis-complete -f "${filePath}"\``,
      
      callbackCommand: `workflow-orchestrator callback ${session.id} synthesis-complete -f "${filePath}"`,
      savePath: stepPath,
      filename: filename,
      fullPath: filePath
    };
  }

  /**
   * Get default research prompts as fallback
   */
  getDefaultResearchPrompts() {
    return [
      {
        id: 1,
        prompt: "Analyze the evolution of bi-directional orchestration from traditional RPC to modern LLM context injection, focusing on architectural decisions and trade-offs",
        technique: "chain-of-thought",
        angle: "historical-evolution",
        suggested_tool: "perplexity_research"
      },
      {
        id: 2,
        prompt: "Compare and contrast top 5 production implementations of LLM orchestration systems, examining their approaches to context management and state persistence",
        technique: "comparative_analysis",
        angle: "implementation-patterns",
        suggested_tool: "mcp__firecrawl__firecrawl_search"
      },
      {
        id: 3,
        prompt: "Deep dive into callback mechanisms: How do modern AI systems handle asynchronous context switching and maintain coherence across multiple conversation threads?",
        technique: "technical_deep_dive",
        angle: "mechanism-analysis",
        suggested_tool: "perplexity_research"
      },
      {
        id: 4,
        prompt: "Explore failure modes and recovery patterns in bi-directional orchestration: What happens when context injection fails or callbacks timeout?",
        technique: "failure_analysis",
        angle: "reliability-engineering",
        suggested_tool: "WebSearch"
      },
      {
        id: 5,
        prompt: "Investigate the role of memory systems in orchestration: How do vector databases, graph stores, and traditional databases support bi-directional flows?",
        technique: "system_integration",
        angle: "memory-architecture",
        suggested_tool: "perplexity_research"
      },
      {
        id: 6,
        prompt: "Analyze security implications of bi-directional orchestration: Attack vectors, authentication patterns, and trust boundaries in agent communication",
        technique: "security_analysis",
        angle: "threat-modeling",
        suggested_tool: "mcp__firecrawl__firecrawl_search"
      },
      {
        id: 7,
        prompt: "Performance optimization strategies: Latency reduction, parallel execution, and resource management in large-scale orchestration systems",
        technique: "performance_engineering",
        angle: "optimization",
        suggested_tool: "WebSearch"
      },
      {
        id: 8,
        prompt: "Future directions: How will emerging LLM capabilities (longer context, better reasoning, world models) change orchestration architectures?",
        technique: "future_forecasting",
        angle: "trend-analysis",
        suggested_tool: "perplexity_research"
      },
      {
        id: 9,
        prompt: "Case study synthesis: Extract common patterns from successful bi-directional orchestration deployments across different industries",
        technique: "pattern_extraction",
        angle: "best-practices",
        suggested_tool: "mcp__firecrawl__firecrawl_crawl"
      },
      {
        id: 10,
        prompt: "Developer experience analysis: What makes an orchestration system intuitive and productive for AI engineers building complex workflows?",
        technique: "ux_analysis",
        angle: "developer-productivity",
        suggested_tool: "WebSearch"
      }
    ];
  }

  /**
   * Generate semantic slug from text
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
  }
}