// @kingly/universal-validation - Universal validation framework for Kingly core
import { logger, tracer, monitor } from '@kingly/debug';

// Core validation frameworks
import { MathematicalValidator } from './mathematical-validator.js';
import { ExpertConsensusValidator } from './expert-consensus-validator.js';
import { OppositionValidator } from './opposition-validator.js';
import { ParliamentValidator } from './parliament-validator.js';
import { VisualizationValidator } from './visualization-validator.js';
import { BreakthroughBubbler } from './breakthrough-bubbler.js';

/**
 * Universal Validation System
 * Provides comprehensive validation capabilities across domains
 */
export class UniversalValidationSystem {
  constructor(config = {}) {
    const trace = tracer.start('universal-validation-init');
    
    this.config = {
      domain: 'general',
      confidenceThreshold: 0.7,
      frameworkTimeout: 120000,
      visualizationEnabled: true,
      breakthroughTracking: true,
      ...config
    };

    // Initialize validators with debugging
    this.validators = new Map();
    this._initializeValidators();
    
    logger.info('Universal validation system initialized', { 
      domain: this.config.domain,
      validators: Array.from(this.validators.keys())
    });
    
    trace.end();
  }

  _initializeValidators() {
    const validatorConfigs = [
      ['mathematical', MathematicalValidator],
      ['expert-consensus', ExpertConsensusValidator],
      ['opposition', OppositionValidator],
      ['parliament', ParliamentValidator],
      ['visualization', VisualizationValidator],
      ['breakthrough', BreakthroughBubbler]
    ];

    for (const [name, ValidatorClass] of validatorConfigs) {
      try {
        this.validators.set(name, new ValidatorClass(this.config));
        logger.debug(`Validator initialized: ${name}`);
      } catch (error) {
        logger.error(`Failed to initialize validator: ${name}`, { error: error.message });
      }
    }
  }

  /**
   * Execute comprehensive validation using specified frameworks
   */
  async validate(target, frameworks = ['mathematical', 'expert-consensus'], options = {}) {
    const trace = tracer.start('universal-validation-execute');
    const startTime = Date.now();

    try {
      logger.info('Starting universal validation', { 
        target: typeof target === 'string' ? target.substring(0, 100) : '[object]',
        frameworks,
        domain: this.config.domain
      });

      const results = {};
      const promises = [];

      // Execute frameworks in parallel
      for (const framework of frameworks) {
        if (this.validators.has(framework)) {
          const validator = this.validators.get(framework);
          promises.push(this._executeFramework(framework, validator, target, options));
        } else {
          logger.warn(`Unknown validation framework: ${framework}`);
        }
      }

      const frameworkResults = await Promise.allSettled(promises);
      
      // Process results
      frameworkResults.forEach((result, index) => {
        const framework = frameworks[index];
        if (result.status === 'fulfilled') {
          results[framework] = result.value;
          logger.debug(`Framework completed: ${framework}`, { 
            confidence: result.value.confidence 
          });
        } else {
          results[framework] = {
            status: 'ERROR',
            error: result.reason.message,
            confidence: 0
          };
          logger.error(`Framework failed: ${framework}`, { 
            error: result.reason.message 
          });
        }
      });

      // Calculate overall confidence
      const overallConfidence = this._calculateOverallConfidence(results);
      const recommendation = this._generateRecommendation(results, overallConfidence);

      const finalResults = {
        timestamp: new Date().toISOString(),
        target: typeof target === 'string' ? target : '[validation target]',
        domain: this.config.domain,
        frameworks: frameworks,
        results,
        summary: {
          overall_confidence: overallConfidence,
          recommendation,
          validation_count: frameworks.length,
          success_rate: Object.values(results).filter(r => r.status !== 'ERROR').length / frameworks.length
        }
      };

      const duration = Date.now() - startTime;
      monitor.trackOperation('universal-validation', { 
        success: true, 
        duration: `${duration}ms`,
        frameworks: frameworks.length,
        confidence: overallConfidence
      });

      logger.info('Universal validation completed', {
        confidence: overallConfidence,
        recommendation,
        duration: `${duration}ms`
      });

      trace.end();
      return finalResults;

    } catch (error) {
      const duration = Date.now() - startTime;
      monitor.trackOperation('universal-validation', { 
        success: false, 
        duration: `${duration}ms`,
        error: error.message
      });

      logger.error('Universal validation failed', { error: error.message });
      trace.end();
      throw error;
    }
  }

  async _executeFramework(name, validator, target, options) {
    const trace = tracer.start(`framework-${name}`);
    
    try {
      const result = await validator.validate(target, {
        ...this.config,
        ...options
      });
      
      trace.end();
      return result;
    } catch (error) {
      trace.end();
      throw new Error(`${name} validation failed: ${error.message}`);
    }
  }

  _calculateOverallConfidence(results) {
    const validResults = Object.values(results).filter(r => r.status !== 'ERROR');
    if (validResults.length === 0) return 0;

    const totalConfidence = validResults.reduce((sum, result) => {
      return sum + (result.confidence || 0);
    }, 0);

    return Math.round(totalConfidence / validResults.length);
  }

  _generateRecommendation(results, overallConfidence) {
    if (overallConfidence >= 80) {
      return 'HIGHLY_RECOMMENDED';
    } else if (overallConfidence >= 70) {
      return 'RECOMMENDED';
    } else if (overallConfidence >= 50) {
      return 'CONDITIONAL_APPROVAL';
    } else if (overallConfidence >= 30) {
      return 'NEEDS_IMPROVEMENT';
    } else {
      return 'NOT_RECOMMENDED';
    }
  }

  /**
   * Get available validation frameworks
   */
  getAvailableFrameworks() {
    return Array.from(this.validators.keys());
  }

  /**
   * Get framework-specific validator
   */
  getValidator(framework) {
    return this.validators.get(framework);
  }
}

// Export individual validators for direct use
export {
  MathematicalValidator,
  ExpertConsensusValidator,
  OppositionValidator,
  ParliamentValidator,
  VisualizationValidator,
  BreakthroughBubbler
};

// Default export for convenience
export default UniversalValidationSystem;