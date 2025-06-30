import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { AgentController, AgentControllerConfig } from '../agents/AgentController.js';
import { CommandHandlers } from './CommandHandlers.js';

export class TradingCLI {
  private controller: AgentController;
  private program: Command;
  private isInteractive = false;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  async initialize(): Promise<void> {
    console.log(chalk.cyan.bold('🤖 Trader Stack Multi-Agent CLI'));
    console.log(chalk.gray('Initializing dual LLM trading agents...'));

    const config = await this.getConfiguration();
    
    const spinner = ora('Setting up agents...').start();
    this.controller = new AgentController(config);
    
    this.setupEventHandlers();
    
    spinner.succeed('Agents ready!');
    
    console.log(chalk.green('\n✅ Multi-agent system initialized'));
    console.log(chalk.yellow('📝 Available commands:'));
    console.log(chalk.white('  /help - Show all commands'));
    console.log(chalk.white('  /strategy analyze <symbol> - Analyze trading strategy'));
    console.log(chalk.white('  /risk assess <data> - Assess trade risk'));
    console.log(chalk.white('  /workflow analyze-and-trade <params> - Full workflow'));
    console.log(chalk.white('  /agents status - Show agent status'));
    console.log(chalk.white('  /quit - Exit CLI\n'));
  }

  private async getConfiguration(): Promise<AgentControllerConfig> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enableStrategy',
        message: 'Enable Strategy Agent?',
        default: true
      },
      {
        type: 'confirm',
        name: 'enableRisk',
        message: 'Enable Risk Agent?',
        default: true
      },
      {
        type: 'list',
        name: 'primaryLLM',
        message: 'Choose primary LLM:',
        choices: ['claude', 'openai'],
        default: 'claude'
      }
    ]);

    return {
      agents: {
        strategy: answers.enableStrategy,
        risk: answers.enableRisk,
        execution: false,
        monitoring: false
      },
      llm: {
        primary: answers.primaryLLM,
        validator: answers.primaryLLM === 'claude' ? 'openai' : 'claude',
        requireValidation: true
      }
    };
  }

  private setupCommands(): void {
    this.program
      .name('trader-agent')
      .description('Multi-Agent Trading CLI with Dual LLM')
      .version('1.0.0');

    this.program
      .command('interactive')
      .alias('i')
      .description('Start interactive mode')
      .action(() => this.startInteractiveMode());

    this.program
      .command('strategy <action> <symbol>')
      .description('Execute strategy commands')
      .action(async (action, symbol) => {
        await this.handleStrategyCommand(action, symbol);
      });
  }

  private setupEventHandlers(): void {
    this.controller.on('agent-status-update', (status) => {
      console.log(chalk.blue(`🤖 ${status.name}: ${status.status}`));
    });

    this.controller.on('task-completed', (result) => {
      console.log(chalk.green('✅ Task completed:'), result);
    });

    this.controller.on('task-error', (error) => {
      console.log(chalk.red('❌ Task error:'), error);
    });
  }

  async startInteractiveMode(): Promise<void> {
    this.isInteractive = true;
    console.log(chalk.cyan('\n🚀 Entering interactive mode...'));
    console.log(chalk.gray('Type /help for commands or /quit to exit\n'));

    while (this.isInteractive) {
      const { command } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: chalk.yellow('trader-agent>'),
          prefix: ''
        }
      ]);

      await this.processInteractiveCommand(command.trim());
    }
  }

  private async processInteractiveCommand(command: string): Promise<void> {
    try {
      if (command.startsWith('/')) {
        await this.handleSlashCommand(command);
      } else if (command) {
        console.log(chalk.red('Unknown command. Use /help for available commands.'));
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  private async handleSlashCommand(command: string): Promise<void> {
    const parts = command.slice(1).split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        this.showHelp();
        break;
      case 'quit':
      case 'exit':
        this.isInteractive = false;
        console.log(chalk.cyan('👋 Goodbye!'));
        break;
      case 'strategy':
        await this.handleStrategyCommand(args[0], args[1]);
        break;
      case 'risk':
        await this.handleRiskCommand(args[0]);
        break;
      case 'agents':
        this.showAgentStatus();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${cmd}`));
    }
  }
}

  private commandHandlers: CommandHandlers;

  async initialize(): Promise<void> {
    console.log(chalk.cyan.bold('🤖 Trader Stack Multi-Agent CLI'));
    console.log(chalk.gray('Initializing dual LLM trading agents...'));

    const config = await this.getConfiguration();
    
    const spinner = ora('Setting up agents...').start();
    this.controller = new AgentController(config);
    this.commandHandlers = new CommandHandlers(this.controller);
    
    this.setupEventHandlers();
    
    spinner.succeed('Agents ready!');
    
    console.log(chalk.green('\n✅ Multi-agent system initialized'));
    console.log(chalk.yellow('📝 Available commands:'));
    console.log(chalk.white('  /help - Show all commands'));
    console.log(chalk.white('  /strategy analyze <symbol> - Analyze trading strategy'));
    console.log(chalk.white('  /risk assess - Assess trade risk'));
    console.log(chalk.white('  /agents - Show agent status'));
    console.log(chalk.white('  /quit - Exit CLI\n'));
  }

  async startInteractiveMode(): Promise<void> {
    this.isInteractive = true;
    console.log(chalk.cyan('\n🚀 Entering interactive mode...'));
    console.log(chalk.gray('Type /help for commands or /quit to exit\n'));

    while (this.isInteractive) {
      const { command } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: chalk.yellow('trader-agent>'),
          prefix: ''
        }
      ]);

      await this.processInteractiveCommand(command.trim());
    }
  }

  private async processInteractiveCommand(command: string): Promise<void> {
    try {
      if (command.startsWith('/')) {
        await this.handleSlashCommand(command);
      } else if (command) {
        console.log(chalk.red('Unknown command. Use /help for available commands.'));
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
    }
  }

  private async handleSlashCommand(command: string): Promise<void> {
    const parts = command.slice(1).split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        this.commandHandlers.showHelp();
        break;
      case 'quit':
      case 'exit':
        this.isInteractive = false;
        console.log(chalk.cyan('👋 Goodbye!'));
        break;
      case 'strategy':
        await this.commandHandlers.handleStrategyCommand(args[0], args[1]);
        break;
      case 'risk':
        await this.commandHandlers.handleRiskCommand(args[0]);
        break;
      case 'agents':
        this.commandHandlers.showAgentStatus();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${cmd}`));
    }
  }

  run(args: string[]): void {
    this.program.parse(args);
  }
}
