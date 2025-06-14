/**
 * Kingly Core Agent - Unified System Entry Point
 * 
 * CONSOLIDATION: Complete unification of mcp-ceo + mcp-mvp + core/agent
 * ARCHITECTURE: FlowMind Constitutional Framework + EEPS + Proven MCP
 * 
 * This unified system provides:
 * - FlowMind Universal Context Class (LLM-first architecture)
 * - EEPS Personality System (8 agent types)
 * - Proven MCP server with semantic search
 * - 100+ unified contexts (agents, workflows, patterns, tools)
 * - Constitutional Framework principles
 */

import { FlowMind, FlowMindFactory } from './flowmind/index.js';
import { SemanticLookup } from './mcp/semantic-lookup.js';
import { WorkflowLoader } from './mcp/workflow-loader.js';

console.log('🧠 Kingly Core Agent - FlowMind Constitutional Framework');
console.log('🤖 EEPS Personality System Ready');
console.log('🔍 Semantic Context Discovery Enabled');
console.log('⚡ LLM-First Architecture Active');

export {
  FlowMind,
  FlowMindFactory,
  SemanticLookup,
  WorkflowLoader
};

// Main execution for direct node invocation
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('\n🚀 Kingly Core Agent System Initialized');
  console.log('📁 Contexts loaded from: ./contexts');
  console.log('🎯 Constitutional Framework: Everything is a Context');
  console.log('💫 Bidirectional Intelligence: LLM ↔ FlowMind Context System');
  
  // Quick system status check
  const loader = new WorkflowLoader();
  try {
    await loader.ensureLoaded();
    const contexts = await loader.loadAll();
    console.log(`✅ ${contexts.length} contexts available for LLM orchestration`);
    
    const types = await loader.getAvailableTypes();
    console.log(`📋 Context types: ${types.join(', ')}`);
    
    console.log('\n🎭 EEPS Agents Ready:');
    const eepsAgents = contexts.filter(c => c.category === 'agents' && c.filePath.includes('/eeps/'));
    eepsAgents.forEach(agent => {
      console.log(`  • ${agent.slug} - ${agent.description}`);
    });
    
  } catch (error) {
    console.error('❌ System initialization error:', error.message);
  }
}