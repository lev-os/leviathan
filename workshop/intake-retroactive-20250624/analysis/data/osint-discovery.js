#!/usr/bin/env node

/**
 * Comprehensive OSINT Discovery Tool
 * Deep search for all OSINT materials across ~/digital
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const DIGITAL_ROOT = '/Users/jean-patricksmith/digital';

async function discoverOSINTMaterials() {
  console.log('🔍 COMPREHENSIVE OSINT DISCOVERY');
  console.log('═'.repeat(60));
  console.log(`Searching ${DIGITAL_ROOT} for all OSINT-related materials...`);
  console.log('');

  const osintFindings = {
    directories: [],
    files: [],
    tools: [],
    frameworks: [],
    configs: [],
    documentation: []
  };

  // Step 1: Find directories with OSINT-related names
  console.log('📁 STEP 1: Directory Discovery');
  await findOSINTDirectories(osintFindings);
  
  // Step 2: Find OSINT-related files
  console.log('\n📄 STEP 2: File Discovery'); 
  await findOSINTFiles(osintFindings);
  
  // Step 3: Analyze tent-flex OSINT tools
  console.log('\n🛠️  STEP 3: OSINT Tools Analysis');
  await analyzeOSINTTools(osintFindings);
  
  // Step 4: Search for intelligence-related content
  console.log('\n🔎 STEP 4: Content Analysis');
  await searchIntelligenceContent(osintFindings);
  
  // Step 5: Generate comprehensive report
  console.log('\n📊 STEP 5: Generating Report');
  await generateOSINTReport(osintFindings);

  console.log('\n✅ OSINT DISCOVERY COMPLETE');
  console.log(`📋 Found ${getTotalFindings(osintFindings)} OSINT-related items`);
  console.log('📄 Detailed report saved to: osint-comprehensive-report.json');
}

async function findOSINTDirectories(findings) {
  const searchPatterns = [
    'osint', 'OSINT', 'intelligence', 'recon', 'surveillance', 
    'investigation', 'analysis', 'monitoring', 'threat'
  ];

  for (const pattern of searchPatterns) {
    try {
      console.log(`   🔍 Searching for directories matching: ${pattern}`);
      
      // Use find command to search for directories
      const result = execSync(
        `find "${DIGITAL_ROOT}" -type d -iname "*${pattern}*" 2>/dev/null | head -20`,
        { encoding: 'utf8', timeout: 10000 }
      );
      
      if (result.trim()) {
        const dirs = result.trim().split('\n');
        for (const dir of dirs) {
          if (!findings.directories.some(d => d.path === dir)) {
            findings.directories.push({
              path: dir,
              name: path.basename(dir),
              pattern: pattern,
              type: 'directory'
            });
            console.log(`     📁 Found: ${path.basename(dir)}`);
          }
        }
      }
    } catch (error) {
      console.log(`     ⚠️  Search timeout for pattern: ${pattern}`);
    }
  }
}

async function findOSINTFiles(findings) {
  const filePatterns = [
    'osint', 'intelligence', 'recon', 'harvest', 'scan', 'monitor',
    'investigate', 'threat', 'socmint', 'geoint', 'humint'
  ];

  for (const pattern of filePatterns) {
    try {
      console.log(`   📄 Searching for files matching: ${pattern}`);
      
      const result = execSync(
        `find "${DIGITAL_ROOT}" -type f \\( -iname "*${pattern}*" -o -iname "*.py" -o -iname "*.js" -o -iname "*.md" \\) -exec grep -l "${pattern}" {} \\; 2>/dev/null | head -15`,
        { encoding: 'utf8', timeout: 8000 }
      );
      
      if (result.trim()) {
        const files = result.trim().split('\n');
        for (const file of files) {
          if (!findings.files.some(f => f.path === file)) {
            findings.files.push({
              path: file,
              name: path.basename(file),
              pattern: pattern,
              type: getFileType(file)
            });
            console.log(`     📄 Found: ${path.basename(file)}`);
          }
        }
      }
    } catch (error) {
      console.log(`     ⚠️  Search timeout for pattern: ${pattern}`);
    }
  }
}

async function analyzeOSINTTools(findings) {
  const tentFlexReposPath = path.join(DIGITAL_ROOT, 'homie/tent-flex/repos');
  
  try {
    const entries = await fs.readdir(tentFlexReposPath);
    const osintTools = entries.filter(name => 
      name.toLowerCase().includes('osint') ||
      name.toLowerCase().includes('harvest') ||
      name.toLowerCase().includes('photon') ||
      name.toLowerCase().includes('recon') ||
      name.toLowerCase().includes('intelligence')
    );

    console.log(`   🛠️  Found ${osintTools.length} OSINT tools in tent-flex/repos`);
    
    for (const tool of osintTools) {
      const toolPath = path.join(tentFlexReposPath, tool);
      const analysis = await analyzeOSINTTool(toolPath, tool);
      findings.tools.push(analysis);
      console.log(`     🔧 ${tool}: ${analysis.description || 'OSINT tool'}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error analyzing tent-flex tools: ${error.message}`);
  }
}

async function analyzeOSINTTool(toolPath, toolName) {
  const analysis = {
    name: toolName,
    path: toolPath,
    type: 'osint_tool',
    description: '',
    capabilities: [],
    requirements: [],
    integration_potential: 'medium'
  };

  try {
    // Check for README
    const readmePath = path.join(toolPath, 'README.md');
    const readmeExists = await fileExists(readmePath);
    
    if (readmeExists) {
      const readme = await fs.readFile(readmePath, 'utf8');
      analysis.description = extractDescription(readme);
      analysis.capabilities = extractCapabilities(readme);
    }

    // Check for requirements
    const requirementsPath = path.join(toolPath, 'requirements.txt');
    const requirementsExists = await fileExists(requirementsPath);
    
    if (requirementsExists) {
      const requirements = await fs.readFile(requirementsPath, 'utf8');
      analysis.requirements = requirements.split('\n').filter(line => line.trim());
    }

    // Analyze tool type and integration potential
    if (toolName.toLowerCase().includes('framework')) {
      analysis.integration_potential = 'high';
      analysis.type = 'osint_framework';
    } else if (toolName.toLowerCase().includes('ai')) {
      analysis.integration_potential = 'high';
      analysis.type = 'ai_osint_tool';
    }

  } catch (error) {
    analysis.description = `Error analyzing tool: ${error.message}`;
  }

  return analysis;
}

async function searchIntelligenceContent(findings) {
  const intelligenceKeywords = [
    'threat intelligence', 'social media intelligence', 'geospatial intelligence',
    'human intelligence', 'signals intelligence', 'cyber threat', 'attribution',
    'surveillance', 'reconnaissance', 'investigation', 'forensics'
  ];

  console.log('   🔎 Searching for intelligence-related content...');
  
  // Search in specific high-value directories
  const searchDirs = [
    'homie',
    'kingly', 
    '_research',
    'cyber',
    'lore'
  ];

  for (const dir of searchDirs) {
    const searchPath = path.join(DIGITAL_ROOT, dir);
    const exists = await directoryExists(searchPath);
    
    if (!exists) continue;
    
    console.log(`     📂 Searching in ${dir}/`);
    
    for (const keyword of intelligenceKeywords.slice(0, 3)) { // Limit to prevent timeout
      try {
        const result = execSync(
          `grep -r -l "${keyword}" "${searchPath}" 2>/dev/null | head -5`,
          { encoding: 'utf8', timeout: 5000 }
        );
        
        if (result.trim()) {
          const files = result.trim().split('\n');
          files.forEach(file => {
            if (!findings.documentation.some(d => d.path === file)) {
              findings.documentation.push({
                path: file,
                name: path.basename(file),
                keyword: keyword,
                type: 'intelligence_content'
              });
            }
          });
        }
      } catch (error) {
        // Continue on timeout/error
      }
    }
  }
}

async function generateOSINTReport(findings) {
  const report = {
    discovery_date: new Date().toISOString(),
    digital_root: DIGITAL_ROOT,
    summary: {
      total_directories: findings.directories.length,
      total_files: findings.files.length,
      total_tools: findings.tools.length,
      total_frameworks: findings.frameworks.length,
      total_configs: findings.configs.length,
      total_documentation: findings.documentation.length,
      total_findings: getTotalFindings(findings)
    },
    categories: {
      osint_tools: findings.tools.filter(t => t.type === 'osint_tool'),
      osint_frameworks: findings.tools.filter(t => t.type === 'osint_framework'),
      ai_osint_tools: findings.tools.filter(t => t.type === 'ai_osint_tool'),
      intelligence_content: findings.documentation,
      osint_directories: findings.directories,
      osint_files: findings.files
    },
    integration_opportunities: generateIntegrationOpportunities(findings),
    recommendations: generateRecommendations(findings),
    findings
  };

  // Save comprehensive report
  await fs.writeFile(
    '/Users/jean-patricksmith/digital/homie/osint-comprehensive-report.json',
    JSON.stringify(report, null, 2)
  );

  // Generate summary markdown
  const markdownReport = generateMarkdownSummary(report);
  await fs.writeFile(
    '/Users/jean-patricksmith/digital/homie/OSINT_DISCOVERY_SUMMARY.md',
    markdownReport
  );

  console.log('\n📊 OSINT DISCOVERY SUMMARY:');
  console.log(`   🛠️  OSINT Tools: ${report.categories.osint_tools.length}`);
  console.log(`   🔧 OSINT Frameworks: ${report.categories.osint_frameworks.length}`);
  console.log(`   🤖 AI OSINT Tools: ${report.categories.ai_osint_tools.length}`);
  console.log(`   📁 OSINT Directories: ${report.summary.total_directories}`);
  console.log(`   📄 OSINT Files: ${report.summary.total_files}`);
  console.log(`   📚 Intelligence Content: ${report.summary.total_documentation}`);
}

function generateIntegrationOpportunities(findings) {
  return [
    'OSINT Framework integration for systematic intelligence gathering',
    'AI-powered OSINT tools for automated analysis and correlation',
    'Browser automation tools for web-based intelligence collection',
    'Social media intelligence (SOCMINT) capability integration',
    'Threat intelligence platform development',
    'Multi-source intelligence fusion and analysis',
    'Real-time monitoring and alerting systems',
    'Investigation workflow automation'
  ];
}

function generateRecommendations(findings) {
  return [
    'Prioritize OSINT-Framework and OSINTai for immediate integration',
    'Evaluate browser-use tools for automated web intelligence collection',
    'Develop unified OSINT workflow using existing Kingly agent architecture',
    'Create intelligence analysis dashboard with LLM-powered insights',
    'Integrate OSINT capabilities with existing workshop intake system',
    'Build multi-modal intelligence analysis using vision and text models',
    'Establish secure data handling for sensitive intelligence operations',
    'Create training materials for OSINT methodology and tool usage'
  ];
}

function generateMarkdownSummary(report) {
  return `# OSINT Discovery Summary

**Discovery Date**: ${report.discovery_date}  
**Total Findings**: ${report.summary.total_findings} OSINT-related items

## 🎯 Key Discoveries

### 🛠️ OSINT Tools (${report.categories.osint_tools.length})
${report.categories.osint_tools.map(tool => `- **${tool.name}**: ${tool.description || 'OSINT tool'}`).join('\n')}

### 🔧 OSINT Frameworks (${report.categories.osint_frameworks.length})
${report.categories.osint_frameworks.map(framework => `- **${framework.name}**: ${framework.description || 'OSINT framework'}`).join('\n')}

### 🤖 AI OSINT Tools (${report.categories.ai_osint_tools.length})
${report.categories.ai_osint_tools.map(tool => `- **${tool.name}**: ${tool.description || 'AI-powered OSINT tool'}`).join('\n')}

## 🔗 Integration Opportunities
${report.integration_opportunities.map(opp => `- ${opp}`).join('\n')}

## 🎯 Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*Generated by OSINT Discovery Tool*`;
}

// Utility functions
function getTotalFindings(findings) {
  return findings.directories.length + 
         findings.files.length + 
         findings.tools.length + 
         findings.frameworks.length + 
         findings.configs.length + 
         findings.documentation.length;
}

function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const typeMap = {
    '.py': 'python_script',
    '.js': 'javascript_script', 
    '.md': 'documentation',
    '.json': 'configuration',
    '.yaml': 'configuration',
    '.yml': 'configuration',
    '.txt': 'text_file',
    '.sh': 'shell_script'
  };
  return typeMap[ext] || 'unknown';
}

function extractDescription(readme) {
  const lines = readme.split('\n');
  const descLine = lines.find(line => 
    line.trim() && 
    !line.startsWith('#') && 
    !line.startsWith('[![') &&
    line.length > 20
  );
  return descLine ? descLine.trim().substring(0, 200) : '';
}

function extractCapabilities(readme) {
  const capabilities = [];
  const lines = readme.toLowerCase().split('\n');
  
  const capabilityKeywords = [
    'reconnaissance', 'scanning', 'enumeration', 'harvesting',
    'monitoring', 'analysis', 'investigation', 'collection',
    'intelligence', 'surveillance', 'tracking', 'profiling'
  ];
  
  capabilityKeywords.forEach(keyword => {
    if (lines.some(line => line.includes(keyword))) {
      capabilities.push(keyword);
    }
  });
  
  return capabilities;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

// Execute OSINT discovery
discoverOSINTMaterials().catch(console.error);