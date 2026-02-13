---
name: gathering-input
description: Interactive input gathering for documents requiring subjective decisions. Routes to topic-specific conversations, captures structured output.
user-invocable: false
allowed-tools: Read Write AskUserQuestion
---

# Gathering Input Methodology

Interactive methodology for gathering validated input through structured conversations. This skill runs in the parent context (not as a subagent) to enable direct user interaction via AskUserQuestion.

## Required First Step

BEFORE interacting with the user, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`

**Execution context**: This skill is invoked inline by the generating-documents skill. After completing topic-specific conversation, it writes a structured summary to `.{document_type}-input.md` which is then passed to the business-writer agent for document generation.

---

## Core Process

### Step 1: Receive Parameters

You will be invoked with:
- `document_type`: Which document to gather input for (business-brief, brand-brief, product-brief)
- `startup_name`: Name of the startup
- `internal_path`: Path to internal documents directory

### Step 2: Load Topic File

Load the appropriate topic file using relative path:
- `business-brief` → `references/business-brief-topic.md`
- `brand-brief` → `references/brand-brief-topic.md`
- `product-brief` → `references/product-brief-topic.md`

Read the topic file to understand:
- Questions to ask
- Conversation flow
- Output format requirements

### Step 3: Check for Prior Session

At the START of every session, ALWAYS:

1. Check if `{internal_path}/.{document_type}-input.md` exists
2. If it exists, read it fully to seed context
3. Present an alignment checkpoint summarizing prior progress
4. Ask for continuation decision:

**Pattern:** TEXT-CONTINUATION — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user choose to continue refining prior input or start fresh
- GUIDANCE: Summarize prior progress before asking

If starting fresh, acknowledge prior work was captured but allow full re-exploration.

**Migration note**: Also check for legacy filename `.brainstorming-summary.md` (used before this refactor). If found and document_type is business-brief, rename it to `.business-brief-input.md` and proceed.

### Step 4: Execute Topic Conversation

Follow the conversation flow defined in the loaded topic file:
- Ask questions in sequence
- Use AskUserQuestion for structured input where appropriate
- Present alignment checkpoints at key milestones
- Adapt based on user responses

### Step 5: Write Session File

After completing the conversation, write structured output to:
`{internal_path}/.{document_type}-input.md`

The file format should match the structure defined in the topic file.

### Step 6: Signal Completion

Return to caller (generating-documents skill) which will:
- Spawn business-writer subagent with input_source parameter (subagent receives fresh context automatically)
- Generate the document using the captured input

---

## Quality Standards

- **Conversational but focused**: Keep responses engaging but drive toward completion
- **Acknowledge responses**: Validate user input before moving to next question
- **Flexible within structure**: Adapt question depth based on user detail level
- **Clear progress indicators**: Let users know where they are in the process
- **Preserve context**: Session files persist between invocations for iterative refinement

---

## Error Handling

- **Missing topic file**: Report error and list available topics
- **Invalid document_type**: Report supported types (business-brief, brand-brief, product-brief)
- **Incomplete session**: Allow graceful exit, preserve partial progress in session file
- **File write errors**: Report path and permission issues clearly

---

## Output

Generate a complete session file at the specified path, ready for the business-writer agent to use as input_source.
