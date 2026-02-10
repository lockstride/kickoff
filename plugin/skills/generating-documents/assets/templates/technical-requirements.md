---
document_type: technical-requirements
primary_methodology: synthesizing-content
secondary_methodology: writing-content
requires_input_source: false
dependencies:
  - product-spec
research_required: true
research_skills:
  - researching-repos
research_inputs:
  templateRepo: "from user or .local.md config"
scrutiny_enabled: false
target_length: 3500-5000 words
---

# Technical Requirements — {STARTUP_NAME}

<!-- Guidance: This document specifies the technical requirements and engineering standards for the product. Target length: 3,500-5,000 words (~10-15 pages). It complements the product spec by focusing on implementation details, development practices, and technical infrastructure derived from the chosen templateRepo. Research the templateRepo to discover stack, structure, conventions, and practices, then synthesize with product-spec requirements to create implementation-specific technical requirements. -->

---

## Document Information

| Attribute | Value |
|-----------|-------|
| **Product** | {PRODUCT_NAME} |
| **Version** | {VERSION} |
| **Last Updated** | {DATE} |
| **Status** | {DRAFT/REVIEW/APPROVED} |
| **Owner** | {OWNER} |
| **Template Repository** | {TEMPLATE_REPO_URL} |

---

## 1. Technology Stack

<!-- Guidance: Research the templateRepo to discover:
     - Stack: Read package.json, requirements.txt, or equivalent for technologies and versions
     - Runtime: Check .nvmrc, .node-version, Dockerfile for runtime versions
     - Frameworks: Identify frontend/backend frameworks from dependencies
     
     Synthesize research findings to populate this section with repo-specific stack details.
     Include version numbers and rationale based on what the template uses. -->

### 1.1 Stack Overview

{STACK_OVERVIEW_PARAGRAPH}

### 1.2 Core Technologies

| Category | Technology | Version | Source | Notes |
|----------|------------|---------|--------|-------|
| **Language** | {LANGUAGE} | {VERSION} | {package.json / requirements.txt} | {TYPE_SAFETY/PERFORMANCE/RATIONALE} |
| **Package Manager** | {MANAGER} | {VERSION} | {lock files} | {WORKSPACE_SUPPORT/CACHING} |
| **Frontend Framework** | {FRAMEWORK} | {VERSION} | {package.json} | {SSR/SPA/CAPABILITIES} |
| **Backend Framework** | {FRAMEWORK} | {VERSION} | {package.json} | {ARCHITECTURE/FEATURES} |
| **Database** | {DATABASE} | {VERSION} | {compose files / docs} | {RELATIONAL/DOCUMENT/TYPE} |
| **ORM/Query Builder** | {ORM} | {VERSION} | {package.json} | {TYPE_SAFETY/MIGRATIONS} |

### 1.3 Additional Technologies

<!-- Guidance: Extract from templateRepo research. List technologies present in the template for UI libraries, state management, testing frameworks, deployment tools, etc. -->

| Category | Technology | Purpose |
|----------|------------|---------|
| {CATEGORY} | {TECHNOLOGY} | {PURPOSE_IN_TEMPLATE} |

---

## 2. Architecture Requirements

### 2.1 Architectural Principles

<!-- Guidance: Extract from templateRepo documentation (ARCHITECTURE.md, README.md) or infer from structure. Synthesize with product-spec requirements. -->

1. {PRINCIPLE_1_FROM_TEMPLATE_OR_PRODUCT_SPEC}
2. {PRINCIPLE_2}
3. {PRINCIPLE_3}
4. {PRINCIPLE_4}
5. {PRINCIPLE_5}

### 2.2 Repository Structure

<!-- Guidance: Research templateRepo structure:
     - Identify organization pattern: monorepo (apps/, packages/), standard (src/, lib/), microservices
     - Map application directories
     - Note shared code locations
     - Document special directories (docs/, scripts/, infra/)
     
     Present actual structure from template, then explain how product features map to it. -->

#### Organization Pattern

{MONOREPO/STANDARD/MICROSERVICES_DESCRIPTION}

#### Directory Layout

```
{ACTUAL_TEMPLATE_STRUCTURE}
```

#### Application Mapping

<!-- Guidance: Map product-spec features to template applications/services -->

| Template App/Service | Product Features | Responsibilities |
|---------------------|------------------|------------------|
| {APP_FROM_TEMPLATE} | {FEATURES_FROM_PRODUCT_SPEC} | {RESPONSIBILITIES} |

### 2.3 Service Boundaries

<!-- Guidance: Based on templateRepo architecture and product-spec requirements -->

| Service | Responsibility | Communication |
|---------|---------------|---------------|
| {SERVICE} | {RESPONSIBILITY_FROM_PRODUCT_SPEC} | {PROTOCOL_FROM_TEMPLATE} |

---

## 3. Development Standards

### 3.1 Code Style & Formatting

<!-- Guidance: Research templateRepo for:
     - .eslintrc.*, eslint.config.js - linting rules
     - .prettierrc, prettier.config.js - formatting rules
     - .editorconfig - editor settings
     
     Document actual configured standards from template. -->

**Tools:**
- {LINTER}: {CONFIGURATION_SUMMARY}
- {FORMATTER}: {CONFIGURATION_SUMMARY}
- {HOOKS}: {pre-commit/pre-push setup from template}

**Configuration Highlights:**
- {KEY_RULE_1_FROM_TEMPLATE}
- {KEY_RULE_2}
- {KEY_RULE_3}

### 3.2 Git Workflow

<!-- Guidance: Research templateRepo for:
     - .github/workflows/, .gitlab-ci.yml - CI/CD patterns
     - CONTRIBUTING.md - contribution guidelines
     - Branch protection rules mentioned in docs
     
     Document template's workflow patterns. -->

**Branching Strategy:**
```
{ACTUAL_BRANCH_STRATEGY_FROM_TEMPLATE_OR_STANDARD}
```

**Commit Conventions:**
{CONVENTIONAL_COMMITS/OTHER_FROM_TEMPLATE}

**Pull Request Requirements:**
- [ ] {REQUIREMENT_1_FROM_TEMPLATE_CI}
- [ ] {REQUIREMENT_2}
- [ ] {REQUIREMENT_3}

### 3.3 Type Safety Requirements

<!-- Guidance: Research templateRepo for tsconfig.json, jsconfig.json, mypy.ini, etc.
     Document actual type checking configuration from template. -->

**Configuration:**
```json
{KEY_TYPE_CONFIG_FROM_TEMPLATE}
```

**Type Safety Rules:**
- {RULE_1_FROM_TEMPLATE_TSCONFIG}
- {RULE_2}
- {RULE_3}

---

## 4. Testing Requirements

### 4.1 Testing Philosophy

<!-- Guidance: Extract from templateRepo:
     - README.md testing section
     - CONTRIBUTING.md testing requirements
     - Actual test coverage thresholds in config files
     
     Document template's testing approach. -->

{TESTING_PHILOSOPHY_FROM_TEMPLATE_DOCS}

### 4.2 Testing Standards

<!-- Guidance: Research templateRepo for:
     - vitest.config.*, jest.config.*, pytest.ini - test frameworks
     - tests/ or __tests__/ directories - test organization
     - Coverage thresholds in config files
     
     Document actual testing setup from template. -->

| Test Type | Tools | Coverage Target | Focus |
|-----------|-------|-----------------|-------|
| **Unit** | {TOOLS_FROM_TEMPLATE} | {THRESHOLD_FROM_CONFIG}% | {FOCUS_FROM_DOCS} |
| **Integration** | {TOOLS} | {THRESHOLD}% | {FOCUS} |
| **E2E** | {TOOLS} | {THRESHOLD} | {FOCUS} |

### 4.3 Test File Structure

<!-- Guidance: Based on templateRepo's actual test organization -->

```
{ACTUAL_TEST_STRUCTURE_FROM_TEMPLATE}
```

### 4.4 Coverage Requirements

<!-- Guidance: Extract from vitest.config.ts, jest.config.js, or similar in templateRepo -->

```yaml
{ACTUAL_COVERAGE_CONFIG_FROM_TEMPLATE}
```

---

## 5. API Requirements

### 5.1 API Design Standards

<!-- Guidance: Synthesize:
     - Template's API patterns (REST/GraphQL/tRPC from code structure)
     - Product-spec API requirements
     - Template's API documentation approach (Swagger, TypeSpec, etc.)
-->

**Protocol:** {REST/GRAPHQL/TRPC_FROM_TEMPLATE}

**Contract Definition:** {TYPESPEC/OPENAPI/OTHER_FROM_TEMPLATE}

**Versioning:** {VERSIONING_STRATEGY}

**Documentation:** {AUTO_GEN_APPROACH_FROM_TEMPLATE}

### 5.2 Request/Response Standards

<!-- Guidance: Extract from template's API code:
     - Request/response format patterns
     - Error handling conventions
     - Header requirements
     
     Present actual patterns from template. -->

{REQUEST_RESPONSE_PATTERNS_FROM_TEMPLATE_CODE}

### 5.3 Validation

<!-- Guidance: Identify validation approach from template (DTOs with decorators, Zod schemas, etc.) -->

{VALIDATION_APPROACH_FROM_TEMPLATE}

### 5.4 Rate Limiting

<!-- Guidance: Check template for rate limiting configuration (NestJS throttler, express-rate-limit, etc.) -->

{RATE_LIMITING_CONFIG_FROM_TEMPLATE_OR_RECOMMENDATIONS}

---

## 6. Database Requirements

### 6.1 Database Design Standards

<!-- Guidance: Research templateRepo for:
     - Prisma schema, TypeORM entities, or equivalent
     - Database naming conventions
     - Migration patterns
     
     Document actual database patterns from template. -->

**Naming Conventions:**
{NAMING_CONVENTIONS_FROM_TEMPLATE_SCHEMA}

**Required Fields:**
{BASE_FIELDS_PATTERN_FROM_TEMPLATE}

### 6.2 Migration Standards

<!-- Guidance: Based on template's actual migration tooling (Prisma migrate, TypeORM migrations, etc.) -->

{MIGRATION_WORKFLOW_FROM_TEMPLATE}

**Commands:**
```bash
{ACTUAL_COMMANDS_FROM_TEMPLATE_PACKAGE_JSON}
```

### 6.3 Query Performance

<!-- Guidance: Synthesize template's database patterns with product-spec scale requirements -->

{INDEXING_STRATEGY_AND_PERFORMANCE_GUIDELINES}

---

## 7. Security Requirements

### 7.1 Authentication

<!-- Guidance: Research templateRepo for:
     - Auth implementation (JWT, sessions, OAuth)
     - Token configuration
     - Password hashing approach
     
     Synthesize with product-spec security requirements. -->

**Method:** {AUTH_METHOD_FROM_TEMPLATE}

**Token Specifications:**
{TOKEN_CONFIG_FROM_TEMPLATE}

**Password Requirements:**
{PASSWORD_RULES_FROM_TEMPLATE_OR_STANDARDS}

### 7.2 Authorization

<!-- Guidance: Check template for RBAC, ABAC, or other authorization patterns.
     Map to product-spec user roles. -->

**Model:** {AUTHZ_MODEL_FROM_TEMPLATE}

**Roles:**
<!-- Guidance: Map product-spec roles to template's authorization system -->
| Role | Permissions |
|------|-------------|
| {ROLE_FROM_PRODUCT_SPEC} | {PERMISSIONS_MAPPED_TO_TEMPLATE} |

### 7.3 Data Protection

<!-- Guidance: Research template for security configurations:
     - Encryption at rest/in transit
     - Input sanitization
     - SQL injection prevention (parameterized queries)
     
     Document template's security measures. -->

{SECURITY_MEASURES_FROM_TEMPLATE}

### 7.4 Security Headers

<!-- Guidance: Check template's web server configuration for security headers -->

{SECURITY_HEADERS_FROM_TEMPLATE}

### 7.5 Compliance

<!-- Guidance: From product-spec requirements -->

{COMPLIANCE_REQUIREMENTS_FROM_PRODUCT_SPEC}

---

## 8. Performance Requirements

### 8.1 Response Time Targets

<!-- Guidance: From product-spec non-functional requirements -->

| Endpoint Type | P50 | P95 | P99 |
|---------------|-----|-----|-----|
| {TYPE} | {TARGET} | {TARGET} | {TARGET} |

### 8.2 Frontend Performance

<!-- Guidance: Synthesize:
     - Template's frontend framework capabilities
     - Product-spec performance requirements
-->

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | {TARGET} | {TOOL_FROM_TEMPLATE} |
| Time to Interactive | {TARGET} | {TOOL} |
| Cumulative Layout Shift | {TARGET} | {TOOL} |

### 8.3 Scalability Targets

<!-- Guidance: From product-spec scale requirements and GTM strategy -->

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Concurrent Users | {N} | {N} | {N} |
| Requests/sec | {N} | {N} | {N} |
| Data Volume | {SIZE} | {SIZE} | {SIZE} |

---

## 9. Infrastructure Requirements

### 9.1 Environment Configuration

<!-- Guidance: Research templateRepo for:
     - docker-compose files
     - Dockerfile configurations
     - CI/CD workflows
     - Deployment configs
-->

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| Local | Development | {DOCKER_COMPOSE_FROM_TEMPLATE} |
| CI | Automated testing | {CI_PROVIDER_FROM_TEMPLATE} |
| Staging | Pre-production | {DEPLOYMENT_FROM_TEMPLATE} |
| Production | Live system | {DEPLOYMENT_FROM_TEMPLATE} |

### 9.2 Environment Variables

<!-- Guidance: Research template for .env.example or similar -->

**Structure:**
{ENV_VAR_CATEGORIES_FROM_TEMPLATE}

**Management:**
{ENV_VAR_MANAGEMENT_APPROACH_FROM_TEMPLATE}

### 9.3 CI/CD Pipeline

<!-- Guidance: Extract from template's .github/workflows/, .gitlab-ci.yml, etc. -->

{CI_CD_WORKFLOW_FROM_TEMPLATE}

### 9.4 Monitoring & Alerting

<!-- Guidance: Research template for:
     - Monitoring integrations (Sentry, etc.)
     - Logging configuration
     - Health check endpoints
     
     Synthesize with product-spec observability needs. -->

| Tool | Purpose | Metrics |
|------|---------|---------|
| {TOOL_FROM_TEMPLATE} | {PURPOSE} | {METRICS} |

**Alert Thresholds:**
{ALERTING_CONFIG_RECOMMENDATIONS}

---

## 10. Documentation Requirements

### 10.1 Required Documentation

<!-- Guidance: Based on template's documentation structure and development standards -->

| Document | Owner | Location | Update Frequency |
|----------|-------|----------|------------------|
| {DOC_TYPE_FROM_TEMPLATE} | {OWNER} | {LOCATION} | {FREQUENCY} |

### 10.2 Code Documentation

<!-- Guidance: Extract from template's code documentation patterns -->

{CODE_DOCUMENTATION_STANDARDS_FROM_TEMPLATE}

### 10.3 Architecture Decision Records (ADRs)

<!-- Guidance: Check if template uses ADRs (docs/adr/ directory) -->

{ADR_APPROACH_FROM_TEMPLATE_OR_RECOMMENDATION}

---

## 11. Development Environment Setup

### 11.1 Prerequisites

<!-- Guidance: Extract from templateRepo README.md -->

{PREREQUISITES_FROM_TEMPLATE_README}

### 11.2 Quick Start

<!-- Guidance: Extract actual setup commands from template README -->

```bash
{ACTUAL_SETUP_COMMANDS_FROM_TEMPLATE}
```

### 11.3 Common Commands

<!-- Guidance: Extract from template's package.json scripts or equivalent -->

```bash
{ACTUAL_NPM_SCRIPTS_OR_COMMANDS_FROM_TEMPLATE}
```

---

## 12. Appendices

### Appendix A: Tool Versions

| Tool | Version | Notes |
|------|---------|-------|
| {TOOL_FROM_RESEARCH} | {VERSION} | {NOTES} |

### Appendix B: Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| {VAR_FROM_TEMPLATE} | {YES/NO} | {DEFAULT} | {DESCRIPTION} |

### Appendix C: Error Code Reference

<!-- Guidance: Extract from template's error handling code if standardized -->

| Code | HTTP Status | Description | User Message |
|------|-------------|-------------|--------------|
| {CODE} | {STATUS} | {DESCRIPTION} | {MESSAGE} |

### Appendix D: Glossary

| Term | Definition |
|------|------------|
| {TERM} | {DEFINITION} |

---
