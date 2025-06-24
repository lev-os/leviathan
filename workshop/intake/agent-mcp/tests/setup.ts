// Global test setup
import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

declare global {
  var testTempDir: string;
}

beforeAll(async () => {
  // Create a temporary directory for all tests
  global.testTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-mcp-test-'));
  console.log(`Test temp directory: ${global.testTempDir}`);
});

afterAll(async () => {
  // Clean up the temporary directory
  if (global.testTempDir) {
    try {
      await fs.rm(global.testTempDir, { recursive: true, force: true });
      console.log(`Cleaned up test temp directory: ${global.testTempDir}`);
    } catch (error) {
      console.warn(`Failed to clean up test directory: ${error}`);
    }
  }
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true';

// Mock console.error in tests to avoid noise, but allow console.log for debugging
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});
