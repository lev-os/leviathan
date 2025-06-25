## Plan: Update Import Paths & Audit Lev Commands

### 1. Update Import Path References (~20 files)
Update all references from `plugins/@lev-os/*` to `packages/*` in:
- **Code files** (3 references):
  - `agent/create-refactor-worktree.js`: Update cmd import
  - `workshop/reports/*.md`: Update example imports

- **Documentation files** (17+ references):
  - `_02-adapters.md`: Update workshop reference
  - `_core.md`: Update all 4 package references
  - `NAMESPACE_MIGRATION_PLAN.md`: Update workshop references
  - `AGENT_MIGRATION_GUIDE.md`: Update testing/cmd references
  - `packages/workshop/src/commands/examples.js`: Update all plugin paths
  - `packages/workshop/src/commands/docs.js`: Update testing/workshop refs
  - `packages/memory/README.md`: Update memory reference
  - `agent/docs/testing/*.md`: Update testing/workshop refs
  - `agent/docs/adr/*.md`: Update workshop reference
  - `drafts/*.md`: Update workshop references
  - `archive/legacy-specs/README.md`: Update cmd references
  - `workshop/reports/*.md`: Update memory/testing/cmd references

### 2. Lev Command Audit Summary
The CLI successfully auto-imports 18 commands from `agent/src/commands/`:
- **Session Management**: session-load, session-ping, session-rollup
- **Intelligence**: intelligence-lookup, intelligence-power, network-intelligence
- **Workflow**: get-workflow, list-workflows, workflow-execute, workflow-select
- **CEO/Agent**: ceo-bind, ceo-status
- **Templates**: template-evolve, template-sync
- **Context**: context-resolve
- **System**: refresh-cache, network-status, workshop

Plus core CLI commands: find, checkpoint, agent, status, ping, help

### 3. Neo4j/Graphiti Setup
The memory package is already configured for Neo4j + Graphiti:
- Default Neo4j URI: `bolt://localhost:7687`
- Graphiti integration is built into `packages/memory/src/memory-manager.js`
- Since you have Neo4j Desktop running, the system should connect automatically
- No additional setup needed - just ensure Neo4j is running on port 7687

### 4. Additional Updates
- Update `package.json` test scripts to use new paths
- Verify all imports resolve correctly after updates
- Run `pnpm install` to validate workspace integrity