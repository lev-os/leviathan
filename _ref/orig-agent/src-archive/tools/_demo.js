/**
 * Demo Tool - Shows clean architecture pattern
 */

export const tools = [
  {
    name: "demo_workspace",
    description: "Demo workspace creation",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Workspace name" }
      },
      required: ["name"]
    }
  }
];

export const handlers = {
  async demo_workspace(args) {
    return {
      message: `🎯 Demo workspace '${args.name}' would be created`,
      workspace: { name: args.name, demo: true }
    };
  }
};