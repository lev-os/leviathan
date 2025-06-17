# CONTEXT HANDOFF TEMPLATE

## 🎯 PROJECT STATUS SNAPSHOT
**Project**: [PROJECT_NAME]
**Last Updated**: [DATE]
**Session Duration**: [TIME]
**Context Burn**: [PERCENTAGE]%

## 🚦 IMPLEMENTATION STATUS
Use ONLY these status indicators:
- 🔴 **NOT STARTED** - Concept only, no code exists
- 🟡 **DESIGNED** - Architecture defined, no implementation
- 🟠 **PARTIALLY BUILT** - Some code exists, not complete
- 🟢 **FULLY BUILT** - Code complete, not tested
- ✅ **TESTED** - Unit tests pass
- ⭐ **PROVEN** - Integration tests pass, real usage verified

## 📍 CURRENT STATE

### What Actually Exists (CODE ON DISK)
```
File: [filename]
Status: [STATUS_INDICATOR]
Purpose: [1-line description]
Dependencies: [what it needs to work]
```

### What Was Accomplished This Session
1. [Specific action taken] - [Result]
2. [Specific action taken] - [Result]
3. [Specific action taken] - [Result]

### Critical Understanding
[2-3 sentences MAX about the core insight/approach that took time to understand]

## ⚠️ ASSUMPTIONS TO AVOID
List false paths that burned context:
- ❌ Don't assume [X] because [Y]
- ❌ Don't try to [X] - already tried, failed because [Y]
- ❌ Don't confuse [X] with [Y]

## 🎬 NEXT STEPS

### Immediate Action (< 5 min)
```bash
# Command to verify current state
[specific command]
```

### Continue Work
1. [Specific next action]
2. [Specific next action]
3. [Specific next action]

### Test Current Implementation
```bash
# Command to test what exists
[specific test command]
```

## 🗂️ KEY FILES
Only list files that next AI MUST read:
- `[filename]` - [why essential]
- `[filename]` - [why essential]

## 🚫 DON'T READ THESE
Files that seem relevant but aren't:
- `[filename]` - [why to skip]
- `[filename]` - [why to skip]

---
**Handoff Protocol**: Save as `HANDOFF-[YYYYMMDD-HHMM].md` in project root