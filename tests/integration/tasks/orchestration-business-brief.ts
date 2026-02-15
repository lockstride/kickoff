/**
 * Orchestration test: business-brief generation flow.
 *
 * Validates that the generating-documents skill orchestrator:
 * 1. Calls Task with the correct plugin-prefixed subagent_type
 * 2. Continues the flow after gathering-input completes (not dead-ending)
 * 3. References the business-writer agent (not some other agent)
 *
 * These assertions directly test the two bugs fixed in the agent-identifiers
 * and continuation-checkpoint patches.
 */

import type { OrchestratorTask, ToolInvocation } from '../types';

const EXPECTED_AGENT = 'lockstride-kickoff:business-writer';

/**
 * Find all Task invocations that target the business-writer agent
 * (with or without the correct plugin prefix).
 */
function findBusinessWriterCalls(invocations: ToolInvocation[]): ToolInvocation[] {
  return invocations.filter(
    (t) =>
      t.name === 'Task' &&
      typeof t.input.subagent_type === 'string' &&
      t.input.subagent_type.includes('business-writer')
  );
}

export const orchestrationBusinessBriefTask: OrchestratorTask = {
  name: 'orchestration-business-brief-flow',
  description:
    'Validates that generating-documents correctly spawns lockstride-kickoff:business-writer with plugin prefix after gathering-input completes',
  trials: 3,

  contextFiles: [
    {
      relativePath: 'skills/generating-documents/SKILL.md',
      header: 'Generating Documents Skill',
    },
    {
      relativePath: 'skills/generating-documents/references/internal-workflow.md',
      header: 'Internal Workflow Reference',
    },
  ],

  systemInstructions: `You are executing the generating-documents skill for a business-brief.

IMPORTANT CONTEXT:
- The business-brief template has requires_input_source: true (interactive methodology)
- This means you must invoke gathering-input first, then spawn the business-writer agent
- Configuration has already been resolved (pre-verified context below)
- All dependencies are met (business-brief has no dependencies)
- No existing documents — this is a fresh generation

When you need to read plugin files, they are available at: ${process.cwd()}/plugin/

Proceed through the workflow steps as documented. Use the tools available to you.`,

  userMessage: `Generate business-brief for "TestStartup".

Context: {
  startup_name: "TestStartup",
  internal_path: "~/Startups/test-startup/generated-assets/internal",
  document_state: "new",
  dependencies_met: true
}

The startup is building an AI-powered decision matrix for SaaS evaluations.
Target market: SMBs doing cross-functional software evaluations.

Please proceed with the generation workflow.`,

  assertions: [
    {
      description: 'Task tool was called at least once',
      check: (invocations: ToolInvocation[]) => invocations.some((t) => t.name === 'Task'),
    },
    {
      description: `Task.subagent_type uses plugin prefix "${EXPECTED_AGENT}"`,
      check: (invocations: ToolInvocation[]) => {
        const businessWriterCalls = findBusinessWriterCalls(invocations);
        return (
          businessWriterCalls.length > 0 &&
          businessWriterCalls.every((t) => t.input.subagent_type === EXPECTED_AGENT)
        );
      },
    },
    {
      description: 'Task(business-writer) called after gathering-input interaction',
      check: (invocations: ToolInvocation[]) => {
        // Find the gathering-input skill invocation or Read of the input file
        const gatheringIndex = invocations.findIndex(
          (t) =>
            (t.name === 'Skill' &&
              typeof t.input.skill_name === 'string' &&
              t.input.skill_name.includes('gathering-input')) ||
            (t.name === 'Read' &&
              typeof t.input.file_path === 'string' &&
              t.input.file_path.includes('business-brief-input'))
        );

        const taskIndex = invocations.findIndex(
          (t) =>
            t.name === 'Task' &&
            typeof t.input.subagent_type === 'string' &&
            t.input.subagent_type.includes('business-writer')
        );

        // Both must exist and Task must come after gathering-input
        if (gatheringIndex === -1 || taskIndex === -1) return false;
        return taskIndex > gatheringIndex;
      },
    },
  ],
};
