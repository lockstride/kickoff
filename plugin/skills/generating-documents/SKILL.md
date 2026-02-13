---
name: generating-documents
description: Generate startup documents. Intelligently routes based on document state - creates internal docs, exports external versions, or offers choices when documents exist.
user-invocable: false
allowed-tools: Read Write Bash Glob AskUserQuestion Task
---

# Generating Documents

Unified entry point for all document generation — both internal markdown documents and external shareable formats (DOCX, PPTX).

## Invocation

```
/generating-documents [doc-type?] [internal|external?]
```

**Examples:**
- `/generating-documents` — List available documents
- `/generating-documents business-brief` — Smart routing based on state
- `/generating-documents market-analysis internal` — Force internal generation
- `/generating-documents pitch-deck external` — Force external export

### Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`

BEFORE interacting with the user, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`

BEFORE performing any internal document generation workflow actions, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/skills/generating-documents/references/internal-workflow.md`

This file contains the complete internal generation workflow including methodology routing, review, scrutiny, and acceptance patterns.

### Prerequisites

Configuration must exist (see `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for location and schema). If not found, direct user to run `/lockstride-kickoff:config` first.

### Invocation from Init Command

When invoked from `/init` (via Skill tool), the caller provides pre-verified context to avoid redundant state checks. The init command has already:
- Loaded and resolved config
- Determined document state (shown in status display)
- Verified the startup directory exists

Accept this context and skip re-checking. See **Pre-Verified Context** section below.

## Supported Document Types

| Argument | Internal Document | External Output | Dependencies |
|----------|-------------------|-----------------|--------------|
| `business-brief` | business-brief.md | .docx | None |
| `market-analysis` | market-analysis.md | .docx | business-brief |
| `ip-search` | ip-search.md | .docx | business-brief |
| `brand-brief` | brand-brief.md | .docx | business-brief, market-analysis |
| `product-brief` | product-brief.md | .docx | brand-brief, market-analysis |
| `gtm` | go-to-market-strategy.md | .docx | product-brief |
| `plan` | business-plan.md | .docx | product-brief |
| `deck` | pitch-deck.md | .pptx | business-plan |
| `spec` | product-spec.md | .docx | all prior |
| `tech` | technical-requirements.md | .docx | all prior |

## Document Dependency Chain

```
business-brief (standalone)
       │
       ▼
market-analysis
       │
       ├──► ip-search (optional)
       │
       ▼
  brand-brief
       │
       ▼
 product-brief
       │
       ├──► go-to-market-strategy (optional)
       │
       ├──► business-plan (optional)
       │         │
       │         ▼
       │    pitch-deck (optional)
       │
       ▼
  product-spec + technical-requirements
```

---

## State-Aware Routing

**User interaction patterns:** See `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md` for guidance on menus, prompts, and structured user input.

### No Argument Provided

1. Read config to determine startup and paths
2. Scan `{internalPath}` for existing documents
3. Determine which documents are available based on dependencies
4. Present selection menu:

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user select which document to work on
- GUIDANCE: Show available documents (prerequisites met) and unavailable ones (missing prerequisites)

### With Document Type

1. Check if internal document exists
2. Check if external document exists (any version)
3. Route based on state:

**Case 1: No internal document exists**
- Check dependencies are met
- If missing dependencies: "You need {missing} first. Generate it now?"
- If dependencies met: Spawn `business-writer` agent to generate

**Case 2: Internal exists, no external**

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose to export, rewrite, or edit the existing internal document
- GUIDANCE: Mention the document type exists

**Case 3: Both exist**

**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose to regenerate external, rewrite internal, or view existing
- GUIDANCE: Mention both internal and external versions exist

### Explicit Mode (internal|external)

When second argument provided, skip prompts and go directly to that mode:
- `internal` → Generate/regenerate internal document
- `external` → Export external document (requires internal to exist)

### Pre-Verified Context

When invoked from `/init` or another command that has already determined document state, the caller provides context to skip redundant checks. If the invoking prompt includes:

```
Context: {
  startup_name: "...",
  internal_path: "...",
  document_state: "new" | "draft_exists" | "master_exists",
  dependencies_met: true
}
```

Then:
- Skip config resolution (use provided `internal_path`)
- Skip document existence checks (trust provided `document_state`)
- Skip dependency verification (trust `dependencies_met`)
- Proceed directly to the appropriate action based on `document_state`:
  - `"new"` → Spawn business-writer to generate
  - `"draft_exists"` → Enter Document Review Loop
  - `"master_exists"` → Prompt for regeneration

This eliminates redundant file scans when the calling command has already established state.

---

## Internal Document Generation

Follow the complete workflow in `references/internal-workflow.md`.

**Note**: Research-dependent documents (those with `research_required: true` in template frontmatter) follow an extended workflow where the researcher agent is spawned before the business-writer. See internal-workflow.md for detailed orchestration steps.

---

Follow the complete workflow in `references/internal-workflow.md`.

---

## External Document Generation

Follow the complete workflow in `references/external-workflow.md`.

---

## Error Handling

- **Missing config**: "Please run /lockstride-kickoff:config first."
- **Missing dependencies**: List missing documents, offer to generate
- **Pandoc not found**: "Pandoc is required for external documents. Install from https://pandoc.org/"
- **Template not found**: "Template for {doc-type} not found. Check skill installation."
- **Export failed**: Report Pandoc error, suggest checking source markdown

---

## Output Locations

**Internal documents:**
`{documentsPath}/generated-assets/internal/`

**External documents:**
`{documentsPath}/generated-assets/external/`

Note: `{documentsPath}` is the complete path from the profile config (e.g., "/Users/name/Startups/velvet-compass").

External files use versioned names: `{doc-type}_v{YYMMDDHHMM}.{docx|pptx}`
