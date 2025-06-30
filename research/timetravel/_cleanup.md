# Repository Cleanup Agent Instructions

## 🎯 GOAL: Consolidate 25+ root directories into logical structure

## 🚨 CRITICAL: NEVER TOUCH THESE (WORKING SYSTEM)

- `src/` - Research plan engine (CORE SYSTEM)
- `research-plans/` - YAML configurations (WORKING)
- `specs/` - BDD test scenarios (WORKING)
- `handoff-plans/` - Implementation docs (WORKING)
- `test-arxiv.js` - Working test script
- `package.json` & `package-lock.json` - Dependencies
- `DOGFOODING_STATUS.md` - Status report
- `_trends.md` - Framework document
- `outputs/research/2025-06-28/` - Generated outputs

## 📂 CLEANUP STRATEGY

### 1. Merge Documentation

```bash
# Consolidate all docs into /docs/
docs/ (keep)
├── research-plan-architecture.md (move from root)
├── implementation-plan.md (move from root)
├── _review.md (move from root)
├── ultimate.md (move from root)
├── MASTER-PLAN.md (move from root)
├── CLAUDE.md (move from root)
├── ISSUES.md (move from root)
└── [existing docs structure]
```

### 2. Consolidate Configuration

```bash
# Merge config-related directories
config/ (keep)
├── project.yaml (move from root)
├── context-manifest.yaml (move from root)
├── tsconfig.json (move from root)
└── [existing config files]
```

### 3. Merge Research Directories

```bash
# research/ already exists, consolidate:
research/
├── [existing: horizons/, topics/, weekly-updates/]
├── strategic/ (move from root → research/strategic/)
├── _intake/ (move from root → research/intake/)
└── cache/ (move from root → research/cache/)
```

### 4. Consolidate Project Management

```bash
project/ (keep)
├── [existing content]
├── trending-topics.txt (move from root)
├── execution-log.md (move from root)
└── kingly-sim.sh (move to scripts/ instead)
```

### 5. Clean Up Workflow/Context Files

```bash
# Merge workflow dirs
workflows/ (keep - has research configs)
contexts/ → merge into workflows/contexts/
```

### 6. Preserve but Organize

```bash
# Keep these but ensure they're organized
personalities/ (keep)
marketplace/ (keep)
memory/ (keep)
scripts/ (keep, add kingly-sim.sh here)
```

## 🗑️ SAFE TO DELETE

- `.DS_Store` files
- `dist/` (can be regenerated)
- `node_modules/` (can be regenerated with npm install)
- `.claude/` if empty or redundant

## 📋 FINAL STRUCTURE TARGET

```
timetravel/
├── docs/           # All documentation
├── config/         # All configuration
├── research/       # Research data & planning
├── project/        # Project management
├── workflows/      # Workflow definitions
├── scripts/        # Automation scripts
├── src/            # 🚨 CORE SYSTEM - DON'T TOUCH
├── research-plans/ # 🚨 WORKING CONFIGS - DON'T TOUCH
├── specs/          # 🚨 BDD TESTS - DON'T TOUCH
├── handoff-plans/  # 🚨 IMPLEMENTATION DOCS - DON'T TOUCH
├── outputs/        # Generated outputs
├── personalities/  # AI personalities
├── marketplace/    # Marketplace configs
├── memory/         # Memory system
└── [core files]    # README, package.json, etc.
```

## ⚠️ MOVE STRATEGY

1. **Use `git mv`** for all moves to preserve history
2. **Test after each major consolidation** that working system still functions
3. **Update any relative paths** in configuration files after moves
4. **Commit after each logical grouping** with descriptive messages

## 🧪 VALIDATION

After cleanup, these commands should still work:

```bash
node test-arxiv.js
node src/research-plan-engine.js dry-run research-plans/timetravel-ai-research.yaml
```

**Expected Result**: ~8-10 root directories instead of 25+, with logical grouping and preserved functionality.
