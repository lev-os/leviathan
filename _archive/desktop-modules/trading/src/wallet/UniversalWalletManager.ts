import { v4 as uuidv4 } from "uuid";
import {
  ChainId,
  IUniversalWallet,
  IUniversalTransaction,
  ITradableAsset,
  IMultiChainConfig,
} from '../domain/multi-chain-interfaces';
import {
  IWallet,
  IWalletStorageProvider,
  IWalletEncryptionProvider,
} from "./interfaces";
import { ChainProviderFactory } from '../adapters/factories/ChainProviderFactory';

/**
 * Multi-chain wallet interface
 */
export interface IMultiChainWallet extends IWallet {
  /** Supported chains for this wallet */
  supportedChains: ChainId[];
  /** Chain-specific addresses */
  addresses: Record<ChainId, string>;
  /** Encrypted private keys per chain */
  encryptedPrivateKeys: Record<ChainId, Uint8Array>;
}

/**
 * Configuration for the universal wallet manager
 */
export interface UniversalWalletManagerConfig {
  defaultWalletNamePrefix?: string;
  autoCreateWallet?: boolean;
  defaultChains?: ChainId[];
}

/**
 * Universal wallet manager supporting multiple blockchains
 */
export class UniversalWalletManager {
  private storageProvider: IWalletStorageProvider;
  private encryptionProvider: IWalletEncryptionProvider;
  private config: UniversalWalletManagerConfig;
  private multiChainConfig: IMultiChainConfig;
  private walletCache: Map<string, Record<ChainId, IUniversalWallet>> = new Map();

  constructor(
    storageProvider: IWalletStorageProvider,
    encryptionProvider: IWalletEncryptionProvider,
    multiChainConfig: IMultiChainConfig,
    config: UniversalWalletManagerConfig = {}
  ) {
    this.storageProvider = storageProvider;
    this.encryptionProvider = encryptionProvider;
    this.multiChainConfig = multiChainConfig;
    this.config = {
      defaultWalletNamePrefix: "MultiChain Wallet",
      autoCreateWallet: true,
      defaultChains: ['solana', 'ethereum', 'arbitrum'],
      ...config,
    };
  }

  /**
   * Creates a new multi-chain wallet
   */
  public async createMultiChainWallet(
    name?: string,
    chains: ChainId[] = this.config.defaultChains || ['solana', 'ethereum'],
    metadata: Record<string, any> = {}
  ): Promise<IMultiChainWallet> {
    const walletId = uuidv4();
    const walletName = name || `${this.config.defaultWalletNamePrefix} ${new Date().toISOString()}`;
    
    const addresses: Record<ChainId, string> = {} as Record<ChainId, string>;
    const encryptedPrivateKeys: Record<ChainId, Uint8Array> = {} as Record<ChainId, Uint8Array>;
    const chainWallets: Record<ChainId, IUniversalWallet> = {} as Record<ChainId, IUniversalWallet>;

    // Create wallet for each supported chain
    for (const chainId of chains) {
      const chainProvider = ChainProviderFactory.create(chainId, this.multiChainConfig);
      const chainWallet = await chainProvider.createWallet();
      
      addresses[chainId] = chainWallet.address;
      chainWallets[chainId] = chainWallet;
      
      // Extract and encrypt the private key
      const privateKeyData = await this.extractPrivateKey(chainWallet);
      encryptedPrivateKeys[chainId] = await this.encryptionProvider.encryptPrivateKey(privateKeyData);
    }

    const multiChainWallet: IMultiChainWallet = {
      id: walletId,
      name: walletName,
      address: addresses[chains[0]], // Primary address from first chain
      encryptedPrivateKey: encryptedPrivateKeys[chains[0]], // Primary key
      supportedChains: chains,
      addresses,
      encryptedPrivateKeys,
      createdAt: new Date(),
      lastUsed: new Date(),
      metadata,
    };

    // Save the wallet
    await this.storageProvider.saveWallet(multiChainWallet);
    
    // Cache the chain wallets
    this.walletCache.set(walletId, chainWallets);

    return multiChainWallet;
  }

  /**
   * Gets a universal wallet for a specific chain
   */
  public async getChainWallet(walletId: string, chainId: ChainId): Promise<IUniversalWallet> {
    // Check cache first
    const cachedWallets = this.walletCache.get(walletId);
    if (cachedWallets && cachedWallets[chainId]) {
      return cachedWallets[chainId];
    }

    // Load from storage
    const multiChainWallet = await this.getMultiChainWallet(walletId);
    
    if (!multiChainWallet.supportedChains.includes(chainId)) {
      throw new Error(`Wallet ${walletId} does not support chain ${chainId}`);
    }

    // Decrypt private key and recreate wallet
    const encryptedKey = multiChainWallet.encryptedPrivateKeys[chainId];
    const privateKey = await this.encryptionProvider.decryptPrivateKey(encryptedKey);
    
    const chainProvider = ChainProviderFactory.create(chainId, this.multiChainConfig);
    const chainWallet = await chainProvider.createWallet(this.formatPrivateKey(privateKey, chainId));

    // Cache the wallet
    if (!this.walletCache.has(walletId)) {
      this.walletCache.set(walletId, {} as Record<ChainId, IUniversalWallet>);
    }
    this.walletCache.get(walletId)![chainId] = chainWallet;

    return chainWallet;
  }

  /**
   * Gets a multi-chain wallet by ID
   */
  public async getMultiChainWallet(id: string): Promise<IMultiChainWallet> {
    const wallet = await this.storageProvider.getWallet(id) as IMultiChainWallet;
    
    if (!wallet) {
      throw new Error(`Wallet with ID ${id} not found`);
    }

    // Update last used
    wallet.lastUsed = new Date();
    await this.storageProvider.saveWallet(wallet);

    return wallet;
  }

  /**
   * Signs a universal transaction
   */
  public async signTransaction(
    transaction: IUniversalTransaction,
    walletId: string
  ): Promise<string> {
    const chainWallet = await this.getChainWallet(walletId, transaction.chainId);
    return chainWallet.signTransaction(transaction);
  }

  /**
   * Gets balances across all supported chains
   */
  public async getAllBalances(walletId: string): Promise<Record<ChainId, bigint>> {
    const multiChainWallet = await this.getMultiChainWallet(walletId);
    const balances: Record<string, bigint> = {};

    await Promise.all(
      multiChainWallet.supportedChains.map(async (chainId) => {
        try {
          const chainWallet = await this.getChainWallet(walletId, chainId);
          balances[chainId] = await chainWallet.getBalance();
        } catch (error) {
          console.warn(`Failed to get balance for chain ${chainId}:`, error);
          balances[chainId] = BigInt(0);
        }
      })
    );

    return balances as Record<ChainId, bigint>;
  }

  /**
   * Gets token balance for specific asset
   */
  public async getTokenBalance(
    walletId: string,
    asset: ITradableAsset
  ): Promise<bigint> {
    const chainWallet = await this.getChainWallet(walletId, asset.chainId);
    return chainWallet.getTokenBalance(asset);
  }

  /**
   * Lists all multi-chain wallets
   */
  public async listWallets(): Promise<IMultiChainWallet[]> {
    const wallets = await this.storageProvider.listWallets();
    return wallets.filter(w => 'supportedChains' in w) as IMultiChainWallet[];
  }

  /**
   * Gets the default multi-chain wallet
   */
  public async getDefaultWallet(): Promise<IMultiChainWallet> {
    const wallets = await this.listWallets();

    if (wallets.length === 0 && this.config.autoCreateWallet) {
      return this.createMultiChainWallet();
    }

    if (wallets.length === 0) {
      throw new Error("No wallets found and auto-create is disabled");
    }

    return wallets.sort(
      (a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
    )[0];
  }

  /**
   * Adds support for a new chain to existing wallet
   */
  public async addChainSupport(walletId: string, chainId: ChainId): Promise<void> {
    const multiChainWallet = await this.getMultiChainWallet(walletId);
    
    if (multiChainWallet.supportedChains.includes(chainId)) {
      return; // Already supported
    }

    // Create new wallet for the chain
    const chainProvider = ChainProviderFactory.create(chainId, this.multiChainConfig);
    const chainWallet = await chainProvider.createWallet();
    
    // Update the multi-chain wallet
    multiChainWallet.supportedChains.push(chainId);
    multiChainWallet.addresses[chainId] = chainWallet.address;
    
    const privateKeyData = await this.extractPrivateKey(chainWallet);
    multiChainWallet.encryptedPrivateKeys[chainId] = await this.encryptionProvider.encryptPrivateKey(privateKeyData);

    // Save updated wallet
    await this.storageProvider.saveWallet(multiChainWallet);
    
    // Update cache
    if (this.walletCache.has(walletId)) {
      this.walletCache.get(walletId)![chainId] = chainWallet;
    }
  }

  /**
   * Extract private key from chain-specific wallet (implementation depends on chain)
   */
  private async extractPrivateKey(wallet: IUniversalWallet): Promise<Uint8Array> {
    // This would need to be implemented based on the specific wallet type
    // For now, we'll throw an error indicating this needs chain-specific implementation
    throw new Error('Private key extraction not implemented for this wallet type');
  }

  /**
   * Format private key for specific chain
   */
  private formatPrivateKey(privateKey: Uint8Array, chainId: ChainId): string {
    switch (chainId) {
      case 'solana':
        return Buffer.from(privateKey).toString('base64');
      case 'ethereum':
      case 'arbitrum':
      case 'base':
      case 'polygon':
      case 'avalanche':
        return '0x' + Buffer.from(privateKey).toString('hex');
      default:
        throw new Error(`Unsupported chain: ${chainId}`);
    }
  }
}