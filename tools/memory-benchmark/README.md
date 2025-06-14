# Memory Benchmark for Kingly OS

A comprehensive benchmark comparing different memory storage approaches for Kingly OS, with a production-ready simple JSON implementation.

## Quick Start

```bash
# Run the benchmark
cd /Users/jean-patricksmith/digital/aiforge/tools/memory-benchmark
go run benchmark.go

# Use the memory system in your code
import "memory-benchmark/simple-json-memory"

mem := simplejson.NewMemory("./my_memory.json", 1000)
mem.SetPreference("theme", "dark")
mem.RecordAction("open_file", map[string]interface{}{"file": "main.go"})
```

## Features

### Simple JSON Memory System
- **User Preferences**: Key-value storage for settings
- **Pattern Recognition**: Tracks repeated actions with confidence scores
- **Context History**: Maintains last N interactions
- **Fast Search**: Substring and tag-based search
- **Thread-Safe**: Concurrent access with RWMutex
- **Persistent**: Atomic file writes with auto-save

## API Reference

```go
// Create new memory instance
mem := NewMemory(storePath string, maxContextSize int)

// User preferences
mem.SetPreference(key string, value interface{}) error
mem.GetPreference(key string) (interface{}, bool)

// Pattern tracking
mem.RecordAction(action string, context map[string]interface{})
mem.GetPatterns(minConfidence float64) []*Pattern

// Context management
mem.AddContext(type string, data map[string]interface{}, tags []string)
mem.SearchContext(query string, limit int) []ContextEntry
mem.GetRecentContext(count int) []ContextEntry

// Persistence
mem.Load() error
mem.Save() error
mem.Clear() error

// Statistics
mem.Stats() map[string]interface{}
```

## Benchmark Results

| Metric | Simple JSON | Vector DBs | 
|--------|-------------|------------|
| Startup | ~1ms | 150-500ms |
| Memory | ~5MB | 60-150MB |
| Query | ~500ns | 20-50μs |
| Dependencies | None | Many |

## Integration Example

```go
// Initialize Kingly OS memory
memory := simplejson.NewMemory("~/.kingly/memory.json", 10000)
memory.Load()

// Track user preferences
memory.SetPreference("ai_provider", "openai")
memory.SetPreference("voice_enabled", true)

// Record actions for pattern learning
memory.RecordAction("voice_command", map[string]interface{}{
    "command": "open terminal",
    "success": true,
})

// Search history
results := memory.SearchContext("terminal", 5)
for _, entry := range results {
    fmt.Printf("Found: %v\n", entry.Data)
}

// Get recognized patterns
patterns := memory.GetPatterns(0.3) // 30% confidence threshold
for _, pattern := range patterns {
    fmt.Printf("Pattern: %s (confidence: %.2f)\n", 
        pattern.Action, pattern.Confidence)
}
```

## Why Simple JSON?

1. **Zero Dependencies**: Uses only Go standard library
2. **Fast Startup**: Sub-millisecond initialization
3. **Low Memory**: ~30x less than vector databases
4. **Easy Deployment**: Single binary, no servers needed
5. **Sufficient Features**: Covers 90% of use cases

Perfect for Kingly OS's philosophy of starting simple and enhancing based on real user needs.