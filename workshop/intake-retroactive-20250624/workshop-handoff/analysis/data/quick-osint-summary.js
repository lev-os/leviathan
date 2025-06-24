#!/usr/bin/env node

/**
 * Quick OSINT Summary
 * Fast identification of OSINT materials from known locations
 */

import fs from 'fs/promises';
import path from 'path';

async function quickOSINTSummary() {
  console.log('🔍 QUICK OSINT MATERIALS SUMMARY');
  console.log('═'.repeat(60));
  
  const osintFindings = {
    tent_flex_osint: [],
    intake_osint: [],
    cyber_materials: [],
    research_materials: []
  };

  // Check tent-flex OSINT repositories
  console.log('📦 TENT-FLEX OSINT REPOSITORIES:');
  await analyzeTentFlexOSINT(osintFindings);
  
  // Check intake directory for OSINT
  console.log('\n🏭 INTAKE DIRECTORY OSINT:');
  await analyzeIntakeOSINT(osintFindings);
  
  // Check cyber directory
  console.log('\n🔐 CYBER DIRECTORY:');
  await analyzeCyberDirectory(osintFindings);
  
  // Check research directory
  console.log('\n📚 RESEARCH DIRECTORY:');
  await analyzeResearchDirectory(osintFindings);

  // Generate summary
  console.log('\n📊 OSINT SUMMARY:');
  generateSummary(osintFindings);
  
  // Save findings
  await saveFindingsReport(osintFindings);
}

async function analyzeTentFlexOSINT(findings) {
  const tentFlexPath = '/Users/jean-patricksmith/digital/homie/tent-flex/repos';
  
  try {
    const entries = await fs.readdir(tentFlexPath);
    const osintRepos = entries.filter(name => 
      name.toLowerCase().includes('osint') ||
      name.toLowerCase().includes('harvest') ||
      name.toLowerCase().includes('photon') ||
      name.toLowerCase().includes('recon') ||
      name === 'theharvester'
    );
    
    for (const repo of osintRepos) {
      const repoPath = path.join(tentFlexPath, repo);
      const analysis = await quickAnalyze(repoPath, repo);
      findings.tent_flex_osint.push(analysis);
      console.log(`   🛠️  ${repo}: ${analysis.description}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function analyzeIntakeOSINT(findings) {
  const intakePath = '/Users/jean-patricksmith/lev/workshop/intake';
  
  try {
    const entries = await fs.readdir(intakePath);
    const osintRepos = entries.filter(name => 
      name.toLowerCase().includes('osint') ||
      name === 'Photon' ||
      name === 'theharvester'
    );
    
    for (const repo of osintRepos) {
      const analysis = { name: repo, location: 'intake', type: 'osint_tool' };
      findings.intake_osint.push(analysis);
      console.log(`   📋 ${repo}: Available in workshop intake`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error accessing intake: ${error.message}`);
  }
}

async function analyzeCyberDirectory(findings) {
  const cyberPath = '/Users/jean-patricksmith/digital/cyber';
  
  try {
    const exists = await directoryExists(cyberPath);
    if (!exists) {
      console.log('   📂 Cyber directory not found');
      return;
    }
    
    const entries = await fs.readdir(cyberPath);
    console.log(`   📂 Found ${entries.length} items in cyber directory`);
    
    for (const entry of entries.slice(0, 10)) { // Limit to first 10
      const entryPath = path.join(cyberPath, entry);
      const stat = await fs.stat(entryPath);
      
      if (stat.isDirectory()) {
        findings.cyber_materials.push({
          name: entry,
          path: entryPath,
          type: 'cyber_directory'
        });
        console.log(`     📁 ${entry}/`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function analyzeResearchDirectory(findings) {
  const researchPath = '/Users/jean-patricksmith/digital/_research';
  
  try {
    const exists = await directoryExists(researchPath);
    if (!exists) {
      console.log('   📂 Research directory not found');
      return;
    }
    
    const entries = await fs.readdir(researchPath);
    console.log(`   📂 Found ${entries.length} items in research directory`);
    
    // Look for intelligence-related materials
    const intelligenceItems = entries.filter(name =>
      name.toLowerCase().includes('intel') ||
      name.toLowerCase().includes('analysis') ||
      name.toLowerCase().includes('osint') ||
      name.toLowerCase().includes('threat')
    );
    
    for (const item of intelligenceItems) {
      findings.research_materials.push({
        name: item,
        path: path.join(researchPath, item),
        type: 'research_material'
      });
      console.log(`     🔬 ${item}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function quickAnalyze(itemPath, itemName) {
  const analysis = {
    name: itemName,
    path: itemPath,
    description: 'OSINT tool',
    type: 'osint_tool',
    capabilities: [],
    priority: 'medium'
  };
  
  // Quick analysis based on name
  if (itemName.toLowerCase().includes('framework')) {
    analysis.type = 'osint_framework';
    analysis.description = 'Comprehensive OSINT framework';
    analysis.priority = 'high';
  } else if (itemName.toLowerCase().includes('ai')) {
    analysis.type = 'ai_osint_tool';
    analysis.description = 'AI-powered OSINT tool';
    analysis.priority = 'high';
  } else if (itemName === 'theharvester') {
    analysis.description = 'Email harvesting and information gathering tool';
    analysis.capabilities = ['email_harvesting', 'subdomain_enumeration', 'virtual_host_discovery'];
  } else if (itemName === 'Photon') {
    analysis.description = 'Fast web crawler for OSINT reconnaissance';
    analysis.capabilities = ['web_crawling', 'data_extraction', 'reconnaissance'];
  }
  
  return analysis;
}

function generateSummary(findings) {
  const totalTools = findings.tent_flex_osint.length + findings.intake_osint.length;
  const totalDirectories = findings.cyber_materials.length;
  const totalResearch = findings.research_materials.length;
  
  console.log(`   🛠️  OSINT Tools Found: ${totalTools}`);
  console.log(`   📁 Cyber Directories: ${totalDirectories}`);
  console.log(`   📚 Research Materials: ${totalResearch}`);
  console.log(`   📊 Total OSINT Assets: ${totalTools + totalDirectories + totalResearch}`);
  
  console.log('\n🎯 HIGH-PRIORITY OSINT TOOLS:');
  const highPriorityTools = findings.tent_flex_osint.filter(tool => tool.priority === 'high');
  highPriorityTools.forEach(tool => {
    console.log(`   ⭐ ${tool.name}: ${tool.description}`);
  });
  
  console.log('\n🔗 INTEGRATION OPPORTUNITIES:');
  console.log('   • OSINT-Framework: Systematic intelligence gathering workflow');
  console.log('   • OSINTai: AI-powered intelligence analysis and correlation');
  console.log('   • TheHarvester: Email and subdomain intelligence collection');
  console.log('   • Photon: Fast web reconnaissance and data extraction');
  console.log('   • Browser automation: Automated OSINT data collection');
  console.log('   • Kingly integration: LLM-powered intelligence analysis');
}

async function saveFindingsReport(findings) {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      tent_flex_osint_tools: findings.tent_flex_osint.length,
      intake_osint_tools: findings.intake_osint.length,
      cyber_directories: findings.cyber_materials.length,
      research_materials: findings.research_materials.length
    },
    findings,
    recommendations: [
      'Prioritize OSINT-Framework and OSINTai for immediate workshop intake',
      'Integrate TheHarvester for email and domain intelligence',
      'Use Photon for automated web reconnaissance workflows',
      'Combine browser-use tools with OSINT for automated collection',
      'Develop LLM-powered intelligence analysis using Kingly agents',
      'Create secure OSINT workflow with data handling protocols'
    ]
  };
  
  await fs.writeFile(
    '/Users/jean-patricksmith/digital/homie/osint-quick-findings.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Quick findings saved to: osint-quick-findings.json');
}

async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

// Execute quick OSINT summary
quickOSINTSummary().catch(console.error);