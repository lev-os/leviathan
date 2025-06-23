/**
 * Process MCP Tools - Manage lightweight processes (dev servers, builds, etc)
 */

import ProcessAdapter from './process-adapter.js';

// Shared process adapter instance
const processAdapter = new ProcessAdapter();

// Start a dev server
export async function start_dev_server(args) {
  const { projectPath, taskId } = args;
  
  try {
    const result = await processAdapter.startDevServer(
      projectPath || process.cwd(),
      taskId
    );
    
    return {
      message: `✅ Dev server started`,
      processId: result.processId,
      pid: result.pid,
      logs: result.logs,
      monitoring: {
        logFile: result.logs,
        tailCommand: `tail -f ${result.logs}`,
        checkCommand: `get_process_status({ processId: "${result.processId}" })`,
        moreLogsCommand: `get_process_status({ processId: "${result.processId}", tail: 100 })`
      },
      agentInstructions: `DEV SERVER STARTED SUCCESSFULLY

Process ID: ${result.processId}
PID: ${result.pid}
Log file: ${result.logs}

IMMEDIATE FEEDBACK:
Watch for server startup messages by running:
get_process_status({ processId: "${result.processId}", tail: 50 })

CONTINUOUS MONITORING:
- Quick check (last 50 lines): get_process_status({ processId: "${result.processId}", tail: true })
- More context (last 100 lines): get_process_status({ processId: "${result.processId}", tail: 100 })
- Read full logs yourself: Use Read tool on ${result.logs}
- Stop server: kill_process({ processId: "${result.processId}" })

IMPORTANT: The server is now running in the background. It will:
- Auto-reload on file changes
- Keep running until explicitly stopped
- Log all output to: ${result.logs}

You can continue with other tasks while it runs!`
    };
  } catch (error) {
    return {
      message: `❌ Failed to start dev server: ${error.message}`,
      error: error.message
    };
  }
}

// List running processes
export async function list_processes(args = {}) {
  const processes = await processAdapter.listProcesses(args);
  
  const byStatus = {
    running: processes.filter(p => p.status === 'running'),
    completed: processes.filter(p => p.status === 'completed'),
    failed: processes.filter(p => p.status === 'failed')
  };
  
  const formatted = processes.map(p => 
    `${p.status === 'running' ? '🟢' : '⚫'} ${p.id}: ${p.command} (${p.type}) - ${p.status}`
  ).join('\n');
  
  return {
    message: formatted || 'No processes found',
    stats: {
      total: processes.length,
      running: byStatus.running.length,
      completed: byStatus.completed.length,
      failed: byStatus.failed.length
    },
    processes: processes,
    agentInstructions: byStatus.running.length > 0 ? 
      `ACTIVE PROCESSES DETECTED

${byStatus.running.length} processes are currently running.

Common actions:
- Check logs: get_process_status({ processId: "..." })
- Stop process: kill_process({ processId: "..." })
- Start new: start_dev_server({ projectPath: "..." })

Running processes consume resources. Stop them when no longer needed.` : 
      'No active processes. You can start dev servers, builds, or tests as needed.'
  };
}

// Get process status and logs
export async function get_process_status(args) {
  const { processId, tail } = args;
  
  if (!processId) {
    return {
      message: '❌ No process ID provided',
      error: 'Missing required parameter: processId'
    };
  }
  
  const status = await processAdapter.getProcessStatus(processId, { tail });
  
  if (status.error) {
    return {
      message: `❌ ${status.error}`,
      error: status.error
    };
  }
  
  // Format log output for display
  let logDisplay = '';
  if (status.logs && status.logs.snippet) {
    logDisplay = `\n\n📜 LOGS (${status.logs.showing}):\n${'─'.repeat(60)}\n${status.logs.snippet}\n${'─'.repeat(60)}`;
  }
  
  return {
    message: `Process ${processId}: ${status.status}${logDisplay}`,
    ...status,
    agentInstructions: status.status === 'running' ? 
      `PROCESS RUNNING

Status: ${status.status}
Duration: ${Math.round(status.duration / 1000)}s
Log file: ${status.logs?.file || 'No logs available'}
Log size: ${status.logs?.sizeHuman || 'N/A'}

MONITORING OPTIONS:
- Get more logs: get_process_status({ processId: "${processId}", tail: 100 })
- Read full logs yourself: Use Read tool on ${status.logs?.file || 'log file'}
- Watch logs: Run \`tail -f ${status.logs?.file || 'log file'}\` in terminal
- Kill process: kill_process({ processId: "${processId}" })

${status.logs?.snippet ? `Recent activity shown above (${status.logs.totalLines} total lines)` : 'Log info available above.'}` :
      `PROCESS ENDED

Status: ${status.status}
Exit code: ${status.exitCode || 'N/A'}
Duration: ${Math.round(status.duration / 1000)}s
Log file: ${status.logs?.file || 'No logs available'}

${status.logs?.snippet ? `Final logs shown above (${status.logs.totalLines} total lines)` : 'Check log file for details.'}`
  };
}

// Kill a process
export async function kill_process(args) {
  const { processId, signal } = args;
  
  if (!processId) {
    return {
      message: '❌ No process ID provided',
      error: 'Missing required parameter: processId'
    };
  }
  
  const result = await processAdapter.killProcess(processId, signal);
  
  if (result.error) {
    return {
      message: `❌ ${result.error}`,
      error: result.error
    };
  }
  
  return {
    message: result.message,
    processId: processId,
    agentInstructions: `Process ${processId} has been terminated. Any associated servers or builds have been stopped.`
  };
}

// Export tool definitions
export const processTools = {
  start_dev_server: {
    description: 'Start a development server',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to project directory'
        },
        taskId: {
          type: 'string',
          description: 'Associated task ID'
        }
      }
    }
  },
  list_processes: {
    description: 'List all managed processes',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['running', 'completed', 'failed'],
          description: 'Filter by status'
        },
        type: {
          type: 'string',
          description: 'Filter by process type'
        }
      }
    }
  },
  get_process_status: {
    description: 'Get process status and optionally tail recent logs',
    inputSchema: {
      type: 'object',
      properties: {
        processId: {
          type: 'string',
          description: 'Process ID to check'
        },
        tail: {
          type: ['number', 'boolean'],
          description: 'Get last N lines of logs (default: 50 if true)'
        }
      },
      required: ['processId']
    }
  },
  kill_process: {
    description: 'Terminate a running process',
    inputSchema: {
      type: 'object',
      properties: {
        processId: {
          type: 'string',
          description: 'Process ID to kill'
        },
        signal: {
          type: 'string',
          description: 'Signal to send (default: SIGTERM)'
        }
      },
      required: ['processId']
    }
  }
};