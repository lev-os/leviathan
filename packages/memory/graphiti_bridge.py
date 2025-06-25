#!/usr/bin/env python3
"""
Graphiti Bridge - Python script to handle Graphiti operations for Node.js
Provides a command-line interface to Graphiti functionality
"""

import sys
import json
import asyncio
from typing import Dict, Any
from graphiti_core import Graphiti

class GraphitiBridge:
    def __init__(self, neo4j_uri: str, username: str, password: str):
        self.graphiti = Graphiti(
            uri=neo4j_uri,
            user=username,
            password=password
        )
    
    async def connect(self) -> Dict[str, Any]:
        """Initialize Graphiti connection"""
        try:
            await self.graphiti.connect()
            return {"success": True, "message": "Connected to Graphiti"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def create_memory(self, content: str, memory_type: str = "general", metadata: Dict = None) -> Dict[str, Any]:
        """Create a new memory in Graphiti"""
        try:
            if metadata is None:
                metadata = {}
            
            result = await self.graphiti.create_memory(
                content=content,
                memory_type=memory_type,
                metadata=metadata
            )
            return {"success": True, "memory_id": str(result), "content": content}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def search(self, query: str, num_results: int = 10) -> Dict[str, Any]:
        """Search memories in Graphiti"""
        try:
            results = await self.graphiti.search(query, num_results=num_results)
            return {
                "success": True, 
                "results": [{"content": str(r), "edge": str(r)} for r in results]
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_status(self) -> Dict[str, Any]:
        """Get Graphiti system status"""
        try:
            # Simple status check - try to perform a basic operation
            await self.graphiti.search("test", num_results=1)
            return {
                "success": True,
                "connected": True,
                "message": "Graphiti is operational"
            }
        except Exception as e:
            return {
                "success": False,
                "connected": False,
                "error": str(e)
            }
    
    async def close(self) -> Dict[str, Any]:
        """Close Graphiti connection"""
        try:
            await self.graphiti.close()
            return {"success": True, "message": "Connection closed"}
        except Exception as e:
            return {"success": False, "error": str(e)}

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    # Parse connection parameters
    neo4j_uri = sys.argv[2] if len(sys.argv) > 2 else "bolt://localhost:7687"
    username = sys.argv[3] if len(sys.argv) > 3 else "neo4j"
    password = sys.argv[4] if len(sys.argv) > 4 else "lev-mem123"
    
    bridge = GraphitiBridge(neo4j_uri, username, password)
    
    try:
        if command == "connect":
            result = await bridge.connect()
        elif command == "status":
            await bridge.connect()  # Connect first
            result = await bridge.get_status()
        elif command == "create":
            content = sys.argv[5] if len(sys.argv) > 5 else "Test memory"
            memory_type = sys.argv[6] if len(sys.argv) > 6 else "general"
            await bridge.connect()
            result = await bridge.create_memory(content, memory_type)
        elif command == "search":
            query = sys.argv[5] if len(sys.argv) > 5 else "test"
            num_results = int(sys.argv[6]) if len(sys.argv) > 6 else 10
            await bridge.connect()
            result = await bridge.search(query, num_results)
        elif command == "close":
            result = await bridge.close()
        else:
            result = {"success": False, "error": f"Unknown command: {command}"}
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
    finally:
        try:
            await bridge.close()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(main())