/**
 * Search Engine - Domain Logic
 * Domain: Core search algorithms and ranking
 */

export function createSearchEngine() {
  return {
    async search(query, knowledge, options = {}) {
      const results = [];
      const limit = parseInt(options.limit || '10');
      
      // Search across all knowledge categories
      for (const [category, entries] of Object.entries(knowledge)) {
        for (const entry of entries) {
          const scoreData = calculateRelevanceScore(entry, query);
          
          if (scoreData.score > 0) {
            results.push({
              ...entry,
              category,
              relevance_score: scoreData.score,
              confidence: scoreData.confidence,
              matches: scoreData.matches
            });
          }
        }
      }
      
      // Sort by relevance and limit
      results.sort((a, b) => b.relevance_score - a.relevance_score);
      const limitedResults = results.slice(0, limit);
      
      return {
        query,
        total: limitedResults.length,
        confidence: calculateOverallConfidence(limitedResults),
        results: limitedResults
      };
    }
  };
}

function calculateRelevanceScore(entry, query) {
  const queryLower = query.toLowerCase();
  let score = 0;
  let confidence = 0;
  const matches = [];
  
  // Name matches (highest priority)
  if (entry.metadata?.name?.toLowerCase().includes(queryLower)) {
    score += 100;
    confidence += 0.9;
    matches.push({ field: 'name', type: 'exact', value: entry.metadata.name });
  }
  
  // ID matches (very high priority)
  if (entry.metadata?.id?.toLowerCase().includes(queryLower)) {
    score += 90;
    confidence += 0.9;
    matches.push({ field: 'id', type: 'exact', value: entry.metadata.id });
  }
  
  // Description matches
  if (entry.description?.toLowerCase().includes(queryLower)) {
    score += 60;
    confidence += 0.7;
    matches.push({ field: 'description', type: 'partial', value: 'description content' });
  }
  
  // Type matches  
  if (entry.metadata?.type?.toLowerCase().includes(queryLower)) {
    score += 50;
    confidence += 0.6;
    matches.push({ field: 'type', type: 'categorical', value: entry.metadata.type });
  }
  
  // Scope/ecosystem matches
  if (entry.metadata?.scope?.toLowerCase().includes(queryLower)) {
    score += 40;
    confidence += 0.5;
    matches.push({ field: 'scope', type: 'contextual', value: entry.metadata.scope });
  }
  
  if (entry.metadata?.ecosystem?.toLowerCase().includes(queryLower)) {
    score += 40;
    confidence += 0.5;
    matches.push({ field: 'ecosystem', type: 'contextual', value: entry.metadata.ecosystem });
  }
  
  const normalizedConfidence = matches.length > 0 ? 
    Math.round((confidence / matches.length) * 100) : 0;
  
  return { score, confidence: normalizedConfidence, matches };
}

function calculateOverallConfidence(results) {
  if (results.length === 0) return 0;
  
  const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
  return Math.round(totalConfidence / results.length);
}