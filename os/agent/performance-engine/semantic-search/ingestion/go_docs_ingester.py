"""
Go documentation ingestion pipeline for semantic search.
Processes the extracted 23,541 Go documentation chunks with hierarchical structure.
"""

import json
import logging
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional, Generator
from dataclasses import asdict
import time

from ..schemas.metadata import (
    DocumentChunk, DocumentMetadata, ContentType, Scope, 
    HierarchyLevel, DocumentType, create_framework_metadata
)
from ..config.settings import SystemConfig, default_config
from ..setup.collection_manager import CollectionManager
from .embedding_service import get_embedding_service


logger = logging.getLogger(__name__)


class GoDocsIngester:
    """Ingests Go standard library documentation into semantic search system."""
    
    def __init__(self, config: SystemConfig = default_config):
        self.config = config
        self.collection_manager = CollectionManager(config)
        self.embedding_service = get_embedding_service(config)
        self.project_name = "go-stdlib"
        
    def load_go_docs_json(self, json_path: str) -> List[Dict[str, Any]]:
        """Load the extracted Go documentation JSON file."""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                docs = json.load(f)
            
            logger.info(f"Loaded {len(docs)} Go documentation chunks from {json_path}")
            return docs
            
        except Exception as e:
            logger.error(f"Failed to load Go docs JSON: {e}")
            raise
    
    def parse_go_doc_chunk(self, doc_data: Dict[str, Any]) -> DocumentChunk:
        """Parse a single Go documentation chunk into our format."""
        
        # Extract basic information
        chunk_id = doc_data.get("id", str(uuid.uuid4()))
        chunk_type = doc_data.get("type", "function")
        package = doc_data.get("package", "unknown")
        name = doc_data.get("name", "unnamed")
        documentation = doc_data.get("documentation", "")
        code = doc_data.get("code", "")
        signature = doc_data.get("signature", "")
        metadata_raw = doc_data.get("metadata", {})
        
        # Determine hierarchy level
        hierarchy_level = self._get_hierarchy_level(chunk_type)
        
        # Determine document type
        document_type = self._get_document_type(chunk_type)
        
        # Build content with structured format
        content_parts = []
        
        # Add signature if available
        if signature:
            content_parts.append(f"Signature: {signature}")
        
        # Add main documentation
        if documentation:
            content_parts.append(f"Documentation: {documentation}")
        
        # Add code examples if available
        if code:
            content_parts.append(f"Code: {code}")
        
        # Add package context
        content_parts.append(f"Package: {package}")
        content_parts.append(f"Type: {chunk_type}")
        content_parts.append(f"Name: {name}")
        
        content = "\n\n".join(content_parts)
        
        # Create metadata
        metadata = create_framework_metadata(
            id=chunk_id,
            project=self.project_name,
            framework="go",
            source_file=metadata_raw.get("file_path", ""),
            hierarchy_level=hierarchy_level,
            document_type=document_type,
            tags=[chunk_type, package],
            keywords=[name, package, chunk_type],
            summary=self._create_summary(name, chunk_type, documentation),
            custom_fields={
                "go_package": package,
                "go_type": chunk_type,
                "go_signature": signature,
                "source": metadata_raw.get("source", "golang_stdlib")
            }
        )
        
        return DocumentChunk(content=content, metadata=metadata)
    
    def _get_hierarchy_level(self, chunk_type: str) -> HierarchyLevel:
        """Map Go doc chunk type to hierarchy level."""
        type_mapping = {
            "package": HierarchyLevel.PACKAGE,
            "function": HierarchyLevel.FUNCTION,
            "type": HierarchyLevel.CLASS,
            "method": HierarchyLevel.FUNCTION,
            "variable": HierarchyLevel.FUNCTION,
            "constant": HierarchyLevel.FUNCTION
        }
        return type_mapping.get(chunk_type, HierarchyLevel.FUNCTION)
    
    def _get_document_type(self, chunk_type: str) -> DocumentType:
        """Map Go doc chunk type to document type."""
        if chunk_type == "package":
            return DocumentType.GUIDE
        else:
            return DocumentType.API
    
    def _create_summary(self, name: str, chunk_type: str, documentation: str) -> str:
        """Create a concise summary for the chunk."""
        if documentation:
            # Take first sentence of documentation
            first_sentence = documentation.split('.')[0].strip()
            if len(first_sentence) < 100:
                return first_sentence
            else:
                return first_sentence[:97] + "..."
        else:
            return f"Go {chunk_type}: {name}"
    
    def chunk_documents_by_hierarchy(self, docs: List[DocumentChunk]) -> Dict[str, List[DocumentChunk]]:
        """Group documents by hierarchy level for optimized indexing."""
        
        hierarchy_groups = {
            "package": [],
            "file": [],
            "function": [],
            "class": []
        }
        
        for doc in docs:
            level = doc.metadata.hierarchy_level.value
            if level in hierarchy_groups:
                hierarchy_groups[level].append(doc)
            else:
                hierarchy_groups["function"].append(doc)  # Default fallback
        
        return hierarchy_groups
    
    def process_in_batches(
        self, 
        docs: List[DocumentChunk], 
        batch_size: Optional[int] = None
    ) -> Generator[List[DocumentChunk], None, None]:
        """Process documents in batches for memory efficiency."""
        
        batch_size = batch_size or self.config.ingestion.batch_size
        
        for i in range(0, len(docs), batch_size):
            yield docs[i:i + batch_size]
    
    def ingest_to_qdrant(self, docs: List[DocumentChunk]) -> bool:
        """Ingest document chunks into Qdrant."""
        
        if not docs:
            logger.warning("No documents to ingest")
            return True
        
        try:
            # Get collection name for framework docs
            collection_name = self.collection_manager.get_collection_for_content_type(
                self.project_name, 
                ContentType.FRAMEWORK
            )
            
            # Ensure collection exists
            if not self.collection_manager.collection_exists(collection_name):
                logger.info(f"Creating collection: {collection_name}")
                success = self.collection_manager.setup_project_collections(self.project_name)
                if not success:
                    raise RuntimeError(f"Failed to create collection: {collection_name}")
            
            # Prepare documents for embedding
            doc_data = []
            for doc in docs:
                doc_data.append({
                    "content": doc.content,
                    "metadata": doc.metadata.to_dict()
                })
            
            # Generate embeddings
            logger.info(f"Generating embeddings for {len(doc_data)} documents...")
            enhanced_docs = self.embedding_service.encode_documents(doc_data)
            
            # Convert to Qdrant points
            points = []
            for i, doc in enumerate(docs):
                embedding = enhanced_docs[i]["embedding"]
                doc.embedding = embedding
                points.append(doc.to_qdrant_point())
            
            # Upload to Qdrant in batches
            batch_size = 100  # Qdrant batch size
            for i in range(0, len(points), batch_size):
                batch = points[i:i + batch_size]
                
                self.collection_manager.client.upsert(
                    collection_name=collection_name,
                    points=batch
                )
                
                logger.info(f"Uploaded batch {i//batch_size + 1}/{(len(points)-1)//batch_size + 1}")
            
            logger.info(f"Successfully ingested {len(docs)} documents to {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to ingest documents to Qdrant: {e}")
            return False
    
    def ingest_go_docs(
        self, 
        json_path: str, 
        batch_size: Optional[int] = None
    ) -> Dict[str, Any]:
        """Complete ingestion pipeline for Go documentation."""
        
        start_time = time.time()
        
        try:
            # Load raw Go docs
            logger.info("Loading Go documentation JSON...")
            raw_docs = self.load_go_docs_json(json_path)
            
            # Parse into our format
            logger.info("Parsing Go documentation chunks...")
            parsed_docs = []
            failed_parses = 0
            
            for raw_doc in raw_docs:
                try:
                    doc_chunk = self.parse_go_doc_chunk(raw_doc)
                    parsed_docs.append(doc_chunk)
                except Exception as e:
                    logger.warning(f"Failed to parse doc chunk: {e}")
                    failed_parses += 1
            
            logger.info(f"Successfully parsed {len(parsed_docs)} documents ({failed_parses} failed)")
            
            # Group by hierarchy for analysis
            hierarchy_groups = self.chunk_documents_by_hierarchy(parsed_docs)
            for level, docs in hierarchy_groups.items():
                logger.info(f"  {level}: {len(docs)} documents")
            
            # Ingest in batches
            logger.info("Starting ingestion to Qdrant...")
            total_ingested = 0
            total_failed = 0
            
            batch_size = batch_size or self.config.ingestion.batch_size
            
            for batch_num, batch in enumerate(self.process_in_batches(parsed_docs, batch_size)):
                logger.info(f"Processing batch {batch_num + 1} ({len(batch)} documents)...")
                
                success = self.ingest_to_qdrant(batch)
                if success:
                    total_ingested += len(batch)
                else:
                    total_failed += len(batch)
            
            end_time = time.time()
            processing_time = end_time - start_time
            
            # Return summary
            result = {
                "status": "completed",
                "total_raw_docs": len(raw_docs),
                "successfully_parsed": len(parsed_docs),
                "failed_parses": failed_parses,
                "total_ingested": total_ingested,
                "total_failed": total_failed,
                "processing_time_seconds": processing_time,
                "docs_per_second": len(parsed_docs) / processing_time if processing_time > 0 else 0,
                "hierarchy_distribution": {k: len(v) for k, v in hierarchy_groups.items()},
                "project": self.project_name
            }
            
            logger.info(f"Go docs ingestion completed: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Go docs ingestion failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    def verify_ingestion(self) -> Dict[str, Any]:
        """Verify the ingestion was successful."""
        
        collection_name = self.collection_manager.get_collection_for_content_type(
            self.project_name, 
            ContentType.FRAMEWORK
        )
        
        try:
            collection_info = self.collection_manager.get_collection_info(collection_name)
            
            if not collection_info:
                return {"status": "failed", "error": "Collection not found"}
            
            # Test search functionality
            test_query = "HTTP handler function"
            test_embedding = self.embedding_service.encode_single(test_query)
            
            search_results = self.collection_manager.client.search(
                collection_name=collection_name,
                query_vector=test_embedding.tolist(),
                limit=5
            )
            
            return {
                "status": "success",
                "collection_info": collection_info,
                "test_search": {
                    "query": test_query,
                    "results_count": len(search_results),
                    "top_score": search_results[0].score if search_results else 0
                }
            }
            
        except Exception as e:
            return {"status": "failed", "error": str(e)}


def main():
    """CLI entry point for Go docs ingestion."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Ingest Go documentation into semantic search")
    parser.add_argument("json_path", help="Path to Go docs JSON file")
    parser.add_argument("--batch-size", type=int, default=100, help="Batch size for processing")
    parser.add_argument("--config", help="Path to config file")
    
    args = parser.parse_args()
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run ingestion
    ingester = GoDocsIngester()
    result = ingester.ingest_go_docs(args.json_path, args.batch_size)
    
    if result["status"] == "completed":
        print(f"\n✅ Ingestion completed successfully!")
        print(f"   Processed: {result['total_ingested']} documents")
        print(f"   Time: {result['processing_time_seconds']:.1f} seconds")
        print(f"   Speed: {result['docs_per_second']:.1f} docs/sec")
        
        # Verify ingestion
        verification = ingester.verify_ingestion()
        if verification["status"] == "success":
            print(f"✅ Verification passed - {verification['collection_info']['vectors_count']} vectors in collection")
        else:
            print(f"❌ Verification failed: {verification['error']}")
    else:
        print(f"❌ Ingestion failed: {result['error']}")


if __name__ == "__main__":
    main()