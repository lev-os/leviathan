# Implementation Ticket: 006 - Context Inheritance

## 📋 Overview
Implement the context inheritance system that allows contexts to extend from parent contexts, creating cascading behavior.

## 🔗 References
- **Previous**: [005 - Context YAML Loader](005-context-yaml-loader.md)
- **Spec**: [Universal Context Architecture](../specs/core/universal-context-architecture.md) - AC-UNIVERSAL-003

## 🎯 Scope
Add inheritance functionality that:
- Resolves extends references
- Merges parent context fields
- Applies context adaptations
- Handles circular dependencies

## ✅ Acceptance Criteria

### AC-006-1: Basic Inheritance
```yaml
Given: Context with extends field
When: Context is loaded
Then: Parent context is loaded
And: Fields are inherited from parent
And: Local fields override parent fields
```

### AC-006-2: Deep Inheritance Chain
```yaml
Given: Context extends parent which extends grandparent
When: Full inheritance chain is resolved
Then: All ancestors are loaded
And: Fields cascade properly
And: Most specific value wins
```

### AC-006-3: Context Adaptations
```yaml
Given: Context with adaptations field
When: Inheritance is applied
Then: Base behavior is inherited
And: Adaptations modify specific aspects
And: Business goal is preserved
```

### AC-006-4: Circular Dependency Prevention
```yaml
Given: Contexts that reference each other
When: Circular reference detected
Then: Clear error is thrown
And: Cycle path is shown
And: System doesn't hang
```

## 🧪 Test Cases

### Unit Tests
1. **Simple inheritance** - Child inherits from parent
2. **Deep chain** - Multiple levels of inheritance
3. **Field override** - Child overrides parent field
4. **Adaptations** - Context modifications applied
5. **Circular detection** - A→B→A caught

### Integration Tests
1. **Cross-directory inheritance** - ../../../universal
2. **Missing parent** - Helpful error
3. **Complex merge** - Multiple inheritance levels

## 💻 Implementation

### Inheritance Resolver
```javascript
// src/domain/context-inheritance.js
export class ContextInheritance {
  constructor(contextLoader) {
    this.loader = contextLoader;
    this.resolving = new Set(); // Track circular deps
  }
  
  async resolveInheritance(context, contextPath) {
    // Check if this context extends another
    const extendsPath = context.intent_context?.extends;
    if (!extendsPath) {
      return context; // No inheritance
    }
    
    // Resolve the parent path relative to current context
    const parentPath = this.resolveRelativePath(contextPath, extendsPath);
    
    // Check for circular dependency
    if (this.resolving.has(parentPath)) {
      const cycle = Array.from(this.resolving).join(' → ') + ' → ' + parentPath;
      throw new Error(`Circular context dependency detected: ${cycle}`);
    }
    
    try {
      // Mark as resolving
      this.resolving.add(parentPath);
      
      // Load parent context
      const parent = await this.loader.loadContext(parentPath);
      
      // Recursively resolve parent's inheritance
      const resolvedParent = await this.resolveInheritance(parent, parentPath);
      
      // Merge contexts
      const merged = this.mergeContexts(resolvedParent, context);
      
      // Apply adaptations
      if (context.intent_context?.context_adaptations) {
        merged._meta.adaptations = context.intent_context.context_adaptations;
      }
      
      return merged;
      
    } finally {
      // Clean up circular dependency tracking
      this.resolving.delete(parentPath);
    }
  }
  
  mergeContexts(parent, child) {
    // Deep merge with child taking precedence
    const merged = {
      metadata: {
        ...parent.metadata,
        ...child.metadata
      },
      intent_context: {
        ...parent.intent_context,
        ...child.intent_context
      },
      relationships: this.mergeRelationships(
        parent.relationships,
        child.relationships
      ),
      behavior_rules: this.mergeBehaviorRules(
        parent.behavior_rules,
        child.behavior_rules
      ),
      status: {
        ...parent.status,
        ...child.status
      },
      _meta: {
        ...child._meta,
        inheritance_chain: [
          ...(parent._meta?.inheritance_chain || []),
          parent._meta?.path || 'unknown'
        ]
      }
    };
    
    // Handle polymorphic config
    if (parent.polymorphic_config || child.polymorphic_config) {
      merged.polymorphic_config = {
        ...parent.polymorphic_config,
        ...child.polymorphic_config
      };
    }
    
    // Preserve business goal unless explicitly overridden
    if (parent.intent_context?.business_goal && 
        !child.intent_context?.business_goal) {
      merged.intent_context.business_goal = parent.intent_context.business_goal;
    }
    
    return merged;
  }
  
  mergeRelationships(parentRels, childRels) {
    if (!parentRels && !childRels) return undefined;
    
    const merged = {};
    
    // For arrays, concatenate and deduplicate
    const arrayFields = ['depends_on', 'blocks', 'children', 'shares_with'];
    
    for (const field of arrayFields) {
      const parentArray = parentRels?.[field] || [];
      const childArray = childRels?.[field] || [];
      
      if (parentArray.length > 0 || childArray.length > 0) {
        merged[field] = [...new Set([...parentArray, ...childArray])];
      }
    }
    
    return Object.keys(merged).length > 0 ? merged : undefined;
  }
  
  mergeBehaviorRules(parentRules, childRules) {
    if (!parentRules && !childRules) return undefined;
    
    const rules = [...(parentRules || [])];
    
    if (childRules) {
      // Add child rules, potentially overriding parent rules
      for (const childRule of childRules) {
        // Check if this rule overrides a parent rule
        const overrideIndex = rules.findIndex(
          r => r.trigger === childRule.trigger && 
              r.condition === childRule.condition
        );
        
        if (overrideIndex >= 0) {
          // Override parent rule
          rules[overrideIndex] = childRule;
        } else {
          // Add new rule
          rules.push(childRule);
        }
      }
    }
    
    return rules.length > 0 ? rules : undefined;
  }
  
  resolveRelativePath(currentPath, relativePath) {
    // Handle relative paths like ../../../universal/auth
    const pathParts = currentPath.split('/').filter(Boolean);
    const relativeParts = relativePath.split('/').filter(Boolean);
    
    // Remove current context directory
    pathParts.pop();
    
    for (const part of relativeParts) {
      if (part === '..') {
        pathParts.pop();
      } else if (part !== '.') {
        pathParts.push(part);
      }
    }
    
    return pathParts.join('/');
  }
}

// Extend ContextLoader to use inheritance
export class InheritanceAwareContextLoader {
  constructor(options = {}) {
    this.baseLoader = new ContextLoader(options);
    this.inheritance = new ContextInheritance(this.baseLoader);
    this.cache = new Map();
  }
  
  async loadContext(path) {
    // Check resolved cache
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }
    
    // Load base context
    const baseContext = await this.baseLoader.loadContext(path);
    
    // Resolve inheritance
    const resolvedContext = await this.inheritance.resolveInheritance(
      baseContext,
      path
    );
    
    // Cache resolved context
    this.cache.set(path, resolvedContext);
    
    return resolvedContext;
  }
  
  clearCache() {
    this.baseLoader.clearCache();
    this.cache.clear();
  }
}
```

### Test Implementation
```javascript
// tests/unit/context-inheritance.test.js
describe('Context Inheritance', () => {
  let loader;
  let testDir;
  
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'inheritance-test-'));
    loader = new InheritanceAwareContextLoader({ rootPath: testDir });
  });
  
  it('should inherit from parent context', async () => {
    // Create parent
    const parentContext = {
      metadata: {
        type: 'project',
        name: 'Base Auth'
      },
      intent_context: {
        business_goal: 'Secure authentication'
      },
      behavior_rules: [{
        trigger: 'on_create',
        action: 'validate_security'
      }]
    };
    
    await createContext(testDir, 'base/auth', parentContext);
    
    // Create child
    const childContext = {
      metadata: {
        type: 'project',
        name: 'Client Auth'
      },
      intent_context: {
        extends: '../base/auth',
        context_adaptations: 'OAuth integration'
      }
    };
    
    await createContext(testDir, 'client/auth', childContext);
    
    // Load child
    const resolved = await loader.loadContext('client/auth');
    
    // Should inherit business goal
    expect(resolved.intent_context.business_goal)
      .toBe('Secure authentication');
    
    // Should inherit behavior rules
    expect(resolved.behavior_rules).toHaveLength(1);
    expect(resolved.behavior_rules[0].action).toBe('validate_security');
    
    // Should have adaptations
    expect(resolved._meta.adaptations).toBe('OAuth integration');
    
    // Should track inheritance chain
    expect(resolved._meta.inheritance_chain).toContain('base/auth');
  });
  
  it('should handle deep inheritance chains', async () => {
    // Grandparent → Parent → Child
    await createContext(testDir, 'universal/base', {
      metadata: { type: 'project', name: 'Universal' },
      intent_context: { business_goal: 'Universal goal' }
    });
    
    await createContext(testDir, 'domain/specific', {
      metadata: { type: 'project', name: 'Domain' },
      intent_context: { 
        extends: '../universal/base',
        domain: 'e-commerce'
      }
    });
    
    await createContext(testDir, 'client/implementation', {
      metadata: { type: 'project', name: 'Client' },
      intent_context: {
        extends: '../domain/specific',
        client: 'ABC Corp'
      }
    });
    
    const resolved = await loader.loadContext('client/implementation');
    
    // Should have all fields
    expect(resolved.intent_context.business_goal).toBe('Universal goal');
    expect(resolved.intent_context.domain).toBe('e-commerce');
    expect(resolved.intent_context.client).toBe('ABC Corp');
    
    // Should track full chain
    expect(resolved._meta.inheritance_chain).toEqual([
      'universal/base',
      'domain/specific'
    ]);
  });
  
  it('should detect circular dependencies', async () => {
    // A → B → A
    await createContext(testDir, 'context-a', {
      metadata: { type: 'project', name: 'A' },
      intent_context: { extends: './context-b' }
    });
    
    await createContext(testDir, 'context-b', {
      metadata: { type: 'project', name: 'B' },
      intent_context: { extends: './context-a' }
    });
    
    await expect(loader.loadContext('context-a'))
      .rejects.toThrow(/Circular context dependency/);
  });
});
```

## 🔧 Dependencies
- Uses ContextLoader from ticket 005

## 📊 Effort Estimate
- Implementation: 2.5 hours
- Testing: 1.5 hours
- Total: 4 hours

## 🚀 Next Steps
After this ticket:
- 007: Context Assembly - Build dynamic context
- Integration with MCP tools

## 📝 Notes
- Inheritance is recursive and cached
- Business goals preserved by default
- Circular dependencies detected early
- Adaptations tracked in metadata