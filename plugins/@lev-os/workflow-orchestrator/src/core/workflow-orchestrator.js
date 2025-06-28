/**
 * Workflow Orchestrator - The conductor of bi-directional intelligence
 * 
 * This orchestrator guides the LLM through complex workflows by:
 * 1. Loading workflow contexts from YAML
 * 2. Switching LLM contexts dynamically
 * 3. Tracking all outputs (files, markdown, PDFs, scripts)
 * 4. Intelligently feeding outputs to subsequent steps
 * 5. Managing bi-directional feedback loops
 */

import { FlowMind } from './flowmind-base.js';
import { ContextSwitcher } from './context-switcher.js';
import { OutputManager } from './output-manager.js';
import { FeedbackLoop } from './feedback-loop.js';

export class WorkflowOrchestrator {
  constructor(options = {}) {
    this.contextSwitcher = new ContextSwitcher(options);
    this.outputManager = new OutputManager(options);
    this.feedbackLoop = new FeedbackLoop(options);
    
    // Track active orchestrations
    this.activeOrchestrations = new Map();
    
    // Options
    this.options = {
      maxConcurrentSteps: options.maxConcurrentSteps || 1,
      enableParallel: options.enableParallel || false,
      trackIntermediateOutputs: options.trackIntermediateOutputs !== false,
      ...options
    };
  }

  /**
   * Main orchestration method - guides the LLM through a workflow
   */
  async orchestrate(workflowYaml, initialInput, orchestrationId = null) {
    // Create FlowMind context from YAML
    const workflow = new FlowMind(workflowYaml);
    
    // Generate orchestration ID if not provided
    const orchId = orchestrationId || `orch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize orchestration state
    const orchestration = {
      id: orchId,
      workflow,
      startTime: Date.now(),
      currentStep: 0,
      status: 'active',
      outputs: new Map(),
      errors: [],
      llmCallbacks: []
    };
    
    this.activeOrchestrations.set(orchId, orchestration);
    
    try {
      // Execute workflow based on type
      let result;
      
      if (workflow.is('workflow')) {
        result = await this.executeWorkflow(orchestration, initialInput);
      } else if (workflow.is('pattern')) {
        result = await this.executePattern(orchestration, initialInput);
      } else if (workflow.is('agent')) {
        result = await this.executeAgent(orchestration, initialInput);
      } else {
        throw new Error(`Unknown FlowMind type: ${workflow.type}`);
      }
      
      orchestration.status = 'completed';
      orchestration.endTime = Date.now();
      orchestration.result = result;
      
      return {
        success: true,
        orchestrationId: orchId,
        workflow: workflow.id,
        duration: orchestration.endTime - orchestration.startTime,
        result,
        outputs: this.outputManager.getAllOutputs(orchId)
      };
      
    } catch (error) {
      orchestration.status = 'failed';
      orchestration.error = error.message;
      orchestration.endTime = Date.now();
      
      return {
        success: false,
        orchestrationId: orchId,
        workflow: workflow.id,
        error: error.message,
        outputs: this.outputManager.getAllOutputs(orchId)
      };
      
    } finally {
      // Cleanup after delay to allow inspection
      setTimeout(() => {
        this.activeOrchestrations.delete(orchId);
      }, 300000); // 5 minutes
    }
  }

  /**
   * Execute a workflow with steps
   */
  async executeWorkflow(orchestration, initialInput) {
    const { workflow, id: orchId } = orchestration;
    const steps = workflow.steps;
    
    if (!steps || steps.length === 0) {
      throw new Error('Workflow has no steps defined');
    }
    
    let currentInput = initialInput;
    const stepResults = [];
    
    // Execute each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      orchestration.currentStep = i;
      
      // Check if parallel execution is needed
      if (step.parallel && this.options.enableParallel) {
        const parallelResults = await this.executeParallelSteps(
          orchestration, 
          step.parallel, 
          currentInput
        );
        stepResults.push(parallelResults);
        currentInput = this.outputManager.synthesize(orchId, parallelResults);
        
      } else {
        // Sequential execution
        const stepResult = await this.executeStep(
          orchestration,
          step,
          currentInput,
          i
        );
        stepResults.push(stepResult);
        
        // Use output manager to prepare input for next step
        if (i < steps.length - 1) {
          const nextStep = steps[i + 1];
          currentInput = this.outputManager.prepareNextInput(
            orchId,
            stepResult,
            nextStep.inputRequirements || {}
          );
        }
      }
    }
    
    // Final synthesis
    return this.outputManager.synthesizeFinal(orchId, stepResults);
  }

  /**
   * Execute a single workflow step
   */
  async executeStep(orchestration, step, input, stepIndex) {
    const { id: orchId } = orchestration;
    
    // Switch context - this tells the LLM who/what it is for this step
    const context = await this.contextSwitcher.prepareContext(
      orchestration.workflow,
      step,
      input,
      this.outputManager.getPreviousOutputs(orchId)
    );
    
    // Create callback for LLM response
    const callbackId = `${orchId}-step-${stepIndex}`;
    
    // Register callback handler
    const stepPromise = this.feedbackLoop.expectCallback(callbackId, {
      timeout: step.timeout || 300000, // 5 minutes default
      retries: step.retries || 1
    });
    
    // Inject context into LLM (this is where the magic happens)
    await this.injectLLMContext(context, callbackId);
    
    // Wait for LLM to process and callback
    const llmResponse = await stepPromise;
    
    // Track the output
    const trackedOutput = await this.outputManager.track(
      orchId,
      step,
      llmResponse,
      stepIndex
    );
    
    return trackedOutput;
  }

  /**
   * Execute parallel steps
   */
  async executeParallelSteps(orchestration, parallelSteps, input) {
    const promises = parallelSteps.map((step, index) => 
      this.executeStep(orchestration, step, input, `parallel-${index}`)
    );
    
    return await Promise.all(promises);
  }

  /**
   * Execute a pattern (e.g., cognitive parliament)
   */
  async executePattern(orchestration, input) {
    const { workflow } = orchestration;
    
    // Special handling for cognitive parliament
    if (workflow.id === 'cognitive-parliament') {
      return await this.executeCognitiveParliament(orchestration, input);
    }
    
    // Generic pattern execution
    const patternSteps = this.convertPatternToSteps(workflow);
    orchestration.workflow.steps = patternSteps;
    
    return await this.executeWorkflow(orchestration, input);
  }

  /**
   * Execute cognitive parliament pattern
   */
  async executeCognitiveParliament(orchestration, input) {
    const { workflow, id: orchId } = orchestration;
    const personalities = workflow.personalitySystem?.eeps_mapping || {};
    
    const results = new Map();
    
    // Phase 1: Isolation phase - each personality analyzes independently
    const isolationPromises = Object.entries(personalities).map(
      async ([personalityId, config]) => {
        const context = {
          personality: personalityId,
          config,
          instruction: config.anti_group_think_prompt,
          input
        };
        
        const result = await this.executeStep(
          orchestration,
          {
            id: `isolation-${personalityId}`,
            name: `${personalityId} isolation analysis`,
            ...config
          },
          context,
          `isolation-${personalityId}`
        );
        
        results.set(personalityId, result);
        return result;
      }
    );
    
    await Promise.all(isolationPromises);
    
    // Phase 2: Synthesis based on entropy
    const synthesisContext = {
      allPerspectives: Object.fromEntries(results),
      entropyLevel: this.calculateEntropy(input),
      synthesisRules: workflow.workflowConfig?.round_3_synthesis
    };
    
    const synthesis = await this.executeStep(
      orchestration,
      {
        id: 'synthesis',
        name: 'Multi-perspective synthesis',
        instruction: 'Synthesize all perspectives based on entropy level'
      },
      synthesisContext,
      'synthesis'
    );
    
    return synthesis;
  }

  /**
   * Execute an agent
   */
  async executeAgent(orchestration, input) {
    const { workflow } = orchestration;
    
    // Single agent execution
    const agentContext = {
      agentId: workflow.id,
      config: workflow.agentConfig,
      input
    };
    
    return await this.executeStep(
      orchestration,
      {
        id: workflow.id,
        name: workflow.metadata?.name || workflow.id,
        ...workflow.agentConfig
      },
      agentContext,
      0
    );
  }

  /**
   * Inject context into LLM
   * This is where we tell the LLM what it is for this step
   */
  async injectLLMContext(context, callbackId) {
    // @llm-note: This is a placeholder for the actual LLM injection
    // In production, this would use MCP or direct LLM API
    
    // For now, we'll emit an event that the adapter can handle
    this.emit('llm:inject', {
      context,
      callbackId,
      instruction: this.formatInstruction(context)
    });
  }

  /**
   * Format instruction for LLM
   */
  formatInstruction(context) {
    if (context.personality) {
      // Cognitive parliament style
      return `You are now ${context.personality}. ${context.instruction || ''}\n\nAnalyze the following through your unique lens:\n${JSON.stringify(context.input)}`;
    }
    
    if (context.step) {
      // Regular workflow step
      return `Execute workflow step: ${context.step.name}\n\n${context.step.instruction || ''}\n\nInput:\n${JSON.stringify(context.input)}`;
    }
    
    // Generic
    return `Process the following context:\n${JSON.stringify(context)}`;
  }

  /**
   * Convert pattern configuration to executable steps
   */
  convertPatternToSteps(pattern) {
    // @llm-note: This converts various pattern formats to a standard step format
    // Each pattern type might have different structure
    
    const steps = [];
    
    if (pattern.patternConfig?.process) {
      // Process-based pattern
      Object.entries(pattern.patternConfig.process).forEach(([key, value]) => {
        steps.push({
          id: key,
          name: key,
          instruction: value
        });
      });
    }
    
    return steps;
  }

  /**
   * Calculate entropy for routing decisions
   */
  calculateEntropy(input) {
    // @llm-note: Simplified entropy calculation
    // In production, this would be more sophisticated
    
    const factors = {
      uncertainty: 0.3,
      complexity: 0.3,
      rateOfChange: 0.2,
      risk: 0.2
    };
    
    // Placeholder calculation
    return 0.5; // Medium entropy
  }

  /**
   * Event emitter functionality
   */
  emit(event, data) {
    // @llm-note: This would connect to the adapter layer
    if (this.options.onEvent) {
      this.options.onEvent(event, data);
    }
  }

  /**
   * Get active orchestration status
   */
  getOrchestrationStatus(orchestrationId) {
    const orch = this.activeOrchestrations.get(orchestrationId);
    if (!orch) {
      return null;
    }
    
    return {
      id: orch.id,
      workflow: orch.workflow.id,
      status: orch.status,
      currentStep: orch.currentStep,
      totalSteps: orch.workflow.steps?.length || 0,
      startTime: orch.startTime,
      duration: Date.now() - orch.startTime,
      outputs: this.outputManager.getSummary(orch.id)
    };
  }

  /**
   * Handle LLM callback
   */
  async handleLLMCallback(callbackId, response) {
    return await this.feedbackLoop.handleCallback(callbackId, response);
  }
}