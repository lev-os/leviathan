import {
  IBlockchainAdapter,
  IDEXAdapter,
  IPriceOracleAdapter,
  ITradableAsset,
  QuoteParams,
  QuoteResult,
  SwapParams,
  TokenMetadata,
} from "../../src/domain/interfaces";
import { TransactionStatus } from "../../src/domain/enums";
import { mockPriceData, MOCK_DATE } from "../test-setup";

/**
 * Mock blockchain adapter for testing
 */
export class MockBlockchainAdapter implements IBlockchainAdapter {
  public getBalanceCalls: any[] = [];
  public signTransactionCalls: any[] = [];
  public submitTransactionCalls: any[] = [];
  public getTransactionStatusCalls: any[] = [];

  constructor(
    private config: {
      transactionStatus?: TransactionStatus;
      balance?: bigint;
    } = {}
  ) {}

  async getBalance(address: string, asset: ITradableAsset): Promise<bigint> {
    this.getBalanceCalls.push({ address, asset });
    return this.config.balance || BigInt(1000000000);
  }

  async signTransaction(transaction: any, privateKey: string): Promise<any> {
    this.signTransactionCalls.push({ transaction, privateKey });
    return { signedTransaction: "mock-signed-transaction" };
  }

  async submitTransaction(signedTransaction: any): Promise<string> {
    this.submitTransactionCalls.push({ signedTransaction });
    return "mock-transaction-id";
  }

  async getTransactionStatus(
    transactionId: string
  ): Promise<TransactionStatus> {
    this.getTransactionStatusCalls.push({ transactionId });
    return this.config.transactionStatus || TransactionStatus.CONFIRMED;
  }
}

/**
 * Mock DEX adapter for testing
 */
export class MockDEXAdapter implements IDEXAdapter {
  public getQuoteCalls: QuoteParams[] = [];
  public buildSwapTransactionCalls: SwapParams[] = [];
  public getSwapInstructionsCalls: SwapParams[] = [];

  constructor(private config: { outputAmount?: bigint } = {}) {}

  async getQuote(params: QuoteParams): Promise<QuoteResult> {
    this.getQuoteCalls.push(params);

    return {
      inputAmount: params.inputAmount,
      outputAmount:
        this.config.outputAmount || BigInt(params.inputAmount) * BigInt(10),
      price: 10,
      priceImpact: 0.1,
      route: { path: [] },
      validUntil: new Date(MOCK_DATE.getTime() + 60000), // Valid for 1 minute
    };
  }

  async buildSwapTransaction(params: SwapParams): Promise<any> {
    this.buildSwapTransactionCalls.push(params);
    return { transaction: "mock-transaction-data" };
  }

  async getSwapInstructions(params: SwapParams): Promise<any> {
    this.getSwapInstructionsCalls.push(params);
    return { instructions: ["mock-instruction-1", "mock-instruction-2"] };
  }
}

/**
 * Mock price oracle adapter for testing
 */
export class MockPriceOracleAdapter implements IPriceOracleAdapter {
  public getPriceCalls: string[] = [];
  public getPriceHistoryCalls: any[] = [];
  public getTokenMetadataCalls: ITradableAsset[] = [];

  constructor(
    private config: {
      price?: number;
      priceHistory?: any[];
      tokenMetadata?: TokenMetadata;
    } = {}
  ) {}

  async getPrice(asset: ITradableAsset | string): Promise<number> {
    const assetAddress = typeof asset === "string" ? asset : asset.address;
    this.getPriceCalls.push(assetAddress);
    return this.config.price || 100;
  }

  async getPriceHistory(
    asset: ITradableAsset | string,
    timeframe: any
  ): Promise<any[]> {
    const assetAddress = typeof asset === "string" ? asset : asset.address;
    this.getPriceHistoryCalls.push({ asset: assetAddress, timeframe });
    return (
      this.config.priceHistory || [
        { price: 95, timestamp: new Date(MOCK_DATE.getTime() - 3600000) },
        { price: 100, timestamp: MOCK_DATE },
      ]
    );
  }

  async getTokenMetadata(asset: ITradableAsset): Promise<TokenMetadata | null> {
    this.getTokenMetadataCalls.push(asset);

    if (this.config.tokenMetadata) {
      return this.config.tokenMetadata;
    }

    return {
      name: "Mock Token",
      symbol: asset.symbol,
      logo: "https://example.com/logo.png",
      marketCap: 1000000,
      totalSupply: BigInt(1000000000),
      circulatingSupply: BigInt(500000000),
      links: {
        website: "https://example.com",
        twitter: "https://twitter.com/example",
      },
    };
  }
}
