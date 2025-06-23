# Implementation Ticket: 005 - Context YAML Loader

## 📋 Overview
Build the foundation for loading and parsing context.yaml files that define universal contexts throughout the system.

## 🔗 References
- **Spec**: [Universal Context Architecture](../specs/core/universal-context-architecture.md)
- **Previous**: Phase 1 complete (001-004)

## 🎯 Scope
Create context loader that:
- Loads context.yaml files from filesystem
- Validates context structure
- Handles polymorphic types
- Caches loaded contexts

## ✅ Acceptance Criteria

### AC-005-1: Basic Context Loading
```yaml
Given: Path to a context.yaml file
When: Context is loaded
Then: Parses YAML correctly
And: Returns context object
And: Validates required fields
```

### AC-005-2: Schema Validation
```yaml
Given: Context YAML with various fields
When: Validation runs
Then: Ensures metadata section exists
And: Validates type field is present
And: Checks polymorphic config matches type
```

### AC-005-3: Type Registry
```yaml
Given: Different context types (workspace, project, task, etc)
When: Context is loaded
Then: Type is recognized from registry
And: Type-specific validation applies
And: Unknown types are handled gracefully
```

### AC-005-4: Error Handling
```yaml
Given: Invalid or missing context.yaml
When: Load is attempted
Then: Returns helpful error message
And: Indicates what's wrong
And: Doesn't crash the system
```

## 🧪 Test Cases

### Unit Tests
1. **Load valid context** - All fields parsed
2. **Missing required fields** - Clear errors
3. **Invalid YAML** - Parse error handling
4. **Unknown type** - Graceful handling
5. **Polymorphic validation** - Type-specific fields

### Integration Tests
1. **Load from filesystem** - Real file loading
2. **Load with references** - Handle extends field
3. **Cache behavior** - Second load from cache

## 💻 Implementation

### Context Schema
```javascript
// src/domain/context-schema.js
export const contextSchema = {
  metadata: {
    id: { required: true, type: 'string' },
    type: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    created: { required: false, type: 'timestamp' },
    updated: { required: false, type: 'timestamp' }
  },
  
  intent_context: {
    intent_type: { required: false, type: 'string' },
    business_goal: { required: false, type: 'string' },
    extends: { required: false, type: 'string' },
    context_adaptations: { required: false, type: 'string' }
  },
  
  relationships: {
    depends_on: { required: false, type: 'array' },
    blocks: { required: false, type: 'array' },
    children: { required: false, type: 'array' },
    shares_with: { required: false, type: 'array' }
  },
  
  polymorphic_config: {
    // Type-specific, validated dynamically
  },
  
  behavior_rules: {
    required: false,
    type: 'array',
    items: {
      trigger: { required: true, type: 'string' },
      condition: { required: false, type: 'string' },
      action: { required: true, type: 'string' }
    }
  },
  
  status: {
    current: { required: false, type: 'string' },
    progress: { required: false, type: 'number' },
    confidence: { required: false, type: 'number' },
    blocked_by: { required: false, type: 'string' }
  }
};

// Type-specific schemas
export const typeSchemas = {
  workspace: {
    workspace_config: {
      physical_path: { required: true, type: 'string' },
      git_remote: { required: false, type: 'string' }
    }
  },
  
  project: {
    project_config: {
      start_date: { required: false, type: 'date' },
      end_date: { required: false, type: 'date' },
      team_members: { required: false, type: 'array' }
    }
  },
  
  task: {
    task_config: {
      assignee: { required: false, type: 'string' },
      due_date: { required: false, type: 'date' },
      priority: { required: false, type: 'string' }
    }
  },
  
  workflow: {
    workflow_config: {
      trigger_rules: { required: false, type: 'array' },
      workflow_steps: { required: true, type: 'array' }
    }
  },
  
  file: {
    file_config: {
      file_path: { required: true, type: 'string' },
      content_type: { required: false, type: 'string' }
    }
  },
  
  folder: {
    folder_config: {
      folder_path: { required: true, type: 'string' }
    }
  }
};
```

### Core Implementation
```javascript
// src/domain/context-loader.js
import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { join, dirname } from 'path';
import { contextSchema, typeSchemas } from './context-schema.js';

export class ContextLoader {
  constructor(options = {}) {
    this.cache = new Map();
    this.rootPath = options.rootPath || process.cwd();
  }
  
  async loadContext(path) {
    // Normalize path
    const fullPath = this.resolvePath(path);
    
    // Check cache
    if (this.cache.has(fullPath)) {
      return this.cache.get(fullPath);
    }
    
    try {
      // Load YAML file
      const yamlPath = join(fullPath, 'context.yaml');
      const content = await readFile(yamlPath, 'utf-8');
      const rawContext = yaml.load(content);
      
      // Validate and process
      const context = await this.processContext(rawContext, fullPath);
      
      // Cache it
      this.cache.set(fullPath, context);
      
      return context;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`No context.yaml found at ${fullPath}`);
      }
      throw new Error(`Failed to load context at ${path}: ${error.message}`);
    }
  }
  
  async processContext(raw, path) {
    // Validate base schema
    this.validateSchema(raw, contextSchema);
    
    // Validate type-specific schema
    const type = raw.metadata?.type;
    if (!type) {
      throw new Error('Context missing required metadata.type');
    }
    
    if (typeSchemas[type] && raw.polymorphic_config) {
      this.validateSchema(
        raw.polymorphic_config,
        { [type + '_config']: typeSchemas[type] }
      );
    }
    
    // Process context
    const context = {
      ...raw,
      _meta: {
        path: path,
        loaded_at: Date.now()
      }
    };
    
    // Add defaults
    if (!context.metadata.id) {
      context.metadata.id = this.generateId(path);
    }
    
    if (!context.metadata.created) {
      context.metadata.created = Date.now();
    }
    
    if (!context.metadata.updated) {
      context.metadata.updated = Date.now();
    }
    
    return context;
  }
  
  validateSchema(data, schema) {
    for (const [section, fields] of Object.entries(schema)) {
      // Skip if section not required and not present
      if (!data[section] && !this.isSectionRequired(fields)) {
        continue;
      }
      
      if (typeof fields === 'object' && !Array.isArray(fields)) {
        // Validate fields in section
        for (const [field, rules] of Object.entries(fields)) {
          if (rules.required && !data[section]?.[field]) {
            throw new Error(`Missing required field: ${section}.${field}`);
          }
          
          if (data[section]?.[field] !== undefined) {
            this.validateFieldType(
              data[section][field],
              rules.type,
              `${section}.${field}`
            );
          }
        }
      }
    }
  }
  
  validateFieldType(value, expectedType, fieldPath) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    switch (expectedType) {
      case 'string':
      case 'number':
      case 'boolean':
        if (actualType !== expectedType) {
          throw new Error(
            `${fieldPath} must be ${expectedType}, got ${actualType}`
          );
        }
        break;
        
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`${fieldPath} must be an array`);
        }
        break;
        
      case 'timestamp':
      case 'date':
        // Accept numbers or date strings
        if (typeof value !== 'number' && 
            typeof value !== 'string') {
          throw new Error(`${fieldPath} must be a timestamp or date`);
        }
        break;
    }
  }
  
  isSectionRequired(fields) {
    return Object.values(fields).some(f => f.required);
  }
  
  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    }
    return join(this.rootPath, path);
  }
  
  generateId(path) {
    // Generate ID from path
    return path
      .replace(this.rootPath, '')
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .toLowerCase();
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

### Test Implementation
```javascript
// tests/unit/context-loader.test.js
import { ContextLoader } from '../../src/domain/context-loader.js';
import { mkdtemp, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import yaml from 'js-yaml';

describe('ContextLoader', () => {
  let loader;
  let testDir;
  
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'context-test-'));
    loader = new ContextLoader({ rootPath: testDir });
  });
  
  it('should load valid context', async () => {
    const contextData = {
      metadata: {
        type: 'project',
        name: 'Test Project'
      },
      intent_context: {
        business_goal: 'Test the loader'
      }
    };
    
    await mkdir(join(testDir, 'test-project'), { recursive: true });
    await writeFile(
      join(testDir, 'test-project', 'context.yaml'),
      yaml.dump(contextData)
    );
    
    const context = await loader.loadContext('test-project');
    
    expect(context.metadata.type).toBe('project');
    expect(context.metadata.name).toBe('Test Project');
    expect(context.metadata.id).toBeDefined();
  });
  
  it('should validate required fields', async () => {
    const invalidContext = {
      metadata: {
        // Missing required 'type'
        name: 'Invalid'
      }
    };
    
    await mkdir(join(testDir, 'invalid'), { recursive: true });
    await writeFile(
      join(testDir, 'invalid', 'context.yaml'),
      yaml.dump(invalidContext)
    );
    
    await expect(loader.loadContext('invalid'))
      .rejects.toThrow('missing required metadata.type');
  });
  
  it('should handle polymorphic types', async () => {
    const workspaceContext = {
      metadata: {
        type: 'workspace',
        name: 'Test Workspace'
      },
      polymorphic_config: {
        workspace_config: {
          physical_path: '/test/path'
        }
      }
    };
    
    await mkdir(join(testDir, 'workspace'), { recursive: true });
    await writeFile(
      join(testDir, 'workspace', 'context.yaml'),
      yaml.dump(workspaceContext)
    );
    
    const context = await loader.loadContext('workspace');
    
    expect(context.polymorphic_config.workspace_config.physical_path)
      .toBe('/test/path');
  });
});
```

## 🔧 Dependencies
- `js-yaml` - Already added for workflow engine

## 📊 Effort Estimate
- Implementation: 2.5 hours
- Testing: 1.5 hours
- Total: 4 hours

## 🚀 Next Steps
After this ticket:
- 006: Context Inheritance - Handle extends relationships
- 007: Context Assembly - Dynamic context building

## 📝 Notes
- This is just the loader - inheritance comes next
- Type registry is extensible for custom types
- Validation ensures data integrity
- Cache prevents repeated file reads