# WRITE Method Session Recovery

## Purpose
This prompt helps recover and continue WRITE Method projects across sessions.

## Instructions for Session Recovery

When starting a new session with the WRITE Method, first check for existing work:

1. **Check Session State**
   ```
   Read: /output/session_state.md
   ```

2. **Review Memory Logs**
   ```
   List: /output/memory/
   Read latest logs for each role
   ```

3. **Present Status to User**

### If Active Project Found:
```
## 📋 WRITE Method - Session Recovery

**Active Project Found:** [Project Name]
**Last Activity:** [Date]
**Current Status:** [X]% Complete

### Progress Summary:
✅ Content Strategy - [Brief summary]
✅ Research - [Brief summary]
⬜ Writing - [Status]
⬜ [Other roles...]

### Last Session:
- **Role**: [Last active role]
- **Completed**: [What was done]
- **Next Steps**: [What's recommended]

**Continue Options:**

1. **Resume Writing** - Pick up where we left off with [specific task]

2. **Review Progress** - See all work completed so far

3. **Change Direction** - Modify strategy or approach

4. **Start Fresh** - Begin a new project

**To select an option, just type the number (1-4)**
```

### If No Active Project:
```
## 📋 WRITE Method - Ready to Start

No active projects found. Let's create something amazing!

**What would you like to write?**

1. **Investment White Paper** - For VCs and investors

2. **Technical Article** - Deep dive on a specific topic

3. **Blog Series** - Multi-part content strategy

4. **Custom Project** - Something else entirely

**To select an option, just type the number (1-4)**
```

## Session State Management

After each role completes their work, update `/output/session_state.md` with:
- Current progress percentage
- Completed tasks
- Next recommended actions
- Key decisions made
- Important data points

This ensures seamless continuity across sessions.