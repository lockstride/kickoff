# Skills

Part of: [Component Architecture](README.md) > [Component Reference](README.md#component-quick-reference) > Skills

Skills are the primary method for extending agents with domain expertise and workflows. They follow the [Agent Skills](https://agentskills.io) open standard.

---

## Table of Contents

- [Overview](#overview)
- [What Skills Do](#what-skills-do)
- [Directory Structure](#directory-structure)
- [SKILL.md Format](#skillmd-format)
- [Frontmatter Reference](#frontmatter-reference)
- [Best Practices](#best-practices)
- [Ensuring Agents Read Reference Files](#ensuring-agents-read-reference-files)
- [Context Modes](#context-modes)
- [When to Use Skills vs Agents](#when-to-use-skills-vs-agents)

---

## Overview

**Standard:** [Agent Skills](https://agentskills.io) (open)  
**Portability:** High - works across Claude Code, Cursor, Codex  
**Discovery:** Automatic via `description` field in frontmatter

Skills provide portable, context-efficient domain expertise. They're the most important component for cross-platform compatibility.

**See also:**
- [Principles: Progressive Disclosure](principles-and-standards.md#progressive-disclosure)
- [Orchestration: Skill Patterns](orchestration-and-decisions.md#agent--skill-interaction-patterns)
- [Plugin Structure: Skills Directory](plugin-structure.md#directory-layout)

---

## What Skills Do

- **Provide domain expertise** and specialized knowledge
- **Define repeatable workflows** with step-by-step instructions
- **Bundle scripts and supporting files** for automation
- **Create user-invokable commands** (`/skill-name`)
- **Load on demand** following [progressive disclosure](principles-and-standards.md#progressive-disclosure) pattern

---

## Directory Structure

```
skill-name/
├── SKILL.md              # Required: instructions and frontmatter
├── references/           # Optional: detailed documentation (open standard)
│   ├── REFERENCE.md      # API specs, technical guides
│   └── domain.md         # Domain-specific details
├── scripts/              # Optional: executable automation (open standard)
│   └── helper.py         # Self-contained scripts
├── assets/               # Optional: static resources (open standard)
│   ├── templates/        # Config templates, document templates
│   └── diagrams/         # Images, charts
└── examples/             # Optional: sample outputs (vendor-specific)
    └── sample.md         # Example usage and outputs
```

### Component Explanations

| Component | Standard | Purpose | When to Use |
|-----------|----------|---------|-------------|
| **SKILL.md** | Agent Skills (open) | Main instructions with YAML frontmatter. Loaded when skill activates (~5000 tokens recommended max). | *Required*. Keep under 500 lines for optimal performance. |
| **references/** | Agent Skills (open) | Detailed documentation loaded on demand. Use for API specs, technical guides, troubleshooting, domain-specific details. | When SKILL.md would exceed 500 lines or when organizing by domain (e.g., `finance.md`, `sales.md`, `legal.md`). |
| **scripts/** | Agent Skills (open) | Executable code agents can run. Should include error handling, clear documentation, and self-contained logic. | For automation, validation, data processing, deployment tasks. More reliable and efficient than generated code. |
| **assets/** | Agent Skills (open) | Static resources: templates, images, data files, schemas. No context penalty until accessed. | For config templates, diagrams, lookup tables, seed data. Cursor saves generated images here by default. |
| **examples/** | Vendor-specific | Sample input/output pairs demonstrating expected format and style. | When output quality depends on seeing concrete examples (like commit messages, reports). Not in open standard. |

**Directory conventions:**
- **references/** (directory) or **REFERENCE.md** (single file): Both valid per [Agent Skills spec](https://agentskills.io/specification). Use directory for multiple reference files, single file for simpler skills.
- **examples/**: Vendor-specific extension (Claude Code, Cursor). Omit if targeting pure open standard compatibility.

---

## SKILL.md Format

```markdown
---
name: skill-name
description: When to use this skill and what it does
argument-hint: "[optional-argument]"
disable-model-invocation: false
user-invocable: true
allowed-tools: Read Grep Glob
model: inherit
context: inline
---

# Skill Title

## How to use this skill

Instructions that AI follows when invoked.

## Additional Resources

- For API reference: [reference.md](reference.md)
- For examples: [examples/](examples/)
```

**Dynamic content (Claude Code):**

```markdown
- Diff: !`gh pr diff`
- Arguments: $ARGUMENTS or $N
```

---

## Frontmatter Reference

| Field | Portable | Default | Description |
|-------|----------|---------|-------------|
| `name` | ✓ | *Required* | Unique identifier matching directory name. Max 64 chars, lowercase alphanumeric/hyphens. Example: `api-client` |
| `description` | ✓ | *Required* | What the skill does and when to use it. Max 1024 chars. Claude uses this for auto-discovery. Example: `Generate API client code following project conventions. Use when creating new API integrations.` |
| `license` | ✓ | `null` | License name (`MIT`, `Apache-2.0`) or path to bundled license file. Example: `MIT` |
| `compatibility` | ✓ | `null` | Environment requirements. Max 500 chars. Example: `Requires Node.js 18+, pnpm installed` |
| `metadata` | ✓ | `null` | Arbitrary key-value mapping for additional data. Example: `{version: "2.0", tags: ["api", "codegen"]}` |
| `allowed-tools` | ✓ | All tools | Space-delimited list of pre-approved tools. Not strictly enforced—AI may request additional tools if needed. Example: `Read Grep Glob`. **Note:** Spec allows comma-delimited, but this project requires space-delimited for consistency. |
| `argument-hint` | Claude/Cursor | `null` | Hint shown during autocomplete. Example: `[filename]` or `<environment>` |
| `disable-model-invocation` | Claude/Cursor | `false` | If `true`, only user can invoke (not Claude). Use for side effects like deployments. |
| `user-invocable` | Claude | `true` | If `false`, hidden from `/` menu. Use for background knowledge skills. |
| `model` | Claude | `inherit` | Model override: `sonnet` (balanced), `opus` (max capability), `haiku` (fast), `inherit` (use parent conversation's model) |
| `context` | Claude | `inline` | Execution context: `inline` (main conversation) or `fork` (isolated subagent with separate context window) |
| `agent` | Claude | `null` | Subagent type when `context: fork`. Example: `Explore` for read-only codebase exploration |

---

## Best Practices

1. **Keep SKILL.md under 500 lines** - Move details to supporting files ([references/](references/), [scripts/](scripts/))
2. **Write clear descriptions with trigger phrases** - Include what skill does AND when to use it
3. **Reference supporting files explicitly** - Tell Claude what each file contains
4. **Use progressive disclosure** - Main instructions first, details on demand (see [Principles](principles-and-standards.md#progressive-disclosure))
5. **Scope tool access via `allowed-tools`** - Grant only necessary tools ([Least Privilege](principles-and-standards.md#least-privilege))
6. **Be concise** - Assume Claude is smart; only add context it doesn't have

---

## Reference File Navigation

Skills that reference external documentation must follow specific patterns to ensure agents reliably read those files.

**See:** [Cross-Component File References](principles-and-standards.md#cross-component-file-references) for the complete pattern guide, including:
- Using `${CLAUDE_PLUGIN_ROOT}` for cross-plugin navigation
- Explicitly specifying the `view` tool
- Using strong declarative language
- Implementation examples and testing methods

---

## Context Modes

Skills can run in two contexts:

### Inline (Default)

```yaml
context: inline
```

Skill runs in main conversation context. Use for most cases.

**Benefits:**
- Preserves conversation history
- Can reference prior context
- Lower latency

**Use when:**
- Simple expertise delivery
- Context continuity important
- Quick responses needed

### Forked Context

```yaml
context: fork
model: sonnet
allowed-tools: Read, Grep, Glob
```

Skill runs in isolated context window, returns single result.

**Benefits:**
- Keeps main context clean
- Prevents verbose output cluttering conversation
- Agent-like isolation while maintaining portability
- Can specify different model

**Use when:**
- Long-running analysis needed
- Verbose output expected
- Isolation beneficial
- Want portability over vendor-specific agents

**See also:** [Orchestration: Skill with Forked Context](orchestration-and-decisions.md#pattern-3-skill-with-forked-context-skill-acts-like-agent)

---

## When to Use Skills vs Agents

| Use Case | Recommended Approach | Details |
|----------|---------------------|---------|
| Provide knowledge to main conversation | **Skill** (portable across platforms) | This document |
| Run in isolated context | **Agent** or **Skill with `context: fork`** | [Agents](agents.md) or [forked context](#forked-context) |
| Long-running verbose task | **Agent** (keeps main context clean) | [Agents](agents.md) |
| Specific model/tool constraints | **Agent** (with platform-specific config) | [Agents](agents.md) |
| Maximum portability | **Skill** | This document |

**Design principle:** Start with Skills (portable). Use [Agents](agents.md) only when you need platform-specific isolation, specific model selection, or tool restrictions.

**See also:**
- [Orchestration: Skill-First with Optional Agent Delegation](orchestration-and-decisions.md#pattern-5-skill-first-with-optional-agent-delegation)
- [Decision Framework: Component Selection](orchestration-and-decisions.md#component-selection-flowchart)

---

## Related Documentation

### Core Concepts
- [Principles: Progressive Disclosure](principles-and-standards.md#progressive-disclosure)
- [Principles: Single Source of Truth](principles-and-standards.md#single-source-of-truth)
- [Open Standards: Agent Skills](principles-and-standards.md#agent-skills)

### Integration Patterns
- [Agent + Skill Patterns](orchestration-and-decisions.md#agent--skill-interaction-patterns)
- [Skill with Progressive Disclosure](orchestration-and-decisions.md#skill-with-progressive-disclosure)
- [Multi-Agent Shared Skills](orchestration-and-decisions.md#pattern-4-multi-agent-with-shared-skill-knowledge)

### Implementation
- [Plugin Structure: Skills Directory](plugin-structure.md#directory-layout)
- [Testing: Frontmatter Validation](plugin-structure.md#frontmatter-validation)
- [Distribution: Scope Options](plugin-structure.md#scope-options)

### Related Components
- [Agents](agents.md) - For isolation and constraints
- [MCP Servers](mcp-servers.md) - For external integrations
- [Hooks](hooks.md) - For event-driven validation

---

## Additional Guidance

For comprehensive authoring guidance, see [Anthropic's Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), which covers:
- Progressive disclosure patterns
- Evaluation-driven development
- Workflow design with feedback loops
- Avoiding anti-patterns (time-sensitive info, inconsistent terminology)
- Runtime environment considerations
