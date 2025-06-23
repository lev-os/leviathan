# MCP-CLI Terminal Integration Design for Kingly

## 🎯 **Design Overview**

This document proposes integrating MCP-CLI as a terminal port within Kingly's ports & adapters architecture, enabling seamless terminal access across all use cases while maintaining the universal context system.

## 🏗️ **Architecture Integration**

### **Terminal Port Interface**
```javascript
// src/ports/terminal-interface.js
class TerminalInterface {
  async startInteractiveSession(config) {
    // Start a new terminal session with specified MCP servers
    // Returns: sessionId for tracking
  }
  
  async executeCommand(command, context) {
    // Execute single command with context
    // Returns: command result
  }
  
  async streamResponse(responseHandler) {
    // Stream real-time responses from terminal
    // Calls: responseHandler for each chunk
  }
  
  async listAvailableTools() {
    // Discover tools from connected MCP servers
    // Returns: array of tool definitions
  }
  
  async getSessionHistory() {
    // Retrieve session conversation history
    // Returns: formatted history for context
  }
  
  async terminateSession(sessionId) {
    // Clean shutdown of terminal session
    // Returns: session summary
  }
}
```

### **MCP-CLI Adapter Implementation**
```javascript
// src/adapters/secondary/mcp-cli-adapter.js
class MCPCLIAdapter extends TerminalInterface {
  constructor(config) {
    super();
    this.mcpCliPath = config.mcpCliPath || 'mcp-cli';
    this.sessions = new Map();
    this.eventEmitter = new EventEmitter();
    this.contextMemory = new Map(); // For context sharing
  }

  async startInteractiveSession(config) {
    // Spawn MCP-CLI process with specific configuration
    const session = spawn(this.mcpCliPath, [
      '--mode', config.mode || 'chat',
      '--servers', config.servers.join(','),
      '--model', config.model || 'claude-3-sonnet',
      '--config', this.generateConfigFile(config)
    ]);
    
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, {
      process: session,
      config,
      created: Date.now(),
      lastActivity: Date.now(),
      context: config.initialContext || {}
    });
    
    // Set up event handlers for real-time communication
    session.stdout.on('data', (data) => {
      this.handleSessionOutput(sessionId, data);
    });
    
    session.stderr.on('data', (data) => {
      this.handleSessionError(sessionId, data);
    });
    
    return sessionId;
  }

  async executeCommand(command, context) {
    // For one-shot commands, use command mode
    const result = await this.spawnCommandMode([
      '--mode', 'command',
      '--servers', context.servers?.join(',') || 'ultimate-mcp',
      '--command', command,
      '--context', JSON.stringify(context)
    ]);
    
    return this.parseCommandResult(result);
  }

  async streamResponse(responseHandler) {
    // Set up SSE-like streaming for web interfaces
    this.eventEmitter.on('session_output', responseHandler);
  }
  
  // Context-aware server selection
  selectServersForContext(context) {
    const serverMap = {
      development: ['github', 'filesystem', 'git', 'ultimate-mcp'],
      research: ['brave-search', 'fetch', 'ultimate-mcp'],
      deployment: ['docker', 'kubernetes', 'ultimate-mcp'],
      data_analysis: ['sqlite', 'postgres', 'ultimate-mcp'],
      default: ['ultimate-mcp']
    };
    
    return serverMap[context.type] || serverMap.default;
  }
}
```

### **Kingly MCP Tool Integration**
```javascript
// Integration with existing MCP tool system
const mcpCliTools = {
  'terminal_start': {
    description: 'Start interactive terminal session with MCP servers',
    parameters: {
      type: 'object',
      properties: {
        mode: { 
          type: 'string', 
          enum: ['chat', 'interactive', 'command'],
          default: 'chat'
        },
        servers: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'MCP servers to connect to'
        },
        context: {
          type: 'object',
          description: 'Initial context for terminal session'
        }
      }
    }
  },
  
  'terminal_execute': {
    description: 'Execute command in terminal with context',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string' },
        context: { type: 'object' },
        timeout: { type: 'number', default: 30000 }
      },
      required: ['command']
    }
  },
  
  'terminal_discover': {
    description: 'Discover available tools from MCP servers',
    parameters: {
      type: 'object',
      properties: {
        servers: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Specific servers to query, or all if empty'
        }
      }
    }
  }
};
```

## 🎮 **Use Case Implementations**

### **Use Case 1: Web UI → Background Claude Code**

#### **Architecture**
```
Web Browser → WebSocket → Kingly MCP Server → Terminal Adapter → MCP-CLI
    ↑                                              ↓
    └── Real-time updates ←── Event system ←──────┘
```

#### **Implementation**
```javascript
class WebTerminalBridge {
  constructor(webSocketServer, terminalAdapter) {
    this.wsServer = webSocketServer;
    this.terminal = terminalAdapter;
    this.activeSessions = new Map();
  }

  async handleWebSocketConnection(ws, request) {
    // Extract context from web session
    const webContext = this.extractWebContext(request);
    
    // Start terminal session with web context
    const sessionId = await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers: this.terminal.selectServersForContext(webContext),
      initialContext: webContext
    });
    
    // Link WebSocket to terminal session
    this.activeSessions.set(ws, sessionId);
    
    // Bidirectional data flow
    ws.on('message', async (message) => {
      await this.terminal.sendToSession(sessionId, message);
    });
    
    this.terminal.onSessionOutput(sessionId, (output) => {
      ws.send(JSON.stringify({ type: 'terminal_output', data: output }));
    });
  }
}
```

#### **Web UI Integration**
```html
<!-- Embedded terminal widget -->
<div id="terminal-widget">
  <div class="terminal-header">
    <span>MCP Terminal</span>
    <button onclick="openFullTerminal()">⤢ Expand</button>
  </div>
  <div class="terminal-output" id="terminal-output"></div>
  <input type="text" class="terminal-input" placeholder="Type your command...">
</div>

<script>
class KinglyTerminal {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.ws = new WebSocket('ws://localhost:3000/terminal');
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'terminal_output') {
        this.appendOutput(message.data);
      }
    };
    
    this.container.querySelector('.terminal-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendCommand(e.target.value);
        e.target.value = '';
      }
    });
  }
}
</script>
```

### **Use Case 2: Claude Code ↔ MCP Direct**

#### **Agent Integration**
```javascript
class AgentTerminalIntegration {
  constructor(agent, terminalAdapter) {
    this.agent = agent;
    this.terminal = terminalAdapter;
  }

  async processWithTerminalFallback(task) {
    try {
      // Attempt automated processing
      const result = await this.agent.processTask(task);
      
      if (result.confidence < 0.3) {
        // Drop to terminal for human guidance
        return await this.requestHumanGuidance(task, result);
      }
      
      return result;
    } catch (error) {
      // Error handling via terminal
      return await this.handleErrorViaTerminal(task, error);
    }
  }

  async requestHumanGuidance(task, agentResult) {
    // Start terminal session with full context
    const sessionId = await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers: ['ultimate-mcp'],
      initialContext: {
        task: task,
        agentAttempt: agentResult,
        guidance: 'Agent needs human guidance for this task'
      }
    });
    
    // Send structured message to terminal
    await this.terminal.sendToSession(sessionId, 
      `Agent attempted this task but confidence is low (${agentResult.confidence}).
      
      Task: ${task.description}
      Agent's approach: ${agentResult.reasoning}
      
      Please guide the agent or take over the task.`
    );
    
    // Wait for human intervention
    return await this.waitForHumanResponse(sessionId);
  }
}
```

### **Use Case 3: Claude Desktop via MCP**

#### **Desktop Integration**
```javascript
// Enhanced MCP server with terminal detection
class KinglyMCPServer {
  constructor() {
    super();
    this.terminalSessions = new Map();
  }

  async handleToolCall(name, params) {
    // Detect terminal requests in natural language
    if (this.isTerminalRequest(params.message)) {
      return await this.handleTerminalRequest(params);
    }
    
    return await super.handleToolCall(name, params);
  }

  isTerminalRequest(message) {
    const terminalTriggers = [
      'open terminal', 'terminal mode', 'command line',
      'mcp cli', 'interactive session', 'debug mode'
    ];
    
    return terminalTriggers.some(trigger => 
      message.toLowerCase().includes(trigger)
    );
  }

  async handleTerminalRequest(params) {
    const sessionId = await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers: ['ultimate-mcp'],
      initialContext: { source: 'claude_desktop' }
    });
    
    this.terminalSessions.set(params.conversationId, sessionId);
    
    return {
      content: [{
        type: 'text',
        text: `🖥️ **Terminal Mode Activated**
        
Connected to MCP servers. You can now use terminal commands directly.
Type your commands and I'll execute them via MCP-CLI.

Available servers: Ultimate MCP (100+ tools)
Session ID: ${sessionId.slice(0, 8)}...`
      }]
    };
  }
}
```

### **Use Case 4: CI/CD Pipeline**

#### **Headless Operation with Intervention**
```javascript
class CICDTerminalIntegration {
  constructor(ciConfig, terminalAdapter) {
    this.ciConfig = ciConfig;
    this.terminal = terminalAdapter;
    this.interventionWebhook = ciConfig.interventionWebhook;
  }

  async runWithIntervention(tasks) {
    const results = [];
    
    for (const task of tasks) {
      try {
        const result = await this.processTask(task);
        results.push(result);
      } catch (error) {
        if (this.requiresHumanIntervention(error)) {
          await this.requestIntervention(task, error);
          // Pause CI job here
          throw new Error('HUMAN_INTERVENTION_REQUIRED');
        }
        throw error;
      }
    }
    
    return results;
  }

  async requestIntervention(task, error) {
    // Create accessible terminal session
    const sessionId = await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers: ['ultimate-mcp', 'github', 'docker'],
      initialContext: {
        ciJob: this.ciConfig.jobId,
        task: task,
        error: error,
        environment: process.env
      }
    });
    
    // Send notification with access details
    await this.sendInterventionNotification({
      sessionId,
      accessUrl: `${this.ciConfig.baseUrl}/terminal/${sessionId}`,
      task: task.description,
      error: error.message
    });
  }
}
```

### **Use Case 5: VSCode/Cursor Integration**

#### **Extension Integration**
```javascript
// VS Code Extension
class KinglyVSCodeExtension {
  constructor(context) {
    this.context = context;
    this.terminal = new TerminalAdapter();
    this.registerCommands();
  }

  registerCommands() {
    // Register terminal commands
    vscode.commands.registerCommand('kingly.openTerminal', () => {
      this.openKinglyTerminal();
    });
    
    vscode.commands.registerCommand('kingly.terminalWithContext', () => {
      this.openTerminalWithWorkspaceContext();
    });
  }

  async openTerminalWithWorkspaceContext() {
    // Extract VS Code workspace context
    const workspaceContext = {
      workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
      activeFile: vscode.window.activeTextEditor?.document.fileName,
      selectedText: vscode.window.activeTextEditor?.document.getText(
        vscode.window.activeTextEditor.selection
      ),
      gitBranch: await this.getCurrentGitBranch(),
      openFiles: vscode.workspace.textDocuments.map(doc => doc.fileName)
    };

    // Start terminal with workspace context
    const sessionId = await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers: ['github', 'filesystem', 'git', 'ultimate-mcp'],
      initialContext: workspaceContext
    });

    // Create terminal panel in VS Code
    const terminalPanel = vscode.window.createWebviewPanel(
      'kinglyTerminal',
      'Kingly Terminal',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Load terminal UI
    terminalPanel.webview.html = this.getTerminalHTML(sessionId);
    
    // Handle bidirectional communication
    terminalPanel.webview.onDidReceiveMessage(async (message) => {
      if (message.type === 'terminal_command') {
        await this.terminal.sendToSession(sessionId, message.command);
      }
    });
  }
}
```

### **Use Case 6: Roocode/Boomerang Integration**

#### **Code Analysis Integration**
```javascript
class RoocodeTerminalIntegration {
  constructor(roocodeInstance, terminalAdapter) {
    this.roocode = roocodeInstance;
    this.terminal = terminalAdapter;
  }

  async analyzeWithTerminalIntervention(codebasePath) {
    // Start Roocode analysis
    const analysisResult = await this.roocode.analyzeCodebase(codebasePath);
    
    // Find complex decisions requiring human input
    const complexDecisions = analysisResult.decisions.filter(d => 
      d.complexity > 0.8 || d.confidence < 0.3
    );
    
    if (complexDecisions.length > 0) {
      return await this.handleComplexDecisions(complexDecisions, analysisResult);
    }
    
    return analysisResult;
  }

  async handleComplexDecisions(decisions, analysisResult) {
    // Create terminal session with analysis context
    const sessionId = await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers: ['filesystem', 'git', 'ultimate-mcp'],
      initialContext: {
        analysis: analysisResult,
        complexDecisions: decisions,
        codebase: analysisResult.codebaseMetadata
      }
    });

    // Present decisions to human
    const decisionPrompt = this.formatDecisionsForHuman(decisions);
    await this.terminal.sendToSession(sessionId, decisionPrompt);
    
    // Wait for human decisions
    const humanDecisions = await this.collectHumanDecisions(sessionId, decisions);
    
    // Apply decisions back to Roocode
    return await this.roocode.applyDecisions(humanDecisions);
  }
}
```

## 🔄 **Integration Patterns**

### **Pattern 1: Context-Aware Terminal**
```javascript
class ContextAwareTerminal {
  constructor(contextSource) {
    this.contextSource = contextSource;
    this.contextMemory = new Map();
  }

  async startContextualSession(contextId) {
    const context = await this.contextSource.getContext(contextId);
    
    // Smart server selection based on context
    const servers = this.selectOptimalServers(context);
    
    // Pre-format context for terminal
    const terminalContext = this.formatContextForTerminal(context);
    
    return await this.terminal.startInteractiveSession({
      mode: 'chat',
      servers,
      initialContext: terminalContext
    });
  }

  selectOptimalServers(context) {
    const serverMatrix = {
      // Context type → Optimal servers
      'development': ['github', 'filesystem', 'git', 'ultimate-mcp'],
      'research': ['brave-search', 'fetch', 'perplexity', 'ultimate-mcp'],
      'deployment': ['docker', 'kubernetes', 'aws', 'ultimate-mcp'],
      'data': ['sqlite', 'postgres', 'redis', 'ultimate-mcp'],
      'design': ['figma', 'filesystem', 'ultimate-mcp'],
      'default': ['ultimate-mcp']
    };
    
    return serverMatrix[context.type] || serverMatrix.default;
  }
}
```

### **Pattern 2: Bidirectional State Sync**
```javascript
class BidirectionalTerminalSync {
  constructor(primaryInterface, terminalAdapter) {
    this.primary = primaryInterface;
    this.terminal = terminalAdapter;
    this.syncQueue = [];
    this.syncInterval = 1000; // 1 second
    this.startSyncLoop();
  }

  async syncToTerminal(stateUpdate) {
    // Primary → Terminal
    await this.terminal.updateSessionContext(
      stateUpdate.sessionId, 
      stateUpdate.context
    );
    
    this.logSync('primary_to_terminal', stateUpdate);
  }

  async syncFromTerminal(sessionId, terminalOutput) {
    // Terminal → Primary
    const stateChange = this.extractStateFromTerminalOutput(terminalOutput);
    
    if (stateChange) {
      await this.primary.updateState(stateChange);
      this.logSync('terminal_to_primary', stateChange);
    }
  }

  extractStateFromTerminalOutput(output) {
    // Parse terminal output for state changes
    // Look for structured data, file modifications, task updates
    const patterns = {
      taskUpdate: /TASK_UPDATE:\s*({.*})/,
      fileChange: /FILE_MODIFIED:\s*(.+)/,
      stateChange: /STATE_CHANGE:\s*({.*})/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const match = output.match(pattern);
      if (match) {
        return { type, data: match[1] };
      }
    }
    
    return null;
  }
}
```

### **Pattern 3: Progressive Enhancement**
```javascript
class ProgressiveTerminalEnhancement {
  constructor() {
    this.capabilities = new Map();
    this.fallbackChain = [
      'full_integration',    // Full Kingly + MCP-CLI
      'mcp_cli_only',       // MCP-CLI without Kingly integration
      'basic_terminal',     // Standard terminal
      'text_interface'      // Fallback to text-only
    ];
  }

  async detectEnvironmentCapabilities(environment) {
    const capabilities = [];
    
    // Check for MCP-CLI availability
    if (await this.hasExecutable('mcp-cli')) {
      capabilities.push('mcp_cli_available');
    }
    
    // Check for Kingly integration
    if (await this.hasKinglyIntegration()) {
      capabilities.push('kingly_integration');
    }
    
    // Check for WebSocket support (for web interfaces)
    if (environment.supportsWebSockets) {
      capabilities.push('websocket_support');
    }
    
    // Check for terminal emulation
    if (environment.hasTerminalEmulator) {
      capabilities.push('terminal_emulator');
    }
    
    this.capabilities.set(environment.id, capabilities);
    return capabilities;
  }

  async createOptimalTerminal(environment) {
    const capabilities = await this.detectEnvironmentCapabilities(environment);
    
    if (capabilities.includes('kingly_integration') && 
        capabilities.includes('mcp_cli_available')) {
      return new FullIntegrationTerminal(environment);
    }
    
    if (capabilities.includes('mcp_cli_available')) {
      return new MCPCLIOnlyTerminal(environment);
    }
    
    if (capabilities.includes('terminal_emulator')) {
      return new BasicTerminalWrapper(environment);
    }
    
    return new TextInterfaceFallback(environment);
  }
}
```

## 📊 **Performance Considerations**

### **Session Management**
- **Memory**: Limit concurrent sessions per environment
- **Cleanup**: Auto-terminate idle sessions after 30 minutes
- **Persistence**: Save session state for resumability

### **Context Optimization**
- **Compression**: Compress large context objects
- **Relevance**: Only send relevant context to terminal
- **Caching**: Cache frequently accessed context data

### **Network Efficiency**
- **Batching**: Batch multiple small commands
- **Compression**: Gzip WebSocket messages
- **Streaming**: Stream large outputs progressively

## 🛡️ **Security Considerations**

### **Access Control**
- **Authentication**: Verify user identity before terminal access
- **Authorization**: Limit available servers based on user roles
- **Isolation**: Separate terminal sessions by user/project

### **Command Filtering**
- **Allowlist**: Define safe commands per environment
- **Validation**: Validate all commands before execution
- **Logging**: Log all terminal activity for audit

### **Context Sanitization**
- **Secrets**: Strip sensitive data from context
- **PII**: Remove personal information
- **Scope**: Limit context to necessary data only

## 🔮 **Future Enhancements**

### **Advanced Features**
- **Session Sharing**: Multiple users in same terminal session
- **Replay**: Record and replay terminal sessions
- **AI Assistance**: Terminal-aware AI suggestions
- **Voice Interface**: Voice-to-terminal commands

### **Integration Expansions**
- **Mobile Apps**: Terminal access from mobile devices
- **Slack/Discord**: Terminal commands via chat bots
- **Email**: Terminal access via email commands
- **API**: RESTful API for terminal management

This comprehensive design enables Kingly to provide seamless terminal access across all use cases while maintaining the universal context architecture and ports & adapters pattern.