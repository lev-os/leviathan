import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TradingEngine } from "../../../src/core/TradingEngine";
import { StrategyEngine } from "../../../src/core/StrategyEngine";
import { StrategyFactory } from "../../../src/strategies/StrategyFactory";
import * as uuid from "uuid";
import {
  TradeStatus,
  StrategyAction,
  TransactionStatus,
} from "../../../src/domain/enums";
import {
  MockBlockchainAdapter,
  MockDEXAdapter,
  MockPriceOracleAdapter,
} from "../../mocks/mock-adapters";
import {
  mockSolAsset,
  mockUsdcAsset,
  resetMocks,
  MOCK_DATE,
} from "../../test-setup";

describe("TradingEngine", () => {
  let tradingEngine: TradingEngine;
  let blockchainAdapter: MockBlockchainAdapter;
  let dexAdapter: MockDEXAdapter;
  let priceOracleAdapter: MockPriceOracleAdapter;
  let strategyEngine: StrategyEngine;
  let strategyFactory: StrategyFactory;

  beforeEach(() => {
    // Create mock adapters
    blockchainAdapter = new MockBlockchainAdapter();
    dexAdapter = new MockDEXAdapter();
    priceOracleAdapter = new MockPriceOracleAdapter();

    // Create strategy factory and engine
    strategyFactory = new StrategyFactory();
    strategyEngine = new StrategyEngine(strategyFactory);

    // Create trading engine
    tradingEngine = new TradingEngine(
      blockchainAdapter,
      dexAdapter,
      priceOracleAdapter,
      strategyEngine
    );
  });

  afterEach(() => {
    resetMocks();
    // Create a new instance of the trading engine to ensure a clean state
    tradingEngine = new TradingEngine(
      blockchainAdapter,
      dexAdapter,
      priceOracleAdapter,
      strategyEngine
    );
  });

  describe("createTrade", () => {
    it("should create a new trade with the provided parameters", async () => {
      // Arrange
      const inputAmount = BigInt(1000000000); // 1 SOL
      const strategies = [];

      // Mock UUID generation to ensure consistent IDs
      vi.spyOn(uuid, "v4").mockReturnValueOnce("mock-uuid-1234");

      // Act
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount,
        strategies,
      });

      // Assert
      expect(trade).toBeDefined();
      expect(trade.id).toBe("mock-uuid-1234");
      expect(trade.inputAsset).toEqual(mockSolAsset);
      expect(trade.outputAsset).toEqual(mockUsdcAsset);
      expect(trade.inputAmount).toBe(inputAmount);
      expect(trade.status).toBe(TradeStatus.PENDING);
      expect(trade.createdAt).toEqual(MOCK_DATE);
      expect(trade.strategies).toEqual(strategies);
      expect(trade.priceData).toBeDefined();
      expect(trade.priceData.currentPrice).toBe(100); // Default mock price

      // Verify price oracle adapter was called
      expect(priceOracleAdapter.getPriceCalls).toContain(mockUsdcAsset.address);
    });

    it("should handle errors during trade creation", async () => {
      // Arrange
      vi.spyOn(priceOracleAdapter, "getPrice").mockRejectedValueOnce(
        new Error("API error")
      );

      // Act & Assert
      await expect(
        tradingEngine.createTrade({
          inputAsset: mockSolAsset,
          outputAsset: mockUsdcAsset,
          inputAmount: BigInt(1000000000),
          strategies: [],
        })
      ).rejects.toThrow("Failed to create trade: API error");
    });
  });

  describe("executeTrade", () => {
    it("should execute a pending trade successfully", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
        metadata: {
          walletAddress: "mock-wallet-address",
          privateKey: "mock-private-key",
        },
      });

      // Act
      const result = await tradingEngine.executeTrade(trade.id);

      // Assert
      expect(result.success).toBe(true);
      expect(result.trade.status).toBe(TradeStatus.COMPLETED);
      expect(result.transactionId).toBe("mock-transaction-id");
      expect(result.error).toBeUndefined();

      // Verify adapter calls
      expect(dexAdapter.getQuoteCalls.length).toBe(1);
      expect(dexAdapter.buildSwapTransactionCalls.length).toBe(1);
      expect(blockchainAdapter.signTransactionCalls.length).toBe(1);
      expect(blockchainAdapter.submitTransactionCalls.length).toBe(1);
      expect(blockchainAdapter.getTransactionStatusCalls.length).toBe(1);
    });

    it("should handle non-existent trade ID", async () => {
      const result = await tradingEngine.executeTrade("non-existent-id");
      // Act & Assert
      expect(result).toStrictEqual({
        trade: undefined,
        error: new Error(
          `Failed to execute trade: Trade with ID non-existent-id not found`
        ),
        success: false,
      });
    });

    it("should handle trades that are not in PENDING status", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
      });

      // Manually change status
      trade.status = TradeStatus.COMPLETED;

      // Act & Assert
      const result = await tradingEngine.executeTrade(trade.id);

      expect(result).toStrictEqual({
        trade,
        success: false,
        error: new Error(
          `Failed to execute trade: Trade with ID ${trade.id} is not in PENDING status`
        ),
      });
    });

    it("should handle missing wallet address in metadata", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
        metadata: {}, // No wallet address
      });

      // Act
      const result = await tradingEngine.executeTrade(trade.id);

      // Assert
      expect(result.success).toBe(false);
      expect(result.trade.status).toBe(TradeStatus.FAILED);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Wallet address not provided");
    });

    it("should handle missing private key in metadata", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
        metadata: {
          walletAddress: "mock-wallet-address",
          // No private key
        },
      });

      // Act
      const result = await tradingEngine.executeTrade(trade.id);

      // Assert
      expect(result.success).toBe(false);
      expect(result.trade.status).toBe(TradeStatus.FAILED);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Private key not provided");
    });

    it("should handle failed transactions", async () => {
      // Arrange
      const failedBlockchainAdapter = new MockBlockchainAdapter({
        transactionStatus: TransactionStatus.FAILED,
      });

      tradingEngine = new TradingEngine(
        failedBlockchainAdapter,
        dexAdapter,
        priceOracleAdapter,
        strategyEngine
      );

      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
        metadata: {
          walletAddress: "mock-wallet-address",
          privateKey: "mock-private-key",
        },
      });

      // Act
      const result = await tradingEngine.executeTrade(trade.id);

      // Assert
      expect(result.success).toBe(false);
      expect(result.trade.status).toBe(TradeStatus.FAILED);
      expect(result.error).toBeDefined();
    });
  });

  describe("cancelTrade", () => {
    it("should cancel a pending trade", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
      });

      // Act
      const result = await tradingEngine.cancelTrade(trade.id);

      // Assert
      expect(result).toBe(true);

      // Verify trade status was updated
      const updatedTrade = await tradingEngine.getTrade(trade.id);
      expect(updatedTrade.status).toBe(TradeStatus.CANCELLED);
    });

    it("should handle non-existent trade ID", async () => {
      // Act
      const result = await tradingEngine.cancelTrade("non-existent-id");

      // Assert
      expect(result).toBe(false);
    });

    it("should not cancel trades that are already completed", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
        metadata: {
          walletAddress: "mock-wallet-address",
          privateKey: "mock-private-key",
        },
      });

      // Complete the trade
      await tradingEngine.executeTrade(trade.id);

      // Act
      const result = await tradingEngine.cancelTrade(trade.id);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getTrade", () => {
    it("should retrieve a trade by ID", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
      });

      // Act
      const retrievedTrade = await tradingEngine.getTrade(trade.id);

      // Assert
      expect(retrievedTrade).toEqual(trade);
    });

    it("should throw an error for non-existent trade ID", async () => {
      // Act & Assert
      await expect(tradingEngine.getTrade("non-existent-id")).rejects.toThrow(
        "Trade with ID non-existent-id not found"
      );
    });
  });

  describe("listActiveTrades", () => {
    it("should list all active trades", async () => {
      // Create a fresh instance for this test to avoid interference
      const localTradingEngine = new TradingEngine(
        blockchainAdapter,
        dexAdapter,
        priceOracleAdapter,
        strategyEngine
      );

      // Arrange
      const pendingTrade = await localTradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
      });

      const activeTrade = await localTradingEngine.createTrade({
        inputAsset: mockUsdcAsset,
        outputAsset: mockSolAsset,
        inputAmount: BigInt(10000000),
        strategies: [],
      });

      // Manually set to active
      activeTrade.status = TradeStatus.ACTIVE;

      const completedTrade = await localTradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(2000000000),
        strategies: [],
      });

      // Manually set to completed
      completedTrade.status = TradeStatus.COMPLETED;

      // Act
      const activeTrades = await localTradingEngine.listActiveTrades();
      const allTrades = await localTradingEngine.listAllTrades();

      console.log("Active Trades:");
      console.log("Active Trades:");
      console.log("Active Trades:");
      console.log(allTrades);

      // Assert
      expect(activeTrades.length).toBe(2);
      expect(activeTrades).toContainEqual(pendingTrade);
      expect(activeTrades).toContainEqual(activeTrade);
      expect(activeTrades).not.toContainEqual(completedTrade);
    });

    it("should return an empty array when no active trades exist", async () => {
      // Create a fresh instance for this test
      const localTradingEngine = new TradingEngine(
        blockchainAdapter,
        dexAdapter,
        priceOracleAdapter,
        strategyEngine
      );

      // Act
      const activeTrades = await localTradingEngine.listActiveTrades();

      // Assert
      expect(activeTrades).toEqual([]);
    });
  });

  describe("updatePriceData", () => {
    it("should update price data for a trade", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
      });

      // Configure mock to return a higher price
      vi.spyOn(priceOracleAdapter, "getPrice").mockResolvedValueOnce(120);

      // Act
      const updatedTrade = await tradingEngine.updatePriceData(trade.id);

      // Assert
      expect(updatedTrade.priceData.currentPrice).toBe(120);
      expect(updatedTrade.priceData.highPrice).toBe(120);
      expect(updatedTrade.priceData.lowPrice).toBe(100);
      expect(updatedTrade.priceData.priceHistory.length).toBe(2);
      expect(updatedTrade.priceData.lastUpdated).toEqual(MOCK_DATE);

      // Verify price oracle adapter was called
      expect(priceOracleAdapter.getPriceCalls).toContain(mockUsdcAsset.address);
    });

    it("should handle non-existent trade ID", async () => {
      // Act & Assert
      await expect(
        tradingEngine.updatePriceData("non-existent-id")
      ).rejects.toThrow("Trade with ID non-existent-id not found");
    });

    it("should evaluate strategies for active trades", async () => {
      // Arrange
      const mockStrategy = {
        id: "mock-strategy-id",
        name: "Mock Strategy",
        description: "A mock strategy for testing",
        evaluate: vi.fn().mockReturnValue({
          action: StrategyAction.SELL,
          reason: "Test reason",
        }),
        getParameters: vi.fn().mockReturnValue([]),
        setParameters: vi.fn(),
      };

      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [mockStrategy],
      });

      // Set trade to active
      trade.status = TradeStatus.ACTIVE;

      // Spy on strategy engine and trading engine methods
      const evaluateStrategiesSpy = vi.spyOn(
        strategyEngine,
        "evaluateStrategies"
      );
      const executeTradesSpy = vi.spyOn(tradingEngine, "executeTrade");

      // Act
      await tradingEngine.updatePriceData(trade.id);

      // Assert
      expect(evaluateStrategiesSpy).toHaveBeenCalledWith(trade);
      expect(executeTradesSpy).toHaveBeenCalledWith(trade.id);
      expect(mockStrategy.evaluate).toHaveBeenCalled();
    });

    it("should handle errors during price update", async () => {
      // Arrange
      const trade = await tradingEngine.createTrade({
        inputAsset: mockSolAsset,
        outputAsset: mockUsdcAsset,
        inputAmount: BigInt(1000000000),
        strategies: [],
      });

      // Mock price oracle to throw an error
      vi.spyOn(priceOracleAdapter, "getPrice").mockRejectedValueOnce(
        new Error("API error")
      );

      // Act & Assert
      await expect(tradingEngine.updatePriceData(trade.id)).rejects.toThrow(
        "Failed to update price data: API error"
      );
    });
  });
});
