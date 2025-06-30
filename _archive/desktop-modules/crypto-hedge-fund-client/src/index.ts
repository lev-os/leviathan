/**
 * TypeScript client for Crypto Hedge Fund microservice
 */

import EventSource from 'eventsource';
import { z } from 'zod';

// Schemas
const TokenDecisionSchema = z.object({
  action: z.enum(['ape', 'hodl', 'dump', 'short', 'ignore']),
  percentage: z.number(),
  confidence: z.number(),
  reasoning: z.string(),
  stop_loss: z.number(),
  take_profit: z.number(),
});

const AnalysisResultSchema = z.object({
  decisions: z.record(TokenDecisionSchema),
  market_regime: z.enum(['bull', 'bear', 'crab', 'volatile']),
  total_exposure: z.number(),
});

const AnalysisUpdateSchema = z.object({
  type: z.enum(['start', 'agent_start', 'agent_complete', 'complete', 'error']),
  agent: z.string().optional(),
  status: z.string().optional(),
  result: z.any().optional(),
  consensus: AnalysisResultSchema.optional(),
  error: z.string().optional(),
});

// Types
export type TokenDecision = z.infer<typeof TokenDecisionSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalysisUpdate = z.infer<typeof AnalysisUpdateSchema>;

export interface CryptoHedgeFundConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface AnalyzeOptions {
  tokens: string[];
  agents?: string[];
  modelProvider?: string;
  onUpdate?: (update: AnalysisUpdate) => void;
}

export class CryptoHedgeFundClient {
  private config: CryptoHedgeFundConfig;

  constructor(config: CryptoHedgeFundConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Analyze tokens and get trading signals
   */
  async analyzeTokens(options: AnalyzeOptions): Promise<AnalysisResult> {
    const { tokens, agents, modelProvider = 'openai', onUpdate } = options;

    // Start analysis
    const response = await fetch(`${this.config.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      },
      body: JSON.stringify({
        tokens,
        selected_agents: agents || [
          'diamond_hands_buffett',
          'yolo_lynch', 
          'rotation_maximalist',
          'meme_archaeologist',
          'vibe_checker',
        ],
        model_provider: modelProvider,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const { session_id } = await response.json();

    // Stream updates
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `${this.config.baseUrl}/analyze/${session_id}`
      );

      const timeout = setTimeout(() => {
        eventSource.close();
        reject(new Error('Analysis timeout'));
      }, this.config.timeout!);

      eventSource.onmessage = (event) => {
        try {
          const update = AnalysisUpdateSchema.parse(JSON.parse(event.data));
          
          if (onUpdate) {
            onUpdate(update);
          }

          if (update.type === 'complete' && update.consensus) {
            clearTimeout(timeout);
            eventSource.close();
            resolve(update.consensus);
          } else if (update.type === 'error') {
            clearTimeout(timeout);
            eventSource.close();
            reject(new Error(update.error || 'Analysis failed'));
          }
        } catch (error) {
          console.error('Failed to parse update:', error);
        }
      };

      eventSource.onerror = (error) => {
        clearTimeout(timeout);
        eventSource.close();
        reject(error);
      };
    });
  }

  /**
   * Get simplified buy/sell signal for a single token
   */
  async getSignal(tokenAddress: string): Promise<TokenDecision> {
    const result = await this.analyzeTokens({
      tokens: [tokenAddress],
    });

    const decision = result.decisions[tokenAddress];
    if (!decision) {
      throw new Error('No decision for token');
    }

    return decision;
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export convenience factory
export function createCryptoHedgeFundClient(
  config: CryptoHedgeFundConfig
): CryptoHedgeFundClient {
  return new CryptoHedgeFundClient(config);
}