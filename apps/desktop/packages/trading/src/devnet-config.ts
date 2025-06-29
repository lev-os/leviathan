import { config } from 'dotenv';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import bs58 from 'bs58';

export interface DevnetTestConfig {
  connection: Connection;
  keypair: Keypair;
  walletAddress: PublicKey;
  network: 'devnet' | 'mainnet';
  jupiterEndpoint: string;
  moralisApiKey: string;
  telegramConfig: {
    botToken: string;
    apiId: string;
    apiHash: string;
  };
  testTokens: {
    wsol: PublicKey;
    usdc: PublicKey;
    testA?: PublicKey;
    testB?: PublicKey;
  };
}

export class DevnetConfigManager {
  private static instance: DevnetConfigManager;
  private currentConfig: DevnetTestConfig;

  private constructor() {
    this.loadDevnetConfig();
  }

  static getInstance(): DevnetConfigManager {
    if (!DevnetConfigManager.instance) {
      DevnetConfigManager.instance = new DevnetConfigManager();
    }
    return DevnetConfigManager.instance;
  }

  private loadDevnetConfig(): void {
    // Load devnet environment
    config({ path: join(process.cwd(), '.env.devnet') });

    // Validate required environment variables
    const requiredVars = [
      'SOLANA_ENDPOINT',
      'PRIVATE_KEY',
      'MORALIS_API_KEY'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }

    // Initialize Solana connection
    const connection = new Connection(
      process.env.SOLANA_ENDPOINT!,
      {
        commitment: 'confirmed',
        wsEndpoint: process.env.SOLANA_WS_ENDPOINT
      }
    );

    // Load wallet keypair - support multiple formats
    let keypair: Keypair;
    try {
      const privateKeyStr = process.env.PRIVATE_KEY!;
      
      // Try base58 format first (most common for Solana)
      if (privateKeyStr.length > 50 && !privateKeyStr.startsWith('[')) {
        console.log('Parsing private key as base58 format...');
        const privateKeyBytes = bs58.decode(privateKeyStr);
        keypair = Keypair.fromSecretKey(privateKeyBytes);
      } 
      // Try array format
      else if (privateKeyStr.startsWith('[')) {
        console.log('Parsing private key as array format...');
        const privateKeyArray = JSON.parse(privateKeyStr);
        keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
      }
      // Try base64 format as fallback
      else {
        console.log('Parsing private key as base64 format...');
        keypair = Keypair.fromSecretKey(
          Buffer.from(privateKeyStr, 'base64')
        );
      }
      
      console.log(`Wallet address derived: ${keypair.publicKey.toString()}`);
      
    } catch (error) {
      throw new Error(`Failed to parse private key: ${error.message}. Ensure PRIVATE_KEY is in base58, array, or base64 format.`);
    }

    this.currentConfig = {
      connection,
      keypair,
      walletAddress: keypair.publicKey, // Use derived address instead of env variable
      network: 'devnet',
      jupiterEndpoint: process.env.METIS_ENDPOINT!,
      moralisApiKey: process.env.MORALIS_API_KEY!,
      telegramConfig: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        apiId: process.env.TELEGRAM_API_ID || '',
        apiHash: process.env.TELEGRAM_API_HASH || ''
      },
      testTokens: {
        wsol: new PublicKey(process.env.WSOL_MINT!),
        usdc: new PublicKey(process.env.USDC_MINT!),
        testA: process.env.TEST_TOKEN_A ? new PublicKey(process.env.TEST_TOKEN_A) : undefined,
        testB: process.env.TEST_TOKEN_B ? new PublicKey(process.env.TEST_TOKEN_B) : undefined
      }
    };
  }

  getConfig(): DevnetTestConfig {
    return this.currentConfig;
  }

  async validateConnection(): Promise<boolean> {
    try {
      const version = await this.currentConfig.connection.getVersion();
      console.log(`Connected to Solana devnet: ${version['solana-core']}`);
      return true;
    } catch (error) {
      console.error('Failed to connect to Solana devnet:', error);
      return false;
    }
  }

  async getAccountBalance(): Promise<number> {
    try {
      const balance = await this.currentConfig.connection.getBalance(
        this.currentConfig.walletAddress
      );
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return 0;
    }
  }

  async ensureSufficientBalance(minSol: number = 1): Promise<void> {
    const balance = await this.getAccountBalance();
    
    if (balance < minSol) {
      console.log(`Insufficient balance: ${balance} SOL. Requesting airdrop...`);
      
      try {
        // Request airdrop on devnet
        const airdropSignature = await this.currentConfig.connection.requestAirdrop(
          this.currentConfig.walletAddress,
          2 * 1e9 // 2 SOL
        );
        
        await this.currentConfig.connection.confirmTransaction(airdropSignature, 'confirmed');
        console.log('Airdrop successful');
        
        // Wait a moment for balance to update
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        throw new Error(`Failed to request devnet airdrop: ${error}`);
      }
    }
  }
}

// Helper function for tests
export async function setupDevnetTest(): Promise<DevnetTestConfig> {
  const configManager = DevnetConfigManager.getInstance();
  
  // Validate connection
  const isConnected = await configManager.validateConnection();
  if (!isConnected) {
    throw new Error('Failed to establish devnet connection');
  }
  
  // Ensure sufficient balance for testing
  await configManager.ensureSufficientBalance(2);
  
  return configManager.getConfig();
}
