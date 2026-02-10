---
description: Show current startup progress and document status
argument-hint: "[StartupName] (optional, prompts for selection if omitted)"
allowed-tools: Read Bash Glob
---

# Startup Status

Display the current progress for a startup, showing which documents exist and the next required step.

**Startup Name:** $ARGUMENTS

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
- `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`
- `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`

## Prerequisites

Configuration must exist (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for location and schema).

## Process

### Step 1: Load Configuration

Read config file (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`) to get `default` settings and `profiles`.

### Step 2: Determine Startup

If startup name provided in arguments:
- Generate slug from startup name (lowercase, hyphens)
- Look up `profiles[slug]`
- If profile exists, use its documentsPath
- If profile doesn't exist, construct path as `{default.documentsRoot}/{slug}`
- Verify the startup directory exists

If no startup name provided:
- Read all entries from `profiles` in config
- For each profile, use documentsPath from profile OR construct as `{default.documentsRoot}/{slug}` (slug = profile key)
- Filter to only valid profiles (directory exists)
- If no valid profiles exist, show error and exit
- If only one valid profile exists, use that startup automatically
- If multiple valid profiles exist:
  - Display a multiple choice question: "Which startup would you like to view the status for?"
  - List each startup using `profile.displayName` (numbered 1, 2, 3, etc.)
  - Wait for user to select one option (must be a single selection)
  - Use the selected startup and its profile config values

### Step 3: Gather Status

For the startup directory (from profile's documentsPath):

1. Check if `generated-assets/internal/` exists
2. List all .md files in that directory
3. Check for DRAFT-*.md files (incomplete reviews)
4. Check if `generated-assets/external/` exists and list PDF files

### Step 3.5: DRAFT Detection

For each document type, check for DRAFT-{document-type}.md:

- If DRAFT exists:
  - Note in status display: "⚠️ Incomplete review: DRAFT-{document-type}.md"
  - Offer: "Resume review? (See REVIEW-LOOP pattern in `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`)"

- If master exists (no DRAFT):
  - Mark as complete in status display

- If neither exists:
  - Mark as not started

### Step 3.6: Validate Workflow Consistency

Validate required document order and surface gaps:

- Required order: business-brief → market-analysis → brand-brief → product-brief → product-spec → technical-requirements
- If a downstream required document exists but an upstream required document is missing, add a warning:
  - Example: "product-brief.md exists, but brand-brief.md is missing."
  - Recommend running the missing upstream command first

### Step 4: Display Status

Show comprehensive status. Use `profile.displayName` for the startup name:

```
═══════════════════════════════════════════════════════════════
  LOCKSTRIDE KICKOFF STATUS
═══════════════════════════════════════════════════════════════

  Startup:  {profile.displayName}
  Location: {documentsPath}

───────────────────────────────────────────────────────────────
  INTERNAL DOCUMENTS (generated-assets/internal/)
───────────────────────────────────────────────────────────────

  Required Documents:
  [✅] business-brief.md         (created: Jan 15, 2024)
  [✅] market-analysis.md        (created: Jan 16, 2024)
  [⚠️] brand-brief.md            (DRAFT in review) ← RESUME REVIEW
  [⬜] product-brief.md          ← NEXT REQUIRED
  [⬜] product-spec.md
  [⬜] technical-requirements.md

  Optional Documents:
  [⬜] ip-search.md
  [⬜] go-to-market-strategy.md
  [⬜] business-plan.md
  [⬜] pitch-deck.md

───────────────────────────────────────────────────────────────
  EXTERNAL DOCUMENTS (generated-assets/external/)
───────────────────────────────────────────────────────────────

  [⬜] No external documents generated yet

  Run /lockstride-kickoff:generate-external to create shareable PDFs.

───────────────────────────────────────────────────────────────
  NEXT STEP
───────────────────────────────────────────────────────────────

  → Run /lockstride-kickoff:product to create your product brief

───────────────────────────────────────────────────────────────
  WARNINGS
───────────────────────────────────────────────────────────────

  [⬜] None

═══════════════════════════════════════════════════════════════
```

### Step 5: Determine Next Step

Based on document existence, determine and display the next step:

| If Missing | Next Command | Message |
|------------|--------------|---------|
| business-brief | `/lockstride-kickoff:init` | Start with brainstorming |
| market-analysis | `/lockstride-kickoff:market` | Conduct market research |
| brand-brief | `/lockstride-kickoff:brand` | Define brand identity |
| product-brief | `/lockstride-kickoff:product` | Define product vision |
| product-spec | `/lockstride-kickoff:spec` | Generate development handoff |
| All required complete | `/lockstride-kickoff:create-repo` | Ready for development! |

## Status Icons

- `[✅]` - Document exists (master file)
- `[⚠️]` - DRAFT exists (incomplete review)
- `[⬜]` - Document not created
- `← NEXT REQUIRED` - Indicates next required step
- `← RESUME REVIEW` - Indicates DRAFT awaiting review
- `(optional)` - Document is optional

## Error Handling

- **No startups found**: "No startups found in config. Run /lockstride-kickoff:init to begin."
- **Startup not found**: "Startup '{name}' not found in config profiles. Available startups: {list}"
- **Startup directory missing**: "Startup '{name}' profile exists but directory is missing at {path}. Re-initialize or update the profile."
- **Config not found**: "Please run /lockstride-kickoff:config first."
