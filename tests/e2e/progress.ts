/**
 * Progress display for E2E tests.
 * Simple logging approach that works reliably with Vitest.
 */

import { calculateRequiredPasses } from './utils';

interface TaskState {
  name: string;
  trials: number;
  completed: number;
  passed: number;
  done: boolean;
}

class ProgressDisplay {
  private tasks = new Map<string, TaskState>();
  private startTime = 0;
  private initialized = false;

  init(
    taskNames: string[],
    trialsPerTask: number,
    generationModel: string,
    graderModel: string,
    minPassRate: number
  ) {
    this.startTime = Date.now();
    this.tasks.clear();
    this.initialized = true;

    const passRateStr = `${(minPassRate * 100).toFixed(0)}%`;
    const requiredPasses = calculateRequiredPasses(trialsPerTask, minPassRate);
    const taskTitle = taskNames[0];

    // Print header with task name
    console.log('');
    console.log('┌──────────────────────────────────────────────────────────────────┐');
    const padding = Math.max(0, 66 - taskTitle.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    console.log(`│${' '.repeat(leftPad)}${taskTitle}${' '.repeat(rightPad)}│`);
    console.log('├──────────────────────────────────────────────────────────────────┤');
    console.log(
      `│  Trials: ${trialsPerTask.toString()} (need ${requiredPasses.toString()} pass, ${passRateStr})`.padEnd(
        67
      ) + '│'
    );
    console.log(`│  Generation: ${generationModel}`.padEnd(67) + '│');
    console.log(`│  Grader: ${graderModel}`.padEnd(67) + '│');
    console.log('└──────────────────────────────────────────────────────────────────┘');
    console.log('');

    // Initialize task states
    for (const name of taskNames) {
      this.tasks.set(name, {
        name,
        trials: trialsPerTask,
        completed: 0,
        passed: 0,
        done: false,
      });
    }
  }

  trialStarted(taskName: string, trialNum: number) {
    console.log(`[${taskName}] Trial ${trialNum.toString()} started...`);
  }

  trialCompleted(taskName: string, passed: boolean) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.completed++;
      if (passed) task.passed++;
      const icon = passed ? '✓' : '✗';
      console.log(`[${taskName}] Trial ${task.completed.toString()} ${icon}`);
    }
  }

  taskCompleted(taskName: string, passed: boolean, passRate: number) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.done = true;
      const icon = passed ? '✓' : '✗';
      const rate = `${(passRate * 100).toFixed(0)}%`;
      console.log(
        `[${taskName}] Complete: ${task.passed.toString()}/${task.completed.toString()} ${icon} (${rate})`
      );
    }
  }

  stop() {
    // Nothing to clean up
  }

  getElapsedTime(): number {
    return Date.now() - this.startTime;
  }
}

// Singleton instance
export const progress = new ProgressDisplay();
