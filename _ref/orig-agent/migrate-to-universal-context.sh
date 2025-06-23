#!/bin/bash

# Kingly Universal Context Migration Script
# This script migrates the existing excellent codebase to support universal contexts

set -e  # Exit on error

echo "🚀 Kingly Universal Context Migration"
echo "===================================="
echo ""
echo "This migration will:"
echo "1. Archive existing src/ to src-archive/"
echo "2. Create new structure with universal context support"
echo "3. Transform existing code to inherit from Context"
echo "4. Preserve all business logic and patterns"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 1
fi

# Step 1: Archive existing source
echo ""
echo "📦 Step 1: Archiving existing source..."
if [ -d "src" ]; then
    if [ -d "src-archive" ]; then
        echo "  ⚠️  src-archive already exists!"
        read -p "  Remove existing archive? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf src-archive
        else
            echo "  Please manually handle src-archive first"
            exit 1
        fi
    fi
    mv src src-archive
    echo "  ✅ Archived to src-archive/"
else
    echo "  ⚠️  No src/ directory found"
fi

# Step 2: Create new directory structure
echo ""
echo "🔨 Step 2: Creating new directory structure..."
mkdir -p src/{domain/{entities,services,value-objects},application,ports,adapters/{primary,secondary},infrastructure,contexts/{universal,agents,workflows,memory}}
echo "  ✅ Directory structure created"

# Step 3: Create the base Context entity
echo ""
echo "🧬 Step 3: Creating Universal Context base class..."
cat > src/domain/entities/context.js << 'EOF'
/**
 * Universal Context Entity
 * 
 * This is the foundation of Kingly OS - everything is a context.
 * All entities (Workspace, Task, Agent, Memory, etc.) inherit from this base class.
 * 
 * Key principles:
 * - Universal structure for all entities
 * - YAML-based configuration
 * - Inheritance through 'extends' field
 * - Behavior rules drive actions
 * - No hardcoded behavior
 */

import { generateId } from '../services/id-generator.js';

export class Context {
  constructor(data = {}) {
    // Universal metadata - every context has these
    this.metadata = {
      id: data.id || generateId(data.type || 'context'),
      type: data.type || 'generic',
      name: data.name || 'Unnamed Context',
      created: data.created || Date.now(),
      updated: data.updated || Date.now(),
      version: data.version || '1.0.0'
    };
    
    // Intent and inheritance configuration
    this.intent_context = {
      intent_type: data.intent_type,           // personal|business|organizational|civilizational
      business_goal: data.business_goal,       // What we're trying to achieve
      extends: data.extends,                   // Parent context to inherit from
      context_adaptations: data.context_adaptations  // How this differs from parent
    };
    
    // Relationships with other contexts
    this.relationships = {
      depends_on: data.depends_on || [],       // Prerequisites
      blocks: data.blocks || [],               // What this blocks
      children: data.children || [],           // Sub-contexts
      shares_with: data.shares_with || [],     // Contexts that can access shared resources
      parent: data.parent                      // Parent context reference
    };
    
    // Behavior rules - drive all actions
    this.behavior_rules = data.behavior_rules || [];
    
    // Status tracking
    this.status = {
      current: data.status || 'active',
      progress: data.progress || 0,
      confidence: data.confidence || 1.0,
      blocked_by: data.blocked_by,
      last_updated: Date.now()
    };
    
    // Polymorphic configuration - type-specific fields
    this.polymorphic_config = data.polymorphic_config || {};
    
    // Injection rules for dynamic context assembly
    this.injection_rules = data.injection_rules || [];
  }
  
  /**
   * Convert context to YAML format for storage
   */
  toYAML() {
    return {
      metadata: this.metadata,
      intent_context: this.intent_context,
      relationships: this.relationships,
      behavior_rules: this.behavior_rules,
      status: this.status,
      polymorphic_config: this.polymorphic_config,
      injection_rules: this.injection_rules
    };
  }
  
  /**
   * Create context from YAML data
   */
  static fromYAML(yaml, type) {
    return new Context({
      ...yaml,
      type: type || yaml.metadata?.type
    });
  }
  
  /**
   * Check if context matches given criteria
   */
  matches(criteria) {
    for (const [key, value] of Object.entries(criteria)) {
      if (this.metadata[key] !== value && 
          this.intent_context[key] !== value &&
          this.status[key] !== value) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Update status with validation
   */
  updateStatus(newStatus, reason) {
    const validStatuses = ['active', 'inactive', 'completed', 'failed', 'blocked'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    
    this.status.current = newStatus;
    this.status.last_updated = Date.now();
    this.metadata.updated = Date.now();
    
    // Trigger behavior rules for status change
    this.triggerRules('status_changed', { newStatus, reason });
  }
  
  /**
   * Trigger behavior rules (to be implemented by services)
   */
  triggerRules(event, data) {
    // This will be handled by the BehaviorRuleEngine service
    // For now, just filter applicable rules
    return this.behavior_rules.filter(rule => rule.trigger === event);
  }
}
EOF
echo "  ✅ Created Context base class"

# Step 4: Copy and prepare existing files for transformation
echo ""
echo "📝 Step 4: Copying keeper files..."

# Helper function to safely copy files
copy_with_transform_note() {
    local src=$1
    local dest=$2
    local transform_note=$3
    
    if [ -f "src-archive/$src" ]; then
        # Add transformation note at top of file
        echo "// TODO: $transform_note" > "src/$dest"
        echo "" >> "src/$dest"
        cat "src-archive/$src" >> "src/$dest"
        echo "  ✓ Copied $src → $dest"
    else
        echo "  ⚠️  Not found: $src"
    fi
}

# Copy domain entities with transformation notes
copy_with_transform_note \
    "domain/workspace.js" \
    "domain/entities/workspace.js" \
    "Transform Workspace to extend Context - see migration-action-plan.md"

copy_with_transform_note \
    "domain/task.js" \
    "domain/entities/task.js" \
    "Transform Task to extend Context - keep all existing logic"

# Copy domain services
if [ -f "src-archive/domain/services/intent-classifier.js" ]; then
    cp "src-archive/domain/services/intent-classifier.js" "src/domain/services/"
    echo "  ✓ Copied intent-classifier.js"
else
    echo "  ⚠️  Intent classifier not found in expected location"
fi

# Copy application layer
copy_with_transform_note \
    "application/workspace-service.js" \
    "application/workspace-service.js" \
    "Add contextAssembler dependency - minimal changes needed"

# Copy ports
echo "  📁 Copying ports..."
for port in persistence.js agent-communication.js background-execution.js workspace-management.js; do
    if [ -f "src-archive/ports/$port" ]; then
        cp "src-archive/ports/$port" "src/ports/"
        echo "    ✓ $port"
    fi
done

# Copy adapters
echo "  📁 Copying adapters..."
copy_with_transform_note \
    "adapters/primary/mcp-adapter.js" \
    "adapters/primary/mcp-adapter.js" \
    "Add callback pattern support to tools"

if [ -f "src-archive/adapters/secondary/json-storage.js" ]; then
    cp "src-archive/adapters/secondary/json-storage.js" "src/adapters/secondary/"
    echo "    ✓ json-storage.js"
fi

# Copy infrastructure
echo "  📁 Copying infrastructure..."
copy_with_transform_note \
    "infrastructure/dependency-injection.js" \
    "infrastructure/dependency-injection.js" \
    "Add new dependencies: contextAssembler, llmAdapter, memoryStore"

if [ -f "src-archive/infrastructure/server.js" ]; then
    cp "src-archive/infrastructure/server.js" "src/infrastructure/"
    echo "    ✓ server.js"
fi

# Copy entry point
if [ -f "src-archive/index.js" ]; then
    cp "src-archive/index.js" "src/"
    echo "  ✓ Copied index.js"
fi

# Step 5: Create new ports
echo ""
echo "🔌 Step 5: Creating new port interfaces..."

cat > src/ports/llm-adapter.js << 'EOF'
/**
 * LLM Adapter Port
 * 
 * Interface for all LLM operations in Kingly.
 * Implementations can use OpenAI, Anthropic, local models, etc.
 */

export class LLMAdapter {
  /**
   * Complete a prompt with the LLM
   */
  async complete(prompt, options = {}) {
    throw new Error('LLMAdapter.complete must be implemented');
  }
  
  /**
   * Stream a response from the LLM
   */
  async stream(prompt, onChunk, options = {}) {
    throw new Error('LLMAdapter.stream must be implemented');
  }
  
  /**
   * Evaluate a condition using the LLM
   */
  async evaluate(condition, context) {
    throw new Error('LLMAdapter.evaluate must be implemented');
  }
  
  /**
   * Execute Graph of Thoughts reasoning
   */
  async graphOfThoughts(problem, constraints) {
    throw new Error('LLMAdapter.graphOfThoughts must be implemented');
  }
}
EOF

cat > src/ports/memory-store.js << 'EOF'
/**
 * Memory Store Port
 * 
 * Interface for memory persistence and retrieval.
 * Can be implemented with vector DBs, graph DBs, or simple JSON.
 */

export class MemoryStore {
  /**
   * Store a memory
   */
  async store(memory) {
    throw new Error('MemoryStore.store must be implemented');
  }
  
  /**
   * Recall memories by semantic search
   */
  async recall(query, context, limit = 10) {
    throw new Error('MemoryStore.recall must be implemented');
  }
  
  /**
   * Detect patterns in memories
   */
  async detectPatterns(threshold = 3) {
    throw new Error('MemoryStore.detectPatterns must be implemented');
  }
  
  /**
   * Prune old or irrelevant memories
   */
  async prune(criteria) {
    throw new Error('MemoryStore.prune must be implemented');
  }
}
EOF

cat > src/ports/context-loader.js << 'EOF'
/**
 * Context Loader Port
 * 
 * Interface for loading contexts from storage.
 * Usually loads from YAML files but could use other sources.
 */

export class ContextLoader {
  /**
   * Load a context by path
   */
  async loadContext(path) {
    throw new Error('ContextLoader.loadContext must be implemented');
  }
  
  /**
   * Save a context
   */
  async saveContext(path, context) {
    throw new Error('ContextLoader.saveContext must be implemented');
  }
  
  /**
   * Check if context exists
   */
  async exists(path) {
    throw new Error('ContextLoader.exists must be implemented');
  }
}
EOF

echo "  ✅ Created new port interfaces"

# Step 6: Create placeholder services
echo ""
echo "🛠️  Step 6: Creating service placeholders..."

cat > src/domain/services/context-inheritance.js << 'EOF'
/**
 * Context Inheritance Service
 * 
 * Resolves the 'extends' field in contexts, allowing contexts
 * to inherit behavior and configuration from parent contexts.
 */

export class ContextInheritanceService {
  constructor(contextLoader) {
    this.contextLoader = contextLoader;
  }
  
  async resolveInheritance(context) {
    // TODO: Implement inheritance resolution
    // 1. Load parent context from extends field
    // 2. Merge parent fields with child
    // 3. Handle circular dependencies
    // 4. Apply context adaptations
    return context;
  }
}
EOF

cat > src/application/context-assembler.js << 'EOF'
/**
 * Context Assembler
 * 
 * Dynamically assembles context based on the current situation,
 * including relevant memories, inherited contexts, and injection rules.
 */

export class ContextAssembler {
  constructor({ contextLoader, llmAdapter, memoryStore }) {
    this.contextLoader = contextLoader;
    this.llmAdapter = llmAdapter;
    this.memoryStore = memoryStore;
  }
  
  async assembleContext(request) {
    // TODO: Implement dynamic context assembly
    // 1. Load base context
    // 2. Resolve inheritance
    // 3. Evaluate injection rules
    // 4. Add relevant memories
    // 5. Optimize for token limit
    return {};
  }
}
EOF

echo "  ✅ Created service placeholders"

# Step 7: Create example context YAMLs
echo ""
echo "📄 Step 7: Creating example context definitions..."

mkdir -p src/contexts/universal

cat > src/contexts/universal/base-workspace.yaml << 'EOF'
# Universal base context for all workspaces
metadata:
  type: workspace
  name: Base Workspace
  version: 1.0.0

intent_context:
  intent_type: organizational_coordination
  business_goal: Organize and manage projects effectively

behavior_rules:
  - trigger: workspace_created
    action: create_default_structure
    
  - trigger: project_added
    condition: projects.length > 5
    action: suggest_organization_strategy

polymorphic_config:
  workspace_config:
    default_structure:
      - shared/
      - workflows/
      - contexts/
EOF

cat > src/contexts/universal/base-task.yaml << 'EOF'
# Universal base context for all tasks
metadata:
  type: task
  name: Base Task
  version: 1.0.0

intent_context:
  intent_type: business_growth
  business_goal: Complete work efficiently

behavior_rules:
  - trigger: task_created
    condition: confidence < 0.8
    action: request_clarification
    
  - trigger: task_blocked
    action: notify_stakeholders

status:
  current: pending
  progress: 0
  confidence: 1.0
EOF

echo "  ✅ Created example contexts"

# Step 8: Create transformation guide
echo ""
echo "📚 Step 8: Creating transformation guide..."

cat > src/TRANSFORMATION_GUIDE.md << 'EOF'
# Kingly Universal Context Transformation Guide

## Quick Start

1. **Transform Workspace.js**:
   ```javascript
   // Change:
   export class Workspace {
   
   // To:
   import { Context } from './context.js';
   export class Workspace extends Context {
     constructor(data) {
       super({ ...data, type: 'workspace' });
       // Rest stays the same
     }
   }
   ```

2. **Transform Task.js**:
   ```javascript
   // Add Context inheritance
   import { Context } from './context.js';
   export class Task extends Context {
     constructor(data) {
       super({ 
         ...data, 
         type: 'task',
         intent_type: data.intent?.type,
         business_goal: data.intent?.description
       });
       // Keep all existing fields
     }
   }
   ```

3. **Update Dependency Injection**:
   ```javascript
   // Add new dependencies
   const contextAssembler = new ContextAssembler({
     contextLoader: new YAMLContextLoader(),
     llmAdapter: new OpenAIAdapter(config),
     memoryStore: new VectorMemoryStore(config)
   });
   ```

4. **Enhance MCP Adapter** - Add callback pattern:
   ```javascript
   // Wrap responses with instructions
   if (result.nextAction) {
     result._llm_instructions = formatInstructions(result.nextAction);
   }
   ```

## Key Principles

1. **Everything extends Context** - Universal base for all entities
2. **Keep existing logic** - We're adding, not replacing
3. **Gradual migration** - Can be done incrementally
4. **Test continuously** - Ensure nothing breaks

See `migration-action-plan.md` for detailed instructions.
EOF

echo "  ✅ Created transformation guide"

# Step 9: Summary
echo ""
echo "✨ Migration Complete!"
echo "===================="
echo ""
echo "📁 New Structure:"
echo "  src/"
echo "  ├── domain/entities/     (Workspace, Task + Context base)"
echo "  ├── application/         (Services with context awareness)"
echo "  ├── ports/              (Interfaces including LLM, Memory)"
echo "  ├── adapters/           (MCP with callbacks, storage)"
echo "  ├── infrastructure/     (Dependency injection)"
echo "  └── contexts/           (YAML context definitions)"
echo ""
echo "📋 Next Steps:"
echo "  1. Review src/TRANSFORMATION_GUIDE.md"
echo "  2. Transform Workspace and Task to extend Context"
echo "  3. Update dependency injection with new services"
echo "  4. Run: npm test (if tests exist)"
echo "  5. Run: node src/index.js"
echo ""
echo "💡 Key Changes Needed:"
echo "  - Add 'extends Context' to Workspace and Task"
echo "  - Wire new dependencies in dependency-injection.js"
echo "  - Add callback support to MCP adapter"
echo ""
echo "📚 Documentation:"
echo "  - migration-action-plan.md   (detailed plan)"
echo "  - TRANSFORMATION_GUIDE.md    (quick reference)"
echo "  - impl/000-architecture.md   (architecture spec)"
echo ""
echo "Old code preserved in: src-archive/"
echo ""
echo "🚀 Ready to build the Universal Context OS!"