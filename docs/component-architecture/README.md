# AI Agent Plugin Architecture Guide

A comprehensive reference for designing and building AI agent plugins using open standards and best practices. This guide prioritizes portable, vendor-agnostic approaches while documenting Anthropic's Claude Code as the primary reference implementation.

---

## Table of Contents

### Foundation
- [Principles and Standards](principles-and-standards.md) - Core architectural principles, open standards (Agent Skills, MCP, LSP)

### Components
- [Skills](skills.md) - Primary method for extending agents with domain expertise
- [Agents](agents.md) - Isolated execution contexts with specific constraints
- [Hooks](hooks.md) - Event-driven automation and guardrails
- [MCP Servers](mcp-servers.md) - External tool and data integration via Model Context Protocol
- [LSP Servers](lsp-servers.md) - Code intelligence via Language Server Protocol

### Integration
- [Orchestration and Decision Framework](orchestration-and-decisions.md) - Multi-agent patterns, component selection, agent+skill interactions

### Implementation
- [Plugin Structure](plugin-structure.md) - Directory layout, manifest, distribution

---

## Quick Navigation by Goal

### "I want to..."

| Goal | Read |
|------|------|
| **Understand the basics** | Start with [Principles and Standards](principles-and-standards.md) |
| **Add domain expertise** | [Skills](skills.md) |
| **Run tasks in isolation** | [Agents](agents.md) or [Skills with forked context](skills.md#context-modes) |
| **Validate operations** | [Hooks](hooks.md) |
| **Connect to external systems** | [MCP Servers](mcp-servers.md) |
| **Get code intelligence** | [LSP Servers](lsp-servers.md) |
| **Choose the right component** | [Orchestration and Decision Framework](orchestration-and-decisions.md#decision-framework) |
| **Coordinate multiple agents** | [Orchestration Patterns](orchestration-and-decisions.md#orchestration-patterns) |
| **Package for distribution** | [Plugin Structure](plugin-structure.md) |

---

## Introduction

AI agents independently accomplish tasks by leveraging language models to manage workflows, make decisions, and take actions through tools—all while operating within defined guardrails.

### Guiding Philosophy

1. **Open standards first**: Use portable formats ([Agent Skills](https://agentskills.io), [MCP](https://modelcontextprotocol.io), [LSP](https://microsoft.github.io/language-server-protocol/))
2. **Vendor-agnostic where possible**: Design for cross-platform compatibility
3. **Document platform specifics**: Note implementation differences (Anthropic/Claude Code as primary reference)

### Reading Guide

**New to plugin development?** Read in this order:
1. [Principles and Standards](principles-and-standards.md) - Understand the foundation
2. [Skills](skills.md) - Most important portable component
3. [Orchestration and Decision Framework](orchestration-and-decisions.md) - Learn when to use what
4. Other components as needed

**Experienced developer?** Jump directly to:
- [Decision Framework](orchestration-and-decisions.md#decision-framework) for quick component selection
- [Orchestration Patterns](orchestration-and-decisions.md#orchestration-patterns) for multi-agent coordination
- Specific component pages for detailed reference

---

## Component Quick Reference

| Component | Purpose | Runs In | Standard | Portability | Details |
|-----------|---------|---------|----------|-------------|---------|
| **Skill** | Knowledge/workflows | Main context (or fork) | Open (Agent Skills) | High | [Skills](skills.md) |
| **Agent** | Isolated execution | Separate context | Vendor-specific | Low | [Agents](agents.md) |
| **Hook** | Event automation | External process | Vendor-specific | Low | [Hooks](hooks.md) |
| **MCP Server** | External integration | External process | Open (MCP) | High | [MCP Servers](mcp-servers.md) |
| **LSP Server** | Code intelligence | Background process | Open (LSP) | High | [LSP Servers](lsp-servers.md) |

**Recommendation:** Maximize use of [open standards](principles-and-standards.md#open-standards) (Skills, MCP, LSP) for portability.

---

## Key Principles Summary

See [Principles and Standards](principles-and-standards.md) for complete details.

### Single Source of Truth
Every concept should exist in exactly one place to minimize token consumption, ensure consistency, and simplify maintenance.

### Separation of Concerns
Each component has a distinct responsibility:

| Component | Responsibility |
|-----------|----------------|
| **Skills** | Knowledge and capabilities |
| **Agents** | Isolated execution with constraints |
| **Hooks** | Event-driven automation |
| **MCP Servers** | External tool and data integration |
| **LSP Servers** | Code intelligence |

### Progressive Disclosure
Load context only when needed. Skill descriptions should be lightweight (~100 tokens); full content (~5000 tokens) loads on invocation.

### Maximum Reusability
Design for general use, parameterize for specifics.

### Least Privilege
Grant only necessary permissions and tool access.

---

## Related Documentation

- [General Architecture Overview](../general-architecture.md) - Historical reference (now split into this directory)
- [Kickoff Architecture](../kickoff-architecture.md) - Kickoff-specific patterns
- [Development Guide](../development.md) - Setup and testing
- [User Interaction Patterns](../../shared-references/user-interaction-patterns.md) - Universal UX guidance
- [Config Resolution](../../shared-references/config-resolution.md) - Configuration management
- [Document Workflow Patterns](../../skills/generating-documents/references/internal-workflow.md) - Document generation workflows
