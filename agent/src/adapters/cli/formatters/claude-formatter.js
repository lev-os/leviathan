/**
 * Claude Formatter - LLM-friendly output formatting
 * Provides whisper mode and structured output for Claude Code integration
 * Part of Leviathan CLI Adapter
 */

export class ClaudeFormatter {
  constructor() {
    this.whisperMode = true; // Default to LLM-friendly output
  }

  /**
   * Format agent loaded result
   */
  formatAgentLoaded(agentContext) {
    const { name, personality, currentEndpoint, endpoints, description } = agentContext;
    
    let output = `🤖 AGENT: ${name} (${personality})\n`;
    output += `📋 MODE: ${currentEndpoint} (${endpoints[currentEndpoint]?.description || 'No description'})\n\n`;
    
    if (description) {
      output += `${description}\n\n`;
    }
    
    if (endpoints[currentEndpoint]?.prompt) {
      output += `${endpoints[currentEndpoint].prompt}\n\n`;
    }
    
    const availableModes = Object.keys(endpoints).filter(ep => ep !== currentEndpoint);
    if (availableModes.length > 0) {
      output += `AVAILABLE MODES: ${availableModes.join(', ')}\n`;
      output += `TO SWITCH: Natural language or lev agent ${agentContext.id}.<mode>\n`;
    }
    
    return output.trim();
  }

  /**
   * Format agent list
   */
  formatAgentList(agents, typeFilter = null) {
    if (agents.length === 0) {
      return typeFilter ? 
        `No agents found for type: ${typeFilter}` :
        'No agents available';
    }

    let output = `🤖 Available Agents${typeFilter ? ` (${typeFilter})` : ''}: (${agents.length})\n\n`;
    
    // Group by personality/type
    const grouped = this.groupAgentsByPersonality(agents);
    
    Object.keys(grouped).sort().forEach(personality => {
      output += `📋 ${personality.toUpperCase()}:\n`;
      grouped[personality].forEach(agent => {
        output += `   ${agent.slug || agent.id} - ${agent.name}\n`;
        if (agent.description && agent.description !== 'No description available') {
          output += `     📝 ${agent.description.substring(0, 80)}${agent.description.length > 80 ? '...' : ''}\n`;
        }
        if (agent.endpointCount > 1) {
          output += `     🔧 ${agent.endpointCount} endpoints available\n`;
        }
      });
      output += '\n';
    });
    
    output += `💡 Load agent: lev agent <name>[.<endpoint>]\n`;
    output += `📖 List specific type: lev agent list --type=<type>`;
    
    return output.trim();
  }

  /**
   * Format search result
   */
  formatSearchResult(result) {
    if (!result.found) {
      let output = `❌ No exact match found\n\n`;
      
      if (result.suggestions && result.suggestions.length > 0) {
        output += `🔍 Try these related contexts:\n`;
        result.suggestions.forEach((suggestion, index) => {
          const confidence = Math.round((suggestion.confidence || 0) * 100);
          output += `${index + 1}. ${suggestion.name} - ${suggestion.description} (${confidence}%)\n`;
        });
        output += `\n💡 Try: lev find "<more specific terms>"`;
      }
      
      return output.trim();
    }

    // Single context found
    if (result.context) {
      return this.formatSingleContext(result.context, result.match_type);
    }

    // Multiple contexts found
    if (result.contexts) {
      return this.formatMultipleContexts(result.contexts, result.query);
    }

    return 'Context found but formatting not implemented';
  }

  /**
   * Format resume session
   */
  formatResumeSession(resumeData) {
    let output = `🔄 CHECKPOINT Resume\n\n`;
    output += `**Session Loaded:** ${resumeData.sessionId}\n`;
    output += `**Last State:** ${resumeData.checkpoint?.context || 'Previous work state'}\n`;
    output += `**Key Context:** ${resumeData.context}\n`;
    output += `**Files in Play:** ${resumeData.files?.join(', ') || 'No files tracked'}\n`;
    output += `**Ready for:** ${resumeData.checkpoint?.context || 'Continuing previous work'}\n`;
    
    if (resumeData.timeline && resumeData.timeline.success) {
      output += `\n📈 **Cross-Session Timeline:** ${resumeData.timeline.sessionCount} previous sessions discovered\n`;
      output += `**Timeline Coverage:** ${resumeData.timeline.timelineRange}\n`;
      output += `**Key Progression:** ${resumeData.timeline.progressionSummary}\n`;
    }
    
    return output.trim();
  }

  /**
   * Format new session
   */
  formatNewSession(sessionData, checkpoint) {
    let output = `🚀 CHECKPOINT New Session\n\n`;
    output += `**Session ID:** ${sessionData.id}\n`;
    output += `**Context:** ${sessionData.context}\n`;
    output += `**Workspace:** ${sessionData.workspace}\n`;
    output += `**Started:** ${new Date().toLocaleString()}\n`;
    
    if (checkpoint) {
      output += `**Initial Checkpoint:** ${checkpoint.id}\n`;
    }
    
    // Add backward compatibility for tests
    output += `Session Initialized: ${sessionData.id}\n`;
    
    output += `\n💡 Use 'lev checkpoint "progress update"' to mark progress\n`;
    output += `📋 Use 'lev checkpoint --final --session "${sessionData.id}"' when complete`;
    
    return output.trim();
  }

  /**
   * Format progress checkpoint
   */
  formatProgressCheckpoint(checkpoint) {
    let output = `⚡ CHECKPOINT Progress\n\n`;
    output += `**Current State:** ${checkpoint.context}\n`;
    output += `**Context:** Active development session\n`;
    
    if (checkpoint.files && checkpoint.files.length > 0) {
      output += `**Files Modified:** ${checkpoint.files.join(', ')}\n`;
    } else {
      output += `**Files Modified:** No files specified\n`;
    }
    
    output += `**Progress:** Session in progress\n`;
    output += `**Next Steps:** Continue current work\n`;
    output += `**Session ID:** ${checkpoint.sessionId}`;
    
    return output.trim();
  }

  /**
   * Format final checkpoint
   */
  formatFinalCheckpoint(finalResult) {
    let output = `🏁 CHECKPOINT Final\n\n`;
    output += `**Session Completed:** ${finalResult.checkpoint.sessionId}\n`;
    output += `**Final State:** ${finalResult.checkpoint.context}\n`;
    
    if (finalResult.rollup) {
      output += `**Checkpoints:** ${finalResult.rollup.checkpointCount}\n`;
      output += `**Duration:** ${finalResult.rollup.summary}\n`;
      output += `**Key Files:** ${finalResult.rollup.keyFiles?.join(', ') || 'None tracked'}\n`;
      output += `**Progression:** ${finalResult.rollup.progression}\n`;
    }
    
    output += `\n✅ Session rollup saved for future reference\n`;
    output += `💡 Use 'lev checkpoint --resume' to start new session`;
    
    return output.trim();
  }

  /**
   * Format all contexts list
   */
  formatAllContexts(contexts) {
    let output = `📚 All Available Contexts (${contexts.length} total)\n\n`;
    
    // Group by type
    const byType = {};
    contexts.forEach(ctx => {
      if (!byType[ctx.type]) byType[ctx.type] = [];
      byType[ctx.type].push(ctx);
    });
    
    Object.keys(byType).sort().forEach(type => {
      output += `🏷️ ${type.toUpperCase()}: (${byType[type].length})\n`;
      byType[type].forEach(ctx => {
        output += `   ${ctx.slug || ctx.name} - ${ctx.name}\n`;
        if (ctx.description && ctx.description !== 'No description available') {
          output += `     📋 ${ctx.description.substring(0, 80)}${ctx.description.length > 80 ? '...' : ''}\n`;
        }
      });
      output += '\n';
    });
    
    return output.trim();
  }

  /**
   * Format status
   */
  formatStatus(status) {
    let output = `⚡ Leviathan System Status\n\n`;
    output += `**Workspace:** ${status.workspace}\n`;
    output += `**Context Types:** ${status.contextTypes}\n`;
    output += `**Available Commands:** ${status.availableCommands}\n`;
    output += `**Adapters:** ${status.adapters.join(', ')}\n`;
    output += `**Initialized:** ${status.initialized ? 'Yes' : 'No'}\n`;
    output += `**Timestamp:** ${new Date(status.timestamp).toLocaleString()}`;
    
    return output.trim();
  }

  /**
   * Format ping result
   */
  formatPing(sessionId, context, workspace) {
    let output = `🔔 Session Activity Ping\n\n`;
    output += `**Session:** ${sessionId}\n`;
    output += `**Context:** ${context}\n`;
    output += `**Workspace:** ${workspace}\n`;
    output += `**Time:** ${new Date().toLocaleString()}`;
    
    return output.trim();
  }

  /**
   * Format general help
   */
  formatGeneralHelp(commands) {
    let output = `🚀 Leviathan Command Help\n\n`;
    output += `Available Commands:\n\n`;
    
    // Group core vs plugin commands
    const coreCommands = commands.filter(cmd => !cmd.isPlugin);
    const pluginCommands = commands.filter(cmd => cmd.isPlugin);
    
    if (coreCommands.length > 0) {
      output += `📋 Core Commands:\n`;
      coreCommands.forEach(cmd => {
        output += `  ${cmd.name.padEnd(12)} ${cmd.description}\n`;
      });
      output += '\n';
    }
    
    if (pluginCommands.length > 0) {
      output += `🔌 Plugin Commands:\n`;
      pluginCommands.forEach(cmd => {
        output += `  ${cmd.name.padEnd(12)} ${cmd.description} (${cmd.plugin})\n`;
      });
      output += '\n';
    }
    
    output += `💡 Use 'lev <command> --help' for detailed command help\n`;
    output += `🔍 Use 'lev find <query>' to search contexts and workflows`;
    
    return output.trim();
  }

  /**
   * Format command help
   */
  formatCommandHelp(commandInfo) {
    let output = `📖 ${commandInfo.name} Command Help\n\n`;
    output += `Description: ${commandInfo.description}\n`;
    output += `Usage: ${commandInfo.usage}\n`;
    
    if (commandInfo.examples && commandInfo.examples.length > 0) {
      output += `\nExamples:\n`;
      commandInfo.examples.forEach(example => {
        output += `  ${example}\n`;
      });
    }
    
    if (commandInfo.aliases && commandInfo.aliases.length > 0) {
      output += `\nAliases: ${commandInfo.aliases.join(', ')}\n`;
    }
    
    return output.trim();
  }

  /**
   * Format unknown command
   */
  formatUnknownCommand(query, suggestions) {
    let output = `❌ Unknown command: ${query}\n\n`;
    
    if (suggestions && suggestions.length > 0) {
      output += `🔍 Did you mean:\n`;
      suggestions.forEach(suggestion => {
        output += `  lev ${suggestion.name} - ${suggestion.description}\n`;
      });
      output += '\n';
    }
    
    output += `💡 Use 'lev help' to see all available commands\n`;
    output += `🔍 Use 'lev find "${query}"' to search contexts`;
    
    return output.trim();
  }

  // Helper Methods

  /**
   * Group agents by personality type
   */
  groupAgentsByPersonality(agents) {
    const grouped = {};
    
    agents.forEach(agent => {
      const personality = agent.personality || 'General';
      if (!grouped[personality]) {
        grouped[personality] = [];
      }
      grouped[personality].push(agent);
    });
    
    return grouped;
  }

  /**
   * Format single context
   */
  formatSingleContext(context, matchType) {
    let output = `✅ Context Found (${matchType})\n\n`;
    output += `**Name:** ${context.name}\n`;
    output += `**Type:** ${context.type || 'Unknown'}\n`;
    
    if (context.description) {
      output += `**Description:** ${context.description}\n`;
    }
    
    if (context.confidence) {
      output += `**Confidence:** ${Math.round(context.confidence * 100)}%\n`;
    }
    
    return output.trim();
  }

  /**
   * Format multiple contexts
   */
  formatMultipleContexts(contexts, query) {
    let output = `🔍 Found ${contexts.length} contexts for "${query}"\n\n`;
    
    contexts.forEach((context, index) => {
      const confidence = context.confidence ? Math.round(context.confidence * 100) : 'N/A';
      output += `${index + 1}. **${context.name}** (${confidence}%)\n`;
      output += `   Type: ${context.type || 'Unknown'}\n`;
      if (context.description) {
        output += `   ${context.description.substring(0, 100)}${context.description.length > 100 ? '...' : ''}\n`;
      }
      output += '\n';
    });
    
    return output.trim();
  }

  /**
   * Format generic command result data
   * @param {Object} data - Command result data
   * @returns {string} Formatted output
   */
  formatCommandResult(data) {
    // Handle workshop status/list data (has tools and either overview or filter)
    if (data.tools && (data.overview || data.filter)) {
      return this.formatWorkshopData(data);
    }
    
    // Handle workshop tool info
    if (data.tool) {
      return this.formatWorkshopToolInfo(data);
    }
    
    // Handle discovery results
    if (data.discoveredTools || data.processes) {
      return this.formatWorkshopDiscovery(data);
    }
    
    // Handle intake results
    if (data.assessment && data.pipeline) {
      return this.formatWorkshopIntake(data);
    }
    
    // Fallback: JSON stringify with nice formatting
    return JSON.stringify(data, null, 2);
  }

  /**
   * Format workshop status/list data
   */
  formatWorkshopData(data) {
    const { overview, tools, filter, count } = data;
    
    // Handle workshop list format (has filter and count but no overview)
    if (filter && count !== undefined) {
      let output = `🛠️  WORKSHOP ITEMS - ${filter} (${count})\n\n`;
      
      if (tools && tools.length > 0) {
        tools.forEach(tool => {
          output += `  ${tool.name.padEnd(25)} TIER ${tool.tier} - ${tool.description}\n`;
        });
      } else {
        output += `  No tools found for ${filter}\n`;
      }
      
      return output.trim();
    }
    
    // Handle workshop status format (has overview)
    if (overview) {
      let output = `🔧 WORKSHOP STATUS\n\n`;
      output += `📊 OVERVIEW\n`;
      output += `  Total Tools: ${overview.total_tools}\n`;
      output += `  Total Plugins: ${overview.total_plugins}\n`;
      output += `  Phase: ${overview.phase}\n`;
      output += `  Active Development: ${overview.active_development ? '✅' : '❌'}\n\n`;
      
      output += `📋 TIER BREAKDOWN\n`;
      output += `  Tier 1 (Essential): ${overview.tiers.tier_1}\n`;
      output += `  Tier 2 (Standard): ${overview.tiers.tier_2}\n`;
      output += `  Tier 3 (Advanced): ${overview.tiers.tier_3}\n\n`;
      
      if (tools && tools.length > 0) {
        output += `🛠️  WORKSHOP ITEMS\n`;
        tools.forEach(tool => {
          output += `  ${tool.name.padEnd(25)} TIER ${tool.tier} - ${tool.description}\n`;
        });
      }
      
      return output.trim();
    }
    
    // Fallback
    return JSON.stringify(data, null, 2);
  }

  /**
   * Format workshop tool info
   */
  formatWorkshopToolInfo(data) {
    const { tool, integrationStatus, documentation } = data;
    
    let output = `🔧 TOOL: ${tool.name}\n\n`;
    output += `📋 TIER: ${tool.tier}\n`;
    output += `📝 DESCRIPTION: ${tool.description}\n`;
    output += `🔗 INTEGRATION: ${integrationStatus}\n`;
    output += `📚 DOCS: ${documentation}\n`;
    
    return output.trim();
  }

  /**
   * Format workshop discovery results
   */
  formatWorkshopDiscovery(data) {
    let output = `🔍 WORKSHOP DISCOVERY - ${data.system}\n\n`;
    
    if (data.discoveredTools && data.discoveredTools.length > 0) {
      output += `🛠️  DISCOVERED TOOLS\n`;
      data.discoveredTools.forEach(tool => {
        output += `  ${tool.name.padEnd(20)} ${tool.type.padEnd(15)} ${tool.location}\n`;
      });
      output += '\n';
    }
    
    if (data.processes && data.processes.length > 0) {
      output += `⚡ ACTIVE PROCESSES\n`;
      data.processes.forEach(proc => {
        output += `  ${proc.name.padEnd(20)} ${proc.status} (PID: ${proc.pid})\n`;
      });
      output += '\n';
    }
    
    if (data.plugins && data.plugins.length > 0) {
      output += `🔌 PLUGINS\n`;
      data.plugins.forEach(plugin => {
        output += `  ${plugin.name.padEnd(25)} ${plugin.status}\n`;
      });
    }
    
    return output.trim();
  }

  /**
   * Format workshop intake results
   */
  formatWorkshopIntake(data) {
    const { repo, assessment, pipeline, nextSteps } = data;
    
    let output = `📥 WORKSHOP INTAKE ANALYSIS\n\n`;
    output += `🔗 REPOSITORY: ${repo}\n`;
    output += `📊 COMPLEXITY: ${assessment.complexity}\n`;
    output += `🏷️  ESTIMATED TIER: ${assessment.estimatedTier}\n\n`;
    
    output += `📋 PIPELINE STATUS\n`;
    pipeline.steps.forEach(step => {
      const status = step.status === 'completed' ? '✅' : '⏳';
      output += `  ${status} ${step.name}\n`;
    });
    output += '\n';
    
    if (nextSteps && nextSteps.length > 0) {
      output += `🎯 NEXT STEPS\n`;
      nextSteps.forEach((step, index) => {
        output += `  ${index + 1}. ${step}\n`;
      });
    }
    
    return output.trim();
  }
}