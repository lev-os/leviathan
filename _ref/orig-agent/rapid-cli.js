#!/usr/bin/env node

/**
 * Rapid CLI - Zero-config CLI for Kingly SDK
 * Auto-exposes all SDK methods with minimal syntax
 */

import { Kingly } from './kingly.js';

const args = process.argv.slice(2);
const [namespace, method, ...params] = args;

// Command mapping for convenience
const aliases = {
  // Short commands
  'create': 'tasks.create',
  'get': 'tasks.get',
  'classify': 'tasks.classify',
  'search': 'memory.search',
  'store': 'memory.store',
  'demo': 'utils.demo',
  'health': 'utils.health',
  
  // Full paths work too
  'tasks.create': 'tasks.create',
  'tasks.get': 'tasks.get',
  'tasks.classify': 'tasks.classify',
  'contexts.load': 'contexts.load',
  'memory.search': 'memory.search',
  'utils.demo': 'utils.demo'
};

async function main() {
  if (!namespace) {
    console.log(`🚀 Rapid CLI for Kingly SDK

Usage:
  rapid <command> [args...]

Quick Commands:
  rapid create "Task title" [description] [workspace]
  rapid classify "Task title" [description] 
  rapid get <task-id>
  rapid search "query"
  rapid demo
  rapid health

Full Commands:
  rapid tasks.create "title" "description" 
  rapid memory.search "query"
  rapid contexts.load "context-name"
  rapid utils.health

Examples:
  rapid create "Implement auth" "JWT-based authentication" "backend-workspace"
  rapid classify "Build API" "REST endpoints for users"
  rapid get task-123abc
  rapid search "authentication patterns"
  rapid demo
`);
    return;
  }

  try {
    // Resolve command path
    const cmdPath = aliases[`${namespace}.${method}`] || aliases[namespace] || `${namespace}.${method}`;
    
    if (!cmdPath) {
      console.error(`❌ Unknown command: ${namespace}${method ? `.${method}` : ''}`);
      console.log('Run "rapid" for help');
      return;
    }

    // Navigate to SDK method
    const [ns, fn] = cmdPath.split('.');
    const sdkNamespace = Kingly[ns];
    const sdkMethod = sdkNamespace[fn];

    if (!sdkMethod) {
      console.error(`❌ Method not found: ${cmdPath}`);
      return;
    }

    // Parse parameters based on command
    let result;
    
    if (cmdPath === 'tasks.create') {
      // rapid create "title" [description] [workspace]
      const [title, description, workspace_id] = params;
      if (!title) {
        console.error('❌ Title required: rapid create "Task title"');
        return;
      }
      
      result = await sdkMethod({
        title,
        description: description || '',
        workspace_id: workspace_id || 'default'
      });
      
      console.log(`✅ Created task ${result.id}`);
      console.log(`   Intent: ${result.intent_type}`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Domain: ${result.intent_context.domain}`);
      
    } else if (cmdPath === 'tasks.classify') {
      // rapid classify "title" [description]
      const [title, description] = params;
      if (!title) {
        console.error('❌ Title required: rapid classify "Task title"');
        return;
      }
      
      result = sdkMethod(title, description || '');
      console.log(`🎯 Intent: ${result.type}`);
      console.log(`   Confidence: ${result.confidence}`);
      console.log(`   Domain: ${result.context.domain}`);
      console.log(`   Complexity: ${result.context.complexity}`);
      
    } else if (cmdPath === 'tasks.get') {
      // rapid get task-id
      const [taskId] = params;
      if (!taskId) {
        console.error('❌ Task ID required: rapid get task-123');
        return;
      }
      
      result = await sdkMethod(taskId);
      if (!result) {
        console.error(`❌ Task not found: ${taskId}`);
        return;
      }
      
      console.log(`📋 Task: ${result.id}`);
      console.log(`   Intent: ${result.intent.type}`);
      console.log(`   Status: ${result.metadata.status}`);
      console.log(`   Created: ${result.metadata.created}`);
      
    } else if (cmdPath === 'memory.search') {
      // rapid search "query"
      const [query] = params;
      if (!query) {
        console.error('❌ Query required: rapid search "search term"');
        return;
      }
      
      result = await sdkMethod(query);
      console.log(`🔍 Search: "${query}"`);
      console.log(`   Results: ${result.results.length} (placeholder)`);
      
    } else if (cmdPath === 'utils.demo') {
      // rapid demo
      console.log('🎭 Running Kingly demo...');
      result = await sdkMethod();
      console.log(`✅ Demo completed - created task with intent: ${result.task.intent_type}`);
      
    } else if (cmdPath === 'utils.health') {
      // rapid health
      result = sdkMethod();
      console.log('🏥 Health Check:');
      console.log(`   Status: ${result.status}`);
      console.log(`   Features:`);
      Object.entries(result.features).forEach(([feature, status]) => {
        console.log(`     ${feature}: ${status}`);
      });
      
    } else {
      // Generic method call
      result = await sdkMethod(...params);
      console.log('Result:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
  }
}

main();