/**
 * Session-Based CLI Adapter for Workflow Orchestrator
 * 
 * Provides REST-like command-line interface with persistent sessions
 * Commands: execute, callback, status, resume
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { SessionManager } from '../../core/session-manager.js';
import { RealWorkflowHandler } from '../../core/real-workflow-handler.js';

export class SessionCLI {
  constructor(options = {}) {
    this.contextPaths = options.contextPaths || [
      path.join(process.env.HOME || '', 'c'),
      path.join(process.cwd(), 'contexts'),
      path.join(process.cwd(), 'workflows')
    ];
    
    this.verbose = options.verbose || false;
    
    // Initialize session manager and workflow handler
    this.sessionManager = new SessionManager({ baseDir: './sessions' });
    this.workflowHandler = new RealWorkflowHandler(this.sessionManager);
  }

  /**
   * Execute workflow command - Creates new session and returns first instruction
   */
  async execute(args) {
    const { workflow, input, verbose } = args;
    
    if (verbose) this.verbose = true;
    
    this.log('🔄 Workflow Orchestration CLI - Session Mode');
    this.log('===========================================');
    
    try {
      // Load workflow
      const workflowData = await this.loadWorkflow(workflow);
      this.log(`✅ Loaded workflow: ${workflowData.metadata?.id}`);
      
      // Parse input
      const inputData = await this.parseInput(input);
      this.log(`📝 Input data: ${Object.keys(inputData).join(', ')}`);
      
      // Create new session
      const session = await this.sessionManager.createSession(workflowData, inputData);
      this.log(`🆔 Session created: ${session.id}`);
      this.log(`📁 Session path: ${session.path}`);
      
      // Get first step from workflow
      const firstStep = this.getFirstStep(workflowData);
      if (!firstStep) {
        throw new Error('No steps found in workflow');
      }
      
      // Generate first instruction
      const instruction = await this.generateStepInstruction(session, firstStep, workflowData, inputData);
      
      // Display the instruction
      this.displayInstruction(instruction);
      
      return {
        sessionId: session.id,
        instruction: instruction,
        status: 'awaiting_callback'
      };
      
    } catch (error) {
      this.error('❌ Workflow execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Handle callback from LLM
   */
  async callback(args) {
    const { sessionId, callbackId, file } = args;
    
    this.log(`🔄 Processing callback: ${callbackId}`);
    this.log(`📁 Session: ${sessionId}`);
    this.log(`📄 File: ${file}`);
    
    try {
      // Load session
      const session = await this.sessionManager.loadSession(sessionId);
      
      // Verify file exists
      if (file) {
        try {
          await fs.access(file);
          this.log(`✅ File verified: ${file}`);
        } catch (err) {
          throw new Error(`Output file not found: ${file}`);
        }
      }
      
      // Complete the pending callback
      const completedContext = await this.sessionManager.completePendingCallback(sessionId, callbackId, file);
      this.log(`✅ Callback completed for step: ${completedContext.stepId}`);
      
      // Check if we need to continue to next step
      const nextInstruction = await this.getNextInstruction(session);
      
      if (nextInstruction) {
        this.log(`\n🔄 Next step available:`);
        this.displayInstruction(nextInstruction);
        return {
          sessionId: sessionId,
          instruction: nextInstruction,
          status: 'awaiting_callback'
        };
      } else {
        this.log(`\n🎉 Workflow complete!`);
        session.status = 'completed';
        await this.sessionManager.saveSession(session);
        return {
          sessionId: sessionId,
          status: 'completed',
          finalPath: session.path
        };
      }
      
    } catch (error) {
      this.error('❌ Callback processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Show session status
   */
  async status(args = {}) {
    const { sessionId } = args;
    
    if (sessionId) {
      // Show specific session
      try {
        const session = await this.sessionManager.loadSession(sessionId);
        this.log(`📊 Session Status: ${sessionId}`);
        this.log(`${'='.repeat(40)}`);
        this.log(`Workflow: ${session.workflowId}`);
        this.log(`Status: ${session.status}`);
        this.log(`Created: ${session.created}`);
        this.log(`Completed Steps: ${session.completedSteps.length}`);
        this.log(`Pending Callbacks: ${session.pendingCallbacks.size}`);
        this.log(`Session Path: ${session.path}`);
        
        if (session.pendingCallbacks.size > 0) {
          this.log(`\nPending Callbacks:`);
          for (const [callbackId, callback] of session.pendingCallbacks) {
            this.log(`  - ${callbackId}: ${callback.context.stepId}`);
          }
        }
        
      } catch (error) {
        this.error(`Session not found: ${sessionId}`);
      }
    } else {
      // List all sessions
      const sessions = await this.sessionManager.listSessions();
      this.log(`📋 All Sessions (${sessions.length})`);
      this.log(`${'='.repeat(40)}`);
      
      if (sessions.length === 0) {
        this.log('No sessions found.');
      } else {
        sessions.forEach(session => {
          this.log(`${session.id}:`);
          this.log(`  Workflow: ${session.workflow}`);
          this.log(`  Status: ${session.status}`);
          this.log(`  Steps: ${session.steps}`);
          this.log(`  Pending: ${session.pending}`);
          this.log('');
        });
      }
    }
  }

  /**
   * Resume a session
   */
  async resume(args) {
    const { sessionId } = args;
    
    if (!sessionId) {
      throw new Error('Session ID required for resume');
    }
    
    const session = await this.sessionManager.loadSession(sessionId);
    
    if (session.status === 'completed') {
      this.log(`Session ${sessionId} is already completed.`);
      return { status: 'completed' };
    }
    
    if (session.pendingCallbacks.size > 0) {
      this.log(`Session ${sessionId} has pending callbacks. Complete them first.`);
      return { status: 'pending_callbacks' };
    }
    
    // Try to get next instruction
    const nextInstruction = await this.getNextInstruction(session);
    
    if (nextInstruction) {
      this.log(`\n🔄 Resuming session: ${sessionId}`);
      this.displayInstruction(nextInstruction);
      return {
        sessionId: sessionId,
        instruction: nextInstruction,
        status: 'awaiting_callback'
      };
    } else {
      this.log(`\n🎉 Session ${sessionId} is complete!`);
      session.status = 'completed';
      await this.sessionManager.saveSession(session);
      return { status: 'completed' };
    }
  }

  /**
   * List available workflows
   */
  async list(args = {}) {
    const { type, category } = args;
    
    this.log('📚 Available Workflows');
    this.log('=====================');
    
    const workflows = await this.discoverWorkflows();
    
    // Filter by type/category if specified
    let filtered = workflows;
    if (type) {
      filtered = workflows.filter(w => w.type === type);
    }
    if (category) {
      filtered = workflows.filter(w => w.category === category);
    }
    
    // Group by category
    const grouped = {};
    for (const workflow of filtered) {
      const cat = workflow.category || 'uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(workflow);
    }
    
    // Display grouped workflows
    for (const [category, workflows] of Object.entries(grouped)) {
      this.log(`\n📁 ${category.toUpperCase()}`);
      for (const workflow of workflows) {
        this.log(`   ${workflow.id} - ${workflow.description}`);
        if (this.verbose) {
          this.log(`      Type: ${workflow.type}, Steps: ${workflow.steps || 0}`);
        }
      }
    }
    
    this.log(`\nTotal: ${filtered.length} workflows`);
  }

  /**
   * Show workflow details
   */
  async info(workflowId) {
    this.log(`📋 Workflow Information: ${workflowId}`);
    this.log('================================');
    
    try {
      const workflow = await this.loadWorkflow(workflowId);
      
      this.log(`ID: ${workflow.metadata?.id}`);
      this.log(`Type: ${workflow.metadata?.type}`);
      this.log(`Version: ${workflow.metadata?.version}`);
      this.log(`Description: ${workflow.metadata?.description}`);
      
      if (workflow.workflow_config?.philosophy) {
        this.log(`Philosophy: ${workflow.workflow_config.philosophy}`);
      }
      
      // Show steps
      const steps = this.extractSteps(workflow);
      if (steps.length > 0) {
        this.log(`\nSteps (${steps.length}):`);
        steps.forEach((step, i) => {
          this.log(`   ${i + 1}. ${step.name || step.id}`);
        });
      }
      
    } catch (error) {
      this.error('❌ Could not load workflow:', error.message);
    }
  }

  /**
   * Display instruction to LLM
   */
  displayInstruction(instruction) {
    this.log(`\n${'='.repeat(80)}`);
    this.log(`🧠 INSTRUCTION FOR LLM - Step ${instruction.stepNumber}`);
    this.log(`${'='.repeat(80)}`);
    
    if (instruction.parallelTasks) {
      this.log(`\n🔄 PARALLEL EXECUTION (${instruction.totalTasks} tasks)`);
      this.log(`Step: ${instruction.stepId}`);
      this.log(`\nExecute these tasks in parallel:`);
      
      instruction.parallelTasks.forEach((task, index) => {
        this.log(`\n--- Task ${index + 1}/${instruction.totalTasks} ---`);
        this.log(`Callback ID: ${task.callbackId}`);
        this.log(`Save to: ${task.fullPath}`);
        this.log(`\nInstruction:`);
        this.log(task.instruction);
      });
    } else {
      this.log(`\nStep: ${instruction.stepId}`);
      this.log(`Save to: ${instruction.fullPath}`);
      this.log(`\n📋 INSTRUCTION:`);
      this.log(`${'-'.repeat(80)}`);
      this.log(instruction.instruction);
      this.log(`${'-'.repeat(80)}`);
    }
    
    this.log(`\n💡 After completing the instruction(s):`);
    if (instruction.parallelTasks) {
      this.log(`   Execute each task, save the output files, then callback for each:`);
      instruction.parallelTasks.forEach(task => {
        this.log(`   ${task.callbackCommand}`);
      });
    } else {
      this.log(`   Execute the instruction, save the output, then callback:`);
      this.log(`   ${instruction.callbackCommand}`);
    }
    this.log(`\n`);
  }

  /**
   * Get first step from workflow
   */
  getFirstStep(workflow) {
    const steps = workflow.workflow_config?.steps;
    if (!steps || steps.length === 0) {
      return null;
    }
    return steps[0];
  }
  
  /**
   * Generate instruction for a workflow step
   */
  async generateStepInstruction(session, step, workflow, input) {
    // Update session with current step
    session.currentStep = step.id;
    session.currentStepNumber = session.completedSteps.length + 1;
    await this.sessionManager.saveSession(session);
    
    // Generate appropriate instruction based on step type
    switch (step.id) {
      case 'qna_wizard':
        const instruction = await this.workflowHandler.generateQnAWizardInstruction(session, step, input);
        await this.sessionManager.addPendingCallback(session.id, 'qna-wizard-complete', { stepId: step.id });
        return instruction;
      
      case 'discovery_phase':
        const qnaOutputs = await this.sessionManager.getStepOutputs(session.id, 'qna_wizard');
        const discoveryInstr = await this.workflowHandler.generateDiscoveryInstructions(session, step, qnaOutputs);
        
        // Add pending callbacks for each parallel task
        for (const task of discoveryInstr.parallelTasks) {
          await this.sessionManager.addPendingCallback(session.id, task.callbackId, { stepId: task.stepId });
        }
        return discoveryInstr;
      
      case 'deep_prompt_building':
        const discoveryOutputs = await this.getAllPreviousOutputs(session);
        const promptInstr = await this.workflowHandler.generatePromptBuildingInstruction(session, step, discoveryOutputs);
        await this.sessionManager.addPendingCallback(session.id, 'prompt-building-complete', { stepId: step.id });
        return promptInstr;
      
      case 'deep_research_execution':
        const allOutputs = await this.getAllPreviousOutputs(session);
        const researchInstr = await this.workflowHandler.generateDeepResearchInstructions(session, step, allOutputs);
        
        // Add pending callbacks for each research task
        for (const task of researchInstr.parallelTasks) {
          await this.sessionManager.addPendingCallback(session.id, task.callbackId, { stepId: task.stepId });
        }
        return researchInstr;
      
      case 'final_synthesis':
        const finalOutputs = await this.getAllPreviousOutputs(session);
        const synthInstr = await this.workflowHandler.generateFinalSynthesisInstruction(session, step, finalOutputs);
        await this.sessionManager.addPendingCallback(session.id, 'synthesis-complete', { stepId: step.id });
        return synthInstr;
      
      default:
        throw new Error(`Unknown step type: ${step.id}`);
    }
  }
  
  /**
   * Get next instruction for continuing workflow
   */
  async getNextInstruction(session) {
    // Reload workflow
    const workflowPath = path.join(session.path, 'workflow.yaml');
    const workflowContent = await fs.readFile(workflowPath, 'utf-8');
    const workflow = yaml.load(workflowContent);
    
    const steps = workflow.workflow_config?.steps || [];
    const nextStepIndex = session.completedSteps.length;
    
    if (nextStepIndex >= steps.length) {
      return null; // Workflow complete
    }
    
    const nextStep = steps[nextStepIndex];
    return await this.generateStepInstruction(session, nextStep, workflow, session.input);
  }
  
  /**
   * Get all previous outputs for context
   */
  async getAllPreviousOutputs(session) {
    const allOutputs = [];
    
    for (const stepId of session.completedSteps) {
      const outputs = await this.sessionManager.getStepOutputs(session.id, stepId);
      allOutputs.push(...outputs.map(o => ({
        ...o,
        context: { stepId }
      })));
    }
    
    return allOutputs;
  }

  /**
   * Load workflow from various sources
   */
  async loadWorkflow(workflow) {
    // Try direct file path first
    if (workflow.endsWith('.yaml') || workflow.endsWith('.yml')) {
      const content = await fs.readFile(workflow, 'utf-8');
      return yaml.load(content);
    }
    
    // Search in context paths
    for (const contextPath of this.contextPaths) {
      const searchPaths = [
        path.join(contextPath, 'workflows', workflow, 'context.yaml'),
        path.join(contextPath, 'patterns', workflow, 'context.yaml'),
        path.join(contextPath, 'agents', workflow, 'context.yaml'),
        path.join(contextPath, workflow + '.yaml'),
        path.join(contextPath, workflow, 'context.yaml')
      ];
      
      for (const searchPath of searchPaths) {
        try {
          const content = await fs.readFile(searchPath, 'utf-8');
          return yaml.load(content);
        } catch (err) {
          // Continue searching
        }
      }
    }
    
    throw new Error(`Workflow not found: ${workflow}`);
  }

  /**
   * Discover available workflows
   */
  async discoverWorkflows() {
    const workflows = [];
    
    for (const contextPath of this.contextPaths) {
      try {
        const categories = ['workflows', 'patterns', 'agents'];
        
        for (const category of categories) {
          const categoryPath = path.join(contextPath, category);
          
          try {
            const entries = await fs.readdir(categoryPath, { withFileTypes: true });
            
            for (const entry of entries) {
              if (entry.isDirectory()) {
                try {
                  const workflowPath = path.join(categoryPath, entry.name, 'context.yaml');
                  const content = await fs.readFile(workflowPath, 'utf-8');
                  const data = yaml.load(content);
                  
                  workflows.push({
                    id: data.metadata?.id || entry.name,
                    type: data.metadata?.type || category.slice(0, -1),
                    category,
                    description: data.metadata?.description || '',
                    steps: this.extractSteps(data).length,
                    path: workflowPath
                  });
                } catch (err) {
                  // Skip invalid workflows
                }
              }
            }
          } catch (err) {
            // Skip missing categories
          }
        }
      } catch (err) {
        // Skip missing context paths
      }
    }
    
    return workflows;
  }

  /**
   * Extract steps from workflow data
   */
  extractSteps(workflow) {
    if (workflow.workflow_config?.steps) {
      return workflow.workflow_config.steps;
    }
    return [];
  }

  /**
   * Parse input from various formats
   */
  async parseInput(input) {
    if (!input) return {};
    
    // If it's a JSON string
    if (typeof input === 'string' && input.startsWith('{')) {
      return JSON.parse(input);
    }
    
    // If it's a file path
    if (typeof input === 'string' && (input.endsWith('.json') || input.endsWith('.yaml') || input.endsWith('.yml'))) {
      const content = await fs.readFile(input, 'utf-8');
      return input.endsWith('.json') ? JSON.parse(content) : yaml.load(content);
    }
    
    // If it's key=value pairs
    if (typeof input === 'string' && input.includes('=')) {
      const result = {};
      const pairs = input.split(',');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        result[key.trim()] = value.trim();
      }
      return result;
    }
    
    // If it's already an object
    if (typeof input === 'object') {
      return input;
    }
    
    // Default: wrap in topic property
    return { topic: input };
  }

  /**
   * Logging utility
   */
  log(message) {
    console.log(message);
  }

  /**
   * Error logging utility
   */
  error(message, error) {
    console.error(message, error || '');
  }
}