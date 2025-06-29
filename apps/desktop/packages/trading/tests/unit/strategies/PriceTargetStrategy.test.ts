import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PriceTargetStrategy } from "../../../src/strategies/PriceTargetStrategy";
import {
  StrategyAction,
  PriceDirection,
  TradeStatus,
} from "../../../src/domain/enums";
import {
  mockSolAsset,
  mockUsdcAsset,
  resetMocks,
  MOCK_DATE,
  mockPriceData,
} from "../../test-setup";

describe("PriceTargetStrategy", () => {
  let strategy: PriceTargetStrategy;

  beforeEach(() => {
    strategy = new PriceTargetStrategy();
  });

  afterEach(() => {
    resetMocks();
  });

  describe("constructor", () => {
    it("should initialize with correct name and description", () => {
      expect(strategy.name).toBe("Price Target Strategy");
      expect(strategy.description).toContain("specific target");
      expect(strategy.id).toBeDefined();
    });
  });

  describe("getParameters", () => {
    it("should return the correct parameter definitions", () => {
      const params = strategy.getParameters();

      expect(params).toHaveLength(4);

      // Check targetPrice parameter
      const targetPriceParam = params.find((p) => p.name === "targetPrice");
      expect(targetPriceParam).toBeDefined();
      expect(targetPriceParam?.required).toBe(false);

      // Check targetPercentage parameter
      const targetPercentageParam = params.find(
        (p) => p.name === "targetPercentage"
      );
      expect(targetPercentageParam).toBeDefined();
      expect(targetPercentageParam?.required).toBe(false);

      // Check direction parameter
      const directionParam = params.find((p) => p.name === "direction");
      expect(directionParam).toBeDefined();
      expect(directionParam?.required).toBe(true);
      expect(directionParam?.defaultValue).toBe(PriceDirection.UP);

      // Check action parameter
      const actionParam = params.find((p) => p.name === "action");
      expect(actionParam).toBeDefined();
      expect(actionParam?.required).toBe(true);
      expect(actionParam?.defaultValue).toBe(StrategyAction.SELL);
    });
  });

  describe("setParameters", () => {
    it("should set valid parameters", () => {
      // Act
      strategy.setParameters({
        targetPrice: 100,
        direction: PriceDirection.UP,
        action: StrategyAction.SELL,
      });

      // No assertion needed - if it doesn't throw, it's successful
    });

    it("should throw an error for invalid parameters", () => {
      // Act & Assert
      expect(() => {
        strategy.setParameters({
          targetPrice: -100, // Invalid - must be greater than 0
        });
      }).toThrow("Invalid parameters");
    });
  });

  describe("evaluate", () => {
    it("should trigger action when absolute price target is reached (upward)", () => {
      // Arrange
      strategy.setParameters({
        targetPrice: 110,
        direction: PriceDirection.UP,
        action: StrategyAction.SELL,
      });

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: {
            ...mockPriceData,
            currentPrice: 120, // Above target
          },
          metadata: {},
        },
        currentPrice: 120,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.SELL);
      expect(result.reason).toContain("Price target of 110.000000 reached");
    });

    it("should trigger action when absolute price target is reached (downward)", () => {
      // Arrange
      strategy.setParameters({
        targetPrice: 90,
        direction: PriceDirection.DOWN,
        action: StrategyAction.BUY,
      });

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: {
            ...mockPriceData,
            currentPrice: 80, // Below target
          },
          metadata: {},
        },
        currentPrice: 80,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.BUY);
      expect(result.reason).toContain("Price target of 90.000000 reached");
    });

    it("should trigger action when percentage price target is reached (upward)", () => {
      // Arrange
      strategy.setParameters({
        targetPercentage: 10, // 10% increase
        direction: PriceDirection.UP,
        action: StrategyAction.SELL,
      });

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: {
            ...mockPriceData,
            startingPrice: 100,
            currentPrice: 115, // 15% increase
          },
          metadata: {},
        },
        currentPrice: 115,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.SELL);
      expect(result.reason).toContain("Price target of 110.000000 reached");
    });

    it("should trigger action when percentage price target is reached (downward)", () => {
      // Arrange
      strategy.setParameters({
        targetPercentage: 10, // 10% decrease
        direction: PriceDirection.DOWN,
        action: StrategyAction.BUY,
      });

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: {
            ...mockPriceData,
            startingPrice: 100,
            currentPrice: 85, // 15% decrease
          },
          metadata: {},
        },
        currentPrice: 85,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.BUY);
      expect(result.reason).toContain("Price target of 90.000000 reached");
    });

    it("should not trigger action when price target is not reached (upward)", () => {
      // Arrange
      strategy.setParameters({
        targetPrice: 110,
        direction: PriceDirection.UP,
        action: StrategyAction.SELL,
      });

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: {
            ...mockPriceData,
            currentPrice: 105, // Below target
          },
          metadata: {},
        },
        currentPrice: 105,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.HOLD);
      expect(result.reason).toContain(
        "Price target of 110.000000 not yet reached"
      );
    });

    it("should not trigger action when price target is not reached (downward)", () => {
      // Arrange
      strategy.setParameters({
        targetPrice: 90,
        direction: PriceDirection.DOWN,
        action: StrategyAction.BUY,
      });

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: {
            ...mockPriceData,
            currentPrice: 95, // Above target
          },
          metadata: {},
        },
        currentPrice: 95,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.HOLD);
      expect(result.reason).toContain(
        "Price target of 90.000000 not yet reached"
      );
    });

    it("should return HOLD when no target price or percentage is specified", () => {
      // Arrange - don't set any parameters

      const context = {
        trade: {
          id: "mock-trade-id",
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          status: TradeStatus.PENDING,
          createdAt: MOCK_DATE,
          strategies: [strategy],
          priceData: mockPriceData,
          metadata: {},
        },
        currentPrice: 100,
        priceHistory: mockPriceData.priceHistory,
        marketData: {
          volume24h: 1000000,
          volumeChange24h: 5,
          liquidity: 5000000,
          marketCap: 100000000,
          fullyDilutedValuation: 200000000,
          totalSupply: BigInt(1000000000),
          circulatingSupply: BigInt(500000000),
        },
        walletBalances: {},
      };

      // Act
      const result = strategy.evaluate(context);

      // Assert
      expect(result.action).toBe(StrategyAction.HOLD);
      expect(result.reason).toContain(
        "No target price or percentage specified"
      );
    });
  });
});
