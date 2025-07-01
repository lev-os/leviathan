/**
 * Debug Logger - Silent file-based logging for debugging without confusing LLMs
 * Writes detailed error information to debug files instead of stdout
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DebugLogger {
  constructor() {
    this.logDir = path.join(__dirname, '../../../logs');
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      // Silently fail if can't create log directory
    }
  }

  async logError(component, error, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        component,
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        context
      };

      const logFile = path.join(this.logDir, `${component}-errors.log`);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      await fs.appendFile(logFile, logLine);
    } catch (logError) {
      // Silently fail to avoid recursive logging issues
    }
  }

  async logInfo(component, message, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        component,
        level: 'info',
        message,
        context
      };

      const logFile = path.join(this.logDir, `${component}.log`);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      await fs.appendFile(logFile, logLine);
    } catch (logError) {
      // Silently fail
    }
  }

  async logWarning(component, message, context = {}) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        component,
        level: 'warning',
        message,
        context
      };

      const logFile = path.join(this.logDir, `${component}-warnings.log`);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      await fs.appendFile(logFile, logLine);
    } catch (logError) {
      // Silently fail
    }
  }

  // Clean console output while detailed logging goes to files
  async cleanLog(message) {
    console.log(message);
  }

  async cleanWarn(message) {
    console.log(`ℹ️  ${message}`);
  }

  async cleanError(message) {
    console.log(`⚠️  ${message}`);
  }
}

export const debugLogger = new DebugLogger();