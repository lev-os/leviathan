# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workshop Overview

The **Leviathan Workshop** is a research, evaluation, and development accelerator containing **74+ AI repositories** organized into a systematic intake and analysis process. It serves as the intelligence gathering arm of the Leviathan ecosystem, implementing a comprehensive tool evaluation pipeline with semantic tier classification.

## Core Architecture

### Workshop Philosophy
- **AI-Native Intelligence Gathering** - LLM-first approach to repository analysis and evaluation
- **Systematic Intake Process** - Standardized workflows for repository evaluation and integration
- **Semantic Tier Classification** - 8-tier system from PRODUCTION-READY to EXPLORATORY
- **Research-to-Production Pipeline** - Clear pathways from experimental code to production integration

### Directory Structure
```
workshop/
├── intake/              # Raw cloned repositories (74+ projects)
├── reports/             # Analysis outputs and documentation
│   ├── intake-analyses/         # Repository analysis documents
│   ├── architecture-studies/    # Technical architecture research
│   ├── strategic-recommendations/ # Integration strategies
│   └── tier-classifications/    # Detailed tier assignments
├── docs/                # Workshop documentation and guides
├── drafts/              # Work-in-progress analysis and research
├── mcp-ecosystem/       # MCP-specific tools and servers
├── reference/           # External reference materials
└── TRACKER.csv          # Central evaluation progress tracking
```

## Development Workflow

### Core Commands

**Workshop Intelligence Commands**:
```bash
# View repository catalog
cat REPOSITORY-LISTING.md

# Check evaluation progress
open TRACKER.csv

# Review master strategy
open WORKSHOP-INTELLIGENCE-MASTER-PLAN.md

# Access intake status
cat INTAKE-STATUS.md
```

**Research Commands**:
```bash
# Find repositories by tier
grep "PRODUCTION-READY" TRACKER.csv
grep "EMERGING-VIABLE" TRACKER.csv

# Locate analysis reports
find reports/intake-analyses/ -name "*.md" -type f

# Check integration recommendations
ls reports/strategic-recommendations/
```

### Repository Intake Process

**Standard Intake Workflow**:
1. **Clone to intake/**: `git clone <repo> intake/<repo-name>`
2. **Analyze architecture**: Create analysis report in `reports/intake-analyses/`
3. **Assign tier classification**: Update TRACKER.csv with semantic tier
4. **Integration assessment**: Document in `reports/strategic-recommendations/`
5. **Track progress**: Update IMPLEMENTATION-TRACKER.csv

**Intake Directory Policy**:
- `intake/` contains **ONLY cloned repositories**
- Never save analysis .md files in `intake/`
- All analysis outputs go to `reports/` subdirectories
- Regular cleanup removes old repositories and misplaced files

## Semantic Tier Classification System

### Production Tiers (Immediate Integration)
- **Tier 1 (PRODUCTION-READY)**: Battle-tested, 1-2 week integration
- **Tier 2 (ADVANCED-STABLE)**: Proven architecture, 2-4 week adaptation

### Development Tiers (Structured Integration)
- **Tier 3 (EMERGING-VIABLE)**: Solid foundation, 3-6 week implementation
- **Tier 4 (RESEARCH-READY)**: Proof-of-concept, 4-8 week development

### Research Tiers (Experimental Only)
- **Tier 5 (EXPERIMENTAL-PROMISING)**: Novel approach, 6-12 weeks
- **Tier 6 (PROTOTYPE-STAGE)**: Working demos, 8-16 weeks
- **Tier 7 (CONCEPT-PROOF)**: Academic implementation, 12+ weeks
- **Tier 8 (EXPLORATORY)**: Early experiments, research only

## High-Priority Integration Targets

### Tier 1 (PRODUCTION-READY)
- **Ultimate MCP Server**: 70+ integrated tools in comprehensive server
- **claude-task-master**: Production task orchestration system
- **agent-cli**: Command-line agent interface

### Tier 2 (ADVANCED-STABLE)
- **mastra**: TypeScript AI framework with rich ecosystem
- **graphiti**: Temporal knowledge graphs for persistent memory
- **AutoGPT**: Autonomous agent system with proven architecture

### MCP Ecosystem
- **mcp-memory**: Unified memory interface for agents
- **mcp-graphiti**: Graph-based knowledge management
- **playwright-mcp**: Browser automation via MCP protocol

## Testing Strategy

### Workshop-Specific Testing
```bash
# Validate repository analysis
python scripts/validate-intake-analysis.py

# Check tier classification consistency
python scripts/validate-tier-assignments.py

# Verify reporting structure
bash scripts/check-report-structure.sh
```

### Integration Testing
- **Repository cloning**: Automated validation of git clone operations
- **Analysis pipeline**: Standardized evaluation workflow testing
- **Tier assignment**: Consistency checking across classification criteria
- **Report generation**: Template validation and output verification

## Tracking and Documentation

### Primary Tracking Files
- **TRACKER.csv**: Central evaluation progress with tier assignments
- **REPOSITORY_INTAKE_TRACKER.csv**: External repository intake status
- **IMPLEMENTATION-TRACKER.csv**: Task progress for workshop transformation

### Documentation Standards
- **Analysis Reports**: Structured evaluation in `reports/intake-analyses/`
- **Architecture Studies**: Deep technical analysis in `reports/architecture-studies/`
- **Strategic Recommendations**: Integration planning in `reports/strategic-recommendations/`
- **ADR Documentation**: Architectural decisions in `adrs/`

## Integration with Leviathan Ecosystem

### LLM-First Architecture Alignment
- Repositories evaluated for LLM-first architecture compatibility
- Confidence-based task routing integration patterns
- Bi-directional communication framework compatibility
- FlowMind meta-programming integration assessment

### Agent System Integration
- MCP protocol compliance evaluation
- Session management and context continuity support
- Universal context system compatibility
- Plugin architecture alignment with `@lev-os/` standards

## Common Workflows

### Repository Analysis Workflow
1. **Initial Assessment**: Clone to `intake/` and basic evaluation
2. **Deep Analysis**: Create comprehensive report in `reports/intake-analyses/`
3. **Tier Classification**: Assign semantic tier based on evaluation criteria
4. **Integration Planning**: Document strategy in `reports/strategic-recommendations/`
5. **Progress Tracking**: Update TRACKER.csv and IMPLEMENTATION-TRACKER.csv

### Research Synthesis Workflow
1. **Draft Research**: Work-in-progress analysis in `drafts/`
2. **Validation**: Cross-reference with existing reports and documentation
3. **Synthesis**: Create final documentation in appropriate `reports/` subdirectory
4. **Integration**: Update tracking files and master documentation

## Environment Requirements

### Dependencies
- **Git**: Repository cloning and management
- **Python 3.8+**: Analysis scripts and automation
- **Node.js 18+**: JavaScript/TypeScript repository evaluation
- **CSV Processing**: Spreadsheet tools for tracking file management

### Workshop-Specific Tools
- Repository analysis scripts (Python)
- Tier classification automation
- Report template generation
- Integration assessment frameworks

## Important Warnings

1. **Intake Directory Policy**: Never save analysis files in `intake/` - use `reports/` structure
2. **Tier Classification**: Follow semantic tier system, not arbitrary numerical assignments
3. **Documentation Standards**: Use structured templates for all analysis reports
4. **Tracking Consistency**: Update all relevant CSV files when making changes
5. **Integration Planning**: Consider Leviathan ecosystem compatibility in all evaluations

## Troubleshooting

### Common Issues
- **Analysis in wrong location**: Move from `intake/` to `reports/intake-analyses/`
- **Inconsistent tier assignments**: Check SEMANTIC-TIER-MAPPING.yaml for criteria
- **Missing tracking updates**: Verify TRACKER.csv and IMPLEMENTATION-TRACKER.csv
- **Repository access issues**: Check clone permissions and network connectivity

### Cleanup Procedures
- Automated cleanup removes old repositories from `intake/`
- Misplaced analysis files automatically moved to correct `reports/` locations
- Regular validation of tracking file consistency and accuracy

---

*The Workshop Intelligence System: Systematic AI tool evaluation and integration pipeline*