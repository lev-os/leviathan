# Leviathan Repository Cleanup & Consolidation Plan

**Status**: Repository is incredibly messy - needs systematic cleanup before consolidation  
**Date**: 2025-06-29  
**Issue**: Documentation scattered across 15+ locations, root directory cluttered, external projects mixed in  

---

## 🚨 Current State Assessment

### Major Issues Identified:

1. **Root Directory Chaos**
   - 20+ `_*.md` files cluttering the root
   - Should be in organized subdirectories

2. **External Projects Problem**
   - `_ref/` contains 6+ complete external repositories
   - These should be dependencies, NOT included wholesale!

3. **Documentation Scattered Everywhere**
   - `/docs/` - Main docs (partially organized)
   - `/agent/docs/` - Agent-specific docs (should move to root /docs/)
   - `/os/docs/` - OS-specific docs (KEEP IN PLACE)
   - `/workshop/adrs/` - Workshop ADRs
   - `/_ref/mcp-ceo/docs/` - External project docs
   - Multiple `tmp/` folders with important docs

4. **Wrong Documentation Location**
   - `agent/docs/documentation-map.csv` exists but should be in root `/docs/`
   - Agent folder should be sparse (it's a package now in monorepo)

5. **No Clear Navigation**
   - ✅ `/docs/README.md` created - main documentation hub
   - ✅ `/docs/DOCUMENTATION_MAP.csv` created - unified documentation map
   - Still requires cleanup to be easily navigable

---

## 📋 Phase-Based Cleanup Plan

### Phase -1: Safe Repository Structure Cleanup (NO DELETIONS - Move Only)

**Core Principle**: NO `rm` commands - only `mv` to preserve everything

#### Step 1: Create Flat Organization Buckets
```bash
# Create flat structure to avoid deep nesting
mkdir -p docs/{agent,features,drafts,archive,todo,tmp}
mkdir -p _archive/empty-dirs
```

#### Step 2: Move Agent Docs (agent should be sparse!)
```bash
mv agent/docs/* docs/agent/
mv agent/docs _archive/empty-dirs/agent-docs
```

#### Step 3: Organize Root _*.md Files
```bash
# Feature specs
mv _01-whisper.md docs/features/
mv _01-prime.md docs/features/
mv _01-codex.md docs/features/
mv _01-mediaforge.md docs/features/
mv _03-jepa.md docs/features/
mv _04-lev-testing-plugin.md docs/features/
mv _04-os-llm-testing-framework.md docs/features/
mv _05-gemini-integration.md docs/features/
mv _10-itsalivetools.md docs/features/

# Architecture files
mv _02-adapters.md docs/features/
mv _core.md docs/features/
mv _hormones.md docs/features/

# Outdated/completed
mv _02-refactor.md docs/archive/
mv _cleanup.md docs/archive/
mv _cleanup_complete.md docs/archive/
mv _cursor.md docs/archive/
mv _tree.md docs/archive/

# Active work
mv _2do.md docs/todo/
mv _branding.md docs/features/

# Whisper docs
mv whisper-architecture-wizard.md docs/features/
mv whisper-wizard-continuation.md docs/features/

# KEEP IN ROOT: README.md, CLAUDE.md, _repo.md, _desktop.md
```

#### Step 4: Handle External Projects (Extract First, Then Archive)
```bash
mkdir -p docs/archive/external-projects
# Extract key concepts to docs/concepts/ first
# Then move:
mv _ref docs/archive/external-projects/
```

#### Step 5: Consolidate tmp Folders
```bash
mv agent/tmp/* docs/tmp/ 2>/dev/null || true
mv workshop/tmp/* docs/tmp/ 2>/dev/null || true
```

### What Stays Unchanged:
- `os/docs/` - OS-specific location (KEEP AS IS)
- `drafts/` - Already flat and working well
- `workshop/` - Has its own process
- Essential root files: `README.md`, `CLAUDE.md`, `_repo.md`, `_desktop.md`

---

## 🔄 Integration with Consolidation Process

### How Phase -1 Fits Into Existing Consolidation

**Current Consolidation Status:**
- Phase 0: ✅ COMPLETE (infrastructure and inventory)
- Phase 0.5: 5/8 tasks completed (Revolutionary Concept Synthesis)
- Phase 1+: Pending (requires clean structure first)

**Phase -1 Purpose:**
- **Prerequisite** for content consolidation phases
- Creates organized structure WITHOUT changing content
- Enables smooth execution of Phases 0.5 through 6

### Files to Update for Integration:

1. **`docs/consolidation-process.md`**:
   - Add "Phase -1: Repository Structure Cleanup" section
   - Mark as prerequisite for all content work
   - Emphasize move-only, no content changes

2. **`docs/consolidation-tracker.csv`**:
   ```csv
   Phase,Task_ID,Task_Name,Source_Files,Target_Location,Dependencies,Status,Priority,Notes
   -1,P-1T01,Create organization buckets,N/A,docs/{agent,features,etc},None,Pending,CRITICAL,Flat structure
   -1,P-1T02,Move agent/docs to docs/agent,agent/docs/*,docs/agent/,P-1T01,Pending,CRITICAL,Agent should be sparse
   -1,P-1T03,Organize root _*.md files,_*.md files,docs/features/ or archive/,P-1T01,Pending,CRITICAL,Clean root
   -1,P-1T04,Archive external projects,_ref/,docs/archive/external-projects/,P-1T01,Pending,HIGH,Extract concepts first
   -1,P-1T05,Consolidate tmp folders,*/tmp/*,docs/tmp/,P-1T01,Pending,MEDIUM,Review contents
   ```

---

## 🎯 Immediate Actions (Priority Order)

### Phase -1 Execution Plan: ✅ READY TO EXECUTE

1. **Create flat organization buckets** 🔴
   ```bash
   mkdir -p docs/{agent,features,drafts,archive,todo,tmp}
   mkdir -p _archive/empty-dirs
   ```

2. **Move agent/docs → docs/agent/** 🔴
   ```bash
   mv agent/docs/* docs/agent/
   mv agent/docs _archive/empty-dirs/agent-docs
   ```

3. **Organize root _*.md files** 🔴
   - Execute mv commands from Step 3 above
   - Keep: README.md, CLAUDE.md, _repo.md, _desktop.md

4. **Archive external projects** 🔴
   - Extract concepts first
   - Then: `mv _ref docs/archive/external-projects/`

5. **Consolidate tmp folders** 🔴
   - Execute mv commands from Step 5 above

### Today's Status:
- ✅ `/docs/DOCUMENTATION_MAP.csv` created - Master tracking file
- ✅ `/docs/README.md` created - Documentation hub
- ✅ Phase -1 execution COMPLETE

---

## 📊 Success Metrics

### Phase -1 Complete When:
- [x] Only 4 files in root: README.md, CLAUDE.md, _repo.md, _desktop.md
- [x] No `/agent/docs/` folder (moved to `/docs/agent/`)
- [x] `/os/docs/` STAYS IN PLACE (OS-specific)
- [x] `_ref/` moved to archive (after concept extraction)
- [x] All `tmp/` folders consolidated to `/docs/tmp/`
- [x] Flat docs structure: maximum 2 levels deep

### Repository Clean When:
- [x] Clear folder structure visible at root
- [x] Documentation organized under `/docs/`
- [x] Agent folder sparse (code only)
- [x] No scattered files
- [x] Easy navigation

---

## 🔧 Safe Implementation Commands (NO DELETIONS)

```bash
# Phase -1: Execute these commands in order

# Step 1: Create flat structure
mkdir -p docs/{agent,features,drafts,archive,todo,tmp}
mkdir -p _archive/empty-dirs

# Step 2: Move agent docs
mv agent/docs/* docs/agent/
mv agent/docs _archive/empty-dirs/agent-docs

# Step 3: Move feature specs
mv _01-whisper.md docs/features/
mv _01-prime.md docs/features/
mv _01-codex.md docs/features/
mv _01-mediaforge.md docs/features/
mv _03-jepa.md docs/features/
mv _04-lev-testing-plugin.md docs/features/
mv _04-os-llm-testing-framework.md docs/features/
mv _05-gemini-integration.md docs/features/
mv _10-itsalivetools.md docs/features/

# Step 4: Move architecture docs
mv _02-adapters.md docs/features/
mv _core.md docs/features/
mv _hormones.md docs/features/

# Step 5: Archive outdated
mv _02-refactor.md docs/archive/
mv _cleanup.md docs/archive/
mv _cleanup_complete.md docs/archive/
mv _cursor.md docs/archive/
mv _tree.md docs/archive/

# Step 6: Move active work
mv _2do.md docs/todo/
mv _branding.md docs/features/

# Step 7: Move whisper docs
mv whisper-architecture-wizard.md docs/features/
mv whisper-wizard-continuation.md docs/features/

# Step 8: Handle external projects (after extraction)
mkdir -p docs/archive/external-projects
mv _ref docs/archive/external-projects/

# Step 9: Consolidate tmp
mv agent/tmp/* docs/tmp/ 2>/dev/null || true
mv workshop/tmp/* docs/tmp/ 2>/dev/null || true
```

---

## 🚫 What NOT to Do

1. **DON'T use rm or rmdir** - use mv to _archive instead
2. **DON'T move os/docs/** - OS-specific location
3. **DON'T create deep nesting** - keep it flat
4. **DON'T start content changes** - structure first
5. **DON'T move workshop/** - has own process

---

## 📝 Notes

**Revised Plan Based on Feedback:**
- NO deletions - everything preserved via mv
- Flat structure - avoid deep nesting
- os/docs stays in place
- _desktop.md stays in root
- drafts/ already working well

**Bottom Line**: Safe, conservative cleanup preserving everything while creating navigable structure.