#!/usr/bin/env python3
"""
Graphiti gRPC Memory Service for Leviathan
Provides high-performance bridge between Node.js and Graphiti
"""

import asyncio
import logging
import uuid
from concurrent import futures
from datetime import datetime
from typing import Dict, List, Optional

import grpc
from grpc import aio
from graphiti_core import Graphiti

# Import generated protobuf classes
import memory_pb2
import memory_pb2_grpc

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MemoryServicer(memory_pb2_grpc.MemoryServiceServicer):
    """
    gRPC service implementation for Leviathan Memory System
    Wraps Graphiti with enterprise-grade service layer
    """
    
    def __init__(self):
        self.graphiti: Optional[Graphiti] = None
        self.current_workspace = "default"
        self.workspaces: Dict[str, str] = {}
        self.session_id: Optional[str] = None
        
    async def Connect(self, request, context):
        """Initialize Graphiti connection"""
        try:
            logger.info(f"Connecting to Neo4j at {request.neo4j_uri}")
            
            self.graphiti = Graphiti(
                uri=request.neo4j_uri,
                user=request.username,
                password=request.password
            )
            
            # Test connection with a simple search
            await self.graphiti.search("test", num_results=1)
            
            self.session_id = str(uuid.uuid4())
            
            logger.info(f"✅ Connected to Graphiti successfully - Session: {self.session_id}")
            
            return memory_pb2.ConnectResponse(
                success=True,
                message="Connected to Graphiti successfully",
                session_id=self.session_id
            )
            
        except Exception as e:
            logger.error(f"❌ Connection failed: {str(e)}")
            return memory_pb2.ConnectResponse(
                success=False,
                message=f"Connection failed: {str(e)}",
                session_id=""
            )
    
    async def Disconnect(self, request, context):
        """Close Graphiti connection"""
        try:
            if self.graphiti:
                await self.graphiti.close()
                self.graphiti = None
                
            logger.info(f"Disconnected session: {request.session_id}")
            
            return memory_pb2.DisconnectResponse(
                success=True,
                message="Disconnected successfully"
            )
            
        except Exception as e:
            logger.error(f"Disconnect error: {str(e)}")
            return memory_pb2.DisconnectResponse(
                success=False,
                message=f"Disconnect error: {str(e)}"
            )
    
    async def HealthCheck(self, request, context):
        """Check service health and Graphiti connectivity"""
        try:
            if not self.graphiti:
                return memory_pb2.HealthCheckResponse(
                    healthy=False,
                    status="Not connected to Graphiti",
                    details={"error": "No active Graphiti connection"}
                )
            
            # Test with simple search
            await self.graphiti.search("health_check", num_results=1)
            
            return memory_pb2.HealthCheckResponse(
                healthy=True,
                status="Healthy",
                details={
                    "session_id": self.session_id or "unknown",
                    "current_workspace": self.current_workspace,
                    "workspaces_count": str(len(self.workspaces))
                }
            )
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return memory_pb2.HealthCheckResponse(
                healthy=False,
                status="Unhealthy",
                details={"error": str(e)}
            )
    
    async def CreateMemory(self, request, context):
        """Create a new memory using Graphiti"""
        try:
            if not self.graphiti:
                return memory_pb2.CreateMemoryResponse(
                    success=False,
                    error="Not connected to Graphiti"
                )
            
            # Create episode in Graphiti
            episode_id = await self.graphiti.add_episode(
                name=f"{request.type}_memory",
                episode_body=request.content,
                reference_time=datetime.now().isoformat(),
                group_id=request.workspace_id or self.current_workspace
            )
            
            # Create memory object for response
            memory = memory_pb2.Memory(
                id=str(episode_id),
                content=request.content,
                type=request.type,
                timestamp=int(datetime.now().timestamp()),
                workspace_id=request.workspace_id or self.current_workspace
            )
            
            # Add metadata
            for key, value in request.metadata.items():
                memory.metadata[key] = value
                
            logger.info(f"Created memory: {episode_id}")
            
            return memory_pb2.CreateMemoryResponse(
                success=True,
                memory=memory
            )
            
        except Exception as e:
            logger.error(f"Create memory failed: {str(e)}")
            return memory_pb2.CreateMemoryResponse(
                success=False,
                error=str(e)
            )
    
    async def SearchMemory(self, request, context):
        """Search memories using Graphiti's semantic search"""
        try:
            if not self.graphiti:
                return memory_pb2.SearchMemoryResponse(
                    success=False,
                    error="Not connected to Graphiti"
                )
            
            # Use Graphiti's search
            results = await self.graphiti.search(
                query=request.query,
                num_results=request.limit or 10,
                group_ids=[request.workspace_id] if request.workspace_id else None
            )
            
            memories = []
            for result in results:
                memory = memory_pb2.Memory(
                    id=str(result.uuid),
                    content=str(result),
                    type="search_result",
                    timestamp=int(datetime.now().timestamp()),
                    workspace_id=request.workspace_id or self.current_workspace
                )
                memories.append(memory)
            
            logger.info(f"Search found {len(memories)} results for: {request.query}")
            
            return memory_pb2.SearchMemoryResponse(
                success=True,
                memories=memories
            )
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return memory_pb2.SearchMemoryResponse(
                success=False,
                error=str(e)
            )
    
    async def AddEpisode(self, request, context):
        """Add episodic memory using Graphiti's core strength"""
        try:
            if not self.graphiti:
                return memory_pb2.AddEpisodeResponse(
                    success=False,
                    error="Not connected to Graphiti"
                )
            
            # Use Graphiti's add_episode with proper parameters
            episode_id = await self.graphiti.add_episode(
                name=request.name,
                episode_body=request.content,
                reference_time=datetime.fromtimestamp(request.reference_time).isoformat() if request.reference_time else None,
                group_id=request.workspace_id or self.current_workspace
            )
            
            episode = memory_pb2.Episode(
                id=str(episode_id),
                name=request.name,
                content=request.content,
                reference_time=request.reference_time,
                workspace_id=request.workspace_id or self.current_workspace
            )
            
            # Add metadata
            for key, value in request.metadata.items():
                episode.metadata[key] = value
            
            logger.info(f"Added episode: {request.name} -> {episode_id}")
            
            return memory_pb2.AddEpisodeResponse(
                success=True,
                episode=episode
            )
            
        except Exception as e:
            logger.error(f"Add episode failed: {str(e)}")
            return memory_pb2.AddEpisodeResponse(
                success=False,
                error=str(e)
            )
    
    async def HybridSearch(self, request, context):
        """Advanced hybrid search leveraging Graphiti's capabilities"""
        try:
            if not self.graphiti:
                return memory_pb2.HybridSearchResponse(
                    success=False,
                    error="Not connected to Graphiti"
                )
            
            # Use Graphiti's search with additional context
            results = await self.graphiti.search(
                query=request.query,
                num_results=request.limit or 10,
                group_ids=[request.workspace_id] if request.workspace_id else None
            )
            
            memories = []
            episodes = []
            
            for result in results:
                # Create memory object
                memory = memory_pb2.Memory(
                    id=str(result.uuid),
                    content=str(result),
                    type="hybrid_result",
                    timestamp=int(datetime.now().timestamp()),
                    workspace_id=request.workspace_id or self.current_workspace
                )
                memories.append(memory)
                
                # Create episode object if temporal context requested
                if request.include_temporal:
                    episode = memory_pb2.Episode(
                        id=str(result.uuid),
                        name=f"Episode_{result.uuid}",
                        content=str(result),
                        workspace_id=request.workspace_id or self.current_workspace
                    )
                    episodes.append(episode)
            
            logger.info(f"Hybrid search found {len(memories)} memories, {len(episodes)} episodes")
            
            return memory_pb2.HybridSearchResponse(
                success=True,
                memories=memories,
                episodes=episodes,
                relationships=[]  # TODO: Implement relationship extraction
            )
            
        except Exception as e:
            logger.error(f"Hybrid search failed: {str(e)}")
            return memory_pb2.HybridSearchResponse(
                success=False,
                error=str(e)
            )
    
    async def CreateWorkspace(self, request, context):
        """Create a new workspace for multi-agent isolation"""
        try:
            workspace_id = request.workspace_id
            self.workspaces[workspace_id] = request.description
            
            logger.info(f"Created workspace: {workspace_id}")
            
            return memory_pb2.CreateWorkspaceResponse(
                success=True,
                workspace_id=workspace_id
            )
            
        except Exception as e:
            logger.error(f"Create workspace failed: {str(e)}")
            return memory_pb2.CreateWorkspaceResponse(
                success=False,
                error=str(e)
            )
    
    async def ListWorkspaces(self, request, context):
        """List all available workspaces"""
        try:
            return memory_pb2.ListWorkspacesResponse(
                success=True,
                workspace_ids=list(self.workspaces.keys()),
                descriptions=self.workspaces
            )
            
        except Exception as e:
            logger.error(f"List workspaces failed: {str(e)}")
            return memory_pb2.ListWorkspacesResponse(
                success=False,
                error=str(e)
            )
    
    async def SwitchWorkspace(self, request, context):
        """Switch to a different workspace"""
        try:
            previous = self.current_workspace
            self.current_workspace = request.workspace_id
            
            logger.info(f"Switched workspace: {previous} -> {self.current_workspace}")
            
            return memory_pb2.SwitchWorkspaceResponse(
                success=True,
                previous_workspace=previous,
                current_workspace=self.current_workspace
            )
            
        except Exception as e:
            logger.error(f"Switch workspace failed: {str(e)}")
            return memory_pb2.SwitchWorkspaceResponse(
                success=False,
                error=str(e)
            )

async def serve():
    """Start the gRPC server"""
    server = aio.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Add the memory service
    memory_pb2_grpc.add_MemoryServiceServicer_to_server(MemoryServicer(), server)
    
    # Configure server address
    listen_addr = "[::]:50051"
    server.add_insecure_port(listen_addr)
    
    logger.info(f"🚀 Starting Graphiti Memory Service on {listen_addr}")
    
    await server.start()
    
    try:
        await server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down Graphiti Memory Service")
        await server.stop(5)

if __name__ == "__main__":
    # Run the service
    asyncio.run(serve())