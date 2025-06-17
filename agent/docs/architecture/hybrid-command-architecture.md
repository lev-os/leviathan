# Hybrid Command Architecture Implementation

**KINGLY IQ is online** 💻

Perfect approach! Both explicit commands AND natural language fallback. Complete system implementation:

## Implementation Plan

### Phase 1: Command Registry Infrastructure

```javascript
// ~/mvp/command-registry.js
export const COMMAND_REGISTRY = {
  // Core workflow commands
  find: {
    syntax: "ks find <intent>",
    description: "Discover workflows by intent or code",
    examples: [
      "ks find creative brainstorming",
      "ks find 1a",
      "ks find strategic planning"
    ],
    whisper: {
      llm_guidance: "Use findWorkflow() with semantic search. Returns workflow with confidence score.",
      context_hint: "User wants workflow discovery - provide top 3 matches with effectiveness scores",
      response_format: "Show workflow code, name, description, and next steps"
    }
  },
  
  promote: {
    syntax: "ks promote <context-name>",
    description: "Promote local context to global availability",
    examples: [
      "ks promote pdf-automation",
      "ks promote apple-aesthetic",
      "ks promote launch-sequence"
    ],
    whisper: {
      llm_guidance: "Validate effectiveness metrics, check promotion criteria, copy to global contexts",
      context_hint: "User wants to make local innovation globally available",
      response_format: "Show validation results, promotion status, global availability confirmation"
    }
  },
  
  validate: {
    syntax: "ks validate [context-name|--all]",
    description: "Check promotion readiness of contexts",
    examples: [
      "ks validate pdf-tool",
      "ks validate --all",
      "ks validate"
    ],
    whisper: {
      llm_guidance: "Check effectiveness metrics against promotion thresholds, identify gaps",
      context_hint: "User wants promotion readiness assessment",
      response_format: "Show effectiveness scores, promotion criteria status, improvement suggestions"
    }
  },
  
  combos: {
    syntax: "ks combos <intent> [count]",
    description: "Find workflow combinations for complex scenarios",
    examples: [
      "ks combos startup launch 3",
      "ks combos creative problem solving",
      "ks combos strategic decision"
    ],
    whisper: {
      llm_guidance: "Use findCombos() to get primary + related workflows. Show synergy rationale.",
      context_hint: "User needs comprehensive workflow sequence for complex task",
      response_format: "Primary workflow + supporting workflows with synergy explanations"
    }
  },
  
  ping: {
    syntax: "ks ping [--context <desc>]",
    description: "Session checkpoint and progress update",
    examples: [
      "ks ping",
      "ks ping --context 'completed user research'",
      "ks ping --context 'about to deploy'"
    ],
    whisper: {
      llm_guidance: "Create session checkpoint, update progress, suggest next actions",
      context_hint: "User wants session state update and guidance",
      response_format: "Current progress summary, next recommended actions, session continuity info"
    }
  },
  
  status: {
    syntax: "ks status [--project|--global|--metrics]",
    description: "Show project or system status",
    examples: [
      "ks status",
      "ks status --project", 
      "ks status --global",
      "ks status --metrics"
    ],
    whisper: {
      llm_guidance: "Display relevant status based on scope - local contexts, global ecosystem, or metrics",
      context_hint: "User wants overview of current state",
      response_format: "Structured status with counts, effectiveness scores, and actionable insights"
    }
  },
  
  sync: {
    syntax: "ks sync [--pull|--push|--check]",
    description: "Synchronize local and global contexts",
    examples: [
      "ks sync",
      "ks sync --pull",
      "ks sync --push ready",
      "ks sync --check"
    ],
    whisper: {
      llm_guidance: "Manage context synchronization between local project and global ecosystem",
      context_hint: "User wants context consistency management",
      response_format: "Sync status, conflicts if any, recommended actions"
    }
  }
};

// NLP fallback detection
export const NLP_INDICATORS = [
  // No recognized command + natural language patterns
  /^[a-z\s]+workflow/i,
  /^(show|find|get|help).*me/i,
  /^(what|how|where|when|why)/i,
  /\?$/,
  // Intent-based patterns
  /creative|strategic|planning|analysis/i,
  /need.*help|looking.*for/i
];
```

### Phase 2: Enhanced Router with Command Registry

```javascript
// ~/.kingly/router.js (enhanced)
import { COMMAND_REGISTRY, NLP_INDICATORS } from '../mvp/command-registry.js';

class KinglyRouter {
  constructor() {
    this.commands = COMMAND_REGISTRY;
    this.adapter = null; // ClaudeCodeAdapter instance
  }
  
  async route(args) {
    const input = args.join(' ');
    const command = args[0];
    
    // Check for explicit command
    if (this.commands[command]) {
      return await this.executeCommand(command, args.slice(1));
    }
    
    // Check for NLP patterns or fallback
    if (this.isNaturalLanguage(input)) {
      return await this.handleNLP(input);
    }
    
    // Unknown command - suggest alternatives
    return this.suggestCommand(command);
  }
  
  async executeCommand(command, args) {
    const cmd = this.commands[command];
    
    try {
      // Execute command with whisper guidance
      const result = await this[`handle_${command}`](args);
      
      // Include whisper for LLM context
      return {
        result,
        whisper: cmd.whisper,
        command_info: {
          syntax: cmd.syntax,
          description: cmd.description
        }
      };
    } catch (error) {
      return this.handleCommandError(command, error, cmd);
    }
  }
  
  async handle_find(args) {
    const intent = args.join(' ');
    if (!intent) throw new Error("Intent required. Usage: ks find <intent>");
    
    const result = await this.adapter.findWorkflow(intent, "full");
    
    if (result.found) {
      return {
        success: true,
        workflow: result,
        next_actions: await this.adapter.suggestNext(result.code)
      };
    } else {
      return {
        success: false,
        suggestions: result.suggestions?.slice(0, 3) || [],
        alternative_message: "No exact match found. Try these related workflows:"
      };
    }
  }
  
  async handle_promote(args) {
    const contextName = args[0];
    if (!contextName) throw new Error("Context name required. Usage: ks promote <context-name>");
    
    // Load local context
    const context = await this.loadLocalContext(contextName);
    if (!context) {
      throw new Error(`Context '${contextName}' not found in .kingly/contexts/`);
    }
    
    // Validate promotion criteria
    const validation = await this.validatePromotion(context);
    
    if (validation.canPromote) {
      await this.promoteToGlobal(contextName, context);
      return {
        success: true,
        promoted: true,
        effectiveness: context.effectiveness_metrics?.quality_score || 'N/A',
        global_path: `~/ka/contexts/${context.metadata.type}/${contextName}/`,
        message: `✅ ${contextName} promoted to global contexts`
      };
    } else {
      return {
        success: false,
        promoted: false,
        validation_results: validation,
        improvements_needed: validation.gaps
      };
    }
  }
  
  async handle_validate(args) {
    const scope = args[0] || '--all';
    
    if (scope === '--all') {
      return await this.validateAllContexts();
    } else {
      return await this.validateSingleContext(scope);
    }
  }
  
  async handle_combos(args) {
    const intent = args.slice(0, -1).join(' ') || args.join(' ');
    const count = parseInt(args[args.length - 1]) || 3;
    
    const combos = await this.adapter.findCombos(intent, count);
    
    return {
      primary: combos[0],
      supporting: combos.slice(1),
      synergy_explanation: this.explainWorkflowSynergy(combos)
    };
  }
  
  isNaturalLanguage(input) {
    return NLP_INDICATORS.some(pattern => pattern.test(input)) ||
           !input.includes('-') && input.split(' ').length > 2;
  }
  
  async handleNLP(input) {
    // Use semantic workflow discovery
    const workflow = await this.adapter.findWorkflow(input, "full");
    
    return {
      nlp_mode: true,
      interpreted_as: input,
      result: workflow,
      whisper: {
        llm_guidance: "User used natural language. Provide conversational response with workflow suggestions.",
        context_hint: "Natural language query - be helpful and explain options",
        response_format: "Conversational tone with practical next steps"
      }
    };
  }
}
```

### Phase 3: Fractal .kingly Structure

```bash
# Project-level .kingly structure (mirrors global ~/ka/)
project/.kingly/
├── contexts/
│   ├── tools/
│   │   └── pdf-automation/
│   │       ├── context.yaml
│   │       ├── scripts/
│   │       │   ├── install.sh
│   │       │   ├── generate.sh
│   │       │   └── validate.sh
│   │       └── docs/
│   │           ├── README.md
│   │           ├── examples/
│   │           └── api-reference.md
│   ├── agents/
│   │   └── claude-code-adapter/
│   ├── workflows/
│   │   └── 72-hour-launch/
│   └── patterns/
│       └── apple-vision-pro/
├── promote.js              # Promotion engine
├── validate.js             # Validation framework
└── config.yaml            # Local configuration
```

### Phase 4: Command Help System

```javascript
// Auto-generated help system
class CommandHelp {
  static showHelp(command = null) {
    if (command && COMMAND_REGISTRY[command]) {
      return this.showCommandHelp(COMMAND_REGISTRY[command]);
    }
    
    return this.showAllCommands();
  }
  
  static showCommandHelp(cmd) {
    return `
${cmd.syntax}
${cmd.description}

Examples:
${cmd.examples.map(ex => `  ${ex}`).join('\n')}

Usage guidance:
${cmd.whisper.context_hint}
    `;
  }
  
  static showAllCommands() {
    const commands = Object.entries(COMMAND_REGISTRY)
      .map(([name, cmd]) => `  ${cmd.syntax.padEnd(30)} ${cmd.description}`)
      .join('\n');
      
    return `
Kingly Command Reference:

${commands}

Natural Language:
  ks <natural language>      Semantic workflow discovery
  
Examples:
  ks find creative brainstorming
  ks "help me with strategic planning"
  ks "what workflows for startup launch?"
  
For detailed help: ks help <command>
    `;
  }
}
```

### Phase 5: CLI Entry Point

```bash
#!/bin/bash
# ~/ks - Enhanced with dual support

# Help system
if [ "$1" = "help" ]; then
  if [ -n "$2" ]; then
    node ~/.kingly/help.js "$2"
  else
    node ~/.kingly/help.js
  fi
  exit 0
fi

# Route to enhanced router
RESULT=$(node ~/.kingly/router.js "$@")
EXIT_CODE=$?

# Parse result and display appropriately
echo "$RESULT" | node ~/.kingly/formatter.js

# Special handling for whispers (hidden from user, available to LLM)
if [ -f "/tmp/kingly-whisper.json" ]; then
  # LLM can access whisper guidance via temp file
  cat /tmp/kingly-whisper.json > /dev/stderr 2>/dev/null || true
  rm -f /tmp/kingly-whisper.json
fi

exit $EXIT_CODE
```

### Phase 6: Whisper System for LLM Guidance

```javascript
// ~/.kingly/whisper.js
class WhisperSystem {
  static async generateWhisper(command, result, context) {
    const whisper = {
      command_executed: command,
      llm_guidance: context.whisper?.llm_guidance,
      context_hint: context.whisper?.context_hint,
      response_format: context.whisper?.response_format,
      result_interpretation: this.interpretResult(result),
      suggested_followups: await this.suggestFollowups(command, result),
      session_context: await this.getSessionContext()
    };
    
    // Write to temp file for LLM access
    await fs.writeFile('/tmp/kingly-whisper.json', JSON.stringify(whisper, null, 2));
    
    return whisper;
  }
  
  static interpretResult(result) {
    if (result.success === false) {
      return "Command failed - guide user through alternatives or error resolution";
    }
    
    if (result.nlp_mode) {
      return "Natural language query - provide conversational response with actionable insights";
    }
    
    return "Command successful - acknowledge result and suggest logical next steps";
  }
}
```

## Usage Examples

```bash
# Explicit commands (with guidance whispers)
ks find creative brainstorming
ks promote pdf-automation
ks validate --all
ks combos startup launch 3

# Natural language fallback
ks "help me with strategic planning"
ks "what workflows for creative problem solving?"
ks "show me project status"
ks "find something like design thinking"

# Help system
ks help
ks help find
ks help promote
```

## Expected Output with Whisper

```bash
$ ks find creative brainstorming

✅ Found: 1i - Reverse Brainstorming (0.89 match)
📋 Description: Generate ideas by exploring opposite approaches
🎯 Next: Consider pairing with "2k - SCAMPER Framework" for enhancement

# Hidden whisper to LLM (via stderr):
{
  "llm_guidance": "Use findWorkflow() with semantic search. Returns workflow with confidence score.",
  "context_hint": "User wants workflow discovery - provide top 3 matches with effectiveness scores",
  "response_format": "Show workflow code, name, description, and next steps",
  "suggested_followups": ["Execute the workflow", "Find related workflows", "Get workflow details"]
}
```

## System Benefits

This creates a **hybrid system** that supports both explicit commands AND natural language, with hidden whisper guidance that helps LLMs provide contextually appropriate responses.

### Key Features:
- **Dual Mode**: Explicit commands + NLP fallback
- **Command Registry**: Centralized command definitions with whispers
- **Fractal Structure**: .kingly mirrors global ~/ka/ structure
- **LLM Guidance**: Hidden whispers provide context for AI responses
- **Progressive Discovery**: Help system with examples and usage guidance
- **Context Promotion**: Local innovation → global availability pipeline

**Status**: Complete hybrid command architecture ready for implementation.