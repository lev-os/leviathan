/**
 * Promotion Engine - Local to Global Context Promotion System
 * Manages the fractal .kingly structure and context promotion pipeline
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class PromotionEngine {
  constructor() {
    this.localContextsPath = path.join(process.cwd(), '.kingly', 'contexts');
    this.globalContextsPath = path.join(process.env.HOME, 'ka', 'contexts');
    this.promotionThresholds = {
      quality_score: 0.8,
      usage_count: 5,
      effectiveness_rating: 0.7,
      documentation_completeness: 0.6
    };
  }
  
  async validatePromotion(context) {
    const validation = {
      canPromote: false,
      scores: {},
      gaps: [],
      overall_score: 0
    };
    
    // Quality score validation
    const qualityScore = context.effectiveness_metrics?.quality_score || 0;
    validation.scores.quality = qualityScore;
    if (qualityScore < this.promotionThresholds.quality_score) {
      validation.gaps.push(`Quality score too low: ${qualityScore} < ${this.promotionThresholds.quality_score}`);
    }
    
    // Usage count validation
    const usageCount = context.effectiveness_metrics?.usage_count || 0;
    validation.scores.usage = usageCount;
    if (usageCount < this.promotionThresholds.usage_count) {
      validation.gaps.push(`Usage count too low: ${usageCount} < ${this.promotionThresholds.usage_count}`);
    }
    
    // Effectiveness rating validation
    const effectivenessRating = context.effectiveness_metrics?.effectiveness_rating || 0;
    validation.scores.effectiveness = effectivenessRating;
    if (effectivenessRating < this.promotionThresholds.effectiveness_rating) {
      validation.gaps.push(`Effectiveness rating too low: ${effectivenessRating} < ${this.promotionThresholds.effectiveness_rating}`);
    }
    
    // Documentation completeness validation
    const docCompleteness = this.calculateDocumentationCompleteness(context);
    validation.scores.documentation = docCompleteness;
    if (docCompleteness < this.promotionThresholds.documentation_completeness) {
      validation.gaps.push(`Documentation incomplete: ${docCompleteness} < ${this.promotionThresholds.documentation_completeness}`);
    }
    
    // Calculate overall score
    validation.overall_score = (qualityScore + effectivenessRating + docCompleteness + Math.min(usageCount / 10, 1)) / 4;
    
    // Determine if can promote
    validation.canPromote = validation.gaps.length === 0;
    
    return validation;
  }
  
  async validateAllContexts() {
    const contexts = await this.getAllLocalContexts();
    const results = {
      total_contexts: contexts.length,
      ready_for_promotion: [],
      needs_improvement: [],
      validation_summary: {}
    };
    
    for (const contextInfo of contexts) {
      const context = await this.loadLocalContext(contextInfo.name);
      const validation = await this.validatePromotion(context);
      
      if (validation.canPromote) {
        results.ready_for_promotion.push({
          name: contextInfo.name,
          type: context.metadata?.type || 'unknown',
          overall_score: validation.overall_score
        });
      } else {
        results.needs_improvement.push({
          name: contextInfo.name,
          gaps: validation.gaps,
          overall_score: validation.overall_score
        });
      }
    }
    
    results.validation_summary = {
      promotion_ready: results.ready_for_promotion.length,
      needs_work: results.needs_improvement.length,
      promotion_rate: results.ready_for_promotion.length / results.total_contexts
    };
    
    return results;
  }
  
  async validateSingleContext(contextName) {
    const context = await this.loadLocalContext(contextName);
    if (!context) {
      return {
        success: false,
        message: `Context '${contextName}' not found in .kingly/contexts/`
      };
    }
    
    const validation = await this.validatePromotion(context);
    
    return {
      success: true,
      context_name: contextName,
      validation_results: validation,
      recommendations: this.generateRecommendations(validation)
    };
  }
  
  async promoteToGlobal(contextName, context) {
    // Ensure global contexts directory exists
    await this.ensureGlobalStructure();
    
    // Determine target directory based on context type
    const contextType = context.metadata?.type || 'tools';
    const targetDir = path.join(this.globalContextsPath, contextType, contextName);
    
    // Copy context to global location
    await fs.mkdir(targetDir, { recursive: true });
    
    // Copy all context files
    const localContextDir = path.join(this.localContextsPath, contextType, contextName);
    await this.copyDirectory(localContextDir, targetDir);
    
    // Update context metadata with promotion info
    context.metadata.promoted_at = new Date().toISOString();
    context.metadata.promoted_from = process.cwd();
    context.metadata.global_path = targetDir;
    
    // Save updated context
    const contextFile = path.join(targetDir, 'context.yaml');
    await fs.writeFile(contextFile, yaml.dump(context));
    
    // Update local context with promotion status
    const localContextFile = path.join(localContextDir, 'context.yaml');
    context.metadata.promotion_status = 'promoted';
    await fs.writeFile(localContextFile, yaml.dump(context));
    
    return {
      promoted: true,
      global_path: targetDir,
      context_type: contextType
    };
  }
  
  async loadLocalContext(contextName) {
    try {
      // Search all context type directories
      const contextTypes = ['tools', 'agents', 'workflows', 'patterns'];
      
      for (const type of contextTypes) {
        const contextPath = path.join(this.localContextsPath, type, contextName, 'context.yaml');
        try {
          const content = await fs.readFile(contextPath, 'utf8');
          return yaml.load(content);
        } catch {
          // Continue searching other types
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  async getAllLocalContexts() {
    const contexts = [];
    const contextTypes = ['tools', 'agents', 'workflows', 'patterns'];
    
    for (const type of contextTypes) {
      const typePath = path.join(this.localContextsPath, type);
      try {
        const entries = await fs.readdir(typePath);
        for (const entry of entries) {
          const entryPath = path.join(typePath, entry);
          const stat = await fs.stat(entryPath);
          if (stat.isDirectory()) {
            contexts.push({
              name: entry,
              type,
              path: entryPath
            });
          }
        }
      } catch {
        // Type directory doesn't exist, continue
      }
    }
    
    return contexts;
  }
  
  calculateDocumentationCompleteness(context) {
    let score = 0;
    let maxScore = 0;
    
    // Check required fields
    maxScore += 0.2; // metadata
    if (context.metadata) score += 0.2;
    
    maxScore += 0.2; // description
    if (context.description) score += 0.2;
    
    maxScore += 0.2; // capabilities or functionality
    if (context.capabilities || context.functionality) score += 0.2;
    
    maxScore += 0.2; // usage examples
    if (context.examples || context.usage) score += 0.2;
    
    maxScore += 0.2; // documentation files
    if (context.documentation || context.docs) score += 0.2;
    
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  generateRecommendations(validation) {
    const recommendations = [];
    
    if (validation.scores.quality < this.promotionThresholds.quality_score) {
      recommendations.push({
        area: 'quality',
        action: 'Improve context quality through user feedback and iteration',
        priority: 'high'
      });
    }
    
    if (validation.scores.usage < this.promotionThresholds.usage_count) {
      recommendations.push({
        area: 'usage',
        action: 'Use context in more scenarios to build usage history',
        priority: 'medium'
      });
    }
    
    if (validation.scores.effectiveness < this.promotionThresholds.effectiveness_rating) {
      recommendations.push({
        area: 'effectiveness',
        action: 'Optimize context for better effectiveness metrics',
        priority: 'high'
      });
    }
    
    if (validation.scores.documentation < this.promotionThresholds.documentation_completeness) {
      recommendations.push({
        area: 'documentation',
        action: 'Complete documentation with examples and usage guides',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
  
  async ensureGlobalStructure() {
    const contextTypes = ['tools', 'agents', 'workflows', 'patterns'];
    
    for (const type of contextTypes) {
      const typePath = path.join(this.globalContextsPath, type);
      await fs.mkdir(typePath, { recursive: true });
    }
  }
  
  async copyDirectory(source, destination) {
    await fs.mkdir(destination, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }
}