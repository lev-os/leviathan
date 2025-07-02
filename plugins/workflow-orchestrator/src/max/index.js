/**
 * Max Prototype - Entry point for 24/7 AI Assistant
 * Integrates multi-modal memory fusion with research-based optimizations
 */

import { MultiModalMemoryFusion } from './memory-fusion.js';
import { VisualStateSpaceProcessor } from './visual-state-space.js';
import { EdgeMemoryManager } from './edge-memory.js';
import { ScreenpipeClient, RealScreenProcessor } from './screenpipe-integration.js';

export class Max {
  constructor(config = {}) {
    this.config = {
      // Research-based defaults
      temporalAlignment: 50, // 50ms audio-visual optimization
      compressionRatio: 0.91, // 91% DMC improvement
      latencyTarget: 500, // <500ms VSS processing
      privacyFirst: true, // Local-first processing
      ...config
    };

    // Initialize core components
    this.memoryFusion = new MultiModalMemoryFusion({
      temporalAlignment: this.config.temporalAlignment,
      compressionRatio: this.config.compressionRatio,
      edgeProcessor: this.config.privacyFirst
    });

    // Real Screenpipe integration
    this.screenpipeClient = new ScreenpipeClient({
      baseUrl: config.screenpipeUrl || 'http://localhost:3030'
    });
    
    this.realScreenProcessor = new RealScreenProcessor(this.screenpipeClient);

    // Fallback to mock processor for non-Screenpipe features
    this.visualProcessor = new VisualStateSpaceProcessor({
      latencyTarget: this.config.latencyTarget,
      elementRecognition: true,
      stateTracking: true
    });

    this.edgeMemory = new EdgeMemoryManager({
      localFirst: this.config.privacyFirst,
      privacyPreserving: true,
      cloudSync: false
    });

    // Performance monitoring
    this.metrics = {
      processedFrames: 0,
      averageLatency: 0,
      memoryQueries: 0,
      compressionRatio: 0
    };

    this.isActive = false;
  }

  async start() {
    if (this.isActive) {
      throw new Error('Max is already active');
    }

    console.log('🤖 Max starting up...');
    console.log('🧠 Initializing multi-modal memory fusion');
    console.log('👁️ Starting Visual State Space processing');
    console.log('🔒 Enabling privacy-preserving edge memory');

    this.isActive = true;
    return {
      status: 'active',
      timestamp: Date.now(),
      config: this.config
    };
  }

  async stop() {
    if (!this.isActive) {
      throw new Error('Max is not active');
    }

    console.log('🤖 Max shutting down...');
    
    // Perform cleanup
    await this._performShutdownCleanup();
    
    this.isActive = false;
    return {
      status: 'stopped',
      timestamp: Date.now(),
      finalMetrics: this.metrics
    };
  }

  async processMultiModalInput(streams) {
    if (!this.isActive) {
      throw new Error('Max is not active. Call start() first.');
    }

    const startTime = Date.now();
    const results = {};

    try {
      // Process each stream type
      if (streams.screen) {
        results.screen = await this._processScreenStream(streams.screen);
      }

      if (streams.audio) {
        results.audio = await this._processAudioStream(streams.audio);
      }

      if (streams.action) {
        results.action = await this._processActionStream(streams.action);
      }

      // Perform temporal alignment if multiple streams
      if (Object.keys(results).length > 1) {
        results.alignment = await this.memoryFusion.alignTemporalStreams(
          this.config.temporalAlignment
        );
      }

      // Store in edge memory
      const memoryResult = await this.edgeMemory.storeLocal({
        type: 'multi_modal_input',
        streams: results,
        timestamp: startTime
      });

      const processingTime = Date.now() - startTime;
      this._updateMetrics(processingTime);

      return {
        results,
        memoryId: memoryResult.id,
        processingTime,
        timestamp: startTime
      };
    } catch (error) {
      console.error('Error processing multi-modal input:', error);
      throw error;
    }
  }

  async queryMemory(query, options = {}) {
    if (!this.isActive) {
      throw new Error('Max is not active. Call start() first.');
    }

    const startTime = Date.now();
    this.metrics.memoryQueries++;

    try {
      // Query both fusion memory and edge memory
      const [fusionResults, edgeResults] = await Promise.all([
        this.memoryFusion.queryMemory(query, options.fuzzyMatch),
        this.edgeMemory.retrieveLocal(query, options.fuzzyMatch)
      ]);

      const queryTime = Date.now() - startTime;

      return {
        fusionResults,
        edgeResults,
        queryTime,
        query,
        totalResults: fusionResults.results.size + edgeResults.results.length
      };
    } catch (error) {
      console.error('Error querying memory:', error);
      throw error;
    }
  }

  async performMemoryCompression(memoryType = 'all') {
    if (!this.isActive) {
      throw new Error('Max is not active. Call start() first.');
    }

    const results = {};

    if (memoryType === 'all') {
      // Compress all memory types
      for (const type of ['procedural', 'semantic', 'temporal', 'working', 'episodic']) {
        results[type] = await this.memoryFusion.compressMemory(type, this.config.compressionRatio);
      }
    } else {
      results[memoryType] = await this.memoryFusion.compressMemory(memoryType, this.config.compressionRatio);
    }

    // Update compression metrics
    const avgCompression = Object.values(results)
      .reduce((sum, result) => sum + result.compressionRatio, 0) / Object.keys(results).length;
    
    this.metrics.compressionRatio = avgCompression;

    return {
      results,
      averageCompression: avgCompression,
      timestamp: Date.now()
    };
  }

  getStatus() {
    return {
      isActive: this.isActive,
      config: this.config,
      metrics: this.metrics,
      components: {
        memoryFusion: !!this.memoryFusion,
        visualProcessor: !!this.visualProcessor,
        edgeMemory: !!this.edgeMemory
      }
    };
  }

  getPerformanceMetrics() {
    return {
      ...this.metrics,
      visualProcessor: this.visualProcessor.getPerformanceMetrics(),
      edgeMemory: this.edgeMemory ? 'available' : 'unavailable'
    };
  }

  // Private helper methods
  async _processScreenStream(screenData) {
    try {
      // Use real Screenpipe data
      const captured = await this.realScreenProcessor.captureScreen();
      const processed = await this.realScreenProcessor.recognizeElements(captured);
      
      // Store in memory fusion
      await this.memoryFusion.ingestStream('screen', {
        ...processed,
        rawData: captured
      }, Date.now());
      
      return processed;
    } catch (error) {
      console.warn('Screenpipe not available, falling back to mock:', error.message);
      
      // Fallback to mock implementation
      const captured = await this.visualProcessor.captureScreen();
      const processed = await this.visualProcessor.processFrame(captured);
      
      await this.memoryFusion.ingestStream('screen', processed, Date.now());
      return processed;
    }
  }

  async _processAudioStream(audioData) {
    // Mock audio processing (to be implemented)
    const processed = {
      transcript: 'mock transcript',
      confidence: 0.95,
      timestamp: Date.now()
    };
    
    // Store in memory fusion
    await this.memoryFusion.ingestStream('audio', processed, Date.now());
    
    return processed;
  }

  async _processActionStream(actionData) {
    // Mock action processing (to be implemented)
    const processed = {
      action: actionData.type || 'unknown',
      coordinates: actionData.coordinates,
      timestamp: Date.now()
    };
    
    // Store in memory fusion
    await this.memoryFusion.ingestStream('action', processed, Date.now());
    
    return processed;
  }

  _updateMetrics(processingTime) {
    this.metrics.processedFrames++;
    
    // Update rolling average latency
    const frames = this.metrics.processedFrames;
    const currentAvg = this.metrics.averageLatency;
    this.metrics.averageLatency = (currentAvg * (frames - 1) + processingTime) / frames;
  }

  async _performShutdownCleanup() {
    try {
      // Perform final memory compression
      await this.performMemoryCompression('all');
      
      // Cleanup old edge memory
      if (this.edgeMemory) {
        await this.edgeMemory.cleanup();
      }
      
      console.log('✅ Shutdown cleanup completed');
    } catch (error) {
      console.error('Error during shutdown cleanup:', error);
    }
  }
}

// Export all components
export {
  MultiModalMemoryFusion,
  VisualStateSpaceProcessor,
  EdgeMemoryManager
};

// Default export
export default Max;