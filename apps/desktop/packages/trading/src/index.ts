// Import types needed for the createTradingPackage function
import { IBlockchainAdapter } from "@/adapters/blockchain/interfaces";
import { IDEXAdapter } from "@/adapters/dex/interfaces";
import { IPriceOracleAdapter } from "@/adapters/price/interfaces";
import { TradingEngine, TradingEngineConfig } from "@/core/TradingEngine";
import { MultiChainTradingEngine, MultiChainTradingEngineConfig } from "@/core/MultiChainTradingEngine";
import { StrategyEngine } from "@/core/StrategyEngine";
import { StrategyFactory } from "@/strategies/StrategyFactory";
import { WalletManager, WalletManagerConfig } from "@/wallet/WalletManager";
import { UniversalWalletManager, UniversalWalletManagerConfig } from "@/wallet/UniversalWalletManager";
import { MultiChainConfigManager } from "@/config/MultiChainConfigManager";
import {
  IWalletStorageProvider,
  IWalletEncryptionProvider,
} from "@/wallet/interfaces";

// Domain exports
export * from "@/domain/enums";
export * from "@/domain/interfaces";
export * from "@/domain/multi-chain-interfaces";

// Core exports
export { TradingEngine, TradingEngineConfig } from "@/core/TradingEngine";
export { MultiChainTradingEngine, MultiChainTradingEngineConfig } from "@/core/MultiChainTradingEngine";
export { StrategyEngine, IStrategyEngine } from "@/core/StrategyEngine";

// Multi-chain exports
export { MultiChainConfigManager } from "@/config/MultiChainConfigManager";
export { UniversalWalletManager, UniversalWalletManagerConfig } from "@/wallet/UniversalWalletManager";
export { ChainProviderFactory, MultiChainAdapterFactory } from "@/adapters/factories/ChainProviderFactory";

// Strategy exports
export { BaseStrategy } from "@/strategies/BaseStrategy";
export { PriceTargetStrategy } from "@/strategies/PriceTargetStrategy";
export {
  StrategyFactory,
  IStrategyFactory,
} from "@/strategies/StrategyFactory";

// Blockchain adapter exports
export {
  IBlockchainAdapter,
  BlockchainAdapterConfig,
} from "@/adapters/blockchain/interfaces";
export {
  SolanaAdapter,
  SolanaAdapterConfig,
} from "@/adapters/blockchain/SolanaAdapter";

// DEX adapter exports
export { IDEXAdapter, DEXAdapterConfig } from "@/adapters/dex/interfaces";
export {
  JupiterAdapter,
  JupiterAdapterConfig,
} from "@/adapters/dex/JupiterAdapter";

// Price oracle adapter exports
export {
  IPriceOracleAdapter,
  PriceOracleAdapterConfig,
} from "@/adapters/price/interfaces";
export {
  MoralisAdapter,
  MoralisAdapterConfig,
} from "@/adapters/price/MoralisAdapter";

// Wallet exports
export * from "@/wallet";

/**
 * Creates a new trading package instance with the specified adapters
 * @param blockchainAdapter Adapter for blockchain interactions
 * @param dexAdapter Adapter for DEX interactions
 * @param priceOracleAdapter Adapter for price data
 * @param config Configuration for the trading engine
 * @returns Trading engine instance
 */
export function createTradingPackage(
  blockchainAdapter: IBlockchainAdapter,
  dexAdapter: IDEXAdapter,
  priceOracleAdapter: IPriceOracleAdapter,
  walletStorageProvider?: IWalletStorageProvider,
  walletEncryptionProvider?: IWalletEncryptionProvider,
  tradingEngineConfig?: TradingEngineConfig,
  walletManagerConfig?: WalletManagerConfig
) {
  // Create strategy factory
  const strategyFactory = new StrategyFactory();

  // Create strategy engine
  const strategyEngine = new StrategyEngine(strategyFactory);

  // Create wallet manager if providers are available
  let walletManager: WalletManager | undefined;
  if (walletStorageProvider && walletEncryptionProvider) {
    walletManager = new WalletManager(
      walletStorageProvider,
      walletEncryptionProvider,
      walletManagerConfig
    );
  }

  // Create trading engine
  const tradingEngine = new TradingEngine(
    blockchainAdapter,
    dexAdapter,
    priceOracleAdapter,
    strategyEngine,
    walletManager,
    tradingEngineConfig
  );

  return {
    tradingEngine,
    strategyEngine,
    strategyFactory,
    walletManager,
  };
}

/**
 * Creates a new multi-chain trading package instance
 * @param configManager Multi-chain configuration manager
 * @param walletStorageProvider Wallet storage provider
 * @param walletEncryptionProvider Wallet encryption provider
 * @param tradingEngineConfig Multi-chain trading engine configuration
 * @param walletManagerConfig Universal wallet manager configuration
 * @returns Multi-chain trading engine instance
 */
export function createMultiChainTradingPackage(
  configManager: MultiChainConfigManager,
  walletStorageProvider: IWalletStorageProvider,
  walletEncryptionProvider: IWalletEncryptionProvider,
  tradingEngineConfig?: MultiChainTradingEngineConfig,
  walletManagerConfig?: UniversalWalletManagerConfig
) {
  // Get multi-chain configuration
  const multiChainConfig = configManager.getConfig();

  // Create strategy factory
  const strategyFactory = new StrategyFactory();

  // Create strategy engine
  const strategyEngine = new StrategyEngine(strategyFactory);

  // Create universal wallet manager
  const walletManager = new UniversalWalletManager(
    walletStorageProvider,
    walletEncryptionProvider,
    multiChainConfig,
    walletManagerConfig
  );

  // Create multi-chain trading engine
  const tradingEngine = new MultiChainTradingEngine(
    multiChainConfig,
    strategyEngine,
    walletManager,
    tradingEngineConfig
  );

  return {
    tradingEngine,
    strategyEngine,
    strategyFactory,
    walletManager,
    configManager,
    multiChainConfig,
  };
}
