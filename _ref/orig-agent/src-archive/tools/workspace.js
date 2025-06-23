/**
 * Workspace Management Tools
 * Clean architecture: tool definitions + handlers in one file
 */

import { WorkspaceProjectManager } from '../workspace-project-tools.js';

// Initialize manager
const wpm = new WorkspaceProjectManager();

// Tool definitions for MCP
export const tools = [
  {
    name: "create_workspace",
    description: "Create a new workspace for organizing projects",
    category: "workspace",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Workspace name" },
        description: { type: "string", description: "Workspace description" },
        path: { type: "string", description: "Base directory path" }
      },
      required: ["name", "description"]
    }
  },
  {
    name: "list_workspaces",
    description: "List all available workspaces",
    category: "workspace",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_active_workspace",
    description: "Set the active workspace for operations",
    category: "workspace",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Workspace name to activate" }
      },
      required: ["name"]
    }
  },
  {
    name: "workspace_capture_context",
    description: "Capture conversation context as organized tasks",
    category: "workspace",
    inputSchema: {
      type: "object",
      properties: {
        project: { type: "string", description: "Target project name" },
        context: { type: "object", description: "Context to capture" },
        analysis: { type: "string", description: "Lazy mode analysis" }
      },
      required: ["project", "context"]
    }
  }
];

// Handler functions
export const handlers = {
  async create_workspace(args) {
    const result = await wpm.createWorkspace(args);
    return {
      message: `✅ Workspace '${result.name}' created successfully`,
      workspace: result
    };
  },

  async list_workspaces(args) {
    const workspaces = await wpm.listWorkspaces();
    return {
      message: `📋 Found ${workspaces.length} workspaces`,
      workspaces
    };
  },

  async set_active_workspace(args) {
    await wpm.setActiveWorkspace(args.name);
    return {
      message: `🎯 Active workspace set to '${args.name}'`
    };
  },

  async workspace_capture_context(args) {
    const result = await wpm.captureContext(args);
    return {
      message: `📝 Context captured and organized into ${result.tasksCreated} tasks`,
      ...result
    };
  }
};