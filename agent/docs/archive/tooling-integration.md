# Kingly External Toolchain Integration

## Overview

Integration bridge between Kingly's YAML-first architecture and external toolchains in `~/i` and `~/r` directories.

## Architecture

**~/i (Infrastructure)**: Agent Zero + MCP tooling with SSE bridge architecture
**~/r (Research)**: 90+ research tools (AI models, memory, browser automation, files)
**Kingly**: Context loader with automatic capability routing

## Implementation Files

### 1. Context Definition
**File**: `contexts/tools/external-toolchain/context.yaml`
- Maps capabilities to toolpaths
- Defines routing rules for external tools
- Maintains session management configuration

### 2. Router System  
**File**: `src/external-toolchain-router.js`
- Handles execution routing between Kingly and external tools
- Manages session continuity across toolchains
- Provides capability-based tool discovery

## Capability Routing Map

| Capability | Route | Tools |
|------------|-------|-------|
| `web_automation` | `~/r/mcp-browser-use` | Browser control, web interaction, form automation |
| `memory_operations` | `~/r` (memory tools) | store_memory, query_memories, get_linked_memories |
| `ai_generation` | `~/r` (model tools) | generate_completion, stream_completion, chat_completion |
| `task_orchestration` | `~/i/agent-zero` | Multi-agent task execution with memory |
| `crawling_rag` | `~/i/mcp-crawl4ai-rag` | Web crawling with RAG capabilities |
| `file_operations` | `~/r` (file tools) | read_file, write_file, search_files, directory_tree |

## Integration Patterns

### 1. Direct Tool Routing
```javascript
const router = new ExternalToolchainRouter();
const result = await router.routeCapability('web_automation', context, sessionId);
```

### 2. Session Bridging
- Maintains session continuity between Kingly and external tools
- Preserves context state across toolchain boundaries
- Enables multi-step workflows spanning multiple systems

### 3. Context Injection
- Agent Zero receives Kingly context as prompt injection
- External tools get contextual information for better execution
- Results are captured and integrated back into Kingly workflow

## Usage Examples

### Web Research with Context Preservation
1. Load relevant Kingly context (e.g., research pattern)
2. Route web automation to `~/r/mcp-browser-use`
3. Capture results and integrate back into Kingly context
4. Maintain session continuity for follow-up actions

### Agent Zero Task Orchestration
1. Analyze task complexity in Kingly
2. If complexity > threshold, route to `~/i/agent-zero`
3. Provide Agent Zero with Kingly context as prompt injection
4. Capture Agent Zero results and integrate into Kingly workflow

### Memory-Enhanced Workflows
1. Query existing memories using `~/r` memory tools
2. Execute main task with memory context
3. Store new insights back to memory system
4. Update Kingly context with memory-enhanced results

## Key Features

### LLM-First Integration
- Preserves Kingly's "Can an LLM do this?" philosophy
- Uses external tools only when LLM capabilities are insufficient
- Maintains YAML-driven configuration approach

### Session Management
- Each external tool execution maintains session ID
- Context state preserved across tool boundaries
- Enables complex multi-step workflows

### Graceful Fallback
- Tool availability checking before execution
- Graceful degradation when tools unavailable
- Error handling with context preservation

## Infrastructure Requirements

### ~/i (Infrastructure Tools)
- **Agent Zero**: `~/i/agent-zero` - Multi-agent system
- **MCP Bridge**: `~/i/mcp-proxy` - SSE protocol translation
- **Crawl4AI**: `~/i/mcp-crawl4ai-rag` - Web crawling with RAG

### ~/r (Research Tools)
- **Browser Use**: `~/r/mcp-browser-use` - Browser automation
- **90+ Tools**: Available via `tools_list.json`
- **Memory Systems**: Vector search and cognitive state management

## Benefits

1. **Unified Interface**: Single YAML-based interface to diverse toolchains
2. **Session Continuity**: Seamless execution across multiple systems
3. **Context Preservation**: Kingly intelligence maintained throughout external execution
4. **Capability Extension**: Access to 90+ specialized tools without architectural compromise
5. **Graceful Integration**: External tools enhance rather than replace Kingly's core philosophy

## Future Enhancements

- Automatic capability discovery based on context semantic analysis
- Tool performance monitoring and optimization
- Dynamic tool selection based on execution history
- Enhanced context injection patterns for better tool coordination

---

*This integration enables Kingly to leverage existing infrastructure while maintaining its LLM-first, YAML-driven architecture.*