/**
 * Fixture manifest defining all integration test fixtures and their template dependencies.
 * Used for fixture freshness checking and automated regeneration.
 */

export interface FixtureDefinition {
  /** Fixture filename (relative to fixtures/) */
  fixture: string;
  /** Template name (matches skills/generating-documents/assets/templates/{name}.md) */
  template: string;
  /** Startup name used in the fixture */
  startup: string;
  /** Document type (for challenger mode context) */
  documentType: string;
  /** Minimal context for fixture generation */
  context: string;
}

export const fixtureManifest: FixtureDefinition[] = [
  {
    fixture: 'market-analysis-quicktest.md',
    template: 'market-analysis',
    startup: 'QuickTest',
    documentType: 'market-analysis',
    context: `A B2B SaaS startup building AI-powered expense tracking.
- Problem: Manual expense tracking wastes 5 hours/week for small businesses
- Solution: AI-powered receipt scanning and categorization
- Target: Small businesses with 5-50 employees
- Competitors: Expensify, QuickBooks`,
  },
  {
    fixture: 'business-brief-payflow.md',
    template: 'business-brief',
    startup: 'PayFlow',
    documentType: 'business-brief',
    context: `A fintech startup building instant B2B payment infrastructure.
- Problem: B2B payments take 30-90 days to settle, causing cash flow issues
- Solution: Real-time payment rails for business invoices
- Target: Small and medium businesses ($50K-$10M annual revenue)
- Competitors: Bill.com, Stripe, traditional banks`,
  },
  {
    fixture: 'product-brief-metricsdash.md',
    template: 'product-brief',
    startup: 'MetricsDash',
    documentType: 'product-brief',
    context: `A SaaS startup building real-time analytics for e-commerce.
- Problem: E-commerce owners lack real-time visibility into sales and inventory
- Solution: Dashboard with live sales tracking, inventory alerts, behavior heatmaps
- Target: E-commerce store owners and operations managers
- Integrations: Shopify, WooCommerce, BigCommerce`,
  },
  {
    fixture: 'product-spec-metricsdash.md',
    template: 'product-spec',
    startup: 'MetricsDash',
    documentType: 'product-spec',
    context: `A SaaS startup building real-time analytics for e-commerce.
- Core features: Real-time sales tracking, inventory alerts, customer behavior heatmaps
- Users: E-commerce store owners and operations managers
- Integrations: Shopify, WooCommerce, BigCommerce
- MVP scope: Dashboard with 3 key widgets, basic alerting, one integration`,
  },
  {
    fixture: 'business-plan-payflow.md',
    template: 'business-plan',
    startup: 'PayFlow',
    documentType: 'business-plan',
    context: `A fintech startup building instant B2B payment infrastructure.
- Problem: B2B payments take 30-90 days to settle
- Solution: Real-time payment rails with instant settlement
- Target: SMBs with $50K-$10M annual revenue
- Revenue model: Transaction fees (0.5%) + SaaS subscription ($99/mo)
- Funding ask: $2M seed for 18-month runway`,
  },
  {
    fixture: 'pitch-deck-payflow.md',
    template: 'pitch-deck',
    startup: 'PayFlow',
    documentType: 'pitch-deck',
    context: `A fintech startup building instant B2B payment infrastructure.
- Problem: B2B payments take 30-90 days to settle
- Solution: Real-time payment rails with instant settlement
- Target: SMBs with $50K-$10M annual revenue
- Revenue model: Transaction fees (0.5%) + SaaS subscription ($99/mo)
- Funding ask: $2M seed for 18-month runway
- Traction: 25 beta customers, $2.4M processed`,
  },
];
