---
name: naming-business
description: Use when user wants to name or rename their startup. Conducts interactive naming exercises or simple renames directly in the current context.
user-invocable: false
allowed-tools: Read Write AskUserQuestion Bash Grep WebSearch
---

# Naming Business

Interactive skill for naming startups. Runs directly in the parent context (not as a subagent) to enable user interaction via AskUserQuestion.

**Execution context**: This skill handles all naming work inline — no agent delegation. For detailed naming exercise phases, see `references/naming-phases.md`.

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`

BEFORE interacting with the user, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`

## Prerequisites

Configuration must exist (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for location and schema). If not found, direct user to run `/lockstride-kickoff:config` first.

## Decision Logic

### Step 1: Determine Current State

1. Read config file (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`) to get `documentsPath`
2. Determine startup name (from args or prompt)
3. Check if `{internalPath}/.naming-exercise.md` exists (hidden session file)
4. Check if current name appears to be a code name (placeholder)

### Step 2: Assess Intent

**If no naming exercise exists:**

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose naming approach (full exercise, simple rename, or brainstorm)

**If naming exercise exists:**

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose to resume, start fresh, use shortlist, or simple rename
- GUIDANCE: Mention that a previous naming exercise was found

### Step 3: Route to Appropriate Handler

**For full naming exercise or resume:**
- Run the naming exercise directly in this context (no agent delegation)
- Read `references/naming-phases.md` for detailed phase instructions
- Maintain session state in `{internalPath}/.naming-exercise.md`
- Follow the interactive 5-phase process with user

**For simple rename:**
- Handle directly in this skill
- Follow the Simple Rename Protocol below

**For using current shortlist:**
- Read the `.naming-exercise.md` file
- Present the shortlist
- Confirm selection
- Execute rename if confirmed

---

## Naming Exercise (Inline)

When conducting a full naming exercise, read `references/naming-phases.md` and follow the phases:

1. **Phase 1: Preference Gathering** — Collect style, emotional, imagery, sonic, and constraint preferences
2. **Phase 2: Candidate Generation** — Generate 8-12 candidates across naming strategies
3. **Phase 2.5: Tagline Pivot** (optional) — If stuck, work on taglines to unlock flow
4. **Phase 3: Validation** — Check domains, trademarks, social handles for promising candidates
5. **Phase 4: Refinement** — Stress test shortlisted names
6. **Phase 5: Selection** — Present final comparison, execute migration if selected

**Session State**: After each significant exchange, update `{internalPath}/.naming-exercise.md` per the structure in `references/naming-phases.md`.

**Goal**: Help the founder either land on a name they're confident in OR provide a clear "not ready yet" with documented progress that can be resumed later.

## Simple Rename Protocol

When the user wants a simple rename (not a full exercise):

### Step 1: Gather New Name

If not provided as argument:
- Ask: "What would you like to rename the startup to?"

### Step 2: Confirm Scope

"Renaming from **{OLD_NAME}** to **{NEW_NAME}**.

This will:
1. Update all generated documents in `internal/`
2. Rename the project folder from `{old-slug}` to `{new-slug}`
3. Update config profile key if one exists

Proceed?"

### Step 3: Execute Rename

1. **Find and replace in documents:**
   - Use Grep to find all occurrences of old name
   - Replace in each document found

2. **Rename folder** (cross-platform):
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/shared-scripts/rename-path.mjs" \
     --from "{old-documentsPath}" \
     --to "{new-documentsPath}"
   ```

3. **Update config profile (if exists):**
   - Read config file (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`)
   - If `profiles[old-slug]` exists, rename to `profiles[new-slug]`
   - Update `displayName` to new name
   - Update `documentsPath` and `applicationsPath` to use new slug
   - **Set `isCodeName: false`** (since user is selecting a real name)
   - Write updated config

4. **Report results:**
   - Documents updated: [count]
   - Folder renamed: `{old-slug}` → `{new-slug}`
   - Profile updated: [yes/no]

## Slug Generation

Generate slug from startup name:
- Lowercase
- Replace spaces with hyphens
- Remove special characters (apostrophes, accents, etc.)
- Collapse multiple hyphens
- Trim leading/trailing hyphens

Examples:
- "PayFlow Pro" → `payflow-pro`
- "O'Brien's App" → `obriens-app`
- "AI-Powered Tool" → `ai-powered-tool`

## Error Handling

- **Folder already exists:** "A folder named '{new-slug}' already exists. Choose a different name or resolve the conflict."
- **No documents found:** "No documents found to update. The rename will only affect the folder."
- **Config write failed:** "Could not update config profile. Folder and documents were renamed successfully."
