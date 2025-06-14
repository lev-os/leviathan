// Job system integration for workflow orchestration
import { logger, tracer, monitor } from '@kingly/debug';

class KinglyJobIntegration {
  constructor() {
    this.config = null;
    this.jobQueue = new Map();
    this.activeJobs = new Map();
  }

  async configure(config) {
    this.config = config;
    if (config.jobIntegrationEnabled) {
      logger.info('Job integration enabled', { config });
    }
  }

  // Execute command as part of job workflow
  async executeJob(jobId, command, args = [], options = {}) {
    if (!this.config?.jobIntegrationEnabled) {
      throw new Error('Job integration not enabled');
    }

    const trace = tracer.start('job-execution', { jobId, command, args });
    
    try {
      // Check if job already running
      if (this.activeJobs.has(jobId)) {
        throw new Error(`Job already active: ${jobId}`);
      }

      const job = {
        id: jobId,
        command,
        args,
        startTime: Date.now(),
        status: 'running',
        trace,
        options
      };

      this.activeJobs.set(jobId, job);
      trace.addEvent('job-started', { jobId, command });
      
      logger.info('Job execution started', { jobId, command, args });

      // Import process manager for execution
      const { processManager } = await import('./process-manager.js');
      
      // Execute command with job context
      const result = await processManager.execute(command, args, {
        ...options,
        env: {
          ...options.env,
          KINGLY_JOB_ID: jobId,
          KINGLY_JOB_START: job.startTime.toString()
        }
      });

      // Update job status
      job.status = 'completed';
      job.endTime = Date.now();
      job.result = result;

      trace.addEvent('job-completed', { 
        jobId, 
        duration: job.endTime - job.startTime,
        success: result.success 
      });

      monitor.trackCommand(`job:${command}`, {
        success: result.success,
        duration: job.endTime - job.startTime
      });

      logger.info('Job execution completed', { 
        jobId, 
        duration: job.endTime - job.startTime,
        success: result.success 
      });

      // Move to completed jobs (keep for tracking)
      this.activeJobs.delete(jobId);
      this.jobQueue.set(jobId, job);

      trace.end({ success: true, result });
      return result;

    } catch (error) {
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.endTime = Date.now();
        job.error = error.message;
        this.activeJobs.delete(jobId);
        this.jobQueue.set(jobId, job);
      }

      trace.addEvent('job-error', { jobId, error: error.message });
      trace.end({ success: false, error: error.message });
      
      logger.error('Job execution failed', { jobId, error: error.message });
      throw error;
    }
  }

  // Get job status
  getJobStatus(jobId) {
    // Check active jobs first
    const activeJob = this.activeJobs.get(jobId);
    if (activeJob) {
      return {
        id: jobId,
        status: activeJob.status,
        command: activeJob.command,
        startTime: activeJob.startTime,
        duration: Date.now() - activeJob.startTime,
        isActive: true
      };
    }

    // Check completed jobs
    const completedJob = this.jobQueue.get(jobId);
    if (completedJob) {
      return {
        id: jobId,
        status: completedJob.status,
        command: completedJob.command,
        startTime: completedJob.startTime,
        endTime: completedJob.endTime,
        duration: completedJob.endTime - completedJob.startTime,
        isActive: false,
        result: completedJob.result,
        error: completedJob.error
      };
    }

    return null;
  }

  // List all jobs
  listJobs() {
    const active = Array.from(this.activeJobs.values()).map(job => ({
      id: job.id,
      status: job.status,
      command: job.command,
      startTime: job.startTime,
      duration: Date.now() - job.startTime,
      isActive: true
    }));

    const completed = Array.from(this.jobQueue.values()).map(job => ({
      id: job.id,
      status: job.status,
      command: job.command,
      startTime: job.startTime,
      endTime: job.endTime,
      duration: job.endTime - job.startTime,
      isActive: false
    }));

    return {
      active,
      completed: completed.slice(-50), // Last 50 completed jobs
      summary: {
        activeCount: active.length,
        completedCount: completed.length,
        totalCount: active.length + completed.length
      }
    };
  }

  // Kill active job
  async killJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Active job not found: ${jobId}`);
    }

    const trace = tracer.start('job-kill', { jobId });
    
    try {
      logger.info('Killing job', { jobId });
      
      // Import process manager to kill process
      const { processManager } = await import('./process-manager.js');
      
      // Find and kill process (this is simplified - would need better tracking)
      const processes = processManager.getProcesses();
      const jobProcess = processes.find(p => 
        p.command === job.command && 
        Math.abs(p.startTime - job.startTime) < 1000 // Within 1 second
      );

      if (jobProcess) {
        await processManager.killProcess(jobProcess.id);
      }

      // Update job status
      job.status = 'killed';
      job.endTime = Date.now();
      this.activeJobs.delete(jobId);
      this.jobQueue.set(jobId, job);

      trace.addEvent('job-killed', { jobId });
      trace.end({ success: true });
      
      logger.info('Job killed successfully', { jobId });

    } catch (error) {
      trace.addEvent('kill-error', { error: error.message });
      trace.end({ success: false, error: error.message });
      throw error;
    }
  }

  // Cleanup old completed jobs
  cleanup(maxAge = 3600000) { // 1 hour default
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;
    
    for (const [jobId, job] of this.jobQueue) {
      if (job.endTime && job.endTime < cutoff) {
        this.jobQueue.delete(jobId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('Cleaned up old jobs', { count: cleaned });
    }
  }
}

// Singleton instance
export const jobIntegration = new KinglyJobIntegration();