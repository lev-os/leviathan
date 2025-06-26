# Workshop Automation Plan - Final Design

## 🎯 GOAL: Zero-Friction Automated Repository Analysis

### Current State
- **87+ repositories** in intake/ (including nested projects like ai-engineering-hub with 50+ subprojects)
- **Multiple disconnected CSVs** (TRACKER.csv, REPOSITORY_INTAKE_TRACKER.csv, WORKSHOP_TRACKING_FINAL.csv, etc.)
- **Existing analysis scattered** in docs/june-2025-intake/ 
- **packages/workshop/** has automation tools but disconnected
- **/.claude/commands/lev/intake.md** has perfect automation spec

### Updated Structure Design
```
workshop/
├── intake/              # = "not analyzed" (auto-cloned repos)
├── analysis/            # = "analyzed" (generated reports)
│   ├── {repo-name}/     # folder per repo with analysis.md files
│   └── mastra/          # existing analysis to migrate here
├── adrs/                # = Architectural Decision Records (top-level)
├── cache/               # = Smart intake cache (capability matrix)
└── archive/             # = old CSV files + docs/june-2025-intake/
```

## 🔄 COMPLETE 6-STEP AUTOMATION PROCESS

### 1. **Scan Cache**
- Check `cache/leviathan-capability-matrix.yaml` for existing capabilities
- Avoid duplicate analysis of known repos/capabilities

### 2. **Git Clone**
```bash
git clone <repo-url> ~/lev/workshop/intake/<repo-name>
```

### 3. **Scan Actual Lev Paths and Update Cache**
**Core Analysis Paths:**
- `~/lev/docs/` - Documentation, ADRs, consolidation docs
- `~/lev/agent/` - Core agent system, contexts, workflows  
- `~/lev/packages/` - **CORE PACKAGES**: commands, memory, auth, testing, workshop (EXCLUDE: api, db, ui, validators)
- `~/lev/plugins/` - @homie and @lev-os plugin namespaces

**Mini-prompt**: "Analyze repo capabilities against existing lev system. Check docs/, agent/, core packages (commands, memory, auth, testing, workshop), and plugins/ for overlap, gaps, and integration opportunities. Update cache/leviathan-capability-matrix.yaml."

### 4. **Analysis**
- Use lev search commands for deep repository analysis
- Generate `analysis/{repo-name}/analysis.md`

### 5. **Decision** 
- **~/lev/_ref/** = reference code for ADRs/patterns (temporary)
- **~/lev/vendor/** = forked/modified code for direct use
- **Normal pnpm install** = full adoption as dependencies
- **Delete** = not useful, save disk space

### 6. **Create ADRs**
- Save to `adrs/` folder for promotion by parent lev agent/os

### Folder-Based Tracking (No CSV Needed)
- **intake/{repo-name}/** = pending analysis
- **analysis/{repo-name}/** = analysis complete
- **Both exist** = redo analysis, then decide outcome

## 🚀 IMPLEMENTATION TASKS

### Phase 1: Structure Cleanup ✅ COMPLETE
- [x] Create analysis/ folder structure
- [x] Migrate existing analysis from docs/june-2025-intake/ to analysis/{repo-name}/
- [x] Migrate reports/intake-analyses/ to analysis/{repo-name}/ (4 repos: mastra, claude-code-flow, copilotkit, lev-os-migration)
- [x] Archive all old CSV files to archive/
- [ ] Clean up remaining folders to archive/ (keeping adrs/ and cache/)

### Phase 2: Automation Connection
- [x] Created comprehensive intake.md process guide with 6-step workflow
- [x] Enhanced with checkpoints, failure patterns, and post-processing actions
- [ ] Extract simple clone+analyze logic from packages/workshop/intake.js
- [ ] Wire up /.claude/commands/lev/intake.md automation spec to workshop/intake.md
- [ ] Test automation: source → analysis → decision → action → wizard docs
- [ ] Implement decision workflow: EXTRACT(_ref)/ADOPT(pnpm)/FORK(vendor)/MONITOR/PASS

### Phase 3: Batch Processing
- [ ] Process all 87+ repos in intake/ through automation
- [ ] Generate analysis/{repo-name}/ folders for each
- [ ] Make decisions on existing analyzed repos
- [ ] Clean up intake/ folder based on decisions

## 🎯 SUCCESS CRITERIA

### Visual Status Check
- `ls intake/` = TODO list (repos needing analysis)
- `ls analysis/` = DONE list (analysis complete)
- No CSV hunting, instant visual status

### Automation Quality
- /.claude/commands/lev/intake.md spec working end-to-end
- Analysis generation under 5 minutes per repo
- Clear decision criteria and outcomes
- Minimal manual intervention needed

### Future Extensibility
- Ready for news scraper integration (TBD location)
- Scalable to hundreds of repos
- Clean separation of concerns
- Workshop plugin architecture preserved but unused

## 📝 NOTES

- **Workshop plugin**: Leave packages/workshop/ alone for now, focus on workshop/ folder automation
- **News scraping**: Will live elsewhere, workshop/ just handles analysis workflow
- **Teaching others**: Workshop's original purpose on hold, focusing on personal automation first
- **CSV elimination**: Folder structure IS the tracking system

---

**Next Step**: Begin Phase 1 structure cleanup to establish clean foundation for automation.