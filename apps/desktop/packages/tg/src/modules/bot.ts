import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  type Logger,
  type TokenDetails,
  type Trade,
  SwapToken,
} from "../domain/domain";
import {
  createTradingPackage,
  SolanaAdapter,
  JupiterAdapter,
  MoralisAdapter,
  PriceTargetStrategy,
  PriceDirection,
  StrategyAction,
  ITradableAsset,
  ITrade,
  IStrategy,
  TradeStatus,
  CreateTradeParams,
} from "../../../trading/src";
import { v4 as uuidv4 } from "uuid";

export class SolBot {
  private wallet: Keypair;
  private usdcMint: PublicKey = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );
  private solMint: PublicKey = new PublicKey(
    "So11111111111111111111111111111111111111112"
  );
  private usdcTokenAccount: PublicKey;
  private solBalance: number = 0;
  private usdcBalance: number = 0;
  private checkInterval: number = 1000 * 10;
  private trades: Trade[] = [];
  private logger: Logger;

  // Trading package components
  private solanaAdapter: SolanaAdapter;
  private jupiterAdapter: JupiterAdapter;
  private moralisAdapter: MoralisAdapter;
  private tradingEngine: any;
  private strategyEngine: any;
  private strategyFactory: any;
  private solanaConnection: Connection;

  constructor(config: ArbBotConfig) {
    const { logger, solanaEndpoint, metisEndpoint, secretKey, checkInterval } =
      config;
    this.wallet = Keypair.fromSecretKey(secretKey);
    this.usdcTokenAccount = getAssociatedTokenAddressSync(
      this.usdcMint,
      this.wallet.publicKey
    );
    this.logger = logger;

    if (checkInterval) {
      this.checkInterval = checkInterval;
    }

    // Initialize Solana connection for balance checking
    this.solanaConnection = new Connection(solanaEndpoint);

    // Initialize trading package adapters
    this.solanaAdapter = new SolanaAdapter({
      endpoint: solanaEndpoint,
      commitment: "confirmed",
    });

    this.jupiterAdapter = new JupiterAdapter({
      endpoint: metisEndpoint,
      slippageTolerance: 0.5,
    });
  }

  async init({ moralisApiKey }: { moralisApiKey: string }): Promise<void> {
    // Initialize Moralis adapter
    this.moralisAdapter = new MoralisAdapter({
      apiKey: moralisApiKey,
      network: "mainnet",
    });

    // Create trading package
    const tradingPackage = createTradingPackage(
      this.solanaAdapter,
      this.jupiterAdapter,
      this.moralisAdapter
    );

    this.tradingEngine = tradingPackage.tradingEngine;
    this.strategyEngine = tradingPackage.strategyEngine;
    this.strategyFactory = tradingPackage.strategyFactory;

    this.logger.info(`${this.wallet.publicKey.toBase58()} 🤖 `);
    await this.refreshBalances();
    this.logger.info(
      `Current balances 🏦\nSOL: ${
        this.solBalance / LAMPORTS_PER_SOL
      },\nUSDC: ${this.usdcBalance}`
    );
  }

  private async refreshBalances(): Promise<void> {
    try {
      const results = await Promise.allSettled([
        this.solanaConnection.getBalance(this.wallet.publicKey),
        this.solanaConnection.getTokenAccountBalance(this.usdcTokenAccount),
      ]);

      const solBalanceResult = results[0];
      const usdcBalanceResult = results[1];

      if (solBalanceResult.status === "fulfilled") {
        this.solBalance = solBalanceResult.value;
      } else {
        this.logger.error(
          "Error fetching SOL balance:",
          solBalanceResult.reason
        );
      }

      if (usdcBalanceResult.status === "fulfilled") {
        this.usdcBalance = usdcBalanceResult.value.value.uiAmount ?? 0;
      } else {
        this.usdcBalance = 0;
      }

      if (this.solBalance < LAMPORTS_PER_SOL / 100) {
        this.logger.warn("❌ Low SOL balance.");
        setTimeout(this.refreshBalances.bind(this), 1000 * 60 * 5);
      }
    } catch (error) {
      this.logger.error("Unexpected error during balance refresh:", error);
    }
  }

  async addTrade(trade: Trade): Promise<void> {
    try {
      // Convert the legacy Trade to the trading package format
      const inputAsset: ITradableAsset =
        trade.swapWith === SwapToken.SOL
          ? {
              symbol: "SOL",
              address: this.solMint.toBase58(),
              decimals: 9,
              network: "solana",
            }
          : {
              symbol: "USDC",
              address: this.usdcMint.toBase58(),
              decimals: 6,
              network: "solana",
            };

      const outputAsset: ITradableAsset = {
        symbol: "TOKEN",
        address: trade.mint,
        decimals: 9, // Default, will be updated with metadata
        network: "solana",
      };

      // Create a price target strategy based on the legacy strategy
      const strategies: IStrategy[] = [];

      // Map legacy strategies to trading package strategies
      if (trade.strategy && trade.strategy.length > 0) {
        for (const legacyStrategy of trade.strategy) {
          // Create a price target strategy
          const priceTargetStrategy = this.strategyFactory.createStrategy(
            "priceTarget",
            {
              targetPercentage: 100, // Default to 2x (100% increase)
              direction: PriceDirection.UP,
              action: StrategyAction.SELL,
            }
          );

          strategies.push(priceTargetStrategy);
        }
      }

      // Create trade params
      const createTradeParams: CreateTradeParams = {
        inputAsset,
        outputAsset,
        inputAmount: BigInt(trade.buyAmount),
        strategies,
        metadata: {
          walletAddress: this.wallet.publicKey.toBase58(),
          privateKey: Buffer.from(this.wallet.secretKey).toString("hex"),
          legacyTradeId: uuidv4(), // Generate a unique ID for this trade
          antiMEV: trade.antiMEV,
        },
      };

      // Create the trade using the trading engine
      const newTrade = await this.tradingEngine.createTrade(createTradeParams);

      // Fetch token metadata
      const tokenMetadata = await this.moralisAdapter.getTokenMetadata(
        outputAsset
      );

      // Update the output asset with correct decimals from metadata
      if (tokenMetadata) {
        outputAsset.decimals = tokenMetadata.symbol ? 9 : 0; // Default if not available
      }

      // Store the trade ID for future reference
      trade.tradingPackageId = newTrade.id;

      // Store token details from metadata
      if (tokenMetadata) {
        trade.details = {
          name: tokenMetadata.name || "Unknown",
          symbol: tokenMetadata.symbol || "UNKNOWN",
          logo: tokenMetadata.logo || "",
          marketCap: tokenMetadata.marketCap || 0,
          price: await this.moralisAdapter.getPrice(outputAsset),
          supply: Number(tokenMetadata.totalSupply || 0n),
          decimals: outputAsset.decimals,
          links: {
            website: tokenMetadata.links?.website || "",
            twitter: tokenMetadata.links?.twitter || "",
            telegram: tokenMetadata.links?.telegram || "",
            dexscreen: "https://dexscreener.io/solana/" + trade.mint,
          },
        };
      }

      // Start price monitoring
      this.initiatePriceWatch(trade);

      // Add to local trades array
      this.trades.push(trade);

      this.logger.info(`Trade created with ID: ${newTrade.id}`);
    } catch (error) {
      this.logger.error("Error adding trade:", error);
    }
  }

  private initiatePriceWatch(trade: Trade): void {
    trade.price = 0;
    trade.lastCheck = 0;

    // Create a tradable asset for price monitoring
    const tokenAsset: ITradableAsset = {
      symbol: trade.details?.symbol || "TOKEN",
      address: trade.mint,
      decimals: trade.details?.decimals || 9,
      network: "solana",
    };

    trade.priceWatchIntervalId = setInterval(async () => {
      const currentTime = Date.now();
      if (!trade.lastCheck) {
        trade.lastCheck = currentTime;
      }

      const last = trade.lastCheck ?? 0;
      if (currentTime - last < this.checkInterval) {
        return;
      }

      trade.lastCheck = currentTime;

      try {
        // Get current price using the price oracle adapter
        const currentPrice = await this.moralisAdapter.getPrice(tokenAsset);

        // Update trade price
        trade.price = currentPrice;

        // Set starting price if not set
        if (!trade.startingPrice) {
          trade.startingPrice = currentPrice;
        }

        // Calculate price difference
        let difference, isNegative;
        if (trade.startingPrice > trade.price) {
          difference = (1 - trade.price / trade.startingPrice) * 100;
          isNegative = true;
        } else {
          difference = (trade.price / trade.startingPrice) * 100;
          difference = difference - 100;
          isNegative = false;
        }

        const formatted = `${isNegative ? "-" : ""}${Math.abs(
          difference
        ).toFixed(2)}%`;

        // Log price update
        this.logger.info(
          `Price update for ${trade.details?.symbol || trade.mint}: ${
            trade.price
          } USD (${formatted} change)`
        );

        // If we have a trading package ID, update the price data
        if (trade.tradingPackageId) {
          await this.tradingEngine.updatePriceData(trade.tradingPackageId);

          // Get the updated trade to check if any actions were triggered
          const updatedTrade = await this.tradingEngine.getTrade(
            trade.tradingPackageId
          );

          // If the trade status changed, handle it
          if (updatedTrade.status !== TradeStatus.PENDING) {
            this.logger.info(`Trade status changed to ${updatedTrade.status}`);

            // If the trade was completed, stop price watching
            if (
              updatedTrade.status === TradeStatus.COMPLETED ||
              updatedTrade.status === TradeStatus.CANCELLED ||
              updatedTrade.status === TradeStatus.FAILED
            ) {
              if (trade.priceWatchIntervalId) {
                clearInterval(trade.priceWatchIntervalId);
                trade.priceWatchIntervalId = undefined;
              }
            }
          }
        }

        // Legacy strategy evaluation
        if (trade.strategy) {
          const hits = trade.strategy.some((strategy) =>
            strategy.callback({
              quote: null,
              bot: this,
              trade,
              isNegative,
              difference,
              formatted,
            })
          );

          if (hits) {
            this.logger.info(
              `Strategy triggered for ${trade.details?.symbol || trade.mint}`
            );
          }
        }
      } catch (error) {
        this.logger.error("Error during price watch:", error);
      }
    }, this.checkInterval) as NodeJS.Timeout;
  }

  async executeTrade(tradeId: string): Promise<boolean> {
    try {
      // Find the trade in our local array
      const trade = this.trades.find((t) => t.tradingPackageId === tradeId);

      if (!trade) {
        this.logger.error(`Trade with ID ${tradeId} not found`);
        return false;
      }

      // Execute the trade using the trading engine
      const result = await this.tradingEngine.executeTrade(tradeId);

      if (result.success) {
        this.logger.info(
          `Trade executed successfully: ${result.transactionId}`
        );

        // Update local trade status
        trade.waitingForConfirmation = false;

        // Refresh balances after trade
        await this.refreshBalances();

        return true;
      } else {
        this.logger.error(`Trade execution failed: ${result.error?.message}`);
        return false;
      }
    } catch (error) {
      this.logger.error("Error executing trade:", error);
      return false;
    }
  }

  async cancelTrade(tradeId: string): Promise<boolean> {
    try {
      // Find the trade in our local array
      const trade = this.trades.find((t) => t.tradingPackageId === tradeId);

      if (!trade) {
        this.logger.error(`Trade with ID ${tradeId} not found`);
        return false;
      }

      // Cancel the trade using the trading engine
      const result = await this.tradingEngine.cancelTrade(tradeId);

      if (result) {
        this.logger.info(`Trade cancelled successfully`);

        // Stop price watching
        if (trade.priceWatchIntervalId) {
          clearInterval(trade.priceWatchIntervalId);
          trade.priceWatchIntervalId = undefined;
        }

        return true;
      } else {
        this.logger.error(`Trade cancellation failed`);
        return false;
      }
    } catch (error) {
      this.logger.error("Error cancelling trade:", error);
      return false;
    }
  }

  getActiveTrades(): Trade[] {
    return this.trades.filter((t) => t.priceWatchIntervalId !== undefined);
  }

  terminateSession(reason: string): void {
    this.logger.warn(`❌ Terminating bot...${reason}`);
    this.logger.info(
      `Current balances:\nSOL: ${this.solBalance / LAMPORTS_PER_SOL},\nUSDC: ${
        this.usdcBalance
      }`
    );

    // Stop all price watching
    for (const trade of this.trades) {
      if (trade.priceWatchIntervalId) {
        clearInterval(trade.priceWatchIntervalId);
        trade.priceWatchIntervalId = undefined;
      }
    }

    setTimeout(() => {
      this.logger.info("Bot has been terminated.");
    }, 1000);
  }
}

export interface ArbBotConfig {
  solanaEndpoint: string; // e.g., "https://ex-am-ple.solana-mainnet.quiknode.pro/123456/"
  metisEndpoint: string; // e.g., "https://jupiter-swap-api.quiknode.pro/123456/"
  secretKey: Uint8Array;
  checkInterval?: number;
  logger: Logger;
}
