# KINGLY PROJECT-SPECIFIC ANALYSIS

## 🔍 ACTUAL PACKAGE MANAGER
- **Lock file found**: `/Users/jean-patricksmith/digital/kingly/core/agent/pnpm-lock.yaml`
- **Reality**: This project uses **pnpm**
- **Conflict**: Multiple CLAUDE.md files claim different managers

## 🎯 TRULY PROJECT-SPECIFIC ELEMENTS

### **Architecture Concepts** (Kingly-only)
1. **LLM-First Architecture** - "Can an LLM do this?" validation
2. **Universal Context Pattern** - Context inheritance system
3. **Bidirectional MCP Architecture** - Dedicated reasoning calls
4. **Confidence-based task routing** - 80% threshold
5. **YAML agent definitions** - agents/*.yaml structure

### **Kingly Commands** (Project-specific)
```bash
# From package.json - these are UNIQUE to kingly
npm run test:bdd        # BDD tests
npm run test:unit       # Unit tests  
npm run test:e2e        # E2E tests
npm run dev             # node start-kingly-mcp.js
npm run dev:hot         # Hot reload MCP server
npm run mcp:status      # Check MCP status
npm run mcp:stop        # Stop MCP server
```

### **Architecture Validation Questions** (Kingly-specific)
- "Where's the LLM in this?"
- "How does this inherit from context?"
- "Are we reasoning or pattern-matching?"
- "Does this use bidirectional MCP architecture?"

### **File Structure** (Kingly-specific)
- `docs/specs/` - BDD specifications (MVP ready)
- `docs/backlog/` - Later versions  
- `docs/agent/` - Agent behaviors
- `agents/*.yaml` - Agent definitions
- `workflows/*.yaml` - Workflow definitions
- `contexts/` - Context hierarchy

## 🚫 NOT PROJECT-SPECIFIC (Move to Global)

### **These are generic development patterns**:
- Plan/Verify/Act workflow
- Progress bars
- Follow-up options (1-6)
- Desktop Commander usage rules
- File discipline
- Git workflow
- BDD/TDD approach
- Testing in tests/ directory

### **Agent Behaviors** (Too generic)
- Decision Matrix Protocol
- Extreme Examples Method  
- SOAR Analysis
- Figure Storming
- Auto-splitting behaviors
- Insight bubbling

## 📋 CONSOLIDATION RECOMMENDATION

### **Keep in Kingly CLAUDE.md** (ONLY):
```markdown
# KINGLY PROJECT PREFERENCES

## PACKAGE MANAGER
- **Lock file**: pnpm-lock.yaml (confirmed)
- **Commands**: pnpm install, pnpm add, pnpm run

## ARCHITECTURE VALIDATION
Before any implementation, ask:
1. "Where's the LLM in this?"
2. "How does this inherit from universal context?"
3. "Are we reasoning or pattern-matching?"
4. "Does this use bidirectional MCP architecture?"

## KINGLY-SPECIFIC COMMANDS
npm run test:bdd     # BDD tests with LLM-first validation
npm run dev          # Start kingly MCP system
npm run mcp:status   # Check MCP server status

## PROJECT STRUCTURE
- docs/specs/ - BDD specifications (MVP ready)
- agents/*.yaml - Agent definitions
- contexts/ - Universal context hierarchy
- workflows/ - Workflow definitions

## LLM-FIRST VALIDATION
- No traditional algorithms (regex, if/else chains)
- All reasoning goes through LLM calls
- Context inheritance over hardcoded logic
- Confidence-based task routing at 80%
```

### **Everything else** → Move to global CLAUDE.md

## 🎯 FINAL ANSWER
**What's truly kingly-specific**: ~20% of current content
**What's generic dev patterns**: ~80% of current content

The drift is real - you've been duplicating universal patterns across project files.