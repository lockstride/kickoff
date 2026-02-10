import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  PLUGIN_ROOT,
  listMarkdownFiles,
  parseMarkdownWithFrontmatter,
  VALID_COLORS,
  VALID_MODELS,
  VALID_TOOLS,
} from '../utils';

describe('Agents', () => {
  const agentsDir = join(PLUGIN_ROOT, 'agents');
  const agentFiles = listMarkdownFiles(agentsDir);

  it('should have at least one agent', () => {
    expect(agentFiles.length).toBeGreaterThan(0);
  });

  describe.each(agentFiles)('agent: %s', (filePath) => {
    const parsed = parseMarkdownWithFrontmatter(filePath);
    const { frontmatter, body } = parsed;

    describe('frontmatter schema', () => {
      it('should have valid YAML frontmatter', () => {
        expect(Object.keys(frontmatter).length).toBeGreaterThan(0);
      });

      it('should have "name" as kebab-case identifier', () => {
        expect(frontmatter.name).toBeDefined();
        expect(typeof frontmatter.name).toBe('string');
        expect(frontmatter.name).toMatch(/^[a-z][a-z0-9-]*$/);
      });

      it('should have "description" with meaningful length', () => {
        expect(frontmatter.description).toBeDefined();
        expect(typeof frontmatter.description).toBe('string');
        expect((frontmatter.description as string).length).toBeGreaterThan(20);
      });

      it('should have valid "model" value', () => {
        expect(frontmatter.model).toBeDefined();
        expect(VALID_MODELS).toContain(frontmatter.model);
      });

      it('should have valid "color" value', () => {
        expect(frontmatter.color).toBeDefined();
        expect(VALID_COLORS).toContain(frontmatter.color);
      });

      it('should have valid tools if specified', () => {
        if (frontmatter.tools) {
          expect(typeof frontmatter.tools).toBe('string');
          const tools = (frontmatter.tools as string).split(/\s+/).filter(Boolean);
          tools.forEach((tool) => {
            expect(VALID_TOOLS).toContain(tool);
          });
        }
      });

      it('should have valid skills if specified', () => {
        if (frontmatter.skills) {
          expect(Array.isArray(frontmatter.skills)).toBe(true);
          const skills = frontmatter.skills as string[];
          skills.forEach((skill) => {
            expect(typeof skill).toBe('string');
            expect(skill).toMatch(/^[a-z][a-z0-9-]*$/);
          });
        }
      });

      it('should have valid disallowedTools if specified', () => {
        if (frontmatter.disallowedTools) {
          expect(typeof frontmatter.disallowedTools).toBe('string');
          const tools = (frontmatter.disallowedTools as string).split(/\s+/).filter(Boolean);
          tools.forEach((tool) => {
            expect(VALID_TOOLS).toContain(tool);
          });
        }
      });

      it('should have valid permissionMode if specified', () => {
        if (frontmatter.permissionMode) {
          const validModes = ['default', 'acceptEdits', 'dontAsk', 'bypassPermissions', 'plan'];
          expect(validModes).toContain(frontmatter.permissionMode);
        }
      });

      it('should have valid hooks if specified', () => {
        if (frontmatter.hooks) {
          expect(typeof frontmatter.hooks).toBe('object');
          expect(Array.isArray(frontmatter.hooks)).toBe(false);
        }
      });
    });

    describe('system prompt', () => {
      it('should have non-trivial content', () => {
        expect(body.trim().length).toBeGreaterThan(100);
      });
    });
  });

  describe('agent collection constraints', () => {
    it('should have unique colors across agents', () => {
      const colors = agentFiles.map((file) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(file);
        return frontmatter.color;
      });
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('should have unique names across agents', () => {
      const names = agentFiles.map((file) => {
        const { frontmatter } = parseMarkdownWithFrontmatter(file);
        return frontmatter.name;
      });
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('researcher agent architecture', () => {
    const researcherPath = join(PLUGIN_ROOT, 'agents', 'researcher.md');
    const { frontmatter, body } = parseMarkdownWithFrontmatter(researcherPath);

    it('should have web search capabilities', () => {
      const tools = (frontmatter.tools as string).split(/\s+/).filter(Boolean);
      expect(tools).toContain('WebSearch');
      expect(tools).toContain('WebFetch');
    });

    it('should have file reading capabilities', () => {
      const tools = (frontmatter.tools as string).split(/\s+/).filter(Boolean);
      expect(tools).toContain('Read');
      expect(tools).toContain('Glob');
    });

    it('should not have user interaction tools (autonomous agent)', () => {
      const tools = (frontmatter.tools as string).split(/\s+/).filter(Boolean);
      expect(tools).not.toContain('AskUserQuestion');
      expect(body).not.toMatch(/AskUserQuestion/i);
    });
  });

  describe('business-writer agent architecture', () => {
    const businessWriterPath = join(PLUGIN_ROOT, 'agents', 'business-writer.md');
    const { frontmatter, body } = parseMarkdownWithFrontmatter(businessWriterPath);

    it('should be template-driven rather than hardcoded', () => {
      // Agent reads behavior from templates, not from hardcoded mapping
      expect(body).not.toMatch(/## Document Type to Methodology Mapping/i);
    });

    it('should have access to all methodologies referenced by templates', () => {
      // Discover methodologies that templates actually reference
      const templatesDir = join(
        PLUGIN_ROOT,
        'skills',
        'generating-documents',
        'assets',
        'templates'
      );
      const templateFiles = listMarkdownFiles(templatesDir);
      const referencedMethodologies = new Set<string>();

      templateFiles.forEach((templatePath) => {
        const parsed = parseMarkdownWithFrontmatter(templatePath);
        if (parsed.frontmatter.primary_methodology) {
          referencedMethodologies.add(parsed.frontmatter.primary_methodology as string);
        }
        if (parsed.frontmatter.secondary_methodology) {
          referencedMethodologies.add(parsed.frontmatter.secondary_methodology as string);
        }
      });

      const agentSkills = frontmatter.skills as string[];
      referencedMethodologies.forEach((methodology) => {
        expect(agentSkills).toContain(methodology);
      });
    });
  });
});
