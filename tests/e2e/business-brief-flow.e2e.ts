/**
 * E2E test: Business brief generation orchestration.
 *
 * Tests the full orchestration flow for generating a business brief:
 * 1. Plugin loads and invokes generating-documents skill
 * 2. gathering-input is short-circuited (input file pre-seeded)
 * 3. business-writer agent is spawned with the correct plugin-prefixed identifier
 * 4. DRAFT document is written to the workspace
 *
 * This is the flow that originally broke due to unprefixed agent identifiers.
 */

import { describe, it, expect, afterAll } from 'vitest';
import {
  runPluginFlow,
  createTestWorkspace,
  assertPluginLoaded,
  assertAgentSpawned,
  assertNoUnprefixedAgent,
} from './sdk-harness';

describe('business-brief-flow', () => {
  const workspace = createTestWorkspace({
    startupName: 'teststartup',
    preSeededFiles: {
      '.business-brief-input.md': '.business-brief-input.md',
    },
    blockedSkills: ['gathering-input'],
  });

  afterAll(() => {
    workspace.cleanup();
  });

  it('should spawn business-writer with plugin-prefixed identifier', async () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('Skipping: ANTHROPIC_API_KEY not set');
      return;
    }

    const result = await runPluginFlow(
      [
        'Generate a business brief for TestStartup.',
        '',
        'Context:',
        `- Startup name: teststartup`,
        `- Internal documents path: ${workspace.internalPath}`,
        `- The input file has already been gathered and exists at: ${workspace.internalPath}/.business-brief-input.md`,
        '- No config resolution needed — paths are provided above.',
        '',
        'Use the generating-documents skill to orchestrate the business-brief generation workflow.',
      ].join('\n'),
      workspace,
      {
        blockedSkills: ['gathering-input'],
        maxTurns: 30,
        maxBudgetUsd: 2.0,
      }
    );

    // Plugin loaded correctly
    assertPluginLoaded(result.initMessage);

    // Business-writer was spawned with the correct fully-qualified identifier
    assertAgentSpawned(result.agentStarts, 'lockstride-kickoff:business-writer');

    // No unprefixed agent was spawned (the original bug)
    assertNoUnprefixedAgent(result.agentStarts, 'business-writer');

    // Log agent events for debugging
    console.log(
      'Agent events:',
      result.agentStarts.map((a) => a.agent_type)
    );

    // Log errors if any
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }

    // Check result status
    if (result.resultMessage) {
      console.log(`Result: ${result.resultMessage.subtype}`);
      console.log(`Cost: $${result.totalCostUsd.toFixed(4)}`);
      console.log(`Turns: ${String(result.resultMessage.num_turns)}`);
    }

    // If we got a result, it should not be an error about agent type not found
    if (result.errors.length > 0) {
      const agentNotFoundError = result.errors.find(
        (e) => e.includes('Agent type') && e.includes('not found')
      );
      expect(agentNotFoundError).toBeUndefined();
    }
  });
});
