# ADR-XXX: Lazy File Creation Pattern

## Status
DRAFT - Discovered through command debugging

## Context
LLM systems tend to over-create directory structures when given freedom to organize files. This leads to:
- Empty directories cluttering the workspace
- Confusion about where content should go
- Time wasted on filesystem operations
- Assumptions about structure before understanding needs

The pattern was discovered while debugging /idea and /session commands that were creating excessive directory structures.

## Decision
Implement a lazy file creation pattern where:
1. Only create files when there's content to store
2. Only create directories when explicitly requested by user
3. Start with minimal structure (single readme.yaml)
4. Let structure emerge from actual usage

## Implementation

### File Mask Pattern
```
{entity}/{slug}/
├── readme.yaml          # ALWAYS create first
├── *.md                 # Create as needed
└── {user-directed}/     # ONLY on explicit request
```

### Intent Mapping
User intent drives file creation:
- "research this" → creates research-{timestamp}.md
- "create poc" → creates pocs/{name}/ directory
- "add specs" → creates specs/ directory
- No intent → No additional files

## Consequences

### Positive
- **Faster initialization** - Single file vs directory tree
- **Clearer intent** - Structure matches actual work
- **Less confusion** - No empty directories to wonder about
- **Emergent organization** - Structure evolves with project
- **User control** - Explicit decisions about organization

### Negative
- **Less discoverable** - No pre-made structure to explore
- **Requires guidance** - Users need to know they can request dirs
- **Inconsistent structures** - Projects may organize differently

## Examples

### Before (Eager Creation)
```bash
/idea new my-concept
├── ideas/my-concept/concept.yaml
├── ideas/my-concept/docs/
├── ideas/my-concept/research/
├── ideas/my-concept/specs/
├── ideas/my-concept/pocs/
└── ideas/my-concept/code/
```

### After (Lazy Creation)
```bash
/idea new my-concept
└── ideas/my-concept/readme.yaml

# Then as work progresses:
"research quantum effects"
└── ideas/my-concept/research-quantum-effects.md

"create poc for api"
└── ideas/my-concept/pocs/api-demo/
```

## Related Patterns
- Just-In-Time Resource Allocation
- YAGNI (You Aren't Gonna Need It)
- Emergent Design
- Intent-Driven Development