# Enterprise Multi-Project Semantic Search System

A scalable, high-accuracy semantic search system for 20+ software projects, supporting three knowledge tiers:

1. **Framework Documentation** (APIs, technical specs)
2. **Requirements** (project-specific, business logic) 
3. **Programming Principles** (team guidelines, standards)

## Architecture

### Core Components
- **Vector Database**: Qdrant with hierarchical collections
- **Embedding Model**: `all-mpnet-base-v2` (accuracy-optimized)
- **Collection Strategy**: Namespace per project + global collections
- **MCP Integration**: FastEmbed MCP server

### Collection Structure
```
├── global-principles/          # Cross-project programming principles
├── project-{name}/
│   ├── framework-docs         # Technical documentation
│   ├── requirements          # Project requirements
│   └── local-principles      # Project-specific guidelines
└── unified-index/            # Cross-project search aggregation
```

## Quick Start

1. **Start Qdrant**: `docker run -p 6333:6333 qdrant/qdrant`
2. **Initialize Collections**: `python setup/init_collections.py`
3. **Ingest Documentation**: `python ingestion/ingest_go_docs.py`
4. **Start Search API**: `python api/search_server.py`

## Project Template

Use `deploy/setup_new_project.py` to rapidly deploy semantic search for new projects.

## Performance Targets

- **Precision**: >95% for technical queries
- **Recall**: >90% for principle-based queries  
- **Query Speed**: <100ms p95
- **Projects**: Support 20+ concurrent projects