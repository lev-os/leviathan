import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { TransformersProvider } from './transformers-provider.js';

export class LLMClient {
  constructor() {
    this.primaryProvider = process.env.PRIMARY_LLM_PROVIDER || 'ollama';
    this.fallbackProvider = process.env.FALLBACK_LLM_PROVIDER || 'ollama';
    this.clients = this.initializeClients();
    this.requestCount = 0;
    this.failureCount = 0;
  }

  initializeClients() {
    const clients = {};

    // OpenAI (and OpenAI-compatible APIs like Groq, Ollama)
    if (process.env.OPENAI_API_KEY || this.primaryProvider === 'ollama') {
      clients.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-local',
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
      });
    }

    // Groq (OpenAI-compatible)
    if (process.env.GROQ_API_KEY) {
      clients.groq = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
      });
    }

    // OpenRouter (OpenAI-compatible)
    if (process.env.OPENROUTER_API_KEY) {
      clients.openrouter = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
      });
    }

    // Ollama (OpenAI-compatible)
    clients.ollama = new OpenAI({
      apiKey: 'dummy-key',
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1'
    });

    // Anthropic (different API)
    if (process.env.ANTHROPIC_API_KEY) {
      clients.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: process.env.ANTHROPIC_BASE_URL
      });
    }

    // Transformers (Python-based, conda integrated)
    if (process.env.TRANSFORMERS_MODEL_PATH || process.env.PRIMARY_LLM_PROVIDER === 'transformers') {
      clients.transformers = new TransformersProvider({
        modelPath: process.env.TRANSFORMERS_MODEL_PATH,
        modelName: process.env.TRANSFORMERS_MODEL_NAME,
        condaEnv: process.env.CONDA_ENV
      });
    }

    // Simulation provider (always available)
    clients.simulation = {
      generateResponse: async (context, input, options) => {
        return this.simulateResponse(context, input);
      },
      healthCheck: async () => 'healthy'
    };

    return clients;
  }

  getModelConfig(provider = this.primaryProvider) {
    const configs = {
      openai: {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: 4000,
        temperature: 0.7
      },
      groq: {
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        maxTokens: 2000,
        temperature: 0.7
      },
      openrouter: {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        maxTokens: 2000,
        temperature: 0.7
      },
      ollama: {
        model: process.env.OLLAMA_MODEL || 'tinyllama',
        maxTokens: 2000,
        temperature: 0.7
      },
      anthropic: {
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        maxTokens: 4000,
        temperature: 0.7
      },
      transformers: {
        model: process.env.TRANSFORMERS_MODEL_NAME || 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
        maxTokens: 500,
        temperature: 0.7
      },
      simulation: {
        model: 'simulation',
        maxTokens: 100,
        temperature: 0.7
      }
    };

    return configs[provider] || configs.ollama;
  }

  async generateResponse(context, input, options = {}) {
    const provider = options.provider || this.primaryProvider;
    const config = this.getModelConfig(provider);
    
    this.requestCount++;
    
    try {
      if (provider === 'simulation') {
        return this.simulateResponse(context, input);
      } else if (provider === 'anthropic') {
        return await this.callAnthropic(context, input, config, options);
      } else if (provider === 'transformers') {
        return await this.callTransformers(context, input, config, options);
      } else {
        return await this.callOpenAICompatible(provider, context, input, config, options);
      }
    } catch (error) {
      console.warn(`LLM call failed with ${provider}:`, error.message);
      this.failureCount++;
      
      // Try fallback provider if different
      if (provider !== this.fallbackProvider) {
        console.log(`Trying fallback provider: ${this.fallbackProvider}`);
        return await this.generateResponse(context, input, { 
          ...options, 
          provider: this.fallbackProvider 
        });
      }
      
      // If all fails, return simulation
      return this.simulateResponse(context, input);
    }
  }

  async callOpenAICompatible(provider, context, input, config, options) {
    const client = this.clients[provider];
    if (!client) {
      throw new Error(`Client not initialized for provider: ${provider}`);
    }

    const messages = [
      { role: 'system', content: context },
      { role: 'user', content: input }
    ];

    const completion = await client.chat.completions.create({
      model: config.model,
      messages,
      max_tokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature || config.temperature,
      stream: false
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response content received');
    }

    return {
      content: response,
      provider,
      model: config.model,
      usage: completion.usage,
      metadata: {
        requestId: completion.id,
        finishReason: completion.choices[0]?.finish_reason
      }
    };
  }

  async callAnthropic(context, input, config, options) {
    const client = this.clients.anthropic;
    if (!client) {
      throw new Error('Anthropic client not initialized');
    }

    const response = await client.messages.create({
      model: config.model,
      max_tokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature || config.temperature,
      messages: [
        { role: 'user', content: `${context}\n\nHuman: ${input}` }
      ]
    });

    const content = response.content[0]?.text;
    if (!content) {
      throw new Error('No response content received from Anthropic');
    }

    return {
      content,
      provider: 'anthropic',
      model: config.model,
      usage: response.usage,
      metadata: {
        requestId: response.id,
        stopReason: response.stop_reason
      }
    };
  }

  async callTransformers(context, input, config, options) {
    const client = this.clients.transformers;
    if (!client) {
      throw new Error('Transformers client not initialized');
    }

    const response = await client.generateResponse(context, input, {
      maxTokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature || config.temperature
    });

    return response;
  }

  simulateResponse(context, input) {
    console.log('🤖 Using simulation mode (no LLM providers available)');
    
    // Enhanced simulation based on context analysis
    let response = `Simulated response for: ${input}\n\n`;
    
    if (context.includes('researcher')) {
      response += 'Research findings:\n1. Key point A\n2. Key point B\n3. Analysis summary';
    } else if (context.includes('developer') || context.includes('dev')) {
      response += 'Technical implementation:\n```\n// Code example\nfunction solution() {\n  return "implementation";\n}\n```';
    } else if (context.includes('writer')) {
      response += 'Creative content with engaging narrative structure and clear communication.';
    } else if (context.includes('strategic') || context.includes('ceo')) {
      response += 'Strategic analysis:\n- Current situation\n- Recommended approach\n- Expected outcomes';
    } else {
      response += 'Comprehensive response addressing your request with relevant details and actionable insights.';
    }

    return {
      content: response,
      provider: 'simulation',
      model: 'simulation',
      usage: { total_tokens: response.length / 4 },
      metadata: { simulated: true }
    };
  }

  // Quick health check for providers
  async healthCheck() {
    const results = {};
    
    for (const [name, client] of Object.entries(this.clients)) {
      try {
        if (name === 'anthropic') {
          await client.messages.create({
            model: this.getModelConfig(name).model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          });
        } else if (name === 'transformers') {
          const result = await client.healthCheck();
          if (result !== 'healthy') throw new Error(result);
        } else if (name === 'simulation') {
          results[name] = 'healthy';
          continue;
        } else {
          await client.chat.completions.create({
            model: this.getModelConfig(name).model,
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10
          });
        }
        results[name] = 'healthy';
      } catch (error) {
        results[name] = error.message;
      }
    }
    
    return results;
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      failureCount: this.failureCount,
      successRate: this.requestCount > 0 ? (this.requestCount - this.failureCount) / this.requestCount : 0,
      primaryProvider: this.primaryProvider,
      fallbackProvider: this.fallbackProvider
    };
  }
}

// Singleton instance
export const llmClient = new LLMClient();