import type { Task } from '../types';

export const briefGenerationTask: Task = {
  name: 'brief-generation-developer-tools',
  description: 'Generate a business brief for an AI code review startup',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'business-brief',
    startup_name: 'CodeReviewAI',
    context: `A startup building AI-powered code review tools for enterprise engineering teams.

Key details:
- Target customers: Mid-size tech companies (100-1000 employees)
- Core problem: Code reviews are slow, inconsistent, and miss critical issues
- Solution: AI that learns team patterns and catches bugs, security issues, and style violations
- Differentiator: Integrates with existing workflows (GitHub, GitLab) with minimal setup
- Business model: SaaS subscription, per-seat pricing`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        // Section names must match actual template: business-brief.md
        sections_present: [
          'Executive Summary',
          'Problem Statement',
          'Proposed Solution',
          'Business Model',
          'Market Opportunity',
        ],
        min_word_count: 500,
        no_placeholder_text: true,
        contains: ['code review', 'AI', 'enterprise'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the business brief on these dimensions:

1. **Specificity** (0-1): Does it describe THIS specific startup, not generic advice? 
   - References specific details like "code review", "enterprise teams", "per-seat pricing"
   - Avoids vague statements that could apply to any startup

2. **Coherence** (0-1): Do problem, solution, and market align logically?
   - The problem clearly leads to the solution
   - The target market actually has the stated problem
   - The business model fits the target market

3. **Completeness** (0-1): Are all sections meaningfully filled?
   - No empty sections or placeholder text
   - Each section has substantive content (not just 1-2 sentences)

4. **Actionability** (0-1): Are next steps or implications clear?
   - Reader understands what the startup does
   - Clear enough to inform subsequent documents`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
