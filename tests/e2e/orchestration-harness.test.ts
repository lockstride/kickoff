import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { composeOrchestratorPrompt } from './orchestration-harness';
import { ORCHESTRATION_TOOLS, DEFAULT_MOCK_HANDLERS, PLUGIN_ROOT } from './orchestration-tools';
import { orchestrationBusinessBriefTask } from './tasks/orchestration-business-brief';
import type { ToolInvocation, OrchestratorTask } from './types';

// ============================================================================
// Tool Schema Validation
// ============================================================================

describe('orchestration tool schemas', () => {
  const toolNames = ORCHESTRATION_TOOLS.map((t) => t.name);

  it('should define all required Claude Code tools', () => {
    expect(toolNames).toContain('Task');
    expect(toolNames).toContain('Skill');
    expect(toolNames).toContain('Read');
    expect(toolNames).toContain('Write');
    expect(toolNames).toContain('AskUserQuestion');
    expect(toolNames).toContain('Bash');
    expect(toolNames).toContain('Glob');
  });

  it('should have unique tool names', () => {
    const unique = new Set(toolNames);
    expect(unique.size).toBe(toolNames.length);
  });

  describe.each(ORCHESTRATION_TOOLS.map((t) => [t.name, t]))('tool: %s', (_name, tool) => {
    it('should have a non-empty description', () => {
      expect(tool.description).toBeDefined();
      expect((tool.description ?? '').length).toBeGreaterThan(0);
    });

    it('should have a valid input_schema with type "object"', () => {
      expect(tool.input_schema.type).toBe('object');
    });
  });

  it('Task schema should require subagent_type and prompt', () => {
    const taskTool = ORCHESTRATION_TOOLS.find((t) => t.name === 'Task');
    expect(taskTool).toBeDefined();
    // Safe to access after expect().toBeDefined()
    const required = (taskTool ?? ORCHESTRATION_TOOLS[0]).input_schema.required as
      | string[]
      | undefined;
    expect(required).toContain('subagent_type');
    expect(required).toContain('prompt');
  });
});

// ============================================================================
// Default Mock Handlers
// ============================================================================

describe('default mock handlers', () => {
  it('should have handlers for all defined tools', () => {
    for (const tool of ORCHESTRATION_TOOLS) {
      expect(DEFAULT_MOCK_HANDLERS[tool.name]).toBeDefined();
    }
  });

  it('Read handler should return actual plugin file content', () => {
    const handler = DEFAULT_MOCK_HANDLERS.Read;
    const result = handler({
      file_path: join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'),
    });
    expect(result).toContain('lockstride-kickoff');
  });

  it('Read handler should return mock config for non-plugin paths', () => {
    const handler = DEFAULT_MOCK_HANDLERS.Read;
    const result = handler({
      file_path: '~/.lockstride/kickoff/config.json',
    });
    expect(result).toContain('TestStartup');
    expect(result).toContain('activeProfile');
  });

  it('Read handler should return mock input file for .business-brief-input.md', () => {
    const handler = DEFAULT_MOCK_HANDLERS.Read;
    const result = handler({
      file_path: '~/Startups/test-startup/generated-assets/internal/.business-brief-input.md',
    });
    expect(result).toContain('Problem Statement');
    expect(result).toContain('Solution Overview');
  });

  it('Task handler should reference the subagent_type in response', () => {
    const handler = DEFAULT_MOCK_HANDLERS.Task;
    const result = handler({ subagent_type: 'lockstride-kickoff:business-writer' });
    expect(result).toContain('lockstride-kickoff:business-writer');
  });

  it('Skill handler should return gathering-input completion message', () => {
    const handler = DEFAULT_MOCK_HANDLERS.Skill;
    const result = handler({ skill_name: 'gathering-input' });
    expect(result).toContain('business-brief-input.md');
    expect(result).toContain('complete');
  });
});

// ============================================================================
// System Prompt Composition
// ============================================================================

describe('orchestrator prompt composition', () => {
  it('should include content from all context files', () => {
    const prompt = composeOrchestratorPrompt(orchestrationBusinessBriefTask);
    // Should contain content from generating-documents SKILL.md
    expect(prompt).toContain('generating-documents');
    // Should contain content from internal-workflow.md
    expect(prompt).toContain('Internal Workflow');
  });

  it('should not contain unsubstituted ${CLAUDE_PLUGIN_ROOT} variables', () => {
    const prompt = composeOrchestratorPrompt(orchestrationBusinessBriefTask);
    expect(prompt).not.toContain('${CLAUDE_PLUGIN_ROOT}');
  });

  it('should include the orchestrator role preamble', () => {
    const prompt = composeOrchestratorPrompt(orchestrationBusinessBriefTask);
    expect(prompt).toContain('orchestrator');
    expect(prompt).toContain('subagent_type');
  });

  it('should include additional system instructions', () => {
    const prompt = composeOrchestratorPrompt(orchestrationBusinessBriefTask);
    expect(prompt).toContain('requires_input_source: true');
  });

  it('should handle missing context files gracefully', () => {
    const task: OrchestratorTask = {
      ...orchestrationBusinessBriefTask,
      contextFiles: [{ relativePath: 'nonexistent/file.md', header: 'Missing File' }],
    };
    const prompt = composeOrchestratorPrompt(task);
    // Should still produce a prompt (just without the missing file content)
    expect(prompt.length).toBeGreaterThan(50);
    expect(prompt).not.toContain('Missing File');
  });
});

// ============================================================================
// Assertion Logic
// ============================================================================

describe('orchestration assertions', () => {
  const assertions = orchestrationBusinessBriefTask.assertions;

  describe('Task tool was called', () => {
    const assertion = assertions.find((a) => a.description.includes('Task tool was called'));
    if (!assertion) throw new Error('Assertion not found');

    it('should pass when Task is in invocations', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Read', input: {}, id: '1', order: 0 },
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:business-writer' },
          id: '2',
          order: 1,
        },
      ];
      expect(assertion.check(invocations)).toBe(true);
    });

    it('should fail when no Task invocation exists', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Read', input: {}, id: '1', order: 0 },
        { name: 'Write', input: {}, id: '2', order: 1 },
      ];
      expect(assertion.check(invocations)).toBe(false);
    });
  });

  describe('Task uses plugin prefix', () => {
    const assertion = assertions.find((a) => a.description.includes('plugin prefix'));
    if (!assertion) throw new Error('Assertion not found');

    it('should pass with correct prefix', () => {
      const invocations: ToolInvocation[] = [
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:business-writer' },
          id: '1',
          order: 0,
        },
      ];
      expect(assertion.check(invocations)).toBe(true);
    });

    it('should fail with unprefixed agent name', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Task', input: { subagent_type: 'business-writer' }, id: '1', order: 0 },
      ];
      expect(assertion.check(invocations)).toBe(false);
    });

    it('should fail when no business-writer call exists', () => {
      const invocations: ToolInvocation[] = [
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:researcher' },
          id: '1',
          order: 0,
        },
      ];
      expect(assertion.check(invocations)).toBe(false);
    });
  });

  describe('Task called after gathering-input', () => {
    const assertion = assertions.find((a) => a.description.includes('after gathering-input'));
    if (!assertion) throw new Error('Assertion not found');

    it('should pass when Task follows Skill(gathering-input)', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Read', input: { file_path: 'config.json' }, id: '1', order: 0 },
        { name: 'Skill', input: { skill_name: 'gathering-input' }, id: '2', order: 1 },
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:business-writer' },
          id: '3',
          order: 2,
        },
      ];
      expect(assertion.check(invocations)).toBe(true);
    });

    it('should pass when Task follows Read of input file', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Read', input: { file_path: '/path/.business-brief-input.md' }, id: '1', order: 0 },
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:business-writer' },
          id: '2',
          order: 1,
        },
      ];
      expect(assertion.check(invocations)).toBe(true);
    });

    it('should fail when Task is called before gathering-input', () => {
      const invocations: ToolInvocation[] = [
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:business-writer' },
          id: '1',
          order: 0,
        },
        { name: 'Skill', input: { skill_name: 'gathering-input' }, id: '2', order: 1 },
      ];
      expect(assertion.check(invocations)).toBe(false);
    });

    it('should fail when gathering-input never happens', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Read', input: { file_path: 'config.json' }, id: '1', order: 0 },
        {
          name: 'Task',
          input: { subagent_type: 'lockstride-kickoff:business-writer' },
          id: '2',
          order: 1,
        },
      ];
      expect(assertion.check(invocations)).toBe(false);
    });

    it('should fail when Task never happens (continuation failure)', () => {
      const invocations: ToolInvocation[] = [
        { name: 'Skill', input: { skill_name: 'gathering-input' }, id: '1', order: 0 },
        { name: 'Read', input: { file_path: 'config.json' }, id: '2', order: 1 },
      ];
      expect(assertion.check(invocations)).toBe(false);
    });
  });
});
