/**
 * Lev Framework Middleware for big-AGI
 * Universal session management and request enhancement
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Mock Lev Framework integration - replace with actual Lev SDK
interface LevSession {
  id: string;
  context: Record<string, any>;
  memory: {
    working: any[];
    episodic: any[];
    semantic: any[];
  };
}

class LevFramework {
  async getOrCreateSession(sessionId?: string): Promise<LevSession> {
    // TODO: Integrate with actual Lev framework
    return {
      id: sessionId || `lev-${Date.now()}`,
      context: {},
      memory: { working: [], episodic: [], semantic: [] }
    };
  }

  async shouldEnhanceRequest(request: NextRequest): Promise<boolean> {
    // Smart routing: Only enhance LLM-related requests
    const isApiRoute = request.url.includes('/api/');
    const isLLMRoute = request.url.includes('/llm') || 
                     request.url.includes('/chat') ||
                     request.url.includes('/beam');
    
    return isApiRoute && isLLMRoute;
  }
}

const lev = new LevFramework();

export async function levMiddleware(request: NextRequest) {
  try {
    // 1. Extract or create session
    const sessionId = request.headers.get('x-session-id') || 
                     request.cookies.get('big-agi-session')?.value;
    
    // 2. Determine if this request needs Lev enhancement
    const shouldEnhance = await lev.shouldEnhanceRequest(request);
    
    if (!shouldEnhance) {
      // Pass through unchanged for non-LLM requests
      return NextResponse.next();
    }

    // 3. Create/restore Lev session
    const levSession = await lev.getOrCreateSession(sessionId);
    
    // 4. Enhanced headers for tRPC context
    const response = NextResponse.next({
      request: {
        headers: new Headers({
          ...Object.fromEntries(request.headers.entries()),
          'x-lev-session': levSession.id,
          'x-lev-context': JSON.stringify(levSession.context),
          'x-lev-enhanced': 'true'
        })
      }
    });

    // 5. Set session cookie for persistence
    response.cookies.set('big-agi-session', levSession.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Lev middleware error:', error);
    // Graceful fallback - don't break big-AGI
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Only intercept API routes that might benefit from Lev
    '/api/trpc/(.*)',
    '/api/llm/(.*)',
    '/api/chat/(.*)',
    '/api/beam/(.*)'
  ],
};