/**
 * Enums for the trading package
 */

/**
 * Status of a trade
 */
export enum TradeStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

/**
 * Actions that can be taken by a strategy
 */
export enum StrategyAction {
  HOLD = "HOLD",
  BUY = "BUY",
  SELL = "SELL",
  CANCEL = "CANCEL",
}

/**
 * Types of parameters for strategies
 */
export enum ParameterType {
  NUMBER = "NUMBER",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  ENUM = "ENUM",
  ASSET = "ASSET",
}

/**
 * Types of validation rules for strategy parameters
 */
export enum ValidationRuleType {
  MIN = "MIN",
  MAX = "MAX",
  PATTERN = "PATTERN",
  ENUM_VALUES = "ENUM_VALUES",
  CUSTOM = "CUSTOM",
}

/**
 * Types of transactions
 */
export enum TransactionType {
  SWAP = "SWAP",
  TRANSFER = "TRANSFER",
  APPROVE = "APPROVE",
}

/**
 * Status of a transaction
 */
export enum TransactionStatus {
  CREATED = "CREATED",
  SIGNED = "SIGNED",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

/**
 * Actions that can be taken when handling errors
 */
export enum ErrorAction {
  RETRY = "RETRY",
  ABORT = "ABORT",
  IGNORE = "IGNORE",
  FALLBACK = "FALLBACK",
}

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Types of config sources
 */
export enum ConfigSourceType {
  FILE = "FILE",
  DATABASE = "DATABASE",
  ENVIRONMENT = "ENVIRONMENT",
  REMOTE_API = "REMOTE_API",
}

/**
 * Time intervals for price data
 */
export enum TimeInterval {
  MINUTE_1 = "MINUTE_1",
  MINUTE_5 = "MINUTE_5",
  MINUTE_15 = "MINUTE_15",
  HOUR_1 = "HOUR_1",
  HOUR_4 = "HOUR_4",
  DAY_1 = "DAY_1",
  WEEK_1 = "WEEK_1",
}

/**
 * Direction of price movement for strategies
 */
export enum PriceDirection {
  UP = "UP",
  DOWN = "DOWN",
}

/**
 * Types of time windows for time-based strategies
 */
export enum TimeWindowType {
  ABSOLUTE = "ABSOLUTE",
  ELAPSED = "ELAPSED",
  RANGE = "RANGE",
}

/**
 * Types of comparison for volume-based strategies
 */
export enum ComparisonType {
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  EQUAL = "EQUAL",
}

/**
 * Logical operators for composite strategies
 */
export enum LogicalOperator {
  AND = "AND",
  OR = "OR",
}
