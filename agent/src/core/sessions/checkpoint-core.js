/**
 * Checkpoint Core - Session checkpoint creation and management
 * Pure business logic for checkpoint creation, resumption, and session continuity
 * Part of Leviathan Core SDK
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

/**
 * Create a checkpoint for a session
 * @param {string} context - Checkpoint context description
 * @param {Array} files - Files related to checkpoint
 * @param {string} mode - Checkpoint mode ('progress', 'new', 'resume', 'final')
 * @param {string|null} sessionId - Specific session ID (for --session support)
 * @param {Object} options - Checkpoint options
 * @returns {Promise<Object>} Checkpoint data
 */
export async function createCheckpoint(context, files = [], mode = 'progress', sessionId = null, options = {}) {
  const { snippet = null, workspace = null } = options;
  
  try {
    // Determine target session
    const targetSessionId = sessionId || generateSessionId();
    
    // Create checkpoint data
    const checkpoint = {
      id: generateCheckpointId(),
      sessionId: targetSessionId,
      context: context,
      files: Array.isArray(files) ? files : [],
      mode: mode,
      snippet: snippet,
      workspace: workspace || detectWorkspace(),
      createdAt: Date.now(),
      metadata: extractCheckpointMetadata(context, files)
    };
    
    // Save checkpoint
    await saveCheckpoint(checkpoint);
    
    // Update session with checkpoint reference
    await addCheckpointToSession(targetSessionId, checkpoint.id);
    
    return checkpoint;
    
  } catch (error) {
    throw new Error(`Failed to create checkpoint: ${error.message}`);
  }
}

/**
 * Resume session from specific session ID or latest checkpoint
 * @param {string|null} sessionId - Specific session ID to resume (null for latest)
 * @param {Object} options - Resume options
 * @returns {Promise<Object>} Resume data with context and timeline
 */
export async function resumeSession(sessionId = null, options = {}) {
  const { includeTimeline = true, workspace = null } = options;
  
  try {
    let targetSessionId = sessionId;
    
    // If no session ID provided, find the latest session
    if (!targetSessionId) {
      targetSessionId = await findLatestSession(workspace);
      if (!targetSessionId) {
        throw new Error('No previous sessions found to resume');
      }
    }
    
    // Load session data
    const sessionData = await loadSessionData(targetSessionId);
    
    // Load latest checkpoint for session
    const latestCheckpoint = await loadLatestCheckpoint(targetSessionId);
    
    // Build resume context
    const resumeData = {
      sessionId: targetSessionId,
      session: sessionData,
      checkpoint: latestCheckpoint,
      context: latestCheckpoint?.context || sessionData.context,
      files: latestCheckpoint?.files || sessionData.activeFiles || [],
      workspace: sessionData.workspace,
      resumedAt: Date.now()
    };
    
    // Add cross-session timeline if requested
    if (includeTimeline) {
      resumeData.timeline = await loadCrossSessionTimeline(workspace);
    }
    
    return resumeData;
    
  } catch (error) {
    throw new Error(`Failed to resume session: ${error.message}`);
  }
}

/**
 * Create final checkpoint for session completion
 * @param {string} sessionId - Session to finalize
 * @param {string} context - Final context summary
 * @param {Array} files - Final files list
 * @param {Object} options - Final checkpoint options
 * @returns {Promise<Object>} Final checkpoint and rollup data
 */
export async function createFinalCheckpoint(sessionId, context, files = [], options = {}) {
  try {
    // Create final checkpoint
    const finalCheckpoint = await createCheckpoint(
      context, 
      files, 
      'final', 
      sessionId, 
      options
    );
    
    // Generate session rollup
    const rollup = await generateSessionRollup(sessionId, finalCheckpoint);
    
    // Mark session as completed
    await updateSessionStatus(sessionId, 'completed');
    
    return {
      checkpoint: finalCheckpoint,
      rollup: rollup,
      sessionCompleted: true
    };
    
  } catch (error) {
    throw new Error(`Failed to create final checkpoint: ${error.message}`);
  }
}

/**
 * Load checkpoint by ID
 * @param {string} checkpointId - Checkpoint identifier
 * @returns {Promise<Object>} Checkpoint data
 */
export async function loadCheckpoint(checkpointId) {
  try {
    const checkpointsDir = getCheckpointsDirectory();
    const checkpointPath = path.join(checkpointsDir, `${checkpointId}.yaml`);
    
    if (!fs.existsSync(checkpointPath)) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }
    
    const content = fs.readFileSync(checkpointPath, 'utf-8');
    const checkpoint = yaml.load(content);
    
    if (!checkpoint) {
      throw new Error(`Invalid checkpoint data: ${checkpointId}`);
    }
    
    return checkpoint;
    
  } catch (error) {
    throw new Error(`Failed to load checkpoint: ${error.message}`);
  }
}

/**
 * List checkpoints for a session
 * @param {string} sessionId - Session identifier
 * @param {Object} options - Listing options
 * @returns {Promise<Array>} Array of checkpoint summaries
 */
export async function listSessionCheckpoints(sessionId, options = {}) {
  const { limit = 10, mode = null } = options;
  
  try {
    const checkpointsDir = getCheckpointsDirectory();
    
    if (!fs.existsSync(checkpointsDir)) {
      return [];
    }
    
    const checkpointFiles = fs.readdirSync(checkpointsDir)
      .filter(file => file.endsWith('.yaml') && file.includes(sessionId))
      .map(file => path.join(checkpointsDir, file));
    
    const checkpoints = [];
    
    for (const checkpointFile of checkpointFiles) {
      try {
        const content = fs.readFileSync(checkpointFile, 'utf-8');
        const checkpoint = yaml.load(content);
        
        if (checkpoint && checkpoint.sessionId === sessionId) {
          // Apply mode filter
          if (!mode || checkpoint.mode === mode) {
            checkpoints.push({
              id: checkpoint.id,
              context: checkpoint.context,
              mode: checkpoint.mode,
              createdAt: checkpoint.createdAt,
              fileCount: checkpoint.files?.length || 0
            });
          }
        }
      } catch (error) {
        // Skip invalid checkpoint files
        console.warn(`Skipping invalid checkpoint file: ${checkpointFile}`);
      }
    }
    
    return checkpoints
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
    
  } catch (error) {
    throw new Error(`Failed to list session checkpoints: ${error.message}`);
  }
}

/**
 * Generate session rollup from checkpoints
 * @param {string} sessionId - Session identifier
 * @param {Object} finalCheckpoint - Final checkpoint data
 * @returns {Promise<Object>} Session rollup
 */
export async function generateSessionRollup(sessionId, finalCheckpoint) {
  try {
    const checkpoints = await listSessionCheckpoints(sessionId, { limit: 100 });
    
    const rollup = {
      sessionId: sessionId,
      generatedAt: Date.now(),
      checkpointCount: checkpoints.length,
      timespan: {
        start: checkpoints[checkpoints.length - 1]?.createdAt || Date.now(),
        end: finalCheckpoint.createdAt
      },
      summary: generateTimelineSummary(checkpoints),
      keyFiles: extractKeyFiles(checkpoints),
      progression: generateProgressionNarrative(checkpoints),
      finalContext: finalCheckpoint.context
    };
    
    // Save rollup
    await saveSessionRollup(sessionId, rollup);
    
    return rollup;
    
  } catch (error) {
    throw new Error(`Failed to generate session rollup: ${error.message}`);
  }
}

// Helper Functions

/**
 * Generate unique checkpoint ID
 */
function generateCheckpointId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `checkpoint-${timestamp}-${random}`;
}

/**
 * Generate session ID
 */
function generateSessionId() {
  const timestamp = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-session-${random}`;
}

/**
 * Detect current workspace
 */
function detectWorkspace() {
  try {
    const cwd = process.cwd();
    return path.basename(cwd);
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get checkpoints directory
 */
function getCheckpointsDirectory() {
  return path.join(os.homedir(), '.leviathan', 'checkpoints');
}

/**
 * Get sessions directory
 */
function getSessionsDirectory() {
  return path.join(os.homedir(), '.leviathan', 'sessions');
}

/**
 * Save checkpoint to file
 */
async function saveCheckpoint(checkpoint) {
  const checkpointsDir = getCheckpointsDirectory();
  
  if (!fs.existsSync(checkpointsDir)) {
    fs.mkdirSync(checkpointsDir, { recursive: true });
  }
  
  const checkpointPath = path.join(checkpointsDir, `${checkpoint.id}.yaml`);
  const yamlContent = yaml.dump(checkpoint, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  
  fs.writeFileSync(checkpointPath, yamlContent);
}

/**
 * Add checkpoint reference to session
 */
async function addCheckpointToSession(sessionId, checkpointId) {
  try {
    const sessionsDir = getSessionsDirectory();
    const sessionPath = path.join(sessionsDir, `${sessionId}.yaml`);
    
    let sessionData;
    
    if (fs.existsSync(sessionPath)) {
      const content = fs.readFileSync(sessionPath, 'utf-8');
      sessionData = yaml.load(content) || {};
    } else {
      sessionData = {
        id: sessionId,
        createdAt: Date.now(),
        checkpoints: []
      };
    }
    
    if (!sessionData.checkpoints) {
      sessionData.checkpoints = [];
    }
    
    sessionData.checkpoints.push(checkpointId);
    sessionData.lastActivity = Date.now();
    
    const yamlContent = yaml.dump(sessionData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });
    
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    fs.writeFileSync(sessionPath, yamlContent);
    
  } catch (error) {
    console.warn(`Failed to add checkpoint to session: ${error.message}`);
  }
}

/**
 * Find latest session
 */
async function findLatestSession(workspace = null) {
  try {
    const sessionsDir = getSessionsDirectory();
    
    if (!fs.existsSync(sessionsDir)) {
      return null;
    }
    
    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(file => file.endsWith('.yaml') && file !== 'active-sessions.yaml');
    
    let latestSession = null;
    let latestTime = 0;
    
    for (const sessionFile of sessionFiles) {
      try {
        const content = fs.readFileSync(path.join(sessionsDir, sessionFile), 'utf-8');
        const sessionData = yaml.load(content);
        
        if (sessionData && sessionData.lastActivity > latestTime) {
          // Apply workspace filter if specified
          if (!workspace || sessionData.workspace === workspace) {
            latestSession = sessionData.id;
            latestTime = sessionData.lastActivity;
          }
        }
      } catch (error) {
        // Skip invalid session files
      }
    }
    
    return latestSession;
    
  } catch (error) {
    return null;
  }
}

/**
 * Load session data
 */
async function loadSessionData(sessionId) {
  const sessionsDir = getSessionsDirectory();
  const sessionPath = path.join(sessionsDir, `${sessionId}.yaml`);
  
  if (!fs.existsSync(sessionPath)) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  
  const content = fs.readFileSync(sessionPath, 'utf-8');
  const sessionData = yaml.load(content);
  
  if (!sessionData) {
    throw new Error(`Invalid session data: ${sessionId}`);
  }
  
  return sessionData;
}

/**
 * Load latest checkpoint for session
 */
async function loadLatestCheckpoint(sessionId) {
  try {
    const checkpoints = await listSessionCheckpoints(sessionId, { limit: 1 });
    
    if (checkpoints.length === 0) {
      return null;
    }
    
    return await loadCheckpoint(checkpoints[0].id);
    
  } catch (error) {
    console.warn(`Failed to load latest checkpoint for session ${sessionId}: ${error.message}`);
    return null;
  }
}

/**
 * Load cross-session timeline
 */
async function loadCrossSessionTimeline(workspace = null) {
  try {
    // This would implement the cross-session timeline logic
    // For now, return basic structure
    return {
      sessionCount: 0,
      timelineRange: 'No previous sessions',
      progressionSummary: 'Starting fresh',
      success: false
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update session status
 */
async function updateSessionStatus(sessionId, status) {
  try {
    const sessionData = await loadSessionData(sessionId);
    sessionData.status = status;
    sessionData.lastActivity = Date.now();
    
    const sessionsDir = getSessionsDirectory();
    const sessionPath = path.join(sessionsDir, `${sessionId}.yaml`);
    
    const yamlContent = yaml.dump(sessionData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });
    
    fs.writeFileSync(sessionPath, yamlContent);
    
  } catch (error) {
    console.warn(`Failed to update session status: ${error.message}`);
  }
}

/**
 * Extract checkpoint metadata
 */
function extractCheckpointMetadata(context, files) {
  return {
    contextLength: context?.length || 0,
    fileCount: files?.length || 0,
    hasSnippet: false, // Would check for code snippets
    complexity: assessContextComplexity(context, files)
  };
}

/**
 * Assess context complexity
 */
function assessContextComplexity(context, files) {
  let score = 0;
  
  if (context && context.length > 100) score += 1;
  if (files && files.length > 3) score += 1;
  if (context && /\b(implement|refactor|architecture)\b/i.test(context)) score += 1;
  
  return score >= 2 ? 'high' : score >= 1 ? 'medium' : 'low';
}

/**
 * Generate timeline summary
 */
function generateTimelineSummary(checkpoints) {
  if (checkpoints.length === 0) return 'No checkpoints';
  
  const duration = checkpoints[0].createdAt - checkpoints[checkpoints.length - 1].createdAt;
  const hours = Math.round(duration / (1000 * 60 * 60));
  
  return `${checkpoints.length} checkpoints over ${hours} hours`;
}

/**
 * Extract key files from checkpoints
 */
function extractKeyFiles(checkpoints) {
  const fileFreq = new Map();
  
  checkpoints.forEach(cp => {
    if (cp.files) {
      cp.files.forEach(file => {
        fileFreq.set(file, (fileFreq.get(file) || 0) + 1);
      });
    }
  });
  
  return Array.from(fileFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([file]) => file);
}

/**
 * Generate progression narrative
 */
function generateProgressionNarrative(checkpoints) {
  if (checkpoints.length === 0) return 'No progression';
  
  const phases = checkpoints.map(cp => cp.context.substring(0, 50));
  return phases.reverse().join(' → ');
}

/**
 * Save session rollup
 */
async function saveSessionRollup(sessionId, rollup) {
  const rollupsDir = path.join(os.homedir(), '.leviathan', 'rollups');
  
  if (!fs.existsSync(rollupsDir)) {
    fs.mkdirSync(rollupsDir, { recursive: true });
  }
  
  const rollupPath = path.join(rollupsDir, `${sessionId}-rollup.yaml`);
  const yamlContent = yaml.dump(rollup, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  
  fs.writeFileSync(rollupPath, yamlContent);
}