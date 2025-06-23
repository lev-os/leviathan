/**
 * Intent Classification Service
 * Classifies task intent based on title and description
 */

export class IntentClassifier {
  static classifyTaskIntent(title, description = '') {
    const originalText = `${title} ${description}`;
    const text = originalText.toLowerCase();
    
    // Keywords for each intent type
    const patterns = {
      implementation: /implement|build|create|add|fix|update|refactor|integrate|develop|code/,
      research: /research|compare|analyze|investigate|evaluate|explore|study|assess|review/,
      planning: /plan|roadmap|strategy|organize|schedule|design|architect|define|outline/,
      testing: /test|verify|validate|check|qa|quality|debug/,
      documentation: /document|write docs|readme|guide|explain|describe/,
      deployment: /deploy|release|ship|launch|publish|rollout/
    };
    
    // Find all matching intents with confidence scores
    const candidates = [];
    
    for (const [intentType, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches) {
        const confidence = this.calculateConfidence(text, matches, intentType);
        candidates.push({ type: intentType, confidence });
      }
    }
    
    // Handle ambiguous cases by checking multiple patterns
    if (text.includes('database') && text.includes('migration')) {
      // Could be implementation, planning, or research
      candidates.push({ type: 'implementation', confidence: 0.6 });
      candidates.push({ type: 'planning', confidence: 0.3 });
      candidates.push({ type: 'research', confidence: 0.1 });
    }
    
    // Sort by confidence
    candidates.sort((a, b) => b.confidence - a.confidence);
    
    // If no matches, default to general
    if (candidates.length === 0) {
      candidates.push({ type: 'general', confidence: 0.5 });
    }
    
    const topIntent = candidates[0].type;
    const topConfidence = candidates[0].confidence;
    
    // Extract context based on intent type (use original text for case preservation)
    const context = this.extractContext(originalText, topIntent);
    
    return {
      type: topIntent,
      confidence: topConfidence,
      context,
      candidates
    };
  }
  
  static calculateConfidence(text, matches, intentType) {
    // Base confidence from keyword presence
    let confidence = 0.6;
    
    // Boost confidence for multiple keywords
    if (matches.length > 1) {
      confidence += 0.1 * (matches.length - 1);
    }
    
    // Boost for intent-specific indicators
    const boostPatterns = {
      implementation: /jwt|auth|api|database|feature/,
      research: /options|versus|comparison|pros.*cons/,
      planning: /quarter|q[1-4]|timeline|milestone/
    };
    
    if (boostPatterns[intentType] && text.match(boostPatterns[intentType])) {
      confidence += 0.2;
    }
    
    // Cap at 0.95
    return Math.min(confidence, 0.95);
  }
  
  static extractContext(text, intentType) {
    const context = {
      domain: this.detectDomain(text),
      complexity: this.assessComplexity(text),
      keywords: this.extractKeywords(text)
    };
    
    // Add intent-specific context
    switch (intentType) {
      case 'implementation':
        return {
          ...context,
          features: this.extractFeatures(text),
          technologies: this.extractTechnologies(text)
        };
        
      case 'research':
        return {
          ...context,
          research_type: this.detectResearchType(text),
          options: this.extractOptions(text)
        };
        
      case 'planning':
        return {
          ...context,
          scope: this.detectScope(text),
          timeframe: this.extractTimeframe(text),
          deliverable: this.extractDeliverable(text)
        };
        
      default:
        return context;
    }
  }
  
  static detectDomain(text) {
    const domains = {
      security: /auth|security|jwt|token|password|encrypt/,
      infrastructure: /database|server|cloud|deploy|docker|kubernetes/,
      frontend: /ui|ux|react|vue|css|design|interface/,
      backend: /api|endpoint|server|microservice|queue/,
      data: /analytics|metrics|reporting|etl|pipeline/,
      product: /feature|user story|requirement|roadmap/
    };
    
    for (const [domain, pattern] of Object.entries(domains)) {
      if (text.match(pattern)) {
        return domain;
      }
    }
    
    return 'general';
  }
  
  static assessComplexity(text) {
    // Simple heuristic based on length and technical terms
    const technicalTerms = text.match(/api|database|integration|architecture|distributed|scalable|authentication|jwt|token|refresh/gi) || [];
    const wordCount = text.split(/\s+/).length;
    
    // JWT authentication is medium complexity
    if (text.toLowerCase().includes('jwt') && text.toLowerCase().includes('auth')) {
      return 'medium';
    }
    
    if (technicalTerms.length > 3 || wordCount > 50) {
      return 'high';
    } else if (technicalTerms.length > 1 || wordCount > 20) {
      return 'medium';
    }
    
    return 'low';
  }
  
  static extractKeywords(text) {
    // Extract significant technical terms
    const keywords = [];
    const patterns = [
      /jwt/gi,
      /auth[a-z]*/gi,
      /database/gi,
      /api/gi,
      /[a-z]+js/gi,  // frameworks like nodejs, reactjs
      /docker/gi,
      /kubernetes/gi,
      /graphql/gi,
      /rest/gi
    ];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        keywords.push(...matches.map(m => m.toLowerCase()));
      }
    }
    
    // Remove duplicates
    return [...new Set(keywords)];
  }
  
  static extractFeatures(text) {
    const features = [];
    const featurePatterns = [
      /user\s+\w+/g,  // "user authentication", "user profile"
      /\w+\s+management/g,  // "session management", "state management"
      /\w+\s+system/g  // "notification system", "payment system"
    ];
    
    for (const pattern of featurePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        features.push(...matches);
      }
    }
    
    return features;
  }
  
  static extractTechnologies(text) {
    const techs = [];
    const techPatterns = {
      languages: /javascript|typescript|python|java|go|rust/gi,
      frameworks: /react|vue|angular|express|fastapi|django/gi,
      databases: /postgres|mysql|mongodb|redis|elasticsearch/gi,
      tools: /docker|kubernetes|jenkins|github|gitlab/gi
    };
    
    for (const [category, pattern] of Object.entries(techPatterns)) {
      const matches = text.match(pattern);
      if (matches) {
        techs.push(...matches.map(m => m.toLowerCase()));
      }
    }
    
    return [...new Set(techs)];
  }
  
  static detectResearchType(text) {
    if (text.match(/compar|versus|vs\.|alternative/)) {
      return 'comparison';
    } else if (text.match(/feasibility|possible|viable/)) {
      return 'feasibility';
    } else if (text.match(/best practice|standard|convention/)) {
      return 'best-practices';
    }
    
    return 'exploratory';
  }
  
  static extractOptions(text) {
    const options = [];
    
    // Look for "X vs Y" or "X or Y" patterns
    const vsPattern = /(\w+)\s+(?:vs\.?|versus|or)\s+(\w+)/gi;
    const matches = text.matchAll(vsPattern);
    
    for (const match of matches) {
      options.push(match[1], match[2]);
    }
    
    // Also look for listed items
    const listPattern = /(?:neo4j|dgraph|postgres|mysql|mongodb|redis)/gi;
    const listMatches = text.match(listPattern);
    if (listMatches) {
      options.push(...listMatches);
    }
    
    return [...new Set(options.map(o => o.charAt(0).toUpperCase() + o.slice(1)))];
  }
  
  static detectScope(text) {
    if (text.match(/product|feature|user/)) {
      return 'product';
    } else if (text.match(/technical|architecture|infrastructure/)) {
      return 'technical';
    } else if (text.match(/team|process|workflow/)) {
      return 'process';
    }
    
    return 'general';
  }
  
  static extractTimeframe(text) {
    // Look for quarters
    const quarterMatch = text.match(/q([1-4])/i);
    if (quarterMatch) {
      return `Q${quarterMatch[1]}`;
    }
    
    // Look for months
    const monthMatch = text.match(/(\d+)\s*month/);
    if (monthMatch) {
      return `${monthMatch[1]} months`;
    }
    
    // Look for specific time periods
    if (text.match(/next\s+quarter/)) return 'next quarter';
    if (text.match(/this\s+year/)) return 'this year';
    if (text.match(/sprint/)) return 'sprint';
    
    return 'undefined';
  }
  
  static extractDeliverable(text) {
    const deliverables = {
      roadmap: /roadmap|timeline|schedule/,
      architecture: /architecture|design\s+doc|technical\s+spec/,
      plan: /plan|strategy|approach/,
      proposal: /proposal|recommendation|rfc/
    };
    
    for (const [deliverable, pattern] of Object.entries(deliverables)) {
      if (text.match(pattern)) {
        return deliverable;
      }
    }
    
    return 'plan';
  }
}