#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing MCP-CEO server directly...');

const serverPath = path.join(__dirname, 'server.js');
console.log('Server path:', serverPath);

// Start the server
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('exit', (code, signal) => {
  console.log(`Server exited with code ${code} and signal ${signal}`);
});

// Send initial connection message after a short delay
setTimeout(() => {
  console.log('Sending initialization message...');
  const initMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  }) + '\n';
  
  serverProcess.stdin.write(initMessage);
}, 1000);

// Clean exit after 5 seconds
setTimeout(() => {
  console.log('Test complete, shutting down...');
  serverProcess.kill();
  process.exit(0);
}, 5000);