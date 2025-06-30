import { v4 as uuidv4 } from "uuid";
import {
  ITradingEngine,
  CreateTradeParams,
  TradeResult,
  ITrade,
  IBlockchainAdapter,
  IDEXAdapter,
  IPriceOracleAdapter,
  IPriceData,
  PricePoint,
} from "@/domain/interfaces";
import { TradeStatus, StrategyAction } from "@/domain/enums";
import { IStrategyEngine } from "@/core/StrategyEngine";
import { IWalletManager } from "@/wallet/interfaces";

/**
 * Configuration for the trading engine
 */
export interface TradingEngineConfig {
  /**
   * Default slippage tolerance in percentage
   */
  defaultSlippageTolerance?: number;

  /**
   * Default transaction timeout in milliseconds
   */
  defaultTransactionTimeout?: number;

  /**
   * Default number of retry attempts for failed transactions
   */
  defaultRetryAttempts?: number;

  /**
   * Default wallet ID to use for transactions
   * If not provided, the default wallet from the wallet manager will be used
   */
  defaultWalletId?: string;
}

/**
 * Core trading engine that orchestrates trades
 */
export class TradingEngine implements ITradingEngine {
  private blockchainAdapter: IBlockchainAdapter;
  private dexAdapter: IDEXAdapter;
  private priceOracleAdapter: IPriceOracleAdapter;
  private strategyEngine: IStrategyEngine;
  private walletManager?: IWalletManager;
  private config: TradingEngineConfig;
  private activeTrades: Map<string, ITrade> = new Map();

  /**
   * Creates a new trading engine
   * @param blockchainAdapter Adapter for blockchain interactions
   * @param dexAdapter Adapter for DEX interactions
   * @param priceOracleAdapter Adapter for price data
   * @param strategyEngine Engine for evaluating strategies
   * @param config Configuration for the trading engine
   */
  constructor(
    blockchainAdapter: IBlockchainAdapter,
    dexAdapter: IDEXAdapter,
    priceOracleAdapter: IPriceOracleAdapter,
    strategyEngine: IStrategyEngine,
    walletManager?: IWalletManager,
    config: TradingEngineConfig = {}
  ) {
    this.blockchainAdapter = blockchainAdapter;
    this.dexAdapter = dexAdapter;
    this.priceOracleAdapter = priceOracleAdapter;
    this.strategyEngine = strategyEngine;
    this.walletManager = walletManager;
    this.config = {
      defaultSlippageTolerance: 0.5,
      defaultTransactionTimeout: 60000,
      defaultRetryAttempts: 3,
      ...config,
    };
  }

  /**
   * Creates a new trade
   * @param params Parameters for creating the trade
   * @returns Created trade
   */
  public async createTrade(params: CreateTradeParams): Promise<ITrade> {
    try {
      // Get current price data
      const currentPrice = await this.priceOracleAdapter.getPrice(
        params.outputAsset
      );

      // Create price data
      const priceData: IPriceData = {
        currentPrice,
        startingPrice: currentPrice,
        highPrice: currentPrice,
        lowPrice: currentPrice,
        priceHistory: [
          {
            price: currentPrice,
            timestamp: new Date(),
          },
        ],
        lastUpdated: new Date(),
      };

      // Create trade
      const trade: ITrade = {
        id: uuidv4(),
        inputAsset: params.inputAsset,
        outputAsset: params.outputAsset,
        inputAmount: params.inputAmount,
        status: TradeStatus.PENDING,
        createdAt: new Date(),
        strategies: params.strategies,
        priceData,
        metadata: params.metadata || {},
      };

      // Store trade
      this.activeTrades.set(trade.id, trade);

      console.log(`Trade created: ${trade.id}`, trade);

      return trade;
    } catch (error: any) {
      console.error("Error creating trade:", error);
      throw new Error(`Failed to create trade: ${error.message}`);
    }
  }

  /**
   * Executes a trade
   * @param tradeId ID of the trade to execute
   * @returns Result of the trade execution
   */
  public async executeTrade(tradeId: string): Promise<TradeResult> {
    try {
      const trade = this.activeTrades.get(tradeId);

      if (!trade) {
        throw new Error(`Trade with ID ${tradeId} not found`);
      }

      if (trade.status !== TradeStatus.PENDING) {
        throw new Error(`Trade with ID ${tradeId} is not in PENDING status`);
      }

      // Update trade status
      trade.status = TradeStatus.ACTIVE;

      // Get quote
      const quote = await this.dexAdapter.getQuote({
        inputAsset: trade.inputAsset,
        outputAsset: trade.outputAsset,
        inputAmount: trade.inputAmount,
        slippageTolerance: this.config.defaultSlippageTolerance || 0.5,
      });

      // Update expected output amount
      trade.expectedOutputAmount = quote.outputAmount;

      // Get wallet information
      let walletId = trade.metadata.walletId as string;
      let walletAddress: string;

      if (this.walletManager) {
        try {
          // If no wallet ID is provided in metadata, use the default wallet ID from config or get the default wallet
          if (!walletId) {
            if (this.config.defaultWalletId) {
              walletId = this.config.defaultWalletId;
            } else {
              const defaultWallet = await this.walletManager.getDefaultWallet();
              walletId = defaultWallet.id;
              walletAddress = defaultWallet.address;
            }
          }

          // If we have a wallet ID but no address yet, get the wallet by ID
          if (walletId && !walletAddress) {
            const wallet = await this.walletManager.getWallet(walletId);
            walletAddress = wallet.address;
          }

          // Store the wallet ID in the trade metadata for future reference
          trade.metadata.walletId = walletId;
        } catch (error: any) {
          throw new Error(`Failed to get wallet: ${error.message}`);
        }
      } else {
        // If no wallet manager is available, fall back to the old behavior
        walletAddress = trade.metadata.walletAddress as string;
        if (!walletAddress) {
          throw new Error(
            "Wallet address not provided in trade metadata and no wallet manager is available"
          );
        }
      }

      const swapTransaction = await this.dexAdapter.buildSwapTransaction({
        inputAsset: trade.inputAsset,
        outputAsset: trade.outputAsset,
        inputAmount: trade.inputAmount,
        slippageTolerance: this.config.defaultSlippageTolerance || 0.5,
        walletAddress,
        quoteResult: quote,
      });

      // Sign transaction
      let signedTransaction;

      if (this.walletManager && walletId) {
        // Use wallet manager to sign the transaction
        signedTransaction = await this.walletManager.signTransaction(
          swapTransaction,
          walletId
        );
      } else {
        // Fall back to the old behavior
        const privateKey = trade.metadata.privateKey as string;
        if (!privateKey) {
          throw new Error(
            "Private key not provided in trade metadata and no wallet manager is available"
          );
        }

        signedTransaction = await this.blockchainAdapter.signTransaction(
          swapTransaction,
          privateKey
        );
      }

      // Submit transaction
      const transactionId = await this.blockchainAdapter.submitTransaction(
        signedTransaction
      );

      // Wait for transaction confirmation
      const transactionStatus =
        await this.blockchainAdapter.getTransactionStatus(transactionId);

      // Update trade status
      if (transactionStatus === "CONFIRMED") {
        trade.status = TradeStatus.COMPLETED;
        trade.executedAt = new Date();
        trade.actualOutputAmount = quote.outputAmount;
      } else {
        trade.status = TradeStatus.FAILED;
      }

      return {
        trade,
        success: trade.status === TradeStatus.COMPLETED,
        transactionId,
        error:
          trade.status === TradeStatus.FAILED
            ? new Error("Transaction failed")
            : undefined,
      };
    } catch (error: any) {
      console.error("Error executing trade:", error);

      // Update trade status
      const trade = this.activeTrades.get(tradeId);

      if (trade) {
        trade.status = TradeStatus.FAILED;
      }

      return {
        trade: trade!,
        success: false,
        error: new Error(`Failed to execute trade: ${error.message}`),
      };
    }
  }

  /**
   * Cancels a trade
   * @param tradeId ID of the trade to cancel
   * @returns True if the trade was cancelled, false otherwise
   */
  public async cancelTrade(tradeId: string): Promise<boolean> {
    try {
      const trade = this.activeTrades.get(tradeId);

      if (!trade) {
        throw new Error(`Trade with ID ${tradeId} not found`);
      }

      if (
        trade.status !== TradeStatus.PENDING &&
        trade.status !== TradeStatus.ACTIVE
      ) {
        throw new Error(`Trade with ID ${tradeId} cannot be cancelled`);
      }

      // Update trade status
      trade.status = TradeStatus.CANCELLED;

      return true;
    } catch (error: any) {
      console.error("Error cancelling trade:", error);
      return false;
    }
  }

  /**
   * Gets a trade by ID
   * @param tradeId ID of the trade to get
   * @returns Trade with the specified ID
   */
  public async getTrade(tradeId: string): Promise<ITrade> {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      throw new Error(`Trade with ID ${tradeId} not found`);
    }

    return trade;
  }

  public listAllTrades(): ITrade[] {
    return Array.from(this.activeTrades.values());
  }

  /**
   * Lists all active trades
   * @returns Array of active trades
   */
  public async listActiveTrades(): Promise<ITrade[]> {
    return Array.from(this.activeTrades.values()).filter(
      (trade) =>
        trade.status === TradeStatus.PENDING ||
        trade.status === TradeStatus.ACTIVE
    );
  }

  /**
   * Updates price data for a trade
   * @param tradeId ID of the trade to update price data for
   * @returns Updated trade
   */
  public async updatePriceData(tradeId: string): Promise<ITrade> {
    try {
      const trade = this.activeTrades.get(tradeId);

      if (!trade) {
        throw new Error(`Trade with ID ${tradeId} not found`);
      }

      // Get current price
      const currentPrice = await this.priceOracleAdapter.getPrice(
        trade.outputAsset
      );

      // Update price data
      trade.priceData.currentPrice = currentPrice;
      trade.priceData.highPrice = Math.max(
        trade.priceData.highPrice,
        currentPrice
      );
      trade.priceData.lowPrice = Math.min(
        trade.priceData.lowPrice,
        currentPrice
      );
      trade.priceData.lastUpdated = new Date();

      // Add price point to history
      trade.priceData.priceHistory.push({
        price: currentPrice,
        timestamp: new Date(),
      });

      // Evaluate strategies
      if (trade.status === TradeStatus.ACTIVE) {
        const result = await this.strategyEngine.evaluateStrategies(trade);

        // Take action based on strategy evaluation
        if (result.aggregatedAction === StrategyAction.SELL) {
          await this.executeTrade(tradeId);
        } else if (result.aggregatedAction === StrategyAction.CANCEL) {
          await this.cancelTrade(tradeId);
        }
      }

      return trade;
    } catch (error: any) {
      console.error("Error updating price data:", error);
      throw new Error(`Failed to update price data: ${error.message}`);
    }
  }
}
