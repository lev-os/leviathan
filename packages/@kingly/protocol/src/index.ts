/**
 * @kingly/protocol - Kernel MCP Protocol
 * 
 * The foundation of Kingly OS where traditional system calls
 * are replaced with intelligent protocol handlers.
 */

export interface KernelMCPRequest {
  intent: string;
  context: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  timestamp?: number;
}

export interface KernelMCPResponse {
  success: boolean;
  result?: unknown;
  error?: string;
  metadata?: {
    inferenceTime: number;
    cacheHit: boolean;
    confidence: number;
  };
}

export interface ProtocolHandler {
  canHandle(request: KernelMCPRequest): boolean;
  handle(request: KernelMCPRequest): Promise<KernelMCPResponse>;
}

export class KernelMCP {
  private handlers: Map<string, ProtocolHandler> = new Map();
  private cache: Map<string, KernelMCPResponse> = new Map();

  registerHandler(pattern: string, handler: ProtocolHandler) {
    this.handlers.set(pattern, handler);
  }

  async execute(request: KernelMCPRequest): Promise<KernelMCPResponse> {
    const cacheKey = JSON.stringify(request);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cacheHit: true,
        },
      };
    }

    // Find handler
    for (const [pattern, handler] of this.handlers) {
      if (handler.canHandle(request)) {
        const start = Date.now();
        const response = await handler.handle(request);
        
        // Add metadata
        response.metadata = {
          inferenceTime: Date.now() - start,
          cacheHit: false,
          confidence: response.metadata?.confidence ?? 1.0,
        };

        // Cache successful responses
        if (response.success) {
          this.cache.set(cacheKey, response);
        }

        return response;
      }
    }

    return {
      success: false,
      error: 'No handler found for request',
    };
  }
}

// Export singleton instance
export const kernelMCP = new KernelMCP();