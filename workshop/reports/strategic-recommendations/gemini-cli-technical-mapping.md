# Gemini CLI to Leviathan Technical Mapping

## Component Mapping

### 1. MCP Protocol Implementation

**Gemini CLI**:
- Location: `packages/core/src/tools/mcp-client.ts`
- Features:
  - StdioClientTransport
  - SSEClientTransport
  - StreamableHTTPClientTransport
  - Tool discovery and registration
  - Server status tracking

**Leviathan**:
- Location: `agent/src/adapters/mcp/mcp-adapter.js`
- Features:
  - StdioServerTransport
  - Tool registration
  - Auto-bootstrap pattern
  - Bi-directional communication

**Integration Points**:
```javascript
// Create unified MCP bridge
class UnifiedMCPBridge {
  // Gemini as MCP client
  geminiClient: GeminiMCPClient
  
  // Leviathan as MCP server
  leviathanServer: KinglyAgentServer
  
  // Bi-directional tool routing
  routeToolCall(source, toolName, args) {
    // Route between systems
  }
}
```

### 2. Tool Registry Systems

**Gemini CLI Tools**:
```typescript
// packages/core/src/tools/
- read-file.ts      // File reading with support for various formats
- write-file.ts     // File writing with atomic operations
- edit.ts           // Advanced file editing with diff support
- grep.ts           // Pattern searching in files
- glob.ts           // File pattern matching
- ls.ts             // Directory listing
- web-fetch.ts      // Web content fetching
- web-search.ts     // Google search integration
- memoryTool.ts     // Memory management
- shell.ts          // Shell command execution
```

**Leviathan Tools**:
```javascript
// agent/src/tools/
- get_workflow       // Semantic workflow lookup
- ceo_bind          // Agent switching
- session_ping      // Session checkpoints
- intelligence_power // Deep contextual analysis
- network_intelligence // Distributed intelligence
- template_sync     // Cross-workspace sync
```

**Tool Mapping Strategy**:
1. Namespace Gemini tools: `gemini_*`
2. Create tool adapters for schema conversion
3. Implement unified tool discovery
4. Enable cross-system tool execution

### 3. CLI Architecture

**Gemini CLI Structure**:
```typescript
// packages/cli/src/
├── gemini.tsx          // Main CLI entry (React/Ink)
├── nonInteractiveCli.ts // Non-interactive mode
├── ui/                 // React components
│   ├── ChatInterface.tsx
│   ├── ThemeSelector.tsx
│   └── ToolOutput.tsx
└── utils/              // CLI utilities
```

**Leviathan CLI Structure**:
```javascript
// agent/bin/lev (bash script)
// agent/src/adapters/cli/
├── cli-entry.js        // CLI entry point
├── cli-adapter.js      // Command routing
└── commands/           // Command implementations
```

**Integration Approach**:
1. Create `@lev-os/gemini-ui` plugin for React/Ink components
2. Extend `bin/lev` to support interactive mode
3. Port Gemini's theme system to Leviathan
4. Unify command parsing and routing

### 4. Authentication Systems

**Gemini Authentication**:
- OAuth2 flow
- API key support
- Google account integration
- Token refresh handling

**Leviathan Authentication**:
- Environment variable based
- API key management
- Session-based auth

**Unified Auth Strategy**:
```javascript
// Create auth adapter
class UnifiedAuthAdapter {
  async authenticate(method) {
    switch(method) {
      case 'google':
        return await geminiOAuth2Flow();
      case 'api_key':
        return await validateAPIKey();
      case 'session':
        return await leviathanSession();
    }
  }
}
```

### 5. Configuration Management

**Gemini Config**:
- Location: `packages/core/src/config/config.ts`
- User settings: `~/.gemini/`
- Project settings: `.gemini/`
- Environment variables

**Leviathan Config**:
- Plugin configs: `config/plugin.yaml`
- Environment: `.env` files
- Session state: `contexts/` directory

**Unified Config**:
```yaml
# @lev-os/gemini-bridge/config/plugin.yaml
plugin:
  name: gemini-bridge
  version: 1.0.0
  
gemini:
  api_key: ${GEMINI_API_KEY}
  model: gemini-pro
  features:
    multimodal: true
    web_search: true
    
integration:
  tool_prefix: gemini_
  ui_mode: unified
  auth_method: shared
```

### 6. Testing Infrastructure

**Gemini Testing**:
- Framework: Vitest
- Mocking: vi.mock for ES modules
- Integration tests: `integration-tests/`
- E2E testing with sandbox

**Leviathan Testing**:
- Custom test runner
- Integration tests: `tests/integration/`
- E2E tests: `test-e2e.sh`
- Smoke tests for validation

**Unified Testing**:
```javascript
// tests/integration/gemini-bridge.test.js
describe('Gemini Bridge Integration', () => {
  test('Gemini tools accessible via Leviathan MCP', async () => {
    const response = await lev('list-tools');
    expect(response.tools).toContain('gemini_read_file');
    expect(response.tools).toContain('gemini_web_search');
  });
  
  test('Bi-directional tool execution', async () => {
    // Test Gemini calling Leviathan tools
    const result = await gemini.executeTool('get_workflow', {
      query: 'test workflow'
    });
    expect(result).toBeDefined();
  });
});
```

## Implementation Priorities

### Phase 1: Core Infrastructure
1. MCP bridge implementation
2. Basic tool mapping (file operations)
3. Configuration management
4. Initial test suite

### Phase 2: Feature Integration
1. Multi-modal support
2. Web search capabilities
3. Memory system connection
4. UI component porting

### Phase 3: Production Hardening
1. Performance optimization
2. Error handling unification
3. Documentation generation
4. Example workflows

## Technical Challenges & Solutions

### Challenge 1: TypeScript vs JavaScript
- **Issue**: Gemini uses TypeScript, Leviathan uses JavaScript
- **Solution**: Use TypeScript declarations for interfaces, transpile for runtime

### Challenge 2: React/Ink vs CLI Adapter
- **Issue**: Different UI paradigms
- **Solution**: Create abstraction layer for UI components

### Challenge 3: Tool Schema Differences
- **Issue**: Different parameter formats
- **Solution**: Schema conversion layer with validation

### Challenge 4: Async Handling
- **Issue**: Different async patterns
- **Solution**: Unified promise-based API

## Success Criteria

1. **Tool Interoperability**: All Gemini tools callable from Leviathan
2. **UI Consistency**: Seamless transition between UI modes
3. **Performance**: <50ms overhead for tool routing
4. **Reliability**: 99.9% uptime for integrated system
5. **Developer Experience**: Single command to access both systems