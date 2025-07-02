# Desktop & Jobs System Design Session

## Session Date: 2025-07-01

### Key Architectural Decision
- **@lev-os/jobs** - Standalone job system package to live in ~/lev/core/jobs
- **Desktop** - Should expose and enhance Leviathan system, not contain job logic

## Background Processing & P2P Agent Network Documentation

### ADR-001: Background Processing Architecture
- File-based job queue system at ~/.leviathan/jobs/
- Support for downloads, web scraping, iMessage sync, general tasks
- Job format: JSON files with UUID + timestamp
- State transitions: pending → active → completed/failed
- Designed for consumer applications with minimal dependencies

### ADR-002: P2P Agent Mesh Network
- libp2p-based mesh network for agent-to-agent communication
- Cryptographically signed job tickets
- Local discovery via mDNS, global via DHT
- Direct agent channels for job execution
- Reputation system for agent trust

### ADR-003: Unified Job System Integration
- Combines local background processing with P2P network
- Unified job routing (local vs network execution)
- JobScope: LOCAL, NETWORK, or HYBRID
- Smart routing based on capabilities and resources
- Single interface for all job types

## Desktop Application Role

The desktop app should:
1. **Service Management** - Start/stop/monitor Leviathan services
2. **System Dashboard** - Visual interface for Leviathan ecosystem
3. **Job Monitoring** - Display jobs from @lev-os/jobs (not implement them)
4. **Agent Network Visualization** - Show P2P mesh connections
5. **Configuration Management** - System preferences and settings

## @lev-os/jobs Package Structure

```
~/lev/core/jobs/
├── src/
│   ├── core/
│   │   ├── JobQueue.ts
│   │   ├── JobRouter.ts
│   │   └── JobExecutor.ts
│   ├── workers/
│   │   ├── DownloadWorker.ts
│   │   ├── ScrapingWorker.ts
│   │   └── GeneralWorker.ts
│   ├── p2p/
│   │   ├── AgentNetwork.ts
│   │   ├── JobTicket.ts
│   │   └── DirectChannel.ts
│   └── index.ts
├── package.json
└── README.md
```

## Integration Pattern

Desktop app connects to @lev-os/jobs via:
- IPC for local job management
- MCP protocol for distributed operations
- File watching for job queue monitoring
- Event streams for real-time updates

## Terminology Updates Completed

Updated all documentation from "Kingly" to "Leviathan":
- CLI commands: `kingly` → `lev`
- Package names: `@kingly/*` → `@lev-os/*`
- System references: "Kingly system" → "Leviathan system"
- Created TERMINOLOGY_UPDATE_SUMMARY.md

## Next Steps

1. Create @lev-os/jobs package structure
2. Move job implementation from desktop to jobs package
3. Update desktop to consume @lev-os/jobs
4. Implement P2P networking incrementally
5. Create unified job dashboard in desktop UI