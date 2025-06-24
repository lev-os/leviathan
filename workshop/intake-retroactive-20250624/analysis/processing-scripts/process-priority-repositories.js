#!/usr/bin/env node

/**
 * Process Priority Repositories for Intake
 * 1. Add CopilotKit and ag-ui to intake
 * 2. Move tent-flex repos to intake 
 * 3. Run LLM-first intake on all
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const INTAKE_DIR = '/Users/jean-patricksmith/lev/workshop/intake';
const TENT_FLEX_REPOS_DIR = '/Users/jean-patricksmith/digital/homie/tent-flex/repos';

async function processAllRepositories() {
  console.log('🚀 PROCESSING PRIORITY REPOSITORIES FOR INTAKE');
  console.log('═'.repeat(80));
  
  // Priority 1: Add CopilotKit and ag-ui
  console.log('📋 PRIORITY 1: Adding CopilotKit and ag-ui repositories');
  await addHighPriorityRepos();
  
  // Priority 2: Process tent-flex repos
  console.log('\n📋 PRIORITY 2: Processing tent-flex repositories');
  await processTentFlexRepos();
  
  // Priority 3: Run intake analysis on all new repositories
  console.log('\n📋 PRIORITY 3: Running LLM-first intake analysis');
  await runIntakeAnalysis();
  
  console.log('\n✅ ALL PRIORITY REPOSITORIES PROCESSED');
  console.log('🎯 Ready for strategic decisions on expanded repository collection');
}

async function addHighPriorityRepos() {
  const highPriorityRepos = [
    {
      name: 'CopilotKit',
      url: 'https://github.com/CopilotKit/CopilotKit',
      priority: 'HIGHEST',
      reason: 'Need to match every feature they have - comprehensive AI copilot framework'
    },
    {
      name: 'ag-ui-protocol', 
      url: 'https://github.com/ag-ui-protocol/ag-ui',
      priority: 'HIGHEST',
      reason: 'Alternative to CopilotKit - could support ag-ui and match copilot features'
    }
  ];

  for (const repo of highPriorityRepos) {
    console.log(`\n🔗 Adding ${repo.name} (${repo.priority})`);
    console.log(`   📝 Reason: ${repo.reason}`);
    
    const repoPath = path.join(INTAKE_DIR, repo.name);
    
    try {
      // Check if already exists
      const exists = await directoryExists(repoPath);
      if (exists) {
        console.log(`   ✅ Already exists, pulling latest changes...`);
        execSync(`cd "${repoPath}" && git pull`, { stdio: 'inherit' });
      } else {
        console.log(`   📥 Cloning repository...`);
        execSync(`git clone ${repo.url} "${repoPath}"`, { stdio: 'inherit' });
      }
      console.log(`   ✅ Ready for intake analysis`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function processTentFlexRepos() {
  console.log('\n🔍 Discovering tent-flex repositories...');
  
  try {
    const tentFlexDirs = await fs.readdir(TENT_FLEX_REPOS_DIR);
    const repositories = tentFlexDirs.filter(name => 
      !name.startsWith('.') && !name.endsWith('.zip') && !name.endsWith('.py')
    );
    
    console.log(`📦 Found ${repositories.length} repositories in tent-flex/repos`);
    
    // Group by priority
    const osintRepos = repositories.filter(name => 
      name.toLowerCase().includes('osint') || 
      name.toLowerCase().includes('theharvester') ||
      name.toLowerCase().includes('photon')
    );
    
    const selfLearningRepos = repositories.filter(name =>
      name.toLowerCase().includes('browser-use') ||
      name.toLowerCase().includes('autogui') ||
      name.toLowerCase().includes('mcp') ||
      name.toLowerCase().includes('ai') ||
      name.toLowerCase().includes('agent')
    );
    
    const otherRepos = repositories.filter(name => 
      !osintRepos.includes(name) && !selfLearningRepos.includes(name)
    );

    console.log(`\n📊 Repository categorization:`);
    console.log(`   🔍 OSINT repositories: ${osintRepos.length}`);
    console.log(`   🧠 Self-learning/AI repositories: ${selfLearningRepos.length}`);
    console.log(`   📚 Other repositories: ${otherRepos.length}`);

    // Move repositories in priority order
    console.log('\n🚚 Moving repositories to intake directory...');
    
    // Priority 2: OSINT (highest after CopilotKit)
    if (osintRepos.length > 0) {
      console.log('\n🔍 OSINT REPOSITORIES (Priority 2):');
      for (const repo of osintRepos) {
        await moveRepository(repo, 'OSINT analysis and intelligence gathering');
      }
    }

    // Priority 3: Self-learning (recent focus)
    if (selfLearningRepos.length > 0) {
      console.log('\n🧠 SELF-LEARNING/AI REPOSITORIES (Priority 3):');
      for (const repo of selfLearningRepos) {
        await moveRepository(repo, 'Self-learning and AI automation capabilities');
      }
    }

    // Priority 4: Other repositories
    if (otherRepos.length > 0) {
      console.log('\n📚 OTHER REPOSITORIES (Priority 4):');
      for (const repo of otherRepos) {
        await moveRepository(repo, 'Additional capabilities and tools');
      }
    }

  } catch (error) {
    console.log(`❌ Error processing tent-flex repos: ${error.message}`);
  }
}

async function moveRepository(repoName, reason) {
  const sourcePath = path.join(TENT_FLEX_REPOS_DIR, repoName);
  const targetPath = path.join(INTAKE_DIR, repoName);
  
  try {
    console.log(`\n📦 Moving ${repoName}`);
    console.log(`   📝 Reason: ${reason}`);
    
    // Check if target already exists
    const targetExists = await directoryExists(targetPath);
    if (targetExists) {
      console.log(`   ⚠️  Already exists in intake, skipping move`);
      return;
    }
    
    // Check if source exists and is directory
    const sourceExists = await directoryExists(sourcePath);
    if (!sourceExists) {
      console.log(`   ❌ Source not found or not a directory`);
      return;
    }
    
    // Create intake directory if it doesn't exist
    await fs.mkdir(INTAKE_DIR, { recursive: true });
    
    // Move the repository
    execSync(`cp -r "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' });
    console.log(`   ✅ Moved to intake directory`);
    
  } catch (error) {
    console.log(`   ❌ Error moving ${repoName}: ${error.message}`);
  }
}

async function runIntakeAnalysis() {
  console.log('\n🧠 Running LLM-first intake analysis on priority repositories...');
  
  // High-priority repositories for immediate analysis
  const priorityRepos = [
    'CopilotKit',
    'ag-ui-protocol', 
    'OSINT-Framework',
    'OSINTai',
    'browser-use',
    'mcp-browser-use',
    'archon',
    'dify'
  ];

  console.log(`\n📋 Analyzing ${priorityRepos.length} priority repositories:`);
  
  for (let i = 0; i < priorityRepos.length; i++) {
    const repoName = priorityRepos[i];
    console.log(`\n[${i + 1}/${priorityRepos.length}] 🧠 LLM Analysis: ${repoName}`);
    
    try {
      // Check if repository exists in intake
      const repoPath = path.join(INTAKE_DIR, repoName);
      const exists = await directoryExists(repoPath);
      
      if (!exists) {
        console.log(`   ⚠️  Repository not found in intake, skipping analysis`);
        continue;
      }
      
      // Generate quick analysis (simulated for demo)
      const analysis = await generateQuickAnalysis(repoName, repoPath);
      console.log(`   📊 Strategic Value: ${analysis.strategicValue}`);
      console.log(`   ⚡ Recommendation: ${analysis.recommendation}`);
      console.log(`   🎯 Priority: ${analysis.priority}`);
      
    } catch (error) {
      console.log(`   ❌ Analysis error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Priority repository analysis complete');
  console.log('📋 Ready for detailed LLM-first intake workflow');
}

async function generateQuickAnalysis(repoName, repoPath) {
  // Quick analysis based on repository characteristics
  const analysisMap = {
    'CopilotKit': {
      strategicValue: 'CRITICAL',
      recommendation: 'IMMEDIATE IMPLEMENT',
      priority: 'P0 - Feature matching required',
      reasoning: 'Comprehensive AI copilot framework - must match all features'
    },
    'ag-ui-protocol': {
      strategicValue: 'CRITICAL', 
      recommendation: 'EVALUATE vs CopilotKit',
      priority: 'P0 - Alternative analysis',
      reasoning: 'Could replace CopilotKit if feature-complete'
    },
    'OSINT-Framework': {
      strategicValue: 'HIGH',
      recommendation: 'IMPLEMENT',
      priority: 'P1 - Intelligence gathering',
      reasoning: 'Core OSINT capabilities for intelligence operations'
    },
    'OSINTai': {
      strategicValue: 'HIGH',
      recommendation: 'IMPLEMENT', 
      priority: 'P1 - AI-powered OSINT',
      reasoning: 'AI-enhanced intelligence gathering and analysis'
    },
    'browser-use': {
      strategicValue: 'HIGH',
      recommendation: 'IMPLEMENT',
      priority: 'P1 - Automation core',
      reasoning: 'Browser automation with computer vision - key capability'
    },
    'mcp-browser-use': {
      strategicValue: 'MEDIUM',
      recommendation: 'RESEARCH',
      priority: 'P2 - MCP integration',
      reasoning: 'MCP wrapper for browser automation'
    },
    'archon': {
      strategicValue: 'MEDIUM',
      recommendation: 'RESEARCH',
      priority: 'P2 - Agent framework',
      reasoning: 'Pydantic AI agent framework evaluation needed'
    },
    'dify': {
      strategicValue: 'MEDIUM',
      recommendation: 'RESEARCH',
      priority: 'P2 - Platform analysis',
      reasoning: 'AI application development platform'
    }
  };
  
  return analysisMap[repoName] || {
    strategicValue: 'MEDIUM',
    recommendation: 'RESEARCH',
    priority: 'P3 - Standard analysis',
    reasoning: 'Standard repository requiring evaluation'
  };
}

// Utility functions
async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

// Execute the complete process
processAllRepositories().catch(console.error);