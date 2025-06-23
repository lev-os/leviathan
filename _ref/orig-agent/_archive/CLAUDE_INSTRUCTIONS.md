# Claude Code Process Management Instructions

When working in the Kingly Agent environment, use the integrated process management system for all background tasks.

## IMPORTANT: Use Process Manager for Background Tasks

Instead of running commands directly that create background processes, use our MCP tools:

### ❌ DON'T DO THIS:
```bash
npm run dev
pnpm run dev
yarn dev
```

### ✅ DO THIS INSTEAD:
```javascript
start_dev_server({ projectPath: "." })
```

## Available Process Management Tools

1. **start_dev_server** - Start development servers
   - Tracks the process
   - Captures all logs
   - Returns monitoring commands
   - Can be killed cleanly

2. **get_process_status** - Check process and view logs
   - Default: Last 20 lines
   - `tail: 100` - Last 100 lines
   - `verbose: true` - All logs

3. **list_processes** - See all running processes
   - Shows running/completed/failed
   - Includes process IDs for monitoring

4. **kill_process** - Stop a process cleanly
   - Ensures no orphaned processes
   - Frees up ports

## Example Workflow

```javascript
// 1. Start dev server
const server = await start_dev_server({ projectPath: "./my-app" });

// 2. Check if it started properly
const status = await get_process_status({ 
  processId: server.processId, 
  tail: 50 
});

// 3. Continue with other work...

// 4. Later, check logs again
const logs = await get_process_status({ 
  processId: server.processId,
  tail: 100 
});

// 5. When done, kill the server
await kill_process({ processId: server.processId });
```

## Benefits

- **No orphaned processes** - Everything is tracked
- **Log persistence** - All output saved to files
- **Visibility** - Other agents can see what's running
- **Clean shutdown** - Processes properly terminated
- **Port management** - No "port already in use" errors

## For Other Commands

For build processes, tests, or any long-running command:

```javascript
// Use spawn for isolated tasks
start_spawn({
  taskType: "build",
  taskData: {
    command: "pnpm run build",
    project: "my-app"
  }
})

// Or create a custom process
// (Future: We'll add start_custom_process tool)
```

Remember: The process manager ensures clean, trackable, and visible background tasks!