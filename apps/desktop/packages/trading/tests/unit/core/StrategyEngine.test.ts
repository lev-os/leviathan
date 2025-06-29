import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { StrategyEngine } from "../../../src/core/StrategyEngine";
import { StrategyFactory } from "../../../src/strategies/StrategyFactory";
import { StrategyAction, TradeStatus } from "../../../src/domain/enums";
import {
  mockSolAsset,
  mockUsdcAsset,
  resetMocks,
  MOCK_DATE,
  mockPriceData,
} from "../../test-setup";
import {
  IStrategy,
  StrategyContext,
  StrategyResult,
} from "../../../src/domain/interfaces";

describe("StrategyEngine", () => {
  let strategyEngine: StrategyEngine;
  let strategyFactory: StrategyFactory;
  let mockStrategy1: IStrategy;
  let mockStrategy2: IStrategy;

  beforeEach(() => {
    // Create strategy factory
    strategyFactory = new StrategyFactory();

    // Create strategy engine
    strategyEngine = new StrategyEngine(strategyFactory);

    // Create mock strategies
    mockStrategy1 = {
      id: "mock-strategy-1",
      name: "Mock Strategy 1",
      description: "First mock strategy for testing",
      evaluate: vi.fn().mockReturnValue({
        action: StrategyAction.HOLD,
        reason: "Default hold action",
      }),
      getParameters: vi.fn().mockReturnValue([]),
      setParameters: vi.fn(),
    };

    mockStrategy2 = {
      id: "mock-strategy-2",
      name: "Mock Strategy 2",
      description: "Second mock strategy for testing",
      evaluate: vi.fn().mockReturnValue({
        action: StrategyAction.HOLD,
        reason: "Default hold action",
      }),
      getParameters: vi.fn().mockReturnValue([]),
      setParameters: vi.fn(),
    };
  });

  afterEach(() => {
    resetMocks();
  });

  describe("registerStrategy", () => {
    it("should register a strategy", () => {
      // Act
      strategyEngine.registerStrategy(mockStrategy1);

      // Assert
      const strategies = strategyEngine.listStrategies();
      expect(strategies).toHaveLength(1);
      expect(strategies[0]).toBe(mockStrategy1);
    });

    it("should register multiple strategies", () => {
      // Act
      strategyEngine.registerStrategy(mockStrategy1);
      strategyEngine.registerStrategy(mockStrategy2);

      // Assert
      const strategies = strategyEngine.listStrategies();
      expect(strategies).toHaveLength(2);
      expect(strategies).toContain(mockStrategy1);
      expect(strategies).toContain(mockStrategy2);
    });
  });

  describe("unregisterStrategy", () => {
    it("should unregister a strategy", () => {
      // Arrange
      strategyEngine.registerStrategy(mockStrategy1);
      strategyEngine.registerStrategy(mockStrategy2);

      // Act
      const result = strategyEngine.unregisterStrategy(mockStrategy1.id);

      // Assert
      expect(result).toBe(true);
      const strategies = strategyEngine.listStrategies();
      expect(strategies).toHaveLength(1);
      expect(strategies[0]).toBe(mockStrategy2);
    });

    it("should return false when unregistering a non-existent strategy", () => {
      // Act
      const result = strategyEngine.unregisterStrategy("non-existent-id");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getStrategy", () => {
    it("should get a registered strategy by ID", () => {
      // Arrange
      strategyEngine.registerStrategy(mockStrategy1);

      // Act
      const strategy = strategyEngine.getStrategy(mockStrategy1.id);

      // Assert
      expect(strategy).toBe(mockStrategy1);
    });

    it("should return null for a non-existent strategy ID", () => {
      // Act
      const strategy = strategyEngine.getStrategy("non-existent-id");

      // Assert
      expect(strategy).toBeNull();
    });
  });

  describe("listStrategies", () => {
    it("should list all registered strategies", () => {
      // Arrange
      strategyEngine.registerStrategy(mockStrategy1);
      strategyEngine.registerStrategy(mockStrategy2);

      // Act
      const strategies = strategyEngine.listStrategies();

      // Assert
      expect(strategies).toHaveLength(2);
      expect(strategies).toContain(mockStrategy1);
      expect(strategies).toContain(mockStrategy2);
    });

    it("should return an empty array when no strategies are registered", () => {
      // Act
      const strategies = strategyEngine.listStrategies();

      // Assert
      expect(strategies).toEqual([]);
    });
  });

  describe("evaluateStrategies", () => {
    it("should evaluate all strategies associated with a trade", async () => {
      // Arrange
      const mockTrade = {
        id: "mock-trade-id",
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        status: TradeStatus.PENDING,
        createdAt: MOCK_DATE,
        strategies: [mockStrategy1, mockStrategy2],
        priceData: mockPriceData,
        metadata: {},
      };

      // Configure mock strategies to return different actions
      vi.mocked(mockStrategy1.evaluate).mockReturnValue({
        action: StrategyAction.BUY,
        reason: "Buy signal triggered",
      });

      vi.mocked(mockStrategy2.evaluate).mockReturnValue({
        action: StrategyAction.HOLD,
        reason: "Hold signal triggered",
      });

      // Act
      const result = await strategyEngine.evaluateStrategies(mockTrade);

      // Assert
      expect(result.trade).toBe(mockTrade);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].action).toBe(StrategyAction.BUY);
      expect(result.results[1].action).toBe(StrategyAction.HOLD);
      expect(result.aggregatedAction).toBe(StrategyAction.BUY);
      expect(result.explanation).toContain("BUY");
      expect(result.explanation).toContain("Buy signal triggered");

      // Verify strategies were called with context
      expect(mockStrategy1.evaluate).toHaveBeenCalled();
      expect(mockStrategy2.evaluate).toHaveBeenCalled();

      const context = vi.mocked(mockStrategy1.evaluate).mock
        .calls[0][0] as StrategyContext;
      expect(context.trade).toBe(mockTrade);
      expect(context.currentPrice).toBe(mockPriceData.currentPrice);
      expect(context.priceHistory).toBe(mockPriceData.priceHistory);
    });

    it("should prioritize CANCEL action over other actions", async () => {
      // Arrange
      const mockTrade = {
        id: "mock-trade-id",
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        status: TradeStatus.PENDING,
        createdAt: MOCK_DATE,
        strategies: [mockStrategy1, mockStrategy2],
        priceData: mockPriceData,
        metadata: {},
      };

      // Configure mock strategies to return different actions
      vi.mocked(mockStrategy1.evaluate).mockReturnValue({
        action: StrategyAction.BUY,
        reason: "Buy signal triggered",
      });

      vi.mocked(mockStrategy2.evaluate).mockReturnValue({
        action: StrategyAction.CANCEL,
        reason: "Cancel signal triggered",
      });

      // Act
      const result = await strategyEngine.evaluateStrategies(mockTrade);

      // Assert
      expect(result.aggregatedAction).toBe(StrategyAction.CANCEL);
      expect(result.explanation).toContain("CANCEL");
      expect(result.explanation).toContain("Cancel signal triggered");
    });

    it("should prioritize SELL action over BUY and HOLD actions", async () => {
      // Arrange
      const mockTrade = {
        id: "mock-trade-id",
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        status: TradeStatus.PENDING,
        createdAt: MOCK_DATE,
        strategies: [mockStrategy1, mockStrategy2],
        priceData: mockPriceData,
        metadata: {},
      };

      // Configure mock strategies to return different actions
      vi.mocked(mockStrategy1.evaluate).mockReturnValue({
        action: StrategyAction.BUY,
        reason: "Buy signal triggered",
      });

      vi.mocked(mockStrategy2.evaluate).mockReturnValue({
        action: StrategyAction.SELL,
        reason: "Sell signal triggered",
      });

      // Act
      const result = await strategyEngine.evaluateStrategies(mockTrade);

      // Assert
      expect(result.aggregatedAction).toBe(StrategyAction.SELL);
      expect(result.explanation).toContain("SELL");
      expect(result.explanation).toContain("Sell signal triggered");
    });

    it("should default to HOLD when no other actions are triggered", async () => {
      // Arrange
      const mockTrade = {
        id: "mock-trade-id",
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        status: TradeStatus.PENDING,
        createdAt: MOCK_DATE,
        strategies: [mockStrategy1, mockStrategy2],
        priceData: mockPriceData,
        metadata: {},
      };

      // Configure mock strategies to return HOLD actions
      vi.mocked(mockStrategy1.evaluate).mockReturnValue({
        action: StrategyAction.HOLD,
        reason: "Hold signal 1",
      });

      vi.mocked(mockStrategy2.evaluate).mockReturnValue({
        action: StrategyAction.HOLD,
        reason: "Hold signal 2",
      });

      // Act
      const result = await strategyEngine.evaluateStrategies(mockTrade);

      // Assert
      expect(result.aggregatedAction).toBe(StrategyAction.HOLD);
      expect(result.explanation).toContain("HOLD");
    });
  });
});
