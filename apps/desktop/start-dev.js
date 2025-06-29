#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting trader-stack in development mode...\n');

// First, ensure packages are built
console.log('Building packages...');
const buildMain = spawn('npm', ['run', 'build'], {
  cwd: path.join(__dirname, 'packages/main'),
  shell: true,
  stdio: 'inherit'
});

buildMain.on('close', (code) => {
  if (code !== 0) {
    console.error('Failed to build main package');
    process.exit(1);
  }
  
  const buildPreload = spawn('npm', ['run', 'build'], {
    cwd: path.join(__dirname, 'packages/preload'),
    shell: true,
    stdio: 'inherit'
  });
  
  buildPreload.on('close', (code) => {
    if (code !== 0) {
      console.error('Failed to build preload package');
      process.exit(1);
    }
    
    // Start Next.js dev server
    console.log('\nStarting Next.js dev server...');
    const nextProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'packages/renderer'),
      shell: true,
      stdio: 'pipe'
    });
    
    let electronStarted = false;
    
    nextProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Next.js]', output.trim());
      
      if (!electronStarted && output.includes('Ready in')) {
        electronStarted = true;
        
        setTimeout(() => {
          console.log('\nStarting Electron...');
          
          // Start Electron directly
          const electronProcess = spawn('npx', ['electron', '.'], {
            shell: true,
            stdio: 'inherit',
            env: {
              ...process.env,
              NODE_ENV: 'development',
              MODE: 'development',
              VITE_DEV_SERVER_URL: 'http://localhost:3000'
            }
          });
          
          electronProcess.on('exit', (code) => {
            console.log('Electron exited with code:', code);
            nextProcess.kill();
            process.exit(code);
          });
        }, 2000); // Give Next.js 2 seconds to fully initialize
      }
    });
    
    nextProcess.stderr.on('data', (data) => {
      console.error('[Next.js Error]', data.toString());
    });
    
    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      nextProcess.kill();
      process.exit(0);
    });
  });
});