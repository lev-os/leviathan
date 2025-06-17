import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { ConfigManager } from './config/manager';
import { Logger } from './utils/logger';
import { researchRoutes } from './routes/research';
import { configRoutes } from './routes/config';
import { statusRoutes } from './routes/status';

export class ApiServer {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });
  private logger = new Logger('ApiServer');
  
  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }
  
  private setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`);
      next();
    });
  }
  
  private setupRoutes() {
    this.app.use('/api/research', researchRoutes);
    this.app.use('/api/config', configRoutes);
    this.app.use('/api/status', statusRoutes);
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }  private setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.logger.info('WebSocket connection established');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(ws, message);
        } catch (error) {
          this.logger.error('Invalid WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        this.logger.info('WebSocket connection closed');
      });
    });
  }
  
  private handleWebSocketMessage(ws: any, message: any) {
    switch (message.type) {
      case 'subscribe_research':
        // Subscribe to research updates
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  }
  
  private setupErrorHandling() {
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }
  
  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        this.logger.info(`Server running on port ${port}`);
        resolve();
      });
    });
  }
  
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.info('Server stopped');
        resolve();
      });
    });
  }
}