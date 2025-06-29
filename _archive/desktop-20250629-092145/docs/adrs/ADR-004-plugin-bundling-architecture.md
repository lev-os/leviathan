# ADR-004: Plugin Bundling Architecture

**Status**: Proposed  
**Date**: 2025-06-27  
**Deciders**: Leviathan Core Team  

## Context

Leviathan has evolved into a distributed ecosystem of core plugins that work together:

- **`@lev-os/memory`** - Hybrid memory system with Graphiti integration
- **`@lev-os/agent`** - MCP server and agent orchestration  
- **`@lev-os/protocol`** - Core MCP protocol implementations
- **`@lev-os/commands`** - CLI command system
- **`@lev-os/desktop`** - Desktop application (this plugin)

Users need a unified experience where:
1. **Commands are globally available** (`lev`, `kingly`) without PATH manipulation
2. **Services start together** as a cohesive system
3. **Configuration is centralized** but plugins remain modular
4. **Plugins can be developed independently** but bundled for distribution
5. **Core vs community plugins** have different privileges and bundling strategies

## Decision

We will implement `@lev-os/desktop` as a **meta-plugin** that bundles and orchestrates other core plugins while maintaining their modularity and independence.

### Plugin Hierarchy

```
@lev-os/desktop (Meta-Plugin)
├── Core Plugins (Bundled)
│   ├── @lev-os/memory
│   ├── @lev-os/agent  
│   ├── @lev-os/protocol
│   └── @lev-os/commands
├── Community Plugins (Discoverable)
│   ├── User-installed plugins
│   └── Marketplace plugins
└── System Integration
    ├── Global command registration
    ├── Auto-start management
    └── Unified configuration
```

### Plugin Architecture

```rust
// Plugin definition system
#[derive(Debug, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: Version,
    pub plugin_type: PluginType,
    pub services: Vec<ServiceDefinition>,
    pub commands: Vec<CommandDefinition>,
    pub dependencies: Vec<PluginDependency>,
    pub capabilities: Vec<Capability>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum PluginType {
    Core,           // Bundled with desktop app
    Community,      // User-installable
    System,         // OS integration plugins
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceDefinition {
    pub name: String,
    pub command: Vec<String>,
    pub working_directory: PathBuf,
    pub environment: HashMap<String, String>,
    pub health_check: HealthCheckDefinition,
    pub auto_start: bool,
    pub restart_policy: RestartPolicy,
}
```

## Bundling Strategy

### 1. Core Plugin Integration

```yaml
# Core plugins bundled with desktop app
bundled_plugins:
  memory:
    source: "../memory"
    services: ["graphiti-service"]
    commands: ["lev memory", "lev search"]
    global_exports: ["HybridMemoryManager"]
    
  agent:
    source: "../agent" 
    services: ["mcp-server"]
    commands: ["lev agent", "lev workflow"]
    global_exports: ["AgentOrchestrator"]
    
  protocol:
    source: "../protocol"
    services: []
    commands: ["lev mcp"]
    global_exports: ["MCPTools"]
    
  commands:
    source: "../commands"
    services: []
    commands: ["lev", "kingly"]
    global_exports: ["CommandRegistry"]
```

### 2. Plugin Discovery System

```rust
pub struct PluginManager {
    bundled_plugins: HashMap<String, BundledPlugin>,
    community_plugins: HashMap<String, CommunityPlugin>,
    plugin_registry: PluginRegistry,
    command_dispatcher: CommandDispatcher,
}

impl PluginManager {
    pub async fn initialize(&mut self) -> Result<()> {
        // 1. Load bundled plugins first
        self.load_bundled_plugins().await?;
        
        // 2. Discover community plugins
        self.discover_community_plugins().await?;
        
        // 3. Resolve dependencies
        self.resolve_plugin_dependencies().await?;
        
        // 4. Start plugin services
        self.start_plugin_services().await?;
        
        // 5. Register global commands
        self.register_global_commands().await?;
        
        Ok(())
    }
}
```

### 3. Global Command System

```rust
pub struct CommandDispatcher {
    commands: HashMap<String, CommandHandler>,
    aliases: HashMap<String, String>,
}

// Global command registration
impl CommandDispatcher {
    pub fn register_command(&mut self, plugin_id: &str, cmd: CommandDefinition) {
        let full_name = format!("lev {}", cmd.name);
        
        self.commands.insert(full_name.clone(), CommandHandler {
            plugin_id: plugin_id.to_string(),
            executor: cmd.executor,
            help: cmd.help,
        });
        
        // Create aliases for core commands
        if cmd.global_alias {
            self.aliases.insert(cmd.name.clone(), full_name);
        }
    }
    
    pub async fn execute(&self, command: &str, args: Vec<String>) -> Result<()> {
        let resolved_command = self.aliases.get(command)
            .unwrap_or(command);
            
        if let Some(handler) = self.commands.get(resolved_command) {
            handler.execute(args).await
        } else {
            Err(format!("Command not found: {}", command))
        }
    }
}
```

## Service Orchestration Integration

### 1. Plugin Service Management

```rust
pub struct PluginService {
    plugin_id: String,
    service_name: String,
    definition: ServiceDefinition,
    handle: Option<ServiceHandle>,
}

impl PluginService {
    pub async fn start(&mut self) -> Result<()> {
        // 1. Check plugin is loaded
        if !self.plugin_manager.is_plugin_loaded(&self.plugin_id) {
            return Err("Plugin not loaded");
        }
        
        // 2. Resolve working directory relative to plugin
        let plugin_path = self.plugin_manager.get_plugin_path(&self.plugin_id)?;
        let working_dir = plugin_path.join(&self.definition.working_directory);
        
        // 3. Start service with plugin context
        let child = Command::new(&self.definition.command[0])
            .args(&self.definition.command[1..])
            .current_dir(working_dir)
            .envs(&self.definition.environment)
            .spawn()?;
            
        self.handle = Some(ServiceHandle::new(child));
        Ok(())
    }
}
```

### 2. Plugin Configuration System

```yaml
# Unified configuration that plugins can extend
leviathan:
  desktop:
    auto_start: true
    system_tray: true
    
  plugins:
    memory:
      enabled: true
      config:
        neo4j_uri: "bolt://localhost:7687"
        enable_graphiti: true
        
    agent:
      enabled: true
      config:
        mcp_port: 3333
        max_agents: 10
        
  global:
    log_level: "info"
    data_directory: "~/.leviathan"
```

```rust
pub struct ConfigManager {
    base_config: Config,
    plugin_configs: HashMap<String, Value>,
}

impl ConfigManager {
    pub fn get_plugin_config(&self, plugin_id: &str) -> Result<Value> {
        self.plugin_configs.get(plugin_id)
            .cloned()
            .ok_or_else(|| format!("No config for plugin: {}", plugin_id))
    }
    
    pub fn merge_plugin_defaults(&mut self, plugin_id: &str, defaults: Value) {
        let entry = self.plugin_configs.entry(plugin_id.to_string())
            .or_insert(Value::Null);
            
        *entry = merge_values(defaults, entry.clone());
    }
}
```

## Plugin Development & Distribution

### 1. Plugin Development Kit

```rust
// Plugin trait that all plugins must implement
#[async_trait]
pub trait LeviathanPlugin: Send + Sync {
    async fn initialize(&mut self, context: PluginContext) -> Result<()>;
    async fn start_services(&mut self) -> Result<Vec<ServiceHandle>>;
    fn get_commands(&self) -> Vec<CommandDefinition>;
    fn get_manifest(&self) -> PluginManifest;
    async fn shutdown(&mut self) -> Result<()>;
}

// Context provided to plugins during initialization
pub struct PluginContext {
    pub config: Value,
    pub data_directory: PathBuf,
    pub log_handle: LogHandle,
    pub event_bus: EventBus,
    pub service_manager: Arc<ServiceManager>,
}
```

### 2. Plugin Installation System

```rust
pub struct PluginInstaller {
    registry_url: String,
    install_directory: PathBuf,
    signature_verifier: SignatureVerifier,
}

impl PluginInstaller {
    pub async fn install_plugin(&self, plugin_spec: &str) -> Result<()> {
        // 1. Parse plugin specification
        let spec = PluginSpec::parse(plugin_spec)?;
        
        // 2. Download plugin package
        let package = self.download_plugin(&spec).await?;
        
        // 3. Verify signature (for security)
        self.signature_verifier.verify(&package)?;
        
        // 4. Extract and validate manifest
        let manifest = self.extract_manifest(&package)?;
        self.validate_manifest(&manifest)?;
        
        // 5. Install plugin files
        self.install_plugin_files(&package, &manifest).await?;
        
        // 6. Register with plugin manager
        self.register_plugin(&manifest).await?;
        
        Ok(())
    }
}
```

### 3. Plugin Security Model

```rust
pub struct PluginSandbox {
    allowed_capabilities: Vec<Capability>,
    resource_limits: ResourceLimits,
    network_policy: NetworkPolicy,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Capability {
    FileSystem(FileSystemAccess),
    Network(NetworkAccess),
    Process(ProcessAccess),
    SystemTray,
    GlobalCommands,
    CorePluginAccess,
}

// Core plugins have elevated privileges
impl PluginSandbox {
    pub fn for_core_plugin() -> Self {
        Self {
            allowed_capabilities: vec![
                Capability::FileSystem(FileSystemAccess::ReadWrite),
                Capability::Network(NetworkAccess::Full),
                Capability::Process(ProcessAccess::Full),
                Capability::SystemTray,
                Capability::GlobalCommands,
                Capability::CorePluginAccess,
            ],
            resource_limits: ResourceLimits::unlimited(),
            network_policy: NetworkPolicy::allow_all(),
        }
    }
    
    pub fn for_community_plugin() -> Self {
        Self {
            allowed_capabilities: vec![
                Capability::FileSystem(FileSystemAccess::PluginDirectory),
                Capability::Network(NetworkAccess::Limited),
            ],
            resource_limits: ResourceLimits::default(),
            network_policy: NetworkPolicy::restricted(),
        }
    }
}
```

## Global Command Integration

### 1. System PATH Integration

```rust
impl DesktopApp {
    pub async fn setup_global_commands(&self) -> Result<()> {
        match std::env::consts::OS {
            "macos" => self.setup_macos_commands().await,
            "windows" => self.setup_windows_commands().await,
            "linux" => self.setup_linux_commands().await,
            _ => Err("Unsupported platform"),
        }
    }
    
    async fn setup_macos_commands(&self) -> Result<()> {
        // 1. Create symlinks in /usr/local/bin
        let bin_dir = PathBuf::from("/usr/local/bin");
        
        // 2. Create lev command wrapper
        let lev_wrapper = format!(r#"#!/bin/bash
exec "{}/Contents/MacOS/leviathan" command "$@"
"#, self.app_bundle_path().display());
        
        std::fs::write(bin_dir.join("lev"), lev_wrapper)?;
        std::fs::write(bin_dir.join("kingly"), lev_wrapper)?;
        
        // 3. Make executable
        self.make_executable(&bin_dir.join("lev"))?;
        self.make_executable(&bin_dir.join("kingly"))?;
        
        Ok(())
    }
}
```

### 2. Command Routing

```bash
#!/bin/bash
# Global lev command wrapper

# Find desktop app installation
if [[ -f "/Applications/Leviathan.app/Contents/MacOS/leviathan" ]]; then
    LEVIATHAN_BIN="/Applications/Leviathan.app/Contents/MacOS/leviathan"
elif command -v leviathan >/dev/null 2>&1; then
    LEVIATHAN_BIN=$(command -v leviathan)
else
    echo "Error: Leviathan desktop app not found"
    exit 1
fi

# Route command to desktop app
exec "$LEVIATHAN_BIN" command "$@"
```

## Plugin Lifecycle Management

```rust
pub enum PluginState {
    Unloaded,
    Loading,
    Loaded,
    Starting,
    Running,
    Stopping,
    Stopped,
    Failed,
}

pub struct PluginLifecycle {
    state: PluginState,
    plugin: Box<dyn LeviathanPlugin>,
    dependencies: Vec<String>,
}

impl PluginLifecycle {
    pub async fn transition_to(&mut self, target: PluginState) -> Result<()> {
        match (self.state, target) {
            (PluginState::Unloaded, PluginState::Loading) => {
                self.plugin.initialize(self.context.clone()).await?;
                self.state = PluginState::Loaded;
            }
            
            (PluginState::Loaded, PluginState::Starting) => {
                self.plugin.start_services().await?;
                self.state = PluginState::Running;
            }
            
            // ... other transitions
        }
        Ok(())
    }
}
```

## Consequences

### Positive
✅ **Unified Experience**: Single app provides all Leviathan functionality  
✅ **Modular Development**: Plugins can be developed independently  
✅ **Global Commands**: `lev` and `kingly` work everywhere  
✅ **Progressive Loading**: Core plugins bundled, community plugins discoverable  
✅ **Security Boundaries**: Different privilege levels for core vs community  
✅ **Easy Distribution**: One installer provides complete system  

### Negative
❌ **Complexity**: Meta-plugin architecture adds coordination overhead  
❌ **Bundle Size**: Bundling core plugins increases app size  
❌ **Version Synchronization**: Core plugin versions must be coordinated  

### Risks
⚠️ **Plugin Conflicts**: Different plugins might conflict in command names  
⚠️ **Dependency Hell**: Complex plugin dependency resolution  
⚠️ **Security Issues**: Community plugins could compromise system  

## Monitoring

Success metrics:
- [ ] Plugin load time < 2 seconds for core plugins
- [ ] Global command availability 100% after installation
- [ ] Plugin conflict resolution success rate > 99%
- [ ] Community plugin sandbox breach rate: 0%
- [ ] Developer satisfaction with plugin API > 4.5/5