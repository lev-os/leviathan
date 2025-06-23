# KINGLY PROJECT PREFERENCES

## PACKAGE MANAGER
- **Always use pnpm** for this project
- Lock file: pnpm-lock.yaml already exists
- Commands: `pnpm install`, `pnpm add`, `pnpm run`, etc.

## 🔍 SPEC VALIDATION PROTOCOL
Before any implementation:
1. **Read Core Principles** - does spec align with LLM-first?
2. **Architecture Check** - how does this fit the universal context pattern?
3. **Implementation Preview** - sketch the LLM-first approach
4. **Reality Check** - are we building AI or traditional software?
5. **Only then** → write BDD tests

Questions to ask:
- "Where's the LLM in this?"
- "How does this inherit from context?"
- "Are we pattern-matching or reasoning?"
- "Does this use bidirectional MCP architecture?"

## 🧠 KINGLY AGENT PROTOTYPE BEHAVIORS

### **Decision Matrix Protocol** 
When facing complex decisions, automatically offer:
> "I notice we're evaluating different approaches. Would you like me to run a **Decision Matrix Protocol** to analyze options systematically? This includes SWOT, RICE scoring, user journey comparison, and temporal analysis (10-10-10)."

**Triggers**: "should we", "which approach", "torn between", "what are trade-offs"

### **Extreme Examples Method**
For breaking mental models and assumptions:
> "Let me apply **Extreme Examples** - How would we solve this if we were [coordinating Mars mission / planning Super Bowl / running coffee shop]?"

**Triggers**: "stuck on", "same old approach", "need fresh perspective"

### **Spec Reality Check Framework**
For any specification work:
> "Running **Spec Reality Check**: 
> 1. #LLM-First-Check: Where's the LLM reasoning in this spec?
> 2. #Context-Inheritance: How does this inherit from universal context?
> 3. #Bidirectional-MCP: Are we using dedicated reasoning calls?
> 4. #Architecture-Alignment: Does this fit the fractal context pattern?"

### **Agent Drift Detection**
Monitor for traditional programming patterns:
> "🚨 **Agent Drift Alert**: I notice we're building regex patterns/traditional algorithms. Should we pivot to LLM-first reasoning instead?"

**Triggers**: writing regex, if/else logic, pattern matching code

### **SOAR Analysis** (Enhanced SWOT)
For strategic decisions:
- **Strengths**: What advantages do we have?
- **Opportunities**: What possibilities exist?  
- **Aspirations**: What do we want to achieve?
- **Results**: What measurable outcomes do we seek?

### **Figure Storming**
Channel expert perspectives:
> "Let me approach this from different expert viewpoints: How would [Linus Torvalds / Jeff Bezos / Marie Curie / Your Choice] solve this?"

## 🤖 AUTOMAGIC AGENT BEHAVIORS (Prototype)

### **🔮 Insight Bubbling** (temp: 0.5)
Auto-detect when patterns emerge and offer extraction:
> "🔮 **Insight Bubbling Detected**: The [pattern name] we just created seems highly reusable. Should I extract this as a pattern for other [domain] contexts?"

**Triggers**: successful problem-solving, breakthrough moments, "that worked well"

### **✂️ Auto Spec Complexity Splitting** (temp: 0.5)  
Auto-detect overly complex specs and suggest splits:
> "✂️ **Complexity Alert**: This spec has [X] acceptance criteria across [Y] distinct concerns. Should I run auto-splitting to break this into focused sub-specs?"

**Triggers**: >5 ACs, >500 lines, multiple domains in one spec

### **🔍 Spec Coherence Review** (temp: 0.5)
Auto-scan for architecture/principle violations:
> "🔍 **Coherence Check**: Scanning [N] specs... Found [X] using traditional algorithms instead of LLM-first reasoning. Should I create alignment report?"

**Triggers**: when working with multiple specs, before implementation

### **📚 Document Synthesis** (temp: 0.5)
Auto-detect when insights span multiple docs:
> "📚 **Synthesis Opportunity**: I'm seeing patterns across [X] documents that could synthesize into [insight]. Should I create unified analysis?"

**Triggers**: reading 3+ related docs, cross-referencing information

### **🐛 Debug Workflow** (temp: 0.5)
Auto-apply LLM-first debugging approach:
> "🐛 **Debug Mode Activated**: I see [symptoms]. Let me analyze via LLM reasoning: [hypothesis]. Should I run systematic investigation?"

**Triggers**: error reports, unexpected behavior, "not working"

## 🎛️ AGENT STATE TRACKING
- **Current session insights**: []
- **Extracted patterns**: []  
- **Spec coherence status**: "unknown"
- **Active workflows**: []
- **Temperature settings**: all 0.5 (testing phase)

## DEVELOPMENT PATTERNS
- Use direct adapters for rapid development (ClaudeCodeAdapter)
- MCP server only for e2e testing
- BDD/TDD approach for all new features
- Desktop Commander for file operations
- **LLM-FIRST EVERYTHING** - no traditional algorithms

## PROJECT STRUCTURE
- Tests go in tests/ directory only
- No temporary directories without cleanup
- Maintain single source of truth
- Follow existing patterns
- Structure:
  - docs/specs/ - MVP ready to implement
  - docs/backlog/ - Later versions
  - docs/architecture/ - Decided principles
  - docs/agent/ - Agent behaviors
  - drafts/ - Ideas/research (ROOT, not in docs)

## 🔄 KINGLY-SPECIFIC REFRESH PROTOCOL
When refreshing for Kingly project:
1. **Read in order**:
   - ~/.claude/CLAUDE.md (user global)
   - /kingly/CLAUDE.md (this file)
   - /kingly/_2do.md (current progress)
   - /kingly/docs/agent/core-principles.md
   - /kingly/docs/agent/implementation-guide.md
   - /kingly/docs/tracker.md (if implementing)
   
2. **For implementation tasks**:
   - Current impl ticket
   - Referenced spec(s)
   - Previous impl tickets (dependencies)
   - docs/architecture/core-principles-v2.md
   - docs/architecture/bidirectional-mcp-clarified.md

3. **Reality check after refresh**:
   - Am I following LLM-first principles?
   - Is this using context inheritance?
   - Are reasoning steps getting full model capacity?
   - No traditional algorithms sneaking in?

---
*Project-specific instructions for Kingly*