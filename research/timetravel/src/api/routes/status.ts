import { Router, Request, Response } from 'express'
import { Logger } from '../utils/logger'
import * as os from 'os'

const router = Router()
const logger = new Logger('StatusRoute')
const startTime = new Date()

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

// System status
router.get('/', (req: Request, res: Response) => {
  try {
    const uptime = Math.floor((Date.now() - startTime.getTime()) / 1000)

    const status = {
      status: 'operational',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: {
        seconds: uptime,
        human: formatUptime(uptime),
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
          total: Math.round(os.totalmem() / 1024 / 1024),
          free: Math.round(os.freemem() / 1024 / 1024),
          used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
        },
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0]?.model,
        },
      },
      timestamp: new Date().toISOString(),
    }

    res.json(status)
  } catch (error) {
    logger.error('Failed to retrieve status:', error as Error)
    res.status(500).json({ error: 'Failed to retrieve status' })
  }
})

// Research statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual statistics from research repository
    const stats = {
      totalResearches: 0,
      completedResearches: 0,
      failedResearches: 0,
      averageExecutionTime: 0,
      totalApiCalls: 0,
      timestamp: new Date().toISOString(),
    }

    res.json(stats)
  } catch (error) {
    logger.error('Failed to retrieve statistics:', error as Error)
    res.status(500).json({ error: 'Failed to retrieve statistics' })
  }
})

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

export default router
