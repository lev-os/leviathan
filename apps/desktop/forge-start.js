#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting trader-stack development environment...');

// Start Next.js dev server
console.log('Starting Next.js dev server...');
const nextProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'packages/renderer'),
  shell: true,
  stdio: 'pipe'
});

let nextReady = false;

nextProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('[Next.js]', output.trim());
  
  if (!nextReady && (output.includes('Ready in') || output.includes('Ready on') || output.includes('started server on'))) {
    nextReady = true;
    console.log('Next.js is ready, starting Electron...');
    
    // Set environment variables for Electron
    process.env.NODE_ENV = 'development';
    process.env.MODE = 'development';
    process.env.VITE_DEV_SERVER_URL = 'http://localhost:3000';
    
    // Start Electron Forge
    const forgeProcess = spawn('npx', ['electron-forge', 'start', '--', '--no-sandbox'], {
      shell: true,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        MODE: 'development',
        VITE_DEV_SERVER_URL: 'http://localhost:3000'
      }
    });
    
    forgeProcess.on('exit', (code) => {
      console.log('Electron Forge exited with code:', code);
      nextProcess.kill();
      process.exit(code);
    });
  }
});

nextProcess.stderr.on('data', (data) => {
  console.error('[Next.js Error]', data.toString());
});

nextProcess.on('exit', (code) => {
  console.log('Next.js exited with code:', code);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  nextProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextProcess.kill();
  process.exit(0);
});