import {
  TradeStatus,
  StrategyAction,
  ParameterType,
  ValidationRuleType,
  TransactionStatus,
  TransactionType,
  ErrorAction,
  LogLevel,
  ConfigSourceType,
  TimeInterval,
  TimeWindowType,
} from "./enums";
import { ITradableAsset } from "./shared-interfaces";

// Re-export adapter interfaces
export { IBlockchainAdapter } from "@/adapters/blockchain/interfaces";
export { IDEXAdapter } from "@/adapters/dex/interfaces";
export { IPriceOracleAdapter } from "@/adapters/price/interfaces";
// Re-export shared interfaces
export { ITradableAsset } from "@/domain/shared-interfaces";

/**
 * Price point for historical price data
 */
export interface PricePoint {
  price: number;
  timestamp: Date;
}

/**
 * Price data with historical tracking
 */
export interface IPriceData {
  currentPrice: number;
  startingPrice: number;
  highPrice: number;
  lowPrice: number;
  priceHistory: PricePoint[];
  lastUpdated: Date;
}

/**
 * Market data for a tradable asset
 */
export interface MarketData {
  volume24h: number;
  volumeChange24h: number;
  liquidity: number;
  marketCap: number;
  fullyDilutedValuation: number;
  totalSupply: bigint;
  circulatingSupply: bigint;
}

/**
 * Parameter for a strategy
 */
export interface StrategyParameter {
  name: string;
  type: ParameterType;
  description: string;
  defaultValue: any;
  required: boolean;
  validationRules?: ValidationRule[];
}

/**
 * Validation rule for a strategy parameter
 */
export interface ValidationRule {
  type: ValidationRuleType;
  params: any;
  errorMessage: string;
}

/**
 * Context for strategy evaluation
 */
export interface StrategyContext {
  trade: ITrade;
  currentPrice: number;
  priceHistory: PricePoint[];
  marketData: MarketData;
  walletBalances: Record<string, bigint>;
}

/**
 * Result of strategy evaluation
 */
export interface StrategyResult {
  action: StrategyAction;
  reason: string;
  suggestedParams?: Record<string, any>;
}

/**
 * Strategy interface
 */
export interface IStrategy {
  id: string;
  name: string;
  description: string;
  evaluate(context: StrategyContext): StrategyResult;
  getParameters(): StrategyParameter[];
  setParameters(params: Record<string, any>): void;
}

/**
 * Trade interface
 */
export interface ITrade {
  id: string;
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  expectedOutputAmount?: bigint;
  actualOutputAmount?: bigint;
  status: TradeStatus;
  createdAt: Date;
  executedAt?: Date;
  strategies: IStrategy[];
  priceData: IPriceData;
  metadata: Record<string, any>;
}

/**
 * Parameters for creating a trade
 */
export interface CreateTradeParams {
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  strategies: IStrategy[];
  metadata?: Record<string, any>;
}

/**
 * Result of a trade execution
 */
export interface TradeResult {
  trade: ITrade;
  success: boolean;
  transactionId?: string;
  error?: Error;
}

/**
 * Parameters for getting a quote
 */
export interface QuoteParams {
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  slippageTolerance: number;
}

/**
 * Result of a quote request
 */
export interface QuoteResult {
  inputAmount: bigint;
  outputAmount: bigint;
  price: number;
  priceImpact: number;
  route: any;
  validUntil: Date;
}

/**
 * Parameters for a swap
 */
export interface SwapParams extends QuoteParams {
  walletAddress: string;
  quoteResult: QuoteResult;
}

/**
 * Time window for time-based strategies
 */
export interface TimeWindow {
  type: TimeWindowType;
  targetTime?: Date;
  durationMs?: number;
  startTime?: Date;
  endTime?: Date;
}

/**
 * Timeframe for price history
 */
export interface Timeframe {
  start: Date;
  end: Date;
  interval: TimeInterval;
}

/**
 * Token metadata
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  logo?: string;
  marketCap?: number;
  totalSupply?: bigint;
  circulatingSupply?: bigint;
  links?: Record<string, string>;
}

/**
 * Trade filters for repository queries
 */
export interface TradeFilters {
  status?: TradeStatus[];
  inputAsset?: ITradableAsset;
  outputAsset?: ITradableAsset;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

/**
 * Strategy evaluation result
 */
export interface StrategyEvaluationResult {
  trade: ITrade;
  results: StrategyResult[];
  aggregatedAction: StrategyAction;
  explanation: string;
}

/**
 * Interface for the trading engine
 */
export interface ITradingEngine {
  /**
   * Creates a new trade
   * @param params Parameters for creating the trade
   * @returns Created trade
   */
  createTrade(params: CreateTradeParams): Promise<ITrade>;

  /**
   * Executes a trade
   * @param tradeId ID of the trade to execute
   * @returns Result of the trade execution
   */
  executeTrade(tradeId: string): Promise<TradeResult>;

  /**
   * Cancels a trade
   * @param tradeId ID of the trade to cancel
   * @returns True if the trade was cancelled, false otherwise
   */
  cancelTrade(tradeId: string): Promise<boolean>;

  /**
   * Gets a trade by ID
   * @param tradeId ID of the trade to get
   * @returns Trade with the specified ID
   */
  getTrade(tradeId: string): Promise<ITrade>;

  /**
   * Lists all active trades
   * @returns Array of active trades
   */
  listActiveTrades(): Promise<ITrade[]>;
}
