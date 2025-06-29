import { ChainId, IMultiChainConfig, ChainConfig } from '../domain/multi-chain-interfaces';

/**
 * Default configurations for supported chains
 */
const DEFAULT_CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  solana: {
    chainId: 'solana',
    name: 'Solana',
    nativeCurrency: { symbol: 'SOL', decimals: 9 },
    rpcUrls: [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
    ],
    blockExplorerUrls: ['https://explorer.solana.com'],
    supportedDEXs: ['jupiter'],
  },
  ethereum: {
    chainId: 'ethereum',
    name: 'Ethereum',
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com',
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    supportedDEXs: ['uniswap', 'sushiswap', '1inch'],
  },
  arbitrum: {
    chainId: 'arbitrum',
    name: 'Arbitrum One',
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
    ],
    blockExplorerUrls: ['https://arbiscan.io'],
    supportedDEXs: ['camelot', 'uniswap', 'sushiswap'],
  },
  base: {
    chainId: 'base',
    name: 'Base',
    nativeCurrency: { symbol: 'ETH', decimals: 18 },
    rpcUrls: [
      'https://mainnet.base.org',
      'https://rpc.ankr.com/base',
    ],
    blockExplorerUrls: ['https://basescan.org'],
    supportedDEXs: ['baseswap', 'uniswap'],
  },
  polygon: {
    chainId: 'polygon',
    name: 'Polygon',
    nativeCurrency: { symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc.ankr.com/polygon',
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
    supportedDEXs: ['quickswap', 'sushiswap', 'uniswap'],
  },
  avalanche: {
    chainId: 'avalanche',
    name: 'Avalanche',
    nativeCurrency: { symbol: 'AVAX', decimals: 18 },
    rpcUrls: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
    ],
    blockExplorerUrls: ['https://snowtrace.io'],
    supportedDEXs: ['traderjoe', 'pangolin'],
  },
};

/**
 * Environment variable mappings for configuration
 */
interface EnvConfig {
  // RPC URLs
  SOLANA_RPC_URL?: string;
  ETHEREUM_RPC_URL?: string;
  ARBITRUM_RPC_URL?: string;
  BASE_RPC_URL?: string;
  POLYGON_RPC_URL?: string;
  AVALANCHE_RPC_URL?: string;
  
  // API Keys
  JUPITER_API_KEY?: string;
  UNISWAP_API_KEY?: string;
  CHAINLINK_API_KEY?: string;
  
  // Default configuration
  DEFAULT_CHAIN?: string;
  ENABLED_CHAINS?: string;
  
  // Testnet configurations
  USE_TESTNET?: string;
  SOLANA_DEVNET_RPC_URL?: string;
  ETHEREUM_SEPOLIA_RPC_URL?: string;
}

/**
 * Multi-chain configuration manager
 */
export class MultiChainConfigManager {
  private config: IMultiChainConfig;
  private env: EnvConfig;

  constructor(envOverrides: Partial<EnvConfig> = {}) {
    this.env = {
      ...process.env,
      ...envOverrides,
    } as EnvConfig;
    
    this.config = this.buildConfiguration();
  }

  /**
   * Get the complete multi-chain configuration
   */
  public getConfig(): IMultiChainConfig {
    return this.config;
  }

  /**
   * Get configuration for a specific chain
   */
  public getChainConfig(chainId: ChainId): ChainConfig {
    const config = this.config.chainConfigs[chainId];
    if (!config) {
      throw new Error(`No configuration found for chain: ${chainId}`);
    }
    return config;
  }

  /**
   * Get the default chain
   */
  public getDefaultChain(): ChainId {
    return this.config.defaultChain;
  }

  /**
   * Get enabled chains
   */
  public getEnabledChains(): ChainId[] {
    return this.config.enabledChains;
  }

  /**
   * Check if a chain is enabled
   */
  public isChainEnabled(chainId: ChainId): boolean {
    return this.config.enabledChains.includes(chainId);
  }

  /**
   * Get DEX preferences for a chain
   */
  public getDEXPreferences(chainId: ChainId): string[] {
    return this.config.dexPreferences[chainId] || [];
  }

  /**
   * Update configuration for a specific chain
   */
  public updateChainConfig(chainId: ChainId, updates: Partial<ChainConfig>): void {
    this.config.chainConfigs[chainId] = {
      ...this.config.chainConfigs[chainId],
      ...updates,
    };
  }

  /**
   * Add or update environment variable
   */
  public updateEnv(key: keyof EnvConfig, value: string): void {
    this.env[key] = value;
    this.config = this.buildConfiguration();
  }

  /**
   * Build the configuration from environment variables and defaults
   */
  private buildConfiguration(): IMultiChainConfig {
    const enabledChainsStr = this.env.ENABLED_CHAINS || 'solana,ethereum,arbitrum,base';
    const enabledChains = enabledChainsStr.split(',').map(c => c.trim()) as ChainId[];
    
    const defaultChain = (this.env.DEFAULT_CHAIN as ChainId) || 'solana';
    const useTestnet = this.env.USE_TESTNET === 'true';

    // Build chain configurations
    const chainConfigs: Record<ChainId, ChainConfig> = {};
    
    for (const chainId of enabledChains) {
      chainConfigs[chainId] = this.buildChainConfig(chainId, useTestnet);
    }

    return {
      defaultChain,
      enabledChains,
      chainConfigs,
      dexPreferences: this.buildDEXPreferences(),
    };
  }

  /**
   * Build configuration for a specific chain
   */
  private buildChainConfig(chainId: ChainId, useTestnet: boolean): ChainConfig {
    const defaultConfig = DEFAULT_CHAIN_CONFIGS[chainId];
    const envRpcUrl = this.getEnvRpcUrl(chainId, useTestnet);

    let rpcUrls = defaultConfig.rpcUrls;
    if (envRpcUrl) {
      rpcUrls = [envRpcUrl, ...defaultConfig.rpcUrls];
    }

    return {
      ...defaultConfig,
      rpcUrls,
      isTestnet: useTestnet,
    };
  }

  /**
   * Get RPC URL from environment variables
   */
  private getEnvRpcUrl(chainId: ChainId, useTestnet: boolean): string | undefined {
    if (useTestnet) {
      switch (chainId) {
        case 'solana':
          return this.env.SOLANA_DEVNET_RPC_URL;
        case 'ethereum':
          return this.env.ETHEREUM_SEPOLIA_RPC_URL;
        default:
          return undefined;
      }
    }

    switch (chainId) {
      case 'solana':
        return this.env.SOLANA_RPC_URL;
      case 'ethereum':
        return this.env.ETHEREUM_RPC_URL;
      case 'arbitrum':
        return this.env.ARBITRUM_RPC_URL;
      case 'base':
        return this.env.BASE_RPC_URL;
      case 'polygon':
        return this.env.POLYGON_RPC_URL;
      case 'avalanche':
        return this.env.AVALANCHE_RPC_URL;
      default:
        return undefined;
    }
  }

  /**
   * Build DEX preferences from configuration
   */
  private buildDEXPreferences(): Record<ChainId, string[]> {
    return {
      solana: ['jupiter'],
      ethereum: ['uniswap', 'sushiswap', '1inch'],
      arbitrum: ['camelot', 'uniswap'],
      base: ['baseswap', 'uniswap'],
      polygon: ['quickswap', 'sushiswap'],
      avalanche: ['traderjoe', 'pangolin'],
    };
  }

  /**
   * Create a testnet configuration
   */
  public static createTestnetConfig(overrides: Partial<EnvConfig> = {}): MultiChainConfigManager {
    return new MultiChainConfigManager({
      USE_TESTNET: 'true',
      ENABLED_CHAINS: 'solana,ethereum',
      DEFAULT_CHAIN: 'solana',
      SOLANA_DEVNET_RPC_URL: 'https://api.devnet.solana.com',
      ETHEREUM_SEPOLIA_RPC_URL: 'https://rpc.sepolia.org',
      ...overrides,
    });
  }

  /**
   * Create a mainnet configuration
   */
  public static createMainnetConfig(overrides: Partial<EnvConfig> = {}): MultiChainConfigManager {
    return new MultiChainConfigManager({
      USE_TESTNET: 'false',
      ENABLED_CHAINS: 'solana,ethereum,arbitrum,base',
      DEFAULT_CHAIN: 'solana',
      ...overrides,
    });
  }
}