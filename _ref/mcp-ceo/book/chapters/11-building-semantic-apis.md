# Chapter 11: Building Semantic APIs

> "The future of APIs isn't in documenting what developers can call, but in understanding what they're trying to achieve."

Traditional APIs require developers to understand your system. Semantic APIs understand theirs.

## Table of Contents

1. [Semantic API Design Principles](#semantic-api-design-principles)
2. [The MCP Protocol Layer](#the-mcp-protocol-layer)
3. [Intent-Based Endpoints](#intent-based-endpoints)
4. [Streaming Intelligence](#streaming-intelligence)
5. [Authentication & Authorization](#authentication--authorization)
6. [SDK Development](#sdk-development)
7. [Error Handling & Fallbacks](#error-handling--fallbacks)
8. [API Documentation](#api-documentation)

---

## Semantic API Design Principles

### The Intelligence Shift

Traditional REST APIs follow a CRUD pattern - Create, Read, Update, Delete. Semantic APIs follow a MIND pattern - **M**odel, **I**nterpret, **N**egotiate, **D**eliver.

```javascript
// Traditional API - explicit resource manipulation
POST /api/v1/users
PUT /api/v1/users/123/profile
GET /api/v1/users/123/preferences

// Semantic API - intent-based interaction
POST /api/semantic/understand
{
  "intent": "I need to update my profile with better privacy settings",
  "context": { "user_id": 123, "privacy_concerns": ["data_sharing", "email_marketing"] }
}
```

### Core Design Principles

**1. Intent Over Interface**
Your API should understand what users want to accomplish, not just what endpoints they can hit.

```typescript
interface SemanticRequest {
  intent: string;              // Natural language goal
  context?: object;            // Relevant state/data
  constraints?: string[];      // Natural language limitations
  confidence_threshold?: number; // How certain should the API be?
}

interface SemanticResponse {
  understanding: {
    parsed_intent: string;
    confidence: number;
    ambiguities?: string[];
  };
  execution: {
    actions_taken: Action[];
    side_effects: SideEffect[];
    requires_confirmation?: boolean;
  };
  alternatives?: Alternative[];  // Other interpretations
}
```

**2. Context Preservation**
Every interaction should build upon previous understanding.

```javascript
class SemanticSession {
  constructor(sessionId) {
    this.id = sessionId;
    this.context = new ContextManager();
    this.personality = null;
    this.conversation_history = [];
  }

  async understand(request) {
    // Build context from conversation history
    const enriched_context = await this.context.enrich({
      current_request: request,
      session_history: this.conversation_history,
      user_profile: await this.getUserProfile(),
      system_state: await this.getSystemState()
    });

    return this.processWithContext(request, enriched_context);
  }
}
```

**3. Graceful Ambiguity**
When intent is unclear, engage in clarification rather than failing.

```yaml
# API behavior specification
ambiguity_handling:
  confidence_threshold: 0.8
  when_uncertain:
    - ask_clarifying_questions: true
    - suggest_alternatives: true
    - provide_confidence_scores: true
    - allow_progressive_refinement: true
```

---

## The MCP Protocol Layer

### MCP as API Foundation

The Model Context Protocol provides the perfect foundation for semantic APIs because it already handles the complex bidirectional flow between human intent and AI reasoning.

```javascript
// Base MCP API Server Implementation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class SemanticAPIServer extends Server {
  constructor() {
    super(
      {
        name: "semantic-api-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          logging: {}
        }
      }
    );

    this.setupSemanticHandlers();
  }

  setupSemanticHandlers() {
    // Core semantic understanding tool
    this.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "understand_intent",
          description: "Parse natural language intent into actionable API calls",
          inputSchema: {
            type: "object",
            properties: {
              intent: { type: "string", description: "Natural language description of what user wants" },
              context: { type: "object", description: "Relevant context and constraints" },
              session_id: { type: "string", description: "Session for context continuity" }
            },
            required: ["intent"]
          }
        },
        {
          name: "execute_workflow",
          description: "Execute multi-step semantic workflows",
          inputSchema: {
            type: "object",
            properties: {
              workflow_type: { type: "string", enum: ["analysis", "automation", "creative", "problem_solving"] },
              parameters: { type: "object" },
              session_id: { type: "string" }
            },
            required: ["workflow_type"]
          }
        }
      ]
    }));

    // Intent understanding handler
    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "understand_intent") {
        return await this.handleIntentUnderstanding(request.params.arguments);
      } else if (request.params.name === "execute_workflow") {
        return await this.handleWorkflowExecution(request.params.arguments);
      }
    });
  }

  async handleIntentUnderstanding({ intent, context = {}, session_id }) {
    const session = await this.getOrCreateSession(session_id);
    
    // Use AI to parse intent
    const analysis = await this.analyzeIntent(intent, context, session);
    
    // Map to concrete API actions
    const actions = await this.mapToActions(analysis);
    
    // Return semantic response
    return {
      content: [{
        type: "text",
        text: this.formatSemanticResponse(analysis, actions)
      }],
      metadata: {
        confidence: analysis.confidence,
        session_id: session.id,
        actions_identified: actions.length,
        requires_confirmation: analysis.confidence < 0.8
      }
    };
  }
}
```

### HTTP Wrapper for Web Integration

```javascript
import express from 'express';
import { MCPClient } from './mcp-client.js';

class SemanticAPIWrapper {
  constructor() {
    this.app = express();
    this.mcpClient = new MCPClient('./semantic-api-server.js');
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.use(this.authMiddleware);
    this.app.use(this.contextMiddleware);

    // Primary semantic endpoint
    this.app.post('/api/v1/understand', async (req, res) => {
      try {
        const result = await this.mcpClient.callTool('understand_intent', {
          intent: req.body.intent,
          context: {
            ...req.body.context,
            user_id: req.user.id,
            request_timestamp: new Date().toISOString(),
            ip_address: req.ip
          },
          session_id: req.session.id
        });

        res.json(this.formatAPIResponse(result));
      } catch (error) {
        res.status(500).json(this.formatError(error));
      }
    });

    // Workflow execution endpoint
    this.app.post('/api/v1/workflow', async (req, res) => {
      try {
        const result = await this.mcpClient.callTool('execute_workflow', {
          workflow_type: req.body.workflow_type,
          parameters: req.body.parameters,
          session_id: req.session.id
        });

        // Handle streaming responses for long workflows
        if (req.body.stream) {
          this.handleStreamingWorkflow(res, result);
        } else {
          res.json(this.formatAPIResponse(result));
        }
      } catch (error) {
        res.status(500).json(this.formatError(error));
      }
    });

    // Session management
    this.app.get('/api/v1/session/:id', async (req, res) => {
      const session = await this.getSession(req.params.id);
      res.json(session);
    });
  }

  formatAPIResponse(mcpResult) {
    return {
      success: true,
      data: mcpResult.content,
      metadata: mcpResult.metadata,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## Intent-Based Endpoints

### Natural Language API Design

Instead of requiring developers to learn your API schema, let them describe what they want in natural language.

```javascript
class IntentRouter {
  constructor() {
    this.intentPatterns = new Map();
    this.setupCommonIntents();
  }

  setupCommonIntents() {
    // Data retrieval intents
    this.registerIntent(
      /(?:get|find|retrieve|show|list).*(user|customer|order|product)/i,
      'data_retrieval',
      this.handleDataRetrieval
    );

    // Data modification intents
    this.registerIntent(
      /(?:update|change|modify|edit|set).*(profile|settings|preference)/i,
      'data_modification', 
      this.handleDataModification
    );

    // Analytics intents
    this.registerIntent(
      /(?:analyze|report|dashboard|metrics|stats).*(sales|performance|usage)/i,
      'analytics',
      this.handleAnalytics
    );

    // Automation intents
    this.registerIntent(
      /(?:automate|schedule|trigger|when).*(backup|email|notification)/i,
      'automation',
      this.handleAutomation
    );
  }

  async routeIntent(intent, context) {
    // Try pattern matching first
    for (const [pattern, type, handler] of this.intentPatterns) {
      if (pattern.test(intent)) {
        return await handler(intent, context, type);
      }
    }

    // Fall back to AI-based intent classification
    return await this.aiClassifyIntent(intent, context);
  }

  async handleDataRetrieval(intent, context, type) {
    const entities = await this.extractEntities(intent);
    const query = await this.buildQuery(entities, context);
    
    return {
      action_type: 'database_query',
      query: query,
      entities: entities,
      confidence: 0.9,
      human_readable: `Retrieving ${entities.target} with filters: ${entities.filters.join(', ')}`
    };
  }
}
```

### Smart Parameter Extraction

```javascript
class ParameterExtractor {
  async extractFromIntent(intent, context) {
    const extraction = {
      explicit_params: {},
      inferred_params: {},
      missing_params: [],
      ambiguous_params: []
    };

    // Extract explicit parameters
    extraction.explicit_params = await this.findExplicitParams(intent);
    
    // Infer parameters from context
    extraction.inferred_params = await this.inferFromContext(intent, context);
    
    // Identify missing required parameters
    extraction.missing_params = await this.findMissingParams(extraction);
    
    // Flag ambiguous parameters for clarification
    extraction.ambiguous_params = await this.findAmbiguousParams(intent);

    return extraction;
  }

  async findExplicitParams(intent) {
    const patterns = {
      email: /[\w\.-]+@[\w\.-]+\.\w+/g,
      date: /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
      number: /\b\d+\.?\d*\b/g,
      currency: /\$\d+\.?\d*/g,
      id: /id[:\s]*(\w+)/i
    };

    const params = {};
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = intent.match(pattern);
      if (matches) {
        params[type] = matches;
      }
    }

    return params;
  }

  async generateClarificationQuestions(ambiguous_params) {
    return ambiguous_params.map(param => ({
      parameter: param.name,
      question: param.question,
      options: param.possible_values,
      required: param.required
    }));
  }
}
```

### Smart Endpoint Resolution

```javascript
class EndpointResolver {
  constructor() {
    this.endpointMap = new Map();
    this.setupEndpointMappings();
  }

  setupEndpointMappings() {
    // Map semantic intents to actual API endpoints
    this.mapIntent('get_user_profile', {
      method: 'GET',
      path: '/api/users/{user_id}/profile',
      auth_required: true,
      rate_limit: '100/hour'
    });

    this.mapIntent('update_user_settings', {
      method: 'PATCH',
      path: '/api/users/{user_id}/settings',
      auth_required: true,
      validation: 'user_settings_schema'
    });

    this.mapIntent('create_report', {
      method: 'POST',
      path: '/api/reports',
      auth_required: true,
      async: true,
      webhook_completion: true
    });
  }

  async resolveIntent(intent_analysis) {
    const mapping = this.endpointMap.get(intent_analysis.primary_intent);
    
    if (!mapping) {
      return await this.dynamicResolve(intent_analysis);
    }

    // Build actual API call
    const resolved = {
      ...mapping,
      resolved_path: this.resolvePath(mapping.path, intent_analysis.parameters),
      headers: await this.buildHeaders(mapping, intent_analysis),
      body: await this.buildRequestBody(mapping, intent_analysis)
    };

    return resolved;
  }

  async dynamicResolve(intent_analysis) {
    // Use AI to suggest new endpoint mappings for unknown intents
    const suggestion = await this.suggestEndpoint(intent_analysis);
    
    return {
      suggestion: suggestion,
      confidence: suggestion.confidence,
      requires_implementation: true,
      prototype_code: suggestion.implementation_example
    };
  }
}
```

---

## Streaming Intelligence

### Real-Time Semantic Processing

For complex operations, stream the AI's reasoning process to the client.

```javascript
class StreamingSemanticAPI {
  constructor() {
    this.activeStreams = new Map();
  }

  async streamWorkflow(workflowId, sessionId, response) {
    const streamId = `${sessionId}-${workflowId}`;
    
    // Set up Server-Sent Events
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = {
      id: streamId,
      response: response,
      startTime: Date.now(),
      lastActivity: Date.now()
    };

    this.activeStreams.set(streamId, stream);

    // Send initial connection confirmation
    this.sendStreamEvent(streamId, 'connected', {
      stream_id: streamId,
      workflow_id: workflowId,
      session_id: sessionId
    });

    return streamId;
  }

  sendStreamEvent(streamId, eventType, data) {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return;

    const event = {
      id: Date.now(),
      event: eventType,
      data: data,
      timestamp: new Date().toISOString()
    };

    // Send as Server-Sent Event
    stream.response.write(`id: ${event.id}\n`);
    stream.response.write(`event: ${eventType}\n`);
    stream.response.write(`data: ${JSON.stringify(event)}\n\n`);

    stream.lastActivity = Date.now();
  }

  async executeStreamingWorkflow(workflowType, parameters, streamId) {
    try {
      // Send workflow start
      this.sendStreamEvent(streamId, 'workflow_start', {
        workflow_type: workflowType,
        total_steps: parameters.estimated_steps || 'unknown'
      });

      // Execute workflow with streaming updates
      const workflow = await this.getWorkflow(workflowType);
      
      for (let step = 1; step <= workflow.steps.length; step++) {
        // Send step start
        this.sendStreamEvent(streamId, 'step_start', {
          step: step,
          total: workflow.steps.length,
          name: workflow.steps[step - 1].name
        });

        // Execute step
        const stepResult = await this.executeWorkflowStep(workflow, step, parameters);

        // Send step progress updates
        if (stepResult.progress_updates) {
          for (const update of stepResult.progress_updates) {
            this.sendStreamEvent(streamId, 'step_progress', update);
          }
        }

        // Send step completion
        this.sendStreamEvent(streamId, 'step_complete', {
          step: step,
          result: stepResult.summary,
          confidence: stepResult.confidence
        });
      }

      // Send final completion
      this.sendStreamEvent(streamId, 'workflow_complete', {
        success: true,
        final_result: workflow.final_result
      });

    } catch (error) {
      this.sendStreamEvent(streamId, 'error', {
        error: error.message,
        step: workflow.current_step,
        recoverable: error.recoverable || false
      });
    } finally {
      this.closeStream(streamId);
    }
  }
}
```

### WebSocket Implementation for Interactive APIs

```javascript
import { WebSocketServer } from 'ws';

class InteractiveSemanticAPI {
  constructor() {
    this.wss = new WebSocketServer({ port: 8080 });
    this.setupWebSocketHandling();
  }

  setupWebSocketHandling() {
    this.wss.on('connection', (ws, req) => {
      const sessionId = this.generateSessionId();
      ws.sessionId = sessionId;
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleWebSocketMessage(ws, message);
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            error: error.message
          }));
        }
      });

      ws.on('close', () => {
        this.cleanupSession(sessionId);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        session_id: sessionId,
        capabilities: this.getAPICapabilities()
      }));
    });
  }

  async handleWebSocketMessage(ws, message) {
    switch (message.type) {
      case 'intent':
        await this.processIntent(ws, message);
        break;
      case 'clarification':
        await this.processClarification(ws, message);
        break;
      case 'workflow_control':
        await this.processWorkflowControl(ws, message);
        break;
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${message.type}`
        }));
    }
  }

  async processIntent(ws, message) {
    // Send immediate acknowledgment
    ws.send(JSON.stringify({
      type: 'intent_received',
      message_id: message.id,
      processing: true
    }));

    // Analyze intent
    const analysis = await this.analyzeIntent(message.intent, message.context);

    // Send analysis results
    ws.send(JSON.stringify({
      type: 'intent_analysis',
      message_id: message.id,
      confidence: analysis.confidence,
      understanding: analysis.understanding,
      proposed_actions: analysis.actions
    }));

    // If high confidence, proceed with execution
    if (analysis.confidence > 0.8) {
      await this.executeActions(ws, analysis.actions, message.id);
    } else {
      // Request clarification
      ws.send(JSON.stringify({
        type: 'clarification_needed',
        message_id: message.id,
        questions: analysis.clarification_questions
      }));
    }
  }
}
```

---

## Authentication & Authorization

### Intent-Based Authorization

Traditional APIs protect endpoints. Semantic APIs protect capabilities and intentions.

```javascript
class SemanticAuthManager {
  constructor() {
    this.intentPermissions = new Map();
    this.setupIntentPermissions();
  }

  setupIntentPermissions() {
    // Define permissions by intent categories, not just endpoints
    this.permitIntent('data_read', {
      scopes: ['read:own_data', 'read:public_data'],
      conditions: ['user_authenticated'],
      rate_limits: {
        per_minute: 100,
        per_hour: 1000
      }
    });

    this.permitIntent('data_write', {
      scopes: ['write:own_data'],
      conditions: ['user_authenticated', 'email_verified'],
      requires_confirmation: true,
      rate_limits: {
        per_minute: 10,
        per_hour: 100
      }
    });

    this.permitIntent('admin_actions', {
      scopes: ['admin:full_access'],
      conditions: ['user_authenticated', 'admin_role', 'mfa_verified'],
      audit_required: true,
      rate_limits: {
        per_minute: 5,
        per_hour: 50
      }
    });
  }

  async authorizeIntent(intent_analysis, user_context) {
    const auth_result = {
      authorized: false,
      permissions_granted: [],
      restrictions: [],
      audit_entry: null
    };

    // Check primary intent authorization
    const primary_permission = await this.checkIntentPermission(
      intent_analysis.primary_intent,
      user_context
    );

    if (!primary_permission.allowed) {
      auth_result.restrictions.push(primary_permission.reason);
      return auth_result;
    }

    // Check secondary intents (side effects)
    for (const secondary_intent of intent_analysis.secondary_intents || []) {
      const secondary_permission = await this.checkIntentPermission(
        secondary_intent,
        user_context
      );

      if (!secondary_permission.allowed) {
        auth_result.restrictions.push(
          `Secondary action not permitted: ${secondary_permission.reason}`
        );
        return auth_result;
      }
    }

    // Check resource-level permissions
    const resource_check = await this.checkResourceAccess(
      intent_analysis.target_resources,
      user_context
    );

    if (!resource_check.all_authorized) {
      auth_result.restrictions.push(...resource_check.denied_resources);
      return auth_result;
    }

    // All checks passed
    auth_result.authorized = true;
    auth_result.permissions_granted = [
      primary_permission.scope,
      ...resource_check.granted_permissions
    ];

    // Create audit entry for sensitive operations
    if (primary_permission.audit_required) {
      auth_result.audit_entry = await this.createAuditEntry(
        intent_analysis,
        user_context,
        auth_result
      );
    }

    return auth_result;
  }

  async checkIntentPermission(intent, user_context) {
    const permission = this.intentPermissions.get(intent);
    if (!permission) {
      return { allowed: false, reason: 'Intent not recognized' };
    }

    // Check scopes
    const user_scopes = user_context.scopes || [];
    const required_scopes = permission.scopes || [];
    
    if (!this.hasRequiredScopes(user_scopes, required_scopes)) {
      return { allowed: false, reason: 'Insufficient scopes' };
    }

    // Check conditions
    for (const condition of permission.conditions || []) {
      const condition_met = await this.checkCondition(condition, user_context);
      if (!condition_met) {
        return { allowed: false, reason: `Condition not met: ${condition}` };
      }
    }

    // Check rate limits
    const rate_limit_ok = await this.checkRateLimit(intent, user_context, permission.rate_limits);
    if (!rate_limit_ok) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    return { 
      allowed: true, 
      scope: permission.scopes[0],
      audit_required: permission.audit_required || false
    };
  }
}
```

### API Key Management for AI Services

```javascript
class AIServiceAuthProvider {
  constructor() {
    this.serviceKeys = new Map();
    this.usageTracking = new Map();
  }

  async authenticateRequest(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const semanticToken = req.headers['x-semantic-token'];

    if (!apiKey && !semanticToken) {
      return res.status(401).json({
        error: 'Authentication required',
        supported_methods: ['api_key', 'semantic_token']
      });
    }

    let auth_context;

    if (semanticToken) {
      // Semantic token includes intent information
      auth_context = await this.validateSemanticToken(semanticToken);
    } else {
      // Traditional API key
      auth_context = await this.validateAPIKey(apiKey);
    }

    if (!auth_context.valid) {
      return res.status(401).json({
        error: 'Invalid authentication',
        reason: auth_context.reason
      });
    }

    // Add auth context to request
    req.auth = auth_context;
    req.user = auth_context.user;
    req.scopes = auth_context.scopes;

    // Track usage
    await this.trackUsage(auth_context, req);

    next();
  }

  async validateSemanticToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.SEMANTIC_SECRET);
      
      return {
        valid: true,
        user: decoded.user,
        scopes: decoded.scopes,
        intent_permissions: decoded.intent_permissions,
        expires_at: decoded.exp,
        token_type: 'semantic'
      };
    } catch (error) {
      return {
        valid: false,
        reason: error.message
      };
    }
  }

  generateSemanticToken(user, intended_actions) {
    const token_data = {
      user: user,
      scopes: this.calculateRequiredScopes(intended_actions),
      intent_permissions: intended_actions.map(action => action.permission_required),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    return jwt.sign(token_data, process.env.SEMANTIC_SECRET);
  }
}
```

---

## SDK Development

### Multi-Language SDK Generation

```javascript
// SDK Generator for Semantic APIs
class SemanticSDKGenerator {
  constructor(apiSpec) {
    this.apiSpec = apiSpec;
    this.templates = new Map();
    this.setupLanguageTemplates();
  }

  setupLanguageTemplates() {
    this.templates.set('javascript', new JavaScriptSDKTemplate());
    this.templates.set('python', new PythonSDKTemplate());
    this.templates.set('go', new GoSDKTemplate());
    this.templates.set('rust', new RustSDKTemplate());
  }

  async generateSDK(language) {
    const template = this.templates.get(language);
    if (!template) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const sdk = {
      client: await template.generateClient(this.apiSpec),
      intent_helpers: await template.generateIntentHelpers(this.apiSpec),
      streaming: await template.generateStreamingClient(this.apiSpec),
      auth: await template.generateAuthHelpers(this.apiSpec),
      examples: await template.generateExamples(this.apiSpec)
    };

    return sdk;
  }
}

// JavaScript SDK Template
class JavaScriptSDKTemplate {
  async generateClient(apiSpec) {
    return `
class SemanticAPIClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '${apiSpec.baseURL}';
    this.apiKey = options.apiKey;
    this.sessionId = options.sessionId || this.generateSessionId();
    this.defaultTimeout = options.timeout || 30000;
  }

  // Main semantic interface
  async understand(intent, context = {}) {
    const response = await this.request('/api/v1/understand', {
      method: 'POST',
      body: {
        intent,
        context: {
          ...context,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        }
      }
    });

    return new SemanticResponse(response);
  }

  // Streaming workflow execution
  async executeWorkflow(workflowType, parameters = {}) {
    const streamId = await this.request('/api/v1/workflow', {
      method: 'POST',
      body: {
        workflow_type: workflowType,
        parameters,
        stream: true,
        session_id: this.sessionId
      }
    });

    return new WorkflowStream(streamId, this);
  }

  // Intent-based helpers
  async getMyData(description) {
    return this.understand(\`Get my \${description}\`, {
      operation_type: 'data_retrieval',
      user_scoped: true
    });
  }

  async updateMySettings(changes) {
    return this.understand(\`Update my settings: \${changes}\`, {
      operation_type: 'data_modification',
      user_scoped: true,
      requires_confirmation: true
    });
  }

  async analyzeData(dataset, analysisType) {
    return this.executeWorkflow('analysis', {
      dataset,
      analysis_type: analysisType,
      output_format: 'detailed_report'
    });
  }

  // Low-level request helper
  async request(endpoint, options) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      'X-Session-ID': this.sessionId,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw new SemanticAPIError(await response.json());
    }

    return response.json();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }
}

class SemanticResponse {
  constructor(rawResponse) {
    this.raw = rawResponse;
    this.success = rawResponse.success;
    this.confidence = rawResponse.metadata?.confidence || 0;
    this.understanding = rawResponse.data?.[0]?.understanding;
    this.actions = rawResponse.data?.[0]?.actions || [];
    this.alternatives = rawResponse.data?.[0]?.alternatives || [];
  }

  isConfident(threshold = 0.8) {
    return this.confidence >= threshold;
  }

  needsClarification() {
    return this.confidence < 0.8 || this.alternatives.length > 0;
  }

  async execute() {
    if (!this.isConfident()) {
      throw new Error('Response confidence too low for automatic execution');
    }

    // Execute the recommended actions
    const results = [];
    for (const action of this.actions) {
      const result = await this.executeAction(action);
      results.push(result);
    }
    return results;
  }
}

class WorkflowStream {
  constructor(streamId, client) {
    this.streamId = streamId;
    this.client = client;
    this.eventSource = null;
    this.handlers = new Map();
  }

  on(eventType, handler) {
    this.handlers.set(eventType, handler);
    return this;
  }

  async start() {
    const url = \`\${this.client.baseURL}/api/v1/stream/\${this.streamId}\`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const handler = this.handlers.get(data.event);
      if (handler) {
        handler(data.data);
      }
    };

    this.eventSource.onerror = (error) => {
      const handler = this.handlers.get('error');
      if (handler) {
        handler(error);
      }
    };

    return this;
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SemanticAPIClient, SemanticResponse, WorkflowStream };
}
`;
  }

  async generateIntentHelpers(apiSpec) {
    return `
// Intent-based helper functions
class SemanticHelpers {
  constructor(client) {
    this.client = client;
  }

  // Data operations
  async findData(description, filters = {}) {
    return this.client.understand(\`Find \${description}\`, {
      operation: 'search',
      filters,
      intent_category: 'data_retrieval'
    });
  }

  async createData(description, data = {}) {
    return this.client.understand(\`Create \${description}\`, {
      operation: 'create',
      data,
      intent_category: 'data_creation'
    });
  }

  // Analytics operations
  async generateReport(description, parameters = {}) {
    return this.client.executeWorkflow('analytics', {
      report_description: description,
      ...parameters
    });
  }

  async visualizeData(description, dataset) {
    return this.client.understand(\`Create visualization: \${description}\`, {
      operation: 'visualization',
      dataset,
      intent_category: 'data_visualization'
    });
  }

  // Automation operations
  async automateTask(description, triggers = {}) {
    return this.client.understand(\`Automate: \${description}\`, {
      operation: 'automation',
      triggers,
      intent_category: 'task_automation'
    });
  }

  // AI operations
  async analyzeWithAI(description, data, model = 'default') {
    return this.client.executeWorkflow('ai_analysis', {
      analysis_description: description,
      input_data: data,
      ai_model: model
    });
  }
}
`;
  }
}

// Python SDK Template  
class PythonSDKTemplate {
  async generateClient(apiSpec) {
    return `
import json
import asyncio
import aiohttp
from typing import Dict, List, Optional, AsyncGenerator
from dataclasses import dataclass

@dataclass
class SemanticResponse:
    success: bool
    confidence: float
    understanding: Dict
    actions: List[Dict]
    alternatives: List[Dict]
    raw: Dict

    def is_confident(self, threshold: float = 0.8) -> bool:
        return self.confidence >= threshold

    def needs_clarification(self) -> bool:
        return self.confidence < 0.8 or len(self.alternatives) > 0

class SemanticAPIClient:
    def __init__(self, base_url: str, api_key: str, session_id: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session_id = session_id or self._generate_session_id()
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def understand(self, intent: str, context: Dict = None) -> SemanticResponse:
        context = context or {}
        
        async with self.session.post(
            f"{self.base_url}/api/v1/understand",
            json={
                "intent": intent,
                "context": {
                    **context,
                    "session_id": self.session_id
                }
            },
            headers={"X-API-Key": self.api_key}
        ) as response:
            data = await response.json()
            
            return SemanticResponse(
                success=data.get("success", False),
                confidence=data.get("metadata", {}).get("confidence", 0),
                understanding=data.get("data", [{}])[0].get("understanding", {}),
                actions=data.get("data", [{}])[0].get("actions", []),
                alternatives=data.get("data", [{}])[0].get("alternatives", []),
                raw=data
            )

    async def execute_workflow(self, workflow_type: str, parameters: Dict = None) -> AsyncGenerator[Dict, None]:
        parameters = parameters or {}
        
        async with self.session.post(
            f"{self.base_url}/api/v1/workflow",
            json={
                "workflow_type": workflow_type,
                "parameters": parameters,
                "stream": True,
                "session_id": self.session_id
            },
            headers={"X-API-Key": self.api_key}
        ) as response:
            async for line in response.content:
                if line.startswith(b"data: "):
                    try:
                        event_data = json.loads(line[6:].decode())
                        yield event_data
                    except json.JSONDecodeError:
                        continue

    # Helper methods
    async def get_my_data(self, description: str) -> SemanticResponse:
        return await self.understand(
            f"Get my {description}",
            {"operation_type": "data_retrieval", "user_scoped": True}
        )

    async def update_my_settings(self, changes: str) -> SemanticResponse:
        return await self.understand(
            f"Update my settings: {changes}",
            {
                "operation_type": "data_modification",
                "user_scoped": True,
                "requires_confirmation": True
            }
        )

    def _generate_session_id(self) -> str:
        import uuid
        return f"session_{uuid.uuid4().hex[:9]}"

# Usage example
async def main():
    async with SemanticAPIClient("https://api.example.com", "your-api-key") as client:
        response = await client.understand("Show me my recent orders")
        if response.is_confident():
            print(f"Understanding: {response.understanding}")
            print(f"Actions: {response.actions}")
        else:
            print("Needs clarification")

if __name__ == "__main__":
    asyncio.run(main())
`;
  }
}
```

### SDK Documentation Generation

```javascript
class SDKDocumentationGenerator {
  async generateDocumentation(sdks, apiSpec) {
    const docs = {
      quickstart: await this.generateQuickstart(sdks),
      api_reference: await this.generateAPIReference(apiSpec),
      examples: await this.generateExamples(sdks),
      best_practices: await this.generateBestPractices()
    };

    return docs;
  }

  async generateQuickstart(sdks) {
    return `
# Quick Start Guide

## Installation

### JavaScript/Node.js
\`\`\`bash
npm install semantic-api-client
\`\`\`

### Python
\`\`\`bash
pip install semantic-api-client
\`\`\`

## Basic Usage

### JavaScript
\`\`\`javascript
import { SemanticAPIClient } from 'semantic-api-client';

const client = new SemanticAPIClient({
  baseURL: 'https://your-api.com',
  apiKey: 'your-api-key'
});

// Natural language API calls
const response = await client.understand("Show me sales data for last month");

if (response.isConfident()) {
  const results = await response.execute();
  console.log(results);
} else {
  console.log("Need clarification:", response.alternatives);
}
\`\`\`

### Python
\`\`\`python
from semantic_api_client import SemanticAPIClient

async with SemanticAPIClient("https://your-api.com", "your-api-key") as client:
    response = await client.understand("Show me sales data for last month")
    
    if response.is_confident():
        print(f"Found: {response.understanding}")
    else:
        print(f"Need clarification: {response.alternatives}")
\`\`\`

## Key Concepts

### Intent-Based Requests
Instead of learning specific endpoints, describe what you want:

\`\`\`javascript
// Traditional API
const users = await api.get('/users', { params: { active: true, limit: 10 } });

// Semantic API
const users = await client.understand("Get 10 active users");
\`\`\`

### Confidence Levels
The API returns confidence scores for its understanding:

- **> 0.8**: High confidence, safe to auto-execute
- **0.5-0.8**: Medium confidence, may suggest alternatives
- **< 0.5**: Low confidence, requires clarification

### Streaming Workflows
For complex operations, use streaming workflows:

\`\`\`javascript
const workflow = await client.executeWorkflow('analysis', {
  dataset: 'sales_data',
  analysis_type: 'trends'
});

workflow
  .on('step_complete', (step) => console.log(\`Completed: \${step.name}\`))
  .on('workflow_complete', (result) => console.log('Final result:', result))
  .start();
\`\`\`
`;
  }
}
```

---

## Error Handling & Fallbacks

### Graceful Degradation Strategies

```javascript
class SemanticErrorHandler {
  constructor() {
    this.fallbackStrategies = new Map();
    this.setupFallbacks();
  }

  setupFallbacks() {
    // Intent understanding failures
    this.fallbackStrategies.set('intent_unclear', {
      strategy: 'clarification_questions',
      handler: this.handleUnclearIntent.bind(this)
    });

    // API service unavailable
    this.fallbackStrategies.set('service_unavailable', {
      strategy: 'cached_response',
      handler: this.handleServiceUnavailable.bind(this)
    });

    // Confidence too low
    this.fallbackStrategies.set('low_confidence', {
      strategy: 'alternative_suggestions',
      handler: this.handleLowConfidence.bind(this)
    });

    // Rate limit exceeded
    this.fallbackStrategies.set('rate_limited', {
      strategy: 'queue_request',
      handler: this.handleRateLimit.bind(this)
    });
  }

  async handleSemanticError(error, originalRequest, context) {
    const errorType = this.classifyError(error);
    const fallback = this.fallbackStrategies.get(errorType);

    if (!fallback) {
      return this.handleUnknownError(error, originalRequest);
    }

    try {
      return await fallback.handler(error, originalRequest, context);
    } catch (fallbackError) {
      return this.handleFallbackFailure(error, fallbackError, originalRequest);
    }
  }

  async handleUnclearIntent(error, originalRequest, context) {
    return {
      error_type: 'intent_unclear',
      fallback_response: {
        message: "I'm not quite sure what you're looking for. Let me ask a few questions to help:",
        clarification_questions: [
          {
            question: "What type of data are you interested in?",
            options: ['user_data', 'analytics', 'reports', 'settings']
          },
          {
            question: "What time period should I focus on?",
            options: ['today', 'this_week', 'this_month', 'custom_range']
          }
        ],
        suggested_intents: [
          "Show me user analytics for this week",
          "Get recent activity reports",
          "Find my account settings"
        ]
      },
      recovery_instructions: "Please provide more specific details or choose from the suggested intents."
    };
  }

  async handleServiceUnavailable(error, originalRequest, context) {
    // Check cache for similar requests
    const cachedResponse = await this.checkCache(originalRequest);
    
    if (cachedResponse) {
      return {
        error_type: 'service_unavailable',
        fallback_response: cachedResponse,
        fallback_used: 'cached_data',
        warning: 'Using cached data due to service unavailability',
        cache_age: cachedResponse.age,
        retry_suggestion: 'Try again in a few minutes for fresh data'
      };
    }

    // No cache available, suggest alternative approaches
    return {
      error_type: 'service_unavailable',
      fallback_response: {
        message: "The semantic analysis service is temporarily unavailable.",
        alternative_approaches: [
          "Use the traditional REST API endpoints directly",
          "Queue your request for processing when service returns",
          "Use simplified query mode with basic pattern matching"
        ]
      },
      queue_option: {
        can_queue: true,
        estimated_processing_time: "5-10 minutes",
        queue_endpoint: "/api/v1/queue-request"
      }
    };
  }

  async handleLowConfidence(error, originalRequest, context) {
    return {
      error_type: 'low_confidence',
      confidence_score: error.confidence,
      fallback_response: {
        message: `I'm ${Math.round(error.confidence * 100)}% confident about this interpretation.`,
        my_understanding: error.best_interpretation,
        alternatives: error.alternative_interpretations,
        suggestions: [
          "Choose one of the alternative interpretations",
          "Provide more specific details",
          "Use traditional API endpoints for precise control"
        ]
      },
      progressive_assistance: {
        next_question: "Which of these interpretations is closest to what you want?",
        learning_opportunity: true,
        improves_future_requests: true
      }
    };
  }

  async handleRateLimit(error, originalRequest, context) {
    return {
      error_type: 'rate_limited',
      retry_after: error.retry_after,
      fallback_response: {
        message: "You've reached the rate limit for semantic API requests.",
        current_usage: error.current_usage,
        limit_details: error.limit_details,
        upgrade_options: error.upgrade_options
      },
      immediate_options: [
        {
          option: 'queue_request',
          description: 'Queue this request for processing when rate limit resets',
          estimated_delay: error.retry_after
        },
        {
          option: 'use_cached_similar',
          description: 'Use cached results from a similar recent request',
          available: await this.hasSimilarCachedRequest(originalRequest)
        },
        {
          option: 'simplified_processing',
          description: 'Process with simpler, faster algorithms that use fewer resources',
          accuracy_impact: 'minor'
        }
      ]
    };
  }
}
```

### Client-Side Resilience

```javascript
class ResilientSemanticClient {
  constructor(options) {
    this.baseClient = new SemanticAPIClient(options);
    this.errorHandler = new SemanticErrorHandler();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryableErrors: ['service_unavailable', 'timeout', 'rate_limited']
    };
    this.circuitBreaker = new CircuitBreaker({
      threshold: 5,
      timeout: 30000,
      resetTimeout: 60000
    });
  }

  async understand(intent, context = {}, options = {}) {
    return this.withResilience(
      () => this.baseClient.understand(intent, context),
      { intent, context },
      options
    );
  }

  async withResilience(operation, originalRequest, options = {}) {
    const maxRetries = options.maxRetries || this.retryConfig.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check circuit breaker
        if (this.circuitBreaker.isOpen()) {
          throw new Error('Circuit breaker is open - service appears to be down');
        }

        const result = await operation();
        
        // Reset circuit breaker on success
        this.circuitBreaker.onSuccess();
        
        return result;

      } catch (error) {
        lastError = error;
        
        // Record failure in circuit breaker
        this.circuitBreaker.onFailure();

        // Don't retry on final attempt
        if (attempt === maxRetries) {
          break;
        }

        // Check if error is retryable
        const errorType = this.errorHandler.classifyError(error);
        if (!this.retryConfig.retryableErrors.includes(errorType)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt),
          this.retryConfig.maxDelay
        );

        await this.delay(delay);
      }
    }

    // All retries failed, handle with fallback strategies
    return this.errorHandler.handleSemanticError(lastError, originalRequest);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class CircuitBreaker {
  constructor({ threshold, timeout, resetTimeout }) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.resetTimeout = resetTimeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  isOpen() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## API Documentation

### Self-Describing Semantic APIs

```javascript
class SemanticAPIDocumentation {
  constructor(apiSpec) {
    this.apiSpec = apiSpec;
    this.intentExamples = new Map();
    this.setupDocumentation();
  }

  async generateInteractiveDocumentation() {
    return {
      metadata: await this.generateMetadata(),
      capabilities: await this.generateCapabilities(),
      intent_examples: await this.generateIntentExamples(),
      interactive_playground: await this.generatePlayground(),
      sdk_documentation: await this.generateSDKDocs(),
      best_practices: await this.generateBestPractices()
    };
  }

  async generateCapabilities() {
    return {
      understanding: {
        natural_language_intents: true,
        context_awareness: true,
        ambiguity_resolution: true,
        confidence_scoring: true
      },
      execution: {
        workflow_orchestration: true,
        streaming_responses: true,
        batch_processing: true,
        async_operations: true
      },
      integration: {
        rest_api: true,
        websockets: true,
        webhooks: true,
        server_sent_events: true
      },
      supported_languages: [
        'javascript', 'python', 'go', 'rust', 'java'
      ],
      intent_categories: [
        'data_retrieval', 'data_modification', 'analytics',
        'automation', 'reporting', 'ai_analysis'
      ]
    };
  }

  async generateIntentExamples() {
    return {
      data_operations: {
        examples: [
          {
            intent: "Show me all users who signed up last week",
            confidence: 0.95,
            mapped_to: "GET /api/users?created_after=last_week",
            parameters: {
              timeframe: "last_week",
              entity: "users",
              operation: "retrieve"
            }
          },
          {
            intent: "Update my email preferences to reduce notifications",
            confidence: 0.88,
            mapped_to: "PATCH /api/users/{id}/preferences",
            parameters: {
              preference_type: "email_notifications",
              direction: "reduce",
              entity: "user_preferences"
            },
            requires_confirmation: true
          }
        ]
      },
      analytics: {
        examples: [
          {
            intent: "Generate a sales report for Q4 with regional breakdown",
            confidence: 0.92,
            mapped_to: "workflow:analytics/sales_report",
            parameters: {
              period: "Q4",
              breakdown: "regional",
              report_type: "sales"
            },
            estimated_duration: "30-60 seconds"
          }
        ]
      },
      automation: {
        examples: [
          {
            intent: "Send welcome emails to new users automatically",
            confidence: 0.85,
            mapped_to: "workflow:automation/user_onboarding",
            parameters: {
              trigger: "user_created",
              action: "send_welcome_email",
              automation_type: "event_triggered"
            },
            creates_persistent_automation: true
          }
        ]
      }
    };
  }

  async generatePlayground() {
    return {
      interactive_examples: [
        {
          title: "Try Your First Semantic Request",
          intent: "Show me recent activity",
          explanation: "This demonstrates basic intent understanding",
          expected_response: {
            confidence: 0.9,
            understanding: "User wants to see recent activity data",
            actions: ["fetch_recent_activity"],
            clarifications: []
          }
        },
        {
          title: "Ambiguous Intent Resolution",
          intent: "Get the reports",
          explanation: "This shows how the API handles ambiguous requests",
          expected_response: {
            confidence: 0.6,
            understanding: "User wants reports, but type unclear",
            clarifications: [
              "What type of reports? (sales, analytics, user activity)",
              "What time period? (today, this week, this month)"
            ]
          }
        }
      ],
      live_testing: {
        endpoint: "/api/v1/playground",
        allows_test_requests: true,
        rate_limit: "100 requests per hour",
        authentication: "demo_token_provided"
      }
    };
  }

  async generateBestPractices() {
    return `
# Best Practices for Semantic APIs

## Writing Effective Intents

### ✅ Good Intent Examples
- "Show me users who haven't logged in for 30 days"
- "Create a backup of the database scheduled for midnight"
- "Generate a performance report comparing this month to last month"

### ❌ Poor Intent Examples
- "Get stuff" (too vague)
- "Do the thing with the data" (lacks specificity)
- "Make it faster" (ambiguous action)

## Providing Useful Context

Always include relevant context to improve understanding:

\`\`\`javascript
// Good: Provides context for better understanding
await client.understand("Show me the analytics", {
  time_period: "last_30_days",
  focus_area: "user_engagement",
  output_format: "executive_summary"
});

// Better: Even more specific context
await client.understand("Show me user engagement analytics for the last 30 days as an executive summary", {
  department: "marketing",
  comparison_period: "previous_30_days",
  include_recommendations: true
});
\`\`\`

## Handling Low Confidence Responses

\`\`\`javascript
const response = await client.understand(userIntent);

if (response.confidence < 0.8) {
  // Present alternatives to user
  console.log("I'm not completely sure. Did you mean one of these?");
  response.alternatives.forEach((alt, index) => {
    console.log(\`\${index + 1}. \${alt.description}\`);
  });
  
  // Get user selection
  const selection = await getUserSelection();
  const clarifiedResponse = await client.clarify(response.id, selection);
}
\`\`\`

## Error Handling Strategy

\`\`\`javascript
try {
  const response = await client.understand(intent);
  return response;
} catch (error) {
  if (error.type === 'intent_unclear') {
    return {
      success: false,
      message: "Could you be more specific?",
      suggestions: error.suggestions
    };
  } else if (error.type === 'service_unavailable') {
    return {
      success: false,
      message: "Service temporarily unavailable",
      fallback: error.cached_response,
      retry_after: error.retry_after
    };
  }
  throw error; // Re-throw unexpected errors
}
\`\`\`

## Performance Optimization

### Use Streaming for Long Operations
\`\`\`javascript
const workflow = await client.executeWorkflow('complex_analysis', params);
workflow.on('progress', (update) => {
  updateProgressBar(update.percentage);
});
\`\`\`

### Cache Frequently Used Patterns
\`\`\`javascript
// Cache common intent patterns locally
const cache = new SemanticCache();
const cachedResponse = await cache.get(intent);
if (cachedResponse && cachedResponse.confidence > 0.9) {
  return cachedResponse;
}
\`\`\`

### Batch Similar Requests
\`\`\`javascript
// Instead of multiple single requests
const responses = await Promise.all([
  client.understand("Get user count"),
  client.understand("Get active sessions"),
  client.understand("Get error rate")
]);

// Use batch endpoint for related intents
const batchResponse = await client.understandBatch([
  "Get user count",
  "Get active sessions", 
  "Get error rate"
], { context: "dashboard_metrics" });
\`\`\`
`;
  }
}
```

### Auto-Generated API Documentation

```javascript
class LiveDocumentationGenerator {
  constructor(apiServer) {
    this.apiServer = apiServer;
    this.intentAnalyzer = new IntentAnalyzer();
  }

  async generateLiveDocumentation() {
    const documentation = {
      openapi: "3.0.0",
      info: {
        title: "Semantic API",
        version: "1.0.0",
        description: "AI-powered API that understands natural language intents"
      },
      servers: [
        { url: this.apiServer.baseURL, description: "Production server" }
      ],
      paths: await this.generatePaths(),
      components: {
        schemas: await this.generateSchemas(),
        securitySchemes: await this.generateSecuritySchemes()
      }
    };

    // Add semantic-specific extensions
    documentation["x-semantic-capabilities"] = await this.getSemanticCapabilities();
    documentation["x-intent-examples"] = await this.getIntentExamples();
    documentation["x-confidence-thresholds"] = await this.getConfidenceThresholds();

    return documentation;
  }

  async generatePaths() {
    return {
      "/api/v1/understand": {
        post: {
          summary: "Understand natural language intent",
          description: "Convert natural language intent into API actions",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    intent: {
                      type: "string",
                      description: "Natural language description of what you want to accomplish",
                      examples: [
                        "Show me sales data for last month",
                        "Update my password",
                        "Generate a user activity report"
                      ]
                    },
                    context: {
                      type: "object",
                      description: "Additional context to improve understanding",
                      properties: {
                        user_id: { type: "string" },
                        time_period: { type: "string" },
                        filters: { type: "object" },
                        preferences: { type: "object" }
                      }
                    },
                    confidence_threshold: {
                      type: "number",
                      minimum: 0,
                      maximum: 1,
                      default: 0.8,
                      description: "Minimum confidence required for automatic execution"
                    }
                  },
                  required: ["intent"]
                }
              }
            }
          },
          responses: {
            200: {
              description: "Intent successfully understood",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      confidence: { 
                        type: "number",
                        description: "Confidence score between 0 and 1"
                      },
                      understanding: {
                        type: "object",
                        properties: {
                          parsed_intent: { type: "string" },
                          entities: { type: "object" },
                          operation_type: { type: "string" }
                        }
                      },
                      actions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            action_type: { type: "string" },
                            endpoint: { type: "string" },
                            parameters: { type: "object" },
                            requires_confirmation: { type: "boolean" }
                          }
                        }
                      },
                      alternatives: {
                        type: "array",
                        description: "Alternative interpretations if confidence is low"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  async getSemanticCapabilities() {
    return {
      intent_understanding: {
        natural_language_processing: true,
        context_awareness: true,
        ambiguity_resolution: true,
        entity_extraction: true
      },
      supported_operations: [
        "data_retrieval",
        "data_modification", 
        "analytics_generation",
        "workflow_automation",
        "report_creation"
      ],
      confidence_levels: {
        high: "> 0.8 - Safe for automatic execution",
        medium: "0.5-0.8 - May suggest alternatives",
        low: "< 0.5 - Requires clarification"
      }
    };
  }
}
```

---

## Putting It All Together: Complete Implementation

Here's how all these pieces work together in a production semantic API:

```javascript
// Main application entry point
import express from 'express';
import { SemanticAPIServer } from './semantic-api-server.js';
import { SemanticAPIWrapper } from './api-wrapper.js';
import { SemanticAuthManager } from './auth-manager.js';
import { StreamingSemanticAPI } from './streaming-api.js';
import { LiveDocumentationGenerator } from './documentation.js';

class ProductionSemanticAPI {
  constructor() {
    this.app = express();
    this.mcpServer = new SemanticAPIServer();
    this.apiWrapper = new SemanticAPIWrapper();
    this.authManager = new SemanticAuthManager();
    this.streamingAPI = new StreamingSemanticAPI();
    this.docGenerator = new LiveDocumentationGenerator(this);
  }

  async initialize() {
    // Initialize MCP server
    await this.mcpServer.initialize();
    
    // Setup middleware
    this.app.use(express.json());
    this.app.use(this.authManager.authenticateRequest.bind(this.authManager));
    this.app.use(this.setupCORS());
    this.app.use(this.setupRateLimit());
    
    // Setup routes
    this.setupSemanticRoutes();
    this.setupStreamingRoutes();
    this.setupDocumentationRoutes();
    
    // Error handling
    this.app.use(this.handleErrors.bind(this));
  }

  setupSemanticRoutes() {
    // Primary semantic understanding endpoint
    this.app.post('/api/v1/understand', async (req, res) => {
      try {
        const auth_result = await this.authManager.authorizeIntent(
          await this.analyzeIntent(req.body.intent),
          req.user
        );

        if (!auth_result.authorized) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            restrictions: auth_result.restrictions
          });
        }

        const result = await this.mcpServer.handleIntentUnderstanding({
          intent: req.body.intent,
          context: req.body.context,
          session_id: req.session.id
        });

        res.json(this.formatResponse(result));
      } catch (error) {
        this.handleRequestError(error, req, res);
      }
    });

    // Workflow execution endpoint
    this.app.post('/api/v1/workflow', async (req, res) => {
      const { workflow_type, parameters, stream } = req.body;

      if (stream) {
        const streamId = await this.streamingAPI.streamWorkflow(
          workflow_type,
          req.session.id,
          res
        );
        
        // Execute workflow with streaming updates
        this.streamingAPI.executeStreamingWorkflow(
          workflow_type,
          parameters,
          streamId
        );
      } else {
        const result = await this.mcpServer.handleWorkflowExecution({
          workflow_type,
          parameters,
          session_id: req.session.id
        });
        
        res.json(this.formatResponse(result));
      }
    });
  }

  async start(port = 3000) {
    await this.initialize();
    
    this.app.listen(port, () => {
      console.log(`🚀 Semantic API server running on port ${port}`);
      console.log(`📖 Documentation: http://localhost:${port}/docs`);
      console.log(`🎮 Playground: http://localhost:${port}/playground`);
    });
  }
}

// Start the server
const api = new ProductionSemanticAPI();
api.start(process.env.PORT || 3000);
```

---

## Conclusion: The Future of API Development

Semantic APIs represent a fundamental shift from **interface-first** to **intent-first** development. Instead of forcing developers to learn your system, you create systems that learn from developers.

Key takeaways for building semantic APIs:

1. **Start with MCP** - The Model Context Protocol provides the perfect foundation for bidirectional AI-human communication
2. **Design for Intent** - Think about what users want to accomplish, not just what data they want to access
3. **Embrace Ambiguity** - Build clarification into your API flow rather than treating it as an error condition
4. **Stream Complex Operations** - Use real-time updates to show the AI's reasoning process
5. **Generate Everything** - SDKs, documentation, and examples should all be generated from your semantic understanding capabilities

The future belongs to APIs that understand human intent and execute with AI intelligence. By following the patterns in this chapter, you're not just building better APIs - you're building the foundation for a new era of human-AI collaboration.

The next chapter will explore how these semantic APIs fit into the broader enterprise transformation that's already beginning across every industry.