#!/bin/bash

# Kingly src/ Migration Script
# Archives existing src/ and creates new clean structure

echo "🏗️  Kingly Architecture Migration"
echo "================================"

# Step 1: Archive existing src
if [ -d "src" ]; then
    echo "📦 Archiving existing src/ to src-archive/"
    mv src src-archive
    echo "✅ Archived successfully"
else
    echo "⚠️  No existing src/ directory found"
fi

# Step 2: Create new directory structure
echo ""
echo "🔨 Creating new src/ structure..."

# Create all directories
mkdir -p src/{domain/{entities,services,value-objects},application,ports,adapters/{primary,secondary},infrastructure}

echo "✅ Directory structure created"

# Step 3: Copy keeper files from archive
echo ""
echo "📋 Copying keeper files..."

# Function to safely copy files
copy_if_exists() {
    local source=$1
    local dest=$2
    if [ -f "src-archive/$source" ]; then
        cp "src-archive/$source" "src/$dest"
        echo "  ✓ Copied $source"
    else
        echo "  ⚠️  Skipped $source (not found)"
    fi
}

# Copy domain files
copy_if_exists "domain/workspace.js" "domain/entities/workspace.js"
copy_if_exists "domain/task.js" "domain/entities/task.js"
copy_if_exists "domain/services/intent-classifier.js" "domain/services/intent-classifier.js"

# Copy application files  
copy_if_exists "application/workspace-service.js" "application/workspace-service.js"

# Copy port files
for port in persistence.js agent-communication.js background-execution.js workspace-management.js; do
    copy_if_exists "ports/$port" "ports/$port"
done

# Copy key adapters
copy_if_exists "adapters/primary/mcp-adapter.js" "adapters/primary/mcp-adapter.js"
copy_if_exists "adapters/secondary/json-storage.js" "adapters/secondary/json-storage.js"

# Copy infrastructure
copy_if_exists "infrastructure/dependency-injection.js" "infrastructure/dependency-injection.js"
copy_if_exists "infrastructure/server.js" "infrastructure/server.js"

# Copy entry point
copy_if_exists "index.js" "index.js"

# Step 4: Create placeholder files for new components
echo ""
echo "📝 Creating placeholder files for new components..."

# Create new entity placeholders
cat > src/domain/entities/context.js << 'EOF'
// Universal Context Entity
// TODO: Implement as per ticket 005-007
export class Context {
  constructor(data) {
    // Base context implementation
  }
}
EOF

cat > src/domain/entities/agent.js << 'EOF'
// Nano Agent Entity  
// TODO: Implement as per ticket 014
export class Agent {
  constructor(config) {
    // Agent implementation
  }
}
EOF

# Create new port placeholders
cat > src/ports/llm-adapter.js << 'EOF'
// LLM Adapter Port
// TODO: Define interface for LLM operations
export class LLMAdapter {
  async complete(prompt, options) {
    throw new Error('Not implemented');
  }
}
EOF

cat > src/ports/memory-store.js << 'EOF'
// Memory Store Port
// TODO: Define interface for memory operations
export class MemoryStore {
  async store(memory) {
    throw new Error('Not implemented');
  }
  
  async recall(query, limit) {
    throw new Error('Not implemented');
  }
}
EOF

# Create architecture documentation
cat > src/ARCHITECTURE.md << 'EOF'
# Kingly Architecture

## Hexagonal Architecture (Ports & Adapters)

This codebase follows a strict hexagonal architecture pattern.

### Layers

1. **Domain** - Pure business logic with zero external dependencies
2. **Application** - Use case orchestration
3. **Ports** - Interface definitions for external dependencies
4. **Adapters** - Concrete implementations of ports
5. **Infrastructure** - Wiring and configuration

### Rules

1. Domain imports NOTHING external
2. Application imports only domain and ports
3. Adapters import ports (never each other)
4. Infrastructure wires everything together
5. All dependencies use constructor injection

See docs/impl/000-architecture-spec.md for detailed specification.
EOF

echo "✅ Placeholder files created"

# Step 5: Summary
echo ""
echo "📊 Migration Summary"
echo "==================="
echo "✅ Archived old src/ to src-archive/"
echo "✅ Created new clean directory structure"
echo "✅ Copied keeper files maintaining architecture"
echo "✅ Created placeholders for new components"
echo ""
echo "🎯 Next Steps:"
echo "1. Review the new src/ structure"
echo "2. Begin implementing tickets 001-016"
echo "3. Remove src-archive/ once migration is verified"
echo ""
echo "🚀 Ready to implement the Universal Context Architecture!"