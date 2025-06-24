/**
 * Compliance Dashboard - Real-time architectural compliance monitoring
 * Generates HTML dashboard with trend analysis
 * Part of testing worktree integration per _tree.md
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

/**
 * Dashboard configuration
 */
const DASHBOARD_CONFIG = {
  title: 'Leviathan Architectural Compliance Dashboard',
  refreshInterval: 30000, // 30 seconds
  maxHistoryPoints: 50,
  complianceThreshold: 70,
  sections: [
    'architectural',
    'performance', 
    'integration',
    'constitutional'
  ]
};

/**
 * Load compliance results from test outputs
 */
async function loadComplianceData() {
  const data = {
    timestamp: new Date().toISOString(),
    architectural: null,
    performance: null,
    integration: null,
    constitutional: null,
    overall: {
      status: 'unknown',
      score: 0,
      issues: []
    }
  };
  
  try {
    // Load architectural compliance
    const archPath = path.join(__dirname, 'architectural-results.json');
    if (await fileExists(archPath)) {
      data.architectural = JSON.parse(await fs.readFile(archPath, 'utf-8'));
    }
    
    // Load performance benchmarks
    const perfPath = path.join(__dirname, 'performance-results.json');
    if (await fileExists(perfPath)) {
      data.performance = JSON.parse(await fs.readFile(perfPath, 'utf-8'));
    }
    
    // Load integration test results
    const integPath = path.join(__dirname, 'integration-results.json');
    if (await fileExists(integPath)) {
      data.integration = JSON.parse(await fs.readFile(integPath, 'utf-8'));
    }
    
    // Load constitutional compliance
    const constPath = path.join(__dirname, 'constitutional-results.json');
    if (await fileExists(constPath)) {
      data.constitutional = JSON.parse(await fs.readFile(constPath, 'utf-8'));
    }
    
    // Calculate overall status
    data.overall = calculateOverallStatus(data);
    
  } catch (error) {
    console.warn('Error loading compliance data:', error.message);
  }
  
  return data;
}

/**
 * Calculate overall compliance status
 */
function calculateOverallStatus(data) {
  const scores = [];
  const issues = [];
  
  // Architectural compliance
  if (data.architectural?.complianceRate) {
    scores.push(data.architectural.complianceRate);
    if (data.architectural.complianceRate < DASHBOARD_CONFIG.complianceThreshold) {
      issues.push(`Architectural compliance below ${DASHBOARD_CONFIG.complianceThreshold}%`);
    }
  }
  
  // Performance benchmarks
  if (data.performance?.results) {
    const perfScore = (data.performance.results.filter(r => r.passed).length / data.performance.results.length) * 100;
    scores.push(perfScore);
    if (!data.performance.overallPassed) {
      issues.push('Performance regression detected');
    }
  }
  
  // Integration consistency
  if (data.integration?.results) {
    const integScore = (data.integration.results.filter(r => r.consistent).length / data.integration.results.length) * 100;
    scores.push(integScore);
    if (integScore < 100) {
      issues.push('Cross-adapter consistency issues');
    }
  }
  
  // Calculate overall score
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  
  let status = 'pass';
  if (overallScore < 70) status = 'fail';
  else if (overallScore < 85) status = 'warn';
  
  return {
    status,
    score: overallScore,
    issues
  };
}

/**
 * Load historical compliance data
 */
async function loadHistoricalData() {
  try {
    const historyPath = path.join(__dirname, 'compliance-history.json');
    if (await fileExists(historyPath)) {
      const history = JSON.parse(await fs.readFile(historyPath, 'utf-8'));
      return history.slice(-DASHBOARD_CONFIG.maxHistoryPoints);
    }
  } catch (error) {
    console.warn('Error loading historical data:', error.message);
  }
  
  return [];
}

/**
 * Save compliance data to history
 */
async function saveToHistory(data) {
  try {
    const historyPath = path.join(__dirname, 'compliance-history.json');
    let history = await loadHistoricalData();
    
    history.push({
      timestamp: data.timestamp,
      score: data.overall.score,
      status: data.overall.status,
      architectural: data.architectural?.complianceRate || null,
      performance: data.performance?.overallPassed || null,
      integration: data.integration?.consistent || null
    });
    
    // Keep only recent history
    history = history.slice(-DASHBOARD_CONFIG.maxHistoryPoints);
    
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.warn('Error saving history:', error.message);
  }
}

/**
 * Generate HTML dashboard
 */
function generateDashboardHTML(data, history) {
  const historyData = history.map(h => h.score).join(',');
  const historyLabels = history.map(h => new Date(h.timestamp).toLocaleTimeString()).join('","');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${DASHBOARD_CONFIG.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; padding: 20px; background: #f5f5f5;
        }
        .header { 
            background: white; padding: 20px; border-radius: 8px; 
            margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-${data.overall.status} { 
            color: ${data.overall.status === 'pass' ? '#28a745' : data.overall.status === 'warn' ? '#ffc107' : '#dc3545'};
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { 
            background: white; padding: 20px; border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .chart-container { height: 300px; margin: 20px 0; }
        .issues { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; }
        .refresh { float: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${DASHBOARD_CONFIG.title}</h1>
        <div class="refresh">
            Last updated: ${new Date(data.timestamp).toLocaleString()}
            <button onclick="location.reload()">Refresh</button>
        </div>
        <div class="metric status-${data.overall.status}">
            Overall Compliance: ${data.overall.score}%
        </div>
        ${data.overall.issues.length > 0 ? `
        <div class="issues">
            <strong>Issues:</strong>
            <ul>${data.overall.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
        </div>
        ` : ''}
    </div>

    <div class="grid">
        <div class="card">
            <h2>📊 Compliance Trend</h2>
            <div class="chart-container">
                <canvas id="trendChart"></canvas>
            </div>
        </div>

        <div class="card">
            <h2>🏗️ Architectural Compliance</h2>
            ${data.architectural ? `
                <div class="metric">${data.architectural.complianceRate}%</div>
                <p>Violations: ${data.architectural.totalViolations || 0}</p>
                <p>Files scanned: ${data.architectural.totalFiles || 0}</p>
            ` : '<p>No data available</p>'}
        </div>

        <div class="card">
            <h2>🚀 Performance Benchmarks</h2>
            ${data.performance ? `
                <div class="metric">${data.performance.overallPassed ? '✅' : '❌'}</div>
                <p>Benchmarks: ${data.performance.results?.filter(r => r.passed).length || 0}/${data.performance.results?.length || 0} passed</p>
            ` : '<p>No data available</p>'}
        </div>

        <div class="card">
            <h2>🔄 Cross-Adapter Consistency</h2>
            ${data.integration ? `
                <div class="metric">${data.integration.consistent ? '✅' : '❌'}</div>
                <p>Scenarios: ${data.integration.results?.filter(r => r.consistent).length || 0}/${data.integration.results?.length || 0} consistent</p>
            ` : '<p>No data available</p>'}
        </div>

        <div class="card">
            <h2>⚖️ Constitutional Compliance</h2>
            ${data.constitutional ? `
                <div class="metric">${data.constitutional.overallCompliance || 0}%</div>
                <p>Principles: ${data.constitutional.passedPrinciples || 0}/${data.constitutional.totalPrinciples || 10} compliant</p>
            ` : '<p>No data available</p>'}
        </div>
    </div>

    <div class="footer">
        <p>🧙🏽‍♂️ Leviathan Intelligence System (sponsored by Kingly Agency)</p>
        <p>Auto-refresh every ${DASHBOARD_CONFIG.refreshInterval / 1000} seconds</p>
    </div>

    <script>
        // Trend chart
        const ctx = document.getElementById('trendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["${historyLabels}"],
                datasets: [{
                    label: 'Compliance Score',
                    data: [${historyData}],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0,123,255,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Auto-refresh
        setTimeout(() => location.reload(), ${DASHBOARD_CONFIG.refreshInterval});
    </script>
</body>
</html>`;
}

/**
 * Generate compliance dashboard
 */
async function generateComplianceDashboard() {
  console.log('📊 Generating Compliance Dashboard...');
  
  try {
    // Load current and historical data
    const data = await loadComplianceData();
    const history = await loadHistoricalData();
    
    // Save current data to history
    await saveToHistory(data);
    
    // Generate HTML dashboard
    const html = generateDashboardHTML(data, history);
    
    // Save dashboard
    const dashboardPath = path.join(__dirname, 'compliance-dashboard.html');
    await fs.writeFile(dashboardPath, html);
    
    console.log(`✅ Dashboard generated: ${dashboardPath}`);
    console.log(`📈 Overall compliance: ${data.overall.score}% (${data.overall.status})`);
    
    return dashboardPath;
  } catch (error) {
    console.error('Failed to generate dashboard:', error.message);
    throw error;
  }
}

/**
 * Utility function to check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateComplianceDashboard().catch(console.error);
}

export { generateComplianceDashboard, loadComplianceData, DASHBOARD_CONFIG };