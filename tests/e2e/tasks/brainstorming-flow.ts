import type { Task } from '../types';

export const brainstormingFlowTask: Task = {
  name: 'brainstorming-flow-fintech',
  description:
    'Test the inline gathering-input flow for business-brief: interactive session with user dialogue',
  trials: 2,
  input: {
    execution_mode: 'interactive',
    skill: 'gathering-input',
    startup_name: 'PaymentFlow',
    document_type: 'business-brief',
    context: `A fintech startup solving the B2B payment delays problem.

Key details:
- Target: SMBs (small-medium businesses) waiting 30-90 days for payment
- Problem: Cash flow crunches due to slow invoice payments
- Solution: AI-powered invoice factoring with instant payouts
- Differentiator: Predictive risk model reduces fees vs traditional factoring
- Founder background: 10 years in fintech, built payment infrastructure at Stripe

When asked input gathering questions, provide thoughtful answers that demonstrate:
1. Clear problem definition (B2B payment delays cause cash flow crises)
2. Specific solution (AI risk modeling for invoice factoring)
3. Target market clarity (SMBs in service industries)
4. Founder-market fit (deep fintech experience)`,
    conversation: [
      {
        trigger: 'What problem are you solving|problem.*solving',
        user_message:
          'B2B payments take 30-90 days to settle. SMBs in service industries face constant cash flow crunches waiting for invoices to be paid. This limits their ability to grow and sometimes threatens their survival.',
      },
      {
        trigger: 'solution|how does it work|why.*THIS',
        user_message:
          'We use AI to assess invoice risk in real-time and provide instant payouts to businesses. Our predictive model lets us offer lower fees than traditional factoring companies because we can better predict which invoices will be paid.',
      },
      {
        trigger: 'market|who.*pay|customer',
        user_message:
          'Service-based SMBs: agencies, consultancies, contractors. They have high-value invoices ($5K-$50K) from creditworthy enterprise clients but wait months for payment. We charge 2-3% vs 5-10% from traditional factors.',
      },
      {
        trigger: 'founder|why.*you|unfair advantage',
        user_message:
          "I spent 10 years building payment infrastructure at Stripe. I've seen this problem from the platform side and know exactly how to build the risk models. I also have relationships with the banks we need to partner with.",
      },
      {
        trigger: 'Alignment Check|Does this align|adjustments needed|ready to proceed',
        user_message: 'Yes, that captures it well. Please proceed.',
      },
    ],
  },
  graders: [
    {
      type: 'code',
      checks: {
        min_word_count: 400,
        no_placeholder_text: true,
        contains_questions: true,
        min_turns: 3,
        contains: ['payment', 'invoice', 'cash flow', 'SMB'],
        not_contains: ['[insert', '[your', 'placeholder'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the interactive input gathering session:

1. **Interactive Flow** (0-1): Did the session follow a conversational pattern?
   - Multiple exchanges between user and assistant
   - Questions were asked and answered
   - Not a one-shot generation

2. **Problem Validation** (0-1): Was the problem clearly articulated?
   - B2B payment delays are the core problem
   - Cash flow impact is understood
   - Target segment is specific (SMBs in service industries)

3. **Response Integration** (0-1): Did the assistant incorporate user responses?
   - Later questions built on earlier answers
   - No repeated or redundant questions
   - User context was retained

4. **Phase Progression** (0-1): Did the conversation progress through phases?
   - Problem interrogation happened
   - Solution scrutiny happened
   - Synthesis or summary was provided`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
    min_pass_rate: 0.5,
  },
};
