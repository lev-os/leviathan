import {
  IStrategy,
  StrategyContext,
  StrategyEvaluationResult,
  StrategyResult,
  ITrade,
  MarketData,
} from "@/domain/interfaces";
import { StrategyAction } from "@/domain/enums";
import { IStrategyFactory } from "@/strategies/StrategyFactory";

/**
 * Interface for the strategy engine
 */
export interface IStrategyEngine {
  /**
   * Registers a strategy instance
   * @param strategy Strategy instance to register
   */
  registerStrategy(strategy: IStrategy): void;

  /**
   * Unregisters a strategy instance
   * @param strategyId ID of the strategy to unregister
   * @returns True if the strategy was unregistered, false otherwise
   */
  unregisterStrategy(strategyId: string): boolean;

  /**
   * Gets a registered strategy instance
   * @param strategyId ID of the strategy to get
   * @returns Strategy instance or null if not found
   */
  getStrategy(strategyId: string): IStrategy | null;

  /**
   * Lists all registered strategies
   * @returns Array of registered strategies
   */
  listStrategies(): IStrategy[];

  /**
   * Evaluates all strategies associated with a trade
   * @param trade Trade to evaluate strategies for
   * @returns Strategy evaluation result
   */
  evaluateStrategies(trade: ITrade): Promise<StrategyEvaluationResult>;
}

/**
 * Manages and evaluates trading strategies
 */
export class StrategyEngine implements IStrategyEngine {
  private strategyRegistry: Map<string, IStrategy> = new Map();
  private strategyFactory: IStrategyFactory;

  /**
   * Creates a new strategy engine
   * @param strategyFactory Factory for creating strategy instances
   */
  constructor(strategyFactory: IStrategyFactory) {
    this.strategyFactory = strategyFactory;
  }

  /**
   * Registers a strategy instance
   * @param strategy Strategy instance to register
   */
  public registerStrategy(strategy: IStrategy): void {
    this.strategyRegistry.set(strategy.id, strategy);
  }

  /**
   * Unregisters a strategy instance
   * @param strategyId ID of the strategy to unregister
   * @returns True if the strategy was unregistered, false otherwise
   */
  public unregisterStrategy(strategyId: string): boolean {
    return this.strategyRegistry.delete(strategyId);
  }

  /**
   * Gets a registered strategy instance
   * @param strategyId ID of the strategy to get
   * @returns Strategy instance or null if not found
   */
  public getStrategy(strategyId: string): IStrategy | null {
    return this.strategyRegistry.get(strategyId) || null;
  }

  /**
   * Lists all registered strategies
   * @returns Array of registered strategies
   */
  public listStrategies(): IStrategy[] {
    return Array.from(this.strategyRegistry.values());
  }

  /**
   * Evaluates all strategies associated with a trade
   * @param trade Trade to evaluate strategies for
   * @returns Strategy evaluation result
   */
  public async evaluateStrategies(
    trade: ITrade
  ): Promise<StrategyEvaluationResult> {
    // Build context for strategy evaluation
    const context = await this.buildStrategyContext(trade);

    // Evaluate each strategy associated with the trade
    const results: StrategyResult[] = [];

    for (const strategy of trade.strategies) {
      const result = strategy.evaluate(context);
      results.push(result);
    }

    // Determine aggregated action based on results
    const aggregatedAction = this.determineAggregatedAction(results);

    // Generate explanation for the aggregated action
    const explanation = this.generateExplanation(results, aggregatedAction);

    return {
      trade,
      results,
      aggregatedAction,
      explanation,
    };
  }

  /**
   * Builds the context for strategy evaluation
   * @param trade Trade to build context for
   * @returns Strategy evaluation context
   */
  private async buildStrategyContext(trade: ITrade): Promise<StrategyContext> {
    // TODO: Implement fetching of latest price, market data, and wallet balances

    return {
      trade,
      currentPrice: trade.priceData.currentPrice,
      priceHistory: trade.priceData.priceHistory,
      marketData: {} as MarketData, // Placeholder
      walletBalances: {} as Record<string, bigint>, // Placeholder
    };
  }

  /**
   * Determines the aggregated action based on strategy results
   * @param results Array of strategy results
   * @returns Aggregated strategy action
   */
  private determineAggregatedAction(results: StrategyResult[]): StrategyAction {
    // Prioritize actions: CANCEL > SELL > BUY > HOLD

    if (results.some((r) => r.action === StrategyAction.CANCEL)) {
      return StrategyAction.CANCEL;
    }

    if (results.some((r) => r.action === StrategyAction.SELL)) {
      return StrategyAction.SELL;
    }

    if (results.some((r) => r.action === StrategyAction.BUY)) {
      return StrategyAction.BUY;
    }

    return StrategyAction.HOLD;
  }

  /**
   * Generates a human-readable explanation for the aggregated action
   * @param results Array of strategy results
   * @param aggregatedAction Aggregated strategy action
   * @returns Explanation string
   */
  private generateExplanation(
    results: StrategyResult[],
    aggregatedAction: StrategyAction
  ): string {
    const actionResults = results.filter((r) => r.action === aggregatedAction);

    if (actionResults.length === 0) {
      return `No strategies triggered action ${StrategyAction[aggregatedAction]}`;
    }

    return `Action ${StrategyAction[aggregatedAction]} triggered by ${
      actionResults.length
    } strategies: ${actionResults.map((r) => r.reason).join("; ")}`;
  }
}
