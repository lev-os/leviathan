#!/usr/bin/env node

/**
 * Research Intelligence Router - Analysis Agent Implementation
 * Triggered by Claude Code hooks on research tool usage
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

class ResearchRouter {
  constructor(options = {}) {
    this.projectRoot = options.context || process.cwd();
    this.sessionId = options.sessionId || 'unknown';
    this.toolName = options.toolName || 'unknown';
    this.debugMode = options.debug || true;
    
    // Load project context
    this.projectContext = this.loadProjectContext();
    this.sessionState = this.detectSessionState();
  }

  /**
   * Main entry point - analyze and route research output
   */
  async analyze(researchOutput) {
    try {
      // Step 1: Classify research intent
      const classification = this.classifyResearch(researchOutput);
      
      // Step 2: Determine confidence and action
      const { confidence, action, destination } = this.assessConfidence(classification);
      
      // Step 3: Execute routing decision
      const result = await this.executeRouting(action, destination, researchOutput, confidence);
      
      // Step 4: Output debug status
      this.outputDebugStatus(classification, confidence, action, result);
      
      return result;
    } catch (error) {
      this.outputDebugStatus('ERROR', 0, 'FAILED', error.message);
      throw error;
    }
  }

  /**
   * Classify research as supplementary vs primary
   */
  classifyResearch(output) {
    const workflowState = this.sessionState;
    
    if (workflowState === 'ACTIVE_WORK') {
      return {
        type: 'SUPPLEMENTARY',
        reason: 'User actively working on specific task',
        confidence: 100
      };
    }
    
    return {
      type: 'PRIMARY', 
      reason: 'Standalone research activity detected',
      confidence: 80
    };
  }

  /**
   * Assess routing confidence based on content analysis
   */
  assessConfidence(classification) {
    if (classification.type === 'SUPPLEMENTARY') {
      return {
        confidence: 100,
        action: 'DO_NOTHING',
        destination: null
      };
    }

    // Analyze content for routing patterns
    const routingAnalysis = this.analyzeContentForRouting(classification);
    
    if (routingAnalysis.confidence >= 100) {
      return {
        confidence: routingAnalysis.confidence,
        action: 'AUTO_ROUTE',
        destination: routingAnalysis.destination
      };
    }
    
    return {
      confidence: routingAnalysis.confidence,
      action: 'DASHBOARD',
      destination: routingAnalysis.options
    };
  }

  /**
   * Analyze research content to determine best routing destination
   */
  analyzeContentForRouting(classification) {
    const routingMap = {
      'framework_research': {
        patterns: ['framework', 'library', 'tool comparison', 'technology'],
        destination: 'docs/research/frameworks/',
        boost: 20
      },
      'architecture_patterns': {
        patterns: ['architecture', 'design pattern', 'system design', 'scalability'],
        destination: 'docs/workflows/wizard-experience/',
        boost: 15
      },
      'competitive_analysis': {
        patterns: ['competitor', 'market analysis', 'business model', 'strategy'],
        destination: 'docs/research/competitive/', 
        boost: 25
      },
      'concept_synthesis': {
        patterns: ['revolutionary', 'breakthrough', 'paradigm', 'innovation'],
        destination: 'docs/workflows/wizard-experience/',
        boost: 30
      },
      'tool_evaluation': {
        patterns: ['pricing', 'features', 'integration', 'comparison'],
        destination: 'workshop/intake/',
        boost: 20
      },
      'working_research': {
        patterns: ['documentation', 'how-to', 'reference'],
        destination: 'tmp/',
        boost: 10
      }
    };

    let bestMatch = null;
    let maxConfidence = 0;

    for (const [type, config] of Object.entries(routingMap)) {
      const matches = config.patterns.filter(pattern => 
        classification.reason.toLowerCase().includes(pattern)
      );
      
      if (matches.length > 0) {
        const confidence = classification.confidence + config.boost;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          bestMatch = {
            type,
            destination: config.destination,
            confidence: Math.min(confidence, 100)
          };
        }
      }
    }

    return bestMatch || {
      type: 'unknown',
      destination: 'tmp/',
      confidence: 50,
      options: ['docs/research/', 'tmp/', 'docs/workflows/wizard-experience/']
    };
  }

  /**
   * Execute the routing decision
   */
  async executeRouting(action, destination, content, confidence) {
    switch (action) {
      case 'DO_NOTHING':
        return { action: 'ignored', reason: 'supplementary_context' };
        
      case 'AUTO_ROUTE':
        return await this.saveToDestination(destination, content);
        
      case 'DASHBOARD':
        return this.presentDashboard(destination, content, confidence);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Save research content to determined destination
   */
  async saveToDestination(destination, content) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `research-${this.sessionId}-${timestamp}.md`;
    const fullPath = join(this.projectRoot, destination, filename);
    
    // Ensure directory exists
    mkdirSync(dirname(fullPath), { recursive: true });
    
    // Format content with metadata
    const formattedContent = this.formatResearchContent(content, {
      source: this.toolName,
      session: this.sessionId,
      timestamp: new Date().toISOString(),
      auto_routed: true
    });
    
    writeFileSync(fullPath, formattedContent);
    
    return {
      action: 'saved',
      destination: fullPath,
      filename
    };
  }

  /**
   * Present dashboard options for manual routing
   */
  presentDashboard(options, content, confidence) {
    console.log('\\n🔍 RESEARCH ROUTING DASHBOARD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Confidence: ${confidence}% (below auto-route threshold)`);
    console.log('🎯 Choose destination:');
    
    if (Array.isArray(options)) {
      options.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option}`);
      });
    }
    
    console.log('  0. Skip (ignore this research)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
    
    return {
      action: 'dashboard_presented',
      options,
      confidence,
      content_preview: content.slice(0, 200) + '...'
    };
  }

  /**
   * Format research content with metadata
   */
  formatResearchContent(content, metadata) {
    return `# Research Note

**Auto-generated**: ${metadata.timestamp}
**Source Tool**: ${metadata.source}
**Session**: ${metadata.session}
**Auto-routed**: ${metadata.auto_routed}

---

${content}

---

*Generated by Leviathan Research Intelligence Router*
`;
  }

  /**
   * Detect current session state
   */
  detectSessionState() {
    // Simple heuristics for now - could be enhanced with git status, file timestamps, etc.
    try {
      // Check for recent file modifications
      const gitStatus = execSync('git status --porcelain', { 
        cwd: this.projectRoot,
        encoding: 'utf8' 
      });
      
      if (gitStatus.trim()) {
        return 'ACTIVE_WORK';
      }
      
      return 'IDLE';
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * Load project context from CLAUDE.md and other sources
   */
  loadProjectContext() {
    const claudeMdPath = join(this.projectRoot, 'CLAUDE.md');
    
    if (existsSync(claudeMdPath)) {
      return {
        claudeMd: readFileSync(claudeMdPath, 'utf8'),
        hasProjectContext: true
      };
    }
    
    return { hasProjectContext: false };
  }

  /**
   * Output debug status bar
   */
  outputDebugStatus(classification, confidence, action, result) {
    if (!this.debugMode) return;
    
    const sessionState = this.sessionState.toLowerCase().replace('_', '-');
    
    let statusMessage;
    
    if (action === 'DO_NOTHING') {
      statusMessage = `🔍 RESEARCH HOOK: Supplementary context detected | No action taken | Session: ${sessionState}`;
    } else if (action === 'AUTO_ROUTE') {
      const filename = result.filename || 'unknown';
      statusMessage = `🔍 RESEARCH HOOK: Primary research detected | ${confidence}% confidence → Auto-routed to ${filename}`;
    } else if (action === 'DASHBOARD') {
      statusMessage = `🔍 RESEARCH HOOK: Primary research detected | ${confidence}% confidence → Dashboard: Choose routing destination`;
    } else {
      statusMessage = `🔍 RESEARCH HOOK: ${action} | ${confidence}% | ${result}`;
    }
    
    console.log(statusMessage);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }
  
  const router = new ResearchRouter(options);
  
  // Get input from stdin or command line
  const input = options.input || process.stdin.read();
  
  router.analyze(input)
    .then(result => {
      if (options.output === 'json') {
        console.log(JSON.stringify(result, null, 2));
      }
    })
    .catch(error => {
      console.error('Research routing failed:', error.message);
      process.exit(1);
    });
}

export { ResearchRouter };