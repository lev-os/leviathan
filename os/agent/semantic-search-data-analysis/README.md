# Data-Analysis Semantic Search

Python project with stdlib and package documentation

## Overview

This project implements semantic search for data-analysis using:
- **Framework**: python
- **Vector Database**: Qdrant
- **Embeddings**: sentence-transformers/all-mpnet-base-v2
- **Search Types**: Framework docs, Requirements, Local principles

## Collections

- `project-data-analysis-framework-docs` - Framework documentation
- `project-data-analysis-requirements` - Project requirements  
- `project-data-analysis-local-principles` - Local programming principles

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
data-analysis/
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

- Follow PEP 8 style guidelines
- Use type hints for better code clarity
- Write docstrings for all public functions
- Prefer list comprehensions over loops when appropriate
- Use virtual environments for dependency isolation
- Handle exceptions explicitly with try/except
- Use descriptive variable and function names

## API Integration

This project integrates with the multi-tier semantic search API at `http://localhost:8000`.

Example API call:
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "project": "data-analysis"}'
```
