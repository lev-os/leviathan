#!/usr/bin/env node

/**
 * Workshop Intake Command - LLM-First Analysis
 * 
 * LLM-driven repository analysis with human decision points.
 * Presents analysis results in dashboard format for strategic decisions.
 */

import { logger } from '@lev-os/debug';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default class IntakeCommand {
  constructor() {
    this.description = 'LLM-driven repository analysis with decision dashboard';
    this.args = ['repo-url: GitHub repository URL to analyze'];
    this.options = [
      '--skip-clone: Skip cloning if repository already exists',
      '--dashboard: Show interactive decision dashboard',
      '--auto-workflow: Auto-start external-tools-research workflow'
    ];
  }

  async execute(args = [], options = {}) {
    const repoUrl = args[0];
    
    if (!repoUrl) {
      return {
        success: false,
        error: 'Repository URL is required. Usage: lev workshop intake <repo-url>'
      };
    }

    logger.info('LLM-First Workshop intake starting', { repoUrl, options });

    try {
      // Step 1: Repository setup
      const repoName = this.extractRepoName(repoUrl);
      const intakePath = path.resolve('../../../workshop/intake');
      const repoPath = path.join(intakePath, repoName);

      if (!options.skipClone) {
        await this.ensureRepository(repoUrl, repoPath);
      }

      // Step 2: LLM-driven analysis
      const repositoryContext = await this.gatherRepositoryContext(repoPath, repoUrl);
      const llmAnalysis = await this.performLLMAnalysis(repositoryContext);

      // Step 3: Present decision dashboard
      const dashboard = this.createDecisionDashboard(repoName, llmAnalysis, repositoryContext);

      // Step 4: Handle workflow integration if requested
      if (options.autoWorkflow) {
        await this.initiateWorkflow(repoName, llmAnalysis, repositoryContext);
      }

      return {
        success: true,
        formatted_response: dashboard,
        data: {
          repository: repoName,
          analysis: llmAnalysis,
          context: repositoryContext,
          decisions_pending: true,
          next_actions: [
            'Review LLM analysis results',
            'Make strategic decision: ADR/Remove/File Later',
            'Use external-tools-research workflow for deep dive',
            'Update workshop tracking based on decision'
          ]
        }
      };

    } catch (error) {
      logger.error('LLM-First intake failed', { error: error.message, repoUrl });
      return {
        success: false,
        error: `Intake failed: ${error.message}`
      };
    }
  }

  /**
   * Extract repository name from GitHub URL
   */
  extractRepoName(repoUrl) {
    const match = repoUrl.match(/github\.com\/[^\/]+\/([^\/]+?)(?:\.git)?$/);
    return match ? match[1] : path.basename(repoUrl, '.git');
  }

  /**
   * Ensure repository is available locally
   */
  async ensureRepository(repoUrl, repoPath) {
    try {
      await fs.mkdir(path.dirname(repoPath), { recursive: true });

      if (await this.directoryExists(repoPath)) {
        logger.info('Repository exists, pulling latest changes', { repoPath });
        await execAsync('git pull', { cwd: repoPath });
      } else {
        logger.info('Cloning repository for analysis', { repoUrl, repoPath });
        await execAsync(`git clone ${repoUrl} ${repoPath}`);
      }
    } catch (error) {
      throw new Error(`Failed to setup repository: ${error.message}`);
    }
  }

  /**
   * Gather comprehensive repository context for LLM analysis
   */
  async gatherRepositoryContext(repoPath, repoUrl) {
    const context = {
      url: repoUrl,
      path: repoPath,
      name: path.basename(repoPath),
      timestamp: new Date().toISOString(),
      files: {},
      structure: {},
      git: {}
    };

    try {
      // Key files for LLM analysis
      const keyFiles = ['README.md', 'package.json', 'requirements.txt', 'setup.py', 'Cargo.toml', 'go.mod'];
      
      for (const fileName of keyFiles) {
        const filePath = path.join(repoPath, fileName);
        if (await this.fileExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          context.files[fileName] = {
            exists: true,
            length: content.length,
            excerpt: this.extractExcerpt(content, fileName),
            fullContent: content.length < 10000 ? content : content.substring(0, 10000) + '...[truncated]'
          };
        }
      }

      // Directory structure analysis
      context.structure = await this.analyzeStructure(repoPath);

      // Git information
      try {
        const { stdout: lastCommit } = await execAsync('git log -1 --format="%H %ai %s"', { cwd: repoPath });
        const { stdout: commitCount } = await execAsync('git rev-list --count HEAD', { cwd: repoPath });
        context.git = {
          lastCommit: lastCommit.trim(),
          commitCount: parseInt(commitCount.trim()),
          recentActivity: await this.getRecentActivity(repoPath)
        };
      } catch (gitError) {
        logger.debug('Could not extract git information', { error: gitError.message });
      }

    } catch (error) {
      logger.warn('Error gathering repository context', { error: error.message });
    }

    return context;
  }

  /**
   * Perform LLM-driven analysis using external-tools-research workflow templates
   */
  async performLLMAnalysis(context) {
    // This simulates LLM analysis - in practice this would call actual LLM
    // with the external-tools-research workflow templates
    
    const analysis = {
      projectOverview: await this.analyzeProjec(context),
      strategicAssessment: await this.assessStrategicValue(context),
      llmFirstAlignment: await this.evaluateLLMAlignment(context),
      integrationOpportunities: await this.identifyIntegrationOpportunities(context),
      quickDecisionLean: await this.generateQuickDecision(context),
      technicalInsights: await this.analyzeTechnicalAspects(context),
      confidence: this.calculateAnalysisConfidence(context)
    };

    return analysis;
  }

  async analyzeProjec(context) {
    // LLM analysis of project basics
    const readme = context.files['README.md'];
    const packageJson = context.files['package.json'];
    
    let projectType = 'Unknown';
    let technology = 'Mixed';
    let purpose = 'To be determined';

    if (packageJson) {
      const pkg = JSON.parse(packageJson.fullContent);
      projectType = 'JavaScript/Node.js Project';
      technology = 'Node.js';
      purpose = pkg.description || 'Node.js application/library';
    } else if (context.files['requirements.txt'] || context.files['setup.py']) {
      projectType = 'Python Project';
      technology = 'Python';
      purpose = 'Python application/library';
    }

    if (readme) {
      // Extract purpose from README first paragraph
      const lines = readme.fullContent.split('\n');
      const firstParagraph = lines.find(line => line.trim() && !line.startsWith('#'));
      if (firstParagraph) {
        purpose = firstParagraph.trim();
      }
    }

    return {
      type: projectType,
      technology,
      purpose,
      size: context.structure.fileCount || 0,
      lastActivity: context.git.lastCommit?.split(' ')[1] || 'Unknown'
    };
  }

  async assessStrategicValue(context) {
    // LLM assessment of strategic value for Kingly ecosystem
    const readme = context.files['README.md']?.fullContent || '';
    const packageJson = context.files['package.json']?.fullContent || '';
    
    // Analyze for AI/LLM keywords
    const aiKeywords = ['ai', 'llm', 'gpt', 'claude', 'agent', 'nlp', 'ml', 'machine learning', 'neural', 'transformer'];
    const content = (readme + packageJson).toLowerCase();
    const aiScore = aiKeywords.filter(keyword => content.includes(keyword)).length;

    // Analyze for automation keywords
    const autoKeywords = ['automation', 'workflow', 'orchestration', 'pipeline', 'deploy', 'ci/cd'];
    const autoScore = autoKeywords.filter(keyword => content.includes(keyword)).length;

    // Analyze for framework patterns
    const frameworkKeywords = ['framework', 'library', 'sdk', 'api', 'service'];
    const frameworkScore = frameworkKeywords.filter(keyword => content.includes(keyword)).length;

    let strategicValue = 'Low';
    let reasoning = 'Limited alignment with Kingly ecosystem priorities';

    if (aiScore >= 3) {
      strategicValue = 'High';
      reasoning = 'Strong AI/LLM alignment with Kingly\'s core mission';
    } else if (autoScore >= 2 || frameworkScore >= 2) {
      strategicValue = 'Medium';
      reasoning = 'Good automation or framework potential for integration';
    }

    return {
      level: strategicValue,
      reasoning,
      aiAlignment: aiScore,
      automationPotential: autoScore,
      frameworkValue: frameworkScore
    };
  }

  async evaluateLLMAlignment(context) {
    // Evaluate alignment with LLM-first architecture principles
    const content = JSON.stringify(context.files).toLowerCase();
    
    const alignment = {
      enhancesLLMReasoning: content.includes('reasoning') || content.includes('llm') || content.includes('ai'),
      avoidsTraditionalAlgorithms: !content.includes('algorithm') || content.includes('neural') || content.includes('transformer'),
      supportsBidirectionalFlow: content.includes('api') || content.includes('service') || content.includes('interface'),
      contextCompatible: content.includes('context') || content.includes('memory') || content.includes('state')
    };

    return alignment;
  }

  async identifyIntegrationOpportunities(context) {
    // Identify specific integration opportunities with Kingly
    const opportunities = [];
    const content = JSON.stringify(context.files).toLowerCase();

    if (content.includes('agent') || content.includes('automation')) {
      opportunities.push('Agent system enhancement and workflow automation');
    }

    if (content.includes('api') || content.includes('service')) {
      opportunities.push('API integration and service orchestration');
    }

    if (content.includes('llm') || content.includes('ai')) {
      opportunities.push('Core LLM capability enhancement');
    }

    if (content.includes('vision') || content.includes('image')) {
      opportunities.push('Multi-modal capability addition');
    }

    if (content.includes('memory') || content.includes('context')) {
      opportunities.push('Context management and memory systems');
    }

    if (opportunities.length === 0) {
      opportunities.push('Pattern extraction for general architecture insights');
    }

    return opportunities;
  }

  async generateQuickDecision(context) {
    // Generate quick decision recommendation
    const strategic = await this.assessStrategicValue(context);
    const alignment = await this.evaluateLLMAlignment(context);
    
    const alignmentCount = Object.values(alignment).filter(Boolean).length;
    
    let recommendation = 'IGNORE';
    let reasoning = 'Limited value for Kingly ecosystem';

    if (strategic.level === 'High' && alignmentCount >= 3) {
      recommendation = 'IMPLEMENT';
      reasoning = 'High strategic value with strong LLM-first alignment';
    } else if (strategic.level === 'High' || alignmentCount >= 2) {
      recommendation = 'RESEARCH';
      reasoning = 'Promising capabilities require deeper technical analysis';
    } else if (strategic.aiAlignment > 0 || alignmentCount >= 1) {
      recommendation = 'EXTRACT';
      reasoning = 'Some valuable patterns or approaches worth extracting';
    } else if (context.files['README.md']?.length > 5000) {
      recommendation = 'REFERENCE';
      reasoning = 'Well-documented project worth keeping as reference';
    }

    return {
      recommendation,
      reasoning,
      confidence: this.calculateAnalysisConfidence(context)
    };
  }

  async analyzeTechnicalAspects(context) {
    // Technical analysis for implementation feasibility
    const aspects = {
      complexity: 'Medium',
      dependencies: [],
      architecture: 'Unknown',
      deployability: 'Unknown',
      testability: 'Unknown'
    };

    if (context.files['package.json']) {
      const pkg = JSON.parse(context.files['package.json'].fullContent);
      aspects.dependencies = Object.keys(pkg.dependencies || {});
      aspects.architecture = 'Node.js/JavaScript';
      aspects.deployability = pkg.scripts?.build ? 'Good' : 'Basic';
      aspects.testability = pkg.scripts?.test ? 'Good' : 'Limited';
    }

    aspects.complexity = context.structure.fileCount > 100 ? 'High' : 
                        context.structure.fileCount > 20 ? 'Medium' : 'Low';

    return aspects;
  }

  calculateAnalysisConfidence(context) {
    // Calculate confidence in analysis based on available information
    let confidence = 0.3; // Base confidence

    if (context.files['README.md']?.length > 1000) confidence += 0.3;
    if (context.files['package.json'] || context.files['setup.py']) confidence += 0.2;
    if (context.git.commitCount > 10) confidence += 0.1;
    if (context.structure.fileCount > 5) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Create decision dashboard for human review
   */
  createDecisionDashboard(repoName, analysis, context) {
    const lines = [];
    
    lines.push('🧠 LLM-FIRST REPOSITORY ANALYSIS DASHBOARD');
    lines.push('='.repeat(60));
    lines.push('');
    
    lines.push(`📦 REPOSITORY: ${repoName}`);
    lines.push(`🔗 URL: ${context.url}`);
    lines.push(`📁 Local: ${context.path}`);
    lines.push(`⏰ Analysis: ${context.timestamp}`);
    lines.push('');
    
    // Project Overview Section
    lines.push('🎯 PROJECT OVERVIEW');
    lines.push('─'.repeat(30));
    lines.push(`   Type: ${analysis.projectOverview.type}`);
    lines.push(`   Technology: ${analysis.projectOverview.technology}`);
    lines.push(`   Purpose: ${analysis.projectOverview.purpose}`);
    lines.push(`   Size: ${analysis.projectOverview.size} files`);
    lines.push(`   Last Activity: ${analysis.projectOverview.lastActivity}`);
    lines.push('');
    
    // Strategic Assessment Section
    lines.push('📊 STRATEGIC ASSESSMENT');
    lines.push('─'.repeat(30));
    lines.push(`   Strategic Value: ${analysis.strategicAssessment.level}`);
    lines.push(`   Reasoning: ${analysis.strategicAssessment.reasoning}`);
    lines.push(`   AI Alignment Score: ${analysis.strategicAssessment.aiAlignment}/10`);
    lines.push('');
    
    // LLM-First Alignment Section
    lines.push('🤖 LLM-FIRST ALIGNMENT');
    lines.push('─'.repeat(30));
    lines.push(`   ${analysis.llmFirstAlignment.enhancesLLMReasoning ? '✅' : '❌'} Enhances LLM reasoning`);
    lines.push(`   ${analysis.llmFirstAlignment.avoidsTraditionalAlgorithms ? '✅' : '❌'} Avoids traditional algorithms`);
    lines.push(`   ${analysis.llmFirstAlignment.supportsBidirectionalFlow ? '✅' : '❌'} Supports bidirectional flow`);
    lines.push(`   ${analysis.llmFirstAlignment.contextCompatible ? '✅' : '❌'} Context-compatible`);
    lines.push('');
    
    // Integration Opportunities Section
    lines.push('🔗 INTEGRATION OPPORTUNITIES');
    lines.push('─'.repeat(30));
    analysis.integrationOpportunities.forEach(opp => {
      lines.push(`   • ${opp}`);
    });
    lines.push('');
    
    // Quick Decision Section
    lines.push('⚡ LLM RECOMMENDATION');
    lines.push('─'.repeat(30));
    lines.push(`   Decision: ${analysis.quickDecisionLean.recommendation}`);
    lines.push(`   Reasoning: ${analysis.quickDecisionLean.reasoning}`);
    lines.push(`   Confidence: ${Math.round(analysis.confidence * 100)}%`);
    lines.push('');
    
    // Decision Options Section
    lines.push('🎯 YOUR DECISION OPTIONS');
    lines.push('─'.repeat(30));
    lines.push(`   📋 CREATE ADR - Document decision and rationale`);
    lines.push(`   🗑️  REMOVE REPO - Not valuable, delete from intake`);
    lines.push(`   📁 FILE LATER - Promising but not immediate priority`);
    lines.push(`   🔍 DEEP DIVE - Start external-tools-research workflow`);
    lines.push('');
    
    // Next Actions Section
    lines.push('🚀 SUGGESTED NEXT ACTIONS');
    lines.push('─'.repeat(30));
    if (analysis.quickDecisionLean.recommendation === 'IMPLEMENT') {
      lines.push(`   1. Create ADR documenting integration decision`);
      lines.push(`   2. Start external-tools-research workflow`);
      lines.push(`   3. Plan integration timeline and resources`);
    } else if (analysis.quickDecisionLean.recommendation === 'RESEARCH') {
      lines.push(`   1. Deep dive with external-tools-research workflow`);
      lines.push(`   2. Technical analysis for integration feasibility`);
      lines.push(`   3. Create ADR after research completion`);
    } else if (analysis.quickDecisionLean.recommendation === 'EXTRACT') {
      lines.push(`   1. Document patterns and approaches of interest`);
      lines.push(`   2. File repository for pattern reference`);
      lines.push(`   3. Consider for future research cycles`);
    } else {
      lines.push(`   1. Document reasons for rejection`);
      lines.push(`   2. Remove from intake directory`);
      lines.push(`   3. Update tracking with decision rationale`);
    }
    lines.push('');
    
    lines.push('💡 Remember: You make the final decision based on LLM analysis!');
    
    return lines.join('\n');
  }

  /**
   * Initiate external-tools-research workflow
   */
  async initiateWorkflow(repoName, analysis, context) {
    const workflowPath = path.resolve('../../../agent/contexts/workflows/external-tools-research/instances');
    await fs.mkdir(workflowPath, { recursive: true });
    
    const instanceFile = path.join(workflowPath, `${repoName}-analysis.md`);
    
    // Create initial assessment based on LLM analysis
    const initialAssessment = this.generateInitialAssessment(repoName, analysis, context);
    
    await fs.writeFile(instanceFile, initialAssessment, 'utf8');
    logger.info('External-tools-research workflow initiated', { instanceFile });
  }

  generateInitialAssessment(repoName, analysis, context) {
    return `# ${repoName} Initial Assessment

## 🎯 **Project Overview**
**Repository**: ${context.url}  
**Type**: ${analysis.projectOverview.type}  
**Technology**: ${analysis.projectOverview.technology}  
**Purpose**: ${analysis.projectOverview.purpose}

## 📊 **Strategic Assessment**

### **Problem Solved**
${analysis.projectOverview.purpose}

### **LLM-First Alignment** 
- ${analysis.llmFirstAlignment.enhancesLLMReasoning ? '✅' : '❌'} Enhances LLM reasoning
- ${analysis.llmFirstAlignment.avoidsTraditionalAlgorithms ? '✅' : '❌'} Avoids traditional algorithms  
- ${analysis.llmFirstAlignment.supportsBidirectionalFlow ? '✅' : '❌'} Supports bidirectional flow
- ${analysis.llmFirstAlignment.contextCompatible ? '✅' : '❌'} Context-compatible

### **Integration Opportunities**
${analysis.integrationOpportunities.map(opp => `- ${opp}`).join('\n')}

### **Strategic Value**
${analysis.strategicAssessment.level} - ${analysis.strategicAssessment.reasoning}

## 🎯 **Quick Decision Lean**
**Recommendation**: ${analysis.quickDecisionLean.recommendation}  
**Reasoning**: ${analysis.quickDecisionLean.reasoning}

**Next**: Technical analysis required for final decision`;
  }

  // Utility methods
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async directoryExists(dirPath) {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  extractExcerpt(content, fileName) {
    if (fileName === 'README.md') {
      const lines = content.split('\n');
      const firstParagraph = lines.find(line => line.trim() && !line.startsWith('#'));
      return firstParagraph?.trim().substring(0, 200) || 'No description available';
    } else if (fileName === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        return pkg.description || 'No description in package.json';
      } catch {
        return 'Invalid package.json format';
      }
    }
    return content.substring(0, 200);
  }

  async analyzeStructure(repoPath) {
    try {
      const { stdout } = await execAsync(`find "${repoPath}" -type f | wc -l`);
      const fileCount = parseInt(stdout.trim());
      
      const { stdout: depthOutput } = await execAsync(`find "${repoPath}" -type d | awk -F/ '{print NF-1}' | sort -n | tail -1`);
      const depth = parseInt(depthOutput.trim()) || 1;
      
      return { fileCount, depth };
    } catch {
      return { fileCount: 0, depth: 1 };
    }
  }

  async getRecentActivity(repoPath) {
    try {
      const { stdout } = await execAsync('git log --oneline -10', { cwd: repoPath });
      return stdout.split('\n').length;
    } catch {
      return 0;
    }
  }
}