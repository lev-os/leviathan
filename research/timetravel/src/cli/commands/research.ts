import chalk from 'chalk';
import ora from 'ora';
import { ResearchEngine } from '@api/engine/research';
import { ResearchConfig, PersonalityMode } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export async function ResearchCommand(
  topic: string,
  options: {
    depth: 'quick' | 'standard' | 'deep';
    time: string;
    output: 'markdown' | 'json' | 'html';
    personalities?: string;
    sources?: string;
    web?: boolean;
  }
) {
  const spinner = ora('Initializing research workflow...').start();
  
  try {
    // Parse options
    const config: ResearchConfig = {
      topic,
      depth: options.depth,
      duration: parseInt(options.time),
      outputFormat: options.output,
      personalities: parsePersonalities(options.personalities),
      sources: parseSources(options.sources)
    };

    spinner.text = 'Loading research contexts...';
    
    // Initialize research engine
    const engine = new ResearchEngine();
    await engine.initialize();
    
    spinner.text = `Starting ${config.depth} research on: ${chalk.blue(topic)}`;
    
    // Execute research
    const result = await engine.execute(config);
    
    spinner.succeed(chalk.green('Research completed!'));
    
    console.log(chalk.bold('\n📊 Research Summary:'));
    console.log(`Topic: ${chalk.blue(result.topic)}`);
    console.log(`Duration: ${result.metadata.executionTime}s`);
    console.log(`Findings: ${result.findings.length}`);
    console.log(`Quality: ${(result.metadata.quality * 100).toFixed(1)}%`);
    
    if (options.web) {
      console.log(chalk.yellow('\n🌐 Opening web interface...'));
      // Open web interface with this research
    }
    
  } catch (error) {
    spinner.fail(chalk.red('Research failed'));
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    process.exit(1);
  }
}

function parsePersonalities(personalities?: string): PersonalityMode[] {
  if (!personalities) return ['sovereignty_architect', 'abundance_amplifier'];
  
  return personalities.split(',').map(p => p.trim() as PersonalityMode);
}

function parseSources(sources?: string): string[] {
  if (!sources) return ['web', 'academic', 'industry'];
  
  return sources.split(',').map(s => s.trim());
}