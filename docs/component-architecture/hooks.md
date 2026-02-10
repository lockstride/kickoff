# Hooks and Guardrails

Part of: [Component Architecture](README.md) > [Component Reference](README.md#component-quick-reference) > Hooks

Hooks are event handlers implementing guardrails—safety mechanisms ensuring predictable, secure agent operation.

---

## Table of Contents

- [Overview](#overview)
- [Industry Guardrail Types](#industry-guardrail-types)
- [Hook Events (Claude Code)](#hook-events-claude-code)
- [Hook Types](#hook-types)
- [Configuration](#configuration)
- [Exit Codes](#exit-codes)
- [Best Practices](#best-practices)

---

## Overview

**Standard:** Vendor-specific (concepts portable; implementation varies)  
**Portability:** Low - implementation details vary by platform  
**Use for:** Event-driven automation, validation, and safety checks

Hooks implement **guardrails**—automated checks ensuring agents operate safely and predictably. The concept is universal across AI platforms; implementation is platform-specific.

**See also:**
- [Principles: Separation of Concerns](principles-and-standards.md#separation-of-concerns) - Hooks for validation, not knowledge
- [Orchestration: Hook-Enforced Validation](orchestration-and-decisions.md#hook-enforced-validation)

---

## Industry Guardrail Types

These guardrail concepts are consistent across vendors ([OpenAI guidance](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)):

| Guardrail | Purpose | Claude Code Implementation |
|-----------|---------|---------------------------|
| Relevance classifier | Keep responses in scope | `UserPromptSubmit` |
| Safety classifier | Detect jailbreaks | `PreToolUse` validation |
| PII filter | Prevent data exposure | `PostToolUse` output check |
| Tool safeguards | Risk-rate operations | `PreToolUse` with exit 2 |
| Output validation | Ensure quality | `Stop` hook |

---

## Hook Events (Claude Code)

The following events are Claude Code-specific. Other platforms may use different event models.

| Event | Fires | Common Use |
|-------|-------|------------|
| `SessionStart` | Session begins | Load context, initialize state |
| `UserPromptSubmit` | User submits prompt | Validate input, check scope |
| `PreToolUse` | Before tool executes | Validate parameters, block dangerous operations |
| `PostToolUse` | After tool success | Run linters, check output, log operations |
| `Stop` | Agent finishes turn | Verify completion, cleanup |
| `SubagentStop` | Subagent finishes | Cleanup subagent resources |
| `Setup` | With `--init` flag | Install dependencies, configure environment |

**See also:** [Orchestration: Hook-Enforced Validation](orchestration-and-decisions.md#hook-enforced-validation) for workflow patterns.

---

## Hook Types

### Command Hooks

Execute shell scripts for validation or automation.

```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh",
  "timeout": 5000
}
```

**Use for:**
- Fast validation checks
- Linting and formatting
- File system operations
- Logging and auditing

### Prompt Hooks

Evaluate conditions using LLM reasoning.

```json
{
  "type": "prompt",
  "prompt": "Is this bash command safe? Command: {{tool_input.command}}",
  "temperature": 0.0
}
```

**Use for:**
- Semantic validation
- Context-aware decisions
- Natural language checks
- Complex reasoning

### Agent Hooks

Run full agentic verification.

```json
{
  "type": "agent",
  "agent": "security-checker"
}
```

**Use for:**
- Complex multi-step validation
- Deep analysis
- Comprehensive reviews

**See also:** [Agents](agents.md) for agent configuration.

---

## Configuration

### Plugin-Level Hooks

In `plugin.json` or `hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm lint:fix"
          }
        ]
      }
    ]
  }
}
```

### Agent-Scoped Hooks

In agent frontmatter (see [Agents: Frontmatter Fields](agents.md#frontmatter-fields)):

```markdown
---
name: deployer
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-deployment.sh"
---
```

**See also:**
- [Plugin Structure: Hooks Directory](plugin-structure.md#directory-layout)
- [Agents: Hooks Field](agents.md#frontmatter-fields)

---

## Exit Codes

Hook scripts communicate results via exit codes:

| Exit Code | Meaning | Behavior |
|-----------|---------|----------|
| `0` | Success | Continue normally |
| `2` | Blocking error | Block operation (where supported) |
| Other | Non-blocking error | Log warning, continue |

**Example validation script:**

```bash
#!/bin/bash
# scripts/validate.sh

COMMAND=$(echo "$1" | jq -r '.tool_input.command')

# Check for dangerous operations
if echo "$COMMAND" | grep -qE 'rm -rf|sudo|curl.*\|.*bash'; then
  echo "Dangerous command detected: $COMMAND" >&2
  exit 2  # Block
fi

exit 0  # Allow
```

**See also:** [Plugin Structure: Hook Testing](plugin-structure.md#hook-testing)

---

## Best Practices

### Performance

1. **Keep hooks fast** - Set reasonable timeouts (< 5 seconds for command hooks)
2. **Avoid expensive operations** - Offload heavy work to background processes
3. **Cache results** - Reuse validation results when possible

### Reliability

1. **Handle errors gracefully** - Always handle unexpected inputs
2. **Use `${CLAUDE_PLUGIN_ROOT}`** - Make paths portable across installations
3. **Make scripts executable** - `chmod +x scripts/*.sh`
4. **Test independently** - Run hooks standalone before integration

### Security

1. **Validate all inputs** - Never trust hook inputs blindly
2. **Sanitize outputs** - Prevent injection attacks
3. **Limit permissions** - Run with minimal necessary privileges
4. **Log security events** - Audit trail for sensitive operations

**Example robust validation:**

```bash
#!/bin/bash
set -euo pipefail

# Validate input exists
if [ -z "${1:-}" ]; then
  echo "No input provided" >&2
  exit 1
fi

# Parse with error handling
COMMAND=$(echo "$1" | jq -r '.tool_input.command // empty')
if [ -z "$COMMAND" ]; then
  echo "Could not parse command" >&2
  exit 1
fi

# Validation logic
# ... 

exit 0
```

**See also:**
- [Principles: Least Privilege](principles-and-standards.md#least-privilege)
- [MCP Servers: Security by Design](mcp-servers.md#security-by-design)

---

## Related Documentation

### Core Concepts
- [Principles: Separation of Concerns](principles-and-standards.md#separation-of-concerns)
- [Principles: Least Privilege](principles-and-standards.md#least-privilege)
- [Orchestration: Responsibility Boundaries](orchestration-and-decisions.md#responsibility-boundaries)

### Patterns
- [Orchestration: Hook-Enforced Validation](orchestration-and-decisions.md#hook-enforced-validation)
- [Decision Framework: Event-Driven Tasks](orchestration-and-decisions.md#i-want-claude-to)

### Implementation
- [Plugin Structure: Hooks Directory](plugin-structure.md#directory-layout)
- [Plugin Structure: Environment Variables](plugin-structure.md#environment-variables)
- [Testing: Hook Testing](plugin-structure.md#hook-testing)

### Related Components
- [Agents](agents.md) - Can have agent-scoped hooks
- [Skills](skills.md) - Hooks validate skill operations
- [MCP Servers](mcp-servers.md) - Hooks can validate MCP tool usage

---

## External Resources

- [OpenAI: Guardrails for AI Agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [Anthropic: Claude Code Hooks](https://code.claude.com/docs/en/hooks)
