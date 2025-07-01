# ADR 013: Data Preservation Policy - "NEVER DELETE - Always Archive"

## Status
**Accepted** - 2025-07-01

## Context

During system refactoring and consolidation efforts, the need arose for a consistent policy on handling obsolete files, directories, and data structures. Multiple consolidation documents referenced an informal "NEVER DELETE - Always Archive" principle, but this was never formally documented as architectural policy.

## Problem

Without a formal data preservation policy:
- Risk of losing valuable historical context and implementation details
- Inconsistent approaches to handling obsolete code and documentation
- Potential for accidental deletion of useful patterns or methodologies
- Difficulty in understanding evolution of architectural decisions

## Decision

**Adopt the "NEVER DELETE - Always Archive" policy as the official data preservation standard for the Leviathan ecosystem.**

### Core Principles

1. **Never Delete**: No data should ever be permanently deleted from the system
2. **Always Archive**: Obsolete files must be moved to timestamped archive locations
3. **Temporal Traceability**: All archives include timestamp for historical tracking
4. **Contextual Preservation**: Archive with sufficient context to understand why data was preserved

### Implementation Guidelines

#### Archive Location Strategy
```bash
# Standard archive pattern
_archive/{category}-{original-name}-$(date +%Y%m%d-%H%M%S)/

# Examples:
_archive/plugins-lev-os-20250701-143022/
_archive/docs-migration-plan-20250701-143045/
_archive/packages-legacy-structure-20250701-143108/
```

#### Archive Categories
- **`plugins-*`**: Plugin directory restructures
- **`docs-*`**: Documentation consolidation artifacts  
- **`packages-*`**: Package architecture changes
- **`config-*`**: Configuration file updates
- **`specs-*`**: Obsolete specifications
- **`experiments-*`**: Failed or abandoned experiments

#### Required Archive Context
Each archive must include:
- **Timestamp**: When the archive was created
- **Reason**: Why the data was archived (migration, consolidation, obsolescence)
- **Reference**: Link to ADR, issue, or documentation explaining the change
- **Restoration**: Instructions for how to restore if needed

### Archive Workflow

#### Before Archiving
1. **Document Decision**: Create or reference ADR explaining why archiving is necessary
2. **Extract Value**: Identify and preserve any valuable patterns, concepts, or implementations
3. **Update References**: Ensure no active systems depend on archived data

#### During Archiving
```bash
# Create timestamped archive directory
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_DIR="_archive/{category}-{name}-${TIMESTAMP}"
mkdir -p "${ARCHIVE_DIR}"

# Move data with context
mv {obsolete-directory} "${ARCHIVE_DIR}/"
echo "Archived: $(date)" > "${ARCHIVE_DIR}/ARCHIVE_INFO.md"
echo "Reason: {explanation}" >> "${ARCHIVE_DIR}/ARCHIVE_INFO.md"
echo "Reference: {ADR or documentation link}" >> "${ARCHIVE_DIR}/ARCHIVE_INFO.md"
```

#### After Archiving
1. **Update Documentation**: Remove references to archived paths
2. **Test System**: Verify no functionality was broken
3. **Commit Change**: Include archive reason in commit message

### Exception Handling

#### Temporary Files
- **Build artifacts**: Can be deleted (not archived)
- **Cache files**: Can be deleted (not archived)  
- **Log files**: Archive only if containing valuable debugging information
- **Node modules**: Never archive (can be regenerated)

#### Sensitive Data
- **Secrets/Keys**: Should be rotated, not archived
- **Personal Information**: Must follow data protection regulations
- **Credentials**: Should be invalidated, not archived

#### Large Binary Files
- **Media files**: Archive only if historically significant
- **Database dumps**: Archive with expiration policy
- **Large assets**: Consider external storage with reference links

## Consequences

### Positive Outcomes
- **Historical Preservation**: Complete evolution history maintained
- **Pattern Recovery**: Ability to recover useful patterns from archived implementations
- **Decision Context**: Full context available for understanding architectural evolution
- **Rollback Capability**: Ability to restore previous states if needed
- **Learning Resource**: Archived code serves as learning material for architectural decisions

### Trade-offs
- **Storage Requirements**: Increased disk usage from archived data
- **Organization Overhead**: Need to maintain archive organization and documentation
- **Search Complexity**: More data to search through when looking for specific implementations

### Risk Mitigation
- **Archive Cleanup Policy**: Annual review of archives older than 2 years
- **Storage Monitoring**: Track archive storage usage and set limits
- **Access Documentation**: Maintain index of what's archived and where
- **Restoration Testing**: Periodically test archive restoration procedures

## Implementation

### Phase 1: Establish Archive Infrastructure
- Create `_archive/` directory in repository root
- Implement archive naming conventions
- Create archive documentation templates

### Phase 2: Apply to Current Consolidation
- Archive migration planning documents as resolved
- Archive obsolete plugin structures  
- Archive deprecated configuration patterns

### Phase 3: Formalize Process
- Update development guidelines to include archiving workflows
- Train team on archive procedures
- Integrate archive steps into consolidation checklists

## Monitoring

### Success Metrics
- **Zero Permanent Deletions**: No data permanently lost during refactoring
- **Complete Audit Trail**: All architectural changes have archived context
- **Recovery Success Rate**: 100% successful restoration when needed
- **Developer Adoption**: Team consistently follows archive procedures

### Review Schedule
- **Quarterly**: Review archive organization and access patterns
- **Annually**: Clean up archives older than retention policy
- **Per Migration**: Validate archive completeness for major changes

## References

- Original policy referenced in `docs/_coremove.md` consolidation documentation
- Applied during plugin structure consolidation (2025-07-01)
- Supports overall Leviathan principle of preserving architectural evolution

---

**Decision Date**: 2025-07-01  
**Decision Maker**: Leviathan Architecture Team  
**Review Date**: 2025-10-01