import { BaseStrategy } from "@/strategies/BaseStrategy";
import {
  StrategyParameter,
  StrategyContext,
  StrategyResult,
} from "@/domain/interfaces";
import {
  ParameterType,
  PriceDirection,
  StrategyAction,
  ValidationRuleType,
} from "@/domain/enums";

/**
 * Strategy that triggers when price reaches a specific target
 * Can be configured for both upward and downward targets
 */
export class PriceTargetStrategy extends BaseStrategy {
  constructor() {
    super(
      "Price Target Strategy",
      "Triggers when price reaches a specific target (absolute or percentage)"
    );
  }

  /**
   * Evaluates the strategy based on the current price
   * @param context Strategy evaluation context
   * @returns Strategy evaluation result
   */
  public evaluate(context: StrategyContext): StrategyResult {
    const { trade, currentPrice } = context;
    const startingPrice = trade.priceData.startingPrice;

    // Get parameters
    const targetPrice = this.getParameter<number>("targetPrice");
    const targetPercentage = this.getParameter<number>("targetPercentage");
    const direction = this.getParameter<PriceDirection>(
      "direction",
      PriceDirection.UP
    );
    const action = this.getParameter<StrategyAction>(
      "action",
      StrategyAction.SELL
    );

    // Calculate target price if using percentage
    let effectiveTargetPrice: number;

    if (targetPrice !== undefined) {
      effectiveTargetPrice = targetPrice;
    } else if (targetPercentage !== undefined) {
      effectiveTargetPrice =
        direction === PriceDirection.UP
          ? startingPrice * (1 + targetPercentage / 100)
          : startingPrice * (1 - targetPercentage / 100);
    } else {
      return {
        action: StrategyAction.HOLD,
        reason: "No target price or percentage specified",
      };
    }

    // Check if target is reached
    const targetReached =
      direction === PriceDirection.UP
        ? currentPrice >= effectiveTargetPrice
        : currentPrice <= effectiveTargetPrice;

    if (targetReached) {
      return {
        action: action || StrategyAction.SELL,
        reason: `Price target of ${effectiveTargetPrice.toFixed(
          6
        )} reached (current: ${currentPrice.toFixed(6)})`,
      };
    }

    return {
      action: StrategyAction.HOLD,
      reason: `Price target of ${effectiveTargetPrice.toFixed(
        6
      )} not yet reached (current: ${currentPrice.toFixed(6)})`,
    };
  }

  /**
   * Returns the parameters that the strategy accepts
   * @returns Array of parameter definitions
   */
  public getParameters(): StrategyParameter[] {
    return [
      {
        name: "targetPrice",
        type: ParameterType.NUMBER,
        description: "Absolute price target",
        defaultValue: undefined,
        required: false,
        validationRules: [
          {
            type: ValidationRuleType.MIN,
            params: 0,
            errorMessage: "Target price must be greater than 0",
          },
        ],
      },
      {
        name: "targetPercentage",
        type: ParameterType.NUMBER,
        description: "Percentage change from starting price",
        defaultValue: undefined,
        required: false,
        validationRules: [
          {
            type: ValidationRuleType.MIN,
            params: 0,
            errorMessage: "Target percentage must be greater than 0",
          },
        ],
      },
      {
        name: "direction",
        type: ParameterType.ENUM,
        description: "Price direction",
        defaultValue: PriceDirection.UP,
        required: true,
        validationRules: [
          {
            type: ValidationRuleType.ENUM_VALUES,
            params: Object.values(PriceDirection),
            errorMessage: "Invalid direction value",
          },
        ],
      },
      {
        name: "action",
        type: ParameterType.ENUM,
        description: "Action to take when target is reached",
        defaultValue: StrategyAction.SELL,
        required: true,
        validationRules: [
          {
            type: ValidationRuleType.ENUM_VALUES,
            params: [
              StrategyAction.BUY,
              StrategyAction.SELL,
              StrategyAction.CANCEL,
            ],
            errorMessage: "Invalid action value",
          },
        ],
      },
    ];
  }
}
