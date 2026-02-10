import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { PLUGIN_ROOT, listSubdirectories, parseMarkdownWithFrontmatter, isFile } from '../utils';

describe('Research Skills Pattern', () => {
  const skillsDir = join(PLUGIN_ROOT, 'skills');
  const allSkillDirs = listSubdirectories(skillsDir);
  const researchSkills = allSkillDirs.filter((dir) => {
    const dirName = dir.split('/').pop() ?? '';
    return dirName.startsWith('researching-');
  });

  it('should have at least one research skill', () => {
    expect(researchSkills.length).toBeGreaterThan(0);
  });

  describe.each(researchSkills)('research skill: %s', (skillDir) => {
    const skillMdPath = join(skillDir, 'SKILL.md');
    const parsed = parseMarkdownWithFrontmatter(skillMdPath);
    const { frontmatter, body } = parsed;

    it('should have SKILL.md file', () => {
      expect(isFile(skillMdPath)).toBe(true);
    });

    it('should follow researching-{topic} naming pattern', () => {
      expect(frontmatter.name).toMatch(/^researching-[a-z-]+$/);
    });

    it('should not be user-invocable', () => {
      expect(frontmatter['user-invocable']).toBe(false);
    });

    it('should disable model invocation', () => {
      expect(frontmatter['disable-model-invocation']).toBe(true);
    });

    it('should not reference AskUserQuestion (autonomous execution)', () => {
      expect(body).not.toMatch(/AskUserQuestion/i);
    });
  });

  describe('research skill consistency', () => {
    it('should have unique names', () => {
      const names = researchSkills.map((dir) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(join(dir, 'SKILL.md'));
        return frontmatter.name;
      });
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have consistent directory and skill names', () => {
      researchSkills.forEach((dir) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(join(dir, 'SKILL.md'));
        const dirName = dir.split('/').pop();
        expect(frontmatter.name).toBe(dirName);
      });
    });
  });
});
