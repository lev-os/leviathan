/**
 * Enhanced Chain Workflow
 * 
 * Real implementation that integrates with Leviathan's agent system.
 * Demonstrates practical use cases for sequential agent processing.
 */

import { LeviathanAdapter } from '../integration/lev-adapter.js';

export class EnhancedChainWorkflow {
  constructor(config) {
    this.config = config;
    this.adapter = new LeviathanAdapter();
    this.sequence = config.sequence || [];
    this.agents = config.agents || {};
    this.sessionId = null;
  }
  
  async execute(initialInput) {
    console.log('\n🔗 Starting Enhanced Chain Workflow');
    console.log('📋 Sequence:', this.sequence);
    
    // Create initial checkpoint
    await this.createCheckpoint('chain_start', {
      sequence: this.sequence,
      initialInput
    });
    
    let currentInput = initialInput;
    const executionLog = [];
    const startTime = Date.now();
    
    try {
      // Execute each agent in sequence
      for (let i = 0; i < this.sequence.length; i++) {
        const agentName = this.sequence[i];
        const agentConfig = this.agents[agentName];
        
        if (!agentConfig) {
          throw new Error(`Agent configuration not found for: ${agentName}`);
        }
        
        console.log(`\n🔄 Step ${i + 1}/${this.sequence.length}: ${agentName}`);
        
        // Execute the agent
        const stepResult = await this.executeStep(
          agentName,
          agentConfig,
          currentInput,
          i
        );
        
        executionLog.push(stepResult);
        
        // Use the output as input for next agent
        currentInput = this.extractOutput(stepResult);
        
        // Checkpoint after each step
        await this.createCheckpoint(`chain_step_${i + 1}`, {
          agent: agentName,
          result: stepResult
        });
      }
      
      const totalDuration = Date.now() - startTime;
      
      // Final checkpoint
      await this.createCheckpoint('chain_complete', {
        duration: totalDuration,
        stepsExecuted: this.sequence.length
      });
      
      return {
        success: true,
        finalOutput: currentInput,
        executionLog,
        totalDuration,
        sessionId: this.sessionId
      };
      
    } catch (error) {
      console.error('❌ Chain workflow failed:', error);
      
      // Error checkpoint
      await this.createCheckpoint('chain_error', {
        error: error.message,
        failedAt: executionLog.length
      });
      
      throw error;
    }
  }
  
  async executeStep(agentName, config, input, stepIndex) {
    const stepStart = Date.now();
    
    try {
      // Prepare agent configuration
      const agentConfig = {
        ...config,
        stepIndex,
        totalSteps: this.sequence.length
      };
      
      // Execute via Leviathan adapter
      const result = await this.adapter.executeAgent(
        agentName,
        input,
        agentConfig
      );
      
      const duration = Date.now() - stepStart;
      
      return {
        step: stepIndex + 1,
        agent: agentName,
        input,
        output: result.output,
        duration,
        timestamp: new Date().toISOString(),
        metadata: {
          config: agentConfig,
          result
        }
      };
      
    } catch (error) {
      return {
        step: stepIndex + 1,
        agent: agentName,
        input,
        error: error.message,
        duration: Date.now() - stepStart,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  extractOutput(stepResult) {
    // Extract the relevant output for the next step
    if (stepResult.error) {
      throw new Error(`Step ${stepResult.step} failed: ${stepResult.error}`);
    }
    
    // Handle different output formats
    if (typeof stepResult.output === 'object') {
      // For semantic lookup results
      if (stepResult.output.matches) {
        return stepResult.output.matches.join('\n');
      }
      // For structured outputs
      if (stepResult.output.output) {
        return stepResult.output.output;
      }
      // Default: stringify
      return JSON.stringify(stepResult.output);
    }
    
    return stepResult.output;
  }
  
  async createCheckpoint(context, metadata) {
    try {
      const result = await this.adapter.createCheckpoint(
        `workflow:chain:${context}`,
        metadata
      );
      
      // Extract session ID from first checkpoint
      if (!this.sessionId && result.output) {
        const sessionMatch = result.output.match(/Session: ([a-f0-9-]+)/);
        if (sessionMatch) {
          this.sessionId = sessionMatch[1];
        }
      }
      
      return result;
    } catch (error) {
      console.warn('⚠️  Checkpoint failed:', error.message);
    }
  }
}