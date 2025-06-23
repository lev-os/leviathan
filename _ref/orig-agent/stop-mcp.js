#!/usr/bin/env node
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
