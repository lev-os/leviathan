#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { SemanticLookup } from './semantic-lookup.js';
import { WorkflowLoader } from './workflow-loader.js';
import { CEOBinding } from './ceo-binding.js';
import { SessionManager } from './session-manager.js';
import { IntelligenceCoordinator } from './intelligence-coordinator.js';

class KinglyAgentServer {
  constructor() {
    this.server = new Server(
      {
        name: 'kingly-agent',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.semanticLookup = new SemanticLookup();
    this.workflowLoader = new WorkflowLoader();
    this.ceoBinding = new CEOBinding();
    this.sessionManager = new SessionManager();
    this.intelligenceCoordinator = new IntelligenceCoordinator();
    
    // Register this session
    this.sessionManager.registerSession(this.ceoBinding.sessionId, {
      agent: this.ceoBinding.currentAgent,
      workspace: this.ceoBinding.workspaceContext?.workspace || 'unknown',
      network_intelligence: this.ceoBinding.networkIntelligence
    });
    
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_workflow',
          description: 'Get workflow by semantic intent or code',
          inputSchema: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                description: 'Semantic intent (e.g., "parliament debate", "strategic analysis") or quick code (e.g., "3a", "2f")',
              },
              mode: {
                type: 'string',
                enum: ['quick', 'full', 'menu'],
                default: 'quick',
                description: 'Response format: quick (just workflow), full (with description), menu (show options)',
              },
            },
            required: ['intent'],
          },
        },
        {
          name: 'list_workflows',
          description: 'List all available workflows and patterns',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['agents', 'patterns', 'workflows', 'combos', 'all'],
                default: 'all',
                description: 'Category to list',
              },
              format: {
                type: 'string',
                enum: ['quick', 'detailed'],
                default: 'quick',
                description: 'Output format',
              },
            },
          },
        },
        {
          name: 'refresh_cache',
          description: 'Refresh workflow cache and rebuild embeddings',
          inputSchema: {
            type: 'object',
            properties: {
              rebuild_embeddings: {
                type: 'boolean',
                default: false,
                description: 'Whether to rebuild embeddings from scratch',
              },
            },
          },
        },
        // CEO Binding Tools
        {
          name: 'ceo_bind',
          description: 'CEO agent binding with intent detection and ~/t technique',
          inputSchema: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                description: 'Natural language intent or ~/t agent command (e.g., "~/t research", "implement feature X")',
              },
              include_headers: {
                type: 'boolean',
                default: true,
                description: 'Include CEO response headers',
              },
              auto_ping: {
                type: 'boolean',
                default: true,
                description: 'Auto-ping on turn thresholds or breakthroughs',
              },
            },
            required: ['intent'],
          },
        },
        {
          name: 'ceo_status',
          description: 'Get CEO binding status and session information',
          inputSchema: {
            type: 'object',
            properties: {
              include_sessions: {
                type: 'boolean',
                default: false,
                description: 'Include other active sessions',
              },
            },
          },
        },
        // Session Intelligence Tools
        {
          name: 'session_ping',
          description: 'Create session checkpoint with context',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'string',
                description: 'Session context or breakthrough insight',
              },
              files: {
                type: 'string',
                description: 'File references (optional)',
              },
              session_type: {
                type: 'string',
                default: 'general',
                description: 'Type of session',
              },
              auto: {
                type: 'boolean',
                default: false,
                description: 'Auto-detect context and significance',
              },
            },
            required: ['context'],
          },
        },
        {
          name: 'session_rollup',
          description: 'Prepare comprehensive session rollup',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'Session identifier (optional, auto-generated if not provided)',
              },
              files: {
                type: 'string',
                description: 'File references for rollup',
              },
              decisions: {
                type: 'string',
                description: 'Decisions made during session',
              },
              blockers: {
                type: 'string',
                description: 'Current blockers or challenges',
              },
              format: {
                type: 'string',
                enum: ['package', 'json', 'markdown'],
                default: 'package',
                description: 'Rollup format',
              },
            },
          },
        },
        {
          name: 'session_load',
          description: 'Load session context from rollup',
          inputSchema: {
            type: 'object',
            properties: {
              rollup_path: {
                type: 'string',
                description: 'Path to rollup file or latest for most recent',
              },
              restore_level: {
                type: 'string',
                enum: ['basic', 'full', 'complete'],
                default: 'full',
                description: 'Context restoration level',
              },
              validate: {
                type: 'boolean',
                default: true,
                description: 'Validate file references during restoration',
              },
            },
          },
        },
        // Intelligence Access Tools
        {
          name: 'intelligence_power',
          description: 'Deep contextual analysis with auto-save',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'string',
                description: 'Context for analysis (e.g., "debugging performance issue")',
              },
              files: {
                type: 'string',
                description: 'File references for analysis',
              },
              workspace: {
                type: 'string',
                default: 'current',
                description: 'Workspace scope',
              },
              save_draft: {
                type: 'boolean',
                default: true,
                description: 'Auto-save analysis as draft',
              },
            },
            required: ['context'],
          },
        },
        {
          name: 'intelligence_lookup',
          description: 'Query intelligence network',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Intelligence query or pattern',
              },
              all: {
                type: 'boolean',
                default: false,
                description: 'Comprehensive intelligence dump',
              },
              context: {
                type: 'string',
                default: 'current-conversation',
                description: 'Query context',
              },
              scope: {
                type: 'string',
                enum: ['local', 'workspace', 'cross-workspace', 'global'],
                default: 'workspace',
                description: 'Intelligence scope',
              },
              format: {
                type: 'string',
                enum: ['structured', 'conversational', 'detailed'],
                default: 'structured',
                description: 'Response format',
              },
            },
          },
        },
        // Workflow Management Tools
        {
          name: 'workflow_select',
          description: 'Interactive workflow selection with context awareness',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'string',
                default: 'current',
                description: 'Current context for workflow selection',
              },
              interactive: {
                type: 'boolean',
                default: false,
                description: 'Enable interactive selection mode',
              },
              score_relevance: {
                type: 'boolean',
                default: true,
                description: 'Score workflow relevance',
              },
              format: {
                type: 'string',
                enum: ['menu', 'list', 'recommendations'],
                default: 'recommendations',
                description: 'Selection format',
              },
            },
          },
        },
        {
          name: 'workflow_execute',
          description: 'Execute workflow with progress tracking',
          inputSchema: {
            type: 'object',
            properties: {
              workflow: {
                type: 'string',
                description: 'Workflow name or code to execute',
              },
              chain: {
                type: 'boolean',
                default: false,
                description: 'Enable workflow chaining',
              },
              progress: {
                type: 'boolean',
                default: true,
                description: 'Track execution progress',
              },
              callback: {
                type: 'string',
                default: 'claude-code',
                description: 'Progress callback handler',
              },
            },
            required: ['workflow'],
          },
        },
        // Template System Tools
        {
          name: 'template_sync',
          description: 'Synchronize templates across workspaces',
          inputSchema: {
            type: 'object',
            properties: {
              workspace: {
                type: 'string',
                default: 'current',
                description: 'Target workspace for sync',
              },
              strategy: {
                type: 'string',
                enum: ['intelligent-merge', 'overwrite', 'selective'],
                default: 'intelligent-merge',
                description: 'Sync strategy',
              },
              preview: {
                type: 'boolean',
                default: true,
                description: 'Preview changes before applying',
              },
              all: {
                type: 'boolean',
                default: false,
                description: 'Sync all related workspaces',
              },
            },
          },
        },
        {
          name: 'template_evolve',
          description: 'AI-driven template evolution',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'string',
                default: 'current',
                description: 'Context for template evolution',
              },
              usage_analysis: {
                type: 'boolean',
                default: true,
                description: 'Analyze usage patterns',
              },
              preview_changes: {
                type: 'boolean',
                default: true,
                description: 'Preview evolution changes',
              },
              evolution_mode: {
                type: 'string',
                enum: ['auto', 'guided', 'conservative'],
                default: 'guided',
                description: 'Evolution approach',
              },
            },
          },
        },
        // Network Intelligence Tools
        {
          name: 'network_intelligence',
          description: 'Access distributed intelligence network',
          inputSchema: {
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                enum: ['status', 'contribute', 'query', 'sync'],
                description: 'Network operation',
              },
              context: {
                type: 'string',
                description: 'Operation context',
              },
              pattern: {
                type: 'string',
                description: 'Intelligence pattern to query',
              },
              significance: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'breakthrough'],
                default: 'medium',
                description: 'Intelligence significance level',
              },
              scope: {
                type: 'string',
                enum: ['local', 'cross-workspace', 'global'],
                default: 'cross-workspace',
                description: 'Network scope',
              },
            },
            required: ['operation'],
          },
        },
        {
          name: 'network_status',
          description: 'Get network health and topology status',
          inputSchema: {
            type: 'object',
            properties: {
              workspace: {
                type: 'string',
                default: 'current',
                description: 'Workspace to check',
              },
              depth: {
                type: 'number',
                default: 3,
                description: 'Network depth to analyze',
              },
              include_patterns: {
                type: 'boolean',
                default: false,
                description: 'Include pattern analysis',
              },
            },
          },
        },
        {
          name: 'workshop',
          description: 'Workshop tool and plugin creation system for Leviathan ecosystem',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                enum: ['status', 'list', 'info', 'onboard', 'docs', 'examples', 'intake', 'classify', 'create'],
                description: 'Workshop command to execute',
              },
              args: {
                type: 'array',
                items: { type: 'string' },
                description: 'Command arguments (e.g., tool name for info, tier for list)',
              },
              options: {
                type: 'object',
                properties: {
                  json: { type: 'boolean', default: false },
                  tier: { type: 'number', minimum: 1, maximum: 3 },
                },
                description: 'Command options',
              },
            },
            required: ['command'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_workflow':
            return await this.handleGetWorkflow(request.params.arguments);
          
          case 'list_workflows':
            return await this.handleListWorkflows(request.params.arguments);
          
          case 'refresh_cache':
            return await this.handleRefreshCache(request.params.arguments);
          
          // CEO Binding Tools
          case 'ceo_bind':
            return await this.handleCEOBind(request.params.arguments);
          
          case 'ceo_status':
            return await this.handleCEOStatus(request.params.arguments);
          
          // Session Intelligence Tools
          case 'session_ping':
            return await this.handleSessionPing(request.params.arguments);
          
          case 'session_rollup':
            return await this.handleSessionRollup(request.params.arguments);
          
          case 'session_load':
            return await this.handleSessionLoad(request.params.arguments);
          
          // Intelligence Access Tools
          case 'intelligence_power':
            return await this.handleIntelligencePower(request.params.arguments);
          
          case 'intelligence_lookup':
            return await this.handleIntelligenceLookup(request.params.arguments);
          
          // Workflow Management Tools
          case 'workflow_select':
            return await this.handleWorkflowSelect(request.params.arguments);
          
          case 'workflow_execute':
            return await this.handleWorkflowExecute(request.params.arguments);
          
          // Template System Tools
          case 'template_sync':
            return await this.handleTemplateSync(request.params.arguments);
          
          case 'template_evolve':
            return await this.handleTemplateEvolve(request.params.arguments);
          
          // Network Intelligence Tools
          case 'network_intelligence':
            return await this.handleNetworkIntelligence(request.params.arguments);
          
          case 'network_status':
            return await this.handleNetworkStatus(request.params.arguments);
          
          // Workshop Plugin System
          case 'workshop':
            return await this.handleWorkshop(request.params.arguments);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        console.error('Tool error:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async handleGetWorkflow(args) {
    const { intent, mode = 'quick' } = args;
    
    // Try quick code lookup first
    const quickResult = await this.workflowLoader.getByCode(intent);
    if (quickResult) {
      return this.formatWorkflowResponse(quickResult, mode);
    }
    
    // Semantic lookup
    const semanticResult = await this.semanticLookup.findWorkflow(intent);
    if (semanticResult) {
      return this.formatWorkflowResponse(semanticResult, mode);
    }
    
    // No match found
    const suggestions = await this.semanticLookup.getSuggestions(intent);
    return {
      content: [
        {
          type: 'text',
          text: `No exact match found for "${intent}".\\n\\nDid you mean:\\n${suggestions.map((s, i) => `${i+1}. ${s.code} - ${s.name}`).join('\\n')}`,
        },
      ],
    };
  }

  async handleListWorkflows(args) {
    const { category = 'all', format = 'quick' } = args;
    const workflows = await this.workflowLoader.listByCategory(category);
    
    let text;
    if (format === 'detailed') {
      text = this.formatDetailedList(workflows);
    } else {
      text = this.formatQuickList(workflows);
    }
    
    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  }

  async handleRefreshCache(args) {
    const { rebuild_embeddings = false } = args;
    
    const result = await this.workflowLoader.refreshCache();
    
    if (rebuild_embeddings) {
      await this.semanticLookup.rebuildEmbeddings();
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Cache refreshed successfully\\n\\n${result.summary}`,
        },
      ],
    };
  }

  formatWorkflowResponse(workflow, mode) {
    switch (mode) {
      case 'quick':
        return {
          content: [
            {
              type: 'text',
              text: `**${workflow.code} - ${workflow.name}**\\n\\n${workflow.instructions}`,
            },
          ],
        };
      
      case 'full':
        return {
          content: [
            {
              type: 'text',
              text: `# ${workflow.name} [${workflow.code}]\\n\\n${workflow.description}\\n\\n## Instructions\\n${workflow.instructions}\\n\\n## When to Use\\n${workflow.triggers.join(', ')}`,
            },
          ],
        };
      
      case 'menu':
        return {
          content: [
            {
              type: 'text',
              text: `Found: **${workflow.code} - ${workflow.name}**\\n\\nWould you like to:\\n1. Execute this workflow\\n2. See full description\\n3. Find related workflows\\n4. Return to main menu`,
            },
          ],
        };
      
      default:
        return this.formatWorkflowResponse(workflow, 'quick');
    }
  }

  formatQuickList(workflows) {
    return workflows.map(w => `${w.code} - ${w.name}`).join('\\n');
  }

  formatDetailedList(workflows) {
    return workflows.map(w => 
      `**${w.code} - ${w.name}**\\n${w.description}\\n`
    ).join('\\n');
  }

  // CEO Binding Handlers
  async handleCEOBind(args) {
    const { intent, include_headers = true, auto_ping = true } = args;
    
    // Detect intent and potentially switch agents
    const intentResult = this.ceoBinding.detectIntent(intent);
    
    // Check if we should auto-ping
    if (auto_ping && this.ceoBinding.shouldSelfPing(intent)) {
      const pingData = this.ceoBinding.createSessionPing(
        `Auto-ping: ${intent}`,
        true
      );
      
      // Create checkpoint
      this.sessionManager.createCheckpoint(
        this.ceoBinding.sessionId,
        pingData.context,
        ['auto-detected files']
      );
    }

    // Update session activity
    this.sessionManager.updateSessionActivity(
      this.ceoBinding.sessionId,
      `Intent: ${intent} -> Agent: ${intentResult.agent}`
    );

    let responseText = '';
    
    // Handle agent switching
    if (intentResult.switched) {
      responseText = `🔄 **Agent Switch: ${intentResult.agent.toUpperCase()}**\\n\\n` +
                    `**Reasoning:** ${intentResult.reasoning}\\n\\n` +
                    `✅ Successfully switched to ${intentResult.agent} agent mode`;
    } else if (intentResult.error) {
      responseText = `❌ **Agent Switch Failed**\\n\\n` +
                    `**Error:** ${intentResult.error}\\n\\n` +
                    `**Reasoning:** ${intentResult.reasoning}`;
    } else {
      responseText = `🤖 **Intent Analysis**\\n\\n` +
                    `**Detected Agent:** ${intentResult.agent}\\n` +
                    `**Confidence:** ${(intentResult.confidence * 100).toFixed(1)}%\\n` +
                    `**Reasoning:** ${intentResult.reasoning}\\n\\n` +
                    `**Current Agent:** ${this.ceoBinding.currentAgent.toUpperCase()}`;
    }

    // Add workflow recommendations if relevant
    if (intentResult.confidence > 0.7) {
      const workflowSuggestions = await this.semanticLookup.findWorkflow(intent);
      if (workflowSuggestions) {
        responseText += `\\n\\n📋 **Recommended Workflow:** ${workflowSuggestions.code} - ${workflowSuggestions.name}`;
      }
    }

    const formattedResponse = this.ceoBinding.formatResponse(responseText, include_headers);
    
    return {
      content: [
        {
          type: 'text',
          text: formattedResponse,
        },
      ],
    };
  }

  async handleCEOStatus(args) {
    const { include_sessions = false } = args;
    
    const headers = this.ceoBinding.generateResponseHeaders();
    const workspaceContext = this.ceoBinding.workspaceContext;
    
    let statusText = `📊 **CEO Binding Status**\\n\\n` +
                    `**Session ID:** ${this.ceoBinding.sessionId}\\n` +
                    `**Current Agent:** ${this.ceoBinding.currentAgent.toUpperCase()}\\n` +
                    `**Turn Count:** ${this.ceoBinding.turnCounter}\\n` +
                    `**Network Intelligence:** ${this.ceoBinding.networkIntelligence ? 'Enabled' : 'Disabled'}\\n` +
                    `**Memory Auto-Save:** ${this.ceoBinding.memoryAutoSave ? 'Enabled' : 'Disabled'}\\n` +
                    `**Workspace:** ${workspaceContext?.workspace || 'Unknown'}\\n\\n`;

    // Add workspace context info
    if (workspaceContext) {
      statusText += `📁 **Workspace Context**\\n` +
                   `**Project CLAUDE.md:** ${workspaceContext.project ? 'Loaded' : 'Not found'}\\n` +
                   `**Kingly CLAUDE.md:** ${workspaceContext.kingly ? 'Loaded' : 'Not found'}\\n\\n`;
    }

    // Add active sessions if requested
    if (include_sessions) {
      const activeSessions = this.sessionManager.getActiveSessions();
      statusText += `🔗 **Active Sessions (${activeSessions.length})**\\n`;
      
      for (const session of activeSessions.slice(0, 5)) { // Limit to 5 sessions
        statusText += `• ${session.session_id}: ${session.agent || 'Unknown'} (${session.status})\\n`;
      }
      
      if (activeSessions.length > 5) {
        statusText += `• ... and ${activeSessions.length - 5} more\\n`;
      }
      statusText += '\\n';
    }

    statusText += `**Last Ping:** ${new Date(this.ceoBinding.lastPing).toLocaleTimeString()}\\n` +
                 `**Headers:**\\n${headers}`;

    return {
      content: [
        {
          type: 'text',
          text: statusText,
        },
      ],
    };
  }

  // Session Intelligence Handlers
  async handleSessionPing(args) {
    const { context, files, session_type = 'general', auto = false } = args;
    
    // Create session ping using CEO binding
    const pingData = this.ceoBinding.createSessionPing(context, auto);
    
    // Create checkpoint using session manager
    const checkpointResult = this.sessionManager.createCheckpoint(
      this.ceoBinding.sessionId,
      context,
      files ? files.split(',').map(f => f.trim()) : []
    );

    const result = {
      success: checkpointResult.success,
      session_id: this.ceoBinding.sessionId,
      checkpoint_path: checkpointResult.checkpoint_path,
      context,
      files: files || 'auto-detected',
      session_type,
      agent: this.ceoBinding.currentAgent,
      significance: pingData.significance,
      timestamp: pingData.timestamp,
    };

    const responseText = `🎯 **Session Checkpoint Created**\\n\\n` +
                        `**Session ID:** ${result.session_id}\\n` +
                        `**Context:** ${result.context}\\n` +
                        `**Files:** ${result.files}\\n` +
                        `**Agent:** ${result.agent.toUpperCase()}\\n` +
                        `**Type:** ${result.session_type}\\n` +
                        `**Significance:** ${result.significance.level} (${(result.significance.confidence * 100).toFixed(0)}%)\\n` +
                        `**Checkpoint:** ${result.checkpoint_path}\\n` +
                        `**Timestamp:** ${result.timestamp}\\n\\n` +
                        `✅ Session checkpoint saved successfully`;

    return {
      content: [
        {
          type: 'text',
          text: this.ceoBinding.formatResponse(responseText, true),
        },
      ],
    };
  }

  async handleSessionRollup(args) {
    const { session_id, files, decisions, blockers, format = 'package' } = args;
    
    // Generate rollup data using CEO binding
    const rollupData = this.ceoBinding.generateRollup(
      files ? files.split(',').map(f => f.trim()) : [],
      decisions ? decisions.split(',').map(d => d.trim()) : [],
      blockers ? blockers.split(',').map(b => b.trim()) : [],
      [] // next_actions will be auto-generated
    );
    
    // Create rollup using session manager
    const result = this.sessionManager.createRollup(
      session_id || this.ceoBinding.sessionId,
      {
        ...rollupData,
        format,
        context: `Session rollup for ${this.ceoBinding.currentAgent} agent`,
        agent: this.ceoBinding.currentAgent,
        workspace: this.ceoBinding.workspaceContext?.workspace,
        turn_count: this.ceoBinding.turnCounter
      }
    );

    const responseText = `📦 **Session Rollup Prepared**\\n\\n` +
                        `**Rollup ID:** ${result.rollup_id}\\n` +
                        `**Files:** ${rollupData.files}\\n` +
                        `**Decisions:** ${rollupData.decisions}\\n` +
                        `**Blockers:** ${rollupData.blockers}\\n` +
                        `**Agent:** ${rollupData.agent.toUpperCase()}\\n` +
                        `**Turn Count:** ${rollupData.turn_count}\\n` +
                        `**Format:** ${result.format}\\n` +
                        `**Package:** ${result.rollup_path}\\n` +
                        `**Timestamp:** ${result.created}\\n\\n` +
                        `✅ Rollup package created successfully`;

    return {
      content: [
        {
          type: 'text',
          text: this.ceoBinding.formatResponse(responseText, true),
        },
      ],
    };
  }

  async handleSessionLoad(args) {
    const { rollup_path, restore_level = 'full', validate = true } = args;
    
    // Load session using session manager
    const result = this.sessionManager.loadSession(
      rollup_path || 'latest',
      restore_level
    );

    if (result.success && result.session_data) {
      // Update CEO binding with restored context if available
      if (result.session_data.agent) {
        this.ceoBinding.currentAgent = result.session_data.agent;
      }
      
      // Register as active session if needed
      this.sessionManager.updateSessionActivity(
        this.ceoBinding.sessionId,
        `Loaded session from: ${result.rollup_path}`
      );
    }

    const responseText = result.success 
      ? `🔄 **Session Context Restored**\\n\\n` +
        `**Source:** ${result.rollup_path}\\n` +
        `**Restore Level:** ${result.restore_level}\\n` +
        `**Files:** ${result.files_validated}\\n` +
        `**Validation:** ${validate ? 'Enabled' : 'Disabled'}\\n` +
        `**Context Restored:** ${result.context_restored ? 'Yes' : 'No'}\\n` +
        `**Agent Restored:** ${result.session_data?.agent || 'None'}\\n` +
        `**Timestamp:** ${result.timestamp}\\n\\n` +
        `✅ Session context loaded successfully`
      : `❌ **Session Load Failed**\\n\\n` +
        `**Error:** ${result.error}\\n` +
        `**Rollup Path:** ${rollup_path || 'latest'}\\n` +
        `**Timestamp:** ${new Date().toISOString()}`;

    return {
      content: [
        {
          type: 'text',
          text: this.ceoBinding.formatResponse(responseText, true),
        },
      ],
    };
  }

  // Intelligence Access Handlers
  async handleIntelligencePower(args) {
    const { context, files, workspace = 'current', save_draft = true } = args;
    
    // Perform actual power analysis using intelligence coordinator
    const analysis = await this.intelligenceCoordinator.performPowerAnalysis(
      context,
      files ? files.split(',').map(f => f.trim()) : [],
      workspace
    );
    
    // Save draft if requested
    const draftPath = await this.intelligenceCoordinator.saveDraft(analysis, save_draft);
    
    // Create procedural memory if significant enough
    const memoryPath = await this.intelligenceCoordinator.createProceduralMemory(analysis);
    
    const responseText = `⚡ **Power Analysis Complete**\\n\\n` +
                        `**Context:** ${analysis.context}\\n` +
                        `**Workspace:** ${analysis.workspace}\\n` +
                        `**Analysis ID:** ${analysis.analysis_id}\\n\\n` +
                        `**Patterns Identified:**\\n${analysis.patterns_identified.map(p => `• ${p.type} (${(p.confidence * 100).toFixed(0)}%): ${p.description}`).join('\\n')}\\n\\n` +
                        `**Key Insights:**\\n${analysis.insights.map(i => `• ${i}`).join('\\n')}\\n\\n` +
                        `**Recommendations:**\\n${analysis.recommendations.map(r => `• ${r}`).join('\\n')}\\n\\n` +
                        `**Confidence Scores:**\\n` +
                        `• Context Clarity: ${(analysis.confidence_scores.context_clarity * 100).toFixed(0)}%\\n` +
                        `• Pattern Confidence: ${(analysis.confidence_scores.pattern_confidence * 100).toFixed(0)}%\\n` +
                        `• Actionability: ${(analysis.confidence_scores.actionability * 100).toFixed(0)}%\\n` +
                        `• Significance: ${(analysis.confidence_scores.significance * 100).toFixed(0)}%\\n\\n` +
                        `**Cross-Workspace Potential:** ${analysis.cross_workspace_potential ? 'Yes' : 'No'}\\n` +
                        `${draftPath ? `**Draft Saved:** ${draftPath}\\n` : ''}` +
                        `${memoryPath ? `**Procedural Memory Created:** ${memoryPath}\\n` : ''}` +
                        `**Timestamp:** ${analysis.timestamp}\\n\\n` +
                        `✅ Power analysis completed successfully`;

    return {
      content: [
        {
          type: 'text',
          text: this.ceoBinding.formatResponse(responseText, true),
        },
      ],
    };
  }

  async handleIntelligenceLookup(args) {
    const { query, all = false, context = 'current-conversation', scope = 'workspace', format = 'structured' } = args;
    
    // Perform actual intelligence lookup using intelligence coordinator
    const result = await this.intelligenceCoordinator.performLookup(
      query || 'comprehensive intelligence dump',
      scope,
      format
    );

    let responseText = `🧠 **Intelligence Lookup Complete**\\n\\n` +
                      `**Query:** ${result.query}\\n` +
                      `**Context:** ${context}\\n` +
                      `**Scope:** ${result.scope}\\n` +
                      `**Format:** ${result.format}\\n` +
                      `**Confidence:** ${(result.confidence * 100).toFixed(1)}%\\n\\n`;

    if (result.intelligence_entries.length > 0) {
      responseText += `**Intelligence Found (${result.intelligence_entries.length} entries):**\\n`;
      
      for (const entry of result.intelligence_entries.slice(0, all ? 20 : 5)) {
        responseText += `\\n• **${entry.type.toUpperCase()}** (${(entry.confidence * 100).toFixed(0)}%)\\n`;
        responseText += `  Source: ${entry.source}\\n`;
        responseText += `  Content: ${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}\\n`;
        if (entry.timestamp) {
          responseText += `  Created: ${new Date(entry.timestamp).toLocaleDateString()}\\n`;
        }
      }
      
      if (result.intelligence_entries.length > 5 && !all) {
        responseText += `\\n... and ${result.intelligence_entries.length - 5} more entries (use all=true to see all)\\n`;
      }
    } else {
      responseText += `**No Intelligence Found**\\n` +
                     `• Try broader search terms\\n` +
                     `• Check if scope includes relevant sources\\n` +
                     `• Consider using different context`;
    }

    responseText += `\\n\\n**Timestamp:** ${result.timestamp}\\n\\n` +
                   `✅ Intelligence lookup completed successfully`;

    return {
      content: [
        {
          type: 'text',
          text: this.ceoBinding.formatResponse(responseText, true),
        },
      ],
    };
  }

  // Workflow Management Handlers
  async handleWorkflowSelect(args) {
    const { context = 'current', interactive = false, score_relevance = true, format = 'recommendations' } = args;
    
    // TODO: Implement actual workflow selection via kingly-semantic
    const result = {
      success: true,
      context,
      interactive,
      format,
      recommendations: ['2a - Strategic Analysis', '1b - Creative Thinking', '3f - Decision Framework'],
      relevance_scores: score_relevance ? [0.92, 0.87, 0.81] : null,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `📋 **Workflow Selection Complete**\\n\\n` +
               `**Context:** ${result.context}\\n` +
               `**Format:** ${result.format}\\n` +
               `**Interactive:** ${result.interactive ? 'Enabled' : 'Disabled'}\\n\\n` +
               `**Recommendations:**\\n${result.recommendations.map((r, i) => 
                 `• ${r}${result.relevance_scores ? ` (${(result.relevance_scores[i] * 100).toFixed(0)}%)` : ''}`
               ).join('\\n')}\\n\\n` +
               `**Timestamp:** ${result.timestamp}\\n\\n` +
               `✅ Workflow selection completed successfully (placeholder implementation)`,
        },
      ],
    };
  }

  async handleWorkflowExecute(args) {
    const { workflow, chain = false, progress = true, callback = 'claude-code' } = args;
    
    // TODO: Implement actual workflow execution via kingly-semantic
    const result = {
      success: true,
      workflow,
      chain,
      progress,
      callback,
      execution_id: `exec-${Date.now()}`,
      status: 'completed',
      steps_completed: ['Initialize context', 'Execute workflow', 'Generate output'],
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `🚀 **Workflow Execution Complete**\\n\\n` +
               `**Workflow:** ${result.workflow}\\n` +
               `**Execution ID:** ${result.execution_id}\\n` +
               `**Chain:** ${result.chain ? 'Enabled' : 'Disabled'}\\n` +
               `**Progress:** ${result.progress ? 'Tracked' : 'Silent'}\\n` +
               `**Status:** ${result.status}\\n\\n` +
               `**Steps Completed:**\\n${result.steps_completed.map(s => `✅ ${s}`).join('\\n')}\\n\\n` +
               `**Timestamp:** ${result.timestamp}\\n\\n` +
               `✅ Workflow execution completed successfully (placeholder implementation)`,
        },
      ],
    };
  }

  // Template System Handlers
  async handleTemplateSync(args) {
    const { workspace = 'current', strategy = 'intelligent-merge', preview = true, all = false } = args;
    
    // TODO: Implement actual template sync via kingly-semantic
    const result = {
      success: true,
      workspace,
      strategy,
      preview,
      all,
      templates_synced: ['CLAUDE.md', 'README.agent.md', 'ADR.template'],
      conflicts_resolved: 0,
      changes_applied: 3,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `🔄 **Template Synchronization Complete**\\n\\n` +
               `**Workspace:** ${result.workspace}\\n` +
               `**Strategy:** ${result.strategy}\\n` +
               `**Preview:** ${result.preview ? 'Enabled' : 'Applied directly'}\\n` +
               `**Scope:** ${result.all ? 'All related workspaces' : 'Single workspace'}\\n\\n` +
               `**Templates Synced:**\\n${result.templates_synced.map(t => `✅ ${t}`).join('\\n')}\\n\\n` +
               `**Changes Applied:** ${result.changes_applied}\\n` +
               `**Conflicts Resolved:** ${result.conflicts_resolved}\\n` +
               `**Timestamp:** ${result.timestamp}\\n\\n` +
               `✅ Template synchronization completed successfully (placeholder implementation)`,
        },
      ],
    };
  }

  async handleTemplateEvolve(args) {
    const { context = 'current', usage_analysis = true, preview_changes = true, evolution_mode = 'guided' } = args;
    
    // TODO: Implement actual template evolution via kingly-semantic
    const result = {
      success: true,
      context,
      evolution_mode,
      usage_analysis,
      preview_changes,
      improvements_identified: ['Enhanced session management patterns', 'Better intelligence routing', 'Improved context propagation'],
      effectiveness_increase: 15,
      templates_evolved: ['CLAUDE.md.template', 'SESSION.template'],
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `🧠 **Template Evolution Complete**\\n\\n` +
               `**Context:** ${result.context}\\n` +
               `**Evolution Mode:** ${result.evolution_mode}\\n` +
               `**Usage Analysis:** ${result.usage_analysis ? 'Enabled' : 'Disabled'}\\n` +
               `**Preview:** ${result.preview_changes ? 'Enabled' : 'Applied directly'}\\n\\n` +
               `**Improvements Identified:**\\n${result.improvements_identified.map(i => `• ${i}`).join('\\n')}\\n\\n` +
               `**Templates Evolved:** ${result.templates_evolved.join(', ')}\\n` +
               `**Effectiveness Increase:** +${result.effectiveness_increase}%\\n` +
               `**Timestamp:** ${result.timestamp}\\n\\n` +
               `✅ Template evolution completed successfully (placeholder implementation)`,
        },
      ],
    };
  }

  // Network Intelligence Handlers
  async handleNetworkIntelligence(args) {
    const { operation, context, pattern, significance = 'medium', scope = 'cross-workspace' } = args;
    
    // TODO: Implement actual network intelligence via kingly-semantic
    const result = {
      success: true,
      operation,
      context: context || 'auto-detected',
      pattern: pattern || 'general intelligence',
      significance,
      scope,
      network_response: `Network ${operation} completed with ${significance} significance across ${scope} scope`,
      connections_accessed: scope === 'global' ? 12 : scope === 'cross-workspace' ? 5 : 1,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `🌐 **Network Intelligence ${operation.toUpperCase()} Complete**\\n\\n` +
               `**Operation:** ${result.operation}\\n` +
               `**Context:** ${result.context}\\n` +
               `**Pattern:** ${result.pattern}\\n` +
               `**Significance:** ${result.significance}\\n` +
               `**Scope:** ${result.scope}\\n\\n` +
               `**Network Response:** ${result.network_response}\\n` +
               `**Connections Accessed:** ${result.connections_accessed}\\n` +
               `**Timestamp:** ${result.timestamp}\\n\\n` +
               `✅ Network intelligence operation completed successfully (placeholder implementation)`,
        },
      ],
    };
  }

  async handleNetworkStatus(args) {
    const { workspace = 'current', depth = 3, include_patterns = false } = args;
    
    // TODO: Implement actual network status via kingly-semantic
    const result = {
      success: true,
      workspace,
      depth,
      include_patterns,
      network_health: 'optimal',
      active_connections: 8,
      intelligence_cache: '156 entries',
      pattern_recognition: include_patterns ? ['debugging patterns', 'optimization patterns', 'workflow patterns'] : null,
      latency_avg: '127ms',
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text',
          text: `📊 **Network Status Report**\\n\\n` +
               `**Workspace:** ${result.workspace}\\n` +
               `**Analysis Depth:** ${result.depth}\\n` +
               `**Network Health:** ${result.network_health}\\n` +
               `**Active Connections:** ${result.active_connections}\\n` +
               `**Intelligence Cache:** ${result.intelligence_cache}\\n` +
               `**Average Latency:** ${result.latency_avg}\\n\\n` +
               `${result.pattern_recognition ? 
                 `**Patterns Recognized:**\\n${result.pattern_recognition.map(p => `• ${p}`).join('\\n')}\\n\\n` : 
                 ''}` +
               `**Timestamp:** ${result.timestamp}\\n\\n` +
               `✅ Network status analysis completed successfully (placeholder implementation)`,
        },
      ],
    };
  }

  async handleWorkshop(args) {
    const { command, args: commandArgs = [], options = {} } = args;
    
    // Mock workshop data for testing - in real implementation this would come from workshop plugin
    const workshopData = {
      overview: {
        total_tools: 170,
        total_plugins: 8,
        tiers: {
          tier_1: 45,
          tier_2: 85,
          tier_3: 40
        },
        active_development: true,
        phase: "Phase 1 - Testing & Integration"
      },
      tools: [
        { name: "checkpoint-manager", tier: 1, description: "Session checkpoint management" },
        { name: "context-search", tier: 1, description: "Semantic context discovery" },
        { name: "workflow-router", tier: 2, description: "Workflow routing and execution" },
        { name: "intelligence-coordinator", tier: 2, description: "Cross-workspace intelligence" },
        { name: "template-sync", tier: 3, description: "Template synchronization system" }
      ]
    };

    try {
      switch (command) {
        case 'status':
          const statusResult = {
            success: true,
            data: workshopData
          };
          
          if (options.json) {
            return {
              content: [{ type: 'text', text: JSON.stringify(statusResult, null, 2) }]
            };
          }
          
          return {
            content: [{
              type: 'text',
              text: `🛠️ **WORKSHOP STATUS**\\n\\n` +
                   `**OVERVIEW**\\n` +
                   `• Total Tools: ${workshopData.overview.total_tools}\\n` +
                   `• Total Plugins: ${workshopData.overview.total_plugins}\\n` +
                   `• Active Development: ${workshopData.overview.active_development ? 'Yes' : 'No'}\\n` +
                   `• Current Phase: ${workshopData.overview.phase}\\n\\n` +
                   `**TIER BREAKDOWN**\\n` +
                   `• Tier 1 (Essential): ${workshopData.overview.tiers.tier_1} tools\\n` +
                   `• Tier 2 (Standard): ${workshopData.overview.tiers.tier_2} tools\\n` +
                   `• Tier 3 (Advanced): ${workshopData.overview.tiers.tier_3} tools\\n\\n` +
                   `✅ Workshop system operational and ready for development`
            }]
          };

        case 'list':
          const tier = options.tier;
          const filteredTools = tier ? 
            workshopData.tools.filter(t => t.tier === tier) : 
            workshopData.tools;
          
          const listResult = {
            success: true,
            data: {
              tools: filteredTools,
              filter: tier ? `Tier ${tier}` : 'All tiers',
              count: filteredTools.length
            }
          };
          
          if (options.json) {
            return {
              content: [{ type: 'text', text: JSON.stringify(listResult, null, 2) }]
            };
          }
          
          return {
            content: [{
              type: 'text',
              text: `🔧 **WORKSHOP TOOLS** ${tier ? `(Tier ${tier})` : ''}\\n\\n` +
                   filteredTools.map(tool => 
                     `• **${tool.name}** (Tier ${tool.tier})\\n  ${tool.description}`
                   ).join('\\n\\n') +
                   `\\n\\n📊 Showing ${filteredTools.length} tools`
            }]
          };

        case 'info':
          const toolName = commandArgs[0];
          if (!toolName) {
            return {
              content: [{
                type: 'text',
                text: '❌ **Error**: Tool name is required\\n\\n**Usage:** workshop info <tool-name>'
              }]
            };
          }
          
          const tool = workshopData.tools.find(t => t.name === toolName);
          if (!tool) {
            return {
              content: [{
                type: 'text',
                text: `❌ **Error**: Tool not found: ${toolName}\\n\\n**Available tools:**\\n` +
                     workshopData.tools.map(t => `• ${t.name}`).join('\\n')
              }]
            };
          }
          
          return {
            content: [{
              type: 'text',
              text: `🔧 **${tool.name}**\\n\\n` +
                   `**Tier:** ${tool.tier}\\n` +
                   `**Description:** ${tool.description}\\n\\n` +
                   `**Integration Status:** Available for plugin development\\n` +
                   `**Documentation:** See workshop docs for implementation details`
            }]
          };

        case 'onboard':
          return {
            content: [{
              type: 'text',
              text: `🎓 **COMMUNITY ONBOARDING GUIDE**\\n\\n` +
                   `Welcome to the Leviathan plugin ecosystem! Here's how to get started:\\n\\n` +
                   `**1. Development Setup**\\n` +
                   `• Follow hexagonal architecture patterns\\n` +
                   `• Use @lev-os testing framework\\n` +
                   `• Implement CLI adapter integration\\n\\n` +
                   `**2. Plugin Standards**\\n` +
                   `• Real CLI integration testing\\n` +
                   `• JSON output for LLM consumption\\n` +
                   `• Graceful error handling\\n\\n` +
                   `**3. Next Steps**\\n` +
                   `• Run 'workshop docs' for detailed documentation\\n` +
                   `• Try 'workshop examples' for implementation patterns\\n` +
                   `• Join the community development process\\n\\n` +
                   `🚀 Ready to build the future of AI tooling!`
            }]
          };

        case 'docs':
          return {
            content: [{
              type: 'text',
              text: `📚 **DOCUMENTATION LINKS**\\n\\n` +
                   `**Core Documentation:**\\n` +
                   `• Plugin Development Guide: /docs/plugin-development.md\\n` +
                   `• Testing Standards: /docs/testing/plugin-standards.md\\n` +
                   `• Hexagonal Architecture: /docs/testing/hexagonal-testing.md\\n\\n` +
                   `**Community Resources:**\\n` +
                   `• Contribution Guidelines: /CONTRIBUTING.md\\n` +
                   `• Code of Conduct: /CODE_OF_CONDUCT.md\\n` +
                   `• Plugin Examples: /plugins/@lev/workshop/\\n\\n` +
                   `**Getting Help:**\\n` +
                   `• GitHub Issues: github.com/leviathan/issues\\n` +
                   `• Community Discord: discord.gg/leviathan\\n` +
                   `• Documentation: docs.leviathan.dev`
            }]
          };

        case 'examples':
          return {
            content: [{
              type: 'text',
              text: `💡 **IMPLEMENTATION EXAMPLES**\\n\\n` +
                   `**Basic Plugin Structure:**\\n` +
                   \`\`\`javascript\\n` +
                   `export class YourPlugin {\\n` +
                   `  constructor() {\\n` +
                   `    this.namespace = 'your-plugin';\\n` +
                   `  }\\n` +
                   `}\\n` +
                   \`\`\`\\n\\n` +
                   `**CLI Integration:**\\n` +
                   \`\`\`javascript\\n` +
                   `await runLevCommand(['plugin', 'command']);\\n` +
                   \`\`\`\\n\\n` +
                   `**Testing Pattern:**\\n` +
                   \`\`\`javascript\\n` +
                   `test('should work via CLI', async () => {\\n` +
                   `  const result = await runLevCommand(['plugin', 'test']);\\n` +
                   `  expect(result.success).toBe(true);\\n` +
                   `});\\n` +
                   \`\`\`\\n\\n` +
                   `🔗 See @lev/workshop plugin for complete reference implementation`
            }]
          };

        case 'intake':
          return {
            content: [{
              type: 'text',
              text: `🚧 **Phase 3 Placeholder - Tool Intake System**\\n\\n` +
                   `This feature will allow community members to submit new tool ideas and specifications.\\n\\n` +
                   `**Planned Features:**\\n` +
                   `• Tool specification templates\\n` +
                   `• Community review process\\n` +
                   `• Automated validation pipeline\\n` +
                   `• Integration with development workflow\\n\\n` +
                   `📅 **Status:** Coming in Phase 3\\n` +
                   `🔄 **Current:** Focus on Phase 1 testing and integration`
            }]
          };

        case 'classify':
          return {
            content: [{
              type: 'text',
              text: `🚧 **Phase 3 Placeholder - Tool Classification**\\n\\n` +
                   `This feature will automatically classify tools by type, complexity, and tier.\\n\\n` +
                   `**Classification System:**\\n` +
                   `• Tier 1: Essential tools (< 1 minute to implement)\\n` +
                   `• Tier 2: Standard tools (< 1 hour to implement)\\n` +
                   `• Tier 3: Advanced tools (< 1 day to implement)\\n\\n` +
                   `**Auto-Classification:**\\n` +
                   `• Complexity analysis\\n` +
                   `• Dependency mapping\\n` +
                   `• Usage pattern recognition\\n\\n` +
                   `📅 **Status:** Coming in Phase 3`
            }]
          };

        case 'create':
          return {
            content: [{
              type: 'text',
              text: `🚧 **Phase 2 Placeholder - Tool Creation System**\\n\\n` +
                   `This feature will provide automated tool and plugin creation capabilities.\\n\\n` +
                   `**Planned Features:**\\n` +
                   `• Interactive tool builder\\n` +
                   `• Template-based generation\\n` +
                   `• Automated testing setup\\n` +
                   `• Integration with CI/CD pipeline\\n\\n` +
                   `**Tool Types:**\\n` +
                   `• CLI tools and utilities\\n` +
                   `• Plugin extensions\\n` +
                   `• Workflow automations\\n` +
                   `• Integration adapters\\n\\n` +
                   `📅 **Status:** Coming in Phase 2\\n` +
                   `🎯 **Priority:** After Phase 1 testing completion`
            }]
          };

        default:
          return {
            content: [{
              type: 'text',
              text: `❌ **Error**: Unknown workshop command: ${command}\\n\\n` +
                   `**Available commands:**\\n` +
                   `• status - Show workshop overview\\n` +
                   `• list - List available tools\\n` +
                   `• info <tool> - Get tool details\\n` +
                   `• onboard - Community onboarding guide\\n` +
                   `• docs - Documentation links\\n` +
                   `• examples - Implementation examples\\n\\n` +
                   `**Phase 2+ commands (placeholders):**\\n` +
                   `• create - Tool creation system\\n` +
                   `• intake - Tool idea submission\\n` +
                   `• classify - Tool classification`
            }]
          };
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Workshop Error**: ${error.message}\\n\\n` +
               `Please check your command syntax and try again.`
        }]
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Kingly Agent MCP server running on stdio');
  }
}

const server = new KinglyAgentServer();
server.run().catch(console.error);