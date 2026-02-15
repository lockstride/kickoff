# Testing Guide

This guide covers all testing approaches for the Lockstride Kickoff plugin.

For general development setup, see [development.md](development.md).

---

## Overview

The Kickoff plugin uses three complementary test tiers:

1. **Static Tests** — Fast validation of plugin structure, manifests, and templates (no API calls)
2. **Integration Tests** — Content quality evaluation using Claude models (validates prompts and methodology)
3. **E2E Tests** — Orchestration testing via Claude Agent SDK (validates plugin runtime behavior)

**When to use each tier:**

| Test Tier | Purpose | When to Run | API Costs |
|-----------|---------|-------------|-----------|
| **Static** | Validate structure and configuration | Every commit (via pre-commit hook) | None |
| **Integration** | Evaluate content quality | Before releases, after template/methodology changes | $0.50-$2.00 per suite |
| **E2E** | Validate orchestration flows | After workflow changes, agent/skill modifications | $0.50-$2.00 per test |

---

## Static Tests

Static tests validate plugin structure, manifests, templates, and agent definitions without making API calls. They run fast (<2 seconds) and catch configuration errors early.

### Running Static Tests

```bash
# Run all static tests
pnpm test

# Watch mode for development
pnpm test:watch
```

### What Static Tests Cover

- **Plugin manifest** (`plugin.json`) validation
- **Agent definitions** — Frontmatter parsing, required fields, tool references
- **Skills** — Structure validation, frontmatter, reference file existence
- **Commands** — YAML frontmatter, argument definitions
- **Templates** — Section structure, HTML comment guidance, frontmatter
- **Shared scripts** — Cross-platform compatibility
- **Fixture manifest** — Completeness and template coverage
- **Agent identifiers** — Plugin-scoped naming (e.g., `lockstride-kickoff:business-writer`)

### Adding Static Tests

When adding new components, update the corresponding test file:

- `tests/static/agents.test.ts` — Agent validation
- `tests/static/skills.test.ts` — Skill validation
- `tests/static/commands.test.ts` — Command validation
- `tests/static/templates.test.ts` — Template validation
- `tests/static/manifest.test.ts` — Plugin manifest
- `tests/static/structure.test.ts` — Directory structure

---

## Integration Tests (Content Quality)

Integration tests invoke Claude models to generate content and evaluate quality using code-based and model-based graders. They validate that the plugin's prompts, templates, and methodology skills produce high-quality output.

**Environment setup:** Requires `ANTHROPIC_API_KEY` in `.env` file (see [Environment Variables](#environment-variables) below).

### Running Integration Tests

Each feature has its own test file (`[feature-name].e2e.ts`), enabling targeted test runs:

```bash
# Run all integration tests (requires ANTHROPIC_API_KEY)
pnpm test:integration

# Run a single feature test
pnpm test:integration brief-generation

# Run multiple specific tests
pnpm test:integration brief-generation market-analysis

# Run tests matching a pattern
pnpm test:integration edge-
```

### Available Test Files

| Test File | What It Tests |
|-----------|---------------|
| `brief-generation.e2e.ts` | Business brief generation |
| `market-analysis.e2e.ts` | Market analysis generation |
| `naming-exercise.e2e.ts` | Naming workflow |
| `edge-minimal-context.e2e.ts` | Edge case handling |
| `product-spec.e2e.ts` | Product spec generation |
| `challenger-engagement.e2e.ts` | SKEPTIC MODE challenger (market analysis) |
| `challenger-product-spec.e2e.ts` | SKEPTIC MODE challenger (product spec) |
| `challenger-business-plan.e2e.ts` | SKEPTIC MODE challenger (business plan) |
| `orchestration-business-brief.e2e.ts` | Tool-use orchestration simulation |

### Integration Test Configuration

- **Trials per task**: 3 attempts (with early exit optimization)
- **Pass criteria**: Configurable via `INTEGRATION_MIN_PASS_RATE` (default: 33% = 1 of 3 trials)
- **Models**: Uses Haiku for generation and grading by default (configurable via `INTEGRATION_GENERATION_MODEL` / `INTEGRATION_GRADER_MODEL`)
- **Timeouts**: 15 minutes per task maximum
- **Execution**: Sequential to avoid API rate limits
- **Cost**: Approximately $0.50-$2.00 per full test suite run (shown in test output)

### Integration Test Output

- Real-time progress indicators for each task and trial
- Final summary showing pass rates, cost, token usage, and detailed failure reasons
- Full transcripts saved to `tests/integration/transcripts/*.json` for debugging

**Example output:**
```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ brief-generation                                  2/2      100%│
│  Cost: $0.0234  Tokens: 12.5k in / 3.2k out                    │
└──────────────────────────────────────────────────────────────────┘
```

### Integration Test Fixtures

Fixtures are pre-generated documents used to isolate specific test scenarios without running full document generation. This significantly reduces test execution time and API costs.

**Use cases:**
1. **Challenger tests** — Use a fixture as the document being challenged (skips document generation entirely, ~27x faster)
2. **Document chain tests** — Use a fixture as input context for generation (tests realistic workflow propagation)

**Fixture structure:**
```
tests/integration/fixtures/
├── manifest.ts              # Defines all fixtures and their template mappings
├── generator.ts             # Auto-regeneration logic using Haiku
├── market-analysis-quicktest.md
├── business-brief-payflow.md
├── product-brief-metricsdash.md
├── product-spec-metricsdash.md
└── business-plan-payflow.md
```

**Automatic freshness checking:**

When templates change, fixtures may become stale (missing new sections, outdated structure). The integration test setup automatically:
1. Compares fixture modification times against corresponding templates
2. Regenerates stale fixtures using Haiku with seed data from the manifest
3. Logs regeneration activity during test setup

This prevents false negatives from template/fixture drift.

**Adding a new fixture:**

1. Add an entry to `fixtures/manifest.ts`:
   ```typescript
   {
     fixture: 'my-document.md',
     template: 'my-template',
     startup: 'StartupName',
     documentType: 'my-template',
     context: 'Minimal context for generation...',
   }
   ```
2. Run the integration tests — the fixture will be auto-generated
3. Or manually create `fixtures/my-document.md` matching the template structure

**Using fixtures in tasks:**
```typescript
// Challenger mode: fixture is the document being challenged
{
  agent: 'challenger',
  fixture: 'market-analysis-quicktest.md',
  document_type: 'market-analysis',
  context: 'Yes, challenge me on this analysis.',
}

// Document chain: fixture is input context for generation
{
  command: '/lockstride-kickoff:market',
  context_fixture: 'business-brief-payflow.md',
  context: 'Generate market analysis based on the brief above.',
}
```

### Adding Integration Test Tasks

1. Create task definition in `tests/integration/tasks/`:
   ```typescript
   // tests/integration/tasks/my-feature.ts
   import type { Task } from '../types';

   export const myFeatureTask: Task = {
     name: 'my-feature',
     trials: 3,
     context: {
       files: ['agents/writer.md', 'skills/document-templates/templates/my-template.md'],
       userPrompt: 'Generate my-template.md for...',
     },
     graders: [
       {
         type: 'code',
         checks: {
           sections_present: ['## Section 1', '## Section 2'],
           min_word_count: 500,
         },
       },
       {
         type: 'model',
         rubric: 'Evaluate quality, accuracy, completeness...',
       },
     ],
     success_criteria: {
       all_code_graders_pass: true,
       model_grader_score: 'B',
       min_pass_rate: 0.33,
     },
     reference_solution: 'High-quality output should...',
   };
   ```

2. Export from `tests/integration/tasks/index.ts`:
   ```typescript
   export { myFeatureTask } from './my-feature';
   // Add to allTasks array
   ```

3. Create the test file in `tests/integration/`:
   ```typescript
   // tests/integration/my-feature.e2e.ts
   import { myFeatureTask } from './tasks';
   import { createTaskTest } from './test-runner';

   createTaskTest(myFeatureTask);
   ```

---

## E2E Tests (Orchestration)

E2E tests use the Claude Agent SDK to load the real Kickoff plugin inside the Claude Code runtime and validate orchestration flows end-to-end. They test that commands, skills, and agents are correctly registered and invoked.

Interactive elements (e.g., `gathering-input`) are short-circuited by pre-seeding `.dot` input files and blocking the skill via hooks, so tests focus on orchestration rather than user interaction.

**Environment setup:** Requires `ANTHROPIC_API_KEY` in `.env` file (see [Environment Variables](#environment-variables) below).

### Running E2E Tests

```bash
# Run all E2E tests (requires ANTHROPIC_API_KEY)
pnpm test:e2e

# Run a single E2E test
pnpm test:e2e plugin-loading

# Run a specific flow test
pnpm test:e2e business-brief-flow
```

### Available Test Files

| Test File | What It Tests |
|-----------|---------------|
| `plugin-loading.e2e.ts` | Plugin loads, commands and agents registered |
| `business-brief-flow.e2e.ts` | Business brief orchestration: agent resolution with correct plugin prefix |

### E2E Test Configuration

- **SDK**: `@anthropic-ai/claude-agent-sdk` loads the plugin from `plugin/`
- **Permissions**: `bypassPermissions` mode for non-interactive execution
- **Cost controls**: Per-test `maxBudgetUsd` and `maxTurns` limits
- **Timeouts**: 15 minutes per test (120 seconds for plugin loading)
- **Cost**: Approximately $0.50-$2.00 per test (shown in test output)

### E2E Test Fixtures

E2E tests use pre-seeded fixtures to bypass interactive input gathering:

**Fixtures** (`tests/e2e/fixtures/`):
- `.business-brief-input.md` — Pre-built gathering-input output for business briefs
- `business-brief.md` — Complete business brief (dependency for downstream tests)

These fixtures allow tests to focus on orchestration (skill → agent handoff, agent resolution) without requiring user interaction.

### What E2E Tests Catch

- **Agent identifier errors** — e.g., `business-writer` vs `lockstride-kickoff:business-writer`
- **Missing or misconfigured plugin commands/agents** — registration failures
- **Broken skill-to-agent handoff flows** — incorrect `Task` tool invocations
- **Workflow dead-ends** — flow stops instead of continuing to next step

### E2E Test Output

**Example output:**
```
✓ business-brief-flow should spawn business-writer with plugin-prefixed identifier
  Agent events: lockstride-kickoff:business-writer
  Cost: $0.0123
  Turns: 3
```

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Required for both integration and E2E tests
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Override default models for integration tests
# (E2E tests use the model configured in the Claude Agent SDK, typically Sonnet)
INTEGRATION_GENERATION_MODEL=claude-haiku-4-5  # Default: claude-haiku-4-5
INTEGRATION_GRADER_MODEL=claude-haiku-4-5       # Default: claude-haiku-4-5

# Optional: Minimum pass rate for integration tests (fraction of trials that must pass)
INTEGRATION_MIN_PASS_RATE=0.33                  # Default: 0.33 (1 of 3 trials)
```

**Note:** The `.env` file is gitignored to prevent accidentally committing API keys.

---

## Troubleshooting

### Tests Not Running

**Static tests:**
- Ensure `pnpm install` has been run
- Check TypeScript version compatibility

**Integration/E2E tests:**
- Check `ANTHROPIC_API_KEY` is set in `.env` and valid
- Verify network connectivity to Anthropic API
- For E2E tests, ensure the Claude Agent SDK is installed (`@anthropic-ai/claude-agent-sdk` in `package.json`)

### Tests Hanging

**Integration tests:**
- Review `tests/integration/transcripts/*.json` for error details
- Check for network issues or API rate limits
- Verify the generation/grader models are available

**E2E tests:**
- Review `tests/e2e/transcripts/*.json` (if written by test)
- Check console output for SDK initialization errors
- Verify the plugin directory structure is correct

### Test Failures

**Integration test failures:**
- Review grader output in transcripts
- Check if templates changed (may need fixture regeneration)
- Verify reference solutions are still accurate

**E2E test failures:**
- Check for agent identifier issues (plugin prefix missing)
- Verify plugin manifest is valid (`plugin.json`)
- Review hook output for blocked skills

### Fixture Issues

**Stale fixtures:**
- Integration test setup automatically regenerates stale fixtures
- Check console output during test setup for regeneration logs
- Manually delete fixtures to force regeneration

**Fixture regeneration failures:**
- Check `ANTHROPIC_API_KEY` is set
- Review error logs in test output
- Manually create fixture matching template structure

---

## Best Practices

1. **Run static tests frequently** — They're fast and catch most issues
2. **Run integration tests before releases** — Especially after template or methodology changes
3. **Run E2E tests after workflow changes** — Agent resolution, skill handoffs, command registration
4. **Review transcripts on failure** — They contain full API conversations for debugging
5. **Keep fixtures fresh** — Trust the automatic regeneration, but spot-check occasionally
6. **Monitor costs** — Test output shows per-test/per-suite costs
7. **Use targeted test runs** — Run individual tests during development to save time and API costs

---

## CI/CD Integration

**Static tests** run automatically on every commit via pre-commit hooks and in CI on every push.

**Integration and E2E tests** are excluded from CI due to API costs. Run them manually:
- Before major releases
- After significant template changes
- After workflow or orchestration changes
- When debugging quality issues

See [development.md](development.md#continuous-integration) for full CI configuration details.
