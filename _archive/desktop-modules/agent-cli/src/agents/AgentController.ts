import { EventEmitter } from 'eventemitter3';
import { BaseAgent } from './BaseAgent.js';
import { StrategyAgent } from './StrategyAgent.js';
import { RiskAgent } from './RiskAgent.js';
import { DualLLMOrchestrator } from '../llm/DualLLMOrchestrator.js';
import { ClaudeProvider } from '../llm/ClaudeProvider.js';
import { OpenAIProvider } from '../llm/OpenAIProvider.js';
import { AgentStatus, AgentMessage } from '../types.js';

export interface AgentControllerConfig {
  agents: {
    strategy: boolean;
    risk: boolean;
    execution: boolean;
    monitoring: boolean;
  };
  llm: {
    primary: 'claude' | 'openai';
    validator: 'claude' | 'openai';
    requireValidation: boolean;
  };
}

export class AgentController extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map();
  private llmOrchestrator: DualLLMOrchestrator;
  private config: AgentControllerConfig;
  private messageQueue: AgentMessage[] = [];

  constructor(config: AgentControllerConfig) {
    super();
    this.config = config;
    this.initializeLLM();
    this.initializeAgents();
  }

  private initializeLLM(): void {
    const primaryProvider = this.config.llm.primary === 'claude' 
      ? new ClaudeProvider() 
      : new OpenAIProvider();
    
    const validatorProvider = this.config.llm.validator === 'claude' 
      ? new ClaudeProvider() 
      : new OpenAIProvider();

    this.llmOrchestrator = new DualLLMOrchestrator({
      primaryProvider,
      validatorProvider,
      requireValidation: this.config.llm.requireValidation
    });
  }

  private initializeAgents(): void {
    if (this.config.agents.strategy) {
      const strategyAgent = new StrategyAgent(
        {
          id: 'strategy',
          name: 'Strategy Agent',
          description: 'Analyzes markets and generates trading strategies',
          capabilities: ['analyze', 'recommend', 'backtest'],
          llmProvider: 'dual',
          maxConcurrentTasks: 3,
          timeoutMs: 30000
        },
        this.llmOrchestrator
      );
      
      this.agents.set('strategy', strategyAgent);
      this.setupAgentEventHandlers(strategyAgent);
    }

    if (this.config.agents.risk) {
      const riskAgent = new RiskAgent(
        {
          id: 'risk',
          name: 'Risk Agent',
          description: 'Evaluates and manages trading risk',
          capabilities: ['assess', 'validate', 'monitor'],
          llmProvider: 'dual',
          maxConcurrentTasks: 5,
          timeoutMs: 15000
        },
        this.llmOrchestrator
      );
      
      this.agents.set('risk', riskAgent);
      this.setupAgentEventHandlers(riskAgent);
    }
  }

  private setupAgentEventHandlers(agent: BaseAgent): void {
    agent.on('status-update', (status: AgentStatus) => {
      this.emit('agent-status-update', status);
    });

    agent.on('message', (message: AgentMessage) => {
      this.messageQueue.push(message);
      this.emit('agent-message', message);
    });

    agent.on('task-completed', (result: any) => {
      this.emit('task-completed', result);
    });

    agent.on('task-error', (error: any) => {
      this.emit('task-error', error);
    });
  }

  async executeTask(agentId: string, task: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    return await agent.processTask(task);
  }

  async executeWorkflow(type: 'analyze-and-trade', data: any): Promise<any> {
    switch (type) {
      case 'analyze-and-trade':
        return await this.analyzeAndTradeWorkflow(data);
      default:
        throw new Error(`Unknown workflow type: ${type}`);
    }
  }

  private async analyzeAndTradeWorkflow(data: any): Promise<any> {
    // Step 1: Strategy analysis
    const strategyResult = await this.executeTask('strategy', {
      type: 'analyze',
      symbol: data.symbol,
      timeframe: data.timeframe,
      marketData: data.marketData
    });

    // Step 2: Risk assessment
    const riskResult = await this.executeTask('risk', {
      type: 'assess',
      tradeAnalysis: strategyResult,
      portfolioData: data.portfolioData,
      positionSize: data.positionSize
    });

    return { strategy: strategyResult, risk: riskResult };
  }

  getAgentStatuses(): AgentStatus[] {
    return Array.from(this.agents.values()).map(agent => agent.getStatus());
  }
}
