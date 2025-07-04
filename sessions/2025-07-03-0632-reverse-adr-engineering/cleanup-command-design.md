# Cleanup Command Design for /idea and /session

## Proposed Sub-Commands

### For /idea:
- `/idea validate` - Check all concepts against schema, report issues
- `/idea repair` - Fix schema violations, convert freestyle to spec
- `/idea reindex` - Rebuild ideas/index.yaml from all readme.yaml files

### For /session:
- `/session validate` - Check session structure against spec
- `/session repair` - Fix non-compliant session files
- `/session archive` - Move completed sessions to archive/

## Cleanup Rules

### NEVER Modify (Read-Only):
- Any `*.md` files (user content)
- `freestyle/*` directories
- Research artifacts
- User-generated content

### CAN Modify:
- `readme.yaml` (idea or session)
- `index.yaml` (portfolio indexes)
- Directory structure (if fixing)

## Validation Process

```yaml
validation_workflow:
  1_scan: "Find all readme.yaml files"
  2_validate: "Check against embedded schema"
  3_report: "List violations found"
  4_plan: "Generate repair plan"
  5_wizard: "Get human approval for repairs"
  6_execute: "Apply approved fixes"
  7_reindex: "Update index.yaml"
```

## Common Issues to Fix

### Schema Violations:
- Missing required fields (id, title, status)
- Invalid status values
- Incorrect date formats
- Nested YAML where flat expected

### Freestyle Conversions:
- Extract insights from random YAML files
- Convert to proper readme.yaml format
- Move original to `archive/pre-cleanup/`
- Preserve all user content

### Index Synchronization:
- Missing concepts in index
- Deleted concepts still in index
- Outdated metadata in index
- Incorrect counts/statistics

## Repair Synth

```yaml
cleanup_repair_synth:
  role: "Schema Compliance Engineer"
  job: "Validate and repair idea/session structures to match specifications"
  capabilities:
    - "Schema validation against embedded specs"
    - "Intelligent content extraction from freestyle"
    - "Safe file migration with backups"
    - "Index regeneration from source files"
```

## Example Usage

```bash
# Validate all ideas
/idea validate
> Found 3 concepts with schema violations:
> - quantum-context: missing 'status' field
> - old-idea: using deprecated 'concept.yaml' name
> - freestyle-note: non-compliant YAML structure

# Repair with wizard guidance
/idea repair
> Wizard: Here's my repair plan...
> 1. Add status: ideation to quantum-context
> 2. Rename concept.yaml → readme.yaml for old-idea
> 3. Extract content from freestyle-note, create proper readme.yaml
> Proceed? [y/N]

# Rebuild index
/idea reindex
> Scanned 12 concepts
> Updated ideas/index.yaml
> Added 2 missing concepts
> Removed 1 deleted concept
```