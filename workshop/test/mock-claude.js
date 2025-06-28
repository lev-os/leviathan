#!/usr/bin/env node

/**
 * Mock Claude executable for testing
 * Simulates the Claude CLI behavior with controllable output
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let promptFile = null;

// Look for -f flag
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-f' && i + 1 < args.length) {
    promptFile = args[i + 1];
    break;
  }
}

// Environment-based behavior control
const behavior = process.env.MOCK_CLAUDE_BEHAVIOR || 'success';
const delay = parseInt(process.env.MOCK_CLAUDE_DELAY || '100');

// Helper to write output with delay
const writeOutput = (text) => {
  return new Promise(resolve => {
    setTimeout(() => {
      process.stdout.write(text);
      resolve();
    }, delay);
  });
};

// Main execution
async function main() {
  if (!promptFile) {
    console.error('Error: No prompt file provided. Use -f <file>');
    process.exit(1);
  }

  try {
    // Read the prompt file
    const prompt = fs.readFileSync(promptFile, 'utf8');
    
    // Simulate different behaviors
    switch (behavior) {
      case 'success':
        // Simulate successful repository analysis
        await writeOutput('Starting repository analysis...\n');
        await writeOutput('[ANALYZING] Reading tracker.txt\n');
        await writeOutput('[FOUND] 71 repositories in intake directory\n');
        await writeOutput('[PROCESSING] Repository: example-repo\n');
        await writeOutput('  - Architecture: MCP-compatible\n');
        await writeOutput('  - Tools: 5 MCP tools found\n');
        await writeOutput('  - Integration effort: 2 weeks\n');
        await writeOutput('[COMPLETE] Analysis saved to tmp/example-repo-analysis.md\n');
        process.exit(0);
        break;
        
      case 'error':
        // Simulate an error
        await writeOutput('Starting analysis...\n');
        console.error('Error: Failed to access intake directory');
        process.exit(1);
        break;
        
      case 'timeout':
        // Simulate a timeout/hang
        await writeOutput('Starting analysis...\n');
        await writeOutput('Processing...\n');
        // Hang indefinitely
        await new Promise(() => {});
        break;
        
      case 'stream':
        // Simulate continuous streaming output
        await writeOutput('Starting continuous analysis...\n');
        let count = 0;
        const interval = setInterval(async () => {
          await writeOutput(`[${new Date().toISOString()}] Analyzing repository ${count++}\n`);
          if (count > 10) {
            clearInterval(interval);
            process.exit(0);
          }
        }, 500);
        break;
        
      case 'empty':
        // Exit without output
        process.exit(0);
        break;
        
      default:
        console.error(`Unknown behavior: ${behavior}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error reading prompt file: ${error.message}`);
    process.exit(1);
  }
}

// Handle signals
process.on('SIGTERM', () => {
  console.log('\n[MOCK-CLAUDE] Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[MOCK-CLAUDE] Received SIGINT, shutting down...');
  process.exit(0);
});

// Run main
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});