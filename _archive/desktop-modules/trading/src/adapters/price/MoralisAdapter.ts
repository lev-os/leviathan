import Moralis from "moralis";
import {
  IPriceOracleAdapter,
  PriceOracleAdapterConfig,
} from "@/adapters/price/interfaces";
import {
  ITradableAsset,
  TokenMetadata,
  Timeframe,
  PricePoint,
} from "@/domain/interfaces";
import { TimeInterval } from "@/domain/enums";

/**
 * Moralis-specific price oracle adapter configuration
 */
export interface MoralisAdapterConfig extends PriceOracleAdapterConfig {
  /**
   * Network to use for Moralis API
   */
  network?: string;
}

/**
 * Adapter for getting price data from Moralis
 */
export class MoralisAdapter implements IPriceOracleAdapter {
  private config: MoralisAdapterConfig;
  private initialized: boolean = false;

  /**
   * Creates a new Moralis adapter
   * @param config Configuration for the adapter
   */
  constructor(config: MoralisAdapterConfig) {
    this.config = {
      network: "mainnet",
      connectionTimeout: 30000,
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Initializes the Moralis API
   */
  private async initialize(): Promise<void> {
    if (!this.initialized) {
      await Moralis.start({
        apiKey: this.config.apiKey,
      });
      this.initialized = true;
    }
  }

  /**
   * Gets the current price of an asset
   * @param asset Asset to get price for
   * @returns Current price in USD
   */
  public async getPrice(asset: ITradableAsset): Promise<number> {
    try {
      await this.initialize();

      const priceRequest = await Moralis.SolApi.token.getTokenPrice({
        network: this.config.network as any,
        address: asset.address,
      });

      const priceData = priceRequest.toJSON() as any;
      return priceData.usdPrice || 0;
    } catch (error: any) {
      console.error("Error getting price from Moralis:", error);
      throw new Error(
        `Failed to get price for ${asset.symbol}: ${error.message}`
      );
    }
  }

  /**
   * Gets metadata for a token
   * @param asset Asset to get metadata for
   * @returns Token metadata
   */
  public async getTokenMetadata(asset: ITradableAsset): Promise<TokenMetadata> {
    try {
      await this.initialize();

      const metaRequest = await Moralis.SolApi.token.getTokenMetadata({
        network: this.config.network as any,
        address: asset.address,
      });

      const meta = metaRequest.toJSON() as any;

      return {
        name: meta.name || asset.symbol,
        symbol: meta.symbol || asset.symbol,
        logo: meta.logo || "",
        marketCap: meta.marketCap || 0,
        totalSupply: meta.totalSupply ? BigInt(meta.totalSupply) : undefined,
        circulatingSupply: meta.circulatingSupply
          ? BigInt(meta.circulatingSupply)
          : undefined,
        links: {
          website: meta.links?.website || "",
          twitter: meta.links?.twitter || "",
          telegram: meta.links?.telegram || "",
          discord: meta.links?.discord || "",
        },
      };
    } catch (error: any) {
      console.error("Error getting token metadata from Moralis:", error);
      throw new Error(
        `Failed to get metadata for ${asset.symbol}: ${error.message}`
      );
    }
  }

  /**
   * Gets price history for an asset
   * @param asset Asset to get price history for
   * @param timeframe Timeframe to get price history for
   * @returns Array of price points
   */
  public async getPriceHistory(
    asset: ITradableAsset,
    timeframe: Timeframe
  ): Promise<PricePoint[]> {
    try {
      await this.initialize();

      // Convert our timeframe to Moralis format
      const interval = this.convertTimeInterval(timeframe.interval);

      // Moralis doesn't have a direct price history endpoint for Solana tokens
      // This is a placeholder implementation
      // In a real implementation, you might need to use a different API or
      // collect price data over time and store it in your own database

      console.warn(
        "Price history not directly available from Moralis for Solana tokens"
      );

      // Return a placeholder with the current price
      const currentPrice = await this.getPrice(asset);

      // Generate some mock historical data
      const now = new Date();
      const priceHistory: PricePoint[] = [];

      // Generate price points from start to end date
      const startTime = timeframe.start.getTime();
      const endTime = timeframe.end.getTime();
      const step = this.getTimeStepMs(timeframe.interval);

      for (let time = startTime; time <= endTime; time += step) {
        // Generate a random price variation within ±5% of current price
        const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 to 1.05
        priceHistory.push({
          price: currentPrice * randomFactor,
          timestamp: new Date(time),
        });
      }

      return priceHistory;
    } catch (error: any) {
      console.error("Error getting price history from Moralis:", error);
      throw new Error(
        `Failed to get price history for ${asset.symbol}: ${error.message}`
      );
    }
  }

  /**
   * Converts our time interval to Moralis format
   * @param interval Time interval
   * @returns Moralis time interval
   */
  private convertTimeInterval(interval: TimeInterval): string {
    switch (interval) {
      case TimeInterval.MINUTE_1:
        return "1min";
      case TimeInterval.MINUTE_5:
        return "5min";
      case TimeInterval.MINUTE_15:
        return "15min";
      case TimeInterval.HOUR_1:
        return "1h";
      case TimeInterval.HOUR_4:
        return "4h";
      case TimeInterval.DAY_1:
        return "1d";
      case TimeInterval.WEEK_1:
        return "1w";
      default:
        return "1h";
    }
  }

  /**
   * Gets the time step in milliseconds for a time interval
   * @param interval Time interval
   * @returns Time step in milliseconds
   */
  private getTimeStepMs(interval: TimeInterval): number {
    switch (interval) {
      case TimeInterval.MINUTE_1:
        return 60 * 1000;
      case TimeInterval.MINUTE_5:
        return 5 * 60 * 1000;
      case TimeInterval.MINUTE_15:
        return 15 * 60 * 1000;
      case TimeInterval.HOUR_1:
        return 60 * 60 * 1000;
      case TimeInterval.HOUR_4:
        return 4 * 60 * 60 * 1000;
      case TimeInterval.DAY_1:
        return 24 * 60 * 60 * 1000;
      case TimeInterval.WEEK_1:
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  }
}
