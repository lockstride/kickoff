import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/e2e/**/*.e2e.ts'],
    globalSetup: ['tests/e2e/setup.ts'],
    testTimeout: 900000, // 15 minutes per task (3 trials × 5 min max each)
    hookTimeout: 120000, // 2 minutes for setup/teardown
    reporters: ['default'],
    env: loadEnv('test', process.cwd(), ''),
    // Run tests sequentially to avoid API rate limits and resource contention
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
  },
});
