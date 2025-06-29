import { ipcRenderer } from "electron";

/**
 * Bridge for wallet storage operations
 */
export const walletStorage = {
  /**
   * Saves a wallet
   * @param wallet Wallet to save
   */
  saveWallet: async (wallet: any): Promise<void> => {
    return ipcRenderer.invoke("wallet:storage", {
      action: "save",
      wallet,
    });
  },

  /**
   * Gets a wallet by ID
   * @param id ID of the wallet to get
   * @returns Wallet with the specified ID or null if not found
   */
  getWallet: async (id: string): Promise<any | null> => {
    const response = await ipcRenderer.invoke("wallet:storage", {
      action: "get",
      id,
    });
    return response.wallet || null;
  },

  /**
   * Gets a wallet by address
   * @param address Address of the wallet to get
   * @returns Wallet with the specified address or null if not found
   */
  getWalletByAddress: async (address: string): Promise<any | null> => {
    const response = await ipcRenderer.invoke("wallet:storage", {
      action: "getByAddress",
      address,
    });
    return response.wallet || null;
  },

  /**
   * Lists all wallets
   * @returns Array of all wallets
   */
  listWallets: async (): Promise<any[]> => {
    const response = await ipcRenderer.invoke("wallet:storage", {
      action: "list",
    });
    return response.wallets || [];
  },

  /**
   * Deletes a wallet
   * @param id ID of the wallet to delete
   * @returns True if the wallet was deleted, false otherwise
   */
  deleteWallet: async (id: string): Promise<boolean> => {
    const response = await ipcRenderer.invoke("wallet:storage", {
      action: "delete",
      id,
    });
    return response.success || false;
  },
};

/**
 * Bridge for wallet encryption operations
 */
export const walletEncryption = {
  /**
   * Encrypts a private key
   * @param privateKey Private key to encrypt
   * @returns Encrypted private key
   */
  encryptPrivateKey: async (privateKey: Uint8Array): Promise<string> => {
    const response = await ipcRenderer.invoke("wallet:encryption", {
      action: "encrypt",
      privateKey: Array.from(privateKey),
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.encryptedPrivateKey;
  },

  /**
   * Decrypts an encrypted private key
   * @param encryptedPrivateKey Encrypted private key
   * @returns Decrypted private key
   */
  decryptPrivateKey: async (
    encryptedPrivateKey: string
  ): Promise<Uint8Array> => {
    const response = await ipcRenderer.invoke("wallet:encryption", {
      action: "decrypt",
      encryptedPrivateKey,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return new Uint8Array(response.privateKey);
  },
};
