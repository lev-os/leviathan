#!/usr/bin/env python3
"""
Web server for Kingly OS
Provides both Textual-web deployment and FastAPI REST API
"""

import os
import sys
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from kingly_bridge import KinglyBridge


# Request/Response models
class ProcessRequest(BaseModel):
    user: str
    message: str
    style: Optional[str] = "technical"
    response_format: Optional[str] = "markdown"
    workflow: Optional[str] = None


class ProcessResponse(BaseModel):
    mode: str
    agent: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    workflow: Optional[str] = None
    agents: Optional[List[str]] = None
    context: Optional[str] = None
    response: Optional[str] = None
    error: Optional[str] = None


class SystemStatus(BaseModel):
    status: str
    uptime: Optional[float] = None
    total_requests: int = 0
    active_connections: int = 0
    last_request: Optional[datetime] = None


# Create FastAPI app
app = FastAPI(
    title="Kingly OS Web API",
    description="AI Agent Orchestration System",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
bridge = KinglyBridge(mode="subprocess")
system_status = SystemStatus(status="operational")
active_websockets: List[WebSocket] = []


# Serve static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main web interface"""
    return """
<!DOCTYPE html>
<html>
<head>
    <title>Kingly OS - Web Interface</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #1a1a1a;
            color: #e0e0e0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #4a9eff;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #888;
            margin-bottom: 30px;
        }
        .options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .option-card {
            background: #2a2a2a;
            border-radius: 10px;
            padding: 20px;
            border: 1px solid #333;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .option-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(74, 158, 255, 0.2);
        }
        .option-card h2 {
            color: #4a9eff;
            margin-top: 0;
        }
        .option-card p {
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            background: #4a9eff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            transition: background 0.2s;
        }
        .button:hover {
            background: #357abd;
        }
        .status {
            background: #2a2a2a;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            border: 1px solid #333;
        }
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #4ade80;
            border-radius: 50%;
            margin-right: 10px;
        }
        code {
            background: #333;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Kingly OS</h1>
        <p class="subtitle">AI Agent Orchestration System - Web Interface</p>
        
        <div class="options">
            <div class="option-card">
                <h2>🖥️ Textual Web UI</h2>
                <p>
                    Full-featured terminal UI in your browser. 
                    Rich interface with real-time updates, agent status, and metrics.
                </p>
                <p><strong>Best for:</strong> Interactive sessions, monitoring, full control</p>
                <a href="/textual" class="button">Launch Textual UI</a>
            </div>
            
            <div class="option-card">
                <h2>🔌 REST API</h2>
                <p>
                    Programmatic access to Kingly OS. 
                    Send requests via HTTP POST and get JSON responses.
                </p>
                <p><strong>Endpoint:</strong> <code>POST /api/process</code></p>
                <a href="/docs" class="button">API Documentation</a>
            </div>
            
            <div class="option-card">
                <h2>🔄 WebSocket API</h2>
                <p>
                    Real-time bidirectional communication. 
                    Perfect for chat interfaces and live updates.
                </p>
                <p><strong>Endpoint:</strong> <code>ws://localhost:8000/ws</code></p>
                <a href="#" class="button" onclick="alert('Connect via WebSocket client')">Connection Info</a>
            </div>
        </div>
        
        <div class="status">
            <h3><span class="status-indicator"></span>System Status</h3>
            <p>Status: <strong>Operational</strong></p>
            <p>API: <code>http://localhost:8000</code></p>
            <p>WebSocket: <code>ws://localhost:8000/ws</code></p>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>
                Run locally: <code>python web-server.py</code><br>
                Deploy Textual: <code>textual-web --app kingly-textual:app --port 8080</code>
            </p>
        </div>
    </div>
</body>
</html>
    """


@app.get("/textual")
async def textual_redirect():
    """Redirect to Textual web UI"""
    # In production, this would proxy to the textual-web server
    return HTMLResponse("""
    <html>
    <body style="background: #1a1a1a; color: #e0e0e0; font-family: sans-serif; padding: 40px;">
        <h1>Launching Textual UI...</h1>
        <p>To run the Textual web interface:</p>
        <pre style="background: #2a2a2a; padding: 20px; border-radius: 5px;">
# In a separate terminal:
textual-web --app kingly-textual:app --port 8080

# Then navigate to:
http://localhost:8080
        </pre>
        <p>The Textual UI provides a full terminal experience in your browser!</p>
    </body>
    </html>
    """)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "kingly-os-web",
        "bridge_mode": bridge.mode,
        "bridge_health": bridge.health_check()
    }


@app.get("/status")
async def get_status():
    """Get system status"""
    return system_status


@app.post("/api/process", response_model=ProcessResponse)
async def process_request(request: ProcessRequest):
    """Process a request through Kingly OS"""
    try:
        # Update status
        system_status.total_requests += 1
        system_status.last_request = datetime.now()
        
        # Process request
        result = bridge.process_request(
            user=request.user,
            message=request.message,
            style=request.style,
            response_format=request.response_format
        )
        
        # Notify WebSocket clients
        await notify_websockets({
            "type": "request_processed",
            "user": request.user,
            "message": request.message,
            "result": result
        })
        
        return ProcessResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    active_websockets.append(websocket)
    system_status.active_connections = len(active_websockets)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to Kingly OS WebSocket API"
        })
        
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            # Process request
            if data.get("type") == "process":
                result = bridge.process_request(
                    user=data.get("user", "websocket-user"),
                    message=data.get("message", ""),
                    style=data.get("style", "technical"),
                    response_format=data.get("response_format", "markdown")
                )
                
                # Send response
                await websocket.send_json({
                    "type": "response",
                    "result": result
                })
                
                # Notify other clients
                await notify_websockets({
                    "type": "activity",
                    "user": data.get("user"),
                    "message": data.get("message")
                }, exclude=websocket)
                
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
        system_status.active_connections = len(active_websockets)


async def notify_websockets(data: Dict[str, Any], exclude: Optional[WebSocket] = None):
    """Notify all connected WebSocket clients"""
    for ws in active_websockets:
        if ws != exclude:
            try:
                await ws.send_json(data)
            except:
                # Client disconnected
                pass


@app.post("/api/preferences")
async def update_preferences(user: str, preferences: Dict[str, Any]):
    """Update user preferences"""
    # In a real implementation, this would persist preferences
    return {"status": "success", "user": user, "preferences": preferences}


@app.get("/api/agents")
async def list_agents():
    """List available agents"""
    return {
        "agents": [
            {
                "id": "researcher",
                "name": "Researcher",
                "icon": "🔍",
                "description": "Information gathering and analysis"
            },
            {
                "id": "writer",
                "name": "Writer",
                "icon": "✍️",
                "description": "Creative content and documentation"
            },
            {
                "id": "dev",
                "name": "Developer",
                "icon": "💻",
                "description": "Code implementation and debugging"
            },
            {
                "id": "qa",
                "name": "QA Engineer",
                "icon": "🧪",
                "description": "Testing and quality assurance"
            },
            {
                "id": "ceo",
                "name": "CEO",
                "icon": "👔",
                "description": "Strategy and coordination"
            }
        ]
    }


@app.get("/api/workflows")
async def list_workflows():
    """List available workflows"""
    return {
        "workflows": [
            {
                "id": "api-development",
                "name": "API Development",
                "agents": ["researcher", "dev", "qa"],
                "description": "Build APIs with research, implementation, and testing"
            },
            {
                "id": "bug-fix",
                "name": "Bug Fix",
                "agents": ["dev", "qa"],
                "description": "Debug and fix issues with validation"
            },
            {
                "id": "feature-dev",
                "name": "Feature Development",
                "agents": ["researcher", "dev", "qa"],
                "description": "Develop new features end-to-end"
            },
            {
                "id": "documentation",
                "name": "Documentation",
                "agents": ["researcher", "writer"],
                "description": "Create comprehensive documentation"
            }
        ]
    }


def main():
    """Run the web server"""
    print("🚀 Starting Kingly OS Web Server...")
    print("📍 Main interface: http://localhost:8000")
    print("📚 API docs: http://localhost:8000/docs")
    print("🔌 WebSocket: ws://localhost:8000/ws")
    print("\n💡 For Textual UI, run in another terminal:")
    print("   textual-web --app kingly-textual:app --port 8080")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()