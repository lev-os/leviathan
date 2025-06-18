/**
 * Agent Router - Handles agent command family
 * Routes agent loading, switching, and listing commands
 * Part of Leviathan CLI Adapter
 */

export class AgentRouter {
  constructor(agentCore, formatter) {
    this.agentCore = agentCore;
    this.formatter = formatter;
  }

  /**
   * Handle agent command with arguments
   * @param {Array} args - Command arguments
   * @returns {Promise<Object>} Agent command result
   */
  async handle(args) {
    try {
      // Parse arguments
      const parsed = this.parseArguments(args);
      
      // Handle help
      if (parsed.help) {
        return this.handleHelp();
      }
      
      // Handle list command
      if (parsed.list) {
        return await this.handleListAgents(parsed);
      }
      
      // Handle agent loading
      if (parsed.agent) {
        return await this.handleLoadAgent(parsed);
      }
      
      // Default: show available agents
      return await this.handleListAgents({ type: null });
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Agent command failed: ${error.message}`
      };
    }
  }

  /**
   * Parse agent command arguments
   */
  parseArguments(args) {
    const parsed = {
      agent: null,
      endpoint: 'default',
      list: false,
      type: null,
      help: false
    };

    if (args.length === 0) {
      parsed.list = true;
      return parsed;
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === 'list') {
        parsed.list = true;
      } else if (arg === '--help' || arg === '-h') {
        parsed.help = true;
      } else if (arg.startsWith('--type=')) {
        parsed.type = arg.split('=')[1];
      } else if (!arg.startsWith('--') && !parsed.agent) {
        // First non-flag argument is agent name
        if (arg.includes('.')) {
          // Handle agent.endpoint notation
          const [agentName, endpoint] = arg.split('.');
          parsed.agent = agentName;
          parsed.endpoint = endpoint;
        } else {
          parsed.agent = arg;
        }
      } else if (!arg.startsWith('--') && parsed.agent && !parsed.endpoint) {
        // Second argument is endpoint
        parsed.endpoint = arg;
      }
    }

    return parsed;
  }

  /**
   * Handle agent loading
   */
  async handleLoadAgent(parsed) {
    try {
      const agentContext = await this.agentCore.loadAgent(parsed.agent, parsed.endpoint);

      return {
        success: true,
        action: 'load_agent',
        agent: parsed.agent,
        endpoint: parsed.endpoint,
        context: agentContext,
        formatted_response: this.formatter.formatAgentLoaded(agentContext)
      };

    } catch (error) {
      return {
        success: false,
        action: 'load_agent',
        agent: parsed.agent,
        endpoint: parsed.endpoint,
        error: error.message,
        formatted_response: `❌ Failed to load agent '${parsed.agent}': ${error.message}`
      };
    }
  }

  /**
   * Handle list agents
   */
  async handleListAgents(parsed) {
    try {
      const agents = await this.agentCore.listAgents(parsed.type);

      return {
        success: true,
        action: 'list_agents',
        type_filter: parsed.type,
        agents: agents,
        total_count: agents.length,
        formatted_response: this.formatter.formatAgentList(agents, parsed.type)
      };

    } catch (error) {
      return {
        success: false,
        action: 'list_agents',
        type_filter: parsed.type,
        error: error.message,
        formatted_response: `❌ Failed to list agents: ${error.message}`
      };
    }
  }

  /**
   * Handle help for agent command
   */
  handleHelp() {
    const helpText = `
🤖 Agent Command Help

Usage:
  lev agent <name>              Load agent with default endpoint
  lev agent <name>.<endpoint>   Load agent with specific endpoint
  lev agent <name> <endpoint>   Load agent with endpoint (alternative syntax)
  lev agent list                List all available agents
  lev agent list --type=<type>  List agents of specific type

Options:
  --type=<type>    Filter agents by type (agents, eeps, etc.)
  --help           Show this help

Examples:
  lev agent doc-shepherd
  lev agent doc-shepherd.analyze
  lev agent doc-shepherd analyze
  lev agent list
  lev agent list --type=eeps

Agent Endpoints:
  Most agents support multiple endpoints for different modes:
  - default: General purpose mode
  - analyze: Analysis and review mode
  - create: Content creation mode
  - debug: Debugging and troubleshooting mode
`;

    return {
      success: true,
      help: true,
      formatted_response: helpText.trim()
    };
  }
}