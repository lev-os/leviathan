import { Router, Request, Response } from 'express'
import { ResearchEngine } from '../engine/research'
import { ResearchConfig } from '@shared/types'
import { Logger } from '../utils/logger'

const router = Router()
const logger = new Logger('ResearchRoute')
const researchEngine = new ResearchEngine()

// Initialize research engine
researchEngine.initialize().catch((error) => {
  logger.error('Failed to initialize research engine:', error as Error)
})

// Execute research
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const config: ResearchConfig = req.body

    if (!config.topic) {
      return res.status(400).json({ error: 'Topic is required' })
    }

    const result = await researchEngine.execute(config)
    res.json(result)
  } catch (error) {
    logger.error('Research execution failed:', error as Error)
    res.status(500).json({ error: 'Research execution failed' })
  }
})

// Get research history
router.get('/history', async (req: Request, res: Response) => {
  try {
    // TODO: Implement research history retrieval
    res.json({ history: [] })
  } catch (error) {
    logger.error('Failed to retrieve history:', error as Error)
    res.status(500).json({ error: 'Failed to retrieve history' })
  }
})

// Get research by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // TODO: Implement research retrieval by ID
    res.json({ message: `Research ${id} not implemented yet` })
  } catch (error) {
    logger.error('Failed to retrieve research:', error as Error)
    res.status(500).json({ error: 'Failed to retrieve research' })
  }
})

export default router
