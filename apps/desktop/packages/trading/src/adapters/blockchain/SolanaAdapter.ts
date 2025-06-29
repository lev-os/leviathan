import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  TransactionSignature,
  SignatureStatus,
  TransactionConfirmationStatus,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  IBlockchainAdapter,
  BlockchainAdapterConfig,
} from "@/adapters/blockchain/interfaces";
import { ITradableAsset } from "@/domain/shared-interfaces";
import { TransactionStatus } from "@/domain/enums";

/**
 * Solana-specific blockchain adapter configuration
 */
export interface SolanaAdapterConfig extends BlockchainAdapterConfig {
  /**
   * Commitment level for transactions
   */
  commitment?: "processed" | "confirmed" | "finalized";
}

/**
 * Adapter for interacting with the Solana blockchain
 */
export class SolanaAdapter implements IBlockchainAdapter {
  private connection: Connection;
  private config: SolanaAdapterConfig;

  /**
   * Creates a new Solana adapter
   * @param config Configuration for the adapter
   */
  constructor(config: SolanaAdapterConfig) {
    this.config = {
      connectionTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      commitment: "confirmed",
      ...config,
    };

    this.connection = new Connection(this.config.endpoint, {
      commitment: this.config.commitment,
      confirmTransactionInitialTimeout: this.config.connectionTimeout,
    });
  }

  /**
   * Gets the balance of an asset for an address
   * @param address Wallet address
   * @param asset Asset to get balance for
   * @returns Balance as a bigint
   */
  public async getBalance(
    address: string,
    asset: ITradableAsset
  ): Promise<bigint> {
    try {
      const publicKey = new PublicKey(address);

      // For SOL (native token)
      if (asset.address === "So11111111111111111111111111111111111111112") {
        const balance = await this.connection.getBalance(publicKey);
        return BigInt(balance);
      }

      // For SPL tokens
      const tokenMint = new PublicKey(asset.address);
      const tokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey);

      try {
        const balance = await this.connection.getTokenAccountBalance(
          tokenAccount
        );
        return BigInt(balance.value.amount);
      } catch (error: any) {
        // Token account might not exist
        return BigInt(0);
      }
    } catch (error: any) {
      console.error("Error getting balance:", error);
      throw new Error(
        `Failed to get balance for ${asset.symbol}: ${error.message}`
      );
    }
  }

  /**
   * Signs a transaction with a private key
   * @param transaction Transaction to sign
   * @param privateKey Private key to sign with
   * @returns Signed transaction
   */
  public async signTransaction(
    transaction: Transaction | VersionedTransaction,
    privateKey: string
  ): Promise<Transaction | VersionedTransaction> {
    try {
      const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, "hex"));

      if (transaction instanceof VersionedTransaction) {
        transaction.sign([keypair]);
      } else {
        transaction.sign(keypair);
      }

      return transaction;
    } catch (error: any) {
      console.error("Error signing transaction:", error);
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }

  /**
   * Submits a signed transaction to the blockchain
   * @param signedTransaction Signed transaction to submit
   * @returns Transaction ID
   */
  public async submitTransaction(
    signedTransaction: Transaction | VersionedTransaction
  ): Promise<string> {
    try {
      let signature: TransactionSignature;

      if (signedTransaction instanceof VersionedTransaction) {
        const rawTransaction = signedTransaction.serialize();
        signature = await this.connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          maxRetries: this.config.retryAttempts,
        });
      } else {
        const rawTransaction = signedTransaction.serialize();
        signature = await this.connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          maxRetries: this.config.retryAttempts,
        });
      }

      return signature;
    } catch (error: any) {
      console.error("Error submitting transaction:", error);
      throw new Error(`Failed to submit transaction: ${error.message}`);
    }
  }

  /**
   * Gets the status of a transaction
   * @param transactionId Transaction ID to check
   * @returns Transaction status
   */
  public async getTransactionStatus(
    transactionId: string
  ): Promise<TransactionStatus> {
    try {
      const signature = transactionId;
      const { value } = await this.connection.getSignatureStatus(signature);

      if (!value) {
        return TransactionStatus.SUBMITTED;
      }

      if (value.err) {
        return TransactionStatus.FAILED;
      }

      switch (value.confirmationStatus) {
        case "processed":
          return TransactionStatus.SUBMITTED;
        case "confirmed":
          return TransactionStatus.CONFIRMED;
        case "finalized":
          return TransactionStatus.CONFIRMED;
        default:
          return TransactionStatus.SUBMITTED;
      }
    } catch (error: any) {
      console.error("Error getting transaction status:", error);
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Confirms a transaction by waiting for it to be confirmed
   * @param signature Transaction signature to confirm
   * @param desiredConfirmationStatus Desired confirmation status
   * @param timeout Timeout in milliseconds
   * @param pollInterval Polling interval in milliseconds
   * @param searchTransactionHistory Whether to search transaction history
   * @returns Signature status
   */
  public async confirmTransaction(
    signature: TransactionSignature,
    desiredConfirmationStatus: TransactionConfirmationStatus = "confirmed",
    timeout: number = 30000,
    pollInterval: number = 1000,
    searchTransactionHistory: boolean = false
  ): Promise<SignatureStatus> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const { value: statuses } = await this.connection.getSignatureStatuses(
        [signature],
        { searchTransactionHistory }
      );

      if (!statuses || statuses.length === 0) {
        throw new Error("Failed to get signature status");
      }

      const status = statuses[0];

      if (status === null) {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        continue;
      }

      if (status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }

      if (
        status.confirmationStatus &&
        status.confirmationStatus === desiredConfirmationStatus
      ) {
        return status;
      }

      if (status.confirmationStatus === "finalized") {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
  }
}
