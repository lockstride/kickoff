import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  PLUGIN_ROOT,
  listMarkdownFiles,
  listSubdirectories,
  parseMarkdownWithFrontmatter,
  pathExists,
  getBasename,
} from '../utils';

describe('Document Templates', () => {
  const templatesDir = join(PLUGIN_ROOT, 'skills', 'generating-documents', 'assets', 'templates');
  const templateFiles = listMarkdownFiles(templatesDir);

  // Discover valid values from the codebase itself
  const skillDirs = listSubdirectories(join(PLUGIN_ROOT, 'skills'));
  const allSkillNames = skillDirs.map((dir) => {
    const name = dir.split('/').pop();
    if (!name) throw new Error(`Invalid skill directory path: ${dir}`);
    return name;
  });
  const researchSkillNames = allSkillNames.filter((name) => name.startsWith('researching-'));

  // Discover methodologies from the business-writer agent's skills list
  const businessWriterPath = join(PLUGIN_ROOT, 'agents', 'business-writer.md');
  const businessWriterParsed = parseMarkdownWithFrontmatter(businessWriterPath);
  const agentMethodologies = businessWriterParsed.frontmatter.skills as string[];

  it('should have templates directory', () => {
    expect(pathExists(templatesDir)).toBe(true);
  });

  describe('template collection', () => {
    it('should have at least one template', () => {
      expect(templateFiles.length).toBeGreaterThan(0);
    });

    it('should have unique template names', () => {
      const names = templateFiles.map(getBasename);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe.each(templateFiles)('template: %s', (templatePath) => {
    const parsed = parseMarkdownWithFrontmatter(templatePath);
    const { frontmatter, body } = parsed;
    const templateName = getBasename(templatePath);

    it('should have non-trivial content', () => {
      expect(body.length).toBeGreaterThan(500);
    });

    it('should have section structure', () => {
      expect(body).toMatch(/^##\s/m);
    });

    it('should have placeholders for customization', () => {
      expect(parsed.raw).toMatch(/\{[A-Z_]+\}/);
    });

    describe('template-driven architecture contract', () => {
      it('should have machine-readable metadata', () => {
        expect(Object.keys(frontmatter).length).toBeGreaterThan(0);
      });

      it('should declare its document type matching filename', () => {
        expect(frontmatter.document_type).toBe(templateName);
      });

      it('should specify a methodology the business-writer agent can execute', () => {
        expect(frontmatter.primary_methodology).toBeDefined();
        expect(agentMethodologies).toContain(frontmatter.primary_methodology);
      });

      it('should declare dependencies referencing real template types', () => {
        expect(frontmatter.dependencies).toBeDefined();
        const deps = frontmatter.dependencies as string[];
        expect(Array.isArray(deps)).toBe(true);

        // All dependencies must reference existing templates
        const validTypes = templateFiles.map(getBasename);
        deps.forEach((dep) => {
          expect(validTypes).toContain(dep);
        });
      });

      it('should have research_required boolean field', () => {
        expect(typeof frontmatter.research_required).toBe('boolean');
      });

      it('should have valid research configuration if research is required', () => {
        if (frontmatter.research_required) {
          const skills = frontmatter.research_skills as string[];
          expect(Array.isArray(skills)).toBe(true);
          expect(skills.length).toBeGreaterThan(0);

          // All research skills must reference existing researching-* skills
          skills.forEach((skill) => {
            expect(researchSkillNames).toContain(skill);
          });

          expect(frontmatter.research_inputs).toBeDefined();
          expect(typeof frontmatter.research_inputs).toBe('object');
        }
      });
    });
  });
});
