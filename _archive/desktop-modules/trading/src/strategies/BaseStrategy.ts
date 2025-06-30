import { v4 as uuidv4 } from "uuid";
import {
  IStrategy,
  StrategyParameter,
  ValidationRule,
} from "@/domain/interfaces";
import { ValidationRuleType } from "@/domain/enums";

/**
 * Base class for all strategies
 * Provides common functionality for parameter validation and management
 */
export abstract class BaseStrategy implements IStrategy {
  public id: string;
  public name: string;
  public description: string;
  protected parameters: Map<string, any> = new Map();

  constructor(name: string, description: string) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
  }

  /**
   * Abstract method to be implemented by concrete strategies
   * Evaluates the strategy based on the provided context
   */
  public abstract evaluate(context: any): any;

  /**
   * Abstract method to be implemented by concrete strategies
   * Returns the parameters that the strategy accepts
   */
  public abstract getParameters(): StrategyParameter[];

  /**
   * Sets the parameters for the strategy
   * @param params Parameters to set
   * @throws Error if parameters are invalid
   */
  public setParameters(params: Record<string, any>): void {
    if (!this.validateParameters(params)) {
      console.log(params);
      throw new Error("Invalid parameters");
    }

    // Set parameters
    for (const [key, value] of Object.entries(params)) {
      this.parameters.set(key, value);
    }
  }

  /**
   * Gets a parameter value
   * @param name Parameter name
   * @param defaultValue Default value if parameter is not set
   * @returns Parameter value or default value
   */
  protected getParameter<T>(name: string, defaultValue?: T): T | undefined {
    return this.parameters.has(name)
      ? (this.parameters.get(name) as T)
      : defaultValue;
  }

  /**
   * Validates parameters against the parameter definitions
   * @param params Parameters to validate
   * @returns True if parameters are valid, false otherwise
   */
  protected validateParameters(params: Record<string, any>): boolean {
    const parameterDefinitions = this.getParameters();
    const parameterMap = new Map(parameterDefinitions.map((p) => [p.name, p]));

    // Check for required parameters
    for (const param of parameterDefinitions) {
      if (param.required && !(param.name in params)) {
        console.error(`Required parameter ${param.name} is missing`);
        return false;
      }
    }

    // Validate parameter values
    for (const [name, value] of Object.entries(params)) {
      const paramDef = parameterMap.get(name);

      // Skip unknown parameters
      if (!paramDef) {
        console.warn(`Unknown parameter ${name}`);
        continue;
      }

      // Validate parameter value
      if (!this.validateParameterValue(value, paramDef)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates a parameter value against its definition
   * @param value Parameter value
   * @param paramDef Parameter definition
   * @returns True if value is valid, false otherwise
   */
  private validateParameterValue(
    value: any,
    paramDef: StrategyParameter
  ): boolean {
    // Skip validation if no rules
    if (!paramDef.validationRules || paramDef.validationRules.length === 0) {
      return true;
    }

    // Apply validation rules
    for (const rule of paramDef.validationRules) {
      if (!this.applyValidationRule(value, rule)) {
        console.error(
          `Parameter ${paramDef.name} failed validation: ${rule.errorMessage}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Applies a validation rule to a value
   * @param value Value to validate
   * @param rule Validation rule
   * @returns True if value passes validation, false otherwise
   */
  private applyValidationRule(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case ValidationRuleType.MIN:
        return typeof value === "number" && value >= rule.params;

      case ValidationRuleType.MAX:
        return typeof value === "number" && value <= rule.params;

      case ValidationRuleType.PATTERN:
        return typeof value === "string" && new RegExp(rule.params).test(value);

      case ValidationRuleType.ENUM_VALUES:
        return Array.isArray(rule.params) && rule.params.includes(value);

      case ValidationRuleType.CUSTOM:
        return typeof rule.params === "function" && rule.params(value);

      default:
        console.warn(`Unknown validation rule type: ${rule.type}`);
        return true;
    }
  }
}
