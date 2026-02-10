import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { PLUGIN_ROOT, isDirectory, isFile } from '../utils';

describe('Plugin Structure', () => {
  describe('required directories', () => {
    it('should have .claude-plugin directory', () => {
      expect(isDirectory(join(PLUGIN_ROOT, '.claude-plugin'))).toBe(true);
    });

    it('should have commands directory', () => {
      expect(isDirectory(join(PLUGIN_ROOT, 'commands'))).toBe(true);
    });

    it('should have agents directory', () => {
      expect(isDirectory(join(PLUGIN_ROOT, 'agents'))).toBe(true);
    });

    it('should have skills directory', () => {
      expect(isDirectory(join(PLUGIN_ROOT, 'skills'))).toBe(true);
    });

    it('should have shared-references directory', () => {
      expect(isDirectory(join(PLUGIN_ROOT, 'shared-references'))).toBe(true);
    });
  });

  describe('required files', () => {
    it('should have plugin.json manifest', () => {
      expect(isFile(join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'))).toBe(true);
    });

    it('should have LICENSE file', () => {
      expect(isFile(join(PLUGIN_ROOT, 'LICENSE'))).toBe(true);
    });
  });
});
