/**
 * Whisper System - Hidden LLM Guidance for Enhanced Responses
 * Provides context-aware guidance to AI systems without cluttering user output
 */

import fs from 'fs/promises';
import path from 'path';

export class WhisperSystem {
  constructor() {
    this.whisperPath = '/tmp/kingly-whisper.json';
  }
  
  async generateWhisper(command, result, commandConfig) {
    const whisper = {
      timestamp: new Date().toISOString(),
      command_executed: command,
      llm_guidance: commandConfig.whisper?.llm_guidance,
      context_hint: commandConfig.whisper?.context_hint,
      response_format: commandConfig.whisper?.response_format,
      result_interpretation: this.interpretResult(result),
      suggested_followups: await this.suggestFollowups(command, result),
      session_context: await this.getSessionContext(),
      confidence_signals: this.generateConfidenceSignals(result),
      response_enhancement: this.generateResponseEnhancement(command, result)
    };
    
    // Write to temp file for LLM access via stderr redirection
    await this.writeWhisperFile(whisper);
    
    return whisper;
  }
  
  interpretResult(result) {
    if (result.success === false) {
      return "Command failed - guide user through alternatives or error resolution";
    }
    
    if (result.nlp_mode) {
      return "Natural language query - provide conversational response with actionable insights";
    }
    
    if (result.workflow && result.workflow.found) {
      return "Workflow found successfully - acknowledge match quality and suggest execution steps";
    }
    
    if (result.promoted) {
      return "Context promoted - celebrate success and explain global availability";
    }
    
    if (result.job_breakdown) {
      return "Job orchestrated - explain breakdown logic and next coordination steps";
    }
    
    return "Command successful - acknowledge result and suggest logical next steps";
  }
  
  async suggestFollowups(command, result) {
    const followups = [];
    
    switch (command) {
      case 'find':
        if (result.workflow?.found) {
          followups.push(`Execute the workflow: ${result.workflow.code}`);
          followups.push('Find related workflows: ks combos <intent>');
          followups.push('Get implementation details');
        } else {
          followups.push('Try broader search terms');
          followups.push('Browse categories: ks categories');
          followups.push('Use natural language: "help me with <goal>"');
        }
        break;
        
      case 'promote':
        if (result.promoted) {
          followups.push('Verify global availability: ks status --global');
          followups.push('Share promotion with team');
          followups.push('Document promotion success');
        } else {
          followups.push('Address validation gaps');
          followups.push('Improve effectiveness metrics');
          followups.push('Try validation: ks validate <context>');
        }
        break;
        
      case 'ping':
        followups.push('Continue with current task');
        followups.push('Review session recommendations');
        followups.push('Create rollup if needed: ks rollup');
        break;
        
      case 'job':
        followups.push('Review job breakdown structure');
        followups.push('Start parallel execution');
        followups.push('Monitor callback chain progress');
        break;
        
      default:
        followups.push('Check related commands: ks help');
        followups.push('Use natural language for complex queries');
    }
    
    return followups;
  }
  
  async getSessionContext() {
    return {
      working_directory: process.cwd(),
      timestamp: new Date().toISOString(),
      session_type: 'command-line',
      kingly_project: await this.detectKinglyProject()
    };
  }
  
  generateConfidenceSignals(result) {
    const signals = {
      result_quality: 'medium',
      user_satisfaction_predictors: [],
      potential_confusion_points: []
    };
    
    if (result.workflow?.similarity > 0.8) {
      signals.result_quality = 'high';
      signals.user_satisfaction_predictors.push('high_similarity_match');
    } else if (result.workflow?.similarity < 0.6) {
      signals.result_quality = 'low';
      signals.potential_confusion_points.push('low_similarity_match');
    }
    
    if (result.success === false) {
      signals.result_quality = 'low';
      signals.potential_confusion_points.push('command_execution_failed');
    }
    
    if (result.nlp_mode) {
      signals.user_satisfaction_predictors.push('natural_language_understanding');
    }
    
    return signals;
  }
  
  generateResponseEnhancement(command, result) {
    const enhancement = {
      tone_guidance: 'helpful_and_technical',
      emphasis_points: [],
      structure_recommendation: 'action_oriented'
    };
    
    switch (command) {
      case 'find':
        enhancement.emphasis_points = ['workflow_relevance', 'next_steps', 'confidence_level'];
        enhancement.structure_recommendation = 'result_first_then_context';
        break;
        
      case 'promote':
        enhancement.tone_guidance = result.promoted ? 'celebratory_and_informative' : 'supportive_and_constructive';
        enhancement.emphasis_points = result.promoted ? ['success_confirmation', 'global_impact'] : ['improvement_path', 'validation_help'];
        break;
        
      case 'job':
        enhancement.tone_guidance = 'analytical_and_coordinating';
        enhancement.emphasis_points = ['breakdown_logic', 'coordination_strategy', 'timeline_realism'];
        enhancement.structure_recommendation = 'analysis_then_action_plan';
        break;
        
      default:
        enhancement.emphasis_points = ['result_summary', 'actionable_next_steps'];
    }
    
    return enhancement;
  }
  
  async writeWhisperFile(whisper) {
    try {
      await fs.writeFile(this.whisperPath, JSON.stringify(whisper, null, 2));
    } catch (error) {
      // Fail silently - whispers are enhancement, not critical
      console.error('Warning: Could not write whisper file:', error.message);
    }
  }
  
  async detectKinglyProject() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf8');
      const packageData = JSON.parse(packageContent);
      
      return {
        is_kingly_project: packageData.name?.includes('kingly') || false,
        has_kingly_config: await this.hasKinglyConfig(),
        project_type: packageData.name || 'unknown'
      };
    } catch {
      return {
        is_kingly_project: false,
        has_kingly_config: false,
        project_type: 'unknown'
      };
    }
  }
  
  async hasKinglyConfig() {
    try {
      await fs.access(path.join(process.cwd(), '.kingly'));
      return true;
    } catch {
      return false;
    }
  }
  
  // Static method for quick whisper generation
  static async quickWhisper(message, context = {}) {
    const whisper = {
      timestamp: new Date().toISOString(),
      quick_message: message,
      context,
      llm_guidance: "Quick whisper - provide contextual response based on message and context"
    };
    
    try {
      await fs.writeFile('/tmp/kingly-whisper.json', JSON.stringify(whisper, null, 2));
    } catch {
      // Fail silently
    }
    
    return whisper;
  }
}