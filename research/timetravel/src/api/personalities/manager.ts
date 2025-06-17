import { PersonalityConfig, PersonalityAnalysis, AnalyzedFinding } from '@shared/personality-types';
import { Finding } from '@shared/types';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';
import * as yaml from 'yaml';
import * as path from 'path';

export class PersonalityManager {
  private logger = new Logger('PersonalityManager');
  private personalities: Map<string, PersonalityConfig> = new Map();
  private personalitiesPath = path.join(process.cwd(), 'personalities');
  
  async initialize(): Promise<void> {
    this.logger.info('Loading personality configurations...');
    await this.loadCorePersonalities();
    await this.loadCustomPersonalities();
  }
  
  private async loadCorePersonalities(): Promise<void> {
    const corePath = path.join(this.personalitiesPath, 'core');
    
    try {
      const files = await fs.readdir(corePath);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      for (const file of yamlFiles) {
        const filePath = path.join(corePath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const config = yaml.parse(content) as PersonalityConfig;
        
        this.personalities.set(config.id, config);
        this.logger.info(`Loaded core personality: ${config.name}`);
      }
    } catch (error) {
      this.logger.error('Failed to load core personalities:', error);
    }
  }
  
  private async loadCustomPersonalities(): Promise<void> {
    const customPath = path.join(this.personalitiesPath, 'custom');
    
    try {
      const files = await fs.readdir(customPath);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      for (const file of yamlFiles) {
        const filePath = path.join(customPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const config = yaml.parse(content) as PersonalityConfig;
        
        config.custom = true;
        this.personalities.set(config.id, config);
        this.logger.info(`Loaded custom personality: ${config.name}`);
      }
    } catch (error) {
      this.logger.warn('No custom personalities found or failed to load');
    }
  }  async analyzeWithPersonality(
    personalityId: string, 
    findings: Finding[]
  ): Promise<PersonalityAnalysis> {
    const personality = this.personalities.get(personalityId);
    if (!personality) {
      throw new Error(`Personality not found: ${personalityId}`);
    }
    
    this.logger.info(`Analyzing ${findings.length} findings with ${personality.name}`);
    
    // Filter findings based on personality filters
    const filteredFindings = this.applyPersonalityFilters(findings, personality);
    
    // Score findings for this personality
    const analyzedFindings = this.scoreFindings(filteredFindings, personality);
    
    // Generate synthesis using personality prompts
    const synthesis = await this.generateSynthesis(analyzedFindings, personality);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(analyzedFindings, personality);
    
    return {
      personalityId,
      findings: analyzedFindings,
      synthesis,
      recommendations,
      confidence: this.calculateConfidence(analyzedFindings),
      keyInsights: this.extractKeyInsights(analyzedFindings)
    };
  }
  
  private applyPersonalityFilters(findings: Finding[], personality: PersonalityConfig): Finding[] {
    return findings.filter(finding => {
      let score = 0;
      let totalWeight = 0;
      
      for (const filter of personality.filters) {
        totalWeight += filter.weight;
        
        switch (filter.type) {
          case 'content':
            if (this.matchesContentFilter(finding.content, filter)) {
              score += filter.weight;
            }
            break;
          case 'relevance':
            if (this.matchesRelevanceFilter(finding.relevance, filter)) {
              score += filter.weight;
            }
            break;
          case 'source':
            if (this.matchesSourceFilter(finding.source, filter)) {
              score += filter.weight;
            }
            break;
        }
      }
      
      return totalWeight > 0 ? (score / totalWeight) > 0.5 : true;
    });
  }  private scoreFindings(findings: Finding[], personality: PersonalityConfig): AnalyzedFinding[] {
    return findings.map(finding => {
      const personalityScore = this.calculatePersonalityScore(finding, personality);
      const analysis = this.generateFindingAnalysis(finding, personality);
      const insights = this.extractActionableInsights(finding, personality);
      
      return {
        originalFinding: finding,
        personalityScore,
        relevanceReason: this.generateRelevanceReason(finding, personality),
        analysis,
        actionableInsights: insights
      };
    });
  }
  
  private calculatePersonalityScore(finding: Finding, personality: PersonalityConfig): number {
    let score = finding.relevance * 0.4; // Base relevance
    
    // Apply personality-specific weights
    const weights = personality.weights;
    
    // Content analysis scoring (simplified)
    const contentScore = this.analyzeContentForPersonality(finding.content, personality);
    score += contentScore * 0.6;
    
    return Math.min(1, Math.max(0, score));
  }
  
  private analyzeContentForPersonality(content: string, personality: PersonalityConfig): number {
    const lowerContent = content.toLowerCase();
    let score = 0;
    
    // Check focus areas
    for (const focus of personality.focus) {
      if (lowerContent.includes(focus.replace('_', ' '))) {
        score += 0.2;
      }
    }
    
    return Math.min(1, score);
  }
  
  private async generateSynthesis(
    findings: AnalyzedFinding[], 
    personality: PersonalityConfig
  ): Promise<string> {
    const prompt = personality.prompts.synthesis.replace(
      '{findings}', 
      this.formatFindingsForPrompt(findings)
    );
    
    // In a real implementation, this would call an LLM
    // For now, return a structured template
    return this.generateTemplatedSynthesis(findings, personality);
  }

  private generateTemplatedSynthesis(findings: AnalyzedFinding[], personality: PersonalityConfig): string {
    // Template synthesis based on personality focus
    const keyFindings = findings.slice(0, 5);
    const focusAreas = personality.focus.join(', ');
    
    return `Based on analysis through the ${personality.name} lens, focusing on ${focusAreas}, 
    I've identified ${keyFindings.length} key findings that align with this perspective.`;
  }

  private async generateRecommendations(findings: AnalyzedFinding[], personality: PersonalityConfig): Promise<string[]> {
    // Generate recommendations based on personality prompts
    return [
      `Consider the ${personality.name} perspective when implementing solutions`,
      `Focus on the ${personality.focus[0]} aspect of the findings`,
      `Review the top ${Math.min(3, findings.length)} findings for immediate action`
    ];
  }

  private calculateConfidence(findings: AnalyzedFinding[]): number {
    if (findings.length === 0) return 0;
    
    const avgScore = findings.reduce((sum, f) => sum + f.personalityScore, 0) / findings.length;
    return Math.min(1, avgScore);
  }

  private extractKeyInsights(findings: AnalyzedFinding[]): string[] {
    return findings
      .filter(f => f.personalityScore > 0.7)
      .slice(0, 3)
      .map(f => f.relevanceReason);
  }

  private generateFindingAnalysis(finding: Finding, personality: PersonalityConfig): string {
    return `Analysis from ${personality.name} perspective: ${finding.content.substring(0, 100)}...`;
  }

  private extractActionableInsights(finding: Finding, personality: PersonalityConfig): string[] {
    return [`Actionable insight based on ${personality.name} analysis`];
  }

  private generateRelevanceReason(finding: Finding, personality: PersonalityConfig): string {
    return `Relevant to ${personality.name} due to alignment with ${personality.focus[0]}`;
  }

  private matchesContentFilter(content: string, filter: any): boolean {
    // Simplified content filter matching
    return content.toLowerCase().includes(filter.value?.toLowerCase() || '');
  }

  private matchesRelevanceFilter(relevance: number, filter: any): boolean {
    // Simplified relevance filter matching
    return relevance >= (filter.threshold || 0.5);
  }

  private matchesSourceFilter(source: string, filter: any): boolean {
    // Simplified source filter matching
    return source.includes(filter.value || '');
  }

  private formatFindingsForPrompt(findings: AnalyzedFinding[]): string {
    return findings.map(f => f.originalFinding.content).join('\n\n');
  }

  getPersonality(id: string): PersonalityConfig | undefined {
    return this.personalities.get(id);
  }

  getAllPersonalities(): PersonalityConfig[] {
    return Array.from(this.personalities.values());
  }
}