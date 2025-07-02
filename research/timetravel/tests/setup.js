// Global test setup
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.DRY_RUN = 'true';
process.env.LOG_LEVEL = 'error';

// Mock API keys to prevent accidental API calls during testing
process.env.SMITHERY_API_KEY = 'test-smithery-key';
process.env.PERPLEXITY_API_KEY = 'test-perplexity-key';
process.env.TAVILY_API_KEY = 'test-tavily-key';
process.env.BRAVE_API_KEY = 'test-brave-key';
process.env.EXA_API_KEY = 'test-exa-key';
process.env.FIRECRAWL_API_KEY = 'test-firecrawl-key';

// Global test utilities
global.mockApiResponse = (data, status = 200) => ({
  data,
  status,
  headers: {},
  config: {}
});

// Suppress console output during tests unless explicitly testing it
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Restore console for specific tests that need it
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock filesystem operations to use temporary directories
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create a temporary test directory
const testTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'timetravel-test-'));
process.env.TEST_TEMP_DIR = testTempDir;

// Cleanup after all tests
afterAll(() => {
  if (fs.existsSync(testTempDir)) {
    fs.rmSync(testTempDir, { recursive: true, force: true });
  }
});