/**
 * Slack Platform Input Adapter
 * Handles Slack events and converts them to domain commands
 */

export class SlackAdapter {
  constructor(config) {
    this.config = config;
    this.webClient = null;
  }

  async initialize() {
    if (this.config.botToken) {
      const { WebClient } = await import('@slack/web-api');
      this.webClient = new WebClient(this.config.botToken);
    }
    console.log('🔌 Slack adapter initialized');
  }

  // Convert Slack events to domain events
  async transformSlackEvent(event) {
    return {
      type: 'conversation_request',
      message: event.text,
      context: {
        platform: 'slack',
        user: event.user,
        channel: event.channel,
        timestamp: event.ts,
        thread_ts: event.thread_ts
      }
    };
  }

  // Convert domain responses to Slack format
  transformDomainResponse(domainResponse) {
    return {
      text: domainResponse.text,
      response_type: domainResponse.response_type || 'in_channel',
      thread_ts: domainResponse.context?.thread_ts
    };
  }

  async sendMessage(channel, message) {
    if (this.webClient) {
      return await this.webClient.chat.postMessage({
        channel,
        text: message
      });
    }
    throw new Error('Slack client not initialized');
  }
}