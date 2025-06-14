#!/usr/bin/env python3
"""Ingestion script for data-analysis (python) semantic search."""

import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

def ingest_python_docs():
    """Ingest python documentation for data-analysis."""
    print("🚀 Starting data-analysis documentation ingestion...")
    
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
    print("💡 Add your python documentation files to data/framework_docs/")
    print("📋 Add requirements to data/requirements/")
    print("🎯 Add principles to data/principles/")

if __name__ == "__main__":
    ingest_python_docs()
