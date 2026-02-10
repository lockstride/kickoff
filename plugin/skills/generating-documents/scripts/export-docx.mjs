#!/usr/bin/env node
/**
 * Cross-platform DOCX/PPTX export with Pandoc
 * Works on macOS and Windows
 *
 * Usage: node export-docx.mjs --input FILE --output FILE --reference FILE --version VERSION
 *
 * Prerequisites:
 *   - Pandoc must be installed (https://pandoc.org/)
 *   - adm-zip must be installed in the plugin directory: npm install adm-zip
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, extname, dirname } from 'node:path';
import { parseArgs } from 'node:util';

// Load adm-zip from local or global install
// Uses createRequire to resolve global packages that ES modules can't find directly
const require = createRequire(import.meta.url);
let AdmZip;
try {
  AdmZip = require('adm-zip');
} catch {
  console.error('ERROR: adm-zip is not installed. Run: npm install -g adm-zip');
  process.exit(1);
}

// Parse command line arguments
const { values } = parseArgs({
  options: {
    input: { type: 'string' },
    output: { type: 'string' },
    reference: { type: 'string' },
    version: { type: 'string' },
  },
});

const { input, output, reference, version } = values;

// Validate required arguments
if (!input || !output || !reference || !version) {
  console.error(
    'Usage: node export-docx.mjs --input FILE --output FILE --reference FILE --version VERSION'
  );
  process.exit(1);
}

// Check input file exists
if (!existsSync(input)) {
  console.error(`Input file not found: ${input}`);
  process.exit(1);
}

// Check reference template exists
if (!existsSync(reference)) {
  console.error(`Reference template not found: ${reference}`);
  process.exit(1);
}

// Ensure output directory exists
const outputDir = dirname(output);
if (!existsSync(outputDir)) {
  console.error(`Output directory does not exist: ${outputDir}`);
  process.exit(1);
}

try {
  // Step 1: Run Pandoc
  console.log(`Converting ${input} to ${output}...`);
  execFileSync('pandoc', [input, '-o', output, `--reference-doc=${reference}`], {
    stdio: 'inherit',
  });

  // Step 2: Post-process {{VERSION}} placeholder (DOCX only)
  if (extname(output) === '.docx') {
    console.log('Post-processing DOCX to replace {{VERSION}} placeholder...');

    const tempDir = mkdtempSync(join(tmpdir(), 'docx-'));

    try {
      // Extract DOCX using adm-zip (cross-platform)
      const zip = new AdmZip(output);
      zip.extractAllTo(tempDir, true);

      // Find and update header files
      const wordDir = join(tempDir, 'word');
      if (existsSync(wordDir)) {
        const files = readdirSync(wordDir).filter(
          (f) => f.startsWith('header') && f.endsWith('.xml')
        );

        for (const file of files) {
          const filePath = join(wordDir, file);
          let content = readFileSync(filePath, 'utf-8');
          if (content.includes('{{VERSION}}')) {
            content = content.replace(/\{\{VERSION\}\}/g, version);
            writeFileSync(filePath, content);
            console.log(`  Updated ${file}`);
          }
        }
      }

      // Repackage the DOCX using adm-zip (cross-platform)
      rmSync(output, { force: true });
      const newZip = new AdmZip();
      newZip.addLocalFolder(tempDir);
      newZip.writeZip(output);
    } finally {
      // Clean up temp directory
      rmSync(tempDir, { recursive: true, force: true });
    }
  }

  console.log(`\nExported: ${output}`);
} catch (error) {
  console.error(`Export failed: ${error.message}`);
  process.exit(1);
}
