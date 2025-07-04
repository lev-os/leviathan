#!/usr/bin/env node

import { Command } from 'commander';
import { searchCommand } from './commands/search.js';
import { updateCommand } from './commands/update.js';
import { validateCommand } from './commands/validate.js';
import { generateCommand } from './commands/generate.js';
import { statsCommand } from './commands/stats.js';

const program = new Command();

program
  .name('codex')
  .description('Project Codex - LLM-First Programming Knowledge Management')
  .version('1.0.0');

program
  .command('search')
  .description('Search Project Codex knowledge base')
  .argument('<query>', 'Search query')
  .option('-t, --type <type>', 'Filter by type (paradigm, language, framework)')
  .option('-c, --complexity <level>', 'Filter by complexity (easy, medium, advanced, expert)')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .action(searchCommand);

program
  .command('update')
  .description('Update Project Codex with latest technology patterns')
  .option('-t, --target <target>', 'Specific technology to update (react, typescript, nextjs, tailwind, shadcn-ui)')
  .option('-f, --force', 'Force update even if recently updated')
  .option('-d, --dry-run', 'Show what would be updated without making changes')
  .action(updateCommand);

program
  .command('validate')
  .description('Validate Project Codex knowledge for consistency and accuracy')
  .option('-t, --type <type>', 'Validate specific type only')
  .option('-f, --fix', 'Automatically fix validation issues where possible')
  .option('-r, --report', 'Generate detailed validation report')
  .action(validateCommand);

program
  .command('generate')
  .description('Generate code examples and documentation from Project Codex knowledge')
  .argument('<target>', 'What to generate (examples, docs, schemas)')
  .option('-o, --output <dir>', 'Output directory', './generated')
  .option('-t, --template <template>', 'Use specific template')
  .action(generateCommand);

program
  .command('stats')
  .description('Show Project Codex statistics and health metrics')
  .option('-d, --detailed', 'Show detailed breakdown')
  .option('-j, --json', 'Output as JSON')
  .action(statsCommand);

// Hidden development commands
program
  .command('dev:crystallize')
  .description('Apply knowledge crystallization methodology to new domain')
  .argument('<domain>', 'Domain to crystallize (e.g., "vue", "angular", "svelte")')
  .option('-r, --research', 'Conduct research phase')
  .option('-a, --analyze', 'Run analysis phase')
  .option('-c, --codify', 'Execute codification phase')
  .option('-v, --validate', 'Perform validation phase')
  .action(async (domain, options) => {
    console.log(`🧠 Starting knowledge crystallization for: ${domain}`);
    
    if (options.research || (!options.analyze && !options.codify && !options.validate)) {
      console.log('📚 Phase 1: Discovery & Research');
      // Research orchestration logic
    }
    
    if (options.analyze || (!options.research && !options.codify && !options.validate)) {
      console.log('🔍 Phase 2: Analysis & Pattern Extraction');
      // Pattern recognition logic
    }
    
    if (options.codify || (!options.research && !options.analyze && !options.validate)) {
      console.log('⚡ Phase 3: YAML Codification');
      // YAML generation logic
    }
    
    if (options.validate || (!options.research && !options.analyze && !options.codify)) {
      console.log('✅ Phase 4: Validation & Testing');
      // Validation logic
    }
    
    console.log('🚀 Knowledge crystallization complete!');
  });

// Error handling
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
});

program.parseAsync(process.argv).catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});