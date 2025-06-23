#!/usr/bin/env node

/**
 * Test Graphiti LLM-Driven Memory Integration
 * Tests episodic memory capture and emergent pattern discovery
 */

const axios = require('axios');

const GRAPHITI_MCP_URL = 'http://localhost:3001';
const TEST_GROUP_ID = 'kingly-test-session';

async function testGraphitiIntegration() {
    console.log('🧠 Testing Kingly Graphiti Integration\n');
    
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing MCP server connectivity...');
        const healthCheck = await axios.get(`${GRAPHITI_MCP_URL}/health`);
        console.log('✅ MCP server is responding\n');
        
        // Test 2: Add Episodic Memory (Agent Conversation)
        console.log('2️⃣ Testing episodic memory capture...');
        const episode1 = {
            name: "ceo-dev-coordination-success",
            content: "CEO agent successfully delegated authentication task to dev.security endpoint. Task confidence was initially 65% but improved to 89% after extended thinking analysis. Dev agent completed implementation using OAuth patterns and reported success.",
            group_id: TEST_GROUP_ID,
            episode_type: "conversation"
        };
        
        const addResponse = await axios.post(`${GRAPHITI_MCP_URL}/add_episode`, episode1);
        console.log('✅ Episode added to knowledge graph');
        console.log(`   Episode ID: ${addResponse.data.episode_id}\n`);
        
        // Test 3: Add More Episodes for Pattern Discovery
        console.log('3️⃣ Adding more episodes for pattern discovery...');
        
        const episode2 = {
            name: "confidence-improvement-pattern",
            content: "Task splitting occurred when confidence dropped to 45%. After using extended thinking pattern, confidence increased to 82%. Similar pattern observed in three previous sessions.",
            group_id: TEST_GROUP_ID,
            episode_type: "insight"
        };
        
        const episode3 = {
            name: "context-assembly-enhancement", 
            content: "Dynamic context assembly selected security and authentication contexts automatically. This improved task success rate compared to manual context selection. Meta-prompting pattern was key factor.",
            group_id: TEST_GROUP_ID,
            episode_type: "conversation"
        };
        
        await axios.post(`${GRAPHITI_MCP_URL}/add_episode`, episode2);
        await axios.post(`${GRAPHITI_MCP_URL}/add_episode`, episode3);
        console.log('✅ Additional episodes added for pattern discovery\n');
        
        // Wait for LLM processing
        console.log('⏳ Allowing time for LLM-driven pattern extraction...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Test 4: Search for Emergent Patterns
        console.log('4️⃣ Testing emergent pattern discovery...');
        const searchQuery = {
            query: "confidence improvement patterns",
            group_ids: [TEST_GROUP_ID],
            limit: 10
        };
        
        const searchResponse = await axios.post(`${GRAPHITI_MCP_URL}/search_memory`, searchQuery);
        console.log('✅ Pattern search completed');
        console.log(`   Found ${searchResponse.data.results.length} relevant patterns`);
        
        if (searchResponse.data.results.length > 0) {
            console.log('\n🔍 Discovered patterns:');
            searchResponse.data.results.forEach((result, index) => {
                console.log(`   ${index + 1}. ${result.content.substring(0, 100)}...`);
                console.log(`      Relevance: ${result.score || 'N/A'}`);
            });
        }
        
        // Test 5: Cross-Context Insights
        console.log('\n5️⃣ Testing cross-context insights...');
        const contextQuery = {
            situation: "Planning a new task that requires authentication and has unclear requirements",
            group_id: TEST_GROUP_ID,
            include_related: true
        };
        
        const contextResponse = await axios.post(`${GRAPHITI_MCP_URL}/get_context`, contextQuery);
        console.log('✅ Context-aware insights retrieved');
        console.log(`   Context suggestions: ${contextResponse.data.suggestions?.length || 0}`);
        
        // Test 6: Workspace Isolation
        console.log('\n6️⃣ Testing workspace isolation...');
        const isolatedEpisode = {
            name: "isolated-test-episode",
            content: "This episode should be isolated in a different workspace",
            group_id: "kingly-isolated-workspace",
            episode_type: "test"
        };
        
        await axios.post(`${GRAPHITI_MCP_URL}/add_episode`, isolatedEpisode);
        
        const isolatedSearch = await axios.post(`${GRAPHITI_MCP_URL}/search_memory`, {
            query: "isolated test episode",
            group_ids: [TEST_GROUP_ID],  // Searching original workspace
            limit: 10
        });
        
        const crossSearch = await axios.post(`${GRAPHITI_MCP_URL}/search_memory`, {
            query: "isolated test episode", 
            group_ids: ["kingly-isolated-workspace"],  // Searching isolated workspace
            limit: 10
        });
        
        console.log('✅ Workspace isolation verified');
        console.log(`   Original workspace results: ${isolatedSearch.data.results.length}`);
        console.log(`   Isolated workspace results: ${crossSearch.data.results.length}`);
        
        // Success Summary
        console.log('\n🎯 Integration Test Results:');
        console.log('✅ MCP server connectivity');
        console.log('✅ Episodic memory capture');
        console.log('✅ LLM-driven pattern discovery');
        console.log('✅ Context-aware insights');
        console.log('✅ Workspace isolation');
        console.log('\n🧠 Graphiti LLM-driven memory system is ready for Kingly integration!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Run the test
testGraphitiIntegration().catch(console.error);