import { v4 as uuidv4 } from "uuid";
import {
  ITradingEngine,
  CreateTradeParams,
  TradeResult,
  ITrade,
  IPriceData,
  StrategyResult,
} from "../domain/interfaces";
import {
  ChainId,
  IChainProvider,
  IUniversalBlockchainAdapter,
  IUniversalDEXAdapter,
  IUniversalQuoteParams,
  IUniversalSwapParams,
  IMultiChainConfig,
} from "../domain/multi-chain-interfaces";
import { TradeStatus, StrategyAction } from "../domain/enums";
import { IStrategyEngine } from "./StrategyEngine";
import { UniversalWalletManager } from "../wallet/UniversalWalletManager";
import { MultiChainAdapterFactory } from "../adapters/factories/ChainProviderFactory";

/**
 * Multi-chain trading engine configuration
 */
export interface MultiChainTradingEngineConfig {
  defaultSlippageTolerance?: number;
  defaultTransactionTimeout?: number;
  defaultRetryAttempts?: number;
  defaultWalletId?: string;
  /** Preferred chains for execution (in order of preference) */
  preferredChains?: ChainId[];
  /** Enable cross-chain arbitrage */
  enableCrossChainArbitrage?: boolean;
  /** Maximum gas price thresholds per chain (in native currency) */
  maxGasPrices?: Record<ChainId, bigint>;
}

/**
 * Enhanced trade interface with multi-chain support
 */
export interface IMultiChainTrade extends ITrade {
  /** Target chain for execution */
  targetChain: ChainId;
  /** Alternative chains that could execute this trade */
  alternativeChains?: ChainId[];
  /** Cross-chain route information if applicable */
  crossChainRoute?: any;
}

/**
 * Multi-chain trading engine that can execute trades across different blockchains
 */
export class MultiChainTradingEngine implements ITradingEngine {
  private adapterFactory: MultiChainAdapterFactory;
  private chainProviders: Record<ChainId, IChainProvider>;
  private strategyEngine: IStrategyEngine;
  private walletManager: UniversalWalletManager;
  private config: MultiChainTradingEngineConfig;
  private multiChainConfig: IMultiChainConfig;
  private activeTrades: Map<string, IMultiChainTrade> = new Map();

  constructor(
    multiChainConfig: IMultiChainConfig,
    strategyEngine: IStrategyEngine,
    walletManager: UniversalWalletManager,
    config: MultiChainTradingEngineConfig = {}
  ) {
    this.multiChainConfig = multiChainConfig;
    this.adapterFactory = new MultiChainAdapterFactory(multiChainConfig);
    this.chainProviders = this.adapterFactory.createAllProviders();
    this.strategyEngine = strategyEngine;
    this.walletManager = walletManager;
    this.config = {
      defaultSlippageTolerance: 0.5,
      defaultTransactionTimeout: 60000,
      defaultRetryAttempts: 3,
      preferredChains: ['solana', 'arbitrum', 'base'],
      enableCrossChainArbitrage: false,
      maxGasPrices: {
        ethereum: BigInt(50e9), // 50 gwei
        arbitrum: BigInt(0.1e9), // 0.1 gwei
        base: BigInt(0.1e9),
        polygon: BigInt(50e9),
        avalanche: BigInt(30e9),
        solana: BigInt(5000), // ~0.000005 SOL
      },
      ...config,
    };
  }

  /**
   * Creates a new multi-chain trade
   */
  public async createTrade(params: CreateTradeParams): Promise<ITrade> {
    try {
      // Determine optimal chain for execution
      const targetChain = await this.selectOptimalChain(params);
      
      // Get current price data using the target chain's price oracle
      const chainProvider = this.chainProviders[targetChain];
      const dexAdapter = chainProvider.createDEXAdapter();
      
      // For now, we'll get a quote to establish pricing
      const quote = await dexAdapter.getQuote({
        inputAsset: params.inputAsset,
        outputAsset: params.outputAsset,
        inputAmount: params.inputAmount,
        slippageTolerance: this.config.defaultSlippageTolerance || 0.5,
        walletAddress: 'placeholder', // We'll get this when executing
      });

      const currentPrice = Number(quote.outputAmount) / Number(params.inputAmount);

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

      // Create multi-chain trade
      const trade: IMultiChainTrade = {
        id: uuidv4(),
        inputAsset: params.inputAsset,
        outputAsset: params.outputAsset,
        inputAmount: params.inputAmount,
        status: TradeStatus.PENDING,
        createdAt: new Date(),
        strategies: params.strategies,
        priceData,
        metadata: params.metadata || {},
        targetChain,
        alternativeChains: await this.getAlternativeChains(params),
      };

      // Store trade
      this.activeTrades.set(trade.id, trade);

      console.log(`Multi-chain trade created: ${trade.id} on ${targetChain}`, trade);

      return trade;
    } catch (error: any) {
      console.error("Error creating multi-chain trade:", error);
      throw new Error(`Failed to create multi-chain trade: ${error.message}`);
    }
  }

  /**
   * Executes a multi-chain trade
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

      // Execute on target chain
      let result: TradeResult;
      try {
        result = await this.executeOnChain(trade, trade.targetChain);
      } catch (error) {
        console.warn(`Execution failed on ${trade.targetChain}:`, error);
        
        // Try alternative chains if main execution fails
        result = await this.tryAlternativeChains(trade);
      }

      return result;
    } catch (error: any) {
      console.error("Error executing multi-chain trade:", error);

      // Update trade status
      const trade = this.activeTrades.get(tradeId);
      if (trade) {
        trade.status = TradeStatus.FAILED;
      }

      return {
        trade: trade!,
        success: false,
        error: new Error(`Failed to execute multi-chain trade: ${error.message}`),
      };
    }
  }

  /**
   * Execute trade on a specific chain
   */
  private async executeOnChain(trade: IMultiChainTrade, chainId: ChainId): Promise<TradeResult> {
    const chainProvider = this.chainProviders[chainId];
    const blockchainAdapter = chainProvider.createBlockchainAdapter();
    const dexAdapter = chainProvider.createDEXAdapter();

    // Get wallet for this chain
    const walletId = trade.metadata.walletId as string || 
                    this.config.defaultWalletId || 
                    (await this.walletManager.getDefaultWallet()).id;
    
    const wallet = await this.walletManager.getChainWallet(walletId, chainId);

    // Check gas prices
    await this.validateGasPrices(chainId, blockchainAdapter);

    // Get quote
    const quote = await dexAdapter.getQuote({
      inputAsset: trade.inputAsset,
      outputAsset: trade.outputAsset,
      inputAmount: trade.inputAmount,
      slippageTolerance: this.config.defaultSlippageTolerance || 0.5,
      walletAddress: wallet.address,
    });

    // Update expected output amount
    trade.expectedOutputAmount = quote.outputAmount;

    // Execute swap
    const transactionHash = await dexAdapter.executeSwap({
      inputAsset: trade.inputAsset,
      outputAsset: trade.outputAsset,
      inputAmount: trade.inputAmount,
      slippageTolerance: this.config.defaultSlippageTolerance || 0.5,
      walletAddress: wallet.address,
      quote,
      wallet,
    });

    // Wait for confirmation
    const receipt = await blockchainAdapter.waitForConfirmation(transactionHash);

    // Update trade status
    if (receipt.status === 'success') {
      trade.status = TradeStatus.COMPLETED;
      trade.executedAt = new Date();
      trade.actualOutputAmount = quote.outputAmount;
      trade.targetChain = chainId; // Update to actual execution chain
    } else {
      trade.status = TradeStatus.FAILED;
    }

    return {
      trade,
      success: trade.status === TradeStatus.COMPLETED,
      transactionId: transactionHash,
      error: trade.status === TradeStatus.FAILED ? new Error("Transaction failed") : undefined,
    };
  }

  /**
   * Try executing on alternative chains
   */
  private async tryAlternativeChains(trade: IMultiChainTrade): Promise<TradeResult> {
    if (!trade.alternativeChains || trade.alternativeChains.length === 0) {
      throw new Error("No alternative chains available");
    }

    for (const chainId of trade.alternativeChains) {
      try {
        console.log(`Trying alternative chain: ${chainId}`);
        return await this.executeOnChain(trade, chainId);
      } catch (error) {
        console.warn(`Execution failed on alternative chain ${chainId}:`, error);
        continue;
      }
    }

    throw new Error("Execution failed on all available chains");
  }

  /**
   * Select optimal chain for trade execution
   */
  private async selectOptimalChain(params: CreateTradeParams): Promise<ChainId> {
    // If both assets are on the same chain, use that chain
    if (params.inputAsset.chainId === params.outputAsset.chainId) {
      return params.inputAsset.chainId;
    }

    // For cross-chain trades, use preferred chains or the input asset's chain
    for (const chainId of this.config.preferredChains || []) {
      if (this.multiChainConfig.enabledChains.includes(chainId)) {
        // Check if this chain can handle both assets (through bridges or native support)
        const canHandle = await this.canChainHandleTrade(chainId, params);
        if (canHandle) {
          return chainId;
        }
      }
    }

    // Fallback to input asset's chain
    return params.inputAsset.chainId;
  }

  /**
   * Get alternative chains that could execute this trade
   */
  private async getAlternativeChains(params: CreateTradeParams): Promise<ChainId[]> {
    const alternatives: ChainId[] = [];
    
    for (const chainId of this.multiChainConfig.enabledChains) {
      if (chainId !== params.inputAsset.chainId && 
          await this.canChainHandleTrade(chainId, params)) {
        alternatives.push(chainId);
      }
    }

    return alternatives;
  }

  /**
   * Check if a chain can handle a specific trade
   */
  private async canChainHandleTrade(chainId: ChainId, params: CreateTradeParams): Promise<boolean> {
    try {
      const chainProvider = this.chainProviders[chainId];
      const dexAdapter = chainProvider.createDEXAdapter();
      const supportedTokens = await dexAdapter.getSupportedTokens();
      
      // Check if both assets are supported (either natively or through bridges)
      const inputSupported = supportedTokens.some(token => 
        token.symbol === params.inputAsset.symbol || 
        params.inputAsset.bridgeAddresses?.[chainId]
      );
      
      const outputSupported = supportedTokens.some(token => 
        token.symbol === params.outputAsset.symbol ||
        params.outputAsset.bridgeAddresses?.[chainId]
      );

      return inputSupported && outputSupported;
    } catch (error) {
      console.warn(`Error checking chain ${chainId} compatibility:`, error);
      return false;
    }
  }

  /**
   * Validate gas prices before execution
   */
  private async validateGasPrices(chainId: ChainId, adapter: IUniversalBlockchainAdapter): Promise<void> {
    const maxGasPrice = this.config.maxGasPrices?.[chainId];
    if (!maxGasPrice) return;

    const currentGasPrice = await adapter.getGasPrice();
    if (currentGasPrice > maxGasPrice) {
      throw new Error(`Gas price too high on ${chainId}: ${currentGasPrice} > ${maxGasPrice}`);
    }
  }

  /**
   * Cancels a trade
   */
  public async cancelTrade(tradeId: string): Promise<boolean> {
    try {
      const trade = this.activeTrades.get(tradeId);

      if (!trade) {
        throw new Error(`Trade with ID ${tradeId} not found`);
      }

      if (trade.status !== TradeStatus.PENDING && trade.status !== TradeStatus.ACTIVE) {
        throw new Error(`Trade with ID ${tradeId} cannot be cancelled`);
      }

      trade.status = TradeStatus.CANCELLED;
      return true;
    } catch (error: any) {
      console.error("Error cancelling trade:", error);
      return false;
    }
  }

  /**
   * Gets a trade by ID
   */
  public async getTrade(tradeId: string): Promise<ITrade> {
    const trade = this.activeTrades.get(tradeId);

    if (!trade) {
      throw new Error(`Trade with ID ${tradeId} not found`);
    }

    return trade;
  }

  /**
   * Lists all active trades
   */
  public async listActiveTrades(): Promise<ITrade[]> {
    return Array.from(this.activeTrades.values()).filter(
      (trade) =>
        trade.status === TradeStatus.PENDING ||
        trade.status === TradeStatus.ACTIVE
    );
  }

  /**
   * Get cross-chain arbitrage opportunities
   */
  public async findArbitrageOpportunities(): Promise<any[]> {
    if (!this.config.enableCrossChainArbitrage) {
      return [];
    }

    // Implementation for cross-chain arbitrage detection
    // This would compare prices across different chains and identify profitable opportunities
    // considering bridge fees and execution costs
    
    return []; // Placeholder
  }

  /**
   * Get chain statistics
   */
  public async getChainStatistics(): Promise<Record<ChainId, any>> {
    const stats: Record<string, any> = {};

    for (const [chainId, provider] of Object.entries(this.chainProviders)) {
      try {
        const adapter = provider.createBlockchainAdapter();
        const gasPrice = await adapter.getGasPrice();
        
        stats[chainId] = {
          gasPrice: gasPrice.toString(),
          isHealthy: true,
          lastChecked: new Date(),
        };
      } catch (error) {
        stats[chainId] = {
          gasPrice: null,
          isHealthy: false,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return stats as Record<ChainId, any>;
  }
}