/**
 * Hybrid Command Architecture - Command Registry with Whisper System
 * Supports both explicit commands AND natural language fallback with LLM guidance
 * Includes plugin system integration for modular YAML-based extensions
 */

import { pluginLoader } from './plugin-loader.js';

export const COMMAND_REGISTRY = {
  // Universal context search
  find: {
    syntax: "lev find <query> [--type=workflow|tool|agent|pattern]",
    description: "Universal context search across all types",
    examples: [
      "lev find creative brainstorming",
      "lev find automation --type=tool",
      "lev find claude --type=agent"
    ],
    whisper: {
      strategies: [
        "Universal context discovery - show most relevant matches",
        "Use --type to filter by context type (dynamic from file system)",
        "Suggest chaining contexts for complex scenarios"
      ],
      chain_hints: [
        "Multiple workflows needed? Suggest orchestrateSequence strategy",
        "Tools + patterns? Show how they complement each other",
        "Complex query? Break into specific context searches"
      ],
      self_talk: "Search all contexts, return best matches with usage guidance",
      llm_guidance: "Use findWorkflow() with semantic search and optional type filter. Returns context with confidence score.",
      context_hint: "User wants context discovery - provide top matches with effectiveness scores and type information",
      response_format: "Show context slug, name, description, type, and next steps",
      error_recovery: "No match? Try broader terms, different --type, or 'lev status --project'"
    }
  },
  
  promote: {
    syntax: "lev promote <context-name>",
    description: "Promote local context to global availability",
    examples: [
      "lev promote pdf-automation",
      "lev promote apple-aesthetic", 
      "lev promote launch-sequence"
    ],
    whisper: {
      strategies: [
        "Validate context effectiveness metrics against promotion criteria",
        "Check local context structure and completeness",
        "Copy validated context to global availability"
      ],
      self_talk: "User promoting context to global. Validate first, then confirm promotion success.",
      llm_guidance: "Validate effectiveness metrics, check promotion criteria, copy to global contexts",
      context_hint: "User wants to make local innovation globally available",
      response_format: "Show validation results, promotion status, global availability confirmation",
      error_recovery: "Promotion failed? Run 'lev validate <context>' first, check effectiveness metrics"
    }
  },
  
  validate: {
    syntax: "lev validate [context-name|--all]",
    description: "Check promotion readiness of contexts",
    examples: [
      "lev validate pdf-tool",
      "lev validate --all",
      "lev validate"
    ],
    whisper: {
      strategies: [
        "Check effectiveness metrics against promotion thresholds",
        "Identify gaps in context structure or documentation",
        "Provide specific improvement recommendations"
      ],
      self_talk: "User checking context readiness. Show clear validation status and improvement path.",
      llm_guidance: "Check effectiveness metrics against promotion thresholds, identify gaps",
      context_hint: "User wants promotion readiness assessment",
      response_format: "Show effectiveness scores, promotion criteria status, improvement suggestions",
      error_recovery: "Validation failed? Review context structure, check effectiveness thresholds"
    }
  },
  
  
  // @claude-code: Unified checkpoint system - one command with multiple modes for session management
  // @claude-code: --resume loads previous context, --new starts fresh, --final creates rollup
  checkpoint: {
    syntax: "lev checkpoint [<context>] [--final|--resume|--new] [--snippet=<file:lines>]",
    description: "Unified session management - create, resume, or finalize checkpoints",
    examples: [
      "lev checkpoint 'working on auth system'",
      "lev checkpoint --resume",
      "lev checkpoint --new 'starting feature X'",
      "lev checkpoint --final",
      "lev checkpoint --snippet 'src/app.js:45-60'"
    ],
    whisper: {
      strategies: [
        "Use --resume when continuing work across Claude sessions - loads previous context",
        "Use --new when starting completely fresh work - creates initial checkpoint", 
        "Use --final to create comprehensive session rollup timeline",
        "Include --snippet with code ranges for specific context in checkpoints",
        "Default mode marks current progress during active work"
      ],
      // @claude-code: Self-healing guidance - when I'm confused about modes, this guides me to right approach
      mode_guidance: {
        resume: "Load previous session context and timeline - use when continuing work",
        new: "Start completely fresh work session - use for new features/projects", 
        final: "Create comprehensive session summary - use to conclude work",
        default: "Mark current progress - use during active development"
      },
      anti_drift_rotation: [
        "Remember to commit changes before session end",
        "Document architectural decisions made",
        "Capture test results and coverage data",
        "Note environment-specific configurations"
      ],
      self_talk: "User managing session state. Guide to appropriate checkpoint mode based on context.",
      llm_guidance: "Unified checkpoint system - detect mode from flags, provide appropriate session management",
      context_hint: "User wants session management - guide to --resume, --new, --final, or default based on situation",
      response_format: "Acknowledge checkpoint action, show session continuity, provide mode-specific guidance",
      // @claude-code: This error recovery is crucial - when I'm lost, guide me to the right checkpoint mode
      error_recovery: "Feeling lost? 'checkpoint --resume' loads context, 'checkpoint --new' starts fresh, 'checkpoint --final' concludes session"
    }
  },
  
  // @claude-code: Interactive code snippet system - allows precise code context requests
  // @claude-code: Supports file:lines format and smart boundary detection for functions
  show: {
    syntax: "lev show <file>:<start>-<end> | <file>:<function_name>",
    description: "Display specific code snippets with smart boundary detection",
    examples: [
      "lev show src/app.js:45-60",
      "lev show router.js:handle_find",
      "lev show components/Button.tsx:100-120"
    ],
    whisper: {
      strategies: [
        "Show precise code ranges for focused context",
        "Expand to logical boundaries (full functions/classes) when needed",
        "Include surrounding context for better understanding",
        "Integrate with checkpoint system for timeline context"
      ],
      // @claude-code: Help me request the right code context when debugging or reviewing
      self_talk: "User wants specific code context. Show clean, focused snippets with logical boundaries.",
      llm_guidance: "Display code snippets with syntax highlighting and context. Expand to complete functions if partial.",
      context_hint: "User needs specific code examination - provide clean, focused view",
      response_format: "Show file path, line numbers, syntax-highlighted code with context",
      error_recovery: "File not found? Check path, try relative paths, or use 'find' to locate files"
    }
  },
  
  status: {
    syntax: "lev status [--project|--global|--metrics]",
    description: "Show project or system status",
    examples: [
      "lev status",
      "lev status --project",
      "lev status --global", 
      "lev status --metrics"
    ],
    whisper: {
      strategies: [
        "Display relevant status based on scope requested",
        "Show context counts and effectiveness scores",
        "Provide actionable insights for improvement"
      ],
      self_talk: "User wants system overview. Show clear status with actionable insights.",
      llm_guidance: "Display relevant status based on scope - local contexts, global ecosystem, or metrics",
      context_hint: "User wants overview of current state",
      response_format: "Structured status with counts, effectiveness scores, and actionable insights",
      error_recovery: "Status failed? Check project structure, try 'lev sync --check'"
    }
  },
  
  sync: {
    syntax: "lev sync [--pull|--push|--check]",
    description: "Synchronize local and global contexts",
    examples: [
      "lev sync",
      "lev sync --pull", 
      "lev sync --push ready",
      "lev sync --check"
    ],
    whisper: {
      strategies: [
        "Manage context synchronization between local and global",
        "Check for conflicts before applying changes",
        "Provide clear sync status and resolution steps"
      ],
      self_talk: "User syncing contexts. Check conflicts, show clear sync status.",
      llm_guidance: "Manage context synchronization between local project and global ecosystem",
      context_hint: "User wants context consistency management",
      response_format: "Sync status, conflicts if any, recommended actions",
      error_recovery: "Sync failed? Try 'lev sync --check', verify .kingly structure"
    }
  },
  
  // Enhanced commands from existing system
  
  
  job: {
    syntax: "lev job <description>",
    description: "AI-driven job orchestration with callbacks",
    examples: [
      "lev job \"comprehensive security audit\"",
      "lev job \"performance optimization analysis\"",
      "lev job \"user research synthesis\""
    ],
    whisper: {
      strategies: [
        "Analyze job complexity and create optimal breakdown",
        "Setup bi-directional callbacks for multi-tab coordination",
        "Provide realistic timeline and coordination strategy"
      ],
      self_talk: "User orchestrating complex job. Break down intelligently, show coordination plan.",
      llm_guidance: "Analyze job complexity, create optimal breakdown, setup bi-directional callbacks with callback chain explanation",
      context_hint: "User wants intelligent job orchestration across tabs with coordination strategy",
      response_format: "Job analysis, breakdown structure, callback chain details, estimated timeline, tab coordination",
      error_recovery: "Orchestration failed? Simplify description, break into smaller jobs"
    }
  },
  
  'rebuild-cache': {
    syntax: "lev rebuild-cache [--provider=openai|claude] [--force]",
    description: "Rebuild embeddings cache with enhanced context data",
    examples: [
      "lev rebuild-cache",
      "lev rebuild-cache --provider=claude",
      "lev rebuild-cache --force"
    ],
    whisper: {
      strategies: [
        "Rebuild semantic embeddings with rich YAML content",
        "Support multiple LLM providers for embeddings",
        "Force rebuild ignores content hashes"
      ],
      enhancement_notes: [
        "Uses rich YAML content: tool_config, pattern_config, mcp_tools",
        "Dynamic type discovery from contexts/ directory structure",
        "Simple slugs instead of weird codes"
      ],
      self_talk: "Rebuilding cache - explain process and estimated time",
      llm_guidance: "Rebuild embeddings cache using enhanced context content and dynamic type discovery",
      context_hint: "User wants to regenerate semantic search cache with improved content",
      response_format: "Cache rebuild progress, contexts processed, provider used, completion status",
      error_recovery: "Cache rebuild failed? Check provider API key, verify contexts/ structure"
    }
  }
};

// NLP fallback detection patterns
export const NLP_INDICATORS = [
  // No recognized command + natural language patterns
  /^[a-z\s]+workflow/i,
  /^(show|find|get|help).*me/i,
  /^(what|how|where|when|why)/i,
  /\?$/,
  // Intent-based patterns  
  /creative|strategic|planning|analysis/i,
  /need.*help|looking.*for/i,
  // Question patterns
  /can.*you|could.*you|would.*you/i,
  /how.*do.*i|what.*should.*i/i,
  // Context patterns
  /project|workspace|context|session/i
];


// Get combined registry with plugin commands
export async function getCombinedRegistry() {
  await pluginLoader.ensureLoaded();
  const pluginCommands = pluginLoader.getPluginCommands();
  
  return {
    ...COMMAND_REGISTRY,
    ...pluginCommands
  };
}

// Help text generation
export async function generateHelpText(command = null) {
  const registry = await getCombinedRegistry();
  
  if (command && registry[command]) {
    const cmd = COMMAND_REGISTRY[command];
    return `
${cmd.syntax}
${cmd.description}

Examples:
${cmd.examples.map(ex => `  ${ex}`).join('\n')}

Usage guidance:
${cmd.whisper.context_hint}
    `;
  }
  
  const commands = Object.entries(COMMAND_REGISTRY)
    .map(([name, cmd]) => `  ${cmd.syntax.padEnd(35)} ${cmd.description}`)
    .join('\n');
    
  return `
Kingly Hybrid Command System:

${commands}

Natural Language:
  kingly <natural language>           Semantic workflow discovery
  
Examples:
  kingly find creative brainstorming
  kingly "help me with strategic planning" 
  kingly "what workflows for startup launch?"
  kingly promote my-workflow
  
For detailed help: kingly help <command>
  `;
}