import { Keypair, Transaction } from "@solana/web3.js";
import { v4 as uuidv4 } from "uuid";
import {
  IWallet,
  IWalletManager,
  IWalletStorageProvider,
  IWalletEncryptionProvider,
} from "@/wallet/interfaces";

/**
 * Configuration for the wallet manager
 */
export interface WalletManagerConfig {
  /**
   * Default wallet name prefix
   */
  defaultWalletNamePrefix?: string;

  /**
   * Whether to auto-create a wallet if none exists
   */
  autoCreateWallet?: boolean;
}

/**
 * Manages wallets for the trading system
 */
export class WalletManager implements IWalletManager {
  private storageProvider: IWalletStorageProvider;
  private encryptionProvider: IWalletEncryptionProvider;
  private config: WalletManagerConfig;
  private keypairCache: Map<string, Keypair> = new Map();

  /**
   * Creates a new wallet manager
   * @param storageProvider Provider for wallet storage
   * @param encryptionProvider Provider for wallet encryption
   * @param config Configuration for the wallet manager
   */
  constructor(
    storageProvider: IWalletStorageProvider,
    encryptionProvider: IWalletEncryptionProvider,
    config: WalletManagerConfig = {}
  ) {
    this.storageProvider = storageProvider;
    this.encryptionProvider = encryptionProvider;
    this.config = {
      defaultWalletNamePrefix: "Wallet",
      autoCreateWallet: true,
      ...config,
    };
  }

  /**
   * Creates a new wallet
   * @param name Name for the wallet
   * @param metadata Additional metadata for the wallet
   * @returns Created wallet
   */
  public async createWallet(
    name: string = `${
      this.config.defaultWalletNamePrefix
    } ${new Date().toISOString()}`,
    metadata: Record<string, any> = {}
  ): Promise<IWallet> {
    // Generate a new keypair
    const keypair = Keypair.generate();

    // Get the address and private key
    const address = keypair.publicKey.toBase58();
    const privateKey = keypair.secretKey;

    // Encrypt the private key
    const encryptedPrivateKey = await this.encryptionProvider.encryptPrivateKey(
      privateKey
    );

    // Create the wallet
    const wallet: IWallet = {
      id: uuidv4(),
      name,
      address,
      encryptedPrivateKey,
      createdAt: new Date(),
      lastUsed: new Date(),
      metadata,
    };

    // Save the wallet
    await this.storageProvider.saveWallet(wallet);

    // Cache the keypair
    this.keypairCache.set(wallet.id, keypair);

    return wallet;
  }

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID
   */
  public async getWallet(id: string): Promise<IWallet> {
    const wallet = await this.storageProvider.getWallet(id);

    if (!wallet) {
      throw new Error(`Wallet with ID ${id} not found`);
    }

    // Update last used
    wallet.lastUsed = new Date();
    await this.storageProvider.saveWallet(wallet);

    return wallet;
  }

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address
   */
  public async getWalletByAddress(address: string): Promise<IWallet> {
    const wallet = await this.storageProvider.getWalletByAddress(address);

    if (!wallet) {
      throw new Error(`Wallet with address ${address} not found`);
    }

    // Update last used
    wallet.lastUsed = new Date();
    await this.storageProvider.saveWallet(wallet);

    return wallet;
  }

  /**
   * Gets the default wallet
   * @returns Default wallet
   */
  public async getDefaultWallet(): Promise<IWallet> {
    // Get all wallets
    const wallets = await this.storageProvider.listWallets();

    // If no wallets exist and auto-create is enabled, create one
    if (wallets.length === 0 && this.config.autoCreateWallet) {
      return this.createWallet();
    }

    // If no wallets exist and auto-create is disabled, throw an error
    if (wallets.length === 0) {
      throw new Error("No wallets found and auto-create is disabled");
    }

    // Return the most recently used wallet
    return wallets.sort(
      (a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
    )[0];
  }

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  public async listWallets(): Promise<IWallet[]> {
    return this.storageProvider.listWallets();
  }

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  public async deleteWallet(id: string): Promise<boolean> {
    // Remove from cache
    this.keypairCache.delete(id);

    return this.storageProvider.deleteWallet(id);
  }

  /**
   * Signs a transaction with a wallet
   * @param transaction Transaction to sign
   * @param walletId ID of the wallet to sign with
   * @returns Signed transaction
   */
  public async signTransaction(
    transaction: Transaction,
    walletId: string
  ): Promise<Transaction> {
    // Get the keypair
    const keypair = await this.getKeypair(walletId);

    // Sign the transaction
    transaction.sign(keypair);

    return transaction;
  }

  /**
   * Gets a keypair for a wallet
   * @param walletId ID of the wallet to get keypair for
   * @returns Keypair for the wallet
   */
  public async getKeypair(walletId: string): Promise<Keypair> {
    // Check if keypair is cached
    if (this.keypairCache.has(walletId)) {
      return this.keypairCache.get(walletId)!;
    }

    // Get the wallet
    const wallet = await this.getWallet(walletId);

    // Decrypt the private key
    const privateKey = await this.encryptionProvider.decryptPrivateKey(
      wallet.encryptedPrivateKey
    );

    // Create the keypair
    const keypair = Keypair.fromSecretKey(privateKey);

    // Cache the keypair
    this.keypairCache.set(walletId, keypair);

    return keypair;
  }
}
