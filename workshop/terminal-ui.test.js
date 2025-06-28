const blessed = require('blessed');
const TerminalUI = require('./terminal-ui');
const AutoProcessor = require('./auto-processor');

// Mock blessed
jest.mock('blessed', () => ({
  screen: jest.fn(() => ({
    key: jest.fn(),
    append: jest.fn(),
    render: jest.fn()
  })),
  box: jest.fn(() => ({
    setContent: jest.fn()
  })),
  log: jest.fn(() => ({
    log: jest.fn()
  }))
}));

// Mock AutoProcessor
jest.mock('./auto-processor');

describe('TerminalUI', () => {
  let ui;
  let mockScreen;
  let mockProcessor;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock processor
    mockProcessor = {
      init: jest.fn().mockResolvedValue(),
      on: jest.fn(),
      getStatus: jest.fn().mockReturnValue({
        activeWorkers: 0,
        workers: [],
        outputDir: '/tmp/auto-runs'
      }),
      getIntakeStatus: jest.fn().mockResolvedValue({
        processed: 20,
        total: 71,
        percentage: 28,
        lastProcessed: 'test-repo'
      }),
      startWorker: jest.fn(),
      stopWorker: jest.fn()
    };
    
    AutoProcessor.mockImplementation(() => mockProcessor);
    
    // Create mock screen
    mockScreen = {
      key: jest.fn(),
      append: jest.fn(),
      render: jest.fn()
    };
    
    blessed.screen.mockReturnValue(mockScreen);
    
    ui = new TerminalUI();
  });

  describe('init', () => {
    it('should initialize processor and setup UI', async () => {
      await ui.init();
      
      expect(mockProcessor.init).toHaveBeenCalled();
      expect(blessed.screen).toHaveBeenCalled();
      expect(mockScreen.key).toHaveBeenCalledWith(
        ['escape', 'q', 'C-c'],
        expect.any(Function)
      );
    });
  });

  describe('setupScreen', () => {
    it('should set up keyboard shortcuts', () => {
      ui.setupScreen();
      
      // Check escape key binding
      expect(mockScreen.key).toHaveBeenCalledWith(
        ['escape', 'q', 'C-c'],
        expect.any(Function)
      );
      
      // Check other key bindings
      expect(mockScreen.key).toHaveBeenCalledWith(['r'], expect.any(Function));
      expect(mockScreen.key).toHaveBeenCalledWith(['s'], expect.any(Function));
      expect(mockScreen.key).toHaveBeenCalledWith(['k'], expect.any(Function));
    });
  });

  describe('setupWidgets', () => {
    it('should create all UI widgets', () => {
      ui.setupScreen();
      ui.setupWidgets();
      
      // Check that all widgets were created
      expect(blessed.box).toHaveBeenCalledTimes(5); // header, status, intake, workers, help
      expect(blessed.log).toHaveBeenCalledTimes(1); // output
      
      // Check header widget
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({
          top: 0,
          left: 0,
          width: '100%',
          height: 3,
          content: expect.stringContaining('LEVIATHAN WORKSHOP AUTO PROCESSOR')
        })
      );
    });
  });

  describe('setupEventListeners', () => {
    it('should register processor event handlers', () => {
      ui.setupEventListeners();
      
      expect(mockProcessor.on).toHaveBeenCalledWith('status', expect.any(Function));
      expect(mockProcessor.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockProcessor.on).toHaveBeenCalledWith('output', expect.any(Function));
    });

    it('should handle status events', () => {
      ui.setupEventListeners();
      
      // Get the status handler
      const statusHandler = mockProcessor.on.mock.calls.find(
        call => call[0] === 'status'
      )[1];
      
      // Simulate status event
      statusHandler({
        type: 'start',
        message: 'Worker started'
      });
      
      // Check that log was added
      expect(ui.logs).toHaveLength(1);
      expect(ui.logs[0]).toMatchObject({
        message: '[START] Worker started',
        type: 'status'
      });
    });

    it('should handle error events', () => {
      ui.setupEventListeners();
      
      // Get the error handler
      const errorHandler = mockProcessor.on.mock.calls.find(
        call => call[0] === 'error'
      )[1];
      
      // Simulate error event
      errorHandler({
        message: 'Test error'
      });
      
      // Check that error was logged
      expect(ui.logs).toHaveLength(1);
      expect(ui.logs[0]).toMatchObject({
        message: '[ERROR] Test error',
        type: 'error'
      });
    });

    it('should handle output events', () => {
      ui.setupScreen();
      ui.setupWidgets();
      ui.setupEventListeners();
      
      // Get the output handler
      const outputHandler = mockProcessor.on.mock.calls.find(
        call => call[0] === 'output'
      )[1];
      
      // Mock the output widget
      const mockOutputWidget = { log: jest.fn() };
      ui.widgets.output = mockOutputWidget;
      
      // Simulate output event
      outputHandler({
        workerId: 'test-worker',
        type: 'stdout',
        data: 'This is a test output line\n'
      });
      
      // Check that output was logged
      expect(mockOutputWidget.log).toHaveBeenCalledWith(
        '[test-worker] This is a test output line'
      );
    });
  });

  describe('refresh', () => {
    beforeEach(() => {
      ui.setupScreen();
      ui.setupWidgets();
      
      // Mock widgets
      ui.widgets.status = { setContent: jest.fn() };
      ui.widgets.intake = { setContent: jest.fn() };
      ui.widgets.workers = { setContent: jest.fn() };
    });

    it('should update status widget', async () => {
      await ui.refresh();
      
      expect(ui.widgets.status.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Active Workers: 0')
      );
    });

    it('should update intake progress widget', async () => {
      await ui.refresh();
      
      expect(ui.widgets.intake.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Progress: 28%')
      );
      expect(ui.widgets.intake.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Processed: 20/71 repositories')
      );
    });

    it('should update worker list widget', async () => {
      mockProcessor.getStatus.mockReturnValue({
        activeWorkers: 1,
        workers: [{
          id: 'test-worker',
          pid: 12345,
          startTime: new Date(),
          outputFile: '/tmp/test.log',
          uptime: 5000
        }],
        outputDir: '/tmp/auto-runs'
      });
      
      await ui.refresh();
      
      expect(ui.widgets.workers.setContent).toHaveBeenCalledWith(
        expect.stringContaining('ID: test-worker')
      );
      expect(ui.widgets.workers.setContent).toHaveBeenCalledWith(
        expect.stringContaining('PID: 12345')
      );
    });

    it('should handle refresh errors', async () => {
      mockProcessor.getIntakeStatus.mockRejectedValue(new Error('Test error'));
      
      await ui.refresh();
      
      // Should add error to logs
      expect(ui.logs).toContainEqual(
        expect.objectContaining({
          message: 'Refresh error: Test error',
          type: 'error'
        })
      );
    });
  });

  describe('startNewWorker', () => {
    it('should start a new worker with unique ID', () => {
      ui.startNewWorker();
      
      expect(mockProcessor.startWorker).toHaveBeenCalledWith(
        expect.stringMatching(/^auto-\d+$/)
      );
      
      expect(ui.logs).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Starting new worker'),
          type: 'info'
        })
      );
    });
  });

  describe('killWorker', () => {
    it('should kill the first active worker', () => {
      mockProcessor.getStatus.mockReturnValue({
        activeWorkers: 1,
        workers: [{
          id: 'test-worker',
          pid: 12345,
          startTime: new Date(),
          outputFile: '/tmp/test.log',
          uptime: 5000
        }],
        outputDir: '/tmp/auto-runs'
      });
      
      ui.killWorker();
      
      expect(mockProcessor.stopWorker).toHaveBeenCalledWith('test-worker');
      expect(ui.logs).toContainEqual(
        expect.objectContaining({
          message: 'Stopped worker: test-worker',
          type: 'info'
        })
      );
    });

    it('should do nothing if no workers running', () => {
      mockProcessor.getStatus.mockReturnValue({
        activeWorkers: 0,
        workers: [],
        outputDir: '/tmp/auto-runs'
      });
      
      ui.killWorker();
      
      expect(mockProcessor.stopWorker).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should stop all workers on cleanup', () => {
      mockProcessor.getStatus.mockReturnValue({
        activeWorkers: 2,
        workers: [
          { id: 'worker-1' },
          { id: 'worker-2' }
        ],
        outputDir: '/tmp/auto-runs'
      });
      
      ui.cleanup();
      
      expect(mockProcessor.stopWorker).toHaveBeenCalledWith('worker-1');
      expect(mockProcessor.stopWorker).toHaveBeenCalledWith('worker-2');
    });
  });
});