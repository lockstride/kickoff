# Lockstride Kickoff Plugin Architecture

Implementation-specific architectural patterns and design decisions for the Lockstride Kickoff plugin.

For general Claude Code Plugin architecture principles, see [component-architecture/README.md](component-architecture/README.md).

---

## Table of Contents

1. [Overview](#overview)
2. [Skills-First Architecture](#skills-first-architecture)
3. [Component Summary](#component-summary)
4. [Generating Documents Skill](#generating-documents-skill)
5. [Business Writer Agent](#business-writer-agent)
6. [SKEPTIC MODE & Challenging Assumptions](#skeptic-mode--challenging-assumptions)
7. [Naming Workflow](#naming-workflow)
8. [External File Versioning](#external-file-versioning)
9. [File Naming Conventions](#file-naming-conventions)

---

## Overview

This document describes the specific architectural patterns implemented in the Kickoff plugin. These patterns build on the general plugin architecture principles to solve domain-specific problems for startup founders.

The plugin follows a **Skills-First Architecture** where domain expertise and workflows are primarily encapsulated in Skills for maximum portability, with Agents reserved for highly interactive sessions requiring specialized personas.

---

## Skills-First Architecture

### Naming Conventions

- **Skills**: Gerund form (e.g., `naming-business`, `generating-documents`)
- **Agents**: Role-based names (e.g., `business-writer`)

### Skill Invocation Strategy

This is a well-defined, encapsulated workflow. Skills are NOT auto-discovered by AI mid-conversation. Skills fall into two categories based on how they are invoked:

**Orchestration skills** — invoked by commands/skills via the Skill tool. Hidden from user menu (`user-invocable: false`) but model-invocable (default `disable-model-invocation: false`):

| Skill | Invocation Method | Frontmatter |
|-------|-------------------|-------------|
| `generating-documents` | Invoked by `init`, `generate-docs` commands via Skill tool | `user-invocable: false` |
| `gathering-input` | Invoked by `generating-documents` for business/brand/product briefs | `user-invocable: false` |
| `naming-business` | Invoked by `generating-documents`, `name-startup` via Skill tool | `user-invocable: false` |
| `challenging-assumptions` | Invoked by `generating-documents` at Scrutiny Checkpoint | `user-invocable: false` |

**Methodology skills** — preloaded by agents via `skills:` frontmatter or read as files. Never invoked via the Skill tool (`disable-model-invocation: true`):

| Skill | Invocation Method | Frontmatter |
|-------|-------------------|-------------|
| `researching-markets` | Preloaded by `researcher` agent | `user-invocable: false`, `disable-model-invocation: true` |
| `researching-repos` | Read by `researcher` agent | `user-invocable: false`, `disable-model-invocation: true` |
| `writing-content` | Preloaded by `business-writer` | `user-invocable: false`, `disable-model-invocation: true` |
| `synthesizing-content` | Preloaded by `business-writer` | `user-invocable: false`, `disable-model-invocation: true` |

**Interactive vs Autonomous Execution:**
- **Interactive skills** (`gathering-input`, `naming-business`): Run inline in parent context to enable user dialogue via `AskUserQuestion`. Cannot run as subagents.
- **Autonomous skills**: Preloaded by `business-writer` agent which runs via Task (subagent).

---

## Component Summary

| Component | Count | Items |
|-----------|-------|-------|
| Commands | 4 | config, init, status, create-repo |
| Agents | 2 | business-writer, researcher |
| Skills | 8 | generating-documents, gathering-input, researching-markets, researching-repos, writing-content, synthesizing-content, challenging-assumptions, naming-business |

---

## Generating Documents Skill

The unified entry point for ALL document generation (internal and external).

### Structure

```
skills/generating-documents/
├── SKILL.md                       # Routing logic, state detection, prompts
├── references/
│   ├── internal-workflow.md       # Standard Document Generation Flow
│   └── external-workflow.md       # Pandoc export workflow
├── scripts/
│   └── export-docx.mjs            # Cross-platform Node.js export script
└── assets/
    └── templates/
        ├── business-brief.md      # 10 document templates
        ├── market-analysis.md
        ├── ip-search.md
        ├── brand-brief.md
        ├── product-brief.md
        ├── go-to-market-strategy.md
        ├── business-plan.md
        ├── pitch-deck.md
        ├── product-spec.md
        └── technical-requirements.md
    └── pandoc-templates/      # Pandoc reference documents
        ├── reference.docx     # DOCX export styling template
        ├── reference.pptx     # PPTX export styling template
        └── README.md          # Template documentation
```

### State-Aware Routing

```
/lockstride-kickoff:generate-docs [doc-type?] [internal|external?]

No argument:
→ List available docs based on prereqs met
→ Two-stage prompt if docs exist

With doc-type:
├── business-brief, brand-brief, product-brief (interactive methodology)
│   └── Run gathering-input inline → compact → spawn business-writer with input file
├── Other docs (autonomous methodologies)
│   └── Spawn business-writer agent directly
├── Internal exists, no external → "Rewrite internal or generate external?"
└── Both exist → "Rewrite internal, regenerate external, or view?"
```

---

## Business Writer Agent

Autonomous agent for document generation. Runs via Task (subagent) and does not interact with users directly.

### Input Modes

The agent receives input in three modes:

1. **Gathered Input** (business-brief, brand-brief, product-brief): Pre-validated input from `.{document_type}-input.md` files created by interactive `gathering-input` sessions. Skips alignment checkpoint.
2. **Research Findings** (market-analysis, ip-search, technical-requirements): Structured findings from researcher agent executing researching-{TOPIC} skills.
3. **Upstream Dependencies** (all other documents): Loads required documents per template, presents alignment checkpoint, executes methodology.

### Preloaded Skills

1. **researching-markets** — For autonomous research execution (loaded by researcher agent, not business-writer)
2. **writing-content** — For synthesizing context into focused documents
3. **synthesizing-content** — For integrating multiple sources

---

## Researcher Agent

Autonomous research agent that executes domain-specific research skills. Runs via Task (subagent) and does not interact with users.

### Research Execution Pattern

1. Receives: document type, research skill(s), research inputs
2. Loads specified `researching-{TOPIC}` skill(s)
3. Executes research protocol autonomously
4. Returns structured findings to orchestrating skill (generating-documents)

### Supported Research Skills

1. **researching-markets** — Market sizing, competitive intelligence, industry analysis
2. **researching-repos** — Repository structure, stack discovery, convention extraction

### Design Rationale

- **Isolation**: Web operations isolated from main conversation context
- **Autonomy**: No user interaction required (documents gaps instead of blocking)
- **Reusability**: Single agent can execute any researching-{TOPIC} skill
- **Tool Control**: Strict access to Read, WebSearch, WebFetch, Glob only

---

## Researching-{TOPIC} Pattern

Domain-specific research methodologies invoked by the researcher agent.

### Pattern Structure

- **Skill naming**: `researching-{domain}` (e.g., `researching-markets`, `researching-repos`)
- **Invocability**: `user-invocable: false`, `disable-model-invocation: true`
- **Execution**: Always via researcher agent, never directly
- **Output**: Structured findings for synthesis into documents

### Current Implementations

| Skill | Domain | Used By |
|-------|--------|---------|
| researching-markets | Market analysis, competitive intelligence | market-analysis, ip-search |
| researching-repos | Repository structure, tech stack | technical-requirements |

### Adding New Research Skills

To add a new research domain:

1. Create `skills/researching-{domain}/SKILL.md`
2. Follow researching-markets structure: protocol, quality gates, error handling
3. Set frontmatter: `user-invocable: false`, `disable-model-invocation: true`
4. Update templates needing this research: add to `research_skills` list in frontmatter
5. Add tests (static + E2E if appropriate)

### Template-Driven Research

Templates declare their research needs via frontmatter:

```yaml
research_required: true
research_skills:
  - researching-repos
research_inputs:
  templateRepo: "from user or .local.md config"
```

The generating-documents skill reads this frontmatter and spawns the researcher agent accordingly.

---

## Document Type Mapping

| Document Type | Primary Methodology | Secondary | Research Required |
|---------------|---------------------|-----------|-------------------|
| business-brief | writing-content | — | No |
| market-analysis | researching-markets | writing-content | Yes (researching-markets) |
| ip-search | researching-markets | writing-content | Yes (researching-markets) |
| brand-brief | writing-content | — | No |
| product-brief | writing-content | — | No |
| go-to-market-strategy | synthesizing-content | writing-content | No |
| business-plan | synthesizing-content | researching-markets | No |
| pitch-deck | synthesizing-content | writing-content | No |
| product-spec | synthesizing-content | writing-content | No |
| technical-requirements | synthesizing-content | writing-content | Yes (researching-repos) |

**Note**: Research requirements are now template-driven (declared in frontmatter) rather than hardcoded in agent logic.

---

## SKEPTIC MODE & Challenging Assumptions

The `challenging-assumptions` skill provides optional stress-testing of generated documents at milestone checkpoints.

### Architecture

```
generating-documents skill
    │
    └── Generate DRAFT via business-writer
            │
            └── Scrutiny Checkpoint
                    │
                    └── If "Yes, challenge me":
                            │
                            └── Invoke challenging-assumptions skill with:
                                    - document_type
                                    - document_path (DRAFT file)
                                    │
                                    └── Skill loads domain from references/domains/
                                        Skill reads DRAFT document
                                        Skill applies domain-specific challenges
                                        Skill tracks satisfactory responses
                                            │
                                            └── Exit after 3 satisfactory / skip / 5+ exchanges
                                                    │
                                                    └── Produces structured insights summary
                                                            │
                                                            └── Post-Scrutiny Amendment Flow
```

### Components

| Component | Path | Purpose |
|-----------|------|---------|
| Challenging Assumptions Skill | `skills/challenging-assumptions/SKILL.md` | VC-style scrutinizer persona, challenge protocol, structured insights output |
| Problem Domain | `skills/challenging-assumptions/references/domains/problem.md` | Problem validation challenges |
| Solution Domain | `skills/challenging-assumptions/references/domains/solution.md` | Technical/solution feasibility challenges |
| Market Domain | `skills/challenging-assumptions/references/domains/market.md` | Market sizing, competitive positioning challenges |
| Financials Domain | `skills/challenging-assumptions/references/domains/financials.md` | Unit economics, projection challenges |
| Execution Domain | `skills/challenging-assumptions/references/domains/execution.md` | Timeline, team, dependency challenges |

### Trigger Points

SKEPTIC MODE is offered after these documents generate DRAFT files:
- `market-analysis` → uses market domain
- `business-plan` → uses financials domain
- `product-spec` → uses solution/execution domains
- `pitch-deck` → uses financials domain

---

## Naming Workflow

### Components

| Component | Purpose |
|-----------|---------|
| `naming-business` skill | Handles all naming work inline - simple renames and full naming exercises |

### Flow

```
/lockstride-kickoff:name-startup
    │
    ├── Simple rename → Handle directly in skill
    │       └── Update docs, rename folder, update config profile
    │
    └── Full naming exercise → Run inline (not via agent)
            └── 5-phase interactive session with domain validation
            └── Session state in .naming-exercise.md
```

**Why inline, not agent**: Interactive naming requires user dialogue via `AskUserQuestion`. Agents spawned via Task run autonomously — their `AskUserQuestion` calls don't reach users. The naming workflow runs entirely within the skill context.

---

## External File Versioning

External documents (DOCX/PPTX generated for sharing) use versioned filenames to prevent overwrite and maintain history.

### Version Format

- **Pattern**: `{document-type}_v{YYMMDDHHMM}.{docx|pptx}`
- **Timestamp**: YYMMDDHHMM in GMT (e.g., `2601221824` for Jan 22, 2026, 18:24 GMT)
- **Example**: `pitch-deck_v2601221824.pptx`

### Design Rationale

- **No overwrite**: Each generation creates a new file
- **User-managed history**: Users delete old versions manually if desired
- **No review loop**: External files are final on generation
- **Point-in-time snapshots**: Each version represents the state of internal documents at generation time

---

## File Naming Conventions

| Type | Pattern | Example | Notes |
|------|---------|---------|-------|
| Internal DRAFT | `DRAFT-{document-type}.md` | `DRAFT-market-analysis.md` | Temporary, becomes master on accept |
| Internal master | `{document-type}.md` | `market-analysis.md` | Finalized document |
| External versioned | `{document-type}_v{YYMMDDHHMM}.{docx\|pptx}` | `pitch-deck_v2601221824.pptx` | Versioned, never overwritten |

### Safe File Swap Pattern

When accepting a DRAFT, the system:
1. Creates backup of existing master (if exists)
2. Renames DRAFT to master
3. Deletes backup
4. Restores from backup if any step fails

This ensures atomicity and prevents data loss during the transition from draft to final document.
