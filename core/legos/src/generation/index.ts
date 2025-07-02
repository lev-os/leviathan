/**
 * Build-time Generation System
 * 
 * Creates new components using schema-validated templates and intelligent defaults.
 * This is where new lego pieces are manufactured according to the factory specifications.
 */

import type { GenerationOptions } from '../index.js';

export interface GenerationTemplate {
  name: string;
  type: string;
  template: string;
  schema: any;
  defaults: Record<string, any>;
}

export interface GenerationResult {
  success: boolean;
  output?: string;
  errors: string[];
  template_used: string;
}

/**
 * Generates new context from type and data
 */
export async function generateContext(
  type: string, 
  data: any, 
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  const { 
    template = 'default', 
    outputFormat = 'yaml', 
    includeComments = true 
  } = options;
  
  const result: GenerationResult = {
    success: false,
    errors: [],
    template_used: template
  };
  
  try {
    // Load template for the context type
    const generationTemplate = await loadTemplate(type, template);
    
    // Merge data with defaults
    const contextData = mergeWithDefaults(data, generationTemplate.defaults);
    
    // Validate required fields
    const validation = validateRequiredFields(contextData, type);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }
    
    // Generate the output
    result.output = await renderTemplate(generationTemplate, contextData, outputFormat, includeComments);
    result.success = true;
    
  } catch (error) {
    result.errors.push(`Generation failed: ${error.message}`);
  }
  
  return result;
}

async function loadTemplate(type: string, templateName: string): Promise<GenerationTemplate> {
  // Template loading logic - this would load from templates directory
  const templates: Record<string, GenerationTemplate> = {
    agent: {
      name: 'default',
      type: 'agent',
      template: `# {{id}}
id: "{{id}}"
type: "agent"
description: "{{description}}"
version: "{{version}}"
persona:
  archetype: "{{persona.archetype}}"
  voice: "{{persona.voice}}"
  {{#if persona.cognitive_bias}}cognitive_bias: "{{persona.cognitive_bias}}"{{/if}}
toolkit:
  thinking_patterns:
    {{#each toolkit.thinking_patterns}}
    - "{{this}}"
    {{/each}}
  {{#if toolkit.agent_tools}}
  agent_tools:
    {{#each toolkit.agent_tools}}
    - "{{this}}"
    {{/each}}
  {{/if}}`,
      schema: {},
      defaults: {
        version: '1.0.0',
        persona: {
          archetype: 'The Specialist',
          voice: 'Professional and focused'
        },
        toolkit: {
          thinking_patterns: ['analytical-thinking']
        }
      }
    }
  };
  
  const template = templates[type];
  if (!template) {
    throw new Error(`Template not found for type: ${type}`);
  }
  
  return template;
}

function mergeWithDefaults(data: any, defaults: any): any {
  return {
    ...defaults,
    ...data,
    persona: { ...defaults.persona, ...data.persona },
    toolkit: { ...defaults.toolkit, ...data.toolkit }
  };
}

function validateRequiredFields(data: any, type: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.id) errors.push('Missing required field: id');
  if (!data.description) errors.push('Missing required field: description');
  
  if (type === 'agent') {
    if (!data.persona?.archetype) errors.push('Missing required field: persona.archetype');
    if (!data.persona?.voice) errors.push('Missing required field: persona.voice');
    if (!data.toolkit?.thinking_patterns?.length) {
      errors.push('Missing required field: toolkit.thinking_patterns (must be non-empty array)');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

async function renderTemplate(
  template: GenerationTemplate, 
  data: any, 
  format: string, 
  includeComments: boolean
): Promise<string> {
  // Simple template rendering - in practice would use Handlebars
  let output = template.template;
  
  // Replace placeholders
  output = output.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? String(value) : match;
  });
  
  // Handle conditionals and loops (basic implementation)
  output = handleConditionals(output, data);
  output = handleLoops(output, data);
  
  if (!includeComments) {
    output = output.replace(/^\s*#.*$/gm, '').replace(/\n\n+/g, '\n\n');
  }
  
  return output;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function handleConditionals(template: string, data: any): string {
  // Basic conditional handling - would use proper template engine in practice
  return template.replace(/\{\{#if (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, path, content) => {
    const value = getNestedValue(data, path);
    return value ? content : '';
  });
}

function handleLoops(template: string, data: any): string {
  // Basic loop handling - would use proper template engine in practice
  return template.replace(/\{\{#each (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, path, content) => {
    const array = getNestedValue(data, path);
    if (!Array.isArray(array)) return '';
    
    return array.map(item => 
      content.replace(/\{\{this\}\}/g, String(item))
    ).join('');
  });
}