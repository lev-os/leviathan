import {
  createJupiterApiClient,
  QuoteGetRequest,
  QuoteResponse,
} from "@jup-ag/api";
import { PublicKey } from "@solana/web3.js";
import { IDEXAdapter, DEXAdapterConfig } from "@/adapters/dex/interfaces";
import {
  ITradableAsset,
  QuoteParams,
  QuoteResult,
  SwapParams,
} from "@/domain/interfaces";

/**
 * Jupiter-specific DEX adapter configuration
 */
export interface JupiterAdapterConfig extends DEXAdapterConfig {
  /**
   * Whether to use anti-MEV protection
   */
  useAntiMEV?: boolean;
}

/**
 * Adapter for interacting with Jupiter DEX
 */
export class JupiterAdapter implements IDEXAdapter {
  private jupiterApi: ReturnType<typeof createJupiterApiClient>;
  private config: JupiterAdapterConfig;

  /**
   * Creates a new Jupiter adapter
   * @param config Configuration for the adapter
   */
  constructor(config: JupiterAdapterConfig) {
    this.config = {
      slippageTolerance: 0.5,
      connectionTimeout: 30000,
      retryAttempts: 3,
      useAntiMEV: false,
      ...config,
    };

    this.jupiterApi = createJupiterApiClient({
      basePath: this.config.endpoint,
    });
  }

  /**
   * Gets a quote for a swap
   * @param params Quote parameters
   * @returns Quote result
   */
  public async getQuote(params: QuoteParams): Promise<QuoteResult> {
    try {
      const quoteRequest: QuoteGetRequest = {
        inputMint: params.inputAsset.address,
        outputMint: params.outputAsset.address,
        amount: Number(params.inputAmount),
        slippageBps: Math.floor(params.slippageTolerance * 100),
      };

      const quote = await this.jupiterApi.quoteGet(quoteRequest);

      if (!quote) {
        throw new Error("No quote found");
      }

      return {
        inputAmount: BigInt(quote.inAmount),
        outputAmount: BigInt(quote.outAmount),
        price: parseFloat(quote.priceImpactPct),
        priceImpact: parseFloat(quote.priceImpactPct),
        route: quote.routePlan,
        validUntil: new Date(Date.now() + 30000), // 30 seconds validity
      };
    } catch (error: any) {
      if (error.response && typeof error.response.json === "function") {
        const errorData = await error.response.json();
        console.error("Jupiter API error:", errorData);
      } else {
        console.error("Error getting quote:", error);
      }
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  }

  /**
   * Builds a swap transaction
   * @param params Swap parameters
   * @returns Transaction object
   */
  public async buildSwapTransaction(params: SwapParams): Promise<any> {
    try {
      const { quoteResult, walletAddress } = params;

      const swapInstructions = await this.getSwapInstructions(params);

      return {
        instructions: swapInstructions,
        signers: [],
        feePayer: new PublicKey(walletAddress),
      };
    } catch (error: any) {
      console.error("Error building swap transaction:", error);
      throw new Error(`Failed to build swap transaction: ${error.message}`);
    }
  }

  /**
   * Gets swap instructions for a transaction
   * @param params Swap parameters
   * @returns Swap instructions
   */
  public async getSwapInstructions(params: SwapParams): Promise<any> {
    try {
      const { quoteResult, walletAddress } = params;

      const swapInstructions = await this.jupiterApi.swapInstructionsPost({
        swapRequest: {
          quoteResponse: quoteResult.route as QuoteResponse,
          userPublicKey: walletAddress,
          // Use any type to bypass type checking for prioritizationFeeLamports
          prioritizationFeeLamports: "auto" as any,
          addConsensusAccount: this.config.useAntiMEV,
        },
      });

      return swapInstructions;
    } catch (error: any) {
      if (error.response && typeof error.response.json === "function") {
        const errorData = await error.response.json();
        console.error("Jupiter API error:", errorData);
      } else {
        console.error("Error getting swap instructions:", error);
      }
      throw new Error(`Failed to get swap instructions: ${error.message}`);
    }
  }
}
