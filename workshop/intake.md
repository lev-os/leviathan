# Workshop Repository Intake Process - MANDATORY 6-STEP SEQUENTIAL EXECUTION

⚠️ **CRITICAL**: You MUST complete ALL 6 steps IN ORDER. No skipping allowed.
⚠️ **FAILURE WARNING**: Previous agents failed by skipping Step 3 (Lev system scan).

## Working Memory Template (Copy this and fill out as you go):
```yaml
intake_progress:
  repository: "[name]"
  step_1_completed: false
  step_1_findings: ""
  step_2_completed: false
  step_2_location: ""
  step_3_completed: false  # ⚠️ MOST CRITICAL STEP
  step_3_findings: 
    memory_system: ""
    agent_capabilities: ""
    gaps_verified: ""
  step_4_completed: false
  step_5_completed: false
  step_6_completed: false
```

## 🤝 INTERACTIVE MODE DETECTION

<mode_selection>
IF working with human in real-time: Use Interactive Mode
IF autonomous execution: Use Standard Mode  
</mode_selection>

### Interactive Mode Requirements:
- Share findings after each step before proceeding
- Ask for guidance on ambiguous decisions  
- Confirm cleanup actions before execution
- Never auto-delete without explicit permission

### Interactive Mode Checkpoints:
- **After Step 1**: "Found [X] in cache. Should I proceed with acquisition?"
- **After Step 2**: "Content saved to [location]. Structure verified. Ready for Lev scan?"
- **After Step 3**: "Lev capabilities: [findings]. Which areas need deeper investigation?"
- **Before Step 5**: "I recommend [DECISION] because [REASONING]. Your thoughts?"
- **Before Step 6**: "Documentation path: ADR via wizard experience OR POC first?"

## ❌ FAILURE PATTERNS (What NOT to do):
1. **Skipping Step 3**: "I'll just assume what Leviathan has" → WRONG
2. **Assuming gaps**: "Leviathan probably doesn't have X" → WRONG
3. **Surface analysis**: "The README says it does memory" → INSUFFICIENT
4. **Speed over accuracy**: "I'll do a quick scan" → WRONG

## ✅ SUCCESS PATTERNS (What TO do):
1. **Complete Step 3**: Actually read ~/lev/packages/memory/ code
2. **Evidence-based gaps**: "I checked memory/ and it lacks X" → CORRECT
3. **Deep code analysis**: "The implementation in src/ shows Y" → CORRECT
4. **Thorough comparison**: "Lev has A,B,C but this adds D,E" → CORRECT## 📋 STEP 1: Scan Cache
**⚠️ STOP**: Do not proceed until you have:
- [ ] Loaded cache/leviathan-capability-matrix.yaml
- [ ] Listed all "current best-in-class" solutions
- [ ] Noted comparison baselines for this repo type

**Checkpoint 1**: Document findings in working memory before proceeding.

## 📋 STEP 2: Source Acquisition / Verification
**⚠️ STOP**: Do not proceed until you have:
- [ ] Located source in ~/lev/workshop/intake/[name]/
  - GitHub: Cloned repository
  - Other: Pre-saved content ([name]/transcript.md, [name]/article.md, etc.)
- [ ] Verified with `ls ~/lev/workshop/intake/[name]/`
- [ ] For large repos (20+ components): Documented sampling strategy

**Checkpoint 2**: Source location confirmed in working memory.

## 📋 STEP 3: Scan Actual Lev Paths ⚠️ CRITICAL - DO NOT SKIP
**⚠️ STOP**: This is the MOST SKIPPED and MOST IMPORTANT step!

**MANDATORY SCANS**:
```bash
# 1. Memory System - What do we ACTUALLY have?
ls ~/lev/packages/memory/
cat ~/lev/packages/memory/README.md
# Check actual implementation files

# 2. Agent System - What are our ACTUAL capabilities?
ls ~/lev/agent/src/
cat ~/lev/agent/src/commands/
# Check our 18 MCP tools

# 3. Plugins - What patterns exist?
ls ~/lev/plugins/
```

**⚠️ DO NOT ASSUME**: Read the actual code to understand capabilities!

**Checkpoint 3**: Document ACTUAL findings with file references.## 📋 STEP 4: Comprehensive Evaluation
**⚠️ STOP**: Do not proceed until you have:
- [ ] Compared against ACTUAL Lev capabilities from Step 3
- [ ] Identified VERIFIED gaps (not assumed)
- [ ] Created comparison matrix
- [ ] For large repos: Analyzed 3-5 representative examples

**Checkpoint 4**: Complete analysis with evidence-based comparisons.

## 📋 STEP 5: Decision Implementation & Post-Processing
**⚠️ STOP**: Do not proceed until you have:
- [ ] Made decision: EXTRACT/ADOPT/FORK/MONITOR/PASS
- [ ] Executed the corresponding action:

**Decision → Action Checklist**:
- [ ] **EXTRACT PATTERNS**: `mv ~/lev/workshop/intake/[name] ~/lev/_ref/`
- [ ] **ADOPT DEPENDENCY**: Install with pnpm, then `rm -rf ~/lev/workshop/intake/[name]`
- [ ] **FORK/MODIFY**: `mv ~/lev/workshop/intake/[name] ~/lev/vendor/` (or ~/lev/os/vendor/)
- [ ] **MONITOR**: `rm -rf ~/lev/workshop/intake/[name]` (keep analysis only)
- [ ] **PASS**: `rm -rf ~/lev/workshop/intake/[name]` (not useful)

**Checkpoint 5**: Post-processing action completed.

## 📋 STEP 6: Documentation & POC Decision
**⚠️ STOP**: Choose your documentation/implementation path:

**Decision Matrix**:
- [ ] **POC NEEDED**: For exploring integration before commitment
  - Read POC guide: `~/lev/workshop/pocs/README.md`
  - Create POC directory: `~/lev/workshop/pocs/[name]/`
  - Follow POC lifecycle (Planning → Implementation → Validation)
  
- [ ] **ADR NEEDED**: For architectural decisions (EXTRACT/ADOPT/FORK)
  - Load wizard workflow from `~/lev/docs/workflows/wizard-experience/`
  - Create ADR: `~/lev/workshop/adrs/ADR-XXX-[title].md`
  
- [ ] **DIRECT ACTION**: For simple adoptions
  - Move to `_ref/` for reference
  - Install with pnpm for dependency
  - No additional documentation needed

- [ ] **COMBINATION**: POC first, then ADR after validation
  - Start with POC to test
  - Create ADR based on POC findings

**Checkpoint 6**: Documentation/POC path chosen and initiated.## 🧠 SPECIAL FOCUS: Memory System Analysis

When analyzing memory-related repos, you MUST:

1. **Check Existing Memory Implementation**:
```bash
# What memory types do we support?
cat ~/lev/packages/memory/src/types.ts

# What backends are implemented?
ls ~/lev/packages/memory/src/backends/

# What's our memory architecture?
cat ~/lev/packages/memory/docs/architecture.md
```

2. **Document Current Capabilities**:
- [ ] Memory types supported: (procedural, semantic, episodic, working, temporal)
- [ ] Backends implemented: (file, graphiti, vector stores)
- [ ] Integration patterns: (how agents use memory)

3. **Only Then Compare**: 
- What does the new repo add that we DON'T have?
- Could this enhance our existing system?
- Is this a replacement or integration opportunity?## 📦 Large Repository Strategy (20+ components)

**DO NOT**: Try to analyze all 50+ agents individually
**DO**: Strategic sampling approach

1. **Identify Core Architecture** (required):
   - Main entry points
   - Shared libraries/utilities
   - Configuration patterns

2. **Select 3-5 Representatives**:
   - Most starred/popular components
   - Unique pattern examples
   - Different categories/types

3. **Document Sampling Decision**:
   ```yaml
   large_repo_analysis:
     total_components: 50
     analyzed_samples:
       - name: "mcp-agent-army"
         reason: "Multi-agent orchestration pattern"
       - name: "simple-mcp-agent" 
         reason: "Baseline implementation"
       - name: "pydantic-ai-series"
         reason: "Modern framework patterns"
   ```## ✅ FINAL VERIFICATION

Before submitting analysis, confirm:
- [ ] All 6 steps completed sequentially
- [ ] Step 3 (Lev scan) has specific file references
- [ ] No assumptions - only evidence-based findings
- [ ] Comparison includes what Lev ACTUALLY has
- [ ] Working memory template fully completed
- [ ] Analysis saved to ~/lev/workshop/analysis/[repo]/

⚠️ **REMINDER**: The goal is ACCURATE COMPARISON, not speed!

## 📊 Analysis Output Format

Save your analysis to `~/lev/workshop/analysis/[repo-name]/analysis.md` with this structure:

```markdown
# 🧠 LLM-FIRST REPOSITORY ANALYSIS DASHBOARD

📦 **REPOSITORY**: [Name]  
🔗 **URL**: [Repository URL]  
📁 **Local**: ~/lev/workshop/intake/[repo-name]  
📊 **Analysis**: ~/lev/workshop/analysis/[repo-name]/analysis.md  
⏰ **Analysis**: [Timestamp]

## Working Memory Record
[Paste your completed working memory YAML here]

## 🎯 PROJECT OVERVIEW
**Type**: [Framework/Tool/Application]
**Technology**: [Tech Stack]
**Purpose**: [Core functionality and value proposition]
**Size**: [Codebase metrics]
**Activity**: [Development activity and community]

## 📊 STRATEGIC ASSESSMENT
**Strategic Value**: [MAXIMUM/HIGH/MEDIUM/LOW] - [Reasoning]
**LLM-First Alignment**: [Score]/10 - [Assessment]
**Constitutional Compliance**: [✅/⚠️/❌] per principle

## 🔍 COMPARISON TO EXISTING SOLUTIONS
### Current Best-in-Class: [Name]
**What [New Repo] Does Better**:
- [Specific improvements with evidence]

**What [Current] Does Better**:
- [Advantages we'd lose by switching]

**Integration Opportunities**:
- [Ways to combine best of both]

## 🔗 INTEGRATION OPPORTUNITIES
• [Specific integration points with Leviathan ecosystem]
• [Enhancement opportunities for existing plugins]
• [New capability additions - VERIFIED not assumed]

## ⚡ QUICK DECISION
**Decision**: [REPLACE/INTEGRATE/MONITOR/REFERENCE/PASS]
**Reasoning**: [Strategic justification based on evidence]
**Timeline**: [Implementation timeline if applicable]
**Next Steps**: [Specific recommended actions]

---
**STATUS**: [Tier Classification] - [Strategic Decision]
```## 📋 STEP 7: Final Implementation
**⚠️ STOP**: Complete your chosen path:

### If POC Path:
- [ ] Created POC structure per `~/lev/workshop/pocs/README.md`
- [ ] Documented hypothesis and approach in POC README
- [ ] Built minimal viable integration
- [ ] Validated against success criteria
- [ ] Created ADR based on findings (if successful)

### If Direct Path:
- [ ] Executed decision from Step 5
- [ ] Created ADR if warranted
- [ ] Updated capability matrix if new patterns discovered

### Cleanup Checklist:
- [ ] Source removed from intake/ (unless needed for POC)
- [ ] Analysis saved in analysis/[name]/
- [ ] Documentation/POC created as decided
- [ ] Capability matrix updated if needed

**Checkpoint 7**: All implementation steps completed.

## 📊 Complete Flow Summary
```
intake/[name]/ → analysis/[name]/ → decision → action
                                                  ↓
                    ┌─────────┬────────┬────────┬─┴──────┬────────┐
                    ↓         ↓        ↓        ↓        ↓        ↓
                 _ref/    vendor/    pnpm    monitor   pass    POC?
                                   install  (delete) (delete)    ↓
                                                              ADR?
```