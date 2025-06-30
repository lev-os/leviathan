#!/usr/bin/env node

/**
 * Neo4j Desktop Connection Test
 * Verify your Neo4j Desktop is ready for the memory system
 */

import neo4j from 'neo4j-driver';
import chalk from 'chalk';

async function testNeo4jDesktop() {
  console.log(chalk.blue.bold('🔍 Testing Neo4j Desktop Connection\n'));
  
  // Configuration from auto-detection
  const config = {
    uri: 'bolt://localhost:7687',
    username: 'neo4j',
    password: 'lev-mem123' // Update this with your password
  };
  
  const driver = neo4j.driver(
    config.uri,
    neo4j.auth.basic(config.username, config.password)
  );
  
  try {
    // Test connection
    console.log(chalk.yellow('Connecting to Neo4j Desktop...'));
    const session = driver.session();
    
    // Simple test query
    const result = await session.run('RETURN 1 as test');
    console.log(chalk.green('✅ Connected successfully!\n'));
    
    // Create memory schema
    console.log(chalk.yellow('Setting up memory schema...'));
    
    // Create constraints and indexes for memory system
    const schemaCommands = [
      // Memory node constraint
      `CREATE CONSTRAINT memory_id IF NOT EXISTS 
       FOR (m:Memory) REQUIRE m.id IS UNIQUE`,
      
      // Session node constraint  
      `CREATE CONSTRAINT session_id IF NOT EXISTS
       FOR (s:Session) REQUIRE s.id IS UNIQUE`,
      
      // Agent node constraint
      `CREATE CONSTRAINT agent_id IF NOT EXISTS
       FOR (a:Agent) REQUIRE a.id IS UNIQUE`,
      
      // Create indexes for common queries
      `CREATE INDEX memory_type IF NOT EXISTS FOR (m:Memory) ON (m.type)`,
      `CREATE INDEX memory_timestamp IF NOT EXISTS FOR (m:Memory) ON (m.timestamp)`,
      `CREATE INDEX session_timestamp IF NOT EXISTS FOR (s:Session) ON (s.timestamp)`
    ];
    
    for (const command of schemaCommands) {
      try {
        await session.run(command);
        console.log(chalk.gray(`  ✓ ${command.split(' ')[2]} created`));
      } catch (e) {
        if (e.message.includes('already exists')) {
          console.log(chalk.gray(`  ✓ ${command.split(' ')[2]} already exists`));
        } else {
          console.log(chalk.red(`  ✗ Failed: ${e.message}`));
        }
      }
    }
    
    // Test creating a memory
    console.log(chalk.yellow('\n📝 Creating test memory...'));
    
    const testMemory = await session.run(`
      CREATE (m:Memory {
        id: randomUUID(),
        type: 'test',
        content: 'Neo4j Desktop integration successful',
        timestamp: datetime(),
        source: 'neo4j-test',
        version: '1.0.0'
      })
      RETURN m
    `);
    
    const memory = testMemory.records[0].get('m');
    console.log(chalk.green('✅ Test memory created!'));
    console.log(chalk.gray(`   ID: ${memory.properties.id}`));
    console.log(chalk.gray(`   Type: ${memory.properties.type}`));
    console.log(chalk.gray(`   Content: ${memory.properties.content}`));
    
    // Query test
    console.log(chalk.yellow('\n🔍 Testing query...'));
    const queryResult = await session.run(`
      MATCH (m:Memory {type: 'test'})
      RETURN count(m) as count
    `);
    
    const count = queryResult.records[0].get('count').toNumber();
    console.log(chalk.green(`✅ Found ${count} test memories`));
    
    // Cleanup
    console.log(chalk.yellow('\n🧹 Cleaning up test data...'));
    await session.run(`
      MATCH (m:Memory {type: 'test'})
      DELETE m
    `);
    console.log(chalk.green('✅ Test data cleaned up'));
    
    await session.close();
    
    // Summary
    console.log(chalk.green.bold('\n🎉 Neo4j Desktop is ready for Leviathan Memory System!'));
    console.log(chalk.cyan('\nYour setup:'));
    console.log(chalk.white(`  • Neo4j URI: ${config.uri}`));
    console.log(chalk.white(`  • Username: ${config.username}`));
    console.log(chalk.white(`  • Schema: Ready`));
    console.log(chalk.white(`  • Connection: Verified`));
    
  } catch (error) {
    console.error(chalk.red('❌ Connection failed:'), error.message);
    
    if (error.message.includes('authentication')) {
      console.log(chalk.yellow('\n💡 Fix: Update the password in this script'));
      console.log(chalk.gray('   Line 17: password: \'your-actual-password\''));
    } else if (error.message.includes('ServiceUnavailable')) {
      console.log(chalk.yellow('\n💡 Fix: Start Neo4j Desktop'));
      console.log(chalk.gray('   1. Open Neo4j Desktop'));
      console.log(chalk.gray('   2. Start your database'));
      console.log(chalk.gray('   3. Run this script again'));
    }
  } finally {
    await driver.close();
  }
}

// Run the test
testNeo4jDesktop();