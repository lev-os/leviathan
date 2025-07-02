/**
 * Composition System
 * 
 * Handles complex multi-piece assemblies and composition patterns.
 * Creates sophisticated structures from multiple validated lego pieces.
 */

import type { LegoContext } from '../index.js';
import { validateContext } from '../validation/index.js';

export interface CompositionPattern {
  name: string;
  description: string;
  requiredTypes: string[];
  optionalTypes: string[];
  compositionRules: CompositionRule[];
}

export interface CompositionRule {
  type: 'requires' | 'excludes' | 'sequence' | 'parallel';
  contexts: string[];
  condition?: string;
}

export interface CompositionResult {
  success: boolean;
  composition?: LegoContext;
  errors: string[];
  pattern_used: string;
}

/**
 * Composes multiple contexts using a specific pattern
 */
export async function composeContexts(
  pattern: string,
  contexts: LegoContext[]
): Promise<CompositionResult> {
  const result: CompositionResult = {
    success: false,
    errors: [],
    pattern_used: pattern
  };
  
  try {
    // Load composition pattern
    const compositionPattern = await loadCompositionPattern(pattern);
    
    // Validate all input contexts
    for (const context of contexts) {
      const validation = await validateContext(context);
      if (!validation.valid) {
        result.errors.push(`Invalid context ${context.id}: ${validation.errors.join(', ')}`);
      }
    }
    
    if (result.errors.length > 0) {
      return result;
    }
    
    // Check pattern requirements
    const patternValidation = validatePatternRequirements(compositionPattern, contexts);
    if (!patternValidation.valid) {
      result.errors = patternValidation.errors;
      return result;
    }
    
    // Execute composition
    result.composition = await executeComposition(compositionPattern, contexts);
    result.success = true;
    
  } catch (error) {
    result.errors.push(`Composition failed: ${error.message}`);
  }
  
  return result;
}

async function loadCompositionPattern(patternName: string): Promise<CompositionPattern> {
  // Built-in composition patterns
  const patterns: Record<string, CompositionPattern> = {
    'agent-workflow': {
      name: 'agent-workflow',
      description: 'Combines an agent with a workflow for task execution',
      requiredTypes: ['agent', 'workflow'],
      optionalTypes: ['pattern', 'validator'],
      compositionRules: [
        { type: 'requires', contexts: ['agent', 'workflow'] },
        { type: 'sequence', contexts: ['agent', 'workflow'] }
      ]
    },
    'research-pipeline': {
      name: 'research-pipeline',
      description: 'Research workflow with multiple agents and validation',
      requiredTypes: ['workflow'],
      optionalTypes: ['agent', 'pattern', 'validator', 'context'],
      compositionRules: [
        { type: 'requires', contexts: ['workflow'] },
        { type: 'parallel', contexts: ['agent'] }
      ]
    }
  };
  
  const pattern = patterns[patternName];
  if (!pattern) {
    throw new Error(`Composition pattern not found: ${patternName}`);
  }
  
  return pattern;
}

function validatePatternRequirements(
  pattern: CompositionPattern, 
  contexts: LegoContext[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const contextTypes = contexts.map(c => c.type);
  
  // Check required types
  for (const requiredType of pattern.requiredTypes) {
    if (!contextTypes.includes(requiredType)) {
      errors.push(`Missing required context type: ${requiredType}`);
    }
  }
  
  // Check for unknown types
  for (const contextType of contextTypes) {
    if (!pattern.requiredTypes.includes(contextType) && !pattern.optionalTypes.includes(contextType)) {
      errors.push(`Unexpected context type for pattern ${pattern.name}: ${contextType}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

async function executeComposition(
  pattern: CompositionPattern,
  contexts: LegoContext[]
): Promise<LegoContext> {
  // Create a composed context that represents the entire assembly
  const composition: LegoContext = {
    id: `composed-${pattern.name}-${Date.now()}`,
    type: 'composition',
    description: `${pattern.description} - composed from ${contexts.length} contexts`,
    version: '1.0.0',
    pattern: pattern.name,
    components: contexts.map(c => ({ id: c.id, type: c.type })),
    composition_metadata: {
      created_at: new Date().toISOString(),
      pattern_used: pattern.name,
      component_count: contexts.length,
      component_types: [...new Set(contexts.map(c => c.type))]
    },
    execution_graph: generateExecutionGraph(pattern, contexts)
  };
  
  return composition;
}

function generateExecutionGraph(pattern: CompositionPattern, contexts: LegoContext[]): any {
  // Generate execution graph based on composition rules
  const graph = {
    nodes: contexts.map(c => ({ id: c.id, type: c.type })),
    edges: [],
    execution_order: []
  };
  
  // Process composition rules to build execution graph
  for (const rule of pattern.compositionRules) {
    switch (rule.type) {
      case 'sequence':
        // Add sequential dependencies
        for (let i = 0; i < rule.contexts.length - 1; i++) {
          const from = contexts.find(c => c.type === rule.contexts[i]);
          const to = contexts.find(c => c.type === rule.contexts[i + 1]);
          if (from && to) {
            graph.edges.push({ from: from.id, to: to.id, type: 'sequence' });
          }
        }
        break;
      case 'parallel':
        // Mark contexts as parallel executable
        const parallelContexts = contexts.filter(c => rule.contexts.includes(c.type));
        if (parallelContexts.length > 1) {
          graph.edges.push({
            type: 'parallel',
            contexts: parallelContexts.map(c => c.id)
          });
        }
        break;
    }
  }
  
  return graph;
}