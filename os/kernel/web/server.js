const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store recent data
let telemetryHistory = [];
let decisionHistory = [];
let configurationChanges = [];
let systemHealth = {
  status: 'unknown',
  uptime: 0,
  lastUpdate: new Date()
};

const MAX_HISTORY = 100;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    connections: io.engine.clientsCount,
    dataPoints: {
      telemetry: telemetryHistory.length,
      decisions: decisionHistory.length,
      configurations: configurationChanges.length
    }
  });
});

app.get('/api/telemetry', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(telemetryHistory.slice(-limit));
});

app.get('/api/decisions', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(decisionHistory.slice(-limit));
});

app.get('/api/configurations', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(configurationChanges.slice(-limit));
});

// Receive telemetry from Go backend
app.post('/api/telemetry', (req, res) => {
  const telemetry = {
    ...req.body,
    received_at: new Date()
  };
  
  telemetryHistory.push(telemetry);
  if (telemetryHistory.length > MAX_HISTORY) {
    telemetryHistory = telemetryHistory.slice(-MAX_HISTORY);
  }
  
  // Broadcast to all connected clients
  io.emit('telemetry', telemetry);
  
  res.json({ status: 'received', id: telemetryHistory.length });
});

// Receive AI decisions from Go backend
app.post('/api/decisions', (req, res) => {
  const decision = {
    ...req.body,
    received_at: new Date(),
    id: decisionHistory.length + 1
  };
  
  decisionHistory.push(decision);
  if (decisionHistory.length > MAX_HISTORY) {
    decisionHistory = decisionHistory.slice(-MAX_HISTORY);
  }
  
  // Broadcast to all connected clients
  io.emit('decision', decision);
  
  console.log(`🤖 AI Decision: ${decision.category} - ${decision.priority}`);
  console.log(`   ${decision.reasoning}`);
  
  res.json({ status: 'received', id: decision.id });
});

// Receive configuration changes from Go backend
app.post('/api/configurations', (req, res) => {
  const change = {
    ...req.body,
    applied_at: new Date(),
    id: configurationChanges.length + 1
  };
  
  configurationChanges.push(change);
  if (configurationChanges.length > MAX_HISTORY) {
    configurationChanges = configurationChanges.slice(-MAX_HISTORY);
  }
  
  // Broadcast to all connected clients
  io.emit('configuration', change);
  
  console.log(`⚙️ Config Applied: ${change.action} on ${change.target}`);
  
  res.json({ status: 'applied', id: change.id });
});

// System control endpoints
app.post('/api/control/stress-test', (req, res) => {
  const { duration = 30, intensity = 'medium' } = req.body;
  
  // Simulate stress test (in real system, would trigger actual stress)
  const stressEvent = {
    type: 'stress_test',
    duration,
    intensity,
    started_at: new Date()
  };
  
  io.emit('system_event', stressEvent);
  
  res.json({ status: 'started', event: stressEvent });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('📱 Dashboard client connected:', socket.id);
  
  // Send initial data
  socket.emit('initial_data', {
    telemetry: telemetryHistory.slice(-10),
    decisions: decisionHistory.slice(-5),
    configurations: configurationChanges.slice(-5),
    health: systemHealth
  });
  
  socket.on('disconnect', () => {
    console.log('📱 Dashboard client disconnected:', socket.id);
  });
  
  // Handle client requests
  socket.on('request_data', (type) => {
    switch(type) {
      case 'telemetry':
        socket.emit('telemetry_batch', telemetryHistory.slice(-50));
        break;
      case 'decisions':
        socket.emit('decisions_batch', decisionHistory.slice(-20));
        break;
      case 'configurations':
        socket.emit('configurations_batch', configurationChanges.slice(-20));
        break;
    }
  });
});

// Serve the dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.WEB_PORT || 3000;
server.listen(PORT, () => {
  console.log('🌐 LLM Configuration Dashboard running on port', PORT);
  console.log('📊 Real-time telemetry and AI decision monitoring active');
  console.log('🔗 WebSocket server ready for live updates');
});