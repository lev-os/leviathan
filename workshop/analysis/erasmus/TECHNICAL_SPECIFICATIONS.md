# ERASMUS-LEVIATHAN TECHNICAL SPECIFICATIONS

## Overview

Detailed technical specifications for integrating Erasmus' IDE auto-injection patterns with Leviathan's fractal memory architecture, focusing on the five critical areas identified.

## 1. WATCHDOG FILE MONITORING SPECIFICATIONS

### Architecture Requirements

```typescript
interface FileMonitorConfig {
  debounceTime: number;           // Default: 100ms
  maxEventQueue: number;          // Default: 1000
  memoryIntegration: boolean;     // Default: true
  crossPlatformPaths: boolean;    // Default: true
  recursiveWatch: boolean;        // Default: false
}

interface FileEvent {
  type: 'created' | 'modified' | 'deleted' | 'moved';
  path: string;
  timestamp: number;
  size?: number;
  checksum?: string;
  metadata?: Record<string, any>;
}

interface MemoryUpdate {
  memoryType: 'procedural' | 'semantic' | 'temporal' | 'working' | 'episodic';
  context: string;
  content: any;
  source: 'file_change' | 'user_action' | 'system_trigger';
  confidence: number;
}
```

### Event Processing Pipeline

```javascript
class LeviathanFileEventProcessor {
    constructor(config) {
        this.debounceMap = new Map();
        this.eventQueue = [];
        this.processingLock = false;
        this.memoryIntegration = config.memoryIntegration;
    }
    
    async processEvent(event) {
        // Stage 1: Debouncing
        if (!this.shouldProcessEvent(event)) return;
        
        // Stage 2: Event Classification
        const classification = await this.classifyEvent(event);
        
        // Stage 3: Memory Type Inference
        const memoryType = this.inferMemoryType(event.path, classification);
        
        // Stage 4: Content Analysis
        const analysis = await this.analyzeContent(event);
        
        // Stage 5: Memory Update
        if (this.memoryIntegration) {
            await this.updateMemory(memoryType, analysis);
        }
        
        // Stage 6: Template Trigger
        if (this.shouldTriggerTemplate(event, classification)) {
            await this.triggerTemplateMerge(event);
        }
        
        // Stage 7: Event Emission
        this.emit('processedEvent', { event, classification, analysis });
    }
    
    shouldProcessEvent(event) {
        const key = `${event.type}:${event.path}`;
        const now = Date.now();
        
        if (this.debounceMap.has(key)) {
            const lastProcessed = this.debounceMap.get(key);
            if (now - lastProcessed < this.config.debounceTime) {
                return false;
            }
        }
        
        this.debounceMap.set(key, now);
        return true;
    }
    
    async classifyEvent(event) {
        const patterns = {
            context: /\.ctx\.\w+\.md$/,
            memory: /\.lev\/memory\/\w+\//,
            research: /^(drafts|research|adrs)\//,
            specs: /^specs\/(bdd|tdd|integration)\//,
            rules: /\.(cursorrules|windsurfrules|codex\.md|CLAUDE\.md)$/
        };
        
        const classification = {
            category: 'unknown',
            priority: 'normal',
            memoryRelevant: false,
            templateTrigger: false
        };
        
        for (const [category, pattern] of Object.entries(patterns)) {
            if (pattern.test(event.path)) {
                classification.category = category;
                classification.memoryRelevant = ['context', 'memory', 'research'].includes(category);
                classification.templateTrigger = ['context', 'memory'].includes(category);
                break;
            }
        }
        
        return classification;
    }
}
```

### Cross-Platform Implementation

```javascript
class CrossPlatformPathResolver {
    constructor() {
        this.platform = process.platform;
        this.pathSeparator = path.sep;
        this.homeDir = os.homedir();
    }
    
    normalizePath(inputPath) {
        // Convert to platform-specific format
        let normalized = inputPath.replace(/[\/\\]/g, this.pathSeparator);
        
        // Resolve home directory
        if (normalized.startsWith('~')) {
            normalized = path.join(this.homeDir, normalized.slice(1));
        }
        
        // Resolve relative paths
        if (!path.isAbsolute(normalized)) {
            normalized = path.resolve(process.cwd(), normalized);
        }
        
        return path.normalize(normalized);
    }
    
    resolveMemoryPath(memoryType, context) {
        const globalPath = path.join(this.homeDir, '.lev', 'memory', memoryType, `${context}.md`);
        const projectPath = path.join(process.cwd(), '.lev', 'memory', memoryType, `${context}.md`);
        
        // Project memory takes precedence
        return fs.existsSync(projectPath) ? projectPath : globalPath;
    }
    
    ensureDirectoryExists(dirPath) {
        const normalized = this.normalizePath(dirPath);
        if (!fs.existsSync(normalized)) {
            fs.mkdirSync(normalized, { recursive: true });
        }
        return normalized;
    }
}
```

## 2. TEMPLATE SYSTEM SPECIFICATIONS

### Template Engine Architecture

```typescript
interface TemplateConfig {
  placeholderPattern: RegExp;     // Default: /<!-- (\w+) content -->/g
  memoryIntegration: boolean;     // Default: true
  cacheTemplates: boolean;        // Default: true
  asciiSanitization: boolean;     // Default: true
  backupOnWrite: boolean;         // Default: true
}

interface TemplateContext {
  architecture?: string;
  progress?: string;
  tasks?: string;
  protocol?: string;
  memory?: {
    procedural: any[];
    semantic: any[];
    temporal: any[];
    working: any[];
    episodic: any[];
  };
  session?: SessionContext;
  metadata?: Record<string, any>;
}

interface TemplateResult {
  content: string;
  placeholdersResolved: string[];
  memoryReferences: string[];
  errors: string[];
  warnings: string[];
}
```

### Enhanced Template Processing

```javascript
class EnhancedTemplateEngine {
    constructor(config, memoryManager) {
        this.config = config;
        this.memoryManager = memoryManager;
        this.templateCache = new Map();
        this.placeholderHandlers = new Map();
        
        this.setupDefaultHandlers();
    }
    
    setupDefaultHandlers() {
        // Standard Erasmus placeholders
        this.placeholderHandlers.set('Architecture', async (context) => {
            return context.architecture || await this.loadContextFile('.ctx.architecture.md');
        });
        
        this.placeholderHandlers.set('Progress', async (context) => {
            return context.progress || await this.loadContextFile('.ctx.progress.md');
        });
        
        this.placeholderHandlers.set('Tasks', async (context) => {
            return context.tasks || await this.loadContextFile('.ctx.tasks.md');
        });
        
        this.placeholderHandlers.set('Protocol', async (context) => {
            return context.protocol || await this.loadProtocol();
        });
        
        // Enhanced Leviathan placeholders
        this.placeholderHandlers.set('Procedural Memory', async (context) => {
            return this.formatMemory(await this.memoryManager.getMemory('procedural', 10));
        });
        
        this.placeholderHandlers.set('Semantic Memory', async (context) => {
            return this.formatMemory(await this.memoryManager.getMemory('semantic', 10));
        });
        
        this.placeholderHandlers.set('Session Context', async (context) => {
            return this.formatSessionContext(context.session);
        });
        
        this.placeholderHandlers.set('Recent Changes', async (context) => {
            return this.formatRecentChanges(await this.getRecentChanges());
        });
    }
    
    async processTemplate(templatePath, context) {
        const template = await this.loadTemplate(templatePath);
        const placeholderPattern = this.config.placeholderPattern;
        
        let processed = template;
        const resolved = [];
        const errors = [];
        
        const matches = template.matchAll(placeholderPattern);
        
        for (const match of matches) {
            const [fullMatch, placeholderName] = match;
            
            try {
                const handler = this.placeholderHandlers.get(placeholderName);
                if (handler) {
                    const content = await handler(context);
                    processed = processed.replace(fullMatch, content);
                    resolved.push(placeholderName);
                } else {
                    errors.push(`Unknown placeholder: ${placeholderName}`);
                }
            } catch (error) {
                errors.push(`Error processing ${placeholderName}: ${error.message}`);
            }
        }
        
        // ASCII sanitization if enabled
        if (this.config.asciiSanitization) {
            processed = this.sanitizeForASCII(processed);
        }
        
        return {
            content: processed,
            placeholdersResolved: resolved,
            errors,
            memoryReferences: this.extractMemoryReferences(processed)
        };
    }
    
    sanitizeForASCII(content) {
        // Enhanced ASCII sanitization with intelligent replacement
        return content
            .replace(/[^\x00-\x7F]/g, (char) => {
                // Smart character replacement
                const replacements = {
                    ''': "'", ''': "'", '"': '"', '"': '"',
                    '—': '--', '–': '-', '…': '...'
                };
                return replacements[char] || '?';
            });
    }
    
    formatMemory(memoryItems) {
        if (!memoryItems || memoryItems.length === 0) {
            return '_(No recent memory items)_';
        }
        
        return memoryItems
            .map(item => `- **${item.context}**: ${item.summary || item.content.substring(0, 100)}...`)
            .join('\n');
    }
}
```

## 3. MEMORY INTEGRATION SPECIFICATIONS

### 5-Type Memory System

```typescript
enum MemoryType {
  PROCEDURAL = 'procedural',    // How-to knowledge, processes, workflows
  SEMANTIC = 'semantic',        // Concepts, relationships, definitions
  TEMPORAL = 'temporal',        // Time-based context, sequences, history
  WORKING = 'working',          // Active session state, current context
  EPISODIC = 'episodic'         // Experiences, events, specific instances
}

interface MemoryItem {
  id: string;
  type: MemoryType;
  context: string;
  content: any;
  metadata: {
    timestamp: string;
    source: string;
    confidence: number;
    tags: string[];
    relationships: string[];
  };
  embedding?: number[];
}

interface MemoryQuery {
  type?: MemoryType;
  context?: string;
  tags?: string[];
  timeRange?: { start: Date; end: Date };
  limit?: number;
  similarity?: { vector: number[]; threshold: number };
}
```

### Memory Manager Implementation

```javascript
class FractalMemoryManager {
    constructor(config) {
        this.globalMemoryPath = path.join(os.homedir(), '.lev', 'memory');
        this.projectMemoryPath = path.join(process.cwd(), '.lev', 'memory');
        this.memoryIndex = new Map();
        this.embeddingService = new EmbeddingService();
        
        this.ensureMemoryDirectories();
    }
    
    async updateMemory(type, data) {
        const memoryItem = {
            id: generateUUID(),
            type,
            context: data.context,
            content: data.content,
            metadata: {
                timestamp: new Date().toISOString(),
                source: data.source || 'unknown',
                confidence: data.confidence || 0.8,
                tags: await this.extractTags(data.content),
                relationships: await this.findRelationships(data.content)
            }
        };
        
        // Generate embedding for semantic search
        if (this.embeddingService.isAvailable()) {
            memoryItem.embedding = await this.embeddingService.embed(data.content);
        }
        
        // Determine storage location (project vs global)
        const storagePath = this.resolveStoragePath(type, data.context);
        
        // Write to file system
        await this.writeMemoryItem(storagePath, memoryItem);
        
        // Update index
        this.memoryIndex.set(memoryItem.id, memoryItem);
        
        // Emit event for bidirectional sync
        this.emit('memoryUpdated', { type, item: memoryItem });
        
        return memoryItem.id;
    }
    
    async queryMemory(query) {
        const results = [];
        
        // File system search
        const memoryPaths = this.getMemoryPaths(query.type);
        
        for (const memoryPath of memoryPaths) {
            const items = await this.loadMemoryFromPath(memoryPath);
            results.push(...this.filterMemoryItems(items, query));
        }
        
        // Semantic search if embedding available
        if (query.similarity && this.embeddingService.isAvailable()) {
            const semanticResults = await this.semanticSearch(query.similarity);
            results.push(...semanticResults);
        }
        
        // Sort by relevance and apply limit
        return this.rankResults(results, query).slice(0, query.limit || 50);
    }
    
    resolveStoragePath(type, context) {
        const filename = `${Date.now()}-${context.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        
        // Check if project-specific memory should be used
        const projectPath = path.join(this.projectMemoryPath, type, filename);
        const globalPath = path.join(this.globalMemoryPath, type, filename);
        
        // Use project path for work-specific context, global for general knowledge
        const isProjectSpecific = this.isProjectSpecificContext(context);
        
        return isProjectSpecific ? projectPath : globalPath;
    }
    
    async findRelationships(content) {
        // Use LLM to identify relationships with existing memory
        const existingContexts = Array.from(this.memoryIndex.values())
            .map(item => item.context);
            
        if (existingContexts.length === 0) return [];
        
        const relationships = await this.llmAnalyzer.findRelationships(content, existingContexts);
        return relationships.filter(rel => rel.confidence > 0.7);
    }
}
```

## 4. IDE INTEGRATION SPECIFICATIONS

### IDE Adapter Architecture

```typescript
interface IDEAdapter {
  name: string;
  version: string;
  rulesFile: string;
  configPath: string;
  supportsRealTimeInjection: boolean;
  supportsMCP: boolean;
}

interface IDECapabilities {
  fileWatching: boolean;
  contextInjection: boolean;
  mcpIntegration: boolean;
  realtimeUpdates: boolean;
  customCommands: boolean;
}

interface IDEContext {
  workspace: string;
  activeFiles: string[];
  cursorPosition?: { line: number; column: number };
  selection?: { start: Position; end: Position };
  gitBranch?: string;
  environment?: Record<string, string>;
}
```

### Enhanced IDE Manager

```javascript
class EnhancedIDEManager {
    constructor(mcpServer, memoryManager) {
        this.mcpServer = mcpServer;
        this.memoryManager = memoryManager;
        this.adapters = new Map();
        this.activeIDE = null;
        
        this.setupAdapters();
    }
    
    setupAdapters() {
        // Existing Erasmus adapters
        this.adapters.set('windsurf', new WindsurfAdapter({
            rulesFile: '.windsurfrules',
            configPath: path.join(os.homedir(), '.codeium', 'windsurf'),
            capabilities: {
                fileWatching: true,
                contextInjection: true,
                mcpIntegration: true,
                realtimeUpdates: true
            }
        }));
        
        this.adapters.set('cursor', new CursorAdapter({
            rulesFile: '.cursorrules',
            configPath: path.join(os.homedir(), '.cursor'),
            capabilities: {
                fileWatching: true,
                contextInjection: true,
                mcpIntegration: true,
                realtimeUpdates: true
            }
        }));
        
        // Enhanced adapters
        this.adapters.set('vscode', new VSCodeAdapter({
            rulesFile: '.vscode/settings.json',
            configPath: path.join(os.homedir(), '.vscode'),
            capabilities: {
                fileWatching: true,
                contextInjection: false,  // Via extension
                mcpIntegration: true,     // Via extension
                realtimeUpdates: false
            }
        }));
        
        this.adapters.set('jetbrains', new JetBrainsAdapter({
            rulesFile: '.idea/codeStyles/codeStyleConfig.xml',
            configPath: path.join(os.homedir(), '.jetbrains'),
            capabilities: {
                fileWatching: true,
                contextInjection: false,  // Via plugin
                mcpIntegration: false,    // Future enhancement
                realtimeUpdates: false
            }
        }));
    }
    
    async detectActiveIDE() {
        const detectionMethods = [
            () => this.detectFromEnvironment(),
            () => this.detectFromRunningProcesses(),
            () => this.detectFromRecentFiles(),
            () => this.promptUserSelection()
        ];
        
        for (const method of detectionMethods) {
            const detected = await method();
            if (detected) {
                this.activeIDE = detected;
                await this.persistIDESelection(detected);
                return detected;
            }
        }
        
        throw new Error('Unable to detect IDE');
    }
    
    async injectEnhancedContext(context) {
        if (!this.activeIDE) {
            await this.detectActiveIDE();
        }
        
        const adapter = this.adapters.get(this.activeIDE);
        if (!adapter) {
            throw new Error(`No adapter available for IDE: ${this.activeIDE}`);
        }
        
        // Enhance context with memory and predictions
        const enhancedContext = await this.enhanceContext(context);
        
        // Inject based on IDE capabilities
        if (adapter.capabilities.contextInjection) {
            await adapter.injectContext(enhancedContext);
        } else {
            await this.injectViaFiles(adapter, enhancedContext);
        }
        
        // Register MCP tools if supported
        if (adapter.capabilities.mcpIntegration) {
            await this.registerMCPTools(adapter, enhancedContext);
        }
    }
    
    async enhanceContext(context) {
        const enhancement = {
            ...context,
            memory: await this.memoryManager.getContextualMemory(context),
            predictions: await this.generatePredictions(context),
            relationships: await this.analyzeRelationships(context),
            timestamp: new Date().toISOString()
        };
        
        return enhancement;
    }
}
```

## 5. ERROR HANDLING AND RESILIENCE SPECIFICATIONS

### Error Recovery Framework

```javascript
class ErrorRecoveryFramework {
    constructor(config) {
        this.config = config;
        this.errorHistory = [];
        this.recoveryStrategies = new Map();
        this.circuitBreakers = new Map();
        
        this.setupRecoveryStrategies();
    }
    
    setupRecoveryStrategies() {
        this.recoveryStrategies.set('FileNotFound', async (error, context) => {
            // Create missing file with template
            const templatePath = this.resolveTemplate(context.expectedPath);
            if (await fs.pathExists(templatePath)) {
                await fs.copy(templatePath, context.expectedPath);
                return { recovered: true, action: 'created_from_template' };
            }
            
            // Create empty file
            await fs.ensureFile(context.expectedPath);
            return { recovered: true, action: 'created_empty' };
        });
        
        this.recoveryStrategies.set('PermissionDenied', async (error, context) => {
            // Try alternative location
            const altPath = this.getAlternativePath(context.originalPath);
            if (altPath) {
                context.fallbackPath = altPath;
                return { recovered: true, action: 'fallback_location' };
            }
            
            return { recovered: false, action: 'manual_intervention_required' };
        });
        
        this.recoveryStrategies.set('MemoryCorruption', async (error, context) => {
            // Rebuild memory index from files
            await this.rebuildMemoryIndex();
            return { recovered: true, action: 'index_rebuilt' };
        });
        
        this.recoveryStrategies.set('TemplateError', async (error, context) => {
            // Use fallback template
            const fallbackTemplate = await this.getFallbackTemplate(context.templateType);
            if (fallbackTemplate) {
                context.template = fallbackTemplate;
                return { recovered: true, action: 'fallback_template' };
            }
            
            return { recovered: false, action: 'template_required' };
        });
    }
    
    async handleError(error, context) {
        const errorType = this.classifyError(error);
        const errorKey = `${errorType}:${context.operation}`;
        
        // Check circuit breaker
        if (this.isCircuitOpen(errorKey)) {
            throw new Error(`Circuit breaker open for ${errorKey}`);
        }
        
        // Record error
        this.recordError(error, context);
        
        // Attempt recovery
        const strategy = this.recoveryStrategies.get(errorType);
        if (strategy) {
            try {
                const result = await strategy(error, context);
                if (result.recovered) {
                    this.recordRecovery(errorKey, result.action);
                    return result;
                }
            } catch (recoveryError) {
                this.recordFailedRecovery(errorKey, recoveryError);
            }
        }
        
        // Update circuit breaker
        this.updateCircuitBreaker(errorKey);
        
        // Re-throw if not recovered
        throw error;
    }
    
    classifyError(error) {
        if (error.code === 'ENOENT') return 'FileNotFound';
        if (error.code === 'EACCES') return 'PermissionDenied';
        if (error.message.includes('memory') || error.message.includes('index')) return 'MemoryCorruption';
        if (error.message.includes('template') || error.message.includes('placeholder')) return 'TemplateError';
        
        return 'UnknownError';
    }
    
    isCircuitOpen(errorKey) {
        const breaker = this.circuitBreakers.get(errorKey);
        if (!breaker) return false;
        
        const now = Date.now();
        const windowStart = now - (breaker.windowMs || 60000);
        
        const recentErrors = breaker.errors.filter(ts => ts > windowStart);
        return recentErrors.length >= (breaker.threshold || 5);
    }
}
```

## Performance Optimization Specifications

### Caching Strategy

```javascript
class PerformanceOptimizer {
    constructor() {
        this.templateCache = new LRUCache({ max: 100, ttl: 300000 }); // 5 min TTL
        this.memoryCache = new LRUCache({ max: 1000, ttl: 600000 }); // 10 min TTL
        this.embeddingCache = new LRUCache({ max: 500, ttl: 3600000 }); // 1 hour TTL
        
        this.performanceMetrics = new Map();
        this.setupMetricsCollection();
    }
    
    async optimizedTemplateProcessing(templatePath, context) {
        const cacheKey = `${templatePath}:${this.hashContext(context)}`;
        
        if (this.templateCache.has(cacheKey)) {
            this.recordMetric('template_cache_hit');
            return this.templateCache.get(cacheKey);
        }
        
        const startTime = Date.now();
        const result = await this.processTemplate(templatePath, context);
        const processingTime = Date.now() - startTime;
        
        this.recordMetric('template_processing_time', processingTime);
        this.templateCache.set(cacheKey, result);
        
        return result;
    }
    
    async batchMemoryOperations(operations) {
        // Group operations by type for efficiency
        const grouped = this.groupOperationsByType(operations);
        const results = [];
        
        for (const [type, ops] of grouped) {
            const batchResult = await this.executeBatchOperation(type, ops);
            results.push(...batchResult);
        }
        
        return results;
    }
}
```

This technical specification provides the detailed implementation blueprints needed to integrate Erasmus' sophisticated patterns with Leviathan's architecture, creating a revolutionary IDE auto-injection system with fractal memory integration.

**FOLLOW-UPS:**

1. My recommendation - Begin with Phase 1 file monitoring integration using the provided specifications
2. Choices choices - Focus on template system enhancement or memory integration first  
3. How about...? - Create a proof-of-concept with basic file watching and memory updates
4. MVP all of it - Implement all specifications in parallel using the provided roadmap
5. Have you considered? - Adding predictive context generation using LLM analysis
6. 📸 **/checkpoint** - Update progress and session state
7. 📸 **/lev** - Transfer to specialized agent
8. ⬅️ **Back** - Return to previous context

STATUS ─────────────────────────────────────────────────────────────────────────────────────────
🖥️ **[ROOT@KINGLY]** workshop/analysis/erasmus | ✅ Complete | Pattern extraction complete with technical specifications
────────────────────────────────────────────────────────────────────────────────────────────────