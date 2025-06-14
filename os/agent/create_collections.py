#!/usr/bin/env python3
"""Create Qdrant collections for Go stdlib semantic search."""

import sys
import os
from pathlib import Path

# Add semantic-search to Python path
sys.path.insert(0, str(Path(__file__).parent / "performance-engine" / "semantic-search"))

from setup.collection_manager import CollectionManager
from config.settings import SystemConfig

def main():
    """Initialize collections for Go stdlib project."""
    config = SystemConfig()
    manager = CollectionManager(config)
    
    print("Creating collections for Go stdlib project...")
    collections = manager.create_project_collections('go-stdlib', 'go')
    
    print("✅ Collections created successfully:")
    for collection_type, collection_name in collections.items():
        print(f"  - {collection_type}: {collection_name}")
    
    # Also create global principles collection
    print("\n🌍 Creating global principles collection...")
    global_collection = manager.create_global_principles_collection()
    print(f"  - global-principles: {global_collection}")
    
    print("\n🎉 System initialized and ready for ingestion!")

if __name__ == "__main__":
    main()