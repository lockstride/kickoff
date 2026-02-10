import type { Task } from '../types';

export const marketAnalysisTask: Task = {
  name: 'market-analysis-fintech',
  description: 'Generate a market analysis for a fintech payment startup',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'market-analysis',
    startup_name: 'PayFlow',
    // Use business-brief fixture as input context (realistic document chain)
    context_fixture: 'business-brief-payflow.md',
    context: `Generate a market analysis covering market size, competitive landscape, and market trends.
Build on the business brief provided above.`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        // Section names must match actual template: market-analysis.md
        // Template uses numbered sections like "## 2. Market Size & Economics"
        sections_present: [
          'Executive Summary',
          'Market Size', // Will match "## 2. Market Size & Economics"
          'Competitive Analysis', // Will match "## 5. Competitive Analysis"
          'Market Trends', // Will match "## 4. Market Trends & Forces"
        ],
        min_word_count: 600,
        no_placeholder_text: true,
        contains: ['B2B', 'payment', 'SMB'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the market analysis on these dimensions:

1. **Data Grounding** (0-1): Does it include realistic market sizing?
   - Mentions TAM/SAM/SOM or equivalent concepts
   - Numbers are plausible for the B2B payments space
   - Sources or methodology are mentioned

2. **Competitive Depth** (0-1): Is the competitive analysis substantive?
   - Names specific competitors (Bill.com, Stripe, etc.)
   - Identifies competitive advantages and disadvantages
   - Explains market positioning

3. **Trend Relevance** (0-1): Are identified trends relevant?
   - Trends relate to the specific market (B2B payments, fintech)
   - Discusses implications for the startup

4. **Context Propagation** (0-1): Does it reference the business brief context?
   - Builds on the stated problem and solution
   - Market analysis aligns with target customer definition`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
