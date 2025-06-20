// @lev/cmd - Universal command runner and process management
// Main exports for process management, job integration, and git worktree operations

export { processManager } from './process-manager.js';
export { jobIntegration } from './job-integration.js';
export { worktreeManager } from './worktree-manager.js';

// Commands for hexagonal architecture
export { worktreeWizard } from './commands/worktree-wizard.js';
export { specImplement } from './commands/spec-implement.js';

// Default cmd instance for quick imports
import { processManager } from './process-manager.js';
import { jobIntegration } from './job-integration.js';
import { worktreeManager } from './worktree-manager.js';

export const cmd = {
  processManager,
  jobIntegration,
  worktreeManager
};

// Auto-configure cmd system
export async function initializeCmd(config = {}) {
  const defaultConfig = {
    processTimeout: parseInt(process.env.KINGLY_PROCESS_TIMEOUT) || 300000, // 5 minutes
    maxConcurrentProcesses: parseInt(process.env.KINGLY_MAX_PROCESSES) || 10,
    jobIntegrationEnabled: process.env.KINGLY_JOB_INTEGRATION !== 'false',
    worktreeBasePath: process.env.KINGLY_WORKTREE_PATH || './.worktrees'
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  await processManager.configure(finalConfig);
  await jobIntegration.configure(finalConfig);
  await worktreeManager.configure(finalConfig);
  
  // Import and use debug system
  const { logger } = await import('@lev/debug');
  logger.info('Kingly cmd system initialized', { config: finalConfig });
  
  return { processManager, jobIntegration, worktreeManager };
}