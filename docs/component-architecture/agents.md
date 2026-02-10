# Agents (Subagents)

Part of: [Component Architecture](README.md) > [Component Reference](README.md#component-quick-reference) > Agents

Agents are specialized assistants that handle tasks in isolated contexts with specific constraints.

---

## Table of Contents

- [Overview](#overview)
- [Core Concepts (Industry Standard)](#core-concepts-industry-standard)
- [Implementation in Claude Code](#implementation-in-claude-code)
- [Agent File Structure](#agent-file-structure)
- [Frontmatter Fields](#frontmatter-fields)
- [Discovery and Triggering](#discovery-and-triggering)
- [When to Use Agents vs Skills](#when-to-use-agents-vs-skills)

---

## Overview

**Standard:** Vendor-specific  
**Portability:** Low - implementation varies by platform  
**Use for:** Isolated execution with tool constraints and specific model selection

Agents provide **isolated execution environments** for specialized tasks. These concepts are consistent across major AI platforms ([Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/agent-patterns), [OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/), [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns), [Google](https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer)).

**Recommendation:** Start with [Skills](skills.md) (portable across platforms). Use agents only when you need isolation, specific model selection, or tool restrictions.

---

## Core Concepts (Industry Standard)

### What Agents Do (Universal)

- **Execute tasks in isolated context windows**
- **Enforce tool restrictions and permissions**
- **Preserve main conversation context**
- **Specialize behavior for specific domains**

These capabilities are consistent across AI platforms, though implementation details vary.

### Industry-Standard Orchestration Patterns

| Pattern | Description | Use Case | Details |
|---------|-------------|----------|---------|
| Single agent + tools | One agent, multiple tools | Simple workflows | [Orchestration Patterns](orchestration-and-decisions.md#orchestration-patterns) |
| Manager | Central agent delegates to specialists | Coordinated multi-step tasks | [Manager Pattern](orchestration-and-decisions.md#manager) |
| Handoff | Agents transfer control sequentially | Dynamic routing, multi-domain problems | [Handoff Pattern](orchestration-and-decisions.md#handoff) |
| Concurrent | Multiple agents work in parallel | Independent subtasks, ensemble reasoning | [Concurrent Pattern](orchestration-and-decisions.md#concurrent) |

**See also:** [Orchestration Patterns](orchestration-and-decisions.md#orchestration-patterns) for complete reference.

---

## When to Use Agents vs Skills

| Use Case | Recommended Approach | Details |
|----------|---------------------|---------|
| Provide knowledge to main conversation | [**Skill**](skills.md) (portable across platforms) | [Skills](skills.md) |
| Run in isolated context | **Agent** or [**Skill with `context: fork`**](skills.md#forked-context) | This page or [Skills: Context Modes](skills.md#context-modes) |
| Long-running verbose task | **Agent** (keeps main context clean) | This page |
| Specific model/tool constraints | **Agent** (with platform-specific config) | This page |
| Maximum portability | [**Skill**](skills.md) | [Skills](skills.md) |

**Design principle:** Prefer [Skills](skills.md) for portability. Use agents only when platform-specific features required.

**See also:**
- [Decision Framework: Component Selection](orchestration-and-decisions.md#component-selection-flowchart)
- [Orchestration: Skill-First with Optional Agent Delegation](orchestration-and-decisions.md#pattern-5-skill-first-with-optional-agent-delegation)

---

## Implementation in Claude Code

The following sections document Claude Code's agent implementation. Other platforms may differ.

### Discovery and Triggering

Claude Code automatically discovers and registers agents through a two-level mechanism:

#### 1. System-Level Auto-Discovery (Plugin Framework)

- Scans `agents/*.md` files at plugin root
- Parses YAML frontmatter (`name`, `description`, `skills`, etc.)
- Injects agent metadata into main agent's system prompt as available `subagent_types`
- Happens at session start (agents are pre-registered before any user interaction)

#### 2. Agent Selection (Main Agent's Decision)

- Main agent reads available subagent descriptions in its context
- Matches task requirements to agent capabilities based on `description` field
- Delegates via `Task` tool: `Task(subagent_type="agent-name", ...)`
- Skills listed in agent frontmatter are loaded *after* agent is selected

**Key insight:** The `description` field is the primary discovery mechanism. It must clearly explain when to delegate to the agent. The main agent sees only names and descriptions when choosing agents—skills are loaded afterward to provide specialized knowledge in the agent's isolated context.

**Example discovery flow:**

```
# Your plugin has agents/backend-dev.md
# Plugin framework auto-discovers it and registers:
Available subagent_types:
  - backend-dev: "Backend development specialist. Use for API, database, server code."

# Main agent sees user request: "Build a user API"
# Main agent thinks: "This needs backend work" → matches description
# Main agent calls: Task(subagent_type="backend-dev", ...)
# Plugin framework then loads backend-dev's skills into its isolated context
```

---

## Agent File Structure

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: sonnet
permissionMode: default
skills:
  - api-conventions
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---

You are a senior code reviewer.

When invoked:
1. Run git diff
2. Focus on modified files
3. Begin review

Review for:
- Code clarity
- Error handling
- Security
- Test coverage
```

**Components:**
- **Frontmatter (YAML):** Configuration fields (see [Frontmatter Fields](#frontmatter-fields))
- **Body (Markdown):** System prompt for the agent
- **Skills:** Preloaded [skills](skills.md) available in agent context
- **Hooks:** Agent-scoped [event handlers](hooks.md)

**See also:** [Plugin Structure: Agents Directory](plugin-structure.md#directory-layout)

---

## Frontmatter Fields

| Field | Default | Description |
|-------|---------|-------------|
| `name` | *Required* | Unique identifier in kebab-case. Must be unique across all agents. Example: `code-reviewer` |
| `description` | *Required* | When Claude should delegate to this agent. Be specific about triggers and use cases. Example: `Expert code reviewer. Use proactively after code changes to ensure quality standards.` |
| `tools` | All tools | Space-delimited list of allowed tools. If omitted, inherits all tools from parent. Example: `Read Grep Glob Bash`. **Note:** Spec allows comma-delimited, but this project requires space-delimited for consistency. |
| `disallowedTools` | None | Space-delimited list of denied tools, removed from inherited set. Useful for read-only agents. Example: `Write Edit Delete`. **Note:** Spec allows comma-delimited, but this project requires space-delimited for consistency. |
| `model` | `inherit` | Model override: `sonnet` (balanced cost/capability), `opus` (maximum capability), `haiku` (fast/economical), `inherit` (use parent's model). See [Model Selection](orchestration-and-decisions.md#model-selection) |
| `permissionMode` | `default` | Permission handling: `default` (prompt user), `acceptEdits` (auto-accept file edits), `dontAsk` (auto-deny prompts), `bypassPermissions` (skip all checks - use with caution), `plan` (read-only plan mode) |
| `skills` | `[]` | Array of skill names to preload into agent context. Use for shared conventions. Example: `[api-conventions, code-standards]`. See [Skills](skills.md) |
| `hooks` | `{}` | Lifecycle hooks scoped to this agent. Same format as global hooks. Example: `PreToolUse` hooks for command validation. See [Hooks](hooks.md) |

**Tool access hierarchy:**
1. If `tools` specified: Use exactly those tools
2. If `disallowedTools` specified: Start with parent tools, remove disallowed
3. If neither specified: Inherit all parent tools

**See also:**
- [Principles: Least Privilege](principles-and-standards.md#least-privilege)
- [Skills: Frontmatter Reference](skills.md#frontmatter-reference)
- [Hooks: Configuration](hooks.md#configuration)

---

## Related Documentation

### Core Concepts
- [Principles: Separation of Concerns](principles-and-standards.md#separation-of-concerns)
- [Principles: Least Privilege](principles-and-standards.md#least-privilege)
- [Component Comparison](principles-and-standards.md#component-comparison)

### Patterns and Integration
- [Orchestration Patterns](orchestration-and-decisions.md#orchestration-patterns)
- [Agent + Skill Interaction Patterns](orchestration-and-decisions.md#agent--skill-interaction-patterns)
- [Pattern: Agent with Preloaded Skills](orchestration-and-decisions.md#pattern-1-agent-with-preloaded-skills)
- [Pattern: Multi-Agent Shared Skills](orchestration-and-decisions.md#pattern-4-multi-agent-with-shared-skill-knowledge)

### Decision Making
- [Decision Framework](orchestration-and-decisions.md#decision-framework)
- [Component Selection Flowchart](orchestration-and-decisions.md#component-selection-flowchart)
- [Model Selection Guide](orchestration-and-decisions.md#model-selection)

### Implementation
- [Plugin Structure: Agents Directory](plugin-structure.md#directory-layout)
- [Testing: Agent Configuration](plugin-structure.md#testing-and-validation)

### Related Components
- [Skills](skills.md) - Portable knowledge preloaded into agents
- [Hooks](hooks.md) - Event-driven validation for agents
- [MCP Servers](mcp-servers.md) - External tools agents can use

---

## External Resources

### Industry Patterns
- [Anthropic: Agent Patterns](https://docs.anthropic.com/en/docs/build-with-claude/agent-patterns)
- [OpenAI: Building AI Agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [Microsoft: AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Google: Agentic Chat](https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer)
