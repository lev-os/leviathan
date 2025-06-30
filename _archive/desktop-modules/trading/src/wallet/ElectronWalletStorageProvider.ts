import { IWallet, IWalletStorageProvider } from "@/wallet/interfaces";

/**
 * Wallet storage provider that uses Electron's IPC to communicate with the main process
 * for secure storage of wallets.
 */
export class ElectronWalletStorageProvider implements IWalletStorageProvider {
  private readonly STORAGE_CHANNEL = "wallet:storage";
  private readonly ipcBridge: any;

  /**
   * Creates a new ElectronWalletStorageProvider
   * @param ipcBridge IPC bridge for communicating with the main process
   */
  constructor(ipcBridge: any) {
    this.ipcBridge = ipcBridge;
  }

  /**
   * Saves a wallet to storage
   * @param wallet Wallet to save
   */
  public async saveWallet(wallet: IWallet): Promise<void> {
    await this.ipcBridge.send(this.STORAGE_CHANNEL, {
      action: "save",
      wallet,
    });
  }

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID or null if not found
   */
  public async getWallet(id: string): Promise<IWallet | null> {
    const response = await this.ipcBridge.send(this.STORAGE_CHANNEL, {
      action: "get",
      id,
    });

    return response.wallet || null;
  }

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address or null if not found
   */
  public async getWalletByAddress(address: string): Promise<IWallet | null> {
    const response = await this.ipcBridge.send(this.STORAGE_CHANNEL, {
      action: "getByAddress",
      address,
    });

    return response.wallet || null;
  }

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  public async listWallets(): Promise<IWallet[]> {
    const response = await this.ipcBridge.send(this.STORAGE_CHANNEL, {
      action: "list",
    });

    return response.wallets || [];
  }

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  public async deleteWallet(id: string): Promise<boolean> {
    const response = await this.ipcBridge.send(this.STORAGE_CHANNEL, {
      action: "delete",
      id,
    });

    return response.success || false;
  }
}
