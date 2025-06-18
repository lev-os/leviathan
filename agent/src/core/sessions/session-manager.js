/**
 * Session Manager - Core session lifecycle management
 * Pure business logic for session creation, loading, and coordination
 * Part of Leviathan Core SDK
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

/**
 * Create a new session with context and workspace
 * @param {string} context - Session context description
 * @param {string} workspace - Workspace identifier
 * @param {Object} options - Session options
 * @returns {Promise<Object>} Session data
 */
export async function createSession(context, workspace = 'default', options = {}) {
  const { sessionId = generateSessionId(), metadata = {} } = options;
  
  try {
    const sessionData = {
      id: sessionId,
      context: context,
      workspace: workspace,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: 'active',
      checkpoints: [],
      metadata: metadata
    };
    
    // Save session
    await saveSession(sessionData);
    
    return sessionData;
    
  } catch (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }
}

/**
 * Load existing session by ID
 * @param {string} sessionId - Session identifier
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} Session data
 */
export async function loadSession(sessionId, options = {}) {
  const { includeCheckpoints = true } = options;
  
  try {
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
    
    // Load checkpoints if requested
    if (includeCheckpoints && sessionData.checkpoints) {
      sessionData.loadedCheckpoints = await loadSessionCheckpoints(sessionId);
    }
    
    return sessionData;
    
  } catch (error) {
    throw new Error(`Failed to load session: ${error.message}`);
  }
}

/**
 * Update session activity and context
 * @param {string} sessionId - Session identifier
 * @param {Object} activity - Activity data
 * @returns {Promise<Object>} Updated session
 */
export async function updateSessionActivity(sessionId, activity) {
  try {
    const session = await loadSession(sessionId, { includeCheckpoints: false });
    
    session.lastActivity = Date.now();
    session.context = activity.context || session.context;
    
    if (activity.files) {
      session.activeFiles = activity.files;
    }
    
    if (activity.progress) {
      session.progress = activity.progress;
    }
    
    await saveSession(session);
    
    return session;
    
  } catch (error) {
    throw new Error(`Failed to update session activity: ${error.message}`);
  }
}

/**
 * Register a new session in the active sessions tracking
 * @param {string} sessionId - Session identifier
 * @param {Object} sessionData - Session registration data
 * @returns {Promise<void>}
 */
export async function registerSession(sessionId, sessionData) {
  try {
    const activeSessions = await loadActiveSessions();
    
    activeSessions.set(sessionId, {
      agent: sessionData.agent || 'unknown',
      workspace: sessionData.workspace || 'default',
      network_intelligence: sessionData.network_intelligence || false,
      registeredAt: Date.now(),
      lastSeen: Date.now()
    });
    
    await saveActiveSessions(activeSessions);
    
  } catch (error) {
    throw new Error(`Failed to register session: ${error.message}`);
  }
}

/**
 * Get all active sessions
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of active sessions
 */
export async function getActiveSessions(options = {}) {
  const { workspace = null, agent = null } = options;
  
  try {
    const activeSessions = await loadActiveSessions();
    let sessions = Array.from(activeSessions.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
    
    // Apply filters
    if (workspace) {
      sessions = sessions.filter(s => s.workspace === workspace);
    }
    
    if (agent) {
      sessions = sessions.filter(s => s.agent === agent);
    }
    
    return sessions.sort((a, b) => b.lastSeen - a.lastSeen);
    
  } catch (error) {
    throw new Error(`Failed to get active sessions: ${error.message}`);
  }
}

/**
 * Detect current workspace from environment
 * @returns {string} Workspace identifier
 */
export function detectWorkspace() {
  try {
    // Try to detect from git repo
    const cwd = process.cwd();
    const gitDir = findGitRepository(cwd);
    
    if (gitDir) {
      return path.basename(path.dirname(gitDir));
    }
    
    // Fall back to current directory name
    return path.basename(cwd);
    
  } catch (error) {
    return 'unknown';
  }
}

/**
 * List recent sessions with optional filtering
 * @param {Object} options - Listing options
 * @returns {Promise<Array>} Array of session summaries
 */
export async function listRecentSessions(options = {}) {
  const { limit = 10, workspace = null, daysBack = 7 } = options;
  
  try {
    const sessionsDir = getSessionsDirectory();
    
    if (!fs.existsSync(sessionsDir)) {
      return [];
    }
    
    const sessionFiles = fs.readdirSync(sessionsDir)
      .filter(file => file.endsWith('.yaml'))
      .map(file => path.join(sessionsDir, file));
    
    const sessions = [];
    const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    
    for (const sessionFile of sessionFiles) {
      try {
        const content = fs.readFileSync(sessionFile, 'utf-8');
        const sessionData = yaml.load(content);
        
        if (sessionData && sessionData.lastActivity > cutoffTime) {
          // Apply workspace filter
          if (!workspace || sessionData.workspace === workspace) {
            sessions.push({
              id: sessionData.id,
              context: sessionData.context,
              workspace: sessionData.workspace,
              createdAt: sessionData.createdAt,
              lastActivity: sessionData.lastActivity,
              checkpointCount: sessionData.checkpoints?.length || 0
            });
          }
        }
      } catch (error) {
        // Skip invalid session files
        console.warn(`Skipping invalid session file: ${sessionFile}`);
      }
    }
    
    return sessions
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, limit);
    
  } catch (error) {
    throw new Error(`Failed to list recent sessions: ${error.message}`);
  }
}

// Helper Functions

/**
 * Generate unique session ID
 */
function generateSessionId() {
  const timestamp = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-session-${random}`;
}

/**
 * Get sessions directory path
 */
function getSessionsDirectory() {
  return path.join(os.homedir(), '.leviathan', 'sessions');
}

/**
 * Save session data to file
 */
async function saveSession(sessionData) {
  const sessionsDir = getSessionsDirectory();
  
  // Ensure directory exists
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  
  const sessionPath = path.join(sessionsDir, `${sessionData.id}.yaml`);
  const yamlContent = yaml.dump(sessionData, { 
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  
  fs.writeFileSync(sessionPath, yamlContent);
}

/**
 * Load active sessions tracking
 */
async function loadActiveSessions() {
  const sessionsDir = getSessionsDirectory();
  const activeSessionsPath = path.join(sessionsDir, 'active-sessions.yaml');
  
  if (!fs.existsSync(activeSessionsPath)) {
    return new Map();
  }
  
  try {
    const content = fs.readFileSync(activeSessionsPath, 'utf-8');
    const data = yaml.load(content) || {};
    
    return new Map(Object.entries(data));
  } catch (error) {
    console.warn('Failed to load active sessions, starting fresh');
    return new Map();
  }
}

/**
 * Save active sessions tracking
 */
async function saveActiveSessions(activeSessions) {
  const sessionsDir = getSessionsDirectory();
  
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
  
  const activeSessionsPath = path.join(sessionsDir, 'active-sessions.yaml');
  const data = Object.fromEntries(activeSessions);
  
  const yamlContent = yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  
  fs.writeFileSync(activeSessionsPath, yamlContent);
}

/**
 * Load session checkpoints
 */
async function loadSessionCheckpoints(sessionId) {
  const sessionsDir = getSessionsDirectory();
  const checkpointPath = path.join(sessionsDir, 'checkpoints', `${sessionId}-checkpoints.yaml`);
  
  if (!fs.existsSync(checkpointPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(checkpointPath, 'utf-8');
    const checkpoints = yaml.load(content);
    
    return Array.isArray(checkpoints) ? checkpoints : [];
  } catch (error) {
    console.warn(`Failed to load checkpoints for session ${sessionId}: ${error.message}`);
    return [];
  }
}

/**
 * Find git repository directory
 */
function findGitRepository(startPath) {
  let currentPath = startPath;
  
  while (currentPath !== path.dirname(currentPath)) {
    const gitPath = path.join(currentPath, '.git');
    
    if (fs.existsSync(gitPath)) {
      return gitPath;
    }
    
    currentPath = path.dirname(currentPath);
  }
  
  return null;
}