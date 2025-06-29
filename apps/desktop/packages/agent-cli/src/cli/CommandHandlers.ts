import chalk from 'chalk';
import { AgentController } from '../agents/AgentController.js';

export class CommandHandlers {
  constructor(private controller: AgentController) {}

  async handleStrategyCommand(action: string, symbol: string): Promise<void> {
    if (!action || !symbol) {
      console.log(chalk.red('Usage: /strategy <analyze|recommend> <symbol>'));
      return;
    }

    const spinner = chalk.yellow('🔄 Analyzing strategy...');
    console.log(spinner);

    try {
      const result = await this.controller.executeTask('strategy', {
        type: action,
        symbol: symbol.toUpperCase(),
        timeframe: '1h',
        marketData: {} // In real implementation, fetch from APIs
      });

      console.log(chalk.green('\n📊 Strategy Analysis Results:'));
      console.log(chalk.white(`Symbol: ${result.symbol}`));
      console.log(chalk.white(`Action: ${result.action}`));
      console.log(chalk.white(`Confidence: ${Math.round(result.confidence * 100)}%`));
      console.log(chalk.white(`Risk Level: ${result.riskLevel}`));
      console.log(chalk.white(`Reasoning: ${result.reasoning}`));
      
      if (result.priceTarget) {
        console.log(chalk.white(`Price Target: $${result.priceTarget}`));
      }
      if (result.stopLoss) {
        console.log(chalk.white(`Stop Loss: $${result.stopLoss}`));
      }
    } catch (error) {
      console.log(chalk.red(`Strategy analysis failed: ${error.message}`));
    }
  }

  async handleRiskCommand(action: string): Promise<void> {
    if (!action) {
      console.log(chalk.red('Usage: /risk <assess|monitor>'));
      return;
    }

    console.log(chalk.yellow('🔄 Assessing risk...'));

    try {
      const result = await this.controller.executeTask('risk', {
        type: action,
        portfolioData: { balance: 10000, positions: [] },
        marketConditions: { volatility: 'medium' },
        positionSize: 1000
      });

      console.log(chalk.green('\n⚠️  Risk Assessment Results:'));
      console.log(chalk.white(`Overall Risk: ${result.overallRisk}`));
      console.log(chalk.white(`Max Position: $${result.maxPositionSize}`));
      console.log(chalk.white('Recommendations:'));
      result.recommendations.forEach(rec => {
        console.log(chalk.white(`  • ${rec}`));
      });
    } catch (error) {
      console.log(chalk.red(`Risk assessment failed: ${error.message}`));
    }
  }

  showAgentStatus(): void {
    const statuses = this.controller.getAgentStatuses();
    
    console.log(chalk.cyan('\n🤖 Agent Status:'));
    statuses.forEach(status => {
      const statusColor = status.status === 'idle' ? chalk.green :
                         status.status === 'working' ? chalk.yellow :
                         status.status === 'error' ? chalk.red : chalk.gray;
      
      console.log(`${statusColor('●')} ${status.name}: ${statusColor(status.status)}`);
      console.log(`   Tasks completed: ${status.tasksCompleted}`);
      console.log(`   Queue: ${status.tasksInQueue}`);
      console.log(`   Health: ${status.healthCheck ? '✅' : '❌'}`);
    });
  }

  showHelp(): void {
    console.log(chalk.cyan('\n📚 Available Commands:'));
    console.log(chalk.white('/strategy analyze <symbol>  - Analyze trading strategy'));
    console.log(chalk.white('/strategy recommend <symbol> - Get trade recommendations'));
    console.log(chalk.white('/risk assess               - Assess current risk'));
    console.log(chalk.white('/risk monitor              - Monitor ongoing risk'));
    console.log(chalk.white('/agents                    - Show agent status'));
    console.log(chalk.white('/help                      - Show this help'));
    console.log(chalk.white('/quit                      - Exit CLI'));
  }
}
