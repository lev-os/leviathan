/**
 * MCP Tool Handlers for Kingly Agent
 * Ported from agent-mcp for fast task/workspace management
 */

import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { ProjectMCPTools } from './project-mcp-tools.js';
import ResearchAdapter from './research-adapter.js';
import WorkspaceProjectManager, { workspaceProjectTools } from './workspace-project-tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MCPToolHandlers {
  constructor(config = {}) {
    this.config = {
      storePath: config.storePath || './.kingly/memory.json',
      tasksPath: config.tasksPath || './.kingly/tasks',
      workspacePath: config.workspacePath || './.kingly',
      confidenceConfigPath: config.confidenceConfigPath || './config/confidence-thresholds.yaml',
      ...config
    };
    
    // Will be loaded on initialize
    this.confidenceConfig = null;
    this.researchAdapter = null;
    
    this.memory = new Map();
    this.tasks = new Map();
    this.runningProcesses = new Map();
    this.initialized = false;
    
    // Initialize Project Hierarchy System
    this.projectTools = new ProjectMCPTools(this.config);
    
    // Initialize Workspace/Project Manager
    this.workspaceManager = new WorkspaceProjectManager(this.config);
    
    // Don't auto-load in constructor - let caller control initialization
  }

  async initialize() {
    if (!this.initialized) {
      await this.loadMemory();
      await this.loadConfidenceConfig();
      await this.workspaceManager.initialize();
      this.initialized = true;
    }
    return this;
  }
  
  async loadConfidenceConfig() {
    try {
      const configContent = await fs.readFile(this.config.confidenceConfigPath, 'utf8');
      this.confidenceConfig = yaml.load(configContent);
      
      // Apply environment variable overrides
      if (process.env.KINGLY_CONFIDENCE_RESEARCH) {
        this.confidenceConfig.thresholds.research_threshold = parseFloat(process.env.KINGLY_CONFIDENCE_RESEARCH);
      }
      if (process.env.KINGLY_CONFIDENCE_EXECUTION) {
        this.confidenceConfig.thresholds.execution_threshold = parseFloat(process.env.KINGLY_CONFIDENCE_EXECUTION);
      }
      if (process.env.KINGLY_CONFIDENCE_TARGET) {
        this.confidenceConfig.thresholds.target_confidence = parseFloat(process.env.KINGLY_CONFIDENCE_TARGET);
      }
      
      // Initialize research adapter with config (env vars override)
      this.researchAdapter = new ResearchAdapter({
        provider: process.env.KINGLY_RESEARCH_PROVIDER || this.confidenceConfig.research?.provider,
        background: process.env.KINGLY_RESEARCH_BACKGROUND === 'true' || this.confidenceConfig.research?.background,
        timeout: this.confidenceConfig.research?.timeout
      });
      
    } catch (error) {
      // Default config if file not found
      this.confidenceConfig = {
        thresholds: {
          research_threshold: 0.7,
          execution_threshold: 0.8,
          target_confidence: 0.95,
          critical_low: 0.3
        },
        research: {
          provider: 'perplexity-mcp',
          background: false,
          max_attempts: 3,
          research_boost: 0.15
        }
      };
      
      // Initialize with defaults
      this.researchAdapter = new ResearchAdapter(this.confidenceConfig.research);
    }
  }

  // Memory Management Tools
  async handleRememberContext(args) {
    if (!args.key || !args.value) throw new Error('Key and value required');
    
    const entry = {
      key: args.key,
      value: args.value,
      category: args.category || 'general',
      timestamp: new Date().toISOString()
    };
    
    this.memory.set(args.key, entry);
    await this.saveMemory();
    
    return `🧠 Remembered: ${args.key} = ${args.value}`;
  }

  async handleRecallContext(args) {
    if (!args.key) throw new Error('Key required');
    
    const memory = this.memory.get(args.key);
    return memory ? `🧠 Recalled: ${args.key} = ${memory.value}` : `❌ No memory found for ${args.key}`;
  }

  async handleListMemories(args) {
    const category = args.category;
    const memories = Array.from(this.memory.values())
      .filter(m => !category || m.category === category)
      .map(m => `• ${m.key}: ${m.value}`)
      .join('\n');
    
    return memories || 'No memories found';
  }

  // Task Management Tools  
  async handleCreateTask(args) {
    if (!args.title) throw new Error('Title required');
    
    const taskId = `task_${Date.now()}`;
    const task = {
      id: taskId,
      title: args.title,
      description: args.description || '',
      project: args.project || 'General',
      status: 'pending',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      context: args.context || {},
      confidence: null,
      agent: null
    };
    
    this.tasks.set(taskId, task);
    await this.saveTask(task);
    
    // Dynamic instruction injection - the MCP nexus pattern
    const followUpOptions = this.generateFollowUpOptions({
      type: 'task_created',
      taskId: task.id
    });
    
    return {
      message: `✅ Created task: "${task.title}" (ID: ${task.id})`,
      agentInstructions: `You are now in TASK DECOMPOSITION MODE for task ${task.id}.

## YOUR MISSION
Transform this task into a web of 99%-confidence subtasks through intelligent decomposition.

## IMMEDIATE PROTOCOL
1. **ASSESS** - Evaluate your confidence (0-1) in implementing "${task.title}" directly
   - Consider: complexity, unknowns, dependencies, required skills
   
## PROTOCOL ROUTING
- For quick estimates: agent://dev/estimate?task=${encodeURIComponent(task.title)}
- For feasibility: agent://dev/feasibility?complexity=high
- For CEO input: agent://ceo/prioritize?items=${task.title}
- For deep research: spawn://research?task=${task.id}&depth=comprehensive
   - Use: assess_task_confidence("${task.id}", confidence, {factors}, "reasoning")

2. **RESEARCH** (if confidence < 0.7)
   - Query: "Implementation guide for ${task.title}: architecture, components, best practices, common patterns"
   - Use: mcp__perplexity-ask__perplexity_ask
   - Update task context with findings

3. **DECOMPOSE** (if confidence < 0.99)
   - Split into subtasks that each have ≥0.99 confidence
   - Each subtask should be a single, clear action
   - Use: split_task("${task.id}", "reason", [subtasks])

4. **RECURSE** - Repeat steps 1-3 for each subtask until all leaves have 0.99 confidence

## CONTEXT
- Task: "${task.title}"
- Description: "${task.description}"
- Project: ${task.project}
- Max depth: 5 levels
- Target confidence: 0.99 (99%)

## RESPONSE FORMAT
Start with: "I'll now decompose '${task.title}' into actionable subtasks..."

Then show your work:
- Initial confidence assessment
- Research findings (if needed)
- Decomposition strategy
- Final task tree with confidence levels`,
      audit: {
        action: 'task_created',
        taskId: task.id,
        project: task.project,
        timestamp: task.created
      }
    };
  }

  async handleUpdateTask(args) {
    const { taskId, ...updates } = args;
    if (!taskId) throw new Error('taskId required');
    
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    
    Object.assign(task, updates, { updated: new Date().toISOString() });
    this.tasks.set(taskId, task);
    await this.saveTask(task);
    
    return `📝 Updated task: ${task.title}`;
  }

  async handleGetTask(args) {
    if (!args.taskId) throw new Error('taskId required');
    
    // First check memory (temporary backward compatibility)
    const memoryTask = this.tasks.get(args.taskId);
    
    // Return instructions for finding the task
    return {
      message: `Looking for task ${args.taskId}`,
      memoryTask: memoryTask || null,
      agentInstructions: `TASK RETRIEVAL MODE

## YOUR MISSION
Find and analyze task ${args.taskId} from the project hierarchy.

## SEARCH PROTOCOL
1. Check if task exists in memory (legacy): ${memoryTask ? 'YES' : 'NO'}
2. Search in .kingly/projects/*/tasks/ for ${args.taskId}.yaml
3. If found, read both YAML and companion .md file if exists

## ANALYSIS PROTOCOL
Once found, analyze the task for:
1. **Current Status**: Is it ready for work?
2. **Confidence Level**: Does it need assessment?
3. **Dependencies**: Are there blockers?
4. **Next Actions**: What should happen next?

## RESPONSE FORMAT
Present the task details and then provide numbered options:

**1)** Assess confidence for this task
**2)** Execute task with [appropriate agent]
**3)** Split task into subtasks
**4)** Update task status
**5)** Add implementation notes

## IF TASK NOT FOUND
The task might be in the project hierarchy. Try:
- List all projects to find which one contains this task
- Use the project-specific task retrieval methods`
    };
  }

  async handleListTasks(args) {
    const project = args.project;
    const status = args.status;
    
    const tasks = Array.from(this.tasks.values())
      .filter(t => !project || t.project === project)
      .filter(t => !status || t.status === status)
      .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
    
    const formatted = tasks.map(t => 
      `📋 ${t.id}: ${t.title} (${t.status}) - ${t.project}`
    ).join('\n');
    
    // Return object to allow pipeline injection
    return {
      message: formatted || 'No tasks found',
      taskCount: tasks.length,
      agentInstructions: tasks.length > 0 ? 
        `Found ${tasks.length} tasks. Review them and determine next actions.` : 
        'No tasks found. Consider creating new tasks based on user needs.'
    };
  }

  // Task Splitting Tool - LLM-driven
  async handleSplitTask(args) {
    const { taskId, reason, subtasks, confidence } = args;
    if (!taskId || !subtasks) throw new Error('taskId and subtasks required');
    
    const parentTask = this.tasks.get(taskId);
    if (!parentTask) throw new Error(`Task ${taskId} not found`);
    
    // Update parent task
    parentTask.status = 'split';
    parentTask.splitReason = reason;
    parentTask.confidence = confidence;
    parentTask.updated = new Date().toISOString();
    
    // Create subtasks
    const createdSubtasks = [];
    for (const [index, subtask] of subtasks.entries()) {
      const subtaskId = `${taskId}_sub_${index + 1}`;
      const newSubtask = {
        id: subtaskId,
        title: subtask.title || subtask,
        description: subtask.description || '',
        project: parentTask.project,
        status: 'pending',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        parentTask: taskId,
        confidence: subtask.confidence || 0.8,
        agent: subtask.agent || null,
        context: { ...parentTask.context, ...subtask.context }
      };
      
      this.tasks.set(subtaskId, newSubtask);
      await this.saveTask(newSubtask);
      createdSubtasks.push(newSubtask);
    }
    
    await this.saveTask(parentTask);
    
    return {
      message: `🔄 Split task "${parentTask.title}" into ${createdSubtasks.length} subtasks`,
      parentTask: parentTask,
      subtasks: createdSubtasks
    };
  }

  // Confidence Assessment Tool
  async handleAssessTaskConfidence(args) {
    const { taskId, factors, confidence, reasoning } = args;
    if (!taskId || confidence === undefined) throw new Error('taskId and confidence required');
    
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    
    // Update task with confidence assessment
    task.confidence = confidence;
    task.confidenceFactors = factors;
    task.confidenceReasoning = reasoning;
    task.updated = new Date().toISOString();
    
    // Check if research is needed based on config
    let finalConfidence = confidence;
    let researchPerformed = false;
    let researchResults = null;
    
    if (confidence < this.confidenceConfig.thresholds.research_threshold) {
      // Prepare research context
      const researchContext = {
        task: task,
        confidence: confidence,
        factors: factors,
        reasoning: reasoning
      };
      
      // Perform research based on provider config
      researchPerformed = true;
      const researchPrompt = this.getResearchPrompt(task, confidence);
      
      // Execute research (might be background)
      const researchResponse = await this.researchAdapter.research(researchPrompt, {
        background: process.env.KINGLY_RESEARCH_BACKGROUND === 'true' || this.confidenceConfig.research?.background
      });
      
      researchResults = {
        needed: true,
        urgency: confidence < this.confidenceConfig.thresholds.critical_low ? 'critical' : 'normal',
        prompt: researchPrompt,
        response: researchResponse
      };
      
      // Only boost confidence if research completed synchronously
      if (researchResponse.type === 'direct_result' || researchResponse.type === 'mock_result') {
        finalConfidence = Math.min(confidence + this.confidenceConfig.research.research_boost, 1.0);
      } else {
        // Background research - maintain current confidence
        finalConfidence = confidence;
      }
    }
    
    // Determine next action based on final confidence and config
    let recommendation;
    if (finalConfidence >= this.confidenceConfig.thresholds.execution_threshold) {
      recommendation = 'execute_directly';
      task.status = 'ready';
    } else {
      recommendation = 'split_required';
      task.status = 'needs_splitting';
    }
    
    await this.saveTask(task);
    
    // Create/update dev ticket with confidence assessment
    const devTicketContent = `# ${task.title}

## Task ID: ${taskId}
**Project**: ${task.project}  
**Created**: ${task.created}  
**Status**: ${task.status}  

## Description
${task.description || 'No description provided'}

## Confidence Assessment
**Score**: ${Math.round(confidence * 100)}% ${confidence >= 0.8 ? '✅' : '❌'}  
**Decision**: ${recommendation}  

### Factors
${factors ? Object.entries(factors).map(([k, v]) => `- **${k}**: ${v}`).join('\n') : '- No factors provided'}

### Reasoning
${reasoning || 'No reasoning provided'}

## Implementation Notes
${confidence >= 0.8 ? '### Ready for Direct Execution\nTask has sufficient confidence to proceed without splitting.\n' : '### Requires Task Splitting\nTask complexity exceeds confidence threshold. Recommended splitting strategies:\n1. By technical components\n2. By implementation phases\n3. By skill requirements\n'}

---
*Last Updated: ${new Date().toISOString()}*
`;

    await this.saveDevTicket(taskId, devTicketContent);
    
    // Dynamic instruction injection based on confidence
    const response = {
      message: `🎯 Assessed confidence for "${task.title}": ${Math.round(confidence * 100)}%`,
      task: task,
      recommendation: recommendation,
      shouldSplit: finalConfidence < this.confidenceConfig.thresholds.execution_threshold,
      research: researchResults,
      thresholds: this.confidenceConfig.thresholds
    };
    
    // Different instructions based on confidence and research needs
    if (researchPerformed && researchResults.needed) {
      // Check research response type
      if (researchResults.response.type === 'background_research') {
        response.agentInstructions = `BACKGROUND RESEARCH INITIATED for task ${taskId}.

## SITUATION
Your confidence (${Math.round(confidence * 100)}%) triggered research.
Research is running in background (ticket: ${researchResults.response.ticketId})

## WHILE RESEARCH RUNS
1. Continue with other tasks or conversation
2. Check research status: agent://research/status?ticket=${researchResults.response.ticketId}
3. Consider preliminary planning based on current knowledge

## NEXT STEPS
- If urgent, proceed with caution using current knowledge
- Otherwise, wait for research to complete for better confidence`;
        
      } else if (researchResults.response.type === 'mcp_instruction') {
        response.agentInstructions = `RESEARCH REQUIRED for task ${taskId}.

## SITUATION
Your confidence (${Math.round(confidence * 100)}%) is below the research threshold (70%).

## IMMEDIATE ACTION
Use Perplexity to research this task:

\`\`\`
mcp__perplexity-ask__perplexity_ask({
  messages: [{
    role: "user",
    content: "${researchResults.prompt}"
  }]
})
\`\`\`

## AFTER RESEARCH
1. Update the task's dev ticket with research findings
2. Re-assess confidence with new knowledge
3. If still < 0.99, decompose into subtasks
4. Each subtask should be something you're 99% confident about

## CONTEXT
Current factors: ${JSON.stringify(factors)}
Reasoning: ${reasoning}`;
      } else {
        // Direct result available
        response.agentInstructions = `RESEARCH COMPLETED for task ${taskId}.

## RESEARCH RESULTS
${researchResults.response.content || 'Research results available'}

## CONFIDENCE UPDATE
Your confidence has been boosted from ${Math.round(confidence * 100)}% to ${Math.round(finalConfidence * 100)}%

## NEXT STEPS
- If confidence >= ${Math.round(this.confidenceConfig.thresholds.execution_threshold * 100)}%, proceed with implementation
- Otherwise, decompose into subtasks`;
      }
    } else if (finalConfidence < this.confidenceConfig.thresholds.target_confidence) {
      response.agentInstructions = `DECOMPOSITION REQUIRED for task ${taskId}.

## SITUATION  
Your confidence (${Math.round(confidence * 100)}%) is below target (99%).

## IMMEDIATE ACTION
Split this task into subtasks you're 99% confident about:

\`\`\`
split_task("${taskId}", "Confidence ${Math.round(confidence * 100)}% < 99% target", [
  {
    title: "Subtask 1 title",
    description: "Clear, single action",
    confidence: 0.99,
    agent: "appropriate_agent"
  },
  // ... more subtasks
])
\`\`\`

## SPLITTING STRATEGIES
1. **By Component**: Frontend / Backend / Database / API
2. **By Phase**: Research → Design → Implement → Test → Deploy  
3. **By Feature**: User stories or functional units
4. **By Complexity**: Simple tasks first, complex tasks decomposed further

## GOAL
Every leaf task should be something you can implement directly with full confidence.
Continue recursively until all tasks are at 99% confidence.`;
    } else {
      response.agentInstructions = `READY FOR EXECUTION - task ${taskId}.

## SITUATION
Confidence is ${Math.round(confidence * 100)}% - exceeds 99% threshold!

## OPTIONS
1. **Execute Now**: Use execute_task("${taskId}", "dev", "implementation approach")
2. **Final Review**: Check the dev ticket one more time
3. **Split Anyway**: Even 99% tasks can benefit from organization

## CONTEXT
This task is atomic and well-understood. The dev ticket should contain all necessary implementation details.`;
    }
    
    response.audit = {
      action: 'confidence_assessed',
      taskId: taskId,
      confidence: confidence,
      decision: recommendation,
      timestamp: new Date().toISOString()
    };
    
    return response;
  }

  // Execute Task Tool
  async handleExecuteTask(args) {
    const { taskId, agent, approach } = args;
    if (!taskId || !agent) throw new Error('taskId and agent required');
    
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    
    // Check confidence
    if (task.confidence !== null && task.confidence < 0.8) {
      return {
        error: `Task confidence (${Math.round(task.confidence * 100)}%) below 80% threshold. Consider splitting first.`,
        task: task,
        shouldSplit: true
      };
    }
    
    // Update task status
    task.status = 'in_progress';
    task.agent = agent;
    task.approach = approach;
    task.executionStarted = new Date().toISOString();
    task.updated = new Date().toISOString();
    
    await this.saveTask(task);
    
    return {
      message: `🚀 Executing task "${task.title}" with ${agent} agent`,
      task: task,
      executionId: `exec_${taskId}_${Date.now()}`
    };
  }

  // Project Management
  async handleCreateProject(args) {
    await this.initialize();
    return await this.projectTools.handleCreateProject(args);
  }

  async handleListProjects(args) {
    await this.initialize();
    return await this.projectTools.handleListProjects(args);
  }

  async handleGetProject(args) {
    await this.initialize();
    return await this.projectTools.handleGetProject(args);
  }

  async handleCreateEnhancedTask(args) {
    await this.initialize();
    return await this.projectTools.handleCreateEnhancedTask(args);
  }

  // Workspace Management
  async handleGetWorkspaceState() {
    await fs.ensureDir(this.config.workspacePath);
    
    const tasks = Array.from(this.tasks.values());
    const projects = [...new Set(tasks.map(t => t.project))];
    
    const state = {
      workspace: this.config.workspacePath,
      projects: projects,
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        needs_splitting: tasks.filter(t => t.status === 'needs_splitting').length
      },
      memory: {
        entries: this.memory.size,
        categories: [...new Set(Array.from(this.memory.values()).map(m => m.category))]
      }
    };
    
    return state;
  }

  // Internal methods
  async loadMemory() {
    try {
      if (await fs.pathExists(this.config.storePath)) {
        const data = await fs.readJson(this.config.storePath);
        this.memory = new Map(Object.entries(data.memory || {}));
        this.tasks = new Map(Object.entries(data.tasks || {}));
      }
    } catch (error) {
      console.warn('Failed to load memory:', error.message);
    }
  }

  async saveMemory() {
    await fs.ensureDir(path.dirname(this.config.storePath));
    
    const data = {
      memory: Object.fromEntries(this.memory),
      tasks: Object.fromEntries(this.tasks),
      updated: new Date().toISOString()
    };
    
    await fs.writeJson(this.config.storePath, data, { spaces: 2 });
  }

  async saveTask(task) {
    // Save to memory
    this.tasks.set(task.id, task);
    
    // Save individual task file
    await fs.ensureDir(this.config.tasksPath);
    const taskFile = path.join(this.config.tasksPath, `${task.id}.json`);
    await fs.writeJson(taskFile, task, { spaces: 2 });
    
    // Update memory store
    await this.saveMemory();
  }

  async saveDevTicket(taskId, content) {
    await fs.ensureDir(this.config.tasksPath);
    const mdPath = path.join(this.config.tasksPath, `${taskId}.md`);
    await fs.writeFile(mdPath, content, 'utf-8');
  }

  async appendToDevTicket(taskId, content) {
    const mdPath = path.join(this.config.tasksPath, `${taskId}.md`);
    if (await fs.pathExists(mdPath)) {
      await fs.appendFile(mdPath, content, 'utf-8');
    } else {
      await this.saveDevTicket(taskId, content);
    }
  }

  formatTask(task) {
    return `📋 Task: ${task.title}
📝 Description: ${task.description}
📊 Status: ${task.status}
🏷️ Project: ${task.project}
🎯 Confidence: ${task.confidence ? Math.round(task.confidence * 100) + '%' : 'Not assessed'}
🤖 Agent: ${task.agent || 'Not assigned'}
📅 Created: ${task.created}
📅 Updated: ${task.updated}`;
  }

  // Workspace & Project Management Handlers
  async handleCreateWorkspace(args) {
    return await this.workspaceManager.createWorkspace(args);
  }

  async handleDiscoverWorkspaces(args) {
    return await this.workspaceManager.discoverWorkspaces(args);
  }

  async handleSetWorkspace(args) {
    return await this.workspaceManager.setWorkspace(args.name);
  }

  async handleCreateProject(args) {
    return await this.workspaceManager.createProject(args);
  }

  async handleDiscoverProjects(args) {
    return await this.workspaceManager.discoverProjects(args);
  }

  async handleSetProject(args) {
    return await this.workspaceManager.setProject(args);
  }

  async handleGetCurrentContext(args) {
    return await this.workspaceManager.getCurrentContext();
  }

  // Get all MCP tool definitions
  getToolDefinitions() {
    return [
      {
        name: "remember_context",
        description: "Store context for future conversations",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "Memory key" },
            value: { type: "string", description: "Value to remember" },
            category: { type: "string", description: "Category (task, project, preference)" }
          },
          required: ["key", "value"]
        }
      },
      {
        name: "recall_context", 
        description: "Retrieve stored context",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string", description: "Memory key to retrieve" },
            category: { type: "string", description: "Category to search in" }
          }
        }
      },
      {
        name: "create_task",
        description: "Create a new task",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Task title" },
            description: { type: "string", description: "Task description" },
            project: { type: "string", description: "Project name" },
            context: { type: "object", description: "Task context" }
          },
          required: ["title"]
        }
      },
      {
        name: "assess_task_confidence",
        description: "Assess confidence level (0-1) for task completion. If < 0.8, task should be split.",
        inputSchema: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "Task ID" },
            confidence: { type: "number", description: "Confidence level 0-1" },
            factors: { type: "object", description: "Factors affecting confidence" },
            reasoning: { type: "string", description: "Explanation of confidence assessment" }
          },
          required: ["taskId", "confidence"]
        }
      },
      {
        name: "split_task",
        description: "Split a task into smaller subtasks when confidence < 80%",
        inputSchema: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "Parent task ID" },
            reason: { type: "string", description: "Reason for splitting" },
            subtasks: { 
              type: "array", 
              description: "Array of subtask definitions",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  confidence: { type: "number" },
                  agent: { type: "string" }
                }
              }
            },
            confidence: { type: "number", description: "Original task confidence" }
          },
          required: ["taskId", "subtasks"]
        }
      },
      {
        name: "execute_task",
        description: "Execute a task with specified agent (only if confidence >= 80%)",
        inputSchema: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "Task ID" },
            agent: { type: "string", description: "Agent to execute with" },
            approach: { type: "string", description: "Execution approach" }
          },
          required: ["taskId", "agent"]
        }
      },
      {
        name: "get_task",
        description: "Get task details",
        inputSchema: {
          type: "object",
          properties: {
            taskId: { type: "string", description: "Task ID" }
          },
          required: ["taskId"]
        }
      },
      {
        name: "list_tasks",
        description: "List tasks with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            project: { type: "string", description: "Filter by project" },
            status: { type: "string", description: "Filter by status" }
          }
        }
      },
      {
        name: "get_workspace_state",
        description: "Get current workspace state and statistics",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "create_project",
        description: "Create a new project in the workspace",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Unique project ID" },
            title: { type: "string", description: "Project title" },
            workingDirectory: { type: "string", description: "Project working directory" }
          },
          required: ["projectId", "title"]
        }
      },
      {
        name: "list_projects",
        description: "List all projects in the workspace",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_project",
        description: "Get project details by ID",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" }
          },
          required: ["projectId"]
        }
      },
      {
        name: "create_enhanced_task",
        description: "Create an enhanced task with full business and technical context",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string", description: "Project ID" },
            taskData: {
              type: "object",
              description: "Enhanced task data",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                type: { type: "string" },
                owner: { type: "string" },
                executors: { type: "array", items: { type: "string" } },
                goal: { type: "string" },
                business_value: { type: "string" },
                acceptance_criteria: { type: "array", items: { type: "string" } }
              },
              required: ["title", "type"]
            }
          },
          required: ["projectId", "taskData"]
        }
      },
      // Workspace & Project Management Tools
      ...Object.values(workspaceProjectTools)
    ];
  }

  // Helper: Generate numbered follow-up options
  generateFollowUpOptions(context) {
    const options = [];
    
    if (context.type === 'task_created') {
      options.push({
        number: 1,
        action: 'Assess confidence with high rating (0.9)',
        command: `assess_task_confidence("${context.taskId}", 0.9, {complexity: "low"}, "Straightforward task")`
      });
      options.push({
        number: 2,
        action: 'Assess confidence with medium rating (0.6)',
        command: `assess_task_confidence("${context.taskId}", 0.6, {complexity: "medium"}, "Some unknowns")`
      });
      options.push({
        number: 3,
        action: 'Assess confidence with low rating (0.3)',
        command: `assess_task_confidence("${context.taskId}", 0.3, {complexity: "high"}, "Many uncertainties")`
      });
      options.push({
        number: 4,
        action: 'View task details',
        command: `get_task("${context.taskId}")`
      });
    }
    
    if (context.type === 'confidence_low') {
      options.push({
        number: 1,
        action: 'Split into analysis + implementation subtasks',
        description: 'Common pattern for complex features'
      });
      options.push({
        number: 2,
        action: 'Split by technical components',
        description: 'Frontend, backend, database, etc.'
      });
      options.push({
        number: 3,
        action: 'Split by phases',
        description: 'Research, design, implement, test'
      });
      options.push({
        number: 4,
        action: 'Reconsider - assess higher confidence',
        description: 'Maybe it\'s not as complex as initially thought'
      });
    }
    
    if (context.type === 'ready_to_execute') {
      options.push({
        number: 1,
        action: 'Execute with architect agent',
        command: `execute_task("${context.taskId}", "architect", "Design first approach")`
      });
      options.push({
        number: 2,
        action: 'Execute with dev agent',
        command: `execute_task("${context.taskId}", "dev", "Direct implementation")`
      });
      options.push({
        number: 3,
        action: 'Execute with analyst agent',
        command: `execute_task("${context.taskId}", "analyst", "Research first")`
      });
      options.push({
        number: 4,
        action: 'Split anyway for better organization',
        description: 'Even high confidence tasks can benefit from decomposition'
      });
    }
    
    return options;
  }

  // PRD Analysis - Create complete task web
  async handleAnalyzePRD(args) {
    const { prdContent, project } = args;
    if (!prdContent) throw new Error('PRD content required');
    
    // First, understand what needs to be built
    const analysis = {
      features: this.extractFeatures(prdContent),
      requirements: this.extractRequirements(prdContent),
      complexity: this.assessPRDComplexity(prdContent)
    };
    
    // Generate task recommendations
    const recommendations = [];
    
    // Feature tasks
    analysis.features.forEach((feature, idx) => {
      recommendations.push({
        title: feature.name,
        description: feature.description,
        type: 'feature',
        estimatedConfidence: feature.complexity === 'high' ? 0.3 : 0.6,
        needsResearch: feature.complexity === 'high'
      });
    });
    
    // Technical tasks
    if (analysis.requirements.includes('authentication')) {
      recommendations.push({
        title: 'Implement authentication system',
        description: 'User login, registration, JWT tokens',
        type: 'technical',
        estimatedConfidence: 0.4,
        needsResearch: true
      });
    }
    
    return {
      message: `📋 Analyzed PRD: Found ${analysis.features.length} features and ${recommendations.length} recommended tasks`,
      analysis: analysis,
      recommendations: recommendations,
      nextAction: {
        instruction: 'Review recommended tasks. You can:',
        options: [
          '**1)** Create all recommended tasks automatically',
          '**2)** Select specific tasks to create',
          '**3)** Modify recommendations before creating',
          '**4)** Request more detailed analysis'
        ]
      },
      autoFlow: {
        enabled: true,
        createAllCommand: `Create all ${recommendations.length} tasks with auto-splitting`,
        perplexityPrompt: `Research implementation patterns for: ${analysis.features.map(f => f.name).join(', ')}`
      }
    };
  }

  extractFeatures(prdContent) {
    // Simple extraction - can be enhanced
    const features = [];
    const lines = prdContent.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^#{1,2}\s+(.+)/)) {
        const name = line.replace(/^#{1,2}\s+/, '');
        if (!['overview', 'introduction', 'conclusion'].includes(name.toLowerCase())) {
          features.push({
            name: name,
            description: '',
            complexity: name.length > 30 ? 'high' : 'medium'
          });
        }
      }
    });
    
    return features;
  }

  extractRequirements(prdContent) {
    const requirements = [];
    const keywords = ['authentication', 'database', 'api', 'frontend', 'backend'];
    
    keywords.forEach(keyword => {
      if (prdContent.toLowerCase().includes(keyword)) {
        requirements.push(keyword);
      }
    });
    
    return requirements;
  }

  assessPRDComplexity(prdContent) {
    const factors = {
      length: prdContent.length > 5000 ? 'high' : 'medium',
      features: (prdContent.match(/^#{1,2}\s+/gm) || []).length > 10 ? 'high' : 'medium',
      technical: /distributed|microservice|scaling|performance/i.test(prdContent) ? 'high' : 'medium'
    };
    
    const highCount = Object.values(factors).filter(v => v === 'high').length;
    return highCount >= 2 ? 'high' : 'medium';
  }

  // Message Analysis - Agent does this, not JS
  async handleAnalyzeMessage(args) {
    const { message, context } = args;
    if (!message) throw new Error('Message required for analysis');
    
    return {
      message: 'Message received for analysis',
      agentInstructions: `ANALYZE THIS MESSAGE FOR TASK POTENTIAL

## YOUR MISSION
Determine if the user's message contains actionable tasks or is just conversation.

## MESSAGE TO ANALYZE
"${message}"

## ANALYSIS PROTOCOL
1. **Look for task indicators:**
   - Action verbs: build, create, implement, fix, add, setup
   - Need expressions: "I need to", "Can you help me", "We should"
   - Problem statements: "isn't working", "broken", "failing"

2. **Exclude non-tasks:**
   - Questions seeking information
   - Confirmations (yes, no, thanks)
   - Menu selections (single numbers)
   - Explanatory requests

3. **If tasks detected:**
   - Extract clear task titles
   - Present as numbered options
   - Always include "continue conversation" option

4. **If no tasks:**
   - Continue normal conversation
   - Don't force task creation

## RESPONSE FORMAT
If tasks detected:
"I noticed you might want to create some tasks. Would you like me to:
1) Create task: [extracted title]
2) Create task: [another title]
3) Create different task
4) Continue conversation"

If no tasks:
Continue responding to their actual question/statement.`
    };
  }
  
  // Get research prompt based on task and confidence
  getResearchPrompt(task, confidence) {
    const urgency = confidence < this.confidenceConfig.thresholds.critical_low ? 'critical' : 
                   confidence < 0.5 ? 'low' : 'medium';
    
    const basePrompt = this.confidenceConfig.research?.prompts?.[urgency] || 
      "Research {task}. Focus on implementation approach and best practices.";
    
    // Replace placeholders
    const prompt = basePrompt
      .replace('{task}', `${task.title}: ${task.description}`)
      .replace('{title}', task.title)
      .replace('{description}', task.description);
    
    return prompt;
  }
}