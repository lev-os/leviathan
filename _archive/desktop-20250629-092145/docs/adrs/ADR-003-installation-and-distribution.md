# ADR-003: Installation & Distribution Strategy

**Status**: Proposed  
**Date**: 2025-06-27  
**Deciders**: Leviathan Core Team  

## Context

Leviathan needs to serve different user segments with varying technical expertise and infrastructure preferences:

1. **Developers** - Want control, bring-your-own infrastructure, fast setup
2. **Power Users** - Want local installation with minimal cloud dependencies
3. **Enterprise Users** - Need security, compliance, and managed services
4. **Casual Users** - Want one-click setup with cloud backend

Each segment requires different installation approaches and ongoing service management.

## Decision

We will implement an **adaptive installation system** that detects the user's environment and offers appropriate installation methods with a unified onboarding experience.

### Installation Matrix

| User Type | Primary Method | Backup Methods | Backend Choice |
|-----------|----------------|----------------|----------------|
| **Developers** | Homebrew/Package Manager | Docker, Source | Local + Custom URLs |
| **Power Users** | Native Installer | Homebrew, Docker | Local + Optional Cloud |
| **Enterprise** | Native + Cloud | Docker Enterprise | Hybrid + Compliance |
| **Casual Users** | Cloud Installer | Native | Cloud + Optional Local |

## Implementation Strategy

### 1. Adaptive Installer Script

```bash
#!/bin/bash
# install.sh - Universal Leviathan installer

detect_environment() {
    OS=$(uname -s)
    ARCH=$(uname -m)
    
    # Package manager detection
    if command -v brew >/dev/null 2>&1; then
        PACKAGE_MANAGER="homebrew"
    elif command -v apt >/dev/null 2>&1; then
        PACKAGE_MANAGER="apt"
    elif command -v yum >/dev/null 2>&1; then
        PACKAGE_MANAGER="yum"
    elif command -v winget >/dev/null 2>&1; then
        PACKAGE_MANAGER="winget"
    fi
    
    # Docker detection
    if command -v docker >/dev/null 2>&1; then
        DOCKER_AVAILABLE=true
    fi
    
    # Developer environment detection
    if [[ -f ".gitconfig" ]] || [[ -d ".ssh" ]] || command -v git >/dev/null 2>&1; then
        USER_TYPE="developer"
    else
        USER_TYPE="casual"
    fi
}

present_options() {
    echo "🧠 Welcome to Leviathan Installation"
    echo "Detected: $OS $ARCH, User: $USER_TYPE"
    echo
    echo "Choose your installation method:"
    
    case $USER_TYPE in
        "developer")
            echo "1. 🍺 Homebrew (Recommended for developers)"
            echo "2. 🐳 Docker Compose (Full control)"
            echo "3. 📦 Native Installer (Easy setup)"
            echo "4. ☁️  Cloud Backend (Managed service)"
            ;;
        "casual")
            echo "1. 📦 Native Installer (Recommended)"
            echo "2. ☁️  Cloud Backend (No setup required)"
            echo "3. 🍺 Package Manager ($PACKAGE_MANAGER)"
            echo "4. 🐳 Docker (Advanced)"
            ;;
    esac
}
```

### 2. Platform-Specific Distributions

#### macOS Distribution
```yaml
# Homebrew Cask
cask "leviathan" do
  version "0.1.0"
  sha256 "..."
  
  url "https://github.com/leviathan/releases/download/v#{version}/Leviathan-#{version}-darwin-universal.dmg"
  
  name "Leviathan"
  desc "AI-native memory and agent system"
  homepage "https://leviathan.dev"
  
  auto_updates true
  
  app "Leviathan.app"
  
  postflight do
    system_command "#{appdir}/Leviathan.app/Contents/MacOS/leviathan",
                   args: ["setup", "--auto-start"]
  end
  
  uninstall quit: "com.leviathan.desktop"
end
```

#### Windows Distribution
```xml
<!-- MSI Configuration -->
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="Leviathan" Version="0.1.0" 
           Manufacturer="Leviathan" UpgradeCode="...">
    
    <Feature Id="MainFeature" Title="Leviathan Core" Level="1">
      <ComponentRef Id="MainExecutable" />
      <ComponentRef Id="AutoStartRegistry" />
    </Feature>
    
    <Feature Id="BundledServices" Title="Local Services" Level="100">
      <ComponentRef Id="Neo4jEmbedded" />
      <ComponentRef Id="PythonRuntime" />
    </Feature>
    
  </Product>
</Wix>
```

#### Linux Distribution
```dockerfile
# AppImage Builder
FROM ubuntu:22.04 as appimage-builder

RUN apt-get update && apt-get install -y \
    wget \
    fuse \
    desktop-file-utils

COPY target/release/leviathan /app/
COPY resources/leviathan.desktop /app/
COPY resources/leviathan.svg /app/

RUN wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
RUN chmod +x appimagetool-x86_64.AppImage
RUN ./appimagetool-x86_64.AppImage /app Leviathan-x86_64.AppImage
```

### 3. Backend Configuration System

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct BackendConfig {
    pub mode: BackendMode,
    pub neo4j: Neo4jConfig,
    pub graphiti: GraphitiConfig,
    pub cloud: Option<CloudConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum BackendMode {
    Local,           // All services local
    Hybrid,          // Some local, some cloud
    Cloud,           // All services cloud
    BringYourOwn,    // Custom URLs
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Neo4jConfig {
    pub source: Neo4jSource,
    pub uri: String,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Neo4jSource {
    Bundled,         // Shipped with app
    Desktop,         // Neo4j Desktop
    Docker,          // Docker container
    Cloud,           // Neo4j Aura
    Custom,          // User-provided URL
}
```

### 4. First-Run Experience

```rust
pub struct OnboardingFlow {
    step: OnboardingStep,
    config: PartialConfig,
}

pub enum OnboardingStep {
    Welcome,
    BackendChoice,
    ServiceConfiguration,
    CredentialSetup,
    Testing,
    Complete,
}

impl OnboardingFlow {
    pub async fn run(&mut self) -> Result<FinalConfig> {
        match self.step {
            OnboardingStep::Welcome => {
                self.show_welcome_screen();
                self.step = OnboardingStep::BackendChoice;
            }
            
            OnboardingStep::BackendChoice => {
                let choice = self.present_backend_options().await?;
                match choice {
                    BackendChoice::Local => self.setup_local_backend().await?,
                    BackendChoice::Cloud => self.setup_cloud_backend().await?,
                    BackendChoice::Hybrid => self.setup_hybrid_backend().await?,
                    BackendChoice::Custom => self.setup_custom_backend().await?,
                }
            }
            
            // ... other steps
        }
    }
}
```

## Service Bundle Strategies

### 1. Embedded Runtimes
```
Leviathan.app/Contents/
├── MacOS/leviathan               # Main binary
├── Resources/
│   ├── services/
│   │   ├── neo4j/               # Embedded Neo4j
│   │   ├── python/              # Python runtime
│   │   └── node/                # Node.js runtime
│   └── configs/
│       └── default.yaml
```

### 2. Dynamic Runtime Detection
```rust
pub struct RuntimeManager {
    detected_runtimes: HashMap<String, RuntimeInfo>,
    bundled_runtimes: HashMap<String, PathBuf>,
}

impl RuntimeManager {
    pub fn detect_system_runtimes() -> HashMap<String, RuntimeInfo> {
        let mut runtimes = HashMap::new();
        
        // Check system Python
        if let Ok(python_path) = which::which("python3") {
            runtimes.insert("python".to_string(), RuntimeInfo {
                path: python_path,
                version: get_python_version()?,
                source: RuntimeSource::System,
            });
        }
        
        // Check system Node.js
        if let Ok(node_path) = which::which("node") {
            runtimes.insert("node".to_string(), RuntimeInfo {
                path: node_path,
                version: get_node_version()?,
                source: RuntimeSource::System,
            });
        }
        
        runtimes
    }
}
```

### 3. Cloud Service Integration
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct CloudBackend {
    pub endpoint: String,
    pub api_key: String,
    pub region: String,
    pub tier: ServiceTier,
}

pub enum ServiceTier {
    Free,       // 1GB memory, 100k operations/month
    Pro,        // 10GB memory, 1M operations/month
    Enterprise, // Unlimited, SLA, compliance
}

impl CloudBackend {
    pub async fn provision_services(&self) -> Result<CloudServices> {
        // 1. Authenticate with cloud backend
        let auth = self.authenticate().await?;
        
        // 2. Provision Neo4j instance
        let neo4j = self.provision_neo4j(auth.clone()).await?;
        
        // 3. Provision Graphiti service
        let graphiti = self.provision_graphiti(auth.clone()).await?;
        
        // 4. Configure networking
        let network = self.setup_network(neo4j.id, graphiti.id).await?;
        
        Ok(CloudServices { neo4j, graphiti, network })
    }
}
```

## Update & Maintenance Strategy

### Auto-Update System
```rust
pub struct UpdateManager {
    current_version: Version,
    update_channel: UpdateChannel,
    auto_update: bool,
}

pub enum UpdateChannel {
    Stable,   // Release versions only
    Beta,     // Pre-release testing
    Dev,      // Daily builds
}

impl UpdateManager {
    pub async fn check_for_updates(&self) -> Result<Option<Update>> {
        let latest = self.fetch_latest_version().await?;
        
        if latest.version > self.current_version {
            Ok(Some(Update {
                version: latest.version,
                download_url: latest.download_url,
                release_notes: latest.release_notes,
                critical: latest.security_update,
            }))
        } else {
            Ok(None)
        }
    }
}
```

## ChromeOS Considerations

```rust
// ChromeOS detection and adaptation
pub fn detect_chromeos() -> bool {
    std::fs::read_to_string("/etc/lsb-release")
        .map(|content| content.contains("CHROMEOS"))
        .unwrap_or(false)
}

pub async fn setup_chromeos_environment() -> Result<()> {
    // 1. Check if Linux is enabled
    if !self.check_crostini_enabled().await? {
        return Err("Linux development environment required for ChromeOS");
    }
    
    // 2. Setup in Linux container
    self.setup_linux_services().await?;
    
    // 3. Configure PWA for Chrome interface
    self.install_pwa().await?;
    
    Ok(())
}
```

## Consequences

### Positive
✅ **User Choice**: Multiple installation methods for different preferences  
✅ **Platform Native**: Follows OS conventions for distribution  
✅ **Gradual Adoption**: Users can start cloud and migrate to local  
✅ **Developer Friendly**: Easy to bring custom infrastructure  
✅ **Enterprise Ready**: Compliance and security options  

### Negative
❌ **Complexity**: Multiple installation paths to maintain  
❌ **Testing Matrix**: Many combinations to validate  
❌ **Support Burden**: Different issues for different installation methods  

### Risks
⚠️ **Installation Failures**: Platform-specific issues  
⚠️ **Version Fragmentation**: Users on different backends  
⚠️ **Security Variations**: Different security models per installation  

## Monitoring

Success metrics:
- [ ] Installation success rate > 95% per platform
- [ ] Time to first successful operation < 5 minutes
- [ ] User satisfaction > 4.5/5 for onboarding
- [ ] Support ticket reduction by 60% vs manual setup
- [ ] Cross-platform feature parity > 90%