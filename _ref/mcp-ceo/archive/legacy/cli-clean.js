#!/usr/bin/env node
/**
 * MCP-CEO CLI - Direct access using ceo-core
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { ArchitectOfAbundanceCEO, loadWorkflows } from './ceo-core.js';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
MCP-CEO CLI - Direct Tool Access

Usage:
  node cli-clean.js <command> [options]
  echo '{"key": "value"}' | node cli-clean.js <command>
  node cli-clean.js <command> --file input.json

Commands:
  analyze [text]           Run architect_of_abundance
  bootstrap [text]         Run bootstrap_assessment  
  workflow <type> [step]   Run workflow (step defaults to 1)
  list                     List available workflows

Options:
  --file <path>           Read input from JSON file
  --session <id>          Continue existing workflow session
  --pretty                Pretty print output
  --raw                   Return raw response (not just text)
  --quiet                 Suppress console logs (only show output)

Examples:
  # Simple text
  node cli-clean.js analyze "How to reduce stress?"
  
  # Complex input via file
  node cli-clean.js analyze --file ./challenge.json
  
  # Start workflow
  node cli-clean.js workflow deep_analysis
  
  # Continue workflow
  node cli-clean.js workflow deep_analysis 2 --session abc123
`);
  process.exit(0);
}

// Suppress console.error if --quiet
if (args.includes('--quiet')) {
  const originalError = console.error;
  console.error = () => {};
}

// Get input data from various sources
function getInputData() {
  let inputData = {};
  
  if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('Error: --file requires a path');
      process.exit(1);
    }
    if (!existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    inputData = JSON.parse(readFileSync(filePath, 'utf8'));
  }
  else if (!process.stdin.isTTY) {
    try {
      const stdinData = readFileSync(0, 'utf8');
      if (stdinData.trim()) {
        inputData = JSON.parse(stdinData);
      }
    } catch (e) {
      console.error('Error parsing stdin JSON:', e.message);
      process.exit(1);
    }
  }
  else if (args.length > 1) {
    const textArgs = args.slice(1).filter(a => !a.startsWith('--'));
    if (textArgs.length > 0) {
      inputData = { challenge: textArgs.join(' ') };
    }
  }
  
  return inputData;
}

// Main execution
async function main() {
  try {
    // Initialize CEO
    const ceo = new ArchitectOfAbundanceCEO();
    await ceo.initialize();
    await loadWorkflows();
    
    const inputData = getInputData();
    const pretty = args.includes('--pretty');
    const raw = args.includes('--raw');
    
    let result;
    
    switch (command) {
      case 'analyze': {
        if (inputData.workflow_request) {
          const { type, session_id, step, previous_results } = inputData.workflow_request;
          const sessionId = session_id || randomUUID();
          result = await ceo.executeWorkflowStep(type, step || 1, sessionId, previous_results);
        } else {
          const processResult = await ceo.processRequest(inputData.challenge || 'What should I focus on?');
          result = {
            content: [{
              type: 'text',
              text: processResult.response
            }],
            metadata: processResult.metadata
          };
        }
        break;
      }
        
      case 'bootstrap': {
        const analysis = ceo.analyzeContext(inputData.scenario || inputData.challenge || 'Bootstrap a new project');
        analysis.bootstrap_requirements = true;
        
        const activePersonalities = ceo.activatePersonalities(analysis);
        if (!activePersonalities.includes('sovereignty_architect')) {
          activePersonalities.push('sovereignty_architect');
        }
        if (!activePersonalities.includes('resilience_guardian')) {
          activePersonalities.push('resilience_guardian');
        }
        
        ceo.activePersonalities = activePersonalities;
        const perspectives = ceo.generatePersonalityPerspectives(inputData.scenario || inputData.challenge, analysis);
        
        let response = `🥾 **Bootstrap Sovereignty Assessment**\n\n`;
        response += `**Scenario**: ${inputData.scenario || inputData.challenge}\n\n`;
        
        if (inputData.current_resources || inputData.resources) {
          response += `**Current Resources**: ${inputData.current_resources || JSON.stringify(inputData.resources)}\n\n`;
        }
        
        response += `**Bootstrap Strategy**:\n\n`;
        response += `**Phase 1 - Minimal Viable System:**\n`;
        response += `• Start with absolute basics: Raspberry Pi + network access\n`;
        response += `• Build core functionality that provides immediate value\n`;
        response += `• Ensure complete independence from external dependencies\n\n`;
        
        response += `**Phase 2 - Sovereignty Establishment:**\n`;
        response += `• Create self-sustaining resource generation loops\n`;
        response += `• Build redundancy and anti-fragile characteristics\n`;
        response += `• Establish community/network effects without dependency\n\n`;
        
        response += `**Phase 3 - Abundance Multiplication:**\n`;
        response += `• Scale successful patterns horizontally\n`;
        response += `• Create systems that work without constant management\n`;
        response += `• Enable others to replicate while maintaining your sovereignty\n\n`;
        
        response += `**Phase 4 - Infinite Coordination:**\n`;
        response += `• Apply same patterns to larger coordination challenges\n`;
        response += `• Scale from local to global to planetary coordination\n`;
        response += `• Maintain principles while expanding scope infinitely\n\n`;
        
        response += `**Constitutional Guarantee**: This approach preserves complete independence, reduces stress at every phase, and scales from minimal resources to infinite coordination while maintaining sovereignty.`;
        
        result = {
          content: [{
            type: 'text',
            text: response
          }]
        };
        break;
      }
        
      case 'workflow': {
        const workflowType = args[1];
        if (!workflowType) {
          console.error('Error: workflow command requires a type');
          console.error('Example: node cli-clean.js workflow deep_analysis');
          process.exit(1);
        }
        
        const step = parseInt(args[2]) || 1;
        const sessionIndex = args.indexOf('--session');
        const session = sessionIndex !== -1 ? args[sessionIndex + 1] : null;
        
        const sessionId = session || randomUUID();
        
        // For step 1, include the challenge from input data
        const previousResults = step === 1 ? 
          { challenge: inputData.challenge || 'No challenge provided' } :
          inputData.previous_results || null;
          
        result = await ceo.executeWorkflowStep(workflowType, step, sessionId, previousResults);
        break;
      }
        
      case 'list': {
        const workflows = ceo.getAvailableWorkflows();
        
        let response = `## Available Multi-Step Workflows\n\n`;
        response += `The Architect of Abundance supports ${workflows.length} structured workflows:\n\n`;
        
        workflows.forEach((workflow, index) => {
          response += `### ${index + 1}. ${workflow.name}\n`;
          response += `**Key**: \`${workflow.key}\`\n`;
          response += `**Steps**: ${workflow.steps}\n`;
          response += `**Description**: ${workflow.description}\n\n`;
        });
        
        result = {
          content: [{
            type: 'text',
            text: response
          }]
        };
        break;
      }
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    // Output result
    if (raw) {
      if (pretty) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(JSON.stringify(result));
      }
    } else {
      const text = result.content?.[0]?.text || 'No response';
      console.log(text);
      
      // If there's metadata (like session info), show it to stderr
      if (result.metadata?.workflow && !args.includes('--quiet')) {
        console.error('\n---');
        console.error(`Session: ${result.metadata.workflow.session_id}`);
        console.error(`Next step: ${result.metadata.workflow.next_step}`);
        if (!result.metadata.workflow.completed) {
          console.error(`\nTo continue: node cli-clean.js workflow ${result.metadata.workflow.type} ${result.metadata.workflow.next_step} --session ${result.metadata.workflow.session_id}`);
        }
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.stack && !args.includes('--quiet')) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();