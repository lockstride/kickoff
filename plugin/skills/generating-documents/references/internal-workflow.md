# Internal Document Generation Workflow

Document-generation-specific interaction patterns for the generating-documents skill. Follow these patterns to keep behavior consistent.

## Required First Step

BEFORE taking any other action, you MUST use the `view` tool to read:
- User interaction guidance: `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- Config resolution logic: `${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md`
- SKEPTIC insights structure: `${CLAUDE_PLUGIN_ROOT}/shared-references/skeptic-mode-structure.md`

---

## Standard Document Generation Flow

For generating internal documents with review/approval cycles.

**Parameters:**
- `document_type`: Template and output filename (e.g., "market-analysis")
- `dependencies`: Required upstream documents
- `has_scrutiny`: Whether to offer Scrutiny Checkpoint (milestone docs only)

### Step 1: Setup

1. Read config file (`${CLAUDE_PLUGIN_ROOT}/shared-references/config-resolution.md` for detailed logic)
2. Determine startup name (from args or prompt)
3. Set paths and create `{internalPath}` directory if needed
4. Verify all `dependencies` exist (if missing: show status, direct user to generate missing document)
5. Check document state:
   - If `DRAFT-{document_type}.md` exists → Skip to Step 4 (Review Loop)
   - If master `{document_type}.md` exists (no DRAFT) → Ask as simple text prompt: "You already have {document_type}.md. Regenerate it? (yes/no)"
     - Yes → Continue to Step 2
     - No → Exit (confirm location, suggest next steps)
   - Otherwise → Continue to Step 2
   - Only match on EXACT document name and directory location.

### Step 2: Generate Document

The business-writer agent reads methodology directives from each template's YAML frontmatter:

| Field | Purpose |
|-------|---------|
| `primary_methodology` | Main methodology skill to apply |
| `secondary_methodology` | Optional second-pass methodology |
| `requires_input_source` | Whether pre-validated input is expected |
| `dependencies` | Upstream documents required |
| `research_required` | Whether research is needed before generation |
| `research_skills` | Which researching-{TOPIC} skills to use |
| `research_inputs` | What inputs the research needs |

#### Research Phase (if template requires)

If template frontmatter has `research_required: true`:

1. Extract `research_skills` and `research_inputs` from template
2. **Message user** (simple, clear language):
   ```
   Researching {document_type}...
   
   I'm gathering information from the web to create an accurate document. This typically takes a little while. Feel free to step away while I work. 
   ```
3. FOR EACH skill in `research_skills`:
   - Spawn lockstride-kickoff:researcher agent:
     ```
     Task(
       subagent_type="lockstride-kickoff:researcher",
       prompt="Research {inputs} using {skill} methodology.
       
       Research Skill: {skill}
       Inputs: {research_inputs from template}
       
       Execute the research protocol and return structured findings for document synthesis."
     )
     ```
4. Collect all research findings
5. Continue to methodology-specific generation with findings

#### Interactive Methodology (requires_input_source: true)

**CRITICAL**: Interactive methodologies cannot run in subagents. AskUserQuestion calls from subagents don't reach users.

1. **Invoke gathering-input skill** via Skill tool (inline, in current context) with document_type parameter
2. Skill loads appropriate topic file and conducts conversation with user interactively
3. Skill writes `.{document_type}-input.md` to internal path

**CONTINUATION**: After gathering-input returns, immediately proceed to Step 4. Do NOT stop, wait for user input, or end the turn. The gathering-input skill's job is done — yours is not.

4. Verify `{internalPath}/.{document_type}-input.md` exists (read it to confirm)
5. **Message user** (simple, clear language):
   ```
   Writing {document_type}...
   
   I'm creating your document from the information you provided.
   This typically takes several minutes.
   ```
6. **Spawn lockstride-kickoff:business-writer subagent** with input_source parameter (subagent receives fresh context automatically):

```
Task(
  subagent_type="lockstride-kickoff:business-writer",
  prompt="Generate {document_type} for {startup_name} from the gathered input.
  
  Internal path: {internalPath}
  Input source: {internalPath}/.{document_type}-input.md
  Template: {skill_root}/assets/templates/{document_type}.md
  
  This is pre-validated input — skip alignment checkpoint and apply writing-content methodology to structure the document."
)
```

#### Autonomous Methodologies (requires_input_source: false)

1. **IF template has `research_required: true`:**
   - Extract `research_skills` and `research_inputs` from template frontmatter
   - **Message user** (simple, clear language):
     ```
     Researching {document_type}...
     
     I'm gathering information from the web to create an accurate document. This typically takes a little while. Feel free to step away while I work. 
     ```
   - FOR EACH skill in `research_skills`:
     - Spawn lockstride-kickoff:researcher agent to execute research
     - Collect structured findings
   - Proceed to spawn lockstride-kickoff:business-writer with research findings

2. Read all required/available upstream documents (listed in template frontmatter `dependencies`)

3. **Message user** (simple, clear language):
   ```
   Writing {document_type}...
   
   I'm creating your document based on your research and upstream documents. This typically takes several minutes.
   ```

4. **Spawn lockstride-kickoff:business-writer subagent** with all context (subagent receives fresh context automatically):

```
Task(
  subagent_type="lockstride-kickoff:business-writer",
  prompt="Create {document_type} for {startup_name} using the methodology specified in the template.
  
  Internal path: {internalPath}
  Template: {skill_root}/assets/templates/{document_type}.md
  Research findings: {research_findings if applicable}
  
  Read the template frontmatter to determine which methodology to apply, then execute the full methodology workflow and write DRAFT-{document_type}.md"
)
```

### Step 3: Scrutiny Checkpoint (if has_scrutiny=true)

Follow **Scrutiny Checkpoint** pattern.

### Step 4: Review Loop

Follow **Document Review Loop** pattern.
- If master exists: messaging indicates "Accept — Finalize this version (replaces existing)" and "Discard Draft and Exit — Delete DRAFT and keep existing"
- On "Accept": follow **Safe File Swap Pattern** to rename DRAFT to master.

### Step 5: Auto-Continue

**For product-spec and technical-requirements only:**

After document acceptance, present the next-steps menu:

**Pattern:** AUTO-CONTINUE — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Offer to create development repository as the primary next step
- GUIDANCE: Explain that the create-repo command sets up a development environment with the template

**Menu Options:**
1. **Yes, create repository now** (recommended) — Run `/lockstride-kickoff:create-repo`
2. **Not yet** — Save documents and exit with reminder
3. **Different path** — Show other available options (export documents, review config, etc.)

### If "Yes, create repository now":
- Invoke create-repo command via Skill tool or direct execution
- Pass startup name and context as needed

### If "Not yet":
- Display closing message:
  ```
  Your documents are saved in {internalPath}
  
  When you're ready to set up your development environment:
  Run /lockstride-kickoff:create-repo
  
  Need help bringing your vision to life? We partner with founders to build their products. Reach out to hello@lockstride.ai to discuss implementation support.
  ```

### If "Different path":
- Present menu with alternatives:
  1. Export documents to DOCX/PPTX
  2. Review configuration
  3. View project status
  4. Exit

**For all other documents:**
Follow **Auto-Continue Flow** pattern.

---

## Brand Brief Pre-Generation Flow

When `document_type == "brand-brief"`, execute this checkpoint BEFORE proceeding to the standard generation flow.

### Step 1: Check Naming Status

1. Load config to get startup profile
2. Check if `isCodeName: true` is set in the profile
3. Get current startup name from profile `displayName`

### Step 2: Present Naming Exercise Checkpoint

Present a menu based on naming status:

**If code name (`isCodeName: true`):**

```
Ready to continue to the next step?

Brand Brief defines your startup's identity — positioning, voice, and visual direction.

Recommended first: Run a naming exercise to replace "{CODE_NAME}" with a real name.
- Takes 20+ minutes (sometimes hours depending on depth)
- Explores naming strategies, checks domain availability
- Creates a shortlist you can return to later
- Can skip for now and run later via /naming-business

1. Yes, continue to brand brief (keep "{CODE_NAME}" for now)
2. Run naming exercise first
3. Not yet — I need to review first
4. Different path — Show me other options

Enter a number:
```

**If real name (`isCodeName: false` or not set):**

```
Ready to continue to the next step?

Brand Brief defines your startup's identity — positioning, voice, and visual direction.

Optional first: Run a naming exercise to validate "{REAL_NAME}" or explore alternatives.
- Takes 20+ minutes (sometimes hours depending on depth)
- Explores naming strategies, checks domain availability
- Creates a shortlist you can return to later
- Can skip if you're confident in the current name

1. Yes, continue to brand brief (keep current name)
2. Run naming exercise first
3. Not yet — I need to review first
4. Different path — Show me other options

Enter a number:
```

### Step 3: Route Based on Selection

**Option 1 - Continue to brand brief:**
- Proceed to standard generation flow with gathering-input methodology

**Option 2 - Run naming exercise first:**
- Invoke `/naming-business` skill (inline, interactive)
- After naming completes (whether they select new name or keep current), return to this checkpoint
- Re-present the menu with updated name (if changed)
- When user selects "Continue to brand brief", proceed to generation flow

**Option 3 - Not yet:**
- Confirm current document status
- Suggest they can run `/generating-documents brand-brief` when ready
- Exit gracefully

**Option 4 - Different path:**
- Show available documents at this stage (including optional ones like ip-search)
- Let user select alternative document to generate
- Route to appropriate generation flow for selected document

---

## Document Review Loop

After generating DRAFT-{document-type}.md, present the review menu.

**Pattern:** REVIEW-LOOP — you MUST use the `view` tool to read `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Present review options for the generated draft
- GUIDANCE: If master document exists, append "(replaces existing)" to Accept option

### If "Accept":
- Follow Safe File Swap Pattern (see below)
- Proceed to Auto-Continue Flow

### If "Edit and reload":
- User edits DRAFT-{document-type}.md manually
- Read updated DRAFT
- Return to review loop

### If "Suggest changes":
- Collect feedback on what to change
- Regenerate DRAFT with feedback
- Return to review loop

### If "Start fresh":
- Regenerate DRAFT ignoring previous content
- Return to review loop

### If "Discard Draft and Exit":
- Follow Delete Confirmation Pattern (see below)
- If confirmed: Delete DRAFT, offer intelligent next steps based on available docs
- If cancelled: Return to review loop

---

## Document Review Loop (Multi-Document Variant)

Use when multiple documents are generated together (e.g., product spec + technical requirements).

**"Your documents are ready!**

What would you like to do?

1. Accept — Finalize all drafts
2. Edit and reload — I've made manual edits
3. Suggest changes — Specify the document and changes
4. Start fresh — Regenerate selected document(s) from scratch
5. Discard Drafts and Exit — Delete all DRAFTs and exit

Enter a number:"

Follow the same actions as the standard review loop, but ensure updates are applied
to the selected document(s) only. For "Accept", apply Safe File Swap Pattern to each DRAFT sequentially.

**After acceptance:**
- If technical-requirements is included: Display the closing message (see Step 5 in Standard Flow)
- Otherwise: Follow standard Auto-Continue Flow

---

## Auto-Continue Flow

After document approval, present the continue menu.

**Pattern:** AUTO-CONTINUE — you MUST use the `view` tool to read `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Offer to continue to the next document/step
- GUIDANCE: Explain what the next step is and why it matters

### If "Yes, continue now":
- Invoke the next skill or action

### If "Not yet":
- Confirm save location
- Remind user how to continue when ready

### If "Different path":
- Show available documents at this stage (including optional ones)

---

## Scrutiny Checkpoint

After generating DRAFT-{document-type}.md for milestone documents (market-analysis, business-plan, product-spec, pitch-deck), offer SKEPTIC MODE scrutiny before the review loop.

**Pattern:** YES-NO-CONFIRMATION — you MUST use the `view` tool to read `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Offer SKEPTIC MODE stress-testing before review
- GUIDANCE: Mention the draft is complete

### If yes:
1. Invoke the `challenging-assumptions` skill (via Skill tool) with context:
   - document_type: [type of document just generated]
   - document_path: [path to DRAFT document]
2. The skill runs interactively — challenging assumptions one at a time, tracking scores

**CONTINUATION**: After the challenging-assumptions skill returns with structured insights, immediately proceed to Post-Scrutiny Amendment Flow. Do NOT stop, wait for user input, or end the turn. The challenging-assumptions skill's job is done — yours is not.

### If no:
- Proceed directly to Document Review Loop
- Note: Scrutiny can be revisited later

---

## Post-Scrutiny Amendment Flow

After SKEPTIC MODE exits with structured insights summary, present enhanced review menu.

**SKEPTIC Insights Structure:** See `${CLAUDE_PLUGIN_ROOT}/shared-references/skeptic-mode-structure.md`

**Pattern:** REVIEW-LOOP-POST-SKEPTIC — see `${CLAUDE_PLUGIN_ROOT}/shared-references/user-interaction-patterns.md`
- GOAL: Present review options with SKEPTIC insights incorporation as first choice
- GUIDANCE: Display the full SKEPTIC insights summary before the menu

### If "Incorporate learnings from this SKEPTIC session":
1. Extract actionable feedback from Identified Gaps + Revision Suggestions
2. Create succinct summary of changes needed
3. Present summary to user for approval using YES-NO-CONFIRMATION pattern
4. If user approves:
   - Spawn lockstride-kickoff:business-writer subagent with `skeptic_insights` parameter passing insights as context (not file)
   - Agent applies SKEPTIC Feedback Incorporation Mode (see `${CLAUDE_PLUGIN_ROOT}/agents/business-writer.md`)
   - Proceed to standard Document Review Loop (5 options)
5. If user declines approval:
   - Return to 6-option post-SKEPTIC menu

### If other options selected:
- Options 2-6 follow standard review loop behavior
- See REVIEW-LOOP-POST-SKEPTIC pattern in user-interaction-patterns.md for details

---

## Safe File Swap Pattern

When accepting a DRAFT to become master:

Use the rename-path.mjs script with --backup flag:

```bash
cd "{internalPath}" && \
node "${CLAUDE_PLUGIN_ROOT}/shared-scripts/rename-path.mjs" \
  --from "DRAFT-{document-type}.md" \
  --to "{document-type}.md" \
  --backup
```

The script will:
- Create timestamped backup if master exists (BACKUP-{document-type}-{timestamp}.md)
- Rename DRAFT to master filename
- Report success with backup details

If script fails, DRAFT and any existing master remain unchanged.

---

## Delete Confirmation Pattern

When user chooses to discard a DRAFT:

**"Are you sure you want to discard this draft?"**

DRAFT-{document-type}.md will be permanently deleted.

1. **Yes, discard** — Delete and exit
2. **No, go back** — Return to review

### After deletion:
Offer intelligent next steps based on available documents.
