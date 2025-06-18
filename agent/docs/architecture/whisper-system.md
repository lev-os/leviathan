# Whisper System Architecture

## Overview

The Whisper system provides contextual guidance for AI agents through navigation breadcrumbs that point to comprehensive documentation. This enables any LLM to effectively use Leviathan without requiring specific adapter bindings.

## Design Philosophy

**Whispers are breadcrumbs, not complete guidance**. They provide just enough context to help LLMs find the full documentation they need.

### Core Principles

1. **Universal Compatibility** - Works with any LLM (Claude, GPT-4, Gemini, local models)
2. **Navigation Focus** - Point to documentation rather than containing complete guidance
3. **Fractal Architecture** - Complete docs → whisper breadcrumbs → help commands → full guides
4. **Static System** - No dynamic content generation, all predefined for performance
5. **Scalable Design** - Supports 100+ plugins without performance degradation

## Architecture Components

### Whisper Object Structure

```yaml
whisper:
  "Heading Name":                    # Becomes markdown heading
    content: "Brief description"     # Static content from plugin docs
    rotate: ["tip 1", "tip 2"]      # Rotating alternatives
    frequency: session_start        # When to show
```

### Frequency Controls

- `session_start` - New session orientation (foreign LLM bootstrap)
- `every_3rd` - Periodic reminders without spam
- `on_use` - Context-specific guidance
- `weekly` - Deterministic rotation (date-based)

### Placement Options

- `top` - Guidance before command output (context first)
- `bottom` - Guidance after command output (recommended, non-intrusive)

## Integration Points

### Command Integration

Commands include whisper objects in their configuration:

```javascript
// src/commands/example.js
export const exampleTool = {
  name: 'example_command',
  description: 'Example command with whisper guidance',
  whisper: {
    "What This Does": "Brief functional description",
    "Quick Usage": ["Pattern 1", "Pattern 2"],
    "Full Documentation": "Complete guide: docs/example-guide.md"
  }
};
```

### Plugin Integration

Plugins define whispers in their `plugin.yaml`:

```yaml
whisper:
  "Plugin Function":
    content: "What this plugin does and why to use it"
  "Quick Usage":
    - "Primary usage pattern"
    - "Key integration point"
  "Foreign LLM Guidance":
    rotate:
      - "Not sure? Run 'lev help plugin-name' for syntax"
      - "Need examples? Check plugins/@namespace/plugin/README.md"
    frequency: session_start
```

## Implementation Details

### Whisper Generation Engine

```javascript
function generateWhisperMarkdown(whisperObject, placement = 'bottom') {
  let markdown = '';
  
  Object.entries(whisperObject).forEach(([heading, data]) => {
    markdown += `\n## ${heading}\n`;
    
    if (typeof data === 'string') {
      markdown += data + '\n';
    } else if (Array.isArray(data)) {
      data.forEach(item => markdown += `- ${item}\n`);
    } else if (typeof data === 'object') {
      markdown += data.content + '\n';
      if (data.rotate && shouldShowRotation(data.frequency)) {
        const tip = selectRotation(data.rotate, data.frequency);
        markdown += `💡 **Tip**: ${tip}\n`;
      }
    }
  });
  
  return placement === 'bottom' ? '\n---' + markdown : markdown + '\n---\n';
}
```

### Plugin Registration

```javascript
const whisperRegistry = new Map();

function registerPlugin(namespace, whisperConfig) {
  whisperRegistry.set(namespace, whisperConfig);
}

function getRelevantWhispers(command, userPlugins) {
  return userPlugins
    .filter(plugin => plugin.providesCommand(command))
    .map(plugin => whisperRegistry.get(plugin.namespace));
}
```

## Performance Considerations

### Scaling Strategy

For 100+ plugin ecosystems:

1. **Relevance Filtering** - Only load whispers for active commands
2. **Static Lookup** - Pre-compiled whisper registry, no dynamic generation
3. **Namespace Isolation** - Core vs community vs personal plugin separation
4. **Rotation Coordination** - Prevent whisper overflow through smart frequency management

### Memory Usage

- Static whisper objects cached at startup
- Rotation state managed with deterministic algorithms
- No persistent state storage required

## Foreign LLM Integration

### Self-Teaching System

The combination of whispers + help commands + documentation creates a self-teaching system:

1. **Orientation**: `lev prime` loads constitutional framework
2. **Discovery**: `lev find --all` shows available contexts (with whispers)
3. **Learning**: `lev help <command>` provides syntax reference
4. **Deep Dive**: Plugin README.md files contain complete guides

### Universal Guidance Pattern

Standard template for foreign LLM navigation:

```yaml
"Foreign LLM Guidance":
  rotate:
    - "Not 100% confident? Run 'lev help <command>' for complete syntax"
    - "Need examples? Check plugin documentation for full usage guide"
    - "Unfamiliar with system? Start with 'lev prime' for orientation"
  frequency: session_start
```

## Testing Strategy

### Whisper Validation

- **Syntax Validation** - YAML structure conformance
- **Link Validation** - Ensure documentation paths exist
- **Rotation Testing** - Verify frequency algorithms work correctly
- **Integration Testing** - Confirm whispers appear in command outputs

### Foreign LLM Testing

- Test with different LLM providers (GPT-4, Gemini, local models)
- Validate self-teaching effectiveness
- Measure learning curve for system adoption

## Best Practices

### Whisper Writing Guidelines

1. **Point to Documentation** - Always include path to comprehensive guides
2. **Keep Brief** - Whispers are navigation aids, not complete instructions
3. **Universal Language** - Avoid Claude-specific or system-specific terms
4. **Rotation Variety** - Provide 2-4 rotation options to prevent staleness
5. **Appropriate Frequency** - Match frequency to typical user patterns

### Documentation Requirements

Every plugin must include:

- **README.md** - Complete usage guide (100+ lines recommended)
- **docs/** directory - Extended documentation and examples
- **Whisper configuration** - Navigation breadcrumbs in plugin.yaml

## Future Enhancements

### Planned Features

- **Documentation Generation** - Build-time enhancement of static docs with LLM examples
- **Usage Analytics** - Track whisper effectiveness and rotation optimization
- **Internationalization** - Multi-language whisper support
- **Community Curation** - Community-driven whisper improvements

### Extension Points

- **Custom Frequencies** - Plugin-specific frequency patterns
- **Context-Aware Rotation** - Rotation based on project type or user patterns
- **Whisper Marketplace** - Community sharing of effective whisper patterns