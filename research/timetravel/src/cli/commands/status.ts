import chalk from 'chalk'
// TODO: Implement ResearchDatabase
// import { ResearchDatabase } from '@api/database/research';

export async function StatusCommand(options: { json?: boolean }) {
  // const db = new ResearchDatabase();

  try {
    // TODO: Implement database queries
    const recentResearch: any[] = []
    const systemStats = {
      totalSessions: 0,
      successRate: 0,
      avgDuration: 0,
    }

    if (options.json) {
      console.log(JSON.stringify({ recentResearch, systemStats }, null, 2))
      return
    }

    console.log(chalk.blue('📊 TimeTravel System Status\n'))

    // System stats
    console.log(chalk.bold('System Statistics:'))
    console.log(`Total research sessions: ${systemStats.totalSessions}`)
    console.log(`Success rate: ${(systemStats.successRate * 100).toFixed(1)}%`)
    console.log(`Average duration: ${systemStats.avgDuration.toFixed(1)}s`)
    console.log('')

    // Recent research
    console.log(chalk.bold('Recent Research:'))
    if (recentResearch.length === 0) {
      console.log(chalk.gray('No recent research found'))
    } else {
      recentResearch.forEach((research: any, index: number) => {
        const status = getStatusIcon(research.status)
        const ago = getTimeAgo(research.timestamp)
        console.log(`${status} ${research.topic} (${ago})`)
      })
    }
  } catch (error) {
    console.error(chalk.red('Failed to get status:'), error)
    process.exit(1)
  }
}
function getStatusIcon(status: string): string {
  switch (status) {
    case 'completed':
      return chalk.green('✅')
    case 'running':
      return chalk.yellow('🔄')
    case 'failed':
      return chalk.red('❌')
    case 'pending':
      return chalk.gray('⏳')
    default:
      return '❓'
  }
}

function getTimeAgo(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}
