/**
 * Comprehensive Trading Package Example
 *
 * This example demonstrates how to use the trading package to:
 * 1. Create and configure a trading environment
 * 2. Create and manage trades with different strategies
 * 3. Track price changes and execute trades based on strategy conditions
 * 4. Handle errors and edge cases
 */

import {
  createTradingPackage,
  SolanaAdapter,
  JupiterAdapter,
  MoralisAdapter,
  PriceTargetStrategy,
  PriceDirection,
  StrategyAction,
  TradeStatus,
  ITradableAsset,
  ITrade,
} from "../../src";

// Mock implementation for demonstration purposes
// In a real application, you would use actual adapters
class MockSolanaAdapter extends SolanaAdapter {
  constructor() {
    super({ endpoint: "https://api.mainnet-beta.solana.com" });
  }

  async getBalance(address: string, asset: ITradableAsset): Promise<bigint> {
    console.log(
      `[MockSolanaAdapter] Getting balance for ${asset.symbol} at ${address}`
    );
    return BigInt(1000000000); // Mock 1 SOL or 1 USDC (adjusted for decimals)
  }

  async signTransaction(transaction: any, privateKey: string): Promise<any> {
    console.log(`[MockSolanaAdapter] Signing transaction`);
    return { signedTransaction: "mock-signed-transaction" };
  }

  async submitTransaction(signedTransaction: any): Promise<string> {
    console.log(`[MockSolanaAdapter] Submitting transaction`);
    return "mock-transaction-id";
  }

  async getTransactionStatus(transactionId: string): Promise<any> {
    console.log(
      `[MockSolanaAdapter] Getting status for transaction ${transactionId}`
    );
    return "CONFIRMED";
  }
}

class MockJupiterAdapter extends JupiterAdapter {
  constructor() {
    super({ endpoint: "https://quote-api.jup.ag/v6" });
  }

  async getQuote(params: any): Promise<any> {
    console.log(
      `[MockJupiterAdapter] Getting quote for ${params.inputAsset.symbol} to ${params.outputAsset.symbol}`
    );
    return {
      inputAmount: params.inputAmount,
      outputAmount: params.inputAmount * BigInt(10), // Mock 10x return
      price: 10,
      priceImpact: 0.1,
      route: { path: [] },
      validUntil: new Date(Date.now() + 60000), // Valid for 1 minute
    };
  }

  async buildSwapTransaction(params: any): Promise<any> {
    console.log(`[MockJupiterAdapter] Building swap transaction`);
    return { transaction: "mock-transaction-data" };
  }

  async getSwapInstructions(params: any): Promise<any> {
    console.log(`[MockJupiterAdapter] Getting swap instructions`);
    return { instructions: [] };
  }
}

class MockMoralisAdapter extends MoralisAdapter {
  private priceMultiplier = 1.0;
  private priceDirection = 1;

  constructor() {
    super({ apiKey: "mock-api-key", network: "mainnet" });
  }

  async getPrice(asset: ITradableAsset | string): Promise<number> {
    const assetSymbol = typeof asset === "string" ? asset : asset.symbol;
    console.log(`[MockMoralisAdapter] Getting price for ${assetSymbol}`);

    // Simulate price movement for demonstration
    this.priceMultiplier += 0.01 * this.priceDirection;

    // Reverse direction if price moves too much
    if (this.priceMultiplier > 1.2 || this.priceMultiplier < 0.8) {
      this.priceDirection *= -1;
    }

    return assetSymbol === "SOL"
      ? 100 * this.priceMultiplier
      : 1 * this.priceMultiplier;
  }

  async getPriceHistory(
    asset: ITradableAsset | string,
    timeframe: any
  ): Promise<any[]> {
    const assetSymbol = typeof asset === "string" ? asset : asset.symbol;
    console.log(
      `[MockMoralisAdapter] Getting price history for ${assetSymbol}`
    );

    return [
      { price: 95, timestamp: new Date(Date.now() - 3600000) },
      { price: 100, timestamp: new Date() },
    ];
  }

  async getTokenMetadata(asset: ITradableAsset): Promise<any> {
    console.log(`[MockMoralisAdapter] Getting metadata for ${asset.symbol}`);

    return {
      name: `${asset.symbol} Token`,
      symbol: asset.symbol,
      logo: "https://example.com/logo.png",
      marketCap: 1000000,
      totalSupply: BigInt(1000000000),
      circulatingSupply: BigInt(500000000),
      links: {
        website: "https://example.com",
        twitter: "https://twitter.com/example",
      },
    };
  }
}

/**
 * Main example function
 */
async function runComprehensiveTradingExample() {
  console.log("Starting comprehensive trading example...\n");

  try {
    // Step 1: Create adapters
    console.log("Step 1: Creating adapters");
    const blockchainAdapter = new MockSolanaAdapter();
    const dexAdapter = new MockJupiterAdapter();
    const priceOracleAdapter = new MockMoralisAdapter();
    console.log("Adapters created successfully\n");

    // Step 2: Create trading package
    console.log("Step 2: Creating trading package");
    const { tradingEngine, strategyEngine, strategyFactory } =
      createTradingPackage(blockchainAdapter, dexAdapter, priceOracleAdapter, {
        defaultSlippageTolerance: 0.5,
        defaultTransactionTimeout: 60000,
        defaultRetryAttempts: 3,
      });
    console.log("Trading package created successfully\n");

    // Step 3: Define assets
    console.log("Step 3: Defining assets");
    const solAsset: ITradableAsset = {
      symbol: "SOL",
      address: "So11111111111111111111111111111111111111112",
      decimals: 9,
      network: "solana",
    };

    const usdcAsset: ITradableAsset = {
      symbol: "USDC",
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      network: "solana",
    };
    console.log("Assets defined successfully\n");

    // Step 4: Create strategies
    console.log("Step 4: Creating strategies");

    // Strategy 1: Take profit at 10% price increase
    const takeProfitStrategy = strategyFactory.createStrategy("priceTarget", {
      targetPercentage: 10,
      direction: PriceDirection.UP,
      action: StrategyAction.SELL,
    });
    console.log("Created take profit strategy");

    // Strategy 2: Stop loss at 5% price decrease
    const stopLossStrategy = strategyFactory.createStrategy("priceTarget", {
      targetPercentage: 5,
      direction: PriceDirection.DOWN,
      action: StrategyAction.SELL,
    });
    console.log("Created stop loss strategy\n");

    // Step 5: Create a trade
    console.log("Step 5: Creating a trade");
    const trade = await tradingEngine.createTrade({
      inputAsset: usdcAsset,
      outputAsset: solAsset,
      inputAmount: BigInt(10_000_000), // 10 USDC
      strategies: [takeProfitStrategy, stopLossStrategy],
      metadata: {
        walletAddress: "mock-wallet-address",
        privateKey: "mock-private-key",
        notes: "Example trade with take profit and stop loss",
      },
    });
    console.log(`Trade created with ID: ${trade.id}`);
    console.log(`Initial price: ${trade.priceData.currentPrice}\n`);

    // Step 6: Simulate price updates and strategy evaluation
    console.log("Step 6: Simulating price updates and strategy evaluation");

    // Simulate price updates
    for (let i = 0; i < 5; i++) {
      console.log(`\nUpdate ${i + 1}:`);

      // Update price data
      const updatedTrade = await tradingEngine.updatePriceData(trade.id);

      console.log(`Current price: ${updatedTrade.priceData.currentPrice}`);
      console.log(`High price: ${updatedTrade.priceData.highPrice}`);
      console.log(`Low price: ${updatedTrade.priceData.lowPrice}`);

      // Check if trade status has changed
      if (updatedTrade.status !== TradeStatus.PENDING) {
        console.log(`Trade status changed to: ${updatedTrade.status}`);
        break;
      }

      // Wait a bit before next update
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Step 7: Get active trades
    console.log("\nStep 7: Getting active trades");
    const activeTrades = await tradingEngine.listActiveTrades();
    console.log(`Number of active trades: ${activeTrades.length}`);

    // Step 8: Execute trade manually if still active
    const finalTrade = await tradingEngine.getTrade(trade.id);

    if (
      finalTrade.status === TradeStatus.PENDING ||
      finalTrade.status === TradeStatus.ACTIVE
    ) {
      console.log("\nStep 8: Executing trade manually");
      const result = await tradingEngine.executeTrade(trade.id);

      if (result.success) {
        console.log(
          `Trade executed successfully. Transaction ID: ${result.transactionId}`
        );
      } else {
        console.log(`Trade execution failed: ${result.error?.message}`);
      }
    } else {
      console.log("\nStep 8: Trade already executed by strategy");
    }

    // Step 9: Final trade status
    const completedTrade = await tradingEngine.getTrade(trade.id);
    console.log("\nStep 9: Final trade status");
    console.log(`Trade ID: ${completedTrade.id}`);
    console.log(`Status: ${completedTrade.status}`);
    console.log(`Input asset: ${completedTrade.inputAsset.symbol}`);
    console.log(`Output asset: ${completedTrade.outputAsset.symbol}`);
    console.log(`Input amount: ${completedTrade.inputAmount}`);
    console.log(
      `Expected output amount: ${completedTrade.expectedOutputAmount || "N/A"}`
    );
    console.log(
      `Actual output amount: ${completedTrade.actualOutputAmount || "N/A"}`
    );
    console.log(`Created at: ${completedTrade.createdAt}`);
    console.log(`Executed at: ${completedTrade.executedAt || "N/A"}`);

    return "Example completed successfully";
  } catch (error: any) {
    console.error("Error running example:", error);
    return `Example failed: ${error.message}`;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runComprehensiveTradingExample().then(console.log).catch(console.error);
}

// Export the example function for use in other files
export { runComprehensiveTradingExample };
