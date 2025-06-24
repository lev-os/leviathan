export interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: any;
}

export class MCPMockClient {
  private handlers = new Map<string, Function>();
  private requestId = 1;

  onToolCall(toolName: string, handler: Function): void {
    this.handlers.set(toolName, handler);
  }

  async listTools(): Promise<MCPResponse> {
    return {
      jsonrpc: '2.0',
      id: this.requestId++,
      result: {
        tools: Array.from(this.handlers.keys()).map(name => ({
          name,
          description: `Mock tool: ${name}`,
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }))
      }
    };
  }

  async callTool(name: string, args: any): Promise<MCPResponse> {
    const handler = this.handlers.get(name);
    if (!handler) {
      return {
        jsonrpc: '2.0',
        id: this.requestId++,
        error: {
          code: -32602,
          message: `Tool not found: ${name}`
        }
      };
    }

    try {
      const result = await handler(args);
      return {
        jsonrpc: '2.0',
        id: this.requestId++,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result)
            }
          ]
        }
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: this.requestId++,
        result: {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ],
          isError: true
        }
      };
    }
  }

  async simulateAgentWork(taskId: string, workSteps: Array<{
    progress: number;
    decision: string;
    rationale: string;
    delay?: number;
  }>): Promise<void> {
    for (const step of workSteps) {
      if (step.delay) {
        await this.delay(step.delay);
      }
      
      await this.updateProgress(taskId, step.progress);
      await this.logDecision(taskId, step.decision, step.rationale);
    }
    
    await this.updateStatus(taskId, 'completed');
  }

  private async updateProgress(taskId: string, progress: number): Promise<void> {
    // Simulate progress update
    console.log(`[MOCK] Updating ${taskId} progress to ${progress}%`);
  }

  private async logDecision(taskId: string, decision: string, rationale: string): Promise<void> {
    // Simulate decision logging
    console.log(`[MOCK] Decision for ${taskId}: ${decision} - ${rationale}`);
  }

  private async updateStatus(taskId: string, status: string): Promise<void> {
    // Simulate status update
    console.log(`[MOCK] Updating ${taskId} status to ${status}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
