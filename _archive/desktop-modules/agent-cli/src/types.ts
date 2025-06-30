export interface LLMProvider {
  name: string;
  generate(prompt: string, context?: any): Promise<string>;
  validate(response: string, criteria?: any): Promise<boolean>;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  type: 'request' | 'response' | 'notification' | 'error';
  content: any;
  timestamp: Date;
  metadata?: any;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  llmProvider: string;
  maxConcurrentTasks: number;
  timeoutMs: number;
}

export interface TradeAnalysis {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  priceTarget?: number;
  stopLoss?: number;
  timeframe: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    marketVolatility: number;
    positionSize: number;
    portfolioExposure: number;
    liquidityRisk: number;
  };
  recommendations: string[];
  maxPositionSize: number;
  requiredConfirmations: number;
}

export interface ExecutionPlan {
  tradeId: string;
  symbol: string;
  action: 'buy' | 'sell';
  amount: number;
  priceLimit?: number;
  strategy: string;
  timeframe: string;
  contingencies: string[];
  approvals: string[];
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'error' | 'paused';
  currentTask?: string;
  tasksCompleted: number;
  tasksInQueue: number;
  lastActivity: Date;
  healthCheck: boolean;
}

export interface CLICommand {
  name: string;
  description: string;
  aliases?: string[];
  args?: any;
  handler: (args: any, context: any) => Promise<void>;
}

export interface DashboardData {
  agents: AgentStatus[];
  activeAlerts: any[];
  portfolioStatus: any;
  marketConditions: any;
  recentActivity: AgentMessage[];
}
