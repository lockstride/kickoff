import type { Task } from '../types';

export const challengerProductSpecTask: Task = {
  name: 'challenger-product-spec-solution-domain',
  description: 'Verify challenger agent challenges product spec using solution domain patterns',
  trials: 3,
  input: {
    execution_mode: 'challenger',
    document_type: 'product-spec',
    startup_name: 'MetricsDash',
    fixture: 'product-spec-metricsdash.md',
    context: 'Yes, challenge me on this product specification.',
    conversation: [
      {
        // Respond to scope/MVP challenge
        trigger: 'Challenge|\\?|scope|MVP|feature',
        user_message:
          'We deliberately limited MVP scope to one integration (Shopify) because they have 60% market share in our target segment. WooCommerce and BigCommerce will follow in month 3 based on early customer demand signals.',
      },
      {
        // Respond to technical feasibility challenge
        trigger: 'Challenge|\\?|technical|architecture|scale',
        user_message:
          'Our architecture uses WebSockets for real-time updates with Redis pub/sub for horizontal scaling. We tested the design with 10K concurrent connections on a single node. The Shopify API rate limits are the bottleneck, not our infrastructure.',
      },
      {
        // Respond to differentiation challenge
        trigger: 'Challenge|\\?|differentiat|compet|existing',
        user_message:
          'Existing analytics tools (Google Analytics, Shopify native) update hourly. We provide sub-minute latency. For flash sales and inventory management, this difference is critical. Our early beta users cited real-time as the #1 reason they switched.',
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
      rubric: `Evaluate the challenger engagement on product spec:

1. **Mode Activation** (0-1): Was SKEPTIC MODE clearly engaged?
   - Look for explicit "SKEPTIC MODE" announcement or header

2. **Solution Domain Relevance** (0-1): Were challenges specific to product/solution?
   - Questions about scope, technical feasibility, or differentiation
   - References the product spec content (not generic challenges)

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
