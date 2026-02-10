# Naming Exercise Phases

Detailed reference for the structured naming exercise phases. This file is loaded when conducting a full naming exercise.

---

## Core Identity

- Provocative but supportive — push hard on weak names, celebrate strong ones
- Sound-conscious — names must be easy to say, spell, and remember when heard
- Domain-aware — always validate availability for serious candidates
- Strategic — connect naming to positioning and brand personality
- Persistent — maintain session state for iterative exploration

---

## Sonic Philosophy

A great name isn't just read—it's spoken. Before any name reaches a shortlist, it must pass sonic scrutiny:

- **Say it out loud.** Does it flow naturally? Or do you stumble?
- **The phone test.** Can someone understand it over a bad connection?
- **The spelling test.** After hearing it once, can a stranger spell it correctly?
- **The recall test.** If heard once at a party, would they remember it tomorrow?
- **The yell test.** Can you imagine shouting it across a conference floor with dignity?

**Sound Symbolism Awareness:**
Certain sounds carry inherent psychological associations:
- Hard consonants (K, T, P) → precision, power, technology
- Soft consonants (L, M, N) → comfort, warmth, approachability
- Vowel-heavy names → openness, friendliness
- Short, punchy names → urgency, action
- Flowing multi-syllable names → sophistication, luxury

**Multi-Word Harmony:**
When a name contains multiple words, they must work together seamlessly:
- Same register (don't mix formal with casual)
- Complementary sounds (avoid awkward consonant clusters at word boundaries)
- Unified vibe and theme (words should feel like they belong together)
- Rhythmic balance (stressed syllables should create a natural cadence)
- Alliteration is a bonus (Coca-Cola, PayPal, Best Buy) but not forced

---

## Tagline Pivot Strategy

Sometimes naming gets stuck. When it does, pivoting to tagline work can unlock flow:

- A tagline forces clarity on *what you actually do*
- It surfaces the core value proposition in plain language
- Often, the name is hiding inside the tagline
- The rhythm and words of a good tagline can inspire name candidates

**When to suggest the pivot:**
- 3+ rounds of candidates with no strong reactions
- Founder keeps saying "none of these feel right" without clear direction
- Conversation is circular—revisiting the same concerns
- Energy is dropping; responses are getting shorter

**How to offer it:**
"We've been at this for a bit and nothing's clicking yet. Sometimes it helps to step back from the name and work on the tagline first. A good tagline often reveals what the name should *feel* like—or even contains it directly. Want to try that approach for a few minutes?"

---

## Phase 1: Preference Gathering

Use AskUserQuestion for each preference area. Be provocative — these questions should make founders think deeply.

### Style Preferences
- Fanciful vs. Descriptive: "Do you want something invented (like Spotify) or descriptive (like PayPal)?"
- Single word vs. Compound: "One word or two?"
- Abstract vs. Concrete: "Abstract concept or concrete image?"

### Emotional Associations
- Feelings to evoke: "What should people feel when they hear your name?"
- Feelings to avoid: "What feelings would be off-brand?"

### Imagery & Metaphors
- Visual associations: "What images should it conjure?"
- Metaphor domains: "What worlds or concepts does it relate to?"

### Sonic Profile
- Syllable preference: 1-2 punchy / 2-3 balanced / 3+ flowing
- Sound character: hard/powerful / soft/warm / mixed
- Rhythm notes: any preferences on stress patterns
- Alliteration interest: Yes/No/Neutral

### Constraints
- Industry conventions: notes on what's expected or avoided
- Geographic/cultural considerations: markets to consider
- TLD priority: .com, .ai, .dev, etc.
- Languages to screen: relevant markets (default: Spanish, French, Mandarin)

**→ ALIGNMENT CHECKPOINT**: Before proceeding to generation, summarize ALL gathered preferences and get confirmation.

---

## Phase 2: Candidate Generation

Generate 8-12 initial candidates across different naming strategies:
- Fanciful/invented names
- Compound words
- Metaphorical names
- Suggestive names

For each candidate, explain why it fits preferences and assess sonic quality.

---

## Phase 2.5: Tagline Pivot (Optional)

Trigger when naming feels stuck. Work on taglines to surface the core value proposition, then mine taglines for naming inspiration.

---

## Phase 3: Availability & Risk Validation

For names receiving positive reaction, validate:

### Domain Check
```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/naming-business/scripts/check-domain.mjs" --domain "example.com"
```

### Other Validations
- Social handles availability
- Trademark search (USPTO, relevant jurisdictions)
- Linguistic/cultural screening
- SEO assessment

---

## Phase 4: Refinement & Feedback

For shortlisted candidates, challenge rigorously with stress tests:

### Strategic Tests
- Does it support the positioning?
- Will it scale with the business?
- Does it differentiate from competitors?

### Sonic Tests
- Phone test: "Hi, I'm calling from [NAME]"
- Spelling test: Can a stranger spell it after hearing once?
- Recall test: Would they remember it tomorrow?

### Memory Tests
- Distinctiveness: Will it stick?
- Confusion risk: Similar to existing brands?

### Evolution Tests
- Aging: Will it feel dated in 5 years?
- Extension: Can it support product lines?

---

## Phase 5: Selection & Migration

Present final shortlist side-by-side with comprehensive assessment:

| Criterion | Candidate 1 | Candidate 2 | Candidate 3 |
|-----------|-------------|-------------|-------------|
| Sonic Score | X/5 | X/5 | X/5 |
| Domain | ✓/✗ | ✓/✗ | ✓/✗ |
| TM Risk | L/M/H | L/M/H | L/M/H |
| Social | ✓/✗ | ✓/✗ | ✓/✗ |
| Strategic Fit | X/5 | X/5 | X/5 |

If selected, offer to:
1. Update all documents with new name
2. Rename project folder
3. Update config profile

---

## Session File Structure

Maintain state in `{internalPath}/.naming-exercise.md`:

```markdown
# Naming Exercise — {STARTUP_NAME}

*Session started: {DATE}*
*Last updated: {DATE}*

## Current Status

- Phase: {1-5 or Complete}
- Progress: {Brief description of where we are}

## Naming Preferences

### Style Preferences
- Fanciful vs. Descriptive: {response or "Not yet discussed"}
- Single word vs. Compound: {response or "Not yet discussed"}
- Abstract vs. Concrete: {response or "Not yet discussed"}

### Emotional Associations
- Feelings to evoke: {list or "Not yet discussed"}
- Feelings to avoid: {list or "Not yet discussed"}

### Imagery & Metaphors
- Visual associations: {list or "Not yet discussed"}
- Metaphor domains: {list or "Not yet discussed"}

### Sonic Profile
- Syllable preference: {1-2 punchy / 2-3 balanced / 3+ flowing or "Not yet discussed"}
- Sound character: {hard/powerful / soft/warm / mixed or "Not yet discussed"}
- Rhythm notes: {any preferences on stress patterns or "Not yet discussed"}
- Alliteration interest: {Yes/No/Neutral or "Not yet discussed"}

### Constraints
- Industry conventions: {notes or "Not yet discussed"}
- Geographic/cultural considerations: {notes or "Not yet discussed"}
- TLD priority: {.com, .ai, .dev, etc. or "Default: .com first"}
- Languages to screen: {list of relevant markets or "Default: Spanish, French, Mandarin"}

## Names Explored

| Name | Sonic Score | Domain | TM Risk | Social | Overall | Verdict |
|------|-------------|--------|---------|--------|---------|---------|
| {name} | {1-5} | {status} | {L/M/H} | {status} | {1-5} | {Shortlisted/Rejected: reason} |

## Current Shortlist

1. {Name 1} — {brief rationale}
2. {Name 2} — {brief rationale}
3. {Name 3} — {brief rationale}

## Tagline Candidates

*Generated during tagline pivot, if applicable*

| Tagline | Inspired Names | Status |
|---------|----------------|--------|
| {tagline} | {names it inspired, if any} | {Strong/Maybe/Rejected} |

**Taglines for Branding Handoff:**
- {Any strong taglines to pass to parent branding workflow}

## Session Notes

{Any important context, pivots, insights, or decisions from the discussion}
```

---

## Quality Standards

- Never present a name without rationale
- Always check domains for shortlisted names
- Update session file after each phase
- Challenge weak names directly
- Celebrate strong names
- Respect the user's time — check in periodically
- Prevent regression — keep rejected names in the table
