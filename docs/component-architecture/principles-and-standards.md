# Core Principles and Open Standards

Part of: [Component Architecture](README.md) > Principles and Standards

Foundation document covering architectural principles and open standards that underpin all plugin development.

---

## Table of Contents

- [Core Architectural Principles](#core-architectural-principles)
  - [Single Source of Truth](#single-source-of-truth)
  - [Separation of Concerns](#separation-of-concerns)
  - [Progressive Disclosure](#progressive-disclosure)
  - [Maximum Reusability](#maximum-reusability)
  - [Least Privilege](#least-privilege)
  - [Cross-Platform Compatibility](#cross-platform-compatibility)
  - [Cross-Component File References](#cross-component-file-references)
- [Open Standards](#open-standards)
  - [Agent Skills](#agent-skills)
  - [Model Context Protocol (MCP)](#model-context-protocol-mcp)
  - [Language Server Protocol (LSP)](#language-server-protocol-lsp)
- [Component Comparison](#component-comparison)
  - [Standards vs Vendor-Specific](#standards-vs-vendor-specific)
  - [Responsibility Boundaries](#responsibility-boundaries)
  - [Comparison: MCP vs LSP](#comparison-mcp-vs-lsp)

---

## Core Architectural Principles

These principles guide all plugin development decisions across components.

### Single Source of Truth

Every concept should exist in exactly one place to minimize token consumption, ensure consistency, and simplify maintenance.

**Implications:**
- Domain knowledge lives in [Skills](skills.md), not duplicated in agents
- Configuration centralized in plugin manifest (see [Plugin Structure](plugin-structure.md))
- Validation logic in [Hooks](hooks.md), not scattered in skills

### Separation of Concerns

Each component has a distinct responsibility:

| Component | Responsibility | Details |
|-----------|----------------|---------|
| **Skills** | Knowledge and capabilities | [Skills](skills.md) |
| **Agents** | Isolated execution with constraints | [Agents](agents.md) |
| **Hooks** | Event-driven automation | [Hooks](hooks.md) |
| **MCP Servers** | External tool and data integration | [MCP Servers](mcp-servers.md) |
| **LSP Servers** | Code intelligence | [LSP Servers](lsp-servers.md) |

**See also:** [Decision Framework](orchestration-and-decisions.md#decision-framework) for choosing the right component.

### Progressive Disclosure

Load context only when needed to minimize token consumption.

**Rules of thumb:**
- Keep discovery metadata small (skill `description`, agent `description`) so the system can scan many options cheaply.
- Put “heavy” guidance behind an explicit load (full skill content, referenced docs, templates).
- Prefer linking to a single canonical explanation over repeating diagrams across docs.

**See also:**
- [Orchestration: Skill with Progressive Disclosure](orchestration-and-decisions.md#skill-with-progressive-disclosure)
- [Skills: Progressive Disclosure](skills.md#progressive-disclosure)

### Maximum Reusability

Design for general use, parameterize for specifics.

**Examples:**
- Create `api-conventions` skill, not `user-api-conventions` and `product-api-conventions`
- Build reusable [orchestration patterns](orchestration-and-decisions.md#orchestration-patterns), not one-off solutions
- Share skills across multiple [agents](agents.md) for consistency

### Least Privilege

Grant only necessary permissions and tool access.

**Implementation:**
- Use `allowed-tools` in [skill frontmatter](skills.md#frontmatter-reference)
- Restrict agent tools via `tools` and `disallowedTools` (see [Agents](agents.md))
- Apply [MCP security best practices](mcp-servers.md#security-by-design)
- Validate operations with [PreToolUse hooks](hooks.md#pretooluse)

### Cross-Platform Compatibility

All plugin scripts and operations must work on both macOS and Windows.

**File Operations — Use Plugin Tools:**
| Instead of | Use |
|------------|-----|
| `cat`, `test -e` | Read tool |
| `echo >`, `touch` | Write tool (auto-creates parent directories) |
| `ls`, `test -d` | LS tool |
| `find` | Glob tool |
| `cp` | Read source + Write destination |
| `mv`, `rename` | Node.js script with `fs.renameSync()` |

**Path Handling:**
- Expand `~` to full home directory before operations
- Use `$HOME` on Unix/Mac, `%USERPROFILE%` on Windows
- Use `path.join()` in Node.js scripts for path construction

**Shell Commands:**
- Use `command -v` instead of `which` (works on Git Bash, WSL, Unix)
- Avoid Unix-specific tools: `test -d`, `mkdir -p`, `cp`, `mv`
- For complex operations, create Node.js scripts in `scripts/` directory

**ZIP Operations:**
- Use `adm-zip` npm package instead of `unzip`/`zip` commands
- Pure JavaScript, no native binaries required

**Skill Scripts:**
- Place skill-specific scripts in `skills/{skill-name}/scripts/`
- Place shared scripts in plugin root `scripts/` directory
- Use Node.js built-in modules where possible (`fs`, `path`, `dns`)

### Cross-Component File References

Skills, commands, and agents that reference external documentation must use specific patterns to ensure components reliably read and follow those references.

#### Rules (portable and unambiguous)

1. **Use `${CLAUDE_PLUGIN_ROOT}` for cross-plugin navigation**
   - Avoid relative paths that traverse outside the component (e.g. `../references/`).
   - Use absolute plugin-relative paths like `${CLAUDE_PLUGIN_ROOT}/path/to/reference.md`.
   - Exception: links *within* a component’s own directory can be relative.

2. **Name the file-read tool explicitly**
   - Claude Code often uses `view`; Cursor uses `Read`. Write instructions that name the correct tool for the host you’re targeting.
   - The goal is to make the required action unambiguous: “use the file `view` tool to read X”.

3. **Use imperative language for required reads**
   - Good: “BEFORE taking any other action, you MUST read: `.../reference.md`”
   - Avoid vague phrasing (“see file for details”) that is easy to skip.

#### Implementation Pattern

At the beginning of skills/commands/agents that depend on shared references, use a pattern similar to:

```markdown
## Required First Step

BEFORE taking any other action, you MUST use the file-read tool (e.g. `Read` in Cursor, `view` in Claude Code) to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/example_reference.md`
```

For inline references within instructions (following the Required First Step markdown):

```markdown
**SOME CATEGORY IN THE REF FILE:** NAME OF TOPIC BEING REFERENCED — see `${CLAUDE_PLUGIN_ROOT}/path/to/reference.md`
- GOAL: [Describe what this pattern achieves]
- GUIDANCE: [Specific implementation guidance]
```

**CRITICAL:** Always use the full `${CLAUDE_PLUGIN_ROOT}/path/to/file.md` path for ALL references throughout each document. Never use just the filename alone. This prevents the agent from re-loading the file into context and ensures consistent file resolution.

#### Testing Reference Adherence

To verify a component read a reference file:
1. Run with `--debug` (or equivalent host debug logging).
2. Find the session transcript/log file for the run.
3. Search for file-read tool calls and confirm the referenced path appears.

---

## Open Standards

Prioritize open, portable formats for maximum cross-platform compatibility.

### Agent Skills

[Agent Skills](https://agentskills.io) is an **open format** for portable agent capabilities. Skills are directories containing `SKILL.md` with YAML frontmatter.

**Required fields:**
- `name`: Max 64 chars, lowercase alphanumeric/hyphens, matches directory
- `description`: Max 1024 chars, describes purpose and when to use

**Optional standard fields:**
- `license`, `compatibility`, `metadata`, `allowed-tools`

**Platform discovery:**
- **Claude Code**: `.claude/skills/`, `~/.claude/skills/`
- **Cursor**: `.cursor/skills/`, `~/.cursor/skills/` (also discovers `.claude/skills/`, `.codex/skills/`)

**Portability:** High - works across Claude Code, Cursor, Codex, and other Agent Skills-compatible platforms.

**Full details:** [Skills component reference](skills.md)

### Model Context Protocol (MCP)

[MCP](https://modelcontextprotocol.io) standardizes AI connections to external tools and data. It's an **open protocol** enabling AI applications to integrate with external systems through a consistent, well-defined contract.

**Provides:**
- **Tools**: Executable actions with schemas
- **Resources**: Readable data sources
- **Prompts**: Interaction templates

**Best practices:**
- Single responsibility per server
- Strict input/output schemas with explicit side-effect disclosure
- Stateless design
- Security by design: least privilege, authentication, auditability

**Portability:** High - MCP servers work across compatible clients (Claude Code, OpenAI, Cursor, etc.). Configuration format varies by platform.

**Full details:** [MCP Servers component reference](mcp-servers.md)

**Resources:**
- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)

### Language Server Protocol (LSP)

[LSP](https://microsoft.github.io/language-server-protocol/) provides **code intelligence**: diagnostics, navigation, type information. It's an **open standard** originally developed by Microsoft for VS Code.

**Key capabilities:**
- Real-time diagnostics (errors, warnings)
- Code navigation (go to definition, find references)
- Type information and hover documentation
- Code completion and quick fixes

**Architecture:**
```
Editor/IDE (LSP Client) ←→ JSON-RPC ←→ Language Server ←→ Code Analysis
```

**Portability:** High - LSP servers work across multiple editors (VS Code, Cursor, Claude Code, Neovim, etc.). Protocol is fully standardized.

**Full details:** [LSP Servers component reference](lsp-servers.md)

**Resources:**
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
- [Language Server Index](https://langserver.org/)

---

## Component Comparison

### Standards vs Vendor-Specific

| Component | Standard | Portability | Details |
|-----------|----------|-------------|---------|
| **Skills** | Agent Skills (open) | High - works across platforms | [Skills](skills.md) |
| **MCP Servers** | MCP (open) | High - servers portable; config varies | [MCP Servers](mcp-servers.md) |
| **LSP Servers** | LSP (open) | Medium-High - protocol portable; integration varies | [LSP Servers](lsp-servers.md) |
| **Agents** | Vendor-specific | Low - implementation varies | [Agents](agents.md) |
| **Hooks** | Vendor-specific | Low - concepts portable; implementation varies | [Hooks](hooks.md) |

**Recommendation:** Maximize use of open standards (Skills, MCP, LSP) for portability. Use vendor-specific features (Agents, Hooks) only when needed for isolation, specific model selection, or advanced guardrails.

### Responsibility Boundaries

Responsibility boundaries are part of the component selection decision process and live in:

- [Orchestration: Responsibility Boundaries](orchestration-and-decisions.md#responsibility-boundaries)
- [Orchestration: Decision Framework](orchestration-and-decisions.md#decision-framework)

---

## Comparison: MCP vs LSP

Both are open protocols but serve different purposes:

| Aspect | MCP | LSP |
|--------|-----|-----|
| **Purpose** | External tool/data integration | Code intelligence |
| **Domain** | Any external system | Language-specific analysis |
| **State** | Can be stateful or stateless | Stateful (tracks open documents) |
| **Side Effects** | Yes (create/update/delete operations) | No (read-only analysis) |
| **Transport** | stdio, HTTP SSE | stdio, TCP, WebSocket |
| **Invocation** | Explicit tool calls | Implicit (on file open/edit) |
| **Portability** | Server portable, config varies | Server highly portable, protocol fully standardized |

**When to use which:**
- **LSP:** Code understanding, type checking, navigation, diagnostics - [LSP Servers](lsp-servers.md)
- **MCP:** Database queries, API calls, file operations, deployments - [MCP Servers](mcp-servers.md)

**Use together:**
```
AI Agent uses LSP to understand code structure and types
       ↓
Then uses MCP to query database based on schema understanding
       ↓
Combines both to generate type-safe database queries
```

---

## Related Documentation

- **Component Details**: [Skills](skills.md) | [Agents](agents.md) | [Hooks](hooks.md) | [MCP Servers](mcp-servers.md) | [LSP Servers](lsp-servers.md)
- **Practical Guidance**: [Orchestration and Decision Framework](orchestration-and-decisions.md)
- **Implementation**: [Plugin Structure](plugin-structure.md)
- **Architecture Home**: [README](README.md)

---

## References

### Open Standards
- [Agent Skills Specification](https://agentskills.io/specification)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)
