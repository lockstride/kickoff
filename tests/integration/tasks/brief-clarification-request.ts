import type { Task } from '../types';

export const briefClarificationRequestTask: Task = {
  name: 'brief-clarification-request',
  description:
    'Verify model requests clarification when context is insufficient for brief generation',
  trials: 3,
  input: {
    execution_mode: 'interactive',
    skill: 'gathering-input',
    startup_name: 'QuickLaunch',
    document_type: 'business-brief',
    context: `A startup for small business owners.`,
    conversation: [
      // No follow-up turns - we want to see if the model asks clarifying questions
      // rather than generating a document with insufficient context
    ],
  },
  graders: [
    {
      type: 'code',
      checks: {
        // Should ask questions, not generate a full document
        min_word_count: 100,
        no_placeholder_text: true,
        contains_questions: true,
        contains: ['problem'],
        not_contains: ['## Executive Summary', '## 90-Day Validation Plan'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate how the model handles insufficient context for business brief generation:

1. **Recognition** (0-1): Does it recognize the context is insufficient?
   - Acknowledges that the provided information is too vague
   - Does NOT attempt to fabricate a complete business brief
   - Understands a brief requires founder-specific knowledge

2. **Helpful Guidance** (0-1): Does it explain what information is needed?
   - Lists specific types of information required (problem, solution, target market, etc.)
   - Explains WHY this information matters
   - Is constructive, not dismissive

3. **Path Forward** (0-1): Does it offer actionable next steps?
   - Suggests an input gathering session, OR
   - Provides a clear list of questions to answer, OR
   - Offers to proceed if user provides specific details
   - Gives the user a clear way to move forward

4. **Tone** (0-1): Is the response professional and encouraging?
   - Not condescending or dismissive
   - Maintains helpfulness despite declining to fabricate
   - Treats the user as a capable founder`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
