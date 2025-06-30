# GIT WORKTREE PARALLEL CLAUDE CODE SETUP

## 🎯 PARALLEL PROCESSING WITH GIT WORKTREES

**STRATEGY:** Create separate git worktrees for each parallel Claude Code instance to avoid conflicts and enable simultaneous work.

## 🚀 SETUP COMMANDS

### Step 1: Initialize Git Worktrees
```bash
# Navigate to project root
cd /Users/jean-patricksmith/digital/kingly

# Create worktrees for each parallel instance
git worktree add ../agency-parallel/brand-analysis hub/agency
git worktree add ../agency-parallel/marketing-analysis hub/agency  
git worktree add ../agency-parallel/ux-analysis hub/agency
git worktree add ../agency-parallel/operations-analysis hub/agency
git worktree add ../agency-parallel/hardware-analysis hub/agency
git worktree add ../agency-parallel/emerging-analysis hub/agency
git worktree add ../agency-parallel/master-synthesis hub/agency
```

### Step 2: Verify Worktree Setup
```bash
# List all worktrees
git worktree list

# Should show:
# /Users/jean-patricksmith/digital/kingly                    [main]
# /Users/jean-patricksmith/digital/agency-parallel/brand-analysis      [hub/agency]
# /Users/jean-patricksmith/digital/agency-parallel/marketing-analysis  [hub/agency]
# ... etc
```

## 📁 DIRECTORY STRUCTURE CREATED

```
/Users/jean-patricksmith/digital/
├── kingly/                           # Original repo
│   └── hub/agency/                   # Current working directory
└── agency-parallel/                  # Parallel worktrees
    ├── brand-analysis/               # Instance 1 workspace
    │   └── hub/agency/
    ├── marketing-analysis/           # Instance 2 workspace  
    │   └── hub/agency/
    ├── ux-analysis/                  # Instance 3 workspace
    │   └── hub/agency/
    ├── operations-analysis/          # Instance 4 workspace
    │   └── hub/agency/
    ├── hardware-analysis/            # Instance 5 workspace
    │   └── hub/agency/
    ├── emerging-analysis/            # Instance 6 workspace
    │   └── hub/agency/
    └── master-synthesis/             # Synthesis workspace
        └── hub/agency/
```

## 🎯 CLAUDE CODE LAUNCH COMMANDS

### Instance 1: Brand Analysis
```bash
# Terminal 1
cd /Users/jean-patricksmith/digital/agency-parallel/brand-analysis/hub/agency
claude-code

# In Claude Code session:
I am the Brand Domain Analysis Specialist working in the brand-analysis worktree. 

TASK: Analyze ALL brand foundation agents and extract workflows, patterns, and templates.

FILES TO ANALYZE:
- assets/phase1-foundation/brand/main-agent-strategy.md
- assets/phase1-foundation/brand/strategist.md  
- assets/phase1-foundation/brand/voice-specialist.md
- assets/phase1-foundation/brand/visual-designer.md
- assets/phase1-foundation/brand/creative-director.md
- assets/phase1-foundation/brand/copywriter.md
- assets/phase1-foundation/brand/content-strategist.md
- assets/phase1-foundation/brand/guidelines-manager.md
- assets/phase1-foundation/brand/mood-curator.md

OUTPUT: Create comprehensive brand domain synthesis in assets/parallel-results/brand-domain-synthesis.md

START ANALYSIS NOW.
```

### Instance 2: Marketing Analysis
```bash
# Terminal 2  
cd /Users/jean-patricksmith/digital/agency-parallel/marketing-analysis/hub/agency
claude-code

# In Claude Code session:
I am the Marketing Domain Analysis Specialist working in the marketing-analysis worktree.

TASK: Analyze ALL marketing foundation agents and extract workflows, patterns, and templates.

FILES TO ANALYZE:
- assets/phase1-foundation/marketing/main-agent-strategy.md
- assets/phase1-foundation/marketing/growth-hacker.md
- assets/phase1-foundation/marketing/performance-marketer.md
- assets/phase1-foundation/marketing/seo-specialist.md
- assets/phase1-foundation/marketing/social-media-manager.md
- assets/phase1-foundation/marketing/email-marketer.md
- assets/phase1-foundation/marketing/conversion-optimizer.md
- assets/phase1-foundation/marketing/pr-specialist.md
- assets/phase1-foundation/marketing/community-manager.md

OUTPUT: Create comprehensive marketing domain synthesis in assets/parallel-results/marketing-domain-synthesis.md

START ANALYSIS NOW.
```

### Instance 3: UX Analysis
```bash
# Terminal 3
cd /Users/jean-patricksmith/digital/agency-parallel/ux-analysis/hub/agency
claude-code

# In Claude Code session:
I am the UX Domain Analysis Specialist working in the ux-analysis worktree.

TASK: Analyze ALL UX foundation agents and extract workflows, patterns, and templates.

FILES TO ANALYZE:
- assets/phase1-foundation/ux/main-agent-strategy.md
- assets/phase1-foundation/ux/user-researcher.md
- assets/phase1-foundation/ux/ux-strategist.md
- assets/phase1-foundation/ux/interaction-designer.md
- assets/phase1-foundation/ux/accessibility-specialist.md
- assets/phase1-foundation/ux/service-designer.md
- assets/phase1-foundation/ux/user-tester.md

OUTPUT: Create comprehensive UX domain synthesis in assets/parallel-results/ux-domain-synthesis.md

START ANALYSIS NOW.
```

### Instance 4: Operations Analysis
```bash
# Terminal 4
cd /Users/jean-patricksmith/digital/agency-parallel/operations-analysis/hub/agency
claude-code

# In Claude Code session:
I am the Operations Domain Analysis Specialist working in the operations-analysis worktree.

TASK: Analyze ALL operations foundation agents and extract workflows, patterns, and templates.

FILES TO ANALYZE:
- assets/phase1-foundation/operations/main-agent-strategy.md
- assets/phase1-foundation/operations/project-coordinator.md
- assets/phase1-foundation/operations/stakeholder-manager.md
- assets/phase1-foundation/operations/compliance-auditor.md
- assets/phase1-foundation/operations/sustainability-consultant.md
- assets/phase1-foundation/operations/regulatory-specialist.md
- assets/phase1-foundation/operations/business-analyst.md

OUTPUT: Create comprehensive operations domain synthesis in assets/parallel-results/operations-domain-synthesis.md

START ANALYSIS NOW.
```

### Instance 5: Hardware Analysis
```bash
# Terminal 5
cd /Users/jean-patricksmith/digital/agency-parallel/hardware-analysis/hub/agency
claude-code

# In Claude Code session:
I am the Hardware Domain Analysis Specialist working in the hardware-analysis worktree.

TASK: Analyze ALL hardware foundation agents and extract workflows, patterns, and templates.

FILES TO ANALYZE:
- assets/phase1-foundation/hardware/main-agent-strategy.md
- assets/phase1-foundation/hardware/industrial-designer.md
- assets/phase1-foundation/hardware/mechanical-engineer.md
- assets/phase1-foundation/hardware/electrical-engineer.md
- assets/phase1-foundation/hardware/firmware-engineer.md
- assets/phase1-foundation/hardware/iot-architect.md
- assets/phase1-foundation/hardware/supply-chain-manager.md

OUTPUT: Create comprehensive hardware domain synthesis in assets/parallel-results/hardware-domain-synthesis.md

START ANALYSIS NOW.
```

### Instance 6: Emerging Tech Analysis
```bash
# Terminal 6
cd /Users/jean-patricksmith/digital/agency-parallel/emerging-analysis/hub/agency
claude-code

# In Claude Code session:
I am the Emerging Tech Domain Analysis Specialist working in the emerging-analysis worktree.

TASK: Analyze ALL emerging technology foundation agents and extract workflows, patterns, and templates.

FILES TO ANALYZE:
- assets/phase1-foundation/emerging/main-agent-strategy.md
- assets/phase1-foundation/emerging/ai-specialist.md
- assets/phase1-foundation/emerging/vr-ar-developer.md
- assets/phase1-foundation/emerging/computer-vision-engineer.md
- assets/phase1-foundation/emerging/voice-interface-designer.md

OUTPUT: Create comprehensive emerging tech domain synthesis in assets/parallel-results/emerging-domain-synthesis.md

START ANALYSIS NOW.
```

## 🎛️ MASTER COORDINATION (Current Instance)

### My Role as Orchestrator:
```bash
# I stay in the original directory
cd /Users/jean-patricksmith/digital/kingly/hub/agency

# Monitor all parallel results
mkdir -p assets/parallel-results

# Coordinate synthesis as results come in
# Aggregate cross-domain patterns
# Create unified implementation architecture
```

## 📊 RESULT SYNCHRONIZATION

### Collecting Parallel Results:
```bash
# Copy results from all worktrees to master
cp ../../../agency-parallel/brand-analysis/hub/agency/assets/parallel-results/brand-domain-synthesis.md assets/parallel-results/
cp ../../../agency-parallel/marketing-analysis/hub/agency/assets/parallel-results/marketing-domain-synthesis.md assets/parallel-results/
cp ../../../agency-parallel/ux-analysis/hub/agency/assets/parallel-results/ux-domain-synthesis.md assets/parallel-results/
cp ../../../agency-parallel/operations-analysis/hub/agency/assets/parallel-results/operations-domain-synthesis.md assets/parallel-results/
cp ../../../agency-parallel/hardware-analysis/hub/agency/assets/parallel-results/hardware-domain-synthesis.md assets/parallel-results/
cp ../../../agency-parallel/emerging-analysis/hub/agency/assets/parallel-results/emerging-domain-synthesis.md assets/parallel-results/
```

## 🚀 EXECUTION SEQUENCE

1. **Setup Phase (5 minutes):**
   ```bash
   cd /Users/jean-patricksmith/digital/kingly
   # Execute worktree setup commands above
   ```

2. **Launch Phase (10 minutes):**
   ```bash
   # Open 6 terminals
   # Navigate to each worktree directory  
   # Launch claude-code in each
   # Paste specialist prompts
   ```

3. **Analysis Phase (45-60 minutes):**
   - Each instance analyzes their domain independently
   - No conflicts due to separate worktrees
   - Master instance coordinates and monitors

4. **Synthesis Phase (30-45 minutes):**
   - Collect all domain synthesis results
   - Cross-domain pattern analysis
   - Unified architecture creation
   - Implementation blueprint generation

## ✅ SUCCESS CRITERIA

**Technical Setup:**
- 6 separate worktrees created successfully
- 6 parallel Claude Code instances running
- No git conflicts or file collisions
- Clean result aggregation process

**Analysis Output:**
- 6 comprehensive domain synthesis reports
- Cross-domain pattern identification
- Unified implementation templates
- Actionable Phase 2 architecture

**Ready to execute parallel processing with git worktrees! 🚀**