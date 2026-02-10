# Solution Domain Challenges

Challenge patterns for scrutinizing technical solutions in product briefs, product specs, and technical requirements.

## Common Weak Spots

- **Feature bloat** — MVP that's not minimal
- **Technology-first thinking** — Cool tech without clear user value
- **10% better, not 10x** — Incremental improvement doesn't change behavior
- **Build vs. buy confusion** — Building what should be bought
- **Defensibility theater** — Claims of moats that don't exist

## Challenge Templates

### Challenge: 10x vs 10%

> You're asking customers to switch from their current solution. Switching has costs — learning curves, migration, risk. Is your solution 10x better, or just 10% better? What specifically makes switching worth the pain?

**Why it matters:** Users don't switch for incremental improvements. The switching cost must be dramatically outweighed by the benefit.

**Satisfactory response:** Quantifies the improvement (10x faster, 90% cheaper, eliminates entire workflow) with evidence or clear reasoning.

### Challenge: MVP Scope

> Your MVP has [N] features listed. If you could only ship ONE feature, which would it be? If the answer isn't obvious, your MVP isn't minimal.

**Why it matters:** Scope creep kills startups. True MVPs test core assumptions, not feature laundry lists.

**Satisfactory response:** Identifies one core feature and explains why it alone validates the key hypothesis.

### Challenge: Build vs Buy

> Several features here (authentication, payments, notifications) are commodities. Why are you building these instead of using existing solutions?

**Why it matters:** Engineering time is the scarcest resource. Building undifferentiated components is opportunity cost.

**Satisfactory response:** Either explains unique requirements that off-the-shelf solutions can't meet, or acknowledges the plan to use existing solutions.

### Challenge: Technical Defensibility

> What stops a well-funded competitor from copying this in 6 months? What's actually defensible here?

**Why it matters:** Features are not moats. Sustainable advantages come from network effects, data, brand, or regulatory capture.

**Satisfactory response:** Identifies a defensibility mechanism beyond "we'll move faster" — compounding advantages, data flywheels, or network effects.

### Challenge: Complexity vs Value

> This architecture seems complex for an early-stage product. Microservices, event sourcing, multiple databases... What's driving this complexity, and have you considered a simpler approach?

**Why it matters:** Premature optimization kills velocity. Simple architectures that work are better than elegant architectures that don't ship.

**Satisfactory response:** Either justifies complexity with specific scale/reliability requirements, or acknowledges simpler alternatives.

### Challenge: Adoption Friction

> How does a new user go from "interested" to "getting value"? What's the time-to-value? If it requires training, configuration, or integration before any value appears, you have an adoption problem.

**Why it matters:** Products that require setup before value have high churn and low conversion.

**Satisfactory response:** Describes an immediate value moment (< 5 minutes) or acknowledges and plans to address the friction.

## Failure Mode Patterns

| Pattern | Red Flag | What Fails |
|---------|----------|------------|
| Feature Factory | "We need X, Y, Z before launch" | Never ships |
| Tech Worship | "We're using [hot technology]" | No user benefit |
| Copycat Plus | "Like [competitor] but with..." | Undifferentiated |
| Invisible Moat | "Our moat is our team" | Not defensible |

## Example Exchange

**Weak Response:**

> **Challenge:** What stops a competitor from copying this?
>
> "We'll move faster and iterate more quickly."

*Speed is not a moat. Well-funded competitors can hire and move fast too.*

**Strong Response:**

> **Challenge:** What stops a competitor from copying this?
>
> "Our core advantage is the data flywheel. Every customer's usage improves the model for all customers. By the time a competitor launches, we'll have 18 months of training data they can't replicate. We're also building integrations with [3 key platforms] that will create lock-in."

*Compounding advantage with data and platform lock-in.*
