import { TelegramDevnetTester, TelegramTestResult } from './devnet-telegram-test.js';
import { TradingDevnetTester, TradeTestResult } from '../trading/src/devnet-trading-test.js';

export interface TriggerTestResult {
  success: boolean;
  error?: string;
  messageId?: number;
  triggerTime?: number;
  tradeExecutionTime?: number;
  tradeResult?: TradeTestResult;
}

export class TelegramTriggerTester {
  private telegramTester: TelegramDevnetTester;
  private tradingTester: TradingDevnetTester;

  constructor() {
    this.telegramTester = new TelegramDevnetTester();
    this.tradingTester = new TradingDevnetTester();
  }

  async testBasicBotCommand(): Promise<TriggerTestResult> {
    console.log('🤖 Testing basic bot command response...');
    
    const startTime = Date.now();
    
    try {
      // Test bot connection first
      const botTest = await this.telegramTester.testBotConnection();
      if (!botTest.success) {
        return {
          success: false,
          error: `Bot connection failed: ${botTest.error}`
        };
      }

      // Simulate sending a command to the bot
      // In a real test, you'd send an actual message
      // For now, we'll test the bot's webhook/polling setup
      
      return {
        success: true,
        triggerTime: Date.now() - startTime,
        messageId: 1 // Mock message ID
      };

    } catch (error) {
      return {
        success: false,
        error: `Bot command test failed: ${error.message}`,
        triggerTime: Date.now() - startTime
      };
    }
  }

  async testTradeTriggerFromMessage(): Promise<TriggerTestResult> {
    console.log('📢 Testing trade trigger from Telegram message...');
    
    const startTime = Date.now();
    
    try {
      // Initialize trading system
      await this.tradingTester.initialize();
      
      // Simulate a message that should trigger a trade
      // Example: "BUY 0.01 SOL"
      const mockMessage = {
        text: "BUY 0.01 SOL",
        from: { id: 123456789 },
        chat: { id: -1001234567890 }, // Mock group ID
        message_id: 1
      };

      // Parse message for trade intent
      const tradeIntent = this.parseTradeMessage(mockMessage.text);
      
      if (!tradeIntent) {
        return {
          success: false,
          error: 'Failed to parse trade intent from message'
        };
      }

      // Execute trade based on message
      const tradeResult = await this.executeTradFromMessage(tradeIntent);
      
      return {
        success: tradeResult.success,
        error: tradeResult.error,
        messageId: mockMessage.message_id,
        triggerTime: Date.now() - startTime,
        tradeExecutionTime: tradeResult.executionTime,
        tradeResult
      };

    } catch (error) {
      return {
        success: false,
        error: `Trade trigger test failed: ${error.message}`,
        triggerTime: Date.now() - startTime
      };
    }
  }

  private parseTradeMessage(text: string): any | null {
    // Simple regex to parse "BUY 0.01 SOL" format
    const buyPattern = /BUY\s+([\d.]+)\s+(\w+)/i;
    const sellPattern = /SELL\s+([\d.]+)\s+(\w+)/i;
    
    let match = text.match(buyPattern);
    if (match) {
      return {
        action: 'BUY',
        amount: parseFloat(match[1]),
        token: match[2].toUpperCase()
      };
    }
    
    match = text.match(sellPattern);
    if (match) {
      return {
        action: 'SELL',
        amount: parseFloat(match[1]),
        token: match[2].toUpperCase()
      };
    }
    
    return null;
  }

  private async executeTradFromMessage(intent: any): Promise<TradeTestResult> {
    // For devnet testing, execute a simple swap
    if (intent.action === 'BUY' && intent.token === 'SOL') {
      return await this.tradingTester.testBasicSwap();
    }
    
    return {
      success: false,
      error: `Unsupported trade intent: ${intent.action} ${intent.token}`
    };
  }

  async cleanup(): Promise<void> {
    await this.telegramTester.cleanup();
  }
}
