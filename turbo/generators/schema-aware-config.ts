import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import yaml from "js-yaml";

/**
 * Schema-aware Turborepo generators for Leviathan
 * Uses the schema hierarchy to generate type-specific components with validation
 */

interface ComponentSpec {
  metadata: {
    id: string;
    type: 'plugin' | 'package' | 'core' | 'app';
    name: string;
    version: string;
    description: string;
    namespace: string;
    category: string;
    tags: string[];
  };
  architecture: {
    type: string;
    summary: string;
    dependencies: {
      core: string[];
      external: string[];
    };
  };
  structure: {
    has_src: boolean;
    has_tests: boolean;
    has_docs: boolean;
    has_examples: boolean;
    has_config: boolean;
  };
}

/**
 * Load component schema template
 */
function loadSchemaTemplate(componentType: string): any {
  const schemaPath = join(process.cwd(), 'docs/schemas/types', `${componentType}.yaml`);
  
  if (!existsSync(schemaPath)) {
    throw new Error(`Schema template not found for type: ${componentType}`);
  }
  
  try {
    const content = readFileSync(schemaPath, 'utf-8');
    return yaml.load(content);
  } catch (error) {
    throw new Error(`Failed to load schema template: ${error}`);
  }
}

/**
 * Generate component specification from schema and user input
 */
function generateComponentSpec(answers: any, componentType: string): ComponentSpec {
  const schemaTemplate = loadSchemaTemplate(componentType);
  
  return {
    metadata: {
      id: answers.name.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
      type: componentType as any,
      name: answers.name,
      version: '0.1.0',
      description: answers.description,
      namespace: schemaTemplate.metadata.namespace,
      category: answers.category || 'general',
      tags: [componentType, 'leviathan', ...(answers.tags || [])],
    },
    architecture: {
      type: schemaTemplate.architecture.type,
      summary: answers.architectureSummary || `${componentType} architecture`,
      dependencies: {
        core: ['@lev-os/debug'],
        external: answers.dependencies ? answers.dependencies.split(' ').filter(Boolean) : [],
      },
    },
    structure: {
      has_src: true,
      has_tests: true,
      has_docs: true,
      has_examples: answers.createExamples || false,
      has_config: answers.hasConfig || false,
    },
  };
}

/**
 * Load Handlebars template with inheritance support
 */
function loadTemplate(templateType: string, templateName: string): string {
  const templatePath = join(process.cwd(), 'docs/templates', templateType, `${templateName}.hbs`);
  
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, 'utf-8');
  }
  
  // Fallback to base template
  const basePath = join(process.cwd(), 'docs/templates/base', `${templateName}.hbs`);
  if (existsSync(basePath)) {
    return readFileSync(basePath, 'utf-8');
  }
  
  throw new Error(`Template not found: ${templateType}/${templateName}`);
}

export default function schemaAwareGenerator(plop: PlopTypes.NodePlopAPI): void {
  
  // Helper to load schema-driven defaults
  plop.setHelper('schemaDefaults', (componentType: string) => {
    try {
      return loadSchemaTemplate(componentType);
    } catch {
      return {};
    }
  });

  // Helper to validate component type
  plop.setHelper('isValidType', (type: string) => {
    const validTypes = ['plugin', 'core', 'package', 'app'];
    return validTypes.includes(type);
  });

  plop.setGenerator('component', {
    description: 'Generate new component with schema-driven structure',
    prompts: [
      {
        type: 'list',
        name: 'componentType',
        message: 'What type of component are you creating?',
        choices: [
          { name: 'Plugin (@lev-os/*)', value: 'plugin' },
          { name: 'Core Package (core/*)', value: 'core' },
          { name: 'Shared Package (packages/*)', value: 'package' },
          { name: 'Application (apps/*)', value: 'app' },
        ],
      },
      {
        type: 'input',
        name: 'name',
        message: (answers: any) => {
          const prefix = answers.componentType === 'plugin' ? '' : 
                        answers.componentType === 'core' ? 'core/' :
                        answers.componentType === 'package' ? 'packages/' : 'apps/';
          return `Component name (will be placed in ${prefix}):`;
        },
        validate: (input: string, answers: any) => {
          if (!input.trim()) return 'Component name is required';
          
          const directory = answers.componentType === 'plugin' ? 'plugins' :
                           answers.componentType === 'core' ? 'core' :
                           answers.componentType === 'package' ? 'packages' : 'apps';
          
          if (existsSync(join(directory, input))) {
            return `Component ${input} already exists in ${directory}/`;
          }
          
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Component description:',
        validate: (input: string) => {
          if (!input.trim()) return 'Description is required';
          if (input.length < 10) return 'Description must be at least 10 characters';
          if (input.length > 200) return 'Description must be less than 200 characters';
          return true;
        },
      },
      {
        type: 'list',
        name: 'category',
        message: 'Component category:',
        choices: [
          'infrastructure',
          'ai-tools',
          'workflow',
          'integration',
          'tooling',
          'ui-components',
          'experimental',
        ],
      },
      {
        type: 'confirm',
        name: 'createExamples',
        message: 'Create examples directory?',
        default: true,
      },
      {
        type: 'input',
        name: 'architectureSummary',
        message: 'Brief architecture summary:',
        default: (answers: any) => `${answers.componentType} following Leviathan patterns`,
      },
    ],
    actions: (answers) => {
      if (!answers) return [];
      
      const { componentType, name } = answers;
      const directory = componentType === 'plugin' ? 'plugins' :
                       componentType === 'core' ? 'core' :
                       componentType === 'package' ? 'packages' : 'apps';
      
      const componentPath = `${directory}/${name}`;
      const spec = generateComponentSpec(answers, componentType);
      
      const actions: PlopTypes.ActionType[] = [];
      
      // Generate component specification
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/component-spec.yaml`,
        template: yaml.dump(spec, { indent: 2 }),
      });
      
      // Create package.json
      actions.push({
        type: 'add',
        path: `${componentPath}/package.json`,
        template: JSON.stringify({
          name: componentType === 'plugin' ? `@lev-os/${name}` : `@lev/${name}`,
          version: '0.1.0',
          description: spec.metadata.description,
          type: 'module',
          main: './src/index.js',
          scripts: {
            build: 'tsc',
            test: 'vitest',
            'test:coverage': 'vitest --coverage',
          },
          dependencies: {
            '@lev-os/debug': 'workspace:*',
          },
          devDependencies: {
            '@lev-os/testing': 'workspace:*',
            '@lev-os/tsconfig': 'workspace:*',
          },
        }, null, 2),
      });
      
      // Create fractal documentation structure
      const requiredDirs = ['architecture', 'features', 'adrs', 'specs', 'guides'];
      if (spec.structure.has_examples) requiredDirs.push('examples');
      
      requiredDirs.forEach(dir => {
        actions.push({
          type: 'add',
          path: `${componentPath}/docs/${dir}/.gitkeep`,
          template: '',
        });
      });
      
      // Generate docs/README.md using schema-aware templates
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/README.md`,
        template: loadTemplate(componentType, 'docs-readme'),
        data: {
          ...spec,
          component_path: componentPath,
          root_relative_path: '../'.repeat(componentPath.split('/').length + 1),
          has_integration: true,
          has_decisions: componentType === 'core',
          custom_capabilities_table: '',
          custom_navigation: '',
        },
      });
      
      // Create source structure
      actions.push({
        type: 'add',
        path: `${componentPath}/src/index.ts`,
        template: `/**
 * ${spec.metadata.name} - ${spec.metadata.description}
 */

export const name = '${name}';
export const version = '${spec.metadata.version}';
export const type = '${componentType}';

// TODO: Implement ${componentType} functionality
`,
      });
      
      // Create basic test
      actions.push({
        type: 'add',
        path: `${componentPath}/tests/${name}.test.js`,
        template: `import { describe, test, expect } from 'vitest';
import { name, version, type } from '../src/index.js';

describe('${spec.metadata.name}', () => {
  test('should have correct metadata', () => {
    expect(name).toBe('${name}');
    expect(version).toBe('${spec.metadata.version}');
    expect(type).toBe('${componentType}');
  });
  
  // TODO: Add component-specific tests
});`,
      });
      
      // Create examples if requested
      if (spec.structure.has_examples) {
        actions.push({
          type: 'add',
          path: `${componentPath}/examples/basic-usage.js`,
          template: `/**
 * Basic usage example for ${spec.metadata.name}
 */

import { name } from '../src/index.js';

console.log(\`Using \${name} ${componentType}\`);

// TODO: Add usage examples`,
        });
      }
      
      // Post-generation actions
      actions.push(async () => {
        try {
          // Install dependencies
          execSync('pnpm install', { stdio: 'inherit' });
          
          // Validate schema compliance
          const validateScript = join(process.cwd(), 'docs/templates/validation/validate-schema.js');
          if (existsSync(validateScript)) {
            execSync(`node ${validateScript} ${componentPath}`, { stdio: 'inherit' });
          }
          
          console.log(`\n✅ Component ${name} created successfully!`);
          console.log(`📁 Location: ${componentPath}/`);
          console.log(`📋 Specification: ${componentPath}/docs/component-spec.yaml`);
          console.log(`📚 Documentation: ${componentPath}/docs/README.md`);
          
          return 'Component generation completed';
        } catch (error) {
          return `⚠️ Component created but post-processing failed: ${error}`;
        }
      });
      
      return actions;
    },
  });

  plop.setGenerator('docs-only', {
    description: 'Add fractal documentation to existing component',
    prompts: [
      {
        type: 'input',
        name: 'componentPath',
        message: 'Component path (e.g., core/memory, plugins/constitutional-ai):',
        validate: (input: string) => {
          if (!input.trim()) return 'Component path is required';
          if (!existsSync(input)) return `Directory ${input} does not exist`;
          return true;
        },
      },
      {
        type: 'list',
        name: 'componentType',
        message: 'Component type:',
        choices: ['plugin', 'core', 'package', 'app'],
      },
    ],
    actions: [
      async (answers) => {
        if (!answers) return 'No answers provided';
        
        const { componentPath, componentType } = answers;
        
        // Try to read existing package.json for metadata
        const packageJsonPath = join(componentPath, 'package.json');
        let packageData: any = {};
        
        if (existsSync(packageJsonPath)) {
          try {
            packageData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          } catch {
            // Ignore parsing errors
          }
        }
        
        // Generate basic spec from existing data
        const spec = generateComponentSpec({
          name: packageData.name || componentPath.split('/').pop(),
          description: packageData.description || 'Component description',
          category: 'general',
          architectureSummary: `${componentType} architecture`,
          createExamples: existsSync(join(componentPath, 'examples')),
        }, componentType);
        
        // Create docs structure if it doesn't exist
        const docsPath = join(componentPath, 'docs');
        if (!existsSync(docsPath)) {
          execSync(`mkdir -p "${docsPath}"`, { stdio: 'inherit' });
        }
        
        // Create fractal directories
        const requiredDirs = ['architecture', 'features', 'adrs', 'specs', 'guides'];
        requiredDirs.forEach(dir => {
          const dirPath = join(docsPath, dir);
          if (!existsSync(dirPath)) {
            execSync(`mkdir -p "${dirPath}"`, { stdio: 'inherit' });
          }
        });
        
        // Generate component spec
        const specPath = join(componentPath, 'docs/component-spec.yaml');
        writeFileSync(specPath, yaml.dump(spec, { indent: 2 }));
        
        // Generate docs/README.md
        const templateContent = loadTemplate(componentType, 'docs-readme');
        // TODO: Process Handlebars template
        const readmePath = join(componentPath, 'docs/README.md');
        writeFileSync(readmePath, `# ${spec.metadata.name} Documentation Hub\n\n**${spec.metadata.description}**\n\n> 🔗 **Component Entry Point:** [\`${componentPath}/README.md\`](../README.md)\n\n*Generated from schema template - customize as needed*`);
        
        console.log(`✅ Documentation structure created for ${componentPath}`);
        return 'Documentation generation completed';
      },
    ],
  });
}