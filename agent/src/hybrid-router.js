/**
 * Hybrid Command Router - Dual Mode CLI System
 * Supports explicit commands AND natural language with LLM whisper guidance
 */

import { COMMAND_REGISTRY, NLP_INDICATORS, generateHelpText } from './command-registry.js';
import { ClaudeCodeAdapter } from './claude-code-adapter.js';
import { SessionManager } from './session-manager.js';
import { PromotionEngine } from './promotion-engine.js';
import { WhisperSystem } from './whisper-system.js';
import fs from 'fs/promises';
import path from 'path';

export class HybridRouter {
  constructor() {
    this.commands = COMMAND_REGISTRY;
    this.adapter = new ClaudeCodeAdapter();
    this.sessionManager = new SessionManager();
    this.promotionEngine = new PromotionEngine();
    this.whisperSystem = new WhisperSystem();
  }
  
  async initialize() {
    await this.adapter.initialize();
  }
  
  async route(args) {
    const input = args.join(' ');
    const command = args[0];
    
    // Special case for help
    if (command === 'help') {
      return this.handleHelp(args.slice(1));
    }
    
    // Check for explicit command
    if (this.commands[command]) {
      return await this.executeCommand(command, args.slice(1));
    }
    
    // Check for NLP patterns or fallback
    if (this.isNaturalLanguage(input)) {
      return await this.handleNLP(input);
    }
    
    // Unknown command - suggest alternatives
    return this.suggestCommand(command);
  }
  
  async executeCommand(command, args) {
    const cmd = this.commands[command];
    
    try {
      // Execute command with whisper guidance - handle hyphenated commands
      const methodName = `handle_${command.replace(/-/g, '_')}`;
      const result = await this[methodName](args);
      
      // Generate whisper for LLM context
      const whisper = await this.whisperSystem.generateWhisper(command, result, cmd);
      
      return {
        success: true,
        result,
        whisper,
        command_info: {
          syntax: cmd.syntax,
          description: cmd.description
        }
      };
    } catch (error) {
      return this.handleCommandError(command, error, cmd);
    }
  }
  
  // Core command handlers
  async handle_find(args) {
    // Auto-register workspace before context search
    const workspace = this.sessionManager.detectWorkspace();
    await this.sessionManager.autoRegisterIfNeeded(workspace);
    
    let typeFilter = null;
    let cleanedArgs = [...args];
    
    // Handle --type=value format
    const typeEqualIndex = args.findIndex(arg => arg.startsWith('--type='));
    if (typeEqualIndex !== -1) {
      typeFilter = args[typeEqualIndex].split('=')[1];
      cleanedArgs.splice(typeEqualIndex, 1);
    } else {
      // Handle --type value format
      const typeIndex = args.indexOf('--type');
      if (typeIndex !== -1 && typeIndex + 1 < args.length) {
        typeFilter = args[typeIndex + 1];
        cleanedArgs.splice(typeIndex, 2); // Remove both --type and value
      }
    }
    
    // Handle --all flag to list all contexts
    const allIndex = args.indexOf('--all');
    if (allIndex !== -1) {
      const allContexts = await this.adapter.workflowLoader.listByType('all');
      return {
        success: true,
        all_contexts: true,
        contexts: allContexts.map(ctx => ({
          name: ctx.name,
          slug: ctx.slug,
          type: ctx.type,
          description: ctx.description || ctx.summary || 'No description available'
        })),
        total_count: allContexts.length,
        search_type: 'All contexts',
        workspace: workspace
      };
    }
    
    const intent = cleanedArgs.join(' ');
    
    if (!intent) throw new Error("Search query required. Usage: lev find <query> [--type=workflow|tool|agent|pattern] or lev find --all");
    
    // Use enhanced search with type filter
    const result = await this.adapter.findWorkflow(intent, "full", typeFilter);
    
    if (result.found) {
      const nextActions = await this.adapter.suggestNext(result.slug);
      return {
        success: true,
        context: result,
        next_actions: nextActions.suggestions || [],
        search_type: typeFilter ? `Filtered by type: ${typeFilter}` : 'All types',
        workspace: workspace
      };
    } else {
      return {
        success: false,
        suggestions: result.suggestions?.slice(0, 3) || [],
        search_query: intent,
        type_filter: typeFilter,
        workspace: workspace,
        alternative_message: typeFilter ? 
          `No ${typeFilter} contexts found for "${intent}". Try different terms or remove --type filter.` :
          "No exact match found. Try these related contexts:"
      };
    }
  }
  
  async handle_promote(args) {
    // Auto-register workspace before context promotion
    const workspace = this.sessionManager.detectWorkspace();
    await this.sessionManager.autoRegisterIfNeeded(workspace);
    
    const contextName = args[0];
    if (!contextName) throw new Error("Context name required. Usage: ks promote <context-name>");
    
    // Load local context
    const context = await this.loadLocalContext(contextName);
    if (!context) {
      throw new Error(`Context '${contextName}' not found in .kingly/contexts/`);
    }
    
    // Validate promotion criteria
    const validation = await this.promotionEngine.validatePromotion(context);
    
    if (validation.canPromote) {
      await this.promotionEngine.promoteToGlobal(contextName, context);
      return {
        success: true,
        promoted: true,
        effectiveness: context.effectiveness_metrics?.quality_score || 'N/A',
        global_path: `~/ka/contexts/${context.metadata.type}/${contextName}/`,
        message: `✅ ${contextName} promoted to global contexts`
      };
    } else {
      return {
        success: false,
        promoted: false,
        validation_results: validation,
        improvements_needed: validation.gaps
      };
    }
  }
  
  async handle_validate(args) {
    const scope = args[0] || '--all';
    
    if (scope === '--all') {
      return await this.promotionEngine.validateAllContexts();
    } else {
      return await this.promotionEngine.validateSingleContext(scope);
    }
  }
  
  async handle_combos(args) {
    // Auto-register workspace before combo discovery
    const workspace = this.sessionManager.detectWorkspace();
    await this.sessionManager.autoRegisterIfNeeded(workspace);
    
    const intent = args.slice(0, -1).join(' ') || args.join(' ');
    const count = parseInt(args[args.length - 1]) || 3;
    
    const combos = await this.adapter.findCombos(intent, count);
    
    return {
      primary: combos[0],
      supporting: combos.slice(1),
      synergy_explanation: this.explainWorkflowSynergy(combos)
    };
  }
  
  // @claude-code: Unified checkpoint system - handles all session management modes
  // @claude-code: --resume loads previous context, --new starts fresh, --final creates rollup, default marks progress
  async handle_checkpoint(args) {
    // Parse checkpoint modes
    const isFinal = args.includes('--final');
    const isResume = args.includes('--resume'); 
    const isNew = args.includes('--new');
    const snippetIndex = args.findIndex(arg => arg.startsWith('--snippet='));
    
    // @claude-code: Self-healing - detect conflicting modes and provide clear guidance
    if (isResume && isNew) {
      throw new Error("Cannot use --resume and --new simultaneously. Choose one mode: --resume (continue) or --new (start fresh)");
    }
    
    // Extract snippet if provided
    let snippet = null;
    if (snippetIndex !== -1) {
      snippet = args[snippetIndex].split('=')[1];
      args.splice(snippetIndex, 1); // Remove from args
    }
    
    // Remove mode flags from context
    const cleanArgs = args.filter(arg => !['--final', '--resume', '--new'].includes(arg));
    const context = this.getArgValue(cleanArgs, '--context') || cleanArgs.join(' ');
    const files = this.getArgValue(cleanArgs, '--files');
    
    // @claude-code: Route to appropriate session management based on mode
    if (isResume) {
      return await this.handleResumeSession(context, files, snippet);
    } else if (isNew) {
      return await this.handleNewSession(context, files, snippet);
    } else if (isFinal) {
      return await this.handleFinalCheckpoint(context, files, snippet);
    } else {
      // Default: progress checkpoint during active work
      return await this.handleProgressCheckpoint(context, files, snippet);
    }
  }
  
  // @claude-code: Resume session mode - loads previous checkpoint context and timeline with cross-session continuity
  async handleResumeSession(context, files, snippet) {
    const sessionType = 'resume';
    const autoContext = context || await this.autoDetectContext();
    
    // NEW: Load cross-session timeline before creating new checkpoint
    const crossSessionTimeline = await this.loadCrossSessionTimeline();
    
    const rawResult = await this.sessionManager.ping(autoContext, files, sessionType);
    
    // Enhance rawResult with cross-session timeline data
    if (crossSessionTimeline.success) {
      rawResult.previous_session = crossSessionTimeline.lastSession;
      rawResult.last_checkpoint = crossSessionTimeline.lastCheckpoint;
      rawResult.critical_context = crossSessionTimeline.continuityContext;
      rawResult.active_files = crossSessionTimeline.activeFiles;
      rawResult.continuation_point = crossSessionTimeline.nextActions;
      rawResult.bridge_notes = crossSessionTimeline.bridgeNotes;
      rawResult.cross_session_timeline = crossSessionTimeline.fullTimeline;
    }
    
    // Format the response according to checkpoint.md spec
    let formattedResponse = "🔄 CHECKPOINT Resume\n\n";
    formattedResponse += `**Session Loaded:** ${rawResult.previous_session || 'Previous session context'}\n`;
    formattedResponse += `**Last State:** ${rawResult.last_checkpoint || 'Previous work state'}\n`;
    formattedResponse += `**Key Context:** ${rawResult.critical_context || 'Loading context from timeline'}\n`;
    formattedResponse += `**Files in Play:** ${files || rawResult.active_files || 'Files from previous session'}\n`;
    formattedResponse += `**Ready for:** ${rawResult.continuation_point || 'Continuing previous work'}\n`;
    formattedResponse += `**Continuity Notes:** ${rawResult.bridge_notes || 'Session context loaded for continuation'}\n`;
    
    // NEW: Add cross-session timeline summary if available
    if (crossSessionTimeline.success && crossSessionTimeline.sessionCount > 1) {
      formattedResponse += `\n📈 **Cross-Session Timeline:** ${crossSessionTimeline.sessionCount} previous sessions discovered\n`;
      formattedResponse += `**Timeline Coverage:** ${crossSessionTimeline.timelineRange}\n`;
      formattedResponse += `**Key Progression:** ${crossSessionTimeline.progressionSummary}\n`;
    }
    
    // Add code snippet if provided
    if (snippet) {
      const codeContext = await this.loadCodeSnippet(snippet);
      formattedResponse += `\n📋 Code Context: ${codeContext.file}:${codeContext.lines || codeContext.function}\n`;
      if (codeContext.snippet) {
        formattedResponse += "```\n" + codeContext.snippet.join('\n') + "\n```\n";
      }
      formattedResponse += `**Context for Continuation:** ${codeContext.note}\n`;
    }
    
    const whisper = {
      llm_guidance: "Resume mode - load previous session timeline and provide continuity guidance with cross-session awareness",
      adapter_instructions: {
        context_loading: "Previous session context loaded - review timeline for continuity across multiple sessions",
        timeline_awareness: "Build on previous work - maintain narrative thread across session boundaries", 
        continuation_focus: "Focus on where previous session ended and what comes next",
        cross_session_continuity: crossSessionTimeline.success ? 
          `Timeline spans ${crossSessionTimeline.sessionCount} sessions - maintain progression narrative` :
          "Single session context - establish baseline for future cross-session continuity"
      },
      session_tips: [
        "Review loaded context to understand previous decisions across sessions",
        "Continue building on established timeline progression",
        "Reference previous checkpoint findings and cross-session learnings in current work",
        crossSessionTimeline.success ? "Leverage cross-session insights for informed decision making" : "Establish foundation for future cross-session timeline building"
      ]
    };
    
    return {
      success: true,
      mode: 'resume',
      formatted_response: formattedResponse,
      whisper: whisper,
      raw_data: rawResult,
      session_resumed: true,
      cross_session_timeline: crossSessionTimeline
    };
  }
  
  // @claude-code: New session mode - creates fresh checkpoint for new work
  async handleNewSession(context, files, snippet) {
    const sessionType = 'new';
    const sessionContext = context || 'Starting new work session';
    
    const rawResult = await this.sessionManager.ping(sessionContext, files, sessionType);
    
    // Format the response according to checkpoint.md spec
    let formattedResponse = "🚀 CHECKPOINT New\n\n";
    formattedResponse += `**Fresh Start:** ${sessionContext}\n`;
    formattedResponse += `**Project Context:** ${rawResult.project_understanding || 'New session in current project'}\n`;
    formattedResponse += `**Goals:** ${rawResult.session_goals || 'Goals for this work session'}\n`;
    formattedResponse += `**Starting Point:** ${rawResult.codebase_state || 'Current codebase state'}\n`;
    formattedResponse += `**Session Initialized:** ${rawResult.session_id || 'new-session'} - ready for fresh work\n`;
    
    // Add code snippet if provided
    if (snippet) {
      const codeContext = await this.loadCodeSnippet(snippet);
      formattedResponse += `\n📋 Code Context: ${codeContext.file}:${codeContext.lines || codeContext.function}\n`;
      if (codeContext.snippet) {
        formattedResponse += "```\n" + codeContext.snippet.join('\n') + "\n```\n";
      }
      formattedResponse += `**Starting Context:** ${codeContext.note}\n`;
    }
    
    const whisper = {
      llm_guidance: "New session mode - establish fresh context and goals for upcoming work",
      adapter_instructions: {
        fresh_start: "This is a new session - establish clear goals and starting context",
        timeline_foundation: "Begin building new timeline narrative from this checkpoint",
        goal_setting: "Define what this session aims to accomplish"
      },
      session_tips: [
        "Clearly define session goals and scope",
        "Establish baseline context for future checkpoints",
        "Document starting assumptions and approach"
      ]
    };
    
    return {
      success: true,
      mode: 'new',
      formatted_response: formattedResponse,
      whisper: whisper,
      raw_data: rawResult,
      session_new: true
    };
  }
  
  // @claude-code: Final checkpoint mode - creates comprehensive session rollup
  async handleFinalCheckpoint(context, files, snippet) {
    const sessionType = 'rollup';
    const rollupContext = context || 'Session complete';
    
    const rawResult = await this.sessionManager.ping(rollupContext, files, sessionType);
    
    // Stitch together timeline from all previous checkpoints
    const timeline = await this.stitchSessionTimeline(rawResult);
    
    // Format the response according to checkpoint.md spec
    let formattedResponse = "✅ CHECKPOINT Final\n\n";
    formattedResponse += `**Session Summary:** ${timeline.narrative || 'Complete session timeline'}\n`;
    formattedResponse += `**Key Decisions:** ${timeline.decisions || 'Important choices made during session'}\n`;
    formattedResponse += `**Files Changed:** ${timeline.files || files || 'Files modified this session'}\n`;
    formattedResponse += `**Architecture Impact:** ${timeline.architecture || 'System changes and impacts'}\n`;
    formattedResponse += `**Handoff Notes:** ${timeline.handoff || 'Critical information for next session'}\n`;
    formattedResponse += `**Next Priorities:** ${timeline.next_priorities || 'Recommended next steps'}\n`;
    
    // Add code snippet if provided
    if (snippet) {
      const codeContext = await this.loadCodeSnippet(snippet);
      formattedResponse += `\n📋 Final Code Context: ${codeContext.file}:${codeContext.lines || codeContext.function}\n`;
      if (codeContext.snippet) {
        formattedResponse += "```\n" + codeContext.snippet.join('\n') + "\n```\n";
      }
      formattedResponse += `**Final Context:** ${codeContext.note}\n`;
    }
    
    const whisper = {
      llm_guidance: "Final checkpoint - create comprehensive session rollup with complete timeline",
      adapter_instructions: {
        timeline_completion: "This concludes the session - all checkpoints stitched into narrative",
        handoff_creation: "Comprehensive handoff ready for next session or team member",
        session_closure: "Complete timeline and decisions documented for continuity"
      },
      session_tips: [
        "Timeline narrative captures complete session journey",
        "All key decisions and rationale preserved",
        "Handoff ready for seamless session continuation"
      ]
    };
    
    return {
      success: true,
      mode: 'final',
      formatted_response: formattedResponse,
      whisper: whisper,
      raw_data: rawResult,
      timeline: timeline,
      rollup_created: true,
      session_consolidated: true,
      handoff_ready: true
    };
  }
  
  // @claude-code: Progress checkpoint mode - marks current progress during active work
  async handleProgressCheckpoint(context, files, snippet) {
    const sessionType = 'general';
    const autoContext = context || await this.autoDetectContext();
    
    const rawResult = await this.sessionManager.ping(autoContext, files, sessionType);
    
    // Check if this is the first checkpoint of the session
    const isFirstCheckpoint = !rawResult.session_id || rawResult.is_first_checkpoint;
    
    // Format the response according to checkpoint.md spec
    let formattedResponse = "⚡ CHECKPOINT Progress\n\n";
    formattedResponse += `**Current State:** ${autoContext}\n`;
    formattedResponse += `**Context:** ${rawResult.current_context || 'Active development session'}\n`;
    formattedResponse += `**Files Modified:** ${files || rawResult.recent_files || 'No files specified'}\n`;
    formattedResponse += `**Progress:** ${rawResult.accomplishments || 'Session in progress'}\n`;
    formattedResponse += `**Next Steps:** ${rawResult.next_actions || 'Continue current work'}\n`;
    formattedResponse += `**Session ID:** ${rawResult.session_id || 'new-session'}\n`;
    
    // Add code snippet if provided
    if (snippet) {
      const codeContext = await this.loadCodeSnippet(snippet);
      formattedResponse += `\n📋 Code Context: ${codeContext.file}:${codeContext.lines || codeContext.function}\n`;
      if (codeContext.snippet) {
        formattedResponse += "```\n" + codeContext.snippet.join('\n') + "\n```\n";
      }
      formattedResponse += `**Why Important:** ${codeContext.note}\n`;
    }
    
    // Add whisper guidance for adapter training (especially on first checkpoint)
    const whisper = {
      llm_guidance: isFirstCheckpoint ? 
        "First checkpoint of session - provide comprehensive guidance on checkpoint system usage" :
        "Progress checkpoint - maintain momentum and timeline continuity",
      adapter_instructions: isFirstCheckpoint ? {
        system_usage: "This is your first checkpoint. Here's how to use the timeline system effectively:",
        code_snippets: "Use --snippet when you modify important code: 'kingly checkpoint --snippet \"file.js:50-70\" \"added new feature\"'",
        when_to_checkpoint: "Checkpoint after: major changes, before complex work, when switching contexts, before breaks",
        final_rollup: "Use --final when concluding work to stitch together complete session timeline",
        resume_guidance: "Use --resume to load previous session context and continue work seamlessly"
      } : {
        timeline_building: "Adding to session timeline - include context for future resume",
        momentum: "Keep building the narrative thread for session continuity"
      },
      session_tips: isFirstCheckpoint ? [
        "Include code context for architectural changes using --snippet",
        "Reference file:line numbers for precise tracking", 
        "Explain WHY decisions were made, not just WHAT happened",
        "Use specific, actionable descriptions in checkpoints"
      ] : [
        "Building on previous context - maintain timeline continuity",
        "Include specific progress details for handoff"
      ]
    };
    
    return {
      success: true,
      mode: 'progress',
      formatted_response: formattedResponse,
      whisper: whisper,
      raw_data: rawResult,
      is_first_checkpoint: isFirstCheckpoint
    };
  }
  
  // @claude-code: Cross-session timeline discovery and loading
  async loadCrossSessionTimeline() {
    try {
      const currentWorkspace = this.sessionManager.detectWorkspace();
      
      // Discover all sessions for current workspace
      const workspaceSessions = await this.discoverWorkspaceSessions(currentWorkspace);
      
      if (workspaceSessions.length === 0) {
        return {
          success: false,
          reason: "No previous sessions found for workspace",
          sessionCount: 0
        };
      }
      
      // Sort sessions by creation date (oldest first)
      workspaceSessions.sort((a, b) => new Date(a.created) - new Date(b.created));
      
      // Extract timeline data from all sessions
      const crossSessionData = await this.extractCrossSessionData(workspaceSessions);
      
      // Build unified timeline narrative
      const unifiedTimeline = this.buildUnifiedTimeline(crossSessionData);
      
      return {
        success: true,
        sessionCount: workspaceSessions.length,
        lastSession: crossSessionData.lastSession,
        lastCheckpoint: crossSessionData.lastCheckpoint,
        continuityContext: crossSessionData.continuityContext,
        activeFiles: crossSessionData.activeFiles,
        nextActions: crossSessionData.nextActions,
        bridgeNotes: crossSessionData.bridgeNotes,
        fullTimeline: unifiedTimeline.narrative,
        timelineRange: unifiedTimeline.timeRange,
        progressionSummary: unifiedTimeline.progression,
        workspaceSessions: workspaceSessions
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        reason: "Failed to load cross-session timeline",
        sessionCount: 0
      };
    }
  }
  
  // @claude-code: Discover all sessions for current workspace
  async discoverWorkspaceSessions(workspace) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const sessionsDir = path.join(os.homedir(), '.kingly', 'sessions');
    
    try {
      const files = await fs.readdir(sessionsDir);
      const sessionFiles = files.filter(file => 
        file.endsWith('.json') && 
        file.startsWith('2025-') && 
        file.includes('session')
      );
      
      const workspaceSessions = [];
      
      for (const file of sessionFiles) {
        try {
          const filePath = path.join(sessionsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const session = JSON.parse(content);
          
          if (session.workspace === workspace) {
            workspaceSessions.push(session);
          }
        } catch (error) {
          // Skip corrupted session files
          continue;
        }
      }
      
      return workspaceSessions;
      
    } catch (error) {
      throw new Error(`Failed to discover workspace sessions: ${error.message}`);
    }
  }
  
  // @claude-code: Extract timeline data from all sessions
  async extractCrossSessionData(sessions) {
    const lastSession = sessions[sessions.length - 1];
    
    // Extract context progression
    const contexts = sessions.map(s => s.context).filter(Boolean);
    const files = new Set();
    
    // Collect all files mentioned across sessions
    sessions.forEach(session => {
      if (session.files && Array.isArray(session.files)) {
        session.files.forEach(file => files.add(file));
      }
    });
    
    // Build continuity narrative
    const continuityContext = this.buildContinuityContext(contexts);
    const nextActions = this.inferNextActions(lastSession, contexts);
    const bridgeNotes = this.generateBridgeNotes(sessions);
    
    return {
      lastSession: `${lastSession.id} (${new Date(lastSession.created).toLocaleDateString()})`,
      lastCheckpoint: lastSession.context || 'Session context available',
      continuityContext: continuityContext,
      activeFiles: Array.from(files).join(', ') || 'No files tracked across sessions',
      nextActions: nextActions,
      bridgeNotes: bridgeNotes
    };
  }
  
  // @claude-code: Build unified timeline narrative
  buildUnifiedTimeline(crossSessionData) {
    const firstSession = crossSessionData.lastSession;
    const now = new Date().toLocaleDateString();
    
    return {
      narrative: `Cross-session progression from ${firstSession} to ${now}: ${crossSessionData.continuityContext}`,
      timeRange: `${firstSession} → Present`,
      progression: crossSessionData.bridgeNotes
    };
  }
  
  // @claude-code: Build continuity context from session contexts
  buildContinuityContext(contexts) {
    if (contexts.length === 0) return "No context progression tracked";
    if (contexts.length === 1) return contexts[0];
    
    // Find common themes and progression
    const progression = contexts.slice(0, 3).join(' → ');
    
    if (contexts.length > 3) {
      return `${progression} ... (${contexts.length} total progression steps)`;
    }
    
    return progression;
  }
  
  // @claude-code: Infer next actions from session progression
  inferNextActions(lastSession, allContexts) {
    if (!lastSession.context) return "Continue development workflow";
    
    const context = lastSession.context.toLowerCase();
    
    // Simple inference based on context patterns
    if (context.includes('complete') || context.includes('finish')) {
      return "Ready for new feature work or testing";
    }
    
    if (context.includes('testing') || context.includes('debug')) {
      return "Continue testing and validation workflow";
    }
    
    if (context.includes('implement') || context.includes('build')) {
      return "Continue implementation and development";
    }
    
    return `Continue from: ${lastSession.context}`;
  }
  
  // @claude-code: Generate bridge notes between sessions
  generateBridgeNotes(sessions) {
    if (sessions.length <= 1) return "Single session - no bridge needed";
    
    const sessionCount = sessions.length;
    const timeSpan = this.calculateTimeSpan(sessions);
    const workPattern = this.analyzeWorkPattern(sessions);
    
    return `${sessionCount} sessions over ${timeSpan}. ${workPattern}`;
  }
  
  // @claude-code: Calculate time span between sessions
  calculateTimeSpan(sessions) {
    if (sessions.length <= 1) return "single session";
    
    const first = new Date(sessions[0].created);
    const last = new Date(sessions[sessions.length - 1].created);
    const diffHours = Math.round((last - first) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours} hours`;
    
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} days`;
  }
  
  // @claude-code: Analyze work pattern across sessions
  analyzeWorkPattern(sessions) {
    const contexts = sessions.map(s => s.context).filter(Boolean);
    
    if (contexts.length === 0) return "Pattern: general development";
    
    const hasProgression = contexts.some(c => 
      c.toLowerCase().includes('implement') || 
      c.toLowerCase().includes('build') ||
      c.toLowerCase().includes('develop')
    );
    
    const hasTesting = contexts.some(c =>
      c.toLowerCase().includes('test') ||
      c.toLowerCase().includes('debug') ||
      c.toLowerCase().includes('fix')
    );
    
    if (hasProgression && hasTesting) return "Pattern: development → testing cycle";
    if (hasProgression) return "Pattern: focused development";
    if (hasTesting) return "Pattern: testing and refinement";
    
    return "Pattern: iterative development";
  }
  
  // @claude-code: Timeline stitching - combines all session checkpoints into narrative
  async stitchSessionTimeline(rawResult) {
    try {
      // Get all checkpoints from this session
      const checkpoints = rawResult.session_checkpoints || [];
      
      if (checkpoints.length === 0) {
        return {
          narrative: "Single checkpoint session - no timeline to stitch",
          decisions: "No previous checkpoints found",
          files: "Current session files only",
          architecture: "No architectural progression tracked",
          handoff: "Session concluded without timeline history",
          next_priorities: "Continue from current state"
        };
      }
      
      // Build narrative from checkpoint sequence
      let narrative = "Session timeline: ";
      let decisions = [];
      let files = new Set();
      let architecturalChanges = [];
      
      checkpoints.forEach((checkpoint, index) => {
        const num = index + 1;
        narrative += `Checkpoint ${num}: ${checkpoint.context || 'Progress made'} → `;
        
        if (checkpoint.decisions) {
          decisions.push(`${num}. ${checkpoint.decisions}`);
        }
        
        if (checkpoint.files) {
          checkpoint.files.split(',').forEach(file => files.add(file.trim()));
        }
        
        if (checkpoint.architecture_impact) {
          architecturalChanges.push(`${num}. ${checkpoint.architecture_impact}`);
        }
      });
      
      // Complete the narrative
      narrative += "Session concluded with comprehensive rollup";
      
      return {
        narrative: narrative,
        decisions: decisions.join('; ') || "No major decisions tracked",
        files: Array.from(files).join(', ') || "No file changes tracked",
        architecture: architecturalChanges.join('; ') || "No architectural changes tracked",
        handoff: `Timeline covers ${checkpoints.length} checkpoints with complete context`,
        next_priorities: rawResult.recommended_next || "Continue based on final checkpoint context"
      };
      
    } catch (error) {
      return {
        narrative: "Timeline stitching failed - single checkpoint session",
        decisions: "Unable to retrieve checkpoint history",
        files: "Current session only",
        architecture: "Timeline reconstruction failed",
        handoff: "Manual session review may be needed",
        next_priorities: "Verify session state and continue"
      };
    }
  }

  // @claude-code: Helper method to load code snippets for checkpoint context
  async loadCodeSnippet(snippetSpec) {
    try {
      const [filePath, range] = snippetSpec.split(':');
      
      if (range && range.includes('-')) {
        // Line range: file.js:10-20
        const [start, end] = range.split('-').map(n => parseInt(n));
        const result = await this.showLineRange(filePath, start, end);
        
        if (result.success) {
          return {
            file: result.file,
            lines: result.lines,
            snippet: result.snippet,
            note: `Code lines ${start}-${end} included for checkpoint context`
          };
        } else {
          return {
            file: filePath,
            lines: `${start}-${end}`,
            error: result.error,
            note: "Failed to load code snippet"
          };
        }
      } else {
        // Function name: file.js:functionName
        const result = await this.showFunction(filePath, range);
        
        if (result.success) {
          return {
            file: result.file,
            function: result.function,
            lines: result.lines,
            snippet: result.snippet,
            note: `Function '${range}' included for checkpoint context`
          };
        } else {
          return {
            file: filePath,
            function: range,
            error: result.error,
            note: "Failed to load function context"
          };
        }
      }
    } catch (error) {
      return {
        error: `Could not load snippet: ${error.message}`,
        spec: snippetSpec,
        note: "Snippet loading failed"
      };
    }
  }
  
  async handle_status(args) {
    const scope = args[0] || 'project';
    
    switch (scope) {
      case '--project':
      case 'project':
        return await this.getProjectStatus();
      case '--global':
      case 'global':
        return await this.getGlobalStatus();
      case '--metrics':
      case 'metrics':
        return await this.getMetricsStatus();
      default:
        return await this.getOverallStatus();
    }
  }
  
  async handle_sync(args) {
    const direction = args[0] || 'bidirectional';
    
    switch (direction) {
      case '--pull':
      case 'pull':
        return await this.syncContexts('pull');
      case '--push':
      case 'push':
        return await this.syncContexts('push');
      case '--check':
      case 'check':
        return await this.checkSyncStatus();
      default:
        return await this.syncContexts('bidirectional');
    }
  }
  

  
  async handle_job(args) {
    // Auto-register workspace before job orchestration
    const workspace = this.sessionManager.detectWorkspace();
    await this.sessionManager.autoRegisterIfNeeded(workspace);
    
    const description = args.join(' ');
    if (!description) throw new Error("Job description required. Usage: kingly job <description>");
    
    // Analyze job complexity with AI
    const analysis = await this.sessionManager.analyzeCEOIntent(description);
    const jobBreakdown = await this.generateJobStructure(analysis);
    const callbackChain = await this.createCallbackChain(jobBreakdown);
    
    return {
      analysis,
      job_breakdown: jobBreakdown,
      callback_chain: callbackChain,
      estimated_time: this.calculateEstimatedTime(jobBreakdown),
      recommended_tabs: this.calculateOptimalTabs(jobBreakdown)
    };
  }
  
  // @claude-code: Show command - displays specific code snippets with smart boundaries
  // @claude-code: Supports file:lines and file:function formats for precise context
  async handle_show(args) {
    // Auto-register workspace before code inspection
    const workspace = this.sessionManager.detectWorkspace();
    await this.sessionManager.autoRegisterIfNeeded(workspace);
    
    const target = args[0];
    if (!target) {
      throw new Error("Target required. Usage: kingly show <file>:<start>-<end> | <file>:<function_name>");
    }
    
    // Parse target specification
    const [filePath, range] = target.split(':');
    if (!filePath || !range) {
      throw new Error("Invalid format. Use: file.js:10-20 or file.js:functionName");
    }
    
    try {
      // Check if range is line numbers or function name
      if (range.includes('-')) {
        // Line range: file.js:10-20
        const [start, end] = range.split('-').map(n => parseInt(n));
        return await this.showLineRange(filePath, start, end);
      } else {
        // Function name: file.js:functionName
        return await this.showFunction(filePath, range);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestions: [
          "Check file path is correct",
          "Verify line numbers exist",
          "Try relative path from project root",
          "Use 'find' to locate files first"
        ]
      };
    }
  }
  
  // @claude-code: Show specific line range with context
  async showLineRange(filePath, start, end) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Try multiple path variations
    const possiblePaths = [
      filePath,
      path.resolve(filePath),
      path.resolve('./src', filePath),
      path.resolve('./', filePath)
    ];
    
    let fileContent = null;
    let resolvedPath = null;
    
    for (const tryPath of possiblePaths) {
      try {
        fileContent = await fs.readFile(tryPath, 'utf-8');
        resolvedPath = tryPath;
        break;
      } catch (error) {
        continue;
      }
    }
    
    if (!fileContent) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const lines = fileContent.split('\n');
    const totalLines = lines.length;
    
    // Validate range
    if (start < 1 || end > totalLines || start > end) {
      throw new Error(`Invalid range ${start}-${end}. File has ${totalLines} lines.`);
    }
    
    // Extract lines (adjust for 0-based indexing)
    const snippet = lines.slice(start - 1, end);
    
    return {
      success: true,
      file: resolvedPath,
      lines: `${start}-${end}`,
      total_lines: totalLines,
      snippet: snippet,
      context: `Showing lines ${start}-${end} of ${totalLines} total lines`
    };
  }
  
  // @claude-code: Show function by name with smart boundary detection
  async showFunction(filePath, functionName) {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Try multiple path variations (same as showLineRange)
    const possiblePaths = [
      filePath,
      path.resolve(filePath),
      path.resolve('./src', filePath),
      path.resolve('./', filePath)
    ];
    
    let fileContent = null;
    let resolvedPath = null;
    
    for (const tryPath of possiblePaths) {
      try {
        fileContent = await fs.readFile(tryPath, 'utf-8');
        resolvedPath = tryPath;
        break;
      } catch (error) {
        continue;
      }
    }
    
    if (!fileContent) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const lines = fileContent.split('\n');
    
    // Simple function detection (can be enhanced)
    const functionPatterns = [
      new RegExp(`function\\s+${functionName}\\s*\\(`),
      new RegExp(`${functionName}\\s*[=:]\\s*function`),
      new RegExp(`${functionName}\\s*[=:]\\s*\\(`),
      new RegExp(`async\\s+${functionName}\\s*\\(`),
      new RegExp(`${functionName}\\s*\\(`), // Method definition
    ];
    
    let startLine = -1;
    let endLine = -1;
    
    // Find function start
    for (let i = 0; i < lines.length; i++) {
      if (functionPatterns.some(pattern => pattern.test(lines[i]))) {
        startLine = i;
        break;
      }
    }
    
    if (startLine === -1) {
      throw new Error(`Function '${functionName}' not found in ${filePath}`);
    }
    
    // Find function end (simple brace matching)
    let braceCount = 0;
    let foundOpenBrace = false;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundOpenBrace = true;
        } else if (char === '}') {
          braceCount--;
          if (foundOpenBrace && braceCount === 0) {
            endLine = i;
            break;
          }
        }
      }
      
      if (endLine !== -1) break;
    }
    
    // If no closing brace found, show reasonable range
    if (endLine === -1) {
      endLine = Math.min(startLine + 20, lines.length - 1);
    }
    
    const snippet = lines.slice(startLine, endLine + 1);
    
    return {
      success: true,
      file: resolvedPath,
      function: functionName,
      lines: `${startLine + 1}-${endLine + 1}`,
      total_lines: lines.length,
      snippet: snippet,
      context: `Function '${functionName}' found at lines ${startLine + 1}-${endLine + 1}`
    };
  }
  
  // NEW: Add rebuild-cache handler
  async handle_rebuild_cache(args) {
    const provider = this.getArgValue(args, '--provider') || 'openai';
    const force = args.includes('--force');
    
    try {
      console.error('🔄 Starting cache rebuild...');
      
      // Clear existing cache if force flag
      if (force) {
        await this.adapter.clearCache();
      }
      
      // Reload all contexts with dynamic type discovery
      await this.adapter.workflowLoader.refreshCache();
      
      // Rebuild embeddings with enhanced content
      const contexts = await this.adapter.workflowLoader.loadAll();
      await this.adapter.semanticLookup.buildEmbeddings(contexts);
      
      return {
        success: true,
        cache_rebuilt: true,
        contexts_processed: contexts.length,
        provider_used: provider,
        enhanced_content: true,
        dynamic_types: true,
        message: `✅ Rebuilt cache with ${contexts.length} contexts using ${provider} embeddings`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        recovery_suggestions: [
          `Check ${provider} API key configuration`,
          'Verify contexts/ directory structure',
          'Try without --provider flag for default'
        ]
      };
    }
  }
  
  // Natural language processing
  isNaturalLanguage(input) {
    return NLP_INDICATORS.some(pattern => pattern.test(input)) ||
           !input.includes('-') && input.split(' ').length > 2;
  }
  
  async handleNLP(input) {
    // Use semantic workflow discovery
    const workflow = await this.adapter.findWorkflow(input, "full");
    
    // Also try CEO orchestration for complex queries
    const ceoResult = await this.sessionManager.processCEOOrchestration(input);
    
    return {
      nlp_mode: true,
      interpreted_as: input,
      workflow_result: workflow,
      ceo_result: ceoResult,
      whisper: {
        llm_guidance: "User used natural language. Provide conversational response with workflow suggestions.",
        context_hint: "Natural language query - be helpful and explain options",
        response_format: "Conversational tone with practical next steps"
      }
    };
  }
  
  handleHelp(args) {
    const command = args[0];
    return {
      success: true,
      help_text: generateHelpText(command),
      command_specific: !!command
    };
  }
  
  suggestCommand(unknownCommand) {
    const suggestions = Object.keys(this.commands)
      .filter(cmd => cmd.includes(unknownCommand) || unknownCommand.includes(cmd))
      .slice(0, 3);
      
    return {
      success: false,
      unknown_command: unknownCommand,
      suggestions,
      message: `Unknown command: ${unknownCommand}`,
      help_hint: "Try 'kingly help' for available commands or use natural language"
    };
  }
  
  handleCommandError(command, error, cmd) {
    // Generate error recovery whisper
    const errorWhisper = {
      llm_guidance: "Command failed - provide helpful error recovery guidance",
      context_hint: "User encountered an error - be supportive and suggest alternatives",
      error_recovery: cmd.whisper?.error_recovery || "Try the help system or rephrase your request",
      response_format: "Acknowledge error, explain issue, provide specific next steps"
    };

    return {
      success: false,
      command,
      error: error.message,
      syntax: cmd.syntax,
      examples: cmd.examples,
      whisper: errorWhisper,
      recovery_suggestions: this.generateRecoverySuggestions(command, error.message)
    };
  }
  
  generateRecoverySuggestions(command, errorMessage) {
    const suggestions = [];
    
    // Command-specific suggestions
    if (command === 'find' && errorMessage.includes('Intent required')) {
      suggestions.push('Try: kingly find "your search terms here"');
      suggestions.push('Example: kingly find "creative problem solving"');
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('No exact match')) {
      suggestions.push('Use broader search terms');
      suggestions.push('Try natural language: kingly "help me with [your goal]"');
      suggestions.push('Browse categories: kingly status --project');
    }
    
    // Global suggestions
    suggestions.push('Check syntax: kingly help ' + command);
    suggestions.push('Try natural language if specific commands fail');
    
    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }
  
  // Utility methods
  getArgValue(args, flag) {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
  }
  
  async autoDetectContext() {
    // Auto-detect current working context
    const cwd = process.cwd();
    const gitStatus = await this.getGitStatus();
    return `Working in ${path.basename(cwd)} - ${gitStatus.status}`;
  }
  
  async getGitStatus() {
    // Simple git status detection
    try {
      return { status: 'clean' }; // Placeholder
    } catch {
      return { status: 'no-git' };
    }
  }
  
  explainWorkflowSynergy(combos) {
    if (combos.length < 2) return "Single workflow - no synergy analysis needed";
    
    return `Primary workflow ${combos[0].code} synergizes with supporting workflows through complementary methodologies and overlapping skill domains.`;
  }
  
  // Job system methods
  async generateJobStructure(analysis) {
    // AI-powered job breakdown based on CEO analysis
    const complexity = analysis.complexity || 'medium';
    const domain = analysis.domain || 'general';
    
    const structure = {
      primary_task: analysis.primary_intent || 'Complete requested task',
      subtasks: [],
      dependencies: [],
      complexity_score: this.mapComplexityToScore(complexity),
      estimated_components: analysis.components || ['analysis', 'implementation', 'validation']
    };
    
    // Generate subtasks based on complexity
    if (complexity === 'high' || analysis.components?.length > 3) {
      structure.subtasks = [
        { id: 1, name: 'Analysis & Planning', type: 'planning', estimated_minutes: 15 },
        { id: 2, name: 'Core Implementation', type: 'development', estimated_minutes: 45 },
        { id: 3, name: 'Integration & Testing', type: 'validation', estimated_minutes: 20 },
        { id: 4, name: 'Documentation & Cleanup', type: 'finalization', estimated_minutes: 10 }
      ];
    } else if (complexity === 'medium') {
      structure.subtasks = [
        { id: 1, name: 'Implementation', type: 'development', estimated_minutes: 25 },
        { id: 2, name: 'Validation', type: 'validation', estimated_minutes: 10 }
      ];
    } else {
      structure.subtasks = [
        { id: 1, name: 'Quick Implementation', type: 'development', estimated_minutes: 10 }
      ];
    }
    
    return structure;
  }
  
  async createCallbackChain(jobBreakdown) {
    // Create execution chain with checkpoints
    const chain = {
      stages: [],
      checkpoints: [],
      rollback_points: []
    };
    
    jobBreakdown.subtasks.forEach((subtask, index) => {
      chain.stages.push({
        stage_id: index + 1,
        name: subtask.name,
        type: subtask.type,
        callback: `handle_job_stage_${index + 1}`,
        checkpoint_after: true,
        estimated_time: subtask.estimated_minutes
      });
      
      chain.checkpoints.push({
        stage: index + 1,
        description: `Complete ${subtask.name}`,
        validation_required: subtask.type === 'validation'
      });
    });
    
    // Add final rollup checkpoint
    chain.checkpoints.push({
      stage: 'final',
      description: 'Job completion rollup',
      validation_required: true,
      creates_session_handoff: true
    });
    
    return chain;
  }
  
  calculateEstimatedTime(jobBreakdown) {
    const totalMinutes = jobBreakdown.subtasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
    const overhead = Math.ceil(totalMinutes * 0.2); // 20% overhead for context switching
    
    return {
      base_time_minutes: totalMinutes,
      with_overhead_minutes: totalMinutes + overhead,
      estimated_range: `${Math.floor((totalMinutes + overhead) * 0.8)}-${Math.ceil((totalMinutes + overhead) * 1.3)} minutes`,
      confidence: jobBreakdown.complexity_score > 7 ? 'low' : 'medium'
    };
  }
  
  calculateOptimalTabs(jobBreakdown) {
    const complexity = jobBreakdown.complexity_score;
    const subtaskCount = jobBreakdown.subtasks.length;
    
    let recommendedTabs = 1;
    
    if (complexity >= 8 || subtaskCount > 4) {
      recommendedTabs = 3; // Research, Implementation, Testing
    } else if (complexity >= 6 || subtaskCount > 2) {
      recommendedTabs = 2; // Implementation, Validation
    }
    
    return {
      recommended: recommendedTabs,
      reasoning: this.explainTabStrategy(recommendedTabs, complexity, subtaskCount),
      tab_purposes: this.suggestTabPurposes(recommendedTabs)
    };
  }
  
  mapComplexityToScore(complexity) {
    const mapping = { low: 3, medium: 6, high: 9 };
    return mapping[complexity] || 6;
  }
  
  explainTabStrategy(tabCount, complexity, subtaskCount) {
    if (tabCount === 1) return "Single tab sufficient for straightforward task";
    if (tabCount === 2) return "Dual tabs recommended: main implementation + validation/testing";
    return "Multi-tab strategy: separate contexts for research, development, and validation";
  }
  
  suggestTabPurposes(tabCount) {
    const purposes = [
      ["Main Implementation"],
      ["Implementation", "Testing & Validation"],
      ["Research & Planning", "Core Implementation", "Testing & Documentation"]
    ];
    return purposes[tabCount - 1] || purposes[0];
  }
}