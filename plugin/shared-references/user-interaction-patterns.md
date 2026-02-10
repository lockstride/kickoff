# User Interaction Patterns

Universal UX guidance for consistent user interactions across commands and skills.

---

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
`${CLAUDE_PLUGIN_ROOT}/shared-references/skeptic-mode-structure.md`

---

## Table of Contents

- [How Patterns Are Invoked](#how-patterns-are-invoked)

- [TEXT-CONTINUATION](#text-continuation)
- [SELECTION-MENU](#selection-menu)
- [SELECTION-WITH-CUSTOM-INPUT](#selection-with-custom-input)
- [REVIEW-LOOP](#review-loop)
- [AUTO-CONTINUE](#auto-continue)
- [YES-NO-CONFIRMATION](#yes-no-confirmation)
- [Phrasing Conventions](#phrasing-conventions)

---

## How Patterns Are Invoked

Callers reference patterns with parameters that describe **intent**, not exact implementation.

### Parameters

| Parameter | Required | Agent Interpretation |
|-----------|----------|---------------------|
| `GOAL` | Yes | The outcome to achieve. Agent has freedom in execution. |
| `GUIDANCE` | No | Hints about content, phrasing, or options. Follow when reasonable. |
| `CONSTRAINT` | No | Hard rule. Must be respected. Used sparingly by callers. |

### Example Invocation

```markdown
**Pattern:** SELECTION-MENU — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Let user select from existing startups or create new
- GUIDANCE: Show each startup's next required document
- CONSTRAINT: "Create new" must be the last option
```

### Agent Responsibilities

1. **Achieve the GOAL** — This is the success criterion
2. **Consider GUIDANCE** — Apply when it improves clarity; adapt if context requires
3. **Respect CONSTRAINTS** — These are non-negotiable
4. **Avoid anti-patterns** — Each pattern lists what NOT to do
5. **Choose appropriate tools** — Use `AskUserQuestion` for structured input with text override, plain text for menus and confirmations

---

## TEXT-CONTINUATION

### Purpose

Confirm readiness to proceed at workflow checkpoints. User types a response.

### When to Use

- "Ready to proceed?" moments
- Simple confirmations with optional alternatives
- Transitions between workflow phases

### Anti-patterns

- Saying "Press enter to continue" — this doesn't work in Claude Code CLI
- Using for complex multi-option decisions (use SELECTION-MENU instead)
- Not punctuating this question with "?"

### Example

```
Startups path:    /Users/name/Startups
Development path: /Users/name/dev
Template repo:    https://github.com/lockstride/monorepo-nuxt-base

Ready to proceed? (type **yes** to continue, or suggest different paths)
```

---

## SELECTION-MENU

### Purpose

Present a numbered list of options where **only the numbered options are valid answers**. Custom text input is not semantically valid.

### When to Use

- Only the listed options are valid choices
- Number of options can vary (any count)
- User types a number in the text input field

### Required Format

**CRITICAL:** ALL options must be numbered sequentially (1, 2, 3, ...). No unnumbered bullets or text allowed.

### Anti-patterns

- Using `AskUserQuestion` (the automatic text input suggests custom values are valid when they're not)
- Inconsistent option formatting within a menu
- Missing "Enter a number:" prompt
- Adding a "Custom" or "Other" option (use SELECTION-WITH-CUSTOM-INPUT instead)
- **Leaving any option unnumbered** (all options must have sequential numbers)

### Example

```
Which startup would you like to work on?

1. PURPLE WALRUS      → product-brief
2. HealthTech AI      → product-spec
3. Neon Platypus      → market-analysis
4. Create new startup

Enter a number:
```

---

## SELECTION-WITH-CUSTOM-INPUT

### Purpose

Present a list of common options where **custom text input is also a valid answer**. Either selecting an option OR typing a custom value are semantically valid responses.

### When to Use

- Listed options provide common/suggested choices (minimum 2 options)
- Custom text input is a valid alternative (paths, names, URLs, etc.)
- Use `AskUserQuestion` for 2-4 explicit options
- Use plain text for 5+ options

### Tool Selection

**2-4 explicit options:** Use `AskUserQuestion`
- Tool automatically adds "Type something" text input as final option
- User navigates with arrow keys, selects with Enter
- Do NOT add explicit "Custom" or "Type your own" option (redundant)

**5+ explicit options:** Use plain text
- Display numbered list
- End with "Enter a number or type a custom value:" prompt

### Anti-patterns

- Adding explicit "Custom path" or "Type your own" option when using `AskUserQuestion` (tool already provides this)
- Using `AskUserQuestion` with 5+ options (exceeds tool limit)
- Using SELECTION-MENU when custom input should be valid

### Example (2-4 options, uses AskUserQuestion)

```
Where would you like to store startup documents?

1. ~/Startups
2. ~/Documents/Startups
3. ~/development/startups
4. Type something.
```

User navigates with arrow keys. Can select an option OR choose "Type something" to enter a custom path.

### Example (5+ options, uses plain text)

```
Where would you like to store startup documents?

1. ~/Startups
2. ~/Documents/Startups
3. ~/development/startups
4. ~/projects/startups
5. /opt/startups

Enter a number or type a custom path:
```

---

## REVIEW-LOOP

### Purpose

Present document review options after generation. This is a **fixed pattern** — always use these exact 5 options in this order.

### When to Use

- After generating a DRAFT document
- User needs to accept, edit, revise, regenerate, or discard

### Fixed Options

```
Your {document} draft is ready for review.

1. Accept — Finalize this version
2. Edit and reload — I've made manual edits to the DRAFT
3. Suggest changes — Tell me what to modify
4. Start fresh — Regenerate from scratch
5. Discard Draft and Exit — Delete DRAFT and exit

Enter a number:
```

### Anti-patterns

- Adding or removing options
- Reordering options
- Using different wording for the options

### Example Invocation

```markdown
**Pattern:** REVIEW-LOOP — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Present review options for the business brief draft
- GUIDANCE: If master document exists, append "(replaces existing)" to Accept option
```

---

## REVIEW-LOOP-POST-SKEPTIC

### Purpose

Present document review options after SKEPTIC MODE session. This is a **fixed pattern** — always use these exact 6 options in this order.

**SKEPTIC Insights Structure:** See `${CLAUDE_PLUGIN_ROOT}/shared-references/skeptic-mode-structure.md` (loaded in Required First Step)

### When to Use

- After SKEPTIC MODE completes with structured insights summary
- User needs to incorporate SKEPTIC feedback, accept as-is, edit, revise, regenerate, or discard

### Fixed Options

Display the full SKEPTIC insights summary (Validated Strengths, Identified Gaps, Revision Suggestions, Open Questions), then present:

```
Your {document} draft is ready for review.

1. Incorporate learnings from this SKEPTIC session
2. Accept — Finalize this version
3. Edit and reload — I've made manual edits to the DRAFT
4. Suggest changes — Tell me what to modify
5. Start fresh — Regenerate from scratch
6. Discard Draft and Exit — Delete DRAFT and exit

Enter a number:
```

### Option 1 Behavior

When "Incorporate learnings" is selected:
1. Extract actionable feedback from Identified Gaps + Revision Suggestions
2. Create succinct summary of changes needed
3. Present summary for user approval (YES-NO-CONFIRMATION)
4. If approved: business-writer makes targeted updates (NOT full regeneration)
5. After updates: return to standard 5-option REVIEW-LOOP

### Key Differences from REVIEW-LOOP

- **6 options instead of 5**: Adds "Incorporate learnings" as option 1
- **SKEPTIC insights displayed**: Show full structured summary before menu
- **After option 1**: Returns to standard 5-option loop (insights now applied)
- **Other options (2-6)**: Behave identically to standard review loop options (1-5)

### Distinction: "Incorporate learnings" vs "Suggest changes"

- **Incorporate learnings**: Uses pre-validated SKEPTIC insights for targeted updates
- **Suggest changes**: User provides custom feedback for any modifications

### Anti-patterns

- Adding or removing options
- Reordering options
- Using different wording for the options
- Skipping SKEPTIC insights display before menu
- Full document regeneration when incorporating learnings (should be targeted)

### Example Invocation

```markdown
**Pattern:** REVIEW-LOOP-POST-SKEPTIC — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Present review options with SKEPTIC insights incorporation as first choice
- GUIDANCE: Display the full SKEPTIC insights summary before the menu
```

---

## AUTO-CONTINUE

### Purpose

Prompt user to continue to the next workflow step. This is a **fixed pattern** — always use these exact 3 options.

### When to Use

- After completing a document or phase
- Transitioning to the next step in a sequence

### Fixed Options

```
Ready to continue to the next step?

{description of what's next}

1. Yes, continue now
2. Not yet — I need to review first
3. Different path — Show me other options

Enter a number:
```

### Anti-patterns

- Adding or removing options
- Reordering options
- Skipping this prompt and auto-continuing without consent

### Example Invocation

```markdown
**Pattern:** AUTO-CONTINUE — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Offer to continue to market analysis
- GUIDANCE: Explain that market analysis validates business assumptions
```

---

## YES-NO-CONFIRMATION

### Purpose

Simple binary decision. Use plain text, not `AskUserQuestion`.

### When to Use

- Confirming destructive actions
- Simple yes/no decisions
- Approval gates

### Anti-patterns

- Using `AskUserQuestion` (the text input suggests other responses are valid)
- Ambiguous questions where "yes" meaning is unclear
- Missing `(yes/no)` suffix

### Example

```
Found 3 startup(s) with missing directories:
  - "Neon Platypus" (expected at /Users/name/Startups/neon-platypus)
  - "Old Project" (expected at /Users/name/Startups/old-project)

Would you like to remove these entries from your config? (yes/no)
```

---

## Phrasing Conventions

Consistent language across all interactions.

### Action Prompts

| Scenario | Phrasing |
|----------|----------|
| Continue to next step | "Ready to continue to the next step?" |
| Confirm action | "Ready to proceed?" |
| Regenerate content | "Would you like to regenerate?" |
| Customize settings | "type **customize** to set different paths" |

### Status Messages

| Scenario | Phrasing |
|----------|----------|
| Success | "Configuration saved to ~/.lockstride/kickoff/config.json" |
| Next step | "You can now use /lockstride-kickoff:init to begin a new startup." |
| File location | "Your draft is ready for review at {path}" |
| Required action | "Please run /lockstride-kickoff:config first to set up your paths." |

### Option Descriptions

| Scenario | Phrasing |
|----------|----------|
| Accept draft | "Accept — Finalize this version" |
| Manual edit | "Edit and reload — I've made manual edits" |
| AI revision | "Suggest changes — Tell me what to modify" |
| Regenerate | "Start fresh — Regenerate from scratch" |
| Cancel | "Discard Draft and Exit — Delete DRAFT and exit" |

### Key Principles

- **Active voice**: "Finalize this version" not "This version will be finalized"
- **Present tense**: "Tell me what to modify" not "Tell me what should be modified"
- **Clear consequence**: Always follow options with em dash and brief description
- **Parallel structure**: Keep option formats consistent within a menu

---

## Summary

**Seven interaction patterns:**

| Pattern | Use Case | Tool |
|---------|----------|------|
| TEXT-CONTINUATION | Ready to proceed? confirmations | Plain text |
| SELECTION-MENU | Only numbered options valid (no custom input) | Plain text |
| SELECTION-WITH-CUSTOM-INPUT | 2+ numbered options OR custom input valid | AskUserQuestion (2-4 options) or Plain text (5+) |
| REVIEW-LOOP (Fixed) | Document review after generation | Plain text |
| REVIEW-LOOP-POST-SKEPTIC (Fixed) | Document review after SKEPTIC MODE with insights incorporation | Plain text |
| AUTO-CONTINUE (Fixed) | Workflow step continuation | Plain text |
| YES-NO-CONFIRMATION | Binary decisions | Plain text |

**Invocation model:**
- `GOAL` (required): What outcome to achieve
- `GUIDANCE` (optional): Hints for execution
- `CONSTRAINT` (optional): Hard rules — use sparingly

