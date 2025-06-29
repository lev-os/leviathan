import type {
  QuoteResponse,
  SwapInstructionsPostRequest,
  SwapRequest,
} from "@jup-ag/api";
import type { SolBot } from "../modules/bot";
import type { Consola, ConsolaInstance } from "consola";
import type Axe from "axe";
import type { Logger as PinoLogger } from "pino";

export type Example = {
  id: string;
};

export interface Strategy {
  label: string;
  callback: (args: StrategyCallbackArgs) => boolean;
}

export interface StrategyCallbackArgs {
  trade: Trade;
  quote?: QuoteResponse;
  bot: SolBot;
  difference: number;
  isNegative: boolean;
  formatted: string;
}

export interface TokenDetails {
  name: string;
  symbol: string;
  logo: string;
  marketCap?: number;
  price?: number;
  supply: number;
  decimals: number;
  links: {
    website: string;
    twitter: string;
    telegram: string;
    dexscreen: string;
    pump?: string;
  };
}

export interface Trade {
  antiMEV: boolean;
  details?: TokenDetails;
  swapWith: SwapToken;
  buyAmount: number;
  numTokens: number;
  mint: string;
  lastCheck?: number;
  priceWatchIntervalId?: NodeJS.Timeout;
  startingPrice: number;
  price: number;
  waitingForConfirmation?: boolean;
  strategy: Strategy[];
  initialQuote?: QuoteResponse;
  lastQuote?: QuoteResponse;
  tradingPackageId?: string; // ID of the trade in the trading package
}

export enum SwapToken {
  SOL,
  USDC,
}

export enum LogTopic {
  Quote,
  Swap,
  PriceCheck,
}

export enum LogSeverity {
  Debug,
  Info,
  Warning,
  Error,
}

export type Logger = Axe.Axe<PinoLogger<"log", boolean> | ConsolaInstance>;

export interface LogSwapArgs {
  inputToken: string;
  inAmount: string;
  outputToken: string;
  outAmount: string;
  txId: string;
  timestamp: string;
}
