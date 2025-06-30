import { LLMProvider } from '../types.js';

export interface DualLLMConfig {
  primaryProvider: LLMProvider;
  validatorProvider: LLMProvider;
  requireValidation: boolean;
  consensusThreshold?: number;
}

export class DualLLMOrchestrator {
  private config: DualLLMConfig;

  constructor(config: DualLLMConfig) {
    this.config = config;
  }

  async generate(prompt: string, context?: any): Promise<{
    response: string;
    primaryResponse: string;
    validatorResponse?: string;
    validated: boolean;
    consensus?: boolean;
  }> {
    // Get primary response
    const primaryResponse = await this.config.primaryProvider.generate(prompt, context);

    if (!this.config.requireValidation) {
      return {
        response: primaryResponse,
        primaryResponse,
        validated: true
      };
    }

    // Get validator response for cross-validation
    const validatorPrompt = `
${context?.systemPrompt || ''}
Validate and provide your own analysis for: ${prompt}
Primary analysis provided: ${primaryResponse}
Provide your independent analysis and validation.`;

    const validatorResponse = await this.config.validatorProvider.generate(
      validatorPrompt, 
      { ...context, temperature: 0.3 }
    );

    // Check consensus
    const consensus = await this.checkConsensus(primaryResponse, validatorResponse, context);
    
    return {
      response: consensus ? primaryResponse : await this.resolveConflict(primaryResponse, validatorResponse, prompt, context),
      primaryResponse,
      validatorResponse,
      validated: true,
      consensus
    };
  }

  private async checkConsensus(primary: string, validator: string, context?: any): Promise<boolean> {
    const consensusPrompt = `
Compare these two responses and determine if they reach similar conclusions:
Response 1: ${primary}
Response 2: ${validator}
Return only 'true' for consensus or 'false' for significant disagreement.`;

    const result = await this.config.primaryProvider.generate(consensusPrompt, {
      ...context,
      temperature: 0.1,
      maxTokens: 10
    });

    return result.toLowerCase().includes('true');
  }

  private async resolveConflict(primary: string, validator: string, originalPrompt: string, context?: any): Promise<string> {
    const resolutionPrompt = `
There's disagreement between two analyses. Please provide a balanced resolution:
Original question: ${originalPrompt}
Analysis 1: ${primary}
Analysis 2: ${validator}
Provide a synthesized response that addresses the disagreement.`;

    return await this.config.primaryProvider.generate(resolutionPrompt, {
      ...context,
      temperature: 0.5
    });
  }
}
