import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { evaluateTask, GENERATION_MODEL, GRADER_MODEL, MIN_PASS_RATE } from './harness';
import { calculateRequiredPasses, printTaskSummary } from './utils';
import { progress } from './progress';
import { globalUsage } from './global-usage';
import type { Task, EvalResult } from './types';

/**
 * Create a test suite for a single task.
 * This allows each task to be run independently via vitest filtering.
 */
export function createTaskTest(task: Task): void {
  // Dynamic test titles are necessary for programmatic test generation
  // eslint-disable-next-line vitest/valid-title
  describe(task.name, () => {
    let result: EvalResult | null = null;

    beforeAll(() => {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('\n⚠️  ANTHROPIC_API_KEY not set, tests will be skipped\n');
      } else {
        progress.init([task.name], task.trials, GENERATION_MODEL, GRADER_MODEL, MIN_PASS_RATE);
      }
    });

    afterAll(() => {
      progress.stop();

      if (result) {
        const minPassRate = task.success_criteria.min_pass_rate ?? MIN_PASS_RATE;
        printTaskSummary(result, minPassRate);
        globalUsage.add(result.totalUsage);
      }
    });

    it(`evaluates ${task.trials.toString()} trials`, { timeout: 900000 }, async () => {
      if (!process.env.ANTHROPIC_API_KEY) {
        return;
      }

      result = await evaluateTask(
        task,
        (trialNum) => {
          progress.trialStarted(task.name, trialNum);
        },
        (trial) => {
          progress.trialCompleted(task.name, trial.passed);
        }
      );

      const minPassRate = task.success_criteria.min_pass_rate ?? MIN_PASS_RATE;
      const requiredPasses = calculateRequiredPasses(task.trials, minPassRate);
      const taskPassed = result.passed >= requiredPasses;

      progress.taskCompleted(task.name, taskPassed, result.passRate);

      expect(result.passed).toBeGreaterThanOrEqual(requiredPasses);
    });
  });
}
