import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Run tests sequentially — they depend on shared state (created issue, etc.)
    sequence: { concurrent: false },
    // Point to src so TS files are resolved directly
    include: ['tests/**/*.test.ts']
  }
})
