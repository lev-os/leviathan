#!/usr/bin/env node
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
      console.log('\n📜 Recent logs:');
      console.log('─'.repeat(40));
      console.log(status.logs.snippet);
    }
  } catch (error) {
    console.error('❌ MCP server not running or info not found');
  }
}

checkStatus();
