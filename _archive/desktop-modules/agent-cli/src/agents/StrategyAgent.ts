import { BaseAgent } from './BaseAgent.js';
import { TradeAnalysis, AgentConfig, LLMProvider } from '../types.js';

export interface StrategyTask {
  type: 'analyze' | 'recommend' | 'backtest';
  symbol?: string;
  timeframe?: string;
  parameters?: any;
  marketData?: any;
}

export class StrategyAgent extends BaseAgent {
  constructor(config: AgentConfig, llmProvider: LLMProvider) {
    super(config, llmProvider);
  }

  protected getSystemPrompt(): string {
    return `You are a sophisticated trading strategy analyst for Solana DeFi markets.

CORE RESPONSIBILITIES:
- Analyze market conditions and price movements
- Generate trading recommendations with confidence levels
- Evaluate strategy performance and risk
- Provide clear reasoning for all recommendations

ANALYSIS FRAMEWORK:
1. Technical Analysis: Price action, volume, trends, support/resistance
2. Market Structure: Liquidity, volatility, market depth
3. DeFi Specific: Token utility, protocol fundamentals, yield opportunities
4. Risk Assessment: Position sizing, stop losses, market conditions

OUTPUT FORMAT:
Always provide structured JSON responses with:
- symbol: Token pair being analyzed
- action: "buy", "sell", or "hold"
- confidence: Number 0-1 indicating confidence level
- reasoning: Detailed explanation of analysis
- riskLevel: "low", "medium", or "high"
- priceTarget: Optional target price
- stopLoss: Optional stop loss level
- timeframe: Recommended holding period

CONSTRAINTS:
- Only recommend trades with >70% confidence
- Always include risk assessment
- Focus on liquid Solana markets (SOL, USDC, major tokens)
- Consider gas fees and slippage in recommendations`;
  }

  async execute(task: StrategyTask): Promise<TradeAnalysis | any> {
    switch (task.type) {
      case 'analyze':
        return await this.analyzeSymbol(task);
      case 'recommend':
        return await this.generateRecommendation(task);
      case 'backtest':
        return await this.backtestStrategy(task);
      default:
        throw new Error(`Unknown strategy task type: ${task.type}`);
    }
  }

  private async analyzeSymbol(task: StrategyTask): Promise<TradeAnalysis> {
    const prompt = `
Analyze ${task.symbol} trading pair:
Timeframe: ${task.timeframe || '1h'}
Market Data: ${JSON.stringify(task.marketData || {})}
Current Parameters: ${JSON.stringify(task.parameters || {})}

Provide a comprehensive trading analysis following the system prompt format.`;

    const response = await this.llmProvider.generate(prompt, {
      systemPrompt: this.getSystemPrompt(),
      temperature: 0.3,
      maxTokens: 1500
    });

    try {
      return JSON.parse(response) as TradeAnalysis;
    } catch {
      // Fallback parsing if JSON is malformed
      return this.parseAnalysisResponse(response, task.symbol || 'UNKNOWN');
    }
  }

  private parseAnalysisResponse(response: string, symbol: string): TradeAnalysis {
    // Basic parsing fallback - extract key information
    const action = response.toLowerCase().includes('buy') ? 'buy' :
                  response.toLowerCase().includes('sell') ? 'sell' : 'hold';
    
    const confidence = 0.7; // Default confidence
    const riskLevel = response.toLowerCase().includes('high risk') ? 'high' :
                     response.toLowerCase().includes('low risk') ? 'low' : 'medium';

    return {
      symbol,
      action,
      confidence,
      reasoning: response,
      riskLevel,
      timeframe: '1h'
    };
  }

  private async generateRecommendation(task: StrategyTask): Promise<TradeAnalysis> {
    // Similar to analyze but focused on generating actionable recommendations
    return this.analyzeSymbol({ ...task, type: 'analyze' });
  }

  private async backtestStrategy(task: StrategyTask): Promise<any> {
    const prompt = `
Backtest trading strategy:
Strategy Parameters: ${JSON.stringify(task.parameters)}
Historical Data: ${JSON.stringify(task.marketData)}
Symbol: ${task.symbol}
Timeframe: ${task.timeframe}

Provide backtest results with performance metrics.`;

    const response = await this.llmProvider.generate(prompt, {
      systemPrompt: this.getSystemPrompt(),
      temperature: 0.2,
      maxTokens: 2000
    });

    return {
      strategy: task.parameters,
      results: response,
      symbol: task.symbol,
      timeframe: task.timeframe
    };
  }
}
