// Universal logger for Kingly ecosystem
import winston from 'winston';

class KinglyLogger {
  constructor() {
    this.winston = null;
    this.config = null;
  }

  async configure(config) {
    this.config = config;
    
    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true })
    ];

    // Add structured formatting based on config
    if (config.outputFormat === 'json') {
      formats.push(winston.format.json());
    } else if (config.outputFormat === 'structured') {
      formats.push(winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
      }));
    } else {
      formats.push(winston.format.simple());
    }

    this.winston = winston.createLogger({
      level: config.logLevel,
      format: winston.format.combine(...formats),
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true
        })
      ]
    });
  }

  // Standard logging methods
  debug(message, meta = {}) {
    this.winston?.debug(message, this._enrichMeta(meta));
  }

  info(message, meta = {}) {
    this.winston?.info(message, this._enrichMeta(meta));
  }

  warn(message, meta = {}) {
    this.winston?.warn(message, this._enrichMeta(meta));
  }

  error(message, meta = {}) {
    this.winston?.error(message, this._enrichMeta(meta));
  }

  // Kingly-specific logging methods
  plugin(pluginName, message, meta = {}) {
    this.info(message, { ...meta, plugin: pluginName, type: 'plugin' });
  }

  llm(message, meta = {}) {
    this.info(message, { ...meta, type: 'llm-reasoning' });
  }

  command(command, message, meta = {}) {
    this.info(message, { ...meta, command, type: 'command' });
  }

  workflow(workflowName, message, meta = {}) {
    this.info(message, { ...meta, workflow: workflowName, type: 'workflow' });
  }

  // Enrich metadata with system context
  _enrichMeta(meta) {
    return {
      ...meta,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      // Add session context if available
      ...(global.kinglySession && { sessionId: global.kinglySession.id })
    };
  }
}

// Singleton instance
export const logger = new KinglyLogger();