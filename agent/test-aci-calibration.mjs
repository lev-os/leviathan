#!/usr/bin/env node

/**
 * ACI Dynamic Calibration Testing Script
 * Tests different chunking strategies across LLM adapters
 * Measures accuracy + speed for dogfooding metrics
 */

import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

class ACIDynamicTester {
  constructor() {
    this.testResults = [];
    this.llmAdapters = [
      { name: 'claude-3.5-sonnet', contextWindow: 200000, chunkOptimal: 100 },
      { name: 'gpt-4', contextWindow: 128000, chunkOptimal: 150 },
      { name: 'gpt-4-turbo', contextWindow: 128000, chunkOptimal: 200 },
      { name: 'gemini-pro', contextWindow: 1000000, chunkOptimal: 300 }
    ];
    
    this.chunkingStrategies = [
      { name: 'none', chunkSize: Infinity, description: 'No chunking - full context' },
      { name: 'static-small', chunkSize: 50, description: 'Static 50-line chunks' },
      { name: 'static-swe', chunkSize: 100, description: 'SWE-agent 100-line chunks' },
      { name: 'static-medium', chunkSize: 200, description: 'Static 200-line chunks' },
      { name: 'dynamic-simple', chunkSize: 'adaptive', description: 'Simple adaptive chunking' },
      { name: 'dynamic-smart', chunkSize: 'intelligent', description: 'Intelligent context-aware chunking' }
    ];
    
    this.testTasks = [
      {
        name: 'code-analysis',
        description: 'Analyze a complex JavaScript file for patterns',
        inputFile: 'src/index.js',
        expectedPatterns: ['exports', 'require', 'function', 'class', 'const'],
        accuracyMetric: 'pattern_detection_rate'
      },
      {
        name: 'context-synthesis',
        description: 'Synthesize information across multiple context files',
        inputFile: 'contexts',
        expectedConcepts: ['universal-context', 'inheritance', 'workflows'],
        accuracyMetric: 'concept_synthesis_rate'
      },
      {
        name: 'documentation-search',
        description: 'Find specific information in documentation',
        inputFile: 'docs',
        expectedFindings: ['ADR patterns', 'implementation guides', 'architecture'],
        accuracyMetric: 'information_retrieval_rate'
      }
    ];
  }

  async runCalibrationTests() {
    console.log('🧪 Starting ACI Dynamic Calibration Tests...\n');
    
    for (const adapter of this.llmAdapters) {
      console.log(`Testing ${adapter.name}...`);
      
      for (const strategy of this.chunkingStrategies) {
        console.log(`  Strategy: ${strategy.description}`);
        
        for (const task of this.testTasks) {
          const result = await this.runSingleTest(adapter, strategy, task);
          this.testResults.push(result);
          
          console.log(`    ${task.name}: ${result.accuracy}% accuracy, ${result.speed}ms`);
        }
        console.log('');
      }
    }
    
    await this.generateReport();
  }

  async runSingleTest(adapter, strategy, task) {
    const startTime = performance.now();
    
    try {
      // Simulate loading test content
      const content = await this.loadTestContent(task.inputFile);
      
      // Apply chunking strategy
      const chunkedContent = this.applyChunkingStrategy(content, strategy, adapter);
      
      // Simulate LLM processing (using self-analysis for dogfooding)
      const result = await this.simulateLLMProcessing(chunkedContent, task, adapter);
      
      const endTime = performance.now();
      const speed = Math.round(endTime - startTime);
      
      // Calculate accuracy based on expected patterns/concepts
      const accuracy = this.calculateAccuracy(result, task);
      
      return {
        adapter: adapter.name,
        strategy: strategy.name,
        task: task.name,
        accuracy: accuracy,
        speed: speed,
        chunkCount: Array.isArray(chunkedContent) ? chunkedContent.length : 1,
        totalTokens: this.estimateTokens(content),
        chunkedTokens: this.estimateTokens(chunkedContent),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        adapter: adapter.name,
        strategy: strategy.name,
        task: task.name,
        accuracy: 0,
        speed: 999999,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async loadTestContent(inputPath) {
    try {
      const fullPath = path.resolve(inputPath);
      const stats = await fs.stat(fullPath);
      
      if (stats.isDirectory()) {
        // Load multiple files from directory
        const files = await fs.readdir(fullPath);
        const contents = await Promise.all(
          files.slice(0, 5).map(async file => {
            try {
              return await fs.readFile(path.join(fullPath, file), 'utf8');
            } catch {
              return '';
            }
          })
        );
        return contents.join('\n\n---\n\n');
      } else {
        return await fs.readFile(fullPath, 'utf8');
      }
    } catch (error) {
      // Fallback to sample content for testing
      return this.generateSampleContent(inputPath);
    }
  }

  generateSampleContent(type) {
    const samples = {
      'src/index.js': `
const express = require('express');
const app = express();

class UserManager {
  constructor() {
    this.users = new Map();
  }
  
  async createUser(userData) {
    const user = { ...userData, id: Date.now() };
    this.users.set(user.id, user);
    return user;
  }
  
  function validateUser(user) {
    return user && user.email && user.name;
  }
}

module.exports = { UserManager };
`.repeat(20), // Make it large enough to test chunking
      
      'contexts': `
universal-context:
  inheritance: true
  patterns:
    - workflow-orchestration
    - context-assembly
    - bidirectional-flow
    
workflows:
  types:
    - cognitive-parliament
    - insight-bubbling
    - knowledge-trickling
`.repeat(15),
      
      'docs': `
# Architecture Decision Records

## ADR-001: Session Intelligence
Implementation patterns for cross-workspace routing.

## ADR-007: ACI Optimization
Agent Computer Interface patterns with feature flags.

Implementation guides:
- Context loading strategies
- Chunking algorithms
- Performance measurement
`.repeat(10)
    };
    
    return samples[type] || 'Sample content for testing purposes.'.repeat(100);
  }

  applyChunkingStrategy(content, strategy, adapter) {
    const lines = content.split('\n');
    
    switch (strategy.name) {
      case 'none':
        return content;
        
      case 'static-small':
      case 'static-swe':
      case 'static-medium':
        return this.staticChunk(lines, strategy.chunkSize);
        
      case 'dynamic-simple':
        return this.dynamicSimpleChunk(lines, adapter);
        
      case 'dynamic-smart':
        return this.dynamicSmartChunk(lines, adapter);
        
      default:
        return content;
    }
  }

  staticChunk(lines, chunkSize) {
    const chunks = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
      chunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }
    return chunks;
  }

  dynamicSimpleChunk(lines, adapter) {
    // Adaptive chunking based on adapter's optimal size
    const optimalSize = adapter.chunkOptimal;
    const chunks = [];
    
    for (let i = 0; i < lines.length; i += optimalSize) {
      chunks.push(lines.slice(i, i + optimalSize).join('\n'));
    }
    return chunks;
  }

  dynamicSmartChunk(lines, adapter) {
    // Intelligent chunking considering content structure
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;
    const targetSize = adapter.chunkOptimal;
    
    for (const line of lines) {
      // Smart breaking points
      const isBreakPoint = line.trim() === '' || 
                          line.startsWith('//') || 
                          line.startsWith('#') ||
                          line.includes('function') ||
                          line.includes('class') ||
                          line.includes('---');
      
      if (currentSize >= targetSize && isBreakPoint && currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
        currentSize = 0;
      }
      
      currentChunk.push(line);
      currentSize++;
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }
    
    return chunks;
  }

  async simulateLLMProcessing(content, task, adapter) {
    // Simulate processing time based on content size and adapter
    const tokens = this.estimateTokens(content);
    const baseTime = 50; // Base processing time
    const tokenTime = tokens * 0.005; // Time per token
    const adapterMultiplier = adapter.name.includes('gpt-4') ? 1.2 : 1.0;
    
    const processingTime = (baseTime + tokenTime) * adapterMultiplier;
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 500))); // Cap at 500ms for testing
    
    // Simulate analysis results
    return this.generateAnalysisResult(content, task);
  }

  generateAnalysisResult(content, task) {
    const results = [];
    
    for (const expected of task.expectedPatterns || task.expectedConcepts || task.expectedFindings || []) {
      const found = content.toLowerCase().includes(expected.toLowerCase());
      const confidence = found ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
      
      results.push({
        item: expected,
        found: found,
        confidence: confidence
      });
    }
    
    return results;
  }

  calculateAccuracy(result, task) {
    if (!result || result.length === 0) return 0;
    
    const correctFindings = result.filter(r => r.found && r.confidence > 0.5).length;
    const totalExpected = (task.expectedPatterns || task.expectedConcepts || task.expectedFindings || []).length;
    
    return Math.round((correctFindings / totalExpected) * 100);
  }

  estimateTokens(content) {
    if (Array.isArray(content)) {
      return content.reduce((total, chunk) => total + this.estimateTokens(chunk), 0);
    }
    return Math.ceil(content.length / 4); // Rough token estimation
  }

  async generateReport() {
    console.log('\n📊 ACI Calibration Test Results\n');
    
    // Summary statistics
    const byAdapter = this.groupBy(this.testResults, 'adapter');
    const byStrategy = this.groupBy(this.testResults, 'strategy');
    
    console.log('🎯 Accuracy by Adapter:');
    for (const [adapter, results] of Object.entries(byAdapter)) {
      const avgAccuracy = this.average(results.map(r => r.accuracy));
      const avgSpeed = this.average(results.map(r => r.speed));
      console.log(`  ${adapter}: ${avgAccuracy.toFixed(1)}% accuracy, ${avgSpeed.toFixed(0)}ms avg`);
    }
    
    console.log('\n⚡ Performance by Strategy:');
    for (const [strategy, results] of Object.entries(byStrategy)) {
      const avgAccuracy = this.average(results.map(r => r.accuracy));
      const avgSpeed = this.average(results.map(r => r.speed));
      const avgChunks = this.average(results.map(r => r.chunkCount || 1));
      console.log(`  ${strategy}: ${avgAccuracy.toFixed(1)}% accuracy, ${avgSpeed.toFixed(0)}ms, ${avgChunks.toFixed(1)} chunks`);
    }
    
    // Best performing combinations
    console.log('\n🏆 Top Performing Combinations:');
    const ranked = this.testResults
      .sort((a, b) => (b.accuracy - a.accuracy) || (a.speed - b.speed))
      .slice(0, 5);
    
    ranked.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.adapter} + ${result.strategy}: ${result.accuracy}% accuracy, ${result.speed}ms`);
    });
    
    // Save detailed results
    await this.saveResults();
    
    console.log('\n✅ Calibration complete! Results saved to test-results/');
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  average(numbers) {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  async saveResults() {
    const resultsDir = path.join(process.cwd(), 'test-results');
    
    try {
      await fs.mkdir(resultsDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `aci-calibration-${timestamp}.json`;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_tests: this.testResults.length,
        adapters_tested: [...new Set(this.testResults.map(r => r.adapter))],
        strategies_tested: [...new Set(this.testResults.map(r => r.strategy))],
        avg_accuracy: this.average(this.testResults.map(r => r.accuracy)),
        avg_speed: this.average(this.testResults.map(r => r.speed))
      },
      detailed_results: this.testResults,
      recommendations: this.generateRecommendations()
    };
    
    await fs.writeFile(
      path.join(resultsDir, filename),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`📁 Detailed results: test-results/${filename}`);
  }

  generateRecommendations() {
    const byAdapter = this.groupBy(this.testResults, 'adapter');
    const recommendations = [];
    
    for (const [adapter, results] of Object.entries(byAdapter)) {
      const best = results.sort((a, b) => (b.accuracy - a.accuracy) || (a.speed - b.speed))[0];
      
      recommendations.push({
        adapter: adapter,
        recommended_strategy: best.strategy,
        expected_accuracy: best.accuracy,
        expected_speed: best.speed,
        reasoning: `Best balance of accuracy (${best.accuracy}%) and speed (${best.speed}ms) for ${adapter}`
      });
    }
    
    return recommendations;
  }
}

// Main execution
async function main() {
  const tester = new ACIDynamicTester();
  await tester.runCalibrationTests();
}

main().catch(console.error);