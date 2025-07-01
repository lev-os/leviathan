# Leviathan Onboarding & Memory System Integration Analysis

## Memory System 1.0 Developer Experience + Lifecycle Architecture

### **Current State Analysis**

**✅ What Already Works:**
- Sophisticated auto-detection for Neo4j Desktop, Docker, existing instances
- Graceful fallback to file-only mode when services unavailable  
- Memory tools integrated into Universal Command Registry
- Desktop app has service detection and management capabilities

**🎯 1.0 Developer Tool Focus:**
- Assume developers will manually set up their preferred stack
- Provide clear detection/status feedback about what's available
- Work perfectly in fallback mode for immediate productivity
- Include memory setup in general `lev` onboarding flow

### **Configuration Architecture Insight**

**IMPORTANT**: Ports and service addresses should NOT be hardcoded. Reference `~/lev/_lego.md` for config instances pattern.

**Current Issue**: Many hardcoded values like:
- `localhost:50051` (Graphiti gRPC)
- `bolt://localhost:7687` (Neo4j)
- Port numbers scattered across detection logic

**Solution**: Use config instances from `_lego.md` pattern for all service configuration.

### **Memory System gRPC Service Architecture**

The Leviathan Memory System has a sophisticated **4-deployment-mode architecture** for the Graphiti gRPC service:

#### **🏗️ Deployment Modes**

1. **Desktop Mode** (`desktop`): 
   - Uses existing Neo4j Desktop installation
   - Starts only Graphiti gRPC service as Docker container
   - Auto-detects Neo4j Desktop connection
   - **Current status**: Working (user has Neo4j Desktop)

2. **Docker Mode** (`docker`):
   - Full docker-compose with Neo4j + Graphiti service
   - Isolated environment with managed Neo4j instance
   - Complete container orchestration

3. **External Mode** (`external`):
   - Uses existing external Neo4j instance
   - Starts Graphiti gRPC service only
   - Enterprise/cloud deployment friendly

4. **Native Mode** (`native`):
   - Runs Graphiti as native Python process
   - Direct process management without Docker
   - Lightweight deployment option

#### **🚀 Service Orchestration Features**

**Auto-Detection & Configuration**:
- ConfigManager auto-detects Neo4j Desktop
- ServiceOrchestrator manages deployment lifecycle
- SetupWizard provides interactive/non-interactive setup
- Graceful fallback to file-only mode

**Desktop Integration** (apps/desktop):
- Real-time service health monitoring
- Auto-start missing services
- Cross-platform service detection (ports, processes, Docker)
- Background service management through Electron app

### **Enhanced User Scenario: Both Graphiti + Neo4j Already Installed**

#### **🔍 Multi-Layer Detection System**

The `Neo4jDetector` runs **4 parallel detection strategies**:

1. **Desktop Detection**: Finds Neo4j Desktop installations across platforms
2. **Docker Detection**: Discovers existing Neo4j containers and Docker availability  
3. **Existing Instance Detection**: Tests standard ports (7474 HTTP, 7687 Bolt)
4. **Process Detection**: Scans for running Neo4j/Java processes

#### **📊 Intelligent Prioritization**

**Current Priority Order** (from `selectRecommended()`):
1. **Neo4j Desktop** (running) → `desktop` mode
2. **Existing Instance** (accessible ports) → `external` mode  
3. **Docker Available** → `docker` mode
4. **Fallback** → Manual setup required

#### **🎯 User Scenario: Both Already Installed**

**If user has both Graphiti + Neo4j running:**

**Detection Results:**
```javascript
{
  desktop: { found: true, running: true },
  existing: { bolt: { accessible: true }, http: { accessible: true } },
  processes: { neo4j: [...], java: [...] },
  recommended: {
    type: "desktop",
    reason: "Neo4j Desktop is installed and running",
    config: { 
      deploymentMode: "desktop",
      requiresGraphitiService: true
    }
  }
}
```

**System Behavior:**
- ✅ **Detects Neo4j Desktop running**
- ✅ **Chooses `desktop` deployment mode** 
- ✅ **Only starts Graphiti gRPC service** (not full Neo4j)
- ✅ **Uses existing Neo4j connection**
- ✅ **No conflicts with existing services**

### **Enhancement Opportunity: Graphiti Detection**

**Current Gap**: The system doesn't explicitly detect **existing Graphiti installations**.

#### **Enhanced Detection Plan**

**Phase 1: Graphiti Service Detection**
- Add `GraphitiDetector` class alongside `Neo4jDetector`
- Check for running Graphiti gRPC service on configurable port
- Detect existing Python Graphiti processes
- Test gRPC service health and compatibility

**Phase 2: Intelligent Orchestration**
- If both Neo4j + Graphiti running → **Skip service startup entirely**
- If Neo4j running + Graphiti missing → **Start only Graphiti service**
- If both missing → **Follow current auto-detection flow**

**Phase 3: Version Compatibility**
- Check Graphiti service version compatibility
- Validate gRPC protocol version
- Ensure Neo4j-Graphiti connection works

### **Fractal Lifecycle Pipeline Architecture**

**Core Concept:** Each core package/plugin hooks into universal lifecycle events, just like they hook into commands.

#### **Universal Lifecycle Events:**
```javascript
// Universal lifecycle pipeline
const lifecycleEvents = [
  'system:detect',          // Detect existing services/capabilities
  'system:validate',        // Validate configuration
  'system:onboard',         // Setup/install flow
  'system:start',          // Start services
  'system:health',         // Health checks
  'system:stop',           // Graceful shutdown
  'system:uninstall'       // Cleanup/removal
];
```

#### **Core Package Lifecycle Hooks:**
```yaml
# core/memory/package.yaml
lifecycle_hooks:
  system:detect:
    handler: "detectMemoryServices"
    priority: 2
    
  system:onboard:
    handler: "runMemorySetup"
    interactive: true
    dependencies: ["neo4j"]
    
  system:health:
    handler: "checkMemoryHealth"
    interval: "30s"
    
  system:uninstall:
    handler: "cleanupMemoryData"
    confirm_required: true
```

#### **Fractal Onboarding Flow:**
```bash
lev onboard                    # Main onboarding
├── Core packages detect phase
│   ├── memory: detect Neo4j/Graphiti
│   ├── debug: detect monitoring tools  
│   └── validation: check dependencies
├── Core packages setup phase
│   ├── memory: `lev memory setup`
│   ├── debug: `lev debug setup`
│   └── Agent: `lev agent setup`
└── Plugins setup phase (optional)
    ├── @lev-os/testing: plugin onboard
    └── Community plugins...
```

### **Configuration Management**

**Current System** (needs updating for config instances):
```javascript
// Current hardcoded approach
neo4j: {
  uri: 'bolt://localhost:7687',
  ports: { http: 7474, bolt: 7687 }
}
graphiti: {
  grpcAddress: 'localhost:50051'
}
```

**Proposed Config Instance Integration:**
```yaml
# From ~/lev/_lego.md pattern
memory_config:
  neo4j:
    uri: "${NEO4J_URI:-bolt://localhost:7687}"
    ports:
      http: "${NEO4J_HTTP_PORT:-7474}"
      bolt: "${NEO4J_BOLT_PORT:-7687}"
  graphiti:
    grpc_address: "${GRAPHITI_GRPC:-localhost:50051}"
    grpc_port: "${GRAPHITI_PORT:-50051}"
```

### **Desktop App Auto-Installation Responsibility**

**Clear Separation of Concerns:**
- **Memory Core Package**: Detection, connection, graceful fallback
- **Apps/Desktop Package**: Service installation, system integration, auto-start
- **Agent CLI**: Orchestration and user experience

**Desktop App Responsibilities:**
```javascript
// apps/desktop/src/service-installer.js
export class ServiceInstaller {
  async installNeo4j() {
    // Platform-specific Neo4j installation
    // Homebrew, apt, chocolatey, etc.
  }
  
  async installGraphiti() {
    // Python environment setup
    // Docker image pulling
    // Service registration
  }
  
  async registerSystemServices() {
    // systemd, launchctl, Windows Services
    // Auto-start configuration
  }
}
```

### **1.0 Developer Experience**

**Current Perfect Flow:**
1. **`lev onboard`** → Runs detection, shows what's available
2. **Memory detected** → "✅ Using your existing Neo4j + Graphiti"
3. **Nothing detected** → "📝 File-only mode enabled, full functionality available"
4. **Partial detected** → "⚠️ Neo4j found, Graphiti missing - run `lev memory setup` for full features"

**Future Enhanced Flow (Post-1.0):**
1. **`lev onboard`** → Detection + offers auto-installation via desktop app
2. **`lev memory setup --install`** → Uses desktop app for service installation
3. **Background management** → Desktop app handles service lifecycle

### **Implementation Priorities**

**1.0 (Essential):**
- [x] Memory core package integration ✅
- [x] Universal Command Registry tools ✅  
- [ ] Simple Graphiti detection enhancement
- [ ] Memory setup integration in main onboarding
- [ ] Config instances integration (remove hardcoded ports)

**Post-1.0 (Enhanced):**
- [ ] Full lifecycle pipeline architecture
- [ ] Desktop app service installation
- [ ] System service integration
- [ ] Auto-start and background management

### **Next Steps**

1. **Review `~/lev/_lego.md`** for config instances pattern
2. **Update memory detection** to use configurable ports/addresses
3. **Add simple Graphiti detection** for existing services
4. **Integrate memory setup** into main `lev onboard` flow
5. **Design lifecycle hooks** architecture for fractal onboarding

### **Key Insights**

- **Developer Tool First**: Focus on detection and graceful fallback for 1.0
- **Config Instances**: All service addresses should be configurable via config system
- **Fractal Architecture**: Each package can hook into universal lifecycle events
- **Separation of Concerns**: Apps/desktop handles installation, core packages handle detection/connection
- **Graceful Degradation**: System works perfectly even when external services unavailable

---

*Analysis saved from Memory Core Package Integration session - ready for continued development*