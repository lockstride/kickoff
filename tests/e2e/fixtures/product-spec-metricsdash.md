# Product Specification: MetricsDash

## 1. Overview

MetricsDash provides real-time e-commerce analytics through a unified dashboard. This specification defines the technical requirements for the MVP release.

### Scope

- Real-time sales dashboard with sub-minute latency
- Inventory alert system with predictive thresholds
- Shopify integration (primary platform for MVP)
- Web application (responsive, desktop-first)

### Out of Scope

- Mobile native apps
- Customer behavior heatmaps
- Multi-store management
- WooCommerce/BigCommerce integrations (post-MVP)

## 2. System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Shopify API   │────▶│  Sync Service   │────▶│   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │◀───▶│   API Server    │◀────│   Redis Cache   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│   WebSocket     │
└─────────────────┘
```

### Components

- **Sync Service**: Polls Shopify API, processes webhooks, normalizes data
- **API Server**: REST + WebSocket endpoints for dashboard data
- **Web Client**: React SPA with real-time updates via WebSocket

## 3. Functional Requirements

### FR-1: Store Connection

As a store owner, I want to connect my Shopify store via OAuth so I can start seeing my data.

**Acceptance criteria**:
- OAuth 2.0 flow with Shopify
- Store connection completes in under 60 seconds
- Initial data sync completes within 5 minutes for stores with <10K orders
- Clear progress indicator during sync

### FR-2: Real-Time Sales Widget

As a store owner, I want to see live sales metrics so I can monitor my business in real-time.

**Metrics displayed**:
- Orders (count, today vs yesterday)
- Revenue (GMV, today vs yesterday)
- Average Order Value (calculated)
- Conversion rate (if traffic data available)

**Update frequency**: Every 30 seconds via WebSocket push

### FR-3: Inventory Alerts

As an operations manager, I want to receive alerts when inventory is low so I can reorder before stockouts.

**Alert types**:
- Low stock (below configurable threshold)
- Predicted stockout (based on 7-day velocity)
- Reorder point reached

**Delivery methods (MVP)**:
- In-app notification
- Email digest (configurable frequency)

### FR-4: Dashboard Configuration

As a store owner, I want to customize my dashboard layout so I can focus on what matters to me.

**Customization options**:
- Widget visibility toggle
- Threshold configuration for alerts
- Comparison period selection (yesterday, last week, last month)

## 4. Data Model

### Core Entities

```typescript
interface Store {
  id: string;
  shopifyDomain: string;
  accessToken: string; // encrypted
  syncStatus: 'pending' | 'syncing' | 'complete' | 'error';
  lastSyncAt: Date;
}

interface Order {
  id: string;
  storeId: string;
  shopifyOrderId: string;
  totalPrice: number;
  currency: string;
  lineItems: LineItem[];
  createdAt: Date;
}

interface Product {
  id: string;
  storeId: string;
  shopifyProductId: string;
  title: string;
  variants: ProductVariant[];
}

interface InventoryAlert {
  id: string;
  storeId: string;
  productId: string;
  alertType: 'low_stock' | 'predicted_stockout' | 'reorder_point';
  threshold: number;
  currentLevel: number;
  status: 'active' | 'acknowledged' | 'resolved';
}
```

## 5. API Specification

### Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### GET /api/stores/:storeId/dashboard
Returns current dashboard metrics.

**Response**:
```json
{
  "orders": { "today": 42, "yesterday": 38, "change": 0.105 },
  "revenue": { "today": 4250.00, "yesterday": 3800.00, "change": 0.118 },
  "aov": { "today": 101.19, "yesterday": 100.00, "change": 0.012 },
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

#### GET /api/stores/:storeId/alerts
Returns active inventory alerts.

#### WebSocket /ws/stores/:storeId
Real-time updates stream.

**Events**:
- `dashboard:update` - New dashboard metrics
- `alert:created` - New inventory alert
- `alert:resolved` - Alert auto-resolved

## 6. Non-Functional Requirements

### Performance
- Dashboard load: < 2 seconds (P95)
- WebSocket update latency: < 500ms from data change
- API response time: < 200ms (P95)

### Scalability
- Support 1,000 concurrent connected stores
- Handle 100 orders/second aggregate across all stores

### Security
- All data encrypted at rest (AES-256)
- TLS 1.3 for all connections
- OAuth tokens encrypted with per-tenant keys
- SOC 2 Type II compliance (post-MVP)

### Availability
- 99.9% uptime SLA
- Graceful degradation: cached data shown if real-time fails

## 7. MVP Milestones

| Milestone | Deliverables | Duration |
|-----------|--------------|----------|
| M1 | Shopify OAuth, data sync | 2 weeks |
| M2 | Sales dashboard, WebSocket | 2 weeks |
| M3 | Inventory alerts | 1 week |
| M4 | Beta testing, bug fixes | 2 weeks |
| M5 | Public launch | 1 week |
