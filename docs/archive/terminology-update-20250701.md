# Terminology Update Summary

## Date: 2025-07-01

### Overview
Updated documentation to align with correct Leviathan branding and terminology. The confusion arose from outdated documentation that mixed references between Kingly (the sponsor) and Leviathan (the framework).

### Correct Terminology
- **Leviathan** - The AI-native operating system and framework
- **@lev-os/** - The npm namespace for Leviathan packages
- **lev** - The CLI command (not "kingly")
- **Kingly Agency** - The sponsor/company behind Leviathan

### Files Updated

#### 1. Job System Documentation
- **File**: `docs/agent/features/job-system.md`
- **Changes**: 
  - "Kingly job system" → "Leviathan job system"
  - All CLI examples: `kingly job` → `lev job`
  - Variable names: `kinglyJob` → `leviathanJob`

#### 2. Current Status
- **File**: `docs/agent/current-status.md`
- **Changes**:
  - "The Kingly system" → "The Leviathan system"
  - CLI example: `kingly job` → `lev job`

#### 3. Agent README
- **File**: `docs/agent/README.md`
- **Changes**:
  - All CLI commands updated: `kingly` → `lev`
  - Directory reference: `.kingly/` → `.leviathan/`

#### 4. E2E Testing Documentation
- **File**: `docs/agent/testing/e2e-claude-code.md`
- **Changes**:
  - "test Kingly system E2E workflows" → "test Leviathan system E2E workflows"

#### 5. ADR Documentation
- **File**: `docs/adr/core-packages-integration.md`
- **Changes**:
  - Title and references: "Kingly System" → "Leviathan System"
  - Package names: `@kingly/*` → `@lev-os/*`
  - Path: `/digital/kingly/core/agent` → `/digital/leviathan/agent`

#### 6. Integration Guide
- **File**: `docs/integration-guide.md`
- **Changes**:
  - All package references: `@kingly/*` → `@lev-os/*`
  - System references: "Kingly agent system" → "Leviathan agent system"

#### 7. Codex Plugin Specification
- **Old File**: `docs/specs/kingly/codex-plugin.md`
- **New File**: `docs/specs/leviathan/codex-plugin.md`
- **Changes**:
  - Moved file to new directory
  - Package name: `@kingly/codex` → `@lev-os/codex`

#### 8. Architecture Documentation
- **File**: `docs/agent/architecture/hybrid-command-architecture.md`
- **Changes**:
  - "Kingly Command Reference" → "Leviathan Command Reference"

### Directories Updated
- Removed empty directory: `docs/specs/kingly/`
- Created new directory: `docs/specs/leviathan/`

### Archive Files (Not Updated)
Several archived documents contain outdated references but were not updated as they are historical records:
- `docs/agent/archive/roadmap-outdated.md`
- `docs/agent/archive/drafts/coo.md`
- Various files in `docs/agent/archive/features/done/`

### Recommendation
Future documentation should consistently use:
- **Leviathan** when referring to the framework/OS
- **@lev-os/** for npm packages
- **lev** for CLI commands
- **Kingly Agency** only when referring to the sponsoring organization