import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  PLUGIN_ROOT,
  listMarkdownFiles,
  parseMarkdownWithFrontmatter,
  VALID_TOOLS,
} from '../utils';

describe('Commands', () => {
  const commandsDir = join(PLUGIN_ROOT, 'commands');
  const commandFiles = listMarkdownFiles(commandsDir);

  it('should have at least one command', () => {
    expect(commandFiles.length).toBeGreaterThan(0);
  });

  describe.each(commandFiles)('command: %s', (filePath) => {
    const parsed = parseMarkdownWithFrontmatter(filePath);
    const { frontmatter, body } = parsed;

    describe('frontmatter schema', () => {
      it('should have valid YAML frontmatter', () => {
        expect(Object.keys(frontmatter).length).toBeGreaterThan(0);
      });

      it('should have "description" field', () => {
        expect(frontmatter.description).toBeDefined();
        expect(typeof frontmatter.description).toBe('string');
        expect((frontmatter.description as string).length).toBeGreaterThan(10);
      });

      it('should have valid allowed-tools format', () => {
        expect(frontmatter['allowed-tools']).toBeDefined();
        // Per command-development SKILL.md line 130-137: spec allows string or array
        // Project standard: require space-delimited string for consistency
        expect(typeof frontmatter['allowed-tools']).toBe('string');
      });

      it('should have valid tool names in allowed-tools', () => {
        const allowedTools = frontmatter['allowed-tools'] as string;
        const tools = allowedTools.split(/\s+/).filter(Boolean);

        tools.forEach((tool) => {
          expect(VALID_TOOLS).toContain(tool);
        });
      });
    });

    describe('command body', () => {
      it('should have non-trivial content', () => {
        expect(body.trim().length).toBeGreaterThan(50);
      });

      it('should have markdown structure', () => {
        expect(body).toMatch(/^#/m);
      });
    });
  });

  describe('command collection constraints', () => {
    it('should have unique descriptions', () => {
      const descriptions = commandFiles.map((file) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(file);
        return frontmatter.description;
      });
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(descriptions.length);
    });
  });
});
