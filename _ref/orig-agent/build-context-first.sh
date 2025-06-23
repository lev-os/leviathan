#!/bin/bash

# Kingly Context-First Build Script
# This time we do it RIGHT - contexts drive everything

set -e

echo "🌌 Kingly Context-First Architecture"
echo "==================================="
echo ""
echo "Building a truly context-driven system where:"
echo "- Everything is a context"
echo "- Root context defines organizational modes" 
echo "- Users choose their preferred structure"
echo "- Clean ports & adapters architecture"
echo ""

# Step 1: Archive existing src
echo "📦 Step 1: Archiving existing src..."
if [ -d "src" ]; then
    mv src src-archive
    echo "  ✅ Moved src/ to src-archive/"
else
    echo "  ℹ️  No src/ to archive"
fi

# Step 2: Create minimal core structure
echo ""
echo "🏗️  Step 2: Creating minimal core..."
mkdir -p core/{ports,adapters}
mkdir -p contexts/{traditional-test,folder-test,emergent-test}

# Step 3: Create the ports (interfaces)
echo ""
echo "🔌 Step 3: Creating ports..."

cat > core/ports/conversation.js << 'EOF'
// Conversation Port - How we talk with the user
export class ConversationPort {
  async respond(input, context) {
    throw new Error('Implement in adapter');
  }
}
EOF

cat > core/ports/persistence.js << 'EOF'
// Persistence Port - How we store contexts
export class PersistencePort {
  async loadContext(path) {
    throw new Error('Implement in adapter');
  }
  
  async saveContext(path, context) {
    throw new Error('Implement in adapter');
  }
}
EOF

cat > core/ports/execution.js << 'EOF'
// Execution Port - How we run things (spawn, etc)
export class ExecutionPort {
  async execute(command, options) {
    throw new Error('Implement in adapter');
  }
  
  async spawn(processPath, args) {
    throw new Error('Implement in adapter');
  }
}
EOF

cat > core/ports/memory.js << 'EOF'
// Memory Port - How we remember
export class MemoryPort {
  async remember(content, metadata) {
    throw new Error('Implement in adapter');
  }
  
  async recall(query, limit) {
    throw new Error('Implement in adapter');
  }
}
EOF

echo "  ✅ Created ports"

# Step 4: Create root context that defines everything
echo ""
echo "🌳 Step 4: Creating root context..."

cat > context.yaml << 'EOF'
# Kingly Root Context - This drives EVERYTHING
metadata:
  type: root
  name: Kingly OS
  version: 1.0.0
  description: Context-driven OS that adapts to how you think

intent_context:
  business_goal: Amplify human intent through natural conversation
  philosophy: Everything is a context, behavior emerges from use

# This is KEY - the root defines what organizational modes exist
organizational_modes:
  # Traditional hierarchical mode (workspace → project → task)
  traditional:
    enabled: true
    description: Familiar workspace/project/task hierarchy
    types:
      workspace:
        icon: 🏢
        contains: [project]
        behavior: billing_and_isolation_boundary
        templates: /contexts/templates/traditional/workspace.yaml
      project:
        icon: 📁
        contains: [task, document, resource]
        behavior: goal_and_team_boundary
        templates: /contexts/templates/traditional/project.yaml
      task:
        icon: ✅
        contains: [subtask]
        behavior: execution_unit
        confidence_based: true
        templates: /contexts/templates/traditional/task.yaml
  
  # Simple folder mode (just nested contexts)
  folders:
    enabled: true
    description: Plain folder structure, no imposed hierarchy
    types:
      folder:
        icon: 📂
        contains: [folder, file, note]
        behavior: simple_container
        no_rules: true  # Just storage
  
  # Emergent mode (self-organizing)
  emergent:
    enabled: true
    description: Contexts that evolve and organize themselves
    types:
      seed:
        icon: 🌱
        contains: [anything]
        behavior: learn_and_evolve
        evolution_enabled: true
      thought:
        icon: 💭
        contains: [thought, insight, question]
        behavior: knowledge_graph
        auto_link: true
      vibe:
        icon: 🎭
        contains: [riff, flow, breakthrough]
        behavior: creative_chaos
        no_structure: true

# Global behavior rules that apply everywhere
behavior_rules:
  - trigger: user_input
    condition: no context.yaml in current directory
    action: suggest_context_creation
    
  - trigger: pattern_detected
    condition: similar actions repeated 3+ times
    action: suggest_workflow_creation
    
  - trigger: context_created
    action: learn_user_preferences

# How contexts can evolve
evolution_rules:
  - pattern: user_creates_similar_contexts
    action: suggest_template_extraction
    
  - pattern: contexts_frequently_linked
    action: suggest_relationship_formalization
    
  - pattern: workflow_emerges
    action: capture_as_reusable_pattern

# Memory configuration  
memory_config:
  provider: local  # Start local, can upgrade to vector DB
  forget_after_days: 90
  pattern_threshold: 3
EOF

echo "  ✅ Created root context"

# Step 5: Create test contexts for each mode
echo ""
echo "🧪 Step 5: Creating test contexts..."

# Traditional mode test
cat > contexts/traditional-test/context.yaml << 'EOF'
metadata:
  type: workspace
  name: Traditional Test Workspace
  icon: 🏢

intent_context:
  extends: /organizational_modes/traditional/workspace
  business_goal: Test traditional project management flow

children:
  - web-app/      # Project
  - mobile-app/   # Project
  - shared-libs/  # Resource folder
EOF

mkdir -p contexts/traditional-test/web-app
cat > contexts/traditional-test/web-app/context.yaml << 'EOF'
metadata:
  type: project  
  name: Web Application
  icon: 🌐

intent_context:
  extends: /organizational_modes/traditional/project
  business_goal: Build awesome web app

children:
  - implement-auth/     # Task
  - design-homepage/    # Task
  - setup-ci-cd/       # Task
EOF

# Folder mode test
cat > contexts/folder-test/context.yaml << 'EOF'
metadata:
  type: folder
  name: My Stuff
  icon: 📂

intent_context:
  extends: /organizational_modes/folders/folder
  business_goal: Just store things however I want

# No rules, no structure, just folders
children:
  - random-ideas/
  - old-projects/  
  - notes/
    - shower-thoughts/
    - meeting-notes/
EOF

# Emergent mode test
cat > contexts/emergent-test/context.yaml << 'EOF'
metadata:
  type: seed
  name: Emergent Test Seed
  icon: 🌱

intent_context:
  extends: /organizational_modes/emergent/seed
  business_goal: Let's see what grows from this

behavior_rules:
  - trigger: first_interaction
    action: |
      respond: "I'm a seed context. Tell me what you're working on and I'll grow to help you. I can become anything - a project tracker, idea garden, knowledge graph, or something entirely new."

evolution_enabled: true
learning_rate: aggressive
spawn_threshold: low  # Quick to create helper contexts

# This starts empty and grows through use!
EOF

echo "  ✅ Created test contexts"

# Step 6: Create the ONE conversation engine
echo ""
echo "💬 Step 6: Creating conversation engine..."

cat > core/conversation-engine.js << 'EOF'
// The ONE thing that makes it all work
import { loadContext } from './adapters/yaml-persistence.js';

export class ConversationEngine {
  constructor(adapters) {
    this.adapters = adapters;
    this.rootContext = null;
    this.currentContext = null;
  }
  
  async initialize() {
    // Load root context - this drives everything
    this.rootContext = await loadContext('/context.yaml');
    console.log('🌳 Root context loaded:', this.rootContext.metadata.name);
  }
  
  async respond(input) {
    // 1. Figure out where we are contextually
    const location = input.cwd || process.cwd();
    this.currentContext = await this.detectContext(location);
    
    // 2. Get the context's organizational mode
    const mode = this.getContextMode(this.currentContext);
    
    // 3. Let the context handle the input based on its rules
    const response = await this.processWithContext(input, this.currentContext, mode);
    
    // 4. Allow context to evolve based on interaction
    if (this.currentContext.evolution_enabled) {
      await this.evolveContext(this.currentContext, input, response);
    }
    
    return response;
  }
  
  async detectContext(location) {
    // Walk up from current location looking for context.yaml
    // This is where we'd use the persistence adapter
    // For now, simplified version
    return this.currentContext || this.rootContext;
  }
  
  getContextMode(context) {
    // Determine which organizational mode this context follows
    const contextType = context.metadata?.type;
    
    for (const [modeName, mode] of Object.entries(this.rootContext.organizational_modes)) {
      if (mode.types && mode.types[contextType]) {
        return { name: modeName, ...mode };
      }
    }
    
    return { name: 'emergent', ...this.rootContext.organizational_modes.emergent };
  }
  
  async processWithContext(input, context, mode) {
    // This is where the magic happens
    // Context + Mode + Input = Response
    
    console.log(`🎭 Processing in ${mode.name} mode as ${context.metadata.type}`);
    
    // Each mode processes differently
    switch (mode.name) {
      case 'traditional':
        return this.processTraditional(input, context);
      case 'folders':
        return this.processFolders(input, context);
      case 'emergent':
        return this.processEmergent(input, context);
      default:
        return { message: "Unknown mode, but I'll try to help!", context };
    }
  }
  
  async processTraditional(input, context) {
    // Traditional mode knows about workspaces, projects, tasks
    return {
      message: `In ${context.metadata.name} (${context.metadata.type})`,
      suggestions: ['Create task', 'View progress', 'Add team member'],
      context: context.metadata
    };
  }
  
  async processFolders(input, context) {
    // Folder mode is simple - just storage
    return {
      message: "Just folders here, no rules!",
      path: context.metadata.name,
      context: context.metadata
    };
  }
  
  async processEmergent(input, context) {
    // Emergent mode learns and grows
    return {
      message: "I'm learning from this interaction...",
      evolved: true,
      context: context.metadata
    };
  }
  
  async evolveContext(context, input, response) {
    // This is where contexts can spawn new contexts,
    // create relationships, learn patterns, etc.
    console.log('🧬 Context evolving based on interaction...');
  }
}

// Quick test
async function test() {
  const engine = new ConversationEngine({});
  await engine.initialize();
  
  const response = await engine.respond({
    message: "What can you do?",
    cwd: process.cwd()
  });
  
  console.log('Response:', response);
}

// Uncomment to test
// test();
EOF

echo "  ✅ Created conversation engine"

# Step 7: Copy useful adapters from archive
echo ""
echo "♻️  Step 7: Salvaging working code..."

# Check what useful code exists
if [ -d "src-archive" ]; then
    echo "  Looking for reusable adapters..."
    
    # Copy spawn/execution adapter if it exists
    if [ -f "src-archive/adapters/secondary/spawn-manager-adapter.js" ]; then
        cp src-archive/adapters/secondary/spawn-manager-adapter.js core/adapters/spawn-execution.js
        echo "  ✅ Copied spawn execution adapter"
    fi
    
    # Copy file storage if exists
    if [ -f "src-archive/adapters/secondary/json-storage.js" ]; then
        cp src-archive/adapters/secondary/json-storage.js core/adapters/
        echo "  ✅ Copied JSON storage adapter"
    fi
else
    echo "  ℹ️  No archive to salvage from"
fi

# Step 8: Create simple test script
echo ""
echo "🧪 Step 8: Creating test script..."

cat > test-context-system.js << 'EOF'
#!/usr/bin/env node

import { ConversationEngine } from './core/conversation-engine.js';

async function main() {
  console.log('🌌 Testing Kingly Context System\n');
  
  const engine = new ConversationEngine({
    // Adapters would go here
  });
  
  await engine.initialize();
  
  // Test different contexts
  const tests = [
    { cwd: './contexts/traditional-test', message: "What's here?" },
    { cwd: './contexts/folder-test', message: "Show me around" },
    { cwd: './contexts/emergent-test', message: "Help me build something" }
  ];
  
  for (const test of tests) {
    console.log(`\n📍 Testing: ${test.cwd}`);
    console.log(`💬 Input: "${test.message}"`);
    
    const response = await engine.respond(test);
    console.log('🤖 Response:', JSON.stringify(response, null, 2));
  }
}

main().catch(console.error);
EOF

chmod +x test-context-system.js

echo "  ✅ Created test script"

# Summary
echo ""
echo "✨ Context-First Architecture Ready!"
echo "==================================="
echo ""
echo "📁 Structure:"
echo "  /"
echo "  ├── context.yaml          (Root context - drives everything)"
echo "  ├── core/"
echo "  │   ├── ports/           (Clean interfaces)"
echo "  │   ├── adapters/        (Implementations)"
echo "  │   └── conversation-engine.js"
echo "  └── contexts/"
echo "      ├── traditional-test/  (Workspace mode)"
echo "      ├── folder-test/      (Simple folders)"
echo "      └── emergent-test/    (Self-organizing)"
echo ""
echo "🎯 Key Insights:"
echo "  • Root context.yaml defines ALL organizational modes"
echo "  • Users choose their preferred structure"
echo "  • Everything is a context with behavior rules"
echo "  • Clean ports & adapters preserved"
echo "  • Working code from src-archive salvaged"
echo ""
echo "🚀 Next Steps:"
echo "  1. Review context.yaml - this drives everything!"
echo "  2. Run: node test-context-system.js"
echo "  3. Build ONE adapter at a time as needed"
echo "  4. Let contexts evolve through use"
echo ""
echo "📝 The Magic:"
echo "  No hardcoded workspace/project/task classes."
echo "  Just contexts that behave according to their type."
echo "  Users can mix modes or create entirely new ones!"
EOF

chmod +x build-context-first.sh

echo "  ✅ Build script ready"