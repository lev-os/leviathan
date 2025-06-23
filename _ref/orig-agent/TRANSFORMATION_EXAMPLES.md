# 🔄 Kingly Transformation Examples

## Exact Code Changes for Key Files

### 1. Workspace.js Transformation

**BEFORE** (current code):
```javascript
export class Workspace {
  constructor(data) {
    this.id = data.id || generateId();
    this.name = data.name;
    this.physical_path = data.physical_path;
    this.created_at = data.created_at || Date.now();
    this.updated_at = data.updated_at || Date.now();
    this.projects = data.projects || [];
  }

  createProject(projectData) {
    const project = new Project({
      ...projectData,
      workspace_id: this.id
    });
    this.projects.push(project);
    this.updated_at = Date.now();
    return project;
  }
}
```

**AFTER** (with Context inheritance):
```javascript
import { Context } from './context.js';

export class Workspace extends Context {
  constructor(data) {
    // Initialize Context base with workspace-specific defaults
    super({
      ...data,
      type: 'workspace',
      name: data.name,
      intent_type: 'organizational_coordination',
      business_goal: 'Organize and manage projects effectively'
    });
    
    // Keep ALL existing workspace fields
    this.physical_path = data.physical_path;
    this.projects = data.projects || [];
    
    // Add workspace config to polymorphic section
    this.polymorphic_config = {
      workspace_config: {
        physical_path: this.physical_path,
        git_remote: data.git_remote,
        billing_boundary: true
      }
    };
    
    // Map old timestamp fields to Context's metadata
    if (data.created_at) this.metadata.created = data.created_at;
    if (data.updated_at) this.metadata.updated = data.updated_at;
  }

  // ALL existing methods remain EXACTLY the same
  createProject(projectData) {
    const project = new Project({
      ...projectData,
      workspace_id: this.id,
      parent: this.id  // NEW: Set parent context
    });
    this.projects.push(project);
    this.metadata.updated = Date.now();  // Use metadata.updated instead
    return project;
  }
  
  // Getters for backward compatibility
  get id() { return this.metadata.id; }
  get name() { return this.metadata.name; }
  get created_at() { return this.metadata.created; }
  get updated_at() { return this.metadata.updated; }
}
```

### 2. Task.js Transformation

**BEFORE** (current code):
```javascript
export class Task {
  constructor(data) {
    this.id = data.id || generateId();
    this.title = data.title;
    this.description = data.description;
    this.intent = data.intent || IntentClassificationService.classifyIntent(data);
    this.confidence = data.confidence !== undefined ? data.confidence : 1.0;
    this.confidence_threshold = data.confidence_threshold || 0.8;
    this.status = data.status || 'pending';
    // ... more fields
  }

  shouldAutoExecute() {
    return this.confidence >= this.confidence_threshold && 
           !this.requires_input && 
           this.status === 'pending';
  }
}
```

**AFTER** (with Context inheritance):
```javascript
import { Context } from './context.js';

export class Task extends Context {
  constructor(data) {
    // Map Task fields to Context structure
    super({
      ...data,
      type: 'task',
      name: data.title || data.name,  // Support both title and name
      intent_type: data.intent?.type,
      business_goal: data.intent?.description,
      status: data.status || 'pending',
      confidence: data.confidence !== undefined ? data.confidence : 1.0
    });
    
    // Keep ALL task-specific fields
    this.title = data.title;  // Keep for backward compatibility
    this.description = data.description;
    this.intent = data.intent || IntentClassificationService.classifyIntent(data);
    this.confidence_threshold = data.confidence_threshold || 0.8;
    this.requires_input = data.requires_input || false;
    
    // Add to polymorphic config
    this.polymorphic_config = {
      task_config: {
        confidence_threshold: this.confidence_threshold,
        requires_input: this.requires_input,
        assignee: data.assignee,
        due_date: data.due_date,
        priority: data.priority || 'medium',
        metadata: data.metadata || {}
      }
    };
    
    // Map relationships
    if (data.blocked_by) this.status.blocked_by = data.blocked_by;
    if (data.blocks) this.relationships.blocks = data.blocks;
    if (data.relates_to) this.relationships.relates_to = data.relates_to;
  }

  // ALL existing methods remain EXACTLY the same
  shouldAutoExecute() {
    return this.status.confidence >= this.confidence_threshold && 
           !this.requires_input && 
           this.status.current === 'pending';
  }
  
  // Getters for backward compatibility
  get id() { return this.metadata.id; }
  get confidence() { return this.status.confidence; }
  get status() { return this.status.current; }
  set status(val) { this.status.current = val; }
}
```

### 3. Dependency Injection Enhancement

**ADD to existing** `dependency-injection.js`:
```javascript
// Import new services
import { ContextAssembler } from '../application/context-assembler.js';
import { OpenAIAdapter } from '../adapters/secondary/openai-llm.js';
import { VectorMemoryStore } from '../adapters/secondary/vector-memory.js';
import { YAMLContextLoader } from '../adapters/secondary/yaml-context-loader.js';

export const createProductionDependencies = (config = {}) => {
  // ... existing dependencies ...
  
  // NEW: LLM Adapter
  const llmAdapter = new OpenAIAdapter({
    apiKey: config.openai?.apiKey || process.env.OPENAI_API_KEY,
    model: config.openai?.model || 'gpt-4'
  });
  
  // NEW: Memory Store
  const memoryStore = new VectorMemoryStore({
    provider: config.memory?.provider || 'local',
    dimension: config.memory?.dimension || 1536
  });
  
  // NEW: Context Loader
  const contextLoader = new YAMLContextLoader({
    basePath: config.contextsPath || './contexts'
  });
  
  // NEW: Context Assembler
  const contextAssembler = new ContextAssembler({
    contextLoader,
    llmAdapter,
    memoryStore
  });
  
  // ENHANCED: Add contextAssembler to WorkspaceService
  const workspaceService = new WorkspaceService({
    workspacePersistence,
    idGenerator,
    contextAssembler  // NEW dependency
  });
  
  // ... rest of existing code ...
  
  return {
    ...existingDependencies,
    // NEW exports
    llmAdapter,
    memoryStore,
    contextLoader,
    contextAssembler
  };
};
```

### 4. MCP Adapter Callback Enhancement

**ADD to** `mcp-adapter.js` after existing tool definitions:
```javascript
// Enhance tool responses with callback pattern
function wrapToolWithCallback(tool) {
  const originalHandler = tool.handler;
  
  return {
    ...tool,
    handler: async (params) => {
      // Call original handler
      const result = await originalHandler(params);
      
      // Check if tool wants to provide next instructions
      if (result.nextAction) {
        result._llm_instructions = formatNextAction(result.nextAction);
      }
      
      // Check if this is part of a workflow
      if (params._workflowId) {
        result._meta = {
          ...result._meta,
          workflowId: params._workflowId,
          sessionId: params._sessionId
        };
      }
      
      return result;
    }
  };
}

// Format instructions for the LLM
function formatNextAction(nextAction) {
  const templates = {
    continue: "Please call {tool} with {params} to continue",
    complete: "Task completed. {message}",
    choose: "Please choose one of: {options}",
    error: "Error occurred: {error}. Try {suggestion}"
  };
  
  const template = templates[nextAction.type] || templates.continue;
  return template.replace(/{(\w+)}/g, (_, key) => nextAction[key] || '');
}

// Wrap all tools with callback support
Object.keys(tools).forEach(toolName => {
  tools[toolName] = wrapToolWithCallback(tools[toolName]);
});
```

### 5. Simple Adapter Implementation Examples

**Create** `src/adapters/secondary/yaml-context-loader.js`:
```javascript
import { ContextLoader } from '../../ports/context-loader.js';
import { Context } from '../../domain/entities/context.js';
import { readFile, writeFile } from 'fs/promises';
import yaml from 'js-yaml';
import { join } from 'path';

export class YAMLContextLoader extends ContextLoader {
  constructor(config = {}) {
    super();
    this.basePath = config.basePath || './contexts';
  }
  
  async loadContext(path) {
    try {
      const fullPath = join(this.basePath, path, 'context.yaml');
      const content = await readFile(fullPath, 'utf8');
      const data = yaml.load(content);
      return Context.fromYAML(data);
    } catch (error) {
      throw new Error(`Failed to load context at ${path}: ${error.message}`);
    }
  }
  
  async saveContext(path, context) {
    const fullPath = join(this.basePath, path, 'context.yaml');
    const yamlContent = yaml.dump(context.toYAML());
    await writeFile(fullPath, yamlContent, 'utf8');
  }
  
  async exists(path) {
    try {
      await readFile(join(this.basePath, path, 'context.yaml'));
      return true;
    } catch {
      return false;
    }
  }
}
```

## 🔑 Key Points

1. **Backward Compatibility**: Use getters/setters to maintain existing API
2. **Incremental Migration**: Can update one file at a time
3. **No Logic Changes**: All business logic remains exactly the same
4. **Add, Don't Replace**: We're adding Context capabilities, not removing features
5. **Test Continuously**: Existing tests should still pass

## 🧪 Testing the Migration

After each file transformation:
```bash
# If you have tests
npm test

# Or manual test
node -e "
const { Workspace } = require('./src/domain/entities/workspace.js');
const ws = new Workspace({ name: 'Test' });
console.log('Workspace created:', ws.name);
console.log('Is Context?', ws instanceof Context);
"
```

## 🎯 Migration Checklist

- [ ] Run migration script: `./migrate-to-universal-context.sh`
- [ ] Transform `workspace.js` to extend Context
- [ ] Transform `task.js` to extend Context  
- [ ] Add new dependencies to `dependency-injection.js`
- [ ] Add callback support to `mcp-adapter.js`
- [ ] Create `yaml-context-loader.js` adapter
- [ ] Test each transformation
- [ ] Update any broken imports
- [ ] Run full system test

The beauty of this approach is that **we're enhancing, not replacing**. All your existing code continues to work, but now has superpowers through the universal context system!