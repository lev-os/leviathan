// Abstract Context Consolidator - Move, validate, and deduplicate contexts
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { glob } from 'glob';
import yaml from 'js-yaml';
import crypto from 'crypto';

export class ContextConsolidator {
  constructor(targetDir = './contexts') {
    this.targetDir = path.resolve(targetDir);
    this.backupDir = path.join('./tmp', 'context-backup-' + Date.now());
    this.duplicates = new Map();
    this.conflicts = [];
    this.moved = [];
  }

  async consolidate(options = {}) {
    const { dryRun = false, backup = true } = options;
    
    console.log('🔧 Starting context consolidation...');
    console.log(`Target: ${this.targetDir}`);
    
    if (backup && !dryRun) {
      await this.createBackup();
    }
    
    const sourceContexts = await this.findAllContexts();
    const analysis = await this.analyzeContexts(sourceContexts);
    
    if (dryRun) {
      this.printAnalysis(analysis);
      return analysis;
    }
    
    await this.performConsolidation(analysis);
    return analysis;
  }

  async createBackup() {
    console.log(`📦 Creating backup at ${this.backupDir}`);
    await fs.ensureDir(this.backupDir);
    
    // Backup existing target contexts
    if (await fs.pathExists(this.targetDir)) {
      await fs.copy(this.targetDir, path.join(this.backupDir, 'target-contexts'));
    }
  }

  async findAllContexts() {
    console.log('🔍 Discovering all context files...');
    
    const searchPatterns = [
      '**/contexts/**/*.yaml',
      '**/context/*.yaml'
    ];

    const contextFiles = await glob(searchPatterns, {
      cwd: os.homedir(),
      absolute: true,
      ignore: [
        '**/node_modules/**', 
        '**/.git/**', 
        '**/lore/**',
        `${this.targetDir}/**` // Don't include target in search
      ]
    });

    console.log(`Found ${contextFiles.length} source context files`);
    return contextFiles;
  }

  async analyzeContexts(contextFiles) {
    console.log('📊 Analyzing contexts for duplicates and conflicts...');
    
    const analysis = {
      sources: new Map(), // hash -> [files]
      duplicates: new Map(),
      unique: new Map(),
      conflicts: [],
      byType: new Map(),
      byDirectory: new Map()
    };

    for (const filePath of contextFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const context = yaml.load(content);
        const hash = this.getContentHash(content);
        
        // Track by hash for duplicate detection
        if (!analysis.sources.has(hash)) {
          analysis.sources.set(hash, []);
        }
        analysis.sources.get(hash).push({
          path: filePath,
          context,
          content,
          relativePath: path.relative(os.homedir(), filePath)
        });
        
        // Categorize by type
        const type = context.type || 'unknown';
        if (!analysis.byType.has(type)) {
          analysis.byType.set(type, []);
        }
        analysis.byType.get(type).push(filePath);
        
        // Categorize by directory
        const dir = path.dirname(filePath);
        if (!analysis.byDirectory.has(dir)) {
          analysis.byDirectory.set(dir, []);
        }
        analysis.byDirectory.get(dir).push(filePath);
        
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error.message);
      }
    }

    // Identify duplicates and unique contexts
    for (const [hash, files] of analysis.sources) {
      if (files.length > 1) {
        analysis.duplicates.set(hash, files);
      } else {
        analysis.unique.set(hash, files[0]);
      }
    }

    return analysis;
  }

  getContentHash(content) {
    // Normalize content for comparison (remove whitespace differences)
    const normalized = content.replace(/\s+/g, ' ').trim();
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  async performConsolidation(analysis) {
    console.log('🚀 Performing consolidation...');
    
    await fs.ensureDir(this.targetDir);
    
    // Move unique contexts
    for (const [hash, fileInfo] of analysis.unique) {
      await this.moveContext(fileInfo, 'unique');
    }
    
    // Handle duplicates (keep first, log others)
    for (const [hash, files] of analysis.duplicates) {
      const primary = files[0];
      const duplicateFiles = files.slice(1);
      
      await this.moveContext(primary, 'primary');
      
      // Log duplicates
      console.log(`📋 Duplicate context found:`);
      console.log(`  Primary: ${primary.relativePath}`);
      for (const dup of duplicateFiles) {
        console.log(`  Duplicate: ${dup.relativePath}`);
      }
    }
    
    console.log(`✅ Consolidation complete. Moved ${this.moved.length} contexts.`);
  }

  async moveContext(fileInfo, reason) {
    const { path: sourcePath, context } = fileInfo;
    
    // Determine target path based on context structure
    const targetPath = this.getTargetPath(context, sourcePath);
    const fullTargetPath = path.join(this.targetDir, targetPath);
    
    try {
      await fs.ensureDir(path.dirname(fullTargetPath));
      await fs.copy(sourcePath, fullTargetPath);
      
      this.moved.push({
        source: sourcePath,
        target: fullTargetPath,
        reason,
        context: context.name || path.basename(path.dirname(sourcePath))
      });
      
      console.log(`📁 Moved [${reason}]: ${path.relative(os.homedir(), sourcePath)} → ${targetPath}`);
      
    } catch (error) {
      console.error(`❌ Failed to move ${sourcePath}:`, error.message);
    }
  }

  getTargetPath(context, sourcePath) {
    const type = context.type || 'unknown';
    const name = context.slug || context.name || path.basename(path.dirname(sourcePath));
    
    // Clean name for filesystem
    const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    return path.join(type + 's', cleanName, 'context.yaml');
  }

  printAnalysis(analysis) {
    console.log('\n📊 Consolidation Analysis Report');
    console.log('=' .repeat(50));
    
    console.log(`\nUnique contexts: ${analysis.unique.size}`);
    console.log(`Duplicate groups: ${analysis.duplicates.size}`);
    
    let totalDuplicateFiles = 0;
    for (const files of analysis.duplicates.values()) {
      totalDuplicateFiles += files.length - 1; // Subtract 1 for primary
    }
    console.log(`Total duplicate files: ${totalDuplicateFiles}`);
    
    console.log('\n📁 Source Directories:');
    for (const [dir, files] of analysis.byDirectory) {
      const relativeDir = path.relative(os.homedir(), dir);
      console.log(`  ${relativeDir}: ${files.length} contexts`);
    }
    
    console.log('\n🏷️  Context Types:');
    for (const [type, files] of analysis.byType) {
      console.log(`  ${type}: ${files.length} contexts`);
    }
    
    if (analysis.duplicates.size > 0) {
      console.log('\n🔄 Duplicate Groups:');
      let groupNum = 1;
      for (const [hash, files] of analysis.duplicates) {
        console.log(`  Group ${groupNum++}: ${files.length} identical files`);
        for (const file of files) {
          console.log(`    - ${file.relativePath}`);
        }
      }
    }
  }

  async cleanupSourceDirectories(analysis, options = {}) {
    const { removeEmpty = true, dryRun = false } = options;
    
    if (!removeEmpty) return;
    
    console.log('\n🧹 Cleaning up empty source directories...');
    
    const sourceDirs = new Set();
    for (const files of analysis.sources.values()) {
      for (const file of files) {
        sourceDirs.add(path.dirname(file.path));
      }
    }
    
    for (const dir of sourceDirs) {
      try {
        const files = await fs.readdir(dir);
        if (files.length === 0) {
          if (dryRun) {
            console.log(`Would remove empty directory: ${path.relative(os.homedir(), dir)}`);
          } else {
            await fs.remove(dir);
            console.log(`🗑️  Removed empty directory: ${path.relative(os.homedir(), dir)}`);
          }
        }
      } catch (error) {
        // Directory might already be removed or not accessible
      }
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const consolidator = new ContextConsolidator();
  const dryRun = process.argv.includes('--dry-run');
  const noBackup = process.argv.includes('--no-backup');
  
  const analysis = await consolidator.consolidate({ 
    dryRun, 
    backup: !noBackup 
  });
  
  if (!dryRun) {
    await consolidator.cleanupSourceDirectories(analysis, { dryRun });
  }
}