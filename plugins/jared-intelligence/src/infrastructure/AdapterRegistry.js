/**
 * AdapterRegistry - Central registry for all adapters
 * Supports fractal composition and dynamic adapter management
 */

export class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.categories = ['protocol', 'platform', 'intelligence', 'storage', 'notification', 'integration'];
  }

  /**
   * Register an adapter
   */
  register(category, name, adapter) {
    if (!this.categories.includes(category)) {
      throw new Error(`Invalid adapter category: ${category}`);
    }
    
    const key = `${category}:${name}`;
    this.adapters.set(key, adapter);
    
    console.log(`✅ Registered adapter: ${key}`);
  }

  /**
   * Get an adapter by category and name
   */
  get(category, name) {
    const key = `${category}:${name}`;
    const adapter = this.adapters.get(key);    
    if (!adapter) {
      throw new Error(`Adapter not found: ${key}`);
    }
    
    return adapter;
  }

  /**
   * Get all adapters in a category
   */
  getByCategory(category) {
    const prefix = `${category}:`;
    const results = [];
    
    for (const [key, adapter] of this.adapters) {
      if (key.startsWith(prefix)) {
        results.push({
          name: key.replace(prefix, ''),
          adapter
        });
      }
    }
    
    return results;
  }

  /**
   * Check if adapter exists
   */
  has(category, name) {
    const key = `${category}:${name}`;
    return this.adapters.has(key);
  }

  /**
   * Remove an adapter
   */
  unregister(category, name) {
    const key = `${category}:${name}`;
    return this.adapters.delete(key);
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters() {
    const result = {};
    
    for (const category of this.categories) {
      result[category] = this.getByCategory(category);
    }
    
    return result;
  }

  /**
   * Create composite adapter (fractal composition)
   */
  createComposite(category, name, adapterNames) {
    const adapters = adapterNames.map(adapterName => 
      this.get(category, adapterName)
    );
    
    // Create a composite adapter that delegates to multiple adapters
    const compositeAdapter = {
      async execute(...args) {
        const results = await Promise.allSettled(
          adapters.map(adapter => adapter.execute(...args))
        );
        
        return this.mergeResults(results);
      },
      
      mergeResults(results) {
        // Default merge strategy - can be overridden
        return results
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value)
          .flat();
      }
    };
    
    this.register(category, name, compositeAdapter);
    return compositeAdapter;
  }
}