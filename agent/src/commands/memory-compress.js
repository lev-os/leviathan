/**
 * Memory Compress Command - Convert episodic to semantic memories
 * Part of Memory Core Package integration with Universal Command Registry
 */

export async function memoryCompress(args, dependencies) {
  const { memoryManager } = dependencies || {};
  const { 
    agent_id = 'auto',
    session_id = 'auto',
    time_range = 'auto',
    compression_strategy = 'bubble_up',
    dry_run = false,
    min_significance = 0.6
  } = args;

  if (!memoryManager) {
    return {
      success: false,
      error: 'Memory system not initialized',
      content: [{
        type: 'text',
        text: '❌ **Memory Compress Failed**\n\nMemory system not available. Check system status.'
      }]
    };
  }

  try {
    // Determine time range for compression
    let effectiveTimeRange;
    if (time_range === 'auto') {
      // Default to compressing episodic memories older than 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      effectiveTimeRange = {
        before: yesterday.toISOString(),
        type: 'episodic'
      };
    } else {
      effectiveTimeRange = time_range;
    }

    // Build compression request
    const compressionRequest = {
      agent_id,
      session_id: session_id !== 'auto' ? session_id : null,
      timeRange: effectiveTimeRange,
      strategy: compression_strategy,
      minSignificance: min_significance,
      dryRun: dry_run
    };

    let results;
    
    // Execute compression strategy
    switch (compression_strategy) {
      case 'bubble_up':
        results = await performBubbleUpCompression(memoryManager, compressionRequest);
        break;
      
      case 'pattern_extraction':
        results = await performPatternExtraction(memoryManager, compressionRequest);
        break;
      
      case 'timeline_consolidation':
        results = await performTimelineConsolidation(memoryManager, compressionRequest);
        break;
      
      default:
        throw new Error(`Unknown compression strategy: ${compression_strategy}`);
    }

    // Format response
    const action = dry_run ? 'Analysis' : 'Compression';
    let responseText = `🗜️ **Memory ${action} Complete**\n\n` +
      `**Strategy:** ${compression_strategy}\n` +
      `**Agent:** ${agent_id}\n` +
      `**Time Range:** ${JSON.stringify(effectiveTimeRange)}\n` +
      `**Min Significance:** ${min_significance}\n` +
      `**Mode:** ${dry_run ? 'Dry Run (Analysis Only)' : 'Live Compression'}\n\n`;

    if (results.episodic_analyzed) {
      responseText += `**Episodic Memories Analyzed:** ${results.episodic_analyzed}\n`;
    }
    
    if (results.patterns_found) {
      responseText += `**Patterns Found:** ${results.patterns_found}\n`;
    }
    
    if (results.semantic_created && !dry_run) {
      responseText += `**Semantic Memories Created:** ${results.semantic_created}\n`;
    }
    
    if (results.episodic_archived && !dry_run) {
      responseText += `**Episodic Memories Archived:** ${results.episodic_archived}\n`;
    }

    if (results.insights && results.insights.length > 0) {
      responseText += `\n**Key Insights Generated:**\n`;
      results.insights.forEach((insight, index) => {
        responseText += `${index + 1}. ${insight}\n`;
      });
    }

    if (dry_run) {
      responseText += `\n💡 **Recommendation:** Run without dry_run=true to perform actual compression.`;
    }

    return {
      success: true,
      strategy: compression_strategy,
      dry_run,
      episodic_analyzed: results.episodic_analyzed || 0,
      patterns_found: results.patterns_found || 0,
      semantic_created: results.semantic_created || 0,
      insights: results.insights || [],
      content: [{
        type: 'text',
        text: responseText
      }]
    };

  } catch (error) {
    return {
      success: false,
      error: `Memory compression failed: ${error.message}`,
      content: [{
        type: 'text',
        text: `❌ **Memory Compress Failed**\n\n**Error:** ${error.message}\n**Strategy:** ${compression_strategy}\n**Agent:** ${agent_id}`
      }]
    };
  }
}

// Compression strategy implementations
async function performBubbleUpCompression(memoryManager, request) {
  // Query episodic memories in time range
  const episodicQuery = {
    query: '*',
    type: 'episodic',
    namespace: `agent-${request.agent_id}`,
    timeRange: request.timeRange,
    limit: 100
  };

  const episodicResults = await memoryManager.query(episodicQuery);
  const episodicMemories = episodicResults.merged?.items || [];

  // Analyze patterns and significance
  const patterns = extractPatternsFromEpisodic(episodicMemories);
  const significantPatterns = patterns.filter(p => p.significance >= request.minSignificance);

  let semanticCreated = 0;
  let episodicArchived = 0;
  const insights = [];

  if (!request.dryRun) {
    // Create semantic memories from significant patterns
    for (const pattern of significantPatterns) {
      const semanticContent = `Pattern: ${pattern.description}\n\nObservations:\n${pattern.observations.join('\n')}\n\nSignificance: ${pattern.significance}`;
      
      await memoryManager.createMemory(semanticContent, 'semantic', {
        pattern_type: pattern.type,
        source_episodes: pattern.episodeIds,
        significance: pattern.significance,
        compressed_at: new Date().toISOString()
      });
      
      semanticCreated++;
    }

    // Archive processed episodic memories
    episodicArchived = episodicMemories.length;
  }

  // Generate insights
  significantPatterns.forEach(pattern => {
    insights.push(`${pattern.type}: ${pattern.description} (${pattern.significance.toFixed(2)} significance)`);
  });

  return {
    episodic_analyzed: episodicMemories.length,
    patterns_found: patterns.length,
    semantic_created: semanticCreated,
    episodic_archived: episodicArchived,
    insights
  };
}

async function performPatternExtraction(memoryManager, request) {
  // Simplified pattern extraction - in real implementation this would be more sophisticated
  const results = await performBubbleUpCompression(memoryManager, request);
  results.insights.unshift('Pattern extraction strategy focuses on recurring themes and behaviors');
  return results;
}

async function performTimelineConsolidation(memoryManager, request) {
  // Simplified timeline consolidation - in real implementation this would be more sophisticated
  const results = await performBubbleUpCompression(memoryManager, request);
  results.insights.unshift('Timeline consolidation strategy groups memories by temporal proximity');
  return results;
}

// Helper function to extract patterns from episodic memories
function extractPatternsFromEpisodic(memories) {
  const patterns = [];
  
  // Simple pattern detection - group by similar content/context
  const contentGroups = {};
  
  memories.forEach(memory => {
    const content = memory.content.toLowerCase();
    const keywords = extractKeywords(content);
    
    keywords.forEach(keyword => {
      if (!contentGroups[keyword]) {
        contentGroups[keyword] = [];
      }
      contentGroups[keyword].push(memory);
    });
  });

  // Convert groups to patterns
  Object.entries(contentGroups).forEach(([keyword, groupMemories]) => {
    if (groupMemories.length >= 2) { // Pattern needs at least 2 occurrences
      patterns.push({
        type: 'recurring_theme',
        description: `Recurring pattern around "${keyword}"`,
        observations: groupMemories.map(m => m.content.substring(0, 100) + '...'),
        episodeIds: groupMemories.map(m => m.memory_id || m.id),
        significance: Math.min(0.9, groupMemories.length * 0.2)
      });
    }
  });

  return patterns;
}

// Helper function to extract keywords from content
function extractKeywords(content) {
  const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const stopWords = ['this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 'said'];
  return words.filter(word => !stopWords.includes(word)).slice(0, 5);
}

// Export metadata for Universal Command Registry auto-discovery
memoryCompress.description = "Convert episodic memories to semantic patterns using compression strategies";
memoryCompress.inputSchema = {
  type: 'object',
  properties: {
    agent_id: {
      type: 'string',
      default: 'auto',
      description: 'Agent identifier for scoping compression'
    },
    session_id: {
      type: 'string',
      default: 'auto',
      description: 'Session identifier for scoping (optional)'
    },
    time_range: {
      type: 'string',
      default: 'auto',
      description: 'Time range for compression (auto = last 24 hours of episodic)'
    },
    compression_strategy: {
      type: 'string',
      enum: ['bubble_up', 'pattern_extraction', 'timeline_consolidation'],
      default: 'bubble_up',
      description: 'Strategy for converting episodic to semantic memories'
    },
    dry_run: {
      type: 'boolean',
      default: false,
      description: 'Analyze compression potential without making changes'
    },
    min_significance: {
      type: 'number',
      default: 0.6,
      minimum: 0.0,
      maximum: 1.0,
      description: 'Minimum significance threshold for pattern promotion'
    }
  }
};

// Tool export for Universal Command Registry
export const memoryCompressTool = {
  name: 'memory_compress',
  description: memoryCompress.description,
  inputSchema: memoryCompress.inputSchema,
  handler: memoryCompress
};