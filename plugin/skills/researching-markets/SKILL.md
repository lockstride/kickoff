---
name: researching-markets
description: Methodology for strategic research with web searches, source triangulation, and confidence scoring. Provides research protocol and quality gates for autonomous execution by researcher agent.
user-invocable: false
disable-model-invocation: true
---

# Research Methodology

Methodology for conducting thorough, well-sourced research and data synthesis. This skill provides the knowledge framework for the researcher agent when generating research-intensive documents like market analysis and IP search.

## Core Capabilities

1. **Web research** with source triangulation
2. **Competitive intelligence** gathering
3. **Data synthesis** with confidence scoring
4. **Source citation** and gap documentation

## Research Execution

When invoked by researcher agent, you will receive:
- Document type requiring research
- Research inputs (industry, competitors, topics, etc.)
- Optional upstream dependencies for context

Execute the deep research protocol autonomously and return structured findings.

## Deep Research Protocol

### Phase 1: Discovery Sweep (Breadth)
- Conduct 5-7 broad web searches to map the landscape
- Identify key players, reports, and authoritative sources
- Build initial mental model of the space
- Note promising sources for deeper investigation

**Error Handling for WebSearch:**
- If a search fails or returns no results, try alternative query patterns:
  - Use synonyms or related terms
  - Break complex queries into simpler components
  - Try industry-specific terminology
  - Use broader or narrower search terms
- If multiple searches fail, document this in the "Known Data Gaps" section
- Never fabricate sources or data due to search failures

### Phase 2: Source Triangulation (Depth)
For each major claim or data point:
- Seek 3+ independent sources
- Prioritize source quality:
  1. Industry analyst reports (Gartner, Forrester, McKinsey)
  2. Company filings and investor documents
  3. News articles (prefer last 12 months)
  4. Blog posts and user reviews
- Note confidence level based on source agreement

**Error Handling for Source Triangulation:**
- If unable to find 3+ sources for a claim:
  - Document the number of sources found (1-2 sources = Medium confidence)
  - Try alternative search strategies (company name variations, industry terms, date ranges)
  - Check if the information might be in paid reports (note this in gaps)
  - If only 1 source found, mark as Low confidence and note in methodology
- If sources conflict significantly:
  - Present both perspectives
  - Note the conflict explicitly
  - Attempt to find a third source to break the tie
  - If no resolution, document the conflict and recommend primary research

### Phase 3: Deep Dives
For each key topic/competitor/segment:
- Multiple targeted searches with varied queries
- Check primary sources directly (websites, filings, about pages)
- Look for recent activity (funding, launches, news)
- Search for reviews and user feedback

### Phase 4: Validation & Synthesis
- Cross-reference claims that appear in multiple sources
- Note methodology differences (especially for market sizing)
- Flag conflicting data with both perspectives
- Identify gaps where data is unavailable

## Research Quality Gates

Before finalizing any document, verify:
- [ ] 3+ sources for major quantitative claims (market size, growth rates)
- [ ] 2+ sources per competitor/key topic
- [ ] All data from within 24 months (prefer 12 months)
- [ ] Confidence levels noted (High/Medium/Low)
- [ ] Gaps explicitly documented
- [ ] Sources include URLs for verification

## Quality Standards

- **Cite all sources**: Include URLs and publication dates
- **Date awareness**: Prefer recent sources; note when data is dated
- **Quantify uncertainty**: Use ranges when exact figures unavailable
- **Acknowledge gaps**: Say "Data not available" rather than guessing
- **Be skeptical**: Question unsubstantiated claims, especially large TAM numbers
- **Note conflicts**: When sources disagree, present both perspectives

## Document Generation

When generating a document:

1. **Load the template** for the specified document type
2. **Read only the upstream dependencies** explicitly listed in the template's dependency chain
3. **Follow template section guidance** for what content belongs where
4. **Apply research findings** organized by template sections
5. **Include source citations** inline and in a sources section
6. **Remove guidance comments** from final output

The template defines WHAT content is needed. This methodology defines HOW to research it.

## Handling Information Gaps

When reliable data cannot be found:
1. State explicitly: "Data not available for [topic]"
2. Suggest where the data might be found (paid reports, primary research)
3. Offer to make reasonable assumptions if user approves
4. Never fabricate statistics or sources

## Error Recovery Protocol

When WebSearch fails or returns poor results:

1. **Immediate Retry with Variations:**
   - Try alternative query formulations (synonyms, related terms)
   - Use different search strategies (company names, product names, industry terms)
   - Adjust time ranges or geographic scopes

2. **Fallback Strategies:**
   - If web search consistently fails, use WebFetch to access known authoritative sources directly
   - Check if information might be available through company websites or investor relations pages
   - Look for alternative data sources (government databases, industry associations)

3. **Documentation:**
   - Record search failures in the "Research Methodology" section
   - Note which queries were attempted and why they failed
   - Document any workarounds used to obtain information

4. **Proceed with Available Data:**
   - If critical information cannot be found after multiple attempts:
     - Document the gap in findings
     - Note where the information might exist (paid reports, industry associations)
     - Suggest the user may need to conduct primary research
     - Return findings with explicit gap documentation

## Output Format

All research documents should include:
- Executive summary with key findings
- Confidence assessment for each major section
- Source methodology transparency
- Complete source list with URLs
- Clear recommendations for next steps
