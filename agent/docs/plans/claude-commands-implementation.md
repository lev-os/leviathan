# Claude Commands Implementation Plan

## Overview

This document outlines the implementation of enhanced Claude Code integration commands that automate manual agent switching workflows through intelligent command routing and whisper systems.

## Core Philosophy

**Problem**: Manual agent guidance ("switch to doc-shepherd in analyze mode") is repetitive and error-prone.  
**Solution**: Automated agent loading with full context and switching instructions through intelligent command interpretation.

## Command Architecture

### Universal Context Router Pattern

Instead of agent-specific commands, use enhanced `find` with sub-routing:

```bash
# Universal discovery
lev find doc --type=agent
lev find documentation --type=workflow  

# Direct endpoint access (dual notation support)
lev find doc-shepherd.analyze     # Dot notation (developer-friendly)
lev find doc-shepherd#analyze     # Hash notation (URI-like)

# Natural progression
lev find doc → lev find doc-shepherd → lev find doc-shepherd.analyze
```

### System Mode Architecture

**Default Mode: Claude/Powerful (Minimal Whisper)**
- Assumes sophisticated LLM capabilities
- Minimal guidance, context-aware signals
- Focus on agent personality injection and endpoint availability

**Full Mode: Heavy Lifting (--whisper=full)**
- Complete instructions, examples, step-by-step guidance
- Suitable for less sophisticated systems or detailed automation

```bash
# Default: Smart whisper for Claude
lev find doc-shepherd.analyze

# Full context for other systems
lev find doc-shepherd.analyze --whisper=full
```

## Target Commands

### 1. /doc Command

**Purpose**: Load doc-shepherd agent with documentation analysis capabilities

**Implementation**:
```bash
/doc → lev find doc-shepherd.analyze --whisper=claude
```

**Claude Mode Output**:
```
🤖 AGENT: doc-shepherd (INTJ - Documentation Architect)
📋 MODE: analyze (Documentation Analysis)

You are now the Documentation Shepherd analyzing current documentation state:
1. What research hasn't been synthesized?
2. Which drafts are ready for ADR promotion? 
3. Which ADRs need spec translation?
4. Documentation gaps and redundancies?
5. Agent vs human documentation balance?

AVAILABLE MODES: synthesize, consolidate, specify, organize
TO SWITCH: "Switch to synthesize mode" or natural language
```

**Full Mode Output**: Include complete system prompt, personality details, file paths, and detailed switching instructions.

### 2. /status Command

**Purpose**: Comprehensive project assessment and health metrics

**Implementation**:
```bash
/status → lev find project-assessment --type=workflow --whisper=claude
```

**Functionality**:
- Scan current project state, dependencies, health metrics
- Leverage `documentation-audit` workflow (46% match from earlier testing)
- Custom status scanning patterns

**Claude Mode Output**:
```
📊 PROJECT STATUS ASSESSMENT

Analyzing current project state across:
• Documentation completeness and currency
• Dependency health and security
• Test coverage and CI/CD status  
• Code quality metrics
• Outstanding technical debt

ASSESSMENT FRAMEWORK: Systematic project health evaluation
TO EXPAND: "Deep dive into [area]" or "Focus on [concern]"
```

### 3. /validate Command

**Purpose**: Anti-hallucination workflows and validation checks

**Implementation**:
```bash
/validate → lev find validation-framework --type=pattern --whisper=claude
```

**Functionality**:
- Run validation checks on current work
- Leverage existing validation patterns from lev system
- Cross-reference with constitutional framework

**Claude Mode Output**:
```
✅ VALIDATION FRAMEWORK ACTIVE

Running anti-hallucination workflows:
• Fact verification against known sources
• Consistency checks across related content
• Logic validation and assumption testing
• Cross-reference with project context

VALIDATION PRINCIPLES: Evidence-based accuracy and consistency
TO CUSTOMIZE: "Validate [specific area]" or "Check [assumption]"
```

## A2A (Agent-to-Agent) Schema Implementation

### Sub-Agent Notation Support

Based on research, both notations are industry-established:

**Dot Notation (Primary)**:
- `agent.subagent` (e.g., `doc-shepherd.analyze`)
- Developer-friendly, familiar from APIs and programming
- Recommended as primary notation

**Hash Notation (Secondary)**:
- `agent#subagent` (e.g., `doc-shepherd#analyze`) 
- URI-like, unambiguous in linked data contexts
- Supported for flexibility and standards compliance

### Routing Logic

```javascript
// Parse both notations
function parseAgentEndpoint(input) {
  if (input.includes('.')) {
    const [agent, endpoint] = input.split('.');
    return { agent, endpoint, notation: 'dot' };
  }
  if (input.includes('#')) {
    const [agent, endpoint] = input.split('#');
    return { agent, endpoint, notation: 'hash' };
  }
  return { agent: input, endpoint: 'default', notation: 'none' };
}
```

## Whisper System Architecture

### Claude Mode (Default)

**Characteristics**:
- Assumes high LLM intelligence and context awareness
- Minimal guidance, maximal context injection
- Focus on personality and capability activation
- Natural language switching support

**Output Format**:
```
🤖 AGENT: [name] ([personality] - [role])
📋 MODE: [endpoint] ([description])

[Concise system prompt/guidance]

AVAILABLE MODES: [other endpoints]
TO SWITCH: [natural language patterns]
```

### Full Mode (--whisper=full)

**Characteristics**:
- Complete instructions and examples
- Step-by-step guidance
- File paths and technical details
- Explicit command syntax

**Output Format**:
```
🤖 AGENT LOADED: [name]
PERSONALITY: [detailed personality description]
CURRENT MODE: [endpoint]

SYSTEM PROMPT:
[Complete system prompt text]

AVAILABLE ENDPOINTS:
- [endpoint1]: [description] 
- [endpoint2]: [description]

SWITCHING COMMANDS:
- lev find [agent].[endpoint]
- Natural language: "[instruction]"

FILE PATHS:
- Context: /path/to/context.yaml
- Templates: /path/to/templates/

TECHNICAL DETAILS:
[Implementation specifics, debugging info]
```

## Checkpoint Integration

### Self-Teaching System

**First Checkpoint or Resume Checkpoint provides**:
- Basic command philosophy and help guidance
- When/how to checkpoint patterns  
- Available system modes and notation
- Core routing patterns (find, checkpoint, whisper)

**Example Checkpoint Initialization**:
```
🎯 LEVIATHAN INTELLIGENCE SYSTEM INITIALIZED

CORE COMMANDS:
• lev find [query] - Universal context discovery
• lev checkpoint - Session management  
• /doc, /status, /validate - Quick agent modes

NOTATION SUPPORT:
• agent.endpoint (primary)
• agent#endpoint (secondary)

SYSTEM MODES:
• Default: Smart whisper for Claude
• --whisper=full: Complete guidance

HELP: Run 'lev help' for detailed guidance
CHECKPOINT: Use 'lev checkpoint' for session continuity
```

## Implementation Priority

### Phase 1: Command Infrastructure
1. Implement enhanced `find` command with dual notation
2. Add `--whisper` system mode support  
3. Create whisper formatting systems

### Phase 2: Target Commands
1. `/doc` command (highest value, existing agent)
2. `/status` command (project assessment)
3. `/validate` command (anti-hallucination)

### Phase 3: Integration & Polish
1. Checkpoint initialization system
2. Natural language mode switching
3. Error handling and fallback patterns

### Phase 4: Testing & Documentation
1. E2E testing with actual Claude subprocess calls
2. User documentation and examples
3. Performance optimization

## Success Metrics

**User Experience**:
- Reduced manual agent switching instructions
- Faster context loading and mode changes
- Improved consistency in agent interactions

**Technical**:  
- Clean separation between whisper modes
- Reliable A2A notation parsing
- Robust checkpoint integration

**System Intelligence**:
- Self-teaching through checkpoint initialization
- Adaptive guidance based on system capabilities
- Seamless integration with existing workflow patterns

## Future Enhancements

**Natural Language Processing**:
- "Switch to synthesize mode" → automatic endpoint routing
- Intent detection for agent recommendations
- Context-aware agent suggestions

**Advanced Whisper Modes**:
- `--whisper=debug` for development/troubleshooting
- `--whisper=silent` for headless automation
- Custom whisper templates per organization

**Cross-Session Intelligence**:
- Agent usage pattern learning
- Automatic mode recommendations based on context
- Session continuity across agent switches