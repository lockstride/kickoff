# Agents

Development governance and contribution guidelines for the Lockstride Kickoff plugin project.

## Table of Contents

- [Overview](#overview)
- [Development Principles](#development-principles)
- [Contribution Workflow](#contribution-workflow)
- [Quality Standards](#quality-standards)
- [Code Review Process](#code-review-process)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)

---

## Overview

This document defines how contributors work on the Kickoff plugin project. It establishes principles, processes, and quality standards that all contributors must follow.

**Technical Documentation:**
- **[Component Architecture](docs/component-architecture/README.md)**: Comprehensive architecture guide (Skills, Agents, Hooks, MCP, LSP)
- **[Orchestration & Decisions](docs/component-architecture/orchestration-and-decisions.md)**: Patterns, component selection, and "Skills vs Agents" decision framework
- **[Principles & Standards](docs/component-architecture/principles-and-standards.md)**: Core architectural principles and open standards
- **[Kickoff Architecture](docs/kickoff-architecture.md)**: Kickoff-specific architectural patterns
- **[Development Setup](docs/development.md)**: Technical setup and development instructions
- **[Testing Guide](docs/testing.md)**: Comprehensive testing documentation (static, integration, E2E)

---

## Development Principles

### 1. User-Centric Design

Every feature must solve a real problem for startup founders. Before implementing:
- Validate the use case
- Consider the user's context and cognitive load
- Optimize for clarity over cleverness

### 2. Consistency Over Innovation

Maintain consistent patterns across the codebase:
- Follow established file structures
- Use existing patterns before creating new ones
- Document deviations from norms with clear rationale

### 3. Context Efficiency

Respect token budgets:
- Avoid duplication across files
- Single source of truth for all guidance
- Load only what's needed when needed

### 4. Fail Gracefully

Handle edge cases thoughtfully:
- Provide clear error messages
- Suggest recovery paths
- Never leave users in ambiguous states

### 5. Test-Driven Quality

Testing is not optional:
- Write tests before or alongside implementation
- All features require static test coverage
- Major changes require integration/E2E validation

---

## Contribution Workflow

### 1. Before Starting Work

- [ ] Check existing issues for duplicates
- [ ] Read relevant documentation in [docs/](docs/)
- [ ] Review similar existing implementations
- [ ] Understand the architectural context

### 2. Development Process

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes following coding standards
# Run tests frequently during development
pnpm test:watch

# Before committing
pnpm pre-commit # Runs automatically via Husky
```

### 3. Commit Standards

**Commit Message Format**:
```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions or modifications
- `refactor`: Code changes that neither fix bugs nor add features
- `chore`: Maintenance tasks

**Example**:
```
feat: add alignment checkpoint to writer agent

Implements periodic user confirmation during long document
generation to prevent wasted effort on wrong assumptions.

Closes #42
```

### 4. Pull Request Process

1. **Self-Review**:
 - Run full test suite: `pnpm test`
 - Check linting: `pnpm lint`
 - Verify formatting: `pnpm format:check`
 - Review your own diff

2. **PR Description**:
 - Link related issues
 - Explain what changed and why
 - Note any breaking changes
 - Include testing performed

3. **Review Criteria**:
 - At least one approval required
 - All CI checks must pass
 - No unresolved comments
 - Documentation updated

---

## Quality Standards

### Code Quality

**TypeScript**:
- Strict mode enabled
- No `any` types without explicit justification
- Prefer type inference over explicit types where clear
- Use nullish coalescing (`??`) over logical OR (`||`)

**Linting**:
- All ESLint rules must pass
- No disabled rules without documented reason
- Fix warnings, don't suppress them

**Formatting**:
- Prettier enforces style
- Single quotes for strings
- 100 character line width
- 2 space indentation

### Documentation Quality

**Markdown Files**:
- Clear hierarchy with proper heading levels
- Code examples for complex concepts
- Links to related documentation
- Up-to-date modification dates

**Comments**:
- Explain *why*, not *what*
- Document non-obvious decisions
- No commented-out code without explanation
- No change history (use git)

**For Document Generation Features**:
- Template guidance comments contain document-specific instructions
- Skills contain universal, reusable principles only
- Agents contain workflow routing and methodology coordination
- No duplication of guidance across files
- See [Development Guide: Guidance Placement](docs/development.md#guidance-placement-for-document-generation) for details

### Test Quality

**Static Tests**:
- Cover all new functionality
- Test edge cases and error conditions
- Use descriptive test names
- Avoid brittle tests (no hardcoded dates/paths)

**Integration Tests** (content quality):
- Required for major features
- Document expected behavior
- Include reference solutions
- Note cost/time implications

**E2E Tests** (orchestration via Claude Agent SDK):
- Required for workflow changes
- Validate agent resolution and tool routing
- Short-circuit interactive elements with pre-seeded fixtures

See [Testing Guide](docs/testing.md) for comprehensive guidance on all test tiers.

---

## Code Review Process

### For Authors

**Before Requesting Review**:
- Self-review the entire diff
- Run all tests and checks locally
- Write clear PR description
- Link relevant issues/docs

**During Review**:
- Respond to all comments
- Ask for clarification when needed
- Push new commits (don't force-push during review)
- Mark resolved conversations

**After Approval**:
- Squash commits if requested
- Ensure CI is green
- Use "Squash and merge" for feature branches

### For Reviewers

**Review Checklist**:
- [ ] Code follows architectural principles (see [Component Architecture](docs/component-architecture/README.md) for general principles and [Kickoff Architecture](docs/kickoff-architecture.md) for project-specific patterns)
- [ ] Tests are comprehensive and meaningful
- [ ] Documentation is updated
- [ ] Guidance placement is correct (for document generation features):
 - Document-specific guidance → Template files
 - Universal principles → Methodology skills
 - Workflow routing → Agent files
 - No duplication between locations
- [ ] No unnecessary complexity
- [ ] Error handling is appropriate
- [ ] Performance implications considered

**Review Tone**:
- Be constructive and specific
- Ask questions rather than making demands
- Acknowledge good work
- Suggest alternatives with rationale

**Response Time**:
- Initial response within 24 hours
- Full review within 48 hours
- Urgent PRs: communicate in advance

---

## Testing Requirements

All changes must include appropriate test coverage. See [Testing Guide](docs/testing.md) for comprehensive documentation.

### Static Tests (Required)

All changes must include static tests:

```bash
pnpm test
```

**When to Add Tests**:
- New files: Structure and frontmatter validation
- Modified files: Update related tests
- Bug fixes: Add regression test
- Refactors: Ensure existing tests pass

### Integration Tests (Conditional)

Integration tests (content quality evaluation) required for:
- New document generation workflows
- Changes to agent methodology
- Template structure modifications
- Quality-impacting refactors

```bash
pnpm test:integration
```

### E2E Tests (Conditional)

E2E tests (SDK-based orchestration) required for:
- Workflow routing changes
- Agent identifier or resolution changes
- Skill invocation or handoff changes

```bash
pnpm test:e2e
```

**Cost Awareness**:
- Integration tests cost $0.50-$2.00 per run
- E2E tests cost $0.50-$2.00 per test
- Use judiciously, not for every PR
- Required before major releases

**For detailed guidance**, see:
- [Testing Guide](docs/testing.md) — Complete testing documentation
- When to run each test tier
- Adding new tests
- Troubleshooting test failures

### Manual Testing

For UI/UX changes:
- Test with local Claude Code CLI
- Verify all interaction paths
- Check error message clarity
- Validate on multiple scenarios

---

## Documentation Standards

### When to Update Docs

Documentation must be updated for:
- New features or capabilities
- Changed behavior or APIs
- Architectural decisions
- Deprecated functionality

### Documentation Files

**Technical Documentation:**
- **[Component Architecture](docs/component-architecture/README.md)**: AI agent plugin architecture guide
 - Skills, agents, hooks, MCP/LSP servers
 - Orchestration patterns and decision frameworks
 - Complete architecture topic index with focused sub-documents
- **[Orchestration & Decisions](docs/component-architecture/orchestration-and-decisions.md)**: Patterns and component selection
- **[Kickoff Architecture](docs/kickoff-architecture.md)**: Kickoff-specific architectural patterns
- **[Development Guide](docs/development.md)**: Setup, testing, and development workflow
- **[Testing Guide](docs/testing.md)**: Comprehensive testing documentation (static, integration, E2E)
- **[Workflow Patterns](docs/workflow-patterns.md)**: Reusable interaction patterns

**User-Facing:**
- **README.md**: User-facing overview and quick start

### Documentation Quality

**Structure**:
- Table of contents for docs >200 lines
- Clear section hierarchy
- Cross-references to related docs
- Examples for complex concepts

**Content**:
- Write for the reader's context
- Be specific and actionable
- Update "Last updated" dates
- Remove outdated information

**Indexing**:
- Link from higher-level docs to details
- Create bidirectional references
- Maintain consistent terminology
- Use anchor links for navigation

---

## Issue Management

### Creating Issues

**Bug Reports**:
- Clear description of expected vs actual behavior
- Steps to reproduce
- Environment details
- Relevant logs or screenshots

**Feature Requests**:
- Problem statement (not just solution)
- Use cases and user impact
- Proposed solution (optional)
- Alternatives considered

### Issue Labels

- `bug`: Something isn't working
- `feature`: New functionality
- `docs`: Documentation improvements
- `test`: Testing infrastructure
- `refactor`: Code quality improvements
- `question`: Questions or clarifications
- `blocked`: Cannot proceed without external dependency

### Priorities

- `P0`: Critical - blocks usage
- `P1`: High - significant impact
- `P2`: Medium - minor impact
- `P3`: Low - nice to have

---

## Release Process

### Version Strategy

Follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

- [ ] All tests pass (static + integration + E2E)
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes written

### Communication

- Announce breaking changes in advance
- Document migration paths
- Update examples and tutorials
- Notify in relevant channels

---

## Getting Help

### Resources

**Architecture & Patterns:**
- **[Component Architecture](docs/component-architecture/README.md)**: Comprehensive architecture guide (authoritative index)
- **[Orchestration & Decisions](docs/component-architecture/orchestration-and-decisions.md)**: Patterns and component selection
- **[Kickoff Architecture](docs/kickoff-architecture.md)**: Project-specific patterns
- **[Workflow Patterns](docs/workflow-patterns.md)**: Reusable interaction patterns

**Development:**
- **[Development Guide](docs/development.md)**: Setup and workflow instructions
- **[Testing Guide](docs/testing.md)**: Complete testing documentation

### Contact

- **GitHub Issues**: For bugs and feature requests
- **Email**: hello@lockstride.ai for private inquiries

