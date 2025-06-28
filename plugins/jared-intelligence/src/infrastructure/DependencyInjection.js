/**
 * DependencyInjectionContainer - Simple DI container for managing dependencies
 * Supports singleton and factory patterns
 */

export class DependencyInjectionContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a service
   */
  register(name, ServiceClass, options = {}) {
    this.services.set(name, {
      ServiceClass,
      singleton: options.singleton !== false,
      dependencies: options.dependencies || []
    });
  }

  /**
   * Get a service instance
   */
  get(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Service not registered: ${name}`);
    }    
    // Return singleton if it exists
    if (service.singleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    
    // Resolve dependencies
    const dependencies = service.dependencies.map(dep => this.get(dep));
    
    // Create instance
    const instance = new service.ServiceClass(...dependencies);
    
    // Store singleton
    if (service.singleton) {
      this.singletons.set(name, instance);
    }
    
    return instance;
  }

  /**
   * Check if service is registered
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Clear all services and singletons
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
  }

  /**
   * Register multiple services at once
   */
  registerMultiple(services) {
    Object.entries(services).forEach(([name, config]) => {
      if (typeof config === 'function') {
        this.register(name, config);
      } else {
        this.register(name, config.ServiceClass, config.options);
      }
    });
  }
}