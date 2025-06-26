# Workshop Auto Processor

🧙🏽‍♂️ Autonomous workshop intake processor that runs the `_auto.md` prompt as a background worker with streaming output and real-time terminal UI.

## Quick Start

```bash
# Install dependencies
npm install

# Start the terminal UI (recommended)
npm start

# Or start just a worker
npm run worker

# Check status
npm run status

# Check intake progress
npm run intake
```

## Features

### Background Worker (`auto-processor.js`)
- ✅ Runs `_auto.md` prompt autonomously via Claude Code CLI
- ✅ Captures streaming output to log files
- ✅ Multiple parallel workers supported
- ✅ Process management (start/stop/status)
- ✅ Integration with existing tracker.txt system

### Terminal UI (`terminal-ui.js`)
- ✅ Real-time monitoring dashboard
- ✅ Live output streaming
- ✅ Intake progress visualization
- ✅ Worker management controls
- ✅ Status updates and error tracking

## Usage

### Terminal UI Mode (Recommended)
```bash
npm start
```

**Key Bindings:**
- `R` - Refresh all data
- `S` - Start new worker  
- `K` - Kill active worker
- `Q` or `Ctrl+C` - Quit

### CLI Worker Mode
```bash
# Start a worker
node auto-processor.js start [workerId]

# Stop a worker  
node auto-processor.js stop [workerId]

# Check status
node auto-processor.js status

# Check intake progress
node auto-processor.js intake
```

## How It Works

### Auto Processor Flow
1. **Reads** `_auto.md` system prompt
2. **Spawns** `claude` process with the prompt
3. **Captures** streaming stdout/stderr
4. **Saves** output to `tmp/auto-runs/` directory
5. **Emits** events for UI integration

### Integration with _auto.md
The processor automatically:
- Extracts system prompt from `_auto.md` 
- Handles the autonomous repository analysis workflow
- Integrates with existing `tracker.txt` progress tracking
- Manages output files and logging

### Output Structure
```
tmp/auto-runs/
├── auto-1-2025-06-26T10-30-00-000Z.log
├── auto-2-2025-06-26T10-35-00-000Z.log
└── ...
```

## Terminal UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│              🧙🏽‍♂️ LEVIATHAN WORKSHOP AUTO PROCESSOR          │
├──────────────────────────┬──────────────────────────────────┤
│         Status           │        Intake Progress           │
│ Active Workers: 2        │ Progress: 75% [███████████░░░░░] │
│ Output Dir: tmp/auto-... │ Processed: 45/60 repositories   │
│ Last Refresh: 10:30:45   │ Last: ultimate-mcp-server        │
├──────────────────────────┼──────────────────────────────────┤
│      Active Workers      │         Live Output              │
│ ID: auto-1               │ [auto-1] Analyzing repo...       │
│ PID: 12345              │ [auto-1] Found 15 MCP tools     │
│ Uptime: 120s            │ [auto-2] Processing next...      │
├──────────────────────────┴──────────────────────────────────┤
│      [R]efresh | [S]tart Worker | [K]ill Worker | [Q]uit     │
└─────────────────────────────────────────────────────────────┘
```

## Dependencies

- **Node.js 18+** - Runtime environment
- **blessed** - Terminal UI framework  
- **Claude Code CLI** - Must be installed and authenticated
- **Git** - For repository operations

## Environment Setup

Ensure Claude Code is installed and working:
```bash
# Test Claude Code is available
claude --version

# Test basic functionality
claude "echo test"
```

## Troubleshooting

### Worker won't start
- Check Claude Code authentication: `claude auth status`
- Verify `_auto.md` exists in current directory
- Check output directory permissions

### UI not updating
- Press `R` to force refresh
- Check terminal size (minimum 80x24)
- Restart with `npm start`

### Output files not created
- Verify `tmp/auto-runs/` directory exists
- Check file permissions
- Review worker logs for errors

## Advanced Usage

### Multiple Workers
```bash
# Start multiple workers with different IDs
node auto-processor.js start worker-1
node auto-processor.js start worker-2  
node auto-processor.js start worker-3
```

### Custom Output Directory
Edit `auto-processor.js` and modify:
```javascript
this.outputDir = path.join(this.baseDir, 'custom', 'output', 'dir');
```

### Integration with Existing Workflows
The processor integrates seamlessly with:
- `tracker.txt` progress tracking
- Existing `_auto.md` prompt system
- Workshop intake directory structure
- Leviathan agent ecosystem

---

**FOLLOW-UPS:**

1. My recommendation - Run `npm install && npm start` to launch the terminal UI
2. Choices choices - Start with CLI mode or terminal UI based on preference
3. How about...? - Customize output directories or add more worker types
4. MVP all of it - Execute `npm start` and press `S` to begin autonomous processing
5. Have you considered? - Running multiple workers in parallel for faster intake
6. 📸 **/checkpoint** - Update progress and session state  
7. 📸 **/lev** - Transfer to specialized agent
8. ⬅️ **Back** - Return to previous context