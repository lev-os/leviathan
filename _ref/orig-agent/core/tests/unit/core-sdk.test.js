/**
 * Core SDK Tests - Plugin Registry
 */

import { CoreSDK } from '../../sdk/core-sdk.js';

describe('CoreSDK Plugin Registry', () => {
  let sdk;

  beforeEach(() => {
    sdk = new CoreSDK();
  });

  test('should register and retrieve plugins', () => {
    const mockPlugin = { 
      name: 'test-plugin', 
      contextTypes: ['workspace', 'project'] 
    };
    
    sdk.registerPlugin(mockPlugin);
    
    expect(sdk.getPlugin('test-plugin')).toBe(mockPlugin);
  });

  test('should track available context types from plugins', () => {
    const workspacePlugin = { 
      name: 'workspace-plugin', 
      contextTypes: ['workspace'] 
    };
    const taskPlugin = { 
      name: 'task-plugin', 
      contextTypes: ['task', 'subtask'] 
    };
    
    sdk.registerPlugin(workspacePlugin);
    sdk.registerPlugin(taskPlugin);
    
    const contextTypes = sdk.getContextTypes();
    expect(contextTypes).toContain('workspace');
    expect(contextTypes).toContain('task');
    expect(contextTypes).toContain('subtask');
  });

  test('should prevent duplicate plugin names', () => {
    const plugin1 = { name: 'duplicate', contextTypes: ['type1'] };
    const plugin2 = { name: 'duplicate', contextTypes: ['type2'] };
    
    sdk.registerPlugin(plugin1);
    
    expect(() => {
      sdk.registerPlugin(plugin2);
    }).toThrow('Plugin with name "duplicate" already registered');
  });

  test('should list all registered plugins', () => {
    const plugin1 = { name: 'plugin1', contextTypes: ['type1'] };
    const plugin2 = { name: 'plugin2', contextTypes: ['type2'] };
    
    sdk.registerPlugin(plugin1);
    sdk.registerPlugin(plugin2);
    
    const plugins = sdk.listPlugins();
    expect(plugins).toHaveLength(2);
    expect(plugins.map(p => p.name)).toContain('plugin1');
    expect(plugins.map(p => p.name)).toContain('plugin2');
  });
});

describe('CoreSDK Context Creation', () => {
  let sdk;

  beforeEach(() => {
    sdk = new CoreSDK();
  });

  test('should create context using registered plugin', async () => {
    const workspacePlugin = {
      name: 'workspace-plugin',
      contextTypes: ['workspace'],
      createContext: (type, config) => ({
        type,
        config,
        id: 'test-workspace-' + Date.now(),
        plugin: 'workspace-plugin'
      })
    };
    
    sdk.registerPlugin(workspacePlugin);
    
    const context = await sdk.createContext('workspace', {
      name: 'my-workspace',
      path: '/tmp/test'
    });
    
    expect(context.type).toBe('workspace');
    expect(context.config.name).toBe('my-workspace');
    expect(context.config.path).toBe('/tmp/test');
    expect(context.plugin).toBe('workspace-plugin');
    expect(context.id).toMatch(/^test-workspace-/);
  });

  test('should throw error for unknown context type', async () => {
    await expect(
      sdk.createContext('unknown-type', {})
    ).rejects.toThrow('No plugin found for context type "unknown-type"');
  });

  test('should find correct plugin for context type', async () => {
    const plugin1 = {
      name: 'plugin1',
      contextTypes: ['type1', 'type2'],
      createContext: (type, config) => ({ type, fromPlugin: 'plugin1' })
    };
    
    const plugin2 = {
      name: 'plugin2', 
      contextTypes: ['type3'],
      createContext: (type, config) => ({ type, fromPlugin: 'plugin2' })
    };
    
    sdk.registerPlugin(plugin1);
    sdk.registerPlugin(plugin2);
    
    const context1 = await sdk.createContext('type1', {});
    const context3 = await sdk.createContext('type3', {});
    
    expect(context1.fromPlugin).toBe('plugin1');
    expect(context3.fromPlugin).toBe('plugin2');
  });

  test('should pass config to plugin createContext method', async () => {
    const mockPlugin = {
      name: 'test-plugin',
      contextTypes: ['test'],
      createContext: (type, config) => ({ type, config, called: true })
    };
    
    sdk.registerPlugin(mockPlugin);
    
    const result = await sdk.createContext('test', { foo: 'bar', baz: 42 });
    
    expect(result.called).toBe(true);
    expect(result.config.foo).toBe('bar');
    expect(result.config.baz).toBe(42);
  });
});