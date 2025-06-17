// Abstract Context Schema Validator
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';

export class ContextValidator {
  constructor() {
    this.schemas = new Map();
    this.validationErrors = [];
    this.warnings = [];
    this.loadBuiltinSchemas();
  }

  loadBuiltinSchemas() {
    // Core context schema
    this.schemas.set('base', {
      type: 'object',
      required: ['name', 'type'],
      properties: {
        name: { type: 'string', minLength: 1 },
        slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
        type: { 
          type: 'string', 
          enum: ['agent', 'workflow', 'pattern', 'tool', 'theme', 'preference', 'type', 'instance']
        },
        version: { type: 'string' },
        metadata: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            author: { type: 'string' }
          }
        }
      }
    });

    // Agent-specific schema
    this.schemas.set('agent', {
      allOf: [
        { $ref: '#/schemas/base' },
        {
          properties: {
            agent: {
              type: 'object',
              properties: {
                personality: { type: 'string' },
                capabilities: { type: 'array', items: { type: 'string' } },
                endpoints: {
                  type: 'object',
                  patternProperties: {
                    '^[a-z-]+$': {
                      type: 'object',
                      properties: {
                        description: { type: 'string' },
                        prompt_style: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      ]
    });

    // Workflow-specific schema
    this.schemas.set('workflow', {
      allOf: [
        { $ref: '#/schemas/base' },
        {
          properties: {
            workflow: {
              type: 'object',
              properties: {
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      action: { type: 'string' }
                    }
                  }
                },
                coordination: { type: 'string' },
                parallel: { type: 'boolean' }
              }
            }
          }
        }
      ]
    });

    // Pattern-specific schema  
    this.schemas.set('pattern', {
      allOf: [
        { $ref: '#/schemas/base' },
        {
          properties: {
            pattern: {
              type: 'object',
              properties: {
                framework: { type: 'string' },
                steps: { type: 'array' },
                evaluation: { type: 'object' }
              }
            }
          }
        }
      ]
    });

    // Tool-specific schema
    this.schemas.set('tool', {
      allOf: [
        { $ref: '#/schemas/base' },
        {
          properties: {
            tool: {
              type: 'object',
              properties: {
                capabilities: { type: 'array', items: { type: 'string' } },
                integration: { type: 'object' },
                configuration: { type: 'object' }
              }
            }
          }
        }
      ]
    });
  }

  async validateDirectory(contextDir) {
    console.log(`🔍 Validating contexts in ${contextDir}`);
    
    const contextFiles = await glob('**/context.yaml', {
      cwd: contextDir,
      absolute: true
    });

    const results = {
      total: contextFiles.length,
      valid: 0,
      invalid: 0,
      warnings: 0,
      details: []
    };

    for (const filePath of contextFiles) {
      const result = await this.validateFile(filePath);
      results.details.push(result);
      
      if (result.valid) {
        results.valid++;
      } else {
        results.invalid++;
      }
      
      results.warnings += result.warnings.length;
    }

    this.printValidationReport(results);
    return results;
  }

  async validateFile(filePath) {
    const result = {
      file: filePath,
      relativePath: path.relative(process.cwd(), filePath),
      valid: false,
      errors: [],
      warnings: [],
      context: null
    };

    try {
      // Load and parse YAML
      const content = await fs.readFile(filePath, 'utf-8');
      result.context = yaml.load(content);
      
      // Validate structure
      await this.validateContext(result.context, result);
      
      // Additional validations
      this.validateNaming(result.context, result);
      this.validateIntegrity(result.context, result);
      
      result.valid = result.errors.length === 0;
      
    } catch (error) {
      result.errors.push(`Failed to parse YAML: ${error.message}`);
    }

    return result;
  }

  async validateContext(context, result) {
    if (!context) {
      result.errors.push('Context is null or empty');
      return;
    }

    // Validate against base schema
    this.validateAgainstSchema(context, 'base', result);
    
    // Validate against type-specific schema
    if (context.type && this.schemas.has(context.type)) {
      this.validateAgainstSchema(context, context.type, result);
    } else if (context.type) {
      result.warnings.push(`No specific schema for type: ${context.type}`);
    }
  }

  validateAgainstSchema(context, schemaName, result) {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      result.warnings.push(`Schema not found: ${schemaName}`);
      return;
    }

    // Simple validation (would use ajv or similar in production)
    this.validateObject(context, schema, result, schemaName);
  }

  validateObject(obj, schema, result, path = '') {
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in obj)) {
          result.errors.push(`Missing required field: ${path}.${field}`);
        }
      }
    }

    if (schema.properties) {
      for (const [key, value] of Object.entries(obj)) {
        if (schema.properties[key]) {
          this.validateField(value, schema.properties[key], result, `${path}.${key}`);
        }
      }
    }
  }

  validateField(value, fieldSchema, result, fieldPath) {
    // Type validation
    if (fieldSchema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== fieldSchema.type) {
        result.errors.push(`Type mismatch at ${fieldPath}: expected ${fieldSchema.type}, got ${actualType}`);
      }
    }

    // String validations
    if (fieldSchema.type === 'string') {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        result.errors.push(`String too short at ${fieldPath}: minimum ${fieldSchema.minLength} characters`);
      }
      
      if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
        result.errors.push(`Pattern mismatch at ${fieldPath}: must match ${fieldSchema.pattern}`);
      }
      
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        result.errors.push(`Invalid enum value at ${fieldPath}: must be one of ${fieldSchema.enum.join(', ')}`);
      }
    }

    // Array validations
    if (fieldSchema.type === 'array' && Array.isArray(value)) {
      if (fieldSchema.items) {
        value.forEach((item, index) => {
          this.validateField(item, fieldSchema.items, result, `${fieldPath}[${index}]`);
        });
      }
    }

    // Object validations
    if (fieldSchema.type === 'object' && typeof value === 'object') {
      this.validateObject(value, fieldSchema, result, fieldPath);
    }
  }

  validateNaming(context, result) {
    // Check slug consistency
    if (context.slug) {
      const expectedSlug = this.generateSlug(context.name);
      if (context.slug !== expectedSlug) {
        result.warnings.push(`Slug mismatch: expected '${expectedSlug}', got '${context.slug}'`);
      }
    } else {
      result.warnings.push('Missing slug field - auto-generation recommended');
    }

    // Check naming conventions
    if (context.type && context.name) {
      const namePattern = this.getNamePattern(context.type);
      if (namePattern && !namePattern.test(context.name)) {
        result.warnings.push(`Name doesn't follow ${context.type} conventions`);
      }
    }
  }

  validateIntegrity(context, result) {
    // Check for circular references in workflows
    if (context.type === 'workflow' && context.workflow?.steps) {
      const stepNames = context.workflow.steps.map(s => s.name);
      const duplicates = stepNames.filter((name, index) => stepNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        result.errors.push(`Duplicate step names: ${duplicates.join(', ')}`);
      }
    }

    // Check integration references
    if (context.integration) {
      for (const [key, value] of Object.entries(context.integration)) {
        if (typeof value === 'string' && value.startsWith('context:')) {
          result.warnings.push(`External context reference: ${key} -> ${value}`);
        }
      }
    }
  }

  generateSlug(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  getNamePattern(type) {
    const patterns = {
      agent: /^[A-Z][a-zA-Z\s]+$/,
      workflow: /^[A-Z][a-zA-Z\s-]+$/,
      pattern: /^[a-z][a-z-]+$/,
      tool: /^[a-z][a-z-]+$/
    };
    return patterns[type];
  }

  printValidationReport(results) {
    console.log('\n📋 Context Validation Report');
    console.log('=' .repeat(50));
    
    console.log(`\nTotal contexts: ${results.total}`);
    console.log(`✅ Valid: ${results.valid}`);
    console.log(`❌ Invalid: ${results.invalid}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    
    if (results.invalid > 0) {
      console.log('\n❌ Validation Errors:');
      for (const detail of results.details) {
        if (!detail.valid) {
          console.log(`\n  ${detail.relativePath}:`);
          for (const error of detail.errors) {
            console.log(`    ❌ ${error}`);
          }
        }
      }
    }
    
    if (results.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      for (const detail of results.details) {
        if (detail.warnings.length > 0) {
          console.log(`\n  ${detail.relativePath}:`);
          for (const warning of detail.warnings) {
            console.log(`    ⚠️  ${warning}`);
          }
        }
      }
    }
  }

  async autoFix(contextDir, options = {}) {
    const { dryRun = false, fixSlugs = true, fixTypes = true } = options;
    
    console.log(`🔧 Auto-fixing contexts in ${contextDir}`);
    
    const contextFiles = await glob('**/context.yaml', {
      cwd: contextDir,
      absolute: true
    });

    const fixes = [];

    for (const filePath of contextFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const context = yaml.load(content);
        let modified = false;

        // Fix missing slug
        if (fixSlugs && !context.slug && context.name) {
          context.slug = this.generateSlug(context.name);
          modified = true;
          fixes.push(`Added slug to ${path.relative(process.cwd(), filePath)}`);
        }

        // Fix type if determinable from directory structure
        if (fixTypes && !context.type) {
          const inferredType = this.inferTypeFromPath(filePath);
          if (inferredType) {
            context.type = inferredType;
            modified = true;
            fixes.push(`Added type '${inferredType}' to ${path.relative(process.cwd(), filePath)}`);
          }
        }

        // Write back if modified
        if (modified && !dryRun) {
          const newContent = yaml.dump(context, { indent: 2 });
          await fs.writeFile(filePath, newContent, 'utf-8');
        }

      } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
      }
    }

    if (dryRun) {
      console.log('\n🔍 Would apply these fixes:');
      for (const fix of fixes) {
        console.log(`  ${fix}`);
      }
    } else {
      console.log(`\n✅ Applied ${fixes.length} fixes`);
      for (const fix of fixes) {
        console.log(`  ${fix}`);
      }
    }

    return fixes;
  }

  inferTypeFromPath(filePath) {
    const pathParts = filePath.split(path.sep);
    const typeKeywords = ['agents', 'workflows', 'patterns', 'tools', 'themes', 'preferences', 'types', 'instances'];
    
    for (const part of pathParts) {
      if (typeKeywords.includes(part)) {
        return part.slice(0, -1); // Remove 's' suffix
      }
    }
    
    return null;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ContextValidator();
  const contextDir = process.argv[2] || './contexts';
  const autoFixFlag = process.argv.includes('--fix');
  const dryRun = process.argv.includes('--dry-run');
  
  if (autoFixFlag) {
    await validator.autoFix(contextDir, { dryRun });
  }
  
  await validator.validateDirectory(contextDir);
}