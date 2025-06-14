# Kernel MCP - The Heart of Kingly OS

This is where traditional system calls meet AI intelligence.

## Architecture

```
User Intent → MCP Protocol → AI Decision → System Action
```

## Key Features

- **Protocol Dispatch**: Handle MCP calls instead of syscalls
- **Embedded AI**: TinyLlama for local inference
- **Smart Caching**: Learn from patterns
- **Zero Config**: Self-configuring OS

## Development

```bash
# Run in development
pnpm dev

# Build for production
pnpm build

# Run benchmarks
pnpm bench
```

## Integration Points

- Linux kernel module (future)
- eBPF hooks for safe testing
- Userspace prototype (current)