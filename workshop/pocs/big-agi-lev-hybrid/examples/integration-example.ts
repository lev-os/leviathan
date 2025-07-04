/**
 * Integration Example: How to add Lev Framework to big-AGI
 * This shows the minimal changes needed to existing big-AGI codebase
 */

// ============================================================================
// STEP 1: Replace middleware.ts
// ============================================================================

// OLD: middleware_BASIC_AUTH.ts
/*
export function middleware(request: NextRequest) {
  // Basic auth only
  return NextResponse.next();
}
*/

// NEW: middleware.ts (with Lev integration)
import { levMiddleware } from './middleware/lev-middleware';
import { basicAuthMiddleware } from './middleware_BASIC_AUTH';

export async function middleware(request: NextRequest) {
  // 1. Apply basic auth first (preserve existing functionality)
  const authResult = basicAuthMiddleware(request);
  if (authResult.status === 401) return authResult;
  
  // 2. Add Lev enhancement
  return levMiddleware(request);
}

// ============================================================================
// STEP 2: Patch tRPC server context
// ============================================================================

// File: src/server/trpc/trpc.server.ts
// MINIMAL CHANGE - just add Lev context to existing createTRPCFetchContext

export const createTRPCFetchContext = async ({ req }: FetchCreateContextFnOptions) => {
  return {
    // EXISTING: Keep all original context
    hostName: req.headers?.get('host') ?? 'localhost',
    reqSignal: req.signal,
    
    // NEW: Add Lev context (extracted from middleware headers)
    levSession: req.headers.get('x-lev-session'),
    levContext: req.headers.get('x-lev-context'),
    levEnabled: req.headers.get('x-lev-enhanced') === 'true',
  };
};

// ============================================================================
// STEP 3: Patch specific tRPC routes
// ============================================================================

// File: src/server/trpc/trpc.router-edge.ts (or wherever LLM routes are)
// SURGICAL CHANGE - enhance only routes that benefit from Lev

import { createLevEnhancedRouter } from '../trpc-patches/lev-enhanced-procedures';

// EXISTING router
const originalLlmRouter = router({
  chatGenerate: publicProcedure
    .input(/* existing schema */)
    .mutation(/* existing logic */),
  // ... other routes
});

// NEW: Enhanced router with Lev capabilities
export const llmRouter = createLevEnhancedRouter(originalLlmRouter);

// ============================================================================
// EXAMPLE CONVERSATION FLOWS
// ============================================================================

/**
 * Flow 1: Simple Chat (No Lev Enhancement)
 * 
 * User: "What's the weather today?"
 * 
 * 1. big-AGI UI → tRPC chatGenerate
 * 2. Middleware: Sets x-lev-enhanced=true but Lev decides this is simple
 * 3. Enhanced procedure: shouldOrchestrate() → false
 * 4. Result: Original big-AGI logic runs normally
 * 5. User sees: Standard weather response
 * 
 * BENEFIT: Zero overhead for simple requests
 */

/**
 * Flow 2: Complex Code Debug (Full Lev Orchestration)
 * 
 * User: "Debug this Python function that's throwing weird errors"
 * 
 * 1. big-AGI UI → tRPC chatGenerate with code snippet
 * 2. Middleware: Creates Lev session, sets enhanced headers
 * 3. Enhanced procedure: shouldOrchestrate() → true (code debugging)
 * 4. Lev orchestration:
 *    - code-analyzer agent: Syntax and logic analysis
 *    - syntax-checker agent: Error detection
 *    - solution-architect agent: Fix recommendations
 * 5. Result: Comprehensive debugging response with multiple perspectives
 * 6. User sees: High-quality analysis in big-AGI's familiar UI
 * 
 * BENEFIT: Multi-agent intelligence with zero UI changes
 */

/**
 * Flow 3: Beam Comparison (Enhanced with Lev Multi-Agent)
 * 
 * User: Clicks "Beam" to compare multiple models on creative writing
 * 
 * 1. big-AGI UI → tRPC beamCompare with prompt + model list
 * 2. Middleware: Lev session established
 * 3. Enhanced procedure: Always orchestrate for beam comparisons
 * 4. Lev enhancement:
 *    - Runs each model comparison as separate agent
 *    - Adds meta-analysis agent to compare results
 *    - Integrates conversation context from Lev memory
 * 5. Result: Enhanced beam results with deeper analysis
 * 6. User sees: Improved beam interface with richer comparisons
 * 
 * BENEFIT: big-AGI's beam + Lev's orchestration = ultimate model comparison
 */

// ============================================================================
// DEPLOYMENT CHANGES
// ============================================================================

/**
 * Environment Variables to Add:
 * 
 * LEV_ENABLED=true                    # Toggle Lev features on/off
 * LEV_MEMORY_BACKEND=graphiti         # Lev memory system
 * LEV_ORCHESTRATION_THRESHOLD=0.7     # When to trigger multi-agent
 * LEV_DEBUG=false                     # Debug logging
 */

/**
 * Package.json Changes:
 * 
 * {
 *   "dependencies": {
 *     // ... existing big-AGI dependencies
 *     "@lev-os/framework": "^1.0.0",     // Lev Framework SDK
 *     "@lev-os/memory": "^1.0.0",        // Memory integration
 *     "@lev-os/orchestrator": "^1.0.0"   // Agent orchestration
 *   }
 * }
 */

/**
 * Docker Changes (minimal):
 * 
 * # Add to existing Dockerfile
 * ENV LEV_ENABLED=true
 * 
 * # Optional: Add Lev memory services
 * # docker-compose.yml gets neo4j/qdrant if using Lev memory
 */

// ============================================================================
// ROLLBACK STRATEGY
// ============================================================================

/**
 * Zero-Risk Rollback:
 * 
 * 1. Set LEV_ENABLED=false in environment
 * 2. All Lev code becomes no-ops
 * 3. big-AGI functions exactly as before
 * 4. No data loss, no UI changes
 * 
 * Gradual Rollout:
 * 
 * 1. Start with LEV_ENABLED=true but low orchestration threshold
 * 2. Monitor performance and user feedback
 * 3. Gradually increase Lev usage as confidence grows
 * 4. Full rollout when proven stable
 */

export const integrationSummary = {
  filesChanged: 3,                    // middleware.ts, trpc.server.ts, router file
  linesAdded: '~200',                 // Minimal codebase changes
  riskLevel: 'low',                   // Graceful fallbacks everywhere
  rollbackTime: '< 5 minutes',       // Environment variable toggle
  userImpact: 'zero UI changes',     // Same interface, enhanced backend
  benefits: [
    'Multi-agent orchestration for complex tasks',
    'Enhanced memory and context',
    'Improved beam comparisons',
    'Future-ready for advanced AI capabilities'
  ]
};