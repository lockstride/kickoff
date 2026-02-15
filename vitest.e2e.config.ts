import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/e2e/**/*.e2e.ts'],
    testTimeout: 900000, // 15 minutes per test (SDK tests are slow)
    hookTimeout: 120000, // 2 minutes for setup/teardown
    reporters: ['default'],
    env: loadEnv('test', process.cwd(), ''),
    pool: 'forks',
    // Default 2 workers to stay within Anthropic rate limits.
    // Override with E2E_MAX_CONCURRENCY for higher-tier accounts.
    maxWorkers: process.env.E2E_MAX_CONCURRENCY ? parseInt(process.env.E2E_MAX_CONCURRENCY) : 2,
  },
});
