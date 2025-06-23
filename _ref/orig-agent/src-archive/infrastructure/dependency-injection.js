/**
 * Dependency Injection Setup
 * Wire adapters to ports - ONLY place that knows about implementations
 */

// Import domain services
import { WorkspaceService } from '../application/workspace-service.js';

// Import secondary adapters (what we need)
import { JsonStorageAdapter } from '../adapters/secondary/json-storage.js';
import { AgentProtocolAdapter } from '../adapters/secondary/agent-protocol-adapter.js';
import { SpawnManagerAdapter } from '../adapters/secondary/spawn-manager-adapter.js';
import { ContextCaptureAdapter } from '../adapters/secondary/context-capture-adapter.js';

// Import primary adapters (external interfaces)  
import { MCPAdapter } from '../adapters/primary/mcp-adapter.js';
import { ClaudeCodeAdapter } from '../adapters/primary/claude-code-adapter.js';

export function setupDependencies(config = {}) {
  // Create secondary adapters (what we need from external systems)
  const persistence = new JsonStorageAdapter(config.kinglyPath || '.kingly');
  const agentComm = new AgentProtocolAdapter(config.agentsPath || './agents');
  const backgroundExec = new SpawnManagerAdapter(config);
  const contextCapture = new ContextCaptureAdapter(config);

  // Create application services (business logic orchestration)
  const workspaceService = new WorkspaceService(persistence, agentComm, contextCapture);

  // Create primary adapters (how external systems drive us)
  const mcpAdapter = new MCPAdapter(workspaceService, backgroundExec, agentComm);
  const claudeCodeAdapter = new ClaudeCodeAdapter(workspaceService, backgroundExec, agentComm, contextCapture);

  return {
    // Services
    workspaceService,
    
    // Primary adapters (interfaces)
    mcpAdapter,
    claudeCodeAdapter,
    
    // Secondary adapters (dependencies)
    persistence,
    agentComm,
    backgroundExec,
    contextCapture,
    
    // Configuration
    config: {
      ...config,
      kinglyPath: config.kinglyPath || '.kingly',
      agentsPath: config.agentsPath || './agents'
    }
  };
}

export function createMCPServer(config = {}) {
  const deps = setupDependencies(config);
  return deps.mcpAdapter;
}

export function createWorkspaceService(config = {}) {
  const deps = setupDependencies(config);
  return deps.workspaceService;
}

export function createClaudeAdapter(config = {}) {
  const deps = setupDependencies(config);
  return deps.claudeCodeAdapter;
}

// Alias for backward compatibility
export function createDependencyContainer(config = {}) {
  return setupDependencies(config);
}