import type { Task } from '../types';

export const namingFlowTask: Task = {
  name: 'naming-flow-inline',
  description:
    'Test the inline naming flow: interactive session runs in parent context (not via agent)',
  trials: 2,
  input: {
    execution_mode: 'interactive',
    skill: 'naming-business',
    references: ['references/naming-phases.md'],
    startup_name: 'CloudSync Startup',
    context: `A cloud infrastructure startup building developer tools.

Brand context:
- Tone: Technical but friendly, modern
- Target audience: DevOps engineers and cloud architects
- Key values: Speed, reliability, simplicity
- Avoid: Generic cloud terms, overly complex names
- Preference: Short (1-2 syllables), memorable, available .io or .dev domain

When asked preference questions, provide clear answers:
- Style: Fanciful/invented over descriptive
- Emotional: Confident, cutting-edge
- Sonic: Short, punchy, hard consonants
- Constraints: Must work internationally, no cultural issues`,
    conversation: [
      {
        trigger: 'naming|exercise|preference|style|What would you like',
        user_message: '1',
      },
      {
        trigger: 'Fanciful|Descriptive|style.*prefer',
        user_message: 'Fanciful/invented. I want something unique that we can own completely.',
      },
      {
        trigger: 'emotion|feel|evoke',
        user_message:
          'Confident, cutting-edge, reliable. Like you can trust us with your infrastructure.',
      },
      {
        trigger: 'sonic|sound|syllable',
        user_message: 'Short and punchy. 1-2 syllables max. Hard consonants like K, T, P.',
      },
      {
        trigger: 'constraint|TLD|domain',
        user_message: '.io or .dev preferred. Must work internationally.',
      },
      {
        trigger: 'those preferences are correct|ready.*generate|generate.*candidate|Alignment',
        user_message: 'Yes, those preferences are correct. Generate candidates.',
      },
    ],
  },
  graders: [
    {
      type: 'code',
      checks: {
        min_word_count: 200,
        no_placeholder_text: true,
        contains_questions: true,
        min_turns: 3,
        contains: ['candidate', 'name'],
        not_contains: ['[insert', '[your'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the inline naming flow:

1. **Interactive Session** (0-1): Did the session gather preferences interactively?
   - Preference questions were asked
   - User responses were incorporated
   - Not a one-shot generation

2. **Preference Adherence** (0-1): Do candidates match stated preferences?
   - Short names (1-2 syllables)
   - Fanciful/invented style
   - Hard consonants
   - Appropriate for tech/developer audience

3. **Candidate Quality** (0-1): Are the name candidates well-reasoned?
   - Each candidate has rationale
   - Variety of approaches
   - Memorable and distinctive

4. **Response Integration** (0-1): Were user preferences incorporated?
   - Candidates reflect stated preferences
   - No generic names that ignore preferences
   - Conversation context was retained`,
      threshold: 0.65,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.65',
    min_pass_rate: 0.5,
  },
};
