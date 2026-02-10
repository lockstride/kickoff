import type { Task } from '../types';

export const technicalRequirementsTask: Task = {
  name: 'technical-requirements-saas',
  description: 'Generate technical requirements for a SaaS analytics platform',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'technical-requirements',
    startup_name: 'MetricsDash',
    context_fixture: 'product-spec-metricsdash.md',
    context: `Generate technical requirements covering technology stack, architecture,
development standards, testing, API design, and security.
Build on the product spec provided above. Assume a modern TypeScript/React stack.`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        sections_present: [
          'Technology Stack',
          'Architecture',
          'Development Standards',
          'Testing',
          'API',
          'Security',
        ],
        min_word_count: 1000,
        no_placeholder_text: true,
        contains: ['TypeScript', 'API', 'database'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the technical requirements on these dimensions:

1. **Stack Specificity** (0-1): Are technology choices concrete?
   - Named technologies with versions or version ranges
   - Rationale for choices (not just listing popular tools)
   - Consistent and compatible selections

2. **Architecture Clarity** (0-1): Is the system architecture well-defined?
   - Component relationships described
   - Data flow explained
   - Scalability considerations addressed

3. **Standards Quality** (0-1): Are development standards actionable?
   - Coding conventions specified
   - Testing requirements clear
   - CI/CD expectations defined

4. **Security Depth** (0-1): Are security requirements substantive?
   - Authentication and authorization addressed
   - Data protection considered
   - Not just generic security boilerplate`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
