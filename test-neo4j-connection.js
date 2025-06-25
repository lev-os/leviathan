#!/usr/bin/env node

/**
 * Test Neo4j + Graphiti Connection
 * Verify the memory system can connect to Neo4j with Graphiti
 */

const { HybridMemoryManager } = require('./packages/memory/src/memory-manager.js');

async function testConnection() {
  console.log('🔌 Testing Neo4j + Graphiti connection...\n');
  
  try {
    // Initialize memory manager with Neo4j credentials
    const memory = new HybridMemoryManager({
      neo4jUri: "bolt://localhost:7687",
      neo4jUsername: "neo4j", 
      neo4jPassword: "lev-mem123",
      enableGraphiti: true
    });

    console.log('✅ Memory manager initialized');
    
    // Get system status
    console.log('📊 Checking system status...');
    const status = await memory.getSystemStatus();
    console.log(JSON.stringify(status, null, 2));
    
    if (status.components.graphiti.connected) {
      console.log('\n🎉 SUCCESS: Neo4j + Graphiti connection working!');
      
      // Test basic memory operation
      console.log('\n🧠 Testing basic memory operation...');
      await memory.semantic.store({
        concept: 'neo4j-test',
        definition: 'Test connection to Neo4j database',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Memory store operation successful');
      
    } else {
      console.log('\n❌ FAILED: Could not connect to Neo4j');
      console.log('Fallback mode enabled:', status.fallback_mode);
    }
    
    // Cleanup
    await memory.close();
    console.log('\n🔧 Connection closed cleanly');
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    console.error('Stack:', error.stack);
    
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure Neo4j Desktop is running');
    console.log('2. Verify database "lev-mem" is started');
    console.log('3. Check credentials: neo4j/lev-mem123');
    console.log('4. Ensure Graphiti is installed: pip install graphiti-core');
  }
}

// Run the test
testConnection();