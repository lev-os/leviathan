#!/usr/bin/env python3
"""
Bridge between Python GUI and Node.js Kingly OS
Communicates via subprocess or HTTP API
"""

import json
import subprocess
import os
import sys
from typing import Dict, Any, Optional
import httpx
import asyncio
from pathlib import Path

class KinglyBridge:
    """Bridge to communicate with Kingly OS Node.js application"""
    
    def __init__(self, mode: str = "subprocess"):
        """
        Initialize bridge
        
        Args:
            mode: "subprocess" to run Node.js directly, "http" to use MCP API
        """
        self.mode = mode
        self.base_url = "http://localhost:3001"
        self.kingly_dir = Path(__file__).parent
        
    def process_request(self, user: str, message: str, **kwargs) -> Dict[str, Any]:
        """
        Send request to Kingly OS and get response
        
        Args:
            user: Username
            message: User's task/message
            **kwargs: Additional options (style, format, etc.)
            
        Returns:
            Response dict with mode, agent, confidence, etc.
        """
        if self.mode == "subprocess":
            return self._subprocess_request(user, message, **kwargs)
        else:
            return self._http_request(user, message, **kwargs)
    
    def _subprocess_request(self, user: str, message: str, **kwargs) -> Dict[str, Any]:
        """Run Kingly OS via subprocess"""
        # Create a temporary script to run the request
        script = f"""
import {{ KinglyOS }} from './kingly-os.js';

const kinglyOS = new KinglyOS();

// Set preferences if provided
{self._generate_preference_code(user, kwargs)}

// Process request
const result = await kinglyOS.processRequest({{
    user: '{user}',
    message: `{message}`
}});

console.log(JSON.stringify(result));
"""
        
        # Write temporary script
        script_path = self.kingly_dir / "temp_bridge.js"
        script_path.write_text(script)
        
        try:
            # Run Node.js process
            result = subprocess.run(
                ["node", str(script_path)],
                cwd=str(self.kingly_dir),
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                return {
                    "mode": "error",
                    "error": f"Node.js error: {result.stderr}"
                }
            
            # Parse JSON response
            return json.loads(result.stdout.strip())
            
        except subprocess.TimeoutExpired:
            return {
                "mode": "error", 
                "error": "Request timed out"
            }
        except json.JSONDecodeError as e:
            return {
                "mode": "error",
                "error": f"Failed to parse response: {str(e)}"
            }
        finally:
            # Clean up temp script
            if script_path.exists():
                script_path.unlink()
    
    def _http_request(self, user: str, message: str, **kwargs) -> Dict[str, Any]:
        """Send request via HTTP API"""
        try:
            # Prepare request data
            data = {
                "user": user,
                "message": message,
                **kwargs
            }
            
            # Send POST request
            response = httpx.post(
                f"{self.base_url}/api/process",
                json=data,
                timeout=30.0
            )
            
            response.raise_for_status()
            return response.json()
            
        except httpx.RequestError as e:
            return {
                "mode": "error",
                "error": f"Connection error: {str(e)}"
            }
        except httpx.HTTPStatusError as e:
            return {
                "mode": "error",
                "error": f"HTTP error {e.response.status_code}: {e.response.text}"
            }
    
    def _generate_preference_code(self, user: str, kwargs: Dict[str, Any]) -> str:
        """Generate JavaScript code for setting preferences"""
        code_lines = []
        
        if "style" in kwargs:
            code_lines.append(f"kinglyOS.setUserPreference('{user}', 'style', '{kwargs['style']}');")
        
        if "response_format" in kwargs:
            code_lines.append(f"kinglyOS.setUserPreference('{user}', 'responseFormat', '{kwargs['response_format']}');")
        
        return "\n".join(code_lines)
    
    def health_check(self) -> bool:
        """Check if Kingly OS is accessible"""
        if self.mode == "http":
            try:
                response = httpx.get(f"{self.base_url}/health", timeout=5.0)
                return response.status_code == 200
            except:
                return False
        else:
            # For subprocess mode, check if Node.js is available
            try:
                result = subprocess.run(
                    ["node", "--version"],
                    capture_output=True,
                    timeout=5.0
                )
                return result.returncode == 0
            except:
                return False
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get system status and metrics"""
        if self.mode == "http":
            try:
                response = httpx.get(f"{self.base_url}/status", timeout=5.0)
                response.raise_for_status()
                return response.json()
            except:
                return {"status": "error", "message": "Failed to get status"}
        else:
            # For subprocess mode, return basic info
            return {
                "status": "operational",
                "mode": "subprocess",
                "message": "Direct Node.js execution"
            }

# Example usage
if __name__ == "__main__":
    bridge = KinglyBridge(mode="subprocess")
    
    # Test health check
    if bridge.health_check():
        print("✅ Kingly OS is accessible")
        
        # Test request
        result = bridge.process_request(
            user="test-user",
            message="Write a blog post about Python",
            style="technical",
            response_format="numbered"
        )
        
        print(f"\nResponse:")
        print(json.dumps(result, indent=2))
    else:
        print("❌ Kingly OS is not accessible")