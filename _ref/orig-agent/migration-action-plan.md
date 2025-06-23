# 🔧 Kingly Migration Action Plan

## 🎯 Strategy: Enhance, Don't Replace

The existing codebase has **excellent patterns** that align perfectly with our vision:
- ✅ Clean hexagonal architecture
- ✅ Intent-driven task system
- ✅ Context capture protocol
- ✅ Confidence-based workflows
- ✅ Pure domain models

**We enhance these to support universal contexts while keeping all the good parts!**

## 📋 File-by-File Transformation Plan

### 1. Domain Layer Transformations

#### `domain/entities/context.js` (NEW)
```javascript
// Base Context - Everything inherits from this
export class Context {
  constructor(data = {}) {
    // Universal fields
    this.metadata = {
      id: data.id || generateId(),
      type: data.type || 'generic',
      name: data.name || 'Unnamed Context',
      created: data.created || Date.now(),
      updated: data.updated || Date.now()
    };
    
    this.intent_context = {
      intent_type: data.intent_type,
      business_goal: data.business_goal,
      extends: data.extends,
      context_adaptations: data.context_adaptations
    };
    
    this.relationships = {
      depends_on: data.depends_on || [],
      blocks: data.blocks || [],
      children: data.children || [],
      shares_with: data.shares_with || []
    };
    
    this.behavior_rules = data.behavior_rules || [];
    
    this.status = {
      current: data.status || 'active',
      progress: data.progress || 0,
      confidence: data.confidence || 1.0,
      blocked_by: data.blocked_by
    };
  }
  
  // Common methods all contexts share
  toYAML() { /* Convert to context.yaml format */ }
  static fromYAML(yaml) { /* Load from context.yaml */ }
}
```

#### `domain/entities/workspace.js` (TRANSFORM)
```javascript
// BEFORE:
export class Workspace {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    // ... workspace specific
  }
}

// AFTER:
import { Context } from './context.js';

export class Workspace extends Context {
  constructor(data) {
    super({
      ...data,
      type: 'workspace',
      intent_type: 'organizational_coordination'
    });
    
    // Keep all existing workspace logic
    this.physical_path = data.physical_path;
    this.projects = data.projects || [];
    
    // Add polymorphic config
    this.polymorphic_config = {
      workspace_config: {
        physical_path: this.physical_path,
        git_remote: data.git_remote,
        billing_boundary: true
      }
    };
  }
  
  // KEEP all existing methods unchanged
  createProject(projectData) { /* existing logic */ }
  isValidName(name) { /* existing validation */ }
  getStats() { /* existing stats */ }
}
```

#### `domain/entities/task.js` (ENHANCE)
```javascript
// AFTER transformation:
import { Context } from './context.js';

export class Task extends Context {
  constructor(data) {
    // Map existing fields to context structure
    super({
      ...data,
      type: 'task',
      name: data.title || data.name,
      intent_type: data.intent?.type,
      business_goal: data.intent?.description,
      confidence: data.confidence,
      status: data.status || 'pending'
    });
    
    // KEEP all existing task fields
    this.description = data.description;
    this.confidence_threshold = data.confidence_threshold || 0.8;
    this.requires_input = data.requires_input || false;
    
    // Add to polymorphic config
    this.polymorphic_config = {
      task_config: {
        assignee: data.assignee,
        due_date: data.due_date,
        priority: data.priority,
        confidence_threshold: this.confidence_threshold,
        requires_input: this.requires_input,
        metadata: data.metadata
      }
    };
    
    // KEEP intent system exactly as is
    this.intent = data.intent || IntentClassificationService.classifyIntent(data);
  }
  
  // KEEP all existing methods
  shouldAutoExecute() { /* existing logic */ }
  shouldSplit() { /* existing logic */ }
  markRelationship() { /* existing logic */ }
}
```

### 2. New Services to Add

#### `domain/services/context-inheritance.js` (NEW)
```javascript
// Handles the 'extends' field in contexts
export class ContextInheritanceService {
  async resolveInheritance(context, loader) {
    if (!context.intent_context?.extends) return context;
    
    const parent = await loader.loadContext(context.intent_context.extends);
    return this.mergeContexts(parent, context);
  }
}
```

#### `domain/services/context-loader.js` (NEW)
```javascript
// Loads context.yaml files
export class ContextLoaderService {
  async loadContext(path) {
    const yaml = await this.readYAML(`${path}/context.yaml`);
    return Context.fromYAML(yaml);
  }
}
```

### 3. Application Layer Updates

#### `application/workspace-service.js` (MINIMAL CHANGES)
```javascript
// Add context awareness to existing service
export class WorkspaceService {
  constructor({ 
    workspacePersistence, 
    idGenerator, 
    contextAssembler  // NEW dependency
  }) {
    this.workspacePersistence = workspacePersistence;
    this.idGenerator = idGenerator;
    this.contextAssembler = contextAssembler; // NEW
  }
  
  // KEEP all existing methods, just enhance with context
  async createTask(workspaceId, projectId, taskData) {
    // Existing validation logic...
    
    // NEW: Assemble context for the task
    const context = await this.contextAssembler.assembleContext({
      currentContext: `${workspaceId}/${projectId}`,
      situation: { creating: 'task', data: taskData }
    });
    
    // Existing task creation with context
    const task = new Task({
      ...taskData,
      _assembledContext: context  // Attach assembled context
    });
    
    // Rest of existing logic...
  }
}
```

### 4. New Ports to Add

#### `ports/llm-adapter.js` (NEW)
```javascript
export interface LLMAdapter {
  complete(prompt: string, options?: any): Promise<string>;
  stream(prompt: string, onChunk: Function): Promise<void>;
  evaluate(condition: string, context: any): Promise<boolean>;
}
```

#### `ports/memory-store.js` (NEW)
```javascript
export interface MemoryStore {
  store(memory: any): Promise<string>;
  recall(query: string, limit: number): Promise<any[]>;
  detectPatterns(threshold: number): Promise<any[]>;
}
```

### 5. Enhanced MCP Adapter

#### `adapters/primary/mcp-adapter.js` (ENHANCE)
```javascript
// Add callback pattern to existing tools
const tools = {
  // KEEP all existing tools
  create_workspace: { /* existing */ },
  create_task: { /* existing */ },
  
  // NEW: Add callback support
  _wrapWithCallback(tool) {
    return async (params) => {
      const result = await tool.handler(params);
      
      // NEW: Add instructions for LLM if needed
      if (result.nextAction) {
        result._llm_instructions = this.formatInstructions(result.nextAction);
      }
      
      return result;
    };
  }
};
```

### 6. Infrastructure Updates

#### `infrastructure/dependency-injection.js` (EXTEND)
```javascript
// Add new dependencies while keeping existing
export const createProductionDependencies = (config = {}) => {
  // KEEP all existing...
  
  // NEW dependencies
  const llmAdapter = new OpenAIAdapter(config.openai);
  const memoryStore = new VectorMemoryAdapter(config.vector);
  const contextLoader = new ContextLoaderService();
  const contextAssembler = new ContextAssembler({
    contextLoader,
    llmAdapter
  });
  
  // Enhanced workspace service with context
  const workspaceService = new WorkspaceService({
    workspacePersistence,
    idGenerator,
    contextAssembler  // NEW
  });
  
  // Rest remains the same...
};
```

## 🔄 Migration Script

```bash
#!/bin/bash
# migrate-kingly.sh

echo "🏗️ Kingly Universal Context Migration"

# 1. Archive existing
mv src src-archive
echo "✅ Archived existing src/"

# 2. Create new structure
mkdir -p src/{domain/{entities,services,value-objects},application,ports,adapters/{primary,secondary},infrastructure,contexts}

# 3. Copy and transform files
echo "📝 Transforming domain models..."

# Copy workspace.js and we'll manually add Context inheritance
cp src-archive/domain/workspace.js src/domain/entities/workspace.js

# Copy task.js for transformation  
cp src-archive/domain/task.js src/domain/entities/task.js

# Copy services
cp src-archive/domain/services/intent-classifier.js src/domain/services/

# Copy application layer
cp src-archive/application/workspace-service.js src/application/

# Copy ports
cp -r src-archive/ports/* src/ports/

# Copy adapters
cp src-archive/adapters/primary/mcp-adapter.js src/adapters/primary/
cp src-archive/adapters/secondary/json-storage.js src/adapters/secondary/

# Copy infrastructure
cp src-archive/infrastructure/dependency-injection.js src/infrastructure/
cp src-archive/infrastructure/server.js src/infrastructure/

# Copy entry point
cp src-archive/index.js src/

echo "✅ Files copied"

# 4. Create new base files
cat > src/domain/entities/context.js << 'EOF'
// Universal Context Entity - Base for all Kingly entities
// TODO: Implement as shown above
EOF

echo "✅ Created new entity files"

# 5. Create placeholder for new services
cat > src/domain/services/context-inheritance.js << 'EOF'
// Context Inheritance Service
// TODO: Implement inheritance resolution
EOF

echo "✅ Created service placeholders"

# 6. Summary
echo "
📊 Migration Complete!
====================
Next Steps:
1. Add Context inheritance to Workspace and Task classes
2. Implement base Context class
3. Add new ports (LLM, Memory)
4. Enhance MCP adapter with callbacks
5. Wire new dependencies in DI

Run: node src/index.js to test
"
```

## ✅ Key Benefits of This Approach

1. **Preserves ALL business logic** - Nothing is lost
2. **Minimal code changes** - Mostly adding inheritance
3. **Backward compatible** - Existing tools still work
4. **Clean migration path** - Can be done incrementally
5. **Leverages existing excellence** - Intent system, confidence, relationships

## 🚀 Implementation Order

1. **Create Context base class** - Foundation for everything
2. **Add inheritance to existing entities** - Workspace, Task extend Context
3. **Implement context loader** - Read YAML files
4. **Add new ports** - LLM, Memory interfaces
5. **Enhance MCP with callbacks** - Bi-directional pattern
6. **Wire in dependency injection** - Connect everything

The existing codebase is so well architected that we're really just **adding a universal base layer** rather than rewriting. This is the power of good architecture - it's ready for extension!