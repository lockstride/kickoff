# Orchestration Patterns and Decision Framework

Part of: [Component Architecture](README.md) > Integration

Guidance on understanding plugin components, distinguishing between them, and coordinating them into workflows.

---

## Table of Contents

- [Component Overview](#component-overview)
- [Core Concept: Skills vs Agents](#core-concept-skills-vs-agents)
- [Orchestration Patterns](#orchestration-patterns)
- [Agent + Skill Interaction Patterns](#agent--skill-interaction-patterns)
- [Decision Framework](#decision-framework)
- [Model Selection](#model-selection)

---

## Component Overview

The plugin architecture consists of five distinct components, each serving a specific role in the AI's operation.

| Component | Role | Analogy | Key Characteristics |
|-----------|------|---------|---------------------|
| **[Skill](skills.md)** | **Knowledge** | The **Recipe** | Portable instructions, reusable workflows, domain expertise. Platform-agnostic. |
| **[Agent](agents.md)** | **Execution** | The **Chef** | Isolated runtime, specific tools, defined persona, permission boundaries. Vendor-specific. |
| **[Hook](hooks.md)** | **Governance** | The **Health Inspector** | Event-driven validation, security guardrails, quality control. Runs automatically. |
| **[MCP Server](mcp-servers.md)** | **Integration** | The **Appliance** | Connection to external systems (databases, APIs) or file operations. |
| **[LSP Server](lsp-servers.md)** | **Intelligence** | The **Reference Manual** | Code analysis, auto-complete, diagnostics, type definitions. |

---

## Core Concept: Skills vs Agents

The distinction between **Skills** and **Agents** (often called "sub-agents" in Claude Code) is the most critical architectural decision you will make.

### The Analogy: The Chef and The Recipe

To visualize the relationship, imagine a professional kitchen:

#### 1. The Skill is the Recipe
A **Skill** is a set of instructions. It contains the "what" and the "how":
- **Portable**: You can take a recipe to any kitchen (Claude, Cursor, etc.), and it works.
- **Passive**: A recipe sit on the shelf until someone reads it.
- **Composable**: You can combine a "Sauce Recipe" with a "Pasta Recipe".
- **Example**: `api-conventions` (guidelines for building APIs).

#### 2. The Agent is the Chef
An **Agent** is the worker who executes the task. It represents the "who" and the "where":
- **Isolated**: A chef has their own station (context window). Messes made here don't clutter the main kitchen.
- **Equipped**: A chef has specific tools (knives, ovens) and permissions (can they order ingredients?).
- **Skilled**: A chef can memorize recipes (preloaded skills) to be ready instantly.
- **Example**: `backend-dev` (a specialized worker with filesystem access and preloaded `api-conventions`).

### Navigating the Blurry Lines

In practice, the lines can blur because both Skills and Agents can "do things." Here is how to distinguish them in edge cases.

#### "Forked Skills" vs Agents
You can run a Skill with `context: fork`. This creates a temporary, isolated context for the skill to run—much like an Agent.

*   **Forked Skill**: "Send a general line cook to a separate prep station with just this recipe."
    *   *Use when:* You need a one-off task done cleanly (e.g., "Analyze this huge log file") without setting up a permanent specialized role.
    *   *Tools:* Limited to what the recipe calls for (`allowed-tools`).
    *   *Identity:* Generic AI assistant following specific instructions.

*   **Agent**: "Hire a specialized Pastry Chef who has their own station and tools."
    *   *Use when:* You have a repeating role with specific security needs, toolsets, or personality.
    *   *Tools:* Strictly defined by the agent configuration.
    *   *Identity:* Defined persona ("You are a Senior QA Engineer...").

#### Tool Access (`allowed-tools` vs `tools`)
*   **Skill (`allowed-tools`)**: "For this recipe, you are allowed to use the Blender."
    *   This is a *request* for capabilities needed to complete the instruction.
*   **Agent (`tools`)**: "This station is equipped with a Blender, Mixer, and Oven."
    *   This is a *constraint* on the environment. The agent physically cannot access tools not listed.

### Summary: Which should I build?

| If you want to... | Build a... | Because... |
|-------------------|------------|------------|
| Teach the AI *how* to do a task | **Skill** | Knowledge should be portable and reusable. |
| Create a permanent "role" for the team | **Agent** | You need a consistent identity and toolset. |
| Perform a heavy, one-off analysis | **Skill (Forked)** | It keeps the main conversation clean. |
| Restrict dangerous operations (e.g., deployment) | **Agent** | You can strictly limit tools and require permissions. |

---

## Orchestration Patterns

Multi-agent coordination patterns are consistent across vendors ([Microsoft](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns), [OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/), [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/agent-patterns), [Google](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/design-multimodal-prompts#agent-patterns)).

### Sequential
Agents process tasks in linear order. Each output becomes next input.
- **How to implement:** In your prompt or Skill instructions, explicitly chain steps: "First call Agent A, wait for the result, then call Agent B with that result."
- `Input → Agent 1 → Agent 2 → Agent 3 → Result`

**Example - Metadata-Driven Orchestration:**

Components often need to vary their behavior based on data/configuration rather than hardcoded logic. Use structured metadata (YAML frontmatter, JSON configs, etc.) to declare workflow requirements.

```
Orchestrator reads metadata/config
  ↓
IF metadata indicates prerequisite needed
  ↓
Spawns Agent A (prerequisite task)
  ↓
Agent A returns structured output
  ↓
Spawns Agent B (main task, receives A's output)
  ↓
Final result
```

**Benefits:**
- Add new workflows without changing orchestrator code
- Declarative: metadata describes what's needed, orchestrator executes
- Single source of truth: requirements live with the data they govern
- Scalable: new metadata fields enable new orchestration paths

**Common applications:**
- Templates declaring which preprocessing skills they need
- Documents listing their dependencies for validation
- Configs specifying which agents to invoke for different task types

### Concurrent
Multiple agents work simultaneously, providing independent analyses.
- **How to implement:** Issue multiple tool calls in a single turn (if supported) or instruct the model to "Launch Agent A and Agent B in parallel."
- `Input → [Agent 1, Agent 2, Agent 3] → Aggregated Result`

### Manager
Central agent orchestrates specialists via tool calls.
- **How to implement:** Create a "Manager Agent" whose system prompt is "You are a manager. Delegate work to [Agent A, Agent B]." Give it the tool permissions to call those agents.
- `User → Manager → [Specialist 1, Specialist 2]`

### Handoff
Agents transfer control based on task requirements.
- **How to implement:** Instruct Agent A: "If the user asks about billing, call the Billing Agent and stop."
- `Triage → Technical → Billing → Resolution`

### Skill with Progressive Disclosure
Primary pattern for portable, context-efficient expertise.
1. **Discovery:** Agent checks lightweight skill descriptions (~100 tokens).
2. **Matching:** Agent decides a skill is relevant.
3. **Loading:** Agent calls `GetSkill(name)` or reads the file, loading full content (~5000 tokens).
- **How to implement:** Write a clear `description` in your Skill's YAML frontmatter.

### Hook-Enforced Validation
Guardrails validating operations before/after execution.
- **How to implement:** Define a `PreToolUse` hook in `plugin.json` or your Agent/Skill file that intercepts specific tool calls (e.g., `Bash`).
- `Agent Tool Call → PreToolUse Hook → Tool Execution → PostToolUse Hook`

---

## Agent + Skill Interaction Patterns

How "Chefs" and "Recipes" work together.

### Pattern 1: Agent with Preloaded Skills (The Specialist)
**"The Pastry Chef who memorized the dessert menu."**

The agent starts with specific skills loaded into its context. It is immediately ready to execute specialized tasks without searching.
*   **Best for:** High-frequency workflows, enforcement of strict standards (e.g., Code Reviewer).
*   **Implementation:** In the Agent's markdown file, add a `skills` list to the frontmatter:
    ```yaml
    skills:
      - api-conventions
      - security-checklist
    ```

### Pattern 2: Discovery & Delegation (The Head Chef)
**"The Head Chef looks up a recipe, then assigns it to a line cook."**

1.  Main agent (Head Chef) receives a request.
2.  Finds the relevant Skill (Recipe) via its description.
3.  Delegates the task to a specialized Agent (Cook), passing the Skill along.
*   **Best for:** Complex workflows where the specific expertise isn't known until runtime.
*   **Implementation:**
    1. Define Skill with clear description.
    2. Define Agent (e.g., `deployer`).
    3. In Main Agent/User prompt: "Find the deployment guide, then ask the deployer agent to execute it."

### Pattern 3: Skill with Forked Context (The Prep Station)
**"Sending a line cook to the back room to chop onions."**

The Main Agent invokes a Skill in a temporary, isolated context (`context: fork`). The skill executes, and only the final result is returned to the main conversation.
*   **Best for:** Reading large files, heavy analysis, or tasks that would clutter the chat history.
*   **Implementation:** In the Skill's frontmatter, set `context: fork`.
    ```yaml
    context: fork
    ```

### Pattern 4: Shared Skill Knowledge (The Standard Operating Procedure)
**"Everyone uses the same hygiene manual."**

Multiple different Agents refer to the same set of Skills.
*   **Example:** A `backend-dev` agent and a `frontend-dev` agent both load the same `api-conventions` skill to ensure they build compatible software.
*   **Best for:** Maintaining consistency across a team of agents.
*   **Implementation:** Simply list the same skill name in the `skills:` frontmatter list of multiple agents.

### Pattern 5: Skill-First (The Generalist)
**"Try cooking it yourself first; call the specialist only if it's hard."**

1.  Try to solve the user's request using a Skill in the main context.
2.  If the task is too complex or risky, delegate to a specialized Agent.
*   **Best for:** Keeping the system simple and strictly escalating when necessary.
*   **Implementation:** In the Skill instructions (markdown body), add a conditional rule:
    > "IF the user asks to deploy to production, YOU MUST STOP and call the `deployer` agent."

---

## Decision Framework

### Responsibility Boundaries

Where should logic live?

| Concern | Belongs In | NOT In | Details |
|---------|------------|--------|---------|
| Domain knowledge | [Skill](skills.md) | [Hook](hooks.md) | Skills provide "what"; hooks enforce "when". |
| Output structure | Skill templates | [Agent](agents.md) | Templates live with the skill. |
| When to run | [Skill description](skills.md) | [Hook](hooks.md) | Descriptions enable discovery. |
| Isolated execution | [Agent](agents.md) | Skill content | Agents provide stable environments. |
| Tool restrictions | [Agent](agents.md) | [Hook](hooks.md) | Declare restrictions upfront in Agent config. |
| Event reactions | [Hook](hooks.md) | [Skill](skills.md) | Hooks respond to events automatically. |
| External systems | [MCP Server](mcp-servers.md) | [Skill](skills.md) | MCP handles the connection. |

### Component Selection Flowchart

```
Does it provide knowledge/instructions?
├── Yes → Is isolation needed?
│         ├── Yes → Agent or Skill with context: fork
│         └── No → Skill
│
├── Is it event-driven?
│   └── Yes → Hook
│
├── Does it integrate external systems?
│   └── Yes → MCP Server
│
└── Does it provide code intelligence?
    └── Yes → LSP Server
```

---

## Model Selection

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| Simple validation | `haiku` | Fast, low-cost |
| Codebase exploration | `haiku` | Speed matters |
| Code review | `sonnet` | Balanced |
| Complex reasoning | `inherit` | Full capability |
| Nuanced dialogue | `inherit` | Subtle understanding |

---

## Related Documentation

- [Principles and Standards](principles-and-standards.md)
- [Skills Component](skills.md)
- [Agents Component](agents.md)
