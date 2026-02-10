---
description: Configure Lockstride Kickoff paths and view/manage startup profiles
argument-hint: "[--show | --update | --profile <name>]"
allowed-tools: Read Write Bash AskUserQuestion
---

# Configure Lockstride Kickoff

Set up default paths, view configuration, and manage per-startup profiles.

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`

## Configuration Location

Configuration is stored at: `~/.lockstride/kickoff/config.json`

## Config Schema

For complete schema documentation, field descriptions, profile structure, and resolution rules, see:
`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`

**Quick Reference:**

```json
{
  "default": {
    "documentsRoot": "/path/to/docs",
    "applicationsRoot": "/path/to/repos",
    "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
  },
  "profiles": {
    "startup-slug": {
      "displayName": "Startup Name",
      "isCodeName": false,
      "documentsPath": "/path/to/docs/for/startup-slug",
      "applicationsPath": "/path/to/applications/for/startup-slug",
      "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
    }
  }
}
```

**Structure details:** See `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for complete schema documentation, field requirements, and resolution rules.

## Process

### Mode Detection

Determine mode from arguments:
- No args or `--show`: Display Mode
- `--update`: Update Mode
- `--profile <name>`: Profile Mode

---

### Display Mode (default)

Show complete configuration with file location.

**Step 1: Read Configuration**

Read config file from location specified in `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`. If not found, show error and direct to `--update` mode.

**Step 2: Display Configuration**

```
Lockstride Kickoff Configuration
════════════════════════════════

File: ~/.lockstride/kickoff/config.json
      (edit directly or use commands below)

Default Settings:
  Documents root:    /Users/name/Startups
  Applications root: /Users/name/dev
  Template repo:     https://github.com/lockstride/monorepo-nuxt-base

Profiles (2):
  Client Project X (client-project-x):
    Documents path:    /clients/x/planning/client-project-x
    Applications path: /clients/x/code/client-project-x
    Template repo:     https://github.com/lockstride/monorepo-nuxt-base
  
  Personal Idea (personal-idea):
    Documents path:    /Users/name/Startups/personal-idea
    Applications path: ~/personal/ideas/personal-idea
    Template repo:     https://github.com/lockstride/monorepo-nuxt-base

Commands:
  /lockstride-kickoff:config --update         Update default settings
  /lockstride-kickoff:config --profile NAME   Create/update profile for NAME
```

If no profiles exist, show:
```
Profiles: None
  Profiles are created automatically when you customize paths during /lockstride-kickoff:init
  Or create manually with: /lockstride-kickoff:config --profile NAME
```

---

### Update Mode

Update default configuration values.

**Step 1: Check for Existing Configuration**

Read config file (location in `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`). If found, display current default values.

**Step 2: Gather Configuration**

**For documentsRoot:**

**Pattern:** SELECTION-WITH-CUSTOM-INPUT — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Collect the base directory where startup documents should be stored
- GUIDANCE: Offer ~/Startups, ~/Documents/Startups, and {cwd} as options
- CONSTRAINT: Path must be absolute or start with ~

**For applicationsRoot:**

**Pattern:** SELECTION-WITH-CUSTOM-INPUT — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Collect the base directory where code repositories will be created
- GUIDANCE: Offer the path used for documentsRoot, ~/development (if the resolved path is different than the path used for documentsRoot or ~/Startups), and {cwd} (if the resolved path is different than the other two options)
- CONSTRAINT: Path must be absolute or start with ~

**For templateRepo (optional):**

**Pattern:** TEXT-CONTINUATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Collect template repository preference or use default
- GUIDANCE: Explain what a template repo is (a GitHub repository containing starter code/structure for new projects), show the default value, and ask user to proceed or provide different repo
- CONSTRAINT: Custom values must be in format owner/repo

**Step 3: Validate Paths**

For each path:
1. Expand `~` to full home directory path (use `$HOME` on Unix/Mac, `%USERPROFILE%` on Windows)
2. Check if directory exists using LS tool (cross-platform)
3. If directory doesn't exist:
   - Ask user: "Directory doesn't exist. Create it?"
   - If yes, create by writing a placeholder file (Write tool auto-creates parent directories)
   - If no, ask for different path

**Step 4: Save Configuration**

1. Write config file to location from `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`
2. Preserve existing profiles if config exists
3. Write config.json with updated default block

**Step 5: Confirm**

Display the saved configuration and confirm success:

```
Configuration saved to ~/.lockstride/kickoff/config.json

Default Settings:
  Documents root:    /path/to/docs
  Applications root: /path/to/repos
  Template repo:     https://github.com/lockstride/monorepo-nuxt-base

You can now use /lockstride-kickoff:init to begin a new startup.
```

---

### Profile Mode

Create or update a profile for a specific startup.

**Step 1: Determine Startup**

Generate slug from startup name and preserve original as `displayName`. See `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for slug generation rules.

**Step 2: Check Existing Profile**

If profile exists for this slug, display current values.

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose to update, delete, or cancel profile changes
- GUIDANCE: Display current profile values before presenting options

**Step 3: Collect Values**

For each field, ask with default shown:

"Documents path for {name}:" (default: {default.documentsRoot}/{slug})
"Applications path for {name}:" (default: {default.applicationsRoot}/{slug})
"Template repo for {name}:" (default: {default.templateRepo})

**Step 4: Save Profile**

Save profile following `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`.

**Step 5: Confirm**

```
Profile 'Client Project' (client-project) saved.

  Documents path:    /clients/planning/client-project
  Applications path: /clients/code/client-project
  Template repo:     https://github.com/lockstride/monorepo-nuxt-base
```

---

## Error Handling

- **Config not found (display/profile mode)**: "No configuration found. Run /lockstride-kickoff:config --update first."
- **Permission denied**: Suggest running with appropriate permissions or choosing a different path
- **Invalid path format**: Show example of valid paths
- **Path on cloud sync**: Warn about potential sync issues but allow
