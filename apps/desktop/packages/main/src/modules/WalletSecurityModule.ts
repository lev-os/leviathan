import { ipcMain } from "electron";
import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import { AbstractSecurityRule } from "./AbstractSecurityModule.js";
import { ModuleContext } from "../ModuleContext.js";
import { AppModule } from "../AppModule.js";

/**
 * Module for handling wallet security operations
 */
export class WalletSecurityModule
  extends AbstractSecurityRule
  implements AppModule
{
  private readonly STORAGE_CHANNEL = "wallet:storage";
  private readonly ENCRYPTION_CHANNEL = "wallet:encryption";
  private readonly WALLET_DIR = path.join(app.getPath("userData"), "wallets");
  private readonly WALLET_FILE = path.join(this.WALLET_DIR, "wallets.enc");
  private readonly ENCRYPTION_KEY_FILE = path.join(
    app.getPath("userData"),
    ".wallet-key"
  );

  // In-memory cache of wallets
  private wallets: any[] = [];

  // Encryption key
  private encryptionKey: Buffer | null = null;

  constructor() {
    super();
  }

  /**
   * Applies security rules to web contents
   * @param contents Web contents to apply rules to
   */
  public applyRule(contents: Electron.WebContents): void {
    // No specific security rules needed for this module
  }

  /**
   * Enables the module
   * @param context Module context
   */
  public async enable(context: ModuleContext): Promise<void> {
    // Create wallet directory if it doesn't exist
    if (!fs.existsSync(this.WALLET_DIR)) {
      fs.mkdirSync(this.WALLET_DIR, { recursive: true });
    }

    // Load or generate encryption key
    await this.loadOrGenerateEncryptionKey();

    // Load wallets from storage
    await this.loadWallets();

    // Register IPC handlers
    this.registerIpcHandlers();
  }

  /**
   * Registers IPC handlers for wallet operations
   */
  private registerIpcHandlers(): void {
    // Storage channel handler
    ipcMain.handle(this.STORAGE_CHANNEL, async (event, message) => {
      try {
        const { action, wallet, id, address } = message;

        switch (action) {
          case "save":
            return await this.saveWallet(wallet);
          case "get":
            return { wallet: await this.getWallet(id) };
          case "getByAddress":
            return { wallet: await this.getWalletByAddress(address) };
          case "list":
            return { wallets: await this.listWallets() };
          case "delete":
            return { success: await this.deleteWallet(id) };
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error: any) {
        console.error("Error handling wallet storage operation:", error);
        return { error: error.message };
      }
    });

    // Encryption channel handler
    ipcMain.handle(this.ENCRYPTION_CHANNEL, async (event, message) => {
      try {
        const { action, privateKey, encryptedPrivateKey } = message;

        switch (action) {
          case "encrypt":
            return {
              encryptedPrivateKey: await this.encryptPrivateKey(
                new Uint8Array(privateKey)
              ),
            };
          case "decrypt":
            return {
              privateKey: Array.from(
                await this.decryptPrivateKey(encryptedPrivateKey)
              ),
            };
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      } catch (error: any) {
        console.error("Error handling wallet encryption operation:", error);
        return { error: error.message };
      }
    });
  }

  /**
   * Loads or generates the encryption key
   */
  private async loadOrGenerateEncryptionKey(): Promise<void> {
    try {
      if (fs.existsSync(this.ENCRYPTION_KEY_FILE)) {
        // Load existing key
        this.encryptionKey = Buffer.from(
          fs.readFileSync(this.ENCRYPTION_KEY_FILE, "utf8"),
          "hex"
        );
      } else {
        // Generate new key
        this.encryptionKey = randomBytes(32); // 256-bit key
        fs.writeFileSync(
          this.ENCRYPTION_KEY_FILE,
          this.encryptionKey.toString("hex"),
          "utf8"
        );
      }
    } catch (error) {
      console.error("Error loading or generating encryption key:", error);
      throw error;
    }
  }

  /**
   * Loads wallets from storage
   */
  private async loadWallets(): Promise<void> {
    try {
      if (fs.existsSync(this.WALLET_FILE)) {
        const encryptedData = fs.readFileSync(this.WALLET_FILE, "utf8");
        const decryptedData = this.decryptData(encryptedData);
        this.wallets = JSON.parse(decryptedData);
      } else {
        this.wallets = [];
      }
    } catch (error) {
      console.error("Error loading wallets:", error);
      this.wallets = [];
    }
  }

  /**
   * Saves wallets to storage
   */
  private async saveWalletsToStorage(): Promise<void> {
    try {
      const data = JSON.stringify(this.wallets);
      const encryptedData = this.encryptData(data);
      fs.writeFileSync(this.WALLET_FILE, encryptedData, "utf8");
    } catch (error) {
      console.error("Error saving wallets:", error);
      throw error;
    }
  }

  /**
   * Saves a wallet
   * @param wallet Wallet to save
   */
  private async saveWallet(wallet: any): Promise<void> {
    try {
      // Check if wallet already exists
      const existingIndex = this.wallets.findIndex((w) => w.id === wallet.id);

      if (existingIndex >= 0) {
        // Update existing wallet
        this.wallets[existingIndex] = wallet;
      } else {
        // Add new wallet
        this.wallets.push(wallet);
      }

      // Save to storage
      await this.saveWalletsToStorage();
    } catch (error) {
      console.error("Error saving wallet:", error);
      throw error;
    }
  }

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID or null if not found
   */
  private async getWallet(id: string): Promise<any | null> {
    return this.wallets.find((w) => w.id === id) || null;
  }

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address or null if not found
   */
  private async getWalletByAddress(address: string): Promise<any | null> {
    return this.wallets.find((w) => w.address === address) || null;
  }

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  private async listWallets(): Promise<any[]> {
    return [...this.wallets];
  }

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  private async deleteWallet(id: string): Promise<boolean> {
    try {
      const initialLength = this.wallets.length;
      this.wallets = this.wallets.filter((w) => w.id !== id);

      if (this.wallets.length !== initialLength) {
        // Save to storage
        await this.saveWalletsToStorage();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deleting wallet:", error);
      throw error;
    }
  }

  /**
   * Encrypts a private key
   * @param privateKey Private key to encrypt
   * @returns Encrypted private key
   */
  private async encryptPrivateKey(privateKey: Uint8Array): Promise<string> {
    try {
      return this.encryptData(Buffer.from(privateKey).toString("hex"));
    } catch (error) {
      console.error("Error encrypting private key:", error);
      throw error;
    }
  }

  /**
   * Decrypts an encrypted private key
   * @param encryptedPrivateKey Encrypted private key
   * @returns Decrypted private key
   */
  private async decryptPrivateKey(
    encryptedPrivateKey: string
  ): Promise<Uint8Array> {
    try {
      const decryptedHex = this.decryptData(encryptedPrivateKey);
      return new Uint8Array(Buffer.from(decryptedHex, "hex"));
    } catch (error) {
      console.error("Error decrypting private key:", error);
      throw error;
    }
  }

  /**
   * Encrypts data
   * @param data Data to encrypt
   * @returns Encrypted data
   */
  private encryptData(data: string): string {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not loaded");
    }

    // Generate a random IV
    const iv = randomBytes(16);

    // Create cipher
    const cipher = createCipheriv("aes-256-cbc", this.encryptionKey, iv);

    // Encrypt data
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted data
    return iv.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypts data
   * @param encryptedData Encrypted data
   * @returns Decrypted data
   */
  private decryptData(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error("Encryption key not loaded");
    }

    // Split IV and encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    // Create decipher
    const decipher = createDecipheriv("aes-256-cbc", this.encryptionKey, iv);

    // Decrypt data
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
