/**
 * Knowledge Repository - Infrastructure
 * Infrastructure: File system knowledge loading
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import YAML from 'yaml';

export function createKnowledgeRepository() {
  return {
    async loadKnowledge() {
      const knowledge = {
        paradigms: await loadCategory('paradigms'),
        languages: await loadCategory('languages'), 
        frameworks: await loadCategory('frameworks')
      };
      
      return knowledge;
    }
  };
}

async function loadCategory(category) {
  const entries = [];
  const basePath = join(process.cwd(), category);
  
  try {
    const items = await readdir(basePath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const contextFile = join(basePath, item.name, 'context.yaml');
        try {
          const content = await readFile(contextFile, 'utf-8');
          const entry = YAML.parse(content);
          entries.push(entry);
        } catch (err) {
          // Skip invalid files
          console.log(`Skipping ${contextFile}: ${err.message}`);
        }
      }
    }
  } catch (err) {
    console.log(`Category ${category} not found: ${err.message}`);
  }
  
  return entries;
}