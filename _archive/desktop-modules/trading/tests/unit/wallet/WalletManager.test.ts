import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { WalletManager } from "../../../src/wallet/WalletManager";
import {
  IWallet,
  IWalletStorageProvider,
  IWalletEncryptionProvider,
} from "../../../src/wallet/interfaces";
import { Keypair } from "@solana/web3.js";

// Mock wallet storage provider
class MockWalletStorageProvider implements IWalletStorageProvider {
  private wallets: Map<string, IWallet> = new Map();

  public async saveWallet(wallet: IWallet): Promise<void> {
    this.wallets.set(wallet.id, { ...wallet });
  }

  public async getWallet(id: string): Promise<IWallet | null> {
    return this.wallets.get(id) || null;
  }

  public async getWalletByAddress(address: string): Promise<IWallet | null> {
    for (const wallet of this.wallets.values()) {
      if (wallet.address === address) {
        return { ...wallet };
      }
    }
    return null;
  }

  public async listWallets(): Promise<IWallet[]> {
    return Array.from(this.wallets.values()).map((wallet) => ({ ...wallet }));
  }

  public async deleteWallet(id: string): Promise<boolean> {
    return this.wallets.delete(id);
  }
}

// Mock wallet encryption provider
class MockWalletEncryptionProvider implements IWalletEncryptionProvider {
  // Simple mock encryption that just adds a prefix
  public async encryptPrivateKey(privateKey: Uint8Array): Promise<string> {
    return `encrypted:${Buffer.from(privateKey).toString("hex")}`;
  }

  // Simple mock decryption that removes the prefix
  public async decryptPrivateKey(
    encryptedPrivateKey: string
  ): Promise<Uint8Array> {
    const hexPrivateKey = encryptedPrivateKey.replace("encrypted:", "");
    return new Uint8Array(Buffer.from(hexPrivateKey, "hex"));
  }
}

describe("WalletManager", () => {
  let walletManager: WalletManager;
  let storageProvider: MockWalletStorageProvider;
  let encryptionProvider: MockWalletEncryptionProvider;

  beforeEach(() => {
    // Create mock providers
    storageProvider = new MockWalletStorageProvider();
    encryptionProvider = new MockWalletEncryptionProvider();

    // Create wallet manager
    walletManager = new WalletManager(storageProvider, encryptionProvider, {
      defaultWalletNamePrefix: "Test Wallet",
      autoCreateWallet: true,
    });
  });

  describe("createWallet", () => {
    it("should create a new wallet with the provided name", async () => {
      // Act
      const wallet = await walletManager.createWallet("My Test Wallet");

      // Assert
      expect(wallet).toBeDefined();
      expect(wallet.id).toBeDefined();
      expect(wallet.name).toBe("My Test Wallet");
      expect(wallet.address).toBeDefined();
      expect(wallet.encryptedPrivateKey).toBeDefined();
      expect(wallet.createdAt).toBeInstanceOf(Date);
      expect(wallet.lastUsed).toBeInstanceOf(Date);

      // Verify wallet was saved
      const savedWallet = await storageProvider.getWallet(wallet.id);
      expect(savedWallet).toEqual(wallet);
    });

    it("should create a wallet with default name if none provided", async () => {
      // Act
      const wallet = await walletManager.createWallet();

      // Assert
      expect(wallet).toBeDefined();
      expect(wallet.name).toContain("Test Wallet");
    });

    it("should store metadata with the wallet", async () => {
      // Arrange
      const metadata = { purpose: "Trading", tags: ["test", "solana"] };

      // Act
      const wallet = await walletManager.createWallet(
        "Metadata Wallet",
        metadata
      );

      // Assert
      expect(wallet.metadata).toEqual(metadata);
    });
  });

  describe("getWallet", () => {
    it("should retrieve a wallet by ID", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Retrieve Test");

      // Act
      const retrievedWallet = await walletManager.getWallet(wallet.id);

      // Assert
      expect(retrievedWallet).toEqual(wallet);
    });

    it("should throw an error for non-existent wallet ID", async () => {
      // Act & Assert
      await expect(walletManager.getWallet("non-existent-id")).rejects.toThrow(
        "Wallet with ID non-existent-id not found"
      );
    });

    it("should update lastUsed timestamp when retrieving a wallet", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Last Used Test");
      const originalLastUsed = wallet.lastUsed;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      const retrievedWallet = await walletManager.getWallet(wallet.id);

      // Assert
      expect(retrievedWallet.lastUsed.getTime()).toBeGreaterThan(
        originalLastUsed.getTime()
      );
    });
  });

  describe("getWalletByAddress", () => {
    it("should retrieve a wallet by address", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Address Test");

      // Act
      const retrievedWallet = await walletManager.getWalletByAddress(
        wallet.address
      );

      // Assert
      expect(retrievedWallet).toEqual(wallet);
    });

    it("should throw an error for non-existent wallet address", async () => {
      // Act & Assert
      await expect(
        walletManager.getWalletByAddress("non-existent-address")
      ).rejects.toThrow("Wallet with address non-existent-address not found");
    });
  });

  describe("getDefaultWallet", () => {
    it("should return the most recently used wallet", async () => {
      // Arrange
      const wallet1 = await walletManager.createWallet("Wallet 1");
      await new Promise((resolve) => setTimeout(resolve, 10));
      const wallet2 = await walletManager.createWallet("Wallet 2");

      // Act
      const defaultWallet = await walletManager.getDefaultWallet();

      // Assert
      expect(defaultWallet.id).toBe(wallet2.id);
    });

    it("should create a new wallet if none exists and autoCreateWallet is true", async () => {
      // Arrange - no wallets created yet

      // Act
      const defaultWallet = await walletManager.getDefaultWallet();

      // Assert
      expect(defaultWallet).toBeDefined();
      expect(defaultWallet.name).toContain("Test Wallet");
    });

    it("should throw an error if no wallets exist and autoCreateWallet is false", async () => {
      // Arrange
      walletManager = new WalletManager(storageProvider, encryptionProvider, {
        autoCreateWallet: false,
      });

      // Act & Assert
      await expect(walletManager.getDefaultWallet()).rejects.toThrow(
        "No wallets found and auto-create is disabled"
      );
    });
  });

  describe("listWallets", () => {
    it("should list all wallets", async () => {
      // Arrange
      const wallet1 = await walletManager.createWallet("List Test 1");
      const wallet2 = await walletManager.createWallet("List Test 2");

      // Act
      const wallets = await walletManager.listWallets();

      // Assert
      expect(wallets.length).toBe(2);
      expect(wallets).toContainEqual(wallet1);
      expect(wallets).toContainEqual(wallet2);
    });

    it("should return an empty array when no wallets exist", async () => {
      // Arrange - create a new wallet manager with empty storage
      walletManager = new WalletManager(
        new MockWalletStorageProvider(),
        encryptionProvider
      );

      // Act
      const wallets = await walletManager.listWallets();

      // Assert
      expect(wallets).toEqual([]);
    });
  });

  describe("deleteWallet", () => {
    it("should delete a wallet by ID", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Delete Test");

      // Act
      const result = await walletManager.deleteWallet(wallet.id);

      // Assert
      expect(result).toBe(true);
      await expect(walletManager.getWallet(wallet.id)).rejects.toThrow();
    });

    it("should return false for non-existent wallet ID", async () => {
      // Act
      const result = await walletManager.deleteWallet("non-existent-id");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("signTransaction", () => {
    it("should sign a transaction with the specified wallet", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Signing Test");
      const transaction = { sign: vi.fn() } as any;

      // Act
      await walletManager.signTransaction(transaction, wallet.id);

      // Assert
      expect(transaction.sign).toHaveBeenCalled();
    });
  });

  describe("getKeypair", () => {
    it("should return a keypair for the specified wallet", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Keypair Test");

      // Act
      const keypair = await walletManager.getKeypair(wallet.id);

      // Assert
      expect(keypair).toBeInstanceOf(Keypair);
      expect(keypair.publicKey.toBase58()).toBe(wallet.address);
    });

    it("should cache keypairs for better performance", async () => {
      // Arrange
      const wallet = await walletManager.createWallet("Cache Test");
      const decryptSpy = vi.spyOn(encryptionProvider, "decryptPrivateKey");

      // Act
      const keypair1 = await walletManager.getKeypair(wallet.id);
      const keypair2 = await walletManager.getKeypair(wallet.id);

      // Assert
      expect(decryptSpy).toHaveBeenCalledTimes(1);
      expect(keypair1).toBe(keypair2); // Same instance
    });
  });
});
