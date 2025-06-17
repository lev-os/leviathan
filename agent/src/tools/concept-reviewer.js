// Concept Reviewer - Human-assisted review of context note evolution
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { ConceptSynthesizer } from './concept-synthesizer.js';

export class ConceptReviewer {
  constructor() {
    this.synthesizer = new ConceptSynthesizer();
    this.reviewDir = './tmp/concept-review';
  }

  async createReviewSession(options = {}) {
    const { outputDir = this.reviewDir } = options;
    
    console.log('📋 Creating concept review session...');
    
    await fs.ensureDir(outputDir);
    
    // Run concept synthesis first
    const synthesis = await this.synthesizer.synthesizeAll({
      outputDir: path.join(outputDir, 'synthesis')
    });
    
    // Create human-friendly review structure
    const reviewStructure = await this.createReviewStructure(synthesis, outputDir);
    
    // Generate review interface
    await this.generateReviewInterface(reviewStructure, outputDir);
    
    return {
      reviewDir: outputDir,
      conceptGroups: reviewStructure.groups.length,
      totalNotes: synthesis.notes
    };
  }

  async createReviewStructure(synthesis, outputDir) {
    console.log('🗂️  Creating review structure...');
    
    // Load the synthesis report
    const synthesisReport = await fs.readJson(
      path.join(outputDir, 'synthesis', 'concept-synthesis-report.json')
    );
    
    const reviewStructure = {
      groups: [],
      unique: [],
      decisions: {}
    };
    
    // Create review groups for concepts with multiple iterations
    for (const [conceptName, concept] of Object.entries(synthesisReport.concepts)) {
      if (concept.source === 'evolution-synthesis' && concept.iterations > 1) {
        const groupDir = path.join(outputDir, 'groups', this.sanitizeName(conceptName));
        await fs.ensureDir(groupDir);
        
        const group = await this.createConceptGroup(concept, groupDir);
        reviewStructure.groups.push(group);
        
        // Initialize decision template
        reviewStructure.decisions[conceptName] = {
          decision: 'pending',
          rationale: '',
          selectedFeatures: {},
          customMerge: null
        };
      } else {
        // Single notes go to unique list
        reviewStructure.unique.push({
          name: conceptName,
          concept,
          action: 'auto-include'
        });
      }
    }
    
    // Write review decisions template
    await fs.writeFile(
      path.join(outputDir, 'decisions.yaml'),
      yaml.dump(reviewStructure.decisions, { indent: 2 })
    );
    
    // Write review structure summary
    await fs.writeFile(
      path.join(outputDir, 'review-structure.json'),
      JSON.stringify(reviewStructure, null, 2)
    );
    
    return reviewStructure;
  }

  async createConceptGroup(concept, groupDir) {
    console.log(`📝 Creating review group: ${concept.name}`);
    
    const group = {
      name: concept.name,
      type: concept.type,
      iterations: concept.iterations,
      versions: [],
      diffReport: null,
      recommendedAction: this.recommendAction(concept)
    };
    
    // Create version files for each evolution step
    if (concept.keyEvolutions) {
      for (let i = 0; i < concept.keyEvolutions.length; i++) {
        const evolution = concept.keyEvolutions[i];
        const versionFile = path.join(groupDir, `version-${i + 1}-${evolution.to}.yaml`);
        
        // We need to get the actual content for this version
        // This is a simplified version - in real implementation we'd need to track back to original files
        const versionContent = {
          name: concept.name,
          type: concept.type,
          evolution_info: {
            iteration: i + 1,
            location: evolution.to,
            changes: evolution.changes
          },
          // This would contain the actual context content from that iteration
          ...concept.finalContent
        };
        
        await fs.writeFile(versionFile, yaml.dump(versionContent, { indent: 2 }));
        
        group.versions.push({
          file: `version-${i + 1}-${evolution.to}.yaml`,
          location: evolution.to,
          changes: evolution.changes.length
        });
      }
    }
    
    // Create diff report
    const diffReport = await this.createDiffReport(concept, groupDir);
    group.diffReport = 'diff-analysis.md';
    
    return group;
  }

  async createDiffReport(concept, groupDir) {
    const diffContent = `# Concept Evolution Analysis: ${concept.name}

## Overview
- **Type**: ${concept.type}
- **Total Iterations**: ${concept.iterations}
- **Evolution Source**: ${concept.source}

## Key Evolution Steps

${concept.keyEvolutions?.map((evo, i) => `
### Step ${i + 1}: ${evo.from} → ${evo.to}

**Changes Made** (${evo.changes.length} total):
${evo.changes.map(change => {
  switch (change.type) {
    case 'added':
      return `- ✅ **Added** \`${change.field}\`: ${this.formatValue(change.value)}`;
    case 'removed':
      return `- ❌ **Removed** \`${change.field}\``;
    case 'modified':
      return `- 🔄 **Modified** \`${change.field}\`\n  - From: ${this.formatValue(change.from)}\n  - To: ${this.formatValue(change.to)}`;
    default:
      return `- 🔧 **${change.type}** \`${change.field}\``;
  }
}).join('\n')}
`).join('\n') || 'No detailed evolution tracked'}

## Synthesized Concepts

**Keywords**: ${concept.synthesizedConcepts?.keywords?.join(', ') || 'None'}
**Patterns**: ${concept.synthesizedConcepts?.patterns?.join(', ') || 'None'}
**Capabilities**: ${concept.synthesizedConcepts?.capabilities?.join(', ') || 'None'}

## Evolution Summary

${concept.evolutionSummary ? `
- **Total Changes**: ${concept.evolutionSummary.totalChanges}
- **Major Additions**: ${concept.evolutionSummary.majorAdditions.join(', ') || 'None'}
- **Refinements**: ${concept.evolutionSummary.refinements.join(', ') || 'None'}
` : 'No evolution summary available'}

## Recommended Action

${this.recommendAction(concept)}

## Review Notes

_Add your notes here about which version to keep or how to merge..._

`;

    await fs.writeFile(path.join(groupDir, 'diff-analysis.md'), diffContent);
    return diffContent;
  }

  formatValue(value) {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  recommendAction(concept) {
    if (concept.iterations === 1) {
      return '**Recommendation**: Keep as-is (single iteration)';
    }
    
    if (concept.iterations > 3) {
      return '**Recommendation**: Deep evolution detected - likely contains valuable refinements. Consider merging best features from multiple versions.';
    }
    
    if (concept.evolutionSummary?.majorAdditions?.length > 2) {
      return '**Recommendation**: Significant additions made - review for essential features to preserve.';
    }
    
    return '**Recommendation**: Review changes and select best version or merge key improvements.';
  }

  sanitizeName(name) {
    if (!name || typeof name !== 'string') {
      return 'unnamed-concept';
    }
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async generateReviewInterface(reviewStructure, outputDir) {
    console.log('🖥️  Generating review interface...');
    
    const interfaceContent = `# Context Notes Review Session

## Overview
- **Review Groups**: ${reviewStructure.groups.length} (concepts with multiple iterations)
- **Unique Concepts**: ${reviewStructure.unique.length} (single notes to auto-include)

## Review Process

1. **Examine each group** in \`groups/\` directory
2. **Read diff analysis** for each concept evolution
3. **Update decisions** in \`decisions.yaml\`
4. **Run merger** when review complete

## Review Groups

${reviewStructure.groups.map(group => `
### ${group.name} (${group.type})
- **Location**: \`groups/${this.sanitizeName(group.name)}/\`
- **Iterations**: ${group.iterations}
- **Versions**: ${group.versions.map(v => v.file).join(', ')}
- **Changes**: ${group.versions.reduce((sum, v) => sum + v.changes, 0)} total
- ${group.recommendedAction}

**Files to Review**:
- \`groups/${this.sanitizeName(group.name)}/diff-analysis.md\` - Evolution analysis
${group.versions.map(v => `- \`groups/${this.sanitizeName(group.name)}/${v.file}\` - Version from ${v.location}`).join('\n')}
`).join('\n')}

## Unique Concepts (Auto-Include)

${reviewStructure.unique.map(item => `- **${item.name}** (${item.concept.type}) - ${item.concept.source}`).join('\n')}

## Decision Options

For each concept group, update \`decisions.yaml\` with one of:

### Option 1: Keep Best Version
\`\`\`yaml
concept-name:
  decision: "keep-version"
  selectedVersion: "version-2-infrastructure"
  rationale: "Version 2 has most complete structure"
\`\`\`

### Option 2: Merge Features
\`\`\`yaml
concept-name:
  decision: "merge-features"
  selectedFeatures:
    base: "version-2"
    prompts: "version-1" 
    endpoints: "version-3"
  rationale: "Combine best prompts from v1 with structure from v2"
\`\`\`

### Option 3: Custom Merge
\`\`\`yaml
concept-name:
  decision: "custom-merge"
  customMerge: "manual-specification.yaml"
  rationale: "Need manual merge with custom logic"
\`\`\`

## Next Steps

1. Complete review of all groups
2. Update \`decisions.yaml\` with your choices
3. Run: \`node src/tools/concept-merger.js\`
4. Validate: \`node src/tools/context-validator.js ./contexts\`

---
*Generated by Context Notes Review System*
`;

    await fs.writeFile(path.join(outputDir, 'README.md'), interfaceContent);
    
    console.log(`📋 Review interface ready at ${outputDir}/README.md`);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const reviewer = new ConceptReviewer();
  
  const result = await reviewer.createReviewSession();
  
  console.log(`\n✅ Review session created:`);
  console.log(`   📁 Review directory: ${result.reviewDir}`);
  console.log(`   📋 Concept groups: ${result.conceptGroups}`);
  console.log(`   📝 Total notes: ${result.totalNotes}`);
  console.log(`\n👀 Next: Review ${result.reviewDir}/README.md for instructions`);
}