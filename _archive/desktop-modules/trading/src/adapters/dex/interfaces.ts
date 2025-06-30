import {
  ITradableAsset,
  QuoteParams,
  QuoteResult,
  SwapParams,
} from "../../domain/interfaces";

/**
 * Interface for DEX adapters
 * Provides methods for interacting with a decentralized exchange
 */
export interface IDEXAdapter {
  /**
   * Gets a quote for a swap
   * @param params Quote parameters
   * @returns Quote result
   */
  getQuote(params: QuoteParams): Promise<QuoteResult>;

  /**
   * Builds a swap transaction
   * @param params Swap parameters
   * @returns Transaction object
   */
  buildSwapTransaction(params: SwapParams): Promise<any>;

  /**
   * Gets swap instructions for a transaction
   * @param params Swap parameters
   * @returns Swap instructions
   */
  getSwapInstructions(params: SwapParams): Promise<any>;
}

/**
 * Configuration for DEX adapters
 */
export interface DEXAdapterConfig {
  /**
   * Endpoint URL for the DEX API
   */
  endpoint: string;

  /**
   * Default slippage tolerance in percentage
   */
  slippageTolerance?: number;

  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout?: number;

  /**
   * Number of retry attempts for failed requests
   */
  retryAttempts?: number;
}
