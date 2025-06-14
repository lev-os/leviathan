#!/usr/bin/env python3
"""Full ingestion of Go documentation with optimized batching."""

import json
import time
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

def full_ingestion():
    """Ingest all 23,541 Go documentation entries."""
    print("🚀 Starting full Go documentation ingestion...")
    
    # Load all docs
    with open('performance-engine/go_docs.json', 'r') as f:
        all_docs = json.load(f)
    
    total_docs = len(all_docs)
    print(f"📖 Loaded {total_docs} documentation entries")
    
    # Initialize components
    print("🧠 Loading embedding model...")
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    collection_name = "project-go-stdlib-framework-docs"
    
    # Clear existing test data
    print("🧹 Clearing test data...")
    try:
        # Delete points with test_batch=True
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        client.delete(
            collection_name=collection_name,
            points_selector=Filter(
                must=[FieldCondition(key="test_batch", match=MatchValue(value=True))]
            )
        )
    except:
        pass
    
    batch_size = 50  # Smaller batches for stability
    points = []
    processed = 0
    start_time = time.time()
    
    print(f"📦 Processing in batches of {batch_size}...")
    
    for i, doc in enumerate(all_docs):
        try:
            # Build comprehensive content
            content_parts = []
            if doc.get('package'):
                content_parts.append(f"Package: {doc['package']}")
            if doc.get('name'):
                content_parts.append(f"Name: {doc['name']}")
            if doc.get('type'):
                content_parts.append(f"Type: {doc['type']}")
            if doc.get('documentation'):
                content_parts.append(f"Documentation: {doc['documentation']}")
            
            content = "\n\n".join(content_parts)
            
            if not content.strip():
                continue
            
            # Create embedding
            embedding = model.encode([content], normalize_embeddings=True)[0]
            
            # Create point
            point = PointStruct(
                id=10000 + i,  # Offset to avoid conflicts with test data
                vector=embedding.tolist(),
                payload={
                    "content": content,
                    "package": doc.get('package', ''),
                    "name": doc.get('name', ''),
                    "go_type": doc.get('type', ''),
                    "doc_id": doc.get('id', ''),
                    "content_type": "framework",
                    "project": "go-stdlib",
                    "framework": "go",
                    "test_batch": False
                }
            )
            
            points.append(point)
            processed += 1
            
            # Upload batch
            if len(points) >= batch_size:
                client.upsert(collection_name=collection_name, points=points)
                
                # Progress reporting
                batch_num = processed // batch_size
                elapsed = time.time() - start_time
                rate = processed / elapsed if elapsed > 0 else 0
                eta = (total_docs - processed) / rate if rate > 0 else 0
                
                print(f"✅ Batch {batch_num}: {len(points)} docs | {processed}/{total_docs} | {rate:.1f} docs/sec | ETA: {eta/60:.1f}m")
                points = []
                
                # Brief pause to prevent overwhelming
                time.sleep(0.1)
            
        except Exception as e:
            print(f"❌ Error processing doc {i}: {e}")
            continue
    
    # Upload remaining points
    if points:
        client.upsert(collection_name=collection_name, points=points)
        print(f"✅ Final batch: {len(points)} docs")
    
    elapsed = time.time() - start_time
    print(f"\n🎉 Ingestion completed!")
    print(f"   📊 Processed: {processed}/{total_docs} documents")
    print(f"   ⏱️  Time: {elapsed/60:.1f} minutes")
    print(f"   📈 Rate: {processed/elapsed:.1f} docs/second")
    
    # Final collection stats
    collection_info = client.get_collection(collection_name)
    print(f"   💾 Total points in collection: {collection_info.points_count}")

def test_search_after_ingestion():
    """Test search functionality with the full dataset."""
    print("\n🔍 Testing search with full dataset...")
    
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    collection_name = "project-go-stdlib-framework-docs"
    
    test_queries = [
        "file compression and archives",
        "HTTP client and server",
        "JSON parsing and encoding", 
        "regular expressions and pattern matching",
        "database connections and SQL"
    ]
    
    for query in test_queries:
        print(f"\n🔎 Query: '{query}'")
        query_embedding = model.encode([query], normalize_embeddings=True)[0]
        
        from qdrant_client.models import QueryRequest
        search_results = client.query_points(
            collection_name=collection_name,
            query=query_embedding.tolist(),
            limit=3
        )
        
        for i, result in enumerate(search_results.points):
            print(f"   {i+1}. {result.payload.get('package')}/{result.payload.get('name')} (score: {result.score:.3f})")

if __name__ == "__main__":
    full_ingestion()
    test_search_after_ingestion()