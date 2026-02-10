# MCP Servers

Part of: [Component Architecture](README.md) > [Component Reference](README.md#component-quick-reference) > MCP Servers

MCP (Model Context Protocol) standardizes AI connections to external tools and services through an open protocol.

---

## Table of Contents

- [Overview](#overview)
- [What MCP Servers Provide](#what-mcp-servers-provide)
- [Architecture Patterns](#architecture-patterns)
- [Configuration Example](#configuration-example)
- [Design Best Practices](#design-best-practices)
- [Transport Selection](#transport-selection)
- [Common Use Cases](#common-use-cases)
- [Limitations](#limitations)
- [Example: Simple MCP Server](#example-simple-mcp-server)

---

## Overview

**Standard:** [MCP](https://modelcontextprotocol.io) (open protocol)  
**Portability:** High - servers portable across MCP-compatible clients; config format varies  
**Use for:** External tool and data integration

MCP is an **open protocol** standardizing AI connections to external tools and services. It provides a universal interface that works across MCP-compatible clients (Claude Code, OpenAI, Cursor, etc.), enabling AI applications to integrate with external systems through a consistent, well-defined contract.

**See also:**
- [Principles: Open Standards - MCP](principles-and-standards.md#model-context-protocol-mcp)
- [Component Comparison: MCP vs LSP](principles-and-standards.md#comparison-mcp-vs-lsp)

---

## What MCP Servers Provide

MCP servers expose three core capabilities with typed schemas:

| Capability | Description | Example Use Cases |
|------------|-------------|-------------------|
| **Tools** | Executable actions with input/output schemas and side-effect disclosure | Database queries, file operations, API calls, deployment actions |
| **Resources** | Readable data sources that provide context to AI models | File contents, database records, API responses, documentation |
| **Prompts** | Pre-defined interaction templates that standardize tasks | Code review templates, commit message formats, analysis frameworks |

**Key difference from LSP:** MCP handles operations with side effects; [LSP](lsp-servers.md) provides read-only analysis.

---

## Architecture Patterns

### Direct Connection (stdio transport)

```
AI Client → MCP Server → External System
```

**Best for:** Local, per-user integrations with strong isolation. Launched by client, no inbound networking.

**Use cases:**
- Developer workflows
- Privacy-sensitive data
- Single-user applications

### Gateway Pattern (HTTP transport)

```
AI Client → MCP Gateway → Multiple MCP Servers → External Systems
              ↓
        (AuthN/AuthZ, Policy, Routing, Catalog)
```

**Best for:** Enterprise deployments requiring centralized security, multi-tenancy, rate limiting, and compliance.

**Use cases:**
- Multi-tenant environments
- Enterprise security requirements
- Centralized policy enforcement

---

## Configuration Example

Claude Code configuration (`.mcp.json`):

```json
{
  "mcpServers": {
    "database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    }
  }
}
```

**Tool naming convention:** `mcp__<server>__<tool>` (e.g., `mcp__github__search_repositories`)

**See also:**
- [Plugin Structure: MCP Configuration](plugin-structure.md#directory-layout)
- [Plugin Structure: Environment Variables](plugin-structure.md#environment-variables)

---

## Design Best Practices

### 1. Single Responsibility

- One clear domain per server (e.g., `github-server` handles GitHub operations only)
- One authentication boundary (all tools use same credentials/scopes)
- Focused toolset (5-15 related tools, not 50+ kitchen-sink operations)

**Anti-pattern:** Combining unrelated domains (e.g., GitHub + Slack + Database in one server)

### 2. Contracts-First

- Strict JSON schemas for all inputs/outputs
- Explicit side-effect disclosure (`read_only: false`)
- Document error conditions and codes

**Example tool schema:**

```json
{
  "name": "create_pull_request",
  "description": "Creates a new pull request. Side effect: Creates GitHub resource.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": {"type": "string", "maxLength": 256},
      "base": {"type": "string", "pattern": "^[a-zA-Z0-9/_-]+$"}
    },
    "required": ["title", "base"]
  }
}
```

### 3. Stateless by Default

- No hidden server-side state between requests
- For stateful operations, externalize state (cache, database) with clear TTLs
- Enables horizontal scaling and resilient restarts

### 4. Security by Design

- **Least privilege:** Default to read-only tools; restrict write operations
- **Fine-grained authorization:** Scope permissions per tool (e.g., `github:issues:read` vs `github:issues:write`)
- **Input validation:** Enforce schemas strictly; reject malformed requests
- **Output sanitization:** Prevent injection attacks in downstream systems

**See also:** [Principles: Least Privilege](principles-and-standards.md#least-privilege)

### 5. Progressive Authorization

- Start with minimal scopes (e.g., `mcp:tools-basic`)
- Request additional permissions when needed via `WWW-Authenticate` challenges
- Reduces blast radius if tokens are compromised

### 6. Idempotency

- Use client-provided idempotency keys for create/update operations
- Safe retries on transient failures
- Compensating actions (rollback tools) where feasible

---

## Transport Selection

| Transport | Best For | Limitations |
|-----------|----------|-------------|
| **stdio** | Local tools, developer workflows, privacy-sensitive data | No remote access, single-user, client-managed lifecycle |
| **HTTP (SSE)** | Remote services, enterprise integrations, multi-tenant | Requires standard web hardening, TLS, authentication |

**Decision guide:** Use stdio for local/personal tools; HTTP for shared/enterprise services.

---

## Common Use Cases

### Good MCP Server Examples

- **Database connector:** Query schemas, read/write records, transaction management
- **Cloud provider:** List resources, deploy services, manage configurations
- **Developer tools:** Git operations, CI/CD triggers, code analysis
- **Business systems:** CRM operations, ticket management, analytics queries

### Anti-Patterns to Avoid

- **Token passthrough:** Never accept upstream tokens without validation (see [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices))
- **Kitchen-sink servers:** Avoid combining unrelated domains
- **Implicit side effects:** Always declare write operations and state changes
- **Wildcard scopes:** Use specific permissions, not `*` or `admin:*`

---

## Limitations

- **Discovery overhead:** Client must enumerate tools/resources at connection time
- **Schema complexity:** JSON Schema can be verbose for complex operations
- **No native streaming:** Long-running operations require polling or async patterns
- **Client dependencies:** Requires MCP-compatible client; not standalone

---

## Example: Simple MCP Server

Python implementation using official SDK:

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

app = Server("example-server")

@app.list_tools()
async def list_tools():
    return [{
        "name": "get_weather",
        "description": "Get current weather for a location",
        "inputSchema": {
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            },
            "required": ["location"]
        }
    }]

@app.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "get_weather":
        # Validate input, call weather API, return result
        return {"temperature": 72, "conditions": "sunny"}

async def main():
    async with stdio_server() as streams:
        await app.run(*streams)
```

**See also:** [Official Python SDK](https://github.com/modelcontextprotocol/python-sdk) for complete examples.

---

## Related Documentation

### Core Concepts
- [Principles: Open Standards - MCP](principles-and-standards.md#model-context-protocol-mcp)
- [Principles: Separation of Concerns](principles-and-standards.md#separation-of-concerns)
- [Component Comparison: MCP vs LSP](principles-and-standards.md#comparison-mcp-vs-lsp)

### Integration
- [Decision Framework: External System Integration](orchestration-and-decisions.md#component-selection-flowchart)
- [Skills can use MCP tools](skills.md) via `allowed-tools`
- [Agents can use MCP tools](agents.md) via `tools` field
- [Hooks can validate MCP operations](hooks.md) via `PreToolUse`

### Implementation
- [Plugin Structure: MCP Configuration](plugin-structure.md#directory-layout)
- [Plugin Structure: Environment Variables](plugin-structure.md#environment-variables)

### Related Components
- [LSP Servers](lsp-servers.md) - For code intelligence (read-only)
- [Skills](skills.md) - Can invoke MCP tools
- [Agents](agents.md) - Can be restricted to specific MCP tools
- [Hooks](hooks.md) - Can validate MCP tool usage

---

## Resources

### Official Documentation
- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Best Practices Guide](https://mcp-best-practice.github.io/mcp-best-practice/)
- [MCP Security Best Practices](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)

### SDKs
- [Official Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
