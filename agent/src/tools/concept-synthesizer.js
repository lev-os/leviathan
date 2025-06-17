// Concept Synthesizer - Extract and globalize concepts from context "notes"
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';

export class ConceptSynthesizer {
  constructor() {
    this.conceptMap = new Map();
    this.evolutionTracker = new Map();
    this.conceptPatterns = new Map();
    this.globalConcepts = new Map();
  }

  async synthesizeAll(options = {}) {
    const { outputDir = './tmp/concept-synthesis' } = options;
    
    console.log('🧠 Analyzing concept evolution across all context notes...');
    
    await fs.ensureDir(outputDir);
    
    // Discover all context "notes"
    const contextNotes = await this.discoverContextNotes();
    
    // Analyze concepts in each note
    const conceptAnalysis = await this.analyzeConceptEvolution(contextNotes);
    
    // Synthesize global concepts
    const globalConcepts = await this.synthesizeGlobalConcepts(conceptAnalysis);
    
    // Generate synthesis report
    await this.generateSynthesisReport(globalConcepts, outputDir);
    
    return {
      notes: contextNotes.length,
      concepts: conceptAnalysis.size,
      globalConcepts: globalConcepts.size,
      outputDir
    };
  }

  async discoverContextNotes() {
    console.log('📝 Discovering all context notes...');
    
    const contextFiles = await glob([
      '**/contexts/**/*.yaml',
      '**/context/*.yaml'
    ], {
      cwd: process.env.HOME,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/lore/**']
    });

    const notes = [];
    
    for (const filePath of contextFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const context = yaml.load(content);
        
        notes.push({
          path: filePath,
          relativePath: path.relative(process.env.HOME, filePath),
          content: context,
          rawContent: content,
          timestamp: (await fs.stat(filePath)).mtime,
          // Infer "note location" from path
          location: this.inferNoteLocation(filePath),
          // Extract concept indicators
          concepts: this.extractConcepts(context, content)
        });
        
      } catch (error) {
        console.error(`Error reading note ${filePath}:`, error.message);
      }
    }

    // Sort by timestamp to understand evolution
    notes.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`Found ${notes.length} context notes across ${new Set(notes.map(n => n.location)).size} locations`);
    
    return notes;
  }

  inferNoteLocation(filePath) {
    const pathParts = filePath.split(path.sep);
    
    // Map common locations
    if (pathParts.includes('mcp-ceo')) return 'mcp-ceo';
    if (pathParts.includes('_infra')) return 'infrastructure';
    if (pathParts.includes('agent-zero-data')) return 'agent-zero-experiments';
    if (pathParts.includes('mcp-mvp')) return 'current-project';
    if (pathParts.includes('hub')) return 'kingly-hub';
    if (pathParts.includes('agency')) return 'agency-experiments';
    
    return 'unknown';
  }

  extractConcepts(context, rawContent) {
    const concepts = {
      // Structural concepts
      types: context.type ? [context.type] : [],
      patterns: [],
      capabilities: [],
      integrations: [],
      
      // Content concepts  
      keywords: this.extractKeywords(rawContent),
      promptPatterns: this.extractPromptPatterns(context),
      workflowPatterns: this.extractWorkflowPatterns(context),
      
      // Evolution indicators
      versioning: this.detectVersioning(context),
      experiments: this.detectExperiments(context, rawContent),
      refinements: this.detectRefinements(context, rawContent)
    };
    
    return concepts;
  }

  extractKeywords(content) {
    // Extract meaningful keywords that indicate concepts
    const keywords = new Set();
    
    // Look for specific concept patterns
    const conceptPatterns = [
      /\b(personality|agent|workflow|pattern|tool|integration)\b/gi,
      /\b(confidence|routing|inheritance|semantic|context)\b/gi,
      /\b(orchestration|coordination|synthesis|analysis)\b/gi,
      /\b(memory|state|session|persistence|vector)\b/gi,
      /\b(discord|crawler|composio|arcade|dify|aci)\b/gi,
      /\b(prompt|template|snippet|expansion|completion)\b/gi
    ];
    
    for (const pattern of conceptPatterns) {
      const matches = content.match(pattern) || [];
      matches.forEach(match => keywords.add(match.toLowerCase()));
    }
    
    return Array.from(keywords);
  }

  extractPromptPatterns(context) {
    const patterns = [];
    
    // Look for prompt-related structures
    if (context.prompts) {
      patterns.push('structured-prompts');
    }
    
    if (context.templates) {
      patterns.push('template-system');
    }
    
    // Look for specific prompt patterns in content
    const promptContent = JSON.stringify(context).toLowerCase();
    if (promptContent.includes('system')) patterns.push('system-prompts');
    if (promptContent.includes('personality')) patterns.push('personality-injection');
    if (promptContent.includes('context')) patterns.push('context-injection');
    
    return patterns;
  }

  extractWorkflowPatterns(context) {
    const patterns = [];
    
    if (context.workflow) {
      patterns.push('workflow-structure');
      
      if (context.workflow.steps) patterns.push('step-based');
      if (context.workflow.parallel) patterns.push('parallel-execution');
      if (context.workflow.coordination) patterns.push('coordination-pattern');
    }
    
    if (context.integration) {
      patterns.push('integration-aware');
    }
    
    return patterns;
  }

  detectVersioning(context) {
    const indicators = [];
    
    if (context.version) indicators.push('explicit-versioning');
    if (context.metadata?.version) indicators.push('metadata-versioning');
    
    return indicators;
  }

  detectExperiments(context, content) {
    const experiments = [];
    
    // Look for experimental indicators
    if (content.includes('experiment') || content.includes('test')) {
      experiments.push('experimental-feature');
    }
    
    if (content.includes('TODO') || content.includes('WIP')) {
      experiments.push('work-in-progress');
    }
    
    if (context.metadata?.tags?.includes('experimental')) {
      experiments.push('tagged-experimental');
    }
    
    return experiments;
  }

  detectRefinements(context, content) {
    const refinements = [];
    
    // Look for refinement indicators
    if (content.includes('improved') || content.includes('enhanced')) {
      refinements.push('improvement-iteration');
    }
    
    if (content.includes('fixed') || content.includes('corrected')) {
      refinements.push('bug-fixes');
    }
    
    if (context.metadata?.description?.includes('refined')) {
      refinements.push('documented-refinement');
    }
    
    return refinements;
  }

  async analyzeConceptEvolution(notes) {
    console.log('🔄 Analyzing concept evolution patterns...');
    
    const conceptEvolution = new Map();
    
    // Group notes by conceptual similarity
    const conceptGroups = this.groupNotesByConcept(notes);
    
    // Analyze evolution within each concept group
    for (const [conceptKey, noteGroup] of conceptGroups) {
      const evolution = this.traceConceptEvolution(noteGroup);
      conceptEvolution.set(conceptKey, evolution);
    }
    
    return conceptEvolution;
  }

  groupNotesByConcept(notes) {
    const groups = new Map();
    
    for (const note of notes) {
      // Create concept signature
      const signature = this.createConceptSignature(note);
      
      if (!groups.has(signature)) {
        groups.set(signature, []);
      }
      groups.get(signature).push(note);
    }
    
    return groups;
  }

  createConceptSignature(note) {
    const { content, concepts } = note;
    
    // Create a signature based on core concept elements
    const sig = {
      type: content.type || 'unknown',
      name: content.name || path.basename(path.dirname(note.path)),
      primaryConcepts: concepts.keywords.slice(0, 3).sort(),
      patterns: concepts.patterns.sort()
    };
    
    return JSON.stringify(sig);
  }

  traceConceptEvolution(noteGroup) {
    // Sort by timestamp to see evolution
    const sortedNotes = noteGroup.sort((a, b) => a.timestamp - b.timestamp);
    
    const evolution = {
      concept: this.extractCoreConcept(noteGroup[0]),
      iterations: sortedNotes.length,
      timeline: [],
      keyEvolutions: [],
      finalState: null
    };
    
    // Trace changes through timeline
    for (let i = 0; i < sortedNotes.length; i++) {
      const note = sortedNotes[i];
      const changes = i > 0 ? this.detectChanges(sortedNotes[i-1], note) : [];
      
      evolution.timeline.push({
        timestamp: note.timestamp,
        location: note.location,
        note: note.relativePath,
        changes,
        concepts: note.concepts
      });
      
      if (changes.length > 0) {
        evolution.keyEvolutions.push({
          from: i > 0 ? sortedNotes[i-1].location : 'initial',
          to: note.location,
          changes
        });
      }
    }
    
    evolution.finalState = sortedNotes[sortedNotes.length - 1];
    
    return evolution;
  }

  extractCoreConcept(note) {
    return {
      type: note.content.type,
      name: note.content.name,
      primaryKeywords: note.concepts.keywords.slice(0, 5)
    };
  }

  detectChanges(previousNote, currentNote) {
    const changes = [];
    
    // Compare structures
    const prevKeys = new Set(Object.keys(previousNote.content));
    const currKeys = new Set(Object.keys(currentNote.content));
    
    // New fields added
    for (const key of currKeys) {
      if (!prevKeys.has(key)) {
        changes.push({ type: 'added', field: key, value: currentNote.content[key] });
      }
    }
    
    // Fields removed  
    for (const key of prevKeys) {
      if (!currKeys.has(key)) {
        changes.push({ type: 'removed', field: key });
      }
    }
    
    // Fields modified
    for (const key of currKeys) {
      if (prevKeys.has(key)) {
        const prevValue = JSON.stringify(previousNote.content[key]);
        const currValue = JSON.stringify(currentNote.content[key]);
        if (prevValue !== currValue) {
          changes.push({ 
            type: 'modified', 
            field: key, 
            from: previousNote.content[key],
            to: currentNote.content[key]
          });
        }
      }
    }
    
    return changes;
  }

  async synthesizeGlobalConcepts(conceptEvolution) {
    console.log('🌐 Synthesizing global concepts...');
    
    const globalConcepts = new Map();
    
    for (const [conceptKey, evolution] of conceptEvolution) {
      const synthesized = this.synthesizeEvolutionToConcept(evolution);
      
      if (synthesized) {
        globalConcepts.set(synthesized.name, synthesized);
      }
    }
    
    return globalConcepts;
  }

  synthesizeEvolutionToConcept(evolution) {
    if (evolution.iterations === 1) {
      // Single note - might be unique concept
      return this.extractConceptFromSingleNote(evolution.finalState);
    }
    
    // Multiple iterations - synthesize learnings
    return this.synthesizeFromEvolution(evolution);
  }

  extractConceptFromSingleNote(note) {
    return {
      name: note.content.name || path.basename(path.dirname(note.path)),
      type: note.content.type,
      source: 'single-note',
      location: note.location,
      concepts: note.concepts,
      content: note.content,
      uniqueness: 'isolated-concept'
    };
  }

  synthesizeFromEvolution(evolution) {
    const finalNote = evolution.finalState;
    
    // Extract all learnings from evolution
    const allConcepts = new Set();
    const allCapabilities = new Set();
    const allPatterns = new Set();
    
    for (const timelineEntry of evolution.timeline) {
      timelineEntry.concepts.keywords.forEach(k => allConcepts.add(k));
      timelineEntry.concepts.capabilities.forEach(c => allCapabilities.add(c));
      timelineEntry.concepts.patterns.forEach(p => allPatterns.add(p));
    }
    
    return {
      name: finalNote.content.name,
      type: finalNote.content.type,
      source: 'evolution-synthesis',
      iterations: evolution.iterations,
      keyEvolutions: evolution.keyEvolutions,
      synthesizedConcepts: {
        keywords: Array.from(allConcepts),
        capabilities: Array.from(allCapabilities),
        patterns: Array.from(allPatterns)
      },
      finalContent: finalNote.content,
      evolutionSummary: this.summarizeEvolution(evolution)
    };
  }

  summarizeEvolution(evolution) {
    const summary = {
      totalChanges: evolution.keyEvolutions.length,
      majorAdditions: [],
      refinements: [],
      experiments: []
    };
    
    for (const keyEvolution of evolution.keyEvolutions) {
      for (const change of keyEvolution.changes) {
        if (change.type === 'added') {
          summary.majorAdditions.push(change.field);
        } else if (change.type === 'modified') {
          summary.refinements.push(change.field);
        }
      }
    }
    
    return summary;
  }

  async generateSynthesisReport(globalConcepts, outputDir) {
    console.log('📊 Generating concept synthesis report...');
    
    const report = {
      summary: {
        totalConcepts: globalConcepts.size,
        singleNotes: 0,
        evolvedConcepts: 0,
        generated: new Date().toISOString()
      },
      concepts: {},
      recommendations: []
    };
    
    // Organize concepts by type
    const conceptsByType = new Map();
    
    for (const [name, concept] of globalConcepts) {
      if (!conceptsByType.has(concept.type)) {
        conceptsByType.set(concept.type, []);
      }
      conceptsByType.get(concept.type).push(concept);
      
      // Update summary stats
      if (concept.source === 'single-note') {
        report.summary.singleNotes++;
      } else {
        report.summary.evolvedConcepts++;
      }
      
      report.concepts[name] = concept;
    }
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations(globalConcepts);
    
    // Write detailed report
    await fs.writeFile(
      path.join(outputDir, 'concept-synthesis-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    // Write human-readable summary
    const markdown = this.generateMarkdownReport(report, conceptsByType);
    await fs.writeFile(
      path.join(outputDir, 'concept-synthesis-summary.md'),
      markdown
    );
    
    console.log(`📝 Reports written to ${outputDir}`);
    
    return report;
  }

  generateRecommendations(globalConcepts) {
    const recommendations = [];
    
    // Identify concepts that should be globalized
    for (const [name, concept] of globalConcepts) {
      if (concept.source === 'evolution-synthesis' && concept.iterations > 2) {
        recommendations.push({
          type: 'globalize',
          concept: name,
          reason: `Evolved through ${concept.iterations} iterations - contains valuable learnings`,
          action: 'Extract patterns and create unified global context'
        });
      }
      
      if (concept.synthesizedConcepts?.patterns.length > 3) {
        recommendations.push({
          type: 'pattern-library',
          concept: name,
          reason: `Rich pattern evolution: ${concept.synthesizedConcepts.patterns.join(', ')}`,
          action: 'Extract patterns into reusable pattern library'
        });
      }
    }
    
    return recommendations;
  }

  generateMarkdownReport(report, conceptsByType) {
    let markdown = `# Context Notes Synthesis Report

Generated: ${report.summary.generated}

## Summary

- **Total Concepts**: ${report.summary.totalConcepts}
- **Single Notes**: ${report.summary.singleNotes}
- **Evolved Concepts**: ${report.summary.evolvedConcepts}

## Concepts by Type

`;

    for (const [type, concepts] of conceptsByType) {
      markdown += `### ${type}\n\n`;
      
      for (const concept of concepts) {
        markdown += `#### ${concept.name}\n`;
        markdown += `- **Source**: ${concept.source}\n`;
        
        if (concept.iterations) {
          markdown += `- **Iterations**: ${concept.iterations}\n`;
        }
        
        if (concept.synthesizedConcepts) {
          markdown += `- **Key Concepts**: ${concept.synthesizedConcepts.keywords.slice(0, 5).join(', ')}\n`;
          markdown += `- **Patterns**: ${concept.synthesizedConcepts.patterns.join(', ')}\n`;
        }
        
        markdown += '\n';
      }
    }

    markdown += `## Recommendations

`;

    for (const rec of report.recommendations) {
      markdown += `### ${rec.type}: ${rec.concept}

**Reason**: ${rec.reason}

**Action**: ${rec.action}

`;
    }

    return markdown;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const synthesizer = new ConceptSynthesizer();
  
  const result = await synthesizer.synthesizeAll();
  
  console.log(`\n✅ Concept synthesis complete:`);
  console.log(`   📝 Analyzed ${result.notes} context notes`);
  console.log(`   🧠 Found ${result.concepts} concept groups`);
  console.log(`   🌐 Synthesized ${result.globalConcepts} global concepts`);
  console.log(`   📊 Reports available in ${result.outputDir}`);
}