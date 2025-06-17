// Context Locator - Find all context files across the filesystem
import { glob } from 'glob';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import yaml from 'js-yaml';

export class ContextLocator {
  async findAllContexts() {
    console.log('🔍 Searching for context files...');
    
    const searchPatterns = [
      '**/contexts/**/*.yaml',
      '**/context/*.yaml'
    ];

    const contextFiles = await glob(searchPatterns, {
      cwd: os.homedir(),
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/lore/**']
    });

    console.log(`Found ${contextFiles.length} context files`);
    
    const organized = await this.organizeContexts(contextFiles);
    return organized;
  }

  async organizeContexts(files) {
    const organized = {
      byDirectory: {},
      byType: {},
      total: files.length,
      files: []
    };

    for (const filePath of files) {
      try {
        const contextInfo = await this.analyzeContext(filePath);
        organized.files.push(contextInfo);
        
        // Group by directory
        const dir = path.dirname(filePath);
        if (!organized.byDirectory[dir]) {
          organized.byDirectory[dir] = [];
        }
        organized.byDirectory[dir].push(contextInfo);
        
        // Group by type
        const type = contextInfo.type || 'unknown';
        if (!organized.byType[type]) {
          organized.byType[type] = [];
        }
        organized.byType[type].push(contextInfo);
        
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error.message);
      }
    }

    return organized;
  }

  async analyzeContext(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const context = yaml.load(content);
    
    return {
      path: filePath,
      name: context.name || path.basename(path.dirname(filePath)),
      type: context.type || 'unknown',
      slug: context.slug || 'no-slug',
      relativePath: path.relative(os.homedir(), filePath),
      directory: path.dirname(filePath),
      context: context
    };
  }

  printReport(organized) {
    console.log('\n📊 Context Discovery Report');
    console.log('=' .repeat(50));
    
    console.log(`\nTotal contexts found: ${organized.total}`);
    
    console.log('\n📁 By Directory:');
    for (const [dir, contexts] of Object.entries(organized.byDirectory)) {
      const relativeDir = path.relative(os.homedir(), dir);
      console.log(`  ${relativeDir} (${contexts.length} contexts)`);
      for (const ctx of contexts) {
        console.log(`    - ${ctx.name} (${ctx.type})`);
      }
    }
    
    console.log('\n🏷️  By Type:');
    for (const [type, contexts] of Object.entries(organized.byType)) {
      console.log(`  ${type}: ${contexts.length} contexts`);
    }
    
    console.log('\n📋 All Context Files:');
    for (const ctx of organized.files) {
      console.log(`  ${ctx.relativePath}`);
      console.log(`    Name: ${ctx.name}`);
      console.log(`    Type: ${ctx.type}`);
      console.log(`    Slug: ${ctx.slug}`);
      console.log('');
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const locator = new ContextLocator();
  const results = await locator.findAllContexts();
  locator.printReport(results);
}