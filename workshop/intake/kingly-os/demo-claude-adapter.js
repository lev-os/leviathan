#!/usr/bin/env node

import { claudeCodeAdapter } from './claude-code-adapter.js';

async function demoClaudeCodeAdapter() {
  console.log('🤖 Kingly OS Claude Code Adapter Demo\n');

  // Initialize the adapter
  await claudeCodeAdapter.initialize();

  // Test various task types
  const tasks = [
    'Analyze this codebase for performance issues',
    'Fix the authentication bug in user login',
    'Write comprehensive documentation for the API',
    'Create a new feature for user dashboard'
  ];

  for (const task of tasks) {
    console.log(`📝 Task: ${task}`);
    
    try {
      const result = await claudeCodeAdapter.processTask(task);
      
      console.log(`   🎯 Mode: ${result.mode}`);
      console.log(`   🤖 Task Type: ${result.claudeCode.taskType}`);
      console.log(`   📋 Suggested Approach: ${result.claudeCode.suggestedApproach}`);
      console.log(`   🛠️ Recommended Tools: ${result.claudeCode.toolRecommendations.join(', ')}`);
      console.log(`   📊 Confidence: ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A (workflow mode)'}`);
      
      if (result.claudeCode.fileOperations) {
        console.log('   📁 File Operations:');
        result.claudeCode.fileOperations.forEach(op => {
          console.log(`      - ${op.tool}: ${op.purpose}`);
        });
      }
      
      console.log(`   ⏭️ Next Steps:`);
      result.claudeCode.nextSteps.forEach((step, i) => {
        console.log(`      ${i + 1}. ${step}`);
      });
      
      console.log();
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Test system status
  console.log('📊 System Status:');
  const status = await claudeCodeAdapter.getSystemStatus();
  console.log(`   Status: ${status.status}`);
  console.log(`   LLM Providers: ${Object.keys(status.llmProviders).length}`);
  console.log(`   Workflows: ${status.capabilities.workflows.join(', ')}`);
  console.log(`   Agents: ${status.capabilities.agents.join(', ')}`);
  console.log(`   Learning: ${status.capabilities.learningEnabled ? '✅' : '❌'}`);
  console.log(`   MCP Integration: ${status.capabilities.mcpIntegration ? '✅' : '❌'}`);

  // Test context-only mode
  console.log('\n🎯 Context-Only Mode (No LLM Calls):');
  const contextInfo = await claudeCodeAdapter.getContextOnly('Debug memory leak in production');
  console.log(`   Agent: ${contextInfo.agent}`);
  console.log(`   Mode: ${contextInfo.mode}`);
  console.log(`   Confidence: ${contextInfo.confidence ? (contextInfo.confidence * 100).toFixed(1) + '%' : 'N/A'}`);
  console.log(`   Context Preview: ${contextInfo.context ? contextInfo.context.substring(0, 100) + '...' : 'No context available'}`);

  console.log('\n✅ Claude Code Adapter Demo Complete!');
  console.log('\n💡 This adapter provides intelligent task routing without using LLM tokens.');
  console.log('   Perfect for Claude Code integration where you want context but not API calls.\n');
}

// Run demo
demoClaudeCodeAdapter().catch(console.error);