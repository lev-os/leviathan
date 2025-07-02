# Development Process - TimeTravel AI Research Platform

## Overview

TimeTravel is an AI research intelligence platform that orchestrates multiple research APIs (Perplexity, Elicit, DeepSeek, Claude) to conduct comprehensive technology analysis with personality-based synthesis for strategic positioning.

## Project Type: Research + Development Hybrid

**Research Focus**: AI technology trends, subquadratic architectures, world models, reasoning systems  
**Development Focus**: Multi-API orchestration, CLI tools, web interface, personality system

## Methodology

### Research-First Approach

- [ ] **Research phase**: Create ADR documenting investigation
- [ ] **Spec phase**: Define technical requirements
- [ ] **Implementation**: Follow TDD when possible
- [ ] **Integration**: Test with real APIs
- [ ] **Documentation**: Update guides and examples

### Multi-API Strategy

- [ ] **Parallel execution**: Run multiple research perspectives simultaneously
- [ ] **Cost optimization**: Use DeepSeek for validation, Claude for synthesis
- [ ] **Quality gates**: Validate results across multiple sources
- [ ] **Citation tracking**: Maintain research provenance

## Workflow

### 1. Planning Phase

- Update `pm/tracker.csv` with new tasks
- Break down features into 0.5-2h chunks
- Assign priority (P0=critical, P1=important, P2=nice-to-have)

### 2. Research Phase

- Document significant decisions in `docs/adr/`
- Use TimeTravel itself for technology research
- Store findings in `research/` repository

### 3. Implementation Phase

- Follow existing TypeScript patterns in `src/`
- Write tests in `tests/` (consolidated location)
- Update configurations in `config/`

### 4. Integration Phase

- Test with real API keys (use `scripts/validate-keys.sh`)
- Verify personality system works
- Check research repository indexing

### 5. Documentation Phase

- Update API docs in `docs/specs/`
- Add examples to `docs/examples.md`
- Update README if user-facing changes

## Agent Guidelines

### Before Starting Work

1. Check `pm/tracker.csv` for current priorities
2. Review related ADRs in `docs/adr/`
3. Understand the research repository structure

### During Development

- Commit frequently with semantic messages:
  - `feat: add perplexity deep research integration`
  - `fix: resolve personality loading race condition`
  - `docs: update API capabilities matrix`
  - `refactor: consolidate test directories`

### After Completion

- Update task status in tracker
- Add completion notes
- Update documentation if needed
- Consider creating ADR for significant decisions

## Quick Commands

```bash
# Development
npm run dev          # Start API server
npm run web:dev      # Start web interface
npm test            # Run all tests
npm run build       # Build for production

# Research Operations
./scripts/test-system.sh              # Validate full system
./scripts/validate-keys.sh            # Check API credentials
./scripts/daily-research.sh           # Run automated research scan

# Project Management
cat pm/tracker.csv                    # Check current tasks
git log --oneline -10                 # Recent progress
./pm/devagent.md --health            # Organization health check
```

## API Integration Patterns

### Perplexity Integration

- Use MCP server for Sonar (real-time search)
- Deep research for weekly scans
- Always include citations

### Multi-Tool Orchestration

- Parallel execution for speed
- Fallback chains for reliability
- Cost optimization (DeepSeek → Claude)

### Personality System

- Load from `personalities/` YAML files
- Apply during synthesis phase
- Maintain consistent voice across research

## Quality Standards

### Code Quality

- TypeScript strict mode enabled
- All public APIs documented
- Error handling for API failures
- Graceful degradation when APIs unavailable

### Research Quality

- Multiple source validation
- Citation requirements
- Bias detection and mitigation
- Time horizon appropriate analysis

### Documentation Quality

- ADRs for architectural decisions
- Specs before implementation
- Examples for all major features
- Clear setup instructions

## Success Metrics

### Technical Metrics

- [ ] All tests passing
- [ ] TypeScript builds without errors
- [ ] API integrations working
- [ ] Web interface functional

### Research Metrics

- [ ] Research repository growing
- [ ] Quality citations maintained
- [ ] Multi-perspective analysis
- [ ] Strategic insights generated

### Process Metrics

- [ ] Tasks tracked in CSV
- [ ] Regular commits
- [ ] Documentation current
- [ ] No broken links

## Emergency Procedures

### Build Failures

```bash
npm run clean
npm install
npm run build
```

### API Failures

```bash
./scripts/validate-keys.sh
# Check rate limits and quotas
# Verify MCP server connections
```

### Repository Corruption

```bash
git status
git stash
git reset --hard HEAD~1
# Restore from backup if needed
```

---

**Remember**: TimeTravel is both a research tool and a development project. Balance exploration with execution, and always maintain the research repository as a valuable asset.

_Last updated: 2025-07-02_
