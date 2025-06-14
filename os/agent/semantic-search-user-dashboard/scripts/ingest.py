#!/usr/bin/env python3
"""Ingestion script for user-dashboard (react) semantic search."""

import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

def ingest_react_docs():
    """Ingest react documentation for user-dashboard."""
    print("🚀 Starting user-dashboard documentation ingestion...")
    
    # Initialize components
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    
    # Collection names
    collections = {
        "framework_docs": "project-{name}-framework-docs",
        "requirements": "project-{name}-requirements",
        "local_principles": "project-{name}-local-principles"
}
    
    print("📚 Ready to ingest documentation")
    print("💡 Add your react documentation files to data/framework_docs/")
    print("📋 Add requirements to data/requirements/")
    print("🎯 Add principles to data/principles/")

if __name__ == "__main__":
    ingest_react_docs()
