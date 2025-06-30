#!/usr/bin/env python3
"""
ACTUAL MCP Agent Test - No fake shit
"""

import asyncio
import json
import os
from pathlib import Path
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from mcp_agent.config import Settings, MCPSettings, MCPServerSettings


async def actually_use_mcp_tools():
    """
    Actually use MCP tools to do real work
    """
    
    print("🧠 ACTUALLY USING MCP AGENT")
    print("=" * 50)
    
    # Create settings with actual MCP server configuration
    settings = Settings(
        execution_engine="asyncio",
        mcp=MCPSettings(
            servers={
                # Use the filesystem server that should be installed
                "filesystem": MCPServerSettings(
                    command="npx",
                    args=[
                        "-y", 
                        "@modelcontextprotocol/server-filesystem@latest",
                        str(Path.home() / "digital" / "leviathan" / "workshop" / "pocs")
                    ]
                )
            }
        )
    )
    
    app = MCPApp(name="real_test", settings=settings)
    
    async with app.run():
        agent = Agent(
            name="actual_agent",
            instruction="Read files and analyze code",
            server_names=["filesystem"]
        )
        
        async with agent:
            # List actual tools
            tools = await agent.list_tools()
            print(f"\n✅ REAL TOOLS: {len(tools.tools)}")
            
            # Show what we actually have
            for tool in tools.tools:
                print(f"\n📌 Tool: {tool.name}")
                print(f"   Description: {tool.description}")
                if hasattr(tool, 'inputSchema') and hasattr(tool.inputSchema, 'properties'):
                    print(f"   Parameters: {list(tool.inputSchema.properties.keys())}")
            
            # Actually use a tool - read this file itself
            if len(tools.tools) > 0:
                print("\n🔧 ACTUALLY CALLING A TOOL:")
                
                # Find the read file tool
                read_tool = None
                for tool in tools.tools:
                    if 'read' in tool.name.lower() and 'file' in tool.name.lower():
                        read_tool = tool
                        break
                
                if read_tool:
                    print(f"Using tool: {read_tool.name}")
                    
                    # Actually call the tool
                    result = await agent.call_tool(
                        read_tool.name,
                        arguments={
                            "path": str(Path(__file__).absolute())
                        }
                    )
                    
                    print("\n📄 ACTUAL RESULT:")
                    print(result)
                    
                    return {
                        'success': True,
                        'tools_count': len(tools.tools),
                        'tool_used': read_tool.name,
                        'result_type': type(result).__name__
                    }
            
            return {
                'success': False,
                'tools_count': len(tools.tools),
                'reason': 'No read tool found'
            }


async def main():
    """Actually test MCP functionality"""
    
    try:
        result = await actually_use_mcp_tools()
        
        print(f"\n{'✅' if result['success'] else '❌'} Test result:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"\n❌ ACTUAL ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())