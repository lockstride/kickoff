---
name: synthesizing-content
description: Methodology for integrating multiple source documents. Covers conflict resolution, cross-source integration, and coherence standards.
user-invocable: false
disable-model-invocation: true
---

# Synthesis Methodology

Methodology for integrating multiple source documents into comprehensive, cohesive outputs. This skill provides the knowledge framework for the business-writer agent when generating multi-source documents like go-to-market strategies, business plans, and product specs.

## Core Capabilities

1. **Multi-source integration** - Combine insights from many documents
2. **Pattern identification** - Find connections across sources
3. **Conflict resolution** - Reconcile contradictions between documents
4. **Progressive elaboration** - Add depth without repetition

## Alignment Checkpoint

Before beginning synthesis, summarize understanding:

**Synthesis Context Summary**

"I've loaded the following source documents:
- [Document 1]: [key themes and insights]
- [Document 2]: [key themes and insights]
- [Document 3]: [key themes and insights]
...

Key themes I'll integrate:
- [Theme 1]
- [Theme 2]
- [Theme 3]

Potential tensions to resolve:
- [Conflict 1, if any]

Does this capture the right synthesis focus?"

Wait for confirmation before proceeding.

## Synthesis Process

### Step 1: Load All Sources
- Read **only** the upstream dependencies explicitly listed in the template's dependency chain
- Do not read documents that are not listed as dependencies, even if they exist
- Create brief summary notes of key points from each (focus on relevant sections only)
- Identify themes that appear across multiple documents

**Context Efficiency Guidelines:**
- For `go-to-market-strategy`: Read `product-brief.md`, `market-analysis.md`, `brand-brief.md`, and `business-brief.md` only. Do not read `ip-search.md` or `business-plan.md` unless listed.
- For `product-spec` + `technical-requirements`: Read all required documents (business-brief, market-analysis, brand-brief, product-brief) and optional ones if they exist (gtm, plan), but skip `pitch-deck.md` as it's downstream.
- When documents are very long, focus on sections relevant to the synthesis task rather than reading entire documents.

### Step 2: Present Alignment Checkpoint
- Summarize what you've learned from all sources
- Identify key themes to integrate
- Note any conflicts between sources
- Get confirmation before proceeding

### Step 3: Identify Connections
- Map how concepts relate across documents
- Find reinforcing themes that strengthen the narrative
- Note where documents build on each other

### Step 4: Resolve Conflicts
When sources contradict:
1. Note the conflict explicitly
2. Determine which source is authoritative for this context
3. Make a decision and document rationale
4. Flag significant conflicts for founder review

### Step 5: Gather Additional Inputs
Use AskUserQuestion to fill gaps not covered in source documents:
- Financial assumptions (for business plans)
- Technical preferences (for specs)
- Timeline constraints
- Resource assumptions

### Step 6: Synthesize Content
- Follow template section guidance
- Integrate content from multiple sources into unified sections
- Maintain consistent terminology throughout
- Add depth beyond what any single source provides

### Step 7: Review for Coherence
- Read through as a whole document
- Verify narrative flow
- Check for contradictions
- Ensure progressive detail (no repetition)

## Synthesis Quality Standards

- **Coherence**: Document reads as unified whole, not patchwork
- **Traceability**: Build visibly on source document content
- **No Contradictions**: Conflicts resolved explicitly
- **Progressive Detail**: Each section adds depth, doesn't repeat
- **Actionability**: Output enables next steps

## Context Management

For large synthesis tasks with many sources:
1. Create summary notes of each source (key points only)
2. Identify themes that span documents
3. Work section-by-section to manage complexity
4. Cross-reference frequently for consistency
5. Reference full documents for specific details

## Handling Multi-Document Output

Some synthesis tasks produce multiple documents (e.g., product-spec + technical-requirements). When this occurs:
1. Load all source documents once
2. Generate first document completely
3. Generate second document, maintaining consistency with first
4. Cross-reference between the two outputs

## Output Format

Generate complete documents following template structure:
- All sections populated with synthesized content
- Clear integration of multiple sources visible
- Guidance comments (`<!-- Guidance: ... -->`) removed
- Consistent terminology throughout
- Footer added per convention

The template defines WHAT content is needed. This methodology defines HOW to synthesize it from multiple sources.
