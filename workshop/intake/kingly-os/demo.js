#!/usr/bin/env node

import { KinglyOS } from './kingly-os.js';
import { llmClient } from './llm-providers/llm-client.js';

async function demo() {
  console.log('🚀 Kingly OS Demo - LLM Integration\n');

  // Initialize the system
  const kinglyOS = new KinglyOS();

  // Check LLM provider health
  console.log('🔍 Checking LLM providers...');
  const healthCheck = await llmClient.healthCheck();
  console.log('Provider Status:');
  Object.entries(healthCheck).forEach(([provider, status]) => {
    const icon = status === 'healthy' ? '✅' : '❌';
    console.log(`  ${icon} ${provider}: ${status}`);
  });
  console.log();

  // Set user preferences
  console.log('⚙️ Setting user preferences...');
  kinglyOS.setUserPreference('demo-user', 'style', 'technical');
  kinglyOS.setUserPreference('demo-user', 'responseFormat', 'numbered');
  console.log('✅ Preferences set: technical style, numbered format\n');

  // Add a custom workflow
  console.log('🔄 Adding custom workflow...');
  kinglyOS.addWorkflow('api-development', {
    trigger: /api.*develop|build.*api|create.*api/i,
    agents: ['researcher', 'dev', 'qa'],
    sequence: 'sequential'
  });
  console.log('✅ Added API development workflow\n');

  // Demo different request types
  const requests = [
    {
      message: 'Build an API for user authentication',
      description: 'Should trigger workflow mode'
    },
    {
      message: 'Write a technical blog post about microservices',
      description: 'Should use writer agent with technical style'
    },
    {
      message: 'Create a quantum computing simulation with error correction',
      description: 'Should trigger learning mode (complex unknown task)'
    },
    {
      message: 'Debug this performance issue in the database',
      description: 'Should use dev agent with debugging context'
    }
  ];

  for (let i = 0; i < requests.length; i++) {
    const { message, description } = requests[i];
    
    console.log(`📝 Request ${i + 1}: ${message}`);
    console.log(`   Expected: ${description}`);
    console.log('   Processing...');

    try {
      const result = await kinglyOS.processRequest({
        user: 'demo-user',
        message
      });

      console.log(`   🎯 Mode: ${result.mode}`);
      
      if (result.mode === 'workflow') {
        console.log(`   🔄 Workflow: ${result.workflow}`);
        console.log(`   🤖 Current Agent: ${result.currentAgent}`);
      } else if (result.mode === 'learning') {
        console.log(`   🧪 Experiments: ${result.experiments.length}`);
        console.log(`   📋 Approaches: ${result.experiments.map(e => e.approach).join(', ')}`);
      } else {
        console.log(`   🤖 Agent: ${result.agent.type}`);
        console.log(`   📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      }

      console.log(`   🎫 Estimated Tokens: ${result.estimatedTokens}`);

      // Try to get actual LLM response for default mode
      if (result.mode === 'default' && result.context) {
        console.log('   🤖 Getting LLM response...');
        try {
          const llmResponse = await llmClient.generateResponse(result.context, message);
          console.log(`   ✅ LLM Provider: ${llmResponse.provider} (${llmResponse.model})`);
          console.log(`   💬 Response Preview: ${llmResponse.content.substring(0, 100)}...`);
          
          if (llmResponse.usage) {
            console.log(`   📊 Token Usage: ${llmResponse.usage.total_tokens || 'N/A'}`);
          }
        } catch (error) {
          console.log(`   ⚠️ LLM Error: ${error.message}`);
        }
      }

      // Simulate feedback
      kinglyOS.completeInteraction('demo-user', {
        success: true,
        quality: 0.8 + Math.random() * 0.2, // 0.8-1.0
        feedback: i % 2 === 0 ? 'Great response!' : undefined
      });

      console.log('   ✅ Feedback recorded\n');

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Show system metrics
  console.log('📈 System Metrics:');
  const metrics = kinglyOS.getSystemMetrics();
  console.log(`   Total Interactions: ${metrics.totalInteractions}`);
  console.log(`   Learned Patterns: ${metrics.learnedPatterns}`);
  console.log(`   Active Workflows: ${metrics.workflowCount}`);
  console.log(`   User Count: ${metrics.userCount}`);

  const llmStats = llmClient.getStats();
  console.log('\n🔌 LLM Stats:');
  console.log(`   Requests: ${llmStats.requestCount}`);
  console.log(`   Failures: ${llmStats.failureCount}`);
  console.log(`   Success Rate: ${(llmStats.successRate * 100).toFixed(1)}%`);
  console.log(`   Primary Provider: ${llmStats.primaryProvider}`);

  console.log('\n🎉 Demo Complete!');
  console.log('\n💡 To use with real LLM providers:');
  console.log('   1. Copy .env.example to .env');
  console.log('   2. Add your API keys');
  console.log('   3. Run: pnpm run dev');
  console.log('\n🌐 For MCP integration:');
  console.log('   1. Run: pnpm run mcp');
  console.log('   2. Connect via WebSocket: ws://localhost:3001');
  console.log('   3. Use HTTP API: http://localhost:3001/api/process');
}

// Run demo
demo().catch(console.error);