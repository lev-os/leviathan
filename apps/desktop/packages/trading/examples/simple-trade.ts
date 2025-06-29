import {
  createTradingPackage,
  SolanaAdapter,
  JupiterAdapter,
  MoralisAdapter,
  PriceTargetStrategy,
  PriceDirection,
  StrategyAction,
} from "../src";

// Example function to demonstrate how to use the trading package
async function runSimpleTradeExample() {
  try {
    // Configuration
    const solanaConfig = {
      endpoint: "https://api.mainnet-beta.solana.com",
      commitment: "confirmed" as "confirmed" | "processed" | "finalized",
    };

    const jupiterConfig = {
      endpoint: "https://quote-api.jup.ag/v6",
      slippageTolerance: 0.5,
    };

    const moralisConfig = {
      apiKey: "YOUR_MORALIS_API_KEY",
      network: "mainnet",
    };

    // Create adapters
    const blockchainAdapter = new SolanaAdapter(solanaConfig);
    const dexAdapter = new JupiterAdapter(jupiterConfig);
    const priceOracleAdapter = new MoralisAdapter(moralisConfig);

    // Create trading package
    const { tradingEngine, strategyFactory } = createTradingPackage(
      blockchainAdapter,
      dexAdapter,
      priceOracleAdapter
    );

    // Define assets
    const solAsset = {
      symbol: "SOL",
      address: "So11111111111111111111111111111111111111112",
      decimals: 9,
      network: "solana",
    };

    const usdcAsset = {
      symbol: "USDC",
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      network: "solana",
    };

    // Create a price target strategy (buy SOL when it drops 5% from current price)
    const priceTargetStrategy = strategyFactory.createStrategy("priceTarget", {
      targetPercentage: 5,
      direction: PriceDirection.DOWN,
      action: StrategyAction.BUY,
    });

    // Create a trade
    const trade = await tradingEngine.createTrade({
      inputAsset: usdcAsset,
      outputAsset: solAsset,
      inputAmount: BigInt(10_000_000), // 10 USDC
      strategies: [priceTargetStrategy],
      metadata: {
        walletAddress: "YOUR_WALLET_ADDRESS",
        privateKey: "YOUR_PRIVATE_KEY",
      },
    });

    console.log("Trade created:", trade);

    // In a real application, you would monitor the price and execute the trade
    // when the strategy conditions are met
    // For this example, we'll just simulate updating the price data
    await tradingEngine.updatePriceData(trade.id);

    // Get the updated trade
    const updatedTrade = await tradingEngine.getTrade(trade.id);
    console.log("Updated trade:", updatedTrade);

    // List active trades
    const activeTrades = await tradingEngine.listActiveTrades();
    console.log("Active trades:", activeTrades);

    // In a real application, you would execute the trade when ready
    // const result = await tradingEngine.executeTrade(trade.id);
    // console.log('Trade execution result:', result);

    return "Example completed successfully";
  } catch (error) {
    console.error("Error running example:", error);
    return `Example failed: ${error.message}`;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runSimpleTradeExample().then(console.log).catch(console.error);
}

// Export the example function for use in other files
export { runSimpleTradeExample };
