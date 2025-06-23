/**
 * Kingly JavaScript SDK
 * Core functionality exposed as a clean API
 */

import { Task } from './src/domain/task.js';
import { IntentClassifier } from './src/domain/services/intent-classifier.js';
import { TaskAdapter } from './src/adapters/primary/task-adapter.js';

class KinglySDK {
  constructor() {
    this.taskAdapter = new TaskAdapter();
  }

  // Task operations
  tasks = {
    create: async (params) => {
      return await this.taskAdapter.createTask(params);
    },

    get: async (id) => {
      return await this.taskAdapter.getTaskMetadata(id);
    },

    getFiles: async (id) => {
      return await this.taskAdapter.getTaskFiles(id);
    },

    getContent: async (id) => {
      return await this.taskAdapter.getTaskContent(id);
    },

    classify: (title, description) => {
      return IntentClassifier.classifyTaskIntent(title, description);
    },

    getWorkflow: async (id) => {
      return await this.taskAdapter.getTaskWorkflow(id);
    },

    getDependencies: async (id) => {
      return await this.taskAdapter.getTaskDependencies(id);
    }
  };

  // Context operations (placeholder for Universal Context)
  contexts = {
    load: async (name) => {
      // TODO: Implement with Universal Context Architecture
      return { name, loaded: true, placeholder: true };
    },

    resolve: async (name) => {
      // TODO: Implement context resolution
      return { name, resolved: true, placeholder: true };
    },

    create: async (name, config) => {
      // TODO: Implement context creation
      return { name, config, created: true, placeholder: true };
    }
  };

  // Memory operations (placeholder for Memory MVP)
  memory = {
    search: async (query) => {
      // TODO: Implement with Ultimate MCP integration
      return { query, results: [], placeholder: true };
    },

    store: async (data) => {
      // TODO: Implement memory storage
      return { stored: true, id: Date.now(), placeholder: true };
    },

    get: async (id) => {
      // TODO: Implement memory retrieval
      return { id, data: null, placeholder: true };
    }
  };

  // Agent operations (placeholder for Agent as Context)
  agents = {
    list: async () => {
      // TODO: Implement agent listing
      return { agents: [], placeholder: true };
    },

    invoke: async (agentName, request) => {
      // TODO: Implement agent invocation
      return { agent: agentName, request, response: null, placeholder: true };
    }
  };

  // Workspace operations
  workspaces = {
    create: async (name, path, description) => {
      // TODO: Integrate with WorkspaceService
      return { name, path, description, created: true, placeholder: true };
    },

    list: async () => {
      // TODO: Implement workspace listing
      return { workspaces: [], placeholder: true };
    },

    get: async (name) => {
      // TODO: Implement workspace retrieval
      return { name, workspace: null, placeholder: true };
    }
  };

  // Utility methods
  utils = {
    version: () => '1.0.0-alpha',
    
    health: () => ({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: {
        tasks: 'implemented',
        contexts: 'placeholder',
        memory: 'placeholder',
        agents: 'placeholder',
        workspaces: 'placeholder'
      }
    }),

    demo: async () => {
      console.log('🎭 Kingly SDK Demo');
      
      // Classify intent
      const intent = this.tasks.classify(
        'Implement user authentication',
        'Add JWT-based auth with refresh tokens'
      );
      console.log('Intent classification:', intent);
      
      // Create task
      const task = await this.tasks.create({
        title: 'Demo task',
        description: 'SDK demonstration task',
        workspace_id: 'demo-workspace'
      });
      console.log('Created task:', task.id, 'with intent:', task.intent_type);
      
      // Get task files
      const files = await this.tasks.getFiles(task.id);
      console.log('Task files:', files);
      
      return { intent, task, files };
    }
  };
}

// Export singleton instance
export const Kingly = new KinglySDK();

// Also export class for custom instances
export { KinglySDK };

// Default export for convenience
export default Kingly;