"""
System initialization script for enterprise semantic search.
Sets up Qdrant collections and tests the complete pipeline.
"""

import logging
import time
import json
from pathlib import Path
from typing import Dict, Any, List
import argparse

from ..config.settings import SystemConfig, default_config
from ..setup.collection_manager import CollectionManager
from ..ingestion.embedding_service import get_embedding_service
from ..ingestion.go_docs_ingester import GoDocsIngester


logger = logging.getLogger(__name__)


class SystemInitializer:
    """Initializes the complete semantic search system."""
    
    def __init__(self, config: SystemConfig = default_config):
        self.config = config
        self.collection_manager = CollectionManager(config)
        self.embedding_service = get_embedding_service(config)
    
    def check_prerequisites(self) -> Dict[str, bool]:
        """Check if all prerequisites are met."""
        
        checks = {}
        
        # Check Qdrant connection
        try:
            checks["qdrant_connection"] = self.collection_manager.health_check()
        except Exception as e:
            logger.error(f"Qdrant connection failed: {e}")
            checks["qdrant_connection"] = False
        
        # Check embedding model
        try:
            model_info = self.embedding_service.get_model_info()
            checks["embedding_model"] = model_info.get("status") == "ready"
        except Exception as e:
            logger.error(f"Embedding model failed: {e}")
            checks["embedding_model"] = False
        
        # Check dependencies
        try:
            import qdrant_client
            import sentence_transformers
            import torch
            checks["dependencies"] = True
        except ImportError as e:
            logger.error(f"Missing dependencies: {e}")
            checks["dependencies"] = False
        
        return checks
    
    def setup_global_collections(self) -> bool:
        """Set up global collections."""
        
        logger.info("🌍 Setting up global collections...")
        
        success = self.collection_manager.setup_global_collections()
        
        if success:
            logger.info("✅ Global collections created successfully")
        else:
            logger.error("❌ Failed to create global collections")
        
        return success
    
    def setup_test_project(self) -> bool:
        """Set up a test project for validation."""
        
        logger.info("🧪 Setting up test project...")
        
        test_project = "test-system"
        success = self.collection_manager.setup_project_collections(test_project)
        
        if success:
            logger.info("✅ Test project collections created")
        else:
            logger.error("❌ Failed to create test project collections")
        
        return success
    
    def test_embedding_pipeline(self) -> Dict[str, Any]:
        """Test the embedding generation pipeline."""
        
        logger.info("🔧 Testing embedding pipeline...")
        
        test_texts = [
            "Go HTTP handler function for user authentication",
            "React component for displaying user profile information", 
            "Programming principle: Always handle errors gracefully",
            "Requirement: System must support 1000 concurrent users",
            "Python function for data validation and processing"
        ]
        
        try:
            # Test single encoding
            start_time = time.time()
            single_embedding = self.embedding_service.encode_single(test_texts[0])
            single_time = time.time() - start_time
            
            # Test batch encoding
            batch_result = self.embedding_service.encode_batch(test_texts)
            
            # Test similarity computation
            similarities = self.embedding_service.compute_similarity(
                single_embedding, batch_result.embeddings
            )
            
            result = {
                "status": "success",
                "single_encoding_time_ms": single_time * 1000,
                "batch_encoding_time_ms": batch_result.processing_time * 1000,
                "batch_size": len(test_texts),
                "embedding_dimension": len(single_embedding),
                "similarities": similarities.tolist(),
                "model_info": self.embedding_service.get_model_info()
            }
            
            logger.info(f"✅ Embedding pipeline test passed")
            logger.info(f"   Model: {result['model_info']['model_name']}")
            logger.info(f"   Dimension: {result['embedding_dimension']}")
            logger.info(f"   Single encoding: {result['single_encoding_time_ms']:.1f}ms")
            logger.info(f"   Batch encoding: {result['batch_encoding_time_ms']:.1f}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Embedding pipeline test failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def test_search_pipeline(self) -> Dict[str, Any]:
        """Test the complete search pipeline with sample data."""
        
        logger.info("🔍 Testing search pipeline...")
        
        try:
            # Create test documents
            test_docs = [
                {
                    "id": "test-doc-1",
                    "content": "Go HTTP handler function that processes user login requests with JWT token generation",
                    "metadata": {
                        "content_type": "framework",
                        "project": "test-system",
                        "framework": "go",
                        "document_type": "api",
                        "hierarchy_level": "function"
                    }
                },
                {
                    "id": "test-doc-2", 
                    "content": "Programming principle: Always validate user input to prevent security vulnerabilities",
                    "metadata": {
                        "content_type": "principle",
                        "project": "test-system",
                        "scope": "project",
                        "document_type": "standard"
                    }
                },
                {
                    "id": "test-doc-3",
                    "content": "User authentication requirement: System must support OAuth2 and JWT token-based authentication",
                    "metadata": {
                        "content_type": "requirement",
                        "project": "test-system",
                        "priority": "high",
                        "status": "active"
                    }
                }
            ]
            
            # Generate embeddings
            enhanced_docs = self.embedding_service.encode_documents(test_docs)
            
            # Get test collection
            collection_name = self.collection_manager.get_collection_for_content_type(
                "test-system", 
                "framework"  # Just use one collection for testing
            )
            
            # Insert documents
            points = []
            for doc in enhanced_docs:
                points.append({
                    "id": doc["id"],
                    "vector": doc["embedding"],
                    "payload": {**doc["metadata"], "content": doc["content"]}
                })
            
            self.collection_manager.client.upsert(
                collection_name=collection_name,
                points=points
            )
            
            # Test search
            search_queries = [
                "HTTP authentication",
                "security principles",
                "user login requirements"
            ]
            
            search_results = {}
            for query in search_queries:
                query_embedding = self.embedding_service.encode_single(query)
                
                results = self.collection_manager.client.search(
                    collection_name=collection_name,
                    query_vector=query_embedding.tolist(),
                    limit=3,
                    with_payload=True
                )
                
                search_results[query] = [
                    {
                        "id": r.id,
                        "score": r.score,
                        "content": r.payload.get("content", "")[:100] + "..."
                    }
                    for r in results
                ]
            
            # Clean up test data
            self.collection_manager.client.delete(
                collection_name=collection_name,
                points_selector=[p["id"] for p in points]
            )
            
            result = {
                "status": "success",
                "test_docs_count": len(test_docs),
                "search_queries": search_queries,
                "search_results": search_results,
                "collection_used": collection_name
            }
            
            logger.info("✅ Search pipeline test passed")
            for query, results in search_results.items():
                logger.info(f"   Query '{query}': {len(results)} results")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Search pipeline test failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def benchmark_system(self) -> Dict[str, Any]:
        """Run system benchmarks."""
        
        logger.info("⚡ Running system benchmarks...")
        
        try:
            # Embedding benchmark
            embedding_benchmark = self.embedding_service.benchmark()
            
            # Collection stats
            collection_stats = self.collection_manager.get_collection_stats()
            
            result = {
                "embedding_performance": embedding_benchmark,
                "collection_stats": collection_stats,
                "system_config": {
                    "embedding_model": self.config.embedding.model_name,
                    "vector_dimension": self.config.embedding.dimension,
                    "batch_size": self.config.embedding.batch_size,
                    "qdrant_host": self.config.qdrant.host
                }
            }
            
            logger.info("✅ System benchmark completed")
            logger.info(f"   Embedding speed: {embedding_benchmark['batch_encoding']['texts_per_second']:.1f} texts/sec")
            logger.info(f"   Collections: {collection_stats['total_collections']}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ System benchmark failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def initialize_system(
        self, 
        skip_go_docs: bool = False,
        go_docs_path: str = None
    ) -> Dict[str, Any]:
        """Complete system initialization."""
        
        logger.info("🚀 Initializing Enterprise Semantic Search System")
        logger.info("=" * 60)
        
        initialization_result = {
            "status": "in_progress",
            "steps": {},
            "start_time": time.time()
        }
        
        try:
            # Step 1: Check prerequisites
            logger.info("1️⃣ Checking prerequisites...")
            prerequisites = self.check_prerequisites()
            
            if not all(prerequisites.values()):
                failed_checks = [k for k, v in prerequisites.items() if not v]
                raise RuntimeError(f"Prerequisites failed: {failed_checks}")
            
            initialization_result["steps"]["prerequisites"] = "✅ passed"
            
            # Step 2: Set up global collections
            logger.info("2️⃣ Setting up global collections...")
            global_success = self.setup_global_collections()
            initialization_result["steps"]["global_collections"] = "✅ completed" if global_success else "❌ failed"
            
            # Step 3: Set up test project
            logger.info("3️⃣ Setting up test project...")
            test_success = self.setup_test_project()
            initialization_result["steps"]["test_project"] = "✅ completed" if test_success else "❌ failed"
            
            # Step 4: Test embedding pipeline
            logger.info("4️⃣ Testing embedding pipeline...")
            embedding_test = self.test_embedding_pipeline()
            initialization_result["steps"]["embedding_test"] = "✅ passed" if embedding_test["status"] == "success" else "❌ failed"
            initialization_result["embedding_test"] = embedding_test
            
            # Step 5: Test search pipeline
            logger.info("5️⃣ Testing search pipeline...")
            search_test = self.test_search_pipeline()
            initialization_result["steps"]["search_test"] = "✅ passed" if search_test["status"] == "success" else "❌ failed"
            initialization_result["search_test"] = search_test
            
            # Step 6: Run benchmarks
            logger.info("6️⃣ Running system benchmarks...")
            benchmark = self.benchmark_system()
            initialization_result["steps"]["benchmark"] = "✅ completed"
            initialization_result["benchmark"] = benchmark
            
            # Step 7: Optional Go docs ingestion
            if not skip_go_docs and go_docs_path:
                logger.info("7️⃣ Ingesting Go documentation...")
                ingester = GoDocsIngester(self.config)
                go_result = ingester.ingest_go_docs(go_docs_path)
                initialization_result["steps"]["go_docs"] = "✅ completed" if go_result["status"] == "completed" else "❌ failed"
                initialization_result["go_docs_result"] = go_result
            else:
                initialization_result["steps"]["go_docs"] = "⏭️ skipped"
            
            initialization_result["status"] = "✅ completed"
            initialization_result["end_time"] = time.time()
            initialization_result["total_time"] = initialization_result["end_time"] - initialization_result["start_time"]
            
            logger.info("🎉 System initialization completed successfully!")
            logger.info(f"   Total time: {initialization_result['total_time']:.1f} seconds")
            
        except Exception as e:
            logger.error(f"❌ System initialization failed: {e}")
            initialization_result["status"] = "❌ failed"
            initialization_result["error"] = str(e)
            initialization_result["end_time"] = time.time()
            initialization_result["total_time"] = initialization_result["end_time"] - initialization_result["start_time"]
        
        return initialization_result
    
    def save_initialization_report(self, result: Dict[str, Any], output_file: str):
        """Save initialization report to file."""
        
        report = {
            "initialization_report": result,
            "system_info": {
                "config": {
                    "embedding_model": self.config.embedding.model_name,
                    "vector_dimension": self.config.embedding.dimension,
                    "qdrant_host": self.config.qdrant.host,
                    "api_port": self.config.api_port
                },
                "collections": self.collection_manager.list_all_collections()
            },
            "next_steps": [
                "Start the search API: python -m api.search_api",
                "Test search: curl 'http://localhost:8000/health'", 
                "Set up new projects: python -m deploy.setup_new_project",
                "Ingest documentation: python -m ingestion.go_docs_ingester"
            ]
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"📋 Initialization report saved to: {output_file}")


def main():
    """CLI entry point for system initialization."""
    
    parser = argparse.ArgumentParser(description="Initialize enterprise semantic search system")
    parser.add_argument("--skip-go-docs", action="store_true", help="Skip Go documentation ingestion")
    parser.add_argument("--go-docs-path", help="Path to Go docs JSON file")
    parser.add_argument("--output-report", default="initialization_report.json", help="Output report file")
    parser.add_argument("--config", help="Custom configuration file")
    
    args = parser.parse_args()
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize system
    config = SystemConfig.from_env()
    initializer = SystemInitializer(config)
    
    result = initializer.initialize_system(
        skip_go_docs=args.skip_go_docs,
        go_docs_path=args.go_docs_path
    )
    
    # Save report
    initializer.save_initialization_report(result, args.output_report)
    
    # Print summary
    print("\n" + "="*60)
    print("SEMANTIC SEARCH SYSTEM INITIALIZATION")
    print("="*60)
    print(f"Status: {result['status']}")
    print(f"Total time: {result['total_time']:.1f} seconds")
    
    print("\nInitialization Steps:")
    for step, status in result['steps'].items():
        print(f"  {step}: {status}")
    
    if result['status'] == "✅ completed":
        print("\n🎉 System is ready!")
        print("\nNext steps:")
        print("  1. Start API server: python -m api.search_api")
        print("  2. Test health: curl http://localhost:8000/health")
        print("  3. Set up projects: python -m deploy.setup_new_project <name> <framework>")
        
        if 'go_docs_result' in result:
            go_result = result['go_docs_result']
            print(f"  4. Go docs ingested: {go_result.get('total_ingested', 0)} documents")
    else:
        print(f"\n❌ Initialization failed: {result.get('error', 'Unknown error')}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())