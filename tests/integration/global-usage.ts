import type { UsageStats } from './types';

/**
 * Global usage accumulator for integration test suite.
 * Each test runner appends its usage to this accumulator.
 */
class UsageAccumulator {
  private totals: UsageStats = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
    apiCalls: 0,
    estimatedCostUsd: 0,
  };

  add(usage: UsageStats): void {
    this.totals.inputTokens += usage.inputTokens;
    this.totals.outputTokens += usage.outputTokens;
    this.totals.cacheCreationInputTokens += usage.cacheCreationInputTokens;
    this.totals.cacheReadInputTokens += usage.cacheReadInputTokens;
    this.totals.apiCalls += usage.apiCalls;
    this.totals.estimatedCostUsd += usage.estimatedCostUsd;
  }

  getTotals(): UsageStats {
    return { ...this.totals };
  }

  reset(): void {
    this.totals = {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
      apiCalls: 0,
      estimatedCostUsd: 0,
    };
  }
}

export const globalUsage = new UsageAccumulator();
