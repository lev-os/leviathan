# User-Dashboard Semantic Search

React project with component and hooks documentation

## Overview

This project implements semantic search for user-dashboard using:
- **Framework**: react
- **Vector Database**: Qdrant
- **Embeddings**: sentence-transformers/all-mpnet-base-v2
- **Search Types**: Framework docs, Requirements, Local principles

## Collections

- `project-user-dashboard-framework-docs` - Framework documentation
- `project-user-dashboard-requirements` - Project requirements  
- `project-user-dashboard-local-principles` - Local programming principles

## Usage

### 1. Start Qdrant
```bash
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest
```

### 2. Ingest Documentation
```bash
python scripts/ingest.py
```

### 3. Search
```bash
python scripts/search.py
```

## Directory Structure

```
user-dashboard/
├── config/
│   └── project.json          # Project configuration
├── data/
│   ├── framework_docs/       # Framework documentation files
│   ├── requirements/         # Project requirements
│   └── principles/           # Programming principles
├── scripts/
│   ├── ingest.py            # Data ingestion script
│   └── search.py            # Search script
└── README.md
```

## Framework-Specific Principles

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for type safety
- Implement proper error boundaries
- Use meaningful prop names and types
- Optimize performance with React.memo when needed
- Follow consistent naming conventions

## API Integration

This project integrates with the multi-tier semantic search API at `http://localhost:8000`.

Example API call:
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "project": "user-dashboard"}'
```
