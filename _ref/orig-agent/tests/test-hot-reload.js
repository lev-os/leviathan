#!/usr/bin/env node
/**
 * Test Hot Reload Setup
 * Verifies that hot reload manager works correctly
 */

import HotReloadManager from '../src/hot-reload-manager.js';
import fs from 'fs-extra';
import path from 'path';

console.log('🧪 HOT RELOAD TEST');
console.log('=' .repeat(40));

async function testHotReload() {
  // Create test files
  const testDir = './.test-hot-reload';
  await fs.ensureDir(testDir);
  
  // Create hot reload manager
  const hotReload = new HotReloadManager({
    watchPaths: [testDir],
    debounceMs: 200
  });
  
  // Track reload events
  const reloads = [];
  
  hotReload.on('reload', (event) => {
    console.log('🔄 Reload event:', event);
    reloads.push(event);
  });
  
  hotReload.on('agent-changed', (filePath) => {
    console.log('🎭 Agent changed:', path.basename(filePath));
  });
  
  hotReload.on('module-changed', (filePath) => {
    console.log('📦 Module changed:', path.basename(filePath));
  });
  
  // Start watching
  hotReload.start();
  
  // Test 1: Create a JS file
  console.log('\n📝 Test 1: Creating JS file...');
  await fs.writeFile(
    path.join(testDir, 'test-module.js'),
    'export const test = "hello";'
  );
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Test 2: Create a YAML file
  console.log('\n📝 Test 2: Creating YAML file...');
  await fs.writeFile(
    path.join(testDir, 'test-agent.yaml'),
    `metadata:
  id: test-agent
  name: Test Agent
`
  );
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Test 3: Modify the JS file
  console.log('\n📝 Test 3: Modifying JS file...');
  await fs.writeFile(
    path.join(testDir, 'test-module.js'),
    'export const test = "world";'
  );
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Results
  console.log('\n📊 Test Results:');
  console.log(`Total reload events: ${reloads.length}`);
  console.log('Events:', reloads.map(r => ({
    file: path.basename(r.filePath),
    type: r.eventType
  })));
  
  // Cleanup
  hotReload.stop();
  await fs.remove(testDir);
  
  console.log('\n✅ Hot reload test complete!');
}

// Run test
testHotReload().catch(console.error);