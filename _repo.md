# Leviathan Repository Cleanup & Consolidation Plan

**Status**: Repository is incredibly messy - needs systematic cleanup before consolidation  
**Date**: 2025-06-27  
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
   - `/os/docs/` - OS-specific docs
   - `/workshop/adrs/` - Workshop ADRs
   - `/_ref/mcp-ceo/docs/` - External project docs
   - Multiple `tmp/` folders with important docs

4. **Wrong Documentation Location**
   - `agent/docs/documentation-map.csv` exists but should be in root `/docs/`
   - Agent folder should be sparse (it's a package now in monorepo)

5. **No Clear Navigation**
   - No main `/docs/README.md` index
   - No unified documentation map
   - Requires deep knowledge to find anything

---

## 📋 Phase-Based Cleanup Plan

### Phase -1: Repository Structure Cleanup (BEFORE content consolidation)

#### Step 1: Create Master Documentation Map
```csv
# /docs/DOCUMENTATION_MAP.csv
file_path,current_status,action,destination,notes
_01-whisper.md,root_clutter,move,docs/planning/features/whisper.md,Feature spec
_01-prime.md,root_clutter,move,docs/planning/features/prime.md,Constitutional AI spec
_01-codex.md,root_clutter,move,docs/planning/features/codex.md,Knowledge system spec
...
agent/docs/documentation-map.csv,wrong_location,move,docs/DOCUMENTATION_MAP.csv,Consolidate maps
agent/docs/*,wrong_location,move,docs/packages/agent/,Package-specific docs
```

#### Step 2: Create Bucket Directories
```bash
# Create organization buckets
mkdir -p docs/todo           # Active work items
mkdir -p docs/archive        # Completed/outdated items  
mkdir -p docs/planning       # Specs, drafts, future work
mkdir -p docs/packages       # Package-specific documentation
mkdir -p docs/tmp            # Temporary work (to be processed)
```

#### Step 3: Move Everything to Buckets (NO CONTENT CHANGES)
1. **Root `_*.md` files** → `/docs/planning/` or `/docs/todo/`
2. **`/drafts/`** → `/docs/planning/drafts/`
3. **`/agent/docs/`** → `/docs/packages/agent/`
4. **`/os/docs/`** → `/docs/packages/os/`
5. **All `tmp/` folders** → `/docs/tmp/` for review
6. **`_ref/` folder** → `.gitignore` or delete entirely

#### Step 4: Handle External Projects
```bash
# Option 1: Complete removal
echo "_ref/" >> .gitignore
rm -rf _ref/

# Option 2: Extract key concepts first
# - Create /docs/external-references.md listing all references
# - Extract revolutionary concepts to /docs/concepts/
# - Then delete _ref/
```

### Phase 0: Post-Cleanup Organization

After basic cleanup, THEN organize content:

1. **Create Navigation System**
   ```markdown
   # /docs/README.md
   # Leviathan Documentation Hub
   
   ## Quick Start
   - [Getting Started](./quickstart.md)
   - [Architecture Overview](./architecture/README.md)
   
   ## Core Documentation
   - [Planning & Specs](./planning/README.md)
   - [Architecture](./architecture/README.md)
   - [Packages](./packages/README.md)
   
   ## Status
   - [Documentation Map](./DOCUMENTATION_MAP.csv) - All files and their status
   - [TODO Items](./todo/README.md) - Active work
   - [Archive](./archive/README.md) - Historical docs
   ```

2. **Update Documentation Map**
   - Consolidate `agent/docs/documentation-map.csv` → `/docs/DOCUMENTATION_MAP.csv`
   - Add ALL files from audit
   - Track status: `active`, `draft`, `archive`, `external`
   - Track action: `keep`, `move`, `merge`, `delete`

### Phase 1+: Content Consolidation (AFTER cleanup)

Only after repository is clean:
1. Extract concepts from organized locations
2. Merge related documents
3. Create unified architecture docs
4. Build proper package documentation

---

## 🎯 Immediate Actions (Priority Order)

### Today: ✅ PARTIALLY COMPLETE
1. **Create `/docs/DOCUMENTATION_MAP.csv`** ✅ - Master tracking file created
2. **Create `/docs/README.md`** ✅ - Documentation hub created
3. **Move agent/docs/* → /docs/`** 🔴 - Agent should be sparse
4. **Create bucket directories** 🔴 - Organization structure
5. **Start moving root `_*.md` files** 🔴 - Clean visual clutter

### This Week:
1. **Complete Phase -1** - All files in buckets
2. **Delete/gitignore `_ref/`** - Remove external projects
3. **Create `/docs/README.md`** - Navigation hub
4. **Consolidate all `tmp/` folders** - Review and organize

### Next Week:
1. **Begin content consolidation** - With clean structure
2. **Extract revolutionary concepts** - From organized locations
3. **Create package docs** - Proper monorepo structure

---

## 📊 Success Metrics

### Phase -1 Complete When:
- [ ] Zero `_*.md` files in root directory
- [ ] No `/agent/docs/` folder (moved to `/docs/packages/agent/`)
- [ ] No `/os/docs/` folder (moved to `/docs/packages/os/`)
- [ ] `_ref/` folder removed or gitignored
- [ ] All `tmp/` folders consolidated to `/docs/tmp/`
- [ ] Master `/docs/DOCUMENTATION_MAP.csv` created
- [ ] Navigation `/docs/README.md` created

### Repository Clean When:
- [ ] Clear folder structure visible at root
- [ ] All documentation under `/docs/`
- [ ] Package folders contain only code
- [ ] No scattered draft/tmp folders
- [ ] Easy to navigate without deep knowledge

---

## 🔧 Implementation Commands

```bash
# Step 1: Create master map from existing
cp agent/docs/documentation-map.csv docs/DOCUMENTATION_MAP.csv

# Step 2: Create organization structure  
mkdir -p docs/{todo,archive,planning,packages,tmp}
mkdir -p docs/packages/{agent,os,plugins}
mkdir -p docs/planning/{features,drafts,specs}

# Step 3: Move agent docs (agent should be sparse!)
mv agent/docs/* docs/packages/agent/
rmdir agent/docs

# Step 4: Move OS docs
mv os/docs/* docs/packages/os/
rmdir os/docs

# Step 5: Move root clutter
mv _*.md docs/planning/features/

# Step 6: Consolidate drafts
mv drafts/* docs/planning/drafts/
rmdir drafts

# Step 7: Handle external projects
echo "_ref/" >> .gitignore
# OR: extract concepts first, then remove

# Step 8: Create navigation
cat > docs/README.md << 'EOF'
# Leviathan Documentation Hub

## Quick Navigation
- [Documentation Map](./DOCUMENTATION_MAP.csv) - All files and status
- [Architecture](./architecture/README.md) - System design
- [Packages](./packages/README.md) - Monorepo packages
- [Planning](./planning/README.md) - Specs and drafts

## Current Status
See [Documentation Map](./DOCUMENTATION_MAP.csv) for complete file inventory and consolidation status.
EOF
```

---

## 🚫 What NOT to Do

1. **DON'T start content consolidation before cleanup**
2. **DON'T leave docs in package folders** (agent/, os/, etc.)
3. **DON'T keep external projects in _ref/**
4. **DON'T create new files without updating map**
5. **DON'T mix code and documentation**

---

## 📝 Notes

- The existing consolidation plan is good for CONTENT but ignores STRUCTURE
- Agent should be a clean package with minimal files (it's in a monorepo now)
- All documentation should live under `/docs/` for discoverability
- External projects should be dependencies, not included wholesale
- Clean structure first, then organize content

**Bottom Line**: Can't organize content in a messy house. Clean first, then consolidate.