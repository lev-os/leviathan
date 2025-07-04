import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import YAML from 'yaml';

interface StatsOptions {
  detailed?: boolean;
  json?: boolean;
}

interface CodexStats {
  overview: {
    totalEntries: number;
    paradigms: number;
    languages: number;
    frameworks: number;
    lastUpdated: string;
  };
  complexity: {
    easy: number;
    medium: number;
    advanced: number;
    expert: number;
  };
  coverage: {
    [key: string]: number;
  };
  health: {
    validEntries: number;
    invalidEntries: number;
    missingDescriptions: number;
    missingExamples: number;
  };
}

export async function statsCommand(options: StatsOptions) {
  console.log('📊 Analyzing Project Codex statistics...\n');
  
  try {
    const stats = await generateStats();
    
    if (options.json) {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }
    
    displayStats(stats, options.detailed);
    
  } catch (error) {
    console.error('❌ Failed to generate stats:', error.message);
    process.exit(1);
  }
}

async function generateStats(): Promise<CodexStats> {
  const stats: CodexStats = {
    overview: {
      totalEntries: 0,
      paradigms: 0,
      languages: 0,
      frameworks: 0,
      lastUpdated: new Date().toISOString()
    },
    complexity: {
      easy: 0,
      medium: 0,
      advanced: 0,
      expert: 0
    },
    coverage: {},
    health: {
      validEntries: 0,
      invalidEntries: 0,
      missingDescriptions: 0,
      missingExamples: 0
    }
  };
  
  const basePath = join(process.cwd(), 'packages', 'codex');
  
  // Analyze paradigms
  await analyzeDirectory(join(basePath, 'paradigms'), 'paradigm', stats);
  
  // Analyze languages
  await analyzeDirectory(join(basePath, 'languages'), 'language', stats);
  
  // Analyze frameworks
  await analyzeDirectory(join(basePath, 'frameworks'), 'framework', stats);
  
  return stats;
}

async function analyzeDirectory(dirPath: string, type: string, stats: CodexStats) {
  try {
    const items = await readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const contextFile = join(dirPath, item.name, 'context.yaml');
        try {
          const content = await readFile(contextFile, 'utf-8');
          const entry = YAML.parse(content);
          
          // Update overview counts
          stats.overview.totalEntries++;
          if (type === 'paradigm') stats.overview.paradigms++;
          if (type === 'language') stats.overview.languages++;
          if (type === 'framework') stats.overview.frameworks++;
          
          // Update complexity distribution
          if (entry.metadata?.complexity_level) {
            const complexity = entry.metadata.complexity_level;
            if (complexity in stats.complexity) {
              stats.complexity[complexity]++;
            }
          }
          
          // Update coverage by ecosystem
          if (entry.metadata?.ecosystem) {
            const ecosystem = entry.metadata.ecosystem;
            stats.coverage[ecosystem] = (stats.coverage[ecosystem] || 0) + 1;
          }
          
          // Health checks
          stats.health.validEntries++;
          
          if (!entry.description) {
            stats.health.missingDescriptions++;
          }
          
          // Check for examples
          const hasExamples = checkForExamples(entry);
          if (!hasExamples) {
            stats.health.missingExamples++;
          }
          
        } catch (err) {
          stats.health.invalidEntries++;
        }
      }
    }
  } catch (err) {
    // Directory doesn't exist
  }
}

function checkForExamples(entry: any): boolean {
  // Check for example files or example content
  if (entry.examples) return true;
  if (entry.example_file) return true;
  if (entry.patterns && typeof entry.patterns === 'object') {
    for (const pattern of Object.values(entry.patterns)) {
      if (pattern && typeof pattern === 'object' && (pattern as any).example) {
        return true;
      }
    }
  }
  return false;
}

function displayStats(stats: CodexStats, detailed?: boolean) {
  console.log('🎯 **Project Codex Overview**');
  console.log(`   Total Entries: ${stats.overview.totalEntries}`);
  console.log(`   📋 Paradigms: ${stats.overview.paradigms}`);
  console.log(`   💬 Languages: ${stats.overview.languages}`);
  console.log(`   🚀 Frameworks: ${stats.overview.frameworks}`);
  console.log('');
  
  console.log('⚡ **Complexity Distribution**');
  console.log(`   🟢 Easy: ${stats.complexity.easy}`);
  console.log(`   🟡 Medium: ${stats.complexity.medium}`);
  console.log(`   🟠 Advanced: ${stats.complexity.advanced}`);
  console.log(`   🔴 Expert: ${stats.complexity.expert}`);
  console.log('');
  
  if (Object.keys(stats.coverage).length > 0) {
    console.log('🌐 **Ecosystem Coverage**');
    Object.entries(stats.coverage)
      .sort(([,a], [,b]) => b - a)
      .forEach(([ecosystem, count]) => {
        console.log(`   ${ecosystem}: ${count}`);
      });
    console.log('');
  }
  
  console.log('🏥 **Health Metrics**');
  const healthPercentage = (stats.health.validEntries / (stats.health.validEntries + stats.health.invalidEntries) * 100).toFixed(1);
  console.log(`   ✅ Valid Entries: ${stats.health.validEntries} (${healthPercentage}%)`);
  
  if (stats.health.invalidEntries > 0) {
    console.log(`   ❌ Invalid Entries: ${stats.health.invalidEntries}`);
  }
  
  if (stats.health.missingDescriptions > 0) {
    console.log(`   📝 Missing Descriptions: ${stats.health.missingDescriptions}`);
  }
  
  if (stats.health.missingExamples > 0) {
    console.log(`   📚 Missing Examples: ${stats.health.missingExamples}`);
  }
  
  console.log('');
  
  if (detailed) {
    displayDetailedMetrics(stats);
  }
  
  // Quality score
  const qualityScore = calculateQualityScore(stats);
  console.log(`🎖️  **Overall Quality Score: ${qualityScore}/100**`);
  
  if (qualityScore < 80) {
    console.log('💡 Suggestions for improvement:');
    if (stats.health.missingDescriptions > 0) {
      console.log('   - Add descriptions to entries missing them');
    }
    if (stats.health.missingExamples > 0) {
      console.log('   - Add examples to improve practical value');
    }
    if (stats.health.invalidEntries > 0) {
      console.log('   - Fix invalid YAML syntax in entries');
    }
  }
}

function displayDetailedMetrics(stats: CodexStats) {
  console.log('📈 **Detailed Metrics**');
  
  const avgComplexity = calculateAverageComplexity(stats);
  console.log(`   Average Complexity: ${avgComplexity.toFixed(1)}/4`);
  
  const completenessScore = ((stats.overview.totalEntries - stats.health.missingDescriptions) / stats.overview.totalEntries * 100).toFixed(1);
  console.log(`   Documentation Completeness: ${completenessScore}%`);
  
  const exampleCoverage = ((stats.overview.totalEntries - stats.health.missingExamples) / stats.overview.totalEntries * 100).toFixed(1);
  console.log(`   Example Coverage: ${exampleCoverage}%`);
  
  console.log('');
}

function calculateAverageComplexity(stats: CodexStats): number {
  const complexityValues = {
    easy: 1,
    medium: 2,
    advanced: 3,
    expert: 4
  };
  
  let totalScore = 0;
  let totalCount = 0;
  
  Object.entries(stats.complexity).forEach(([level, count]) => {
    totalScore += complexityValues[level] * count;
    totalCount += count;
  });
  
  return totalCount > 0 ? totalScore / totalCount : 0;
}

function calculateQualityScore(stats: CodexStats): number {
  let score = 100;
  
  // Penalize invalid entries
  if (stats.health.invalidEntries > 0) {
    score -= (stats.health.invalidEntries / stats.overview.totalEntries) * 30;
  }
  
  // Penalize missing descriptions
  if (stats.health.missingDescriptions > 0) {
    score -= (stats.health.missingDescriptions / stats.overview.totalEntries) * 25;
  }
  
  // Penalize missing examples
  if (stats.health.missingExamples > 0) {
    score -= (stats.health.missingExamples / stats.overview.totalEntries) * 20;
  }
  
  return Math.max(0, Math.round(score));
}