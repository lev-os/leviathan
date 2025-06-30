import { Keypair, Transaction } from "@solana/web3.js";

/**
 * Interface for wallet information
 */
export interface IWallet {
  /**
   * Unique identifier for the wallet
   */
  id: string;

  /**
   * Name of the wallet (user-friendly identifier)
   */
  name: string;

  /**
   * Public key address of the wallet
   */
  address: string;

  /**
   * Encrypted private key
   */
  encryptedPrivateKey: string;

  /**
   * Date when the wallet was created
   */
  createdAt: Date;

  /**
   * Date when the wallet was last used
   */
  lastUsed?: Date;

  /**
   * Additional metadata for the wallet
   */
  metadata?: Record<string, any>;
}

/**
 * Interface for wallet storage provider
 */
export interface IWalletStorageProvider {
  /**
   * Saves a wallet to storage
   * @param wallet Wallet to save
   */
  saveWallet(wallet: IWallet): Promise<void>;

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID or null if not found
   */
  getWallet(id: string): Promise<IWallet | null>;

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address or null if not found
   */
  getWalletByAddress(address: string): Promise<IWallet | null>;

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  listWallets(): Promise<IWallet[]>;

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  deleteWallet(id: string): Promise<boolean>;
}

/**
 * Interface for wallet encryption provider
 */
export interface IWalletEncryptionProvider {
  /**
   * Encrypts a private key
   * @param privateKey Private key to encrypt
   * @returns Encrypted private key
   */
  encryptPrivateKey(privateKey: Uint8Array): Promise<string>;

  /**
   * Decrypts an encrypted private key
   * @param encryptedPrivateKey Encrypted private key
   * @returns Decrypted private key
   */
  decryptPrivateKey(encryptedPrivateKey: string): Promise<Uint8Array>;
}

/**
 * Interface for wallet manager
 */
export interface IWalletManager {
  /**
   * Creates a new wallet
   * @param name Name for the wallet
   * @param metadata Additional metadata for the wallet
   * @returns Created wallet
   */
  createWallet(name: string, metadata?: Record<string, any>): Promise<IWallet>;

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID
   */
  getWallet(id: string): Promise<IWallet>;

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address
   */
  getWalletByAddress(address: string): Promise<IWallet>;

  /**
   * Gets the default wallet
   * @returns Default wallet
   */
  getDefaultWallet(): Promise<IWallet>;

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  listWallets(): Promise<IWallet[]>;

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  deleteWallet(id: string): Promise<boolean>;

  /**
   * Signs a transaction with a wallet
   * @param transaction Transaction to sign
   * @param walletId ID of the wallet to sign with
   * @returns Signed transaction
   */
  signTransaction(
    transaction: Transaction,
    walletId: string
  ): Promise<Transaction>;

  /**
   * Gets a keypair for a wallet
   * @param walletId ID of the wallet to get keypair for
   * @returns Keypair for the wallet
   */
  getKeypair(walletId: string): Promise<Keypair>;
}
