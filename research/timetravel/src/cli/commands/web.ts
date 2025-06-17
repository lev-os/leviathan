import chalk from 'chalk';
import { spawn } from 'child_process';
import { ApiServer } from '@api/server';

export async function WebCommand(options: {
  port: string;
  open?: boolean;
}) {
  const port = parseInt(options.port);
  
  console.log(chalk.blue('🌐 Starting TimeTravel Web Interface...\n'));
  
  try {
    // Start API server
    const server = new ApiServer();
    await server.start(port);
    
    const url = `http://localhost:${port}`;
    console.log(chalk.green(`✅ Server running at ${url}`));
    
    if (options.open) {
      console.log(chalk.blue('🔗 Opening browser...'));
      openBrowser(url);
    }
    
    console.log(chalk.gray('\nPress Ctrl+C to stop the server'));
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Shutting down server...'));
      await server.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error(chalk.red('Failed to start web interface:'), error);
    process.exit(1);
  }
}

function openBrowser(url: string) {
  const platform = process.platform;
  const command = platform === 'darwin' ? 'open' : 
                  platform === 'win32' ? 'start' : 'xdg-open';
  
  spawn(command, [url], { detached: true, stdio: 'ignore' });
}