/**
 * Test Research Modes - Demonstrates different research adapter configurations
 */

import { MCPToolHandlers } from '../src/mcp-tool-handlers.js';

async function testResearchModes() {
  console.log('🔬 Testing Research Adapter Modes\n');
  
  // Test 1: Default mode (MCP instruction)
  console.log('1️⃣ DEFAULT MODE: Perplexity via MCP');
  const handlers1 = new MCPToolHandlers({
    confidenceConfigPath: './config/confidence-thresholds.yaml'
  });
  await handlers1.initialize();
  
  // Create low confidence task
  const task1 = await handlers1.handleCreateTask({
    title: 'Implement blockchain integration',
    description: 'Add Web3 wallet connectivity'
  });
  
  // Extract task ID from message
  const taskId1 = task1.message.match(/ID: ([^)]+)/)?.[1];
  
  const assessment1 = await handlers1.handleAssessTaskConfidence({
    taskId: taskId1,
    confidence: 0.4,  // Very low!
    factors: { complexity: 'high', experience: 'none' }
  });
  
  console.log('Research type:', assessment1.research?.response?.type);
  console.log('Requires MCP call:', assessment1.research?.response?.type === 'mcp_instruction');
  console.log('');
  
  // Test 2: Background mode
  console.log('2️⃣ BACKGROUND MODE: Non-blocking research');
  
  // Update config for background
  process.env.KINGLY_RESEARCH_BACKGROUND = 'true';
  const handlers2 = new MCPToolHandlers({
    confidenceConfigPath: './config/confidence-thresholds.yaml'
  });
  await handlers2.initialize();
  
  const task2 = await handlers2.handleCreateTask({
    title: 'Optimize database queries',
    description: 'Improve query performance'
  });
  
  const taskId2 = task2.message.match(/ID: ([^)]+)/)?.[1];
  
  const assessment2 = await handlers2.handleAssessTaskConfidence({
    taskId: taskId2,
    confidence: 0.65,  // Below threshold
    factors: { complexity: 'medium' }
  });
  
  console.log('Research type:', assessment2.research?.response?.type);
  console.log('Ticket ID:', assessment2.research?.response?.ticketId);
  console.log('Can continue working:', assessment2.research?.response?.type === 'background_research');
  console.log('');
  
  // Test 3: Mock mode (for testing)
  console.log('3️⃣ MOCK MODE: Instant results for testing');
  
  process.env.KINGLY_RESEARCH_PROVIDER = 'mock';
  delete process.env.KINGLY_RESEARCH_BACKGROUND;
  
  const handlers3 = new MCPToolHandlers({
    confidenceConfigPath: './config/confidence-thresholds.yaml'
  });
  await handlers3.initialize();
  
  const task3 = await handlers3.handleCreateTask({
    title: 'Add user authentication',
    description: 'OAuth2 integration'
  });
  
  const taskId3 = task3.message.match(/ID: ([^)]+)/)?.[1];
  
  const assessment3 = await handlers3.handleAssessTaskConfidence({
    taskId: taskId3,
    confidence: 0.6,
    factors: { complexity: 'medium' }
  });
  
  console.log('Research type:', assessment3.research?.response?.type);
  console.log('Confidence boosted:', assessment3.task.confidence > 0.6);
  console.log('');
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESEARCH MODE COMPARISON\n');
  console.log('MCP Mode: User must call Perplexity (blocking)');
  console.log('Background: Research runs async (non-blocking)');
  console.log('Mock Mode: Instant results for development');
  console.log('\n💡 Configure via environment:');
  console.log('KINGLY_RESEARCH_PROVIDER=perplexity-api');
  console.log('KINGLY_RESEARCH_BACKGROUND=true');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testResearchModes().catch(console.error);