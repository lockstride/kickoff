import type { Trial, EvalResult } from './types';

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

  console.log('└──────────────────────────────────────────────────────────────────┘');

  if (!taskPassed) {
    console.log('\n⚠️  Task failed. Check transcripts/ for details.\n');
  }
}
