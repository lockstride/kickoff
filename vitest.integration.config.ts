import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { probeRateLimits, calculateMaxWorkers } from './tests/integration/rate-limit-probe';

export default defineConfig(async () => {
  // Cast: loadEnv returns Record<string, string> but non-existent keys are undefined at runtime
  const env = loadEnv('test', process.cwd(), '') as Record<string, string | undefined>;

  // Make API key available to the probe (loadEnv doesn't set process.env)
  process.env.ANTHROPIC_API_KEY ??= env.ANTHROPIC_API_KEY;

  // Explicit override skips the probe entirely
  const explicit = process.env.INTEGRATION_MAX_CONCURRENCY ?? env.INTEGRATION_MAX_CONCURRENCY;
  let maxWorkers: number;

  if (explicit) {
    maxWorkers = parseInt(explicit, 10);
  } else {
    const model =
      process.env.INTEGRATION_GENERATION_MODEL ??
      env.INTEGRATION_GENERATION_MODEL ??
      'claude-haiku-4-5';
    const limits = await probeRateLimits(model);
    maxWorkers = calculateMaxWorkers(limits);

    if (limits) {
      console.log(
        `⚡ Rate limits (${model}): ${limits.outputTokensPerMinute.toLocaleString()} output TPM → ${String(maxWorkers)} worker(s)`
      );
    } else {
      console.log(`⚡ Rate limit probe skipped (no API key) → ${String(maxWorkers)} worker(s)`);
    }
  }

  return {
    test: {
      globals: true,
      environment: 'node',
      include: ['tests/integration/**/*.e2e.ts'],
      globalSetup: ['tests/integration/setup.ts'],
      testTimeout: 900000, // 15 minutes per task (3 trials × 5 min max each)
      hookTimeout: 120000, // 2 minutes for setup/teardown
      reporters: ['default'],
      env,
      pool: 'forks',
      maxWorkers,
    },
  };
});
