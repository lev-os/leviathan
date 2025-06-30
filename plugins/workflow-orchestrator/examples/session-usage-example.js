#!/usr/bin/env node

/**
 * Session Usage Example
 * 
 * Demonstrates how to use the workflow orchestrator in session mode
 * This shows the REST-like flow where CLI instructs the LLM
 */

import { SessionCLI } from '../src/adapters/cli/session-cli.js';

async function demonstrateSessionWorkflow() {
  console.log('🔬 Session-Based Workflow Orchestrator Demo');
  console.log('============================================\n');
  
  const cli = new SessionCLI({ verbose: true });
  
  try {
    // Step 1: Start a new workflow session
    console.log('📋 STEP 1: Starting new research workflow session');
    console.log('-'.repeat(50));
    
    const session = await cli.execute({
      workflow: 'ultimate-research-workflow',
      input: {
        topic: 'AI workflow orchestration patterns',
        initial_context: 'Modern approaches to bi-directional AI agent orchestration'
      }
    });
    
    console.log(`\\n✅ Session created: ${session.sessionId}`);
    console.log(`📝 Status: ${session.status}`);
    
    // The instruction is displayed automatically by the CLI
    // In real usage, the LLM (Claude) would now:
    // 1. Execute the instruction using real tools (WebSearch, etc.)
    // 2. Save the output to the specified file
    // 3. Call the callback command
    
    console.log('\\n' + '='.repeat(80));
    console.log('🤖 WHAT HAPPENS NEXT (in real usage):');
    console.log('='.repeat(80));
    console.log('1. Claude executes the instruction using WebSearch tool');
    console.log('2. Claude analyzes the results and generates the QnA wizard output');
    console.log('3. Claude saves the analysis to the specified file path');
    console.log('4. Claude calls the callback command to continue the workflow');
    console.log('');
    console.log('Example callback:');
    console.log(`   workflow-orchestrator callback ${session.sessionId} qna-wizard-complete -f "./sessions/{session-path}/step1/00-qna-wizard-discovery.md"`);
    console.log('');
    
    // Simulate what would happen after callback
    console.log('📋 STEP 2: Simulate callback response');
    console.log('-'.repeat(50));
    console.log('In a real scenario, after Claude completes the QnA wizard step,');
    console.log('the CLI would provide the next instruction (discovery phase with 5 parallel searches)');
    console.log('');
    
    // Show session status
    console.log('📋 STEP 3: Check session status');
    console.log('-'.repeat(50));
    await cli.status({ sessionId: session.sessionId });
    
    console.log('\\n📋 STEP 4: List all sessions');
    console.log('-'.repeat(50));
    await cli.status();
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    throw error;
  }
}

// CLI usage examples
function showCLIExamples() {
  console.log('\\n' + '='.repeat(80));
  console.log('📋 CLI USAGE EXAMPLES');
  console.log('='.repeat(80));
  
  console.log(`
🚀 STARTING A WORKFLOW:
   node bin/workflow-orchestrator execute ultimate-research-workflow -i "topic=AI orchestration"

📞 RESPONDING TO INSTRUCTIONS:
   1. Execute the given instruction using real tools
   2. Save output to specified file
   3. Call back: node bin/workflow-orchestrator callback {session-id} {callback-id} -f {output-file}

📊 CHECKING STATUS:
   node bin/workflow-orchestrator status                    # List all sessions
   node bin/workflow-orchestrator status {session-id}       # Specific session

🔄 RESUMING WORK:
   node bin/workflow-orchestrator resume {session-id}       # Resume interrupted session

📚 DISCOVERING WORKFLOWS:
   node bin/workflow-orchestrator list                      # Available workflows
   node bin/workflow-orchestrator info ultimate-research-workflow  # Workflow details
  `);
}

function showDirectoryStructure() {
  console.log('\\n' + '='.repeat(80));
  console.log('📁 SESSION DIRECTORY STRUCTURE');
  console.log('='.repeat(80));
  
  console.log(`
./sessions/
├── ai-orchestration-2024-01-29-7a8b9c/     # Session directory
│   ├── session.yaml                        # Session metadata
│   ├── workflow.yaml                       # Copy of workflow
│   ├── step1/                              # QnA Wizard step
│   │   └── 00-qna-wizard-discovery.md
│   ├── step2/                              # Discovery searches (parallel)
│   │   ├── 00-llm-orchestration-patterns.md
│   │   ├── 01-context-injection-mechanisms.md
│   │   ├── 02-multi-agent-architectures.md
│   │   ├── 03-tool-calling-patterns.md
│   │   └── 04-agent-communication-protocols.md
│   ├── step3/                              # Deep research prompts
│   │   └── 00-deep-research-prompts.md
│   ├── step4/                              # Deep research execution (parallel)
│   │   ├── 00-historical-evolution.md
│   │   ├── 01-implementation-patterns.md
│   │   ├── 02-mechanism-analysis.md
│   │   └── ... (10 total research files)
│   └── step5/                              # Final synthesis
│       └── 00-comprehensive-research-report.md

Each file follows semantic naming: {number}-{descriptive-slug}.md
  `);
}

function showBiDirectionalFlow() {
  console.log('\\n' + '='.repeat(80));
  console.log('🔄 BI-DIRECTIONAL FLOW PATTERN');
  console.log('='.repeat(80));
  
  console.log(`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLM (Claude)  │    │  CLI Orchestr.  │    │  Session Files  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. execute workflow   │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │ 2. instruction +      │                       │
         │    session ID         │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
         │ 3. use real tools     │                       │
         │    (WebSearch, etc.)  │                       │
         │                       │                       │
         │ 4. save output        │                       │
         ├───────────────────────┼──────────────────────▶│
         │                       │                       │
         │ 5. callback complete  │                       │
         ├──────────────────────▶│                       │
         │                       │                       │
         │ 6. next instruction   │                       │
         │◀──────────────────────┤                       │
         │                       │                       │
         │ [cycle continues...]  │                       │

The CLI orchestrates the LLM through context injection,
but the LLM executes all the actual tool calls and research.
  `);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await demonstrateSessionWorkflow();
    showCLIExamples();
    showDirectoryStructure();
    showBiDirectionalFlow();
    
    console.log('\\n🎉 Demo complete! The workflow orchestrator is ready for real usage.');
    console.log('\\n💡 Try running:');
    console.log('   node bin/workflow-orchestrator execute ultimate-research-workflow -i "topic=your research topic"');
    
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

export { demonstrateSessionWorkflow };