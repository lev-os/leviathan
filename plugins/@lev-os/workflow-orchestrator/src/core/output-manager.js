/**
 * Output Manager - Intelligent output tracking and synthesis
 * 
 * Tracks ALL outputs from workflow steps:
 * - Markdown files and documentation
 * - Code files and implementations  
 * - PDFs and formal documents
 * - Scripts and executables
 * - JSON/YAML configurations
 * - Media files (diagrams, screenshots)
 * 
 * Intelligently decides what to feed to next steps
 */

import fs from 'fs/promises';
import path from 'path';

export class OutputManager {
  constructor(options = {}) {
    // Track outputs by orchestration ID
    this.orchestrationOutputs = new Map();
    
    // Output storage configuration
    this.outputDir = options.outputDir || path.join(process.cwd(), '.workflow-outputs');
    this.preserveOutputs = options.preserveOutputs !== false;
    
    // Type detection patterns
    this.typePatterns = {
      markdown: /\.(md|markdown)$/i,
      code: /\.(js|ts|py|go|java|cpp|c|rs|swift|kt|rb|php|cs)$/i,
      pdf: /\.pdf$/i,
      script: /\.(sh|bash|ps1|bat|cmd)$/i,
      config: /\.(json|yaml|yml|toml|ini|conf|config)$/i,
      image: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
      data: /\.(csv|tsv|xml|sql)$/i,
      document: /\.(txt|doc|docx|rtf)$/i
    };
    
    this.options = options;
  }

  /**
   * Track output from a workflow step
   */
  async track(orchestrationId, step, output, stepIndex) {
    // Get or create orchestration tracking
    if (!this.orchestrationOutputs.has(orchestrationId)) {
      this.orchestrationOutputs.set(orchestrationId, {
        steps: new Map(),
        files: new Map(),
        metadata: {
          startTime: Date.now(),
          outputCount: 0,
          fileCount: 0
        }
      });
    }
    
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    
    // Analyze output structure
    const analysis = await this.analyzeOutput(output);
    
    // Store step output
    const stepOutput = {
      stepId: step.id || `step-${stepIndex}`,
      stepName: step.name || step.id,
      timestamp: Date.now(),
      raw: output,
      analysis,
      files: [],
      extractedContent: {}
    };
    
    // Extract and save files if present
    if (analysis.hasFiles) {
      stepOutput.files = await this.extractAndSaveFiles(
        orchestrationId,
        stepIndex,
        output,
        analysis
      );
    }
    
    // Extract structured content
    stepOutput.extractedContent = this.extractStructuredContent(output, analysis);
    
    // Store in tracking
    orchOutputs.steps.set(stepOutput.stepId, stepOutput);
    orchOutputs.metadata.outputCount++;
    orchOutputs.metadata.fileCount += stepOutput.files.length;
    
    return stepOutput;
  }

  /**
   * Analyze output to understand its structure and content
   */
  async analyzeOutput(output) {
    const analysis = {
      type: this.detectOutputType(output),
      hasFiles: false,
      fileReferences: [],
      hasMarkdown: false,
      hasCode: false,
      hasStructuredData: false,
      contentTypes: new Set(),
      metrics: {}
    };
    
    // Check for different content types
    if (typeof output === 'string') {
      // Check for markdown
      if (output.includes('#') || output.includes('```')) {
        analysis.hasMarkdown = true;
        analysis.contentTypes.add('markdown');
      }
      
      // Check for code blocks
      if (output.includes('```')) {
        analysis.hasCode = true;
        analysis.contentTypes.add('code');
      }
      
      // Check for file references
      const fileMatches = output.match(/\b[\w\-\/]+\.([\w]+)\b/g);
      if (fileMatches) {
        analysis.hasFiles = true;
        analysis.fileReferences = fileMatches;
      }
      
    } else if (typeof output === 'object' && output !== null) {
      // Check for markdown in object properties
      if (output.markdown && typeof output.markdown === 'string') {
        analysis.hasMarkdown = true;
        analysis.contentTypes.add('markdown');
      }
      // Check for explicit file outputs
      if (output.files || output.outputs) {
        analysis.hasFiles = true;
        analysis.fileReferences = output.files || output.outputs;
      }
      
      // Check for structured data
      if (output.data || output.results) {
        analysis.hasStructuredData = true;
        analysis.contentTypes.add('structured');
      }
      
      // Recursively check properties
      this.analyzeObjectContent(output, analysis);
    }
    
    // Calculate metrics
    analysis.metrics = {
      size: JSON.stringify(output).length,
      complexity: this.calculateComplexity(output),
      informationDensity: this.calculateInformationDensity(output)
    };
    
    return analysis;
  }

  /**
   * Detect the primary type of output
   */
  detectOutputType(output) {
    if (typeof output === 'string') {
      // Check against type patterns
      for (const [type, pattern] of Object.entries(this.typePatterns)) {
        if (pattern.test(output)) {
          return type;
        }
      }
      
      // Content-based detection
      if (output.includes('```')) return 'code';
      if (output.startsWith('#') || output.includes('##')) return 'markdown';
      
      return 'text';
    }
    
    if (Array.isArray(output)) return 'array';
    if (output && typeof output === 'object') return 'object';
    
    return 'unknown';
  }

  /**
   * Extract and save files from output
   */
  async extractAndSaveFiles(orchestrationId, stepIndex, output, analysis) {
    const files = [];
    
    if (this.preserveOutputs) {
      // Create output directory
      const stepDir = path.join(
        this.outputDir,
        orchestrationId,
        `step-${stepIndex}`
      );
      await fs.mkdir(stepDir, { recursive: true });
      
      // Extract files based on output structure
      if (output.files && Array.isArray(output.files)) {
        // Explicit file array
        for (const file of output.files) {
          const savedFile = await this.saveFile(stepDir, file);
          files.push(savedFile);
        }
        
      } else if (output.markdown) {
        // Save markdown content
        const filename = `output-${stepIndex}.md`;
        const filepath = path.join(stepDir, filename);
        await fs.writeFile(filepath, output.markdown);
        files.push({
          name: filename,
          path: filepath,
          type: 'markdown',
          size: output.markdown.length
        });
        
      } else if (typeof output === 'string' && analysis.hasMarkdown) {
        // Save string output as markdown
        const filename = `output-${stepIndex}.md`;
        const filepath = path.join(stepDir, filename);
        await fs.writeFile(filepath, output);
        files.push({
          name: filename,
          path: filepath,
          type: 'markdown',
          size: output.length
        });
      }
      
      // Extract code blocks
      if (analysis.hasCode) {
        const codeBlocks = this.extractCodeBlocks(output);
        for (let i = 0; i < codeBlocks.length; i++) {
          const block = codeBlocks[i];
          const filename = `code-${stepIndex}-${i}.${block.language || 'txt'}`;
          const filepath = path.join(stepDir, filename);
          await fs.writeFile(filepath, block.code);
          files.push({
            name: filename,
            path: filepath,
            type: 'code',
            language: block.language,
            size: block.code.length
          });
        }
      }
    }
    
    return files;
  }

  /**
   * Save a file object
   */
  async saveFile(directory, file) {
    let filename, content;
    
    if (typeof file === 'string') {
      // Simple string - save as text
      filename = `file-${Date.now()}.txt`;
      content = file;
    } else {
      filename = file.name || file.filename || `file-${Date.now()}`;
      content = file.content || file.data || JSON.stringify(file);
    }
    
    const filepath = path.join(directory, filename);
    await fs.writeFile(filepath, content);
    
    // Detect type
    let type = 'unknown';
    for (const [t, pattern] of Object.entries(this.typePatterns)) {
      if (pattern.test(filename)) {
        type = t;
        break;
      }
    }
    
    return {
      name: filename,
      path: filepath,
      type,
      size: content.length
    };
  }

  /**
   * Extract code blocks from text
   */
  extractCodeBlocks(text) {
    const blocks = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return blocks;
  }

  /**
   * Extract structured content from output
   */
  extractStructuredContent(output, analysis) {
    const extracted = {};
    
    if (typeof output === 'object' && output !== null) {
      // Extract known structured fields
      if (output.summary) extracted.summary = output.summary;
      if (output.insights) extracted.insights = output.insights;
      if (output.recommendations) extracted.recommendations = output.recommendations;
      if (output.actionItems) extracted.actionItems = output.actionItems;
      if (output.results) extracted.results = output.results;
      if (output.data) extracted.data = output.data;
      if (output.metadata) extracted.metadata = output.metadata;
      
      // Extract from specific patterns
      if (output.analysis) {
        extracted.analysis = output.analysis;
      }
      
      if (output.output && typeof output.output === 'string') {
        // Try to extract sections from markdown
        extracted.sections = this.extractMarkdownSections(output.output);
      }
    } else if (typeof output === 'string') {
      // Extract sections from markdown string
      extracted.sections = this.extractMarkdownSections(output);
    }
    
    return extracted;
  }

  /**
   * Extract sections from markdown content
   */
  extractMarkdownSections(markdown) {
    const sections = {};
    const sectionRegex = /^#{1,3}\s+(.+)$/gm;
    const matches = Array.from(markdown.matchAll(sectionRegex));
    
    for (let i = 0; i < matches.length; i++) {
      const title = matches[i][1];
      const start = matches[i].index + matches[i][0].length;
      const end = matches[i + 1]?.index || markdown.length;
      
      sections[title] = markdown.slice(start, end).trim();
    }
    
    return sections;
  }

  /**
   * Prepare input for next step based on requirements
   */
  prepareNextInput(orchestrationId, currentOutput, requirements = {}) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) {
      return currentOutput.raw || currentOutput;
    }
    
    // Build input based on requirements
    const nextInput = {};
    
    // Include current output by default
    nextInput.previousOutput = currentOutput.extractedContent.summary || 
                              currentOutput.raw;
    
    // Add required previous outputs
    if (requirements.includePrevious) {
      const count = requirements.includePrevious === true ? 3 : requirements.includePrevious;
      nextInput.previousSteps = this.getPreviousOutputs(orchestrationId, count);
    }
    
    // Add specific content types
    if (requirements.includeFiles) {
      nextInput.files = this.getAllFiles(orchestrationId);
    }
    
    if (requirements.includeMarkdown) {
      nextInput.markdown = this.getAllMarkdown(orchestrationId);
    }
    
    if (requirements.includeCode) {
      nextInput.code = this.getAllCode(orchestrationId);
    }
    
    // Add specific extractions
    if (requirements.extract) {
      for (const field of requirements.extract) {
        nextInput[field] = currentOutput.extractedContent[field];
      }
    }
    
    // Format based on requirements
    if (requirements.format === 'string') {
      return this.formatAsString(nextInput);
    }
    
    return nextInput;
  }

  /**
   * Get previous outputs
   */
  getPreviousOutputs(orchestrationId, count = 3) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) return [];
    
    const steps = Array.from(orchOutputs.steps.values());
    return steps.slice(-count).map(step => ({
      stepId: step.stepId,
      summary: step.extractedContent.summary || step.raw,
      timestamp: step.timestamp
    }));
  }

  /**
   * Get all files from orchestration
   */
  getAllFiles(orchestrationId) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) return [];
    
    const allFiles = [];
    for (const step of orchOutputs.steps.values()) {
      allFiles.push(...step.files);
    }
    
    return allFiles;
  }

  /**
   * Get all markdown content
   */
  getAllMarkdown(orchestrationId) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) return [];
    
    const markdown = [];
    for (const step of orchOutputs.steps.values()) {
      if (step.analysis.hasMarkdown) {
        markdown.push({
          stepId: step.stepId,
          content: step.raw
        });
      }
    }
    
    return markdown;
  }

  /**
   * Get all code content
   */
  getAllCode(orchestrationId) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) return [];
    
    const code = [];
    for (const step of orchOutputs.steps.values()) {
      if (step.analysis.hasCode) {
        const blocks = this.extractCodeBlocks(
          typeof step.raw === 'string' ? step.raw : JSON.stringify(step.raw)
        );
        code.push(...blocks);
      }
    }
    
    return code;
  }

  /**
   * Synthesize outputs for parallel steps
   */
  synthesize(orchestrationId, parallelResults) {
    // Combine parallel results intelligently
    const synthesis = {
      combined: [],
      byType: {},
      summary: ''
    };
    
    for (const result of parallelResults) {
      synthesis.combined.push(result);
      
      // Group by type
      const type = result.analysis?.type || 'unknown';
      if (!synthesis.byType[type]) {
        synthesis.byType[type] = [];
      }
      synthesis.byType[type].push(result);
    }
    
    // Create summary
    synthesis.summary = `Synthesized ${parallelResults.length} parallel results`;
    
    return synthesis;
  }

  /**
   * Final synthesis of all outputs
   */
  synthesizeFinal(orchestrationId, allResults) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) {
      return { error: 'No outputs found' };
    }
    
    const synthesis = {
      orchestrationId,
      totalSteps: allResults.length,
      duration: Date.now() - orchOutputs.metadata.startTime,
      outputs: {
        fileCount: orchOutputs.metadata.fileCount,
        files: this.getAllFiles(orchestrationId),
        summary: this.generateSummary(allResults),
        highlights: this.extractHighlights(allResults)
      }
    };
    
    return synthesis;
  }

  /**
   * Generate summary from results
   */
  generateSummary(results) {
    const sections = [];
    
    for (const result of results) {
      if (result.extractedContent?.summary) {
        sections.push(`${result.stepName}: ${result.extractedContent.summary}`);
      } else if (typeof result.raw === 'string') {
        const preview = result.raw.slice(0, 100) + (result.raw.length > 100 ? '...' : '');
        sections.push(`${result.stepName}: ${preview}`);
      }
    }
    
    return sections.join('\n\n');
  }

  /**
   * Extract highlights from results
   */
  extractHighlights(results) {
    const highlights = [];
    
    for (const result of results) {
      if (result.extractedContent?.insights) {
        highlights.push(...result.extractedContent.insights);
      }
      if (result.extractedContent?.recommendations) {
        highlights.push(...result.extractedContent.recommendations);
      }
      if (result.extractedContent?.actionItems) {
        highlights.push(...result.extractedContent.actionItems);
      }
    }
    
    return highlights;
  }

  /**
   * Format output as string
   */
  formatAsString(data) {
    if (typeof data === 'string') return data;
    
    const parts = [];
    
    if (data.previousOutput) {
      parts.push('Previous Output:\n' + data.previousOutput);
    }
    
    if (data.previousSteps) {
      parts.push('\nPrevious Steps:');
      for (const step of data.previousSteps) {
        parts.push(`- ${step.stepId}: ${step.summary}`);
      }
    }
    
    if (data.files) {
      parts.push('\nFiles:');
      for (const file of data.files) {
        parts.push(`- ${file.name} (${file.type})`);
      }
    }
    
    return parts.join('\n');
  }

  /**
   * Calculate complexity metric
   */
  calculateComplexity(output) {
    if (typeof output === 'string') {
      return output.length / 1000; // Simple length-based
    }
    
    // For objects, count keys recursively
    let complexity = 0;
    const count = (obj) => {
      if (obj && typeof obj === 'object') {
        complexity += Object.keys(obj).length;
        Object.values(obj).forEach(count);
      }
    };
    
    count(output);
    return complexity;
  }

  /**
   * Calculate information density
   */
  calculateInformationDensity(output) {
    const str = typeof output === 'string' ? output : JSON.stringify(output);
    const uniqueChars = new Set(str).size;
    return uniqueChars / str.length;
  }

  /**
   * Analyze object content recursively
   */
  analyzeObjectContent(obj, analysis, depth = 0) {
    if (depth > 5) return; // Prevent infinite recursion
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Check for file paths
        for (const [type, pattern] of Object.entries(this.typePatterns)) {
          if (pattern.test(value)) {
            analysis.contentTypes.add(type);
            analysis.hasFiles = true;
          }
        }
      } else if (value && typeof value === 'object') {
        this.analyzeObjectContent(value, analysis, depth + 1);
      }
    }
  }

  /**
   * Get all outputs for an orchestration
   */
  getAllOutputs(orchestrationId) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) return null;
    
    return {
      steps: Array.from(orchOutputs.steps.values()),
      files: Array.from(orchOutputs.files?.values() || []),
      metadata: orchOutputs.metadata
    };
  }

  /**
   * Get summary for orchestration
   */
  getSummary(orchestrationId) {
    const orchOutputs = this.orchestrationOutputs.get(orchestrationId);
    if (!orchOutputs) return null;
    
    return {
      stepCount: orchOutputs.steps.size,
      fileCount: orchOutputs.metadata.fileCount,
      duration: Date.now() - orchOutputs.metadata.startTime,
      outputTypes: Array.from(
        new Set(
          Array.from(orchOutputs.steps.values())
            .map(s => s.analysis.type)
        )
      )
    };
  }

  /**
   * Clean up old orchestration outputs
   */
  async cleanup(orchestrationId) {
    this.orchestrationOutputs.delete(orchestrationId);
    
    if (this.preserveOutputs) {
      // Optionally clean up files after delay
      const outputPath = path.join(this.outputDir, orchestrationId);
      setTimeout(async () => {
        try {
          await fs.rm(outputPath, { recursive: true });
        } catch (err) {
          // Ignore cleanup errors
        }
      }, 3600000); // 1 hour
    }
  }
}