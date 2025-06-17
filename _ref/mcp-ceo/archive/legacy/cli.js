#!/usr/bin/env node
/**
 * MCP-CEO CLI - Direct access to tool handlers
 * Bypasses MCP protocol for testing and automation
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Prevent server from starting when we import it
process.argv.push('--cli-mode');

// Now import the server
import { toolImplementations } from './server.js';

// Parse command line arguments
const args = process.argv.slice(2).filter(arg => arg !== '--cli-mode');
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
MCP-CEO CLI - Direct Tool Access

Usage:
  node cli.js <command> [options]
  echo '{"key": "value"}' | node cli.js <command>
  node cli.js <command> --file input.json

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

Examples:
  # Simple text
  node cli.js analyze "How to reduce stress?"
  
  # Complex input via file
  node cli.js analyze --file ./challenge.json
  
  # Start workflow
  node cli.js workflow deep_analysis
  
  # Continue workflow
  node cli.js workflow deep_analysis 2 --session abc123
  
  # JSON input via stdin
  echo '{"challenge": "Scale my startup", "context": {"urgency": "high"}}' | node cli.js analyze
`);
  process.exit(0);
}

// Get input data from various sources
function getInputData() {
  let inputData = {};
  
  // Check for file input
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
  // Check for stdin
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
  // Check for text argument
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
    const inputData = getInputData();
    const pretty = args.includes('--pretty');
    const raw = args.includes('--raw');
    
    let result;
    
    switch (command) {
      case 'analyze':
        result = await toolImplementations.architect_of_abundance(inputData);
        break;
        
      case 'bootstrap':
        result = await toolImplementations.bootstrap_assessment(inputData);
        break;
        
      case 'workflow': {
        const workflowType = args[1];
        if (!workflowType) {
          console.error('Error: workflow command requires a type');
          console.error('Example: node cli.js workflow deep_analysis');
          process.exit(1);
        }
        
        const step = parseInt(args[2]) || 1;
        const sessionIndex = args.indexOf('--session');
        const session = sessionIndex !== -1 ? args[sessionIndex + 1] : null;
        
        const workflowData = {
          ...inputData,
          workflow_request: {
            type: workflowType,
            step: step,
            ...(session && { session_id: session })
          }
        };
        
        result = await toolImplementations.architect_of_abundance(workflowData);
        break;
      }
        
      case 'list':
        result = await toolImplementations.list_workflows();
        break;
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    // Output result
    if (raw) {
      // Output full result object
      if (pretty) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(JSON.stringify(result));
      }
    } else {
      // Output just the text content
      const text = result.content?.[0]?.text || 'No response';
      console.log(text);
      
      // If there's metadata (like session info), show it to stderr
      if (result.metadata?.workflow) {
        console.error('\n---');
        console.error(`Session: ${result.metadata.workflow.session_id}`);
        console.error(`Next step: ${result.metadata.workflow.next_step}`);
        if (!result.metadata.workflow.completed) {
          console.error(`\nTo continue: node cli.js workflow ${result.metadata.workflow.type} ${result.metadata.workflow.next_step} --session ${result.metadata.workflow.session_id}`);
        }
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();