#!/usr/bin/env python3
"""Search script for data-analysis semantic search."""

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

def search_data_analysis(query: str, limit: int = 5):
    """Search data-analysis documentation."""
    print(f"🔍 Searching data-analysis: '{query}'")
    
    # Initialize components
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    
    # Search collections
    collections = {
        "framework_docs": "project-data-analysis-framework-docs",
        "requirements": "project-data-analysis-requirements",
        "local_principles": "project-data-analysis-local-principles"
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
    search_data_analysis("your search query here")
