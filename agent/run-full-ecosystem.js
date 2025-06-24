#!/usr/bin/env node

/**
 * Full Ecosystem Validation Runner
 * Runs all compliance tests and generates comprehensive report
 * Part of testing worktree integration per _tree.md
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test suite configuration
 */
const TEST_SUITES = [
  {
    name: 'Architectural Compliance',
    command: 'node tests/architectural/hex-compliance.test.js',
    critical: true,
    timeout: 30000
  },
  {
    name: 'Performance Benchmarks', 
    command: 'node tests/performance/benchmark.test.js',
    critical: false,
    timeout: 60000
  },
  {
    name: 'Cross-Adapter Consistency',
    command: 'node tests/integration/cross-adapter-consistency.test.js', 
    critical: true,
    timeout: 45000
  },
  {
    name: 'Constitutional Framework',
    command: 'npm run test:constitutional',
    critical: true,
    timeout: 30000
  },
  {
    name: 'Core System Tests',
    command: 'npm run test:core',
    critical: true,
    timeout: 45000
  },
  {
    name: 'Adapter Tests',
    command: 'npm run test:adapters',
    critical: true,
    timeout: 60000
  }
];

/**
 * Execute test suite with timeout and error handling
 */
async function executeTestSuite(suite) {
  const startTime = Date.now();
  
  console.log(`\n🧪 Running ${suite.name}...`);
  console.log('─'.repeat(60));
  
  try {
    const output = execSync(suite.command, {
      encoding: 'utf-8',
      timeout: suite.timeout,
      stdio: 'pipe',
      cwd: __dirname
    });
    
    const duration = Date.now() - startTime;
    
    console.log(output);
    console.log(`✅ ${suite.name} completed in ${duration}ms`);
    
    return {
      name: suite.name,
      status: 'PASS',
      duration,
      output,
      critical: suite.critical
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ ${suite.name} failed:`);
    console.error(error.stdout || error.message);
    
    return {
      name: suite.name,
      status: 'FAIL',
      duration,
      error: error.message,
      output: error.stdout || '',
      critical: suite.critical
    };
  }
}

/**
 * Generate comprehensive test report
 */
async function generateTestReport(results) {
  const timestamp = new Date().toISOString();
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  const passed = results.filter(r => r.status === 'PASS');
  const failed = results.filter(r => r.status === 'FAIL');
  const criticalFailed = failed.filter(r => r.critical);
  
  const overallStatus = criticalFailed.length === 0 ? 'PASS' : 'FAIL';
  
  const report = {
    timestamp,
    overallStatus,
    summary: {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      criticalFailed: criticalFailed.length,
      totalDuration
    },
    results,
    recommendations: generateRecommendations(results)
  };
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'monitoring/ecosystem-validation-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  results.forEach(result => {
    if (result.status === 'FAIL') {
      switch (result.name) {
        case 'Architectural Compliance':
          recommendations.push({
            category: 'Architecture',
            priority: 'HIGH',
            action: 'Review hexagonal architecture violations and refactor to separate concerns',
            details: 'Core business logic may be leaking into adapter layers'
          });
          break;
          
        case 'Performance Benchmarks':
          recommendations.push({
            category: 'Performance',
            priority: 'MEDIUM',
            action: 'Investigate performance regressions and optimize critical paths',
            details: 'System performance has degraded beyond acceptable thresholds'
          });
          break;
          
        case 'Cross-Adapter Consistency':
          recommendations.push({
            category: 'Integration',
            priority: 'HIGH', 
            action: 'Ensure CLI and MCP adapters produce consistent results',
            details: 'Command registry may not be properly synchronized across adapters'
          });
          break;
          
        case 'Constitutional Framework':
          recommendations.push({
            category: 'Governance',
            priority: 'HIGH',
            action: 'Review constitutional principle violations and adjust implementation',
            details: 'System behavior does not align with core constitutional principles'
          });
          break;
      }
    }
  });
  
  // Add general recommendations
  if (results.filter(r => r.status === 'PASS').length === results.length) {
    recommendations.push({
      category: 'Maintenance',
      priority: 'LOW',
      action: 'All tests passing - consider adding more edge case coverage',
      details: 'System is stable, focus on expanding test scenarios'
    });
  }
  
  return recommendations;
}

/**
 * Print final summary
 */
function printSummary(report) {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 LEVIATHAN ECOSYSTEM VALIDATION SUMMARY');
  console.log('═'.repeat(80));
  
  console.log(`\n📊 Overall Status: ${report.overallStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`⏱️  Total Duration: ${Math.round(report.summary.totalDuration / 1000)}s`);
  console.log(`🧪 Test Results: ${report.summary.passed}/${report.summary.total} passed`);
  
  if (report.summary.criticalFailed > 0) {
    console.log(`🚨 Critical Failures: ${report.summary.criticalFailed}`);
  }
  
  // Show failed tests
  if (report.summary.failed > 0) {
    console.log('\n❌ Failed Tests:');
    report.results.filter(r => r.status === 'FAIL').forEach(result => {
      const criticality = result.critical ? '🚨 CRITICAL' : '⚠️  WARNING';
      console.log(`   ${criticality} ${result.name}`);
    });
  }
  
  // Show recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`   ${priority} ${rec.category}: ${rec.action}`);
    });
  }
  
  console.log('\n🧙🏽‍♂️ Leviathan Intelligence System (sponsored by Kingly Agency)');
  console.log('═'.repeat(80));
}

/**
 * Main execution function
 */
async function runFullEcosystemValidation() {
  console.log('🚀 LEVIATHAN FULL ECOSYSTEM VALIDATION');
  console.log('════════════════════════════════════════');
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log(`🎯 Suites: ${TEST_SUITES.length}`);
  
  const results = [];
  
  // Run all test suites
  for (const suite of TEST_SUITES) {
    const result = await executeTestSuite(suite);
    results.push(result);
    
    // Stop on critical failure if requested
    if (result.status === 'FAIL' && result.critical && process.env.FAIL_FAST === 'true') {
      console.log('\n🛑 Stopping on critical failure (FAIL_FAST=true)');
      break;
    }
  }
  
  // Generate report and dashboard
  console.log('\n📊 Generating comprehensive report...');
  const report = await generateTestReport(results);
  
  // Generate compliance dashboard
  try {
    const { generateComplianceDashboard } = await import('./monitoring/compliance-dashboard.js');
    await generateComplianceDashboard();
    console.log('📈 Compliance dashboard updated');
  } catch (error) {
    console.warn('Warning: Could not update dashboard:', error.message);
  }
  
  // Print summary
  printSummary(report);
  
  // Exit with appropriate code
  const exitCode = report.overallStatus === 'PASS' ? 0 : 1;
  process.exit(exitCode);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Leviathan Full Ecosystem Validation Runner

Usage: node run-full-ecosystem.js [options]

Options:
  --help, -h       Show this help message
  --fail-fast      Stop on first critical failure
  --quiet         Minimal output
  --dashboard     Generate dashboard only

Environment Variables:
  FAIL_FAST=true  Stop on critical failure
  NODE_ENV=test   Use test configuration
  
Examples:
  node run-full-ecosystem.js
  FAIL_FAST=true node run-full-ecosystem.js
  node run-full-ecosystem.js --dashboard
`);
  process.exit(0);
}

if (args.includes('--dashboard')) {
  // Generate dashboard only
  import('./monitoring/compliance-dashboard.js')
    .then(({ generateComplianceDashboard }) => generateComplianceDashboard())
    .then(dashboardPath => {
      console.log(`✅ Dashboard generated: ${dashboardPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Dashboard generation failed:', error.message);
      process.exit(1);
    });
} else {
  // Run full validation
  runFullEcosystemValidation().catch(error => {
    console.error('Ecosystem validation failed:', error.message);
    process.exit(1);
  });
}