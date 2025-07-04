# Concept Schema Definition

## Core Structure
```
concepts/{id}/
├── concept.yaml          # Minimal metadata
├── docs/                 # Human communication
├── research/            # Analysis & exploration
└── [code|adr|bdd|specs] # As needed
```

## concept.yaml (Minimal)
```yaml
id: concept-id
title: "Concept Title"
status: ideation|analysis|specification|implementation|archive
created: "2025-07-02"
tags: [tag1, tag2]
description: "Brief description"
```

## Lifecycle Stages
- **ideation**: Initial thoughts
- **analysis**: Five-fold wizard exploration
- **specification**: ADR/BDD documentation
- **implementation**: Active development
- **archive**: Complete/abandoned

## Index Storage
- **Small scale**: concepts/index.yaml
- **Scale up**: SQLite database
- **Workshop**: Drives concepts forward
- **Wizard**: Guides transitions

## Wizard Integration
Workshop detects concepts ready for advancement and triggers wizard sessions.