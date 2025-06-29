# ADR-001: Desktop Service Manager Architecture

**Status**: Proposed  
**Date**: 2025-06-27  
**Deciders**: Leviathan Core Team  

## Context

Leviathan currently requires users to manually start multiple services (Neo4j, Graphiti gRPC service, agent system) and keep terminal tabs open. We need a native desktop application that:

1. **Auto-starts** on system boot across platforms (macOS, Windows, Linux)
2. **Auto-heals** crashed services with intelligent restart logic
3. **Provides system tray** experience with service status
4. **Bundles core plugins** as a unified experience
5. **Stays lightweight** while managing multiple language runtimes
6. **Offers multiple installation** methods for different user types

## Decision

We will use **Tauri** to build `@lev-os/desktop` as the primary service manager for the Leviathan ecosystem.

### Framework Comparison

| Framework | Binary Size | Performance | System Tray | Auto-Start | Multi-Process | Dev Speed |
|-----------|-------------|-------------|-------------|------------|---------------|-----------|
| **Tauri** | 10-15MB | Excellent | Native | Plugin Support | ✅ | Fast |
| Electron | 150MB+ | Poor | Good | Mature | ✅ | Fastest |
| Wails | 20-30MB | Good | Improving | Partial | ✅ | Fast |
| Flutter | 40-60MB | Good | Evolving | Workarounds | ✅ | Fast |
| Native | 2-5MB | Excellent | Perfect | Manual | ✅ | Slow |

### Technical Architecture

```
@lev-os/desktop (Tauri App)
├── Frontend (HTML/JS) - Minimal status UI
├── Backend (Rust)
│   ├── Service Manager - Process lifecycle
│   ├── Health Monitor - Auto-healing logic  
│   ├── System Tray - Native OS integration
│   └── IPC Bridge - Frontend communication
└── Bundled Services
    ├── Node.js Agent System
    ├── Python Graphiti gRPC Service
    └── Go OS Kernel (future)
```

## Rationale

### Why Tauri?

1. **Size Efficiency**: 10-15MB vs Electron's 150MB+
2. **Performance**: Uses system webview, not bundled Chromium
3. **Native Integration**: First-class system tray and OS APIs
4. **Security**: Rust memory safety + capability-based security
5. **Developer Experience**: Modern frontend + Rust backend
6. **Active Development**: Strong 2024-2025 momentum and plugin ecosystem

### Why Not Electron?

- **Size**: 150MB+ for simple system tray is excessive
- **Performance**: Heavy memory usage for background service
- **Resource Usage**: Full Chromium runtime for minimal UI

### Why Not Native?

- **Development Speed**: Would take 3-4x longer across platforms
- **Maintenance**: Complex cross-platform codebase
- **UI Development**: Modern web UI easier than native GUI frameworks

## Implementation Strategy

### Phase 1: Core Service Management (macOS MVP)
```rust
// Service manager with auto-restart
pub struct ServiceManager {
    services: HashMap<String, ServiceHandle>,
    health_checker: HealthMonitor,
    restart_policies: RestartConfig,
}

// System tray with dynamic menu
SystemTray::new()
    .with_menu(build_service_menu())
    .with_icon(kingly_icon())
    .build()
```

### Phase 2: Cross-Platform Support
- Windows: Registry auto-start + MSI installer
- Linux: systemd integration + .deb/.rpm packages
- Auto-start plugin: `tauri-plugin-autostart`

### Phase 3: Plugin Bundling
- Bundle `@lev-os/memory`, `@lev-os/agent`, `@lev-os/protocol`
- Global command registration (`lev`, `kingly`)
- Unified configuration management

## Consequences

### Positive
✅ **Lightweight**: 10x smaller than Electron alternative  
✅ **Native Feel**: System tray integrates perfectly with OS  
✅ **Auto-Healing**: Rust reliability for service management  
✅ **Fast Development**: Modern web frontend + Rust backend  
✅ **Future-Proof**: Can bundle additional languages/services  
✅ **Security**: Rust memory safety + sandboxed frontend  

### Negative
❌ **Learning Curve**: Team needs Rust knowledge for backend  
❌ **Tauri Maturity**: Newer framework vs Electron's maturity  
❌ **Plugin Ecosystem**: Smaller than Electron's ecosystem  

### Risks
⚠️ **Platform Differences**: System tray behavior varies across OS  
⚠️ **Service Coordination**: Complex multi-process management  
⚠️ **Auto-Start Reliability**: OS-specific boot integration challenges  

## Monitoring

Success metrics:
- [ ] Binary size < 20MB
- [ ] Memory usage < 100MB at runtime
- [ ] Services auto-restart within 5 seconds
- [ ] 99.9% uptime for critical services
- [ ] Installation success rate > 95% across platforms

## References

- [Tauri System Tray Guide](https://tauri.app/v1/guides/features/system-tray/)
- [Cross-Platform Service Management Patterns](https://example.com)
- [Desktop App Performance Benchmarks 2025](https://example.com)