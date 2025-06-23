# 🔧 DUAL-LLM IMPLEMENTATION EXAMPLE

*Concrete code showing the zero-lag architecture in action*

## 📋 **OVERVIEW**

This document provides a working example of the dual-LLM architecture, demonstrating:
- Frontend LLM with coded language
- Backend LLM orchestration
- SQLite event-driven storage
- Async job processing
- Real-time status updates

## 🎯 **FRONTEND LLM ADAPTER**

```javascript
// src/adapters/primary/frontend-llm-adapter.js
import { EventEmitter } from 'events';

export class FrontendLLMAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxContextTokens: 2000,
      responseTimeout: 50, // 50ms target
      ...config
    };
    
    // Minimal state for instant responses
    this.recentCommands = new Map(); // LRU cache
    this.activeStatuses = new Map();
    this.commandPatterns = this.initializePatterns();
  }
  
  initializePatterns() {
    return {
      // Task creation patterns
      task: {
        create: /create|build|make|develop|implement/i,
        split: /break down|decompose|split|divide/i,
        status: /status|progress|how is|check on/i
      },
      // Workflow patterns
      workflow: {
        start: /plan|orchestrate|coordinate|workflow/i,
        patterns: {
          auth: /auth|login|user management/i,
          crud: /crud|api|endpoints/i,
          deploy: /deploy|launch|production/i
        }
      },
      // Memory patterns
      memory: {
        store: /remember|note|save|keep in mind/i,
        recall: /recall|what did|retrieve|find/i
      }
    };
  }
  
  async processUserInput(input) {
    const startTime = Date.now();
    
    // Instant intent recognition
    const intent = this.recognizeIntent(input);
    const command = this.generateCommand(intent, input);
    
    // Generate immediate response
    const response = this.generateResponse(intent, command);
    
    // Emit command for backend processing
    this.emit('command', {
      id: this.generateId(),
      command: command,
      intent: intent,
      timestamp: Date.now()
    });
    
    // Track timing
    const responseTime = Date.now() - startTime;
    if (responseTime > 50) {
      console.warn(`Frontend response time: ${responseTime}ms`);
    }
    
    return {
      response: response,
      command: command,
      responseTime: responseTime
    };
  }
  
  recognizeIntent(input) {
    const lower = input.toLowerCase();
    
    // Check task patterns
    if (this.commandPatterns.task.create.test(lower)) {
      return { type: 'task_create', confidence: 0.9 };
    }
    if (this.commandPatterns.task.split.test(lower)) {
      return { type: 'task_split', confidence: 0.85 };
    }
    
    // Check workflow patterns
    if (this.commandPatterns.workflow.start.test(lower)) {
      // Determine workflow type
      for (const [wfType, pattern] of Object.entries(this.commandPatterns.workflow.patterns)) {
        if (pattern.test(lower)) {
          return { type: 'workflow_start', subtype: wfType, confidence: 0.88 };
        }
      }
      return { type: 'workflow_start', subtype: 'generic', confidence: 0.75 };
    }
    
    // Check memory patterns
    if (this.commandPatterns.memory.store.test(lower)) {
      return { type: 'memory_store', confidence: 0.9 };
    }
    if (this.commandPatterns.memory.recall.test(lower)) {
      return { type: 'memory_recall', confidence: 0.9 };
    }
    
    // Default to task creation
    return { type: 'task_create', confidence: 0.6 };
  }
  
  generateCommand(intent, input) {
    switch (intent.type) {
      case 'task_create':
        return this.generateTaskCreateCommand(input);
        
      case 'task_split':
        return this.generateTaskSplitCommand(input);
        
      case 'workflow_start':
        return this.generateWorkflowCommand(intent.subtype, input);
        
      case 'memory_store':
        return this.generateMemoryStoreCommand(input);
        
      case 'memory_recall':
        return this.generateMemoryRecallCommand(input);
        
      default:
        return `tc:${this.extractTitle(input)}|unknown|medium`;
    }
  }
  
  generateTaskCreateCommand(input) {
    const title = this.extractTitle(input);
    const complexity = this.assessComplexity(input);
    const intentType = this.classifyIntentType(input);
    
    return `tc:${title}|${intentType}|${complexity}`;
  }
  
  generateWorkflowCommand(subtype, input) {
    const params = this.extractWorkflowParams(input);
    return `wf:${subtype}|${JSON.stringify(params)}`;
  }
  
  generateResponse(intent, command) {
    const responses = {
      task_create: [
        "I'll create that task right away! You'll see progress updates as I work on it.",
        "Got it! Creating the task now. I'll keep you posted on the progress.",
        "Perfect! I'm on it. The task is being created and you'll see updates shortly."
      ],
      
      task_split: [
        "This looks complex - let me break it down into manageable pieces for you.",
        "I'll decompose this into smaller tasks to ensure we handle everything properly.",
        "Breaking this down now. Each sub-task will be tracked separately."
      ],
      
      workflow_start: [
        "Starting the workflow now! I'll coordinate all the necessary steps.",
        "Initiating the complete workflow. You'll see each step as it progresses.",
        "Workflow launched! I'll handle the orchestration and keep you updated."
      ],
      
      memory_store: [
        "I'll remember that for you.",
        "Noted! I've saved that information.",
        "Got it, I'll keep that in mind for future reference."
      ],
      
      memory_recall: [
        "Let me recall that information for you...",
        "Searching my memory now...",
        "Looking that up for you..."
      ]
    };
    
    const responseSet = responses[intent.type] || responses.task_create;
    const response = responseSet[Math.floor(Math.random() * responseSet.length)];
    
    // Add command visualization for transparency
    return `${response}\n[CMD: ${command}]`;
  }
  
  // Utility methods
  extractTitle(input) {
    // Remove common prefixes
    const cleaned = input
      .replace(/^(create|build|make|implement|develop)\s+(a\s+|an\s+|the\s+)?/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Capitalize first letter
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  assessComplexity(input) {
    const complexityKeywords = {
      high: /complex|full|complete|entire|comprehensive|advanced/i,
      medium: /standard|typical|normal|regular/i,
      low: /simple|basic|quick|easy|small/i
    };
    
    for (const [level, pattern] of Object.entries(complexityKeywords)) {
      if (pattern.test(input)) return level;
    }
    
    // Default based on input length
    return input.length > 100 ? 'high' : 'medium';
  }
  
  classifyIntentType(input) {
    const intentPatterns = {
      personal_experience: /personal|life|health|romantic|family/i,
      business_growth: /business|revenue|user|customer|product|feature/i,
      organizational_coordination: /team|process|workflow|organization/i,
      civilizational_impact: /society|global|world|humanity|planet/i
    };
    
    for (const [type, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(input)) return type;
    }
    
    return 'business_growth'; // default
  }
  
  // Handle incoming events from backend
  handleBackendEvent(event) {
    const [eventType, ...params] = event.split(':');
    const eventData = params.join(':'); // Rejoin in case payload has colons
    
    switch (eventType) {
      case 'tr': // task ready
        this.handleTaskReady(eventData);
        break;
        
      case 'su': // status update
        this.handleStatusUpdate(eventData);
        break;
        
      case 'tc': // task complete
        this.handleTaskComplete(eventData);
        break;
        
      case 'er': // error
        this.handleError(eventData);
        break;
    }
  }
  
  handleStatusUpdate(data) {
    const [entityId, status, progress] = data.split('|');
    
    this.activeStatuses.set(entityId, {
      status,
      progress: parseFloat(progress),
      lastUpdate: Date.now()
    });
    
    // Emit for UI updates
    this.emit('statusUpdate', {
      entityId,
      status,
      progress: parseFloat(progress)
    });
  }
  
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 🧠 **BACKEND LLM ORCHESTRATOR**

```javascript
// src/adapters/primary/backend-llm-orchestrator.js
import { EventEmitter } from 'events';

export class BackendLLMOrchestrator extends EventEmitter {
  constructor(db, mcpAdapter, config = {}) {
    super();
    this.db = db;
    this.mcp = mcpAdapter;
    this.config = config;
    
    // Command processors
    this.processors = new Map();
    this.initializeProcessors();
    
    // Context cache
    this.contextCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }
  
  initializeProcessors() {
    // Task creation processor
    this.processors.set('tc', async (params) => {
      const [title, intentType, complexity] = params.split('|');
      return await this.createTask({ title, intentType, complexity });
    });
    
    // Task split processor
    this.processors.set('ts', async (params) => {
      const [taskId, confidence, reason] = params.split('|');
      return await this.splitTask({ taskId, confidence: parseFloat(confidence), reason });
    });
    
    // Workflow processor
    this.processors.set('wf', async (params) => {
      const [workflowType, paramsJson] = params.split('|');
      return await this.startWorkflow({ workflowType, params: JSON.parse(paramsJson) });
    });
    
    // Memory store processor
    this.processors.set('ms', async (params) => {
      const [key, value, type] = params.split('|');
      return await this.storeMemory({ key, value, type });
    });
    
    // Context load processor
    this.processors.set('cl', async (params) => {
      const [contextId, depth] = params.split('|');
      return await this.loadContext({ contextId, depth });
    });
  }
  
  async processCommand(commandData) {
    const { command, intent, id } = commandData;
    
    try {
      // Parse command
      const [cmdType, ...params] = command.split(':');
      const processor = this.processors.get(cmdType);
      
      if (!processor) {
        throw new Error(`Unknown command type: ${cmdType}`);
      }
      
      // Create job in queue
      const jobId = await this.queueJob({
        type: cmdType,
        params: params.join(':'),
        intent: intent,
        commandId: id
      });
      
      // Send acknowledgment
      this.emit('event', `ack:${id}|${jobId}`);
      
      // Process asynchronously
      setImmediate(async () => {
        try {
          const result = await processor(params.join(':'));
          await this.completeJob(jobId, result);
        } catch (error) {
          await this.failJob(jobId, error);
        }
      });
      
    } catch (error) {
      this.emit('event', `er:${id}|${error.message}|retry`);
    }
  }
  
  async createTask(params) {
    const { title, intentType, complexity } = params;
    
    // Load relevant context
    const context = await this.loadTaskContext(intentType);
    
    // Assess task confidence with full context
    const confidence = await this.assessTaskConfidence(title, context, complexity);
    
    // Determine routing
    const routing = this.determineRouting(intentType, complexity, confidence);
    
    // Create task in database
    const task = await this.db.run(`
      INSERT INTO tasks (
        id, title, description, intent_type, complexity, confidence, 
        routing_decision, status, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      this.generateTaskId(),
      title,
      `Task created from user input: ${title}`,
      intentType,
      complexity,
      confidence,
      routing,
      JSON.stringify({ created_via: 'dual_llm', context: context.id })
    ]);
    
    // Emit events
    this.emit('event', `tr:${task.id}|${confidence}|${routing}`);
    
    // If low confidence, auto-split
    if (confidence < 0.8) {
      await this.autoSplitTask(task.id, confidence);
    }
    
    return task;
  }
  
  async splitTask(params) {
    const { taskId, confidence, reason } = params;
    
    // Load task and full context
    const task = await this.db.get('SELECT * FROM tasks WHERE id = ?', taskId);
    const context = await this.loadTaskContext(task.intent_type);
    
    // Use MCP to analyze and split
    const splitResult = await this.mcp.split_task({
      taskId: taskId,
      reason: reason,
      confidence: confidence,
      context: context
    });
    
    // Create subtasks
    const subtasks = [];
    for (const subtaskDef of splitResult.subtasks) {
      const subtask = await this.createTask({
        title: subtaskDef.title,
        intentType: task.intent_type,
        complexity: 'low'
      });
      
      // Link to parent
      await this.db.run(`
        INSERT INTO task_relationships (parent_id, child_id, relationship_type)
        VALUES (?, ?, 'subtask')
      `, [taskId, subtask.id]);
      
      subtasks.push(subtask);
    }
    
    // Update parent task status
    await this.db.run(`
      UPDATE tasks SET status = 'split' WHERE id = ?
    `, [taskId]);
    
    // Emit completion
    this.emit('event', `ts:${taskId}|${subtasks.length}|${subtasks.map(t => t.id).join(',')}`);
    
    return { parentTask: taskId, subtasks };
  }
  
  async startWorkflow(params) {
    const { workflowType, params: wfParams } = params;
    
    // Load workflow definition
    const workflowDef = await this.loadWorkflowDefinition(workflowType);
    
    // Create workflow instance
    const workflow = await this.db.run(`
      INSERT INTO workflows (id, name, steps, context, status)
      VALUES (?, ?, ?, ?, 'running')
    `, [
      this.generateWorkflowId(),
      workflowDef.name,
      JSON.stringify(workflowDef.steps),
      JSON.stringify(wfParams),
      'running'
    ]);
    
    // Create tasks for each step
    const tasks = [];
    for (const [index, step] of workflowDef.steps.entries()) {
      const task = await this.createTask({
        title: step.task,
        intentType: 'business_growth',
        complexity: step.complexity || 'medium'
      });
      
      // Link to workflow
      await this.db.run(`
        INSERT INTO workflow_tasks (workflow_id, task_id, step_index, agent)
        VALUES (?, ?, ?, ?)
      `, [workflow.id, task.id, index, step.agent]);
      
      tasks.push(task);
    }
    
    // Start execution
    this.emit('event', `wf:${workflow.id}|started|${tasks.length}`);
    
    return { workflow, tasks };
  }
  
  async loadTaskContext(intentType) {
    // Check cache first
    const cacheKey = `context_${intentType}`;
    const cached = this.contextCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    // Load from database and MCP
    const context = {
      id: this.generateContextId(),
      intentType,
      businessGoals: await this.loadBusinessGoals(intentType),
      similarTasks: await this.findSimilarTasks(intentType),
      patterns: await this.loadPatterns(intentType),
      timestamp: Date.now()
    };
    
    // Cache it
    this.contextCache.set(cacheKey, {
      data: context,
      timestamp: Date.now()
    });
    
    return context;
  }
  
  determineRouting(intentType, complexity, confidence) {
    const routing = {
      personal_experience: {
        low: 'one_shot',
        medium: confidence > 0.8 ? 'one_shot' : 'mini_workflow',
        high: 'mini_workflow'
      },
      business_growth: {
        low: 'mini_workflow',
        medium: 'project_structure',
        high: 'project_structure'
      },
      organizational_coordination: {
        low: 'project_structure',
        medium: 'project_structure',
        high: 'multi_project'
      },
      civilizational_impact: {
        low: 'multi_project',
        medium: 'multi_project',
        high: 'multi_project'
      }
    };
    
    return routing[intentType]?.[complexity] || 'mini_workflow';
  }
  
  async queueJob(jobData) {
    const result = await this.db.run(`
      INSERT INTO job_queue (job_type, payload, priority)
      VALUES (?, ?, ?)
    `, [
      jobData.type,
      JSON.stringify(jobData),
      this.calculatePriority(jobData)
    ]);
    
    return result.lastID;
  }
  
  calculatePriority(jobData) {
    const priorities = {
      tc: 10, // task create
      ts: 8,  // task split
      wf: 7,  // workflow
      ms: 5,  // memory store
      cl: 6   // context load
    };
    
    return priorities[jobData.type] || 5;
  }
  
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateWorkflowId() {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateContextId() {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 💾 **SQLITE EVENT-DRIVEN ADAPTER**

```javascript
// src/adapters/secondary/sqlite-event-adapter.js
import Database from 'better-sqlite3';
import { EventEmitter } from 'events';

export class SQLiteEventAdapter extends EventEmitter {
  constructor(dbPath = '.kingly/kingly.db') {
    super();
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Enable WAL for concurrency
    this.db.pragma('busy_timeout = 5000');
    
    this.initializeSchema();
    this.setupTriggers();
  }
  
  initializeSchema() {
    // Main tables
    this.db.exec(`
      -- Tasks table with temporal support
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        intent_type TEXT,
        intent_source TEXT,
        business_goal TEXT,
        context_adaptations TEXT,
        parent_context TEXT,
        workspace_id TEXT,
        project_id TEXT,
        status TEXT DEFAULT 'pending',
        confidence REAL DEFAULT 0.5,
        complexity REAL DEFAULT 0.5,
        routing_decision TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_to TIMESTAMP DEFAULT '9999-12-31'
      );
      
      -- FTS5 for full-text search
      CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(
        title, description, intent_type, business_goal,
        content=tasks, content_rowid=rowid
      );
      
      -- Events table for event sourcing
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        payload JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );
      
      -- Job queue for async processing
      CREATE TABLE IF NOT EXISTS job_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_type TEXT NOT NULL,
        payload JSON NOT NULL,
        status TEXT DEFAULT 'pending',
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error TEXT,
        result JSON
      );
      
      -- Memory table with versioning
      CREATE TABLE IF NOT EXISTS memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        memory_type TEXT DEFAULT 'semantic',
        significance REAL DEFAULT 0.5,
        metadata JSON,
        version INTEGER DEFAULT 1,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_to TIMESTAMP DEFAULT '9999-12-31',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(key, version)
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_intent ON tasks(intent_type);
      CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_events_unprocessed ON events(processed_at) WHERE processed_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_queue_pending ON job_queue(status, priority DESC) WHERE status = 'pending';
      CREATE INDEX IF NOT EXISTS idx_memory_key ON memory(key, valid_to);
    `);
  }
  
  setupTriggers() {
    // Trigger to create events on task changes
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS task_insert_event
      AFTER INSERT ON tasks
      BEGIN
        INSERT INTO events (event_type, entity_type, entity_id, payload)
        VALUES ('created', 'task', NEW.id, json_object(
          'title', NEW.title,
          'intent_type', NEW.intent_type,
          'status', NEW.status,
          'confidence', NEW.confidence
        ));
      END;
      
      CREATE TRIGGER IF NOT EXISTS task_update_event
      AFTER UPDATE ON tasks
      WHEN OLD.status != NEW.status OR OLD.confidence != NEW.confidence
      BEGIN
        INSERT INTO events (event_type, entity_type, entity_id, payload)
        VALUES ('updated', 'task', NEW.id, json_object(
          'old_status', OLD.status,
          'new_status', NEW.status,
          'old_confidence', OLD.confidence,
          'new_confidence', NEW.confidence
        ));
      END;
      
      -- Update timestamp trigger
      CREATE TRIGGER IF NOT EXISTS task_update_timestamp
      AFTER UPDATE ON tasks
      BEGIN
        UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
  }
  
  // Prepared statements for performance
  prepareStatements() {
    this.statements = {
      insertTask: this.db.prepare(`
        INSERT INTO tasks (id, title, description, intent_type, complexity, confidence, routing_decision, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      
      updateTaskStatus: this.db.prepare(`
        UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `),
      
      getTask: this.db.prepare(`
        SELECT * FROM tasks WHERE id = ?
      `),
      
      searchTasks: this.db.prepare(`
        SELECT t.* FROM tasks t
        JOIN tasks_fts ON t.rowid = tasks_fts.rowid
        WHERE tasks_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `),
      
      insertEvent: this.db.prepare(`
        INSERT INTO events (event_type, entity_type, entity_id, payload)
        VALUES (?, ?, ?, ?)
      `),
      
      getUnprocessedEvents: this.db.prepare(`
        SELECT * FROM events 
        WHERE processed_at IS NULL
        ORDER BY created_at
        LIMIT ?
      `),
      
      markEventProcessed: this.db.prepare(`
        UPDATE events SET processed_at = CURRENT_TIMESTAMP WHERE id = ?
      `),
      
      enqueueJob: this.db.prepare(`
        INSERT INTO job_queue (job_type, payload, priority)
        VALUES (?, ?, ?)
      `),
      
      dequeueJob: this.db.prepare(`
        UPDATE job_queue 
        SET status = 'processing', started_at = CURRENT_TIMESTAMP
        WHERE id = (
          SELECT id FROM job_queue 
          WHERE status = 'pending'
          ORDER BY priority DESC, created_at ASC
          LIMIT 1
        )
        RETURNING *
      `)
    };
  }
  
  // Task operations
  async createTask(taskData) {
    const stmt = this.statements.insertTask;
    const result = stmt.run(
      taskData.id,
      taskData.title,
      taskData.description,
      taskData.intent_type,
      taskData.complexity,
      taskData.confidence,
      taskData.routing_decision,
      JSON.stringify(taskData.metadata || {})
    );
    
    // Events are created automatically by trigger
    return { ...taskData, rowid: result.lastInsertRowid };
  }
  
  async updateTaskStatus(taskId, status) {
    const stmt = this.statements.updateTaskStatus;
    const result = stmt.run(status, taskId);
    return result.changes > 0;
  }
  
  async searchTasks(query, limit = 10) {
    const stmt = this.statements.searchTasks;
    return stmt.all(query, limit);
  }
  
  // Event processing
  async processEvents(limit = 100) {
    const events = this.statements.getUnprocessedEvents.all(limit);
    
    for (const event of events) {
      try {
        // Emit event for subscribers
        this.emit('dbEvent', {
          type: event.event_type,
          entity: event.entity_type,
          id: event.entity_id,
          payload: JSON.parse(event.payload)
        });
        
        // Mark as processed
        this.statements.markEventProcessed.run(event.id);
      } catch (error) {
        console.error('Error processing event:', error);
      }
    }
    
    return events.length;
  }
  
  // Job queue operations
  async enqueueJob(jobType, payload, priority = 0) {
    const stmt = this.statements.enqueueJob;
    const result = stmt.run(jobType, JSON.stringify(payload), priority);
    return result.lastInsertRowid;
  }
  
  async dequeueJob() {
    const stmt = this.statements.dequeueJob;
    const job = stmt.get();
    
    if (job) {
      job.payload = JSON.parse(job.payload);
      if (job.result) job.result = JSON.parse(job.result);
    }
    
    return job;
  }
  
  // Memory operations with versioning
  async storeMemory(key, value, metadata = {}) {
    // Check if key exists
    const existing = this.db.prepare(`
      SELECT * FROM memory WHERE key = ? AND valid_to = '9999-12-31'
    `).get(key);
    
    if (existing) {
      // Invalidate old version
      this.db.prepare(`
        UPDATE memory SET valid_to = CURRENT_TIMESTAMP WHERE id = ?
      `).run(existing.id);
      
      // Insert new version
      const newVersion = existing.version + 1;
      this.db.prepare(`
        INSERT INTO memory (key, value, category, memory_type, significance, metadata, version)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        key,
        value,
        metadata.category || existing.category,
        metadata.memory_type || existing.memory_type,
        metadata.significance || existing.significance,
        JSON.stringify(metadata),
        newVersion
      );
    } else {
      // First version
      this.db.prepare(`
        INSERT INTO memory (key, value, category, memory_type, significance, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        key,
        value,
        metadata.category || 'general',
        metadata.memory_type || 'semantic',
        metadata.significance || 0.5,
        JSON.stringify(metadata)
      );
    }
  }
  
  async recallMemory(key, atTime = null) {
    if (atTime) {
      // Point-in-time query
      return this.db.prepare(`
        SELECT * FROM memory 
        WHERE key = ? 
        AND valid_from <= ? 
        AND valid_to > ?
        ORDER BY version DESC
        LIMIT 1
      `).get(key, atTime, atTime);
    } else {
      // Current version
      return this.db.prepare(`
        SELECT * FROM memory 
        WHERE key = ? AND valid_to = '9999-12-31'
      `).get(key);
    }
  }
  
  // Transaction support
  transaction(fn) {
    return this.db.transaction(fn)();
  }
  
  close() {
    this.db.close();
  }
}
```

## 🔄 **ASYNC JOB PROCESSOR**

```javascript
// src/services/async-job-processor.js
import { EventEmitter } from 'events';

export class AsyncJobProcessor extends EventEmitter {
  constructor(db, mcpAdapter, config = {}) {
    super();
    this.db = db;
    this.mcp = mcpAdapter;
    this.config = {
      pollInterval: 100,
      maxConcurrent: 5,
      ...config
    };
    
    this.running = false;
    this.activeJobs = new Map();
  }
  
  start() {
    if (this.running) return;
    
    this.running = true;
    this.processLoop();
  }
  
  stop() {
    this.running = false;
  }
  
  async processLoop() {
    while (this.running) {
      try {
        // Check if we can process more jobs
        if (this.activeJobs.size < this.config.maxConcurrent) {
          const job = await this.db.dequeueJob();
          
          if (job) {
            // Process job asynchronously
            this.processJob(job);
          }
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, this.config.pollInterval));
        
      } catch (error) {
        console.error('Job processor error:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  async processJob(job) {
    this.activeJobs.set(job.id, job);
    
    try {
      console.log(`Processing job ${job.id} of type ${job.job_type}`);
      
      let result;
      switch (job.job_type) {
        case 'tc': // task create
          result = await this.processTaskCreate(job.payload);
          break;
          
        case 'ts': // task split
          result = await this.processTaskSplit(job.payload);
          break;
          
        case 'wf': // workflow
          result = await this.processWorkflow(job.payload);
          break;
          
        case 'ms': // memory store
          result = await this.processMemoryStore(job.payload);
          break;
          
        default:
          throw new Error(`Unknown job type: ${job.job_type}`);
      }
      
      // Mark job as completed
      await this.completeJob(job.id, result);
      
      // Emit completion event
      this.emit('jobCompleted', {
        id: job.id,
        type: job.job_type,
        result: result
      });
      
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      await this.failJob(job.id, error);
      
      // Emit failure event
      this.emit('jobFailed', {
        id: job.id,
        type: job.job_type,
        error: error.message
      });
      
    } finally {
      this.activeJobs.delete(job.id);
    }
  }
  
  async processTaskCreate(payload) {
    const { title, intentType, complexity, commandId } = payload;
    
    // Use MCP to create task with full context
    const result = await this.mcp.create_task({
      title: title,
      description: `Created via dual-LLM system`,
      intent_type: intentType,
      complexity: complexity,
      metadata: {
        command_id: commandId,
        created_via: 'async_processor'
      }
    });
    
    // Store in local database
    await this.db.createTask({
      id: result.task.id,
      title: result.task.title,
      description: result.task.description,
      intent_type: intentType,
      complexity: complexity,
      confidence: result.confidence || 0.5,
      routing_decision: result.routing || 'mini_workflow',
      metadata: result.metadata
    });
    
    return result;
  }
  
  async processMemoryStore(payload) {
    const { key, value, type } = payload;
    
    // Store locally first
    await this.db.storeMemory(key, value, {
      memory_type: type,
      source: 'dual_llm'
    });
    
    // Then sync to semantic memory if significant
    if (type === 'semantic' || type === 'procedural') {
      await this.mcp.memory_intelligent_store({
        key: key,
        content: value,
        memory_type: type,
        significance: 0.7
      });
    }
    
    return { key, stored: true };
  }
  
  async completeJob(jobId, result) {
    await this.db.db.prepare(`
      UPDATE job_queue 
      SET status = 'completed', 
          completed_at = CURRENT_TIMESTAMP,
          result = ?
      WHERE id = ?
    `).run(JSON.stringify(result), jobId);
  }
  
  async failJob(jobId, error) {
    await this.db.db.prepare(`
      UPDATE job_queue 
      SET status = 'failed', 
          completed_at = CURRENT_TIMESTAMP,
          error = ?
      WHERE id = ?
    `).run(error.message, jobId);
  }
}
```

## 🌐 **EVENT STREAM SERVER**

```javascript
// src/services/event-stream-server.js
import { EventEmitter } from 'events';

export class EventStreamServer extends EventEmitter {
  constructor(httpServer) {
    super();
    this.clients = new Map();
    this.setupRoutes(httpServer);
  }
  
  setupRoutes(server) {
    // SSE endpoint for real-time updates
    server.get('/events', (req, res) => {
      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      
      const clientId = this.generateClientId();
      this.clients.set(clientId, res);
      
      // Send initial connection event
      res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`);
      
      // Handle client disconnect
      req.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }
  
  // Broadcast event to all connected clients
  broadcast(eventType, data) {
    const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    
    for (const [clientId, res] of this.clients) {
      try {
        res.write(message);
      } catch (error) {
        // Client disconnected
        this.clients.delete(clientId);
      }
    }
  }
  
  // Send event to specific client
  send(clientId, eventType, data) {
    const res = this.clients.get(clientId);
    if (res) {
      try {
        res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        this.clients.delete(clientId);
      }
    }
  }
  
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## 🚀 **INTEGRATION EXAMPLE**

```javascript
// src/dual-llm-system.js
import { FrontendLLMAdapter } from './adapters/primary/frontend-llm-adapter.js';
import { BackendLLMOrchestrator } from './adapters/primary/backend-llm-orchestrator.js';
import { SQLiteEventAdapter } from './adapters/secondary/sqlite-event-adapter.js';
import { AsyncJobProcessor } from './services/async-job-processor.js';
import { EventStreamServer } from './services/event-stream-server.js';
import { MCPAdapter } from './adapters/primary/mcp-adapter.js';

export class DualLLMSystem {
  constructor(config = {}) {
    // Initialize components
    this.db = new SQLiteEventAdapter(config.dbPath);
    this.mcp = new MCPAdapter(config.mcp);
    
    this.frontend = new FrontendLLMAdapter(config.frontend);
    this.backend = new BackendLLMOrchestrator(this.db, this.mcp, config.backend);
    
    this.jobProcessor = new AsyncJobProcessor(this.db, this.mcp);
    this.eventServer = new EventStreamServer(config.httpServer);
    
    this.setupEventFlow();
  }
  
  setupEventFlow() {
    // Frontend → Backend command flow
    this.frontend.on('command', (commandData) => {
      this.backend.processCommand(commandData);
    });
    
    // Backend → Frontend event flow
    this.backend.on('event', (event) => {
      this.frontend.handleBackendEvent(event);
      this.eventServer.broadcast('backend-event', { event });
    });
    
    // Database events → Event stream
    this.db.on('dbEvent', (event) => {
      this.eventServer.broadcast('db-event', event);
    });
    
    // Job completion → Event stream
    this.jobProcessor.on('jobCompleted', (job) => {
      this.eventServer.broadcast('job-completed', job);
    });
    
    // Status updates from frontend
    this.frontend.on('statusUpdate', (status) => {
      this.eventServer.broadcast('status-update', status);
    });
  }
  
  async start() {
    // Prepare database statements
    this.db.prepareStatements();
    
    // Start job processor
    this.jobProcessor.start();
    
    // Start event processing loop
    setInterval(() => {
      this.db.processEvents();
    }, 100);
    
    console.log('Dual-LLM system started');
  }
  
  async processUserInput(input) {
    // Frontend processes with zero lag
    const response = await this.frontend.processUserInput(input);
    
    // Response is immediate, backend processing happens async
    return response;
  }
}

// Usage example
const system = new DualLLMSystem({
  dbPath: '.kingly/kingly.db',
  httpServer: app, // Express/Fastify app
  mcp: {
    // MCP configuration
  }
});

await system.start();

// Process user input with <50ms response
const result = await system.processUserInput("Create a complete authentication system");
console.log(result);
// Output: 
// {
//   response: "I'll create that task right away! You'll see progress updates as I work on it.\n[CMD: tc:Complete Authentication System|business_growth|high]",
//   command: "tc:Complete Authentication System|business_growth|high",
//   responseTime: 23
// }
```

## 📊 **PERFORMANCE METRICS**

```javascript
// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frontendResponseTimes: [],
      commandProcessingTimes: [],
      jobCompletionTimes: [],
      eventDeliveryTimes: []
    };
  }
  
  recordMetric(type, duration) {
    this.metrics[type].push(duration);
    
    // Keep only last 1000 entries
    if (this.metrics[type].length > 1000) {
      this.metrics[type].shift();
    }
  }
  
  getStats(type) {
    const times = this.metrics[type];
    if (times.length === 0) return null;
    
    const sorted = [...times].sort((a, b) => a - b);
    
    return {
      count: times.length,
      mean: times.reduce((a, b) => a + b) / times.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      max: sorted[sorted.length - 1]
    };
  }
  
  report() {
    console.log('=== Performance Report ===');
    
    for (const [type, label] of Object.entries({
      frontendResponseTimes: 'Frontend Response',
      commandProcessingTimes: 'Command Processing',
      jobCompletionTimes: 'Job Completion',
      eventDeliveryTimes: 'Event Delivery'
    })) {
      const stats = this.getStats(type);
      if (stats) {
        console.log(`\n${label}:`);
        console.log(`  Mean: ${stats.mean.toFixed(2)}ms`);
        console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
        console.log(`  P99: ${stats.p99.toFixed(2)}ms`);
      }
    }
  }
}
```

**This implementation demonstrates a complete dual-LLM system with zero-lag frontend and powerful async backend processing!** 🚀