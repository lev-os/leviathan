/**
 * Find Router - Handles find command family
 * Routes context discovery, agent lookup, and universal search commands
 * Part of Leviathan CLI Adapter
 */

export class FindRouter {
  constructor(findContexts, formatter) {
    this.findContexts = findContexts;
    this.formatter = formatter;
  }

  /**
   * Handle find command with arguments
   * @param {Array} args - Command arguments
   * @returns {Promise<Object>} Find result
   */
  async handle(args) {
    try {
      // Parse arguments
      const parsed = this.parseArguments(args);
      
      // Handle special flags
      if (parsed.all) {
        return await this.handleListAll();
      }
      
      if (parsed.help) {
        return this.handleHelp();
      }
      
      // Handle agent.endpoint notation
      if (this.isAgentEndpoint(parsed.query)) {
        return await this.handleAgentEndpoint(parsed.query, parsed);
      }
      
      // Handle regular context search
      return await this.handleContextSearch(parsed.query, parsed);
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Find command failed: ${error.message}`
      };
    }
  }

  /**
   * Parse find command arguments
   */
  parseArguments(args) {
    const parsed = {
      query: '',
      type: null,
      all: false,
      help: false,
      limit: 10,
      threshold: 0.3,
      mode: 'full'
    };

    let queryParts = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--all') {
        parsed.all = true;
      } else if (arg === '--help' || arg === '-h') {
        parsed.help = true;
      } else if (arg.startsWith('--type=')) {
        parsed.type = arg.split('=')[1];
      } else if (arg.startsWith('--limit=')) {
        parsed.limit = parseInt(arg.split('=')[1]) || 10;
      } else if (arg.startsWith('--threshold=')) {
        parsed.threshold = parseFloat(arg.split('=')[1]) || 0.3;
      } else if (arg.startsWith('--mode=')) {
        parsed.mode = arg.split('=')[1];
      } else {
        // Regular query term
        queryParts.push(arg);
      }
    }

    parsed.query = queryParts.join(' ').trim();

    return parsed;
  }

  /**
   * Handle --all flag to list all contexts
   */
  async handleListAll() {
    try {
      // This would implement listing all available contexts
      // For now, return placeholder
      const allContexts = [
        { name: 'doc-shepherd', type: 'agents', description: 'Documentation agent' },
        { name: 'technical-editor', type: 'agents', description: 'Technical editing agent' },
        { name: 'design-thinking', type: 'patterns', description: 'Design thinking workflow' }
      ];

      return {
        success: true,
        all_contexts: true,
        contexts: allContexts,
        total_count: allContexts.length,
        search_type: 'All contexts',
        formatted_response: this.formatter.formatAllContexts(allContexts)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Failed to list all contexts: ${error.message}`
      };
    }
  }

  /**
   * Handle help for find command
   */
  handleHelp() {
    const helpText = `
🔍 Find Command Help

Usage:
  lev find <query>              Search contexts by query
  lev find --all                List all available contexts
  lev find --type=<type>        Filter by context type
  lev find agent.endpoint       Load specific agent endpoint

Options:
  --type=<type>       Filter by type (agents, workflows, patterns, tools)
  --limit=<n>         Limit results (default: 10)
  --threshold=<n>     Confidence threshold (default: 0.3)
  --mode=<mode>       Output mode (full, menu, json)
  --all               List all available contexts
  --help              Show this help

Examples:
  lev find "documentation"
  lev find doc-shepherd.analyze
  lev find --type=agents
  lev find --all
`;

    return {
      success: true,
      help: true,
      formatted_response: helpText.trim()
    };
  }

  /**
   * Check if query uses agent.endpoint notation
   */
  isAgentEndpoint(query) {
    return /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(query);
  }

  /**
   * Handle agent.endpoint notation
   */
  async handleAgentEndpoint(query, options) {
    try {
      const [agentName, endpoint] = query.split('.');
      
      // This would call the agent loading logic
      // For now, return placeholder response
      const agentResult = {
        agent: agentName,
        endpoint: endpoint,
        found: true,
        context: `Loading ${agentName} with ${endpoint} endpoint`
      };

      return {
        success: true,
        query: query,
        match_type: 'agent_endpoint',
        agent: agentName,
        endpoint: endpoint,
        result: agentResult,
        formatted_response: this.formatter.formatAgentEndpoint(agentResult)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Failed to load agent endpoint: ${error.message}`
      };
    }
  }

  /**
   * Handle regular context search
   */
  async handleContextSearch(query, options) {
    if (!query) {
      return {
        success: false,
        error: 'Search query is required',
        formatted_response: '❌ Please provide a search query. Use "lev find --help" for usage information.'
      };
    }

    try {
      const searchOptions = {
        type: options.type,
        limit: options.limit,
        threshold: options.threshold,
        mode: options.mode
      };

      const result = await this.findContexts(query, searchOptions);

      return {
        success: result.found,
        query: query,
        search_options: searchOptions,
        result: result,
        formatted_response: this.formatter.formatSearchResult(result)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Context search failed: ${error.message}`
      };
    }
  }
}