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
 * Documentation-focused Turborepo generators
 * Extends the existing package generator with fractal documentation capabilities
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

  // Helper to generate relative paths
  plop.setHelper('relativePath', (from: string, to: string) => {
    const fromParts = from.split('/');
    const toParts = to.split('/');
    let i = 0;
    
    // Find common prefix
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }
    
    // Go up from 'from' to common ancestor
    const upLevels = fromParts.length - i;
    const up = '../'.repeat(upLevels);
    
    // Go down to 'to' from common ancestor
    const down = toParts.slice(i).join('/');
    
    return up + down;
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
        default: (answers: any) => {
          // Try to read description from existing package.json
          const packageJsonPath = join(answers.componentPath, 'package.json');
          if (existsSync(packageJsonPath)) {
            try {
              const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
              return pkg.description || '';
            } catch {}
          }
          return '';
        }
      },
      {
        type: 'confirm',
        name: 'hasExamples',
        message: 'Does this component have examples?',
        default: (answers: any) => existsSync(join(answers.componentPath, 'examples'))
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
        default: (answers: any) => {
          const type = answers.componentPath.startsWith('plugins/') ? 'Plugin architecture' :
                      answers.componentPath.startsWith('core/') ? 'Core package architecture' :
                      'Component architecture';
          return type;
        }
      }
    ],
    actions: (answers) => {
      const actions: PlopTypes.ActionType[] = [];
      
      if (!answers) return actions;
      
      const { componentPath, description, hasExamples, hasIntegration, architectureSummary } = answers;
      const componentName = componentPath.split('/').pop() || '';
      const componentType = componentPath.startsWith('plugins/') ? 'plugin' : 
                           componentPath.startsWith('core/') ? 'core' :
                           componentPath.startsWith('packages/') ? 'package' : 'app';
      
      // Only create docs structure if it doesn't exist
      if (!existsSync(join(componentPath, 'docs'))) {
        actions.push({
          type: 'add',
          path: `${componentPath}/docs/.gitkeep`,
          template: ''
        });
      }
      
      // Create fractal directory structure
      const docsSubdirs = ['architecture', 'features', 'adrs', 'specs', 'guides'];
      if (hasExamples) docsSubdirs.push('examples');
      
      docsSubdirs.forEach(subdir => {
        actions.push({
          type: 'add',
          path: `${componentPath}/docs/${subdir}/.gitkeep`,
          template: '',
          skipIfExists: true
        });
      });
      
      // Generate docs/README.md hub
      actions.push({
        type: 'add',
        path: `${componentPath}/docs/README.md`,
        template: `# ${componentName} Documentation Hub

**${description}**

> 🔗 **Component Entry Point:** [\`${componentPath}/README.md\`](../README.md)  
> 🏗️ **Architecture:** ${architectureSummary}

## 📚 Documentation Structure

### 🏗️ Architecture & Decisions
- [\`architecture.md\`](architecture.md) - Core ${componentName} architecture overview
- [\`adrs/\`](adrs/) - Architecture Decision Records (ADRs)

### ⚡ Features & Capabilities  
- [\`features/\`](features/) - ${componentName} feature specifications
${hasIntegration ? '- [`integration.md`](integration.md) - Integration patterns and examples' : ''}

### 📖 Specifications & Guides
- [\`specs/\`](specs/) - Technical specifications and protocols
- [\`guides/\`](guides/) - Usage and development guides

${hasExamples ? '### 🔬 Examples & Patterns\n- [`../examples/`](../examples/) - Working code examples and demonstrations' : ''}

## 🔗 Quantum Links

### Component Relationships
- **Parent:** [\`${componentType}/\`](../../README.md) - ${componentType} system
${componentType === 'plugin' ? '- **Siblings:** Other plugins in [`plugins/`](../../README.md)' : ''}
${componentType === 'core' ? '- **Siblings:** Other core packages in [`core/`](../../README.md)' : ''}

### Cross-System Integration
- **Agent System:** [\`agent/\`](../../../agent/README.md) - ${componentName}-aware agent runtime
${componentType === 'plugin' ? '- **Core System:** [`core/`](../../../core/README.md) - Core Leviathan packages' : ''}

## 🚀 Quick Navigation

**For Developers:**
- **Getting Started:** [\`../README.md#quick-start\`](../README.md#quick-start)
${hasIntegration ? '- **Integration Guide:** [`integration.md`](integration.md)' : ''}
- **API Reference:** [\`specs/\`](specs/)

**For Architects:**
- **System Design:** [\`architecture.md\`](architecture.md)
- **ADR Collection:** [\`adrs/\`](adrs/)

**For Users:**
${hasExamples ? '- **Usage Examples:** [`../examples/`](../examples/)' : ''}
- **Configuration:** [\`guides/\`](guides/)

---

*Part of the [Leviathan Fractal Documentation Architecture](${componentPath.split('/').map(() => '../').join('')}README.md#documentation-architecture---fractal--quantum-consciousness)*`,
        skipIfExists: true
      });
      
      // Post-generation formatting
      actions.push(async () => {
        try {
          console.log(`✅ Fractal documentation structure created for ${componentPath}`);
          console.log(`📁 Structure: docs/{architecture,features,adrs,specs,guides${hasExamples ? ',examples' : ''}}/`);
          console.log(`📋 Hub: ${componentPath}/docs/README.md`);
          return `Documentation generation completed successfully`;
        } catch (error) {
          return `⚠️ Documentation created but post-processing failed: ${error}`;
        }
      });
      
      return actions;
    }
  });

  plop.setGenerator('plugin-with-docs', {
    description: 'Generate a new Leviathan plugin with complete fractal documentation',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Plugin name (without @lev-os/ prefix):',
        validate: (input: string) => {
          if (!input.trim()) return 'Plugin name is required';
          if (input.includes('/')) return 'Plugin name should not contain slashes';
          if (existsSync(`plugins/${input}`)) return `Plugin ${input} already exists`;
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
      },
      {
        type: 'confirm',
        name: 'createExamples',
        message: 'Create examples directory?',
        default: true
      }
    ],
    actions: [
      // Create plugin package structure
      {
        type: 'add',
        path: 'plugins/{{ name }}/package.json',
        template: `{
  "name": "@lev-os/{{ name }}",
  "version": "0.1.0",
  "description": "{{ description }}",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./commands/*": "./src/commands/*.js"
  },
  "scripts": {
    "test": "node --experimental-vm-modules ../../node_modules/.bin/jest",
    "test:coverage": "npm run test -- --coverage",
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "keywords": [
    "leviathan",
    "lev-os", 
    "plugin",
    "{{ name }}",
    "{{ category }}"
  ],
  "author": "Leviathan Team",
  "license": "MIT",
  "dependencies": {
    "@lev-os/debug": "workspace:*"
  },
  "devDependencies": {
    "@lev-os/testing": "workspace:*"
  },
  "peerDependencies": {
    "@lev-os/core": "workspace:*"
  }
}`
      },
      {
        type: 'add',
        path: 'plugins/{{ name }}/src/index.ts',
        template: `/**
 * @lev-os/{{ name }} - {{ description }}
 * 
 * {{ category }} plugin for the Leviathan ecosystem
 */

export const name = '{{ name }}';
export const version = '0.1.0';
export const category = '{{ category }}';

/**
 * Main plugin class following Leviathan plugin patterns
 */
export default class {{ pascalCase name }}Plugin {
  private config: any;
  
  constructor(config: any = {}) {
    this.config = config;
  }
  
  /**
   * Initialize the plugin
   */
  async initialize() {
    // TODO: Implement plugin initialization
    console.log(\`Initializing {{ name }} plugin...\`);
  }
  
  /**
   * Get plugin metadata
   */
  getMetadata() {
    return {
      name,
      version,
      category,
      description: '{{ description }}'
    };
  }
  
  // TODO: Implement plugin functionality
}

// Export plugin instance
export const plugin = new {{ pascalCase name }}Plugin();`
      },
      // Create test structure
      {
        type: 'add',
        path: 'plugins/{{ name }}/tests/{{ name }}.test.js',
        template: `/**
 * Tests for @lev-os/{{ name }}
 */

import { describe, test, expect } from '@jest/globals';
import {{ pascalCase name }}Plugin from '../src/index.js';

describe('{{ pascalCase name }}Plugin', () => {
  test('should initialize correctly', async () => {
    const plugin = new {{ pascalCase name }}Plugin();
    await plugin.initialize();
    
    const metadata = plugin.getMetadata();
    expect(metadata.name).toBe('{{ name }}');
    expect(metadata.category).toBe('{{ category }}');
  });
  
  // TODO: Add more tests
});`
      },
      // Create fractal docs structure
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/README.md',
        template: `# @lev-os/{{ name }} Documentation Hub

**{{ description }}**

> 🔗 **Plugin Entry Point:** [\`plugins/{{ name }}/README.md\`](../README.md)  
> 🏗️ **Architecture:** {{ category }} plugin for Leviathan ecosystem

## 📚 Documentation Structure

### 🏗️ Architecture & Decisions
- [\`architecture.md\`](architecture.md) - Core {{ name }} architecture overview
- [\`adrs/\`](adrs/) - Architecture Decision Records (ADRs)

### ⚡ Features & Capabilities  
- [\`features/\`](features/) - {{ name }} feature specifications

### 📖 Specifications & Guides
- [\`specs/\`](specs/) - Technical specifications and protocols
- [\`guides/\`](guides/) - Usage and development guides

{{#if createExamples}}
### 🔬 Examples & Patterns
- [\`../examples/\`](../examples/) - Working code examples and demonstrations
{{/if}}

## 🔗 Quantum Links

### Plugin Ecosystem
- **Parent:** [\`plugins/\`](../../README.md) - Leviathan plugin ecosystem
- **Siblings:** Other plugins in the ecosystem

### Core Integration
- **Core System:** [\`core/\`](../../../core/README.md) - Core Leviathan packages
- **Agent Runtime:** [\`agent/\`](../../../agent/README.md) - Plugin-aware agents

## 🚀 Quick Navigation

**For Plugin Developers:**
- **Getting Started:** [\`../README.md\`](../README.md)
- **API Reference:** [\`specs/\`](specs/)

**For System Architects:**
- **Design Decisions:** [\`architecture/\`](architecture/)
- **ADR Collection:** [\`adrs/\`](adrs/)

---

*Part of the [Leviathan Fractal Documentation Architecture](../../../README.md#documentation-architecture---fractal--quantum-consciousness)*`
      },
      // Create directory structure
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/architecture/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/features/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/adrs/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/specs/.gitkeep',
        template: ''
      },
      {
        type: 'add',
        path: 'plugins/{{ name }}/docs/guides/.gitkeep',
        template: ''
      },
      // Conditionally create examples
      {
        type: 'add',
        path: 'plugins/{{ name }}/examples/.gitkeep',
        template: '',
        skip: (data) => !data.createExamples
      },
      // Install and format
      async (answers) => {
        if ('name' in answers && typeof answers.name === 'string') {
          try {
            execSync('pnpm i', { stdio: 'inherit' });
            console.log(`✅ Plugin ${answers.name} created with complete fractal documentation`);
            console.log(`📁 Location: plugins/${answers.name}/`);
            console.log(`📋 Docs Hub: plugins/${answers.name}/docs/README.md`);
            return 'Plugin generation completed successfully';
          } catch (error) {
            return `⚠️ Plugin created but installation failed: ${error}`;
          }
        }
        return '❌ Plugin creation failed';
      }
    ]
  });
}