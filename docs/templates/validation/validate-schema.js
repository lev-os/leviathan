#!/usr/bin/env node

/**
 * Schema validation script for Leviathan components
 * Validates component YAML against appropriate JSON Schema
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Schema paths
const SCHEMA_DIR = join(__dirname, '../validation');
const BASE_SCHEMA_PATH = join(SCHEMA_DIR, 'base.json');
const TYPE_SCHEMA_DIR = join(SCHEMA_DIR, 'types');

/**
 * Load and compile JSON Schema
 */
function loadSchema(schemaPath) {
  try {
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    return JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(`Failed to load schema ${schemaPath}: ${error.message}`);
  }
}

/**
 * Load component YAML specification
 */
function loadComponentSpec(componentPath) {
  const specPath = join(componentPath, 'docs', 'component-spec.yaml');
  
  if (!existsSync(specPath)) {
    throw new Error(`Component spec not found: ${specPath}`);
  }
  
  try {
    const yamlContent = readFileSync(specPath, 'utf-8');
    return yaml.load(yamlContent);
  } catch (error) {
    throw new Error(`Failed to parse YAML ${specPath}: ${error.message}`);
  }
}

/**
 * Validate component specification against schema
 */
function validateComponent(componentPath, options = {}) {
  console.log(`\n🔍 Validating component: ${componentPath}`);
  
  try {
    // Load component specification
    const componentSpec = loadComponentSpec(componentPath);
    
    if (!componentSpec.metadata || !componentSpec.metadata.type) {
      throw new Error('Component spec missing metadata.type field');
    }
    
    const componentType = componentSpec.metadata.type;
    console.log(`   Type: ${componentType}`);
    
    // Load appropriate schema
    const typeSchemaPath = join(TYPE_SCHEMA_DIR, `${componentType}.json`);
    let schema;
    
    if (existsSync(typeSchemaPath)) {
      schema = loadSchema(typeSchemaPath);
      console.log(`   Schema: ${componentType}.json`);
    } else {
      schema = loadSchema(BASE_SCHEMA_PATH);
      console.log(`   Schema: base.json (fallback)`);
    }
    
    // Initialize AJV validator
    const ajv = new Ajv({ 
      allErrors: true,
      verbose: options.verbose || false
    });
    
    // Add base schema as reference if using type schema
    if (existsSync(typeSchemaPath)) {
      const baseSchema = loadSchema(BASE_SCHEMA_PATH);
      ajv.addSchema(baseSchema, 'https://leviathan.dev/schemas/base.json');
    }
    
    // Compile and validate
    const validate = ajv.compile(schema);
    const isValid = validate(componentSpec);
    
    if (isValid) {
      console.log(`   ✅ Valid - Component specification is compliant`);
      return { valid: true, component: componentPath, type: componentType };
    } else {
      console.log(`   ❌ Invalid - Schema validation failed`);
      
      if (options.verbose) {
        validate.errors.forEach((error, index) => {
          console.log(`      ${index + 1}. ${error.instancePath || 'root'}: ${error.message}`);
          if (error.data !== undefined) {
            console.log(`         Data: ${JSON.stringify(error.data)}`);
          }
        });
      } else {
        console.log(`      ${validate.errors.length} validation error(s) found`);
        console.log(`      Use --verbose for details`);
      }
      
      return { 
        valid: false, 
        component: componentPath, 
        type: componentType, 
        errors: validate.errors 
      };
    }
    
  } catch (error) {
    console.log(`   ❌ Error - ${error.message}`);
    return { 
      valid: false, 
      component: componentPath, 
      error: error.message 
    };
  }
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node validate-schema.js <component-path> [options]

Options:
  --verbose     Show detailed validation errors
  --help        Show this help message

Examples:
  node validate-schema.js core/memory
  node validate-schema.js plugins/constitutional-ai --verbose
`);
    process.exit(1);
  }
  
  const options = {
    verbose: args.includes('--verbose')
  };
  
  if (args.includes('--help')) {
    console.log(`
Leviathan Component Schema Validator

Validates component YAML specifications against their appropriate JSON schemas.

Schema Hierarchy:
  base.json           - Universal component schema
  types/plugin.json   - Plugin-specific schema (extends base)
  types/core.json     - Core package schema (extends base)
  types/package.json  - Package schema (extends base)
  types/app.json      - Application schema (extends base)

Component specifications should be located at:
  {component}/docs/component-spec.yaml
`);
    process.exit(0);
  }
  
  const componentPath = args.find(arg => !arg.startsWith('--'));
  
  if (!componentPath) {
    console.error('❌ Component path is required');
    process.exit(1);
  }
  
  const result = validateComponent(componentPath, options);
  
  if (!result.valid) {
    process.exit(1);
  }
}

// Export for use as module
export { validateComponent, loadComponentSpec, loadSchema };

// Run as CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}