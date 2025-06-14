#!/usr/bin/env python3
"""Multi-tier semantic search API for Go documentation."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum
import uvicorn
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import QueryRequest, Filter, FieldCondition, MatchValue

app = FastAPI(title="Semantic Search API", version="1.0.0")

class ContentType(str, Enum):
    FRAMEWORK = "framework"
    REQUIREMENT = "requirement"
    PRINCIPLE = "principle"

class SearchScope(str, Enum):
    PROJECT = "project"
    GLOBAL = "global"
    ALL = "all"

class SearchMode(str, Enum):
    SEMANTIC = "semantic"
    HYBRID = "hybrid"
    EXACT = "exact"

class SearchRequest(BaseModel):
    query: str
    content_types: Optional[List[ContentType]] = None
    project: Optional[str] = "go-stdlib"
    scope: SearchScope = SearchScope.ALL
    mode: SearchMode = SearchMode.SEMANTIC
    limit: int = 10

class SearchResult(BaseModel):
    id: str
    content: str
    score: float
    metadata: Dict[str, Any]

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int
    processing_time_ms: float

# Global components
embedding_model = None
qdrant_client = None

@app.on_event("startup")
async def startup_event():
    """Initialize model and client on startup."""
    global embedding_model, qdrant_client
    print("🚀 Starting Semantic Search API...")
    print("🧠 Loading embedding model...")
    embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    print("🔗 Connecting to Qdrant...")
    qdrant_client = QdrantClient(host="localhost", port=6333)
    print("✅ API ready!")

def get_collection_name(content_type: ContentType, project: str = "go-stdlib") -> str:
    """Get collection name based on content type and project."""
    if content_type == ContentType.PRINCIPLE:
        return "global-principles"
    elif content_type == ContentType.FRAMEWORK:
        return f"project-{project}-framework-docs"
    elif content_type == ContentType.REQUIREMENT:
        return f"project-{project}-requirements"
    else:
        return f"project-{project}-framework-docs"

@app.get("/")
async def root():
    """API status and info."""
    return {
        "name": "Semantic Search API",
        "version": "1.0.0",
        "status": "ready",
        "collections": ["project-go-stdlib-framework-docs", "global-principles"]
    }

@app.get("/health")
async def health():
    """Health check endpoint."""
    try:
        collections = qdrant_client.get_collections()
        return {
            "status": "healthy",
            "qdrant_collections": len(collections.collections),
            "embedding_model": "all-mpnet-base-v2"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Multi-tier semantic search endpoint."""
    import time
    start_time = time.time()
    
    try:
        # Create query embedding
        query_embedding = embedding_model.encode([request.query], normalize_embeddings=True)[0]
        
        # Determine collections to search
        collections_to_search = []
        
        if request.content_types:
            for content_type in request.content_types:
                collection_name = get_collection_name(content_type, request.project)
                collections_to_search.append((collection_name, content_type))
        else:
            # Default: search framework docs
            collections_to_search.append((
                get_collection_name(ContentType.FRAMEWORK, request.project),
                ContentType.FRAMEWORK
            ))
        
        all_results = []
        
        # Search each collection
        for collection_name, content_type in collections_to_search:
            try:
                # Check if collection exists
                collections = qdrant_client.get_collections()
                collection_names = [c.name for c in collections.collections]
                
                if collection_name not in collection_names:
                    continue
                
                # Build filter if needed
                search_filter = None
                if request.project and content_type == ContentType.FRAMEWORK:
                    search_filter = Filter(
                        must=[
                            FieldCondition(key="project", match=MatchValue(value=request.project)),
                            FieldCondition(key="test_batch", match=MatchValue(value=False))
                        ]
                    )
                
                # Perform search
                search_results = qdrant_client.query_points(
                    collection_name=collection_name,
                    query=query_embedding.tolist(),
                    limit=request.limit,
                    query_filter=search_filter
                )
                
                # Convert to SearchResult objects
                for result in search_results.points:
                    search_result = SearchResult(
                        id=str(result.id),
                        content=result.payload.get("content", ""),
                        score=float(result.score),
                        metadata={
                            "collection": collection_name,
                            "content_type": content_type.value,
                            "package": result.payload.get("package"),
                            "name": result.payload.get("name"),
                            "go_type": result.payload.get("go_type"),
                            "project": result.payload.get("project")
                        }
                    )
                    all_results.append(search_result)
                    
            except Exception as e:
                print(f"Error searching collection {collection_name}: {e}")
                continue
        
        # Sort by score and limit
        all_results.sort(key=lambda x: x.score, reverse=True)
        final_results = all_results[:request.limit]
        
        processing_time = (time.time() - start_time) * 1000
        
        return SearchResponse(
            query=request.query,
            results=final_results,
            total=len(final_results),
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/collections")
async def list_collections():
    """List available collections and their stats."""
    try:
        collections = qdrant_client.get_collections()
        collection_stats = []
        
        for collection in collections.collections:
            try:
                info = qdrant_client.get_collection(collection.name)
                collection_stats.append({
                    "name": collection.name,
                    "points_count": info.points_count,
                    "vector_size": info.config.params.vectors.size,
                    "distance": info.config.params.vectors.distance
                })
            except Exception as e:
                collection_stats.append({
                    "name": collection.name,
                    "error": str(e)
                })
        
        return {"collections": collection_stats}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list collections: {str(e)}")

if __name__ == "__main__":
    print("🌐 Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)