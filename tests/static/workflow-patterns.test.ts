import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { PLUGIN_ROOT, pathExists, listMarkdownFiles, listSubdirectories } from '../utils';

describe('Workflow Patterns', () => {
  describe('shared-references/ files', () => {
    it('should have user-interaction-patterns.md', () => {
      expect(
        pathExists(join(PLUGIN_ROOT, 'shared-references', 'user-interaction-patterns.md'))
      ).toBe(true);
    });

    it('should have config-resolution.md', () => {
      expect(pathExists(join(PLUGIN_ROOT, 'shared-references', 'config-resolution.md'))).toBe(true);
    });
  });

  describe('internal-workflow.md', () => {
    const internalWorkflowPath = join(
      PLUGIN_ROOT,
      'skills',
      'generating-documents',
      'references',
      'internal-workflow.md'
    );

    it('should exist in generating-documents skill', () => {
      expect(pathExists(internalWorkflowPath)).toBe(true);
    });

    it('should reference shared-references for reusable patterns (DRY)', () => {
      const content = readFileSync(internalWorkflowPath, 'utf-8');
      expect(content).toMatch(/shared-references\/user-interaction-patterns/);
      expect(content).toMatch(/shared-references\/config-resolution/);
    });
  });

  describe('generating-documents skill delegates to workflow files', () => {
    const skillPath = join(PLUGIN_ROOT, 'skills', 'generating-documents', 'SKILL.md');
    const content = readFileSync(skillPath, 'utf-8');

    it('should reference internal-workflow.md', () => {
      expect(content).toMatch(/internal-workflow\.md/);
    });

    it('should reference external-workflow.md', () => {
      expect(content).toMatch(/external-workflow\.md/);
    });

    it('should delegate workflow patterns rather than duplicating them', () => {
      expect(content).toMatch(
        /Follow the complete workflow in `references\/internal-workflow\.md`/i
      );
    });
  });

  describe('commands use ${CLAUDE_PLUGIN_ROOT} for shared references', () => {
    const commandFiles = listMarkdownFiles(join(PLUGIN_ROOT, 'commands'));
    const commandsReferencingShared = commandFiles.filter((path) => {
      const content = readFileSync(path, 'utf-8');
      return content.includes('shared-references');
    });

    it('should have at least one command referencing shared-references', () => {
      expect(commandsReferencingShared.length).toBeGreaterThan(0);
    });

    it.each(commandsReferencingShared)(
      '%s should use ${CLAUDE_PLUGIN_ROOT} paths, not relative paths',
      (cmdPath) => {
        const content = readFileSync(cmdPath, 'utf-8');
        expect(content).toMatch(/\$\{CLAUDE_PLUGIN_ROOT\}\/shared-references\//);
        expect(content).not.toMatch(/\.\.\/shared-references\//);
      }
    );
  });

  describe('skills use ${CLAUDE_PLUGIN_ROOT} for shared references', () => {
    const skillDirs = listSubdirectories(join(PLUGIN_ROOT, 'skills'));
    const skillsReferencingShared = skillDirs.filter((dir) => {
      const skillMdPath = join(dir, 'SKILL.md');
      try {
        const content = readFileSync(skillMdPath, 'utf-8');
        return content.includes('shared-references');
      } catch {
        return false;
      }
    });

    it('should have at least one skill referencing shared-references', () => {
      expect(skillsReferencingShared.length).toBeGreaterThan(0);
    });

    it.each(skillsReferencingShared)(
      '%s should use ${CLAUDE_PLUGIN_ROOT} paths, not relative paths',
      (skillDir) => {
        const content = readFileSync(join(skillDir, 'SKILL.md'), 'utf-8');
        expect(content).toMatch(/\$\{CLAUDE_PLUGIN_ROOT\}\/shared-references\//);
        expect(content).not.toMatch(/\.\.\/\.\.\/shared-references\//);
      }
    );
  });
});
