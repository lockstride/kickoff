# Plugin Structure and Distribution

Part of: [Component Architecture](README.md) > Implementation

Directory layout, configuration, testing, and distribution guidelines for Claude Code plugins.

---

## Table of Contents

- [Why Create a Plugin](#why-create-a-plugin)
- [Directory Layout](#directory-layout)
- [Portability](#portability)
- [Plugin Manifest](#plugin-manifest)
- [Environment Variables](#environment-variables)
- [Testing and Validation](#testing-and-validation)
- [Distribution and Sharing](#distribution-and-sharing)
- [Quick Reference Checklist](#quick-reference-checklist)

---

## Why Create a Plugin

Plugin structure varies by platform. This documents Claude Code with portability notes.

While standalone [skills](skills.md) are portable and sufficient for many use cases, Claude Code plugins offer unique advantages:

- **Cohesive distribution**: Bundle related skills, agents, hooks, and MCP servers as a single installable unit
- **Event-driven automation**: Use [hooks](hooks.md) to validate, transform, or react to tool usage and lifecycle events
- **Isolated execution contexts**: Create [agents](agents.md) with constrained tool access and separate conversation threads
- **Centralized configuration**: Manage [MCP](mcp-servers.md)/[LSP](lsp-servers.md) servers and plugin settings in one place
- **Discoverability**: Users install once and get all capabilities, rather than managing individual skills

**Use a plugin when:** You need orchestration across multiple components or want to provide a complete solution for a domain (e.g., "kickoff" bundles 10+ document generation workflows with shared validation and templates).

**See also:** [Orchestration: Choosing a Pattern](orchestration-and-decisions.md#choosing-a-pattern)

---

## Directory Layout

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json           # Required: plugin manifest (vendor-specific)
├── skills/                    # OPEN STANDARD (Agent Skills)
│   ├── skill-one/
│   │   ├── SKILL.md          # Required
│   │   ├── references/       # Optional
│   │   ├── scripts/          # Optional
│   │   └── assets/           # Optional
│   └── skill-two/
│       └── SKILL.md
├── agents/                    # Vendor-specific (Claude Code)
│   └── agent-name.md
├── hooks/                     # Vendor-specific (Claude Code)
│   └── hooks.json
├── .mcp.json                  # MCP protocol is open; config is vendor-specific
├── .lsp.json                  # LSP protocol is open; config is vendor-specific
└── scripts/                   # Utility scripts
    └── helper.sh
```

**Component details:**
- **skills/**: See [Skills: Directory Structure](skills.md#directory-structure)
- **agents/**: See [Agents: Agent File Structure](agents.md#agent-file-structure)
- **hooks/**: See [Hooks: Configuration](hooks.md#configuration)
- **.mcp.json**: See [MCP Servers: Configuration Example](mcp-servers.md#configuration-example)
- **.lsp.json**: See [LSP Servers: Configuration Example](lsp-servers.md#configuration-example)

---

## Portability

| Directory | Standard | Portable |
|-----------|----------|----------|
| `skills/` | [Agent Skills](principles-and-standards.md#agent-skills) | Yes - across Claude Code, Cursor, Codex |
| `.mcp.json` | [MCP protocol](principles-and-standards.md#model-context-protocol-mcp) | Server portable; config format varies |
| `.lsp.json` | [LSP protocol](principles-and-standards.md#language-server-protocol-lsp) | Server reusable; config format varies |
| `agents/` | Vendor-specific | Claude Code only |
| `hooks/` | Vendor-specific | Claude Code only |
| `.claude-plugin/` | Vendor-specific | Claude Code only |

**Recommendation:** Maximize use of `skills/` for cross-platform compatibility.

**See also:** [Principles: Standards vs Vendor-Specific](principles-and-standards.md#standards-vs-vendor-specific)

---

## Plugin Manifest

`plugin.json` defines metadata:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Brief description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "repository": "https://github.com/author/plugin",
  "license": "MIT"
}
```

**Required:** `name` (kebab-case)  
**Recommended:** `version` (semver), `description`

---

## Environment Variables

Use `${CLAUDE_PLUGIN_ROOT}` for portable paths:

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
}
```

**Usage in:**
- [Hooks configuration](hooks.md#configuration)
- [MCP server configuration](mcp-servers.md#configuration-example)
- Agent hooks (see [Agents: Hooks Field](agents.md#frontmatter-fields))

---

## Testing and Validation

### Structure Tests

```typescript
describe('Plugin Structure', () => {
  it('should have manifest in correct location', () => {
    expect(fs.existsSync('.claude-plugin/plugin.json')).toBe(true);
  });

  it('should have skills at root level', () => {
    expect(fs.existsSync('skills')).toBe(true);
    expect(fs.existsSync('.claude-plugin/skills')).toBe(false);
  });
});
```

### Frontmatter Validation

```typescript
describe('Skill Frontmatter', () => {
  it('should have description for auto-discovery', () => {
    const frontmatter = parseFrontmatter(skillFile);
    expect(frontmatter.description).toBeDefined();
    expect(frontmatter.description.length).toBeGreaterThan(10);
  });

  it('should only reference valid tools', () => {
    const tools = (frontmatter['allowed-tools'] ?? '')
      .split(/[\s,]+/)
      .filter(Boolean);
    tools.forEach(tool => {
      expect(VALID_TOOLS).toContain(tool);
    });
  });
});
```

**See also:** [Skills: Validation](skills.md#validation) for `skills-ref` validation tool

### Hook Testing

```bash
# Test hook with sample input
echo '{"tool_name":"Bash","tool_input":{"command":"npm test"}}' | ./scripts/validate.sh
echo "Exit code: $?"
```

**See also:** [Hooks: Exit Codes](hooks.md#exit-codes) for behavior

### Debug Mode

```bash
claude --debug
```

Shows: Plugin loading, hook execution, MCP initialization, errors

---

## Distribution and Sharing

### Scope Options

| Scope | Location | Use Case |
|-------|----------|----------|
| Personal | `~/.claude/skills/` | Your workflows |
| Project | `.claude/skills/` | Team-shared |
| Plugin | Published plugin | Community distribution |

**For skills-only distribution:** Skills can be distributed standalone without a full plugin structure.

**See also:** [Skills](skills.md) for portable skill development

### Version Management

Follow semantic versioning:

```json
{
  "version": "2.1.0"
}
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes

### Publishing Checklist

- [ ] Manifest has required fields
- [ ] Components at root, not in `.claude-plugin/`
- [ ] Paths use `${CLAUDE_PLUGIN_ROOT}`
- [ ] Scripts executable (`chmod +x`)
- [ ] README documents installation/usage
- [ ] Version follows semver
- [ ] License specified
- [ ] Skills validated with `skills-ref` (see [Skills: Validation](skills.md#validation))
- [ ] Tests pass (structure, frontmatter, hooks)

---

## Quick Reference Checklist

### Skills

See [Skills](skills.md) for full details.

- [ ] Clear description for auto-invocation
- [ ] SKILL.md under 500 lines
- [ ] Supporting files referenced explicitly
- [ ] Tools scoped appropriately via `allowed-tools`
- [ ] `disable-model-invocation` if side effects

### Agents

See [Agents](agents.md) for full details.

- [ ] Focused on single domain
- [ ] Description explains when to delegate
- [ ] Tools explicitly specified/restricted
- [ ] Model selected for task complexity
- [ ] Skills preloaded if needed

### Hooks

See [Hooks](hooks.md) for full details.

- [ ] Uses `${CLAUDE_PLUGIN_ROOT}`
- [ ] Scripts executable
- [ ] Handles errors gracefully
- [ ] Fast execution
- [ ] Timeout configured

### MCP Servers

See [MCP Servers](mcp-servers.md) for full details.

- [ ] Single responsibility
- [ ] Clear input/output schemas
- [ ] Security considerations (least privilege, input validation)
- [ ] Environment variables for config

---

## Summary

Effective AI agent plugins balance portability with platform capabilities:

### Open Standards (Portable)

1. **[Skills](skills.md)** (Agent Skills standard) - Cross-platform knowledge and capabilities
2. **[MCP Servers](mcp-servers.md)** - Vendor-agnostic external integration
3. **[LSP Servers](lsp-servers.md)** - Universal code intelligence

### Vendor-Specific (Use When Needed)

4. **[Agents](agents.md)** - Platform-specific isolated execution
5. **[Hooks](hooks.md)** - Event automation (concepts portable; implementation varies)

### Key Principles

- **Start with open standards** for maximum portability (see [Principles](principles-and-standards.md))
- **Use vendor features** only when isolation, specific models, or advanced guardrails required
- **Follow industry patterns** (see [Orchestration Patterns](orchestration-and-decisions.md#orchestration-patterns))
- **Design for progressive disclosure** to minimize context consumption (see [Principles: Progressive Disclosure](principles-and-standards.md#progressive-disclosure))

When components stay in their lanes and open standards are used where available, the result is maintainable, portable, and context-efficient.

---

## Related Documentation

### Core Concepts
- [Principles and Standards](principles-and-standards.md)
- [Component Comparison](principles-and-standards.md#component-comparison)

### Component Details
- [Skills](skills.md) - Most portable component
- [Agents](agents.md) - Isolated execution
- [Hooks](hooks.md) - Event automation
- [MCP Servers](mcp-servers.md) - External integration
- [LSP Servers](lsp-servers.md) - Code intelligence

### Integration
- [Orchestration and Decision Framework](orchestration-and-decisions.md)

### Architecture Home
- [README](README.md)

---

## External Resources

### Open Standards
- [Agent Skills Specification](https://agentskills.io/specification)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)

### Vendor Documentation
- **Anthropic**: [Claude Code Plugins](https://code.claude.com/docs/en/plugins), [Skills](https://code.claude.com/docs/en/skills), [Hooks](https://code.claude.com/docs/en/hooks)
- **OpenAI**: [Building Agents Guide](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/), [Agents API](https://platform.openai.com/docs/guides/agents)
- **Microsoft**: [AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- **Cursor**: [Agent Skills](https://cursor.com/docs/context/skills)
- **Google**: [Prompt Design Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
