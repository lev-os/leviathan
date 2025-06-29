import { IWalletEncryptionProvider } from "@/wallet/interfaces";

/**
 * Wallet encryption provider that uses Electron's IPC to communicate with the main process
 * for secure encryption and decryption of private keys.
 */
export class WalletEncryptionProvider implements IWalletEncryptionProvider {
  private readonly ENCRYPTION_CHANNEL = "wallet:encryption";
  private readonly ipcBridge: any;

  /**
   * Creates a new WalletEncryptionProvider
   * @param ipcBridge IPC bridge for communicating with the main process
   */
  constructor(ipcBridge: any) {
    this.ipcBridge = ipcBridge;
  }

  /**
   * Encrypts a private key
   * @param privateKey Private key to encrypt
   * @returns Encrypted private key
   */
  public async encryptPrivateKey(privateKey: Uint8Array): Promise<string> {
    const response = await this.ipcBridge.send(this.ENCRYPTION_CHANNEL, {
      action: "encrypt",
      privateKey: Array.from(privateKey), // Convert to array for serialization
    });

    if (!response.encryptedPrivateKey) {
      throw new Error("Failed to encrypt private key");
    }

    return response.encryptedPrivateKey;
  }

  /**
   * Decrypts an encrypted private key
   * @param encryptedPrivateKey Encrypted private key
   * @returns Decrypted private key
   */
  public async decryptPrivateKey(
    encryptedPrivateKey: string
  ): Promise<Uint8Array> {
    const response = await this.ipcBridge.send(this.ENCRYPTION_CHANNEL, {
      action: "decrypt",
      encryptedPrivateKey,
    });

    if (!response.privateKey) {
      throw new Error("Failed to decrypt private key");
    }

    return new Uint8Array(response.privateKey);
  }
}
