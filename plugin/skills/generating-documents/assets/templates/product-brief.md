---
document_type: product-brief
primary_methodology: writing-content
secondary_methodology: null
requires_input_source: true
dependencies:
  - brand-brief
  - market-analysis
research_required: false
scrutiny_enabled: false
target_length: 2500-3500 words
---

# Product Brief — {STARTUP_NAME}

<!-- Guidance: This document defines the product vision, strategy, and high-level requirements. Target length: 2,500-3,500 words (~6-10 pages). It bridges the business/brand strategy with detailed technical specifications. The product brief should be clear enough for stakeholders to understand what we're building and why, while providing enough detail for engineering to begin planning. It draws from the business brief, market analysis, and brand brief. -->

---

## Product Overview

### Product Name

**{PRODUCT_NAME}**

### Product Vision

<!-- Guidance: A compelling description of the future state the product enables. Should be inspirational yet grounded. Think 3-5 years out. -->

{PRODUCT_VISION}

### Product Mission

<!-- Guidance: What the product does today to move toward the vision. More concrete and near-term than the vision. -->

{PRODUCT_MISSION}

### Product Summary

<!-- Guidance: 2-3 sentence description of what the product is, who it's for, and what it does. Should be understandable by anyone. -->

{PRODUCT_SUMMARY}

---

## Problem & Opportunity

### Problem Statement

<!-- Guidance: The specific problem this product solves. Reference the business brief but focus on the product-level articulation. -->

{PROBLEM_STATEMENT}

### Target Users

<!-- Guidance: Who uses this product? Be specific about user types, not just customer segments. -->

#### Primary User: {USER_TYPE_1}

**Profile:**
{USER_PROFILE}

**Goals:**
- {GOAL_1}
- {GOAL_2}
- {GOAL_3}

**Pain Points:**
- {PAIN_1}
- {PAIN_2}
- {PAIN_3}

**Current Behavior:**
{CURRENT_BEHAVIOR}

#### Secondary User: {USER_TYPE_2}

{REPEAT_USER_STRUCTURE}

### Jobs to Be Done

<!-- Guidance: Frame user needs as jobs they're trying to accomplish. Include functional, emotional, and social jobs. -->

| Job Type | Job Statement | Priority |
|----------|---------------|----------|
| Functional | When {SITUATION}, I want to {MOTIVATION}, so I can {OUTCOME}. | {P0/P1/P2} |
| Emotional | {JOB_STATEMENT} | {PRIORITY} |
| Social | {JOB_STATEMENT} | {PRIORITY} |

### Opportunity Size

<!-- Guidance: Reference the market analysis but frame in terms of product opportunity. -->

{OPPORTUNITY_SIZE_DESCRIPTION}

---

## Product Strategy

### Strategic Positioning

<!-- Guidance: Where this product sits in the market and how it differentiates. Reference brand brief positioning. -->

{STRATEGIC_POSITIONING}

### Key Differentiators

<!-- Guidance: What makes this product meaningfully different from alternatives? Must be defensible and valuable to users. -->

1. **{DIFFERENTIATOR_1}:** {DESCRIPTION}
2. **{DIFFERENTIATOR_2}:** {DESCRIPTION}
3. **{DIFFERENTIATOR_3}:** {DESCRIPTION}

### Success Metrics

<!-- Guidance: How will we know the product is successful? Include business metrics, user metrics, and product health metrics. -->

| Metric Category | Metric | Target | Rationale |
|-----------------|--------|--------|-----------|
| Business | {METRIC} | {TARGET} | {RATIONALE} |
| User Engagement | {METRIC} | {TARGET} | {RATIONALE} |
| User Outcome | {METRIC} | {TARGET} | {RATIONALE} |
| Product Health | {METRIC} | {TARGET} | {RATIONALE} |

---

## Product Scope

### What's In Scope

<!-- Guidance: Clear boundaries on what the product includes. Helps prevent scope creep. -->

{IN_SCOPE_DESCRIPTION}

### What's Out of Scope

<!-- Guidance: Explicitly state what we're NOT building, especially if stakeholders might assume otherwise. -->

{OUT_OF_SCOPE_DESCRIPTION}

### Product Tiers/Versions

<!-- Guidance: If there are multiple product versions or tiers, describe each. -->

| Version | Target User | Key Features | Price Point |
|---------|-------------|--------------|-------------|
| {VERSION_1} | {USER} | {FEATURES} | {PRICE} |
| {VERSION_2} | {USER} | {FEATURES} | {PRICE} |

---

## Core User Experiences

### Experience 1: {EXPERIENCE_NAME}

<!-- Guidance: Describe key user experiences/flows at a high level. Not detailed specs, but enough to understand the experience vision. -->

**User Goal:** {GOAL}

**Experience Overview:**
{EXPERIENCE_DESCRIPTION}

**Key Moments:**
1. {MOMENT_1}
2. {MOMENT_2}
3. {MOMENT_3}

**Success Criteria:**
- {CRITERIA_1}
- {CRITERIA_2}

### Experience 2: {EXPERIENCE_NAME}

{REPEAT_EXPERIENCE_STRUCTURE}

### Experience 3: {EXPERIENCE_NAME}

{REPEAT_EXPERIENCE_STRUCTURE}

---

## Feature Requirements

### Feature Prioritization Framework

<!-- Guidance: How features are prioritized. Common frameworks: RICE, MoSCoW, Kano. -->

{PRIORITIZATION_FRAMEWORK}

### Core Features (Must Have)

<!-- Guidance: Features required for the product to be viable. Without these, don't launch. -->

| Feature | User Value | Business Value | Complexity |
|---------|-----------|----------------|------------|
| {FEATURE_1} | {VALUE} | {VALUE} | {L/M/H} |
| {FEATURE_2} | {VALUE} | {VALUE} | {L/M/H} |
| {FEATURE_3} | {VALUE} | {VALUE} | {L/M/H} |

**Feature Details:**

#### {FEATURE_1_NAME}

**Description:** {DESCRIPTION}

**User Story:** As a {USER}, I want {CAPABILITY} so that {BENEFIT}.

**Acceptance Criteria:**
- {CRITERIA_1}
- {CRITERIA_2}
- {CRITERIA_3}

**Dependencies:** {DEPENDENCIES}

#### {FEATURE_2_NAME}

{REPEAT_FEATURE_STRUCTURE}

### Important Features (Should Have)

<!-- Guidance: Features that significantly improve the product but aren't launch-blockers. -->

| Feature | User Value | Business Value | Complexity | Target Phase |
|---------|-----------|----------------|------------|--------------|
| {FEATURE} | {VALUE} | {VALUE} | {L/M/H} | {PHASE} |

### Nice-to-Have Features (Could Have)

<!-- Guidance: Features that would be valuable but can wait. -->

| Feature | User Value | Rationale for Deferral |
|---------|-----------|----------------------|
| {FEATURE} | {VALUE} | {RATIONALE} |

### Explicitly Excluded Features (Won't Have)

<!-- Guidance: Features we've decided NOT to build, and why. Prevents re-litigation. -->

| Feature | Rationale |
|---------|-----------|
| {FEATURE} | {RATIONALE} |

---

## Design Principles

<!-- Guidance: Guiding principles that inform all design decisions. Should be specific to this product, not generic UX best practices. -->

1. **{PRINCIPLE_1}:** {EXPLANATION}
2. **{PRINCIPLE_2}:** {EXPLANATION}
3. **{PRINCIPLE_3}:** {EXPLANATION}
4. **{PRINCIPLE_4}:** {EXPLANATION}
5. **{PRINCIPLE_5}:** {EXPLANATION}

---

## Technical Considerations

### Platform Requirements

<!-- Guidance: What platforms must be supported? Web, mobile, desktop, APIs? -->

| Platform | Priority | Notes |
|----------|----------|-------|
| {PLATFORM} | {P0/P1/P2} | {NOTES} |

### Integration Requirements

<!-- Guidance: External systems or services the product must integrate with. -->

| Integration | Purpose | Priority |
|-------------|---------|----------|
| {INTEGRATION} | {PURPOSE} | {PRIORITY} |

### Performance Requirements

<!-- Guidance: Key performance expectations. -->

| Metric | Requirement | Rationale |
|--------|-------------|-----------|
| {METRIC} | {REQUIREMENT} | {RATIONALE} |

### Security & Privacy Requirements

<!-- Guidance: Key security and privacy considerations at the product level. -->

{SECURITY_PRIVACY_REQUIREMENTS}

### Accessibility Requirements

<!-- Guidance: Accessibility standards the product must meet. -->

{ACCESSIBILITY_REQUIREMENTS}

---

## Competitive Context

### Competitive Positioning

<!-- Guidance: How this product compares to alternatives. Reference market analysis. -->

{COMPETITIVE_POSITIONING}

### Feature Comparison

<!-- Guidance: How key features compare to competitors. -->

| Feature | {STARTUP_NAME} | Competitor A | Competitor B |
|---------|----------------|--------------|--------------|
| {FEATURE} | {STATUS} | {STATUS} | {STATUS} |

### Differentiation Strategy

<!-- Guidance: Where we'll compete and where we'll be different. -->

**Compete on:** {COMPETE_ON}

**Differentiate through:** {DIFFERENTIATE_THROUGH}

**Concede:** {CONCEDE}

---

## Go-to-Market Alignment

### Launch Strategy

<!-- Guidance: High-level approach to bringing the product to market. Details in GTM strategy doc. -->

{LAUNCH_STRATEGY}

### Pricing Strategy

<!-- Guidance: How the product will be priced. Include rationale. -->

{PRICING_STRATEGY}

### Customer Acquisition

<!-- Guidance: How the product design supports customer acquisition. -->

{ACQUISITION_APPROACH}

---

## Roadmap Overview

### Phase 1: {PHASE_NAME} (MVP)

**Timeline:** {TIMELINE}

**Goals:**
- {GOAL_1}
- {GOAL_2}

**Key Deliverables:**
- {DELIVERABLE_1}
- {DELIVERABLE_2}

**Success Criteria:**
- {CRITERIA_1}
- {CRITERIA_2}

### Phase 2: {PHASE_NAME}

**Timeline:** {TIMELINE}

**Goals:**
- {GOAL_1}
- {GOAL_2}

**Key Deliverables:**
- {DELIVERABLE_1}
- {DELIVERABLE_2}

### Phase 3: {PHASE_NAME}

{REPEAT_PHASE_STRUCTURE}

### Long-term Vision

<!-- Guidance: Where the product could go in 2-3+ years. -->

{LONG_TERM_VISION}

---

## Risks & Mitigations

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {RISK} | {L/M/H} | {L/M/H} | {MITIGATION} |
| {RISK} | {L/M/H} | {L/M/H} | {MITIGATION} |

### Dependencies

<!-- Guidance: External dependencies that could affect the product. -->

| Dependency | Risk Level | Contingency |
|------------|------------|-------------|
| {DEPENDENCY} | {LEVEL} | {CONTINGENCY} |

---

## Open Questions

<!-- Guidance: Questions that need to be resolved. Include the question and the recommended path to resolution. -->

| Question | Path to Resolution |
|----------|--------------------|
| {QUESTION} | {PATH_TO_RESOLUTION} |

---

## Appendix

### User Research Summary

<!-- Guidance: Reference or summary of user research that informed this brief. -->

{USER_RESEARCH_SUMMARY}

### Assumptions Log

<!-- Guidance: Key assumptions the product strategy is built on. Should be validated. -->

| Assumption | Confidence | Validation Plan |
|------------|------------|-----------------|
| {ASSUMPTION} | {H/M/L} | {PLAN} |

---
