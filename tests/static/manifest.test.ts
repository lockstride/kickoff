import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { PLUGIN_ROOT, readJsonFile, pathExists, isKebabCase } from '../utils';

describe('Plugin Manifest', () => {
  const manifestPath = join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json');

  it('should exist in .claude-plugin directory', () => {
    expect(pathExists(manifestPath)).toBe(true);
  });

  describe('manifest schema', () => {
    const manifest = readJsonFile(manifestPath) as Record<string, unknown>;

    it('should be valid JSON object', () => {
      expect(manifest).toBeDefined();
      expect(typeof manifest).toBe('object');
    });

    it('should have "name" in kebab-case', () => {
      expect(manifest.name).toBeDefined();
      expect(typeof manifest.name).toBe('string');
      expect(isKebabCase(manifest.name as string)).toBe(true);
    });

    it('should have "version" in semver format', () => {
      expect(manifest.version).toBeDefined();
      expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have "description" with meaningful length', () => {
      expect(manifest.description).toBeDefined();
      expect(typeof manifest.description).toBe('string');
      expect((manifest.description as string).length).toBeGreaterThan(10);
    });

    it('should have "author" information', () => {
      expect(manifest.author).toBeDefined();
      const author = manifest.author as Record<string, string>;
      expect(author.name).toBeDefined();
    });

    it('should have valid "license"', () => {
      expect(manifest.license).toBeDefined();
      expect(typeof manifest.license).toBe('string');
    });
  });
});
