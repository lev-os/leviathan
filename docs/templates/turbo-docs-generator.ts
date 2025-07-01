import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

interface ComponentSpec {
  name: string;
  type: 'plugin' | 'package' | 'core' | 'app';
  description: string;
  namespace: string;
}

/**
 * Turborepo Generator Extension for Fractal Documentation
 * 
 * Extends existing Turborepo generators with documentation-specific templates
 * following the Leviathan fractal architecture principles.
 */
export default function docsGenerator(plop: PlopTypes.NodePlopAPI): void {
  
  // Helper to detect component type from path
  plop.setHelper('detectComponentType', (componentPath: string) => {
    if (componentPath.startsWith('plugins/')) return 'plugin';
    if (componentPath.startsWith('core/')) return 'core';
    if (componentPath.startsWith('packages/')) return 'package';
    if (componentPath.startsWith('apps/')) return 'app';
    return 'unknown';
  });

  // Helper to generate quantum links
  plop.setHelper('generateQuantumLinks', (componentPath: string, componentType: string) => {
    const links = [];
    
    switch (componentType) {
      case 'plugin':
        links.push({
          system: 'Plugin Ecosystem',
          path: '../../README.md',
          description: 'Leviathan plugin ecosystem'
        });
        break;
      case 'core':
        links.push({
          system: 'Core System',
          path: '../../README.md', 
          description: 'Core Leviathan packages'
        });
        break;
    }
    
    return links;
  });

  plop.setGenerator('docs', {
    description: 'Generate fractal documentation structure for existing component',
    prompts: [
      {
        type: 'input',
        name: 'componentPath',
        message: 'Enter the component path (e.g., core/memory, plugins/constitutional-ai):',
        validate: (input: string) => {
          if (!input.trim()) return 'Component path is required';
          if (!existsSync(input)) return `Component directory ${input} does not exist`;
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter component description:',
      },
      {
        type: 'confirm',
        name: 'hasExamples',
        message: 'Does this component have examples?',
        default: true
      },
      {
        type: 'confirm',
        name: 'hasIntegration',
        message: 'Does this component have integration documentation?',
        default: true
      },
      {
        type: 'input',
        name: 'architectureSummary',
        message: 'Brief architecture summary:',
      }
    ],
    actions: (answers) => {
      const actions: PlopTypes.ActionType[] = [];
      
      if (!answers) return actions;
      
      const { componentPath, description, hasExamples, hasIntegration, architectureSummary } = answers;
      const componentType = componentPath.startsWith('plugins/') ? 'plugin' : 
                           componentPath.startsWith('core/') ? 'core' :
                           componentPath.startsWith('packages/') ? 'package' : 'app';
      
      // Create fractal directory structure
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/architecture/.gitkeep`,
        template: ''
      });
      
      actions.push({
        type: 'add', 
        path: `${componentPath}/docs/features/.gitkeep`,
        template: ''
      });
      
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/adrs/.gitkeep`, 
        template: ''
      });
      
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/specs/.gitkeep`,
        template: ''
      });
      
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/guides/.gitkeep`,
        template: ''
      });
      
      if (hasExamples) {
        actions.push({
          type: 'add',
          path: `${componentPath}/docs/examples/.gitkeep`,
          template: ''
        });
      }
      
      // Generate docs/README.md hub using template
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/README.md`,
        templateFile: 'docs/templates/component-docs-readme.hbs',
        data: {
          name: componentPath.split('/').pop(),
          description: description,
          architecture_summary: architectureSummary,
          parent: '..',
          parent_path: componentPath.split('/').slice(0, -1).join('/') || '.',
          parent_link: '../README.md',
          parent_description: `${componentType} system`,
          has_examples: hasExamples,
          has_integration: hasIntegration,
          integrations: generateIntegrationsForType(componentType),
          root_path: '../'.repeat(componentPath.split('/').length + 1)
        }
      });
      
      // Generate component specification
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/component-spec.yaml`,
        templateFile: 'docs/templates/component-spec.yaml',
        data: {
          component_id: componentPath.replace('/', '-'),
          component_type: componentType,
          display_name: componentPath.split('/').pop(),
          namespace: componentType === 'plugin' ? '@lev-os' : componentType,
          version: '0.1.0',
          short_description: description,
          category: inferCategory(componentPath),
          primary_tag: componentType,
          secondary_tag: inferSecondaryTag(componentPath),
          arch_type: componentType === 'plugin' ? 'plugin' : 'hexagonal',
          architecture_summary: architectureSummary,
          has_examples: hasExamples,
          has_config: existsSync(join(componentPath, 'config'))
        }
      });
      
      // Post-generation formatting
      actions.push(async () => {
        try {
          execSync(`pnpm prettier --write ${componentPath}/docs/** --list-different`, { 
            stdio: 'inherit' 
          });
          return `✅ Fractal documentation structure created for ${componentPath}`;
        } catch (error) {
          return `⚠️ Documentation created but formatting failed: ${error}`;
        }
      });
      
      return actions;
    }
  });

  plop.setGenerator('plugin', {
    description: 'Generate a new Leviathan plugin with fractal documentation',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Plugin name (without @lev-os/ prefix):',
        validate: (input: string) => {
          if (!input.trim()) return 'Plugin name is required';
          if (input.includes('/')) return 'Plugin name should not contain slashes';
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Plugin description:',
      },
      {
        type: 'list',
        name: 'category',
        message: 'Plugin category:',
        choices: [
          'ai-tools',
          'workflow',
          'infrastructure', 
          'integration',
          'experimental'
        ]
      }
    ],
    actions: [
      // Create plugin structure
      {
        type: 'add',
        path: 'plugins/{{ name }}/package.json',
        templateFile: 'turbo/generators/templates/package.json.hbs',
        data: { name: '{{ name }}' }
      },
      {
        type: 'add',
        path: 'plugins/{{ name }}/src/index.ts',
        template: "export const name = '{{ name }}';\n\n// Plugin implementation\nexport default class {{ pascalCase name }}Plugin {\n  // TODO: Implement plugin\n}"
      },
      // Create fractal docs structure
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/README.md',
        templateFile: 'docs/templates/component-docs-readme.hbs'
      },
      // Install and format
      async (answers) => {
        if ('name' in answers && typeof answers.name === 'string') {
          execSync('pnpm i', { stdio: 'inherit' });
          execSync(`pnpm prettier --write plugins/${answers.name}/** --list-different`);
          return `✅ Plugin ${answers.name} created with fractal documentation`;
        }
        return '❌ Plugin creation failed';
      }
    ]
  });
}

// Helper functions
function generateIntegrationsForType(componentType: string) {
  const integrations = [];
  
  switch (componentType) {
    case 'plugin':
      integrations.push(
        { system: 'Agent Runtime', path: '../../../agent/README.md', link: '../../../agent/README.md', description: 'Plugin-aware agent runtime' },
        { system: 'Core System', path: '../../../core/README.md', link: '../../../core/README.md', description: 'Core Leviathan packages' }
      );
      break;
    case 'core':
      integrations.push(
        { system: 'Plugin System', path: '../../../plugins/', link: '../../../plugins/', description: 'Core-aware plugins' },
        { system: 'Agent System', path: '../../../agent/README.md', link: '../../../agent/README.md', description: 'Core-powered agent runtime' }
      );
      break;
  }
  
  return integrations;
}

function inferCategory(componentPath: string): string {
  if (componentPath.includes('memory')) return 'infrastructure';
  if (componentPath.includes('ai') || componentPath.includes('intelligence')) return 'ai-tools';
  if (componentPath.includes('workflow') || componentPath.includes('orchestrator')) return 'workflow';
  if (componentPath.includes('debug') || componentPath.includes('testing')) return 'tooling';
  return 'general';
}

function inferSecondaryTag(componentPath: string): string {
  if (componentPath.includes('memory')) return 'storage';
  if (componentPath.includes('constitutional')) return 'ai-ethics';
  if (componentPath.includes('workflow')) return 'automation';
  return 'leviathan';
}