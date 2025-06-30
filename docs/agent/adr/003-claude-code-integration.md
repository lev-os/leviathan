# ADR-003: Claude Code Slash Command Integration

**Status:** Implemented  
**Date:** 2025-06-11  
**Updated:** 2025-06-14  
**Context:** Deep integration with Claude Code through slash commands and MCP backend

## Decision

Implement comprehensive Claude Code integration using kingly-semantic as the backend intelligence engine, providing slash commands that leverage distributed AI workspace intelligence.

## Architecture

### Slash Command Mapping
```
/think    → kingly-semantic power <context>
/all      → kingly-semantic lookup --all --context=current
/kingly   → kingly-semantic workflow --interactive
/exec     → kingly-semantic execute --chain
/ping     → kingly-semantic ping --auto
/handoff  → kingly-semantic handoff --prepare
/load     → kingly-semantic load --latest
/sync     → kingly-semantic template sync --all
/evolve   → kingly-semantic template evolve --context=current
```

### Integration Layers

#### Layer 1: Direct Command Integration
Claude Code → kingly-semantic binary → Response

#### Layer 2: MCP Protocol Enhancement  
Claude Code → MCP Server → kingly-semantic → Structured Response

#### Layer 3: Intelligence Routing
Claude Code → MCP Server → Cross-Workspace Intelligence → Aggregated Response

## Slash Command Specifications

### `/think` - Situational Analysis
**Backend:** `kingly-semantic power`  
**Purpose:** Deep contextual analysis with auto-save  
**Variables:** context detection, file analysis, cross-workspace references  
**Output:** Analysis markdown with checkpoint creation

```bash
# Claude Code execution
/think debugging performance issue

# Backend translation
kingly-semantic power --context="debugging performance issue" \
  --files="auto-detect" --workspace="current" --save-draft=true
```

### `/all` - Intelligence Dump
**Backend:** `kingly-semantic lookup --all`  
**Purpose:** Comprehensive intelligence access  
**Variables:** context scope, intelligence level, cross-references  
**Output:** Structured intelligence package

```bash
# Claude Code execution  
/all

# Backend translation
kingly-semantic lookup --all --context="current-conversation" \
  --scope="workspace+cross-references" --format="structured"
```

### `/kingly` - Workflow Selection
**Backend:** `kingly-semantic workflow --interactive`  
**Purpose:** Context-aware workflow selection  
**Variables:** current context, available workflows, relevance scoring  
**Output:** Interactive workflow menu

```bash
# Claude Code execution
/kingly

# Backend translation  
kingly-semantic workflow --interactive --context="current" \
  --score-relevance=true --format="menu"
```

### `/exec` - Workflow Execution
**Backend:** `kingly-semantic execute --chain`  
**Purpose:** Execute workflows with progress tracking  
**Variables:** workflow selection, chaining rules, progress callbacks  
**Output:** Execution status with progress updates

```bash
# Claude Code execution
/exec deploy-sequence

# Backend translation
kingly-semantic execute --workflow="deploy-sequence" \
  --chain=true --progress=true --callback="claude-code"
```

### `/ping` - Session Checkpoint
**Backend:** `kingly-semantic ping --auto`  
**Purpose:** Automatic session checkpointing  
**Variables:** auto-context detection, significance scoring  
**Output:** Checkpoint confirmation

```bash
# Claude Code execution (auto-triggered)
/ping

# Backend translation
kingly-semantic ping --auto --context="auto-detect" \
  --significance="auto-score" --session="current"
```

### `/handoff` - Session Preparation  
**Backend:** `kingly-semantic handoff --prepare`  
**Purpose:** Prepare comprehensive session handoff  
**Variables:** session history, file states, decision points  
**Output:** Handoff package

```bash
# Claude Code execution
/handoff

# Backend translation
kingly-semantic handoff --prepare --session="current" \
  --include="decisions,files,blockers" --format="package"
```

### `/load` - Context Restoration
**Backend:** `kingly-semantic load --latest`  
**Purpose:** Restore session context  
**Variables:** handoff selection, restoration level  
**Output:** Context restoration confirmation

```bash
# Claude Code execution
/load

# Backend translation  
kingly-semantic load --latest --workspace="current" \
  --restore-level="full" --validate=true
```

### `/sync` - Template Synchronization
**Backend:** `kingly-semantic template sync --all`  
**Purpose:** Synchronize intelligence templates  
**Variables:** sync scope, merge strategy  
**Output:** Sync status and conflicts

```bash
# Claude Code execution
/sync

# Backend translation
kingly-semantic template sync --all --workspace="current" \
  --strategy="intelligent-merge" --preview=true
```

### `/evolve` - Template Evolution
**Backend:** `kingly-semantic template evolve --context=current`  
**Purpose:** AI-driven template improvement  
**Variables:** usage patterns, context analysis  
**Output:** Evolution recommendations

```bash
# Claude Code execution  
/evolve

# Backend translation
kingly-semantic template evolve --context="current" \
  --usage-analysis=true --preview-changes=true
```

## MCP Integration Architecture

### Enhanced MCP Tools
```typescript
interface KinglySemanticTools {
  // Core intelligence
  semantic_power: (context: string, options?: PowerOptions) => AnalysisResult;
  semantic_lookup: (query: string, options?: LookupOptions) => IntelligenceResult;
  
  // Workflow management
  workflow_select: (context: string, interactive?: boolean) => WorkflowMenu;
  workflow_execute: (workflow: string, options?: ExecOptions) => ExecutionResult;
  
  // Session management  
  session_ping: (context?: string, auto?: boolean) => CheckpointResult;
  session_handoff: (options?: HandoffOptions) => HandoffPackage;
  session_load: (handoff?: string, level?: string) => RestorationResult;
  
  // Template system
  template_sync: (scope?: string, strategy?: string) => SyncResult;
  template_evolve: (context?: string, preview?: boolean) => EvolutionResult;
}
```

### Response Formats
```typescript
interface StructuredResponse {
  command: string;
  status: 'success' | 'error' | 'partial';
  data: any;
  metadata: {
    execution_time: number;
    workspace: string;
    cross_references?: string[];
    next_actions?: string[];
  };
  intelligence: {
    confidence: number;
    related_contexts: string[];
    suggested_followups: string[];
  };
}
```

## BDD Scenarios

```gherkin
Feature: Claude Code Slash Commands
  Scenario: Think command execution
    Given Claude Code is active in workspace
    When user types "/think performance issue"  
    Then kingly-semantic power analyzes context
    And structured analysis is returned
    And checkpoint is auto-created

  Scenario: Workflow selection and execution
    Given relevant workflows exist
    When user types "/kingly" then "/exec selected-workflow"
    Then interactive workflow menu appears
    And selected workflow executes with progress
    And execution status is tracked

  Scenario: Session handoff and restoration
    Given active session with context
    When user types "/handoff" then later "/load"
    Then comprehensive handoff package is created  
    And context is fully restored in new session
    And file references are validated

  Scenario: Template synchronization
    Given workspace with templates
    When user types "/sync" then "/evolve"
    Then templates sync across workspaces
    And AI-driven improvements are suggested
    And changes preview before application
```

## Integration Points

### With Session Intelligence (ADR-001)
- Slash commands automatically trigger session management
- Cross-workspace routing through command context
- Intelligence sharing via command execution

### With Template Propagation (ADR-002)  
- Commands respect template-defined behaviors
- Template evolution driven by command usage patterns
- Cross-workspace command synchronization

### With Distributed Intelligence Network
- Commands access distributed workspace intelligence
- Cross-workspace command execution and routing
- Intelligence aggregation through command results

## Implementation Strategy

### Phase 1: Basic Slash Commands
- Implement core `/think`, `/all`, `/kingly` commands
- Basic MCP tool integration
- Simple context detection

### Phase 2: Advanced Session Management
- `/ping`, `/handoff`, `/load` command implementation  
- Session persistence and restoration
- Cross-workspace session routing

### Phase 3: Template Integration
- `/sync`, `/evolve` command implementation
- Template-driven command behavior
- AI-driven template evolution

### Phase 4: Intelligence Network
- Cross-workspace command execution
- Distributed intelligence aggregation
- Advanced context routing and sharing

## Technical Requirements

### Claude Code Integration
- MCP server configuration for kingly-semantic tools
- Slash command to backend command translation
- Response formatting for Claude Code UI

### Backend Requirements
- kingly-semantic binary with all command implementations
- Structured JSON response format  
- Error handling and fallback strategies

### Intelligence Routing
- Cross-workspace context detection
- Intelligence aggregation algorithms
- Conflict resolution for overlapping contexts

## Consequences

**Positive:**
- Seamless AI intelligence access through familiar interface
- Consistent workflow across all Claude Code sessions
- Cross-workspace intelligence sharing via commands
- Reduced context switching and manual command typing

**Negative:**
- Dependency on kingly-semantic backend availability
- Potential command execution latency
- Learning curve for new slash commands
- Risk of command namespace conflicts

## Success Metrics

- Slash command adoption and usage frequency
- Command execution success rate and performance
- Cross-workspace intelligence sharing effectiveness
- User workflow efficiency improvements
- Integration stability and error rates