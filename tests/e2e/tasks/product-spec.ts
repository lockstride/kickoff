import type { Task } from '../types';

export const productSpecTask: Task = {
  name: 'product-spec-saas',
  description: 'Generate a product spec for a SaaS analytics platform',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'product-spec',
    startup_name: 'MetricsDash',
    // Use product-brief fixture as input context (realistic document chain)
    context_fixture: 'product-brief-metricsdash.md',
    context: `Generate a product specification with user stories, technical requirements, and MVP scope.
Build on the product brief provided above.`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        // Section names must match actual template: product-spec.md
        // "User Stories" appears inline within features, not as section header
        // Template has numbered sections like "## 3. Functional Requirements"
        sections_present: [
          'Overview',
          'System Architecture',
          'Functional Requirements',
          'Data Model',
        ],
        min_word_count: 500,
        no_placeholder_text: true,
        // Check for user story format in content (not as section header)
        contains: ['As a', 'integration', 'MVP'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the product specification on these dimensions:

1. **User Story Quality** (0-1): Are user stories well-formed?
   - Follow "As a [user], I want [goal], so that [benefit]" format or equivalent
   - Specific to this product (not generic)
   - Cover key functionality

2. **Technical Depth** (0-1): Are technical requirements specific?
   - Mentions specific integrations (Shopify, etc.)
   - Includes data/API considerations
   - Realistic for a startup MVP

3. **Scope Clarity** (0-1): Is MVP scope clearly defined?
   - Distinguishes what's in/out of MVP
   - Prioritizes features appropriately

4. **Consistency** (0-1): Does it align with the provided context?
   - References the stated features and integrations
   - Appropriate for e-commerce analytics`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
