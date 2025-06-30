import { spawn, ChildProcess } from 'child_process';
import { app, ipcMain } from 'electron';
import path from 'path';
import fetch from 'node-fetch';
import { EventEmitter } from 'events';

export interface TokenAnalysisRequest {
  tokenAddress: string;
  selectedAgents?: string[];
  modelProvider?: string;
}

export interface AgentSignal {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  reasoning: string;
  community_moat?: number;
  holder_quality?: number;
}

export class CryptoHedgeFundService extends EventEmitter {
  private pythonProcess: ChildProcess | null = null;
  private port: number = 8765; // Different from default 8000 to avoid conflicts
  private isReady: boolean = false;
  private startupTimeout: number = 30000; // 30 seconds

  constructor() {
    super();
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    ipcMain.handle('crypto-hedge-fund:analyze', async (_, request: TokenAnalysisRequest) => {
      if (!this.isReady) {
        throw new Error('Crypto Hedge Fund service is not ready');
      }
      return this.analyzeToken(request);
    });

    ipcMain.handle('crypto-hedge-fund:status', async () => {
      return {
        isReady: this.isReady,
        port: this.port,
        processRunning: this.pythonProcess !== null
      };
    });
  }

  async start(): Promise<void> {
    if (this.pythonProcess) {
      console.log('Crypto Hedge Fund service already running');
      return;
    }

    console.log('Starting Crypto Hedge Fund service...');

    // Determine Python executable path
    const pythonPath = await this.getPythonPath();
    
    // Path to the crypto-hedge-fund directory
    const hedgeFundPath = app.isPackaged
      ? path.join(process.resourcesPath, 'crypto-hedge-fund')
      : path.join(__dirname, '../../../crypto-hedge-fund');

    // Set up environment variables
    const env = {
      ...process.env,
      PYTHONPATH: hedgeFundPath,
      // Pass through API keys from main app
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    };

    // Start Python process
    this.pythonProcess = spawn(
      pythonPath,
      ['-m', 'uvicorn', 'app.backend.main:app', '--host', '127.0.0.1', '--port', String(this.port)],
      {
        cwd: hedgeFundPath,
        env,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    // Handle stdout
    this.pythonProcess.stdout?.on('data', (data) => {
      console.log(`[CryptoHedgeFund] ${data.toString()}`);
      
      // Check if service is ready
      if (data.toString().includes('Uvicorn running on')) {
        this.isReady = true;
        this.emit('ready');
      }
    });

    // Handle stderr
    this.pythonProcess.stderr?.on('data', (data) => {
      console.error(`[CryptoHedgeFund Error] ${data.toString()}`);
    });

    // Handle process exit
    this.pythonProcess.on('exit', (code) => {
      console.log(`Crypto Hedge Fund service exited with code ${code}`);
      this.isReady = false;
      this.pythonProcess = null;
      this.emit('exit', code);
      
      // Auto-restart on unexpected exit
      if (code !== 0 && code !== null) {
        console.log('Attempting to restart Crypto Hedge Fund service...');
        setTimeout(() => this.start(), 5000);
      }
    });

    // Wait for service to be ready
    await this.waitForService();
  }

  async stop(): Promise<void> {
    if (!this.pythonProcess) {
      return;
    }

    console.log('Stopping Crypto Hedge Fund service...');
    
    return new Promise((resolve) => {
      if (this.pythonProcess) {
        this.pythonProcess.once('exit', () => {
          this.pythonProcess = null;
          this.isReady = false;
          resolve();
        });
        
        // Try graceful shutdown first
        this.pythonProcess.kill('SIGTERM');
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.pythonProcess) {
            this.pythonProcess.kill('SIGKILL');
          }
        }, 5000);
      } else {
        resolve();
      }
    });
  }

  private async waitForService(): Promise<void> {
    const startTime = Date.now();
    
    while (!this.isReady) {
      if (Date.now() - startTime > this.startupTimeout) {
        throw new Error('Crypto Hedge Fund service failed to start');
      }
      
      // Try to ping the service
      try {
        const response = await fetch(`http://127.0.0.1:${this.port}/health`);
        if (response.ok) {
          this.isReady = true;
          this.emit('ready');
          console.log('Crypto Hedge Fund service is ready');
          return;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async getPythonPath(): Promise<string> {
    // Use embedded Python runtime
    const { pythonRuntime } = await import('./PythonRuntime.js');
    await pythonRuntime.initialize();
    return pythonRuntime.getExecutablePath();
  }

  async analyzeToken(request: TokenAnalysisRequest): Promise<any> {
    const response = await fetch(`http://127.0.0.1:${this.port}/hedge-fund/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tickers: [request.tokenAddress],
        selected_agents: request.selectedAgents || ['diamond_hands_buffett'],
        model_provider: request.modelProvider || 'openai',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    // The API returns SSE stream, we need to handle it
    // For now, return the session info
    return response.json();
  }

  async getAgents(): Promise<string[]> {
    // Return available crypto agents
    return [
      'diamond_hands_buffett',
      'warren_buffett', // Keep original for comparison
      // Add more as we create them:
      // 'yolo_lynch',
      // 'moonshot_molly',
      // 'contrarian_carl',
    ];
  }
}

// Export singleton instance
export const cryptoHedgeFund = new CryptoHedgeFundService();