/**
 * LLM Provider for Real Workflow Orchestration
 * 
 * Connects to actual LLMs (Claude, OpenAI, Ollama) for bi-directional orchestration
 */

export class LLMProvider {
  constructor(options = {}) {
    this.provider = options.provider || 'claude'; // claude, openai, ollama
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.baseURL = options.baseURL;
    this.model = options.model || this.getDefaultModel();
    
    // Context formatting options
    this.systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt();
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 4096;
  }

  /**
   * Get default model for provider
   */
  getDefaultModel() {
    switch (this.provider) {
      case 'claude':
        return 'claude-3-opus-20240229';
      case 'openai':
        return 'gpt-4-turbo-preview';
      case 'ollama':
        return 'llama2:latest';
      default:
        return 'claude-3-opus-20240229';
    }
  }

  /**
   * Get default system prompt
   */
  getDefaultSystemPrompt() {
    return `You are an intelligent workflow orchestration agent. You will receive context about your current role and task. Follow the instructions precisely and provide structured outputs as requested.

When you receive a context switch, adapt your behavior to match the specified personality, agent, or workflow step. Always output in a format that can be parsed by the orchestration system.

Key principles:
1. Follow the exact instructions in the context
2. Maintain character/personality when specified
3. Output structured data when possible (JSON, markdown with clear sections)
4. Be concise but complete in your responses
5. Track and reference any files or outputs you create`;
  }

  /**
   * Invoke LLM with context
   */
  async invoke(context) {
    switch (this.provider) {
      case 'claude':
        return await this.invokeClaude(context);
      case 'openai':
        return await this.invokeOpenAI(context);
      case 'ollama':
        return await this.invokeOllama(context);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  /**
   * Invoke Claude API
   */
  async invokeClaude(context) {
    const messages = this.formatMessagesForClaude(context);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        system: this.systemPrompt,
        temperature: this.temperature,
        max_tokens: this.maxTokens
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.parseClaudeResponse(data, context);
  }

  /**
   * Invoke OpenAI API
   */
  async invokeOpenAI(context) {
    const messages = this.formatMessagesForOpenAI(context);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...messages
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.parseOpenAIResponse(data, context);
  }

  /**
   * Invoke Ollama API
   */
  async invokeOllama(context) {
    const prompt = this.formatPromptForOllama(context);
    const baseURL = this.baseURL || 'http://localhost:11434';
    
    const response = await fetch(`${baseURL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        system: this.systemPrompt,
        temperature: this.temperature,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.parseOllamaResponse(data, context);
  }

  /**
   * Format messages for Claude
   */
  formatMessagesForClaude(context) {
    const messages = [];
    
    // Add context as user message
    const contextMessage = this.buildContextMessage(context);
    messages.push({
      role: 'user',
      content: contextMessage
    });
    
    // Add previous outputs if available
    if (context.previousOutputs && context.previousOutputs.length > 0) {
      messages.unshift({
        role: 'user',
        content: `Previous workflow outputs:\n${JSON.stringify(context.previousOutputs, null, 2)}`
      });
    }
    
    return messages;
  }

  /**
   * Format messages for OpenAI
   */
  formatMessagesForOpenAI(context) {
    const messages = [];
    
    // Add context
    const contextMessage = this.buildContextMessage(context);
    messages.push({
      role: 'user',
      content: contextMessage
    });
    
    return messages;
  }

  /**
   * Format prompt for Ollama
   */
  formatPromptForOllama(context) {
    return this.buildContextMessage(context);
  }

  /**
   * Build context message
   */
  buildContextMessage(context) {
    let message = '';
    
    // Add personality if present
    if (context.personality) {
      message += `You are now operating as personality: ${context.personality}\n`;
      if (context.config) {
        message += `Your configuration: ${JSON.stringify(context.config, null, 2)}\n`;
      }
      message += '\n';
    }
    
    // Add step information
    if (context.stepId) {
      message += `Current workflow step: ${context.stepId}\n`;
      if (context.stepName) {
        message += `Step name: ${context.stepName}\n`;
      }
      message += '\n';
    }
    
    // Add instruction
    if (context.instruction) {
      message += `Instruction: ${context.instruction}\n\n`;
    }
    
    // Add input
    message += 'Input:\n';
    message += JSON.stringify(context.input, null, 2);
    
    // Add requirements
    if (context.outputRequirements) {
      message += '\n\nOutput Requirements:\n';
      message += JSON.stringify(context.outputRequirements, null, 2);
    }
    
    return message;
  }

  /**
   * Parse Claude response
   */
  parseClaudeResponse(data, context) {
    const content = data.content[0].text;
    
    return this.parseResponseContent(content, context);
  }

  /**
   * Parse OpenAI response
   */
  parseOpenAIResponse(data, context) {
    const content = data.choices[0].message.content;
    
    return this.parseResponseContent(content, context);
  }

  /**
   * Parse Ollama response
   */
  parseOllamaResponse(data, context) {
    const content = data.response;
    
    return this.parseResponseContent(content, context);
  }

  /**
   * Parse response content into structured output
   */
  parseResponseContent(content, context) {
    const response = {
      output: content,
      timestamp: new Date().toISOString(),
      context: context.stepId || context.personality || 'unknown'
    };
    
    // Try to extract structured data
    try {
      // Check for JSON blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        Object.assign(response, jsonData);
      }
      
      // Check for markdown sections
      const sections = this.extractMarkdownSections(content);
      if (Object.keys(sections).length > 0) {
        response.sections = sections;
      }
      
      // Check for file references
      const fileRefs = content.match(/(?:created|generated|saved|wrote).*?([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)/gi);
      if (fileRefs) {
        response.files = fileRefs.map(ref => {
          const match = ref.match(/([a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+)/);
          return match ? match[1] : null;
        }).filter(Boolean);
      }
      
      // Extract insights, recommendations, etc.
      const insights = this.extractListSection(content, 'insights');
      if (insights.length > 0) response.insights = insights;
      
      const recommendations = this.extractListSection(content, 'recommendations');
      if (recommendations.length > 0) response.recommendations = recommendations;
      
      const actionItems = this.extractListSection(content, 'action items');
      if (actionItems.length > 0) response.actionItems = actionItems;
      
    } catch (error) {
      // If parsing fails, just return the raw content
      console.warn('Could not parse structured content:', error);
    }
    
    return response;
  }

  /**
   * Extract markdown sections
   */
  extractMarkdownSections(content) {
    const sections = {};
    const sectionRegex = /^#{1,3}\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(sectionRegex));
    
    for (let i = 0; i < matches.length; i++) {
      const title = matches[i][1];
      const start = matches[i].index + matches[i][0].length;
      const end = matches[i + 1]?.index || content.length;
      
      sections[title] = content.slice(start, end).trim();
    }
    
    return sections;
  }

  /**
   * Extract list section by keyword
   */
  extractListSection(content, keyword) {
    const regex = new RegExp(`${keyword}:?\\s*\\n([\\s\\S]*?)(?=\\n\\n|\\n#|$)`, 'i');
    const match = content.match(regex);
    
    if (match) {
      const listContent = match[1];
      const items = listContent
        .split('\n')
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 0);
      
      return items;
    }
    
    return [];
  }

  /**
   * Create provider from environment
   */
  static fromEnvironment() {
    if (process.env.ANTHROPIC_API_KEY) {
      return new LLMProvider({
        provider: 'claude',
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
    
    if (process.env.OPENAI_API_KEY) {
      return new LLMProvider({
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Default to local Ollama
    return new LLMProvider({
      provider: 'ollama',
      baseURL: process.env.OLLAMA_URL || 'http://localhost:11434'
    });
  }
}

/**
 * Create LLM-connected orchestrator
 */
export function createLLMOrchestrator(options = {}) {
  const llmProvider = options.llmProvider || LLMProvider.fromEnvironment();
  
  return {
    llmProvider,
    onEvent: async (event, data) => {
      if (event === 'llm:inject') {
        try {
          const response = await llmProvider.invoke(data.context);
          // The orchestrator needs a way to receive this callback
          // This would integrate with the orchestrator instance
          data.orchestrator?.handleLLMCallback(data.callbackId, response);
        } catch (error) {
          console.error('LLM invocation failed:', error);
        }
      }
    }
  };
}