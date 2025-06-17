#!/usr/bin/env node

/**
 * Context Discovery Tool - READ-ONLY reconnaissance 
 * 
 * CRITICAL: This tool makes NO modifications to any files.
 * It only discovers, maps, and documents the existing context ecosystem.
 * 
 * Purpose: Safe mapping of scattered contexts and symlink relationships
 * for manual consolidation planning.
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { glob } from 'glob';
import yaml from 'js-yaml';
import crypto from 'crypto';

class ContextDiscovery {
  constructor() {
    this.homeDir = os.homedir();
    this.outputDir = './context-consolidation';
    this.discoveries = {
      contexts: [],
      symlinks: [],
      canonicalSources: new Map(),
      symlinkTargets: new Map(),
      innovations: new Map(),
      duplicateHashes: new Map(),
      locationCategories: new Map()
    };
  }

  async discover() {
    console.log('🔍 Starting READ-ONLY context discovery...');
    console.log('⚠️  NO FILES WILL BE MODIFIED - RECONNAISSANCE ONLY');
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Phase 1: Find all context files
    await this.findAllContextFiles();
    
    // Phase 2: Analyze symlink relationships
    await this.analyzeSymlinks();
    
    // Phase 3: Detect innovation patterns
    await this.detectInnovations();
    
    // Phase 4: Generate tracking files
    await this.generateTrackingFiles();
    
    console.log('✅ Discovery complete - check ./context-consolidation/ for results');
  }

  async findAllContextFiles() {
    console.log('\n📂 Phase 1: Finding all context files...');
    
    const searchPatterns = [
      '**/contexts/**/*.yaml',
      '**/contexts/**/*.yml', 
      '**/context/**/*.yaml',
      '**/context/**/*.yml',
      '**/*context*.yaml',
      '**/*context*.yml'
    ];

    // Search in multiple key locations
    const searchRoots = [
      this.homeDir + '/c',
      this.homeDir + '/digital/kingly',
      this.homeDir + '/.claude',
      this.homeDir + '/.kingly',
      process.cwd() // Current mcp-mvp directory
      // Note: ~/d/lore explicitly excluded via ignore patterns
    ];

    for (const root of searchRoots) {
      try {
        await fs.access(root);
        console.log(`  🔍 Scanning: ${path.relative(this.homeDir, root)}`);
        
        const files = await glob(searchPatterns, {
          cwd: root,
          absolute: true,
          followSymbolicLinks: false,  // Don't follow symlinks to detect them properly
          ignore: [
            '**/node_modules/**',
            '**/.git/**',
            '**/tmp/**',
            '**/backup*/**',
            '**/lore/**'  // Add lore to ignore list
          ]
        });
        
        for (const filePath of files) {
          await this.analyzeContextFile(filePath);
        }
        
        console.log(`    Found ${files.length} files in ${path.relative(this.homeDir, root)}`);
      } catch (error) {
        // Directory doesn't exist, skip silently
      }
    }
    
    console.log(`📊 Total contexts discovered: ${this.discoveries.contexts.length}`);
  }

  async analyzeContextFile(filePath) {
    try {
      const stats = await fs.lstat(filePath);
      const relativePath = path.relative(this.homeDir, filePath);
      
      const contextInfo = {
        path: filePath,
        relativePath: relativePath,
        isSymlink: stats.isSymbolicLink(),
        symlinkTarget: null,
        content: null,
        context: null,
        hash: null,
        locationCategory: this.categorizeLocation(filePath),
        innovationType: null,
        size: stats.size,
        modified: stats.mtime
      };

      // Handle symlinks
      if (stats.isSymbolicLink()) {
        try {
          const target = await fs.readlink(filePath);
          const resolvedTarget = path.resolve(path.dirname(filePath), target);
          contextInfo.symlinkTarget = resolvedTarget;
          
          this.discoveries.symlinks.push(contextInfo);
          
          // Track what points to this target
          if (!this.discoveries.symlinkTargets.has(resolvedTarget)) {
            this.discoveries.symlinkTargets.set(resolvedTarget, []);
          }
          this.discoveries.symlinkTargets.get(resolvedTarget).push(filePath);
          
          console.log(`  🔗 Symlink: ${relativePath} → ${path.relative(this.homeDir, resolvedTarget)}`);
          
          // Try to read the symlink target content for analysis
          try {
            const targetStats = await fs.stat(resolvedTarget);
            if (targetStats.isFile()) {
              const content = await fs.readFile(resolvedTarget, 'utf-8');
              const context = yaml.load(content);
              contextInfo.content = content;
              contextInfo.context = context;
              contextInfo.hash = this.getContentHash(content);
              contextInfo.innovationType = this.detectInnovationType(context, resolvedTarget);
            }
          } catch (targetError) {
            console.log(`  ⚠️  Cannot read symlink target: ${path.relative(this.homeDir, resolvedTarget)}`);
          }
        } catch (error) {
          console.log(`  ❌ Broken symlink: ${relativePath}`);
          contextInfo.symlinkTarget = 'BROKEN';
        }
      } else {
        // Read actual file content
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const context = yaml.load(content);
          const hash = this.getContentHash(content);
          
          contextInfo.content = content;
          contextInfo.context = context;
          contextInfo.hash = hash;
          contextInfo.innovationType = this.detectInnovationType(context, filePath);
          
          // Track canonical sources
          this.discoveries.canonicalSources.set(filePath, contextInfo);
          
          // Track duplicates by hash
          if (!this.discoveries.duplicateHashes.has(hash)) {
            this.discoveries.duplicateHashes.set(hash, []);
          }
          this.discoveries.duplicateHashes.get(hash).push(contextInfo);
          
          console.log(`  📄 Context: ${relativePath} [${contextInfo.innovationType}]`);
        } catch (error) {
          console.log(`  ⚠️  Invalid YAML: ${relativePath} - ${error.message}`);
        }
      }
      
      this.discoveries.contexts.push(contextInfo);
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  categorizeLocation(filePath) {
    const relativePath = path.relative(this.homeDir, filePath);
    
    if (relativePath.startsWith('c/')) return 'c_system';
    if (relativePath.includes('mcp-mvp')) return 'mcp_mvp';
    if (relativePath.includes('.claude')) return 'claude_system';
    if (relativePath.includes('.kingly')) return 'kingly_global';
    if (relativePath.includes('digital/kingly')) return 'kingly_project';
    if (relativePath.includes('discord')) return 'discord_integration';
    
    return 'other';
  }

  detectInnovationType(context, filePath) {
    if (!context) return 'unknown';
    
    // Detect by type field
    if (context.type) return context.type;
    
    // Detect by path patterns
    if (filePath.includes('/agents/')) return 'agent';
    if (filePath.includes('/workflows/')) return 'workflow';
    if (filePath.includes('/patterns/')) return 'pattern';
    if (filePath.includes('/tools/')) return 'tool';
    if (filePath.includes('/themes/')) return 'theme';
    if (filePath.includes('/personalities/')) return 'personality';
    
    // Detect by content patterns
    if (context.agent || context.personality) return 'agent';
    if (context.workflow || context.steps) return 'workflow';
    if (context.pattern || context.framework) return 'pattern';
    
    return 'context';
  }

  async analyzeSymlinks() {
    console.log('\n🔗 Phase 2: Analyzing symlink relationships...');
    
    for (const [target, symlinks] of this.discoveries.symlinkTargets) {
      const relativeTarget = path.relative(this.homeDir, target);
      console.log(`  📍 ${relativeTarget} ← ${symlinks.length} symlinks`);
      
      for (const symlink of symlinks) {
        const relativeSymlink = path.relative(this.homeDir, symlink);
        console.log(`    🔗 ${relativeSymlink}`);
      }
    }
  }

  async detectInnovations() {
    console.log('\n💡 Phase 3: Detecting innovation patterns...');
    
    // Group by innovation type and location
    for (const context of this.discoveries.contexts) {
      if (!context.innovationType) continue;
      
      const key = `${context.innovationType}:${context.locationCategory}`;
      if (!this.discoveries.innovations.has(key)) {
        this.discoveries.innovations.set(key, []);
      }
      this.discoveries.innovations.get(key).push(context);
    }
    
    // Report innovation distribution
    for (const [key, contexts] of this.discoveries.innovations) {
      const [type, location] = key.split(':');
      console.log(`  ${type} in ${location}: ${contexts.length} contexts`);
    }
    
    // Detect scattered innovations (same type in multiple locations)
    const typeDistribution = new Map();
    for (const [key, contexts] of this.discoveries.innovations) {
      const [type, location] = key.split(':');
      if (!typeDistribution.has(type)) {
        typeDistribution.set(type, new Set());
      }
      typeDistribution.get(type).add(location);
    }
    
    console.log('\n🌐 Innovation scatter analysis:');
    for (const [type, locations] of typeDistribution) {
      if (locations.size > 1) {
        console.log(`  ⚠️  ${type} scattered across: ${Array.from(locations).join(', ')}`);
      }
    }
  }

  async generateTrackingFiles() {
    console.log('\n📋 Phase 4: Generating tracking files...');
    
    // Generate tracker.csv
    await this.generateTrackerCSV();
    
    // Generate symlink map
    await this.generateSymlinkMap();
    
    // Generate innovation audit
    await this.generateInnovationAudit();
    
    // Generate discovery summary
    await this.generateDiscoverySummary();
    
    console.log('📁 Files generated in ./context-consolidation/');
  }

  async generateTrackerCSV() {
    const csvHeader = 'file_path,symlink_target,canonical_source,innovation_type,location_category,is_symlink,hash,size_bytes,review_status,consolidation_decision,priority,notes\n';
    
    let csvContent = csvHeader;
    
    for (const context of this.discoveries.contexts) {
      const row = [
        context.relativePath,
        context.symlinkTarget ? path.relative(this.homeDir, context.symlinkTarget) : '',
        context.isSymlink ? 'FALSE' : 'TRUE',
        context.innovationType || 'unknown',
        context.locationCategory,
        context.isSymlink ? 'TRUE' : 'FALSE',
        context.hash || '',
        context.size,
        'pending',
        'tbd',
        this.calculatePriority(context),
        this.generateNotes(context)
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      
      csvContent += row + '\n';
    }
    
    await fs.writeFile(path.join(this.outputDir, 'tracker.csv'), csvContent);
    console.log('  ✅ tracker.csv generated');
  }

  async generateSymlinkMap() {
    const symlinkMap = {
      summary: {
        total_symlinks: this.discoveries.symlinks.length,
        total_targets: this.discoveries.symlinkTargets.size,
        broken_symlinks: this.discoveries.symlinks.filter(s => s.symlinkTarget === 'BROKEN').length
      },
      symlink_relationships: {}
    };
    
    for (const [target, symlinks] of this.discoveries.symlinkTargets) {
      const relativeTarget = path.relative(this.homeDir, target);
      symlinkMap.symlink_relationships[relativeTarget] = symlinks.map(s => path.relative(this.homeDir, s));
    }
    
    await fs.writeFile(
      path.join(this.outputDir, 'symlink-map.json'), 
      JSON.stringify(symlinkMap, null, 2)
    );
    console.log('  ✅ symlink-map.json generated');
  }

  async generateInnovationAudit() {
    let auditContent = '# Innovation Audit Report\n\n';
    
    auditContent += '## Innovation Distribution by Location\n\n';
    for (const [key, contexts] of this.discoveries.innovations) {
      const [type, location] = key.split(':');
      auditContent += `### ${type} in ${location}\n`;
      auditContent += `**Count:** ${contexts.length}\n\n`;
      
      for (const context of contexts.slice(0, 5)) { // Show first 5
        auditContent += `- ${context.relativePath}\n`;
      }
      if (contexts.length > 5) {
        auditContent += `- ... and ${contexts.length - 5} more\n`;
      }
      auditContent += '\n';
    }
    
    auditContent += '## Duplicate Content Analysis\n\n';
    for (const [hash, contexts] of this.discoveries.duplicateHashes) {
      if (contexts.length > 1) {
        auditContent += `### Duplicate Group (${contexts.length} files)\n`;
        for (const context of contexts) {
          auditContent += `- ${context.relativePath}\n`;
        }
        auditContent += '\n';
      }
    }
    
    await fs.writeFile(path.join(this.outputDir, 'innovation-audit.md'), auditContent);
    console.log('  ✅ innovation-audit.md generated');
  }

  async generateDiscoverySummary() {
    const summary = {
      discovery_timestamp: new Date().toISOString(),
      total_contexts: this.discoveries.contexts.length,
      symlinks: this.discoveries.symlinks.length,
      canonical_sources: this.discoveries.canonicalSources.size,
      unique_targets: this.discoveries.symlinkTargets.size,
      location_distribution: {},
      innovation_distribution: {},
      duplicate_groups: 0,
      recommendations: []
    };
    
    // Location distribution
    for (const context of this.discoveries.contexts) {
      const loc = context.locationCategory;
      summary.location_distribution[loc] = (summary.location_distribution[loc] || 0) + 1;
    }
    
    // Innovation distribution
    for (const [key, contexts] of this.discoveries.innovations) {
      const [type] = key.split(':');
      summary.innovation_distribution[type] = (summary.innovation_distribution[type] || 0) + contexts.length;
    }
    
    // Duplicate groups
    for (const contexts of this.discoveries.duplicateHashes.values()) {
      if (contexts.length > 1) summary.duplicate_groups++;
    }
    
    // Generate recommendations
    if (summary.symlinks > summary.canonical_sources * 0.3) {
      summary.recommendations.push('High symlink usage detected - manual review required');
    }
    if (summary.duplicate_groups > 0) {
      summary.recommendations.push(`${summary.duplicate_groups} duplicate groups found - consolidation needed`);
    }
    if (Object.keys(summary.location_distribution).length > 3) {
      summary.recommendations.push('Contexts scattered across many locations - consolidation recommended');
    }
    
    await fs.writeFile(
      path.join(this.outputDir, 'discovery-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    console.log('  ✅ discovery-summary.json generated');
  }

  calculatePriority(context) {
    let priority = 'medium';
    
    // High priority for base concepts
    if (context.relativePath.includes('base-agent') || 
        context.relativePath.includes('constitutional') ||
        context.context?.type === 'agent') {
      priority = 'high';
    }
    
    // Low priority for themes and preferences
    if (context.relativePath.includes('theme') || 
        context.relativePath.includes('preference')) {
      priority = 'low';
    }
    
    return priority;
  }

  generateNotes(context) {
    const notes = [];
    
    if (context.isSymlink && context.symlinkTarget === 'BROKEN') {
      notes.push('BROKEN SYMLINK');
    }
    
    if (context.context?.name) {
      notes.push(`Name: ${context.context.name}`);
    }
    
    if (context.context?.version) {
      notes.push(`Version: ${context.context.version}`);
    }
    
    return notes.join('; ');
  }

  getContentHash(content) {
    const normalized = content.replace(/\s+/g, ' ').trim();
    return crypto.createHash('md5').update(normalized).digest('hex').substring(0, 8);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const discovery = new ContextDiscovery();
  try {
    await discovery.discover();
  } catch (error) {
    console.error('💥 Discovery failed:', error.message);
    process.exit(1);
  }
}