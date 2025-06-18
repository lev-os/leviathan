/**
 * Checkpoint Router - Handles checkpoint command family
 * Routes checkpoint creation, resumption, and session management commands
 * Includes --session argument parsing fix
 * Part of Leviathan CLI Adapter
 */

export class CheckpointRouter {
  constructor(checkpointCore, formatter) {
    // Handle both object and individual functions
    if (typeof checkpointCore === 'object' && checkpointCore.createCheckpoint) {
      this.checkpointCore = checkpointCore;
    } else {
      // Individual functions passed as object
      this.createCheckpoint = checkpointCore.createCheckpoint;
      this.resumeSession = checkpointCore.resumeSession;
      this.createFinalCheckpoint = checkpointCore.createFinalCheckpoint;
      this.createSession = checkpointCore.createSession;
      this.updateSessionActivity = checkpointCore.updateSessionActivity;
    }
    this.formatter = formatter;
  }

  /**
   * Handle checkpoint command with arguments
   * @param {Array} args - Command arguments
   * @returns {Promise<Object>} Checkpoint result
   */
  async handle(args) {
    try {
      // Parse checkpoint arguments including --session
      const parsed = this.parseArguments(args);
      
      // Handle help
      if (parsed.help) {
        return this.handleHelp();
      }
      
      // Route based on mode
      if (parsed.resume) {
        return await this.handleResumeMode(parsed);
      } else if (parsed.new) {
        return await this.handleNewMode(parsed);
      } else if (parsed.final) {
        return await this.handleFinalMode(parsed);
      } else {
        // Default: progress checkpoint
        return await this.handleProgressMode(parsed);
      }
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        formatted_response: `❌ Checkpoint command failed: ${error.message}`
      };
    }
  }

  /**
   * Parse checkpoint command arguments with --session support
   */
  parseArguments(args) {
    const parsed = {
      context: '',
      files: [],
      mode: 'progress',
      resume: false,
      new: false,
      final: false,
      sessionId: null,  // FIX: Add session ID parsing
      snippet: null,
      help: false
    };

    let contextParts = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--resume') {
        parsed.resume = true;
        parsed.mode = 'resume';
      } else if (arg === '--new') {
        parsed.new = true;
        parsed.mode = 'new';
      } else if (arg === '--final') {
        parsed.final = true;
        parsed.mode = 'final';
      } else if (arg === '--help' || arg === '-h') {
        parsed.help = true;
      } else if (arg.startsWith('--session=')) {
        // FIX: Parse --session argument
        parsed.sessionId = arg.split('=')[1];
      } else if (arg.startsWith('--files=')) {
        parsed.files = arg.split('=')[1].split(',').map(f => f.trim());
      } else if (arg.startsWith('--snippet=')) {
        parsed.snippet = arg.split('=')[1];
      } else if (arg === '--session') {
        // Handle --session with space-separated value
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          i++;
          parsed.sessionId = args[i];
        }
      } else if (arg.startsWith('--context=')) {
        contextParts.push(arg.split('=')[1]);
      } else if (!arg.startsWith('--')) {
        // Regular context term
        contextParts.push(arg);
      }
    }

    parsed.context = contextParts.join(' ').trim() || parsed.context;

    return parsed;
  }

  /**
   * Handle resume mode with --session support
   */
  async handleResumeMode(parsed) {
    try {
      const resumeOptions = {
        includeTimeline: true,
        workspace: null
      };

      // FIX: Use parsed session ID
      const resumeData = await (this.resumeSession || this.checkpointCore.resumeSession)(parsed.sessionId, resumeOptions);

      return {
        success: true,
        mode: 'resume',
        sessionId: resumeData.sessionId,
        session_resumed: true,
        previous_session: resumeData.sessionId,
        active_files: resumeData.files,
        critical_context: resumeData.context,
        continuation_point: resumeData.checkpoint?.context || 'Continue from previous work',
        timeline: resumeData.timeline,
        formatted_response: this.formatter.formatResumeSession(resumeData)
      };

    } catch (error) {
      return {
        success: false,
        mode: 'resume',
        error: error.message,
        formatted_response: `❌ Resume failed: ${error.message}`
      };
    }
  }

  /**
   * Handle new session mode
   */
  async handleNewMode(parsed) {
    try {
      const context = parsed.context || 'Starting new work session';
      
      const sessionData = await (this.createSession || this.checkpointCore.createSession)(context);
      
      // Create initial checkpoint
      const checkpoint = await (this.createCheckpoint || this.checkpointCore.createCheckpoint)(
        context,
        parsed.files,
        'new',
        sessionData.id,
        { snippet: parsed.snippet }
      );

      return {
        success: true,
        mode: 'new',
        sessionId: sessionData.id,
        checkpoint: checkpoint,
        context: context,
        files: parsed.files,
        formatted_response: this.formatter.formatNewSession(sessionData, checkpoint)
      };

    } catch (error) {
      return {
        success: false,
        mode: 'new',
        error: error.message,
        formatted_response: `❌ New session failed: ${error.message}`
      };
    }
  }

  /**
   * Handle final checkpoint mode
   */
  async handleFinalMode(parsed) {
    try {
      const context = parsed.context || 'Session completion';
      
      // Need session ID for final checkpoint
      if (!parsed.sessionId) {
        throw new Error('Session ID required for final checkpoint. Use --session=<id>');
      }

      const finalResult = await (this.createFinalCheckpoint || this.checkpointCore.createFinalCheckpoint)(
        parsed.sessionId,
        context,
        parsed.files,
        { snippet: parsed.snippet }
      );

      return {
        success: true,
        mode: 'final',
        sessionId: parsed.sessionId,
        checkpoint: finalResult.checkpoint,
        rollup: finalResult.rollup,
        session_completed: true,
        formatted_response: this.formatter.formatFinalCheckpoint(finalResult)
      };

    } catch (error) {
      return {
        success: false,
        mode: 'final',
        error: error.message,
        formatted_response: `❌ Final checkpoint failed: ${error.message}`
      };
    }
  }

  /**
   * Handle progress checkpoint mode (default)
   */
  async handleProgressMode(parsed) {
    try {
      const context = parsed.context || 'Progress checkpoint';
      
      const checkpoint = await (this.createCheckpoint || this.checkpointCore.createCheckpoint)(
        context,
        parsed.files,
        'progress',
        parsed.sessionId,  // FIX: Pass session ID if provided
        { snippet: parsed.snippet }
      );

      return {
        success: true,
        mode: 'progress',
        sessionId: checkpoint.sessionId,
        checkpoint: checkpoint,
        context: context,
        files: parsed.files,
        formatted_response: this.formatter.formatProgressCheckpoint(checkpoint)
      };

    } catch (error) {
      return {
        success: false,
        mode: 'progress',
        error: error.message,
        formatted_response: `❌ Progress checkpoint failed: ${error.message}`
      };
    }
  }

  /**
   * Handle help for checkpoint command
   */
  handleHelp() {
    const helpText = `
📋 Checkpoint Command Help

Usage:
  lev checkpoint [context]                    Create progress checkpoint
  lev checkpoint --new [context]             Start new session
  lev checkpoint --resume [--session=<id>]   Resume previous session  
  lev checkpoint --final --session=<id>      Finalize session

Modes:
  --new            Start fresh session with new checkpoint
  --resume         Load previous session context and timeline
  --final          Create final checkpoint and session rollup
  (default)        Create progress checkpoint during active work

Options:
  --session=<id>   Specific session ID to target
  --files=<list>   Comma-separated list of files
  --snippet=<ref>  Code snippet reference (file:lines)
  --context=<ctx>  Explicit context description
  --help           Show this help

Examples:
  lev checkpoint "completed feature X"
  lev checkpoint --resume --session "2025-06-17-session-abc123"
  lev checkpoint --new "starting new refactor"
  lev checkpoint --final --session "2025-06-17-session-abc123" "refactor complete"
  lev checkpoint --files="src/app.js,src/utils.js" "updated core modules"
`;

    return {
      success: true,
      help: true,
      formatted_response: helpText.trim()
    };
  }
}