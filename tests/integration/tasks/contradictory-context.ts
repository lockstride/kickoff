import type { Task } from '../types';

export const contradictoryContextTask: Task = {
  name: 'contradictory-context-detection',
  description:
    'Verify model flags contradictions rather than blindly generating from inconsistent context',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'business-brief',
    startup_name: 'ConflictCo',
    context: `A B2C consumer mobile app targeting individual users aged 18-25.

Key details:
- Target customers: Enterprise companies with 10,000+ employees
- Core problem: College students can't find affordable textbooks
- Solution: AI-powered enterprise resource planning system
- Business model: Freemium consumer app with in-app purchases
- Market: Fortune 500 companies with $100M+ IT budgets
- Distribution: TikTok influencer marketing campaign`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        min_word_count: 100,
        no_placeholder_text: true,
      },
    },
    {
      type: 'model',
      rubric: `Evaluate how the model handles contradictory/inconsistent context:

1. **Contradiction Detection** (0-1): Does it identify the contradictions?
   - B2C consumer app vs enterprise customers
   - College textbook problem vs ERP solution
   - Freemium consumer model vs Fortune 500 market
   - TikTok distribution vs enterprise sales
   Score 0 if it generates a document that ignores all contradictions.
   Score 0.5 if it picks one side and ignores the other.
   Score 1.0 if it explicitly identifies the contradictions.

2. **Helpful Response** (0-1): Does it guide the user toward resolution?
   - Asks clarifying questions about which direction is intended
   - Suggests resolving contradictions before generating
   - Does NOT fabricate a coherent narrative from incoherent inputs

3. **Professional Handling** (0-1): Is the response constructive?
   - Not dismissive or condescending
   - Specific about which elements conflict
   - Offers a path forward`,
      threshold: 0.5,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.5',
    min_pass_rate: 0.33,
  },
};
