---
description: Generate startup documents with smart routing based on document state
argument-hint: "[doc-type] [internal|external]"
allowed-tools: Skill
---

# Generate Documents

Ultra-thin wrapper that delegates to the `generating-documents` skill.

## Usage

```
/lockstride-kickoff:generate-docs [doc-type?] [internal|external?]
```

**Examples:**
- `/lockstride-kickoff:generate-docs` — List available documents
- `/lockstride-kickoff:generate-docs business-brief` — Smart routing based on state
- `/lockstride-kickoff:generate-docs market-analysis internal` — Force internal generation
- `/lockstride-kickoff:generate-docs pitch-deck external` — Force external export

## Implementation

Use the `generating-documents` skill to handle all document generation workflows.

Pass all arguments directly to the skill.
