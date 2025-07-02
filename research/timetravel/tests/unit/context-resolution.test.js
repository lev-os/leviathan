// Context Resolution Test Specifications
// Testing the @kingly/core reference resolution system

describe('Context Resolution System', () => {
  
  describe('@kingly/core Reference Resolution', () => {
    test('should resolve core agent references', () => {
      const reference = '@kingly/core/agents/research/deep-researcher';
      const resolved = resolveKinglyReference(reference);
      
      expect(resolved).toBe('/Users/jean-patricksmith/digital/mcp-ceo/contexts/agents/research/deep-researcher');
      expect(existsSync(resolved)).toBe(true);
    });
    
    test('should resolve core tool references', () => {
      const reference = '@kingly/core/tools/research/mcp-suite';
      const resolved = resolveKinglyReference(reference);
      
      expect(resolved).toBe('/Users/jean-patricksmith/digital/mcp-ceo/contexts/tools/research/mcp-suite');
      expect(existsSync(resolved)).toBe(true);
    });
    
    test('should resolve core workflow references', () => {
      const reference = '@kingly/core/workflows/research/three-tier-deep';
      const resolved = resolveKinglyReference(reference);
      
      expect(resolved).toBe('/Users/jean-patricksmith/digital/mcp-ceo/contexts/workflows/research/three-tier-deep');
      expect(existsSync(resolved)).toBe(true);
    });
    
    test('should resolve core pattern references', () => {
      const reference = '@kingly/core/patterns/personality';
      const resolved = resolveKinglyReference(reference);
      
      expect(resolved).toBe('/Users/jean-patricksmith/digital/mcp-ceo/contexts/patterns/personality');
      expect(existsSync(resolved)).toBe(true);
    });
    
    test('should handle local references unchanged', () => {
      const localRefs = [
        './contexts/custom.yaml',
        '../shared/context.yaml',
        '/absolute/path/to/context.yaml'
      ];
      
      localRefs.forEach(ref => {
        const resolved = resolveKinglyReference(ref);
        expect(resolved).toBe(ref);
      });
    });
  });
  
  describe('Context Loading', () => {
    test('should load context.yaml from directory', () => {
      const contextPath = '@kingly/core/agents/research/deep-researcher';
      const context = loadContext(contextPath);
      
      expect(context).toHaveProperty('metadata');
      expect(context.metadata.type).toBe('agent');
      expect(context.metadata.id).toBe('deep-researcher');
    });
    
    test('should load direct yaml file', () => {
      const yamlPath = './contexts/custom-agent.yaml';
      const context = loadContext(yamlPath);
      
      expect(context).toHaveProperty('metadata');
      expect(context).toHaveProperty('agent_config');
    });
    
    test('should validate required fields by type', () => {
      const agentContext = {
        metadata: { type: 'agent', id: 'test' },
        agent_config: { capabilities: [], prompts: {} }
      };
      
      const toolContext = {
        metadata: { type: 'tool', id: 'test' },
        tool_config: { available_tools: [] }
      };
      
      const workflowContext = {
        metadata: { type: 'workflow', id: 'test' },
        workflow_config: { execution_flow: {} }
      };
      
      expect(validateContext(agentContext)).toBe(true);
      expect(validateContext(toolContext)).toBe(true);
      expect(validateContext(workflowContext)).toBe(true);
    });
    
    test('should reject invalid contexts', () => {
      const invalidContexts = [
        { metadata: { type: 'agent' } }, // missing id
        { metadata: { id: 'test' } }, // missing type
        { metadata: { type: 'unknown', id: 'test' } }, // unknown type
        {} // missing metadata
      ];
      
      invalidContexts.forEach(context => {
        expect(() => validateContext(context)).toThrow();
      });
    });
  });
  
  describe('Dependency Resolution', () => {
    test('should extract all @kingly/core references from context', () => {
      const context = {
        agent_config: {
          pattern_references: [
            '@kingly/core/patterns/personality',
            '@kingly/core/patterns/extreme-examples'
          ],
          tool_references: [
            '@kingly/core/tools/research/mcp-suite'
          ]
        }
      };
      
      const deps = extractDependencies(context);
      
      expect(deps).toHaveLength(3);
      expect(deps).toContain('@kingly/core/patterns/personality');
      expect(deps).toContain('@kingly/core/tools/research/mcp-suite');
    });
    
    test('should validate all dependencies exist', () => {
      const dependencies = [
        '@kingly/core/agents/research/deep-researcher',
        '@kingly/core/patterns/personality'
      ];
      
      const validation = validateDependencies(dependencies);
      
      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });
    
    test('should report missing dependencies', () => {
      const dependencies = [
        '@kingly/core/agents/research/deep-researcher',
        '@kingly/core/agents/nonexistent'
      ];
      
      const validation = validateDependencies(dependencies);
      
      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain('@kingly/core/agents/nonexistent');
    });
  });
  
  describe('Prompt Resolution', () => {
    test('should resolve prompt files for agents', () => {
      const agentPath = '@kingly/core/agents/research/deep-researcher';
      const prompts = resolvePrompts(agentPath);
      
      expect(prompts).toHaveProperty('default');
      expect(prompts).toHaveProperty('academic');
      expect(prompts).toHaveProperty('synthesis');
      expect(prompts).toHaveProperty('intelligence');
      
      expect(existsSync(prompts.default)).toBe(true);
    });
    
    test('should handle relative prompt paths', () => {
      const context = {
        agent_config: {
          prompts: {
            default: './prompts/default.md',
            custom: '../shared/prompts/custom.md'
          }
        }
      };
      
      const basePath = '/contexts/agents/test';
      const resolved = resolvePromptPaths(context, basePath);
      
      expect(resolved.default).toBe('/contexts/agents/test/prompts/default.md');
      expect(resolved.custom).toBe('/contexts/shared/prompts/custom.md');
    });
  });
  
  describe('Context Inheritance', () => {
    test('should merge local overrides with core contexts', () => {
      const coreContext = {
        metadata: { type: 'agent', id: 'deep-researcher' },
        agent_config: {
          capabilities: ['research', 'analysis'],
          timeout: 30
        }
      };
      
      const localOverride = {
        agent_config: {
          timeout: 60,
          custom_field: 'value'
        }
      };
      
      const merged = mergeContexts(coreContext, localOverride);
      
      expect(merged.agent_config.capabilities).toEqual(['research', 'analysis']);
      expect(merged.agent_config.timeout).toBe(60);
      expect(merged.agent_config.custom_field).toBe('value');
    });
  });
});