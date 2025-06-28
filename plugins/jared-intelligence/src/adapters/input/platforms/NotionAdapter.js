/**
 * Notion Platform Input Adapter  
 * Handles Notion webhooks and database queries
 */

export class NotionAdapter {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  async initialize() {
    if (this.config.token) {
      const { Client } = await import('@notionhq/client');
      this.client = new Client({
        auth: this.config.token
      });
    }
    console.log('📝 Notion adapter initialized');
  }

  // Convert Notion events to domain events
  async transformNotionEvent(event) {
    return {
      type: 'project_update',
      data: event,
      context: {
        platform: 'notion',
        timestamp: new Date().toISOString()
      }
    };
  }

  async queryDatabase(databaseId, filter) {
    if (!this.client) throw new Error('Notion client not initialized');
    
    return await this.client.databases.query({
      database_id: databaseId,
      filter
    });
  }

  async updatePage(pageId, properties) {
    if (!this.client) throw new Error('Notion client not initialized');
    
    return await this.client.pages.update({
      page_id: pageId,
      properties
    });
  }

  async createPage(parent, properties) {
    if (!this.client) throw new Error('Notion client not initialized');
    
    return await this.client.pages.create({
      parent,
      properties
    });
  }
}