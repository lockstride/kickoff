# Product Brief Topic — Product Positioning Conversation

Lightweight conversation to gather product-specific decisions and constraints.

**Duration:** 10 minutes (5-7 questions)

---

## Prerequisites

Before starting, load context from:
- `business-brief.md` — Problem statement, solution overview
- `market-analysis.md` — Competition, market opportunity
- `brand-brief.md` — Brand positioning and differentiation

Use this context to inform questions and validate consistency.

---

## Conversation Flow

### Question 1: Core Value Proposition

"In one clear sentence: What's the single biggest benefit users get from {STARTUP_NAME}?"

**Context to provide:**
- Reference the problem statement from business brief
- "You've validated that [problem]. What's the one thing your product does that solves this?"

**Follow-up if needed:**
"That's good, but can you make it even more specific? What transformation do users experience?"

**Good answer format:** "Users go from [current painful state] to [desired state] by [key mechanism]"

---

### Question 2: Feature Prioritization for MVP

"For your MVP, which capabilities are must-have vs nice-to-have?"

**Context to provide:**
- Reference solution overview from business brief
- "Your solution involves [aspects from business brief]. Which parts are essential for the first version to deliver value?"

**Prompt for clarity:**
"Think about the minimum that:
- Solves the core problem
- Users would pay for
- You can build and test quickly"

**Follow-up:**
"What can you defer to v2 without compromising the core value?"

---

### Question 3: User Experience Priorities

"Where do you want to land on these product experience spectrums?"

**Present key spectrums:**

1. **Speed/Simplicity ←→ Power/Flexibility**
   - Fast, opinionated, limited options vs. Slower, flexible, many options
   - "For your target users [reference from business brief], which matters more?"

2. **Guided/Opinionated ←→ Open/Customizable**
   - We show you the one best way vs. You configure it your way
   - "Given your users' expertise level, should you guide them or get out of their way?"

3. **Breadth ←→ Depth**
   - Does many things adequately vs. Does one thing exceptionally
   - "Better to be the Swiss Army knife or the perfect screwdriver?"

**Follow-up:**
"Why is this the right balance for [target user segment]?"

---

### Question 4: Technical Constraints

"Are there any technical requirements, platform constraints, or integrations that are non-negotiable?"

**Prompt areas:**

**Platform:**
- "Web app, mobile app, desktop, or combination?"
- "Mobile-first or desktop-first?"
- "Any platform you explicitly won't support initially?"

**Integrations:**
- "Any systems you must integrate with for your solution to work?"
- "What data needs to flow in or out?"

**Compliance/Regulatory:**
- "Any compliance requirements? (HIPAA, GDPR, SOC 2, etc.)"
- "Data residency requirements?"
- "Security certifications needed?"

**Technical Philosophy:**
- "Any strong preferences on architecture? (e.g., API-first, offline-capable, real-time)"

---

### Question 5: Competitive Differentiation Emphasis

"Looking at your market analysis, you identified these competitive advantages: [list from market analysis]. Which should the product emphasize most?"

**Context to provide:**
- Reference specific competitive differentiators from market analysis
- "These are all advantages, but if you could only win on 1-2, which would they be?"

**Follow-up:**
"How does this show up in the product experience? What will users see/feel that makes this obvious?"

---

### Question 6: Success Metrics (Optional)

"How will you know the product is working? What's the key metric?"

**Prompt for thinking:**
- Usage: Daily active users, time in product
- Value: Problems solved, outcomes achieved
- Business: Conversion rate, retention, revenue

"What's the one number that, if it's growing, means you're on the right track?"

---

## Alignment Checkpoint

After gathering all input, present summary:

"**Alignment Check — Product Positioning**

Here's the product direction I've captured:

**Core Value:** [One-sentence value prop from Q1]

**MVP Must-Haves:** [Essential features from Q2]

**UX Priorities:** [Spectrum positions from Q3]

**Technical Constraints:** [Requirements from Q4]

**Competitive Focus:** [1-2 key differentiators from Q5]

**Success Metric:** [Key metric from Q6, if provided]

Does this align with your product vision? Any adjustments needed?"

Wait for confirmation before proceeding to output.

---

## Output Format

Write to `.product-brief-input.md`:

```markdown
# Product Brief Input — {STARTUP_NAME}

*Generated: {DATE}*

## Core Value Proposition

{One-sentence value proposition from Question 1}

**User Transformation:**
{From [current state] to [desired state] via [mechanism]}

## MVP Feature Prioritization

**Must-Have (P0):**
- {Feature 1}
- {Feature 2}
- {Feature 3}

**Nice-to-Have (P1 - defer to v2):**
- {Feature 1}
- {Feature 2}

**Reasoning:**
{Why this is the minimum viable set}

## User Experience Priorities

**Speed/Simplicity ←→ Power/Flexibility:** {Position and rationale}

**Guided ←→ Customizable:** {Position and rationale}

**Breadth ←→ Depth:** {Position and rationale}

**Overall UX Philosophy:**
{Summary of experience priorities}

## Technical Constraints

**Platform Requirements:**
{Web/mobile/desktop priorities}

**Required Integrations:**
{Systems that must be integrated}

**Compliance/Regulatory:**
{HIPAA, GDPR, SOC 2, or other requirements}

**Technical Philosophy:**
{API-first, offline-capable, real-time, etc.}

## Competitive Differentiation Emphasis

**Primary Differentiator:** {Top competitive advantage to emphasize}
- How it shows up in product: {User-visible manifestation}

**Secondary Differentiator:** {Second advantage if specified}
- How it shows up in product: {User-visible manifestation}

## Success Metrics

**Primary Metric:** {Key metric that indicates success}

**Why this metric:** {Rationale for focus}

## Additional Context

{Any other requirements, constraints, or context gathered}
```
