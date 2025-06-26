import { Logger } from '../utils/logger'
import * as path from 'path'
import * as fs from 'fs-extra'

interface ApiConfig {
  [key: string]: {
    apiKey?: string
    baseUrl?: string
    timeout?: number
  }
}

interface AppConfig {
  port: number
  env: string
  apis: ApiConfig
  research: {
    maxConcurrentRequests: number
    defaultTimeout: number
    retryAttempts: number
  }
}

export class ConfigManager {
  private logger = new Logger('ConfigManager')
  private config: AppConfig
  private configPath: string

  constructor() {
    this.configPath = path.join(process.cwd(), 'config')
    this.config = this.loadDefaultConfig()
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing configuration manager...')
    await this.loadConfig()
  }

  private loadDefaultConfig(): AppConfig {
    return {
      port: parseInt(process.env.PORT || '3000'),
      env: process.env.NODE_ENV || 'development',
      apis: {
        perplexity: {
          apiKey: process.env.PERPLEXITY_API_KEY,
          baseUrl: 'https://api.perplexity.ai',
          timeout: 30000,
        },
        elicit: {
          apiKey: process.env.ELICIT_API_KEY,
          baseUrl: 'https://api.elicit.org',
          timeout: 30000,
        },
        deepseek: {
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseUrl: 'https://api.deepseek.com',
          timeout: 30000,
        },
      },
      research: {
        maxConcurrentRequests: 5,
        defaultTimeout: 60000,
        retryAttempts: 3,
      },
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const env = process.env.NODE_ENV || 'development'
      const configFile = path.join(this.configPath, `${env}.yaml`)

      if (await fs.pathExists(configFile)) {
        // Load and merge with default config
        this.logger.info(`Loading config from: ${configFile}`)
        // TODO: Implement YAML parsing
      }
    } catch (error) {
      this.logger.error('Failed to load configuration:', error as Error)
    }
  }

  get(key: string): any {
    const keys = key.split('.')
    let value: any = this.config

    for (const k of keys) {
      value = value?.[k]
    }

    return value
  }

  getApiConfig(apiName: string): ApiConfig[string] | undefined {
    return this.config.apis[apiName]
  }

  getAll(): AppConfig {
    return { ...this.config }
  }
}
