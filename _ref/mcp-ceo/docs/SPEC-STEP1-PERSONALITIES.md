# Step 1 Specification: Create Personality Markdown Files

## Overview
Create markdown files for each personality following the clean agent pattern from Kingly.

## Directory Structure
```
contexts/
├── core/
│   ├── principles_full.md     # Full constitutional principles
│   ├── principles_brief.md    # Condensed version for steps
│   └── bootstrap.md           # Bootstrap sovereignty principle
├── personalities/
│   ├── cortisol_guardian.md
│   ├── systems_illuminator.md
│   ├── abundance_amplifier.md
│   ├── action_catalyst.md
│   ├── sovereignty_architect.md
│   ├── harmony_weaver.md
│   ├── resilience_guardian.md
│   └── flow_creator.md
└── templates/
    └── personality_template.md
```

## Template Structure
Each personality file follows this structure:

```markdown
# [emoji] [Personality Name]

<personality_identity>
- Core role statement
- Primary function
- Key responsibility
- Unique perspective
</personality_identity>

<core_function>
- What this personality monitors
- What it advocates for
- How it shapes decisions
- What it protects/enables
</core_function>

<decision_patterns>
1. Primary question asked
2. Approach to solutions
3. Priority framework
4. Success metrics
</decision_patterns>

<interaction_patterns>
- With [Personality A]: How they collaborate
- With [Personality B]: Points of tension/synergy
- With [Personality C]: Complementary aspects
</interaction_patterns>

<speaking_style>
Description of tone and examples:
- "Characteristic phrase..."
- "Another example..."
- "Typical response pattern..."
</speaking_style>

<domain_expertise>
- Specific area of mastery
- Tools and frameworks used
- Knowledge domains
</domain_expertise>
```

## Content Source
Pull from existing ceo-config.yaml definitions and expand with:
- More detailed personality traits
- Specific interaction patterns
- Domain expertise
- Speaking style examples

## Success Criteria
1. All 8 personality files created
2. Each file 50-100 lines of rich content
3. Clear interaction patterns defined
4. Testable by loading and displaying

## Implementation Order
1. Create directories
2. Create template file
3. Create cortisol_guardian.md as example
4. Create remaining 7 personalities
5. Create core principle files
6. Test loading all files

Sound good?