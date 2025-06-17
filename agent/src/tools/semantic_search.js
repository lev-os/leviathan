#!/usr/bin/env node
/**
 * Semantic Research Search & Workflow Integration
 * Links research graph to active development context
 */

const fs = require('fs');
const path = require('path');

class ResearchWorkflowLinker {
  constructor(researchDir = './research') {
    this.researchDir = researchDir;
    this.knowledgeGraph = this.loadKnowledgeGraph();
    this.embeddings = this.loadEmbeddings();
  }

  /**
   * Auto-surface research based on current development context
   */
  async surfaceRelevantResearch(workingPath, fileContent = '') {
    const context = this.parseDevContext(workingPath, fileContent);
    const relevantNodes = this.matchToKnowledgeGraph(context);
    
    return {
      primaryResearch: relevantNodes.primary,
      relatedDocs: relevantNodes.related,
      suggestedActions: this.generateActionSuggestions(context, relevantNodes),
      patentImplications: this.checkPatentRelevance(context),
      implementationGaps: this.identifyGaps(context, relevantNodes)
    };
  }

  /**
   * Parse development context from file path and content
   */
  parseDevContext(workingPath, content) {
    const pathTokens = workingPath.split('/');
    const fileType = path.extname(workingPath);
    
    return {
      domain: this.extractDomain(pathTokens),
      technology: this.extractTechnology(pathTokens, fileType),
      patterns: this.extractPatterns(content),
      phase: this.inferDevelopmentPhase(workingPath, content)
    };
  }

  /**
   * Match development context to knowledge graph nodes
   */
  matchToKnowledgeGraph(context) {
    const themes = {
      'kernel': ['architecture', 'foundation'],
      'agent': ['implementation', 'synthesis'],
      'mcp': ['foundation', 'patents'],
      'protocol': ['architecture', 'implementation']
    };

    const primary = themes[context.domain] || ['synthesis'];
    const related = this.findRelatedNodes(context, primary);

    return { primary, related };
  }

  /**
   * Generate actionable suggestions based on context
   */
  generateActionSuggestions(context, relevantNodes) {
    const suggestions = [];

    if (context.phase === 'design') {
      suggestions.push(`Read ${relevantNodes.primary[0]} research first`);
      suggestions.push('Create architecture stub based on research');
    }

    if (context.phase === 'implementation') {
      suggestions.push('Reference implementation strategy docs');
      suggestions.push('Check patent implications before proceeding');
    }

    if (context.phase === 'testing') {
      suggestions.push('Validate against research requirements');
      suggestions.push('Update research with implementation learnings');
    }

    return suggestions;
  }

  /**
   * Check patent relevance for current development
   */
  checkPatentRelevance(context) {
    const patentTriggers = ['kernel', 'protocol', 'agent-coordination', 'zero-config'];
    
    return patentTriggers.some(trigger => 
      context.domain.includes(trigger) || 
      context.patterns.includes(trigger)
    );
  }

  /**
   * CLI interface for development workflow integration
   */
  static async cli() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const linker = new ResearchWorkflowLinker();

    switch (command) {
      case 'surface':
        const workingPath = args[1] || process.cwd();
        const result = await linker.surfaceRelevantResearch(workingPath);
        console.log('🔗 Relevant Research:');
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'link':
        const devPath = args[1];
        const researchFile = args[2];
        linker.createBidirectionalLink(devPath, researchFile);
        console.log(`✅ Linked ${devPath} ↔ ${researchFile}`);
        break;

      case 'gaps':
        const gaps = linker.findResearchGaps();
        console.log('📋 Research Gaps:');
        gaps.forEach(gap => console.log(`- ${gap}`));
        break;

      default:
        console.log(`
Usage: node semantic_search.js <command> [args]

Commands:
  surface [path]    - Surface relevant research for development context
  link <dev> <res>  - Create bidirectional link between dev and research
  gaps              - Find research gaps in current development
        `);
    }
  }
}

// CLI execution
if (require.main === module) {
  ResearchWorkflowLinker.cli().catch(console.error);
}

module.exports = ResearchWorkflowLinker;