import { v4 as uuidv4 } from "uuid";
import { IStrategy } from "@/domain/interfaces";
import { PriceTargetStrategy } from "@/strategies/PriceTargetStrategy";

/**
 * Interface for the strategy factory
 */
export interface IStrategyFactory {
  /**
   * Creates a strategy of the specified type with the given parameters
   * @param type Type of strategy to create
   * @param params Parameters for the strategy
   * @returns Created strategy instance
   */
  createStrategy(type: string, params: Record<string, any>): IStrategy;

  /**
   * Gets the available strategy types
   * @returns Array of available strategy types
   */
  getAvailableStrategyTypes(): string[];

  /**
   * Registers a new strategy type
   * @param type Type name
   * @param constructor Constructor function for the strategy
   */
  registerStrategyType<T extends IStrategy>(
    type: string,
    constructor: new (...args: any[]) => T
  ): void;
}

/**
 * Factory for creating strategy instances
 */
export class StrategyFactory implements IStrategyFactory {
  private strategyConstructors: Map<string, new (...args: any[]) => IStrategy> =
    new Map();

  /**
   * Creates a new strategy factory with built-in strategies
   */
  constructor() {
    // Register built-in strategies
    this.registerStrategyType("priceTarget", PriceTargetStrategy);

    // Additional strategies will be registered here as they are implemented
    // this.registerStrategyType('stopLoss', StopLossStrategy);
    // this.registerStrategyType('timeBased', TimeBasedStrategy);
    // this.registerStrategyType('volumeBased', VolumeBasedStrategy);
    // this.registerStrategyType('composite', CompositeStrategy);
    // this.registerStrategyType('sequential', SequentialStrategy);
    // this.registerStrategyType('conditional', ConditionalStrategy);
  }

  /**
   * Registers a new strategy type
   * @param type Type name
   * @param constructor Constructor function for the strategy
   */
  public registerStrategyType<T extends IStrategy>(
    type: string,
    constructor: new (...args: any[]) => T
  ): void {
    this.strategyConstructors.set(type, constructor);
  }

  /**
   * Creates a strategy of the specified type with the given parameters
   * @param type Type of strategy to create
   * @param params Parameters for the strategy
   * @returns Created strategy instance
   * @throws Error if the strategy type is unknown
   */
  public createStrategy(type: string, params: Record<string, any>): IStrategy {
    const Constructor = this.strategyConstructors.get(type);

    if (!Constructor) {
      throw new Error(`Unknown strategy type: ${type}`);
    }

    const strategy = new Constructor();

    if (params) {
      strategy.setParameters(params);
    }

    return strategy;
  }

  /**
   * Gets the available strategy types
   * @returns Array of available strategy types
   */
  public getAvailableStrategyTypes(): string[] {
    return Array.from(this.strategyConstructors.keys());
  }
}
