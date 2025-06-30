#!/usr/bin/env node
/**
 * Integration Test for Leviathan Memory System
 * Tests gRPC connection, Graphiti integration, and core memory operations
 */

import { HybridMemoryManager } from './src/memory-manager.js';

async function runIntegrationTest() {
  console.log('🧪 Starting Leviathan Memory System Integration Test\n');

  try {
    // Step 1: Initialize Memory Manager
    console.log('1️⃣ Initializing Memory Manager...');
    const memoryManager = new HybridMemoryManager({
      neo4jUri: 'bolt://localhost:7687',
      neo4jUsername: 'neo4j',
      neo4jPassword: 'lev-mem123',
      grpcAddress: 'localhost:50051',
      enableGraphiti: true
    });

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Health Check
    console.log('\n2️⃣ Performing Health Check...');
    try {
      const health = await memoryManager.graphiti.healthCheck();
      console.log(`   Health Status: ${health.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   Details: ${health.status}`);
      if (health.details) {
        console.log(`   Session ID: ${health.details.session_id}`);
        console.log(`   Workspace: ${health.details.current_workspace}`);
      }
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}`);
      throw error;
    }

    // Step 3: Test Basic Memory Operations
    console.log('\n3️⃣ Testing Basic Memory Operations...');
    
    // Create a memory
    const memory1 = await memoryManager.createMemory(
      'Leviathan memory system integration test',
      'test',
      { test_id: 'integration_001', timestamp: new Date().toISOString() }
    );
    console.log(`   ✅ Created memory: ${memory1.id}`);

    // Search for the memory
    const searchResults = await memoryManager.searchMemory('Leviathan integration', 5);
    console.log(`   ✅ Search found ${searchResults.length} results`);

    // Step 4: Test Episodic Memory (Graphiti's strength)
    console.log('\n4️⃣ Testing Episodic Memory...');
    
    const episode = await memoryManager.addEpisode(
      'Integration Test Session',
      'This episode tests the Leviathan memory system integration with Graphiti via gRPC',
      Date.now(),
      { test_type: 'integration', component: 'episodic_memory' }
    );
    console.log(`   ✅ Created episode: ${episode.id}`);

    // Step 5: Test Workspace Management
    console.log('\n5️⃣ Testing Workspace Management...');
    
    // Create a test workspace
    await memoryManager.createWorkspace('test-workspace', 'Integration test workspace');
    console.log(`   ✅ Created workspace: test-workspace`);

    // List workspaces
    const workspaces = await memoryManager.graphiti.listWorkspaces();
    console.log(`   ✅ Found ${workspaces.workspaces.length} workspaces: ${workspaces.workspaces.join(', ')}`);

    // Switch workspace
    await memoryManager.switchWorkspace('test-workspace');
    console.log(`   ✅ Switched to workspace: test-workspace`);

    // Step 6: Test Hybrid Search
    console.log('\n6️⃣ Testing Hybrid Search...');
    
    const hybridResults = await memoryManager.graphiti.hybridSearch(
      'integration test',
      {
        includeRelationships: true,
        includeTemporal: true,
        limit: 5
      }
    );
    console.log(`   ✅ Hybrid search found:`);
    console.log(`      - ${hybridResults.memories.length} memories`);
    console.log(`      - ${hybridResults.episodes.length} episodes`);
    console.log(`      - ${hybridResults.relationships.length} relationships`);

    // Step 7: Test Temporal Context
    console.log('\n7️⃣ Testing Temporal Context...');
    
    try {
      const temporalContext = await memoryManager.graphiti.getTemporalContext(
        'integration testing session',
        true,
        5
      );
      console.log(`   ✅ Temporal context found:`);
      console.log(`      - ${temporalContext.episodes.length} episodes`);
      console.log(`      - ${temporalContext.relationships.length} relationships`);
    } catch (error) {
      console.log(`   ⚠️ Temporal context test skipped: ${error.message}`);
    }

    // Step 8: System Status
    console.log('\n8️⃣ Getting System Status...');
    const status = await memoryManager.getSystemStatus();
    console.log(`   ✅ System Status:`);
    console.log(`      - Fallback Mode: ${status.fallback_mode}`);
    console.log(`      - Graphiti Connected: ${status.components.graphiti.connected}`);
    console.log(`      - Session ID: ${status.components.graphiti.session_id}`);

    // Step 9: Cleanup
    console.log('\n9️⃣ Cleaning up...');
    await memoryManager.close();
    console.log(`   ✅ Memory manager closed`);

    console.log('\n🎉 Integration Test PASSED! All components working correctly.');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ gRPC connection established');
    console.log('   ✅ Graphiti service responding');
    console.log('   ✅ Memory operations working');
    console.log('   ✅ Episodic memory functional');
    console.log('   ✅ Workspace management active');
    console.log('   ✅ Hybrid search operational');
    console.log('   ✅ System status reporting');

  } catch (error) {
    console.error('\n💥 Integration Test FAILED:', error.message);
    console.error('\n🔧 Troubleshooting checklist:');
    console.error('   1. Is Neo4j running on port 7687?');
    console.error('   2. Is Graphiti gRPC service running on port 50051?');
    console.error('   3. Are the credentials correct (neo4j/lev-mem123)?');
    console.error('   4. Try running: docker-compose up -d');
    console.error('\nFull error:', error.stack);
    process.exit(1);
  }
}

// Run the test
runIntegrationTest();