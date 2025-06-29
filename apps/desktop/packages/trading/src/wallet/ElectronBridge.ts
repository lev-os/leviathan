import {
  IWalletStorageProvider,
  IWalletEncryptionProvider,
  IWallet,
} from "@/wallet/interfaces";

/**
 * Type definition for the wallet storage bridge exposed by the preload script
 */
interface WalletStorageBridge {
  saveWallet(wallet: IWallet): Promise<void>;
  getWallet(id: string): Promise<IWallet | null>;
  getWalletByAddress(address: string): Promise<IWallet | null>;
  listWallets(): Promise<IWallet[]>;
  deleteWallet(id: string): Promise<boolean>;
}

/**
 * Type definition for the wallet encryption bridge exposed by the preload script
 */
interface WalletEncryptionBridge {
  encryptPrivateKey(privateKey: Uint8Array): Promise<string>;
  decryptPrivateKey(encryptedPrivateKey: string): Promise<Uint8Array>;
}

/**
 * Type definition for the window object with the exposed bridges
 */
interface WindowWithBridges extends Window {
  d2FsbGV0U3RvcmFnZQ: WalletStorageBridge; // Base64 encoded "walletStorage"
  d2FsbGV0RW5jcnlwdGlvbg: WalletEncryptionBridge; // Base64 encoded "walletEncryption"
}

/**
 * Implementation of IWalletStorageProvider that uses the Electron preload bridge
 */
export class ElectronWalletStorageProvider implements IWalletStorageProvider {
  private bridge: WalletStorageBridge;

  /**
   * Creates a new ElectronWalletStorageProvider
   */
  constructor() {
    // Get the bridge from the window object
    // Use 'as unknown' first to avoid TypeScript error
    const win = window as unknown as WindowWithBridges;
    this.bridge = win.d2FsbGV0U3RvcmFnZQ;

    if (!this.bridge) {
      throw new Error(
        "Wallet storage bridge not found in window object. Make sure the preload script is properly loaded."
      );
    }
  }

  /**
   * Saves a wallet to storage
   * @param wallet Wallet to save
   */
  public async saveWallet(wallet: IWallet): Promise<void> {
    return this.bridge.saveWallet(wallet);
  }

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID or null if not found
   */
  public async getWallet(id: string): Promise<IWallet | null> {
    return this.bridge.getWallet(id);
  }

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address or null if not found
   */
  public async getWalletByAddress(address: string): Promise<IWallet | null> {
    return this.bridge.getWalletByAddress(address);
  }

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  public async listWallets(): Promise<IWallet[]> {
    return this.bridge.listWallets();
  }

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  public async deleteWallet(id: string): Promise<boolean> {
    return this.bridge.deleteWallet(id);
  }
}

/**
 * Implementation of IWalletEncryptionProvider that uses the Electron preload bridge
 */
export class ElectronWalletEncryptionProvider
  implements IWalletEncryptionProvider
{
  private bridge: WalletEncryptionBridge;

  /**
   * Creates a new ElectronWalletEncryptionProvider
   */
  constructor() {
    // Get the bridge from the window object
    // Use 'as unknown' first to avoid TypeScript error
    const win = window as unknown as WindowWithBridges;
    this.bridge = win.d2FsbGV0RW5jcnlwdGlvbg;

    if (!this.bridge) {
      throw new Error(
        "Wallet encryption bridge not found in window object. Make sure the preload script is properly loaded."
      );
    }
  }

  /**
   * Encrypts a private key
   * @param privateKey Private key to encrypt
   * @returns Encrypted private key
   */
  public async encryptPrivateKey(privateKey: Uint8Array): Promise<string> {
    return this.bridge.encryptPrivateKey(privateKey);
  }

  /**
   * Decrypts an encrypted private key
   * @param encryptedPrivateKey Encrypted private key
   * @returns Decrypted private key
   */
  public async decryptPrivateKey(
    encryptedPrivateKey: string
  ): Promise<Uint8Array> {
    return this.bridge.decryptPrivateKey(encryptedPrivateKey);
  }
}
