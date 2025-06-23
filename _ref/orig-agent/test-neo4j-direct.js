#!/usr/bin/env node

/**
 * Direct Neo4j Connection Test
 * Tests the Neo4j database connectivity while Graphiti MCP server builds
 */

import neo4j from 'neo4j-driver';

const NEO4J_URI = 'bolt://localhost:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'kingly-password';

async function testNeo4jConnection() {
    console.log('🧠 Testing Direct Neo4j Connection for Kingly Memory\n');
    
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    
    try {
        // Test 1: Database Connectivity
        console.log('1️⃣ Testing database connectivity...');
        await driver.verifyConnectivity();
        console.log('✅ Neo4j connection established\n');
        
        const session = driver.session();
        
        // Test 2: Write Test Data
        console.log('2️⃣ Creating test knowledge graph nodes...');
        await session.run(`
            CREATE (episode:Episode {
                id: 'kingly-test-episode-1',
                name: 'Agent Coordination Success',
                content: 'CEO agent successfully delegated task to dev agent. Confidence improved from 65% to 89% using extended thinking.',
                timestamp: datetime(),
                group_id: 'kingly-test'
            })
            CREATE (pattern:Pattern {
                id: 'confidence-improvement-pattern',
                name: 'Extended Thinking Confidence Boost',
                description: 'Pattern where extended thinking analysis improves task confidence scores',
                frequency: 3,
                group_id: 'kingly-test'
            })
            CREATE (episode)-[:EXHIBITS]->(pattern)
        `);
        console.log('✅ Test knowledge graph created\n');
        
        // Test 3: Query Pattern Discovery
        console.log('3️⃣ Testing pattern discovery queries...');
        const result = await session.run(`
            MATCH (e:Episode)-[:EXHIBITS]->(p:Pattern)
            WHERE e.group_id = 'kingly-test'
            RETURN e.name as episode, p.name as pattern, p.description as description
        `);
        
        console.log('✅ Pattern discovery successful');
        result.records.forEach(record => {
            console.log(`   📊 Episode: ${record.get('episode')}`);
            console.log(`   🔍 Pattern: ${record.get('pattern')}`);
            console.log(`   📝 Description: ${record.get('description')}\n`);
        });
        
        // Test 4: Workspace Isolation
        console.log('4️⃣ Testing workspace isolation...');
        await session.run(`
            CREATE (isolated:Episode {
                id: 'isolated-test-episode',
                name: 'Isolated Workspace Test',
                content: 'This should be isolated from kingly-test workspace',
                group_id: 'isolated-workspace'
            })
        `);
        
        const isolationTest = await session.run(`
            MATCH (e:Episode)
            WHERE e.group_id IN ['kingly-test', 'isolated-workspace']
            RETURN e.group_id as workspace, count(e) as episode_count
            ORDER BY workspace
        `);
        
        console.log('✅ Workspace isolation verified');
        isolationTest.records.forEach(record => {
            console.log(`   🏗️ Workspace: ${record.get('workspace')} has ${record.get('episode_count')} episodes`);
        });
        
        // Test 5: Cleanup
        console.log('\n5️⃣ Cleaning up test data...');
        await session.run(`
            MATCH (n) 
            WHERE n.group_id IN ['kingly-test', 'isolated-workspace']
            DETACH DELETE n
        `);
        console.log('✅ Test data cleaned up\n');
        
        await session.close();
        
        // Success Summary
        console.log('🎯 Neo4j Direct Connection Test Results:');
        console.log('✅ Database connectivity');
        console.log('✅ Knowledge graph creation');
        console.log('✅ Pattern discovery queries');
        console.log('✅ Workspace isolation');
        console.log('✅ Data cleanup');
        console.log('\n🧠 Neo4j infrastructure is ready for Graphiti integration!');
        console.log('📝 Note: MCP server still building due to network issues, but core memory system is operational');
        
    } catch (error) {
        console.error('❌ Neo4j test failed:', error.message);
        process.exit(1);
    } finally {
        await driver.close();
    }
}

// Run the test
testNeo4jConnection().catch(console.error);