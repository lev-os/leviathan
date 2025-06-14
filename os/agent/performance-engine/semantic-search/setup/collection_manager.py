"""
Qdrant collection management for hierarchical multi-project semantic search.
"""

import logging
from typing import List, Dict, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams, Distance, CollectionStatus,
    CreateCollection, HnswConfigDiff, OptimizersConfigDiff
)
from qdrant_client.http.exceptions import UnexpectedResponse

from ..config.settings import SystemConfig, default_config
from ..schemas.metadata import ContentType


logger = logging.getLogger(__name__)


class CollectionManager:
    """Manages Qdrant collections for multi-project semantic search."""
    
    def __init__(self, config: SystemConfig = default_config):
        self.config = config
        self.client = QdrantClient(
            host=config.qdrant.host,
            port=config.qdrant.port,
            api_key=config.qdrant.api_key,
            timeout=config.qdrant.timeout,
            prefer_grpc=config.qdrant.prefer_grpc
        )
    
    def create_collection(
        self, 
        collection_name: str, 
        description: str = "",
        vector_size: Optional[int] = None
    ) -> bool:
        """Create a single collection with optimized settings."""
        
        vector_size = vector_size or self.config.qdrant.vector_size
        
        try:
            # Check if collection already exists
            if self.collection_exists(collection_name):
                logger.info(f"Collection '{collection_name}' already exists")
                return True
            
            # Create collection with HNSW index for accuracy
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=getattr(Distance, self.config.qdrant.distance_metric.upper())
                ),
                hnsw_config=HnswConfigDiff(
                    m=self.config.qdrant.hnsw_config["m"],
                    ef_construct=self.config.qdrant.hnsw_config["ef_construct"],
                    full_scan_threshold=self.config.qdrant.hnsw_config["full_scan_threshold"]
                ),
                optimizers_config=OptimizersConfigDiff(
                    default_segment_number=2,
                    max_segment_size=1000000
                )
            )
            
            logger.info(f"Created collection '{collection_name}' - {description}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create collection '{collection_name}': {e}")
            return False
    
    def collection_exists(self, collection_name: str) -> bool:
        """Check if a collection exists."""
        try:
            collections = self.client.get_collections()
            return any(col.name == collection_name for col in collections.collections)
        except Exception as e:
            logger.error(f"Error checking collection existence: {e}")
            return False
    
    def delete_collection(self, collection_name: str) -> bool:
        """Delete a collection."""
        try:
            if not self.collection_exists(collection_name):
                logger.warning(f"Collection '{collection_name}' does not exist")
                return True
            
            self.client.delete_collection(collection_name)
            logger.info(f"Deleted collection '{collection_name}'")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete collection '{collection_name}': {e}")
            return False
    
    def setup_global_collections(self) -> bool:
        """Set up global collections for cross-project content."""
        
        success = True
        
        # Global programming principles
        success &= self.create_collection(
            self.config.collections.global_principles,
            "Global programming principles and team standards"
        )
        
        # Unified index for cross-project search
        success &= self.create_collection(
            self.config.collections.unified_index,
            "Unified index for cross-project semantic search"
        )
        
        return success
    
    def setup_project_collections(self, project: str) -> bool:
        """Set up collections for a specific project."""
        
        success = True
        project_collections = self.config.collections.get_project_collections(project)
        
        # Framework documentation
        success &= self.create_collection(
            project_collections["framework_docs"],
            f"Framework documentation for project {project}"
        )
        
        # Requirements
        success &= self.create_collection(
            project_collections["requirements"],
            f"Requirements and specifications for project {project}"
        )
        
        # Local principles
        success &= self.create_collection(
            project_collections["local_principles"],
            f"Project-specific programming principles for {project}"
        )
        
        return success
    
    def setup_all_collections(self, projects: List[str]) -> bool:
        """Set up all collections for multiple projects."""
        
        logger.info("Setting up global collections...")
        success = self.setup_global_collections()
        
        for project in projects:
            logger.info(f"Setting up collections for project: {project}")
            success &= self.setup_project_collections(project)
        
        if success:
            logger.info("All collections set up successfully")
        else:
            logger.error("Some collections failed to set up")
        
        return success
    
    def get_collection_info(self, collection_name: str) -> Optional[Dict]:
        """Get information about a collection."""
        try:
            info = self.client.get_collection(collection_name)
            return {
                "name": collection_name,
                "status": info.status,
                "vectors_count": info.vectors_count,
                "segments_count": info.segments_count,
                "disk_data_size": info.disk_data_size,
                "ram_data_size": info.ram_data_size,
                "config": {
                    "vector_size": info.config.params.vectors.size,
                    "distance": info.config.params.vectors.distance,
                    "hnsw_config": info.config.hnsw_config
                }
            }
        except Exception as e:
            logger.error(f"Failed to get collection info for '{collection_name}': {e}")
            return None
    
    def list_all_collections(self) -> List[Dict]:
        """List all collections with their information."""
        try:
            collections = self.client.get_collections()
            result = []
            
            for collection in collections.collections:
                info = self.get_collection_info(collection.name)
                if info:
                    result.append(info)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to list collections: {e}")
            return []
    
    def get_collection_for_content_type(
        self, 
        project: str, 
        content_type: ContentType
    ) -> str:
        """Get the appropriate collection name for a content type and project."""
        
        if content_type == ContentType.PRINCIPLE:
            # Check if this should go to global or project-specific principles
            # For now, default to project-specific
            project_collections = self.config.collections.get_project_collections(project)
            return project_collections["local_principles"]
        
        elif content_type == ContentType.FRAMEWORK:
            project_collections = self.config.collections.get_project_collections(project)
            return project_collections["framework_docs"]
        
        elif content_type == ContentType.REQUIREMENT:
            project_collections = self.config.collections.get_project_collections(project)
            return project_collections["requirements"]
        
        else:
            raise ValueError(f"Unknown content type: {content_type}")
    
    def health_check(self) -> bool:
        """Check if Qdrant is healthy and accessible."""
        try:
            collections = self.client.get_collections()
            logger.info(f"Qdrant health check passed. Found {len(collections.collections)} collections")
            return True
        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return False
    
    def cleanup_project(self, project: str) -> bool:
        """Clean up all collections for a project."""
        success = True
        project_collections = self.config.collections.get_project_collections(project)
        
        for collection_name in project_collections.values():
            success &= self.delete_collection(collection_name)
        
        return success
    
    def get_collection_stats(self) -> Dict:
        """Get statistics for all collections."""
        collections = self.list_all_collections()
        
        stats = {
            "total_collections": len(collections),
            "total_vectors": sum(c.get("vectors_count", 0) for c in collections),
            "total_disk_size": sum(c.get("disk_data_size", 0) for c in collections),
            "total_ram_size": sum(c.get("ram_data_size", 0) for c in collections),
            "collections": collections
        }
        
        return stats