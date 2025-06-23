#!/usr/bin/env node
import ProcessAdapter from './src/process-adapter.js';

const adapter = new ProcessAdapter();

async function installDeps() {
  console.log('📦 Installing dependencies with pnpm...');
  
  const result = await adapter.startProcess({
    command: 'pnpm install',
    cwd: process.cwd(),
    type: 'install',
    description: 'Install project dependencies'
  });
  
  console.log('✅ Process started:', result.processId);
  console.log('📋 Logs:', result.logs);
  console.log('\nMonitor with:');
  console.log(`node -e "import('./src/process-adapter.js').then(m => new m.default().getProcessStatus('${result.processId}', {tail: true}).then(console.log))"`);
}

installDeps().catch(console.error);