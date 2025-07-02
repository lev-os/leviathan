/**
 * Validation System
 * 
 * Uses schemas from @lev-os/schema to validate lego pieces before assembly.
 * Ensures structural integrity and compliance with the constitutional framework.
 */

import type { LegoContext } from '../index.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schema_used: string;
}

/**
 * Validates a context against its schema
 */
export async function validateContext(context: LegoContext): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    schema_used: context.type || 'base'
  };
  
  // Basic structure validation
  if (!context.id) {
    result.errors.push('Missing required field: id');
  }
  
  if (!context.type) {
    result.errors.push('Missing required field: type');
  }
  
  if (!context.description) {
    result.errors.push('Missing required field: description');
  }
  
  if (!context.version) {
    result.errors.push('Missing required field: version');
  } else if (!isValidSemver(context.version)) {
    result.errors.push('Invalid version format: must be semver (e.g., 1.0.0)');
  }
  
  // Type-specific validation
  await validateTypeSpecific(context, result);
  
  result.valid = result.errors.length === 0;
  return result;
}

function isValidSemver(version: string): boolean {
  const semverRegex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
  return semverRegex.test(version);
}

async function validateTypeSpecific(context: LegoContext, result: ValidationResult): Promise<void> {
  switch (context.type) {
    case 'agent':
      validateAgent(context, result);
      break;
    case 'workflow':
      validateWorkflow(context, result);
      break;
    case 'pattern':
      validatePattern(context, result);
      break;
    case 'tool':
      validateTool(context, result);
      break;
    // Add other type validations...
    default:
      result.warnings.push(`Unknown context type: ${context.type}`);
  }
}

function validateAgent(context: LegoContext, result: ValidationResult): void {
  if (!context.persona) {
    result.errors.push('Agent missing required field: persona');
  } else {
    if (!context.persona.archetype) {
      result.errors.push('Agent persona missing required field: archetype');
    }
    if (!context.persona.voice) {
      result.errors.push('Agent persona missing required field: voice');
    }
  }
  
  if (!context.toolkit) {
    result.errors.push('Agent missing required field: toolkit');
  } else if (!context.toolkit.thinking_patterns || !Array.isArray(context.toolkit.thinking_patterns)) {
    result.errors.push('Agent toolkit missing required field: thinking_patterns (array)');
  }
}

function validateWorkflow(context: LegoContext, result: ValidationResult): void {
  if (!context.goal) {
    result.errors.push('Workflow missing required field: goal');
  }
}

function validatePattern(context: LegoContext, result: ValidationResult): void {
  if (!context.template) {
    result.errors.push('Pattern missing required field: template');
  }
}

function validateTool(context: LegoContext, result: ValidationResult): void {
  if (!context.tool_name) {
    result.errors.push('Tool missing required field: tool_name');
  }
  if (!context.tool_description) {
    result.errors.push('Tool missing required field: tool_description');
  }
  if (!context.schema) {
    result.errors.push('Tool missing required field: schema');
  }
}