/**
 * Claude Code tool schemas and default mock handlers for orchestration tests.
 *
 * Tool schemas define the interface the LLM can invoke. Mock handlers return
 * simulated results so the tool-use loop can continue without real side effects.
 *
 * For Read calls targeting plugin files, the default handler returns actual file
 * content so the LLM exercises the real documentation.
 */

import type { Tool } from '@anthropic-ai/sdk/resources/messages';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MockToolHandler } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PLUGIN_ROOT = resolve(__dirname, '../../plugin');

// ============================================================================
// Tool Schemas
// ============================================================================

export const ORCHESTRATION_TOOLS: Tool[] = [
  {
    name: 'Task',
    description: 'Spawn a subagent to handle a task autonomously.',
    input_schema: {
      type: 'object' as const,
      properties: {
        subagent_type: {
          type: 'string',
          description: 'The type of specialized agent to use for this task',
        },
        prompt: {
          type: 'string',
          description: 'The task for the agent to perform',
        },
        description: {
          type: 'string',
          description: 'Short description of the task',
        },
      },
      required: ['subagent_type', 'prompt'],
    },
  },
  {
    name: 'Skill',
    description: 'Invoke a skill inline in the current context.',
    input_schema: {
      type: 'object' as const,
      properties: {
        skill_name: {
          type: 'string',
          description: 'The skill to invoke',
        },
        parameters: {
          type: 'object',
          description: 'Parameters to pass to the skill',
        },
      },
      required: ['skill_name'],
    },
  },
  {
    name: 'Read',
    description: 'Read a file from the filesystem.',
    input_schema: {
      type: 'object' as const,
      properties: {
        file_path: {
          type: 'string',
          description: 'The absolute path to the file to read',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'Write',
    description: 'Write content to a file.',
    input_schema: {
      type: 'object' as const,
      properties: {
        file_path: {
          type: 'string',
          description: 'The absolute path to the file to write',
        },
        content: {
          type: 'string',
          description: 'The content to write',
        },
      },
      required: ['file_path', 'content'],
    },
  },
  {
    name: 'AskUserQuestion',
    description: 'Ask the user a clarifying question.',
    input_schema: {
      type: 'object' as const,
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              header: { type: 'string' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
              multiSelect: { type: 'boolean' },
            },
          },
        },
      },
      required: ['questions'],
    },
  },
  {
    name: 'Bash',
    description: 'Execute a bash command.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: {
          type: 'string',
          description: 'The command to execute',
        },
        description: {
          type: 'string',
          description: 'Short description of what this command does',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'Glob',
    description: 'Find files matching a glob pattern.',
    input_schema: {
      type: 'object' as const,
      properties: {
        pattern: {
          type: 'string',
          description: 'The glob pattern to match files against',
        },
        path: {
          type: 'string',
          description: 'The directory to search in',
        },
      },
      required: ['pattern'],
    },
  },
];

// ============================================================================
// Default Mock Handlers
// ============================================================================

/**
 * Default Read handler: returns actual plugin file content for plugin paths,
 * mock content for everything else.
 */
function defaultReadHandler(input: Record<string, unknown>): string {
  const filePath = input.file_path as string | undefined;
  if (!filePath) return 'Error: No file_path provided';

  // Resolve plugin root references
  const resolved = filePath.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, PLUGIN_ROOT);

  // Return actual content for plugin files
  if (resolved.includes('/plugin/') || resolved.startsWith(PLUGIN_ROOT)) {
    if (existsSync(resolved)) {
      return readFileSync(resolved, 'utf-8');
    }
    return `Error: File not found: ${resolved}`;
  }

  // Mock config file
  if (resolved.includes('config.json') || resolved.includes('.lockstride')) {
    return JSON.stringify(
      {
        profiles: {
          TestStartup: {
            displayName: 'TestStartup',
            documentsRoot: '~/Startups',
            documentsPath: '~/Startups/test-startup',
            applicationsRoot: '~/Development',
            applicationsPath: '~/Development/test-startup',
          },
        },
        activeProfile: 'TestStartup',
      },
      null,
      2
    );
  }

  // Mock input file (gathering-input output)
  if (resolved.includes('.business-brief-input.md')) {
    return `# Business Brief Input

## Problem Statement
Decision paralysis in SaaS evaluations with hidden assumptions and no audit trail.

## Solution Overview
AI-augmented decision matrix as a cognitive forcing function.

## Target Market
SMB beachhead via cross-functional SaaS evaluations.

## Business Model
Tiered SaaS, bootstrapped for high ARPU.`;
  }

  return `Mock file content for: ${filePath}`;
}

function defaultTaskHandler(input: Record<string, unknown>): string {
  const subagentType = input.subagent_type as string | undefined;
  return `Subagent ${subagentType ?? 'unknown'} completed successfully. DRAFT-business-brief.md written to internal path.`;
}

function defaultSkillHandler(input: Record<string, unknown>): string {
  const skillName = input.skill_name as string | undefined;
  if (skillName?.includes('gathering-input')) {
    return 'Session complete. Structured input captured in .business-brief-input.md. Handing back to parent workflow.';
  }
  return `Skill ${skillName ?? 'unknown'} completed successfully.`;
}

function defaultAskUserQuestionHandler(_input: Record<string, unknown>): string {
  return JSON.stringify({ answers: { '0': '1' } });
}

function defaultWriteHandler(_input: Record<string, unknown>): string {
  return 'File written successfully.';
}

function defaultBashHandler(_input: Record<string, unknown>): string {
  return 'Command completed successfully.';
}

function defaultGlobHandler(_input: Record<string, unknown>): string {
  return '[]';
}

export const DEFAULT_MOCK_HANDLERS: Record<string, MockToolHandler> = {
  Read: defaultReadHandler,
  Task: defaultTaskHandler,
  Skill: defaultSkillHandler,
  AskUserQuestion: defaultAskUserQuestionHandler,
  Write: defaultWriteHandler,
  Bash: defaultBashHandler,
  Glob: defaultGlobHandler,
};
