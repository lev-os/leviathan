# Contributing to @trader/trading

Thank you for your interest in contributing to the trading package! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Creating New Adapters](#creating-new-adapters)
- [Creating New Strategies](#creating-new-strategies)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/trader-stack.git`
3. Navigate to the trading package: `cd trader-stack/packages/trading`
4. Install dependencies: `npm install`
5. Build the package: `npm run build`
6. Run tests: `npm test`

## Development Workflow

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Write or update tests for your changes
4. Ensure all tests pass: `npm test`
5. Update documentation as needed
6. Commit your changes with a descriptive commit message
7. Push your branch to your fork: `git push origin feature/your-feature-name`
8. Create a pull request

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the README.md or other documentation with details of changes if appropriate
3. Include tests that verify your changes
4. The pull request will be merged once it receives approval from maintainers

## Coding Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Write clear comments for complex logic
- Follow the existing code style and structure
- Use interfaces for type definitions
- Avoid any-type when possible
- Use async/await for asynchronous code

## Testing Guidelines

- Write unit tests for all new functionality
- Update existing tests when modifying functionality
- Aim for high test coverage
- Use mocks for external dependencies
- Test edge cases and error conditions
- Run tests before submitting a pull request

The project uses Vitest for testing. You can run tests with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Documentation Guidelines

- Document all public APIs
- Use JSDoc comments for functions and classes
- Keep documentation up-to-date with code changes
- Provide examples for complex functionality
- Update README.md when adding new features

## Creating New Adapters

The trading package uses adapters to interact with different blockchains, DEXes, and price oracles. To create a new adapter:

1. Identify the adapter type (blockchain, DEX, or price oracle)
2. Create a new file in the appropriate directory (e.g., `src/adapters/blockchain/MyAdapter.ts`)
3. Implement the corresponding interface (e.g., `IBlockchainAdapter`)
4. Add tests for your adapter
5. Export your adapter in the appropriate index file
6. Update documentation to include your new adapter

Example of a new blockchain adapter:

```typescript
import { IBlockchainAdapter, BlockchainAdapterConfig, TransactionStatus } from "./interfaces";
import { ITradableAsset } from "../../domain/interfaces";

export interface MyAdapterConfig extends BlockchainAdapterConfig {
  // Add any specific configuration options
  customOption?: string;
}

export class MyAdapter implements IBlockchainAdapter {
  private config: MyAdapterConfig;

  constructor(config: MyAdapterConfig) {
    this.config = config;
  }

  async getBalance(address: string, asset: ITradableAsset): Promise<bigint> {
    // Implementation
  }

  async signTransaction(transaction: any, privateKey: string): Promise<any> {
    // Implementation
  }

  async submitTransaction(signedTransaction: any): Promise<string> {
    // Implementation
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    // Implementation
  }
}
```

## Creating New Strategies

To create a new trading strategy:

1. Create a new file in the `src/strategies` directory (e.g., `src/strategies/MyStrategy.ts`)
2. Extend the `BaseStrategy` class or implement the `IStrategy` interface
3. Implement the required methods
4. Add tests for your strategy
5. Register your strategy in the `StrategyFactory`
6. Update documentation to include your new strategy

Example of a new strategy:

```typescript
import { BaseStrategy } from "./BaseStrategy";
import { StrategyContext, StrategyResult, StrategyAction } from "../domain/interfaces";
import { StrategyParameter, ParameterType } from "../domain/enums";

export interface MyStrategyParams {
  threshold: number;
  action: StrategyAction;
}

export class MyStrategy extends BaseStrategy {
  private threshold: number;
  private action: StrategyAction;

  constructor(params: MyStrategyParams) {
    super();
    this.setParameters(params);
  }

  public evaluate(context: StrategyContext): StrategyResult {
    const { currentPrice } = context;

    if (currentPrice > this.threshold) {
      return {
        action: this.action,
        reason: `Price ${currentPrice} is above threshold ${this.threshold}`,
      };
    }

    return {
      action: StrategyAction.HOLD,
      reason: `Price ${currentPrice} is below threshold ${this.threshold}`,
    };
  }

  public getParameters(): StrategyParameter[] {
    return [
      {
        name: "threshold",
        type: ParameterType.NUMBER,
        description: "Price threshold for triggering the strategy",
        defaultValue: 100,
        required: true,
      },
      {
        name: "action",
        type: ParameterType.ENUM,
        description: "Action to take when threshold is reached",
        defaultValue: StrategyAction.BUY,
        required: true,
      },
    ];
  }

  public setParameters(params: MyStrategyParams): void {
    this.threshold = params.threshold;
    this.action = params.action;
  }
}
```

Then register your strategy in the `StrategyFactory`:

```typescript
// In StrategyFactory.ts
this.registerStrategyType("myStrategy", MyStrategy);
```
