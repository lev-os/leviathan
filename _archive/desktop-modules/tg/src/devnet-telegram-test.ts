import { TelegramApi } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { DevnetConfigManager } from '../trading/src/devnet-config.js';

export interface TelegramTestResult {
  success: boolean;
  error?: string;
  sessionString?: string;
  userInfo?: {
    id: number;
    username?: string;
    firstName: string;
    lastName?: string;
  };
}

export class TelegramDevnetTester {
  private client: TelegramApi | null = null;
  private config: any;

  constructor() {
    this.config = DevnetConfigManager.getInstance().getConfig();
  }

  async testTelegramLogin(): Promise<TelegramTestResult> {
    console.log('🚀 Testing Telegram Login on Devnet...');

    if (!this.config.telegramConfig.apiId || !this.config.telegramConfig.apiHash) {
      return {
        success: false,
        error: 'Missing Telegram API credentials. Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env.devnet'
      };
    }

    try {
      // Initialize Telegram client
      const stringSession = new StringSession(''); // Empty for new login
      this.client = new TelegramApi(stringSession, parseInt(this.config.telegramConfig.apiId), this.config.telegramConfig.apiHash, {
        connectionRetries: 5,
      });

      // Start the client
      await this.client.start({
        phoneNumber: async () => await this.promptPhoneNumber(),
        password: async () => await this.promptPassword(),
        phoneCode: async () => await this.promptPhoneCode(),
        onError: (err) => console.log(err),
      });

      // Get user information
      const me = await this.client.getMe();
      
      return {
        success: true,
        sessionString: this.client.session.save(),
        userInfo: {
          id: me.id.toJSNumber(),
          username: me.username,
          firstName: me.firstName,
          lastName: me.lastName
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Telegram login failed: ${error.message}`
      };
    }
  }

  async testBotConnection(): Promise<TelegramTestResult> {
    console.log('🤖 Testing Telegram Bot Connection...');

    if (!this.config.telegramConfig.botToken) {
      return {
        success: false,
        error: 'Missing bot token. Please set TELEGRAM_BOT_TOKEN in .env.devnet'
      };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.config.telegramConfig.botToken}/getMe`);
      const data = await response.json();

      if (data.ok) {
        return {
          success: true,
          userInfo: {
            id: data.result.id,
            username: data.result.username,
            firstName: data.result.first_name
          }
        };
      } else {
        return {
          success: false,
          error: `Bot API error: ${data.description}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Bot connection failed: ${error.message}`
      };
    }
  }

  // Interactive prompts for authentication
  private async promptPhoneNumber(): Promise<string> {
    // In a real implementation, this would be an interactive prompt
    // For devnet testing, you might want to set this as an environment variable
    const phoneNumber = process.env.TELEGRAM_PHONE_NUMBER;
    if (!phoneNumber) {
      throw new Error('Please set TELEGRAM_PHONE_NUMBER environment variable for devnet testing');
    }
    return phoneNumber;
  }

  private async promptPassword(): Promise<string> {
    const password = process.env.TELEGRAM_PASSWORD;
    return password || '';
  }

  private async promptPhoneCode(): Promise<string> {
    // For automated testing, you might implement a different strategy
    // This would typically require manual input during development
    throw new Error('Phone code verification required - implement interactive prompt for development');
  }

  async cleanup(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }
}
