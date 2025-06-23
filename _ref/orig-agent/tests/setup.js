// Test setup and custom matchers
import { ClaudeCodeAdapter } from '../src/adapters/primary/claude-adapter.js';

// Global test helpers
global.createTestAdapter = () => {
  return new ClaudeCodeAdapter();
};

// Custom Jest matchers for Kingly
expect.extend({
  toHaveIntent(received, expectedIntent) {
    const pass = received.intent_type === expectedIntent;
    return {
      pass,
      message: () => 
        `expected task to have intent "${expectedIntent}" but got "${received.intent_type}"`
    };
  },
  
  toHaveContextProperty(received, property, value) {
    const pass = received.context && received.context[property] === value;
    return {
      pass,
      message: () =>
        `expected context to have ${property}="${value}" but got ${JSON.stringify(received.context)}`
    };
  },
  
  toInheritFrom(received, parentContext) {
    const pass = received.extends === parentContext;
    return {
      pass,
      message: () =>
        `expected context to inherit from "${parentContext}" but extends "${received.extends}"`
    };
  }
});

// Test utilities
export const fixtures = {
  task: {
    implementation: {
      title: "Implement user authentication",
      description: "Add JWT-based auth with refresh tokens"
    },
    research: {
      title: "Research graph database options",
      description: "Compare Neo4j vs DGraph for our use case"
    },
    planning: {
      title: "Plan Q2 product roadmap",
      description: "Define features and timeline for next quarter"
    }
  },
  
  context: {
    base: {
      version: "1.0",
      theme: "dark",
      language: "en"
    },
    workspace: {
      extends: "base",
      project: "kingly",
      environment: "development"
    },
    task: {
      extends: "workspace",
      priority: "high",
      assignee: "claude"
    }
  }
};