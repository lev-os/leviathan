/**
 * CLI Adapter for Workflow Orchestrator
 * 
 * Provides command-line interface for executing workflows with bi-directional orchestration
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { WorkflowOrchestrator } from '../../core/workflow-orchestrator.js';

export class WorkflowCLI {
  constructor(options = {}) {
    this.contextPaths = options.contextPaths || [
      path.join(process.env.HOME || '', 'c'),
      path.join(process.cwd(), 'contexts')
    ];
    
    this.outputDir = options.outputDir || './.workflow-outputs';
    this.verbose = options.verbose || false;
  }

  /**
   * Execute workflow command
   */
  async execute(args) {
    const { workflow, input, interactive, parallel, output, verbose } = args;
    
    if (verbose) this.verbose = true;
    
    this.log('🔄 Workflow Orchestration CLI');
    this.log('============================');
    
    try {
      // Load workflow
      const workflowData = await this.loadWorkflow(workflow);
      this.log(`✅ Loaded workflow: ${workflowData.metadata?.id}`);
      
      // Parse input
      const inputData = await this.parseInput(input);
      this.log(`📝 Input data: ${Object.keys(inputData).join(', ')}`);
      
      // Create orchestrator
      const orchestrator = new WorkflowOrchestrator({
        preserveOutputs: true,
        outputDir: output || this.outputDir,
        enableParallel: parallel,
        onEvent: (event, data) => this.handleEvent(event, data, interactive)
      });
      
      // Execute workflow
      this.log('\n🚀 Starting orchestration...\n');
      const result = await orchestrator.orchestrate(workflowData, inputData);
      
      // Display results
      await this.displayResults(result);
      
      return result;
      
    } catch (error) {
      this.error('❌ Orchestration failed:', error.message);
      throw error;
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
      
      // Show triggers
      const triggers = workflow.workflow_config?.triggers;
      if (triggers) {
        this.log('\nTriggers:');
        if (triggers.manual) {
          this.log(`   Manual: ${triggers.manual.join(', ')}`);
        }
        if (triggers.automatic) {
          this.log(`   Automatic: ${triggers.automatic.join(', ')}`);
        }
      }
      
      // Show personalities (for cognitive parliament)
      const personalities = workflow.workflow_config?.personality_system?.eeps_mapping;
      if (personalities) {
        this.log(`\nPersonalities (${Object.keys(personalities).length}):`);
        Object.keys(personalities).forEach(p => {
          this.log(`   - ${p}`);
        });
      }
      
    } catch (error) {
      this.error('❌ Could not load workflow:', error.message);
    }
  }

  /**
   * Interactive workflow execution
   */
  async interactive(workflowId) {
    this.log('🎛️  Interactive Workflow Mode');
    this.log('===========================');
    
    try {
      const workflow = await this.loadWorkflow(workflowId);
      this.log(`Loaded: ${workflow.metadata?.id}`);
      
      // Get input interactively
      const inputData = await this.promptForInput(workflow);
      
      // Execute with real-time feedback
      return await this.execute({
        workflow: workflowId,
        input: inputData,
        interactive: true,
        verbose: true
      });
      
    } catch (error) {
      this.error('Interactive mode failed:', error.message);
    }
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
    
    if (workflow.workflow_config?.analysis_rounds) {
      return Object.entries(workflow.workflow_config.analysis_rounds).map(([key, value]) => ({
        id: key,
        name: value.description || key
      }));
    }
    
    if (workflow.workflow_config?.tier_structure) {
      return Object.entries(workflow.workflow_config.tier_structure).map(([key, value]) => ({
        id: key,
        name: value.name || key
      }));
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
    
    // Default: wrap in question property
    return { input: input };
  }

  /**
   * Handle orchestration events
   */
  handleEvent(event, data, interactive) {
    if (event === 'llm:inject') {
      if (interactive || this.verbose) {
        this.log(`🔄 Context Switch: ${data.context.stepId}`);
        if (data.context.personality) {
          this.log(`   Personality: ${data.context.personality}`);
        }
        if (data.context.agent) {
          this.log(`   Agent: ${data.context.agent.id}`);
        }
      }
      
      // For demo purposes, we'll simulate LLM processing
      // In a real integration, this would connect to actual LLM
      this.simulateLLMProcessing(data.callbackId, data.context);
    }
  }

  /**
   * Simulate LLM processing for demo
   */
  async simulateLLMProcessing(callbackId, context) {
    // Import orchestrator to access callback
    const { WorkflowOrchestrator } = await import('../../core/workflow-orchestrator.js');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    // Generate appropriate response based on context
    const response = this.generateContextResponse(context);
    
    // Note: In a real CLI, we'd need a way to get back to the orchestrator instance
    // For now, this is a demonstration of the pattern
    console.log(`✅ Simulated response for ${context.stepId}`);
  }

  /**
   * Generate response based on context
   */
  generateContextResponse(context) {
    const stepId = context.stepId || context.step?.id || 'unknown';
    
    return {
      output: `Processed step: ${stepId}`,
      timestamp: new Date().toISOString(),
      context: stepId
    };
  }

  /**
   * Display orchestration results
   */
  async displayResults(result) {
    this.log('\n✅ Orchestration Complete!');
    this.log('=========================');
    this.log(`Success: ${result.success}`);
    this.log(`Duration: ${result.duration}ms`);
    this.log(`Orchestration ID: ${result.orchestrationId}`);
    
    if (result.outputs) {
      this.log(`\n📊 Output Summary:`);
      this.log(`   Steps: ${result.outputs.steps?.length || 0}`);
      this.log(`   Files: ${result.outputs.fileCount || 0}`);
      
      if (result.outputs.files && result.outputs.files.length > 0) {
        this.log(`\n📁 Generated Files:`);
        result.outputs.files.forEach(file => {
          this.log(`   - ${file.name} (${file.type})`);
        });
      }
    }
    
    if (result.result?.summary) {
      this.log(`\n📝 Summary:`);
      this.log(result.result.summary);
    }
    
    if (result.error) {
      this.error(`\n❌ Error: ${result.error}`);
    }
  }

  /**
   * Prompt for input interactively
   */
  async promptForInput(workflow) {
    // For now, return demo input
    // In a full implementation, this would use readline to prompt user
    return {
      question: "Interactive mode demo",
      context: "CLI execution"
    };
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