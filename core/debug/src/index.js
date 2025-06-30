// @lev/debug - Universal debugging system
// Main exports for all Kingly core packages and plugins

export { logger } from './logger.js';
export { tracer } from './tracer.js';
export { monitor } from './monitor.js';

// Default debug instance for quick imports
import { logger } from './logger.js';
import { tracer } from './tracer.js';
import { monitor } from './monitor.js';

export const debug = {
  logger,
  tracer,
  monitor
};

// Auto-configure debug system
export async function initializeDebug(config = {}) {
  const defaultConfig = {
    logLevel: process.env.KINGLY_LOG_LEVEL || 'info',
    traceEnabled: process.env.KINGLY_TRACE_ENABLED !== 'false',
    monitorEnabled: process.env.KINGLY_MONITOR_ENABLED !== 'false',
    outputFormat: process.env.KINGLY_OUTPUT_FORMAT || 'structured'
  };
  
  const finalConfig = { ...defaultConfig, ...config };
  
  await logger.configure(finalConfig);
  await tracer.configure(finalConfig);
  await monitor.configure(finalConfig);
  
  logger.info('Kingly debug system initialized', { config: finalConfig });
  
  return { logger, tracer, monitor };
}

// Auto-initialize if not already configured
if (!logger.winston) {
  initializeDebug().catch(error => {
    console.error('Failed to auto-initialize debug system:', error);
  });
}