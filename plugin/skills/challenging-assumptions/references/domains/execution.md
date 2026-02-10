# Execution Domain Challenges

Challenge patterns for scrutinizing technical requirements, timelines, and operational plans.

## Common Weak Spots

- **Timeline optimism** — Everything takes longer than planned
- **Team capability gaps** — Missing skills not acknowledged
- **Dependency blindness** — Critical dependencies assumed away
- **Scope certainty** — Treating estimates as commitments
- **Tech debt denial** — "We'll fix it later" that never happens

## Challenge Templates

### Challenge: Timeline Realism

> Your roadmap shows [feature] launching in [N] weeks. What assumptions does that timeline depend on? What happens if any of those assumptions are wrong?

**Why it matters:** Optimistic timelines lead to missed deadlines, rushed work, and burned-out teams.

**Satisfactory response:** Identifies key assumptions, acknowledges uncertainty, and shows buffer time or scope flexibility.

### Challenge: Team Capability

> Building this requires expertise in [domain]. Does your team have this expertise? If not, what's the plan — hire, contract, or learn?

**Why it matters:** Many technical plans assume capabilities the team doesn't have.

**Satisfactory response:** Either demonstrates existing expertise or shows a realistic plan to acquire it (with timeline and cost).

### Challenge: External Dependencies

> Your plan depends on [API/platform/partner]. What happens if they change pricing, deprecate the feature, or become a competitor?

**Why it matters:** Platform risk is real. Companies built on Facebook's API, Twitter's API, or other platforms have been killed by policy changes.

**Satisfactory response:** Acknowledges the dependency and either shows diversification plans or accepts the concentrated risk with eyes open.

### Challenge: MVP Definition

> Your "MVP" has [N] features. If you had to cut 50% of them, which would you cut? If you can't answer, your MVP isn't an MVP.

**Why it matters:** Feature creep delays launch. True MVPs test one core hypothesis.

**Satisfactory response:** Identifies specific features to cut and explains why the remaining features still test the key hypothesis.

### Challenge: Technical Debt Plan

> You're moving fast to hit deadlines. What technical debt are you accumulating, and when will you pay it down? If "later," how do you prevent it from compounding?

**Why it matters:** Unmanaged technical debt slows development exponentially. Startups die from velocity loss.

**Satisfactory response:** Identifies specific debt categories, explains acceptable vs unacceptable debt, and shows a plan for periodic cleanup.

### Challenge: Hiring Plan

> Your plan requires hiring [N] engineers by [date]. What's your hiring timeline, and what happens if hiring takes 2x as long as expected?

**Why it matters:** Engineering hiring is slow and competitive. Plans that assume instant hiring fail.

**Satisfactory response:** Shows realistic hiring timelines (months, not weeks), has pipeline visibility, or explains how to deliver with current team.

## Failure Mode Patterns

| Pattern | Red Flag | What Fails |
|---------|----------|------------|
| Optimism Bias | "We'll ship in 6 weeks" | Every sprint, deadline slips |
| Hero Mode | "I'll just work harder" | Burnout, quality collapse |
| Dependency Assumption | "The API will be ready" | Blocked on external parties |
| Scope Lock | "We committed to this" | No flexibility when reality hits |

## Example Exchange

**Weak Response:**

> **Challenge:** What happens if hiring takes 2x as long?
>
> "We'll figure it out. Hiring is a priority."

*No actual plan. "Figure it out" is not a strategy.*

**Strong Response:**

> **Challenge:** What happens if hiring takes 2x as long?
>
> "We've modeled two scenarios. In the optimistic case, we hire 2 engineers by March and ship the full roadmap. In the pessimistic case, we hire 1 engineer by May — we'd cut the analytics dashboard and defer the enterprise features, focusing on core workflow automation. We can still validate the key hypothesis with the reduced team. We're also talking to a contracting firm as a backup for specific components."

*Contingency planning, scope flexibility, backup options.*
