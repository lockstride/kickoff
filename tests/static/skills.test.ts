import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  PLUGIN_ROOT,
  listSubdirectories,
  parseMarkdownWithFrontmatter,
  isFile,
  isKebabCase,
  VALID_TOOLS,
  VALID_MODELS,
} from '../utils';

describe('Skills', () => {
  const skillsDir = join(PLUGIN_ROOT, 'skills');
  const skillDirs = listSubdirectories(skillsDir);

  it('should have at least one skill', () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  describe.each(skillDirs)('skill: %s', (skillDir) => {
    const skillMdPath = join(skillDir, 'SKILL.md');

    it('should have SKILL.md file', () => {
      expect(isFile(skillMdPath)).toBe(true);
    });

    describe('SKILL.md schema', () => {
      const parsed = parseMarkdownWithFrontmatter(skillMdPath);
      const { frontmatter, body } = parsed;

      it('should have valid YAML frontmatter', () => {
        expect(Object.keys(frontmatter).length).toBeGreaterThan(0);
      });

      it('should have "name" in kebab-case', () => {
        expect(frontmatter.name).toBeDefined();
        expect(typeof frontmatter.name).toBe('string');
        expect(isKebabCase(frontmatter.name as string)).toBe(true);
      });

      it('should have "description" with meaningful length', () => {
        expect(frontmatter.description).toBeDefined();
        expect(typeof frontmatter.description).toBe('string');
        expect((frontmatter.description as string).length).toBeGreaterThan(20);
      });

      it('should have non-trivial body content', () => {
        expect(body.trim().length).toBeGreaterThan(100);
      });

      it('should have markdown structure', () => {
        expect(body).toMatch(/^#/m);
      });

      it('should have valid allowed-tools format if specified', () => {
        if (frontmatter['allowed-tools']) {
          // Per docs/component-architecture/skills.md line 125:
          // allowed-tools must be space-delimited string (project standard)
          expect(typeof frontmatter['allowed-tools']).toBe('string');
          const tools = (frontmatter['allowed-tools'] as string).split(/\s+/).filter(Boolean);
          tools.forEach((tool) => {
            expect(VALID_TOOLS).toContain(tool);
          });
        }
      });

      it('should have valid model if specified', () => {
        if (frontmatter.model) {
          // Per docs/component-architecture/skills.md line 129
          expect(VALID_MODELS).toContain(frontmatter.model);
        }
      });

      it('should have valid context if specified', () => {
        if (frontmatter.context) {
          // Per docs/component-architecture/skills.md line 130
          const validContexts = ['inline', 'fork'];
          expect(validContexts).toContain(frontmatter.context);
        }
      });

      it('should have valid agent if specified', () => {
        if (frontmatter.agent) {
          // Per docs/component-architecture/skills.md line 131
          expect(typeof frontmatter.agent).toBe('string');
        }
      });

      it('should have valid license if specified', () => {
        if (frontmatter.license) {
          // Per docs/component-architecture/skills.md line 122
          expect(typeof frontmatter.license).toBe('string');
        }
      });

      it('should have valid compatibility if specified', () => {
        if (frontmatter.compatibility) {
          // Per docs/component-architecture/skills.md line 123
          expect(typeof frontmatter.compatibility).toBe('string');
          expect((frontmatter.compatibility as string).length).toBeLessThanOrEqual(500);
        }
      });

      it('should have valid metadata if specified', () => {
        if (frontmatter.metadata) {
          // Per docs/component-architecture/skills.md line 124
          expect(typeof frontmatter.metadata).toBe('object');
        }
      });
    });
  });

  describe('skill collection constraints', () => {
    it('should have unique names across skills', () => {
      const names = skillDirs.map((dir) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(join(dir, 'SKILL.md'));
        return frontmatter.name;
      });
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have consistent directory name and skill name', () => {
      skillDirs.forEach((dir) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(join(dir, 'SKILL.md'));
        const dirName = dir.split('/').pop();
        expect(frontmatter.name).toBe(dirName);
      });
    });
  });

  describe('invocability configuration', () => {
    it('should have valid user-invocable and disable-model-invocation values', () => {
      skillDirs.forEach((dir) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(join(dir, 'SKILL.md'));

        if (frontmatter['user-invocable'] !== undefined) {
          expect(typeof frontmatter['user-invocable']).toBe('boolean');
        }

        if (frontmatter['disable-model-invocation'] !== undefined) {
          expect(typeof frontmatter['disable-model-invocation']).toBe('boolean');
        }
      });
    });
  });
});
