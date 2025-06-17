#!/usr/bin/env node
/**
 * CLI Formatter - Converts JSON results to human-readable terminal output
 * Separates user output (stdout) from LLM whispers (stderr)
 */

import fs from 'fs';

function formatResult(result) {
  if (result.error) {
    return formatErrorResult(result);
  }

  // Handle hybrid router result structure
  if (result.success && result.result) {
    return formatHybridResult(result);
  }

  // Handle different result types
  if (result.agent === 'ceo') {
    return formatCEOResponse(result);
  }

  if (result.workflow && result.workflow.found) {
    return formatWorkflowResult(result);
  }

  if (result.promoted !== undefined) {
    return formatPromotionResult(result);
  }

  if (result.nlp_mode) {
    return formatNLPResult(result);
  }

  if (result.help_text) {
    return result.help_text;
  }

  if (result.snippet || result.file) {
    return formatShowResult(result);
  }

  // Fallback formatting
  return JSON.stringify(result, null, 2);
}

function formatHybridResult(result) {
  const innerResult = result.result;
  
  // Enhanced checkpoint result - display formatted markdown response
  if (innerResult.formatted_response && innerResult.mode) {
    return innerResult.formatted_response;
  }
  
  // All contexts result
  if (innerResult.all_contexts && innerResult.success) {
    let output = `📚 All Available Contexts (${innerResult.total_count} total)\n\n`;
    
    // Group by type
    const byType = {};
    innerResult.contexts.forEach(ctx => {
      if (!byType[ctx.type]) byType[ctx.type] = [];
      byType[ctx.type].push(ctx);
    });
    
    Object.keys(byType).sort().forEach(type => {
      output += `🏷️ ${type.toUpperCase()}: (${byType[type].length})\n`;
      byType[type].forEach(ctx => {
        output += `   ${ctx.slug} - ${ctx.name}\n`;
        if (ctx.description && ctx.description !== 'No description available') {
          output += `     📋 ${ctx.description.substring(0, 80)}${ctx.description.length > 80 ? '...' : ''}\n`;
        }
      });
      output += '\n';
    });
    
    return output.trim();
  }

  // Enhanced context found
  if (innerResult.context && innerResult.success) {
    const context = innerResult.context;
    let output = `✅ Found: ${context.slug} - ${context.name}\n`;
    
    if (context.similarity) {
      output += `🎯 Match: ${(context.similarity * 100).toFixed(0)}%\n`;
    }
    
    if (context.description) {
      output += `📋 ${context.description}\n`;
    }
    
    if (context.type) {
      output += `🏷️ Type: ${context.type}\n`;
    }
    
    if (innerResult.search_type) {
      output += `🔍 Search: ${innerResult.search_type}\n`;
    }
    
    if (innerResult.next_actions && innerResult.next_actions.length > 0) {
      output += `➡️ Next: ${innerResult.next_actions[0]}\n`;
    }

    return output.trim();
  }
  
  // No context found - show suggestions
  if (innerResult.suggestions && innerResult.suggestions.length > 0) {
    let output = `❌ No exact match found`;
    
    if (innerResult.type_filter) {
      output += ` for type: ${innerResult.type_filter}`;
    }
    
    output += `\n\n🔍 Try these related contexts:\n`;
    
    innerResult.suggestions.slice(0, 3).forEach((suggestion, i) => {
      output += `${i + 1}. ${suggestion.slug} - ${suggestion.name}`;
      if (suggestion.similarity) {
        output += ` (${(suggestion.similarity * 100).toFixed(0)}%)`;
      }
      output += '\n';
    });
    
    output += `\n💡 Try: kingly find "<more specific terms>"`;
    if (innerResult.type_filter) {
      output += ` or remove --type filter`;
    }
    
    return output;
  }
  
  // CEO response
  if (innerResult.agent === 'ceo') {
    return formatCEOResponse(innerResult);
  }
  
  // Fallback
  return JSON.stringify(result, null, 2);
}

function formatCEOResponse(result) {
  let output = `🎯 CEO INTELLIGENCE: ${result.workspace || 'Unknown'}\n`;
  
  if (result.session) {
    output += `📋 Session: ${result.session}\n`;
  }
  
  if (result.instructions) {
    output += `💡 ${result.instructions}\n`;
  }
  
  if (result.next_action) {
    output += `⚡ Next: ${result.next_action}\n`;
  }
  
  if (result.ceo_advice) {
    output += `🧠 Advice: ${result.ceo_advice}\n`;
  }

  return output;
}

function formatWorkflowResult(result) {
  const context = result.context || result.workflow;
  let output = `✅ Found: ${context.slug} - ${context.name}\n`;  // Show slug
  
  if (context.similarity) {
    output += `🎯 Match: ${(context.similarity * 100).toFixed(0)}%\n`;
  }
  
  if (context.description) {
    output += `📋 ${context.description}\n`;
  }
  
  if (context.type) {
    output += `🏷️ Type: ${context.type}\n`;
  }
  
  if (context.capabilities && context.capabilities.length > 0) {
    output += `⚡ Capabilities: ${context.capabilities.slice(0, 3).join(', ')}\n`;
  }
  
  if (result.next_actions && result.next_actions.length > 0) {
    output += `➡️ Next: ${result.next_actions[0]}\n`;
  }

  return output;
}

function formatPromotionResult(result) {
  if (result.promoted) {
    return `✅ Promoted: ${result.context_name || 'Context'} → Global\n📁 Path: ${result.global_path || 'Global contexts'}\n⭐ Quality: ${result.effectiveness || 'Validated'}`;
  } else {
    let output = `❌ Promotion Failed\n`;
    if (result.improvements_needed) {
      output += `🔧 Needed: ${result.improvements_needed.join(', ')}\n`;
    }
    return output;
  }
}

function formatNLPResult(result) {
  let output = `🤖 Natural Language: "${result.interpreted_as}"\n\n`;
  
  // Handle workflow discovery results
  if (result.workflow_result && result.workflow_result.found) {
    output += `🔍 **Context Match:**\n`;
    output += `✅ Found: ${result.workflow_result.slug} - ${result.workflow_result.name}\n`;
    if (result.workflow_result.similarity) {
      output += `🎯 Match: ${(result.workflow_result.similarity * 100).toFixed(0)}%\n`;
    }
    if (result.workflow_result.type) {
      output += `🏷️ Type: ${result.workflow_result.type}\n`;
    }
    output += `📋 ${result.workflow_result.description}\n\n`;
  }
  
  // Handle CEO orchestration results
  if (result.ceo_result && result.ceo_result.agent === 'ceo') {
    output += `🎯 **CEO Analysis:**\n`;
    if (result.ceo_result.intent_analysis) {
      output += `🧠 Intent: ${result.ceo_result.intent_analysis.type} (${result.ceo_result.intent_analysis.complexity})\n`;
    }
    if (result.ceo_result.workflow_matches && result.ceo_result.workflow_matches.length > 0) {
      output += `🔗 Suggested Workflows:\n`;
      result.ceo_result.workflow_matches.slice(0, 3).forEach((match, i) => {
        output += `  ${i + 1}. ${match.slug || match.code} - ${match.name}\n`;
      });
    }
    if (result.ceo_result.ceo_advice) {
      output += `💡 Advice: ${result.ceo_result.ceo_advice}\n`;
    }
    output += '\n';
  }
  
  // If no specific results, provide encouragement and suggestions
  if (!result.workflow_result?.found && !result.ceo_result?.workflow_matches?.length) {
    output += `💭 **Analysis Complete:**\n`;
    output += `Your query is complex and multi-faceted. Try breaking it into specific actions:\n\n`;
    output += `🎯 **Suggested Next Steps:**\n`;
    output += `• kingly find "project consolidation"\n`;
    output += `• kingly find "vision assessment"\n`;
    output += `• kingly find "strategic planning" --type=workflow\n`;
    output += `• kingly ping --context "project analysis"\n\n`;
    output += `💡 **Tip:** Use shorter, focused queries for better workflow matches`;
  }

  return output.trim();
}

function formatShowResult(result) {
  if (!result.success) {
    let output = `❌ Show Error: ${result.error}\n\n`;
    
    if (result.suggestions && result.suggestions.length > 0) {
      output += `💡 **Try these alternatives:**\n`;
      result.suggestions.forEach((suggestion, i) => {
        output += `${i + 1}. ${suggestion}\n`;
      });
    }
    
    return output.trim();
  }

  let output = `📁 **File:** ${result.file}\n`;
  
  if (result.function) {
    output += `🔧 **Function:** ${result.function}\n`;
  }
  
  output += `📏 **Lines:** ${result.lines} (${result.total_lines} total)\n`;
  output += `📋 **Context:** ${result.context}\n\n`;
  
  output += `\`\`\`javascript\n`;
  result.snippet.forEach((line, index) => {
    const lineNum = result.lines.includes('-') ? 
      parseInt(result.lines.split('-')[0]) + index : 
      index + 1;
    output += `${lineNum.toString().padStart(3)}: ${line}\n`;
  });
  output += `\`\`\``;
  
  return output;
}

function formatErrorResult(result) {
  let output = `❌ Error: ${result.error}\n\n`;
  
  // Show command syntax if available
  if (result.syntax) {
    output += `📋 Correct syntax: ${result.syntax}\n\n`;
  }
  
  // Show recovery suggestions
  if (result.recovery_suggestions && result.recovery_suggestions.length > 0) {
    output += `💡 **Try these alternatives:**\n`;
    result.recovery_suggestions.forEach((suggestion, i) => {
      output += `${i + 1}. ${suggestion}\n`;
    });
    output += '\n';
  }
  
  // Show examples if available
  if (result.examples && result.examples.length > 0) {
    output += `📝 **Examples:**\n`;
    result.examples.slice(0, 2).forEach(example => {
      output += `• ${example}\n`;
    });
  }
  
  return output.trim();
}

function main() {
  let input = '';
  
  // Read from stdin
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      input += chunk;
    }
  });
  
  process.stdin.on('end', () => {
    try {
      const result = JSON.parse(input);
      const formatted = formatResult(result);
      console.log(formatted);
    } catch (error) {
      console.log(`❌ Format Error: ${error.message}`);
      console.log(input); // Fallback to raw input
    }
  });
}

main();