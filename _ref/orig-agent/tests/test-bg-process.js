#!/usr/bin/env node
/**
 * Test Background Process - Real-world test of process management
 * Runs pnpm install in background and demonstrates log streaming
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple inline process management for testing
class SimpleProcessManager {
  constructor() {
    this.logsDir = path.join(__dirname, '.kingly', 'logs');
    this.registryPath = path.join(__dirname, '.kingly', 'process-registry.json');
  }

  async startProcess(command, args = []) {
    await fs.ensureDir(this.logsDir);
    
    const processId = `proc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logFile = path.join(this.logsDir, `${processId}.log`);
    
    console.log(`🚀 Starting background process: ${processId}`);
    console.log(`📝 Logs will be written to: ${logFile}`);
    
    // Create log stream
    const logStream = fs.createWriteStream(logFile);
    
    // Start the process
    const proc = spawn(command, args, {
      cwd: __dirname,
      env: process.env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    // Pipe output to log file
    proc.stdout.pipe(logStream);
    proc.stderr.pipe(logStream);
    
    // Also pipe to console for immediate feedback
    proc.stdout.on('data', (data) => {
      process.stdout.write(`[${processId}] ${data}`);
    });
    
    proc.stderr.on('data', (data) => {
      process.stderr.write(`[${processId}] ${data}`);
    });
    
    // Save process info
    const processInfo = {
      id: processId,
      pid: proc.pid,
      command: `${command} ${args.join(' ')}`,
      startTime: new Date().toISOString(),
      logFile,
      status: 'running'
    };
    
    await this.saveToRegistry(processInfo);
    
    // Handle process exit
    proc.on('exit', async (code) => {
      console.log(`\n✅ Process ${processId} exited with code: ${code}`);
      processInfo.status = code === 0 ? 'completed' : 'failed';
      processInfo.exitCode = code;
      processInfo.endTime = new Date().toISOString();
      await this.saveToRegistry(processInfo);
      logStream.end();
    });
    
    // Unref to allow main process to exit
    proc.unref();
    
    return processInfo;
  }
  
  async saveToRegistry(processInfo) {
    let registry = {};
    if (await fs.pathExists(this.registryPath)) {
      registry = await fs.readJson(this.registryPath);
    }
    registry[processInfo.id] = processInfo;
    await fs.writeJson(this.registryPath, registry, { spaces: 2 });
  }
  
  async getProcessStatus(processId) {
    if (!await fs.pathExists(this.registryPath)) {
      return { error: 'No process registry found' };
    }
    
    const registry = await fs.readJson(this.registryPath);
    const process = registry[processId];
    
    if (!process) {
      return { error: `Process ${processId} not found` };
    }
    
    // Check if still running
    if (process.status === 'running') {
      try {
        // Check if PID is still active
        process.kill(process.pid, 0);
      } catch {
        process.status = 'completed';
        process.endTime = new Date().toISOString();
        await this.saveToRegistry(process);
      }
    }
    
    return process;
  }
  
  async tailLogs(processId, lines = 50) {
    const process = await this.getProcessStatus(processId);
    if (process.error) return process;
    
    if (!await fs.pathExists(process.logFile)) {
      return { error: 'Log file not found' };
    }
    
    const content = await fs.readFile(process.logFile, 'utf8');
    const allLines = content.split('\n');
    const tailLines = allLines.slice(-lines).join('\n');
    
    return {
      ...process,
      logs: {
        file: process.logFile,
        totalLines: allLines.length,
        showing: `last ${Math.min(lines, allLines.length)} lines`,
        content: tailLines
      }
    };
  }
}

// Main test
async function runTest() {
  console.log('🧪 BACKGROUND PROCESS TEST');
  console.log('=' .repeat(40));
  
  const manager = new SimpleProcessManager();
  
  // Start pnpm install in background
  console.log('\n📦 Starting pnpm install in background...\n');
  const processInfo = await manager.startProcess('pnpm', ['install']);
  
  console.log('\n✨ Main thread is free!');
  console.log('Process ID:', processInfo.id);
  console.log('PID:', processInfo.pid);
  console.log('Log file:', processInfo.logFile);
  
  // Demonstrate that main thread is free
  console.log('\n🔄 Main thread can do other work...');
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`⏱️  ${i + 1} seconds elapsed...`);
    
    // Check status
    const status = await manager.getProcessStatus(processInfo.id);
    console.log(`📊 Process status: ${status.status}`);
  }
  
  // Get logs with tail
  console.log('\n📜 Fetching last 20 lines of logs...');
  const logsInfo = await manager.tailLogs(processInfo.id, 20);
  
  if (logsInfo.logs) {
    console.log('\n' + '─'.repeat(60));
    console.log(logsInfo.logs.content);
    console.log('─'.repeat(60));
    console.log(`\nTotal lines in log: ${logsInfo.logs.totalLines}`);
  }
  
  console.log('\n✅ Test complete!');
  console.log('\nTo check process later:');
  console.log(`node test-bg-process.js check ${processInfo.id}`);
}

// Check mode
if (process.argv[2] === 'check' && process.argv[3]) {
  const manager = new SimpleProcessManager();
  const status = await manager.tailLogs(process.argv[3], 50);
  
  if (status.error) {
    console.error('❌', status.error);
  } else {
    console.log('Process:', status.id);
    console.log('Status:', status.status);
    console.log('Command:', status.command);
    console.log('Start time:', status.startTime);
    if (status.endTime) {
      console.log('End time:', status.endTime);
      console.log('Exit code:', status.exitCode);
    }
    if (status.logs) {
      console.log('\nLogs (' + status.logs.showing + '):');
      console.log('─'.repeat(60));
      console.log(status.logs.content);
      console.log('─'.repeat(60));
    }
  }
} else {
  // Run the test
  runTest().catch(console.error);
}