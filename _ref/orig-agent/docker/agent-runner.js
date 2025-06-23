#!/usr/bin/env node
/**
 * Agent Runner - Executes inside Docker container
 * Loads context and runs Claude Code with agent configuration
 */

import fs from 'fs-extra';
import { spawn } from 'child_process';

console.log('🤖 KINGLY AGENT RUNNER');
console.log('=' .repeat(40));

async function run() {
  const contextPath = '/workspace/context/context.json';
  const resultsDir = '/workspace/results';
  
  try {
    // Load context
    console.log('📋 Loading context...');
    const context = await fs.readJson(contextPath);
    console.log('✅ Context loaded:', {
      spawnId: context.spawnId,
      taskType: context.taskType,
      agent: context.taskData.agent
    });
    
    // Create agent instructions file
    const instructionsPath = '/tmp/agent-instructions.md';
    await fs.writeFile(instructionsPath, context.instructions);
    console.log('📝 Agent instructions written');
    
    // Prepare Claude Code command
    const claudeCmd = [
      'claude-code',
      '--agent-instructions', instructionsPath,
      '--working-directory', context.taskData.workingDirectory || '/workspace',
      '--task', JSON.stringify(context.taskData),
      '--auto-approve'
    ];
    
    console.log('🚀 Starting Claude Code...');
    console.log('Command:', claudeCmd.join(' '));
    
    // Run Claude Code
    const claudeProcess = spawn(claudeCmd[0], claudeCmd.slice(1), {
      stdio: 'inherit',
      env: {
        ...process.env,
        KINGLY_SPAWN_ID: context.spawnId,
        KINGLY_TASK_ID: context.taskData.taskId
      }
    });
    
    // Wait for completion
    const exitCode = await new Promise((resolve) => {
      claudeProcess.on('exit', resolve);
    });
    
    console.log(`\n✅ Claude Code exited with code: ${exitCode}`);
    
    // Save results
    const results = {
      spawnId: context.spawnId,
      taskId: context.taskData.taskId,
      exitCode,
      timestamp: new Date().toISOString(),
      success: exitCode === 0
    };
    
    await fs.writeJson(
      path.join(resultsDir, 'summary.json'),
      results,
      { spaces: 2 }
    );
    
    // Update task status
    if (context.taskData.taskId) {
      const taskUpdate = {
        taskId: context.taskData.taskId,
        status: exitCode === 0 ? 'completed' : 'failed',
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(
        path.join(resultsDir, 'task-update.json'),
        taskUpdate,
        { spaces: 2 }
      );
    }
    
    console.log('📊 Results saved to:', resultsDir);
    
  } catch (error) {
    console.error('❌ Agent runner error:', error);
    
    // Save error details
    await fs.writeJson(
      path.join(resultsDir, 'error.json'),
      {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { spaces: 2 }
    );
    
    process.exit(1);
  }
}

// Start execution
run().catch(console.error);