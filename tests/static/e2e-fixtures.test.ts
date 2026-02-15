import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureManifest, type FixtureDefinition } from '../integration/fixtures/manifest';
import { listMarkdownFiles, getBasename } from '../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INTEGRATION_DIR = resolve(__dirname, '../integration');
const PLUGIN_ROOT = resolve(__dirname, '../../plugin');
const TEMPLATES_DIR = join(PLUGIN_ROOT, 'skills', 'generating-documents', 'assets', 'templates');

describe('integration fixture manifest completeness', () => {
  it('should have at least one fixture defined', () => {
    expect(fixtureManifest.length).toBeGreaterThan(0);
  });

  const fixtureEntries: [string, FixtureDefinition][] = fixtureManifest.map((def) => [
    def.fixture,
    def,
  ]);

  describe.each(fixtureEntries)('fixture: %s', (_name, fixtureDef) => {
    it('should reference an existing template', () => {
      const templatePath = join(TEMPLATES_DIR, `${fixtureDef.template}.md`);
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should have a fixture file on disk', () => {
      const fixturePath = join(INTEGRATION_DIR, 'fixtures', fixtureDef.fixture);
      expect(existsSync(fixturePath)).toBe(true);
    });

    it('should have a non-empty startup name', () => {
      expect(fixtureDef.startup.length).toBeGreaterThan(0);
    });

    it('should have a documentType matching the template name', () => {
      expect(fixtureDef.documentType).toBe(fixtureDef.template);
    });
  });

  describe('template coverage', () => {
    const templateFiles = listMarkdownFiles(TEMPLATES_DIR);
    const templateNames = templateFiles.map(getBasename);
    const fixtureTemplates = new Set(fixtureManifest.map((def) => def.template));

    const coveredTemplates = templateNames.filter((name) => fixtureTemplates.has(name));

    it('should cover at least half of available templates', () => {
      expect(coveredTemplates.length).toBeGreaterThanOrEqual(Math.floor(templateNames.length / 2));
    });
  });
});
