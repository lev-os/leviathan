#!/usr/bin/env node

import { SessionManager } from './src/session-manager.js';

const sessionManager = new SessionManager();

console.log('Testing simple rollup creation...\n');

try {
  const sessionId = 'simple-test-rollup';
  const result = sessionManager.createRollup(sessionId, {
    context: "Simple test rollup",
    files: ["test.js"],
    decisions: ["Test decision"],
    blockers: [],
    workspace: process.cwd()
  });

  console.log('Result:', result);
} catch (error) {
  console.error('Error details:', error);
  console.error('Stack:', error.stack);
}