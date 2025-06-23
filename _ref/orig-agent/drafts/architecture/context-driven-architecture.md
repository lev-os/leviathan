# 🎯 Context-Driven Architecture: The Right Way

## Core Insight
Keep the hexagonal architecture (ports & adapters) because it's GOOD.
Keep the working code (spawn system, etc) because it WORKS.
Make EVERYTHING context-driven from root.

## Root Context Configuration

```yaml
# /context.yaml (Kingly root)
metadata:
  type: root
  name: Kingly OS
  version: 1.0.0

intent_context:
  business_goal: Amplify human intent through conversation
  
behavior_rules:
  - trigger: system_start
    action: load_organizational_preference
    
organizational_modes:
  # Mode 1: Traditional (workspace/project/task)
  traditional:
    enabled: true
    structure:
      workspace:
        contains: [project]
        behavior: isolation_boundary
      project:
        contains: [task, resource]
        behavior: goal_boundary
      task:
        contains: [subtask]
        behavior: execution_unit
        
  # Mode 2: Folder-based (just nested contexts)
  folders:
    enabled: true
    structure:
      folder:
        contains: [folder, file, context]
        behavior: simple_container
        
  # Mode 3: Emergent (self-organizing)
  emergent:
    enabled: true
    structure:
      context:
        contains: [anything]
        behavior: learn_from_usage
        evolution: enabled
```

## Three Test Contexts

### 1. Traditional Mode Test
```yaml
# /contexts/traditional-test/context.yaml
metadata:
  type: workspace
  name: Traditional Test
  
children:
  - web-app/
    - auth-feature/
      - implement-login/
      - implement-logout/
```

### 2. Folder Mode Test  
```yaml
# /contexts/folder-test/context.yaml
metadata:
  type: folder
  name: My Stuff
  
children:
  - random/
    - ideas/
      - shower-thoughts/
        - context.yaml  # Just a folder that happens to have behaviors
```

### 3. Emergent Mode Test
```yaml
# /contexts/emergent-test/context.yaml
metadata:
  type: seed
  name: Emergent Test
  
behavior_rules:
  - trigger: interaction
    action: spawn_helper_context
    
  - trigger: pattern_detected
    action: create_abstraction
    
# This starts empty and GROWS through use
```

## What We Keep (Ports & Adapters)

```
kingly/
├── src-archive/  # Old src moved here
├── core/         # Minimal core
│   ├── ports/
│   │   ├── conversation.js    # How we talk
│   │   ├── persistence.js     # How we store
│   │   ├── execution.js       # How we run things
│   │   └── memory.js          # How we remember
│   └── adapters/
│       ├── mcp-conversation.js     # MCP implementation
│       ├── fs-persistence.js       # File system storage
│       ├── spawn-execution.js      # Your working spawn system!
│       └── vector-memory.js        # Semantic memory
├── context.yaml  # Root context defines everything
└── contexts/     # User contexts live here
```

## The ONE Thing We Build

```javascript
// core/conversation-engine.js

export class ConversationEngine {
  constructor(adapters) {
    this.adapters = adapters;
    this.currentContext = null;
  }
  
  async respond(input) {
    // 1. Where are we?
    this.currentContext = await this.detectContext(input);
    
    // 2. What mode are we in?
    const mode = this.currentContext.getOrganizationalMode();
    
    // 3. Let the context decide what to do
    const response = await this.currentContext.handleInput(input);
    
    // 4. Context might spawn new contexts, evolve, anything
    await this.currentContext.evolve(input, response);
    
    return response;
  }
}
```

## Why This Works

1. **Hexagonal Preserved**: Clean ports & adapters
2. **Working Code Reused**: Spawn system plugs right in
3. **Truly Flexible**: Root context defines organizational modes
4. **User Choice**: Use workspaces, folders, or let it evolve
5. **No Assumptions**: Just contexts all the way down

## Migration Steps

1. `mv src src-archive` - Archive existing
2. Create minimal `core/` with ports & adapters
3. Copy ONLY the working adapters (spawn, storage)
4. Create root `context.yaml` with three modes
5. Create three test contexts
6. Build ONE conversation engine
7. Let it rip!

The beauty: Users can mix modes! Have a traditional workspace that contains an emergent context that spawns folder structures. It's ALL just contexts with different behaviors.