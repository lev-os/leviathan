const fs = require('fs').promises;
const path = require('path');

class TestHarnessGenerator {
  constructor() {
    this.templateDir = path.join(__dirname, '../templates/harnesses');
    this.ensureTemplateDir();
  }

  async ensureTemplateDir() {
    try {
      await fs.access(this.templateDir);
    } catch {
      await fs.mkdir(this.templateDir, { recursive: true });
    }
  }

  async generateTestHarness(project, interfaceType) {
    console.log(`🧪 Generating ${interfaceType} test harness for ${project.name}`);
    
    const generator = this.getGeneratorForInterface(interfaceType);
    if (!generator) {
      throw new Error(`Unsupported interface type: ${interfaceType}`);
    }

    const harness = await generator(project);
    
    return {
      id: this.generateHarnessId(project.id, interfaceType),
      projectId: project.id,
      interfaceType,
      harness,
      generatedAt: new Date().toISOString(),
      metadata: {
        framework: project.analysis?.framework,
        language: project.analysis?.language,
        hasDocker: project.analysis?.hasDocker
      }
    };
  }

  getGeneratorForInterface(interfaceType) {
    const generators = {
      'cli': this.generateCliHarness.bind(this),
      'api': this.generateApiHarness.bind(this),
      'mcp': this.generateMcpHarness.bind(this),
      'library': this.generateLibraryHarness.bind(this),
      'browser-automation': this.generateBrowserAutomationHarness.bind(this)
    };

    return generators[interfaceType];
  }

  async generateCliHarness(project) {
    const cliInterface = project.interfaces?.cli;
    
    return {
      type: 'cli',
      ui: {
        title: `CLI Test Harness: ${project.name}`,
        description: project.metadata?.description || 'Command line interface testing',
        components: [
          {
            type: 'command-input',
            id: 'cli-command',
            label: 'Command',
            placeholder: 'Enter CLI command...',
            suggestions: this.generateCliSuggestions(project)
          },
          {
            type: 'environment-vars',
            id: 'env-vars',
            label: 'Environment Variables',
            variables: this.extractEnvironmentVariables(project)
          },
          {
            type: 'file-upload',
            id: 'input-files',
            label: 'Input Files',
            accept: '*'
          },
          {
            type: 'terminal-output',
            id: 'output',
            label: 'Output',
            realtime: true
          }
        ]
      },
      execution: {
        type: 'docker',
        image: this.getDockerImage(project),
        workdir: '/app',
        entrypoint: this.getEntrypoint(project),
        environment: ['NODE_ENV=test'],
        timeout: 30000,
        resourceLimits: {
          memory: '512m',
          cpu: '0.5'
        }
      },
      examples: this.generateCliExamples(project)
    };
  }

  async generateApiHarness(project) {
    const apiInterface = project.interfaces?.api;
    
    return {
      type: 'api',
      ui: {
        title: `API Test Harness: ${project.name}`,
        description: project.metadata?.description || 'API endpoint testing',
        components: [
          {
            type: 'endpoint-selector',
            id: 'endpoint',
            label: 'Endpoint',
            endpoints: await this.discoverApiEndpoints(project)
          },
          {
            type: 'http-method',
            id: 'method',
            label: 'Method',
            options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
          },
          {
            type: 'headers-editor',
            id: 'headers',
            label: 'Headers',
            defaultHeaders: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          },
          {
            type: 'json-editor',
            id: 'body',
            label: 'Request Body',
            schema: null // Will be populated based on endpoint
          },
          {
            type: 'api-key-selector',
            id: 'auth',
            label: 'Authentication',
            vaultIntegration: true
          },
          {
            type: 'response-viewer',
            id: 'response',
            label: 'Response',
            formats: ['json', 'text', 'html']
          }
        ]
      },
      execution: {
        type: 'docker',
        image: this.getDockerImage(project),
        ports: ['3000:3000'],
        healthcheck: '/health',
        startup: {
          command: project.metadata?.startCommand || 'npm start',
          waitFor: 'port:3000',
          timeout: 60000
        }
      },
      examples: this.generateApiExamples(project)
    };
  }

  async generateMcpHarness(project) {
    return {
      type: 'mcp',
      ui: {
        title: `MCP Test Harness: ${project.name}`,
        description: project.metadata?.description || 'MCP server testing',
        components: [
          {
            type: 'mcp-tool-selector',
            id: 'tool',
            label: 'Tool',
            tools: await this.discoverMcpTools(project)
          },
          {
            type: 'json-schema-form',
            id: 'tool-args',
            label: 'Tool Arguments',
            dynamic: true // Schema changes based on selected tool
          },
          {
            type: 'mcp-resources',
            id: 'resources',
            label: 'Available Resources',
            readonly: true
          },
          {
            type: 'mcp-response',
            id: 'response',
            label: 'Response',
            realtime: true
          }
        ]
      },
      execution: {
        type: 'mcp-stdio',
        command: this.getMcpCommand(project),
        protocol: 'stdio',
        timeout: 30000,
        resourceLimits: {
          memory: '256m',
          cpu: '0.3'
        }
      },
      examples: this.generateMcpExamples(project)
    };
  }

  async generateLibraryHarness(project) {
    return {
      type: 'library',
      ui: {
        title: `Library Test Harness: ${project.name}`,
        description: project.metadata?.description || 'Library function testing',
        components: [
          {
            type: 'function-selector',
            id: 'function',
            label: 'Function',
            functions: await this.discoverLibraryFunctions(project)
          },
          {
            type: 'code-editor',
            id: 'test-code',
            label: 'Test Code',
            language: project.analysis?.language || 'javascript',
            template: this.getCodeTemplate(project)
          },
          {
            type: 'console-output',
            id: 'output',
            label: 'Output',
            realtime: true
          }
        ]
      },
      execution: {
        type: 'docker',
        image: this.getDockerImage(project),
        workdir: '/app',
        installCommand: this.getInstallCommand(project),
        timeout: 30000
      },
      examples: this.generateLibraryExamples(project)
    };
  }

  async generateBrowserAutomationHarness(project) {
    return {
      type: 'browser-automation',
      ui: {
        title: `Browser Automation Test: ${project.name}`,
        description: project.metadata?.description || 'Browser automation testing',
        components: [
          {
            type: 'url-input',
            id: 'target-url',
            label: 'Target URL',
            placeholder: 'https://example.com'
          },
          {
            type: 'browser-selector',
            id: 'browser',
            label: 'Browser',
            options: ['chromium', 'firefox', 'webkit']
          },
          {
            type: 'automation-script',
            id: 'script',
            label: 'Automation Script',
            language: 'javascript',
            template: this.getBrowserTemplate(project)
          },
          {
            type: 'screenshot-viewer',
            id: 'screenshots',
            label: 'Screenshots',
            realtime: true
          },
          {
            type: 'browser-logs',
            id: 'logs',
            label: 'Browser Logs',
            realtime: true
          }
        ]
      },
      execution: {
        type: 'docker',
        image: 'mcr.microsoft.com/playwright:latest',
        environment: ['DISPLAY=:99'],
        volumes: ['/tmp/.X11-unix:/tmp/.X11-unix'],
        timeout: 120000
      },
      examples: this.generateBrowserAutomationExamples(project)
    };
  }

  // Helper methods for generating suggestions and examples
  generateCliSuggestions(project) {
    const suggestions = [];
    
    if (project.metadata?.scripts) {
      Object.keys(project.metadata.scripts).forEach(script => {
        suggestions.push(`npm run ${script}`);
      });
    }
    
    // Add common CLI patterns based on project type
    if (project.analysis?.type === 'mcp-server') {
      suggestions.push('node index.js');
      suggestions.push('npm start');
    }
    
    return suggestions;
  }

  extractEnvironmentVariables(project) {
    const envVars = [];
    
    // Common environment variables
    envVars.push(
      { name: 'NODE_ENV', value: 'development', required: false },
      { name: 'PORT', value: '3000', required: false }
    );
    
    // Try to detect from .env files or documentation
    if (project.analysis?.files) {
      const hasEnvFile = project.analysis.files.some(f => f.name === '.env');
      if (hasEnvFile) {
        envVars.push({ name: 'API_KEY', value: '', required: true });
      }
    }
    
    return envVars;
  }

  async discoverApiEndpoints(project) {
    // Placeholder - would analyze code to discover actual endpoints
    return [
      { path: '/health', method: 'GET', description: 'Health check' },
      { path: '/api/status', method: 'GET', description: 'API status' }
    ];
  }

  async discoverMcpTools(project) {
    // Placeholder - would parse MCP server configuration
    return [
      { name: 'example_tool', description: 'Example MCP tool' }
    ];
  }

  async discoverLibraryFunctions(project) {
    // Placeholder - would analyze exported functions
    return [
      { name: 'main', signature: 'main(args)', description: 'Main function' }
    ];
  }

  getDockerImage(project) {
    const language = project.analysis?.language;
    
    const images = {
      'node': 'node:18-alpine',
      'python': 'python:3.11-slim',
      'rust': 'rust:1.70',
      'go': 'golang:1.21-alpine'
    };
    
    return images[language] || 'node:18-alpine';
  }

  getEntrypoint(project) {
    return project.metadata?.entryPoint || 'index.js';
  }

  getMcpCommand(project) {
    if (project.analysis?.language === 'node') {
      return `node ${this.getEntrypoint(project)}`;
    }
    return './main';
  }

  getInstallCommand(project) {
    const packageManager = project.analysis?.packageManager || 'npm';
    return `${packageManager} install`;
  }

  getCodeTemplate(project) {
    const language = project.analysis?.language;
    
    const templates = {
      'node': `// Test ${project.name}
const lib = require('./${this.getEntrypoint(project)}');

// Your test code here
console.log('Testing ${project.name}...');
`,
      'python': `# Test ${project.name}
import sys
sys.path.append('.')

# Your test code here
print('Testing ${project.name}...')
`
    };
    
    return templates[language] || templates['node'];
  }

  getBrowserTemplate(project) {
    return `// Browser automation test for ${project.name}
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to target URL
  await page.goto(targetUrl);
  
  // Your automation code here
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
})();
`;
  }

  generateCliExamples(project) {
    return [
      {
        name: 'Basic execution',
        command: `node ${this.getEntrypoint(project)}`,
        description: 'Run the main entry point'
      }
    ];
  }

  generateApiExamples(project) {
    return [
      {
        name: 'Health check',
        method: 'GET',
        endpoint: '/health',
        description: 'Check if the API is running'
      }
    ];
  }

  generateMcpExamples(project) {
    return [
      {
        name: 'List tools',
        tool: 'list_tools',
        args: {},
        description: 'List available MCP tools'
      }
    ];
  }

  generateLibraryExamples(project) {
    return [
      {
        name: 'Basic usage',
        code: this.getCodeTemplate(project),
        description: 'Basic library usage example'
      }
    ];
  }

  generateBrowserAutomationExamples(project) {
    return [
      {
        name: 'Screenshot test',
        script: this.getBrowserTemplate(project),
        targetUrl: 'https://example.com',
        description: 'Take a screenshot of a webpage'
      }
    ];
  }

  generateHarnessId(projectId, interfaceType) {
    return `${projectId}-${interfaceType}-${Date.now()}`;
  }
}

module.exports = TestHarnessGenerator;