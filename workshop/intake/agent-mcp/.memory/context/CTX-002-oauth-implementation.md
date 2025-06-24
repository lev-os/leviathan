# Context CTX-002-oauth-implementation
Task: TASK-002 - Add authentication to AI Academy
Type: subtask
Created: 2025-05-23T15:05:00Z

## Objective
Implement OAuth social login with Google, LinkedIn, and GitHub for AI Academy learners.

## Acceptance Criteria
- [ ] Social login buttons in Academy modal
- [ ] User profile stored in PostgreSQL
- [ ] Session persists across page refreshes
- [ ] Logout functionality
- [ ] Protected API routes require authentication

## Current Code (TO REPLACE)
```vue
<!-- components/academy/SocialLoginModal.vue -->
<button @click="loginWith('google')" class="social-btn google">
  <Icon name="mdi:google" />
  Continue with Google
</button>

<script setup>
// Placeholder - needs implementation
const loginWith = async (provider: string) => {
  console.log('Login not implemented');
};
</script>
```

## Implementation
```typescript
// app.config.ts
export default defineAppConfig({
  auth: {
    providers: ['google', 'linkedin', 'github'],
    redirectUrl: '/academy/dashboard'
  }
});

// server/api/auth/[...].ts
import { NuxtAuthHandler } from '#auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import GitHubProvider from 'next-auth/providers/github';

export default NuxtAuthHandler({
  providers: [
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    LinkedInProvider.default({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    }),
    GitHubProvider.default({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create/update user in DB
      await createOrUpdateUser(user);
      return true;
    },
    async session({ session, token }) {
      // Add user ID to session
      session.userId = token.sub;
      return session;
    }
  }
});

// composables/useAuth.ts
export const useAuth = () => {
  const { data: session, status } = useSession();
  
  return {
    user: computed(() => session.value?.user),
    isAuthenticated: computed(() => status.value === 'authenticated'),
    signIn: (provider: string) => signIn(provider),
    signOut: () => signOut()
  };
};
```

## Files to Modify
- `nuxt.config.ts` - Add @sidebase/nuxt-auth module
- `components/academy/SocialLoginModal.vue` - Wire up buttons
- `pages/academy/dashboard.vue` - Add auth middleware
- `server/api/academy/*` - Add auth checks

## Testing Requirements
- Unit tests for auth callbacks
- E2E tests for login flow
- Test session persistence
- Test protected route access