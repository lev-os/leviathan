"""
Configuration settings for the enterprise semantic search system.
"""

import os
from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class EmbeddingConfig:
    """Embedding model configuration."""
    model_name: str = "sentence-transformers/all-mpnet-base-v2"
    dimension: int = 768
    batch_size: int = 32
    normalize: bool = True
    device: str = "cpu"  # or "cuda" if available


@dataclass
class QdrantConfig:
    """Qdrant vector database configuration."""
    host: str = "localhost"
    port: int = 6333
    api_key: Optional[str] = None
    timeout: int = 30
    prefer_grpc: bool = True
    
    # Collection settings
    vector_size: int = 768
    distance_metric: str = "Cosine"
    hnsw_config: Dict = None
    
    def __post_init__(self):
        if self.hnsw_config is None:
            self.hnsw_config = {
                "m": 16,
                "ef_construct": 100,
                "full_scan_threshold": 10000
            }


@dataclass
class SearchConfig:
    """Search and retrieval configuration."""
    default_limit: int = 10
    max_limit: int = 100
    score_threshold: float = 0.7
    
    # Multi-stage retrieval
    enable_reranking: bool = True
    rerank_top_k: int = 50
    
    # Query expansion
    enable_query_expansion: bool = False
    expansion_model: str = "all-MiniLM-L6-v2"


@dataclass
class CollectionConfig:
    """Collection structure configuration."""
    
    # Global collections
    global_principles: str = "global-principles"
    unified_index: str = "unified-index"
    
    # Project-specific collection templates
    framework_docs_suffix: str = "framework-docs"
    requirements_suffix: str = "requirements"
    local_principles_suffix: str = "local-principles"
    
    def get_project_collections(self, project: str) -> Dict[str, str]:
        """Get all collection names for a project."""
        return {
            "framework_docs": f"project-{project}-{self.framework_docs_suffix}",
            "requirements": f"project-{project}-{self.requirements_suffix}",
            "local_principles": f"project-{project}-{self.local_principles_suffix}"
        }
    
    def get_all_collections(self, projects: List[str]) -> List[str]:
        """Get all collection names for multiple projects."""
        collections = [self.global_principles, self.unified_index]
        
        for project in projects:
            project_collections = self.get_project_collections(project)
            collections.extend(project_collections.values())
        
        return collections


@dataclass
class IngestionConfig:
    """Data ingestion configuration."""
    
    # Chunking settings
    max_chunk_size: int = 512  # tokens
    chunk_overlap: int = 50    # tokens
    
    # Framework-specific settings
    go_docs_chunk_size: int = 300
    requirements_chunk_size: int = 400
    principles_chunk_size: int = 600
    
    # Processing
    parallel_workers: int = 4
    batch_size: int = 100
    
    # Content extraction
    extract_code_examples: bool = True
    preserve_markdown: bool = True
    include_metadata_in_content: bool = False


@dataclass
class SystemConfig:
    """Main system configuration."""
    
    embedding: EmbeddingConfig = EmbeddingConfig()
    qdrant: QdrantConfig = QdrantConfig()
    search: SearchConfig = SearchConfig()
    collections: CollectionConfig = CollectionConfig()
    ingestion: IngestionConfig = IngestionConfig()
    
    # System settings
    log_level: str = "INFO"
    enable_metrics: bool = True
    metrics_port: int = 8001
    
    # API settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    enable_cors: bool = True
    
    @classmethod
    def from_env(cls) -> 'SystemConfig':
        """Create configuration from environment variables."""
        config = cls()
        
        # Override with environment variables
        if os.getenv("QDRANT_HOST"):
            config.qdrant.host = os.getenv("QDRANT_HOST")
        if os.getenv("QDRANT_PORT"):
            config.qdrant.port = int(os.getenv("QDRANT_PORT"))
        if os.getenv("QDRANT_API_KEY"):
            config.qdrant.api_key = os.getenv("QDRANT_API_KEY")
        
        if os.getenv("EMBEDDING_MODEL"):
            config.embedding.model_name = os.getenv("EMBEDDING_MODEL")
        if os.getenv("EMBEDDING_DEVICE"):
            config.embedding.device = os.getenv("EMBEDDING_DEVICE")
        
        if os.getenv("API_HOST"):
            config.api_host = os.getenv("API_HOST")
        if os.getenv("API_PORT"):
            config.api_port = int(os.getenv("API_PORT"))
        
        if os.getenv("LOG_LEVEL"):
            config.log_level = os.getenv("LOG_LEVEL")
        
        return config


# Default configuration instance
default_config = SystemConfig()


# Project templates for rapid deployment
PROJECT_TEMPLATES = {
    "go-project": {
        "framework": "go",
        "document_types": ["api", "guide", "tutorial"],
        "principle_categories": ["error-handling", "concurrency", "testing", "performance"],
        "default_collections": ["framework-docs", "requirements", "local-principles"]
    },
    "react-project": {
        "framework": "react",
        "document_types": ["api", "component", "hook", "guide"],
        "principle_categories": ["state-management", "component-design", "performance", "testing"],
        "default_collections": ["framework-docs", "requirements", "local-principles"]
    },
    "python-project": {
        "framework": "python",
        "document_types": ["api", "module", "guide", "tutorial"],
        "principle_categories": ["code-style", "async", "testing", "packaging"],
        "default_collections": ["framework-docs", "requirements", "local-principles"]
    }
}


def get_project_template(framework: str) -> Dict:
    """Get project template configuration."""
    return PROJECT_TEMPLATES.get(f"{framework}-project", PROJECT_TEMPLATES["go-project"])