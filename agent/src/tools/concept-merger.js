// Concept Merger - Execute human decisions to merge evolved concepts
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

export class ConceptMerger {
  constructor() {
    this.targetDir = './contexts';
    this.decisions = null;
    this.synthesis = null;
    this.mergeLog = [];
  }

  async executeMerge(decisionsFile = './tmp/concept-review/decisions.yaml', options = {}) {
    const { dryRun = false, backup = true } = options;
    
    console.log('🔧 Executing concept merge based on human decisions...');
    
    // Load decisions and synthesis data
    await this.loadDecisions(decisionsFile);
    await this.loadSynthesis('./tmp/concept-review/synthesis/concept-synthesis-report.json');
    
    if (backup && !dryRun) {
      await this.createBackup();
    }
    
    // Execute merge decisions
    const results = await this.performMerge(dryRun);
    
    // Generate merge report
    await this.generateMergeReport(results);
    
    return results;
  }

  async loadDecisions(decisionsFile) {
    console.log(`📋 Loading decisions from ${decisionsFile}`);
    
    if (!await fs.pathExists(decisionsFile)) {
      throw new Error(`Decisions file not found: ${decisionsFile}`);
    }
    
    const content = await fs.readFile(decisionsFile, 'utf-8');
    this.decisions = yaml.load(content);
    
    console.log(`Loaded decisions for ${Object.keys(this.decisions).length} concepts`);
  }

  async loadSynthesis(synthesisFile) {
    console.log(`📊 Loading synthesis data from ${synthesisFile}`);
    
    if (!await fs.pathExists(synthesisFile)) {
      throw new Error(`Synthesis file not found: ${synthesisFile}`);
    }
    
    this.synthesis = await fs.readJson(synthesisFile);
    console.log(`Loaded synthesis for ${Object.keys(this.synthesis.concepts).length} concepts`);
  }

  async createBackup() {
    const backupDir = `./tmp/merge-backup-${Date.now()}`;
    console.log(`📦 Creating backup at ${backupDir}`);
    
    await fs.ensureDir(backupDir);
    
    if (await fs.pathExists(this.targetDir)) {
      await fs.copy(this.targetDir, path.join(backupDir, 'contexts'));
    }
    
    return backupDir;
  }

  async performMerge(dryRun) {
    console.log('🚀 Performing concept merge...');
    
    await fs.ensureDir(this.targetDir);
    
    const results = {
      processed: 0,
      merged: 0,
      kept: 0,
      created: 0,
      errors: [],
      dryRun
    };

    // Process decisions for evolved concepts
    for (const [conceptName, decision] of Object.entries(this.decisions)) {
      try {
        const concept = this.synthesis.concepts[conceptName];
        if (!concept) {
          results.errors.push(`Concept not found in synthesis: ${conceptName}`);
          continue;
        }

        await this.processConceptDecision(conceptName, concept, decision, dryRun);
        results.processed++;
        
        switch (decision.decision) {
          case 'merge-features':
            results.merged++;
            break;
          case 'keep-version':
            results.kept++;
            break;
          case 'custom-merge':
            results.created++;
            break;
        }
        
      } catch (error) {
        results.errors.push(`Error processing ${conceptName}: ${error.message}`);
      }
    }

    // Auto-include unique concepts
    const uniqueConcepts = Object.entries(this.synthesis.concepts)
      .filter(([name, concept]) => concept.source === 'single-note');
    
    for (const [conceptName, concept] of uniqueConcepts) {
      try {
        await this.processUniqueContext(conceptName, concept, dryRun);
        results.processed++;
        results.kept++;
      } catch (error) {
        results.errors.push(`Error processing unique concept ${conceptName}: ${error.message}`);
      }
    }

    return results;
  }

  async processConceptDecision(conceptName, concept, decision, dryRun) {
    console.log(`🔄 Processing ${conceptName}: ${decision.decision}`);
    
    this.mergeLog.push({
      concept: conceptName,
      decision: decision.decision,
      rationale: decision.rationale,
      timestamp: new Date().toISOString()
    });

    switch (decision.decision) {
      case 'keep-version':
        return await this.keepBestVersion(conceptName, concept, decision, dryRun);
        
      case 'merge-features':
        return await this.mergeFeatures(conceptName, concept, decision, dryRun);
        
      case 'custom-merge':
        return await this.customMerge(conceptName, concept, decision, dryRun);
        
      default:
        throw new Error(`Unknown decision type: ${decision.decision}`);
    }
  }

  async keepBestVersion(conceptName, concept, decision, dryRun) {
    // For keep-version, we use the final content from synthesis
    // In a more complete implementation, we'd track back to the specific version
    const targetPath = this.getTargetPath(concept);
    const content = concept.finalContent;
    
    if (dryRun) {
      console.log(`Would keep best version of ${conceptName} at ${targetPath}`);
      return;
    }
    
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, yaml.dump(content, { indent: 2 }));
    
    console.log(`✅ Kept best version: ${conceptName}`);
  }

  async mergeFeatures(conceptName, concept, decision, dryRun) {
    // Merge features from multiple versions based on human selection
    const mergedContent = this.performFeatureMerge(concept, decision.selectedFeatures);
    const targetPath = this.getTargetPath(concept);
    
    if (dryRun) {
      console.log(`Would merge features for ${conceptName} at ${targetPath}`);
      console.log(`Features: ${JSON.stringify(decision.selectedFeatures, null, 2)}`);
      return;
    }
    
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, yaml.dump(mergedContent, { indent: 2 }));
    
    console.log(`✅ Merged features: ${conceptName}`);
  }

  performFeatureMerge(concept, selectedFeatures) {
    // Start with base version
    let merged = { ...concept.finalContent };
    
    // Apply feature selections
    // This is a simplified version - in practice, you'd need more sophisticated merging
    for (const [feature, sourceVersion] of Object.entries(selectedFeatures)) {
      if (feature === 'base') continue; // Base is already applied
      
      // In a complete implementation, you'd extract specific features from sourceVersion
      // For now, we'll add a note about the merge
      merged.merge_info = merged.merge_info || {};
      merged.merge_info[feature] = `Selected from ${sourceVersion}`;
    }
    
    return merged;
  }

  async customMerge(conceptName, concept, decision, dryRun) {
    // For custom merge, look for custom specification file
    const customSpecFile = decision.customMerge;
    
    if (!customSpecFile) {
      throw new Error(`No custom merge specification provided for ${conceptName}`);
    }
    
    const customSpecPath = path.resolve('./tmp/concept-review', customSpecFile);
    
    if (!await fs.pathExists(customSpecPath)) {
      throw new Error(`Custom merge specification not found: ${customSpecPath}`);
    }
    
    const customSpec = yaml.load(await fs.readFile(customSpecPath, 'utf-8'));
    const targetPath = this.getTargetPath(concept);
    
    if (dryRun) {
      console.log(`Would apply custom merge for ${conceptName} using ${customSpecFile}`);
      return;
    }
    
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, yaml.dump(customSpec, { indent: 2 }));
    
    console.log(`✅ Applied custom merge: ${conceptName}`);
  }

  async processUniqueContext(conceptName, concept, dryRun) {
    // Auto-include unique concepts (single notes)
    const targetPath = this.getTargetPath(concept);
    const content = concept.content || concept.finalContent;
    
    if (dryRun) {
      console.log(`Would auto-include unique concept: ${conceptName} at ${targetPath}`);
      return;
    }
    
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, yaml.dump(content, { indent: 2 }));
    
    console.log(`📁 Auto-included: ${conceptName}`);
  }

  getTargetPath(concept) {
    const type = concept.type || 'unknown';
    const name = concept.slug || concept.name || 'unnamed';
    
    // Clean name for filesystem
    const cleanName = this.sanitizeName(name);
    const typeDir = type.endsWith('s') ? type : type + 's';
    
    return path.join(this.targetDir, typeDir, cleanName, 'context.yaml');
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

  async generateMergeReport(results) {
    const reportDir = './tmp/merge-report';
    await fs.ensureDir(reportDir);
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: results,
      mergeLog: this.mergeLog,
      decisions: this.decisions
    };
    
    // Write detailed report
    await fs.writeFile(
      path.join(reportDir, 'merge-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Write human-readable summary
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile(
      path.join(reportDir, 'merge-summary.md'),
      markdown
    );
    
    console.log(`📊 Merge report written to ${reportDir}`);
  }

  generateMarkdownReport(report) {
    return `# Concept Merge Report

Generated: ${report.timestamp}

## Summary

- **Total Processed**: ${report.summary.processed}
- **Merged Features**: ${report.summary.merged}
- **Kept Best Version**: ${report.summary.kept}
- **Custom Merges**: ${report.summary.created}
- **Errors**: ${report.summary.errors.length}
- **Dry Run**: ${report.summary.dryRun}

## Merge Actions

${report.mergeLog.map(log => `
### ${log.concept}
- **Decision**: ${log.decision}
- **Rationale**: ${log.rationale}
- **Timestamp**: ${log.timestamp}
`).join('\n')}

## Errors

${report.summary.errors.length > 0 ? 
  report.summary.errors.map(error => `- ${error}`).join('\n') :
  'No errors occurred during merge.'
}

## Next Steps

1. **Validate merged contexts**: \`node src/tools/context-validator.js ./contexts\`
2. **Test context loading**: Verify WorkflowLoader can load all contexts
3. **Update environment variables**: Set CONTEXTS_PATH in target projects
4. **Clean up source directories**: Remove old duplicate context directories

---
*Generated by Concept Merger*
`;
  }

  async validateDecisions(decisionsFile) {
    console.log('🔍 Validating decisions file...');
    
    const decisions = yaml.load(await fs.readFile(decisionsFile, 'utf-8'));
    const synthesis = await fs.readJson('./tmp/concept-review/synthesis/concept-synthesis-report.json');
    
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // Check all evolution concepts have decisions
    const evolvedConcepts = Object.entries(synthesis.concepts)
      .filter(([name, concept]) => concept.source === 'evolution-synthesis')
      .map(([name]) => name);
    
    for (const conceptName of evolvedConcepts) {
      if (!decisions[conceptName]) {
        validation.errors.push(`Missing decision for evolved concept: ${conceptName}`);
        validation.valid = false;
      } else {
        const decision = decisions[conceptName];
        if (!decision.decision || decision.decision === 'pending') {
          validation.warnings.push(`Pending decision for: ${conceptName}`);
        }
        
        if (!decision.rationale) {
          validation.warnings.push(`Missing rationale for: ${conceptName}`);
        }
      }
    }
    
    return validation;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const merger = new ConceptMerger();
  const decisionsFile = process.argv[2] || './tmp/concept-review/decisions.yaml';
  const dryRun = process.argv.includes('--dry-run');
  const noBackup = process.argv.includes('--no-backup');
  
  if (process.argv.includes('--validate')) {
    const validation = await merger.validateDecisions(decisionsFile);
    console.log('\n📋 Validation Results:');
    console.log(`Valid: ${validation.valid}`);
    if (validation.errors.length > 0) {
      console.log('\nErrors:');
      validation.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
    if (validation.warnings.length > 0) {
      console.log('\nWarnings:');
      validation.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    }
    process.exit(validation.valid ? 0 : 1);
  }
  
  const results = await merger.executeMerge(decisionsFile, {
    dryRun,
    backup: !noBackup
  });
  
  console.log(`\n✅ Merge complete:`);
  console.log(`   📝 Processed: ${results.processed} concepts`);
  console.log(`   🔄 Merged: ${results.merged} concepts`);
  console.log(`   📁 Kept: ${results.kept} concepts`);
  console.log(`   🔧 Custom: ${results.created} concepts`);
  if (results.errors.length > 0) {
    console.log(`   ❌ Errors: ${results.errors.length}`);
  }
}