# MCP-CEO REBUILD PLAN
*Complete Context & Implementation Strategy*

## 🎯 MISSION STATEMENT

**PROBLEM**: Current server.js (1,769 lines) is a broken monolithic architecture that doesn't implement the bidirectional flow concept defined in our ADRs. Tests work on disconnected components while the actual MCP server is non-functional.

**SOLUTION**: Complete rebuild of MCP server following ADR specifications to implement true bidirectional flow with FlowMind contexts.

---

## 📊 CURRENT STATE ANALYSIS

### What We Have Working ✅
- **FlowMind base class** - Universal context interface with 1:1 YAML mapping
- **ContextRegistry** - File loading and context discovery (moved from context-assembler.js)
- **ContextAssembler** - Recipe assembly logic (moved from assembly-rules.js)
- **Test Infrastructure** - 49/75 tests passing (65% success rate)
- **Context Ecosystem** - Rich YAML contexts in contexts/ directory
- **Constitutional Framework** - LLM-first principles documented in CLAUDE.md

### What's Broken ❌
- **server.js** - 1,769-line monolith with hardcoded personalities
- **No MCP Integration** - Tests work, but no actual MCP workflow execution
- **No Bidirectional Flow** - The core FlowMind concept isn't implemented
- **Architecture Misalignment** - Current code doesn't match ADR specifications
- **Google Standards Violation** - Files too large, responsibilities mixed

### Key ADR Requirements Not Met
- **ADR-008**: LLM-first bidirectional control via MCP context switching
- **ADR-002**: Context Assembler as "context chef" for workflow steps  
- **ADR-012**: Simple v0.1.0 scope, no semantic evaluation
- **ADR-011**: Protocol URI design for semantic addressing

---

## 🏗️ TARGET ARCHITECTURE

### Bidirectional Flow Pattern (ADR-008)
```
1. LLM → MCP: "Execute workflow step 1"
2. MCP loads FlowMind context
3. MCP → LLM: "You are {context}. {instructions}"
4. LLM reasons with full power AS that context
5. LLM → MCP: Returns insights
6. MCP loads NEXT context
7. Repeat for emergent intelligence
```

### New MCP Server Structure
```
src/mcp/
├── MCPServer.js           # Clean MCP server (< 200 lines)
├── tools/
│   ├── execute-workflow.js  # Workflow execution tool  
│   ├── list-workflows.js    # Workflow discovery tool
│   └── index.js             # Tool registry
├── session/
│   ├── SessionManager.js    # Session persistence
│   └── index.js
└── index.js               # MCP exports
```

### Google Coding Standards (docs/dev.md)
- **File Size**: Max 50-100 lines per file
- **Single Responsibility**: Each file does ONE thing
- **Colocated Tests**: .test.js next to source files
- **No Circular Dependencies**: Clear module boundaries
- **Constitutional Compliance**: LLM-first principles enforced

---

## 🛡️ SAFEGUARDS & VALIDATION FRAMEWORK

### TDD + Verification at Every Step
**Enhanced Execution Pattern:**
```
Phase X.1: Write failing test first (TDD)
Phase X.2: Implement minimal code to pass test
Phase X.3: Run full test suite validation
Phase X.4: Git commit with descriptive message
Phase X.5: Constitutional compliance check
Phase X.6: Integration validation
```

### Checkpoint System
**Validation Gates:**
- **After each file**: Run tests + constitutional check
- **After each phase**: Full integration test + git commit
- **Before next phase**: Validate all previous functionality intact
- **Rollback trigger**: Any test failure reverts to last good commit

### Git Safety Net
**Auto-commit Strategy:**
```bash
# Conventional commit format
git commit -m "feat: add MCPServer.js - implements ADR-008 bidirectional flow"
git commit -m "test: add execute_workflow integration tests"
git commit -m "refactor: break down monolithic server.js"

# Branch protection
git checkout -b mcp-rebuild-safe
# Work on feature branch, merge when complete
```

### Constitutional Compliance Checking
**FlowMind Validation Commands:**
```bash
# Constitutional framework validation
npm run constitutional    # Check LLM-first principles
npm run no-mocks         # Verify no mock semantic evaluation
npm run yaml-integrity   # Ensure 1:1 YAML mapping preserved
npm run file-size        # Enforce Google standards (50-100 lines)
```

### Rollback Strategy
**Safety Triggers:**
- **Test suite failure** → Auto-rollback to last green commit
- **Constitutional violation** → Manual review required  
- **Import errors** → Immediate fix or rollback
- **Performance regression** → Validation required
- **File size violation** → Refactor or rollback

### Validation Pipeline
```bash
# Full validation before proceeding
npm test                    # All 75 tests must pass
npm run test:integration   # MCP integration must work
npm run constitutional     # FlowMind principles maintained
git status                 # Clean working directory
npm run file-size          # Google standards compliance
```

---

## 📋 PHASE-BY-PHASE EXECUTION PLAN

### Phase 1: Archive and Setup (20 minutes)

**1.1 Git Safety Setup**
```bash
# Create feature branch for safe development
git checkout -b mcp-rebuild-safe
git commit -m "chore: start MCP server rebuild on safe branch"
```

**1.2 Write Archive Test (TDD)**
```javascript
// tests/integration/archive.test.js
describe('Server Archive', () => {
  it('should archive deprecated server.js', () => {
    expect(fs.existsSync('archive/server-deprecated.js')).toBe(true)
    expect(fs.existsSync('server.js')).toBe(false)
  })
})
```

**1.3 Archive Broken Code**
```bash
# Move deprecated server to archive
mv server.js archive/server-deprecated.js
# Validation: npm test (archive test should pass)
git commit -m "refactor: archive 1,769-line monolithic server.js"
```

**1.4 Create MCP Architecture + Tests**
```bash
# Create clean MCP structure
mkdir -p src/mcp/{tools,session}
# Write structure validation tests
# Validation: npm test + npm run file-size
git commit -m "feat: create clean MCP architecture structure"
```

**1.5 Constitutional Compliance Check**
```bash
npm run constitutional  # Validate FlowMind principles maintained
```

### Phase 2: Minimal MCP Server (60 minutes)

**2.1 Write MCPServer Test (TDD)**
```javascript
// src/mcp/MCPServer.test.js
describe('MCPServer', () => {
  it('should initialize with registry and assembler', async () => {
    const server = new MCPServer()
    await server.initialize()
    expect(server.registry).toBeDefined()
    expect(server.assembler).toBeDefined()
  })
})
```

**2.2 Create MCPServer.js (< 100 lines)**
```javascript
/**
 * FlowMind Principle: LLM IS THE RUNTIME
 * This file ORCHESTRATES context switching, enabling LLM reasoning
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { ContextRegistry } from '../registry/ContextRegistry.js'
import { ContextAssembler } from '../assembly/ContextAssembler.js'

export class MCPServer {
  constructor() {
    this.server = new Server({ name: 'mcp-ceo', version: '1.0.0' })
    this.registry = new ContextRegistry()
    this.assembler = new ContextAssembler(this.registry) 
  }

  async initialize() {
    await this.registry.scan()  // Boot-time: compile all contexts
    this.setupTools()
  }
}
```
**Validation**: `npm test && npm run file-size`  
**Commit**: `git commit -m "feat: add MCPServer.js - implements ADR-008 orchestration"`

**2.3 Write execute_workflow Test (TDD)**
```javascript
// src/mcp/tools/execute-workflow.test.js
describe('executeWorkflow', () => {
  it('should load workflow context and assemble step recipe', async () => {
    const result = await executeWorkflow({
      workflowId: 'deep-analysis',
      challenge: 'test challenge',
      step: 1
    })
    expect(result.context).toBeDefined()
    expect(result.next_step).toBe(2)
  })
})
```

**2.4 Build execute_workflow Tool (< 80 lines)**
```javascript
/**
 * FlowMind Principle: BIDIRECTIONAL FLOW
 * This file ENABLES context switching for emergent intelligence
 */
export async function executeWorkflow({ workflowId, challenge, step = 1, sessionId, previousResults }) {
  // Implementation following ADR-002 recipe assembly pattern
}
```
**Validation**: `npm test && npm run constitutional`  
**Commit**: `git commit -m "feat: add execute_workflow tool - enables bidirectional flow"`

**2.5 Build list_workflows Tool + Test (< 50 lines each)**
**2.6 Build SessionManager + Test (< 80 lines each)**
**2.7 Integration Test**
```javascript
// tests/integration/mcp-tools.test.js  
describe('MCP Tools Integration', () => {
  it('should execute complete workflow via MCP tools', async () => {
    // End-to-end test of bidirectional flow
  })
})
```

**2.8 Phase Validation**
```bash
npm test                    # All tests pass
npm run test:integration   # MCP integration works
npm run constitutional     # FlowMind principles maintained
git commit -m "feat: complete Phase 2 - minimal MCP server with tools"
```

### Phase 3: Bidirectional Flow Integration (40 minutes)

**3.1 Write Context Switching Test (TDD)**
```javascript
// tests/integration/context-switching.test.js
describe('Context Switching', () => {
  it('should switch contexts between workflow steps', async () => {
    const step1 = await executeWorkflow('deep-analysis', 'challenge', 1)
    const step2 = await executeWorkflow('deep-analysis', null, 2, step1.results)
    expect(step1.context.agent).not.toBe(step2.context.agent)
    // Verify emergent intelligence through different perspectives
  })
})
```

**3.2 Implement Context Switching (< 60 lines)**
```javascript
/**
 * FlowMind Principle: CONTEXT SWITCHING = INTELLIGENCE
 * Each step loads different context = different LLM perspective
 */
async function switchContext(step, workflow, previousResults) {
  const nextAgent = workflow.steps[step].agent
  const context = await assembler.load(`agent://${nextAgent}`)
  
  // Each step = different LLM perspective = emergent intelligence
  return buildStepPrompt(context, previousResults)
}
```
**Validation**: `npm test && npm run constitutional`  
**Commit**: `git commit -m "feat: implement context switching for emergent intelligence"`

**3.3 Write Protocol URI Test (TDD)**
```javascript
// tests/unit/protocol-uri.test.js
describe('Protocol URI Resolution', () => {
  it('should resolve agent://ceo to CEO context', async () => {
    const context = await registry.getContext('agent://ceo')
    expect(context.type).toBe('agent')
    expect(context.id).toBe('ceo')
  })
})
```

**3.4 Add Protocol URI Resolution (< 80 lines)**
```javascript
/**
 * FlowMind Principle: SEMANTIC ADDRESSING
 * agent://ceo → contexts/agents/ceo/context.yaml
 * workflow://deep-analysis → contexts/workflows/deep-analysis/context.yaml
 */
// Implementation following ADR-011 specification
```
**Validation**: `npm test && npm run yaml-integrity`  
**Commit**: `git commit -m "feat: add protocol URI resolution - enables semantic addressing"`

**3.5 Integration Validation**
```bash
npm test                    # All tests pass
npm run test:integration   # Bidirectional flow works end-to-end
npm run constitutional     # FlowMind principles maintained
git commit -m "feat: complete Phase 3 - bidirectional flow operational"
```

### Phase 4: Test and Validate (40 minutes)

**4.1 Create MCP Integration Tests (TDD)**
```javascript
// tests/integration/mcp-bidirectional-flow.test.js
describe('MCP Bidirectional Flow', () => {
  it('should execute complete workflow with emergent intelligence', async () => {
    // Test actual MCP tool calls
    const step1 = await mcpServer.executeWorkflow('deep-analysis', 'Should we launch?', 1)
    const step2 = await mcpServer.executeWorkflow('deep-analysis', null, 2, step1)
    
    // Verify context switching creates different perspectives
    expect(step1.context.agent).not.toBe(step2.context.agent)
    // Verify emergent intelligence (step2 builds on step1 insights)
    expect(step2.context.previous_insights).toContain(step1.insights)
  })
})
```

**4.2 Fix Remaining 26 Test Failures (TDD Approach)**
```bash
# For each failing test:
# 1. Understand what it expects
# 2. Write failing test for new architecture
# 3. Implement minimal fix
# 4. Validate + commit

npm test --reporter=verbose | grep "FAIL" | head -5
# Fix top 5 failures first, then continue
```
**Validation per fix**: `npm test && git commit -m "fix: resolve test failure X"`

**4.3 End-to-End Workflow Validation**
```javascript
// tests/integration/emergent-intelligence.test.js
describe('Emergent Intelligence Proof', () => {
  it('should demonstrate intelligence through context switching', async () => {
    const challenge = 'Should we launch the product now or wait?'
    
    // Step 1: Analyst perspective
    const analysis = await mcpServer.executeWorkflow('deep-analysis', challenge, 1)
    expect(analysis.perspective).toBe('analytical')
    
    // Step 2: Innovator perspective (with analyst insights)
    const innovation = await mcpServer.executeWorkflow('deep-analysis', null, 2, analysis)
    expect(innovation.perspective).toBe('innovative')
    expect(innovation.builds_on).toContain(analysis.insights)
    
    // Step 3: Guardian perspective (with previous insights)
    const protection = await mcpServer.executeWorkflow('deep-analysis', null, 3, innovation)
    expect(protection.perspective).toBe('protective')
    
    // EMERGENT INTELLIGENCE: Final synthesis is more than sum of parts
    expect(protection.final_recommendation).toInclude('analysis', 'innovation', 'protection')
  })
})
```

**4.4 Constitutional Compliance Final Check**
```bash
npm run constitutional     # All FlowMind principles maintained
npm run no-mocks          # No mock semantic evaluation
npm run yaml-integrity    # YAML 1:1 mapping preserved
npm run file-size          # Google standards (< 100 lines per file)
```

**4.5 Final Integration Validation**
```bash
npm test                    # All 75 tests passing
npm run test:integration   # MCP bidirectional flow works
git status                 # Clean working directory
git commit -m "feat: complete Phase 4 - full validation and emergent intelligence proof"
```

---

## 🎯 SUCCESS CRITERIA

### Technical Validation ✅
- [ ] MCP server starts and responds to tools
- [ ] `list_workflows` returns available workflows from contexts/
- [ ] `execute_workflow` loads FlowMind contexts and executes steps
- [ ] Context switching works (different contexts per step)
- [ ] Session state persists between workflow steps
- [ ] Protocol URIs resolve correctly (`agent://ceo`, `workflow://deep-analysis`)

### Bidirectional Flow Proof ✅
- [ ] LLM calls `execute_workflow` tool with challenge
- [ ] MCP loads workflow context for step 1 using ContextAssembler
- [ ] MCP returns assembled context to LLM for reasoning
- [ ] LLM provides insights and requests next step
- [ ] MCP loads different context for step 2 with previous results
- [ ] Process continues = **EMERGENT INTELLIGENCE ACHIEVED**

### Architecture Validation ✅
- [ ] No files over 100 lines (Google standard compliance)
- [ ] All tests passing (75/75)
- [ ] Clean separation: Registry (loading) + Assembler (recipes) + MCP (orchestration)
- [ ] Constitutional framework maintained (LLM is runtime, no mocks)
- [ ] ADR specifications fully implemented

### Google Coding Standards ✅
- [ ] Single responsibility per file
- [ ] Colocated tests with source
- [ ] Clear module boundaries
- [ ] No circular dependencies
- [ ] Reviewable code quality

---

## 🚨 CRITICAL INSIGHTS

### Why Current server.js Failed
1. **Monolithic Design** - 1,769 lines violating SRP
2. **Hardcoded Personalities** - Should use FlowMind contexts
3. **No True Bidirectional Flow** - Complex logic instead of context switching
4. **Architecture Drift** - Implemented before ADRs were finalized

### FlowMind Constitutional Principles
1. **LLM IS THE RUNTIME** - Not a text generator, the actual execution engine
2. **EVERYTHING IS A CONTEXT** - Single FlowMind class, behavior through data
3. **BIDIRECTIONAL FLOW = INTELLIGENCE** - Context switching creates emergent insights
4. **YAML IS SOURCE OF TRUTH** - 1:1 mapping, no normalization
5. **NEVER MOCK IN CODE** - LLM evaluates, MCP orchestrates

### What Makes This LLM-First
- **No Code Logic** - The LLM does all reasoning
- **Context as Configuration** - FlowMind contexts configure LLM behavior  
- **Intelligence Through Switching** - Each context switch adds perspective
- **MCP as Conductor** - Only orchestrates, doesn't think

---

## 📚 REFERENCE MATERIALS

### Key ADRs
- **ADR-008**: LLM-First Bidirectional Control
- **ADR-002**: Context Assembler Core v2  
- **ADR-012**: Architecture Alignment
- **ADR-011**: Protocol URI Design

### Current Architecture Status
- **ContextRegistry**: ✅ File loading moved from context-assembler.js (436 lines)
- **ContextAssembler**: ✅ Recipe logic moved from assembly-rules.js (177 lines)  
- **FlowMind**: ✅ Universal context interface (712 lines)
- **Test Coverage**: 🟡 49/75 passing (26 failures to fix)

### File Violations (Google Standards)
- **src/flowmind.js**: 712 lines → Needs class-per-folder breakdown
- **server.js**: 1,769 lines → **DEPRECATED**, moving to archive/
- **Multiple test files**: Need colocation with source

---

## 🔄 NEXT STEPS AFTER COMPLETION

### Immediate (Same Session)
1. Validate bidirectional flow works end-to-end
2. Create simple workflow demonstration
3. Update documentation with new architecture

### Short Term (Next Session)
1. Break down flowmind.js into Google-style class-per-folder
2. Fix remaining test failures
3. Add protocol URI alias support

### Medium Term (v0.2.0)
1. Implement FlowSense semantic control language
2. Add confidence-based context handoff
3. Build advanced assembly rules

---

**This plan transforms the broken 1,769-line monolith into a clean, working MCP server that actually implements the bidirectional flow architecture defined in our ADRs. The result will be true emergent intelligence through systematic context switching orchestrated by MCP.**