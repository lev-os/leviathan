# Workshop Plugin: Fractal Context Architecture Plan

## 🎯 **The Concept**
Create `@lev/workshop` plugin that dogfoods the entire Leviathan system by replicating the core repo structure as a self-contained, auto-discoverable plugin.

## 🏗️ **Fractal Plugin Structure**

### **Plugin Architecture** (`plugins/@lev/workshop/`)
```
@lev/workshop/
├── package.json                 # Plugin definition & commands
├── contexts/                    # Fractal of agent/contexts/
│   ├── workflows/
│   │   ├── tool-intake/         # Assessment workflow
│   │   ├── tier-classification/ # 8-tier semantic classification  
│   │   └── integration-pipeline/ # Tool integration automation
│   ├── agents/
│   │   ├── workshop-curator/    # Manages tool evaluation
│   │   └── integration-architect/ # Handles tool integration
│   ├── tools/
│   │   ├── repo-analyzer/       # Automated repository analysis
│   │   └── tier-classifier/     # Auto-tier assignment
│   └── patterns/
│       ├── fractal-architecture/ # Self-similar plugin patterns
│       └── discovery-automation/ # Auto-context discovery
├── src/                         # Plugin implementation
│   ├── commands/
│   │   ├── discover.js          # lev discover --system workshop
│   │   ├── intake.js            # lev intake <repo-url>
│   │   ├── classify.js          # lev classify <tool>
│   │   └── integrate.js         # lev integrate <tool>
│   └── lib/
│       ├── auto-discovery.js    # Context relationship mapping
│       └── process-intelligence.js # Workflow chain detection
└── workshop/                    # The actual 170+ tools
    ├── tier-1/                  # Production-ready tools
    ├── tier-2/                  # Advanced-stable tools
    └── ...
```

## 🔄 **Auto-Discovery Intelligence**

### **Context Auto-Loading**
- Plugin contexts automatically merge with `/agent/contexts/`
- `lev find workshop` discovers all workshop-specific contexts
- Semantic linking between plugin contexts and core contexts

### **Command Integration** 
- `lev workshop:discover` - Auto-find workshop structure and processes
- `lev workshop:intake <repo>` - Run complete assessment pipeline
- `lev workshop:status` - Show current tool classification status
- `lev workshop:integrate <tool>` - Execute tier-based integration

### **Process Intelligence**
- Auto-detect workflow chains (assessment → classification → integration)
- Map relationships between `/workshop`, `/c/workflows`, and `/agent/contexts`
- Intelligent context switching based on current operation

## 🧬 **Dogfooding Benefits**

### **Self-Validation**
- Plugin demonstrates fractal architecture scalability  
- Tests context auto-discovery and merging
- Validates command extension patterns
- Proves plugin-based functionality packaging

### **Real-World Use Case**
- Solves actual workshop automation needs
- Demonstrates complex workflow orchestration
- Shows multi-directory system intelligence
- Tests semantic context correlation

### **Architectural Proof**
- Plugins can extend contexts, not just code
- Fractal structure maintains consistency
- Auto-discovery works across plugin boundaries
- Command namespacing and organization

## 🚀 **Implementation Phases**

### **Phase 1: Basic Plugin Structure**
- Create fractal context architecture
- Implement basic auto-discovery
- Add core workshop commands

### **Phase 2: Intelligence Layer**
- Build process chain recognition
- Add semantic context correlation
- Implement workflow automation

### **Phase 3: Advanced Integration**
- Complete tool intake automation
- Add tier-based integration pipelines
- Implement status tracking across systems

This approach **dogfoods the entire system** while solving the real automation need - making the workshop intelligence truly autonomous!