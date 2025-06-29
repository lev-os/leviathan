# @trader/trading API Documentation

This document provides detailed API documentation for the trading package.

## Table of Contents

- [Core Components](#core-components)
  - [TradingEngine](#tradingengine)
  - [StrategyEngine](#strategyengine)
  - [StrategyFactory](#strategyfactory)
- [Adapters](#adapters)
  - [BlockchainAdapter](#blockchainadapter)
  - [DEXAdapter](#dexadapter)
  - [PriceOracleAdapter](#priceoracleadapter)
- [Strategies](#strategies)
  - [BaseStrategy](#basestrategy)
  - [PriceTargetStrategy](#pricetargetstrategy)
  - [StopLossStrategy](#stoplossstrategy)
  - [CompositeStrategy](#compositestrategy)
  - [SequentialStrategy](#sequentialstrategy)
  - [ConditionalStrategy](#conditionalstrategy)
- [Domain Models](#domain-models)
  - [ITradableAsset](#itradableasset)
  - [ITrade](#itrade)
  - [IPriceData](#ipricedata)
  - [IStrategy](#istrategy)
  - [StrategyContext](#strategycontext)
  - [StrategyResult](#strategyresult)
- [Enums](#enums)
  - [TradeStatus](#tradestatus)
  - [StrategyAction](#strategyaction)
  - [PriceDirection](#pricedirection)
  - [ParameterType](#parametertype)
- [Factory Function](#factory-function)
  - [createTradingPackage](#createtradingpackage)

## Core Components

### TradingEngine

The `TradingEngine` is the main entry point for creating and managing trades.

```typescript
class TradingEngine implements ITradingEngine {
  constructor(blockchainAdapter: IBlockchainAdapter, dexAdapter: IDEXAdapter, priceOracleAdapter: IPriceOracleAdapter, strategyEngine: IStrategyEngine, config?: TradingEngineConfig);

  // Creates a new trade
  async createTrade(params: CreateTradeParams): Promise<ITrade>;

  // Executes a trade
  async executeTrade(tradeId: string): Promise<TradeResult>;

  // Cancels a trade
  async cancelTrade(tradeId: string): Promise<boolean>;

  // Gets a trade by ID
  async getTrade(tradeId: string): Promise<ITrade>;

  // Lists all active trades
  async listActiveTrades(): Promise<ITrade[]>;

  // Updates price data for a trade
  async updatePriceData(tradeId: string): Promise<ITrade>;
}
```

#### TradingEngineConfig

```typescript
interface TradingEngineConfig {
  defaultSlippageTolerance?: number;
  defaultTransactionTimeout?: number;
  defaultRetryAttempts?: number;
}
```

#### CreateTradeParams

```typescript
interface CreateTradeParams {
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  strategies: IStrategy[];
  metadata?: Record<string, any>;
}
```

#### TradeResult

```typescript
interface TradeResult {
  trade: ITrade;
  success: boolean;
  transactionId?: string;
  error?: Error;
}
```

### StrategyEngine

The `StrategyEngine` evaluates trading strategies and determines actions.

```typescript
class StrategyEngine implements IStrategyEngine {
  constructor(strategyFactory: IStrategyFactory);

  // Registers a strategy
  registerStrategy(strategy: IStrategy): void;

  // Unregisters a strategy
  unregisterStrategy(strategyId: string): boolean;

  // Gets a strategy by ID
  getStrategy(strategyId: string): IStrategy | null;

  // Lists all registered strategies
  listStrategies(): IStrategy[];

  // Evaluates strategies for a trade
  async evaluateStrategies(trade: ITrade): Promise<StrategyEvaluationResult>;
}
```

#### StrategyEvaluationResult

```typescript
interface StrategyEvaluationResult {
  trade: ITrade;
  results: StrategyResult[];
  aggregatedAction: StrategyAction;
  explanation: string;
}
```

### StrategyFactory

The `StrategyFactory` creates strategy instances based on configuration.

```typescript
class StrategyFactory implements IStrategyFactory {
  constructor();

  // Creates a strategy of the specified type
  createStrategy(type: string, params: Record<string, any>): IStrategy;

  // Gets available strategy types
  getAvailableStrategyTypes(): string[];

  // Registers a new strategy type
  registerStrategyType(type: string, constructor: new (params: any) => IStrategy): void;
}
```

## Adapters

### BlockchainAdapter

The `BlockchainAdapter` interface defines methods for blockchain interactions.

```typescript
interface IBlockchainAdapter {
  // Gets the balance of an asset for an address
  getBalance(address: string, asset: ITradableAsset): Promise<bigint>;

  // Signs a transaction
  signTransaction(transaction: any, privateKey: string): Promise<any>;

  // Submits a transaction
  submitTransaction(signedTransaction: any): Promise<string>;

  // Gets the status of a transaction
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}
```

#### SolanaAdapter

```typescript
class SolanaAdapter implements IBlockchainAdapter {
  constructor(config: SolanaAdapterConfig);

  // Implements IBlockchainAdapter methods
}
```

#### SolanaAdapterConfig

```typescript
interface SolanaAdapterConfig extends BlockchainAdapterConfig {
  endpoint: string;
  commitment?: "processed" | "confirmed" | "finalized";
}
```

### DEXAdapter

The `DEXAdapter` interface defines methods for DEX interactions.

```typescript
interface IDEXAdapter {
  // Gets a quote for a swap
  getQuote(params: QuoteParams): Promise<QuoteResult>;

  // Builds a swap transaction
  buildSwapTransaction(params: SwapParams): Promise<any>;

  // Gets swap instructions
  getSwapInstructions(params: SwapParams): Promise<any>;
}
```

#### JupiterAdapter

```typescript
class JupiterAdapter implements IDEXAdapter {
  constructor(config: JupiterAdapterConfig);

  // Implements IDEXAdapter methods
}
```

#### JupiterAdapterConfig

```typescript
interface JupiterAdapterConfig extends DEXAdapterConfig {
  endpoint: string;
  slippageTolerance?: number;
}
```

#### QuoteParams

```typescript
interface QuoteParams {
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  slippageTolerance: number;
}
```

#### QuoteResult

```typescript
interface QuoteResult {
  inputAmount: bigint;
  outputAmount: bigint;
  price: number;
  priceImpact: number;
  route: any;
  validUntil: Date;
}
```

#### SwapParams

```typescript
interface SwapParams extends QuoteParams {
  walletAddress: string;
  quoteResult: QuoteResult;
}
```

### PriceOracleAdapter

The `PriceOracleAdapter` interface defines methods for price data.

```typescript
interface IPriceOracleAdapter {
  // Gets the current price of an asset
  getPrice(asset: ITradableAsset | string): Promise<number>;

  // Gets metadata for a token
  getTokenMetadata(asset: ITradableAsset): Promise<TokenMetadata>;

  // Gets price history for an asset
  getPriceHistory(asset: ITradableAsset | string, timeframe: Timeframe): Promise<PricePoint[]>;
}
```

#### MoralisAdapter

```typescript
class MoralisAdapter implements IPriceOracleAdapter {
  constructor(config: MoralisAdapterConfig);

  // Implements IPriceOracleAdapter methods
}
```

#### MoralisAdapterConfig

```typescript
interface MoralisAdapterConfig extends PriceOracleAdapterConfig {
  apiKey: string;
  network: string;
}
```

#### TokenMetadata

```typescript
interface TokenMetadata {
  name: string;
  symbol: string;
  logo?: string;
  marketCap?: number;
  totalSupply?: bigint;
  circulatingSupply?: bigint;
  links?: Record<string, string>;
}
```

#### Timeframe

```typescript
interface Timeframe {
  start: Date;
  end: Date;
  interval: TimeInterval;
}
```

## Strategies

### BaseStrategy

The `BaseStrategy` class provides a base implementation for strategies.

```typescript
abstract class BaseStrategy implements IStrategy {
  protected id: string;
  protected name: string;
  protected description: string;
  protected parameters: Map<string, any>;

  constructor(name?: string, description?: string);

  // Gets the strategy ID
  getId(): string;

  // Gets the strategy name
  getName(): string;

  // Gets the strategy description
  getDescription(): string;

  // Gets the strategy parameters
  abstract getParameters(): StrategyParameter[];

  // Sets the strategy parameters
  abstract setParameters(params: Record<string, any>): void;

  // Evaluates the strategy
  abstract evaluate(context: StrategyContext): StrategyResult;

  // Validates parameters
  protected validateParameters(params: Record<string, any>): boolean;
}
```

### PriceTargetStrategy

The `PriceTargetStrategy` triggers when price reaches a specific target.

```typescript
class PriceTargetStrategy extends BaseStrategy {
  constructor(params: PriceTargetStrategyParams);

  // Implements BaseStrategy methods
}
```

#### PriceTargetStrategyParams

```typescript
interface PriceTargetStrategyParams {
  targetPrice?: number;
  targetPercentage?: number;
  direction: PriceDirection;
  action: StrategyAction;
}
```

### StopLossStrategy

The `StopLossStrategy` triggers when price falls below a threshold.

```typescript
class StopLossStrategy extends BaseStrategy {
  constructor(params: StopLossStrategyParams);

  // Implements BaseStrategy methods
}
```

#### StopLossStrategyParams

```typescript
interface StopLossStrategyParams {
  stopPrice?: number;
  stopPercentage?: number;
  action: StrategyAction;
}
```

### CompositeStrategy

The `CompositeStrategy` combines multiple strategies using logical operators.

```typescript
class CompositeStrategy extends BaseStrategy {
  constructor(params: CompositeStrategyParams);

  // Adds a strategy
  addStrategy(strategy: IStrategy): void;

  // Removes a strategy
  removeStrategy(strategyId: string): boolean;

  // Implements BaseStrategy methods
}
```

#### CompositeStrategyParams

```typescript
interface CompositeStrategyParams {
  strategies: IStrategy[];
  operator: LogicalOperator;
}
```

### SequentialStrategy

The `SequentialStrategy` executes strategies in sequence.

```typescript
class SequentialStrategy extends BaseStrategy {
  constructor(params: SequentialStrategyParams);

  // Resets the strategy
  reset(): void;

  // Implements BaseStrategy methods
}
```

#### SequentialStrategyParams

```typescript
interface SequentialStrategyParams {
  strategies: IStrategy[];
}
```

### ConditionalStrategy

The `ConditionalStrategy` implements if-then-else logic.

```typescript
class ConditionalStrategy extends BaseStrategy {
  constructor(params: ConditionalStrategyParams);

  // Implements BaseStrategy methods
}
```

#### ConditionalStrategyParams

```typescript
interface ConditionalStrategyParams {
  condition: IStrategy;
  thenStrategy: IStrategy;
  elseStrategy?: IStrategy;
}
```

## Domain Models

### ITradableAsset

```typescript
interface ITradableAsset {
  symbol: string;
  address: string;
  decimals: number;
  network: string;
}
```

### ITrade

```typescript
interface ITrade {
  id: string;
  inputAsset: ITradableAsset;
  outputAsset: ITradableAsset;
  inputAmount: bigint;
  expectedOutputAmount?: bigint;
  actualOutputAmount?: bigint;
  status: TradeStatus;
  createdAt: Date;
  executedAt?: Date;
  strategies: IStrategy[];
  priceData: IPriceData;
  metadata: Record<string, any>;
}
```

### IPriceData

```typescript
interface IPriceData {
  currentPrice: number;
  startingPrice: number;
  highPrice: number;
  lowPrice: number;
  priceHistory: PricePoint[];
  lastUpdated: Date;
}
```

### IStrategy

```typescript
interface IStrategy {
  id: string;
  name: string;
  description: string;
  evaluate(context: StrategyContext): StrategyResult;
  getParameters(): StrategyParameter[];
  setParameters(params: Record<string, any>): void;
}
```

### StrategyContext

```typescript
interface StrategyContext {
  trade: ITrade;
  currentPrice: number;
  priceHistory: PricePoint[];
  marketData: MarketData;
  walletBalances: Record<string, bigint>;
}
```

### StrategyResult

```typescript
interface StrategyResult {
  action: StrategyAction;
  reason: string;
  suggestedParams?: Record<string, any>;
}
```

## Enums

### TradeStatus

```typescript
enum TradeStatus {
  PENDING,
  ACTIVE,
  COMPLETED,
  FAILED,
  CANCELLED,
}
```

### StrategyAction

```typescript
enum StrategyAction {
  HOLD,
  BUY,
  SELL,
  CANCEL,
}
```

### PriceDirection

```typescript
enum PriceDirection {
  UP,
  DOWN,
}
```

### ParameterType

```typescript
enum ParameterType {
  NUMBER,
  STRING,
  BOOLEAN,
  ENUM,
  ASSET,
}
```

## Factory Function

### createTradingPackage

```typescript
function createTradingPackage(
  blockchainAdapter: IBlockchainAdapter,
  dexAdapter: IDEXAdapter,
  priceOracleAdapter: IPriceOracleAdapter,
  config?: TradingEngineConfig
): {
  tradingEngine: TradingEngine;
  strategyEngine: StrategyEngine;
  strategyFactory: StrategyFactory;
};
```

This function creates a new trading package instance with the specified adapters and configuration.
