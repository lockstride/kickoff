# Config Resolution

Pattern for resolving effective configuration values by merging profile overrides with defaults.

---

## When to Use

Any command or skill that needs:
- `documentsRoot` / `documentsPath` — Where startup documents/assets are stored
- `applicationsRoot` / `applicationsPath` — Where code repositories are created
- `templateRepo` — GitHub template repository
- `displayName` — Original startup name with preserved casing (from profile)

---

## Config File Location

Configuration is stored at: `~/.lockstride/kickoff/config.json`

**Path Handling:** Expand `~` to full home directory path before file operations. Use `$HOME` on Unix/Mac or `%USERPROFILE%` on Windows for cross-platform compatibility.

**Permission Request:** Before reading or writing any config files, make a tool call (Read or Write) that explicitly requests access to the `~/.lockstride/kickoff/` directory. This prevents repeated permission prompts during config operations.

Example: Attempt to read `~/.lockstride/kickoff/config.json` as your first config operation to trigger a single directory-level permission request.

---

## Config Schema

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
      "documentsPath": "/path/to/docs/for/startup-slug",
      "applicationsPath": "/path/to/applications/for/startup-slug",
      "templateRepo": "user/custom-template"
    }
  }
}
```

### Default Block

All fields are required in the default block. These values are ONLY used as templates during initial profile creation:
- `documentsRoot`: Base directory where startup documents and assets are created
- `applicationsRoot`: Base directory where code repositories are created
- `templateRepo`: GitHub template repository (format: `owner/repo`)

**Important:** Defaults are NOT used for resolution. They only provide initial values when creating new profiles. All profiles must store complete, flattened values.

### Profile Block

Each profile uses the startup slug as its key. **All path and configuration fields must be explicitly saved on each profile** to ensure changes to defaults don't affect existing projects.

**Required fields:**
- **`displayName`**: Original startup name with preserved casing (e.g., "MetricsDash", "PURPLE WALRUS")
  - Always use displayName for user-facing output, never the slug
  - Every profile must have this field
- **`documentsPath`**: Complete path to startup documents (includes slug subdirectory)
- **`applicationsPath`**: Complete path to startup application code (includes slug subdirectory)
- **`templateRepo`**: GitHub template repository URL

**Optional fields:**
- `isCodeName`: Boolean flag indicating if the name is a generated code name
  - Set to `true` when user selects a generated code name (e.g., "PURPLE WALRUS")
  - Set to `false` or omit when user provides their own name
  - Used by brand-brief generation to determine naming exercise prompt wording
  - Automatically updated to `false` when naming exercise completes with a real name

**Slug vs displayName:**
- Slug: Internal use (directory names, profile keys) — e.g., `metricsdash`
- displayName: User-facing output (messages, prompts, titles) — e.g., "MetricsDash"

---

## Resolution Steps

1. Read config file: `~/.lockstride/kickoff/config.json`
2. Get startup name (from args or prompt)
3. Generate slug from name (see Slug Generation below)
4. Look up `profiles[slug]`
5. Use profile values directly (no merging with defaults)
6. Extract all required fields: `displayName`, `documentsPath`, `applicationsPath`, `templateRepo`
7. Use displayName for all user-facing output, slug for file paths

**Important:** Profiles are self-contained. Do NOT merge with default values during resolution. Defaults are only used as templates when creating new profiles.

---

## Slug Generation

Convert startup name to kebab-case slug for profile keys and directory names.

**Rules:**
- Lowercase all characters
- Replace spaces with hyphens
- Remove special characters (apostrophes, accents, etc.)
- Collapse multiple hyphens to single hyphen
- Trim leading/trailing hyphens

**Examples:**

| Startup Name | Slug |
|--------------|------|
| "My Awesome Startup" | `my-awesome-startup` |
| "MetricsDash" | `metricsdash` |
| "Bob's Widgets" | `bobs-widgets` |
| "Café Société" | `cafe-societe` |

---

## Profile Structure Example

All profiles must contain complete, flattened values. Here's a typical configuration with multiple profiles:

```json
{
  "default": {
    "documentsRoot": "~/Startups",
    "applicationsRoot": "~/dev",
    "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
  },
  "profiles": {
    "purple-walrus": {
      "displayName": "PURPLE WALRUS",
      "isCodeName": true,
      "documentsPath": "~/Startups/purple-walrus",
      "applicationsPath": "~/dev/purple-walrus",
      "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
    },
    "client-project": {
      "displayName": "Client Project",
      "documentsPath": "~/clients/planning/client-project",
      "applicationsPath": "~/clients/code/client-project",
      "templateRepo": "https://github.com/user/custom-template"
    },
    "metricsdash": {
      "displayName": "MetricsDash",
      "documentsPath": "~/Startups/metricsdash",
      "applicationsPath": "~/dev/metricsdash",
      "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
    }
  }
}
```

**Key points:**
- All profiles contain all required fields (displayName, documentsPath, applicationsPath, templateRepo)
- Values are explicitly saved even when they match defaults (e.g., templateRepo in purple-walrus and metricsdash)
- Each profile is self-contained and stable regardless of default value changes
- Optional fields like isCodeName are included when relevant

---

## Same-Path Configuration

`documentsPath` and `applicationsPath` can be set to the same directory for unified structure:

```
{path}/{slug}/
├── generated-assets/          # Kickoff product docs
│   ├── internal/
│   │   ├── business-brief.md
│   │   └── product-spec.md
│   └── external/
├── AGENTS.md                  # Updated to index product docs
├── apps/                      # Monorepo template
├── packages/
└── ...
```

**Benefits:**
- Single project directory for everything
- AI tools can reference product context via AGENTS.md
- No duplication of documents

**When to use:**
- You want a single workspace for planning and development
- You prefer product docs committed alongside code

**When to use separate paths:**
- You want to keep planning separate from implementation
- Multiple startups share a development directory
- You prefer product docs external to the codebase

---

## Saving Profiles

**Critical: Flatten ALL values onto each profile.** This ensures profiles remain stable when default values change.

**Required fields (always save):**
- `displayName`: Original startup name with preserved casing
- `documentsPath`: Complete path including slug subdirectory (e.g., `/path/to/docs/startup-slug`)
- `applicationsPath`: Complete path including slug subdirectory (e.g., `/path/to/repos/startup-slug`)
- `templateRepo`: GitHub template repository URL (always save, even if it matches default)

**Optional fields (save when relevant):**
- `isCodeName`: Set to `true` when user selects a generated code name, `false` or omit otherwise

**Why flatten all fields?**

Defaults are only templates for creating new profiles. By flattening all values onto each profile, you can safely modify defaults without affecting existing projects. The small duplication in config.json is worth the simplicity of profile management.

**Example save operations:**

New startup with generated code name:
```json
"purple-walrus": {
  "displayName": "PURPLE WALRUS",
  "isCodeName": true,
  "documentsPath": "/Users/name/Startups/purple-walrus",
  "applicationsPath": "/Users/name/dev/purple-walrus",
  "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
}
```

New startup with custom name:
```json
"metricsdash": {
  "displayName": "MetricsDash",
  "documentsPath": "/Users/name/Startups/metricsdash",
  "applicationsPath": "/Users/name/dev/metricsdash",
  "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
}
```

After naming exercise completes:
```json
"purple-walrus": {
  "displayName": "Velvet Compass",
  "isCodeName": false,
  "documentsPath": "/Users/name/Startups/purple-walrus",
  "applicationsPath": "/Users/name/dev/purple-walrus",
  "templateRepo": "https://github.com/lockstride/monorepo-nuxt-base"
}
```

## Usage in Commands and Skills

Reference this document instead of duplicating logic:

```markdown
Resolve config using ${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md:
- Generate slug from startup name
- Load profile directly (do NOT merge with defaults)
- Use profile's flattened values for all configuration
- Use displayName for user-facing text, slug for file paths
```

---

## Error Handling

| Scenario | Message |
|----------|---------|
| Config not found | "No configuration found. Run /lockstride-kickoff:config first." |
| Invalid config JSON | "Config file is malformed. Please check ~/.lockstride/kickoff/config.json" |
| Missing default block | "Config missing 'default' block. Run /lockstride-kickoff:config --update" |
| Profile missing displayName | "Invalid profile '{slug}': displayName is required." |
| Path doesn't exist | "Directory doesn't exist: {path}. Create it?" |

