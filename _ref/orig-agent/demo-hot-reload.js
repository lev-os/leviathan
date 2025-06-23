#!/usr/bin/env node
/**
 * Demo: Hot Reload MCP Server
 * Shows how to use hot reload vs restart modes
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

console.log('🎪 KINGLY AGENT HOT RELOAD DEMO');
console.log('=' .repeat(40));

console.log(`
This demo shows the difference between:
1. 🔄 Restart mode - Full server restart (connections drop)
2. 🔥 Hot reload mode - Live updates (connections stay alive)

Usage:
  npm run dev:restart   # Traditional nodemon mode
  npm run dev:hot       # Hot reload mode

What happens with hot reload:
- Edit agents/*.yaml → Agent definitions reload instantly
- Edit src/*.js → Module logic updates without restart
- MCP connections stay alive!

Try this:
1. Start in one terminal: npm run dev:hot
2. In another terminal, edit agents/dev.yaml
3. Watch the first terminal - agent reloads without restart!
`);

// Example: Modify an agent to trigger hot reload
async function demonstrateHotReload() {
  console.log('\n📝 Example: Modifying dev agent...\n');
  
  const agentPath = './agents/dev.yaml';
  const originalContent = await fs.readFile(agentPath, 'utf8');
  
  // Parse YAML
  const lines = originalContent.split('\n');
  const descIndex = lines.findIndex(l => l.includes('description:'));
  
  if (descIndex !== -1) {
    // Toggle description
    if (lines[descIndex].includes('[HOT RELOAD]')) {
      lines[descIndex] = lines[descIndex].replace(' [HOT RELOAD]', '');
      console.log('✏️  Removing [HOT RELOAD] tag from description');
    } else {
      lines[descIndex] = lines[descIndex].replace(/"$/, ' [HOT RELOAD]"');
      console.log('✏️  Adding [HOT RELOAD] tag to description');
    }
    
    // Save modified version
    const newContent = lines.join('\n');
    await fs.writeFile(agentPath, newContent);
    
    console.log('✅ Agent modified! If hot reload is running, it should reload now.');
  }
}

// Show current package.json scripts
console.log('\n📋 Available NPM scripts:');
console.log('  npm run dev          - Standard mode');
console.log('  npm run dev:hot      - Hot reload mode');
console.log('  npm run dev:restart  - Full restart mode');
console.log('  npm run mcp:status   - Check server status');
console.log('  npm run mcp:stop     - Stop server');

// Offer to demonstrate
console.log('\n🤔 Want to see hot reload in action?');
console.log('   Run: node demo-hot-reload.js --modify');

if (process.argv.includes('--modify')) {
  demonstrateHotReload().catch(console.error);
}