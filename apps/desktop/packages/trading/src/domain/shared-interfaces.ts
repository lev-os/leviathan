/**
 * Supported blockchain networks
 */
export type ChainId = 
  | 'solana' 
  | 'ethereum' 
  | 'arbitrum' 
  | 'base' 
  | 'polygon'
  | 'avalanche';

/**
 * Chain-specific network configuration
 */
export interface ChainConfig {
  chainId: ChainId;
  name: string;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  isTestnet?: boolean;
}

/**
 * Base interface for all tradable assets
 */
export interface ITradableAsset {
  symbol: string;
  address: string;
  decimals: number;
  chainId: ChainId;
  /** @deprecated Use chainId instead */
  network?: string;
  /** Cross-chain bridge addresses for multi-chain support */
  bridgeAddresses?: Partial<Record<ChainId, string>>;
  /** Token standard (ERC20, SPL, etc.) */
  standard?: string;
  /** Coingecko ID for price tracking */
  coingeckoId?: string;
}
