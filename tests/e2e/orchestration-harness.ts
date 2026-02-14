/**
 * Orchestration harness: tool-use simulation for testing plugin workflow correctness.
 *
 * Unlike the content-quality harness (harness.ts) which tests document output,
 * this harness validates that the LLM makes correct tool invocations when given
 * orchestration documentation. It uses the Anthropic Messages API with tools
 * enabled and intercepts tool_use blocks to validate invocations and return
 * simulated results.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import type {
  OrchestratorTask,
  OrchestratorTrialResult,
  OrchestratorEvalResult,
  ToolInvocation,
  AssertionResult,
  MockToolHandler,
} from './types';
import { ORCHESTRATION_TOOLS, DEFAULT_MOCK_HANDLERS, PLUGIN_ROOT } from './orchestration-tools';
import { calculateRequiredPasses, formatDuration } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Anthropic();

export const ORCHESTRATION_MODEL = process.env.E2E_GENERATION_MODEL ?? 'claude-haiku-4-5';

const DEFAULT_MIN_PASS_RATE = process.env.E2E_MIN_PASS_RATE
  ? parseFloat(process.env.E2E_MIN_PASS_RATE)
  : 0.33;

const MAX_TOOL_ITERATIONS = 15;

// ============================================================================
// System Prompt Composition
// ============================================================================

function substitutePluginVariables(content: string): string {
  return content.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, PLUGIN_ROOT);
}

export function composeOrchestratorPrompt(task: OrchestratorTask): string {
  const sections: string[] = [];

  sections.push(`You are the generating-documents skill orchestrator for a Claude Code plugin.
You have access to tools (Task, Skill, Read, Write, AskUserQuestion, Bash, Glob) to execute workflows.
Follow the documentation below to determine what tools to call and in what order.
When spawning subagents via Task, use the exact subagent_type value shown in the documentation.`);

  for (const contextFile of task.contextFiles) {
    const fullPath = join(PLUGIN_ROOT, contextFile.relativePath);
    if (existsSync(fullPath)) {
      const content = substitutePluginVariables(readFileSync(fullPath, 'utf-8'));
      sections.push(`## ${contextFile.header}\n\n${content}`);
    }
  }

  if (task.systemInstructions) {
    sections.push(`## Additional Instructions\n\n${task.systemInstructions}`);
  }

  return sections.join('\n\n---\n\n');
}

// ============================================================================
// Tool-Use Trial Execution
// ============================================================================

export async function runOrchestratorTrial(
  task: OrchestratorTask,
  trialNum: number
): Promise<OrchestratorTrialResult> {
  const startTime = Date.now();
  const toolInvocations: ToolInvocation[] = [];
  let invocationOrder = 0;

  const systemPrompt = composeOrchestratorPrompt(task);
  const handlers: Record<string, MockToolHandler> = {
    ...DEFAULT_MOCK_HANDLERS,
    ...task.mockOverrides,
  };

  const transcript: MessageParam[] = [{ role: 'user', content: task.userMessage }];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await client.messages.create({
      model: ORCHESTRATION_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: transcript,
      tools: ORCHESTRATION_TOOLS,
    });

    // Record tool invocations
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use'
    );
    for (const block of toolUseBlocks) {
      toolInvocations.push({
        name: block.name,
        input: block.input as Record<string, unknown>,
        id: block.id,
        order: invocationOrder++,
      });
    }

    // Append assistant response to transcript
    transcript.push({ role: 'assistant', content: response.content });

    // If no tool use, the LLM is done
    if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
      break;
    }

    // Generate mock tool results and continue
    const toolResults = toolUseBlocks.map((block) => ({
      type: 'tool_result' as const,
      tool_use_id: block.id,
      content:
        block.name in handlers
          ? handlers[block.name](block.input as Record<string, unknown>)
          : 'OK',
    }));

    transcript.push({ role: 'user', content: toolResults });
  }

  // Evaluate assertions against collected invocations
  const assertionResults: AssertionResult[] = task.assertions.map((assertion) => ({
    description: assertion.description,
    passed: assertion.check(toolInvocations),
  }));

  const passed = assertionResults.every((r) => r.passed);

  // Save transcript for debugging
  const transcriptPath = join(
    __dirname,
    'transcripts',
    `${sanitizeFilename(task.name)}-trial-${trialNum.toString()}.json`
  );
  writeFileSync(
    transcriptPath,
    JSON.stringify({ toolInvocations, assertionResults, transcript }, null, 2)
  );

  return {
    trialNumber: trialNum,
    toolInvocations,
    assertionResults,
    passed,
    durationMs: Date.now() - startTime,
  };
}

// ============================================================================
// Task Evaluation
// ============================================================================

export async function evaluateOrchestratorTask(
  task: OrchestratorTask
): Promise<OrchestratorEvalResult> {
  const trialResults: OrchestratorTrialResult[] = [];
  const minPassRate = task.min_pass_rate ?? DEFAULT_MIN_PASS_RATE;
  const requiredPasses = calculateRequiredPasses(task.trials, minPassRate);
  const maxAllowedFailures = task.trials - requiredPasses;

  let passCount = 0;
  let failCount = 0;

  for (let i = 1; i <= task.trials; i++) {
    console.log(`[${task.name}] Trial ${i.toString()} started...`);

    const trial = await runOrchestratorTrial(task, i);
    trialResults.push(trial);

    if (trial.passed) {
      passCount++;
      console.log(
        `[${task.name}] Trial ${i.toString()} PASSED (${formatDuration(trial.durationMs)})`
      );
      if (passCount >= requiredPasses) break;
    } else {
      failCount++;
      const failures = trial.assertionResults.filter((r) => !r.passed).map((r) => r.description);
      console.log(
        `[${task.name}] Trial ${i.toString()} FAILED (${formatDuration(trial.durationMs)}): ${failures.join(', ')}`
      );
      if (failCount > maxAllowedFailures) break;
    }
  }

  return {
    task: task.name,
    trials: task.trials,
    trialsRun: trialResults.length,
    passed: passCount,
    passRate: trialResults.length > 0 ? passCount / trialResults.length : 0,
    trialResults,
  };
}

// ============================================================================
// Vitest Integration
// ============================================================================

export function createOrchestratorTest(task: OrchestratorTask): void {
  // Dynamic test titles are necessary for programmatic test generation
  // eslint-disable-next-line vitest/valid-title
  describe(task.name, () => {
    let result: OrchestratorEvalResult | null = null;

    beforeAll(() => {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('\n  ANTHROPIC_API_KEY not set, orchestration tests will be skipped\n');
      } else {
        const minPassRate = task.min_pass_rate ?? DEFAULT_MIN_PASS_RATE;
        const requiredPasses = calculateRequiredPasses(task.trials, minPassRate);
        console.log('');
        console.log(`  Orchestration: ${task.name}`);
        console.log(`  Trials: ${task.trials.toString()} (need ${requiredPasses.toString()} pass)`);
        console.log(`  Model: ${ORCHESTRATION_MODEL}`);
        console.log(`  Assertions: ${task.assertions.map((a) => a.description).join(', ')}`);
        console.log('');
      }
    });

    afterAll(() => {
      if (result) {
        printOrchestratorSummary(result, task);
      }
    });

    it(`evaluates ${task.trials.toString()} trials`, { timeout: 900000 }, async () => {
      if (!process.env.ANTHROPIC_API_KEY) {
        return;
      }

      result = await evaluateOrchestratorTask(task);

      const minPassRate = task.min_pass_rate ?? DEFAULT_MIN_PASS_RATE;
      const requiredPasses = calculateRequiredPasses(task.trials, minPassRate);

      expect(result.passed).toBeGreaterThanOrEqual(requiredPasses);
    });
  });
}

// ============================================================================
// Helpers
// ============================================================================

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

function printOrchestratorSummary(result: OrchestratorEvalResult, task: OrchestratorTask): void {
  const minPassRate = task.min_pass_rate ?? DEFAULT_MIN_PASS_RATE;
  const requiredPasses = calculateRequiredPasses(task.trials, minPassRate);
  const taskPassed = result.passed >= requiredPasses;
  const icon = taskPassed ? 'PASS' : 'FAIL';
  const rate = `${(result.passRate * 100).toFixed(0)}%`;

  console.log('');
  console.log(
    `  ${icon}: ${result.task} — ${result.passed.toString()}/${result.trialsRun.toString()} trials passed (${rate})`
  );

  if (!taskPassed) {
    for (const trial of result.trialResults) {
      if (!trial.passed) {
        const failures = trial.assertionResults
          .filter((r) => !r.passed)
          .map((r) => `    - ${r.description}`);
        console.log(`  Trial ${trial.trialNumber.toString()} failures:`);
        for (const f of failures) {
          console.log(f);
        }

        // Show Task invocations for debugging
        const taskCalls = trial.toolInvocations.filter((t) => t.name === 'Task');
        if (taskCalls.length > 0) {
          console.log('  Task invocations:');
          for (const tc of taskCalls) {
            console.log(`    - subagent_type: "${tc.input.subagent_type as string}"`);
          }
        } else {
          console.log('  No Task invocations found in trial');
        }
      }
    }
    console.log('\n  Check transcripts/ for full details.\n');
  }
}
