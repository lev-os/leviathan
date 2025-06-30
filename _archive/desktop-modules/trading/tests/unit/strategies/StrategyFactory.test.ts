import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StrategyFactory } from "../../../src/strategies/StrategyFactory";
import { PriceTargetStrategy } from "../../../src/strategies/PriceTargetStrategy";
import {
  PriceDirection,
  StrategyAction,
  TradeStatus,
} from "../../../src/domain/enums";
import { resetMocks } from "../../test-setup";
import { IStrategy } from "../../../src/domain/interfaces";

describe("StrategyFactory", () => {
  let strategyFactory: StrategyFactory;

  beforeEach(() => {
    strategyFactory = new StrategyFactory();
  });

  afterEach(() => {
    resetMocks();
  });

  describe("constructor", () => {
    it("should register built-in strategies", () => {
      // Act
      const availableTypes = strategyFactory.getAvailableStrategyTypes();

      // Assert
      expect(availableTypes).toContain("priceTarget");
    });
  });

  describe("registerStrategyType", () => {
    it("should register a new strategy type", () => {
      // Arrange
      class MockStrategy implements IStrategy {
        id = "mock-id";
        name = "Mock Strategy";
        description = "A mock strategy for testing";

        evaluate() {
          return {
            action: StrategyAction.HOLD,
            reason: "Mock reason",
          };
        }

        getParameters() {
          return [];
        }

        setParameters() {}
      }

      // Act
      strategyFactory.registerStrategyType("mockStrategy", MockStrategy);
      const availableTypes = strategyFactory.getAvailableStrategyTypes();

      // Assert
      expect(availableTypes).toContain("mockStrategy");
    });
  });

  describe("createStrategy", () => {
    it("should create a strategy of the specified type", () => {
      // Act
      const strategy = strategyFactory.createStrategy("priceTarget", {
        direction: PriceDirection.UP,
        action: StrategyAction.SELL,
      });

      // Assert
      expect(strategy).toBeInstanceOf(PriceTargetStrategy);
      expect(strategy.name).toBe("Price Target Strategy");
    });

    it("should set parameters on the created strategy", () => {
      // Arrange
      const params = {
        targetPrice: 100,
        direction: PriceDirection.UP,
        action: StrategyAction.SELL,
      };

      // Act
      const strategy = strategyFactory.createStrategy(
        "priceTarget",
        params
      ) as PriceTargetStrategy;

      // Assert
      expect(strategy).toBeInstanceOf(PriceTargetStrategy);

      // Verify parameters were set by evaluating with a context
      const result = strategy.evaluate({
        trade: {
          id: "mock-trade-id",
          inputAsset: {
            symbol: "SOL",
            address: "So11111111111111111111111111111111111111112",
            decimals: 9,
            network: "solana",
          },
          outputAsset: {
            symbol: "USDC",
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            decimals: 6,
            network: "solana",
          },
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: new Date(),
          strategies: [],
          priceData: {
            currentPrice: 110, // Above target
            startingPrice: 90,
            highPrice: 110,
            lowPrice: 90,
            priceHistory: [],
            lastUpdated: new Date(),
          },
          metadata: {},
        },
        currentPrice: 110,
        priceHistory: [],
        marketData: {
          volume24h: 0,
          volumeChange24h: 0,
          liquidity: 0,
          marketCap: 0,
          fullyDilutedValuation: 0,
          totalSupply: BigInt(0),
          circulatingSupply: BigInt(0),
        },
        walletBalances: {},
      });

      expect(result.action).toBe(StrategyAction.SELL);
    });

    it("should throw an error for unknown strategy type", () => {
      // Act & Assert
      expect(() => {
        strategyFactory.createStrategy("unknownType", {});
      }).toThrow("Unknown strategy type: unknownType");
    });
  });

  describe("getAvailableStrategyTypes", () => {
    it("should return all registered strategy types", () => {
      // Act
      const availableTypes = strategyFactory.getAvailableStrategyTypes();

      // Assert
      expect(availableTypes).toContain("priceTarget");
      expect(availableTypes.length).toBeGreaterThan(0);
    });
  });
});
