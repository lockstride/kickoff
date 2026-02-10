import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PLUGIN_ROOT, isFile } from '../utils';

describe('shared-scripts', () => {
  describe('rename-path.mjs', () => {
    const scriptPath = join(PLUGIN_ROOT, 'shared-scripts', 'rename-path.mjs');

    it('should exist', () => {
      expect(isFile(scriptPath)).toBe(true);
    });

    it('should be valid JavaScript (parseable by Node)', () => {
      // --check parses without executing; throws on syntax error
      expect(() => execFileSync('node', ['--check', scriptPath])).not.toThrow();
    });

    describe('functional behavior', () => {
      const tmpDir = join(PLUGIN_ROOT, '..', '.test-tmp-rename');

      function setup() {
        mkdirSync(tmpDir, { recursive: true });
      }

      function teardown() {
        if (existsSync(tmpDir)) {
          rmSync(tmpDir, { recursive: true });
        }
      }

      it('should rename a file', () => {
        setup();
        try {
          const src = join(tmpDir, 'source.txt');
          const dest = join(tmpDir, 'destination.txt');
          writeFileSync(src, 'test content');

          execFileSync('node', [scriptPath, '--from', src, '--to', dest]);

          expect(existsSync(dest)).toBe(true);
          expect(existsSync(src)).toBe(false);
          expect(readFileSync(dest, 'utf-8')).toBe('test content');
        } finally {
          teardown();
        }
      });

      it('should exit with error if source does not exist', () => {
        setup();
        try {
          const src = join(tmpDir, 'nonexistent.txt');
          const dest = join(tmpDir, 'destination.txt');

          expect(() => {
            execFileSync('node', [scriptPath, '--from', src, '--to', dest], {
              stdio: 'pipe',
            });
          }).toThrow();
        } finally {
          teardown();
        }
      });

      it('should exit with error if --from or --to is missing', () => {
        expect(() => {
          execFileSync('node', [scriptPath, '--from', '/tmp/foo'], {
            stdio: 'pipe',
          });
        }).toThrow();
      });

      it('should create backup when --backup is set and destination exists', () => {
        setup();
        try {
          const src = join(tmpDir, 'source.txt');
          const dest = join(tmpDir, 'destination.txt');
          writeFileSync(src, 'new content');
          writeFileSync(dest, 'old content');

          execFileSync('node', [scriptPath, '--from', src, '--to', dest, '--backup']);

          expect(existsSync(dest)).toBe(true);
          expect(readFileSync(dest, 'utf-8')).toBe('new content');

          // A BACKUP-* file should exist with the old content
          const files = readdirSync(tmpDir);
          const backupFiles = files.filter((f) => f.startsWith('BACKUP-'));
          expect(backupFiles.length).toBe(1);
          expect(readFileSync(join(tmpDir, backupFiles[0]), 'utf-8')).toBe('old content');
        } finally {
          teardown();
        }
      });
    });
  });
});
