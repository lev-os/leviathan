import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import YAML from 'yaml';

interface SearchOptions {
  type?: string;
  complexity?: string;
  limit: string;
}

interface CodexEntry {
  metadata: {
    type: string;
    id: string;
    name: string;
    complexity_level?: string;
    scope?: string;
  };
  description?: string;
  paradigm_definition?: any;
  framework_definition?: any;
  language_definition?: any;
}

export async function searchCommand(query: string, options: SearchOptions) {
  console.log(`🔍 Searching Project Codex for: "${query}"`);
  
  const limit = parseInt(options.limit);
  const results: Array<{ entry: CodexEntry; file: string; score: number }> = [];
  
  try {
    // Search paradigms
    if (!options.type || options.type === 'paradigm') {
      const paradigmResults = await searchDirectory('paradigms', query, options);
      results.push(...paradigmResults);
    }
    
    // Search languages
    if (!options.type || options.type === 'language') {
      const languageResults = await searchDirectory('languages', query, options);
      results.push(...languageResults);
    }
    
    // Search frameworks
    if (!options.type || options.type === 'framework') {
      const frameworkResults = await searchDirectory('frameworks', query, options);
      results.push(...frameworkResults);
    }
    
    // Sort by relevance score and limit results
    results.sort((a, b) => b.score - a.score);
    const limitedResults = results.slice(0, limit);
    
    if (limitedResults.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    console.log(`\n📊 Found ${limitedResults.length} results:\n`);
    
    limitedResults.forEach((result, index) => {
      const { entry, file, score } = result;
      console.log(`${index + 1}. ${entry.metadata.name} (${entry.metadata.type})`);
      console.log(`   📄 ${file}`);
      console.log(`   🎯 Score: ${score.toFixed(2)}`);
      if (entry.metadata.complexity_level) {
        console.log(`   ⚡ Complexity: ${entry.metadata.complexity_level}`);
      }
      if (entry.description) {
        const truncatedDesc = entry.description.length > 100 
          ? entry.description.substring(0, 100) + '...'
          : entry.description;
        console.log(`   📝 ${truncatedDesc}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    process.exit(1);
  }
}

async function searchDirectory(dir: string, query: string, options: SearchOptions): Promise<Array<{ entry: CodexEntry; file: string; score: number }>> {
  const results: Array<{ entry: CodexEntry; file: string; score: number }> = [];
  const basePath = join(process.cwd(), 'packages', 'codex', dir);
  
  try {
    const items = await readdir(basePath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const contextFile = join(basePath, item.name, 'context.yaml');
        try {
          const content = await readFile(contextFile, 'utf-8');
          const entry = YAML.parse(content) as CodexEntry;
          
          // Apply complexity filter
          if (options.complexity && entry.metadata.complexity_level !== options.complexity) {
            continue;
          }
          
          // Calculate relevance score
          const score = calculateRelevanceScore(entry, query);
          
          if (score > 0) {
            results.push({
              entry,
              file: `${dir}/${item.name}/context.yaml`,
              score
            });
          }
        } catch (err) {
          // Skip files that can't be read or parsed
          continue;
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist or can't be read
  }
  
  return results;
}

function calculateRelevanceScore(entry: CodexEntry, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Exact matches in name get highest score
  if (entry.metadata.name.toLowerCase().includes(queryLower)) {
    score += 100;
  }
  
  // Matches in ID
  if (entry.metadata.id.toLowerCase().includes(queryLower)) {
    score += 80;
  }
  
  // Matches in description
  if (entry.description && entry.description.toLowerCase().includes(queryLower)) {
    score += 60;
  }
  
  // Matches in definition content
  const definition = entry.paradigm_definition || entry.framework_definition || entry.language_definition;
  if (definition) {
    const definitionStr = JSON.stringify(definition).toLowerCase();
    if (definitionStr.includes(queryLower)) {
      score += 40;
    }
  }
  
  // Matches in scope or type
  if (entry.metadata.scope && entry.metadata.scope.toLowerCase().includes(queryLower)) {
    score += 20;
  }
  
  if (entry.metadata.type.toLowerCase().includes(queryLower)) {
    score += 20;
  }
  
  return score;
}