# Fresh Agent Migration Guide

## Current Migration Status: Agent & Plugin Restructure Phase

**Context**: We're rebranding from "kingly agent/os" to "leviathan agent/os" using `@lev-os/*` scope while maintaining Kingly Agency sponsorship.

## What's Been Completed ✅

### Directory Structure Changes
- ✅ Created `/plugins/@lev/` directory
- ✅ Moved all `@kingly/*` packages to `/plugins/@lev-os/`:
  - `@kingly/testing` → `/plugins/@lev-os/testing`
  - `@kingly/universal-validation` → `/plugins/@lev-os/validation`
  - `@kingly/protocol` → `/plugins/@lev-os/protocol`
  - `@kingly/cmd` → `/plugins/@lev-os/cmd`
  - `@kingly/debug` → `/plugins/@lev-os/debug`
  - Plus: `ai-core` and `memory`

### Package Updates
- ✅ Updated `/agent/package.json`: `@kingly/mcp-mvp` → `@lev-os/agent`
- ✅ Updated binary names: `kingly-agent-mcp` → `lev-agent-mcp`, `kingly-semantic` → `lev-semantic`
- ✅ Updated root `package.json`: `@kingly/core` → `@lev-os/core`
- ✅ Added workspace config for `plugins/@lev-os/*`
- ✅ Added Kingly Agency sponsorship attribution

## Current Repository Structure

```
/agent/                     # @lev-os/agent (core agent system)
/packages/                  # Infrastructure packages
├── api/
├── auth/
├── db/
├── ui/
└── validators/
/plugins/@lev-os/           # All Leviathan-specific packages
├── testing/
├── validation/
├── cmd/
├── debug/
└── (other packages as needed)
```

## What's Still Needed ⚠️

### High Priority
1. ✅ **Update Plugin Package.json Files**: All `/plugins/@lev-os/*` packages completed
2. ✅ **Update Internal Dependencies**: Package dependencies updated to `@lev-os/*`
3. ✅ **Update Import Statements**: Code updated for `@lev-os/*` imports

### Medium Priority
4. **Binary File Updates**: Need to rename/update `bin/kingly-semantic` → `bin/lev-semantic`
5. **Agent CLAUDE.md**: Update agent instructions with new names
6. **Test & Validate**: Ensure build system works

## Key Files to Check

### For Package References
- ✅ `/plugins/@lev-os/*/package.json` (completed @kingly → @lev-os updates)
- ✅ `/agent/src/**/*.js` (updated for @lev-os imports)

### For Command References  
- `/agent/bin/` (binary files)
- `/agent/CLAUDE.md` (mentions kingly-semantic commands)

## Fresh Agent Quick Start

1. **Check Current Todo**: Use `TodoRead` to see active tasks
2. **Review Tracker**: Read `/tracker.csv` for detailed task status
3. **Focus Area**: Currently working on plugin package rebranding
4. **Migration Rules**:
   - All `@kingly/*` → `@lev-os/*`
   - Binary names: `kingly-*` → `lev-*`  
   - Add "sponsored by Kingly Agency" attribution
   - Maintain `/plugins/` single-folder boundary

## TDD Strategy (Test-Driven Development)

### Current Status After Testing
- ✅ **Agent Works**: `cd agent && CONTEXTS_PATH=./_intake/contexts pnpm run test`
- ✅ **Plugins Working**: Updated to reference `@lev-os/debug`
- ❌ **Workspace Build**: `pnpm -r build` fails due to dependency mismatches

### Critical Path Fix (15 min)
1. ✅ Update all plugin package.json files (@kingly → @lev-os names)
2. ✅ Update plugin dependencies (@kingly/debug → @lev-os/debug)
3. Test: `pnpm install && pnpm -r build`

### Agent Environment Fix
Set contexts path: `CONTEXTS_PATH=./_intake/contexts` for agent testing

### Testing Strategy
After changes, verify:
- `pnpm install` works (workspace dependencies)  
- `pnpm -r build` passes
- Agent test: `cd agent && CONTEXTS_PATH=./_intake/contexts pnpm run test`

## Migration Ignore List
Exclude from processing (see `.migrationignore`):
- `agent/_intake/` (overlays)
- `agent/diffs/` (temp files)
- `apps/` (separate project)

---
*Generated during Leviathan migration - refer to tracker.csv for latest status*