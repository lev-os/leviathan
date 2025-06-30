/**
 * Context Switcher - Dynamic context loading and personality switching
 * 
 * This is the heart of the bi-directional system. It:
 * 1. Loads contexts from YAML configurations
 * 2. Prepares personality/agent/pattern contexts
 * 3. Enables complete perspective shifts in the LLM
 * 4. Manages context inheritance and composition
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { FlowMind } from './flowmind-base.js';

export class ContextSwitcher {
  constructor(options = {}) {
    this.contextCache = new Map();
    this.contextPaths = options.contextPaths || [
      path.join(process.cwd(), 'contexts'),
      path.join(process.env.HOME || '', 'c')
    ];
    this.options = options;
  }

  /**
   * Prepare context for LLM injection
   */
  async prepareContext(workflow, step, input, previousOutputs = []) {
    const context = {
      // Core identification
      orchestrationId: this.options.orchestrationId,
      workflowId: workflow.id,
      stepId: step.id || step.name,
      
      // Step configuration
      step: step,
      
      // Input data
      input: input,
      
      // Previous context for continuity
      previousOutputs: previousOutputs,
      
      // Timestamp for temporal awareness
      timestamp: new Date().toISOString()
    };

    // Handle different step types
    if (step.agent) {
      // Load agent context
      const agentContext = await this.loadAgentContext(step.agent);
      context.agent = agentContext;
      context.instruction = this.mergeInstructions(
        agentContext.instruction,
        step.instruction
      );
      
    } else if (step.personality) {
      // Load personality context (cognitive parliament)
      const personalityContext = await this.loadPersonalityContext(
        step.personality,
        workflow.personalitySystem
      );
      context.personality = personalityContext.id;
      context.personalityConfig = personalityContext;
      context.instruction = personalityContext.anti_group_think_prompt || step.instruction;
      
    } else if (step.pattern) {
      // Load pattern context
      const patternContext = await this.loadPatternContext(step.pattern);
      context.pattern = patternContext;
      context.instruction = this.mergeInstructions(
        patternContext.instruction,
        step.instruction
      );
      
    } else if (step.template) {
      // Load template context
      const templateContext = await this.loadTemplateContext(step.template);
      context.template = templateContext;
      context.instruction = step.instruction;
      
    } else {
      // Direct step execution
      context.instruction = step.instruction || 'Process this step';
    }

    // Add workflow-level configuration
    if (workflow.workflowConfig) {
      context.workflowConfig = {
        philosophy: workflow.workflowConfig.philosophy,
        triggers: workflow.workflowConfig.triggers,
        outputFormats: workflow.workflowConfig.output_configuration?.formats
      };
    }

    // Add semantic conditions if present
    if (step.when_semantic || step.if_semantic) {
      context.semanticConditions = {
        when: step.when_semantic,
        if: step.if_semantic,
        while: step.while_semantic
      };
    }

    // Add output requirements
    if (step.outputs || step.expectedOutputs) {
      context.outputRequirements = step.outputs || step.expectedOutputs;
    }

    return context;
  }

  /**
   * Load agent context
   */
  async loadAgentContext(agentId) {
    // Check cache first
    const cacheKey = `agent:${agentId}`;
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey);
    }

    // Try to load from context paths
    for (const contextPath of this.contextPaths) {
      try {
        const agentPath = path.join(contextPath, 'agents', agentId, 'context.yaml');
        const content = await fs.readFile(agentPath, 'utf-8');
        const agentYaml = yaml.load(content);
        const agent = new FlowMind(agentYaml);
        
        this.contextCache.set(cacheKey, agent);
        return agent;
      } catch (err) {
        // Continue to next path
        continue;
      }
    }

    // Return minimal context if not found
    return {
      id: agentId,
      type: 'agent',
      instruction: `Act as ${agentId} agent`
    };
  }

  /**
   * Load personality context (for cognitive parliament)
   */
  async loadPersonalityContext(personalityId, personalitySystem = {}) {
    const personality = personalitySystem[personalityId] || {};
    
    return {
      id: personalityId,
      type: 'personality',
      ...personality,
      instruction: this.generatePersonalityInstruction(personalityId, personality)
    };
  }

  /**
   * Generate personality instruction
   */
  generatePersonalityInstruction(personalityId, config) {
    const parts = [];
    
    // Core identity
    parts.push(`You are embodying the ${personalityId} personality.`);
    
    // Emotional lens
    if (config.core_emotion) {
      parts.push(`Your core emotion is ${config.core_emotion}.`);
    }
    
    // Moral projection
    if (config.moral_projection && config.moral_projection !== 'none') {
      parts.push(`You view the world through the lens of ${config.moral_projection}.`);
    }
    
    // Strategy
    if (config.igt_strategy) {
      parts.push(`Your decision-making follows a ${config.igt_strategy} strategy.`);
    }
    
    // Thinking style
    if (config.thinking_style) {
      const style = config.thinking_style === 'system_1' ? 'fast and intuitive' : 'slow and deliberate';
      parts.push(`Your thinking is ${style}.`);
    }
    
    // Anti-group think
    if (config.anti_group_think_prompt) {
      parts.push('\n' + config.anti_group_think_prompt);
    }
    
    return parts.join(' ');
  }

  /**
   * Load pattern context
   */
  async loadPatternContext(patternId) {
    const cacheKey = `pattern:${patternId}`;
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey);
    }

    for (const contextPath of this.contextPaths) {
      try {
        const patternPath = path.join(contextPath, 'patterns', patternId, 'context.yaml');
        const content = await fs.readFile(patternPath, 'utf-8');
        const patternYaml = yaml.load(content);
        const pattern = new FlowMind(patternYaml);
        
        this.contextCache.set(cacheKey, pattern);
        return pattern;
      } catch (err) {
        continue;
      }
    }

    return {
      id: patternId,
      type: 'pattern',
      instruction: `Apply the ${patternId} pattern`
    };
  }

  /**
   * Load template context
   */
  async loadTemplateContext(templatePath) {
    for (const contextPath of this.contextPaths) {
      try {
        const fullPath = path.join(contextPath, 'templates', templatePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        return {
          id: templatePath,
          type: 'template',
          content: content,
          format: path.extname(templatePath).slice(1)
        };
      } catch (err) {
        continue;
      }
    }

    return {
      id: templatePath,
      type: 'template',
      content: '',
      error: 'Template not found'
    };
  }

  /**
   * Merge instructions from multiple sources
   */
  mergeInstructions(...instructions) {
    return instructions
      .filter(Boolean)
      .join('\n\n');
  }

  /**
   * Create a composite context from multiple sources
   */
  async createCompositeContext(sources) {
    const composite = {
      type: 'composite',
      sources: []
    };

    for (const source of sources) {
      if (source.agent) {
        const agent = await this.loadAgentContext(source.agent);
        composite.sources.push({ type: 'agent', context: agent });
      }
      if (source.pattern) {
        const pattern = await this.loadPatternContext(source.pattern);
        composite.sources.push({ type: 'pattern', context: pattern });
      }
      if (source.personality) {
        const personality = await this.loadPersonalityContext(source.personality);
        composite.sources.push({ type: 'personality', context: personality });
      }
    }

    return composite;
  }

  /**
   * Clear context cache
   */
  clearCache() {
    this.contextCache.clear();
  }

  /**
   * Get context statistics
   */
  getStats() {
    return {
      cachedContexts: this.contextCache.size,
      contextPaths: this.contextPaths,
      cacheKeys: Array.from(this.contextCache.keys())
    };
  }
}