#!/usr/bin/env python3
"""Test semantic search system with a small subset first."""

import json
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue

def test_small_batch():
    """Test with just 10 documents first."""
    print("🧪 Testing semantic search with small batch...")
    
    # Load subset of docs
    with open('performance-engine/go_docs.json', 'r') as f:
        all_docs = json.load(f)
    
    test_docs = all_docs[:10]  # Just first 10 docs
    print(f"Testing with {len(test_docs)} documents")
    
    # Initialize components
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    collection_name = "project-go-stdlib-framework-docs"
    
    # Process and upload
    points = []
    for i, doc in enumerate(test_docs):
        content = f"Package: {doc.get('package', '')}\nName: {doc.get('name', '')}\nDocumentation: {doc.get('documentation', '')}"
        
        embedding = model.encode([content], normalize_embeddings=True)[0]
        
        point = PointStruct(
            id=i,
            vector=embedding.tolist(),
            payload={
                "content": content,
                "package": doc.get('package', ''),
                "name": doc.get('name', ''),
                "go_type": doc.get('type', ''),
                "test_batch": True
            }
        )
        points.append(point)
    
    # Upload to Qdrant
    client.upsert(collection_name=collection_name, points=points)
    print(f"✅ Uploaded {len(points)} test documents")
    
    # Test search
    print("\n🔍 Testing search functionality...")
    query = "file compression and archives"
    query_embedding = model.encode([query], normalize_embeddings=True)[0]
    
    search_results = client.search(
        collection_name=collection_name,
        query_vector=query_embedding.tolist(),
        limit=3,
        query_filter=Filter(
            must=[FieldCondition(key="test_batch", match=MatchValue(value=True))]
        )
    )
    
    print(f"Search query: '{query}'")
    print(f"Found {len(search_results)} results:")
    
    for i, result in enumerate(search_results):
        print(f"\n{i+1}. Score: {result.score:.3f}")
        print(f"   Package: {result.payload.get('package')}")
        print(f"   Name: {result.payload.get('name')}")
        print(f"   Content preview: {result.payload.get('content')[:100]}...")
    
    print("\n✅ Search test completed successfully!")
    
    # Check collection stats
    collection_info = client.get_collection(collection_name)
    print(f"\n📊 Collection stats: {collection_info.points_count} total points")

if __name__ == "__main__":
    test_small_batch()