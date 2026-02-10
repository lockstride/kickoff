---
name: writing-content
description: Methodology for synthesizing upstream context into focused documents. Covers alignment checkpoints, gap identification, and quality standards.
user-invocable: false
disable-model-invocation: true
---

# Writing Methodology

Methodology for synthesizing context from prior artifacts into focused, actionable documents. This skill provides the knowledge framework for the business-writer agent when generating single-source documents like brand briefs and product briefs.

## Core Capabilities

1. **Context synthesis** from multiple upstream documents
2. **Structured writing** following template guidance
3. **Consistency maintenance** across document artifacts
4. **Gap identification** and clarifying questions

## Alignment Checkpoint

Before generating any document, summarize understanding:

**Context Summary**

"I've loaded the following context:
- [Document 1]: [key points relevant to this document]
- [Document 2]: [key points relevant to this document]

Key themes I'll carry forward:
- [Theme 1]
- [Theme 2]
- [Theme 3]

Does this capture the right foundation, or should I note anything else?"

Wait for confirmation before generating the document.

## Document Generation Process

### Step 1: Load Context
- Read **only** the upstream dependencies explicitly listed in the template's dependency chain
- Do not read optional documents unless they are listed as dependencies
- Extract key information relevant to this document type
- Note any gaps or inconsistencies to address

### Step 2: Present Alignment Checkpoint
- Summarize what you've learned from context
- Identify key themes to carry forward
- Get confirmation before proceeding

### Step 3: Identify Information Gaps
If template sections require information not in context:
- Use AskUserQuestion to gather missing details
- Frame questions specifically (not open-ended)
- Offer reasonable defaults when possible

### Step 4: Generate Content
- Follow template section guidance for what belongs where
- Apply context appropriately to each section
- Maintain consistency with upstream documents
- Use specific, actionable language

### Step 5: Review and Refine
- Verify all template sections are populated
- Remove guidance comments from output
- Ensure terminology consistency with prior documents
- Add document footer

## Writing Quality Standards

All documents should balance thoroughness with actionability. Follow these principles to create focused, token-efficient content that supports decision-making:

### Core Quality Principles

- **Consistency**: Use terminology from prior documents
- **Specificity**: Be concrete and actionable, avoid vague language
- **Traceability**: Build visibly on upstream content
- **Completeness**: Fill all sections; note gaps explicitly
- **Voice**: Match established brand voice when applicable

### Writing Style

- Write in active voice and direct language
- Use bullet points for lists and easy scanning
- Include examples where they add clarity
- Quantify when possible (user counts, percentages, timeframes)
- Avoid jargon unless industry-standard
- Keep sections focused and scannable

### Conciseness & Token Efficiency

**Prioritize Insight Over Comprehensiveness:**
- Every paragraph should support a decision or recommendation
- Avoid describing what's obvious or universally true in the industry
- Focus on what differentiates or matters, not exhaustive background
- Cut information that doesn't inform strategic choices

**Leverage Tables Over Prose:**
- Comparison of 3+ items → Use tables (more scannable, fewer tokens)
- Single complex topic → Use prose with clear structure
- Lists of attributes → Use bullet points, not full sentences
- Financial metrics → Always use tables with sources

**Writing Efficiency Tactics:**
- Combine related points into single paragraphs
- Reference previous sections rather than repeating information
- Use "e.g." with 1-2 examples, not comprehensive lists
- Skip obvious transitions and connector phrases

## Handling Information Gaps

When context is insufficient:
1. First, search upstream documents for the information
2. If not found, use AskUserQuestion with specific questions
3. If user doesn't know, make reasonable assumptions and note them
4. Flag sections needing founder validation with "[To be validated]"

## Output Format

Generate complete documents following template structure:
- All template sections populated with content
- Guidance comments (`<!-- Guidance: ... -->`) removed
- Placeholders replaced with actual content
- Footer added per convention

The template defines WHAT content is needed. This methodology defines HOW to write it well.
