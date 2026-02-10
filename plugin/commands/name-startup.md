---
description: Name or rename your startup with interactive exercises or simple renames
allowed-tools: Skill
---

# Name Startup

Ultra-thin wrapper that delegates to the `naming-business` skill.

## Usage

```
/lockstride-kickoff:name-startup [new-name?]
```

**Examples:**
- `/lockstride-kickoff:name-startup` — Interactive naming exercise
- `/lockstride-kickoff:name-startup "New Startup Name"` — Simple rename

## Implementation

Use the `naming-business` skill to handle all naming workflows.

Pass all arguments directly to the skill.
