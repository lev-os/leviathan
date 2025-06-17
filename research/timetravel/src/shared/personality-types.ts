export interface PersonalityConfig {
  id: string;
  name: string;
  description: string;
  focus: string[];
  filters: PersonalityFilter[];
  prompts: PersonalityPrompts;
  weights: PersonalityWeights;
  examples: string[];
  enabled: boolean;
  custom: boolean;
}

export interface PersonalityFilter {
  type: 'relevance' | 'source' | 'content' | 'temporal' | 'quality';
  condition: 'contains' | 'excludes' | 'greater_than' | 'less_than' | 'equals';
  value: string | number;
  weight: number;
}

export interface PersonalityPrompts {
  analysis: string;
  synthesis: string;
  critique: string;
  recommendation: string;
}

export interface PersonalityWeights {
  technical_depth: number;
  practical_application: number;
  novelty: number;
  risk_assessment: number;
  opportunity_identification: number;
  implementation_feasibility: number;
  competitive_advantage: number;
  user_impact: number;
}

export interface PersonalityAnalysis {
  personalityId: string;
  findings: AnalyzedFinding[];
  synthesis: string;
  recommendations: string[];
  confidence: number;
  keyInsights: string[];
}

export interface AnalyzedFinding {
  originalFinding: any;
  personalityScore: number;
  relevanceReason: string;
  analysis: string;
  actionableInsights: string[];
}