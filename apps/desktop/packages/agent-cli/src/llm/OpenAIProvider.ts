import OpenAI from 'openai';
import { LLMProvider } from '../types.js';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  async generate(prompt: string, context?: any): Promise<string> {
    try {
      const systemPrompt = context?.systemPrompt || '';
      const temperature = context?.temperature || 0.7;
      const maxTokens = context?.maxTokens || 1000;
      const model = context?.model || 'gpt-4';

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }

      messages.push({
        role: 'user',
        content: prompt
      });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
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
