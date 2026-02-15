import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { composeSystemPrompt, composeUserMessage } from './harness';
import { allTasks } from './tasks';
import type { Task } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = resolve(__dirname, '../../plugin');

const taskEntries: [string, Task][] = allTasks.map((t) => [t.name, t]);

describe('harness prompt composition', () => {
  describe('composeSystemPrompt', () => {
    describe.each(taskEntries)('task: %s', (_name, task) => {
      it('should produce a non-empty system prompt', () => {
        const prompt = composeSystemPrompt(task);
        expect(prompt.length).toBeGreaterThan(100);
      });

      it('should not contain unsubstituted ${CLAUDE_PLUGIN_ROOT} variables', () => {
        const prompt = composeSystemPrompt(task);
        expect(prompt).not.toContain('${CLAUDE_PLUGIN_ROOT}');
      });
    });

    it('should load the business-writer agent for autonomous tasks', () => {
      const autonomousTask = allTasks.find((t) => t.input.execution_mode === 'autonomous');
      if (!autonomousTask) throw new Error('No autonomous task found');
      const prompt = composeSystemPrompt(autonomousTask);
      expect(prompt).toContain('business-writer');
    });

    it('should load the skill for interactive tasks', () => {
      const interactiveTask = allTasks.find((t) => t.input.execution_mode === 'interactive');
      if (!interactiveTask) throw new Error('No interactive task found');
      const prompt = composeSystemPrompt(interactiveTask);
      expect(prompt).toContain('Skill Definition');
    });

    it('should load the challenging-assumptions skill for challenger tasks', () => {
      const challengerTask = allTasks.find((t) => t.input.execution_mode === 'challenger');
      if (!challengerTask) throw new Error('No challenger task found');
      const prompt = composeSystemPrompt(challengerTask);
      expect(prompt).toContain('SKEPTIC MODE');
    });
  });

  describe('composeUserMessage', () => {
    describe.each(taskEntries)('task: %s', (_name, task) => {
      it('should produce a non-empty user message', () => {
        const message = composeUserMessage(task);
        expect(message.length).toBeGreaterThan(10);
      });

      it('should include the startup name', () => {
        const message = composeUserMessage(task);
        expect(message).toContain(task.input.startup_name);
      });
    });

    it('should include fixture content when context_fixture is specified', () => {
      const taskWithFixture = allTasks.find(
        (t) =>
          t.input.execution_mode === 'autonomous' &&
          'context_fixture' in t.input &&
          t.input.context_fixture
      );
      if (taskWithFixture) {
        const message = composeUserMessage(taskWithFixture);
        expect(message).toContain('Prior document for context');
      }
    });

    it('should include fixture content for challenger tasks', () => {
      const challengerTask = allTasks.find((t) => t.input.execution_mode === 'challenger');
      if (challengerTask) {
        const message = composeUserMessage(challengerTask);
        expect(message).toContain('I just completed');
      }
    });
  });

  describe('plugin file references', () => {
    it('should reference existing agent file for autonomous mode', () => {
      const agentPath = join(PLUGIN_ROOT, 'agents', 'business-writer.md');
      expect(existsSync(agentPath)).toBe(true);
    });

    it('should reference existing skill file for challenger mode', () => {
      const skillPath = join(PLUGIN_ROOT, 'skills', 'challenging-assumptions', 'SKILL.md');
      expect(existsSync(skillPath)).toBe(true);
    });

    it('should reference existing templates for autonomous document types that use templates', () => {
      // Some autonomous tasks (e.g., naming-candidates) don't use templates
      const templateBasedTypes = new Set(
        allTasks
          .filter(
            (t) =>
              t.input.execution_mode === 'autonomous' &&
              t.graders.some((g) => g.type === 'code' && g.checks?.sections_present)
          )
          .map((t) => (t.input as { document_type: string }).document_type)
      );

      for (const docType of templateBasedTypes) {
        const templatePath = join(
          PLUGIN_ROOT,
          'skills',
          'generating-documents',
          'assets',
          'templates',
          `${docType}.md`
        );
        expect(existsSync(templatePath)).toBe(true);
      }
    });

    it('should reference existing skills for all interactive tasks', () => {
      const interactiveTasks = allTasks.filter((t) => t.input.execution_mode === 'interactive');
      for (const task of interactiveTasks) {
        if (task.input.execution_mode !== 'interactive') continue;
        const skillPath = join(PLUGIN_ROOT, 'skills', task.input.skill, 'SKILL.md');
        expect(existsSync(skillPath)).toBe(true);
      }
    });

    it('should reference existing fixtures for all tasks that use them', () => {
      for (const task of allTasks) {
        let fixtureName: string | undefined;
        if (task.input.execution_mode === 'autonomous' && task.input.context_fixture) {
          fixtureName = task.input.context_fixture;
        } else if (task.input.execution_mode === 'challenger') {
          fixtureName = task.input.fixture;
        }
        if (fixtureName) {
          const fixturePath = join(__dirname, 'fixtures', fixtureName);
          expect(existsSync(fixturePath)).toBe(true);
        }
      }
    });
  });
});
