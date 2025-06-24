# 🔧 WORKSHOP STRUCTURE CLEANUP & PROCESS ENFORCEMENT PLAN

## 🔍 CURRENT ISSUES IDENTIFIED

### 1. **Scattered Repository Structure**
The workshop has repos split across multiple directories instead of consolidated in `intake/`:
- `accelerators/` - Contains AIOS, agent-cli, agent-mcp, claude-task-master
- `essentials/` - Contains 1Panel, DevDocs, Upsonic, activepieces, etc.
- `evaluation/` - Contains Cerebrum, bluelabel-autopilot, kingly-os, nextlevel
- `foundations/` - Contains AgenticMemory, graphiti, mem0, ultimate_mcp_server
- `intake/` - Contains many repos BUT also our analysis .md files (wrong!)

### 2. **Documentation Pollution**
We saved 4 analysis .md files directly in `intake/`:
- mastra-complete-repository-analysis.md
- mastra-ecosystem-research.md
- mastra-package-architecture-analysis.md
- lev-os-package-migration-guide.md

### 3. **Process Not Followed**
The `/lev/intake` command clearly states:
```bash
git clone <repository_url> ~/lev/workshop/intake/<repo_name>
```
But the output format doesn't specify WHERE to save the analysis.

## 🎯 PROPOSED SOLUTION

### 1. **Consolidate All Repositories**
Move all repos to `intake/` as the single source for raw cloned repositories:
```bash
# Move accelerators
mv ~/lev/workshop/accelerators/* ~/lev/workshop/intake/
rmdir ~/lev/workshop/accelerators

# Move essentials
mv ~/lev/workshop/essentials/* ~/lev/workshop/intake/
rmdir ~/lev/workshop/essentials

# Move evaluation
mv ~/lev/workshop/evaluation/* ~/lev/workshop/intake/
rmdir ~/lev/workshop/evaluation

# Move foundations
mv ~/lev/workshop/foundations/* ~/lev/workshop/intake/
rmdir ~/lev/workshop/foundations
```

### 2. **Create Proper Reports Structure**
Create dedicated directories for analysis outputs:
```bash
# Create report directories
mkdir -p ~/lev/workshop/reports/intake-analyses
mkdir -p ~/lev/workshop/reports/strategic-recommendations
mkdir -p ~/lev/workshop/reports/architecture-studies
mkdir -p ~/lev/workshop/reports/tier-classifications

# Move existing analysis files
mv ~/lev/workshop/intake/mastra-*.md ~/lev/workshop/reports/intake-analyses/
mv ~/lev/workshop/intake/lev-os-*.md ~/lev/workshop/reports/architecture-studies/
```

### 3. **Update Intake Command**
Enhance `/lev/intake` command to explicitly save outputs in correct location:
```markdown
## OUTPUT LOCATION
Analysis reports are automatically saved to:
`~/lev/workshop/reports/intake-analyses/[repo-name]-analysis-[timestamp].md`

DO NOT save analysis files in the intake/ directory!
```

### 4. **Create Intake Directory Documentation**
Create `~/lev/workshop/intake/README.md`:
```markdown
# ⚠️ TEMPORARY INTAKE DIRECTORY - CLONED REPOS ONLY

This directory is for **CLONED REPOSITORIES ONLY** and is cleaned regularly.

## ❌ DO NOT SAVE HERE:
- Analysis reports (.md files)
- Strategic recommendations
- Architecture studies
- Any documentation you create

## ✅ ANALYSIS OUTPUTS GO TO:
- `../reports/intake-analyses/` - Repository analysis documents
- `../reports/strategic-recommendations/` - Strategic recommendations
- `../reports/architecture-studies/` - Architecture research
- `../reports/tier-classifications/` - Tier assignment reports

## 🧹 CLEANUP POLICY
This directory is automatically cleaned of:
- Repositories older than 30 days
- Any .md files (moved to reports/)
- Failed clones or partial downloads

Remember: This is a WORKSPACE, not a storage location!
```

### 5. **Update TRACKER.csv**
Add a column for report location:
```csv
...,Report_Location
...,reports/intake-analyses/mastra-analysis-20250623.md
```

### 6. **Create Automated Cleanup Script**
Create `~/lev/workshop/scripts/cleanup-intake.sh`:
```bash
#!/bin/bash
# Cleanup intake directory

# Move any .md files to reports
find ~/lev/workshop/intake -name "*.md" -not -path "*/node_modules/*" \
  -not -name "README.md" -exec mv {} ~/lev/workshop/reports/intake-analyses/ \;

# Remove old repos (30+ days)
find ~/lev/workshop/intake -maxdepth 1 -type d -mtime +30 \
  -not -name "intake" -exec rm -rf {} \;

echo "Intake cleanup complete!"
```

## 📋 IMPLEMENTATION STEPS

### Phase 1: Immediate Cleanup (10 minutes)
1. Move analysis .md files to reports directory
2. Create reports directory structure
3. Add README.md to intake directory

### Phase 2: Repository Consolidation (30 minutes)
1. Move all repos from accelerators/ to intake/
2. Move all repos from essentials/ to intake/
3. Move all repos from evaluation/ to intake/
4. Move all repos from foundations/ to intake/
5. Remove empty directories

### Phase 3: Process Documentation (20 minutes)
1. Update /lev/intake command with output location
2. Create intake/README.md with warnings
3. Update PLANS-AND-TRACKERS-README.md
4. Create cleanup script

### Phase 4: Tracking Updates (10 minutes)
1. Update TRACKER.csv with report locations
2. Add new repos to tracking system
3. Update workshop master plan

## 🚀 PREVENTION MEASURES

1. **Clear Command Output**: /lev/intake command explicitly states output location
2. **Directory Warnings**: README.md in intake/ with big warnings
3. **Automated Cleanup**: Script to move misplaced files
4. **Process Documentation**: Clear guidelines in multiple locations
5. **Tracking Integration**: TRACKER.csv includes report locations

## ✅ SUCCESS CRITERIA

- All repos consolidated in single intake/ directory
- No analysis files saved in intake/
- Clear documentation preventing future issues
- Automated cleanup preventing accumulation
- Tracking system includes report locations

This plan ensures the workshop follows its intended architecture with intake/ as a temporary workspace and all analysis outputs properly organized in the reports/ structure.