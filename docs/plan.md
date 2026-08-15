# ScanFlow Analytics

A product-focused QR analytics platform built as an end-to-end technical showcase for dynamic QR routing, scan analytics, visitor journey tracking, and conversion optimization.

The project demonstrates how a QR platform can go beyond QR code generation by combining dynamic routing, scan analytics, visitor sessions, conversion tracking, and A/B testing in one product flow.

## Product Concept

A business creates a dynamic QR code and chooses where visitors should go.

Instead of treating a QR code as a static image, the platform treats it as a programmable entry point.

```text
Create QR
    |
    v
Scan QR
    |
    v
Dynamic Routing
    |
    +---- Device
    +---- Location
    +---- Language
    +---- Time
    +---- Campaign
    |
    v
Destination
    |
    v
Analytics Event Stream
    |
    v
Dashboard
    |
    v
Optimization / A-B Testing
```

## Goals

The project should demonstrate practical full-stack engineering skills relevant to the role:

- React and Next.js product development
- TypeScript
- Node.js backend development
- REST API design
- SQL and PostgreSQL
- Dynamic QR functionality
- Dashboard development
- Analytics and event tracking
- Performance optimization
- Reliability and security
- Product-oriented UX
- Independent feature ownership

The goal is not to build a huge QR SaaS. The goal is to build one polished, complete product flow that feels like a real product.

---

# Feature List

## 1. Authentication

Users can create an account and access their own dashboard.

- Sign up
- Sign in
- Sign out
- Protected dashboard routes
- Session management
- User-level data isolation

Optional:
- Google OAuth
- Password reset
- Email verification

## 2. Dashboard

The dashboard provides a quick overview of QR performance.

### Overview metrics

- Total scans
- Unique visitors
- Active QR codes
- Conversion rate
- Scans today
- Scans this week
- Scans this month
- Top-performing QR code

### Analytics

- Scan activity over time
- Device distribution
- Location distribution
- Browser distribution
- Operating system distribution
- Campaign performance

### Actions

- Create QR code
- View QR codes
- Create campaign
- View analytics
- Create experiment

## 3. Dynamic QR Code Builder

Users create QR codes that point to a dynamic redirect URL.

Example:

```text
https://demo.example.com/r/restaurant-menu
```

The QR image remains unchanged while its destination can change from the dashboard.

### Features

- QR code name
- Destination URL
- Custom slug
- QR preview
- Download PNG
- Download SVG
- Enable / disable QR
- Update destination
- Duplicate QR code
- Delete QR code
- QR status

Statuses:

- Active
- Paused
- Archived

## 4. Dynamic QR Routing

The QR code can route visitors to different destinations based on request context.

### Conditions

- Device
- Operating system
- Country
- Language
- Time
- Campaign
- Experiment variant

Example:

```text
QR Code
   |
   +-- iOS ------> App Store
   |
   +-- Android --> Google Play
   |
   +-- Desktop --> Website
```

Rules have explicit priorities so routing is deterministic.

## 5. QR Redirect Engine

Example endpoint:

```text
GET /r/:code
```

The service should:

1. Validate the QR code
2. Check whether it is active
3. Load routing configuration
4. Resolve visitor context
5. Select the destination
6. Create a scan/session event
7. Apply experiment assignment when enabled
8. Redirect the visitor

### Performance

- Database indexes
- Minimal queries
- Cached QR configuration where appropriate
- Efficient routing logic
- Async analytics processing where appropriate

## 6. Scan Tracking

Record each QR scan as an analytics event.

Data:

- QR code ID
- Campaign ID
- Session ID
- Timestamp
- Device type
- Browser
- Operating system
- Country
- Region or city when available
- Referrer
- Destination
- Experiment ID
- Experiment variant

Avoid unnecessary personal information.

## 7. Visitor Sessions

A scan can start a visitor session. The session groups related events together.

Example:

```text
Session #abc123

10:42:03
QR scanned

10:42:05
Landing page opened

10:42:18
Menu viewed

10:43:02
Order Now clicked

10:43:17
WhatsApp opened
```

Features:

- Session ID
- Session start
- Session end
- QR code
- Campaign
- Device
- Location
- Events
- Conversion status

## 8. Scan Journey

This is the standout feature.

Instead of showing only aggregate numbers, the dashboard shows the sequence of events for a session.

```text
Scan
 |
 v
Landing Page
 |
 v
Menu Viewed
 |
 v
Product Selected
 |
 v
Order Button Clicked
 |
 v
Conversion
```

Each event shows:

- Time
- Event type
- Page
- Device
- Relevant metadata

Event types:

- QR_SCAN
- PAGE_VIEW
- BUTTON_CLICK
- LINK_CLICK
- FORM_SUBMIT
- CONVERSION
- EXTERNAL_REDIRECT

## 9. Campaigns

Users can group QR codes into campaigns.

Example:

```text
Campaign:
Summer Restaurant Promotion

QR Codes:
- Table QR
- Poster QR
- Flyer QR
- Instagram QR
```

Features:

- Create campaign
- Edit campaign
- Archive campaign
- Assign QR codes
- Campaign analytics
- Campaign conversion rate

## 10. Analytics

### Metrics

- Total scans
- Unique sessions
- Returning visitors
- Conversion rate
- Average session duration
- Top QR codes
- Top campaigns

### Breakdowns

- Device
- Location
- Time
- Destination
- Campaign

## 11. Conversion Tracking

Users can define conversion events.

Example:

```text
Conversion:
Order Now Click

Event:
BUTTON_CLICK
```

Calculation:

```text
Conversions / Sessions * 100
```

Example:

```text
Sessions       8,431
Conversions      826

Conversion Rate  9.8%
```

## 12. A/B Testing

A QR code can distribute traffic between two destinations.

Example:

```text
Campaign:
Summer Menu

Variant A
/menu

50%

Variant B
/summer-menu

50%
```

Track:

- Scans
- Sessions
- Conversions
- Conversion rate

Features:

- Create experiment
- Select QR code
- Create variants
- Configure traffic percentage
- Start experiment
- Pause experiment
- End experiment
- Compare performance

## 13. Smart Destination Rules

Allow users to create rules.

Example:

```text
IF device = iOS
THEN App Store

IF device = Android
THEN Google Play

IF country = Indonesia
THEN Indonesian landing page

ELSE
THEN default website
```

## 14. QR Customization

Basic visual customization:

- Foreground color
- Background color
- Logo
- Size
- Margin
- Error correction level
- Download format

## 15. QR Preview

Live preview in the builder.

```text
+-----------------------+
|                       |
|       QR CODE         |
|                       |
|        ScanFlow       |
|                       |
+-----------------------+

[ Download PNG ]
[ Download SVG ]
```

## 16. REST API

Suggested endpoints:

```text
POST   /api/qr-codes
GET    /api/qr-codes
GET    /api/qr-codes/:id
PATCH  /api/qr-codes/:id
DELETE /api/qr-codes/:id

POST   /api/campaigns
GET    /api/campaigns

GET    /api/analytics/overview
GET    /api/analytics/scans
GET    /api/analytics/sessions

POST   /api/experiments
GET    /api/experiments/:id

GET    /r/:code
```

## 17. PostgreSQL Data Model

Suggested entities:

```text
users
qr_codes
campaigns
routing_rules
scan_events
sessions
session_events
conversions
experiments
experiment_variants
```

Relationships:

```text
User
 |
 +-- Campaign
 |     |
 |     +-- QR Code
 |
 +-- QR Code
       |
       +-- Routing Rules
       |
       +-- Scan Events
       |
       +-- Sessions
       |
       +-- Experiments
```

## 18. Multi-Tenant Data Isolation

Each user's data must remain isolated.

Use either:

```text
organization_id
```

or:

```text
user_id
```

depending on the architecture.

Every API query must enforce ownership.

Example:

```sql
SELECT *
FROM qr_codes
WHERE id = $1
AND organization_id = $2;
```

Never trust the client to provide authorization boundaries.

## 19. Rate Limiting

Protect public redirects and APIs from:

- Request floods
- Bot traffic
- Abuse
- Accidental loops

Use separate limits for public redirect traffic and authenticated API traffic.

## 20. Error Handling

Handle:

- Invalid QR code
- Deleted QR code
- Paused QR code
- Invalid destination
- Missing experiment
- Invalid routing rule
- Database failure
- Unauthorized access

Analytics failures should not prevent a valid visitor from reaching a valid destination.

## 21. Security

Implement:

- Authentication
- Authorization
- Input validation
- URL validation
- Rate limiting
- Secure cookies
- CSRF protection where applicable
- XSS prevention
- SQL injection protection through parameterized queries or ORM
- Safe analytics handling
- Minimal PII collection

## 22. Performance

### Frontend

- Server Components where appropriate
- Code splitting
- Lazy loading
- Optimized images
- Minimal client-side JavaScript
- Efficient dashboard rendering
- Pagination

### Backend

- Indexed queries
- Efficient analytics queries
- Cached QR configuration
- Avoid N+1 queries
- Pagination
- Async event processing where appropriate

Target:

```text
Lighthouse Performance: 90+
```

and a fast QR redirect path.

## 23. Testing

### Unit tests

Test:

- Routing rules
- Experiment assignment
- Conversion calculations
- Analytics aggregation
- Authorization logic

### Integration tests

Test:

- QR creation
- QR update
- Redirect flow
- Scan tracking
- Experiment flow
- Authentication

### E2E tests

Use Playwright for:

```text
Sign in
   |
Create QR
   |
Open QR
   |
Follow redirect
   |
Generate analytics
   |
View dashboard
```

## 24. Demo Data

Use realistic sample data so the dashboard looks alive immediately.

Example:

```text
Restaurant Menu
12,842 scans
8,431 sessions
9.8% conversion

Summer Promotion
7,241 scans
5,102 sessions
12.4% conversion
```

Generate historical events across several weeks.

Include:

- Multiple QR codes
- Multiple campaigns
- Multiple locations
- Multiple devices
- Multiple sessions
- At least one A/B experiment

## 25. Responsive UI

Support:

- Desktop
- Tablet
- Mobile

The QR creation flow should remain usable on small screens.

---

# Recommended Tech Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
```

## Backend

```text
Next.js Route Handlers
Node.js
REST API
```

## Database

```text
PostgreSQL
Drizzle ORM
```

## Authentication

Choose:

```text
Supabase Auth
```

or:

```text
Auth.js
```

## Testing

```text
Vitest / Jest
React Testing Library
Playwright
```

## Deployment

```text
Vercel
PostgreSQL provider
```

---

# Suggested Project Structure

```text
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── qr-codes/
│   │   ├── campaigns/
│   │   ├── analytics/
│   │   └── experiments/
│   │
│   ├── r/
│   │   └── [code]/
│   │       └── route.ts
│   │
│   └── api/
│       ├── qr-codes/
│       ├── campaigns/
│       ├── analytics/
│       └── experiments/
│
├── components/
│   ├── dashboard/
│   ├── qr-builder/
│   ├── analytics/
│   ├── experiments/
│   └── ui/
│
├── lib/
│   ├── db/
│   ├── auth/
│   ├── qr/
│   ├── routing/
│   ├── analytics/
│   └── experiments/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

# MVP Scope

Build these first:

1. Authentication
2. Dashboard
3. QR code creation
4. Dynamic QR redirect
5. Scan tracking
6. Session tracking
7. Analytics dashboard
8. Scan Journey
9. A/B testing
10. REST API
11. PostgreSQL
12. Tests

Everything else can become Phase 2.

# Phase 2

- Smart routing
- QR customization
- Campaign management
- Conversion definitions
- Advanced analytics
- Google OAuth
- API keys
- Webhooks
- CSV export
- Team accounts
- Role-based access control

---

# Outstanding Feature

## Scan Journey + A/B Testing

A normal QR dashboard might show:

```text
12,842 scans
```

This project should answer:

```text
Who scanned?
Where did they come from?
What device did they use?
Which destination did they receive?
What did they do afterward?
Did they convert?
Which destination performs better?
```

That creates a strong product story.

---

# Demo Scenario

Use a fictional restaurant:

**Bowl & Co.**

Create:

```text
Campaign:
Summer Menu 2026

QR Code:
Restaurant Table QR

Experiment:

A:
Normal Menu

B:
Summer Menu Landing Page
```

Generate traffic and show:

```text
12,842 scans
8,431 sessions
826 conversions
9.8% conversion rate
```

Open the Scan Journey:

```text
QR Scan
   ↓
Menu Landing Page
   ↓
Summer Menu
   ↓
Product View
   ↓
Order Now
   ↓
Conversion
```

Then open the experiment:

```text
Variant A
6.2%

Variant B
9.8%

Winner
Variant B
```

The recruiter should understand the product within two minutes.

---

# Definition of Done

The project is ready to send when a recruiter can:

- Create an account
- Create a dynamic QR code
- Download the QR code
- Open the QR code
- Get redirected to a destination
- Generate scan data
- View the scan in the dashboard
- Open a visitor session
- See the Scan Journey
- Create an A/B experiment
- Compare variants
- See conversion results

The project should feel like a small real SaaS product rather than a collection of demo screens.

---

# README Demo Section

When finished, include:

1. Landing page screenshot
2. QR builder screenshot
3. Dashboard screenshot
4. Scan analytics screenshot
5. Scan Journey screenshot
6. A/B testing screenshot
7. Mobile dashboard screenshot

Also include a short architecture diagram and explain the redirect flow.

---

# What This Project Demonstrates

- Product thinking
- Full-stack engineering
- React and Next.js
- TypeScript
- Node.js
- REST APIs
- PostgreSQL
- Dynamic QR functionality
- Analytics
- Event tracking
- Dashboard UX
- A/B testing
- Performance engineering
- Security
- Testing
- Remote ownership
