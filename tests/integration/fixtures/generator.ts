/**
 * Fixture generator using Haiku to regenerate stale fixtures.
 * Ensures fixtures stay in sync with template structure changes.
 */

import Anthropic from '@anthropic-ai/sdk';
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureManifest, type FixtureDefinition } from './manifest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = resolve(__dirname, '../../../plugin');
const FIXTURES_DIR = __dirname;
const TEMPLATES_DIR = join(PLUGIN_ROOT, 'skills', 'generating-documents', 'assets', 'templates');

const GENERATOR_MODEL = 'claude-haiku-4-5';

interface FreshnessResult {
  fixture: string;
  isStale: boolean;
  templateMtime?: Date;
  fixtureMtime?: Date;
  reason: string;
}

/**
 * Check if a fixture is stale relative to its template.
 */
export function checkFixtureFreshness(def: FixtureDefinition): FreshnessResult {
  const fixturePath = join(FIXTURES_DIR, def.fixture);
  const templatePath = join(TEMPLATES_DIR, `${def.template}.md`);

  // Template must exist
  if (!existsSync(templatePath)) {
    return {
      fixture: def.fixture,
      isStale: false,
      reason: `Template ${def.template}.md not found, skipping`,
    };
  }

  // If fixture doesn't exist, it's "stale" (needs generation)
  if (!existsSync(fixturePath)) {
    return {
      fixture: def.fixture,
      isStale: true,
      reason: 'Fixture does not exist',
    };
  }

  const templateMtime = statSync(templatePath).mtime;
  const fixtureMtime = statSync(fixturePath).mtime;

  if (templateMtime > fixtureMtime) {
    return {
      fixture: def.fixture,
      isStale: true,
      templateMtime,
      fixtureMtime,
      reason: `Template modified after fixture (${templateMtime.toISOString()} > ${fixtureMtime.toISOString()})`,
    };
  }

  return {
    fixture: def.fixture,
    isStale: false,
    templateMtime,
    fixtureMtime,
    reason: 'Fixture is up to date',
  };
}

/**
 * Check all fixtures for freshness.
 */
export function checkAllFixtures(): FreshnessResult[] {
  return fixtureManifest.map(checkFixtureFreshness);
}

/**
 * Regenerate a single fixture using Haiku.
 */
export async function regenerateFixture(
  def: FixtureDefinition,
  client: Anthropic
): Promise<{ success: boolean; error?: string }> {
  const templatePath = join(TEMPLATES_DIR, `${def.template}.md`);

  if (!existsSync(templatePath)) {
    return { success: false, error: `Template not found: ${def.template}.md` };
  }

  const templateContent = readFileSync(templatePath, 'utf-8');

  const prompt = `Generate a complete ${def.documentType} document for a startup called "${def.startup}".

## Template to Follow
${templateContent}

## Startup Context
${def.context}

## Instructions
- Fill in ALL sections from the template with realistic, specific content
- Use the startup name and context provided
- Do NOT include placeholder text like {FIELD_NAME} or [INSERT HERE]
- Keep the document concise but complete (aim for 300-600 words)
- Use realistic numbers, names, and examples
- Output ONLY the document content (no preamble or explanation)`;

  try {
    const response = await client.messages.create({
      model: GENERATOR_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return { success: false, error: 'Unexpected response type from API' };
    }

    const fixturePath = join(FIXTURES_DIR, def.fixture);
    writeFileSync(fixturePath, content.text);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Regenerate all stale fixtures.
 * Returns summary of actions taken.
 */
export async function regenerateStaleFixtures(): Promise<{
  checked: number;
  stale: number;
  regenerated: number;
  failed: string[];
}> {
  const freshnessResults = checkAllFixtures();
  const staleFixtures = freshnessResults.filter((r) => r.isStale);

  if (staleFixtures.length === 0) {
    return {
      checked: freshnessResults.length,
      stale: 0,
      regenerated: 0,
      failed: [],
    };
  }

  // Only create client if we need to regenerate
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set, cannot regenerate stale fixtures');
    return {
      checked: freshnessResults.length,
      stale: staleFixtures.length,
      regenerated: 0,
      failed: staleFixtures.map((f) => `${f.fixture}: No API key`),
    };
  }

  const client = new Anthropic();
  const failed: string[] = [];
  let regenerated = 0;

  for (const result of staleFixtures) {
    const def = fixtureManifest.find((d) => d.fixture === result.fixture);
    if (!def) continue;

    console.log(`  Regenerating ${def.fixture}...`);
    const regenResult = await regenerateFixture(def, client);

    if (regenResult.success) {
      regenerated++;
      console.log(`  ✓ ${def.fixture} regenerated`);
    } else {
      failed.push(`${def.fixture}: ${regenResult.error ?? 'Unknown error'}`);
      console.warn(`  ✗ ${def.fixture}: ${regenResult.error ?? 'Unknown error'}`);
    }
  }

  return {
    checked: freshnessResults.length,
    stale: staleFixtures.length,
    regenerated,
    failed,
  };
}
