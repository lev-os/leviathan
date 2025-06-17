import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Intelligence Coordinator
 * Handles cross-workspace intelligence operations and memory management
 */
export class IntelligenceCoordinator {
  constructor() {
    this.intelligenceDir = path.join(os.homedir(), '.leviathan', 'intelligence');
    this.draftsDir = path.join(this.intelligenceDir, 'drafts');
    this.memoriesDir = path.join(this.intelligenceDir, 'memories');
    this.patternsDir = path.join(this.intelligenceDir, 'patterns');
    
    this.ensureDirectories();
  }

  /**
   * Ensure intelligence directories exist
   */
  ensureDirectories() {
    const dirs = [this.intelligenceDir, this.draftsDir, this.memoriesDir, this.patternsDir];
    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
  }

  /**
   * Perform deep contextual analysis
   */
  async performPowerAnalysis(context, files = [], workspace = 'current') {
    const analysis = {
      context,
      workspace,
      files,
      timestamp: new Date().toISOString(),
      analysis_id: `power-${Date.now()}`,
      patterns_identified: [],
      insights: [],
      recommendations: [],
      confidence_scores: {},
      cross_workspace_potential: false
    };

    // Analyze context for patterns
    analysis.patterns_identified = this.identifyPatterns(context);
    
    // Generate insights based on context
    analysis.insights = this.generateInsights(context, files, workspace);
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(context, analysis.patterns_identified);
    
    // Calculate confidence scores
    analysis.confidence_scores = this.calculateConfidenceScores(context, analysis.patterns_identified);
    
    // Check cross-workspace potential
    analysis.cross_workspace_potential = this.assessCrossWorkspacePotential(analysis.patterns_identified);

    return analysis;
  }

  /**
   * Identify patterns in context
   */
  identifyPatterns(context) {
    const patterns = [];
    const lowerContext = context.toLowerCase();
    
    // Technical patterns
    if (lowerContext.includes('debug') || lowerContext.includes('error') || lowerContext.includes('fix')) {
      patterns.push({
        type: 'debugging',
        confidence: 0.8,
        description: 'Debugging and error resolution patterns'
      });
    }
    
    if (lowerContext.includes('optimize') || lowerContext.includes('performance') || lowerContext.includes('slow')) {
      patterns.push({
        type: 'optimization',
        confidence: 0.8,
        description: 'Performance optimization patterns'
      });
    }
    
    if (lowerContext.includes('implement') || lowerContext.includes('feature') || lowerContext.includes('develop')) {
      patterns.push({
        type: 'development',
        confidence: 0.7,
        description: 'Development and implementation patterns'
      });
    }
    
    // Strategic patterns
    if (lowerContext.includes('strategy') || lowerContext.includes('plan') || lowerContext.includes('decision')) {
      patterns.push({
        type: 'strategic',
        confidence: 0.8,
        description: 'Strategic planning and decision-making patterns'
      });
    }
    
    // Research patterns
    if (lowerContext.includes('research') || lowerContext.includes('investigate') || lowerContext.includes('analyze')) {
      patterns.push({
        type: 'research',
        confidence: 0.7,
        description: 'Research and analysis patterns'
      });
    }
    
    return patterns;
  }

  /**
   * Generate insights based on context analysis
   */
  generateInsights(context, files, workspace) {
    const insights = [];
    
    // Context-based insights
    if (context.length > 200) {
      insights.push('Complex context detected - consider breaking into smaller components');
    }
    
    if (files.length > 0) {
      insights.push(`File references detected (${files.length}) - workspace coordination opportunity`);
    }
    
    // Workspace-specific insights
    if (workspace !== 'current') {
      insights.push('Cross-workspace operation detected - pattern sharing potential');
    }
    
    // Pattern recognition insights
    const keywords = ['breakthrough', 'solution', 'pattern', 'discovery', 'innovation'];
    if (keywords.some(keyword => context.toLowerCase().includes(keyword))) {
      insights.push('High-value insight detected - candidate for procedural memory');
    }
    
    return insights;
  }

  /**
   * Generate recommendations based on patterns
   */
  generateRecommendations(context, patterns) {
    const recommendations = [];
    
    for (const pattern of patterns) {
      switch (pattern.type) {
        case 'debugging':
          recommendations.push('Consider creating error resolution template for reuse');
          recommendations.push('Document debugging approach for pattern sharing');
          break;
        case 'optimization':
          recommendations.push('Benchmark before/after for performance validation');
          recommendations.push('Create optimization checklist for future use');
          break;
        case 'development':
          recommendations.push('Follow TDD/BDD patterns for quality assurance');
          recommendations.push('Consider code review and documentation standards');
          break;
        case 'strategic':
          recommendations.push('Document decision rationale for future reference');
          recommendations.push('Create strategic framework template');
          break;
        case 'research':
          recommendations.push('Systematize research methodology');
          recommendations.push('Create knowledge synthesis templates');
          break;
      }
    }
    
    return recommendations;
  }

  /**
   * Calculate confidence scores for different aspects
   */
  calculateConfidenceScores(context, patterns) {
    const scores = {};
    
    // Overall context clarity
    scores.context_clarity = context.length > 50 && context.length < 500 ? 0.8 : 0.6;
    
    // Pattern confidence (average of identified patterns)
    scores.pattern_confidence = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
      : 0.5;
    
    // Actionability score
    const actionWords = ['implement', 'create', 'fix', 'optimize', 'develop', 'research'];
    scores.actionability = actionWords.some(word => context.toLowerCase().includes(word)) ? 0.8 : 0.6;
    
    // Significance score
    const significanceWords = ['breakthrough', 'critical', 'important', 'urgent', 'priority'];
    scores.significance = significanceWords.some(word => context.toLowerCase().includes(word)) ? 0.9 : 0.7;
    
    return scores;
  }

  /**
   * Assess cross-workspace sharing potential
   */
  assessCrossWorkspacePotential(patterns) {
    // High-value patterns that should be shared across workspaces
    const shareablePatterns = ['debugging', 'optimization', 'strategic'];
    return patterns.some(pattern => 
      shareablePatterns.includes(pattern.type) && pattern.confidence > 0.7
    );
  }

  /**
   * Save analysis draft
   */
  async saveDraft(analysis, saveDraft = true) {
    if (!saveDraft) return null;
    
    try {
      const draftPath = path.join(this.draftsDir, `${analysis.analysis_id}.json`);
      fs.writeFileSync(draftPath, JSON.stringify(analysis, null, 2));
      return draftPath;
    } catch (error) {
      console.error('Error saving analysis draft:', error);
      return null;
    }
  }

  /**
   * Perform intelligence lookup
   */
  async performLookup(query, scope = 'workspace', format = 'structured') {
    const lookupResult = {
      query,
      scope,
      format,
      timestamp: new Date().toISOString(),
      intelligence_entries: [],
      confidence: 0.0,
      sources: []
    };

    // Search existing intelligence files
    const intelligenceEntries = await this.searchIntelligence(query, scope);
    lookupResult.intelligence_entries = intelligenceEntries;
    
    // Calculate overall confidence
    if (intelligenceEntries.length > 0) {
      lookupResult.confidence = intelligenceEntries.reduce((sum, entry) => sum + entry.confidence, 0) / intelligenceEntries.length;
    }
    
    return lookupResult;
  }

  /**
   * Search existing intelligence files
   */
  async searchIntelligence(query, scope) {
    const entries = [];
    const queryLower = query.toLowerCase();
    
    try {
      // Search memory files
      const memoryFiles = fs.readdirSync(this.memoriesDir);
      for (const file of memoryFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.memoriesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const memory = JSON.parse(content);
          
          if (memory.content && memory.content.toLowerCase().includes(queryLower)) {
            entries.push({
              type: 'memory',
              source: file,
              content: memory.content,
              confidence: memory.confidence || 0.7,
              timestamp: memory.timestamp
            });
          }
        }
      }
      
      // Search pattern files
      const patternFiles = fs.readdirSync(this.patternsDir);
      for (const file of patternFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.patternsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const pattern = JSON.parse(content);
          
          if (pattern.description && pattern.description.toLowerCase().includes(queryLower)) {
            entries.push({
              type: 'pattern',
              source: file,
              content: pattern.description,
              confidence: pattern.confidence || 0.8,
              timestamp: pattern.timestamp
            });
          }
        }
      }
    } catch (error) {
      console.error('Error searching intelligence:', error);
    }
    
    // Sort by confidence and limit results
    return entries.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  /**
   * Create procedural memory from analysis
   */
  async createProceduralMemory(analysis, threshold = 0.8) {
    if (analysis.confidence_scores.significance < threshold) {
      return null;
    }
    
    const memory = {
      id: `memory-${Date.now()}`,
      content: analysis.context,
      patterns: analysis.patterns_identified,
      confidence: analysis.confidence_scores.significance,
      workspace: analysis.workspace,
      cross_workspace_potential: analysis.cross_workspace_potential,
      timestamp: analysis.timestamp,
      source_analysis: analysis.analysis_id
    };
    
    try {
      const memoryPath = path.join(this.memoriesDir, `${memory.id}.json`);
      fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
      return memoryPath;
    } catch (error) {
      console.error('Error creating procedural memory:', error);
      return null;
    }
  }
}