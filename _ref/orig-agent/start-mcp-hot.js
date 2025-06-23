#!/usr/bin/env node
/**
 * Start Kingly Agent MCP Server with Hot Reload Support
 * 
 * Two modes:
 * 1. --restart: Full restart on changes (default, using nodemon)
 * 2. --hot: Hot reload without dropping connections
 */

import ProcessAdapter from './src/process-adapter.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse args
const args = process.argv.slice(2);
const useHotReload = args.includes('--hot') || args.includes('-h');
const showHelp = args.includes('--help');

if (showHelp) {
  console.log(`
🚀 Kingly Agent MCP Server

Usage: node start-mcp-hot.js [options]

Options:
  --hot, -h     Enable hot reload (no connection drops)
  --restart     Full restart mode (default)
  --help        Show this help

Examples:
  node start-mcp-hot.js           # Default: full restart mode
  node start-mcp-hot.js --hot     # Hot reload mode
`);
  process.exit(0);
}

async function createHotReloadWrapper() {
  const wrapperContent = `
import './src/mcp-server.js';
import HotReloadManager from './src/hot-reload-manager.js';
import fs from 'fs-extra';
import yaml from 'js-yaml';
import path from 'path';

console.log('🔥 Initializing hot reload for MCP server...');

// Get reference to the MCP server instance
const getMCPServer = () => {
  // The MCP server should expose itself globally or via module
  return global.mcpServer || require.cache[require.resolve('./src/mcp-server.js')]?.exports?.server;
};

// Create hot reload manager
const hotReload = new HotReloadManager({
  watchPaths: [
    path.resolve('./src'),
    path.resolve('./agents'),
    path.resolve('./workflows')
  ],
  excludePatterns: [
    /node_modules/,
    /\\.git/,
    /\\.kingly/,
    /test-/,
    /\\.hot-reload/
  ]
});

// Handle agent reloads
hotReload.on('agent-changed', async (filePath) => {
  console.log('🎭 Agent definition changed:', path.basename(filePath));
  
  try {
    // Reload the specific agent
    const agentContent = await fs.readFile(filePath, 'utf8');
    const agentDef = yaml.load(agentContent);
    
    const server = getMCPServer();
    if (server?.agentSystem) {
      await server.agentSystem.reloadAgent(agentDef.metadata.id, agentDef);
      console.log('✅ Agent reloaded:', agentDef.metadata.id);
    }
  } catch (error) {
    console.error('❌ Failed to reload agent:', error.message);
  }
});

// Handle module reloads
hotReload.on('module-changed', async (filePath) => {
  console.log('📦 Module changed:', path.basename(filePath));
  
  try {
    const server = getMCPServer();
    if (server?.reloadModule) {
      await server.reloadModule(filePath);
      console.log('✅ Module reloaded');
    } else {
      console.log('⚠️  Module reload not supported, restart required');
    }
  } catch (error) {
    console.error('❌ Failed to reload module:', error.message);
  }
});

// Start watching
hotReload.start();

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down hot reload...');
  hotReload.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  hotReload.stop();
  process.exit(0);
});

console.log('✨ MCP server running with hot reload!');
console.log('📁 Watching for changes in: src/, agents/, workflows/');
`;

  const wrapperPath = path.join(__dirname, '.hot-reload', 'mcp-wrapper.js');
  await fs.ensureDir(path.dirname(wrapperPath));
  await fs.writeFile(wrapperPath, wrapperContent);
  return wrapperPath;
}

async function startMCPServer() {
  console.log('🚀 Starting Kingly Agent MCP Server...');
  console.log(`📋 Mode: ${useHotReload ? '🔥 Hot Reload' : '🔄 Full Restart'}\n`);
  
  const processAdapter = new ProcessAdapter();
  
  let command;
  let description;
  
  if (useHotReload) {
    // Create hot reload wrapper
    const wrapperPath = await createHotReloadWrapper();
    command = `node "${wrapperPath}"`;
    description = 'MCP server with hot reload';
  } else {
    // Use nodemon for full restart
    command = 'npx nodemon --watch src --watch agents --watch workflows --ext js,yaml,yml --exec "node src/mcp-server.js"';
    description = 'MCP server with auto-restart';
  }
  
  // Start the server
  const result = await processAdapter.startProcess(command, {
    cwd: __dirname,
    type: 'mcp-server',
    taskId: `kingly-mcp-${useHotReload ? 'hot' : 'restart'}`
  });
  
  console.log(`✅ Kingly MCP Server started!`);
  console.log(`Process ID: ${result.processId}`);
  console.log(`PID: ${result.pid}`);
  console.log(`Logs: ${result.logs}\n`);
  
  // Save process info
  await fs.writeJson(path.join(__dirname, '.kingly-mcp.json'), {
    processId: result.processId,
    pid: result.pid,
    mode: useHotReload ? 'hot-reload' : 'restart',
    logFile: result.logs,
    startTime: new Date().toISOString()
  }, { spaces: 2 });
  
  console.log('📋 Management Commands:');
  console.log(`- Check status: node check-mcp-status.js`);
  console.log(`- View logs: tail -f ${result.logs}`);
  console.log(`- Stop server: node stop-mcp.js`);
  
  if (useHotReload) {
    console.log('\n🔥 Hot reload enabled!');
    console.log('- Agent changes apply instantly');
    console.log('- Module changes apply without dropping connections');
    console.log('- Structural changes require restart');
  } else {
    console.log('\n🔄 Auto-restart enabled!');
    console.log('- Server restarts on any file change');
    console.log('- Connections will be dropped and re-established');
  }
  
  // Show initial logs
  setTimeout(async () => {
    console.log('\n📜 Server output:');
    console.log('─'.repeat(60));
    
    const status = await processAdapter.getProcessStatus(result.processId, { tail: 30 });
    if (status.logs?.snippet) {
      console.log(status.logs.snippet);
    }
    console.log('─'.repeat(60));
  }, 2000);
}

// Helper scripts we should create
async function createHelperScripts() {
  // Status checker
  const statusScript = `#!/usr/bin/env node
import ProcessAdapter from './src/process-adapter.js';
import fs from 'fs-extra';

async function checkStatus() {
  try {
    const info = await fs.readJson('.kingly-mcp.json');
    const adapter = new ProcessAdapter();
    const status = await adapter.getProcessStatus(info.processId, { tail: 50 });
    
    console.log('🔍 Kingly MCP Server Status');
    console.log('─'.repeat(40));
    console.log('Mode:', info.mode);
    console.log('Process ID:', info.processId);
    console.log('PID:', info.pid);
    console.log('Status:', status.status);
    console.log('Uptime:', Math.round(status.duration / 1000), 'seconds');
    console.log('Log file:', info.logFile);
    
    if (status.logs?.snippet) {
      console.log('\\n📜 Recent logs:');
      console.log('─'.repeat(40));
      console.log(status.logs.snippet);
    }
  } catch (error) {
    console.error('❌ MCP server not running or info not found');
  }
}

checkStatus();
`;

  // Stopper script
  const stopScript = `#!/usr/bin/env node
import ProcessAdapter from './src/process-adapter.js';
import fs from 'fs-extra';

async function stopServer() {
  try {
    const info = await fs.readJson('.kingly-mcp.json');
    const adapter = new ProcessAdapter();
    const result = await adapter.killProcess(info.processId);
    console.log(result.message);
    await fs.remove('.kingly-mcp.json');
    await fs.remove('.hot-reload');
  } catch (error) {
    console.error('❌ Failed to stop server:', error.message);
  }
}

stopServer();
`;

  await fs.writeFile('check-mcp-status.js', statusScript);
  await fs.writeFile('stop-mcp.js', stopScript);
  await fs.chmod('check-mcp-status.js', '755');
  await fs.chmod('stop-mcp.js', '755');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  createHelperScripts()
    .then(() => startMCPServer())
    .catch(console.error);
}