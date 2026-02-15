import type { Task } from '../types';

export const businessPlanTask: Task = {
  name: 'business-plan-fintech',
  description: 'Generate a business plan for a fintech payment startup',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'business-plan',
    startup_name: 'PayFlow',
    context_fixture: 'product-brief-metricsdash.md',
    context: `Generate a comprehensive business plan covering company overview, market analysis,
business model, financial plan, and funding requirements.
Build on the product brief provided above.`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        // Business plan template has 15 sections; Haiku often truncates after ~10.
        // Validate the core sections that reliably appear.
        sections_present: [
          'Executive Summary',
          'Company Overview',
          'Problem',
          'Solution',
          'Market Analysis',
          'Business Model',
        ],
        min_word_count: 1500,
        contains: ['revenue', 'market', 'team'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the business plan on these dimensions:

1. **Completeness** (0-1): Are all major sections meaningfully filled?
   - Executive summary, company overview, problem/solution, market, financials
   - No empty or skeletal sections

2. **Financial Realism** (0-1): Are financial projections plausible?
   - Revenue model is clearly defined
   - Numbers are internally consistent
   - Assumptions are stated

3. **Strategic Coherence** (0-1): Does the plan tell a coherent story?
   - Problem leads to solution leads to market opportunity
   - Business model fits the target market
   - Go-to-market aligns with resources

4. **Investor Readiness** (0-1): Would this be useful for fundraising?
   - Professional tone and structure
   - Clear ask and use of funds
   - Compelling narrative`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
