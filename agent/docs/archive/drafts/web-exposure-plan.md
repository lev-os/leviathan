# Kingly System Web Exposure - Comprehensive Plan

## Current Analysis
Based on my investigation, I found **extensive MCP tooling already implemented** in another session:

### Existing Infrastructure
1. **Full MCP Server** (`src/index.js`) - 1000+ lines with comprehensive tooling:
   - 20+ MCP tools already exposed (get_workflow, ceo_bind, session_ping, etc.)
   - CEO binding system with agent switching
   - Session management with rollups/checkpoints  
   - Intelligence coordination and network access
   - Template synchronization across workspaces
   - Semantic lookup and workflow execution

2. **CLI System** (`bin/kingly`) - Hybrid command router:
   - Supports both explicit commands AND natural language
   - LLM whisper guidance system
   - Formatted output via `cli-formatter.js`
   - Help system and error recovery

3. **Semantic Tools** (`src/tools/semantic_search.js`):
   - Research-workflow linking
   - Knowledge graph integration
   - Development context analysis
   - Patent relevance checking

## Web Exposure Strategy

### Phase 1: HTTP Bridge Layer
**Create HTTP-to-MCP Bridge** (`src/http-server.js`):
- Express.js server exposing existing MCP tools as REST endpoints
- Middleware for session management and authentication
- WebSocket support for real-time updates
- CORS configuration for web client access

**API Endpoints to Create:**
```
GET  /api/tools           - List all available MCP tools
POST /api/tools/:toolName - Execute specific MCP tool
GET  /api/status          - System health and session info
POST /api/session/ping    - Create session checkpoint
POST /api/session/rollup  - Generate session rollup
WS   /api/stream         - Real-time updates and notifications
```

### Phase 2: Web Client Interface
**Dashboard Components** (`web/`):
- Context discovery interface (semantic search UI)
- Workflow execution dashboard
- Session management console
- Real-time status monitoring
- File upload for document analysis (AI Jared integration)

### Phase 3: Job Queue System
**Ticket Submission Bridge** (`src/job-queue.js`):
- Web form → Kingly job conversion
- Discord notification integration (using existing `~/r/discord-agent`)
- Status tracking and progress updates
- Accept/reject workflow via Discord → Web feedback

### Phase 4: AI Jared COO Integration
**Document Analysis Pipeline**:
- File upload endpoints for business documents
- OpenAI integration for analysis (already has OpenAI in package.json)
- Meeting intelligence via Recall.ai
- Voice generation via ElevenLabs
- Slack/Discord integration bridges

## Implementation Files Needed

1. **`src/http-server.js`** - Main Express server bridging MCP to HTTP
2. **`src/http-adapter.js`** - MCP tool execution wrapper
3. **`src/job-queue.js`** - Web ticket → Kingly job system
4. **`web/index.html`** - Main dashboard interface
5. **`web/components/`** - React/Vue components for each tool
6. **`src/discord-bridge.js`** - Integration with existing Discord agent
7. **`src/jared-engine.js`** - AI Jared COO functionality implementation

## Key Benefits
- **Preserves CLI-first architecture** - Web layer is pure adapter
- **Leverages existing MCP infrastructure** - No core system changes needed
- **Maintains Discord workflow** - Job notifications still via Discord
- **Enables broader adoption** - Web users can access full Kingly power
- **Supports AI Jared vision** - Document analysis and meeting intelligence

## Technical Implementation Details

### MCP-to-HTTP Bridge Architecture
The existing MCP server (`src/index.js`) already exposes 20+ tools including:
- `get_workflow` - Semantic workflow lookup
- `ceo_bind` - Agent switching and intent detection
- `session_ping` - Create session checkpoints
- `session_rollup` - Generate comprehensive session summaries
- `intelligence_power` - Deep contextual analysis
- `workflow_execute` - Execute workflows with progress tracking
- `network_intelligence` - Access distributed intelligence network

**HTTP Bridge Implementation:**
```javascript
// Express middleware to call MCP tools
app.post('/api/tools/:toolName', async (req, res) => {
  const result = await mcpServer.callTool(req.params.toolName, req.body);
  res.json(result);
});
```

### Job Queue Integration
**Web Submission Flow:**
1. User submits ticket via web form
2. `job-queue.js` converts to Kingly job format
3. Discord agent (already exists at `~/r/discord-agent`) sends notification
4. You accept/reject via Discord commands
5. Status updates flow back to web interface via WebSocket

### AI Jared COO Features
Based on the comprehensive PRD found at `~/Downloads/jared.txt`:
- Document analysis with OpenAI o3 (already configured)
- Meeting intelligence via Recall.ai integration
- Voice communication through ElevenLabs
- Slack/Discord bot functionality
- Business plan generation and analysis

## Next Steps
1. Implement HTTP bridge server with basic MCP tool exposure
2. Create simple web dashboard for context discovery and workflow execution  
3. Build job queue system connecting web submissions to Discord notifications
4. Integrate AI Jared document analysis and meeting intelligence features
5. Add authentication and multi-user support

## File Structure
```
src/
├── http-server.js          # Express server exposing MCP via HTTP
├── http-adapter.js         # MCP tool execution wrapper
├── job-queue.js           # Web ticket → Kingly job system
├── discord-bridge.js      # Integration with existing Discord agent
└── jared-engine.js        # AI Jared COO functionality

web/
├── index.html             # Main dashboard
├── components/            # UI components for each tool
├── styles/               # CSS/styling
└── js/                   # Client-side JavaScript

api/
└── routes/               # Express route definitions
```

This approach maintains the existing CLI-first architecture while making the full power of the Kingly system accessible to web users through clean adapter layers.