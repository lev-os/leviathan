import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.js', 'tests/**/*.test.js'],
    testTimeout: 10000
  }
})