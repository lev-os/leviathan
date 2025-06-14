/**
 * Universal Preview Platform - Main Server
 * Handles ingestion, analysis, and execution of agents/MCPs/APIs
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');

// Internal modules
const { IngestEngine } = require('./src/ingestion/IngestEngine');
const { TestHarnessGenerator } = require('./src/testing/TestHarnessGenerator');
const { InterfaceConverter } = require('./src/conversion/InterfaceConverter');
const { SandboxManager } = require('./src/execution/SandboxManager');
const { MetadataDB } = require('./src/database/MetadataDB');
const { APIKeyVault } = require('./src/security/APIKeyVault');

// Routes
const projectRoutes = require('./src/routes/projects');
const testRoutes = require('./src/routes/testing');
const conversionRoutes = require('./src/routes/conversion');
const executionRoutes = require('./src/routes/execution');

// Configuration
const config = {
  port: process.env.PORT || 8001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS) || 5,
  sandboxTimeout: parseInt(process.env.SANDBOX_TIMEOUT) || 300000, // 5 minutes
};

// Logger setup
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Express app setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Basic middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Initialize core services
class PlatformServer {
  constructor() {
    this.ingestEngine = new IngestEngine();
    this.testGenerator = new TestHarnessGenerator();
    this.converter = new InterfaceConverter();
    this.sandboxManager = new SandboxManager();
    this.db = new MetadataDB();
    this.keyVault = new APIKeyVault();
    this.activeJobs = new Map();
  }

  async initialize() {
    try {
      // Initialize database
      await this.db.initialize();
      logger.info('Database initialized');

      // Initialize other services
      await this.ingestEngine.initialize();
      await this.sandboxManager.initialize();
      
      logger.info('All services initialized');
    } catch (error) {
      logger.error('Failed to initialize services:', error);
      throw error;
    }
  }

  setupSocketHandlers() {
    io.on('connection', (socket) => {
      logger.debug(`Client connected: ${socket.id}`);

      // Join project-specific rooms for updates
      socket.on('join-project', (projectId) => {
        socket.join(`project-${projectId}`);
        logger.debug(`Client ${socket.id} joined project-${projectId}`);
      });

      // Handle real-time test execution
      socket.on('start-test', async (data) => {
        try {
          const { projectId, testConfig, apiKeys } = data;
          
          // Store API keys securely for this session
          if (apiKeys) {
            await this.keyVault.storeTemporaryKeys(socket.id, apiKeys);
          }

          // Start test execution
          const jobId = await this.executeTest(projectId, testConfig, socket);
          socket.emit('test-started', { jobId });
          
        } catch (error) {
          logger.error('Test execution failed:', error);
          socket.emit('test-error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.debug(`Client disconnected: ${socket.id}`);
        // Cleanup temporary API keys
        this.keyVault.cleanupSession(socket.id);
      });
    });
  }

  async executeTest(projectId, testConfig, socket) {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Get project metadata
      const project = await this.db.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Create sandbox environment
      const sandbox = await this.sandboxManager.createSandbox({
        projectType: project.type,
        resourceLimits: testConfig.resourceLimits || {},
        timeout: config.sandboxTimeout
      });

      // Execute test with real-time updates
      const testResults = await this.sandboxManager.executeTest(
        sandbox,
        project,
        testConfig,
        (update) => {
          socket.emit('test-update', {
            jobId,
            type: update.type,
            data: update.data,
            timestamp: new Date().toISOString()
          });
        }
      );

      // Send final results
      socket.emit('test-complete', {
        jobId,
        results: testResults,
        timestamp: new Date().toISOString()
      });

      // Cleanup sandbox
      await this.sandboxManager.destroySandbox(sandbox);

      return jobId;
      
    } catch (error) {
      logger.error(`Test execution failed for job ${jobId}:`, error);
      socket.emit('test-error', {
        jobId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

// Initialize platform
const platform = new PlatformServer();

// API Routes
app.use('/api/projects', projectRoutes(platform));
app.use('/api/test', testRoutes(platform));
app.use('/api/convert', conversionRoutes(platform));
app.use('/api/execute', executionRoutes(platform));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await platform.db.healthCheck(),
        sandbox: await platform.sandboxManager.healthCheck(),
        activeJobs: platform.activeJobs.size
      }
    };
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Cleanup active jobs
  for (const [jobId, job] of platform.activeJobs) {
    try {
      await job.cancel();
      logger.info(`Cancelled job: ${jobId}`);
    } catch (error) {
      logger.error(`Failed to cancel job ${jobId}:`, error);
    }
  }

  // Close database connections
  try {
    await platform.db.close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database:', error);
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    await platform.initialize();
    platform.setupSocketHandlers();
    
    server.listen(config.port, () => {
      logger.info(`🚀 Universal Preview Platform running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`📡 WebSocket ready for real-time updates`);
      logger.info(`🛡️  Security: Helmet + Rate limiting active`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = { app, server, platform };