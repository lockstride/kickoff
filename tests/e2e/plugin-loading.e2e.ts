/**
 * E2E test: Plugin loading verification.
 *
 * Validates that the Kickoff plugin loads correctly in the Claude Code runtime,
 * with all expected commands, agents, and skills registered.
 */

import { describe, it, expect, afterAll } from 'vitest';
import {
  runPluginFlow,
  createTestWorkspace,
  assertPluginLoaded,
  assertCommandAvailable,
  assertAgentAvailable,
  assertResultSuccess,
} from './sdk-harness';

describe('plugin-loading', () => {
  const workspace = createTestWorkspace({
    startupName: 'LoadTest',
    preSeededFiles: {},
  });

  afterAll(() => {
    workspace.cleanup();
  });

  it('should load plugin and register commands and agents', { timeout: 120000 }, async () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('Skipping: ANTHROPIC_API_KEY not set');
      return;
    }

    const result = await runPluginFlow(
      'What slash commands and agents are available from the lockstride-kickoff plugin? List them briefly.',
      workspace,
      { maxTurns: 5, maxBudgetUsd: 0.5 }
    );

    // Plugin loaded
    assertPluginLoaded(result.initMessage);

    // Core commands registered
    assertCommandAvailable(result.initMessage, 'lockstride-kickoff:generate-docs');
    assertCommandAvailable(result.initMessage, 'lockstride-kickoff:init');
    assertCommandAvailable(result.initMessage, 'lockstride-kickoff:status');

    // Core agents registered
    assertAgentAvailable(result.initMessage, 'lockstride-kickoff:business-writer');
    assertAgentAvailable(result.initMessage, 'lockstride-kickoff:researcher');

    // Query completed successfully
    assertResultSuccess(result.resultMessage);

    expect(result.initMessage).toBeDefined();
    console.log(`Plugin loading test complete. Cost: $${result.totalCostUsd.toFixed(4)}`);
  });
});
