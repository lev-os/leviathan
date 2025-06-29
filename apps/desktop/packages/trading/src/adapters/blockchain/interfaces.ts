import { ITradableAsset } from "@/domain/shared-interfaces";
import { TransactionStatus } from "@/domain/enums";

/**
 * Interface for blockchain adapters
 * Provides methods for interacting with a blockchain
 */
export interface IBlockchainAdapter {
  /**
   * Gets the balance of an asset for an address
   * @param address Wallet address
   * @param asset Asset to get balance for
   * @returns Balance as a bigint
   */
  getBalance(address: string, asset: ITradableAsset): Promise<bigint>;

  /**
   * Signs a transaction with a private key
   * @param transaction Transaction to sign
   * @param privateKey Private key to sign with
   * @returns Signed transaction
   */
  signTransaction(transaction: any, privateKey: string): Promise<any>;

  /**
   * Submits a signed transaction to the blockchain
   * @param signedTransaction Signed transaction to submit
   * @returns Transaction ID
   */
  submitTransaction(signedTransaction: any): Promise<string>;

  /**
   * Gets the status of a transaction
   * @param transactionId Transaction ID to check
   * @returns Transaction status
   */
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}

/**
 * Configuration for blockchain adapters
 */
export interface BlockchainAdapterConfig {
  /**
   * Endpoint URL for the blockchain
   */
  endpoint: string;

  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout?: number;

  /**
   * Number of retry attempts for failed requests
   */
  retryAttempts?: number;

  /**
   * Delay between retry attempts in milliseconds
   */
  retryDelay?: number;
}
