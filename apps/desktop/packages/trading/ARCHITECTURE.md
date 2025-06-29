# Trading Package Architecture

This document provides an in-depth explanation of the trading package architecture, design decisions, and component interactions.

## Table of Contents

- [High-Level Architecture Overview](#high-level-architecture-overview)
- [Core Components](#core-components)
  - [Trading Engine](#trading-engine)
  - [Strategy Engine](#strategy-engine)
  - [Strategy Factory](#strategy-factory)
- [Adapter System](#adapter-system)
  - [Blockchain Adapters](#blockchain-adapters)
  - [DEX Adapters](#dex-adapters)
  - [Price Oracle Adapters](#price-oracle-adapters)
- [Strategy System](#strategy-system)
  - [Strategy Class Hierarchy](#strategy-class-hierarchy)
  - [Strategy Types](#strategy-types)
  - [Strategy Composition](#strategy-composition)
  - [Strategy Evaluation Process](#strategy-evaluation-process)
- [Domain Models](#domain-models)
- [Error Handling & Logging](#error-handling--logging)
- [Integration Points](#integration-points)
  - [Telegram Bot Integration](#telegram-bot-integration)
  - [UI Integration](#ui-integration)
- [Future Enhancements](#future-enhancements)

## High-Level Architecture Overview

The trading package is built with a modular architecture that separates concerns and allows for easy extension. The architecture follows these key principles:

1. **Modularity**: Each component has a single responsibility and can be replaced or extended independently.
2. **Extensibility**: The system is designed to be extended with new adapters, strategies, and features.
3. **Testability**: Components are designed to be easily testable in isolation.
4. **Type Safety**: TypeScript is used throughout to ensure type safety and provide better developer experience.
5. **Dependency Injection**: Dependencies are injected rather than created internally, allowing for easier testing and configuration.

The high-level architecture can be visualized as follows:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Trading Package                           │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Trading Engine │  │ Strategy Engine │  │ Price Monitoring│  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐  │
│  │    Blockchain   │  │     Strategy    │  │  Price Oracle   │  │
│  │     Adapter     │  │     Factory     │  │     Adapter     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│  ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐  │
│  │  DEX Adapter    │  │    Strategies   │  │  Error Handling │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### Trading Engine

The Trading Engine is the central component that orchestrates the trading process. It is responsible for:

1. Creating and managing trades
2. Executing trades based on strategy evaluations
3. Tracking trade status and history
4. Coordinating between blockchain, DEX, and price oracle adapters

The Trading Engine exposes a simple API for creating, executing, and managing trades, while hiding the complexity of the underlying systems.

```typescript
class TradingEngine {
  constructor(blockchainAdapter: IBlockchainAdapter, dexAdapter: IDEXAdapter, priceOracleAdapter: IPriceOracleAdapter, strategyEngine: IStrategyEngine, config?: TradingEngineConfig) {
    // Initialize components
  }

  // Core methods
  async createTrade(params: CreateTradeParams): Promise<ITrade> {
    /* ... */
  }
  async executeTrade(tradeId: string): Promise<TradeResult> {
    /* ... */
  }
  async cancelTrade(tradeId: string): Promise<boolean> {
    /* ... */
  }
  async getTrade(tradeId: string): Promise<ITrade> {
    /* ... */
  }
  async listActiveTrades(): Promise<ITrade[]> {
    /* ... */
  }
  async updatePriceData(tradeId: string): Promise<ITrade> {
    /* ... */
  }
}
```

### Strategy Engine

The Strategy Engine evaluates trading strategies and determines actions based on market conditions. It is responsible for:

1. Managing strategy registration and lifecycle
2. Evaluating strategies for trades
3. Aggregating strategy results to determine the final action
4. Providing explanations for strategy decisions

The Strategy Engine works closely with the Trading Engine to determine when and how to execute trades.

```typescript
class StrategyEngine {
  constructor(strategyFactory: IStrategyFactory) {
    // Initialize components
  }

  // Core methods
  registerStrategy(strategy: IStrategy): void {
    /* ... */
  }
  unregisterStrategy(strategyId: string): boolean {
    /* ... */
  }
  getStrategy(strategyId: string): IStrategy | null {
    /* ... */
  }
  listStrategies(): IStrategy[] {
    /* ... */
  }
  async evaluateStrategies(trade: ITrade): Promise<StrategyEvaluationResult> {
    /* ... */
  }
}
```

### Strategy Factory

The Strategy Factory creates strategy instances based on configuration. It is responsible for:

1. Creating strategies of different types
2. Managing strategy registration
3. Providing a catalog of available strategy types

The Strategy Factory allows for easy creation of strategies without needing to know the implementation details.

```typescript
class StrategyFactory {
  constructor() {
    // Register built-in strategies
  }

  // Core methods
  createStrategy(type: string, params: Record<string, any>): IStrategy {
    /* ... */
  }
  getAvailableStrategyTypes(): string[] {
    /* ... */
  }
  registerStrategyType(type: string, constructor: new (params: any) => IStrategy): void {
    /* ... */
  }
}
```

## Adapter System

The adapter system provides a clean abstraction layer for interacting with external systems. Each adapter type has a well-defined interface that can be implemented for different providers.

### Blockchain Adapters

Blockchain adapters provide an interface for interacting with blockchain networks. They are responsible for:

1. Getting account balances
2. Signing transactions
3. Submitting transactions
4. Checking transaction status

The current implementation includes:

- **SolanaAdapter**: Adapter for the Solana blockchain

```typescript
interface IBlockchainAdapter {
  getBalance(address: string, asset: ITradableAsset): Promise<bigint>;
  signTransaction(transaction: any, privateKey: string): Promise<any>;
  submitTransaction(signedTransaction: any): Promise<string>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}
```

### DEX Adapters

DEX adapters provide an interface for interacting with decentralized exchanges. They are responsible for:

1. Getting quotes for swaps
2. Building swap transactions
3. Getting swap instructions

The current implementation includes:

- **JupiterAdapter**: Adapter for the Jupiter aggregator on Solana

```typescript
interface IDEXAdapter {
  getQuote(params: QuoteParams): Promise<QuoteResult>;
  buildSwapTransaction(params: SwapParams): Promise<any>;
  getSwapInstructions(params: SwapParams): Promise<any>;
}
```

### Price Oracle Adapters

Price oracle adapters provide an interface for getting price data. They are responsible for:

1. Getting current prices
2. Getting price history
3. Getting token metadata

The current implementation includes:

- **MoralisAdapter**: Adapter for the Moralis API

```typescript
interface IPriceOracleAdapter {
  getPrice(asset: ITradableAsset | string): Promise<number>;
  getTokenMetadata(asset: ITradableAsset): Promise<TokenMetadata>;
  getPriceHistory(asset: ITradableAsset | string, timeframe: Timeframe): Promise<PricePoint[]>;
}
```

## Strategy System

The strategy system is designed to be flexible and extensible, allowing for the creation of complex trading strategies through composition.

### Strategy Class Hierarchy

The strategy system is built around a class hierarchy that provides common functionality while allowing for specialized behavior:

```
IStrategy (interface)
└── BaseStrategy (abstract class)
    ├── PriceTargetStrategy
    ├── StopLossStrategy
    ├── TimeBasedStrategy
    ├── VolumeBasedStrategy
    ├── CompositeStrategy
    ├── SequentialStrategy
    └── ConditionalStrategy
```

### Strategy Types

The trading package includes several built-in strategy types:

1. **PriceTargetStrategy**: Triggers when price reaches a specific target (absolute or percentage)
2. **StopLossStrategy**: Triggers when price falls below a certain threshold to limit losses
3. **TimeBasedStrategy**: Executes a specific action after a time condition is met
4. **VolumeBasedStrategy**: Triggers based on trading volume conditions

### Strategy Composition

Strategies can be composed to create more complex behaviors:

1. **CompositeStrategy**: Combines multiple strategies using logical operators (AND, OR)
2. **SequentialStrategy**: Executes strategies in sequence, moving to the next only when the current one is triggered
3. **ConditionalStrategy**: Implements if-then-else logic based on a condition

### Strategy Evaluation Process

The strategy evaluation process follows these steps:

1. The Trading Engine requests a strategy evaluation from the Strategy Engine
2. The Strategy Engine evaluates each strategy associated with the trade
3. Each strategy returns a result with an action and reason
4. The Strategy Engine aggregates the results to determine the final action
5. The Trading Engine executes the action if necessary

## Domain Models

The trading package uses a set of domain models to represent the core concepts:

1. **ITradableAsset**: Represents a tradable asset with symbol, address, decimals, and network
2. **ITrade**: Represents a trade with input/output assets, amounts, status, and strategies
3. **IPriceData**: Represents price data with current price, history, and metadata
4. **IStrategy**: Represents a trading strategy with evaluation logic and parameters
5. **StrategyContext**: Provides context for strategy evaluation
6. **StrategyResult**: Represents the result of a strategy evaluation

## Error Handling & Logging

The trading package includes robust error handling and logging:

1. **Error Types**: Specialized error types for different failure scenarios
2. **Retry Mechanisms**: Automatic retry for transient failures
3. **Logging**: Comprehensive logging for debugging and auditing
4. **Error Context**: Rich context for errors to aid in troubleshooting

## Integration Points

### Telegram Bot Integration

The trading package is designed to integrate seamlessly with the Telegram bot:

1. The bot initializes the trading package with appropriate adapters
2. The bot creates trades based on user commands
3. The bot monitors trades and executes them when strategy conditions are met
4. The bot provides status updates to users

```typescript
// In the Telegram bot
async init({ moralisApiKey }: { moralisApiKey: string }) {
  // Create adapters
  const blockchainAdapter = new SolanaAdapter({
    endpoint: this.solanaEndpoint,
  });

  const dexAdapter = new JupiterAdapter({
    endpoint: this.metisEndpoint,
  });

  const priceOracleAdapter = new MoralisAdapter({
    apiKey: moralisApiKey,
    network: "mainnet",
  });

  // Create trading package
  const { tradingEngine, strategyEngine, strategyFactory } = createTradingPackage(
    blockchainAdapter,
    dexAdapter,
    priceOracleAdapter
  );

  this.tradingEngine = tradingEngine;
  this.strategyEngine = strategyEngine;
  this.strategyFactory = strategyFactory;
}
```

### UI Integration

The trading package can also be integrated with a UI:

1. The UI initializes the trading package with appropriate adapters
2. The UI provides interfaces for creating and managing trades
3. The UI displays trade status and history
4. The UI allows for strategy configuration

## Future Enhancements

Potential future enhancements to the trading package include:

1. **Additional Blockchain Adapters**: Support for Ethereum, Binance Smart Chain, etc.
2. **Additional DEX Adapters**: Support for Uniswap, PancakeSwap, etc.
3. **Additional Price Oracle Adapters**: Support for CoinGecko, CoinMarketCap, etc.
4. **Advanced Strategies**: More sophisticated trading strategies
5. **Backtesting**: Support for backtesting strategies against historical data
6. **Portfolio Management**: Support for managing a portfolio of assets
7. **Risk Management**: Advanced risk management features
8. **Analytics**: Detailed analytics and reporting

## Testing

The best approach for unit testing against @solana/web3.js involves simulating the Solana blockchain in a controlled environment using BankRun.

Okay, here is a condensed testing strategy based on the provided text, tailored for consumption by an AI coding agent generating tests for a Solana web3.js/spl-token project:

**Solana Testing Strategy (for AI Agent)**

**Overall Goal:** Generate reliable tests using a hybrid approach: focused unit tests with minimal mocking and realistic integration tests using Bankrun.

**1. Unit Testing:**

- **Framework:** Use `vitest`.
- **Purpose:** Test isolated application logic (utility functions, data transformations, logic _preparing_ SDK calls, UI component logic processing SDK results) in isolation and at high speed.
- **Mocking Strategy:**
  - **Target:** Use spies/stubs (e.g., `vi.spyOn`) to mock _only specific, individual methods_ directly called by the unit under test on `@solana/web3.js` (`Connection`) or `@solana/spl-token` instances.
  - **Examples:** Mock `connection.getAccountInfo`, `connection.getBalance`, `splToken.createTransferInstruction`, `splToken.getOrCreateAssociatedTokenAccount`.
  - **STRICT RULE:** **NEVER** mock the entire `Connection` class or the whole `@solana/spl-token` library/namespace. Do not attempt to replicate library internals.
  - **Accuracy:** Mocks must return realistic data structures. Leverage TypeScript types (e.g., `AccountInfo`, `TransactionInstruction`, use `ReturnType<...>`) for structural correctness. Simulate both success and plausible error scenarios relevant to the unit test.
  - **Prohibited:** **Do NOT mock transaction submission/confirmation functions** like `sendAndConfirmTransaction`, `sendTransaction`, `confirmTransaction`, or `simulateTransaction` in unit tests. Their behavior is too complex and dependent on runtime state to mock reliably.

**2. Integration Testing:**

- **Framework:** Use `vitest`.
- **Environment:** Use `Bankrun` (`solana-bankrun` or `anchor-bankrun`).
- **Purpose:** Test the interaction between your application code, the Solana SDKs (`@solana/web3.js`, `@solana/spl-token`), and deployed Solana programs within a simulated, fast, in-process environment. Verify key user flows and state changes.
- **Scope:**
  - Transaction lifecycle: Instruction creation, transaction building, signing, submission (using Bankrun's processing methods), and verifying results.
  - State changes: Confirming expected changes in account data and token balances post-transaction.
  - Data fetching: Verifying reads against the Bankrun context state.
  - SPL Token Operations: Test minting, transferring, burning, ATA creation against the SPL Token program within Bankrun.
  - Program Interactions: Verify calls to your custom deployed programs work as expected.
- **Setup & Execution:**
  - Use Bankrun's context features to set up the environment (load programs, create accounts, fund accounts, set initial state). Ensure test isolation.
  - Utilize Bankrun features like clock manipulation for time-dependent logic if necessary.
  - Follow the Arrange-Act-Assert (AAA) pattern.
  - Interact with the Bankrun context using standard `@solana/web3.js` calls where applicable, but use Bankrun's methods for transaction processing/confirmation.
  - Assert outcomes by querying the Bankrun context state (`getAccount`, checking balances, etc.).

**3. General Principles:**

- **TypeScript:** Use TypeScript for type safety in both test code and mocks.
- **Test Boundaries:** Focus tests on the public API and observable behavior/state changes, not internal implementation details.
- **Coverage:** Test error conditions, edge cases (e.g., insufficient funds, invalid inputs), and security paths (e.g., wrong signer), not just the "happy path".
- **Be Mindful:** While Bankrun is fast, remember it simulates the bank logic, not full network conditions. Test core program logic and interactions thoroughly.

4. Example using Bankrun:

```
   import { Keypair, Transaction } from '@solana/web3.js';
   import { BanksClient, BanksClientConfig } from '@solana/rpc-core';

async function runTest() {
// Create a BanksClient instance (or use the one from your test setup)
const config: BanksClientConfig = {};
const banksClient = new BanksClient(config);

    // Create a keypair for the payer
    const payer = Keypair.generate();

    // Build a transaction and simulate it
    const transaction = new Transaction();
    // Add your instructions here
    // ...

    // Sign the transaction
    transaction.sign([payer]);

    // Process the transaction
    const { blockhash } = await banksClient.getLatestBlockhash({
        commitment: 'confirmed',
    });
    const { blockhash: confirmedBlockhash, lastValidBlockHeight } =
        await banksClient.processTransaction(
            transaction,
            blockhash,
            { commitment: 'confirmed' }
        );

    // Assert results (e.g., using chai)
    // ...

}

Key Considerations: [6]

• Isolate your code: Unit tests should focus on testing individual components in isolation, avoiding dependencies on external systems. [6]
• Use mocks and stubs: If you need to interact with external dependencies, mock them to create controlled test environments. [6]
• Follow the Arrange-Act-Assert pattern: This pattern helps structure your tests clearly by defining the setup, action, and assertion steps. [6]
• Use a testing framework: Frameworks like Jest, Mocha, or Jasmine provide tools for writing and running tests, including assertion libraries and test runners. [8]
```
