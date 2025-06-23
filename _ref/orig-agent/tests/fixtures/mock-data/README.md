# Mock Data for Kingly Context System

This directory contains example YAML context type definitions demonstrating the universal relationship system across various domains.

## Structure

```
contexts/types/
├── base/               # Universal base context
├── epic/               # Agile development
├── wedding_event/      # Wedding planning
├── timeline_project/   # Multiverse project management
├── research_paper/     # Academic research
├── legal_case/         # Legal case management
├── creative_work/      # Creative projects
├── climate_action/     # Environmental coordination
├── game_element/       # Game development
└── planetary_project/  # Multi-planetary coordination
```

## Usage

These mock data files are used for:
1. Testing the relationship system implementation
2. Demonstrating domain-specific relationship patterns
3. Validating the plugin architecture
4. Training LLMs on relationship types

## Key Patterns

Each domain demonstrates unique relationship types that emerge from its constraints:
- **Physical constraints**: gravity, distance, time delays
- **Social constraints**: conflicts, emotions, politics
- **Logical constraints**: dependencies, precedence, causality
- **Resource constraints**: competition, sharing, depletion

## Testing

Use these files to test:
- Context loading with inheritance
- Relationship validation
- Bidirectional sync
- Property schema validation
- Cross-domain queries