# CONTEXT RESTORATION GUIDE
*For any AI taking over a project*

## 🚀 10-MINUTE RESTORATION PROTOCOL

### Step 1: Find the Handoff (2 min)
```bash
# Look for the most recent handoff document
ls -la HANDOFF-*.md | tail -1

# If no handoff exists, look for:
ls -la _2do.md CLAUDE.md README.md
```

### Step 2: Status Verification (3 min)
Before reading ANY other docs:
1. Read the handoff document completely
2. Run the verification command from handoff
3. Check if stated status matches reality

### Step 3: Essential File Reading (4 min)
ONLY read files marked as "KEY FILES" in handoff.
Skip everything else until you understand the current state.

### Step 4: Test Current State (1 min)
Run the test command from handoff to verify what actually works.

## 🚨 ANTI-PATTERN DETECTION

### Context Burn Warning Signs
If you find yourself:
- Reading more than 5 files in first 10 minutes
- Trying to understand the "full architecture"
- Reading old documentation to "get context"
- Assuming things work because code exists

**STOP** - You're repeating the same context burn pattern.

### The Documentation Trap
- Docs describe what SHOULD exist, not what DOES exist
- Old docs are often outdated
- Architecture docs don't tell you current implementation status
- ADRs describe decisions, not current reality

## 🎯 VERIFICATION COMMANDS

### Standard Project Checks
```bash
# Test what actually runs
npm test 2>/dev/null || echo "No tests"
node [main-file].js 2>/dev/null || echo "Doesn't run"

# Check what files were recently modified
find . -name "*.js" -o -name "*.md" | xargs ls -la | sort -k6,7

# See what's actually implemented
grep -r "TODO\|FIXME\|NOT IMPLEMENTED" --include="*.js" .
```

### FlowMind Specific
```bash
# Test MCP server
node server.js &
sleep 2
curl -X POST http://localhost:3333 -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .

# Test core functionality
node -e "const FlowMind = require('./src/flowmind.js'); console.log(new FlowMind({}).type || 'working')"
```

## 📊 STATUS INTERPRETATION

### Reading the Status Indicators
- 🔴 **NOT STARTED** = Don't waste time looking for code
- 🟡 **DESIGNED** = May have specs/docs, no working code
- 🟠 **PARTIALLY BUILT** = Some files exist, expect gaps
- 🟢 **FULLY BUILT** = Code exists, may not work correctly
- ✅ **TESTED** = Unit tests pass, may fail in integration
- ⭐ **PROVEN** = Actually works end-to-end

### What Each Status Really Means
- If not ⭐, assume it doesn't work in real usage
- If not ✅, assume it has bugs
- If not 🟢, assume missing features
- If 🟡 or 🔴, assume you're starting from scratch

## 🔄 CONTINUATION PATTERNS

### If Previous Work Was Theoretical
- Don't try to build on "designs"
- Start with minimal working example
- Test immediately, build incrementally

### If Previous Work Was Partial
- Verify what actually works first
- Identify the exact gap
- Don't refactor until it works

### If Previous Work Was Complete
- Verify it actually works end-to-end
- Run integration tests
- Only then plan improvements

## 📝 HANDOFF CREATION

When ending your session:

1. **Update Status** - What changed from input to output
2. **Document Failures** - What you tried that didn't work
3. **Verify Claims** - Test before claiming something works
4. **Leave Breadcrumbs** - Exact commands to continue your work

### Status Update Rules
- Only mark ✅ if tests actually pass
- Only mark ⭐ if you proved it works end-to-end
- Be honest about partial completion
- Document what you DIDN'T finish

---
**Remember**: Context handoffs should make the next AI MORE productive, not give them false confidence in broken systems.