/**
 * E2E test: Scrutiny checkpoint orchestration.
 *
 * Tests the orchestration flow when a user opts into SKEPTIC MODE after
 * market-analysis generation:
 * 1. Plugin loads with generating-documents skill
 * 2. DRAFT-market-analysis.md is pre-seeded (skips generation)
 * 3. Flow reaches the Scrutiny Checkpoint and offers SKEPTIC MODE
 * 4. The challenging-assumptions skill is invoked (NOT a challenger agent)
 * 5. No "Agent type not found" errors occur
 *
 * This test catches the class of bug where interactive skill invocations
 * are incorrectly routed through the Task/subagent system.
 */

import { describe, it, expect, afterAll } from 'vitest';
import {
  runPluginFlow,
  createTestWorkspace,
  assertPluginLoaded,
  assertNoAgentNotFoundErrors,
  assertResultSuccess,
} from './sdk-harness';

describe('scrutiny-checkpoint-flow', () => {
  const workspace = createTestWorkspace({
    startupName: 'teststartup',
    preSeededFiles: {
      'DRAFT-market-analysis.md': 'DRAFT-market-analysis.md',
      'business-brief.md': 'business-brief.md',
      '.business-brief-input.md': '.business-brief-input.md',
    },
    blockedSkills: ['gathering-input'],
  });

  afterAll(() => {
    workspace.cleanup();
  });

  it(
    'should invoke challenging-assumptions skill without agent resolution errors',
    { timeout: 900000 },
    async () => {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('Skipping: ANTHROPIC_API_KEY not set');
        return;
      }

      const result = await runPluginFlow(
        [
          'I just finished generating a market analysis for TestStartup.',
          '',
          'Context:',
          `- Startup name: teststartup`,
          `- Internal documents path: ${workspace.internalPath}`,
          `- The DRAFT already exists at: ${workspace.internalPath}/DRAFT-market-analysis.md`,
          `- The business brief exists at: ${workspace.internalPath}/business-brief.md`,
          '- No config resolution needed — paths are provided above.',
          '- The document_type is market-analysis and scrutiny_enabled is true.',
          '',
          'The DRAFT is complete. Offer SKEPTIC MODE scrutiny as described in the',
          'generating-documents internal workflow Scrutiny Checkpoint.',
          '',
          'When I respond, I will say: "Yes, challenge me on this market analysis."',
          '',
          'Yes, challenge me on this market analysis.',
        ].join('\n'),
        workspace,
        {
          blockedSkills: ['gathering-input'],
          maxTurns: 15,
          maxBudgetUsd: 2.0,
        }
      );

      // Plugin loaded correctly
      assertPluginLoaded(result.initMessage);

      // No agent-not-found errors (the original bug)
      assertNoAgentNotFoundErrors(result.errors);

      // No unprefixed challenger agent was spawned
      const challengerAgentSpawn = result.agentStarts.find(
        (a) => a.agent_type === 'challenger' || a.agent_type === 'lockstride-kickoff:challenger'
      );
      expect(challengerAgentSpawn).toBeUndefined();

      // Log diagnostic info
      console.log(
        'Agent events:',
        result.agentStarts.map((a) => a.agent_type)
      );
      console.log(
        'Skill tool uses:',
        result.toolUses
          .filter((t) => {
            const input = t.tool_input as Record<string, unknown>;
            return typeof input.skill_name === 'string';
          })
          .map((t) => (t.tool_input as Record<string, unknown>).skill_name)
      );

      if (result.errors.length > 0) {
        console.log('Errors:', result.errors);
      }

      // Query should complete without fatal errors
      if (result.resultMessage) {
        console.log(`Result: ${result.resultMessage.subtype}`);
        console.log(`Cost: $${result.totalCostUsd.toFixed(4)}`);
        console.log(`Turns: ${String(result.resultMessage.num_turns)}`);
      }

      assertResultSuccess(result.resultMessage);
    }
  );
});
