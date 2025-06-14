#!/usr/bin/env python3
"""Initialize semantic search system with direct imports."""

import json
from dataclasses import dataclass
from typing import Dict, List, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

@dataclass 
class QdrantConfig:
    host: str = "localhost"
    port: int = 6333
    api_key: Optional[str] = None

@dataclass
class EmbeddingConfig:
    model_name: str = "sentence-transformers/all-mpnet-base-v2"
    dimension: int = 768

class CollectionManager:
    def __init__(self):
        self.qdrant_config = QdrantConfig()
        self.embedding_config = EmbeddingConfig()
        self.client = QdrantClient(
            host=self.qdrant_config.host,
            port=self.qdrant_config.port,
            api_key=self.qdrant_config.api_key
        )
    
    def create_collection(self, name: str, description: str = "") -> str:
        """Create a single collection."""
        vector_config = VectorParams(
            size=self.embedding_config.dimension,
            distance=Distance.COSINE
        )
        
        try:
            self.client.create_collection(
                collection_name=name,
                vectors_config=vector_config
            )
            print(f"✅ Created collection: {name}")
            return name
        except Exception as e:
            if "already exists" in str(e):
                print(f"⚠️  Collection {name} already exists")
                return name
            else:
                raise e
    
    def create_project_collections(self, project: str, framework: str) -> Dict[str, str]:
        """Create all collections for a project."""
        collections = {
            "framework_docs": f"project-{project}-framework-docs",
            "requirements": f"project-{project}-requirements", 
            "local_principles": f"project-{project}-local-principles"
        }
        
        for collection_type, collection_name in collections.items():
            self.create_collection(collection_name, f"{framework} {collection_type} for {project}")
        
        return collections
    
    def create_global_principles_collection(self) -> str:
        """Create global principles collection."""
        name = "global-principles"
        self.create_collection(name, "Global programming principles and best practices")
        return name

def main():
    """Initialize collections for Go stdlib project."""
    print("🚀 Initializing semantic search system...")
    
    manager = CollectionManager()
    
    print("\n📚 Creating collections for Go stdlib project...")
    collections = manager.create_project_collections('go-stdlib', 'go')
    
    print(f"\n✅ Project collections created:")
    for collection_type, collection_name in collections.items():
        print(f"  - {collection_type}: {collection_name}")
    
    print("\n🌍 Creating global principles collection...")
    global_collection = manager.create_global_principles_collection()
    print(f"  - global-principles: {global_collection}")
    
    # Test connection
    print("\n🔍 Testing Qdrant connection...")
    collections_info = manager.client.get_collections()
    print(f"Total collections: {len(collections_info.collections)}")
    
    for collection in collections_info.collections:
        print(f"  - {collection.name}")
    
    print("\n🎉 System initialized successfully!")
    print("Ready to ingest Go documentation!")

if __name__ == "__main__":
    main()