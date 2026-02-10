import type { Task } from '../types';

export const productBriefGatheringTask: Task = {
  name: 'product-brief-gathering-saas',
  description:
    'Test the inline gathering-input flow for product-brief: interactive session with product-specific questions',
  trials: 2,
  input: {
    execution_mode: 'interactive',
    skill: 'gathering-input',
    startup_name: 'MetricsDash',
    document_type: 'product-brief',
    context: `A SaaS startup building real-time analytics for e-commerce.

Key details:
- Problem: E-commerce owners lack real-time visibility into sales and inventory
- Solution: Dashboard with live sales tracking, inventory alerts, behavior heatmaps
- Target: E-commerce store owners and operations managers
- Integrations: Shopify, WooCommerce, BigCommerce
- Stage: Pre-MVP, validating product direction

When asked product-brief questions, provide thoughtful answers that demonstrate:
1. Clear value proposition (real-time visibility saves time and money)
2. Feature prioritization (MVP vs future)
3. User understanding (store owners vs operations managers)
4. Technical constraints awareness (API rate limits, data volume)`,
    conversation: [
      {
        trigger: 'value proposition|biggest benefit|core value|one.*sentence',
        user_message:
          'Store owners go from checking sales dashboards every hour to seeing live revenue streams and getting instant alerts when inventory runs low, saving them an average of 3 hours per day.',
      },
      {
        trigger: 'MVP|must-have|feature|priorit',
        user_message:
          'Must-have: Real-time sales dashboard with Shopify integration and basic inventory alerts. Nice-to-have: Customer behavior heatmaps, multi-store comparison, WooCommerce integration. The Shopify integration alone covers 60% of our target market.',
      },
      {
        trigger:
          'experience|spectrum|UX priorit|Speed.*Simplicity|Guided.*Customizable|Breadth.*Depth',
        user_message:
          'Speed and simplicity over power. Our users are busy store owners, not power users. We want fast, opinionated workflows that just work. Lean toward guided rather than open-ended. Focus on depth in the core use case (sales + inventory visibility) rather than breadth.',
      },
      {
        trigger: 'technical|constraint|platform|integration|data|API|compliance',
        user_message:
          'Shopify API has 40 requests/second rate limit. We need to handle stores with 10K+ SKUs efficiently. We plan to use webhooks for real-time events and batch sync for historical data. Data retention: 90 days live, 1 year archived.',
      },
      {
        trigger: 'Alignment Check|Does this align|adjustments needed|proceed',
        user_message: 'Yes, that captures the product direction well. Please proceed.',
      },
    ],
  },
  graders: [
    {
      type: 'code',
      checks: {
        min_word_count: 300,
        no_placeholder_text: true,
        contains_questions: true,
        min_turns: 3,
        contains: ['dashboard', 'Shopify', 'real-time'],
        not_contains: ['[insert', '[your', 'placeholder'],
      },
    },
    {
      type: 'model',
      rubric: `Evaluate the interactive product-brief gathering session:

1. **Product Focus** (0-1): Were questions specific to product decisions?
   - Value proposition, feature prioritization, user personas
   - Not generic business questions
   - Product-brief topic guide patterns visible

2. **Response Integration** (0-1): Did the assistant incorporate user responses?
   - Later questions built on earlier answers
   - No repeated or redundant questions
   - User context was retained across turns

3. **Phase Progression** (0-1): Did the conversation progress through phases?
   - Value proposition discussed
   - Feature prioritization addressed
   - User personas or technical constraints explored

4. **Summary Quality** (0-1): Was a useful summary provided?
   - Structured output capturing key product decisions
   - Reflects the specific answers given
   - Actionable for subsequent document generation`,
      threshold: 0.7,
    },
  ],
  success_criteria: {
    all_code_graders_pass: true,
    model_grader_score: '>= 0.7',
    min_pass_rate: 0.5,
  },
};
