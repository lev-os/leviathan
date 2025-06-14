const fs = require('fs').promises;
const path = require('path');
const simpleGit = require('simple-git');
const { execSync } = require('child_process');

class IngestEngine {
  constructor(workspaceDir = './workspace') {
    this.workspaceDir = workspaceDir;
    this.ensureWorkspaceDir();
  }

  async ensureWorkspaceDir() {
    try {
      await fs.access(this.workspaceDir);
    } catch {
      await fs.mkdir(this.workspaceDir, { recursive: true });
    }
  }

  async ingestRepository(repoUrl, options = {}) {
    console.log(`🔍 Ingesting repository: ${repoUrl}`);
    
    const repoName = this.extractRepoName(repoUrl);
    const localPath = path.join(this.workspaceDir, repoName);
    
    try {
      // Clone or update repository
      const repoData = await this.cloneRepository(repoUrl, localPath);
      
      // Analyze repository structure
      const analysis = await this.analyzeRepository(localPath);
      
      // Extract project metadata
      const metadata = await this.extractMetadata(localPath, analysis);
      
      // Generate interface specs
      const interfaces = await this.generateInterfaceSpecs(localPath, analysis);
      
      return {
        id: this.generateProjectId(repoUrl),
        name: repoName,
        url: repoUrl,
        localPath,
        ...repoData,
        analysis,
        metadata,
        interfaces,
        ingestedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to ingest ${repoUrl}:`, error.message);
      throw error;
    }
  }

  async cloneRepository(repoUrl, localPath) {
    const git = simpleGit();
    
    try {
      // Check if already exists
      await fs.access(localPath);
      console.log(`📁 Repository exists, pulling latest changes...`);
      const repo = simpleGit(localPath);
      await repo.pull();
    } catch {
      console.log(`📥 Cloning repository...`);
      await git.clone(repoUrl, localPath);
    }
    
    const repo = simpleGit(localPath);
    const log = await repo.log({ maxCount: 5 });
    const remotes = await repo.getRemotes(true);
    
    return {
      latestCommit: log.latest,
      commitHistory: log.all,
      remotes,
      clonedAt: new Date().toISOString()
    };
  }

  async analyzeRepository(localPath) {
    console.log(`🔬 Analyzing repository structure...`);
    
    const analysis = {
      type: 'unknown',
      framework: null,
      language: null,
      packageManager: null,
      files: [],
      structure: {},
      dependencies: {},
      scripts: {},
      hasDocumentation: false,
      hasTests: false,
      hasDocker: false,
      hasCI: false
    };

    // Read directory structure
    analysis.files = await this.getFileList(localPath);
    analysis.structure = await this.buildDirectoryTree(localPath);
    
    // Detect project type and configuration
    await this.detectProjectType(localPath, analysis);
    await this.detectFramework(localPath, analysis);
    await this.extractDependencies(localPath, analysis);
    await this.detectFeatures(localPath, analysis);
    
    return analysis;
  }

  async getFileList(dir, relativePath = '') {
    const files = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      if (item.startsWith('.') && !['package.json', 'dockerfile', '.env'].includes(item.toLowerCase())) {
        continue; // Skip hidden files except important ones
      }
      
      const fullPath = path.join(dir, item);
      const itemRelativePath = path.join(relativePath, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        files.push({
          type: 'directory',
          path: itemRelativePath,
          name: item
        });
        // Recursively get files from subdirectories (limited depth)
        if (relativePath.split('/').length < 3) {
          files.push(...await this.getFileList(fullPath, itemRelativePath));
        }
      } else {
        files.push({
          type: 'file',
          path: itemRelativePath,
          name: item,
          size: stats.size,
          extension: path.extname(item)
        });
      }
    }
    
    return files;
  }

  async buildDirectoryTree(dir, maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return null;
    
    const tree = {};
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      if (item.startsWith('.') && item !== '.env') continue;
      
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        tree[item] = await this.buildDirectoryTree(fullPath, maxDepth, currentDepth + 1);
      } else {
        tree[item] = 'file';
      }
    }
    
    return tree;
  }

  async detectProjectType(localPath, analysis) {
    const configFiles = {
      'package.json': 'node',
      'requirements.txt': 'python',
      'pyproject.toml': 'python',
      'Cargo.toml': 'rust',
      'go.mod': 'go',
      'composer.json': 'php',
      'pom.xml': 'java',
      'build.gradle': 'java',
      'Gemfile': 'ruby',
      'mix.exs': 'elixir'
    };

    for (const [file, type] of Object.entries(configFiles)) {
      try {
        await fs.access(path.join(localPath, file));
        analysis.language = type;
        analysis.type = 'application';
        break;
      } catch {}
    }

    // Check for specific patterns
    if (analysis.files.some(f => f.name.includes('mcp') || f.path.includes('mcp'))) {
      analysis.type = 'mcp-server';
    }
    
    if (analysis.files.some(f => f.name.includes('browser') || f.name.includes('playwright') || f.name.includes('selenium'))) {
      analysis.type = 'browser-automation';
    }
    
    if (analysis.files.some(f => f.name === 'Dockerfile' || f.name === 'docker-compose.yml')) {
      analysis.hasDocker = true;
    }
  }

  async detectFramework(localPath, analysis) {
    if (analysis.language === 'node') {
      try {
        const packageJson = await this.readPackageJson(localPath);
        if (packageJson.dependencies) {
          if (packageJson.dependencies.express) analysis.framework = 'express';
          if (packageJson.dependencies.react) analysis.framework = 'react';
          if (packageJson.dependencies.next) analysis.framework = 'next';
          if (packageJson.dependencies.vue) analysis.framework = 'vue';
          if (packageJson.dependencies['@types/node']) analysis.framework = 'node';
        }
      } catch {}
    }
  }

  async extractDependencies(localPath, analysis) {
    try {
      if (analysis.language === 'node') {
        const packageJson = await this.readPackageJson(localPath);
        analysis.dependencies = packageJson.dependencies || {};
        analysis.scripts = packageJson.scripts || {};
        analysis.packageManager = await this.detectPackageManager(localPath);
      }
      // Add support for other languages as needed
    } catch (error) {
      console.warn(`⚠️  Could not extract dependencies: ${error.message}`);
    }
  }

  async detectFeatures(localPath, analysis) {
    const files = analysis.files.map(f => f.name.toLowerCase());
    
    analysis.hasDocumentation = files.some(f => 
      f.includes('readme') || f.includes('docs') || f === 'documentation'
    );
    
    analysis.hasTests = files.some(f => 
      f.includes('test') || f.includes('spec') || f.includes('__tests__')
    );
    
    analysis.hasCI = files.some(f => 
      f.includes('.github') || f.includes('.gitlab-ci') || f === 'jenkins'
    );
  }

  async detectPackageManager(localPath) {
    const managers = {
      'package-lock.json': 'npm',
      'yarn.lock': 'yarn',
      'pnpm-lock.yaml': 'pnpm',
      'bun.lockb': 'bun'
    };

    for (const [file, manager] of Object.entries(managers)) {
      try {
        await fs.access(path.join(localPath, file));
        return manager;
      } catch {}
    }
    
    return 'npm'; // default
  }

  async readPackageJson(localPath) {
    const content = await fs.readFile(path.join(localPath, 'package.json'), 'utf-8');
    return JSON.parse(content);
  }

  async extractMetadata(localPath, analysis) {
    console.log(`📊 Extracting project metadata...`);
    
    const metadata = {
      title: '',
      description: '',
      author: '',
      license: '',
      version: '',
      homepage: '',
      repository: '',
      keywords: [],
      entryPoint: '',
      buildCommand: '',
      startCommand: '',
      testCommand: ''
    };

    // Extract from package.json if Node.js project
    if (analysis.language === 'node') {
      try {
        const packageJson = await this.readPackageJson(localPath);
        metadata.title = packageJson.name || '';
        metadata.description = packageJson.description || '';
        metadata.author = packageJson.author || '';
        metadata.license = packageJson.license || '';
        metadata.version = packageJson.version || '';
        metadata.homepage = packageJson.homepage || '';
        metadata.repository = packageJson.repository?.url || '';
        metadata.keywords = packageJson.keywords || [];
        metadata.entryPoint = packageJson.main || 'index.js';
        
        // Extract common scripts
        if (packageJson.scripts) {
          metadata.buildCommand = packageJson.scripts.build || '';
          metadata.startCommand = packageJson.scripts.start || '';
          metadata.testCommand = packageJson.scripts.test || '';
        }
      } catch {}
    }

    // Try to extract from README
    try {
      const readmeContent = await this.readReadme(localPath);
      if (!metadata.description && readmeContent) {
        metadata.description = this.extractDescriptionFromReadme(readmeContent);
      }
    } catch {}

    return metadata;
  }

  async readReadme(localPath) {
    const readmeFiles = ['README.md', 'readme.md', 'README.txt', 'README'];
    
    for (const filename of readmeFiles) {
      try {
        return await fs.readFile(path.join(localPath, filename), 'utf-8');
      } catch {}
    }
    
    return null;
  }

  extractDescriptionFromReadme(content) {
    // Extract first paragraph or sentence that looks like a description
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('#')) continue; // Skip headers
      if (line.trim().length > 20 && line.trim().length < 200) {
        return line.trim();
      }
    }
    
    return '';
  }

  async generateInterfaceSpecs(localPath, analysis) {
    console.log(`🔌 Generating interface specifications...`);
    
    const interfaces = {
      cli: null,
      api: null,
      mcp: null,
      library: null
    };

    // CLI interface detection
    if (analysis.scripts.start || analysis.scripts.dev || analysis.entryPoint) {
      interfaces.cli = await this.generateCliInterface(localPath, analysis);
    }

    // API interface detection
    if (analysis.framework === 'express' || analysis.dependencies.fastify) {
      interfaces.api = await this.generateApiInterface(localPath, analysis);
    }

    // MCP server detection
    if (analysis.type === 'mcp-server') {
      interfaces.mcp = await this.generateMcpInterface(localPath, analysis);
    }

    // Library interface detection
    if (analysis.type === 'library' || Object.keys(analysis.dependencies).length > 0) {
      interfaces.library = await this.generateLibraryInterface(localPath, analysis);
    }

    return interfaces;
  }

  async generateCliInterface(localPath, analysis) {
    return {
      type: 'cli',
      entryPoint: analysis.metadata?.entryPoint || 'index.js',
      commands: [],
      arguments: [],
      options: [],
      environment: [],
      examples: []
    };
  }

  async generateApiInterface(localPath, analysis) {
    return {
      type: 'api',
      framework: analysis.framework,
      port: 3000, // default
      endpoints: [],
      middleware: [],
      authentication: null,
      documentation: null
    };
  }

  async generateMcpInterface(localPath, analysis) {
    return {
      type: 'mcp',
      protocol: 'stdio',
      tools: [],
      resources: [],
      prompts: [],
      schema: null
    };
  }

  async generateLibraryInterface(localPath, analysis) {
    return {
      type: 'library',
      exports: [],
      classes: [],
      functions: [],
      types: [],
      documentation: null
    };
  }

  extractRepoName(repoUrl) {
    return repoUrl.split('/').pop().replace('.git', '');
  }

  generateProjectId(repoUrl) {
    return Buffer.from(repoUrl).toString('base64').slice(0, 16);
  }
}

module.exports = IngestEngine;