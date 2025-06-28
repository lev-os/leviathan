/**
 * Practical Use Cases for Chain Workflows
 * 
 * Real-world examples showing how chain workflows improve on
 * Leviathan's current 3-tab coordination system.
 */

import { EnhancedChainWorkflow } from '../src/workflows/chain-enhanced.js';

// Use Case 1: Documentation Generation Pipeline
export async function documentationPipeline(componentPath) {
  console.log('\n📚 Documentation Generation Pipeline');
  console.log('=====================================\n');
  
  const config = {
    sequence: [
      'code-analyzer',
      'doc-generator', 
      'example-creator',
      'reviewer',
      'formatter'
    ],
    agents: {
      'code-analyzer': {
        instruction: 'Analyze code structure and extract API information',
        parseJSDoc: true,
        extractTypes: true,
        findUsagePatterns: true
      },
      'doc-generator': {
        instruction: 'Generate comprehensive documentation from analysis',
        style: 'leviathan-docs',
        includeExamples: true,
        generateTOC: true
      },
      'example-creator': {
        instruction: 'Create practical usage examples',
        complexity: ['basic', 'intermediate', 'advanced'],
        runnable: true
      },
      'reviewer': {
        instruction: 'Review documentation for clarity and completeness',
        checkFor: ['accuracy', 'clarity', 'completeness', 'consistency'],
        suggestImprovements: true
      },
      'formatter': {
        instruction: 'Format final documentation',
        format: 'markdown',
        addMetadata: true,
        generateHTML: false
      }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  
  try {
    const result = await workflow.execute({
      component: componentPath,
      outputPath: './docs/generated/',
      style: 'comprehensive'
    });
    
    console.log('✅ Documentation generated successfully!');
    return result.finalOutput;
    
  } catch (error) {
    console.error('Documentation generation failed:', error);
    throw error;
  }
}

// Use Case 2: Bug Investigation Chain
export async function bugInvestigationChain(bugReport) {
  console.log('\n🐛 Bug Investigation Chain');
  console.log('==========================\n');
  
  const config = {
    sequence: [
      'bug-parser',
      'code-searcher',
      'impact-analyzer',
      'fix-suggester',
      'test-generator'
    ],
    agents: {
      'bug-parser': {
        instruction: 'Parse bug report and extract key information',
        extractStackTrace: true,
        identifyComponents: true,
        categorize: true
      },
      'code-searcher': {
        instruction: 'Search codebase for relevant code sections',
        useSemanticSearch: true,
        searchDepth: 'thorough',
        includeTests: true
      },
      'impact-analyzer': {
        instruction: 'Analyze potential impact and root cause',
        checkDependencies: true,
        assessSeverity: true,
        findRelatedIssues: true
      },
      'fix-suggester': {
        instruction: 'Suggest potential fixes with code snippets',
        generatePatches: true,
        explainRationale: true,
        considerAlternatives: true
      },
      'test-generator': {
        instruction: 'Generate tests to verify the fix',
        testFramework: 'node:test',
        includeEdgeCases: true,
        generateRegression: true
      }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  
  try {
    const result = await workflow.execute(bugReport);
    
    console.log('✅ Bug investigation complete!');
    console.log('Suggested fixes:', result.finalOutput);
    
    return result;
    
  } catch (error) {
    console.error('Bug investigation failed:', error);
    throw error;
  }
}

// Use Case 3: Feature Implementation Chain
export async function featureImplementationChain(featureSpec) {
  console.log('\n✨ Feature Implementation Chain');
  console.log('================================\n');
  
  const config = {
    sequence: [
      'spec-analyzer',
      'architecture-planner',
      'implementation-guide',
      'code-generator',
      'integration-checker',
      'test-suite-creator'
    ],
    agents: {
      'spec-analyzer': {
        instruction: 'Analyze feature specification and requirements',
        extractRequirements: true,
        identifyConstraints: true,
        assessComplexity: true
      },
      'architecture-planner': {
        instruction: 'Design architecture and integration points',
        considerExisting: true,
        proposePatterns: true,
        createDiagrams: true
      },
      'implementation-guide': {
        instruction: 'Create step-by-step implementation plan',
        breakdownTasks: true,
        estimateEffort: true,
        identifyDependencies: true
      },
      'code-generator': {
        instruction: 'Generate boilerplate and starter code',
        followPatterns: true,
        includeComments: true,
        createStubs: true
      },
      'integration-checker': {
        instruction: 'Verify integration with existing system',
        checkCompatibility: true,
        identifyConflicts: true,
        suggestAdaptations: true
      },
      'test-suite-creator': {
        instruction: 'Create comprehensive test suite',
        coverageTarget: 80,
        includeIntegration: true,
        generateMocks: true
      }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  
  try {
    const result = await workflow.execute(featureSpec);
    
    console.log('✅ Feature implementation plan ready!');
    console.log(`Total steps: ${result.executionLog.length}`);
    console.log(`Session ID: ${result.sessionId}`);
    
    return result;
    
  } catch (error) {
    console.error('Feature planning failed:', error);
    throw error;
  }
}

// Use Case 4: Performance Optimization Chain
export async function performanceOptimizationChain(targetComponent) {
  console.log('\n⚡ Performance Optimization Chain');
  console.log('==================================\n');
  
  const config = {
    sequence: [
      'profiler',
      'bottleneck-finder',
      'optimization-suggester',
      'implementation-assistant',
      'benchmark-runner'
    ],
    agents: {
      'profiler': {
        instruction: 'Profile component performance',
        metrics: ['cpu', 'memory', 'io'],
        duration: 60000,
        captureFlameGraph: true
      },
      'bottleneck-finder': {
        instruction: 'Identify performance bottlenecks',
        analyzeHotPaths: true,
        checkAlgorithmicComplexity: true,
        findMemoryLeaks: true
      },
      'optimization-suggester': {
        instruction: 'Suggest optimization strategies',
        considerTradeoffs: true,
        proposeAlternatives: true,
        estimateImpact: true
      },
      'implementation-assistant': {
        instruction: 'Help implement optimizations',
        preserveFunctionality: true,
        maintainTests: true,
        documentChanges: true
      },
      'benchmark-runner': {
        instruction: 'Run before/after benchmarks',
        compareMetrics: true,
        generateReport: true,
        visualizeResults: true
      }
    }
  };
  
  const workflow = new EnhancedChainWorkflow(config);
  
  try {
    const result = await workflow.execute({
      component: targetComponent,
      baseline: 'current',
      targetImprovement: '50%'
    });
    
    console.log('✅ Optimization analysis complete!');
    return result;
    
  } catch (error) {
    console.error('Optimization failed:', error);
    throw error;
  }
}

// Main function to demonstrate use cases
async function main() {
  const args = process.argv.slice(2);
  const useCase = args[0] || 'all';
  
  console.log('🚀 Practical Chain Workflow Use Cases');
  console.log('=====================================');
  
  switch (useCase) {
    case 'docs':
      await documentationPipeline('/agent/src/hybrid-router.js');
      break;
      
    case 'bug':
      await bugInvestigationChain({
        title: 'Session checkpoint fails on large context',
        description: 'When context exceeds 1MB, checkpoint throws error',
        stackTrace: 'Error: ENOMEM at checkpoint.js:142',
        severity: 'high'
      });
      break;
      
    case 'feature':
      await featureImplementationChain({
        name: 'Multi-agent orchestration',
        description: 'Replace 3-tab system with dynamic orchestration',
        requirements: ['backward compatible', 'performance improvement', 'session continuity'],
        priority: 'high'
      });
      break;
      
    case 'perf':
      await performanceOptimizationChain('/agent/src/semantic-lookup.js');
      break;
      
    case 'all':
    default:
      console.log('\nRunning all use cases...\n');
      await documentationPipeline('/agent/src/hybrid-router.js');
      console.log('\n---\n');
      await bugInvestigationChain({
        title: 'Test bug',
        description: 'Sample bug for demonstration'
      });
      break;
  }
  
  console.log('\n✨ All workflows completed!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}