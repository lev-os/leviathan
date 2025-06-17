import { PersonalityConfig } from './personality-types';

export interface MarketplacePersonality extends PersonalityConfig {
  marketplaceId: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  reviews: Review[];
  tags: string[];
  category: PersonalityCategory;
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  license: 'MIT' | 'Apache' | 'GPL' | 'Commercial' | 'Custom';
  pricing: 'free' | 'premium' | 'enterprise';
  price?: number;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

export type PersonalityCategory = 
  | 'business_intelligence'
  | 'technical_analysis'
  | 'risk_management'
  | 'innovation'
  | 'market_research'
  | 'academic'
  | 'finance'
  | 'healthcare'
  | 'legal'
  | 'general';

export interface PersonalityBundle {
  id: string;
  name: string;
  description: string;
  personalities: string[];
  strategy: PersonalityStrategy;
  author: string;
  downloads: number;
  rating: number;
  price?: number;
}

export interface PersonalityStrategy {
  id: string;
  name: string;
  description: string;
  selectionRules: SelectionRule[];
  combinations: PersonalityCombination[];
  adaptiveWeights: boolean;
  contextAware: boolean;
}

export interface SelectionRule {
  condition: string;
  personalities: string[];
  weight: number;
  priority: number;
}

export interface PersonalityCombination {
  personalities: string[];
  synergy: number;
  conflicts: string[];
  recommendedFor: string[];
}