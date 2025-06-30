# Implementation Roadmap: Constitutional AI Package System

## Core Design Principles (MCP-Agnostic)

### 1. Direct Function Call Architecture
Every capability is implemented as **isolated, testable functions** that can be called directly:

```javascript
// src/commands/context-install.js
export async function installContext(contextRef, options = {}) {
  // 1. Constitutional validation
  const constitutional = await validateConstitutional(contextRef);
  if (!constitutional.valid) {
    throw new ConstitutionalError(constitutional.violations);
  }
  
  // 2. Source resolution and fetching
  const source = await resolveContextSource(contextRef);
  const contextData = await fetchContextSource(source);
  
  // 3. Local installation as source
  const installed = await copyContextToProject(contextData, options.targetPath);
  
  // 4. Registry tracking
  await trackContextInstallation(contextRef, installed);
  
  return {
    success: true,
    context: contextRef,
    installed_path: installed.path,
    constitutional: constitutional
  };
}

// Direct function call interface
export const contextInstallAPI = {
  install: installContext,
  validate: validateConstitutional,
  discover: discoverContexts,
  share: shareContext
};
```

### 2. Command Registry Mapping
All functions are automatically discoverable and executable:

```javascript
// src/core/command-registry.js
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.autoDiscoverCommands();
  }
  
  async autoDiscoverCommands() {
    // Scan src/commands/ directory
    const commandFiles = await glob('src/commands/*.js');
    
    for (const file of commandFiles) {
      const module = await import(file);
      const commandName = path.basename(file, '.js');
      
      // Register all exported functions
      for (const [funcName, func] of Object.entries(module)) {
        if (typeof func === 'function') {
          this.commands.set(`${commandName}.${funcName}`, func);
        }
      }
    }
  }
  
  async execute(commandPath, args) {
    const func = this.commands.get(commandPath);
    if (!func) throw new Error(`Command not found: ${commandPath}`);
    
    return await func(args);
  }
}

// Any adapter can access the same functions
const registry = new CommandRegistry();
await registry.execute('context-install.install', { contextRef: '@community/agent-researcher' });
```

### 3. Adapter Layer Abstraction
MCP, CLI, and other interfaces are thin adapters over the core functions:

```javascript
// adapters/cli-adapter.js
export class CLIAdapter {
  constructor(commandRegistry) {
    this.registry = commandRegistry;
  }
  
  async handleCommand(command, args) {
    // Parse CLI command to function call
    const functionCall = this.parseCLICommand(command, args);
    return await this.registry.execute(functionCall.path, functionCall.args);
  }
}

// adapters/mcp-adapter.js  
export class MCPAdapter {
  constructor(commandRegistry) {
    this.registry = commandRegistry;
    this.tools = this.generateMCPTools();
  }
  
  generateMCPTools() {
    // Auto-generate MCP tool definitions from command registry
    return this.registry.commands.map(([path, func]) => ({
      name: `kingly_${path.replace('.', '_')}`,
      description: func.description || `Execute ${path}`,
      inputSchema: func.schema || this.inferSchema(func),
      handler: (args) => this.registry.execute(path, args)
    }));
  }
}
```

## Implementation Phases

### Phase 1: Core Foundation (Week 1-2)

#### 1.1 Constitutional Framework Core
```javascript
// src/core/constitutional-framework.js
export class ConstitutionalFramework {
  static PRINCIPLES = {
    OPTIMAL_NEUROCHEMICAL_STATE_FIRST: 'optimal_neurochemical_state_first',
    BOOTSTRAP_SOVEREIGNTY: 'bootstrap_sovereignty', 
    PROGRESSIVE_DISCLOSURE: 'progressive_disclosure',
    RECURSIVE_EXCELLENCE: 'recursive_excellence',
    ECONOMIC_EMPOWERMENT: 'economic_empowerment',
    MULTI_VERSE_SCALING: 'multi_verse_scaling'
  };
  
  async validateContext(contextData) {
    const results = await Promise.all([
      this.validateOptimalNeurochemicalState(contextData),
      this.validateBootstrapSovereignty(contextData),
      this.validateProgressiveDisclosure(contextData),
      this.validateRecursiveExcellence(contextData),
      this.validateEconomicEmpowerment(contextData),
      this.validateMultiVerseScaling(contextData)
    ]);
    
    return {
      valid: results.every(r => r.valid),
      score: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      violations: results.filter(r => !r.valid),
      details: results
    };
  }
}
```

#### 1.2 Context System Core
```javascript
// src/core/context-system.js
export class ContextSystem {
  constructor(constitutionalFramework) {
    this.constitutional = constitutionalFramework;
    this.contexts = new Map();
    this.inheritance = new ContextInheritance();
  }
  
  async loadContext(contextRef) {
    // Resolve reference (local, personal, community)
    const resolved = await this.resolveContextReference(contextRef);
    
    // Load and validate constitutional compliance
    const contextData = await this.loadContextData(resolved);
    const constitutional = await this.constitutional.validateContext(contextData);
    
    if (!constitutional.valid) {
      throw new ConstitutionalError(constitutional.violations);
    }
    
    // Process inheritance
    const inheritedContext = await this.inheritance.processInheritance(contextData);
    
    return {
      data: inheritedContext,
      constitutional: constitutional,
      source: resolved
    };
  }
}
```

#### 1.3 Command Function Isolation
```javascript
// src/commands/context-discover.js
export async function discoverContexts(query, options = {}) {
  const semantic = new SemanticSearch();
  const constitutional = new ConstitutionalFramework();
  
  // Semantic search across all levels
  const results = await semantic.search(query, {
    scope: options.scope || 'all', // local, personal, community, all
    limit: options.limit || 10
  });
  
  // Constitutional filtering
  const filtered = await Promise.all(
    results.map(async (result) => ({
      ...result,
      constitutional: await constitutional.validateContext(result.context)
    }))
  );
  
  // Quality scoring and ranking
  const ranked = filtered
    .filter(r => r.constitutional.score >= (options.minConstitutionalScore || 0.7))
    .sort((a, b) => (b.relevance * b.constitutional.score) - (a.relevance * a.constitutional.score));
  
  return {
    query,
    results: ranked,
    total_found: results.length,
    constitutional_compliant: filtered.length
  };
}

// Export metadata for auto-discovery
discoverContexts.description = "Discover contexts using semantic search and constitutional filtering";
discoverContexts.schema = {
  type: "object",
  properties: {
    query: { type: "string", description: "Natural language search query" },
    options: {
      type: "object",
      properties: {
        scope: { enum: ["local", "personal", "community", "all"] },
        limit: { type: "number", minimum: 1, maximum: 50 },
        minConstitutionalScore: { type: "number", minimum: 0, maximum: 1 }
      }
    }
  },
  required: ["query"]
};
```

### Phase 2: Fractal Context Management (Week 3-4)

#### 2.1 Context Promotion System
```javascript
// src/commands/context-share.js
export async function shareContext(contextPath, targetLevel, options = {}) {
  const levels = ['global', 'community'];
  if (!levels.includes(targetLevel)) {
    throw new Error(`Invalid target level: ${targetLevel}. Must be one of: ${levels.join(', ')}`);
  }
  
  // Load and validate source context
  const context = await loadContextFromPath(contextPath);
  const constitutional = await validateConstitutional(context);
  
  if (!constitutional.valid) {
    throw new ConstitutionalError(`Context fails constitutional validation: ${constitutional.violations}`);
  }
  
  // Effectiveness validation
  const effectiveness = await validateEffectiveness(context, contextPath);
  if (effectiveness.score < (targetLevel === 'global' ? 0.7 : 0.8)) {
    throw new EffectivenessError(`Context effectiveness too low for ${targetLevel} sharing`);
  }
  
  // Create reference instead of moving
  const reference = await createContextReference(context, targetLevel, options);
  
  // Track in registry
  await trackContextSharing(contextPath, reference, targetLevel);
  
  return {
    success: true,
    original_path: contextPath,
    reference: reference,
    level: targetLevel,
    constitutional: constitutional,
    effectiveness: effectiveness
  };
}
```

#### 2.2 Context Reference Resolution
```javascript
// src/core/context-resolver.js
export class ContextResolver {
  async resolveReference(contextRef) {
    // Local path: ./contexts/agents/researcher
    if (contextRef.startsWith('./')) {
      return this.resolveLocal(contextRef);
    }
    
    // Personal global: personal://agents/researcher  
    if (contextRef.startsWith('personal://')) {
      return this.resolvePersonal(contextRef);
    }
    
    // Community package: @community/agent-researcher
    if (contextRef.startsWith('@')) {
      return this.resolveCommunity(contextRef);
    }
    
    // Semantic fallback
    return this.resolveSemanticFallback(contextRef);
  }
  
  async resolvePersonal(ref) {
    const contextId = ref.replace('personal://', '');
    const registry = await this.loadPersonalRegistry();
    const tracking = registry.contexts.find(c => c.global_ref === ref);
    
    if (!tracking) {
      throw new Error(`Personal context not found: ${ref}`);
    }
    
    return {
      type: 'personal',
      source_path: tracking.source_path,
      reference: ref,
      metadata: tracking
    };
  }
}
```

### Phase 3: Community Infrastructure (Week 5-8)

#### 3.1 Package Installation System
```javascript
// src/commands/package-install.js
export async function installPackage(packageRef, options = {}) {
  const installer = new PackageInstaller();
  
  // Resolve package source (NPM, GitHub, local)
  const packageSource = await installer.resolvePackageSource(packageRef);
  
  // Fetch package metadata and contents
  const packageData = await installer.fetchPackage(packageSource);
  
  // Constitutional validation
  const constitutional = await validateConstitutional(packageData);
  if (!constitutional.valid && !options.force) {
    throw new ConstitutionalError(constitutional.violations);
  }
  
  // Install as source (shadcn pattern)
  const installPath = options.targetPath || './.kingly/contexts/';
  const installed = await installer.copyPackageSource(packageData, installPath);
  
  // Register installation
  await installer.registerInstallation(packageRef, installed);
  
  return {
    success: true,
    package: packageRef,
    installed_contexts: installed.contexts,
    constitutional: constitutional
  };
}

export class PackageInstaller {
  async copyPackageSource(packageData, targetPath) {
    // Copy source files, not npm package references
    const contexts = await this.extractContexts(packageData);
    const installed = [];
    
    for (const context of contexts) {
      const contextPath = path.join(targetPath, context.type, context.name + '.yaml');
      await fs.writeFile(contextPath, yaml.dump(context.data));
      installed.push({
        name: context.name,
        type: context.type,
        path: contextPath,
        source_package: packageData.name
      });
    }
    
    return { contexts: installed };
  }
}
```

#### 3.2 Community Registry Integration
```javascript
// src/services/community-registry.js
export class CommunityRegistry {
  constructor() {
    this.apiUrl = process.env.KINGLY_REGISTRY_URL || 'https://registry.kingly.ai';
    this.semanticSearch = new SemanticSearch();
  }
  
  async searchPackages(query, filters = {}) {
    // Semantic search request to registry
    const response = await fetch(`${this.apiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        filters: {
          constitutional_score: filters.minConstitutionalScore || 0.8,
          category: filters.category,
          tags: filters.tags
        }
      })
    });
    
    const results = await response.json();
    
    // Local semantic ranking enhancement
    const enhanced = await this.enhanceWithLocalSemantics(results, query);
    
    return enhanced;
  }
  
  async publishPackage(packagePath, metadata) {
    // Comprehensive validation before publishing
    const validation = await this.validateForPublishing(packagePath);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }
    
    // Upload package to registry
    const published = await this.uploadPackage(packagePath, metadata);
    
    return published;
  }
}
```

## Integration and Testing Strategy

### Direct Function Testing
```javascript
// tests/commands/context-install.test.js
import { installContext } from '../../src/commands/context-install.js';
import { expect } from 'chai';

describe('installContext', () => {
  it('should install community context as source', async () => {
    const result = await installContext('@community/agent-researcher', {
      targetPath: './test-kingly/contexts/'
    });
    
    expect(result.success).to.be.true;
    expect(result.constitutional.valid).to.be.true;
    expect(fs.existsSync(result.installed_path)).to.be.true;
  });
  
  it('should reject constitutionally non-compliant contexts', async () => {
    await expect(
      installContext('@test/non-compliant-agent')
    ).to.be.rejectedWith(ConstitutionalError);
  });
});
```

### End-to-End Workflow Testing
```javascript
// tests/e2e/promotion-flow.test.js
describe('Context Promotion Flow', () => {
  it('should promote effective local context to global', async () => {
    // 1. Create local context
    const created = await createContext('agent', 'test-researcher');
    
    // 2. Simulate usage to build effectiveness metrics
    await simulateUsage(created.path, { sessions: 5, successRate: 0.9 });
    
    // 3. Share to global level
    const shared = await shareContext(created.path, 'global');
    
    // 4. Verify global reference works
    const resolved = await resolveContext('personal://agents/test-researcher');
    expect(resolved.source_path).to.equal(created.path);
  });
});
```

## Deployment and Release Strategy

### Week 1-2: Foundation Release (v0.1.0)
- Constitutional framework core
- Direct function call architecture
- Basic context loading and validation
- Command registry with auto-discovery

### Week 3-4: Fractal System Release (v0.2.0)  
- Context promotion and sharing
- Personal global registry
- Reference resolution system
- Local context management

### Week 5-6: Community Alpha (v0.3.0)
- Package installation system
- Community registry integration
- Basic package discovery
- Source-based installation

### Week 7-8: Community Beta (v0.9.0)
- Full community platform integration
- Advanced semantic discovery
- Quality control pipeline
- Documentation and examples

This implementation creates a **constitutional AI development platform** that scales from individual innovation to community intelligence while maintaining ethical AI principles at every level.