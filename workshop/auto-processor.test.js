const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const AutoProcessor = require('./auto-processor');

// Mock dependencies
jest.mock('fs/promises');
jest.mock('child_process');

describe('AutoProcessor', () => {
  let processor;
  let mockChildProcess;

  beforeEach(() => {
    processor = new AutoProcessor();
    
    // Create mock child process
    mockChildProcess = new EventEmitter();
    mockChildProcess.pid = 12345;
    mockChildProcess.stdout = new EventEmitter();
    mockChildProcess.stderr = new EventEmitter();
    mockChildProcess.kill = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
    fs.mkdir.mockResolvedValue();
    fs.readFile.mockResolvedValue('You are a workshop intake processor...');
    fs.writeFile.mockResolvedValue();
    fs.appendFile.mockResolvedValue();
    fs.unlink.mockResolvedValue();
    spawn.mockReturnValue(mockChildProcess);
  });

  describe('init', () => {
    it('should create output directory', async () => {
      await processor.init();
      
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('tmp/auto-runs'),
        { recursive: true }
      );
    });

    it('should emit init status', async () => {
      const statusSpy = jest.fn();
      processor.on('status', statusSpy);
      
      await processor.init();
      
      expect(statusSpy).toHaveBeenCalledWith({
        type: 'init',
        message: 'Auto-processor initialized'
      });
    });
  });

  describe('readAutoPrompt', () => {
    it('should read and extract prompt from _auto.md', async () => {
      const mockContent = `# Some header
      
You are a workshop intake processor. This is the prompt content.
More content here.`;
      
      fs.readFile.mockResolvedValue(mockContent);
      
      const prompt = await processor.readAutoPrompt();
      
      expect(prompt).toBe('You are a workshop intake processor. This is the prompt content.\nMore content here.');
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining('_auto.md'),
        'utf8'
      );
    });

    it('should throw error if prompt not found', async () => {
      fs.readFile.mockResolvedValue('No valid prompt here');
      
      await expect(processor.readAutoPrompt()).rejects.toThrow(
        'Could not find system prompt in _auto.md'
      );
    });
  });

  describe('startWorker', () => {
    const mockPrompt = 'You are a workshop intake processor...';
    
    beforeEach(() => {
      fs.readFile.mockResolvedValue(`Some header\n${mockPrompt}`);
    });

    it('should start a worker successfully', async () => {
      const statusSpy = jest.fn();
      const outputSpy = jest.fn();
      processor.on('status', statusSpy);
      processor.on('output', outputSpy);
      
      await processor.startWorker('test-worker');
      
      // Verify prompt file was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test-worker'),
        mockPrompt
      );
      
      // Verify log file was initialized
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.log'),
        expect.stringContaining('[AUTO-PROCESSOR] Starting worker')
      );
      
      // Verify Claude was spawned with correct args
      expect(spawn).toHaveBeenCalledWith(
        'claude',
        ['-f', expect.stringContaining('prompt.txt')],
        expect.objectContaining({
          stdio: ['pipe', 'pipe', 'pipe'],
          env: expect.objectContaining({
            WORKSHOP_AUTO_PROCESSOR: 'test-worker'
          })
        })
      );
      
      // Verify status was emitted
      expect(statusSpy).toHaveBeenCalledWith({
        type: 'start',
        message: 'Starting worker test-worker',
        workerId: 'test-worker',
        outputFile: expect.any(String)
      });
    });

    it('should capture stdout output', async () => {
      const outputSpy = jest.fn();
      processor.on('output', outputSpy);
      
      await processor.startWorker('test-worker');
      
      // Simulate stdout data
      mockChildProcess.stdout.emit('data', Buffer.from('Test output'));
      
      expect(outputSpy).toHaveBeenCalledWith({
        workerId: 'test-worker',
        type: 'stdout',
        data: 'Test output',
        timestamp: expect.any(String)
      });
    });

    it('should capture stderr output', async () => {
      const outputSpy = jest.fn();
      processor.on('output', outputSpy);
      
      await processor.startWorker('test-worker');
      
      // Simulate stderr data
      mockChildProcess.stderr.emit('data', Buffer.from('Error output'));
      
      expect(outputSpy).toHaveBeenCalledWith({
        workerId: 'test-worker',
        type: 'stderr',
        data: 'Error output',
        timestamp: expect.any(String)
      });
    });

    it('should handle process close event', async () => {
      const statusSpy = jest.fn();
      processor.on('status', statusSpy);
      
      await processor.startWorker('test-worker');
      
      // Simulate process close
      mockChildProcess.emit('close', 0);
      
      expect(statusSpy).toHaveBeenCalledWith({
        type: 'complete',
        message: 'Worker test-worker finished with code 0',
        workerId: 'test-worker',
        exitCode: 0
      });
      
      // Verify cleanup
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('prompt.txt')
      );
    });

    it('should handle process errors', async () => {
      const errorSpy = jest.fn();
      const outputSpy = jest.fn();
      processor.on('error', errorSpy);
      processor.on('output', outputSpy);
      
      await processor.startWorker('test-worker');
      
      // Simulate process error
      const error = new Error('Spawn failed');
      mockChildProcess.emit('error', error);
      
      expect(errorSpy).toHaveBeenCalledWith({
        type: 'process_error',
        message: 'Spawn failed',
        workerId: 'test-worker',
        error
      });
      
      expect(outputSpy).toHaveBeenCalledWith({
        workerId: 'test-worker',
        type: 'error',
        data: expect.stringContaining('[ERROR] Failed to start Claude'),
        timestamp: expect.any(String)
      });
    });

    it('should not start duplicate workers', async () => {
      await processor.startWorker('test-worker');
      
      const statusSpy = jest.fn();
      processor.on('status', statusSpy);
      
      await processor.startWorker('test-worker');
      
      expect(statusSpy).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Worker test-worker already running',
        workerId: 'test-worker'
      });
      
      // Should only spawn once
      expect(spawn).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopWorker', () => {
    it('should stop a running worker', async () => {
      await processor.startWorker('test-worker');
      
      const statusSpy = jest.fn();
      processor.on('status', statusSpy);
      
      processor.stopWorker('test-worker');
      
      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(statusSpy).toHaveBeenCalledWith({
        type: 'stop',
        message: 'Worker test-worker stopped',
        workerId: 'test-worker'
      });
    });

    it('should handle stopping non-existent worker', () => {
      const statusSpy = jest.fn();
      processor.on('status', statusSpy);
      
      processor.stopWorker('non-existent');
      
      expect(statusSpy).toHaveBeenCalledWith({
        type: 'warning',
        message: 'Worker non-existent not found',
        workerId: 'non-existent'
      });
    });
  });

  describe('getStatus', () => {
    it('should return current status', async () => {
      await processor.startWorker('worker-1');
      await processor.startWorker('worker-2');
      
      const status = processor.getStatus();
      
      expect(status).toEqual({
        activeWorkers: 2,
        workers: expect.arrayContaining([
          expect.objectContaining({
            id: 'worker-1',
            pid: 12345,
            startTime: expect.any(Date),
            outputFile: expect.any(String),
            uptime: expect.any(Number)
          }),
          expect.objectContaining({
            id: 'worker-2',
            pid: 12345,
            startTime: expect.any(Date),
            outputFile: expect.any(String),
            uptime: expect.any(Number)
          })
        ]),
        outputDir: expect.stringContaining('tmp/auto-runs')
      });
    });
  });

  describe('getIntakeStatus', () => {
    it('should return intake progress', async () => {
      fs.readFile.mockResolvedValue('repo1\nrepo2\nrepo3');
      fs.readdir.mockResolvedValue([
        { name: 'repo1', isDirectory: () => true },
        { name: 'repo2', isDirectory: () => true },
        { name: 'repo3', isDirectory: () => true },
        { name: 'repo4', isDirectory: () => true },
        { name: 'repo5', isDirectory: () => true }
      ]);
      
      const status = await processor.getIntakeStatus();
      
      expect(status).toEqual({
        processed: 3,
        total: 5,
        percentage: 60,
        lastProcessed: 'repo3'
      });
    });

    it('should handle missing tracker.txt', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      fs.readdir.mockResolvedValue([
        { name: 'repo1', isDirectory: () => true }
      ]);
      
      const status = await processor.getIntakeStatus();
      
      expect(status).toEqual({
        processed: 0,
        total: 1,
        percentage: 0,
        lastProcessed: 'none'
      });
    });

    it('should handle readdir errors', async () => {
      fs.readdir.mockRejectedValue(new Error('Permission denied'));
      
      const status = await processor.getIntakeStatus();
      
      expect(status).toEqual({
        processed: 0,
        total: 0,
        percentage: 0,
        error: 'Permission denied'
      });
    });
  });
});