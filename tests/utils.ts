import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

// Plugin root directory (relative to tests/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PLUGIN_ROOT = resolve(__dirname, '../plugin');

// Valid Claude Code tool names
export const VALID_TOOLS = [
  'Read',
  'Write',
  'Edit',
  'Bash',
  'Glob',
  'Grep',
  'Task',
  'TodoWrite',
  'AskUserQuestion',
  'WebSearch',
  'WebFetch',
  'Skill',
  'NotebookEdit',
  'EnterPlanMode',
  'ExitPlanMode',
  '*', // Wildcard for all tools
] as const;

// Valid agent colors
export const VALID_COLORS = ['blue', 'cyan', 'green', 'yellow', 'magenta', 'red'] as const;

// Valid agent models
export const VALID_MODELS = ['inherit', 'sonnet', 'opus', 'haiku'] as const;

export interface ParsedMarkdownFile {
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
}

/**
 * Parse a markdown file with YAML frontmatter
 * Read-only operation, no side effects
 */
export function parseMarkdownWithFrontmatter(filePath: string): ParsedMarkdownFile {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check if file starts with ---
  if (lines[0].trim() !== '---') {
    return {
      frontmatter: {},
      body: content,
      raw: content,
    };
  }

  // Find the closing ---
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return {
      frontmatter: {},
      body: content,
      raw: content,
    };
  }

  // Extract frontmatter YAML (lines between the two ---)
  const frontmatterYaml = lines.slice(1, closingIndex).join('\n');
  const body = lines.slice(closingIndex + 1).join('\n');

  let frontmatter: Record<string, unknown> = {};

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Parsing external YAML
    frontmatter = parseYaml(frontmatterYaml) ?? {};
  } catch {
    // Return empty frontmatter if parsing fails - test will catch this
    frontmatter = {};
  }

  return {
    frontmatter,
    body: body.trim(),
    raw: content,
  };
}

export function readJsonFile(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as unknown;
}

/**
 * List all markdown files in a directory
 * Read-only operation, no side effects
 */
export function listMarkdownFiles(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  return readdirSync(dirPath)
    .filter((file) => file.endsWith('.md'))
    .map((file) => join(dirPath, file));
}

/**
 * List all subdirectories in a directory
 * Read-only operation, no side effects
 */
export function listSubdirectories(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return [];
  }

  return readdirSync(dirPath)
    .filter((item) => statSync(join(dirPath, item)).isDirectory())
    .map((item) => join(dirPath, item));
}

/**
 * Check if a path exists
 * Read-only operation, no side effects
 */
export function pathExists(path: string): boolean {
  return existsSync(path);
}

/**
 * Check if path is a directory
 * Read-only operation, no side effects
 */
export function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

/**
 * Check if path is a file
 * Read-only operation, no side effects
 */
export function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

/**
 * Get file basename without extension
 */
export function getBasename(filePath: string): string {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^.]+$/, '');
}

/**
 * Validate that a string matches kebab-case pattern
 */
export function isKebabCase(str: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(str);
}
