#!/usr/bin/env node

/**
 * Simple Neo4j + Graphiti Connection Test
 * Just test if we can connect to Neo4j with Graphiti
 */

async function testSimpleConnection() {
  console.log('🔌 Testing basic Neo4j + Graphiti connection...\n');
  
  try {
    // First check if graphiti-core is available
    console.log('📦 Checking if graphiti-core is installed...');
    
    const { GraphitiClient } = await import('graphiti-core');
    console.log('✅ Graphiti-core imported successfully');
    
    // Initialize Graphiti client
    console.log('🔗 Connecting to Neo4j...');
    const graphiti = new GraphitiClient({
      neo4j_uri: "bolt://localhost:7687",
      neo4j_username: "neo4j",
      neo4j_password: "lev-mem123",
      enable_mcp: true,
      enable_temporal: true
    });
    
    await graphiti.connect();
    console.log('✅ Connected to Neo4j successfully!');
    
    // Test basic operation
    console.log('🧪 Testing basic memory operation...');
    await graphiti.create_memory({
      content: "Test connection from Leviathan memory system",
      type: "connection_test",
      metadata: {
        timestamp: new Date().toISOString(),
        test_id: "neo4j-connection-test"
      }
    });
    console.log('✅ Memory creation successful!');
    
    // Search for the memory we just created
    console.log('🔍 Testing memory search...');
    const results = await graphiti.search("Test connection");
    console.log(`✅ Found ${results.length} matching memories`);
    
    // Close connection
    await graphiti.close();
    console.log('🔌 Connection closed cleanly');
    
    console.log('\n🎉 SUCCESS: Neo4j + Graphiti is working perfectly!');
    console.log('📝 Next: The Leviathan memory system can use this connection');
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    
    if (error.message.includes('graphiti-core')) {
      console.log('\n📦 Install Graphiti:');
      console.log('   pip install graphiti-core');
    } else if (error.message.includes('authentication') || error.message.includes('credentials')) {
      console.log('\n🔑 Authentication issue:');
      console.log('   • Check Neo4j Desktop database is running');
      console.log('   • Verify credentials: neo4j/lev-mem123');
      console.log('   • Try connecting via Neo4j Browser first');
    } else if (error.message.includes('connection')) {
      console.log('\n🔌 Connection issue:');
      console.log('   • Make sure Neo4j Desktop database is started');
      console.log('   • Check if ports are correct (7687 for bolt)');
      console.log('   • Verify database "lev-mem" is running');
    }
    
    console.log('\nFull error:', error.stack);
  }
}

// Run the test
testSimpleConnection();