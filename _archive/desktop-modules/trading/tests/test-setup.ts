import { vi } from "vitest";

// Mock UUID generation to make tests deterministic
vi.mock("uuid", () => ({
  v4: () => "mock-uuid-1234",
}));

// Create mock date for consistent testing
export const MOCK_DATE = new Date("2025-01-01T12:00:00Z");

// Mock Date constructor and methods
vi.spyOn(global, "Date").mockImplementation(() => MOCK_DATE as any);
Date.now = vi.fn(() => MOCK_DATE.getTime());

// Helper function to create a mock tradable asset
export function createMockAsset(
  symbol: string,
  address: string,
  decimals: number = 9
) {
  return {
    symbol,
    address,
    decimals,
    network: "solana",
  };
}

// Common mock assets
export const mockSolAsset = createMockAsset(
  "SOL",
  "So11111111111111111111111111111111111111112",
  9
);
export const mockUsdcAsset = createMockAsset(
  "USDC",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  6
);
export const mockTokenAsset = createMockAsset(
  "TOKEN",
  "TokenMint123456789abcdef",
  9
);

// Mock price data
export const mockPriceData = {
  currentPrice: 100,
  startingPrice: 100,
  highPrice: 110,
  lowPrice: 90,
  priceHistory: [{ price: 100, timestamp: MOCK_DATE }],
  lastUpdated: MOCK_DATE,
};

// Mock market data
export const mockMarketData = {
  volume24h: 1000000,
  volumeChange24h: 5,
  liquidity: 5000000,
  marketCap: 100000000,
  fullyDilutedValuation: 200000000,
  totalSupply: BigInt(1000000000),
  circulatingSupply: BigInt(500000000),
};

// Reset all mocks after each test
export function resetMocks() {
  vi.clearAllMocks();
}
