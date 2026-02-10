---
description: Initialize a new startup or resume an existing one
argument-hint: "[StartupName] (optional)"
allowed-tools: Read Write Bash Grep Glob Task AskUserQuestion TodoWrite Skill
---

# Initialize Startup

Initialize a new startup or resume an existing one. This command orchestrates the full startup workflow.

**Startup Name:** $ARGUMENTS

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`

BEFORE interacting with the user, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`

## Prerequisites

Configuration should exist (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for location and schema). If not found, this command will automatically trigger the configuration setup flow.

## Process

### Step 1: Validate Configuration

1. Read config file (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`)
2. Verify `default.documentsRoot` exists
3. If config missing or invalid:
   - Inform user: "No configuration found. Let me set that up first, then we'll continue with your startup."
   - Run `/lockstride-kickoff:config --update` to set up configuration
   - After config is saved successfully, run `/lockstride-kickoff:init` passing the Startup Name argument if one is set, and continue to Step 2

Note: Effective config values are resolved in Step 2.5 after startup name is known. See `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for Config Resolution pattern.

### Step 2: Determine Startup

#### If Startup Name Provided in Arguments

Validate and use it. Proceed to Step 2.5.

#### If NO Startup Name Provided

##### 2a. Check Known Startups

Read `profiles` from config. For each profile entry:
1. Use the documentsPath directly from the profile, OR if not set, construct it as `{default.documentsRoot}/{slug}` (slug = profile key)
2. Check if directory exists
3. Categorize as **valid** (directory exists) or **stale** (directory missing)

##### 2b. Handle Stale Entries

If any stale profiles found, warn and offer cleanup.

**Pattern:** YES-NO-CONFIRMATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Confirm user wants to remove stale profile entries from config
- GUIDANCE: List stale startups with displayName and expected path before asking

If user confirms "yes": Remove stale profile entries from config.json and save.

##### 2c. Show Startup Selection

After stale cleanup, evaluate remaining valid startups:

**If no valid startups exist:**
- Proceed to **Create New Startup** flow (Step 2d)

**If valid startups exist (one or more):**

For each valid startup, determine next required document by checking `generated-assets/internal/` for these files in order:
1. `business-brief.md`
2. `market-analysis.md`
3. `brand-brief.md`
4. `product-brief.md`
5. `product-spec.md`
6. `technical-requirements.md`

The first missing required document is the "next step". If all exist, next step is "(complete)".

**ALWAYS present the selection menu, even if only one startup exists.**

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user select from existing startups or create new
- GUIDANCE: Show each startup using `profile.displayName` with its next required document
- CONSTRAINT: "Create new startup" must be numbered as the last option

- If user selects an existing startup → Set as current startup, proceed to Step 3
- If user selects "Create new startup" → Proceed to **Create New Startup** flow (Step 2d)

##### 2d. Create New Startup

**Pre-work:** Generate a quirky code name before presenting the menu:
- Format: 1-3 words, ALL CAPS, nonsensical/abstract
- Pattern: ADJECTIVE + NOUN or COLOR + OBJECT
- Examples: PURPLE WALRUS, DANCING NEBULA, NEON PLATYPUS, VELVET ANCHOR, COSMIC PRETZEL
- Do not use the example names. Generate your own unique names every time
- Must be unique enough for easy search-and-replace later
- Avoid real brand names or common phrases

**Pattern:** SELECTION-WITH-CUSTOM-INPUT — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user select from available options or type their own startup name
- GUIDANCE: Always show the generated code name. If $ARGUMENTS contains a startup name, also offer it as the first option. Include "Try another quirky name" option that regenerates and re-presents this menu
- CONSTRAINT: A name is required — do not allow skip or proceed without one. When using any generated code name, set `is_code_name: true` for the brand workflow

**Menu structure:**
- If $ARGUMENTS provided: Show "Use {argument name}", "Use {generated name}", "Try another quirky name", and auto "Type something"
- If no $ARGUMENTS: Show "Use {generated name}", "Try another quirky name", and auto "Type something"

**If user selects a generated code name OR types a custom code name:**
- Set `is_code_name: true` for the brand workflow
- The naming exercise will be offered during the brand brief phase

**If user selects "Try another quirky name":**
- Generate a new quirky code name
- Re-present this same menu with the new name

**If user types a startup name:**
- Validate name (no filesystem-invalid characters: `/ \ : * ? " < > |`)
- Proceed with user-provided name

### Step 2.5: Configure and Save Profile (New Startups Only)

After determining the startup name, check if this is a new startup (no existing directory or empty directory). If so, offer to customize configuration and save the profile.

**Resolve effective config:**

Follow `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`:
1. Generate slug from startup name — used for both profile key AND directory name
2. Check if `profiles[slug]` exists in config
3. If profile exists, use its flattened values directly
4. If profile doesn't exist, prepare to create new profile using default values as templates

**Present configuration:**

**Pattern:** TEXT-CONTINUATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Confirm user is ready to proceed with shown config, or wants to customize
- GUIDANCE: Display effective config values (documentsPath, applicationsPath, templateRepo) before prompting

**If user types "yes" or confirms:**

Save profile following `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` and report: "Profile saved for '{StartupName}'." Continue to Step 3.

**If user types "customize" (or similar):**

Prompt for each value (show current as default):

"Documents path for {StartupName}:" (current: {default.documentsRoot}/{slug})
"Applications path for {StartupName}:" (current: {default.applicationsRoot}/{slug})
"Template repo for {StartupName}:" (current: {effective.templateRepo})

After collecting values, save profile following `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` and report: "Profile saved for '{StartupName}'." Continue to Step 3.

### Step 3: Welcome Message

Display a welcome message to orient the user. The message varies based on whether this is their first time using Kickoff.

**Determine message type:**
- **First-time user**: No profiles exist in config, OR this is a brand new startup and user has never completed a startup before
- **Returning user**: Profiles exist and user is resuming an existing startup or creating an additional startup

**For first-time users:**
```
Welcome to Lockstride Kickoff!

Instead of staring at blank documents or juggling fragmented notes, you get a structured conversation that asks the right questions in the right order. As you answer, Kickoff builds your business artifacts progressively — each document informed by what came before.

In hours, not weeks, you'll move from rough concept to:
• Rigorously researched market analysis with competitive positioning
• Thoughtfully designed brand identity with naming and domain validation
• Clearly articulated product specifications ready for development handoff
• Battle-tested ideas through optional VC-style stress testing (SKEPTIC MODE)

Every document follows proven templates refined across real startups. When you're ready to build, Kickoff hands off clean, structured requirements directly into a development-ready monorepo.

Kickoff doesn't replace your judgment — it amplifies it by handling the tedious parts so you can focus on strategic decisions only you can make.

Let's get started...
```

**For returning users (resuming existing startup):**
```
Welcome back to Lockstride Kickoff!

Kickoff guides you through structured conversations that build business artifacts progressively — from market research to product specifications, maintaining consistency across documents automatically.

Let's see where we left off...
```

**For returning users (new startup):**
```
Welcome back to Lockstride Kickoff!

Kickoff guides you through structured conversations that build business artifacts progressively — from market research to product specifications, maintaining consistency across documents automatically.

Let's get started...
```

### Step 4: Detect Scenario

Check the startup directory using the documentsPath from the profile:

**Scenario A - Greenfield (no directory or empty):**
- Directory doesn't exist OR
- Directory exists but has no `generated-assets/internal/` folder

**Scenario B - Resume (Lockstride Kickoff assets exist):**
- `generated-assets/internal/` exists with at least `business-brief.md`

**Scenario C - Brownfield (existing content, no Lockstride Kickoff assets):**
- Directory exists with files
- No `generated-assets/internal/` folder OR it's empty

### Step 5: Execute Scenario

#### Scenario A: Greenfield

1. Create directory structure using documentsPath from profile:
   ```
   {documentsPath}/
     generated-assets/
       internal/
       external/
   ```

2. Create README.md in `generated-assets/internal/` explaining:
   - Files are managed by Lockstride Kickoff
   - Manual edits are supported — use "Reload document" to sync
   - Document sequence matters
   - Use `/generating-documents {doc-type} external` for shareable versions

3. Invoke the `generating-documents` skill with `business-brief` and pre-verified context to skip redundant state checks:
   ```
   Context: {
     startup_name: "{StartupName}",
     internal_path: "{documentsPath}/generated-assets/internal",
     document_state: "new",
     dependencies_met: true
   }
   ```

4. The skill handles document generation, review loops, and continuation prompts. When it completes, display final status.

#### Scenario B: Resume

1. Read all documents in `generated-assets/internal/`
2. Display status (use status display format below)
3. Identify next required step in workflow
4. Invoke `generating-documents` skill with the next document type and pre-verified context:
   ```
   Context: {
     startup_name: "{StartupName}",
     internal_path: "{documentsPath}/generated-assets/internal",
     document_state: "new" | "draft_exists",  // based on DRAFT presence
     dependencies_met: true
   }
   ```

5. The skill handles document generation, review loops, and continuation prompts.

#### Scenario C: Brownfield

1. Scan directory for existing content (business plans, market research, etc.)
2. Display found files and ask if user wants to synthesize into Lockstride Kickoff format
3. If yes, invoke `generating-documents` skill to process documents in dependency order

---

## Workflow Transitions

| After | Next Required | Optional First |
|-------|---------------|----------------|
| business-brief | market-analysis | — |
| market-analysis | brand-brief | ip-search |
| ip-search | brand-brief | — |
| brand-brief | product-brief | — |
| product-brief | product-spec | gtm, plan |
| gtm | product-spec | plan |
| plan | product-spec | deck |
| product-spec | (complete) | create-repo |

For optional documents, explain the option:
- **IP Search**: "Recommended if your solution involves patentable technology"
- **GTM**: "Recommended if you're planning a launch strategy"
- **Business Plan**: "Recommended for fundraising"
- **Pitch Deck**: "Recommended for investor presentations"

Use `/generating-documents` skill to generate any document in the workflow.

---

## Status Display Format

```
Startup: {StartupName}
Location: {documentsPath}

Document Status:
  ✅ business-brief.md
  ✅ market-analysis.md
  ⬜ ip-search.md (optional)
  ✅ brand-brief.md
  ⬜ product-brief.md ← NEXT
  ⬜ go-to-market-strategy.md (optional)
  ⬜ business-plan.md (optional)
  ⬜ pitch-deck.md (optional)
  ⬜ product-spec.md
  ⬜ technical-requirements.md

Next step: Run /generating-documents product-brief to create product brief
```

---

## Error Handling

- **Config not found**: Automatically trigger configuration setup (see Step 1), then resume init flow
- **Config setup fails**: "Configuration setup was not completed. Please run /lockstride-kickoff:config --update to try again."
- **Invalid startup name**: "Startup name cannot contain: / \\ : * ? \" < > |"
- **Permission denied**: "Cannot create directory. Check permissions for {path}"
