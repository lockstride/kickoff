---
name: researching-repos
description: Methodology for researching technical repositories - discovering stack, structure, conventions, and development practices. Complements researching-markets for template repo analysis.
user-invocable: false
disable-model-invocation: true
---

# Repository Research Methodology

Methodology for discovering technical implementation details from code repositories. This skill provides the knowledge framework for the researcher agent when analyzing template repositories for technical requirements documents.

## Core Capabilities

1. **Stack Discovery**: Identify technologies, frameworks, and versions
2. **Structure Analysis**: Map repository organization and architecture patterns
3. **Convention Extraction**: Find development standards, tooling, and practices
4. **Infrastructure Detection**: Discover deployment, testing, and CI/CD patterns

## Research Execution

When invoked by researcher agent, you will receive:
- `templateRepo`: URL of the repository to research
- `document_type`: Which document requires this research (typically technical-requirements)
- Optional context documents for synthesis guidance

Execute the research protocol autonomously and return structured findings.

## Deep Research Protocol

### Phase 1: Repository Reconnaissance

**Goal**: Discover high-level architecture and technology stack

**Actions**:
1. **Access Repository**: Use WebFetch to load the main repository URL
2. **Read README**: Extract project description, setup instructions, tech mentions
3. **Identify Package Manager**: Look for package.json (npm/pnpm), requirements.txt (pip), Gemfile (bundler), etc.
4. **Check Root Config**: Note presence of monorepo tools (nx.json, lerna.json, pnpm-workspace.yaml)

**Key Files to Discover**:
- `README.md` - Project overview, setup instructions
- `package.json` / `requirements.txt` / `Gemfile` - Dependencies
- `pnpm-workspace.yaml` / `nx.json` / `lerna.json` - Monorepo configuration
- `.nvmrc` / `.node-version` - Runtime versions

**Error Handling**:
- If repository is private/404: Document limitation, suggest user provide access or details
- If README is missing: Note and proceed with other discovery methods
- If structure is unclear: Document ambiguity, focus on what can be determined

### Phase 2: Structure Analysis

**Goal**: Map directory organization and application architecture

**Actions**:
1. **Identify Organization Pattern**:
   - Monorepo: Look for `apps/`, `packages/`, `libs/` directories
   - Standard: Look for `src/`, `lib/`, `app/` directories
   - Microservices: Look for multiple service directories
2. **Map Applications**: Identify distinct applications/services
3. **Map Shared Code**: Note shared libraries, utilities, components
4. **Note Special Directories**: `docs/`, `scripts/`, `infra/`, `tests/`

**Key Patterns to Identify**:
- **Monorepo Structure**: Multiple apps with shared packages
- **Layered Architecture**: Separation of concerns (ui/api/data)
- **Feature-Based**: Organization by business domain
- **Modular**: Plugin or extension architecture

**Search Strategies**:
- Use WebSearch: "{repo_name} repository structure" or "{repo_name} architecture"
- Look for architecture diagrams in docs/
- Check for CONTRIBUTING.md or ARCHITECTURE.md files

### Phase 3: Convention Discovery

**Goal**: Extract development standards and tooling configurations

**Actions**:
1. **Linting & Formatting**:
   - Find `.eslintrc.*`, `.prettierrc`, `pyproject.toml`
   - Note configured rules, plugins, extensions
2. **Type Checking**:
   - Find `tsconfig.json`, `jsconfig.json`, `mypy.ini`
   - Note strict mode, paths, compiler options
3. **Testing Framework**:
   - Find `vitest.config.*`, `jest.config.*`, `pytest.ini`
   - Note test patterns, coverage thresholds
4. **Git Workflow**:
   - Check `.github/workflows/`, `.gitlab-ci.yml`, `circle.yml`
   - Note branching strategy from CI configs or docs

**Key Files to Research**:
- `.eslintrc.*` / `eslint.config.js` - Linting rules
- `.prettierrc` / `prettier.config.js` - Code formatting
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` / `jest.config.js` - Testing setup
- `.github/workflows/*.yml` - CI/CD pipelines
- `.husky/` - Git hooks

### Phase 4: Stack Documentation

**Goal**: Compile comprehensive technology inventory with versions

**Actions**:
1. **Frontend Stack** (if applicable):
   - Framework: React, Vue, Angular, Svelte, etc.
   - Meta-framework: Next.js, Nuxt, SvelteKit, etc.
   - UI Libraries: Component libraries, styling tools
   - State Management: Redux, Pinia, Zustand, etc.
2. **Backend Stack** (if applicable):
   - Framework: Express, NestJS, FastAPI, Rails, etc.
   - Runtime: Node.js version, Python version, etc.
   - API Style: REST, GraphQL, tRPC, etc.
3. **Data Layer**:
   - Database: PostgreSQL, MongoDB, MySQL, etc.
   - ORM: Prisma, TypeORM, SQLAlchemy, etc.
   - Caching: Redis, Memcached, etc.
4. **Infrastructure**:
   - Containerization: Docker, docker-compose files
   - Deployment: Platform-specific configs (Vercel, Render, AWS)
   - Monitoring: Sentry, logging tools

**Version Discovery**:
- Read `package.json` → `dependencies` and `devDependencies`
- Read lock files for pinned versions (pnpm-lock.yaml, package-lock.json)
- Check `Dockerfile` for base image versions
- Note version constraints (^, ~, exact)

## Research Quality Gates

Before returning findings, verify:
- [ ] All technologies identified with names (and versions where available)
- [ ] Repository structure mapped (apps, packages, organization pattern)
- [ ] Development conventions documented (linting, testing, typing)
- [ ] Infrastructure patterns noted (Docker, CI/CD, deployment)
- [ ] Gaps explicitly documented where information unavailable
- [ ] Sources include URLs for verification

## Quality Standards

- **Source All Findings**: Every technology mentioned must come from an actual file/config in the repo
- **Note Versions**: Include version numbers when discoverable
- **Document Structure**: Describe organization clearly (monorepo vs standard, etc.)
- **Acknowledge Gaps**: State "Not found in repository" rather than guessing
- **Provide Context**: Explain architectural choices when docs reveal rationale

## Handling Common Challenges

### Private or Restricted Repositories

If repository is not publicly accessible:
1. Document the access limitation
2. Suggest user provide:
   - Public URL or fork
   - Direct file contents (package.json, README)
   - Technology stack summary
3. Note that without access, research will be incomplete

### Incomplete or Missing Documentation

If README or docs are sparse:
1. Focus on configuration files as primary source
2. Use file structure and naming as clues
3. Search for external resources (blog posts, documentation sites)
4. Document uncertainty: "Likely uses X based on Y file, but not explicitly documented"

### Ambiguous Technologies

If multiple frameworks or approaches present:
1. Note all discovered technologies
2. Attempt to determine which is primary (most imports, larger portion of code)
3. Document ambiguity: "Repository contains both X and Y; X appears primary based on..."

### Outdated Information

If versions or approaches seem dated:
1. Note the versions discovered
2. Flag if significantly outdated (e.g., Node 14 when 20+ is current)
3. Suggest validation: "Repo shows Node 14; user should verify if this is current"

## Output Format

Return structured findings organized by category:

```markdown
## Repository Research Findings: {repo_name}

### Research Methodology
- Repository URL: {url}
- Research date: {date}
- Access status: Public/Private/Partially accessible
- Primary sources: README, package.json, etc.

### Technology Stack

#### Frontend (if applicable)
- **Framework**: {name} {version}
  - Source: {file path or URL}
- **Meta-framework**: {name} {version}
- **UI Library**: {name} {version}
- **State Management**: {name} {version}

#### Backend (if applicable)
- **Framework**: {name} {version}
- **Runtime**: {name} {version}
- **API Style**: REST/GraphQL/tRPC

#### Data Layer
- **Database**: {name} {version}
- **ORM**: {name} {version}
- **Caching**: {name} {version} (if present)

#### Development Tools
- **Package Manager**: {npm/pnpm/yarn} {version}
- **Monorepo Tool**: {Nx/Turborepo/Lerna} (if applicable)
- **TypeScript**: {version} with strict mode {enabled/disabled}

### Repository Structure

#### Organization Pattern
{Monorepo/Standard/Microservices}

#### Directory Layout
```
{repo-root}/
├── apps/               # Applications (if monorepo)
│   ├── api/           # {description}
│   └── webapp/        # {description}
├── packages/          # Shared packages (if monorepo)
│   └── ui/            # {description}
├── src/               # Source code (if standard)
├── tests/             # Test files
└── infra/             # Infrastructure configs
```

#### Applications/Services
- **{app-name}**: {description, tech stack}

### Development Conventions

#### Code Quality
- **Linting**: {ESLint/other} with {config summary}
  - Source: {file}
- **Formatting**: {Prettier/other}
  - Source: {file}
- **Type Checking**: {TypeScript config summary}
  - Strict mode: {yes/no}

#### Testing
- **Framework**: {Vitest/Jest/etc}
  - Source: {config file}
- **Coverage Threshold**: {percentage} (if configured)
- **Test Location**: {pattern}

#### Git Workflow
- **Branching Strategy**: {description from CI or docs}
- **Pre-commit Hooks**: {Husky/lint-staged} (if present)
- **CI/CD**: {GitHub Actions/GitLab CI/etc}

### Infrastructure

#### Containerization
- **Docker**: {yes/no}
- **Compose**: {yes/no, services listed}

#### Deployment
- **Platform**: {Vercel/Render/AWS/etc} (if detectable)
- **Configuration**: {file names, key settings}

#### Monitoring & Logging
- **Error Tracking**: {Sentry/etc} (if configured)
- **Logging**: {tool names}

### Known Gaps
- Gap 1: {description of missing information}
  - Reason: {why not found}
  - Suggestion: {how to obtain}

### Confidence Assessment
- **Overall Confidence**: High/Medium/Low
- **Source Quality**: Excellent/Good/Fair/Limited
- **Documentation Completeness**: Comprehensive/Adequate/Sparse
```

## Error Recovery Protocol

When web fetch or search fails:

1. **Immediate Retry with Variations**:
   - Try alternative URLs (github.com vs raw.githubusercontent.com)
   - Search for repository name + key terms
   - Look for mirrors or forks

2. **Fallback Strategies**:
   - Search for project documentation site
   - Look for setup guides or tutorials mentioning the repo
   - Check package registry pages (npmjs.com, pypi.org)

3. **Documentation**:
   - Record all attempted access methods
   - Note which files were accessible vs inaccessible
   - Document workarounds used

4. **Proceed with Partial Data**:
   - Return findings for accessible portions
   - Clearly mark gaps
   - Provide confidence assessment

## Integration with Document Generation

These findings will be synthesized with product-spec requirements to generate implementation-specific technical requirements documents. Focus on:

- **Completeness**: Cover all aspects template needs (stack, structure, conventions)
- **Specificity**: Provide exact versions and configurations
- **Clarity**: Organize findings by category for easy reference
- **Actionability**: Include enough detail for technical decisions

The business-writer agent will combine these findings with product requirements to create a cohesive technical requirements document tailored to the specific technology stack.
