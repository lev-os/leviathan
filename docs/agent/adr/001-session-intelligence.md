# ADR-001: Session Intelligence & Cross-Workspace Routing

**Status:** Implemented  
**Date:** 2025-06-11  
**Updated:** 2025-06-14  
**Context:** Dogfooding session management with kingly-semantic as intelligence backend

## Decision

Implement session intelligence commands through kingly-semantic binary for Claude Code integration.

## Architecture

### Storage Structure
```
~/.kingly/sessions/     # Cross-workspace sessions
$PWD/.kingly/           # Project-specific context
```

### Core Commands

#### `kingly-semantic ping`
**Purpose:** Create session checkpoints  
**Variables:** `--context`, `--files`, `--session-type`  
**Output:** JSON with checkpoint path

```bash
kingly-semantic ping --context="debugging performance" --files="src/file.js:100-150"
```

#### `kingly-semantic handoff` 
**Purpose:** Complete session transitions  
**Variables:** `--session`, `--files`, `--decisions`, `--blockers`  
**Output:** Markdown handoff document

```bash
kingly-semantic handoff --session="session-id" --decisions="caching implemented"
```

#### `kingly-semantic load`
**Purpose:** Restore session context  
**Variables:** `--handoff`, `--restore-level`  
**Output:** JSON with conversation primer

```bash
kingly-semantic load --handoff="path/to/session.md"
```

### Workflow Commands

#### `/think` → `kingly-semantic power`
Situational analysis with auto-save to drafts/

#### `/all` → `kingly-semantic lookup --all`
Comprehensive intelligence dump with step tracking

#### `/kingly` → Context-relevant workflow selection
Quick workflow selection interface

#### `/exec` → Action mode with chaining
Workflow execution with progress tracking

## BDD Scenarios

```gherkin
Feature: Session Intelligence
  Scenario: Create checkpoint
    Given Claude Code is in active session
    When user triggers checkpoint creation
    Then kingly-semantic saves context with unique ID
    And returns checkpoint path for reference

  Scenario: Handoff preparation  
    Given session has checkpoint history
    When handoff is initiated with file references
    Then comprehensive context package is created
    And next session entry point is defined

  Scenario: Context restoration
    Given handoff package exists
    When load command points to package
    Then conversation context is restored
    And file references are validated
```

## CLAUDE.md Integration

### Auto-Commands
```markdown
## SESSION COMMANDS

### `kingly-semantic ping`
Auto-execute on significant insights/decisions
Save path: `~/.kingly/sessions/YYYY-MM-DD-topic-ID.json`

### `kingly-semantic handoff` 
Execute before session end
Include: file paths, decisions, blockers, next actions

### `kingly-semantic load`
Execute at session start if handoff exists
Restore: context, file state, conversation continuity

## WORKFLOW COMMANDS

### `/think` → `kingly-semantic power <situation>`
### `/all` → `kingly-semantic lookup --all`  
### `/kingly` → Context extraction + workflow selection
### `/exec` → Workflow chaining with progress tracking
```

## Required Variables

**Ping:** context, files, session-type  
**Handoff:** session, files, decisions, blockers  
**Load:** handoff, restore-level  

## Consequences

**Positive:**
- Perfect session continuity across Claude instances
- Cross-project intelligence sharing
- Persistent context and decision history

**Negative:**  
- Storage overhead for session data
- Complexity in context restoration logic

## Implementation Status

✅ **Completed:**
1. Basic ping/handoff/load commands - Implemented in `src/commands/session-ping.js`
2. Session management system - Implemented in `src/session-manager.js`
3. CEO binding integration - Implemented in `src/ceo-binding.js`
4. MCP tool registration - Complete with input schema validation

🔄 **In Progress:**
1. Workflow command integration - Partial implementation
2. Cross-workspace routing - Basic implementation in place

⏳ **Future:**
1. Advanced context analysis - Research phase