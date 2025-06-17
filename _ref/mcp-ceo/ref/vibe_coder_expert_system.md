# React/Next.js/Firebase Architecture & Security Expert

## Mission Statement
Transform this vibe-coded React/Next.js/Firebase/Tailwind project into a professionally managed, secure codebase with drop-in analytics/error tracking capabilities while maintaining rapid development velocity.

## Multi-Expert Analysis Framework

Analyze this codebase from four expert perspectives:

### Expert A: Firebase Security Specialist
- Audit for exposed API keys and security vulnerabilities
- Evaluate Firebase Security Rules and authentication flows
- Identify external API calls that should move to Firebase Functions
- Assess environment variable security and secret management

### Expert B: React Architecture Engineer  
- Evaluate state management patterns (Context overuse, prop drilling)
- Assess component decomposition opportunities (files >150 lines)
- Recommend service layer patterns with BaseService inheritance
- Design global action dispatcher for instrumentation

### Expert C: CSS/Design System Architect
- Audit hardcoded Tailwind classes and design inconsistencies
- Design semantic design token system and theming architecture
- Eliminate per-component dark mode implementations
- Create scalable CSS architecture with proper abstraction

### Expert D: Developer Experience & Flow Preservation
- Identify how to maintain vibe coder's rapid development style
- Recommend tooling that enhances rather than hinders productivity
- Design patterns that feel natural and intuitive
- Ensure architecture supports creative problem-solving

## Critical Architecture Requirements

### 1. Security First (Non-Negotiable)
```yaml
Security Rules:
- No API keys in client-side code
- External APIs only through Firebase Functions  
- Environment variables properly secured
- Firebase Admin SDK only in functions/API routes
```

### 2. State Management Hierarchy
```yaml
Priority Order:
1. Zustand stores (global state)
2. useReducer (complex local state)
3. useState (simple local state)  
4. Context (theme/locale only - avoid re-renders)
```

### 3. Service Layer with Auto-Instrumentation
```javascript
// All services inherit instrumentation for drop-in tools
abstract class BaseService {
  protected async performOperation<T>(operation, fn, context) {
    // Auto-log start, success, errors for analytics
    // Built-in error handling and performance timing
  }
}
```

### 4. Global Action Dispatcher for Drop-in Tools
```javascript
// Components dispatch actions, never call analytics directly
GlobalDispatcher.dispatch({ type: 'USER_CHECKOUT', payload: data });

// Tools plug in without touching components
GlobalDispatcher.registerAnalyticsAdapter(new PostHogAdapter());
GlobalDispatcher.registerErrorAdapter(new SentryAdapter());
```

## Required Deliverables

### Security & Architecture Analysis
- Firebase security audit with specific fixes needed
- State management refactoring plan (Context → Zustand migration)
- Service layer implementation strategy  
- Component decomposition roadmap (>150 line files)

### Drop-in Tool Architecture
- Global action dispatcher implementation
- Service layer auto-instrumentation setup
- Error boundary and global error handling
- Analytics event standardization

### CSS/Design System Transformation
- Semantic design token system architecture
- Elimination of hardcoded Tailwind utility classes
- Centralized theming with no per-component dark mode logic
- Component abstraction patterns for scalable CSS

### Documentation Suite (`docs/onboarding/`)
```
README.md              # Stack overview and security guidelines
state-management.md    # Zustand hierarchy and patterns  
service-layer.md       # BaseService inheritance guide
global-actions.md      # Action dispatcher system
firebase-security.md   # Security best practices and rules
design-system.md       # Semantic theming and CSS architecture
testing-guide.md       # Service and component testing patterns
cursor-rules.md        # IDE configuration for this stack
agent.md              # Complete autonomous agent guide
```

### agent.md Requirements
This file must be a complete guide enabling AI agents to:
- Follow state management hierarchy (Zustand > useReducer > useState > Context)
- Use service layer patterns with BaseService inheritance
- Dispatch proper global actions for analytics tracking
- Maintain Firebase security practices (no exposed keys)
- Apply semantic design tokens and theme-aware CSS patterns
- Never use hardcoded Tailwind classes or implement per-component theming
- Apply consistent testing patterns and quality gates
- Know exact file organization and naming conventions

## Validation Framework

### Security Validation
- [ ] No API keys found in client code
- [ ] All external APIs route through Firebase Functions
- [ ] Environment variables properly configured
- [ ] Firebase Security Rules reviewed and updated

### Architecture Validation  
- [ ] State management follows hierarchy
- [ ] Components under 150 lines or justified exceptions
- [ ] Service layer implements BaseService pattern
- [ ] Global actions flow through dispatcher

### Tool Integration Validation
- [ ] Analytics can be added without component changes
- [ ] Error tracking can be added without component changes
- [ ] Performance monitoring hooks are in place
- [ ] Testing strategy supports mocked dependencies

## Execution Protocol

1. **Security-First Analysis**: Audit Firebase setup, API key exposure, external API calls
2. **Architecture Assessment**: Evaluate state patterns, component structure, service layer gaps
3. **Expert Synthesis**: Combine all four expert perspectives into unified recommendations
4. **Documentation Generation**: Create comprehensive, actionable guides for humans and AI
5. **Validation**: Ensure recommendations maintain vibe coder workflow while adding structure

**Stack Context**: React/Next.js frontend, Firebase backend (Auth/Firestore/Functions/Storage), Tailwind CSS styling, rapid prototyping development style.

**Begin comprehensive security audit and architecture transformation.**