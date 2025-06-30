import { BaseAgent } from './BaseAgent.js';
import { RiskAssessment, AgentConfig, LLMProvider, TradeAnalysis } from '../types.js';

export interface RiskTask {
  type: 'assess' | 'validate' | 'monitor';
  tradeAnalysis?: TradeAnalysis;
  portfolioData?: any;
  marketConditions?: any;
  positionSize?: number;
}

export class RiskAgent extends BaseAgent {
  constructor(config: AgentConfig, llmProvider: LLMProvider) {
    super(config, llmProvider);
  }

  protected getSystemPrompt(): string {
    return `You are a risk management specialist for Solana DeFi trading.

CORE RESPONSIBILITIES:
- Evaluate trade risk and position sizing
- Monitor portfolio exposure and concentration
- Assess market conditions and volatility
- Provide risk mitigation recommendations

RISK ASSESSMENT FRAMEWORK:
1. Position Risk: Size relative to portfolio, concentration limits
2. Market Risk: Volatility, liquidity, market depth
3. Technical Risk: Smart contract, protocol, bridge risks
4. Operational Risk: Slippage, MEV, gas costs

RISK CATEGORIES:
- LOW: <2% portfolio risk, high liquidity, stable markets
- MEDIUM: 2-5% portfolio risk, moderate liquidity/volatility  
- HIGH: 5-10% portfolio risk, high volatility, concentration risk
- CRITICAL: >10% portfolio risk, illiquid markets, extreme conditions`;
  }

  async execute(task: RiskTask): Promise<RiskAssessment | any> {
    switch (task.type) {
      case 'assess':
        return await this.assessRisk(task);
      case 'validate':
        return await this.validateTrade(task);
      case 'monitor':
        return await this.monitorRisk(task);
      default:
        throw new Error(`Unknown risk task type: ${task.type}`);
    }
  }

  private async assessRisk(task: RiskTask): Promise<RiskAssessment> {
    const prompt = `
Assess risk for potential trade:
Trade Analysis: ${JSON.stringify(task.tradeAnalysis)}
Portfolio Data: ${JSON.stringify(task.portfolioData)}
Market Conditions: ${JSON.stringify(task.marketConditions)}
Proposed Position Size: ${task.positionSize}

Provide comprehensive risk assessment following the system prompt format.`;

    const response = await this.llmProvider.generate(prompt, {
      systemPrompt: this.getSystemPrompt(),
      temperature: 0.2,
      maxTokens: 1500
    });

    try {
      return JSON.parse(response) as RiskAssessment;
    } catch {
      return this.parseRiskResponse(response);
    }
  }

  private parseRiskResponse(response: string): RiskAssessment {
    const overallRisk = response.toLowerCase().includes('critical') ? 'critical' :
                       response.toLowerCase().includes('high') ? 'high' :
                       response.toLowerCase().includes('medium') ? 'medium' : 'low';

    return {
      overallRisk,
      factors: {
        marketVolatility: 0.5,
        positionSize: 0.3,
        portfolioExposure: 0.4,
        liquidityRisk: 0.2
      },
      recommendations: ['Monitor position closely', 'Set stop loss'],
      maxPositionSize: 1000,
      requiredConfirmations: overallRisk === 'high' ? 2 : 1
    };
  }
}

  private async validateTrade(task: RiskTask): Promise<boolean> {
    const assessment = await this.assessRisk(task);
    return assessment.overallRisk !== 'critical';
  }

  private async monitorRisk(task: RiskTask): Promise<any> {
    const prompt = `
Monitor ongoing risk for portfolio:
Portfolio Data: ${JSON.stringify(task.portfolioData)}
Market Conditions: ${JSON.stringify(task.marketConditions)}

Provide risk monitoring update.`;

    const response = await this.llmProvider.generate(prompt, {
      systemPrompt: this.getSystemPrompt(),
      temperature: 0.1,
      maxTokens: 1000
    });

    return { status: 'monitored', report: response };
  }
}
