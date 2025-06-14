#!/usr/bin/env python3
"""Ingest Go documentation into semantic search system."""

import json
import uuid
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
from sentence_transformers import SentenceTransformer
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

class ContentType(Enum):
    FRAMEWORK = "framework"
    REQUIREMENT = "requirement" 
    PRINCIPLE = "principle"

class HierarchyLevel(Enum):
    PACKAGE = "package"
    FUNCTION = "function"
    CLASS = "class"
    CONCEPT = "concept"

@dataclass
class DocumentMetadata:
    id: str
    content_type: ContentType
    project: str
    framework: Optional[str] = None
    hierarchy_level: HierarchyLevel = HierarchyLevel.CONCEPT
    package: Optional[str] = None
    function_name: Optional[str] = None
    source_file: Optional[str] = None
    go_type: Optional[str] = None

class GoDocsIngester:
    def __init__(self):
        self.embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
        self.client = QdrantClient(host="localhost", port=6333)
        self.collection_name = "project-go-stdlib-framework-docs"
        
    def parse_go_doc_chunk(self, doc_data: Dict[str, Any]) -> tuple[str, DocumentMetadata]:
        """Parse a Go doc chunk into content and metadata."""
        
        # Extract basic info
        package = doc_data.get("package", "")
        name = doc_data.get("name", "")
        doc_type = doc_data.get("type", "")
        signature = doc_data.get("signature", "")
        documentation = doc_data.get("documentation", "")
        
        # Build content with context
        content_parts = []
        if package:
            content_parts.append(f"Package: {package}")
        if name:
            content_parts.append(f"Name: {name}")
        if signature:
            content_parts.append(f"Signature: {signature}")
        if documentation:
            content_parts.append(f"Documentation: {documentation}")
        
        content = "\n\n".join(content_parts)
        
        # Determine hierarchy level based on Go type
        hierarchy_level = HierarchyLevel.CONCEPT
        if doc_type in ["package"]:
            hierarchy_level = HierarchyLevel.PACKAGE
        elif doc_type in ["func", "method"]:
            hierarchy_level = HierarchyLevel.FUNCTION
        elif doc_type in ["type", "struct", "interface"]:
            hierarchy_level = HierarchyLevel.CLASS
        
        # Create metadata
        metadata = DocumentMetadata(
            id=str(uuid.uuid4()),
            content_type=ContentType.FRAMEWORK,
            project="go-stdlib",
            framework="go",
            hierarchy_level=hierarchy_level,
            package=package,
            function_name=name if doc_type in ["func", "method"] else None,
            source_file=f"{package}/{name}",
            go_type=doc_type
        )
        
        return content, metadata
    
    def create_embedding(self, text: str) -> List[float]:
        """Create embedding for text."""
        embedding = self.embedding_model.encode([text], normalize_embeddings=True)[0]
        return embedding.tolist()
    
    def ingest_documents(self, docs_file: str, batch_size: int = 100):
        """Ingest Go documentation in batches."""
        print(f"📖 Loading Go documentation from {docs_file}...")
        
        with open(docs_file, 'r') as f:
            docs_data = json.load(f)
        
        total_docs = len(docs_data)
        print(f"Found {total_docs} documentation entries")
        
        points = []
        processed = 0
        
        for i, doc_entry in enumerate(docs_data):
            try:
                content, metadata = self.parse_go_doc_chunk(doc_entry)
                
                if not content.strip():
                    continue
                    
                # Create embedding
                embedding = self.create_embedding(content)
                
                # Create point for Qdrant
                point = PointStruct(
                    id=metadata.id,
                    vector=embedding,
                    payload={
                        "content": content,
                        "content_type": metadata.content_type.value,
                        "project": metadata.project,
                        "framework": metadata.framework,
                        "hierarchy_level": metadata.hierarchy_level.value,
                        "package": metadata.package,
                        "function_name": metadata.function_name,
                        "source_file": metadata.source_file,
                        "go_type": metadata.go_type
                    }
                )
                
                points.append(point)
                processed += 1
                
                # Upload batch
                if len(points) >= batch_size:
                    self.client.upsert(
                        collection_name=self.collection_name,
                        points=points
                    )
                    print(f"✅ Uploaded batch {processed // batch_size}: {len(points)} docs")
                    points = []
                
                if processed % 1000 == 0:
                    print(f"📈 Processed {processed}/{total_docs} documents...")
                    
            except Exception as e:
                print(f"❌ Error processing doc {i}: {e}")
                continue
        
        # Upload remaining points
        if points:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            print(f"✅ Uploaded final batch: {len(points)} docs")
        
        print(f"\n🎉 Successfully ingested {processed} Go documentation entries!")
        
        # Get collection info
        collection_info = self.client.get_collection(self.collection_name)
        print(f"📊 Collection statistics:")
        print(f"   - Total points: {collection_info.points_count}")
        print(f"   - Vector size: {collection_info.config.params.vectors.size}")

def main():
    """Main ingestion function."""
    print("🚀 Starting Go documentation ingestion...")
    
    ingester = GoDocsIngester()
    docs_file = "performance-engine/go_docs.json"
    
    print(f"📂 Ingesting from: {docs_file}")
    ingester.ingest_documents(docs_file)
    
    print("\n✨ Go documentation ingestion complete!")

if __name__ == "__main__":
    main()