import { MarketplacePersonality, PersonalityBundle, PersonalityStrategy, PersonalityCategory } from '@shared/marketplace-types';
import { PersonalityConfig } from '@shared/personality-types';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'yaml';

export class MarketplaceManager {
  private logger = new Logger('MarketplaceManager');
  private marketplacePath = path.join(process.cwd(), 'marketplace');
  private personalities: Map<string, MarketplacePersonality> = new Map();
  private bundles: Map<string, PersonalityBundle> = new Map();
  private strategies: Map<string, PersonalityStrategy> = new Map();
  
  async initialize(): Promise<void> {
    this.logger.info('Initializing marketplace...');
    await this.loadFeaturedPersonalities();
    await this.loadCommunityPersonalities();
    await this.loadStrategies();
    await this.loadBundles();
  }
  
  private async loadFeaturedPersonalities(): Promise<void> {
    const featuredPath = path.join(this.marketplacePath, 'featured');
    
    try {
      const files = await fs.readdir(featuredPath);
      
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const filePath = path.join(featuredPath, file);
          const content = await fs.readFile(filePath, 'utf8');
          const personality = yaml.parse(content) as MarketplacePersonality;
          
          personality.featured = true;
          personality.verified = true;
          this.personalities.set(personality.marketplaceId, personality);
          this.logger.info(`Loaded featured personality: ${personality.name}`);
        }
      }
    } catch (error) {
      this.logger.warn('No featured personalities found');
    }
  }
  
  async searchPersonalities(query: {
    text?: string;
    category?: PersonalityCategory;
    tags?: string[];
    featured?: boolean;
    verified?: boolean;
    pricing?: 'free' | 'premium' | 'enterprise';
    sortBy?: 'rating' | 'downloads' | 'recent' | 'name';
    limit?: number;
  }): Promise<MarketplacePersonality[]> {
    let results = Array.from(this.personalities.values());
    
    // Apply filters
    if (query.text) {
      const searchTerm = query.text.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (query.category) {
      results = results.filter(p => p.category === query.category);
    }
    
    if (query.tags) {
      results = results.filter(p => 
        query.tags!.some(tag => p.tags.includes(tag))
      );
    }
    
    if (query.featured !== undefined) {
      results = results.filter(p => p.featured === query.featured);
    }
    
    if (query.verified !== undefined) {
      results = results.filter(p => p.verified === query.verified);
    }
    
    if (query.pricing) {
      results = results.filter(p => p.pricing === query.pricing);
    }
    
    // Sort results
    const sortBy = query.sortBy || 'rating';
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    
    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }
    
    return results;
  }
}