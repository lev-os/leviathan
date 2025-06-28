const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const AutoProcessor = require('./auto-processor');

// Path to our mock claude executable
const MOCK_CLAUDE_PATH = path.join(__dirname, 'test', 'mock-claude.js');

describe('AutoProcessor Integration Tests', () => {
  let processor;
  let originalPath;
  
  beforeAll(() => {
    // Save original PATH
    originalPath = process.env.PATH;
    // Add test directory to PATH so 'claude' resolves to our mock
    process.env.PATH = `${path.dirname(MOCK_CLAUDE_PATH)}:${originalPath}`;
  });
  
  afterAll(() => {
    // Restore original PATH
    process.env.PATH = originalPath;
  });
  
  beforeEach(async () => {
    processor = new AutoProcessor();
    await processor.init();
    
    // Create a mock _auto.md file
    await fs.writeFile(
      path.join(processor.baseDir, '_auto.md'),
      '# Test Auto\n\nYou are a workshop intake processor. Test prompt content.'
    );
  });
  
  afterEach(async () => {
    // Clean up any running workers
    const status = processor.getStatus();
    status.workers.forEach(worker => {
      processor.stopWorker(worker.id);
    });
    
    // Clean up test files
    try {
      await fs.rm(path.join(processor.baseDir, '_auto.md'));
      await fs.rm(processor.outputDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Success scenarios', () => {
    it('should successfully run worker with streaming output', (done) => {
      process.env.MOCK_CLAUDE_BEHAVIOR = 'success';
      
      const outputs = [];
      const statuses = [];
      
      processor.on('output', (data) => {
        outputs.push(data);
      });
      
      processor.on('status', (data) => {
        statuses.push(data);
        
        if (data.type === 'complete') {
          // Verify we got expected outputs
          expect(outputs).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'system',
                data: expect.stringContaining('Starting Claude with prompt file')
              }),
              expect.objectContaining({
                type: 'system',
                data: expect.stringContaining('Claude process spawned successfully')
              }),
              expect.objectContaining({
                type: 'stdout',
                data: expect.stringContaining('Starting repository analysis')
              }),
              expect.objectContaining({
                type: 'stdout',
                data: expect.stringContaining('[COMPLETE] Analysis saved')
              })
            ])
          );
          
          // Verify final status
          expect(data.exitCode).toBe(0);
          
          done();
        }
      });
      
      // Use the actual mock-claude executable
      const originalSpawn = spawn;
      jest.spyOn(require('child_process'), 'spawn').mockImplementation((command, args, options) => {
        if (command === 'claude') {
          return originalSpawn(MOCK_CLAUDE_PATH, args, options);
        }
        return originalSpawn(command, args, options);
      });
      
      processor.startWorker('test-integration');
    }, 10000);

    it('should capture streaming output correctly', (done) => {
      process.env.MOCK_CLAUDE_BEHAVIOR = 'stream';
      process.env.MOCK_CLAUDE_DELAY = '50';
      
      const outputs = [];
      
      processor.on('output', (data) => {
        if (data.type === 'stdout') {
          outputs.push(data.data);
        }
      });
      
      processor.on('status', (data) => {
        if (data.type === 'complete') {
          // Should have received multiple streaming outputs
          const streamingOutputs = outputs.filter(o => 
            o.includes('Analyzing repository')
          );
          expect(streamingOutputs.length).toBeGreaterThan(5);
          
          done();
        }
      });
      
      // Use mock claude
      const originalSpawn = spawn;
      jest.spyOn(require('child_process'), 'spawn').mockImplementation((command, args, options) => {
        if (command === 'claude') {
          return originalSpawn(MOCK_CLAUDE_PATH, args, options);
        }
        return originalSpawn(command, args, options);
      });
      
      processor.startWorker('test-stream');
    }, 15000);
  });

  describe('Error scenarios', () => {
    it('should handle process errors gracefully', (done) => {
      process.env.MOCK_CLAUDE_BEHAVIOR = 'error';
      
      const errors = [];
      const outputs = [];
      
      processor.on('error', (data) => {
        errors.push(data);
      });
      
      processor.on('output', (data) => {
        outputs.push(data);
      });
      
      processor.on('status', (data) => {
        if (data.type === 'complete') {
          // Should have non-zero exit code
          expect(data.exitCode).toBe(1);
          
          // Should have captured stderr
          const stderrOutputs = outputs.filter(o => o.type === 'stderr');
          expect(stderrOutputs).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                data: expect.stringContaining('Error: Failed to access')
              })
            ])
          );
          
          done();
        }
      });
      
      // Use mock claude
      const originalSpawn = spawn;
      jest.spyOn(require('child_process'), 'spawn').mockImplementation((command, args, options) => {
        if (command === 'claude') {
          return originalSpawn(MOCK_CLAUDE_PATH, args, options);
        }
        return originalSpawn(command, args, options);
      });
      
      processor.startWorker('test-error');
    }, 10000);

    it('should handle missing claude executable', (done) => {
      const errors = [];
      
      processor.on('error', (data) => {
        errors.push(data);
      });
      
      processor.on('output', (data) => {
        if (data.type === 'error') {
          expect(data.data).toContain('[ERROR] Failed to start Claude');
          done();
        }
      });
      
      // Don't mock spawn - let it fail naturally
      processor.startWorker('test-missing');
    });
  });

  describe('Process management', () => {
    it('should stop workers cleanly', (done) => {
      process.env.MOCK_CLAUDE_BEHAVIOR = 'stream';
      
      let processStarted = false;
      
      processor.on('output', (data) => {
        if (data.type === 'system' && data.data.includes('spawned successfully')) {
          processStarted = true;
          
          // Give it a moment to start streaming
          setTimeout(() => {
            processor.stopWorker('test-stop');
          }, 500);
        }
      });
      
      processor.on('status', (data) => {
        if (data.type === 'stop' && processStarted) {
          expect(data.workerId).toBe('test-stop');
          
          // Verify worker is removed
          const status = processor.getStatus();
          expect(status.activeWorkers).toBe(0);
          
          done();
        }
      });
      
      // Use mock claude
      const originalSpawn = spawn;
      jest.spyOn(require('child_process'), 'spawn').mockImplementation((command, args, options) => {
        if (command === 'claude') {
          return originalSpawn(MOCK_CLAUDE_PATH, args, options);
        }
        return originalSpawn(command, args, options);
      });
      
      processor.startWorker('test-stop');
    }, 10000);

    it('should handle multiple concurrent workers', async () => {
      process.env.MOCK_CLAUDE_BEHAVIOR = 'success';
      process.env.MOCK_CLAUDE_DELAY = '10';
      
      // Use mock claude
      const originalSpawn = spawn;
      jest.spyOn(require('child_process'), 'spawn').mockImplementation((command, args, options) => {
        if (command === 'claude') {
          return originalSpawn(MOCK_CLAUDE_PATH, args, options);
        }
        return originalSpawn(command, args, options);
      });
      
      // Start multiple workers
      await processor.startWorker('worker-1');
      await processor.startWorker('worker-2');
      await processor.startWorker('worker-3');
      
      // Check status
      const status = processor.getStatus();
      expect(status.activeWorkers).toBe(3);
      expect(status.workers).toHaveLength(3);
      
      // Wait a bit for them to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // All should complete
      const finalStatus = processor.getStatus();
      expect(finalStatus.activeWorkers).toBe(0);
    }, 10000);
  });

  describe('File operations', () => {
    it('should create and clean up files correctly', async () => {
      process.env.MOCK_CLAUDE_BEHAVIOR = 'success';
      
      await new Promise((resolve) => {
        processor.on('status', async (data) => {
          if (data.type === 'complete') {
            // Check that log file exists
            const logFiles = await fs.readdir(processor.outputDir);
            const workerLogFiles = logFiles.filter(f => 
              f.startsWith('test-files') && f.endsWith('.log')
            );
            expect(workerLogFiles).toHaveLength(1);
            
            // Check log file content
            const logContent = await fs.readFile(
              path.join(processor.outputDir, workerLogFiles[0]),
              'utf8'
            );
            expect(logContent).toContain('[AUTO-PROCESSOR] Starting worker');
            expect(logContent).toContain('Starting repository analysis');
            expect(logContent).toContain('[COMPLETE] Analysis saved');
            
            // Check that prompt file was cleaned up
            const promptFiles = logFiles.filter(f => 
              f.startsWith('test-files') && f.endsWith('-prompt.txt')
            );
            expect(promptFiles).toHaveLength(0);
            
            resolve();
          }
        });
        
        // Use mock claude
        const originalSpawn = spawn;
        jest.spyOn(require('child_process'), 'spawn').mockImplementation((command, args, options) => {
          if (command === 'claude') {
            return originalSpawn(MOCK_CLAUDE_PATH, args, options);
          }
          return originalSpawn(command, args, options);
        });
        
        processor.startWorker('test-files');
      });
    });
  });
});