# @trader/trading

A modular and extensible trading package for cryptocurrency trading on the Solana blockchain, designed to integrate seamlessly with the Trader Stack ecosystem.

## Overview

The trading package provides a robust framework for creating, managing, and executing cryptocurrency trades with customizable trading strategies. It's built with a modular architecture that separates concerns and allows for easy extension and customization.

## Features

- **Modular Architecture**: Clean separation of concerns with well-defined interfaces
- **Extensible Strategy System**: Create and combine custom trading strategies
- **Multiple Adapters**: Support for different blockchains, DEXes, and price oracles
- **Error Handling**: Robust error handling and retry mechanisms
- **Type Safety**: Written in TypeScript with comprehensive type definitions
- **Event-Based**: Subscribe to trade and price events
- **Telegram Bot Integration**: Seamlessly integrates with the Telegram bot for trade execution

## Installation

```bash
npm install @trader/trading
```

## Quick Start

```typescript
import { createTradingPackage, SolanaAdapter, JupiterAdapter, MoralisAdapter, PriceTargetStrategy, PriceDirection, StrategyAction } from "@trader/trading";

// Create adapters
const blockchainAdapter = new SolanaAdapter({
  endpoint: "https://api.mainnet-beta.solana.com",
  commitment: "confirmed" as "confirmed" | "processed" | "finalized",
});

const dexAdapter = new JupiterAdapter({
  endpoint: "https://quote-api.jup.ag/v6",
  slippageTolerance: 0.5,
});

const priceOracleAdapter = new MoralisAdapter({
  apiKey: "YOUR_MORALIS_API_KEY",
  network: "mainnet",
});

// Create trading package
const { tradingEngine, strategyEngine, strategyFactory } = createTradingPackage(blockchainAdapter, dexAdapter, priceOracleAdapter);

// Create a strategy
const priceTargetStrategy = strategyFactory.createStrategy("priceTarget", {
  targetPercentage: 5,
  direction: PriceDirection.DOWN,
  action: StrategyAction.BUY,
});

// Create a trade
const trade = await tradingEngine.createTrade({
  inputAsset: {
    symbol: "USDC",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    network: "solana",
  },
  outputAsset: {
    symbol: "SOL",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
    network: "solana",
  },
  inputAmount: BigInt(10_000_000), // 10 USDC
  strategies: [priceTargetStrategy],
  metadata: {
    walletAddress: "YOUR_WALLET_ADDRESS",
    privateKey: "YOUR_PRIVATE_KEY",
  },
});

// Monitor price and execute trade when strategy conditions are met
await tradingEngine.updatePriceData(trade.id);
```

## Architecture

The trading package is built with a modular architecture that separates concerns and allows for easy extension:

### Core Components

- **TradingEngine**: Orchestrates trades and manages the trading lifecycle
- **StrategyEngine**: Evaluates trading strategies and determines actions
- **StrategyFactory**: Creates strategy instances based on configuration

### Adapters

- **BlockchainAdapter**: Interface for blockchain interactions (e.g., SolanaAdapter)
- **DEXAdapter**: Interface for DEX interactions (e.g., JupiterAdapter)
- **PriceOracleAdapter**: Interface for price data (e.g., MoralisAdapter)

### Strategies

- **PriceTargetStrategy**: Triggers when price reaches a specific target
- **StopLossStrategy**: Triggers when price falls below a threshold
- **CompositeStrategy**: Combines multiple strategies with logical operators
- **SequentialStrategy**: Executes strategies in sequence
- **ConditionalStrategy**: Implements if-then-else logic
- **Custom Strategies**: Create your own by implementing the IStrategy interface

For a more detailed explanation of the architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Creating Custom Strategies

You can create custom strategies by extending the BaseStrategy class:

```typescript
import { BaseStrategy, StrategyContext, StrategyResult, StrategyAction } from "@trader/trading";

class MyCustomStrategy extends BaseStrategy {
  constructor() {
    super("My Custom Strategy", "Description of my strategy");
  }

  public evaluate(context: StrategyContext): StrategyResult {
    // Implement your strategy logic here
    const { currentPrice } = context;

    // Example: Buy when price is below 100
    if (currentPrice < 100) {
      return {
        action: StrategyAction.BUY,
        reason: "Price is below 100",
      };
    }

    return {
      action: StrategyAction.HOLD,
      reason: "Waiting for price to drop below 100",
    };
  }

  public getParameters() {
    // Define parameters for your strategy
    return [];
  }
}

// Register your strategy with the factory
strategyFactory.registerStrategyType("myCustom", MyCustomStrategy);

// Create an instance of your strategy
const myStrategy = strategyFactory.createStrategy("myCustom", {});
```

## Error Handling

The trading package includes robust error handling with retry mechanisms:

```typescript
try {
  const result = await tradingEngine.executeTrade(trade.id);
  console.log("Trade executed successfully:", result);
} catch (error) {
  console.error("Error executing trade:", error);

  // Retry the trade if appropriate
  if (error.message.includes("timeout")) {
    const retryResult = await tradingEngine.executeTrade(trade.id);
    console.log("Trade retry result:", retryResult);
  }
}
```

## Integration with Telegram Bot

The trading package is designed to integrate seamlessly with the Telegram bot:

```typescript
import { SolBot } from "@trader-stack/tg";
import { createTradingPackage, SolanaAdapter, JupiterAdapter, MoralisAdapter } from "@trader/trading";

// Initialize the bot
const bot = new SolBot({
  solanaEndpoint: "https://api.mainnet-beta.solana.com",
  metisEndpoint: "https://quote-api.jup.ag/v6",
  secretKey: yourSecretKey,
  logger: yourLogger,
});

// Initialize the trading package
await bot.init({ moralisApiKey: "YOUR_MORALIS_API_KEY" });

// Add a trade
await bot.addTrade({
  antiMEV: true,
  swapWith: SwapToken.SOL,
  buyAmount: 1000000000,
  numTokens: 0,
  mint: "TokenMint123456789abcdef",
  startingPrice: 100,
  price: 100,
  strategy: [
    {
      label: "Take profit at 2x",
      callback: () => false,
    },
  ],
});
```

## Examples

See the [examples](./examples) directory for more usage examples:

- [Simple Trade](./examples/simple-trade.ts): Basic example of creating and executing a trade
- [Comprehensive Example](./tests/examples/comprehensive-trading-example.ts): Complete example showing all features

## API Documentation

For detailed API documentation, see [API.md](./API.md).

## Contributing

For information on how to contribute to the trading package, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
