export interface ResearchConfig {
  topic: string;
  depth: 'quick' | 'standard' | 'deep';
  duration: number; // minutes
  sources: string[];
  personalities: PersonalityMode[];
  outputFormat: 'markdown' | 'json' | 'html';
}

export interface ResearchResult {
  id: string;
  topic: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  findings: Finding[];
  synthesis: string;
  metadata: ResearchMetadata;
}

export interface Finding {
  id: string;
  source: string;
  content: string;
  relevance: number;
  tier: 1 | 2 | 3;
  url?: string;
  timestamp: Date;
}

export interface ResearchMetadata {
  executionTime: number;
  toolsUsed: string[];
  apiCalls: number;
  costEstimate: number;
  quality: number;
}export type PersonalityMode = 
  | 'sovereignty_architect'
  | 'abundance_amplifier' 
  | 'visionary_pioneer'
  | 'cortisol_guardian'
  | 'strategic_commander'
  | 'empathetic_connector'
  | 'practical_builder'
  | 'systems_thinker';

export interface ToolConfig {
  name: string;
  type: 'mcp' | 'builtin' | 'api';
  enabled: boolean;
  apiKey?: string;
  rateLimit?: number;
  cost?: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  tools: string[];
  duration: number;
  parallel: boolean;
}

export interface Context {
  id: string;
  type: 'agent' | 'workflow' | 'tool' | 'pattern';
  version: string;
  config: Record<string, any>;
  dependencies: string[];
}