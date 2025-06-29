import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/api';
import { DevnetConfigManager, DevnetTestConfig } from './devnet-config.js';

export interface TradeTestResult {
  success: boolean;
  error?: string;
  transactionSignature?: string;
  executionTime?: number;
  details?: {
    inputAmount: number;
    outputAmount?: number;
    slippage?: number;
    route?: any;
  };
}

export class TradingDevnetTester {
  private config: DevnetTestConfig;
  private jupiter: Jupiter | null = null;

  constructor() {
    this.config = DevnetConfigManager.getInstance().getConfig();
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing Trading Devnet Tester...');
    
    try {
      // Initialize Jupiter API for devnet
      this.jupiter = await Jupiter.load({
        connection: this.config.connection,
        cluster: 'devnet',
        user: this.config.keypair.publicKey,
        wrapUnwrapSOL: true
      });
      
      console.log('✅ Jupiter API initialized for devnet');
    } catch (error) {
      throw new Error(`Failed to initialize Jupiter API: ${error.message}`);
    }
  }

  async testBasicSwap(): Promise<TradeTestResult> {
    console.log('💱 Testing basic swap functionality...');
    
    const startTime = Date.now();
    
    try {
      if (!this.jupiter) {
        await this.initialize();
      }

      // Test swap: SOL -> WSOL (wrapped SOL)
      const inputAmount = 0.01 * 1e9; // 0.01 SOL in lamports
      
      // Get route quote
      const routes = await this.jupiter!.computeRoutes({
        inputMint: this.config.testTokens.wsol, // Use WSOL as both input and output for testing
        outputMint: this.config.testTokens.wsol,
        amount: inputAmount,
        slippageBps: 100, // 1% slippage tolerance
        onlyDirectRoutes: true
      });

      if (routes.routesInfos.length === 0) {
        return {
          success: false,
          error: 'No routes found for the swap',
          executionTime: Date.now() - startTime
        };
      }

      const bestRoute = routes.routesInfos[0];
      
      // Execute swap
      const { execute } = await this.jupiter!.exchange({
        routeInfo: bestRoute
      });

      const swapResult = await execute();
      
      return {
        success: true,
        transactionSignature: swapResult.txid,
        executionTime: Date.now() - startTime,
        details: {
          inputAmount: inputAmount / 1e9,
          outputAmount: parseInt(bestRoute.outAmount) / 1e9,
          slippage: bestRoute.priceImpactPct,
          route: bestRoute
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Swap execution failed: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }

  async testPriceDataRetrieval(): Promise<TradeTestResult> {
    console.log('📊 Testing price data retrieval...');
    
    const startTime = Date.now();
    
    try {
      // Test Moralis price feed integration
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/erc20/${this.config.testTokens.wsol.toString()}/price?chain=solana&include=percent_change`,
        {
          headers: {
            'X-API-Key': this.config.moralisApiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Price API request failed: ${response.status}`);
      }

      const priceData = await response.json();
      
      return {
        success: true,
        executionTime: Date.now() - startTime,
        details: {
          inputAmount: 0,
          outputAmount: priceData.usdPrice,
          route: priceData
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Price data retrieval failed: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }

  async testWalletBalance(): Promise<TradeTestResult> {
    console.log('💰 Testing wallet balance retrieval...');
    
    const startTime = Date.now();
    
    try {
      const balance = await this.config.connection.getBalance(this.config.walletAddress);
      const solBalance = balance / 1e9;
      
      if (solBalance < 0.1) {
        console.warn(`⚠️  Low balance detected: ${solBalance} SOL`);
      }
      
      return {
        success: true,
        executionTime: Date.now() - startTime,
        details: {
          inputAmount: solBalance,
          outputAmount: balance
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Balance check failed: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }

  async runAllTradingTests(): Promise<{ [key: string]: TradeTestResult }> {
    console.log('🧪 Running complete trading test suite...');
    
    const results: { [key: string]: TradeTestResult } = {};
    
    // Test wallet balance first
    results.walletBalance = await this.testWalletBalance();
    
    // Test price data retrieval
    results.priceData = await this.testPriceDataRetrieval();
    
    // Test basic swap only if previous tests pass
    if (results.walletBalance.success && results.priceData.success) {
      results.basicSwap = await this.testBasicSwap();
    } else {
      results.basicSwap = {
        success: false,
        error: 'Skipped due to prerequisite test failures'
      };
    }
    
    return results;
  }
}
