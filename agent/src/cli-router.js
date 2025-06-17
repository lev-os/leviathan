#!/usr/bin/env node
/**
 * CLI Router - Entry point for bash → JavaScript hybrid system
 * Converts bash args to JavaScript and routes through HybridRouter
 */

import { HybridRouter } from './hybrid-router.js';
import { pluginLoader } from './plugin-loader.js';
import fs from 'fs';

async function main() {
  try {
    // Get command line arguments (skip node and script name)
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log(JSON.stringify({
        error: "No command provided",
        help: "Run 'kingly help' for available commands"
      }));
      process.exit(1);
    }

    // Initialize plugins and hybrid system
    await pluginLoader.ensureLoaded();
    
    const router = new HybridRouter();
    await router.initialize();
    
    const result = await router.route(args);
    
    // Handle whisper separation
    if (result.whisper) {
      // Save whisper for LLM access
      const whisperFile = '/tmp/kingly-whisper.json';
      await fs.writeFileSync(whisperFile, JSON.stringify(result.whisper, null, 2));
      
      // Remove whisper from main output
      const cleanResult = { ...result };
      delete cleanResult.whisper;
      
      console.log(JSON.stringify(cleanResult, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log(JSON.stringify({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }));
    process.exit(1);
  }
}

main().catch(error => {
  console.log(JSON.stringify({
    error: "CLI Router failed",
    message: error.message
  }));
  process.exit(1);
});