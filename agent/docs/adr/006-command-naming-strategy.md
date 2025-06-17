# ADR-006: Command Naming Strategy

**Status:** Accepted  
**Date:** 2025-06-12  
**Context:** Hybrid command system implementation and CLI standardization

## Decision

Official command name is `kingly` with personal alias `k` for convenience.

## Context

During hybrid command implementation, we evolved from `kingly-semantic` to a cleaner naming strategy:

1. **Original:** `kingly-semantic` (descriptive but verbose)
2. **Interim:** Mixed usage of `ks`, `kingly-semantic`, `kingly` 
3. **Final:** Clean separation of official vs personal naming

## Rationale

### Official Command: `kingly`
- **Clean branding:** Simple, memorable, professional
- **Documentation consistency:** All official docs use `kingly`
- **Future-proof:** Not tied to implementation details like "semantic"
- **Cross-platform:** Works in all environments

### Personal Alias: `k`
- **Efficiency:** Ultra-short for frequent use
- **User choice:** Personal preference setup
- **Non-prescriptive:** Not enforced in documentation
- **Setup flexibility:** Users can customize as desired

## Implementation

### Binary Renamed
- `bin/kingly-semantic` → `bin/kingly`
- All internal path references updated

### Documentation Updated
- Command registry: All `ks` references → `kingly`
- Help system: Clean syntax examples
- Claude templates: Proper bash code blocks with `kingly`

### Personal Setup
- Dotfiles alias: `alias k="kingly"`
- PATH configuration: `$HOME/digital/kingly/core/mcp-mvp/bin:$PATH`
- User convenience preserved

## Benefits

1. **Professional presentation:** Official documentation uses clear, consistent command names
2. **Personal efficiency:** Users can set ultra-short aliases for frequent use
3. **Clear separation:** Official vs personal naming reduces confusion
4. **Scalability:** Pattern works for team adoption and enterprise use

## Alternatives Considered

- **Unified `k` everywhere:** Too cryptic for documentation
- **Keep `kingly-semantic`:** Too verbose for daily use
- **Multiple official names:** Confusing for users and documentation

## Outcome

Hybrid command system now has clean, consistent naming that balances professional documentation with personal efficiency preferences.