import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { probeRateLimits, calculateMaxWorkers } from './tests/integration/rate-limit-probe';

export default defineConfig(async () => {
  // Cast: loadEnv returns Record<string, string> but non-existent keys are undefined at runtime
  const env = loadEnv('test', process.cwd(), '') as Record<string, string | undefined>;

  // Resolve API key: prefer process.env, fall back to .env file, reject empty strings.
  // This single resolved value is used for the rate-limit probe AND injected into workers
  // so that `if (!process.env.ANTHROPIC_API_KEY)` guards behave consistently everywhere.
  // Using .trim() instead of || because the linter requires ?? but we need empty-string rejection.
  const apiKey = (process.env.ANTHROPIC_API_KEY ?? env.ANTHROPIC_API_KEY ?? '').trim();
  if (apiKey) {
    env.ANTHROPIC_API_KEY = apiKey;
    process.env.ANTHROPIC_API_KEY = apiKey;
  } else {
    delete env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  }

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
      include: ['tests/integration/**/*.integration.ts'],
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
