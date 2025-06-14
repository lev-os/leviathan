// Event tracing for Kingly plugin and command execution
import { v4 as uuidv4 } from 'uuid';

class KinglyTracer {
  constructor() {
    this.traces = new Map();
    this.config = null;
  }

  async configure(config) {
    this.config = config;
  }

  // Start a new trace
  start(operation, metadata = {}) {
    if (!this.config?.traceEnabled) {
      return new NoOpTrace();
    }

    const traceId = uuidv4();
    const trace = new Trace(traceId, operation, metadata);
    this.traces.set(traceId, trace);
    
    return trace;
  }

  // Get trace by ID
  getTrace(traceId) {
    return this.traces.get(traceId);
  }

  // Get all traces (for debugging)
  getAllTraces() {
    return Array.from(this.traces.values());
  }

  // Get recent traces
  getRecentTraces(limit = 100) {
    return Array.from(this.traces.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  // Clean up old traces
  cleanup(maxAge = 300000) { // 5 minutes default
    const cutoff = Date.now() - maxAge;
    for (const [id, trace] of this.traces) {
      if (trace.startTime < cutoff) {
        this.traces.delete(id);
      }
    }
  }
}

class Trace {
  constructor(id, operation, metadata = {}) {
    this.id = id;
    this.operation = operation;
    this.metadata = metadata;
    this.startTime = Date.now();
    this.endTime = null;
    this.events = [];
    this.status = 'active';
  }

  // Add event to trace
  addEvent(eventName, data = {}) {
    this.events.push({
      name: eventName,
      data,
      timestamp: Date.now(),
      relativeTime: Date.now() - this.startTime
    });
    return this;
  }

  // End the trace
  end(result = {}) {
    this.endTime = Date.now();
    this.status = result.error ? 'error' : 'completed';
    this.result = result;
    
    this.addEvent('trace-ended', {
      duration: this.duration(),
      status: this.status,
      ...result
    });
    
    return this;
  }

  // Get trace duration
  duration() {
    return (this.endTime || Date.now()) - this.startTime;
  }

  // Export trace data
  toJSON() {
    return {
      id: this.id,
      operation: this.operation,
      metadata: this.metadata,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration(),
      status: this.status,
      events: this.events,
      result: this.result
    };
  }
}

// No-op trace for when tracing is disabled
class NoOpTrace {
  addEvent() { return this; }
  end() { return this; }
  duration() { return 0; }
  toJSON() { return null; }
}

// Singleton instance
export const tracer = new KinglyTracer();