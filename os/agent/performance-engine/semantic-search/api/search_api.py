"""
Multi-tier semantic search API for framework docs, requirements, and principles.
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from enum import Enum
import logging
from dataclasses import asdict
import time

from ..config.settings import SystemConfig, default_config
from ..setup.collection_manager import CollectionManager
from ..ingestion.embedding_service import get_embedding_service
from ..schemas.metadata import ContentType, Scope, HierarchyLevel, DocumentType


logger = logging.getLogger(__name__)


# Request/Response models
class SearchScope(str, Enum):
    PROJECT = "project"
    GLOBAL = "global"
    ALL = "all"


class SearchMode(str, Enum):
    SEMANTIC = "semantic"      # Pure vector search
    HYBRID = "hybrid"          # Vector + metadata filtering
    CONTEXTUAL = "contextual"  # Multi-tier contextual search


class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query text")
    projects: Optional[List[str]] = Field(None, description="Specific projects to search")
    content_types: Optional[List[ContentType]] = Field(None, description="Filter by content type")
    scope: SearchScope = Field(SearchScope.ALL, description="Search scope")
    mode: SearchMode = Field(SearchMode.HYBRID, description="Search mode")
    limit: int = Field(10, ge=1, le=100, description="Maximum results to return")
    score_threshold: float = Field(0.7, ge=0.0, le=1.0, description="Minimum similarity score")
    include_content: bool = Field(True, description="Include full content in results")
    framework: Optional[str] = Field(None, description="Filter by framework")
    hierarchy_levels: Optional[List[HierarchyLevel]] = Field(None, description="Filter by hierarchy level")


class SearchResult(BaseModel):
    id: str
    content: Optional[str]
    metadata: Dict[str, Any]
    score: float
    collection: str
    highlights: Optional[List[str]] = None


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_found: int
    processing_time_ms: float
    search_strategy: str
    collections_searched: List[str]
    aggregations: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str
    qdrant_health: bool
    embedding_model: Dict[str, Any]
    collections: List[Dict[str, Any]]
    system_info: Dict[str, Any]


# Search service
class SemanticSearchService:
    """Multi-tier semantic search service."""
    
    def __init__(self, config: SystemConfig = default_config):
        self.config = config
        self.collection_manager = CollectionManager(config)
        self.embedding_service = get_embedding_service(config)
    
    def determine_search_collections(
        self, 
        projects: Optional[List[str]], 
        content_types: Optional[List[ContentType]],
        scope: SearchScope
    ) -> List[str]:
        """Determine which collections to search based on request parameters."""
        
        collections = []
        
        if scope == SearchScope.GLOBAL:
            collections.append(self.config.collections.global_principles)
            collections.append(self.config.collections.unified_index)
        
        elif scope == SearchScope.PROJECT and projects:
            for project in projects:
                if content_types:
                    for content_type in content_types:
                        collection_name = self.collection_manager.get_collection_for_content_type(
                            project, content_type
                        )
                        collections.append(collection_name)
                else:
                    # Add all project collections
                    project_collections = self.config.collections.get_project_collections(project)
                    collections.extend(project_collections.values())
        
        else:  # SearchScope.ALL
            # Global collections
            collections.append(self.config.collections.global_principles)
            
            # Project collections
            if projects:
                for project in projects:
                    project_collections = self.config.collections.get_project_collections(project)
                    if content_types:
                        for content_type in content_types:
                            collection_name = self.collection_manager.get_collection_for_content_type(
                                project, content_type
                            )
                            if collection_name in project_collections.values():
                                collections.append(collection_name)
                    else:
                        collections.extend(project_collections.values())
        
        # Remove duplicates and filter existing collections
        unique_collections = []
        for collection in set(collections):
            if self.collection_manager.collection_exists(collection):
                unique_collections.append(collection)
            else:
                logger.warning(f"Collection {collection} does not exist, skipping")
        
        return unique_collections
    
    def build_metadata_filter(
        self, 
        framework: Optional[str],
        hierarchy_levels: Optional[List[HierarchyLevel]]
    ) -> Optional[Dict[str, Any]]:
        """Build metadata filter for Qdrant search."""
        
        filters = []
        
        if framework:
            filters.append({
                "key": "framework",
                "match": {"value": framework}
            })
        
        if hierarchy_levels:
            level_values = [level.value for level in hierarchy_levels]
            filters.append({
                "key": "hierarchy_level",
                "match": {"any": level_values}
            })
        
        if not filters:
            return None
        
        if len(filters) == 1:
            return filters[0]
        else:
            return {"must": filters}
    
    async def search(self, request: SearchRequest) -> SearchResponse:
        """Perform multi-tier semantic search."""
        
        start_time = time.time()
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.encode_single(request.query)
            
            # Determine search collections
            collections_to_search = self.determine_search_collections(
                request.projects, request.content_types, request.scope
            )
            
            if not collections_to_search:
                return SearchResponse(
                    query=request.query,
                    results=[],
                    total_found=0,
                    processing_time_ms=0.0,
                    search_strategy="no_collections",
                    collections_searched=[]
                )
            
            # Build metadata filter
            metadata_filter = self.build_metadata_filter(
                request.framework, request.hierarchy_levels
            )
            
            # Search across collections
            all_results = []
            
            for collection_name in collections_to_search:
                try:
                    search_results = self.collection_manager.client.search(
                        collection_name=collection_name,
                        query_vector=query_embedding.tolist(),
                        limit=request.limit * 2,  # Get more results for reranking
                        score_threshold=request.score_threshold,
                        query_filter=metadata_filter,
                        with_payload=True,
                        with_vectors=False
                    )
                    
                    for result in search_results:
                        search_result = SearchResult(
                            id=result.id,
                            content=result.payload.get("content") if request.include_content else None,
                            metadata={k: v for k, v in result.payload.items() if k != "content"},
                            score=result.score,
                            collection=collection_name
                        )
                        all_results.append(search_result)
                
                except Exception as e:
                    logger.error(f"Search failed for collection {collection_name}: {e}")
                    continue
            
            # Sort by score and limit results
            all_results.sort(key=lambda x: x.score, reverse=True)
            final_results = all_results[:request.limit]
            
            # Generate aggregations
            aggregations = self._generate_aggregations(all_results)
            
            processing_time = (time.time() - start_time) * 1000
            
            return SearchResponse(
                query=request.query,
                results=final_results,
                total_found=len(all_results),
                processing_time_ms=processing_time,
                search_strategy=f"{request.mode.value}_multi_collection",
                collections_searched=collections_to_search,
                aggregations=aggregations
            )
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
    
    def _generate_aggregations(self, results: List[SearchResult]) -> Dict[str, Any]:
        """Generate aggregations from search results."""
        
        content_types = {}
        frameworks = {}
        projects = {}
        hierarchy_levels = {}
        
        for result in results:
            metadata = result.metadata
            
            # Count by content type
            content_type = metadata.get("content_type", "unknown")
            content_types[content_type] = content_types.get(content_type, 0) + 1
            
            # Count by framework
            framework = metadata.get("framework", "unknown")
            if framework and framework != "unknown":
                frameworks[framework] = frameworks.get(framework, 0) + 1
            
            # Count by project
            project = metadata.get("project", "unknown")
            projects[project] = projects.get(project, 0) + 1
            
            # Count by hierarchy level
            hierarchy_level = metadata.get("hierarchy_level", "unknown")
            hierarchy_levels[hierarchy_level] = hierarchy_levels.get(hierarchy_level, 0) + 1
        
        return {
            "content_types": content_types,
            "frameworks": frameworks,
            "projects": projects,
            "hierarchy_levels": hierarchy_levels
        }
    
    async def health_check(self) -> HealthResponse:
        """Perform health check on all system components."""
        
        qdrant_health = self.collection_manager.health_check()
        embedding_model = self.embedding_service.get_model_info()
        collections = self.collection_manager.list_all_collections()
        
        system_info = {
            "config": {
                "embedding_model": self.config.embedding.model_name,
                "vector_dimension": self.config.embedding.dimension,
                "qdrant_host": self.config.qdrant.host
            },
            "stats": self.collection_manager.get_collection_stats()
        }
        
        overall_status = "healthy" if qdrant_health and embedding_model.get("status") == "ready" else "unhealthy"
        
        return HealthResponse(
            status=overall_status,
            qdrant_health=qdrant_health,
            embedding_model=embedding_model,
            collections=collections,
            system_info=system_info
        )


# FastAPI app
def create_app(config: SystemConfig = default_config) -> FastAPI:
    """Create FastAPI application."""
    
    app = FastAPI(
        title="Enterprise Semantic Search API",
        description="Multi-tier semantic search for framework docs, requirements, and principles",
        version="1.0.0"
    )
    
    # Add CORS middleware
    if config.api_host != "localhost":
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Initialize service
    search_service = SemanticSearchService(config)
    
    @app.get("/health", response_model=HealthResponse)
    async def health():
        """Health check endpoint."""
        return await search_service.health_check()
    
    @app.post("/search", response_model=SearchResponse)
    async def search(request: SearchRequest):
        """Semantic search endpoint."""
        return await search_service.search(request)
    
    @app.get("/search", response_model=SearchResponse)
    async def search_get(
        query: str = Query(..., description="Search query"),
        projects: Optional[str] = Query(None, description="Comma-separated project names"),
        content_types: Optional[str] = Query(None, description="Comma-separated content types"),
        scope: SearchScope = Query(SearchScope.ALL, description="Search scope"),
        mode: SearchMode = Query(SearchMode.HYBRID, description="Search mode"),
        limit: int = Query(10, ge=1, le=100, description="Maximum results"),
        score_threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum score"),
        framework: Optional[str] = Query(None, description="Framework filter")
    ):
        """GET endpoint for search (convenient for testing)."""
        
        # Parse comma-separated values
        parsed_projects = projects.split(",") if projects else None
        parsed_content_types = None
        if content_types:
            try:
                parsed_content_types = [ContentType(ct.strip()) for ct in content_types.split(",")]
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid content type: {e}")
        
        request = SearchRequest(
            query=query,
            projects=parsed_projects,
            content_types=parsed_content_types,
            scope=scope,
            mode=mode,
            limit=limit,
            score_threshold=score_threshold,
            framework=framework
        )
        
        return await search_service.search(request)
    
    @app.get("/collections")
    async def list_collections():
        """List all collections and their stats."""
        return search_service.collection_manager.get_collection_stats()
    
    @app.get("/benchmark")
    async def benchmark_embedding():
        """Benchmark the embedding service."""
        return search_service.embedding_service.benchmark()
    
    return app


# CLI entry point
def main():
    """CLI entry point for the search API server."""
    import uvicorn
    import argparse
    
    parser = argparse.ArgumentParser(description="Start semantic search API server")
    parser.add_argument("--host", default="0.0.0.0", help="Host address")
    parser.add_argument("--port", type=int, default=8000, help="Port number")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")
    
    args = parser.parse_args()
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    config = SystemConfig.from_env()
    app = create_app(config)
    
    logger.info(f"Starting semantic search API server on {args.host}:{args.port}")
    
    uvicorn.run(
        "search_api:app" if args.reload else app,
        host=args.host,
        port=args.port,
        reload=args.reload
    )


if __name__ == "__main__":
    main()