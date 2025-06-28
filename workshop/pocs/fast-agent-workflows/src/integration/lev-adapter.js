/**
 * Leviathan Adapter
 * 
 * Connects fast-agent workflows to Leviathan's actual agent system.
 * This adapter handles the translation between fast-agent patterns
 * and Leviathan's hexagonal architecture.
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

export class LeviathanAdapter {
  constructor() {
    this.levPath = '/Users/jean-patricksmith/digital/leviathan';
    this.agentPath = join(this.levPath, 'agent');
    this.workflowsPath = join(this.agentPath, 'src/workflows');
  }
  
  /**
   * Execute a Leviathan command via CLI
   */
  async executeCommand(command, args = []) {
    try {
      const cmd = `cd ${this.agentPath} && ./bin/lev ${command} ${args.join(' ')}`;
      const result = execSync(cmd, { encoding: 'utf-8' });
      return {
        success: true,
        output: result,
        command: cmd
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        command: cmd
      };
    }
  }
  
  /**
   * Load a workflow from Leviathan's workflow directory
   */
  async loadWorkflow(workflowName) {
    try {
      const workflowPath = join(this.workflowsPath, `${workflowName}.yaml`);
      const content = await readFile(workflowPath, 'utf-8');
      return this.parseYAML(content);
    } catch (error) {
      console.error(`Failed to load workflow ${workflowName}:`, error);
      return null;
    }
  }
  
  /**
   * Create a session checkpoint
   */
  async createCheckpoint(context, metadata = {}) {
    const checkpointData = {
      context,
      metadata,
      timestamp: new Date().toISOString(),
      type: 'workflow'
    };
    
    // Use Leviathan's checkpoint command
    const args = [
      '--context', `"${context}"`,
      '--metadata', JSON.stringify(metadata)
    ];
    
    return await this.executeCommand('checkpoint', args);
  }
  
  /**
   * Execute an agent with specific configuration
   */
  async executeAgent(agentName, input, config = {}) {
    // In a real implementation, this would:
    // 1. Load the agent from Leviathan's agent registry
    // 2. Apply any MCP servers specified
    // 3. Execute with proper context and session management
    
    console.log(`\n🤖 Executing Leviathan agent: ${agentName}`);
    console.log(`📥 Input:`, input);
    console.log(`⚙️  Config:`, config);
    
    // For now, simulate by calling semantic lookup
    if (config.useSemanticLookup) {
      const lookupResult = await this.semanticLookup(input.query || input);
      return {
        agent: agentName,
        input,
        output: lookupResult,
        executedAt: new Date().toISOString()
      };
    }
    
    // Default simulation
    return {
      agent: agentName,
      input,
      output: `Processed by ${agentName}: ${JSON.stringify(input)}`,
      executedAt: new Date().toISOString()
    };
  }
  
  /**
   * Use Leviathan's semantic lookup
   */
  async semanticLookup(query) {
    try {
      // Use the 'find' command for semantic search
      const result = await this.executeCommand('find', [`"${query}"`]);
      if (result.success) {
        return this.parseSemanticResult(result.output);
      }
      return { error: result.error };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  /**
   * Parse semantic lookup results
   */
  parseSemanticResult(output) {
    // Extract relevant information from the output
    const lines = output.split('\n');
    const results = [];
    
    for (const line of lines) {
      if (line.includes('MATCH:') || line.includes('→')) {
        results.push(line.trim());
      }
    }
    
    return {
      query: output.match(/Query: "(.+?)"/)?.[1] || '',
      matches: results,
      raw: output
    };
  }
  
  /**
   * Simple YAML parser for workflow files
   */
  parseYAML(content) {
    // For POC, basic parsing
    // In production, use a proper YAML parser
    const workflow = {
      name: '',
      description: '',
      steps: []
    };
    
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('name:')) {
        workflow.name = line.split(':')[1].trim();
      } else if (line.startsWith('description:')) {
        workflow.description = line.split(':')[1].trim();
      }
    }
    
    return workflow;
  }
}