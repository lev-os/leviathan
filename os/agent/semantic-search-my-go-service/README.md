# My-Go-Service Semantic Search

Go language project with stdlib and module documentation

## Overview

This project implements semantic search for my-go-service using:
- **Framework**: go
- **Vector Database**: Qdrant
- **Embeddings**: sentence-transformers/all-mpnet-base-v2
- **Search Types**: Framework docs, Requirements, Local principles

## Collections

- `project-my-go-service-framework-docs` - Framework documentation
- `project-my-go-service-requirements` - Project requirements  
- `project-my-go-service-local-principles` - Local programming principles

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
my-go-service/
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

- Use Go's built-in error handling patterns
- Prefer composition over inheritance
- Keep interfaces small and focused
- Use gofmt for consistent code formatting
- Write clear, descriptive variable names
- Use channels for goroutine communication
- Handle errors explicitly, don't ignore them

## API Integration

This project integrates with the multi-tier semantic search API at `http://localhost:8000`.

Example API call:
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "project": "my-go-service"}'
```
