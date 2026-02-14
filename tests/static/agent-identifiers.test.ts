import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PLUGIN_ROOT } from '../utils';

/**
 * Plugin-scoped agents must be referenced with the full plugin prefix when
 * invoked via Task(subagent_type="..."). Claude Code registers plugin agents
 * as "{plugin-name}:{agent-name}", so workflow documentation must use the
 * prefixed form to avoid runtime "Agent type not found" errors.
 *
 * Plugin name is read from plugin.json to avoid hardcoding.
 */

const MANIFEST_PATH = join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json');
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')) as { name: string };
const PLUGIN_NAME = manifest.name;

const AGENTS_DIR = join(PLUGIN_ROOT, 'agents');
const agentNames = readdirSync(AGENTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace('.md', ''));

const WORKFLOW_FILES = [
  join(PLUGIN_ROOT, 'skills', 'generating-documents', 'references', 'internal-workflow.md'),
  join(PLUGIN_ROOT, 'skills', 'generating-documents', 'SKILL.md'),
  join(PLUGIN_ROOT, 'skills', 'gathering-input', 'SKILL.md'),
];

// Pre-compute all subagent_type references across workflow files
interface SubagentRef {
  file: string;
  line: number;
  identifier: string;
}

const subagentRefs: SubagentRef[] = [];
const narrativeRefs: SubagentRef[] = [];

for (const filePath of WORKFLOW_FILES) {
  const relativePath = filePath.replace(PLUGIN_ROOT + '/', '');
  const content = readFileSync(filePath, 'utf-8');

  // Collect subagent_type="..." references
  const subagentPattern = /subagent_type="([^"]+)"/g;
  for (const match of content.matchAll(subagentPattern)) {
    const line = content.substring(0, match.index).split('\n').length;
    subagentRefs.push({ file: relativePath, line, identifier: match[1] });
  }

  // Collect narrative "Spawn {agent} subagent/agent" references
  for (const agentName of agentNames) {
    const spawnPattern = new RegExp(
      `[Ss]pawn\\s+[\`"']?(?:[\\w-]+:)?${agentName}[\`"']?\\s+(sub)?agent`,
      'g'
    );
    for (const match of content.matchAll(spawnPattern)) {
      const line = content.substring(0, match.index).split('\n').length;
      narrativeRefs.push({ file: relativePath, line, identifier: match[0] });
    }
  }
}

describe('Agent Identifier Syntax', () => {
  it('should have at least one agent defined', () => {
    expect(agentNames.length).toBeGreaterThan(0);
  });

  describe.each(subagentRefs.map((r) => [`${r.file}:${String(r.line)} → ${r.identifier}`, r]))(
    'subagent_type: %s',
    (_label, ref) => {
      it(`should use "${PLUGIN_NAME}:" prefix`, () => {
        expect(ref.identifier.startsWith(`${PLUGIN_NAME}:`)).toBe(true);
      });

      it('should reference an existing agent', () => {
        const agentName = ref.identifier.startsWith(`${PLUGIN_NAME}:`)
          ? ref.identifier.replace(`${PLUGIN_NAME}:`, '')
          : ref.identifier;
        expect(agentNames).toContain(agentName);
      });
    }
  );

  describe.each(narrativeRefs.map((r) => [`${r.file}:${String(r.line)}`, r]))(
    'narrative spawn: %s',
    (_label, ref) => {
      it(`should use prefixed agent name`, () => {
        const hasPrefix = agentNames.some((name) =>
          ref.identifier.includes(`${PLUGIN_NAME}:${name}`)
        );
        expect(hasPrefix).toBe(true);
      });
    }
  );
});
