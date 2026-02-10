import type { Task } from '../types';

export const goToMarketStrategyTask: Task = {
  name: 'go-to-market-strategy-saas',
  description: 'Generate a go-to-market strategy for a SaaS analytics platform',
  trials: 3,
  input: {
    execution_mode: 'autonomous',
    document_type: 'go-to-market-strategy',
    startup_name: 'MetricsDash',
    context_fixture: 'product-brief-metricsdash.md',
    context: `Generate a go-to-market strategy covering beachhead market, customer acquisition,
pricing, launch plan, and success metrics.
Build on the product brief provided above.`,
  },
  graders: [
    {
      type: 'code',
      checks: {
        sections_present: [
          'Strategic Foundation',
          'Beachhead Market',
          'Customer Acquisition',
          'Pricing Strategy',
          'Launch Strategy',
          'Metrics',
        ],
        min_word_count: 1000,
        no_placeholder_text: true,
        contains: ['e-commerce', 'Shopify', 'acquisition'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the go-to-market strategy on these dimensions:

1. **Beachhead Clarity** (0-1): Is the initial target market well-defined?
   - Specific segment identified (not "all e-commerce")
   - Rationale for why this segment first
   - Size and accessibility considered

2. **Channel Strategy** (0-1): Are acquisition channels specific and realistic?
   - Named channels with rationale
   - Realistic for a startup's budget and stage
   - Prioritized rather than listing everything

3. **Pricing Logic** (0-1): Is the pricing strategy justified?
   - Tied to value delivered
   - Competitive positioning considered
   - Tiers or packaging make sense

4. **Measurability** (0-1): Are success metrics defined?
   - Specific KPIs with targets
   - Timeframes specified
   - Leading and lagging indicators included`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
  },
};
