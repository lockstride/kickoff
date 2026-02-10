#!/usr/bin/env node
/**
 * Cross-platform file/folder renaming utility
 * Works on macOS and Windows
 *
 * Usage: node rename-path.mjs --from PATH --to PATH [--backup]
 *
 * Options:
 *   --backup  If destination exists, create timestamped backup before renaming
 */

import { renameSync, existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { basename, extname, dirname, join } from 'node:path';

const { values } = parseArgs({
  options: {
    from: { type: 'string' },
    to: { type: 'string' },
    backup: { type: 'boolean', default: false },
  },
});

if (!values.from || !values.to) {
  console.error('Usage: node rename-path.mjs --from PATH --to PATH [--backup]');
  process.exit(1);
}

// Check if source exists
if (!existsSync(values.from)) {
  console.error(`Source file not found: ${values.from}`);
  process.exit(1);
}

try {
  // Handle backup if destination exists and backup flag is set
  if (values.backup && existsSync(values.to)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-').slice(0, 15); // YYYYMMDD-HHMMSS

    const base = basename(values.to, extname(values.to));
    const ext = extname(values.to);
    const dir = dirname(values.to);
    const backupPath = join(dir, `BACKUP-${base}-${timestamp}${ext}`);

    try {
      renameSync(values.to, backupPath);
      console.log(`Backed up existing ${basename(values.to)} → ${basename(backupPath)}`);
    } catch (backupError) {
      console.error(`Failed to create backup: ${backupError.message}`);
      process.exit(1);
    }
  }

  // Perform the rename
  renameSync(values.from, values.to);
  console.log(`Renamed: ${values.from} → ${values.to}`);
} catch (error) {
  console.error(`Failed to rename: ${error.message}`);
  process.exit(1);
}
