# Brand Brief Topic — Brand Identity Conversation

Lightweight conversation to gather subjective brand decisions that can't be inferred from upstream documents.

**Duration:** 5-10 minutes (4-6 questions)

---

## Prerequisites

Before starting, load context from:
- `business-brief.md` — Problem, solution, target market
- `market-analysis.md` — Competitive landscape, positioning

Use this context to inform questions and provide examples relevant to the specific startup.

---

## Conversation Flow

### Question 1: Brand Personality

"Let's start with brand personality. What 3-5 words best describe how you want {STARTUP_NAME} to feel to customers?"

**Context to provide:**
- Think about your target market from the business brief
- Consider competitive positioning from the market analysis
- Examples: innovative/reliable, playful/serious, approachable/exclusive, bold/understated, modern/timeless

**Follow-up if needed:**
"Tell me more about why [chosen word] matters for your customers. What does that look like in practice?"

---

### Question 2: Voice & Tone

"How should {STARTUP_NAME} communicate with customers?"

**Present spectrums:**
- Formal ←→ Casual
- Technical/Expert ←→ Accessible/Plain language
- Professional ←→ Conversational
- Authoritative ←→ Collaborative

"Where do you want to land on these? Think about what resonates with [reference target audience from business brief]."

**Follow-up if needed:**
Show examples:
- Formal: "Our platform enables enterprises to optimize resource allocation"
- Casual: "We help teams get more done without the chaos"

"Which style feels more like your brand?"

---

### Question 3: Visual Direction

"What visual style resonates with {STARTUP_NAME}?"

**Prompt considerations:**
- Modern/sleek vs. classic/established
- Minimal/clean vs. rich/detailed
- Warm/approachable vs. cool/professional

"Are there any brands (competitors or outside your space) whose visual identity you admire? What about their look feels right?"

**Color associations:**
"Any color feelings? Not asking for exact colors yet, just general direction. Should it feel energetic? Trustworthy? Innovative? Calming?"

---

### Question 4: Key Differentiators to Emphasize

"Looking at your competitive positioning from the market analysis, which brand attributes should customers remember most about {STARTUP_NAME}?"

**Context to provide:**
- Reference specific differentiators from market analysis
- "You mentioned [differentiators from market analysis]. Which 2-3 of these are most important to emphasize in your brand?"

**Follow-up:**
"Why are these the most critical? What do you want customers to think when they hear your name?"

---

### Question 5: Brand Boundaries

"What is {STARTUP_NAME} NOT?"

**Context to provide:**
- This helps clarify positioning by contrast
- Examples: "Not enterprise-only", "Not a commodity", "Not overly complex"

"Think about perceptions you want to avoid or competitive traps you don't want to fall into."

---

## Alignment Checkpoint

After gathering all input, present summary:

"**Alignment Check — Brand Identity**

Here's what I've captured:

**Personality:** [3-5 words from Question 1]

**Voice & Tone:** [Spectrum positions from Question 2]

**Visual Direction:** [Style preferences from Question 3]

**Key Brand Attributes:** [2-3 differentiators from Question 4]

**Brand Boundaries:** [What NOT from Question 5]

Does this capture the brand direction you're envisioning? Any refinements needed before I generate the brand brief?"

Wait for confirmation before proceeding to output.

---

## Output Format

Write to `.brand-brief-input.md`:

```markdown
# Brand Brief Input — {STARTUP_NAME}

*Generated: {DATE}*

## Brand Personality
{3-5 words captured from Question 1}

**Reasoning:**
{Why these words matter for the target audience}

## Voice & Tone

**Communication Style:**
- Formality: {Position on spectrum}
- Language: {Technical vs accessible}
- Tone: {Professional vs conversational}
- Approach: {Authoritative vs collaborative}

**Examples/References:**
{Any specific examples or brands mentioned}

## Visual Direction

**Style Preferences:**
{Modern/classic, minimal/rich preferences}

**Brands Admired:**
{Any brands mentioned as visual inspiration}

**Color Direction:**
{Color associations or feelings mentioned}

## Key Brand Attributes to Emphasize

1. {First differentiator and why}
2. {Second differentiator and why}
3. {Third differentiator and why}

## Brand Boundaries (What We're NOT)

- {Boundary 1}
- {Boundary 2}
- {Boundary 3}

## Additional Notes

{Any other context or preferences mentioned during conversation}
```
