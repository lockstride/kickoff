# Market Domain Challenges

Challenge patterns for scrutinizing market analysis, competitive positioning, and go-to-market strategies.

## Common Weak Spots

- **TAM fantasy** — Unrealistic market sizing with top-down magic
- **Competitor blindness** — Ignoring or underestimating competition
- **Timing assumption** — "Now is the right time" without evidence
- **Wedge confusion** — No clear entry point into the market
- **Segment sprawl** — Targeting everyone means targeting no one
- **AI wrapper fragility** — Core value is a thin layer over commodity AI that platforms will absorb

## Challenge Templates

### Challenge: TAM Methodology

> Your TAM of $[X]B is a big number. How did you calculate it? If you used top-down (industry reports), have you validated with bottom-up (actual customer count × price)?

**Why it matters:** Top-down TAM is often inflated. Investors want to see bottom-up validation.

**Satisfactory response:** Shows both top-down and bottom-up calculations, or explains why only one is appropriate with clear methodology.

### Challenge: Serviceable Market

> TAM is interesting but SAM matters more. Of your total market, what percentage can you actually reach and serve with your current product and go-to-market capabilities?

**Why it matters:** A $10B TAM means nothing if your SAM is $10M because of geographic, technical, or channel limitations.

**Satisfactory response:** Provides SAM with clear filtering criteria (geography, company size, tech stack requirements).

### Challenge: Competitive Response

> You've identified [Competitor] as your main competition. They have more resources, existing customers, and brand. What happens when they copy your best features? What's your response?

**Why it matters:** Incumbents rarely ignore successful challengers. The competitive response is inevitable.

**Satisfactory response:** Either identifies structural advantages incumbents can't replicate (focus, speed, business model) or acknowledges and plans for the competitive response.

### Challenge: Customer Acquisition

> How do you get your first 100 customers? Your first 1,000? These likely require different strategies. What's the plan for each stage?

**Why it matters:** Many startups conflate early (founder-led sales) and scale (repeatable acquisition) strategies.

**Satisfactory response:** Differentiates early-stage tactics (direct outreach, network, partnerships) from scale tactics (content, paid, channel).

### Challenge: Why This Wedge

> You're entering a market with established players. What's your wedge — the specific use case or segment where you can win first before expanding?

**Why it matters:** Attacking a market broadly invites competition from all directions. Wedge strategies create beachheads.

**Satisfactory response:** Identifies a specific underserved segment or use case and explains why incumbents can't or won't address it.

### Challenge: Timing Evidence

> You say "now is the right time" for this market. What specifically changed in the last 12-24 months that makes this true? If nothing changed, why didn't someone succeed with this already?

**Why it matters:** "Why now" is essential for investor pitches and for understanding market dynamics.

**Satisfactory response:** Points to a specific catalyst — technology cost curve, regulation, buyer behavior shift, or platform change.

### Challenge: AI Wrapper Risk

> Strip away the AI layer from your product. What's left? If the answer is "a UI and some prompts," you have a wrapper problem. What do you offer that a foundation model provider won't offer natively in 12-18 months?

**Why it matters:** AI capabilities are commoditizing rapidly. Businesses built as thin layers over LLMs face margin compression and disintermediation as platforms improve. Investors and advisors increasingly treat "AI wrapper" as a red flag.

**Satisfactory response:** Identifies durable value beyond the AI layer — proprietary data, domain-specific workflows, regulatory compliance, network effects, or deep integrations that create switching costs independent of the underlying model.

### Challenge: AI Resilience Over Time

> AI is getting cheaper, faster, and more capable every quarter. Does that make your business more valuable or less valuable over time? Specifically — if GPT-N can do what your product does out of the box, what's your plan?

**Why it matters:** The best AI-era businesses get stronger as AI improves (AI reduces their costs, expands their market, or compounds their data advantage). The worst get weaker (AI erodes their differentiation or makes their product redundant).

**Satisfactory response:** Articulates a clear mechanism by which AI improvements benefit the business — lower COGS, expanded addressable market, compounding data flywheel — rather than threatening it. Or honestly acknowledges the risk and describes a concrete defensibility strategy.

### Challenge: AI Differentiation Durability

> You say you've fine-tuned a model / built proprietary AI / have a unique dataset. How long does that advantage last? What happens when the next foundation model release closes the gap? What's your compounding advantage?

**Why it matters:** Point-in-time AI advantages erode quickly. Fine-tuning advantages shrink with each model generation. Static datasets become stale. Durable AI differentiation requires compounding mechanisms.

**Satisfactory response:** Describes a flywheel — more users generate more data, which improves the model, which attracts more users — or identifies structural advantages (regulatory data access, real-time proprietary data streams, domain-specific feedback loops) that compound over time.

## Failure Mode Patterns

| Pattern | Red Flag | What Fails |
|---------|----------|------------|
| TAM Inflation | "$50B opportunity" with no source | Credibility dies in diligence |
| Competitor Dismissal | "They're not really competitors" | Blindsided when they respond |
| Everyone Problem | "Our target is all businesses" | No positioning, no wedge |
| Category Creation | "We're creating a new category" | Expensive education, incumbents copy |
| AI Wrapper | "We built a better UI on top of GPT" | Platform absorbs the value layer |
| Melting Moat | "We fine-tuned a model" | Next foundation model release closes the gap |
| AI-as-the-Product | Core value is "we use AI" | Commoditized as AI becomes table stakes |

## Example Exchange

**Weak Response:**

> **Challenge:** How did you calculate your TAM?
>
> "We used the Gartner report that says the market is $15B."

*Top-down only, no validation. Gartner markets rarely map to startup opportunities.*

**Strong Response:**

> **Challenge:** How did you calculate your TAM?
>
> "Top-down, Gartner says the broader category is $15B, but that includes segments we don't address. Bottom-up: 200,000 target companies in the US (from LinkedIn data), 30% fit our ICP (60,000), average contract value of $24K based on 5 early customers. That's $1.4B SAM. We think we can capture 5% in 5 years for a $70M SOM. We're raising for the SOM, not the TAM."

*Triangulated methodology, realistic segmentation, intellectually honest.*

---

**Weak Response:**

> **Challenge:** What happens when AI gets good enough to do what your product does natively?
>
> "We have a head start and our UX is better."

*Head starts erode. UX is a feature, not a moat. No structural defense against platform commoditization.*

**Strong Response:**

> **Challenge:** What happens when AI gets good enough to do what your product does natively?
>
> "AI getting better actually helps us. Our product isn't the AI — it's the compliance workflow around it. We encode 200+ jurisdiction-specific regulatory rules that change quarterly. Every customer interaction generates labeled training data for our domain models. As foundation models improve, our COGS drop but our regulatory knowledge graph and customer-specific configurations get stickier. OpenAI isn't going to maintain HIPAA compliance workflows for 50-bed hospitals."

*Durable value beyond the AI layer. Compounding domain advantage. Clear reason why platforms won't replicate it.*
