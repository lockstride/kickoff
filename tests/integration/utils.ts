import type { Trial, EvalResult, UsageStats } from './types';
import type { Usage } from '@anthropic-ai/sdk/resources/messages';

/**
 * Calculate required passes from a pass rate.
 * Uses Math.round for proper rounding (0.67 with 3 trials = 2, not 3).
 */
export function calculateRequiredPasses(trials: number, passRate: number): number {
  return Math.max(1, Math.round(trials * passRate));
}

/**
 * Format milliseconds into human-readable duration.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toString()}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins.toString()}m ${secs.toString()}s`;
}

/**
 * Format trial details for console output.
 */
export function formatTrialDetails(trial: Trial): string[] {
  const lines: string[] = [];
  const icon = trial.passed ? '✓' : '✗';
  const dur = formatDuration(trial.durationMs);

  lines.push(`      Trial ${trial.trialNumber.toString()}: ${icon} (${dur})`);

  for (const g of trial.graderResults) {
    if (g.type === 'code') {
      const checks = g.details as { check: string; passed: boolean; message: string | null }[];
      const passed = checks.filter((c) => c.passed).length;
      const total = checks.length;

      if (passed === total) {
        lines.push(`        Code: ✓ ${passed.toString()}/${total.toString()}`);
      } else {
        lines.push(`        Code: ✗ ${passed.toString()}/${total.toString()}`);
        const failed = checks.filter((c) => !c.passed);
        for (const f of failed.slice(0, 3)) {
          lines.push(`          - ${f.message ?? f.check}`);
        }
        if (failed.length > 3) {
          lines.push(`          ... +${(failed.length - 3).toString()} more`);
        }
      }
    } else {
      const score = g.score ?? 0;
      const icon = score >= 0.7 ? '✓' : '✗';
      lines.push(`        LLM: ${icon} ${(score * 100).toFixed(0)}%`);
    }
  }

  return lines;
}

/**
 * Print summary for a single task evaluation.
 */
export function printTaskSummary(result: EvalResult, minPassRate: number): void {
  const requiredPasses = calculateRequiredPasses(result.trials, minPassRate);
  const taskPassed = result.passed >= requiredPasses;

  const icon = taskPassed ? '✓' : '✗';
  const rate = `${(result.passRate * 100).toFixed(0)}%`;
  const trials =
    result.trialsRun < result.trials
      ? `${result.passed.toString()}/${result.trialsRun.toString()} (early)`
      : `${result.passed.toString()}/${result.trials.toString()}`;

  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log(
    `│  ${icon} ${result.task.padEnd(45)} ${trials.padEnd(10)} ${rate.padStart(4)}`.padEnd(67) + '│'
  );

  if (!taskPassed) {
    for (const trial of result.trialResults) {
      const lines = formatTrialDetails(trial);
      for (const line of lines) {
        console.log(`│  ${line}`.padEnd(67) + '│');
      }
    }
  }

  // Usage summary
  if (result.totalUsage.apiCalls > 0) {
    const u = result.totalUsage;
    const costStr = `$${u.estimatedCostUsd.toFixed(4)}`;
    const tokensStr = `${formatTokenCount(u.inputTokens)} in / ${formatTokenCount(u.outputTokens)} out`;
    console.log(`│  Cost: ${costStr}  Tokens: ${tokensStr}`.padEnd(67) + '│');
  }

  console.log('└──────────────────────────────────────────────────────────────────┘');

  if (!taskPassed) {
    console.log('\n⚠️  Task failed. Check transcripts/ for details.\n');
  }
}

// ============================================================================
// Usage Tracking
// ============================================================================

/** Per-million-token pricing for supported models (USD). */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5': { input: 0.8, output: 4.0 },
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-opus-4-5': { input: 15.0, output: 75.0 },
};

export function emptyUsageStats(): UsageStats {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
    apiCalls: 0,
    estimatedCostUsd: 0,
  };
}

export function accumulateUsage(stats: UsageStats, response: Usage, model: string): void {
  stats.inputTokens += response.input_tokens;
  stats.outputTokens += response.output_tokens;
  stats.cacheCreationInputTokens += response.cache_creation_input_tokens ?? 0;
  stats.cacheReadInputTokens += response.cache_read_input_tokens ?? 0;
  stats.apiCalls += 1;
  stats.estimatedCostUsd = estimateCost(stats, model);
}

export function mergeUsageStats(target: UsageStats, source: UsageStats): void {
  target.inputTokens += source.inputTokens;
  target.outputTokens += source.outputTokens;
  target.cacheCreationInputTokens += source.cacheCreationInputTokens;
  target.cacheReadInputTokens += source.cacheReadInputTokens;
  target.apiCalls += source.apiCalls;
  target.estimatedCostUsd += source.estimatedCostUsd;
}

function estimateCost(stats: UsageStats, model: string): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING['claude-haiku-4-5'];
  const inputCost = (stats.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (stats.outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1_000_000) return `${(tokens / 1000).toFixed(1)}k`;
  return `${(tokens / 1_000_000).toFixed(2)}M`;
}
