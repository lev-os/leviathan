import { Router, Request, Response } from 'express'
import { ConfigManager } from '../config/manager'
import { Logger } from '../utils/logger'

const router = Router()
const logger = new Logger('ConfigRoute')
const configManager = new ConfigManager()

// Initialize config manager
configManager.initialize().catch((error) => {
  logger.error('Failed to initialize config manager:', error as Error)
})

// Get all configuration
router.get('/', async (req: Request, res: Response) => {
  try {
    const config = configManager.getAll()
    // Remove sensitive data
    const sanitized = {
      ...config,
      apis: Object.keys(config.apis).reduce((acc, key) => {
        acc[key] = {
          ...config.apis[key],
          apiKey: config.apis[key].apiKey ? '***' : undefined,
        }
        return acc
      }, {} as any),
    }
    res.json(sanitized)
  } catch (error) {
    logger.error('Failed to retrieve configuration:', error as Error)
    res.status(500).json({ error: 'Failed to retrieve configuration' })
  }
})

// Get specific configuration value
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params
    const value = configManager.get(key)

    if (value === undefined) {
      return res.status(404).json({ error: 'Configuration key not found' })
    }

    // Sanitize if it's an API key
    if (key.includes('apiKey') && typeof value === 'string') {
      return res.json({ value: '***' })
    }

    res.json({ value })
  } catch (error) {
    logger.error('Failed to retrieve configuration:', error as Error)
    res.status(500).json({ error: 'Failed to retrieve configuration' })
  }
})

export default router
