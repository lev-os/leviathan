import {
  ITradableAsset,
  TokenMetadata,
  Timeframe,
  PricePoint,
} from "../../domain/interfaces";

/**
 * Interface for price oracle adapters
 * Provides methods for getting price data from various sources
 */
export interface IPriceOracleAdapter {
  /**
   * Gets the current price of an asset
   * @param asset Asset to get price for
   * @returns Current price in USD
   */
  getPrice(asset: ITradableAsset): Promise<number>;

  /**
   * Gets metadata for a token
   * @param asset Asset to get metadata for
   * @returns Token metadata
   */
  getTokenMetadata(asset: ITradableAsset): Promise<TokenMetadata>;

  /**
   * Gets price history for an asset
   * @param asset Asset to get price history for
   * @param timeframe Timeframe to get price history for
   * @returns Array of price points
   */
  getPriceHistory(
    asset: ITradableAsset,
    timeframe: Timeframe
  ): Promise<PricePoint[]>;
}

/**
 * Configuration for price oracle adapters
 */
export interface PriceOracleAdapterConfig {
  /**
   * API key for the price oracle
   */
  apiKey: string;

  /**
   * Base URL for the price oracle API
   */
  baseUrl?: string;

  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout?: number;

  /**
   * Number of retry attempts for failed requests
   */
  retryAttempts?: number;
}
