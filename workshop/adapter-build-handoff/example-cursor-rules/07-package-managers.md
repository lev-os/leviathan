# Package Manager Preferences

1. Check for lock files first:

   - pnpm-lock.yaml → use pnpm
   - yarn.lock → use yarn
   - package-lock.json → use npm

2. Default to **pnpm** if no lock file exists

3. Never mix package managers in same project

4. Always commit lock files after changes
