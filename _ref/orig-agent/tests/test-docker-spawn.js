#!/usr/bin/env node
/**
 * Test Docker Spawn - Validates Claude Code Docker integration
 * 
 * This script:
 * 1. Creates a test task with agent context
 * 2. Spawns Claude Code in Docker container
 * 3. Monitors execution and logs
 * 4. Verifies task status updates
 */

import DockerSpawnAdapter from '../src/docker-spawn-adapter.js';
import BackgroundMonitor from '../src/background-monitor.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 DOCKER SPAWN TEST HARNESS');
console.log('=' .repeat(40));

async function checkDocker() {
  try {
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      exec('docker version', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    return true;
  } catch (error) {
    console.log('⚠️  Docker not available, running in simulation mode');
    return false;
  }
}

async function runTest() {
  const dockerAvailable = await checkDocker();
  const dockerAdapter = new DockerSpawnAdapter();
  
  // Simple spawn monitor for testing
  const monitor = {
    spawns: {},
    
    addSpawn(spawnId, info) {
      this.spawns[spawnId] = {
        ...info,
        status: 'running',
        startTime: Date.now()
      };
    },
    
    getSpawnStatus(spawnId) {
      const spawn = this.spawns[spawnId];
      if (!spawn) return { status: 'unknown' };
      
      // Check if process is still running
      if (spawn.status === 'running') {
        try {
          process.kill(spawn.pid, 0);
        } catch {
          spawn.status = 'completed';
        }
      }
      
      return spawn;
    }
  };
  
  // Test task definition
  const testTask = {
    taskId: 'docker-test-001',
    type: 'code_task',
    agent: 'dev',
    title: 'Test Docker Claude Code Integration',
    description: 'Create a simple hello world script to validate Docker spawning',
    requirements: [
      'Create hello.js that logs "Hello from Docker Claude!"',
      'Add timestamp to the output',
      'Save the file to the project directory'
    ],
    workingDirectory: process.cwd() + '/test-output',
    expectedOutput: 'hello.js file created'
  };
  
  console.log('\n📋 Test Task:', testTask.title);
  console.log('📁 Working Directory:', testTask.workingDirectory);
  
  // Ensure test directory exists
  await fs.ensureDir(testTask.workingDirectory);
  
  try {
    // 1. Create spawn
    console.log('\n🚀 Creating Docker spawn...');
    const spawnId = `docker-test-${Date.now()}`;
    const containerInfo = await dockerAdapter.startContainer(
      spawnId,
      testTask.type,
      testTask
    );
    console.log('✅ Spawn created:', spawnId);
    console.log('📋 Container info:', containerInfo);
    
    // Add to monitor
    monitor.addSpawn(spawnId, {
      ...containerInfo,
      logPath: containerInfo.logPath || path.join('.kingly/spawns/logs', `${spawnId}.log`)
    });
    
    // 2. Monitor execution
    console.log('\n👀 Monitoring execution...');
    let lastStatus = null;
    let checkCount = 0;
    const maxChecks = 60; // 5 minutes max
    
    while (checkCount < maxChecks) {
      const status = monitor.getSpawnStatus(spawnId);
      
      if (status.status !== lastStatus) {
        console.log(`\n📊 Status: ${status.status}`);
        
        // Check for logs
        if (status.logPath && await fs.pathExists(status.logPath)) {
          const logs = await fs.readFile(status.logPath, 'utf8');
          const lines = logs.split('\n');
          const recent = lines.slice(-5).join('\n');
          if (recent.trim()) {
            console.log('📜 Recent logs:\n', recent);
          }
        }
        
        lastStatus = status.status;
      }
      
      // Check for completion
      if (status.status === 'completed' || status.status === 'failed') {
        console.log('\n🏁 Execution finished!');
        console.log('Final status:', JSON.stringify(status, null, 2));
        
        // Verify output
        const outputFile = path.join(testTask.workingDirectory, 'hello.js');
        if (await fs.pathExists(outputFile)) {
          console.log('\n✅ Output file created successfully!');
          const content = await fs.readFile(outputFile, 'utf8');
          console.log('📄 File content:');
          console.log('-'.repeat(40));
          console.log(content);
          console.log('-'.repeat(40));
        } else {
          console.log('\n❌ Expected output file not found');
        }
        
        break;
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      checkCount++;
    }
    
    if (checkCount >= maxChecks) {
      console.log('\n⏱️ Test timed out after 5 minutes');
    }
    
    // 3. Get container logs
    console.log('\n📋 Fetching container logs...');
    const logs = await dockerAdapter.getContainerLogs(spawnId);
    if (logs) {
      console.log('Container output:');
      console.log('='.repeat(40));
      console.log(logs);
      console.log('='.repeat(40));
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error(error.stack);
  }
  
  // Cleanup
  console.log('\n🧹 Cleaning up test directory...');
  // await fs.remove(testTask.workingDirectory);
  console.log('(Test directory preserved for inspection)');
}

// Run the test
console.log('\n🏃 Starting test...\n');
runTest().then(() => {
  console.log('\n✅ Test complete!');
}).catch(error => {
  console.error('\n❌ Test error:', error);
  process.exit(1);
});