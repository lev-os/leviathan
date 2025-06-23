# 🧪 Memory System Benchmarking Framework

*Comprehensive testing framework for evaluating memory systems in real-world Kingly scenarios*

## 🎯 **Purpose**

Establish a scientific, reproducible framework to:
- Compare memory systems across key metrics
- Test in realistic Kingly use cases
- Measure LLM-first effectiveness
- Guide architectural decisions
- Monitor performance regression

## 📊 **Benchmark Dimensions**

### **1. Performance Metrics**
```yaml
latency:
  - store_operation: "Time to store memory"
  - retrieve_operation: "Time for exact key lookup"
  - search_operation: "Time for semantic/pattern search"
  - batch_operations: "Throughput for bulk operations"
  
scalability:
  - memory_at_1k: "Performance with 1,000 memories"
  - memory_at_100k: "Performance with 100,000 memories"
  - memory_at_1m: "Performance with 1,000,000 memories"
  - concurrent_ops: "Operations per second under load"
  
resource_usage:
  - memory_footprint: "RAM usage per 1000 memories"
  - storage_size: "Disk usage per 1000 memories"
  - cpu_usage: "CPU utilization during operations"
  - network_overhead: "Bandwidth for remote systems"
```

### **2. Quality Metrics**
```yaml
accuracy:
  - retrieval_precision: "Correct memories returned"
  - retrieval_recall: "All relevant memories found"
  - pattern_detection: "Patterns correctly identified"
  - relationship_accuracy: "Graph connections correct"
  
intelligence:
  - semantic_understanding: "Query intent comprehension"
  - context_awareness: "Contextual relevance scoring"
  - learning_effectiveness: "Improvement over time"
  - cross_domain_transfer: "Knowledge application"
```

### **3. Operational Metrics**
```yaml
reliability:
  - uptime: "System availability percentage"
  - error_rate: "Failed operations percentage"
  - recovery_time: "Time to recover from failures"
  - data_durability: "Memory persistence guarantee"
  
integration:
  - setup_complexity: "Time to initial deployment"
  - api_compatibility: "Integration effort required"
  - maintenance_burden: "Ongoing operational cost"
  - upgrade_path: "Ease of version updates"
```

## 🏃 **Test Scenarios**

### **Scenario 1: Deep Conversation Session**
```javascript
// Test: 10-hour development session with context switching
export const deepConversationScenario = {
  name: "Deep Development Session",
  duration: "10_hours_simulated",
  
  phases: [
    {
      name: "Initial Planning",
      operations: [
        { type: "store", count: 50, content: "project_requirements" },
        { type: "store", count: 30, content: "architectural_decisions" },
        { type: "search", count: 20, queries: "similar_projects" }
      ]
    },
    {
      name: "Implementation",
      operations: [
        { type: "store", count: 200, content: "code_snippets" },
        { type: "search", count: 100, queries: "error_solutions" },
        { type: "pattern_search", count: 50, queries: "best_practices" }
      ]
    },
    {
      name: "Context Switching",
      operations: [
        { type: "context_save", count: 10 },
        { type: "context_load", count: 10 },
        { type: "working_memory_clear", count: 5 }
      ]
    },
    {
      name: "Review and Learning",
      operations: [
        { type: "relationship_query", count: 30 },
        { type: "pattern_extraction", count: 10 },
        { type: "confidence_assessment", count: 20 }
      ]
    }
  ],
  
  expected_outcomes: {
    total_memories: 500,
    patterns_detected: 10,
    relationships_found: 50,
    working_memory_efficiency: 0.8
  }
};
```

### **Scenario 2: Task Splitting Marathon**
```javascript
export const taskSplittingScenario = {
  name: "Complex Project Decomposition",
  
  tasks: [
    {
      description: "Build authentication system",
      expected_subtasks: 8,
      complexity: "high",
      similar_past_tasks: 3
    },
    {
      description: "Implement real-time chat",
      expected_subtasks: 12,
      complexity: "very_high",
      similar_past_tasks: 1
    },
    {
      description: "Create admin dashboard",
      expected_subtasks: 6,
      complexity: "medium",
      similar_past_tasks: 5
    }
  ],
  
  operations_per_task: [
    "store_task_description",
    "search_similar_tasks",
    "retrieve_patterns",
    "store_subtasks",
    "link_relationships",
    "assess_confidence",
    "store_completion_status"
  ],
  
  measure: {
    pattern_reuse: "How often patterns help",
    confidence_accuracy: "Predicted vs actual effort",
    relationship_quality: "Task connection relevance"
  }
};
```

### **Scenario 3: MCP Tool Research**
```javascript
export const mcpResearchScenario = {
  name: "MCP Tool Discovery and Integration",
  
  research_phases: [
    {
      name: "Discovery",
      memories_generated: 100,
      search_queries: 50,
      pattern_types: ["tool_capabilities", "integration_methods"]
    },
    {
      name: "Evaluation", 
      comparison_queries: 30,
      relationship_queries: 40,
      confidence_assessments: 20
    },
    {
      name: "Integration Planning",
      cross_reference_queries: 60,
      pattern_applications: 15,
      memory_consolidations: 10
    }
  ],
  
  memory_types_used: [
    "semantic", // Tool documentation
    "episodic", // Research journey
    "procedural", // Integration steps
    "working" // Current comparisons
  ]
};
```

### **Scenario 4: Multi-Project Context**
```javascript
export const multiProjectScenario = {
  name: "Concurrent Project Management",
  
  projects: [
    { name: "kingly", memories: 500, patterns: 20 },
    { name: "echo", memories: 300, patterns: 15 },
    { name: "nexus", memories: 200, patterns: 10 }
  ],
  
  cross_project_operations: [
    "pattern_transfer", // Apply kingly pattern to echo
    "knowledge_sharing", // Share learnings
    "context_isolation", // Keep projects separate
    "unified_search" // Search across all
  ],
  
  measure: {
    context_bleed: "Unwanted cross-contamination",
    transfer_effectiveness: "Successful pattern reuse",
    search_precision: "Project-specific accuracy"
  }
};
```

## 🧪 **Benchmark Implementation**

### **Core Benchmark Runner**
```javascript
// src/benchmarks/memory-benchmark-runner.js
export class MemoryBenchmarkRunner {
  constructor(config) {
    this.memorySystem = config.memorySystem;
    this.scenarios = config.scenarios || defaultScenarios;
    this.metrics = new MetricsCollector();
    this.reporter = new BenchmarkReporter();
  }
  
  async runFullBenchmark() {
    const results = {
      system: this.memorySystem.name,
      timestamp: Date.now(),
      scenarios: {},
      summary: {}
    };
    
    // Warm up
    await this.warmUp();
    
    // Run each scenario
    for (const scenario of this.scenarios) {
      console.log(`Running scenario: ${scenario.name}`);
      results.scenarios[scenario.name] = await this.runScenario(scenario);
    }
    
    // Calculate summary
    results.summary = this.calculateSummary(results.scenarios);
    
    // Generate report
    await this.reporter.generateReport(results);
    
    return results;
  }
  
  async runScenario(scenario) {
    const scenarioResults = {
      name: scenario.name,
      metrics: {},
      phases: []
    };
    
    // Reset memory system
    await this.memorySystem.reset();
    
    // Track scenario start
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Execute scenario phases
    for (const phase of scenario.phases || [scenario]) {
      const phaseResult = await this.executePhase(phase);
      scenarioResults.phases.push(phaseResult);
    }
    
    // Collect final metrics
    scenarioResults.metrics = {
      totalTime: Date.now() - startTime,
      memoryDelta: this.calculateMemoryDelta(startMemory),
      ...await this.collectQualityMetrics(scenario)
    };
    
    return scenarioResults;
  }
  
  async executePhase(phase) {
    const phaseMetrics = {
      name: phase.name,
      operations: {},
      latencies: []
    };
    
    for (const operation of phase.operations || []) {
      const opResults = await this.executeOperation(operation);
      phaseMetrics.operations[operation.type] = opResults;
      phaseMetrics.latencies.push(...opResults.latencies);
    }
    
    phaseMetrics.summary = {
      avgLatency: this.average(phaseMetrics.latencies),
      p50Latency: this.percentile(phaseMetrics.latencies, 50),
      p95Latency: this.percentile(phaseMetrics.latencies, 95),
      p99Latency: this.percentile(phaseMetrics.latencies, 99)
    };
    
    return phaseMetrics;
  }
  
  async executeOperation(operation) {
    const results = {
      type: operation.type,
      count: operation.count || 1,
      latencies: [],
      errors: 0,
      successes: 0
    };
    
    for (let i = 0; i < operation.count; i++) {
      try {
        const start = Date.now();
        
        switch (operation.type) {
          case 'store':
            await this.executeStore(operation, i);
            break;
          case 'search':
            await this.executeSearch(operation, i);
            break;
          case 'pattern_search':
            await this.executePatternSearch(operation, i);
            break;
          case 'relationship_query':
            await this.executeRelationshipQuery(operation, i);
            break;
          default:
            await this.memorySystem[operation.type](operation.params);
        }
        
        const latency = Date.now() - start;
        results.latencies.push(latency);
        results.successes++;
        
      } catch (error) {
        results.errors++;
        console.error(`Operation ${operation.type} failed:`, error);
      }
    }
    
    return results;
  }
  
  async executeStore(operation, index) {
    const content = this.generateContent(operation.content, index);
    
    await this.memorySystem.store(
      `${operation.content}_${index}`,
      content,
      {
        type: operation.memoryType || 'general',
        timestamp: Date.now(),
        scenario: this.currentScenario
      }
    );
  }
  
  async executeSearch(operation, index) {
    const queries = Array.isArray(operation.queries) 
      ? operation.queries 
      : [operation.queries];
      
    const query = queries[index % queries.length];
    
    const results = await this.memorySystem.search(query, {
      limit: 10,
      semantic: true
    });
    
    // Track quality metrics
    this.metrics.recordSearchResults(query, results);
  }
  
  async collectQualityMetrics(scenario) {
    const metrics = {};
    
    // Test pattern detection
    if (scenario.expected_outcomes?.patterns_detected) {
      const patterns = await this.memorySystem.getPatterns();
      metrics.patternDetectionRate = patterns.length / 
        scenario.expected_outcomes.patterns_detected;
    }
    
    // Test relationship accuracy
    if (scenario.expected_outcomes?.relationships_found) {
      const testKey = Object.keys(await this.memorySystem.getAllKeys())[0];
      const relationships = await this.memorySystem.getRelationships(testKey);
      metrics.relationshipAccuracy = relationships.length > 0 ? 1 : 0;
    }
    
    // Test search quality
    const searchQuality = await this.testSearchQuality();
    metrics.searchPrecision = searchQuality.precision;
    metrics.searchRecall = searchQuality.recall;
    
    return metrics;
  }
  
  async testSearchQuality() {
    // Insert known test data
    const testData = [
      { key: 'test1', content: 'authentication jwt token', relevant: true },
      { key: 'test2', content: 'authorization oauth flow', relevant: true },
      { key: 'test3', content: 'database migration script', relevant: false },
      { key: 'test4', content: 'user login security', relevant: true }
    ];
    
    for (const item of testData) {
      await this.memorySystem.store(item.key, item.content, { test: true });
    }
    
    // Search for auth-related content
    const results = await this.memorySystem.search('authentication security', {
      limit: 10
    });
    
    // Calculate precision and recall
    const resultKeys = results.map(r => r.key);
    const relevantFound = resultKeys.filter(k => 
      testData.find(t => t.key === k && t.relevant)
    ).length;
    
    const precision = relevantFound / results.length;
    const recall = relevantFound / testData.filter(t => t.relevant).length;
    
    // Clean up test data
    for (const item of testData) {
      await this.memorySystem.delete(item.key);
    }
    
    return { precision, recall };
  }
}
```

### **Comparative Benchmark Runner**
```javascript
// src/benchmarks/comparative-benchmark.js
export class ComparativeBenchmark {
  constructor(memorySystems) {
    this.systems = memorySystems;
    this.scenarios = [
      deepConversationScenario,
      taskSplittingScenario,
      mcpResearchScenario,
      multiProjectScenario
    ];
  }
  
  async runComparison() {
    const results = {
      timestamp: Date.now(),
      systems: {},
      comparison: {}
    };
    
    // Run benchmarks for each system
    for (const system of this.systems) {
      console.log(`\nBenchmarking ${system.name}...`);
      
      const runner = new MemoryBenchmarkRunner({
        memorySystem: system,
        scenarios: this.scenarios
      });
      
      results.systems[system.name] = await runner.runFullBenchmark();
    }
    
    // Generate comparative analysis
    results.comparison = this.compareResults(results.systems);
    
    // Generate report
    await this.generateComparativeReport(results);
    
    return results;
  }
  
  compareResults(systemResults) {
    const comparison = {
      performance: {},
      quality: {},
      operational: {},
      recommendations: []
    };
    
    // Compare performance metrics
    const metrics = ['avgLatency', 'p95Latency', 'throughput'];
    
    for (const metric of metrics) {
      comparison.performance[metric] = this.rankSystems(
        systemResults,
        (result) => this.extractMetric(result, metric)
      );
    }
    
    // Compare quality metrics  
    comparison.quality.searchAccuracy = this.rankSystems(
      systemResults,
      (result) => result.summary.searchPrecision * result.summary.searchRecall
    );
    
    comparison.quality.patternDetection = this.rankSystems(
      systemResults,
      (result) => result.summary.patternDetectionRate || 0
    );
    
    // Generate recommendations
    comparison.recommendations = this.generateRecommendations(comparison);
    
    return comparison;
  }
  
  rankSystems(results, metricExtractor) {
    const scores = Object.entries(results).map(([name, result]) => ({
      name,
      score: metricExtractor(result)
    }));
    
    scores.sort((a, b) => b.score - a.score);
    
    return scores;
  }
  
  generateRecommendations(comparison) {
    const recommendations = [];
    
    // Performance-critical recommendation
    const fastestSystem = comparison.performance.avgLatency[0].name;
    recommendations.push({
      scenario: "performance_critical",
      recommendation: fastestSystem,
      reason: "Lowest average latency"
    });
    
    // Quality-critical recommendation
    const mostAccurate = comparison.quality.searchAccuracy[0].name;
    recommendations.push({
      scenario: "quality_critical", 
      recommendation: mostAccurate,
      reason: "Highest search accuracy"
    });
    
    // Balanced recommendation
    const balanced = this.findBalancedSystem(comparison);
    recommendations.push({
      scenario: "balanced",
      recommendation: balanced,
      reason: "Best overall performance and quality"
    });
    
    return recommendations;
  }
}
```

### **Real-Time Performance Monitor**
```javascript
// src/benchmarks/performance-monitor.js
export class MemoryPerformanceMonitor {
  constructor(memoryRouter) {
    this.router = memoryRouter;
    this.metrics = new Map();
    this.thresholds = {
      store: 50, // ms
      retrieve: 10, // ms
      search: 200 // ms
    };
    
    this.wrapRouter();
  }
  
  wrapRouter() {
    const originalRoute = this.router.route.bind(this.router);
    
    this.router.route = async (operation, params) => {
      const start = Date.now();
      const memoryBefore = process.memoryUsage();
      
      try {
        const result = await originalRoute(operation, params);
        
        const latency = Date.now() - start;
        const memoryDelta = process.memoryUsage().heapUsed - memoryBefore.heapUsed;
        
        this.recordMetric(operation, {
          latency,
          memoryDelta,
          success: true,
          timestamp: Date.now()
        });
        
        // Alert if threshold exceeded
        if (latency > this.thresholds[operation]) {
          this.alertSlowOperation(operation, latency);
        }
        
        return result;
        
      } catch (error) {
        this.recordMetric(operation, {
          latency: Date.now() - start,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
        
        throw error;
      }
    };
  }
  
  recordMetric(operation, metric) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const operationMetrics = this.metrics.get(operation);
    operationMetrics.push(metric);
    
    // Keep only last 1000 metrics
    if (operationMetrics.length > 1000) {
      operationMetrics.shift();
    }
  }
  
  getStats(operation, timeWindow = 5 * 60 * 1000) {
    const metrics = this.metrics.get(operation) || [];
    const cutoff = Date.now() - timeWindow;
    
    const recentMetrics = metrics.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) {
      return null;
    }
    
    const latencies = recentMetrics
      .filter(m => m.success)
      .map(m => m.latency);
    
    return {
      count: recentMetrics.length,
      successRate: recentMetrics.filter(m => m.success).length / recentMetrics.length,
      avgLatency: this.average(latencies),
      p50: this.percentile(latencies, 50),
      p95: this.percentile(latencies, 95),
      p99: this.percentile(latencies, 99),
      errors: recentMetrics.filter(m => !m.success).length
    };
  }
  
  generateReport() {
    const report = {
      timestamp: Date.now(),
      operations: {}
    };
    
    for (const [operation, _] of this.metrics) {
      report.operations[operation] = {
        last5min: this.getStats(operation, 5 * 60 * 1000),
        last1hour: this.getStats(operation, 60 * 60 * 1000)
      };
    }
    
    return report;
  }
}
```

## 📊 **Benchmark Report Generator**

### **Visual Report Template**
```javascript
// src/benchmarks/report-generator.js
export class BenchmarkReportGenerator {
  async generateMarkdownReport(results) {
    let report = `# Memory System Benchmark Report
    
Generated: ${new Date().toISOString()}

## Executive Summary

${this.generateSummary(results)}

## Performance Metrics

${this.generatePerformanceTable(results)}

## Quality Metrics

${this.generateQualityTable(results)}

## Scenario Results

${this.generateScenarioResults(results)}

## Recommendations

${this.generateRecommendations(results)}

## Detailed Metrics

\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`
`;
    
    return report;
  }
  
  generatePerformanceTable(results) {
    const headers = ['System', 'Avg Latency', 'P95 Latency', 'Throughput', 'Memory Usage'];
    const rows = Object.entries(results.systems).map(([name, data]) => [
      name,
      `${data.summary.avgLatency}ms`,
      `${data.summary.p95Latency}ms`,
      `${data.summary.throughput} ops/s`,
      `${data.summary.memoryUsage}MB`
    ]);
    
    return this.createMarkdownTable(headers, rows);
  }
  
  generateQualityTable(results) {
    const headers = ['System', 'Search Precision', 'Search Recall', 'Pattern Detection', 'Overall Score'];
    const rows = Object.entries(results.systems).map(([name, data]) => [
      name,
      `${(data.summary.searchPrecision * 100).toFixed(1)}%`,
      `${(data.summary.searchRecall * 100).toFixed(1)}%`,
      `${(data.summary.patternDetection * 100).toFixed(1)}%`,
      `${(data.summary.overallScore * 100).toFixed(1)}%`
    ]);
    
    return this.createMarkdownTable(headers, rows);
  }
  
  createMarkdownTable(headers, rows) {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
    
    return `${headerRow}\n${separatorRow}\n${dataRows}`;
  }
}
```

## 🚀 **Usage Example**

```javascript
// Run comprehensive benchmark
import { LocalMemoryAdapter } from './adapters/local';
import { MCPMemoryAdapter } from './adapters/mcp-memory';
import { MementoAdapter } from './adapters/memento';
import { Mem0Adapter } from './adapters/mem0';

const systems = [
  new LocalMemoryAdapter({ name: 'SQLite Local' }),
  new MCPMemoryAdapter({ name: 'MCP-Memory' }),
  new MementoAdapter({ name: 'Memento MCP' }),
  new Mem0Adapter({ name: 'Mem0' })
];

const benchmark = new ComparativeBenchmark(systems);
const results = await benchmark.runComparison();

// Results will show:
// - Which system is fastest for simple operations
// - Which has best semantic search accuracy
// - Which handles patterns best
// - Which scales to large datasets
// - Recommendations for different use cases
```

## 📈 **Continuous Monitoring**

```javascript
// Set up real-time monitoring
const monitor = new MemoryPerformanceMonitor(memoryRouter);

// Check performance every minute
setInterval(() => {
  const report = monitor.generateReport();
  
  if (report.operations.search?.last5min?.p95 > 500) {
    console.warn('Search performance degraded!', report.operations.search);
  }
}, 60 * 1000);
```

This benchmarking framework provides:
1. **Realistic scenarios** based on actual Kingly use cases
2. **Comprehensive metrics** covering performance, quality, and operations
3. **Comparative analysis** to guide system selection
4. **Continuous monitoring** for production systems
5. **Actionable recommendations** based on data

The framework ensures memory system decisions are data-driven and aligned with Kingly's LLM-first principles.