#!/usr/bin/env python3
"""Search script for my-go-service semantic search."""

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

def search_my_go_service(query: str, limit: int = 5):
    """Search my-go-service documentation."""
    print(f"🔍 Searching my-go-service: '{query}'")
    
    # Initialize components
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    
    # Search collections
    collections = {
        "framework_docs": "project-my-go-service-framework-docs",
        "requirements": "project-my-go-service-requirements",
        "local_principles": "project-my-go-service-local-principles"
}
    
    # Create query embedding
    query_embedding = model.encode([query], normalize_embeddings=True)[0]
    
    # Search framework docs
    results = client.query_points(
        collection_name=collections["framework_docs"],
        query=query_embedding.tolist(),
        limit=limit
    )
    
    print(f"📊 Found {len(results.points)} results:")
    for i, result in enumerate(results.points, 1):
        print(f"  {i}. Score: {result.score:.3f}")
        print(f"     Content: {result.payload.get('content', '')[:100]}...")

if __name__ == "__main__":
    search_my_go_service("your search query here")
