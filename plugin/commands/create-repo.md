---
description: Create development repository from monorepo template
argument-hint: "[StartupName] (optional)"
allowed-tools: Read Write Bash Glob AskUserQuestion
---

# Create Development Repository

Set up a development environment from the monorepo template with progressive enhancement options.

**Startup Name:** $ARGUMENTS

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`

BEFORE interacting with the user, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`

## Prerequisites

1. Configuration must exist (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for location and schema)
2. product-spec.md and technical-requirements.md must exist
3. Node.js installed (required for template download)

## Dependencies

**Required documents:**
- product-spec.md
- technical-requirements.md

## Process

### Step 1: Load Configuration and Validate

1. Read config and resolve effective values (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`):
   - `documentsPath`
   - `applicationsPath`
   - `templateRepo` (default: https://github.com/lockstride/monorepo-nuxt-base)

2. Determine startup name
3. Create slug from startup name (lowercase, hyphens, no spaces)
4. Set `repoPath` = `{applicationsPath}` (profile already includes slug in path)
5. Detect **same-path scenario**: `documentsPath == applicationsPath`

6. **Validate dependencies**:
   - Check product-spec.md exists
   - Check technical-requirements.md exists
   - If missing: Direct to `/lockstride-kickoff:spec`

### Step 2: Check Target Directory

**If same-path scenario and `generated-assets/` exists:**

**Pattern:** YES-NO-CONFIRMATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Confirm user wants to merge template with existing directory
- GUIDANCE: Explain that template files will be merged, preserving product documentation

If user confirms: proceed with merge.
If user declines: exit without changes.

**If directory exists without `generated-assets/`:**

- Ask: "Directory already exists. Overwrite, use different name, or cancel?"

### Step 3: Display Context Message

BEFORE proceeding with template download, display this message verbatim to the user:

```
You've completed the planning and documentation phase. Now you'll set up a production-ready development environment based on your chosen template repository.

What happens next:
• Download your selected application template
• Integrate your product documentation into the codebase
• Set up version control and optional GitHub repository
• Get a working development environment ready for implementation

Technical complexity ahead: From this point forward, you'll be working with actual code, development tools, and infrastructure. This is where product vision becomes software reality.

Need implementation support? If you'd prefer to work with experienced developers rather than building alone, we partner with founders to turn their vision into production-ready products. Reach out to hello@lockstride.ai to discuss your project.
```

### Step 4: Tier 1 — Download Template (Required)

**Pattern:** YES-NO-CONFIRMATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Confirm user wants to download the template
- GUIDANCE: Describe the production-ready monorepo structure benefits

If user declines: Exit with reminder of next command.

If user confirms:

Primary method:
```bash
npx degit "{templateRepo}" "{repoPath}"
```

If same-path scenario with existing `generated-assets/`:
```bash
npx degit "{templateRepo}" "{repoPath}" --force
```

**Fallback if degit fails** (no Node.js or network issues):

First, extract owner/repo from templateRepo URL:
- If templateRepo starts with `https://github.com/`, extract the owner/repo portion
- Otherwise, use templateRepo as-is (assumes short format)

```bash
curl -sL "https://github.com/{owner}/{repo}/archive/main.tar.gz" | tar -xz -C "{parentDir}"
```

Then rename the extracted directory (cross-platform):
```bash
node "${CLAUDE_PLUGIN_ROOT}/shared-scripts/rename-path.mjs" --from "{parentDir}/{repo-name}-main" --to "{repoPath}"
```

Verify `generated-assets/` is intact if same-path scenario.

### Step 5: Post-Download Setup

**If same-path scenario:**

1. **Skip doc copying** — Leave all product docs in `generated-assets/internal/`

2. **Update AGENTS.md** — Append product context section:
   ```markdown

   ## Product Context

   For product requirements and business context, see:
   - [generated-assets/internal/business-brief.md](generated-assets/internal/business-brief.md)
   - [generated-assets/internal/product-spec.md](generated-assets/internal/product-spec.md)
   - [generated-assets/internal/technical-requirements.md](generated-assets/internal/technical-requirements.md)
   ```

3. **Update .gitignore** — Add only dot files (drafts, backups):
   ```
   # Kickoff draft and backup files
   generated-assets/**/.*
   ```

**If separate paths:**

1. **Update package.json** (if exists):
   - Update name field to startup-slug

2. **Update README.md**:
   - Replace template name with startup name
   - Add link to product documentation

3. **Copy product artifacts** (using Read + Write tools for cross-platform compatibility):
   - Read `{internalPath}/product-spec.md` → Write to `{repoPath}/docs/product-spec.md`
   - Read `{internalPath}/technical-requirements.md` → Write to `{repoPath}/docs/technical-requirements.md`
   - Read `{internalPath}/brand-brief.md` → Write to `{repoPath}/docs/brand-brief.md` (skip if not found)

4. **Update AGENTS.md** — Append product context section referencing copied docs:
   ```markdown

   ## Product Context

   For product requirements and business context, see:
   - [docs/product-spec.md](docs/product-spec.md)
   - [docs/technical-requirements.md](docs/technical-requirements.md)
   - [docs/brand-brief.md](docs/brand-brief.md) (if copied)
   ```

### Step 6: Tier 2 — Git Initialization (Optional)

**Pattern:** YES-NO-CONFIRMATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Confirm user wants to initialize git
- GUIDANCE: Explain what Git is and recommend it as a safety net

If user declines: Report success and exit with instructions for manual git setup.

If user confirms:
```bash
cd "{repoPath}"
git init
git add .
```

### Step 7: Tier 3 — GitHub Remote (Optional)

First check `gh` availability:
```bash
gh auth status
```

**If gh not installed or not authenticated:**

"To create a GitHub repository, you'll need the GitHub CLI.

**What is GitHub?**
GitHub stores your code online (in the 'cloud'). This means:
- Your work is backed up if your computer fails
- You can access your code from anywhere
- Collaborators can contribute to your project
- You can deploy directly from GitHub to hosting platforms

To set this up later:
1. Install GitHub CLI: https://cli.github.com/
2. Run: `gh auth login`
3. Run this command again to continue

Your local repository is ready to use in the meantime."

Exit with success.

**If gh is available and authenticated:**

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose repository visibility or skip GitHub setup
- GUIDANCE: Explain what GitHub is and offer private, public, or skip options

If user skips: Report success and exit.

If user selects 1 or 2:
```bash
gh repo create {startup-slug} --private --source=. --remote=origin
# or --public if selected
```

Handle potential errors:
- **Repository name taken**: Ask for different name
- **Network error**: Retry or continue locally

### Step 8: Report Success

```
Development environment ready at: {repoPath}

[If same-path scenario:]
  Your product docs remain in generated-assets/internal/
  AGENTS.md has been updated to index them for AI tools

[If separate paths:]
  Product docs copied to docs/
  AGENTS.md has been updated to reference them for AI tools

[If git initialized:]
  Changes staged (not committed):
  - Template files
  - Updated package.json with project name
  - Updated README.md
  - Updated AGENTS.md with product context

[If GitHub remote created:]
  GitHub repository: https://github.com/{username}/{startup-slug}

Next steps:
1. Review the staged changes
2. Make any additional modifications
3. Commit when ready: git commit -m "Initial project setup"
[If remote:] 4. Push to your repository: git push origin main
```

## Error Handling

- **Config not found**: "Please run /lockstride-kickoff:config first."
- **Dependencies missing**: "Please run /lockstride-kickoff:spec first."
- **degit failed**: Try curl/tar fallback, then report if both fail.
- **Repo path creation failed**: "Cannot create {repoPath}. Check permissions."
- **Git init failed**: "Could not initialize git in {repoPath}. You can run git init manually."
- **gh repo create failed**: Report error and continue with local-only success.

## Slug Generation

Startup name to slug conversion:
- "My Awesome Startup" → "my-awesome-startup"
- "HealthTech AI" → "healthtech-ai"
- "Bob's Widgets" → "bobs-widgets"

Rules:
- Lowercase
- Spaces to hyphens
- Remove special characters
- Collapse multiple hyphens

## Important Notes

- **Progressive enhancement**: Each tier is optional after Tier 1
- **No auto-commit**: Changes are staged but never committed automatically
- **User control**: User reviews and commits when ready
- **Same-path support**: Full support for `documentsPath == applicationsPath`
- **Educational guidance**: Each step explains what tools do and why
