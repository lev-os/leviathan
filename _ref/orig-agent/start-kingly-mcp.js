#!/usr/bin/env node
/**
 * Start Kingly Agent as MCP Server in Background
 * With hot reloading and process management
 */

import ProcessAdapter from './src/process-adapter.js';
import path from 'path';

async function startKinglyMCP() {
  console.log('🚀 Starting Kingly Agent MCP Server...\n');
  
  const processAdapter = new ProcessAdapter();
  
  // Start the MCP server with nodemon for hot reloading
  const result = await processAdapter.startProcess(
    'npx nodemon --watch src --watch agents --exec "node src/mcp-server-standalone.js"',
    {
      cwd: process.cwd(),
      type: 'mcp-server',
      taskId: 'kingly-mcp-server'
    }
  );
  
  console.log(`✅ Kingly MCP Server started!`);
  console.log(`Process ID: ${result.processId}`);
  console.log(`PID: ${result.pid}`);
  console.log(`Logs: ${result.logs}\n`);
  
  console.log('📋 Management Commands:');
  console.log(`- Check status: node -e "import('./src/process-adapter.js').then(m => new m.default().getProcessStatus('${result.processId}', {tail: 50}).then(console.log))"`);
  console.log(`- View logs: tail -f ${result.logs}`);
  console.log(`- Stop server: node -e "import('./src/process-adapter.js').then(m => new m.default().killProcess('${result.processId}').then(console.log))"`);
  console.log('\n🔥 Hot reloading enabled! The server will restart on file changes.');
  
  // Show initial logs after a brief delay
  setTimeout(async () => {
    console.log('\n📜 Initial server output:');
    console.log('─'.repeat(60));
    
    const status = await processAdapter.getProcessStatus(result.processId, { tail: 20 });
    if (status.logs?.content) {
      console.log(status.logs.content);
    }
    console.log('─'.repeat(60));
    console.log('\nServer is running in background. Use the commands above to manage it.');
  }, 2000);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startKinglyMCP().catch(console.error);
}

export default startKinglyMCP;