#!/usr/bin/env node

/**
 * Terminal UI for Workshop Auto Processor
 * Real-time monitoring of intake processes and repository analysis
 */

const blessed = require('blessed');
const AutoProcessor = require('./auto-processor');

class TerminalUI {
  constructor() {
    this.processor = new AutoProcessor();
    this.screen = null;
    this.widgets = {};
    this.logs = [];
    this.maxLogs = 1000;
  }

  async init() {
    await this.processor.init();
    this.setupScreen();
    this.setupWidgets();
    this.setupEventListeners();
    this.startRefreshLoop();
    this.render();
  }

  setupScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Leviathan Workshop Auto Processor',
      dockBorders: true,
      autoPadding: true
    });

    // Key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    this.screen.key(['r'], () => {
      this.refresh();
    });

    this.screen.key(['s'], () => {
      this.startNewWorker();
    });

    this.screen.key(['k'], () => {
      this.killWorker();
    });
  }

  setupWidgets() {
    // Header
    this.widgets.header = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '{center}🧙🏽‍♂️ LEVIATHAN WORKSHOP AUTO PROCESSOR{/center}',
      tags: true,
      border: { type: 'line' },
      style: {
        fg: 'cyan',
        border: { fg: 'cyan' }
      }
    });

    // Status panel
    this.widgets.status = blessed.box({
      top: 3,
      left: 0,
      width: '50%',
      height: 8,
      label: ' Status ',
      content: 'Loading...',
      border: { type: 'line' },
      style: {
        fg: 'white',
        border: { fg: 'yellow' }
      }
    });

    // Intake progress
    this.widgets.intake = blessed.box({
      top: 3,
      left: '50%',
      width: '50%',
      height: 8,
      label: ' Intake Progress ',
      content: 'Loading...',
      border: { type: 'line' },
      style: {
        fg: 'white',
        border: { fg: 'green' }
      }
    });

    // Worker list
    this.widgets.workers = blessed.box({
      top: 11,
      left: 0,
      width: '50%',
      height: 10,
      label: ' Active Workers ',
      content: 'No workers running',
      scrollable: true,
      border: { type: 'line' },
      style: {
        fg: 'white',
        border: { fg: 'blue' }
      }
    });

    // Live output
    this.widgets.output = blessed.log({
      top: 11,
      left: '50%',
      width: '50%',
      height: 10,
      label: ' Live Output ',
      scrollable: true,
      alwaysScroll: true,
      border: { type: 'line' },
      style: {
        fg: 'white',
        border: { fg: 'magenta' }
      }
    });

    // Help/Controls
    this.widgets.help = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '{center}[R]efresh | [S]tart Worker | [K]ill Worker | [Q]uit{/center}',
      tags: true,
      border: { type: 'line' },
      style: {
        fg: 'gray',
        border: { fg: 'gray' }
      }
    });

    // Add all widgets to screen
    Object.values(this.widgets).forEach(widget => {
      this.screen.append(widget);
    });
  }

  setupEventListeners() {
    this.processor.on('status', (data) => {
      this.addLog(`[${data.type.toUpperCase()}] ${data.message}`, 'status');
      this.refresh();
    });

    this.processor.on('error', (data) => {
      this.addLog(`[ERROR] ${data.message}`, 'error');
      this.refresh();
    });

    this.processor.on('output', (data) => {
      // Only show key output lines to avoid spam
      const lines = data.data.split('\n');
      lines.forEach(line => {
        if (line.trim() && !line.match(/^\s*[\.\-\*]\s*$/) && line.length > 10) {
          this.widgets.output.log(`[${data.workerId}] ${line.trim()}`);
        }
      });
      this.screen.render();
    });
  }

  addLog(message, type = 'info') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const logEntry = {
      timestamp,
      message,
      type
    };
    
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  async refresh() {
    try {
      // Update status
      const status = this.processor.getStatus();
      const statusText = [
        `Active Workers: ${status.activeWorkers}`,
        `Output Directory: ${status.outputDir}`,
        `Last Refresh: ${new Date().toLocaleTimeString()}`,
        '',
        'Recent Activity:',
        ...this.logs.slice(-5).map(log => 
          `  ${log.timestamp} [${log.type.toUpperCase()}] ${log.message}`
        )
      ].join('\n');
      this.widgets.status.setContent(statusText);

      // Update intake progress
      const intakeStatus = await this.processor.getIntakeStatus();
      const progressBar = '█'.repeat(Math.floor(intakeStatus.percentage / 5)) + 
                         '░'.repeat(20 - Math.floor(intakeStatus.percentage / 5));
      
      const intakeText = [
        `Progress: ${intakeStatus.percentage}% [${progressBar}]`,
        `Processed: ${intakeStatus.processed}/${intakeStatus.total} repositories`,
        `Last Processed: ${intakeStatus.lastProcessed}`,
        '',
        intakeStatus.error ? `Error: ${intakeStatus.error}` : 'Status: Running'
      ].join('\n');
      this.widgets.intake.setContent(intakeText);

      // Update worker list
      const workerText = status.workers.length === 0 ? 
        'No workers running\n\nPress [S] to start a new worker' :
        status.workers.map(worker => [
          `ID: ${worker.id}`,
          `PID: ${worker.pid}`,
          `Uptime: ${Math.floor(worker.uptime / 1000)}s`,
          `Output: ${worker.outputFile}`,
          ''
        ].join('\n')).join('\n');
      
      this.widgets.workers.setContent(workerText);

      this.screen.render();
    } catch (error) {
      this.addLog(`Refresh error: ${error.message}`, 'error');
    }
  }

  startRefreshLoop() {
    setInterval(() => {
      this.refresh();
    }, 2000); // Refresh every 2 seconds
  }

  startNewWorker() {
    const workerId = `auto-${Date.now()}`;
    this.processor.startWorker(workerId);
    this.addLog(`Starting new worker: ${workerId}`, 'info');
  }

  killWorker() {
    const status = this.processor.getStatus();
    if (status.workers.length > 0) {
      const workerId = status.workers[0].id; // Kill the first worker
      this.processor.stopWorker(workerId);
      this.addLog(`Stopped worker: ${workerId}`, 'info');
    }
  }

  cleanup() {
    const status = this.processor.getStatus();
    status.workers.forEach(worker => {
      this.processor.stopWorker(worker.id);
    });
  }

  render() {
    this.screen.render();
  }
}

// Auto-start if run directly
if (require.main === module) {
  const ui = new TerminalUI();
  
  ui.init().catch(error => {
    console.error('Failed to start Terminal UI:', error.message);
    process.exit(1);
  });
}

module.exports = TerminalUI;