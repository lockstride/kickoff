import type { Task } from '../types';

export const challengerBusinessBriefTask: Task = {
  name: 'challenger-business-brief-problem-domain',
  description: 'Verify challenger agent challenges business brief using problem domain patterns',
  trials: 3,
  input: {
    execution_mode: 'challenger',
    document_type: 'business-brief',
    startup_name: 'PayFlow',
    fixture: 'business-brief-payflow.md',
    context: 'Yes, challenge me on this business brief.',
    conversation: [
      {
        // Respond to problem validation challenge
        trigger: 'Challenge|\\?|problem|pain|evidence|validate',
        user_message:
          'We interviewed 47 SMB owners in service industries. 38 of them (81%) said late payments caused them to delay payroll at least once in the past year. The average delay cost was $12K in bridge financing fees per incident.',
      },
      {
        // Respond to problem severity/urgency challenge
        trigger: 'Challenge|\\?|severe|urgent|alternative|workaround',
        user_message:
          'Current workarounds are expensive: factoring costs 3-5% of invoice value, business credit cards charge 18-24% APR, and some founders use personal savings. We measured that our target segment spends $8K-$15K/year on these workarounds.',
      },
      {
        // Respond to problem scope/market challenge
        trigger: 'Challenge|\\?|scope|how many|market|segment|narrow',
        user_message:
          'There are 6.1M businesses in the US in our revenue range. Based on our interviews, roughly 40% experience this problem acutely. That gives us a serviceable market of ~2.4M businesses.',
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
      rubric: `Evaluate the challenger engagement on business brief:

1. **Mode Activation** (0-1): Was SKEPTIC MODE clearly engaged?
   - Look for explicit "SKEPTIC MODE" announcement or header

2. **Problem Domain Relevance** (0-1): Were challenges specific to the problem?
   - Questions about problem validation, severity, or evidence
   - Challenges whether the problem is real and worth solving
   - Not generic startup challenges

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
