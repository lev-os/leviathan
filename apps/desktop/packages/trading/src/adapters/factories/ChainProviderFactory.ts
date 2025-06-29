import { ChainId, IChainProvider, IMultiChainConfig } from '../../domain/multi-chain-interfaces';
import { SolanaChainProvider } from '../blockchain/providers/SolanaChainProvider';
import { EthereumChainProvider } from '../blockchain/providers/EthereumChainProvider';
import { ArbitrumChainProvider } from '../blockchain/providers/ArbitrumChainProvider';
import { BaseChainProvider } from '../blockchain/providers/BaseChainProvider';

/**
 * Factory for creating chain-specific providers
 */
export class ChainProviderFactory {
  private static providers: Record<ChainId, new (config: IMultiChainConfig) => IChainProvider> = {
    solana: SolanaChainProvider,
    ethereum: EthereumChainProvider,
    arbitrum: ArbitrumChainProvider,
    base: BaseChainProvider,
    polygon: EthereumChainProvider, // Uses same provider as Ethereum
    avalanche: EthereumChainProvider, // Uses same provider as Ethereum
  };

  /**
   * Create a chain provider for the specified chain
   */
  static create(chainId: ChainId, config: IMultiChainConfig): IChainProvider {
    const ProviderClass = this.providers[chainId];
    if (!ProviderClass) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    return new ProviderClass(config);
  }

  /**
   * Get all supported chains
   */
  static getSupportedChains(): ChainId[] {
    return Object.keys(this.providers) as ChainId[];
  }

  /**
   * Check if a chain is supported
   */
  static isChainSupported(chainId: string): chainId is ChainId {
    return chainId in this.providers;
  }

  /**
   * Register a custom chain provider
   */
  static registerProvider(
    chainId: ChainId, 
    providerClass: new (config: IMultiChainConfig) => IChainProvider
  ): void {
    this.providers[chainId] = providerClass;
  }
}

/**
 * Multi-chain adapter factory for creating multiple providers
 */
export class MultiChainAdapterFactory {
  constructor(private config: IMultiChainConfig) {}

  /**
   * Create providers for all enabled chains
   */
  createAllProviders(): Record<ChainId, IChainProvider> {
    const providers: Record<string, IChainProvider> = {};
    
    for (const chainId of this.config.enabledChains) {
      providers[chainId] = ChainProviderFactory.create(chainId, this.config);
    }
    
    return providers as Record<ChainId, IChainProvider>;
  }

  /**
   * Create provider for specific chain
   */
  createProvider(chainId: ChainId): IChainProvider {
    if (!this.config.enabledChains.includes(chainId)) {
      throw new Error(`Chain ${chainId} is not enabled in configuration`);
    }
    
    return ChainProviderFactory.create(chainId, this.config);
  }

  /**
   * Get the default chain provider
   */
  getDefaultProvider(): IChainProvider {
    return this.createProvider(this.config.defaultChain);
  }
}