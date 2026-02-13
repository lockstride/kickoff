# Development Guide

This guide covers everything you need to develop and contribute to Lockstride Kickoff.

For general Claude Code Plugin architecture principles, see [general-architecture.md](general-architecture.md).

For Kickoff-specific architectural patterns, see [kickoff-architecture.md](kickoff-architecture.md).

## Prerequisites

### Required
- **Node.js**: v22 or later
- **pnpm**: Package manager (install via `npm install -g pnpm`)
- **Claude Code CLI**: For testing the plugin locally
- **Git**: For repository operations

### Optional
- **GitHub CLI** (`gh`): Only required for the `/lockstride-kickoff:create-repo` command (has fallback if not available)
- **Anthropic API Key**: For running E2E tests that evaluate plugin output quality
- **Pandoc**: For generate-external E2E tests (https://pandoc.org/)

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lockstride/kickoff.git
   cd kickoff
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

   This will automatically run the `prepare` script to set up Git hooks via Husky.

3. **Set up environment variables** (optional, for E2E tests):
   ```bash
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

4. **Run Claude with the local plugin**:

   **Option A: Direct plugin directory**

   ```bash
   claude --plugin-dir .
   ```

   This launches Claude Code with the plugin loaded from your local directory. Any changes you make to the plugin files will be reflected the next time you run this command.

   **Option B: Local marketplace (recommended for ongoing development)**

   Set up a local marketplace that symlinks to your plugin. This approach mirrors how users install via the production marketplace and allows testing installation/upgrade flows.

   Create a local marketplace directory:

   ```bash
   mkdir -p ~/development/claude-marketplace-local/plugins
   mkdir -p ~/development/claude-marketplace-local/.claude-plugin
   ```

   Create `~/development/claude-marketplace-local/.claude-plugin/marketplace.json`:

   ```json
   {
     "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
     "name": "local-dev-marketplace",
     "description": "Local development marketplace for testing plugins",
     "owner": {
       "name": "Local Development"
     },
     "plugins": [
       {
         "name": "lockstride-kickoff",
         "source": "./plugins/lockstride-kickoff",
         "description": "Lockstride Kickoff plugin (local development version)",
         "version": "0.3.0"
       }
     ]
   }
   ```

   Symlink the plugin into the marketplace:

   ```bash
   ln -s /path/to/kickoff ~/development/claude-marketplace-local/plugins/lockstride-kickoff
   ```

   Add the local marketplace to Claude and install the plugin:

   ```
   /plugin marketplace add ~/development/claude-marketplace-local
   /plugin install lockstride-kickoff@local-dev-marketplace
   ```

   Since the marketplace uses a symlink, your working directory changes are immediately available. However, you may need to reinstall the plugin in Claude Code to load the changes:

   ```
   /plugin uninstall lockstride-kickoff
   /plugin install lockstride-kickoff@local-dev-marketplace
   ```

## Environment Variables

Create a `.env` file in the project root for E2E testing configuration:

```bash
# Required for E2E tests
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Override default models for E2E tests (e.g., claude-haiku-4-5, claude-sonnet-4-5, claude-opus-4-5)
E2E_GENERATION_MODEL=claude-haiku-4-5  # Default: claude-haiku-4-5
E2E_GRADER_MODEL=claude-haiku-4-5       # Default: claude-haiku-4-5

# Optional: Minimum pass rate for E2E tests (fraction of trials that must pass)
E2E_MIN_PASS_RATE=0.33                  # Default: 0.33 (1 of 3 trials)
```

**Note**: The `.env` file is gitignored to prevent accidentally committing API keys.

## Testing

### Static Tests
Static tests validate plugin structure, manifests, templates, and agent definitions without making API calls:

```bash
# Run all static tests
pnpm test

# Watch mode for development
pnpm test:watch
```

### E2E Tests
E2E tests invoke actual Claude models to generate content and evaluate quality. These are expensive (time and API costs) and should be run intentionally.

Each feature has its own test file (`[feature-name].e2e.ts`), enabling targeted test runs:

```bash
# Run all E2E tests (requires ANTHROPIC_API_KEY)
pnpm test:e2e

# Run a single feature test
pnpm test:e2e brief-generation

# Run multiple specific tests
pnpm test:e2e brief-generation market-analysis

# Run tests matching a pattern
pnpm test:e2e edge-
```

**Available test files**:
- `brief-generation.e2e.ts` — Business brief generation
- `market-analysis.e2e.ts` — Market analysis generation
- `naming-exercise.e2e.ts` — Naming workflow
- `edge-minimal-context.e2e.ts` — Edge case handling
- `product-spec.e2e.ts` — Product spec generation
- `challenger-engagement.e2e.ts` — SKEPTIC MODE challenger (market analysis)
- `challenger-product-spec.e2e.ts` — SKEPTIC MODE challenger (product spec)
- `challenger-business-plan.e2e.ts` — SKEPTIC MODE challenger (business plan)

**E2E Test Configuration**:
- **Trials per task**: 3 attempts (with early exit optimization)
- **Pass criteria**: Configurable via `E2E_MIN_PASS_RATE` (default: 33% = 1 of 3 trials)
- **Models**: Uses Sonnet for generation, Haiku for grading (configurable)
- **Timeouts**: 15 minutes per task maximum
- **Execution**: Sequential to avoid API rate limits
- **Cost**: Approximately $0.50-$2.00 per full test suite run

**E2E Test Output**:
- Real-time progress indicators for each task and trial
- Final summary showing pass rates and detailed failure reasons
- Full transcripts saved to `tests/e2e/transcripts/*.json` for debugging

### E2E Test Fixtures

Fixtures are pre-generated documents used to isolate specific test scenarios without running full document generation. This significantly reduces test execution time and API costs.

**Use cases**:
1. **Challenger tests** — Use a fixture as the document being challenged (skips document generation entirely, ~27x faster)
2. **Document chain tests** — Use a fixture as input context for generation (tests realistic workflow propagation)

**Fixture structure**:
```
tests/e2e/fixtures/
├── manifest.ts              # Defines all fixtures and their template mappings
├── generator.ts             # Auto-regeneration logic using Haiku
├── market-analysis-quicktest.md
├── business-brief-payflow.md
├── product-brief-metricsdash.md
├── product-spec-metricsdash.md
└── business-plan-payflow.md
```

**Automatic freshness checking**:
When templates change, fixtures may become stale (missing new sections, outdated structure). The E2E setup automatically:
1. Compares fixture modification times against corresponding templates
2. Regenerates stale fixtures using Haiku with seed data from the manifest
3. Logs regeneration activity during test setup

This prevents false negatives from template/fixture drift.

**Adding a new fixture**:
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
2. Run the E2E tests — the fixture will be auto-generated
3. Or manually create `fixtures/my-document.md` matching the template structure

**Using fixtures in tasks**:
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

## Project Structure

```
kickoff/
├── plugin/                       # Plugin root directory
│   ├── .claude-plugin/
│   │   └── plugin.json           # Plugin manifest
│   ├── agents/
│   │   ├── business-writer.md    # Autonomous document generation with methodology skills
│   │   └── researcher.md         # Market research and competitive analysis
│   ├── commands/
│   │   ├── config.md             # Configuration management
│   │   ├── create-repo.md        # Git repository creation
│   │   ├── generate-docs.md      # Document generation orchestration
│   │   ├── init.md               # Project initialization
│   │   ├── name-startup.md       # Startup naming workflow
│   │   └── status.md             # Status display
│   ├── skills/
│   │   ├── challenging-assumptions/  # SKEPTIC MODE critique workflow
│   │   │   ├── SKILL.md
│   │   │   └── references/domains/
│   │   │       ├── execution.md      # Execution feasibility challenges
│   │   │       ├── financials.md     # Financial assumption challenges
│   │   │       ├── market.md         # Market assumption challenges
│   │   │       ├── problem.md        # Problem definition challenges
│   │   │       └── solution.md       # Solution approach challenges
│   │   ├── gathering-input/      # Interactive user input collection
│   │   │   ├── SKILL.md
│   │   │   └── references/
│   │   │       ├── brand-brief-topic.md      # Brand brief questions
│   │   │       ├── business-brief-topic.md   # Business brief questions
│   │   │       └── product-brief-topic.md    # Product brief questions
│   │   ├── generating-documents/ # Main entry point for document generation
│   │   │   ├── SKILL.md          # State-aware routing, workflow orchestration
│   │   │   ├── references/
│   │   │   │   ├── internal-workflow.md   # Document generation flow
│   │   │   │   └── external-workflow.md   # Pandoc export flow
│   │   │   ├── scripts/
│   │   │   │   └── export-docx.mjs   # Cross-platform export script
│   │   │   └── assets/
│   │   │       ├── templates/
│   │   │       │   ├── brand-brief.md
│   │   │       │   ├── business-brief.md
│   │   │       │   ├── business-plan.md
│   │   │       │   ├── go-to-market-strategy.md
│   │   │       │   ├── ip-search.md
│   │   │       │   ├── market-analysis.md
│   │   │       │   ├── pitch-deck.md
│   │   │       │   ├── product-brief.md
│   │   │       │   ├── product-spec.md
│   │   │       │   └── technical-requirements.md
│   │   │       └── pandoc-templates/
│   │   │           ├── README.md
│   │   │           ├── reference.docx
│   │   │           └── reference.pptx
│   │   ├── naming-business/      # Startup naming workflow
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   │   └── naming-phases.md
│   │   │   └── scripts/
│   │   │       └── check-domain.mjs
│   │   ├── researching-markets/  # Market research methodology
│   │   │   └── SKILL.md
│   │   ├── researching-repos/    # Repository analysis methodology
│   │   │   └── SKILL.md
│   │   ├── synthesizing-content/ # Content synthesis methodology
│   │   │   └── SKILL.md
│   │   └── writing-content/      # Writing methodology and quality standards
│   │       └── SKILL.md
│   ├── shared-references/        # Cross-component reference documents
│   │   ├── config-resolution.md
│   │   ├── skeptic-mode-structure.md
│   │   └── user-interaction-patterns.md
│   ├── shared-scripts/           # Cross-platform utility scripts
│   │   └── rename-path.mjs
│   └── LICENSE
├── docs/
│   ├── component-architecture/   # General plugin architecture principles
│   ├── kickoff-architecture.md   # Kickoff-specific architectural patterns
│   └── development.md            # This file
├── tests/
│   ├── static/                   # Fast validation tests
│   └── e2e/                      # Model quality evaluation tests
│       ├── *.e2e.ts              # Individual feature test files
│       ├── tasks/                # Test task definitions
│       ├── graders/              # Code-based and model-based graders
│       ├── fixtures/             # Pre-generated documents for testing
│       ├── test-runner.ts        # Shared test wrapper
│       ├── utils.ts              # Shared utilities
│       └── transcripts/          # API response logs (gitignored)
└── package.json
```kickoff/
├── .claude-plugin/
│   └── plugin.json               # Plugin manifest
├── agents/                       # Agent personas
│   └── business-writer.md        # Autonomous document generation with methodology skills
├── commands/                     # Utility commands only
│   ├── config.md                 # Configuration management
│   ├── init.md                   # Orchestration/setup
│   ├── status.md                 # Display status
│   └── create-repo.md            # Git side effects
├── docs/
│   ├── component-architecture/   # General plugin architecture principles
│   ├── kickoff-architecture.md   # Kickoff-specific architectural patterns
│   └── development.md            # This file
├── skills/
│   ├── generating-documents/     # Main entry point for all doc generation
│   │   ├── SKILL.md              # State-aware routing, user prompts
│   │   ├── references/
│   │   │   ├── internal-workflow.md   # Document generation flow
│   │   │   └── external-workflow.md   # Pandoc export flow
│   │   ├── scripts/
│   │   │   └── export-docx.mjs   # Cross-platform export script
│   │   └── assets/
│   │       ├── templates/        # 10 markdown document templates
│   │       └── pandoc-templates/ # Pandoc reference documents (reference.docx/pptx)
│   ├── brainstorming-ideas/      # Methodology skill (preloaded by business-writer)
│   ├── researching-markets/      # Methodology skill (preloaded by business-writer)
│   ├── writing-content/          # Methodology skill (preloaded by business-writer)
│   ├── synthesizing-content/     # Methodology skill (preloaded by business-writer)
│   ├── challenging-assumptions/  # SKEPTIC MODE (separate workflow)
│   │   ├── SKILL.md
│   │   └── references/domains/   # 5 challenge domain files
│   └── naming-business/          # Routes rename vs naming exercise
├── tests/
│   ├── static/                   # Fast validation tests
│   └── e2e/                      # Model quality evaluation tests
│       ├── *.e2e.ts              # Individual feature test files
│       ├── tasks/                # Test task definitions
│       ├── graders/              # Code-based and model-based graders
│       ├── fixtures/             # Pre-generated documents for testing
│       ├── test-runner.ts        # Shared test wrapper
│       ├── utils.ts              # Shared utilities
│       └── transcripts/          # API response logs (gitignored)
└── package.json
```

See [component-architecture/README.md](component-architecture/README.md) for details on component responsibilities and interaction patterns, and [kickoff-architecture.md](kickoff-architecture.md) for Kickoff-specific patterns.

---

## Shared Scripts

The plugin includes cross-platform utility scripts in `plugin/shared-scripts/` for common file operations.

### rename-path.mjs

Cross-platform file/folder renaming utility that works on both macOS and Windows.

**Usage:**
```bash
node rename-path.mjs --from PATH --to PATH [--backup]
```

**Options:**
- `--from PATH` - Source path to rename (required)
- `--to PATH` - Destination path (required)
- `--backup` - If destination exists, create timestamped backup before renaming (optional)

**Behavior:**
- **Without `--backup`**: Fails if destination exists (safe for folder renames where conflicts indicate errors)
- **With `--backup`**: Creates timestamped backup if destination exists (safe for file swapping where replacement is intended)

**Examples:**
```bash
# Folder rename (no backup - want to know if conflict)
node rename-path.mjs --from "old-folder" --to "new-folder"

# Safe file swap (with backup)
node rename-path.mjs --from "DRAFT-doc.md" --to "doc.md" --backup
# Creates: BACKUP-doc-20260205-143022.md if doc.md existed
```

**Use cases in plugin:**
- Document finalization (DRAFT → master with backup)
- Startup folder renaming (no backup, detect conflicts)
- Repository directory renaming (no backup, detect errors)

## Development Workflow

### Git Hooks

The project uses Husky to enforce code quality checks before commits:

**Pre-commit Hook:**
Automatically runs before every commit:
```bash
pnpm pre-commit
```

This executes:
- Static tests (`pnpm test`)
- Linting (`pnpm lint`)
- Formatting checks (`pnpm format:check`)
- Type checking (`pnpm typecheck`)

If any check fails, the commit is blocked. Fix the issues and try again.

**Bypassing hooks** (not recommended):
```bash
git commit --no-verify
```

Only bypass hooks when absolutely necessary and with explicit justification.

### Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.

**Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Used when adding a new feature or functionality to the application
- `fix`: Used for correcting a bug or issue
- `docs`: For documentation-only changes, such as README updates or user guides
- `style`: Changes that do not affect the meaning or logic of the code, such as white-space, formatting, or missing semi-colons
- `refactor`: A code change that neither fixes a bug nor adds a feature, but improves code structure or readability
- `perf`: Specifically for code changes that improve performance
- `test`: Adding missing tests or correcting existing test files
- `build`: Changes affecting the build system or external dependencies, such as npm or configuration files
- `ci`: Changes to continuous integration configuration files and scripts, such as GitHub Actions or CircleCI
- `chore`: Regular maintenance tasks that do not modify source or test files, such as updating dependencies or technical tasks
- `revert`: Used to undo a previous commit

**Examples:**
```
feat: add alignment checkpoint to writer agent

Implements periodic user confirmation during long document
generation to prevent wasted effort on wrong assumptions.

Closes #42
```

```
fix: correct section validation in market analysis template

docs: update architecture guide with new component patterns

test: add E2E coverage for challenger business plan workflow
```

### Code Quality

The project uses strict linting and formatting:

```bash
# Check for linting errors
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format all files
pnpm format

# Check formatting without changes
pnpm format:check

# Type check
pnpm typecheck
```

**Configuration:**
- **ESLint**: Strict TypeScript rules with `strictTypeChecked` and `stylisticTypeChecked`
- **Prettier**: Single quotes, 100 char width, 2 space indent
- **Key rules**: Nullish coalescing (`??` over `||`), explicit number conversions, no unused vars

**Pre-commit automation:**
These checks run automatically via Git hooks before every commit. You can also run them manually:
```bash
pnpm pre-commit
```

### Adding New Skills

1. Create a new skill directory in `skills/`:
   ```bash
   mkdir skills/my-skill-name
   touch skills/my-skill-name/SKILL.md
   ```

2. Follow the skill structure defined in [component-architecture/skills.md](component-architecture/skills.md)

3. Add tests in `tests/static/skills.test.ts`

**Key principles:**
- Skills use gerund naming convention (e.g., `generating-documents`, `brainstorming-ideas`)
- For orchestration skills invoked by commands/skills via the Skill tool, set `user-invocable: false` (do NOT set `disable-model-invocation: true` — this blocks Skill tool invocation)
- For methodology skills preloaded by agents via `skills:` frontmatter, set `user-invocable: false` and `disable-model-invocation: true`
- See existing skills like `skills/generating-documents/` for examples

### Adding New Commands

1. Create a new command file in `commands/`:
   ```bash
   touch commands/my-command.md
   ```

2. Follow the command structure defined in [component-architecture/README.md](component-architecture/README.md#commands)

3. Add tests in `tests/static/commands.test.ts`

**Key principles:**
- Commands are for utilities, orchestration, and side effects only
- Complex workflows should be implemented as Skills
- See existing commands like `commands/init.md` for examples

### Adding New Agents

1. Create a new agent file in `agents/`:
   ```bash
   touch agents/my-agent.md
   ```

2. Follow the agent structure defined in [component-architecture/agents.md](component-architecture/agents.md)

3. Add tests in `tests/static/agents.test.ts`

**Key principles:**
- Agents use role-based naming (e.g., `business-writer`)
- Agents run autonomously via Task — they cannot conduct interactive conversations
- Agents can preload methodology skills for specialized knowledge
- For interactive work, use inline skills instead of agents
- Consider if a `context: fork` skill could work instead

### Adding New Document Templates

1. Create template in `skills/generating-documents/assets/templates/`:
   ```bash
   touch skills/generating-documents/assets/templates/my-template.md
   ```

2. Follow template conventions defined in [component-architecture/README.md](component-architecture/README.md#templates)

3. Update the `generating-documents` skill if needed

4. Add tests in `tests/static/templates.test.ts`

**Key principles:**
- Templates define structure and content expectations
- Use HTML comments for guidance
- Don't include process instructions

### Adding E2E Test Tasks

1. Create task definition in `tests/e2e/tasks/`:
   ```typescript
   // tests/e2e/tasks/my-feature.ts
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

2. Export from `tests/e2e/tasks/index.ts`:
   ```typescript
   export { myFeatureTask } from './my-feature';
   // Add to allTasks array
   ```

3. Create the test file in `tests/e2e/`:
   ```typescript
   // tests/e2e/my-feature.e2e.ts
   import { myFeatureTask } from './tasks';
   import { createTaskTest } from './test-runner';

   createTaskTest(myFeatureTask);
   ```

## Continuous Integration

The project uses GitHub Actions to run CI checks on all pushes to `main` and pull requests.

### CI Checks

The CI pipeline runs the following checks via `pnpm ci:check`:

1. **Lockfile validation** — Ensures `pnpm-lock.yaml` is up-to-date (`pnpm install --frozen-lockfile`)
2. **Static tests** — Validates plugin structure, manifests, and templates (`pnpm test`)
3. **Linting** — ESLint with strict TypeScript rules (`pnpm lint`)
4. **Formatting** — Prettier check (`pnpm format:check`)
5. **Type checking** — TypeScript strict mode (`pnpm typecheck`)
6. **Security audit** — Checks for vulnerabilities at moderate level or higher (`pnpm audit --audit-level moderate`)

### Running CI Locally

You can run the full CI suite locally before pushing:

```bash
pnpm install --frozen-lockfile
pnpm ci:check
```

This runs all the same checks that CI will run, ensuring your changes will pass.

**Note**: E2E tests are not included in CI due to API costs. Run them manually before major releases.

### Plugin Distribution Sync

After CI passes on pushes to `main`, a separate workflow automatically syncs the `plugin/` directory to the distribution repository at [`lockstride/kickoff-plugin`](https://github.com/lockstride/kickoff-plugin). This enables lightweight plugin installation via HTTPS without requiring users to clone the full development repository.

**How it works:**

1. **CI completes successfully** on `main` branch
2. **Sync workflow triggers** automatically (`.github/workflows/sync-plugin.yml`)
3. **Plugin contents mirrored** to distribution repo using `rsync`
4. **Changes committed and pushed** with message format: `Sync from lockstride/kickoff@<sha>`
5. **No-op if unchanged** — workflow detects when plugin hasn't changed and exits cleanly

**Distribution repo characteristics:**

- Contains only `plugin/` directory contents at root level
- Preserves root-level `README.md` even if not in source `plugin/` directory
- Excludes development files (tests, docs, build configs)
- Maintains full git history of plugin changes

**Manual sync:**

The sync workflow can be manually triggered from the GitHub Actions UI if needed (e.g., to force a re-sync after fixing the distribution repo).

**Authentication:**

The sync workflow uses a fine-grained GitHub token stored as the repository secret `PLUGIN_DIST_DEPLOY_TOKEN` with write access to `lockstride/kickoff-plugin`.

## Type Checking

Run TypeScript type checking:

```bash
pnpm exec tsc --noEmit
```

## Local Plugin Testing

Test the plugin with Claude Code CLI:

```bash
# Point Claude to your local plugin directory
claude --plugin-dir /path/to/kickoff

# Then use commands like:
/lockstride-kickoff:config
/lockstride-kickoff:init
```

## Configuration for Development

For testing, you may want to set custom paths in `~/.lockstride/kickoff/config.json`:

```json
{
  "default": {
    "documentsRoot": "/path/to/test/docs",
    "applicationsRoot": "/path/to/test/repos",
    "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
  }
}
```

## Best Practices

1. **Follow architectural principles** - see [general-architecture.md](general-architecture.md) for component responsibilities and separation of concerns
2. **Always run static tests** before committing (`pnpm test`)
3. **Run E2E tests** before major releases or after significant template changes
4. **Type-check** your code (`pnpm exec tsc --noEmit`)
5. **Keep API keys secure** - never commit `.env` files
6. **Document template changes** - update reference solutions in E2E tasks
7. **Maintain single source of truth** - avoid duplicating guidance across components

## Guidance Placement for Document Generation

When working on document generation features, guidance must be placed in the correct location to ensure maintainability and predictable plugin behavior.

### Template Files
**Location**: `plugin/skills/generating-documents/assets/templates/*.md`

**Contains**:
- Document-specific content requirements
- Section-specific writing instructions
- What information belongs in each section
- Target length for this document type

**Example**:
```markdown
<!-- Guidance: Keep to 2-3 concise paragraphs. Emphasize unique positioning, not feature checklists. -->
```

### Methodology Skills
**Location**: `plugin/skills/writing-content/`, `researching-markets/`, `synthesizing-content/`

**Contains**:
- Universal writing principles (active voice, bullet points, specificity)
- Token efficiency tactics (tables vs prose, writing efficiency)
- Quality standards (consistency, traceability, completeness)
- Research protocols (source triangulation, confidence scoring, error handling)

**Example**: Core quality principles that apply to all documents, regardless of type.

### Agent Files
**Location**: `plugin/agents/business-writer.md`

**Contains**:
- Document type to methodology mapping
- Workflow orchestration logic
- When to apply which methodology
- How methodologies combine (primary + secondary)

**Example**: "market-analysis uses researching-markets + writing-content"

### Critical Rules

1. **Never duplicate guidance** across these locations
2. **Template comments** should reference the specific document being generated
3. **Skills** should contain reusable principles that apply to all documents
4. **Changes to one document type** should only require updating that template
5. **Workflow changes** should only require updating the agent file

**Why this matters**: Correct guidance placement ensures that document-specific changes don't affect other documents, universal principles are consistently applied, and the plugin behavior remains predictable and maintainable.

## Troubleshooting

### E2E Tests Hanging
- Check API key is valid
- Verify network connectivity to Anthropic API
- Review `tests/e2e/transcripts/*.json` for error details

### Import Errors
- Ensure `pnpm install` has been run
- Check TypeScript version compatibility

### Claude CLI Not Finding Plugin
- Verify `plugin.json` is valid JSON
- Check file paths in plugin manifest
- Use absolute path with `--plugin-dir`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Read [general-architecture.md](general-architecture.md) and [kickoff-architecture.md](kickoff-architecture.md) to understand design principles
4. Make your changes following the architectural guidelines
5. Run tests (`pnpm test` and optionally `pnpm test:e2e`)
6. Submit a pull request

**Before submitting:**
- Verify your changes follow the [general architecture guidelines](general-architecture.md)
- Ensure separation of concerns between commands, agents, and templates
- Run the [Quick Reference Checklist](general-architecture.md#quick-reference-checklist) for your component type

## Support

- **Issues**: https://github.com/lockstride/kickoff/issues
- **Email**: hello@lockstride.ai
