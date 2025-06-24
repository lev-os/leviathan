/**
 * Simple Logger - Temporary replacement for @lev/debug
 * 
 * Provides basic logging functionality for testing framework
 * until @lev/debug dependencies are installed.
 */

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${message}`, meta);
  },
  
  debug: (message, meta = {}) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${message}`, meta);
    }
  },
  
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${message}`, meta);
  }
};

export const tracer = {
  startSpan: (name, attributes = {}) => {
    return {
      setStatus: () => {},
      end: () => {}
    };
  }
};

export const monitor = {
  track: () => {}
};