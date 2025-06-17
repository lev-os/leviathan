# TimeTravel Implementation Guide

## Quick Start

After compact, tell Claude:
```
Execute TimeTravel dogfood plan from ~/.kingly/projects/timetravel/MASTER-PLAN.md
```

## What Will Happen

1. **Phase 1**: Create core contexts in `/digital/mcp-ceo/contexts/`
2. **Phase 2**: Set up project instance in `~/.kingly/projects/timetravel/`
3. **Phase 3**: Create simulation scripts
4. **Phase 4**: Add BDD/TDD specs
5. **Test**: Run a research topic through the system

## Key Files Created

- `MASTER-PLAN.md` - Complete execution guide
- `context-manifest.yaml` - All contexts to create
- `implementation-guide.md` - This file
- `project.yaml` - TimeTravel project config
- `kingly-sim.sh` - Simulated Kingly CLI

## First Research Test

```bash
cd ~/.kingly/projects/timetravel
./kingly-sim.sh research "subquadratic attention architectures"
```

## Dogfooding Focus

- How well do contexts load?
- Is the simulation intuitive?
- Do personality patterns apply correctly?
- What's missing from the workflow?
- How should the real Kingly CLI work?