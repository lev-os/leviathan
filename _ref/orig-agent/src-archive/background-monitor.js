/**
 * Background Process Monitor - Unified checking for all background processes
 * Monitors: spawns, research tickets, and future async operations
 */

export class BackgroundMonitor {
  constructor() {
    this.monitors = new Map();
  }
  
  // Register a monitor function
  register(name, checkFunction) {
    this.monitors.set(name, {
      name,
      check: checkFunction,
      lastCheck: null,
      results: []
    });
  }
  
  // Check all registered monitors
  async checkAll() {
    const results = {
      timestamp: new Date().toISOString(),
      completed: [],
      pending: [],
      failed: []
    };
    
    for (const [name, monitor] of this.monitors) {
      try {
        const status = await monitor.check();
        monitor.lastCheck = Date.now();
        
        // Debug logging
        if (process.env.DEBUG_MONITOR) {
          console.log(`[Monitor ${name}]:`, status);
        }
        
        if (status.completed?.length > 0) {
          results.completed.push({
            type: name,
            items: status.completed
          });
        }
        
        if (status.pending?.length > 0) {
          results.pending.push({
            type: name,
            count: status.pending.length,
            items: status.pending
          });
        }
        
        if (status.failed?.length > 0) {
          results.failed.push({
            type: name,
            items: status.failed
          });
        }
      } catch (error) {
        console.error(`Monitor ${name} error:`, error);
      }
    }
    
    return results;
  }
  
  // Format status for agent instructions
  formatStatus(results) {
    const updates = [];
    
    // Completed items
    if (results.completed.length > 0) {
      updates.push('\n⚡ BACKGROUND UPDATES:');
      results.completed.forEach(group => {
        group.items.forEach(item => {
          if (group.type === 'spawn') {
            updates.push(`✅ Spawn ${item.id} completed! Use: get_spawn_result({ spawnId: "${item.id}" })`);
          } else if (group.type === 'research') {
            updates.push(`✅ Research ${item.ticketId} completed! Results available.`);
          }
        });
      });
    }
    
    // Pending summary
    if (results.pending.length > 0) {
      const total = results.pending.reduce((sum, g) => sum + g.count, 0);
      updates.push(`\n⏳ ${total} background processes still running`);
    }
    
    return updates.length > 0 ? updates.join('\n') : '';
  }
}

// Plugin for MCP pipeline
export const backgroundMonitorPlugin = {
  name: 'background-monitor',
  priority: 95, // Run early
  pre: async (context) => {
    const monitor = context.backgroundMonitor;
    if (!monitor) return;
    
    const status = await monitor.checkAll();
    
    // Store in context for other plugins
    context.backgroundStatus = status;
  },
  post: async (context) => {
    const monitor = context.backgroundMonitor;
    const status = context.backgroundStatus;
    
    if (!monitor || !status) return;
    
    // Add to result if we have updates
    if (status.completed.length > 0 && context.result) {
      const updates = monitor.formatStatus(status);
      if (updates && context.result.agentInstructions) {
        context.result.agentInstructions += updates;
      }
      
      // Also add to message for visibility
      if (context.result.message) {
        const count = status.completed.reduce((sum, g) => sum + g.items.length, 0);
        context.result.message += ` (${count} background tasks completed!)`;
      }
    }
  }
};

export default BackgroundMonitor;