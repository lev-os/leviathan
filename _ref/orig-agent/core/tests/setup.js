// Core SDK Test Setup

// Custom Jest matchers for Kingly
expect.extend({
  toHaveContextProperty(received, property, value) {
    const pass = received[property] === value;
    return {
      pass,
      message: () =>
        `expected context to have ${property}="${value}" but got "${received[property]}"`
    };
  }
});

// Test utilities
export const fixtures = {
  plugins: {
    workspace: {
      name: 'workspace-plugin',
      contextTypes: ['workspace']
    },
    task: {
      name: 'task-plugin', 
      contextTypes: ['task']
    }
  }
};