import { writeFileSync, readdirSync, readFileSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { UsageStats } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const USAGE_DIR = resolve(__dirname, 'transcripts');
const USAGE_SUFFIX = '-usage.json';

/**
 * File-based usage accumulator for integration test suite.
 *
 * Each worker process writes a unique usage file. The main process
 * aggregates them in teardown. This is safe for parallel execution
 * across forked Vitest workers.
 */
class UsageAccumulator {
  /** Write this worker's usage to a uniquely-named file. */
  add(usage: UsageStats): void {
    const filename = `${randomUUID()}${USAGE_SUFFIX}`;
    writeFileSync(join(USAGE_DIR, filename), JSON.stringify(usage));
  }

  /** Read and aggregate all usage files written by workers. */
  getTotals(): UsageStats {
    const totals: UsageStats = {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
      apiCalls: 0,
      estimatedCostUsd: 0,
    };

    const files = readdirSync(USAGE_DIR).filter((f) => f.endsWith(USAGE_SUFFIX));
    for (const file of files) {
      const data = JSON.parse(readFileSync(join(USAGE_DIR, file), 'utf-8')) as UsageStats;
      totals.inputTokens += data.inputTokens;
      totals.outputTokens += data.outputTokens;
      totals.cacheCreationInputTokens += data.cacheCreationInputTokens;
      totals.cacheReadInputTokens += data.cacheReadInputTokens;
      totals.apiCalls += data.apiCalls;
      totals.estimatedCostUsd += data.estimatedCostUsd;
    }

    return totals;
  }

  /** Remove all usage files (called at the start of a test run). */
  reset(): void {
    const files = readdirSync(USAGE_DIR).filter((f) => f.endsWith(USAGE_SUFFIX));
    for (const file of files) {
      unlinkSync(join(USAGE_DIR, file));
    }
  }
}

export const globalUsage = new UsageAccumulator();
