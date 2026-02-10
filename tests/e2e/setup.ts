import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { checkAllFixtures, regenerateStaleFixtures } from './fixtures/generator';

/**
 * Global setup for E2E test suite.
 * Runs once before all tests begin.
 */
export async function setup() {
  const transcriptsDir = join(process.cwd(), 'tests/e2e/transcripts');

  // Clear all JSON transcript files from previous runs
  const files = readdirSync(transcriptsDir);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  for (const file of jsonFiles) {
    unlinkSync(join(transcriptsDir, file));
  }

  console.log(`✓ Cleared ${String(jsonFiles.length)} transcript file(s)`);

  // Check fixture freshness and regenerate if needed
  await checkAndRegenerateFixtures();
}

/**
 * Check fixture freshness and regenerate stale fixtures.
 * Uses Haiku to regenerate fixtures when templates have changed.
 */
async function checkAndRegenerateFixtures() {
  const freshnessResults = checkAllFixtures();
  const staleCount = freshnessResults.filter((r) => r.isStale).length;

  if (staleCount === 0) {
    console.log(`✓ All ${String(freshnessResults.length)} fixtures are fresh`);
    return;
  }

  console.log(`⚠ ${String(staleCount)} stale fixture(s) detected, regenerating...`);

  const result = await regenerateStaleFixtures();

  if (result.failed.length > 0) {
    console.warn(`⚠ Some fixtures failed to regenerate:`);
    for (const failure of result.failed) {
      console.warn(`  - ${failure}`);
    }
  }

  if (result.regenerated > 0) {
    console.log(`✓ Regenerated ${String(result.regenerated)} fixture(s)`);
  }
}
