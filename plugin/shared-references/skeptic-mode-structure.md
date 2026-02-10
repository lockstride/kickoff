# SKEPTIC MODE Insights Structure

Shared reference for SKEPTIC MODE session output format. Used by:
- challenging-assumptions skill (produces this structure)
- generating-documents skill (consumes for Post-Scrutiny flow)
- business-writer agent (consumes for targeted updates)

---

## Structured Insights Summary

When SKEPTIC MODE exits, it produces a structured summary with these sections:

### Validated Strengths

Claims that held up with evidence provided during the session.

### Identified Gaps

Weaknesses found during scrutiny, each with severity level:
- **Critical**: Major flaw that undermines core assumptions
- **Moderate**: Significant weakness that needs addressing
- **Minor**: Small gap that should be filled for completeness

Format: `[Severity: Critical/Moderate/Minor] [Weakness description]`

### Revision Suggestions

Specific, actionable changes to make to the document, referencing sections where possible.

### Open Questions

Unresolved items for future investigation that weren't fully addressed during the session.

### Tough Love Summary

Calibrated closing advice based on session outcome:
- **Passed (3+ satisfactory)**: Acknowledge preparedness, note remaining gaps
- **Failed (6 unsatisfactory)**: Suggest reconsidering, point to weak areas
- **Skipped or mixed**: Summarize what was validated vs. not

---

## Usage in Components

**For producers (challenging-assumptions skill):**
Generate this exact structure at session exit.

**For consumers (generating-documents, business-writer):**
Parse Identified Gaps + Revision Suggestions for actionable feedback.
Reference Validated Strengths to preserve good content.
