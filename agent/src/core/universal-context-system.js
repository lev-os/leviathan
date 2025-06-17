/**
 * Universal Context System - YAML inheritance with fractal intelligence distribution
 * Enables contexts to inherit from base contexts with LLM-first design principles
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { ConstitutionalFramework } from './constitutional-framework.js';

export class UniversalContextSystem {
  constructor() {
    this.contexts = new Map();
    this.baseContexts = new Map();
    this.inheritanceChain = new Map();
    this.constitutionalFramework = new ConstitutionalFramework();
  }

  // Initialize the context system with base contexts
  async initialize(contextRoot = './contexts') {
    try {
      await this.loadBaseContexts(contextRoot);
      await this.buildInheritanceChains();
      console.log(`✅ Universal Context System initialized with ${this.contexts.size} contexts`);
    } catch (error) {
      console.error(`Failed to initialize Universal Context System: ${error.message}`);
      throw error;
    }
  }

  // Load all YAML context files
  async loadBaseContexts(contextRoot) {
    try {
      const contextDirs = ['agents', 'workflows', 'patterns', 'personalities'];
      
      for (const dir of contextDirs) {
        const dirPath = path.join(contextRoot, dir);
        try {
          await this.loadContextsFromDirectory(dirPath, dir);
        } catch (error) {
          console.log(`📁 Creating context directory: ${dirPath}`);
          await fs.mkdir(dirPath, { recursive: true });
        }
      }
    } catch (error) {
      console.error(`Failed to load base contexts: ${error.message}`);
    }
  }

  // Load contexts from a specific directory
  async loadContextsFromDirectory(dirPath, category) {
    try {
      const files = await fs.readdir(dirPath);
      const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
      
      for (const file of yamlFiles) {
        const filePath = path.join(dirPath, file);
        const contextName = path.basename(file, path.extname(file));
        
        try {
          const yamlContent = await fs.readFile(filePath, 'utf8');
          const contextData = yaml.load(yamlContent);
          
          // Add metadata
          contextData._meta = {
            name: contextName,
            category: category,
            filePath: filePath,
            loadedAt: new Date().toISOString()
          };
          
          this.contexts.set(contextName, contextData);
          console.log(`📦 Loaded context: ${category}/${contextName}`);
        } catch (error) {
          console.error(`Failed to load context ${file}: ${error.message}`);
        }
      }
    } catch (error) {
      // Directory doesn't exist, that's ok
    }
  }

  // Build inheritance chains for all contexts
  async buildInheritanceChains() {
    for (const [name, context] of this.contexts) {
      if (context.inherits_from) {
        const inheritanceChain = await this.resolveInheritanceChain(name);
        this.inheritanceChain.set(name, inheritanceChain);
      }
    }
  }

  // Resolve the full inheritance chain for a context
  async resolveInheritanceChain(contextName, visited = new Set()) {
    if (visited.has(contextName)) {
      throw new Error(`Circular inheritance detected: ${contextName}`);
    }
    
    visited.add(contextName);
    const context = this.contexts.get(contextName);
    
    if (!context || !context.inherits_from) {
      return [contextName];
    }
    
    const parentChain = await this.resolveInheritanceChain(context.inherits_from, visited);
    return [...parentChain, contextName];
  }

  // Get a fully resolved context with inheritance applied
  async getResolvedContext(contextName) {
    const context = this.contexts.get(contextName);
    if (!context) {
      throw new Error(`Context not found: ${contextName}`);
    }

    // If no inheritance, return as-is
    if (!context.inherits_from) {
      return this.deepClone(context);
    }

    // Get inheritance chain
    const chain = this.inheritanceChain.get(contextName) || 
                  await this.resolveInheritanceChain(contextName);
    
    // Merge contexts from base to derived
    let resolvedContext = {};
    for (const chainContext of chain) {
      const ctx = this.contexts.get(chainContext);
      if (ctx) {
        resolvedContext = this.mergeContexts(resolvedContext, ctx);
      }
    }

    return resolvedContext;
  }

  // Deep merge two contexts with proper inheritance rules
  mergeContexts(base, derived) {
    const merged = this.deepClone(base);
    
    for (const [key, value] of Object.entries(derived)) {
      if (key === 'inherits_from') continue; // Skip inheritance metadata
      
      if (key.endsWith('_override') && merged[key.replace('_override', '')]) {
        // Override pattern: completely replace base value
        const baseKey = key.replace('_override', '');
        merged[baseKey] = this.deepClone(value);
        delete merged[key]; // Remove the override key
      } else if (key.endsWith('_extend') && merged[key.replace('_extend', '')]) {
        // Extend pattern: merge arrays or objects
        const baseKey = key.replace('_extend', '');
        if (Array.isArray(merged[baseKey]) && Array.isArray(value)) {
          merged[baseKey] = [...merged[baseKey], ...value];
        } else if (typeof merged[baseKey] === 'object' && typeof value === 'object') {
          merged[baseKey] = { ...merged[baseKey], ...value };
        } else {
          merged[baseKey] = value;
        }
        delete merged[key]; // Remove the extend key
      } else if (typeof value === 'object' && value !== null && 
                 typeof merged[key] === 'object' && merged[key] !== null &&
                 !Array.isArray(value) && !Array.isArray(merged[key])) {
        // Deep merge objects
        merged[key] = this.mergeContexts(merged[key], value);
      } else {
        // Direct assignment
        merged[key] = this.deepClone(value);
      }
    }
    
    return merged;
  }

  // Create a new context with constitutional validation
  async createContext(contextName, contextData, category = 'custom') {
    // Validate against constitutional principles
    const validation = await this.constitutionalFramework.validateContext(contextData);
    
    if (!validation.constitutional_compliance) {
      console.warn(`⚠️  Context ${contextName} has constitutional violations:`, validation.violations);
    }

    // Add metadata
    contextData._meta = {
      name: contextName,
      category: category,
      createdAt: new Date().toISOString(),
      constitutional_score: validation.score,
      constitutional_compliance: validation.constitutional_compliance
    };

    this.contexts.set(contextName, contextData);
    
    // Rebuild inheritance if this context inherits
    if (contextData.inherits_from) {
      const inheritanceChain = await this.resolveInheritanceChain(contextName);
      this.inheritanceChain.set(contextName, inheritanceChain);
    }

    return {
      success: true,
      contextName,
      constitutional_validation: validation
    };
  }

  // Save context to YAML file
  async saveContext(contextName, targetDir = './contexts/custom') {
    const context = this.contexts.get(contextName);
    if (!context) {
      throw new Error(`Context not found: ${contextName}`);
    }

    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, `${contextName}.yaml`);
    
    // Remove metadata before saving
    const { _meta, ...contextToSave } = context;
    const yamlContent = yaml.dump(contextToSave, {
      indent: 2,
      lineWidth: 100,
      noRefs: true
    });
    
    await fs.writeFile(filePath, yamlContent, 'utf8');
    
    // Update metadata with file path
    context._meta.filePath = filePath;
    context._meta.savedAt = new Date().toISOString();
    
    return filePath;
  }

  // List all available contexts with their inheritance info
  listContexts(category = null) {
    const contexts = Array.from(this.contexts.entries()).map(([name, context]) => ({
      name,
      category: context._meta?.category || 'unknown',
      inherits_from: context.inherits_from || null,
      constitutional_score: context._meta?.constitutional_score || null,
      description: context.description || null
    }));

    if (category) {
      return contexts.filter(ctx => ctx.category === category);
    }
    
    return contexts;
  }

  // Deep clone utility
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (const [key, value] of Object.entries(obj)) {
      cloned[key] = this.deepClone(value);
    }
    return cloned;
  }

  // Get inheritance tree for a context
  getInheritanceTree(contextName) {
    const chain = this.inheritanceChain.get(contextName);
    if (!chain) {
      return { [contextName]: null };
    }
    
    const tree = {};
    let current = tree;
    
    for (const name of chain) {
      current[name] = {};
      current = current[name];
    }
    
    return tree;
  }

  // Validate all contexts against constitutional principles
  async validateAllContexts() {
    const results = {};
    
    for (const [name, context] of this.contexts) {
      try {
        const validation = await this.constitutionalFramework.validateContext(context);
        results[name] = {
          valid: validation.constitutional_compliance,
          score: validation.score,
          violations: validation.violations
        };
      } catch (error) {
        results[name] = {
          valid: false,
          error: error.message
        };
      }
    }
    
    return results;
  }
}

// Singleton instance
export const universalContextSystem = new UniversalContextSystem();