import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { checkAllFixtures, regenerateStaleFixtures } from './fixtures/generator';
import { globalUsage } from './global-usage';
import { formatTokenCount } from './utils';

/**
 * Global setup for integration test suite.
 * Runs once before all tests begin.
 */
export async function setup() {
  const transcriptsDir = join(process.cwd(), 'tests/integration/transcripts');

  // Clear all JSON transcript files from previous runs
  const files = readdirSync(transcriptsDir);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  for (const file of jsonFiles) {
    unlinkSync(join(transcriptsDir, file));
  }

  console.log(`✓ Cleared ${String(jsonFiles.length)} transcript file(s)`);

  // Reset global usage accumulator
  globalUsage.reset();

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

/**
 * Global teardown for integration test suite.
 * Runs once after all tests complete.
 */
export function teardown() {
  const totals = globalUsage.getTotals();

  if (totals.apiCalls === 0) {
    return;
  }

  console.log('\n');
  console.log('═'.repeat(70));
  console.log('  Integration Test Suite Summary');
  console.log('─'.repeat(70));
  console.log(
    `  Total Cost: $${totals.estimatedCostUsd.toFixed(4)}  |  API Calls: ${totals.apiCalls.toString()}`
  );
  console.log(
    `  Tokens: ${formatTokenCount(totals.inputTokens)} in / ${formatTokenCount(totals.outputTokens)} out`
  );
  console.log('═'.repeat(70));
  console.log('\n');
}
