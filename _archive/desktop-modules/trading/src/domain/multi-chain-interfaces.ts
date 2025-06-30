import { ChainId, ITradableAsset } from './shared-interfaces';

/**
 * Universal transaction interface for cross-chain compatibility
 */
export interface IUniversalTransaction {
  chainId: ChainId;
  to: string;
  value?: bigint;
  data?: string | any;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  /** Chain-specific transaction fields */
  chainSpecific?: Record<string, any>;
}

/**
 * Universal wallet interface for cross-chain compatibility
 */
export interface IUniversalWallet {
  chainId: ChainId;
  address: string;
  /** Sign a transaction */
  signTransaction(tx: IUniversalTransaction): Promise<string>;
  /** Sign arbitrary data */
  signMessage(message: string): Promise<string>;
  /** Get native token balance */
  getBalance(): Promise<bigint>;
  /** Get token balance for specific asset */
  getTokenBalance(asset: ITradableAsset): Promise<bigint>;
}

/**
 * Universal blockchain adapter interface
 */
export interface IUniversalBlockchainAdapter {
  chainId: ChainId;
  /** Send a signed transaction */
  sendTransaction(signedTx: string): Promise<string>;
  /** Get transaction receipt */
  getTransactionReceipt(txHash: string): Promise<ITransactionReceipt>;
  /** Estimate gas for transaction */
  estimateGas(tx: IUniversalTransaction): Promise<bigint>;
  /** Get current gas price */
  getGasPrice(): Promise<bigint>;
  /** Wait for transaction confirmation */
  waitForConfirmation(txHash: string, confirmations?: number): Promise<ITransactionReceipt>;
}

/**
 * Universal DEX adapter interface
 */
export interface IUniversalDEXAdapter {
  chainId: ChainId;
  /** Get quote for token swap */
  getQuote(params: IUniversalQuoteParams): Promise<IUniversalQuoteResult>;
  /** Execute token swap */
  executeSwap(params: IUniversalSwapParams): Promise<string>;
  /** Get supported tokens */
  getSupportedTokens(): Promise<ITradableAsset[]>;
}

/**
 * Universal quote parameters
 */
export interface IUniversalQuoteParams {
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  slippageTolerance: number;
  walletAddress: string;
}

/**
 * Universal quote result
 */
export interface IUniversalQuoteResult {
  inputAmount: bigint;
  outputAmount: bigint;
  minimumOutputAmount: bigint;
  price: number;
  priceImpact: number;
  fees: ISwapFees;
  route: any; // DEX-specific route data
  validUntil: Date;
  chainId: ChainId;
}

/**
 * Universal swap parameters
 */
export interface IUniversalSwapParams extends IUniversalQuoteParams {
  quote: IUniversalQuoteResult;
  wallet: IUniversalWallet;
  deadline?: Date;
}

/**
 * Swap fees breakdown
 */
export interface ISwapFees {
  platformFee?: bigint;
  liquidityProviderFee?: bigint;
  gasFee?: bigint;
  totalFeeUSD?: number;
}

/**
 * Transaction receipt
 */
export interface ITransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  gasUsed: bigint;
  effectiveGasPrice?: bigint;
  status: 'success' | 'failed' | 'pending';
  logs?: any[];
  confirmations: number;
}

/**
 * Chain provider interface
 */
export interface IChainProvider {
  chainId: ChainId;
  createBlockchainAdapter(): IUniversalBlockchainAdapter;
  createDEXAdapter(): IUniversalDEXAdapter;
  createWallet(privateKey?: string): Promise<IUniversalWallet>;
  getChainConfig(): ChainConfig;
}

/**
 * Chain configuration with network details
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
  supportedDEXs: string[];
  isTestnet?: boolean;
}

/**
 * Multi-chain configuration
 */
export interface IMultiChainConfig {
  defaultChain: ChainId;
  enabledChains: ChainId[];
  chainConfigs: Record<ChainId, ChainConfig>;
  dexPreferences: Record<ChainId, string[]>;
  bridgeConfigs?: Record<string, IBridgeConfig>;
}

/**
 * Bridge configuration for cross-chain transfers
 */
export interface IBridgeConfig {
  name: string;
  supportedChains: ChainId[];
  fees: Record<string, number>;
  estimatedTime: Record<string, number>; // in minutes
}