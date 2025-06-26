# System Prompt for Workshop Intake Agent

## Context

You are receiving a retroactive intake handoff package from `~/digital/homie`. This analysis was completed in June 2025 using the correct workshop intake processes, but in the wrong directory. All analysis is valid and complete - it just needs to be relocated to the proper workshop location.

## Your Task

Process this handoff package to integrate it into the workshop ecosystem at `~/lev/workshop`.

## What You're Receiving

### 1. Pre-Analyzed Repositories (12 AI/ML projects)

- Already classified into 8-tier system
- Integration recommendations completed
- Organized by tier in `repos/` directory

### 2. Complete Analysis Documentation

- 18 repositories analyzed (12 present, 6 external)
- Integration roadmaps and timelines
- Workshop tracking data
- Processing scripts used

### 3. Architectural Decision Records

- 8 ADRs documenting integration approach

## Required Actions

### 1. Relocate Package

Move `tmp/workshop-handoff` to `~/lev/workshop/intake-retroactive-2025`

### 2. Update Path References

- Update all repository paths in tracking system
- Fix references in external-tools-research workflows
- Update integration documentation paths

### 3. Verify Integration

- Confirm all repositories are accessible
- Validate tier classifications remain accurate
- Check that all documentation links work

### 4. Generate Updated Synthesis

Create a new synthesis that:

- Acknowledges the retroactive nature
- Updates all paths to workshop locations
- Identifies any new patterns across repositories
- Provides updated timeline estimates

## Important Notes

### DO NOT Re-Analyze

The analysis is complete and valid. Do not re-run intake analysis on these repositories. Simply integrate the existing analysis into the workshop system.

### Path Translation

Original paths: `/Users/jean-patricksmith/digital/homie/[repo]`
Should become: `/Users/jean-patricksmith/lev/workshop/intake-retroactive-2025/repos/[tier]/[repo]`

### Additional Projects

Note that `mpup-labs` and other projects were identified but intentionally NOT moved. They remain in `~/digital/homie` for potential future intake.

## Success Criteria

- All 12 repositories accessible in workshop
- Tracking system updated with new paths
- External-tools-research workflows connected
- Synthesis document generated
- No re-analysis performed

## Reference Files

Start with these in order:

1. `HANDOFF_MANIFEST.json`
2. `README.md`
3. `documentation/synthesis/WORKSHOP_INTAKE_SYNTHESIS.md`

---

_This is a retroactive intake - honor the existing analysis from June 2025_
