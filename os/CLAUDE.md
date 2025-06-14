# CLAUDE.md - Kingly OS Project

This file provides guidance to Claude Code when working with the Kingly OS project.

## Semantic Search System

**AVAILABLE:** Enterprise-grade semantic search for Go documentation with 23,541+ indexed docs.

### Quick Start
```bash
# 1. Start Qdrant (if not running)
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest

# 2. Access search API at http://localhost:8000
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "limit": 5}'
```

### When to Use Semantic Search

**USE FOR:**
- Finding Go stdlib functions and packages: `"HTTP client server networking"`
- Code pattern discovery: `"error handling patterns"`
- API exploration: `"JSON parsing encoding"`
- Architecture research: `"concurrent programming goroutines"`
- Documentation lookup: `"file I/O operations"`

**EXAMPLES:**
```bash
# Find HTTP functionality
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "HTTP server client networking", "limit": 3}'

# Find JSON utilities  
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "JSON parsing encoding", "limit": 5}'

# Find concurrency patterns
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "goroutines channels concurrency", "limit": 3}'
```

### Template Deployment for New Projects

Create semantic search for any new project:

```bash
# Create project template (Go/Python/React supported)
cd ~/digital/kingly/core/os/agent
python deploy_template.py

# Generated projects include:
# - Hierarchical Qdrant collections  
# - Framework-specific principles
# - Ingestion scripts
# - Search utilities
# - Complete documentation
```

### Search API Endpoints

- `GET /` - API status and info
- `GET /health` - Health check with collection stats  
- `GET /collections` - List collections and point counts
- `POST /search` - Multi-tier semantic search

**Search Request Options:**
```json
{
  "query": "search terms",
  "content_types": ["framework", "requirement", "principle"],
  "project": "go-stdlib", 
  "scope": "all",
  "limit": 10
}
```

### Multi-Project Architecture

The system supports:
- **Framework Documentation**: APIs, stdlib, libraries
- **Requirements**: Project-specific business logic
- **Programming Principles**: Team guidelines, best practices
- **Global Principles**: Cross-project standards

Each project gets isolated collections:
- `project-{name}-framework-docs`
- `project-{name}-requirements` 
- `project-{name}-local-principles`
- `global-principles` (shared)

### Integration Notes

- **Accuracy-optimized**: Uses all-mpnet-base-v2 embeddings (768D)
- **Production-ready**: Qdrant with HNSW indexing
- **Scalable**: Template-based deployment for 20+ projects
- **Context-aware**: Preserves package/function relationships
- **Fast**: Sub-second search with 23K+ documents

### System Location

All components located at: `/Users/jean-patricksmith/digital/kingly/core/os/agent/`

- Search API: `search_api.py` (port 8000)
- Templates: `deploy_template.py`
- Collections: `init_search.py`
- Ingestion: `full_ingest.py`

**Status**: ✅ Live system with 23,541 Go docs fully indexed and searchable

### Tool Integration

**YAML Configuration**: Available at `~/o/contexts/tools/semantic-search/`
- `context.yaml` - Tool capabilities and orchestration patterns  
- `tool-mappings.yaml` - API endpoints and integration examples

Any dev agent can now discover and use semantic search via standardized tool configs following the Kingly pattern.