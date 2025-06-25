# Workshop Automation Plan - Final Design

## 🎯 GOAL: Zero-Friction Automated Repository Analysis

### Current State
- **87+ repositories** in intake/ (including nested projects like ai-engineering-hub with 50+ subprojects)
- **Multiple disconnected CSVs** (TRACKER.csv, REPOSITORY_INTAKE_TRACKER.csv, WORKSHOP_TRACKING_FINAL.csv, etc.)
- **Existing analysis scattered** in docs/june-2025-intake/ 
- **packages/workshop/** has automation tools but disconnected
- **/.claude/commands/lev/intake.md** has perfect automation spec

### Simplified Structure Design
```
workshop/
├── intake/              # = "not analyzed" (auto-cloned repos)
├── analysis/            # = "analyzed" (generated reports)
│   ├── {repo-name}/     # folder per repo with analysis.md files
│   └── mastra/          # existing analysis to migrate here
└── archive/             # old CSV files + docs/june-2025-intake/
```

## 🔄 AUTOMATION WORKFLOW

### Folder-Based Tracking (No CSV Needed)
- **intake/{repo-name}/** = pending analysis
- **analysis/{repo-name}/** = analysis complete
- **Both exist** = redo analysis, then decide: ~/lev/_ref, ~/lev/vendor, or delete

### Analysis Decision Outcomes
- **~/lev/_ref/** = reference code for ADRs/patterns (temporary)
- **~/lev/vendor/** = forked/modified code for direct use
- **Normal pnpm install** = full adoption as dependencies
- **Delete** = not useful, save disk space

## 🚀 IMPLEMENTATION TASKS

### Phase 1: Structure Cleanup ✅ COMPLETE
- [x] Create analysis/ folder structure
- [x] Migrate existing analysis from docs/june-2025-intake/ to analysis/{repo-name}/
- [x] Archive all old CSV files to archive/
- [ ] Flatten nested repos (ai-engineering-hub subprojects, agent-bundles, etc.)

### Phase 2: Automation Connection
- [ ] Extract simple clone+analyze logic from packages/workshop/intake.js
- [ ] Wire up /.claude/commands/lev/intake.md automation spec to workshop/ folder
- [ ] Test automation: clone repo → generate analysis → save to analysis/{repo-name}/
- [ ] Implement decision workflow: analysis → _ref/vendor/delete

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