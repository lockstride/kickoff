import type { Task } from '../types';

export const challengerEngagementTask: Task = {
  name: 'challenger-engagement-skeptic-mode',
  description:
    'Verify challenger agent engages SKEPTIC MODE and challenges market analysis appropriately',
  trials: 3,
  input: {
    execution_mode: 'challenger',
    document_type: 'market-analysis',
    startup_name: 'QuickTest',
    fixture: 'market-analysis-quicktest.md',
    context: 'Yes, challenge me on this market analysis.',
    // Multi-turn conversation to complete SKEPTIC MODE
    conversation: [
      {
        // Respond to first challenge
        trigger: 'Challenge|\\?|TAM|assumption',
        user_message:
          'Our TAM calculation uses bottom-up methodology: 6M small businesses in US × 30% with expense pain × $50/mo = $1B market. We focus on the underserved 5-50 employee segment where Expensify is too expensive and QuickBooks is too basic.',
      },
      {
        // Respond to second challenge
        trigger: 'Challenge|\\?|differentiat|compet',
        user_message:
          'We differentiate through instant categorization accuracy (95%+) and direct accounting software sync. Our timing is good because OCR costs dropped 80% in 2024.',
      },
      {
        // Respond to third challenge
        trigger: 'Challenge|\\?|customer|acquisition|concern',
        user_message:
          'Our customer acquisition will focus on accounting firm partnerships. We have 3 LOIs from regional firms representing 200+ potential SMB clients.',
      },
      {
        // Fourth response to ensure exit or trigger skip
        trigger: 'Challenge|\\?|Satisfactory|Unsatisfactory|unit|economics|conversion',
        user_message:
          "We're seeing 30% conversion on warm intros from our accounting partners. CAC payback is 4 months at current $50/mo pricing. skip",
      },
    ],
  },
  graders: [
    {
      type: 'code',
      checks: {
        min_word_count: 150,
        no_placeholder_text: true,
        contains: [
          'SKEPTIC MODE',
          'Validated Strengths',
          'Identified Gaps',
          'Revision Suggestions',
        ],
        not_contains: ['.challenger-insights-'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the challenger engagement on these dimensions:

1. **Mode Activation** (0-1): Was SKEPTIC MODE clearly engaged?
   - Look for explicit "SKEPTIC MODE" announcement or header
   - Clear transition into challenge mode

2. **Challenge Relevance** (0-1): Were challenges specific to this startup?
   - Questions should reference the expense tracking market, TAM, or stated assumptions
   - Not generic startup challenges

3. **Response Acknowledgment** (0-1): Did the challenger acknowledge user responses?
   - Responses should be evaluated, not ignored
   - Follow-up should build on previous answers

4. **Proper Exit** (0-1): Did the challenger conclude appropriately?
   - Clear end to SKEPTIC MODE (or clear progression toward exit)
   - Summary or acknowledgment of defended positions

5. **Insights Output** (0-1): Did the challenger produce structured insights?
   - Look for evidence of structured insights summary (Validated Strengths, Identified Gaps, Revision Suggestions)
   - Should reference validated strengths, gaps, or revision suggestions
   - No insights file should be created (verify no .challenger-insights- references)

6. **Exit Calibration** (0-1): Did the challenger provide appropriate closing advice?
   - For passing sessions: Acknowledgment of preparedness, remaining homework
   - For failing sessions: Kind push to reconsider
   - Tone should match the session outcome`,
      threshold: 0.6,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.6',
    min_pass_rate: 0.33,
  },
};
