const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

describe('End-to-End Research Workflow', () => {
  const testTempDir = process.env.TEST_TEMP_DIR;
  const testConfigPath = path.join(testTempDir, 'test-research-plan.yaml');
  const testOutputDir = path.join(testTempDir, 'outputs');

  beforeAll(async () => {
    // Create test configuration
    const testConfig = `
research_plan:
  name: "e2e-test-research"
  schedule: "0 9 * * *"
  sources:
    - type: "arxiv"
      name: "AI Research Test"
      categories: ["cs.AI"]
      keywords: ["machine learning"]
      max_results: 5
  monitoring:
    output_dir: "${testOutputDir}"
    memory_integration: false
    personality: "sovereignty_architect"
    horizons: ["6mo"]
`;

    await fs.writeFile(testConfigPath, testConfig);
    await fs.mkdir(testOutputDir, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup is handled by global setup
  });

  describe('Research Plan Execution', () => {
    test('should execute research plan in dry-run mode', async () => {
      const { stdout, stderr } = await execAsync(
        `node src/research-plan-engine.js dry-run "${testConfigPath}"`,
        { 
          cwd: process.cwd(),
          env: { ...process.env, DRY_RUN: 'true' }
        }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Research plan executed successfully');
      expect(stdout).toContain('dry_run: true');
    });

    test('should validate research plan configuration', async () => {
      // Create invalid config
      const invalidConfigPath = path.join(testTempDir, 'invalid-config.yaml');
      const invalidConfig = `
research_plan:
  name: "invalid-test"
  # Missing required fields
`;

      await fs.writeFile(invalidConfigPath, invalidConfig);

      try {
        await execAsync(
          `node src/research-plan-engine.js dry-run "${invalidConfigPath}"`,
          { cwd: process.cwd() }
        );
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.stdout || error.stderr).toContain('Configuration validation failed');
      }
    });

    test('should create output directory and files', async () => {
      await execAsync(
        `node src/research-plan-engine.js dry-run "${testConfigPath}"`,
        { 
          cwd: process.cwd(),
          env: { ...process.env, DRY_RUN: 'true' }
        }
      );

      // Check that output directory exists
      const outputStats = await fs.stat(testOutputDir);
      expect(outputStats.isDirectory()).toBe(true);

      // Check for expected output files (in dry-run mode, these might be mock files)
      const outputFiles = await fs.readdir(testOutputDir);
      expect(outputFiles.length).toBeGreaterThan(0);
    });
  });

  describe('CLI Interface', () => {
    test('should display help information', async () => {
      const { stdout } = await execAsync(
        'node src/cli/index.js --help',
        { cwd: process.cwd() }
      );

      expect(stdout).toContain('TimeTravel Research CLI');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('research');
      expect(stdout).toContain('status');
      expect(stdout).toContain('config');
    });

    test('should execute research via CLI', async () => {
      const { stdout, stderr } = await execAsync(
        `node src/cli/index.js research --topic "test topic" --personality sovereignty_architect --dry-run`,
        { 
          cwd: process.cwd(),
          env: { ...process.env, DRY_RUN: 'true' }
        }
      );

      expect(stderr).toBe('');
      expect(stdout).toContain('Research completed');
      expect(stdout).toContain('sovereignty_architect');
    });

    test('should show system status via CLI', async () => {
      const { stdout } = await execAsync(
        'node src/cli/index.js status',
        { cwd: process.cwd() }
      );

      expect(stdout).toContain('TimeTravel System Status');
      expect(stdout).toContain('Research Engine');
      expect(stdout).toContain('API Health');
    });
  });

  describe('API Server Integration', () => {
    let serverProcess;
    const serverPort = 3001; // Use different port for testing

    beforeAll(async () => {
      // Start API server for testing
      const { spawn } = require('child_process');
      serverProcess = spawn('node', ['src/api/server.js'], {
        env: { 
          ...process.env, 
          PORT: serverPort,
          NODE_ENV: 'test',
          DRY_RUN: 'true'
        },
        stdio: 'pipe'
      });

      // Wait for server to start
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    afterAll(async () => {
      if (serverProcess) {
        serverProcess.kill();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });

    test('should respond to health check', async () => {
      const response = await fetch(`http://localhost:${serverPort}/health`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String)
      });
    });

    test('should execute research via API', async () => {
      const researchRequest = {
        topic: 'artificial intelligence',
        personality: 'sovereignty_architect',
        horizon: '6mo',
        dry_run: true
      };

      const response = await fetch(`http://localhost:${serverPort}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(researchRequest)
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        status: expect.any(String),
        results: expect.any(Object)
      });
    });
  });

  describe('Configuration Management', () => {
    test('should load and validate project configuration', async () => {
      const { stdout } = await execAsync(
        'node src/cli/index.js config validate',
        { cwd: process.cwd() }
      );

      expect(stdout).toContain('Configuration validation');
      expect(stdout).toContain('✓') // Success indicator
    });

    test('should handle missing configuration gracefully', async () => {
      const nonexistentConfig = path.join(testTempDir, 'nonexistent.yaml');

      try {
        await execAsync(
          `node src/research-plan-engine.js dry-run "${nonexistentConfig}"`,
          { cwd: process.cwd() }
        );
        fail('Should have thrown file not found error');
      } catch (error) {
        expect(error.stdout || error.stderr).toContain('ENOENT');
      }
    });
  });

  describe('Memory System Integration', () => {
    test('should handle memory operations without errors', async () => {
      // Test memory save operation
      const { stdout: saveOutput } = await execAsync(
        './scripts/memory-save.sh "test research result" "e2e-test"',
        { 
          cwd: process.cwd(),
          env: { ...process.env, DRY_RUN: 'true' }
        }
      );

      expect(saveOutput).toContain('Memory save completed');

      // Test memory search operation
      const { stdout: searchOutput } = await execAsync(
        './scripts/memory-search.sh "test"',
        { 
          cwd: process.cwd(),
          env: { ...process.env, DRY_RUN: 'true' }
        }
      );

      expect(searchOutput).toContain('Memory search completed');
    });
  });

  describe('Error Recovery', () => {
    test('should recover from API failures gracefully', async () => {
      // Test with invalid API keys
      const { stdout } = await execAsync(
        `node src/research-plan-engine.js dry-run "${testConfigPath}"`,
        { 
          cwd: process.cwd(),
          env: { 
            ...process.env, 
            DRY_RUN: 'true',
            PERPLEXITY_API_KEY: 'invalid-key'
          }
        }
      );

      // Should complete despite invalid keys in dry-run mode
      expect(stdout).toContain('Research plan executed');
      expect(stdout).toContain('dry_run: true');
    });

    test('should handle network timeouts', async () => {
      // This test would typically involve mocking network delays
      // For now, we test that the system doesn't crash with network issues
      const { stdout } = await execAsync(
        `timeout 10s node src/research-plan-engine.js dry-run "${testConfigPath}"`,
        { 
          cwd: process.cwd(),
          env: { 
            ...process.env, 
            DRY_RUN: 'true',
            RESEARCH_TIMEOUT: '5000' // 5 second timeout
          }
        }
      );

      expect(stdout).toContain('Research plan executed');
    });
  });
});