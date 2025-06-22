/**
 * Intelligence Power Command
 * Deep analysis and power intelligence operations
 */

export async function intelligencePower(args, dependencies) {
  const { intelligenceCoordinator, ceoBinding } = dependencies || {};
  const { context, files, workspace = 'current', save_draft = true } = args;
  
  // Perform actual power analysis using intelligence coordinator
  const analysis = await intelligenceCoordinator.performPowerAnalysis(
    context,
    files ? files.split(',').map(f => f.trim()) : [],
    workspace
  );
  
  // Save draft if requested
  const draftPath = await intelligenceCoordinator.saveDraft(analysis, save_draft);
  
  // Create procedural memory if significant enough
  const memoryPath = await intelligenceCoordinator.createProceduralMemory(analysis);
  
  const responseText = `⚡ **Power Analysis Complete**\n\n` +
                      `**Context:** ${analysis.context}\n` +
                      `**Workspace:** ${analysis.workspace}\n` +
                      `**Analysis ID:** ${analysis.analysis_id}\n\n` +
                      `**Patterns Identified:**\n${analysis.patterns_identified.map(p => `• ${p.type} (${(p.confidence * 100).toFixed(0)}%): ${p.description}`).join('\n')}\n\n` +
                      `**Key Insights:**\n${analysis.insights.map(i => `• ${i}`).join('\n')}\n\n` +
                      `**Recommendations:**\n${analysis.recommendations.map(r => `• ${r}`).join('\n')}\n\n` +
                      `**Confidence Scores:**\n` +
                      `• Context Clarity: ${(analysis.confidence_scores.context_clarity * 100).toFixed(0)}%\n` +
                      `• Pattern Confidence: ${(analysis.confidence_scores.pattern_confidence * 100).toFixed(0)}%\n` +
                      `• Actionability: ${(analysis.confidence_scores.actionability * 100).toFixed(0)}%\n` +
                      `• Significance: ${(analysis.confidence_scores.significance * 100).toFixed(0)}%\n\n` +
                      `**Cross-Workspace Potential:** ${analysis.cross_workspace_potential ? 'Yes' : 'No'}\n` +
                      `${draftPath ? `**Draft Saved:** ${draftPath}\n` : ''}` +
                      `${memoryPath ? `**Procedural Memory Created:** ${memoryPath}\n` : ''}` +
                      `**Timestamp:** ${analysis.timestamp}\n\n` +
                      `✅ Power analysis completed successfully`;

  return {
    content: [
      {
        type: 'text',
        text: ceoBinding.formatResponse(responseText, true),
      },
    ],
  };
}

// Add function metadata
intelligencePower.description = 'Perform deep power analysis with pattern identification and memory creation';
intelligencePower.inputSchema = {
  type: 'object',
  properties: {
    context: {
      type: 'string',
      description: 'Context or problem description for analysis',
    },
    files: {
      type: 'string',
      description: 'Comma-separated list of files to analyze',
    },
    workspace: {
      type: 'string',
      default: 'current',
      description: 'Workspace scope for analysis',
    },
    save_draft: {
      type: 'boolean',
      default: true,
      description: 'Save analysis draft',
    },
  },
};

// MCP Tool Export
export const intelligencePowerTool = {
  name: 'intelligence_power',
  description: intelligencePower.description,
  inputSchema: intelligencePower.inputSchema,
  handler: intelligencePower
};