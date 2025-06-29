import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from '../types.js';

export class ClaudeProvider implements LLMProvider {
  name = 'Claude';
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });
  }

  async generate(prompt: string, context?: any): Promise<string> {
    try {
      const systemPrompt = context?.systemPrompt || '';
      const temperature = context?.temperature || 0.7;
      const maxTokens = context?.maxTokens || 1000;

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
    } catch (error) {
      throw new Error(`Claude API Error: ${error.message}`);
    }
  }

  async validate(response: string, criteria?: any): Promise<boolean> {
    if (!criteria) return true;
    
    const validationPrompt = `
Validate this response against the criteria:
Response: ${response}
Criteria: ${JSON.stringify(criteria)}
Return only 'true' or 'false'.`;

    const validation = await this.generate(validationPrompt, {
      temperature: 0.1,
      maxTokens: 10
    });

    return validation.toLowerCase().includes('true');
  }
}
