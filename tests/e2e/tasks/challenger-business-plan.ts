import type { Task } from '../types';

export const challengerBusinessPlanTask: Task = {
  name: 'challenger-business-plan-financials-domain',
  description: 'Verify challenger agent challenges business plan using financials domain patterns',
  trials: 3,
  input: {
    execution_mode: 'challenger',
    document_type: 'business-plan',
    startup_name: 'PayFlow',
    fixture: 'business-plan-payflow.md',
    context: 'Yes, challenge me on this business plan.',
    conversation: [
      {
        // Respond to unit economics challenge
        trigger: 'Challenge|\\?|unit economics|CAC|LTV|margin',
        user_message:
          'Our CAC of $450 is based on 3 months of pilot data with 47 customers acquired through direct sales and accounting firm referrals. LTV of $2,160 assumes 12-month average lifetime based on similar B2B fintech benchmarks (Bill.com reports 14-month average).',
      },
      {
        // Respond to revenue/growth assumptions
        trigger: 'Challenge|\\?|revenue|growth|projection|assumption',
        user_message:
          'Our Year 1 projection of 500 customers assumes 15% month-over-month growth, which we achieved in months 2-4 of our pilot. We model conservatively with 10% MoM for Year 2 as we scale beyond founder-led sales.',
      },
      {
        // Respond to competitive/market challenge
        trigger: 'Challenge|\\?|compet|market|differenti|why now',
        user_message:
          'Bill.com focuses on mid-market ($10M+ revenue) with complex AP/AR workflows. We target SMBs ($50K-$10M) with a simpler instant-settlement model. FedNow launching in 2023 was the "why now" — real-time rails are finally available at scale.',
      },
    ],
  },
  graders: [
    {
      type: 'code',
      checks: {
        min_word_count: 150,
        no_placeholder_text: true,
        contains: ['SKEPTIC MODE'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the challenger engagement on business plan:

1. **Mode Activation** (0-1): Was SKEPTIC MODE clearly engaged?
   - Look for explicit "SKEPTIC MODE" announcement or header

2. **Financials Domain Relevance** (0-1): Were challenges specific to financials?
   - Questions about unit economics, projections, or assumptions
   - References the business plan content (not generic challenges)

3. **Response Acknowledgment** (0-1): Did the challenger acknowledge user responses?
   - Responses evaluated, not ignored
   - Follow-up builds on previous answers

4. **Proper Exit** (0-1): Did the challenger conclude appropriately?
   - Clear end to SKEPTIC MODE or progression toward exit`,
      threshold: 0.6,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.6',
    min_pass_rate: 0.33,
  },
};
