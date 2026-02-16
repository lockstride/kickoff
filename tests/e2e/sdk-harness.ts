/**
 * SDK-based E2E test harness for the Kickoff plugin.
 *
 * Uses the Claude Agent SDK to load the real plugin, run real orchestration flows,
 * and validate agent resolution, tool invocations, and document output.
 * Interactive elements are short-circuited by pre-seeding dot files and blocking
 * the gathering-input skill via hooks.
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import type {
  SDKMessage,
  SDKSystemMessage,
  SDKResultMessage,
  SDKResultSuccess,
  SDKResultError,
  HookJSONOutput,
  HookInput,
} from '@anthropic-ai/claude-agent-sdk';
import { mkdirSync, writeFileSync, rmSync, existsSync, cpSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PLUGIN_ROOT = resolve(__dirname, '../../plugin');
const FIXTURES_DIR = resolve(__dirname, 'fixtures');

// ============================================================================
// Types
// ============================================================================

export interface AgentEvent {
  agent_id: string;
  agent_type: string;
  timestamp: number;
}

export interface ToolEvent {
  tool_name: string;
  tool_input: unknown;
  tool_response?: unknown;
  timestamp: number;
}

export interface E2ERunResult {
  messages: SDKMessage[];
  initMessage: SDKSystemMessage | undefined;
  resultMessage: SDKResultMessage | undefined;
  agentStarts: AgentEvent[];
  toolUses: ToolEvent[];
  errors: string[];
  totalCostUsd: number;
}

export interface WorkspaceConfig {
  /** Startup name for the test workspace */
  startupName: string;
  /** Files to pre-seed in the internal docs directory, relative to fixtures/ */
  preSeededFiles: Record<string, string>;
  /** Skills to block via PreToolUse hook (e.g., 'gathering-input') */
  blockedSkills?: string[];
}

// ============================================================================
// Workspace Management
// ============================================================================

export function createTestWorkspace(config: WorkspaceConfig): {
  rootDir: string;
  internalPath: string;
  cleanup: () => void;
} {
  const rootDir = join(tmpdir(), `kickoff-e2e-${Date.now().toString()}`);
  const internalPath = join(rootDir, config.startupName, 'internal');
  mkdirSync(internalPath, { recursive: true });

  for (const [targetName, fixtureName] of Object.entries(config.preSeededFiles)) {
    const src = join(FIXTURES_DIR, fixtureName);
    const dest = join(internalPath, targetName);
    if (existsSync(src)) {
      cpSync(src, dest);
    } else {
      writeFileSync(dest, `# Fixture placeholder: ${fixtureName}\n`);
    }
  }

  return {
    rootDir,
    internalPath,
    cleanup: () => {
      rmSync(rootDir, { recursive: true, force: true });
    },
  };
}

// ============================================================================
// Hook Factories
// ============================================================================

function createSkillBlockerHook(
  blockedSkills: string[],
  internalPath: string
): (input: HookInput, toolUseID: string | undefined) => Promise<HookJSONOutput> {
  return (input: HookInput) => {
    if (input.hook_event_name !== 'PreToolUse') return Promise.resolve({});
    const toolInput = input.tool_input as Record<string, unknown>;
    const skillName = typeof toolInput.skill_name === 'string' ? toolInput.skill_name : '';

    if (blockedSkills.some((s) => skillName.includes(s))) {
      return Promise.resolve({
        decision: 'block' as const,
        reason: `Test mode: Skill "${skillName}" blocked. Input files pre-seeded at ${internalPath}.`,
      });
    }
    return Promise.resolve({});
  };
}

function createAgentTracker(
  events: AgentEvent[]
): (input: HookInput, toolUseID: string | undefined) => Promise<HookJSONOutput> {
  return (input: HookInput) => {
    if (input.hook_event_name !== 'SubagentStart') return Promise.resolve({});
    const agentInput = input as HookInput & { agent_id: string; agent_type: string };
    events.push({
      agent_id: agentInput.agent_id,
      agent_type: agentInput.agent_type,
      timestamp: Date.now(),
    });
    return Promise.resolve({});
  };
}

function createToolTracker(
  events: ToolEvent[]
): (input: HookInput, toolUseID: string | undefined) => Promise<HookJSONOutput> {
  return (input: HookInput) => {
    if (input.hook_event_name !== 'PostToolUse') return Promise.resolve({});
    const toolInput = input as HookInput & {
      tool_name: string;
      tool_input: unknown;
      tool_response: unknown;
    };
    events.push({
      tool_name: toolInput.tool_name,
      tool_input: toolInput.tool_input,
      tool_response: toolInput.tool_response,
      timestamp: Date.now(),
    });
    return Promise.resolve({});
  };
}

// ============================================================================
// Run Query
// ============================================================================

export async function runPluginFlow(
  prompt: string,
  workspace: { rootDir: string; internalPath: string },
  options?: {
    blockedSkills?: string[];
    maxTurns?: number;
    maxBudgetUsd?: number;
  }
): Promise<E2ERunResult> {
  const agentStarts: AgentEvent[] = [];
  const toolUses: ToolEvent[] = [];
  const messages: SDKMessage[] = [];
  const errors: string[] = [];
  let initMessage: SDKSystemMessage | undefined;
  let resultMessage: SDKResultMessage | undefined;

  const blockedSkills = options?.blockedSkills ?? [];

  const abortController = new AbortController();

  try {
    for await (const message of query({
      prompt,
      options: {
        plugins: [{ type: 'local', path: PLUGIN_ROOT }],
        cwd: workspace.rootDir,
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        systemPrompt: { type: 'preset', preset: 'claude_code' },
        tools: { type: 'preset', preset: 'claude_code' },
        maxTurns: options?.maxTurns ?? 30,
        maxBudgetUsd: options?.maxBudgetUsd ?? 2.0,
        abortController,
        hooks: {
          PreToolUse:
            blockedSkills.length > 0
              ? [{ hooks: [createSkillBlockerHook(blockedSkills, workspace.internalPath)] }]
              : [],
          SubagentStart: [{ hooks: [createAgentTracker(agentStarts)] }],
          PostToolUse: [{ hooks: [createToolTracker(toolUses)] }],
        },
      },
    })) {
      messages.push(message);

      if (message.type === 'system' && message.subtype === 'init') {
        initMessage = message;
      }

      if (message.type === 'result') {
        resultMessage = message;
        if (message.subtype !== 'success') {
          const errorMsg = message as unknown as SDKResultError;
          errors.push(...errorMsg.errors);
        }
      }
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return {
    messages,
    initMessage,
    resultMessage,
    agentStarts,
    toolUses,
    errors,
    totalCostUsd:
      resultMessage?.subtype === 'success'
        ? (resultMessage as unknown as SDKResultSuccess).total_cost_usd
        : 0,
  };
}

// ============================================================================
// Assertion Helpers
// ============================================================================

export function assertPluginLoaded(init: SDKSystemMessage | undefined): void {
  if (!init) throw new Error('No init message received from SDK');
  const pluginNames = init.plugins.map((p) => p.name);
  if (!pluginNames.includes('lockstride-kickoff')) {
    throw new Error(
      `Plugin "lockstride-kickoff" not found in loaded plugins: ${pluginNames.join(', ')}`
    );
  }
}

export function assertAgentSpawned(
  agentStarts: AgentEvent[],
  expectedAgentType: string
): AgentEvent {
  const match = agentStarts.find((a) => a.agent_type === expectedAgentType);
  if (!match) {
    const actual = agentStarts.map((a) => a.agent_type).join(', ') || '(none)';
    throw new Error(
      `Expected agent "${expectedAgentType}" to be spawned. Actual agents: ${actual}`
    );
  }
  return match;
}

export function assertNoUnprefixedAgent(agentStarts: AgentEvent[], unprefixedName: string): void {
  const match = agentStarts.find((a) => a.agent_type === unprefixedName);
  if (match) {
    throw new Error(
      `Unprefixed agent "${unprefixedName}" was spawned — expected fully-qualified identifier with plugin prefix`
    );
  }
}

export function assertCommandAvailable(
  init: SDKSystemMessage | undefined,
  commandName: string
): void {
  if (!init) throw new Error('No init message received from SDK');
  if (!init.slash_commands.includes(commandName)) {
    throw new Error(
      `Command "${commandName}" not found. Available: ${init.slash_commands.join(', ')}`
    );
  }
}

export function assertAgentAvailable(init: SDKSystemMessage | undefined, agentName: string): void {
  if (!init) throw new Error('No init message received from SDK');
  const agents = init.agents ?? [];
  if (!agents.includes(agentName)) {
    throw new Error(`Agent "${agentName}" not found. Available: ${agents.join(', ')}`);
  }
}

export function assertResultSuccess(result: SDKResultMessage | undefined): SDKResultSuccess {
  if (!result) throw new Error('No result message received from SDK');
  if (result.subtype !== 'success') {
    const err = result as unknown as SDKResultError;
    throw new Error(`Query ended with error: ${err.subtype} — ${err.errors.join('; ')}`);
  }
  return result as unknown as SDKResultSuccess;
}

export function assertFileWritten(toolUses: ToolEvent[], filePattern: string): ToolEvent {
  const writeEvents = toolUses.filter((t) => t.tool_name === 'Write');
  const match = writeEvents.find((t) => {
    const input = t.tool_input as Record<string, unknown>;
    return typeof input.file_path === 'string' && input.file_path.includes(filePattern);
  });
  if (!match) {
    const writtenFiles =
      writeEvents.map((t) => (t.tool_input as Record<string, unknown>).file_path).join(', ') ||
      '(none)';
    throw new Error(
      `Expected file matching "${filePattern}" to be written. Files written: ${writtenFiles}`
    );
  }
  return match;
}

export function assertNoAgentNotFoundErrors(errors: string[]): void {
  const agentErrors = errors.filter((e) => e.includes('Agent type') && e.includes('not found'));
  if (agentErrors.length > 0) {
    throw new Error(`Agent resolution errors detected:\n${agentErrors.join('\n')}`);
  }
}

export function assertSkillInvoked(toolUses: ToolEvent[], skillName: string): ToolEvent {
  const match = toolUses.find((t) => {
    const input = t.tool_input as Record<string, unknown>;
    return typeof input.skill_name === 'string' && input.skill_name.includes(skillName);
  });
  if (!match) {
    const invokedSkills =
      toolUses
        .filter((t) => {
          const input = t.tool_input as Record<string, unknown>;
          return typeof input.skill_name === 'string';
        })
        .map((t) => (t.tool_input as Record<string, unknown>).skill_name)
        .join(', ') || '(none)';
    throw new Error(
      `Expected skill "${skillName}" to be invoked. Skills invoked: ${invokedSkills}`
    );
  }
  return match;
}
