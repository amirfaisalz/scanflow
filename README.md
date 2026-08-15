<div align="center">

# ScanFlow Analytics

**Next-Generation Dynamic QR Management, Smart Context Routing & Visitor Journey Analytics Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6.29-purple?style=for-the-badge)](https://www.better-auth.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Coverage_100%25-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#quickstart--local-setup">Quickstart</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#database-schema">Database Schema</a> •
  <a href="#testing">Testing</a> •
  <a href="#roadmap">Roadmap</a>
</p>

</div>

---

## Overview

**ScanFlow** transforms static QR codes into **programmable, intelligent entry points**. 

Traditional QR codes permanently link to a static URL, making physical prints obsolete whenever campaigns, app store links, or business hours change. ScanFlow solves this by decoupling the physical QR code from its destination:

1. **Dynamic Routing**: Route visitors conditionally based on their device (iOS/Android/Desktop), country, language, or time of day.
2. **Instant Sub-Millisecond Redirects**: High-performance HTTP 307 redirect engine (`/r/:code`) with zero noticeable latency.
3. **Asynchronous Telemetry & Journey Tracking**: Captures scan events, user agents, geo-locations, and stitches individual scans into full **Visitor Journeys**.
4. **Campaign Attribution**: Group QRs under marketing campaigns to monitor aggregate conversion rates and marketing ROI.
5. **Enterprise Multi-Tenancy**: Built with strict organization/user isolation using Better Auth and Drizzle ORM on PostgreSQL.

---

## System Architecture

ScanFlow is engineered for low latency at the redirect edge while streaming granular telemetry to a PostgreSQL analytical store.

```mermaid
flowchart TD
    subgraph Visitor Experience
        A[📱 Visitor Scans QR Code] -->|GET /r/:code| B[⚡ ScanFlow Redirect Engine]
    end

    subgraph Deterministic Routing Pipeline
        B --> C[Extract Visitor Context\n- Device: Mobile/Desktop/Tablet\n- OS: iOS/Android/macOS/Windows\n- Geo: Country Code\n- Time: Current Time Window]
        C --> D{Evaluate Prioritized Rules}
        D -->|Rule Matched| E1[Target Variant Destination]
        D -->|Fallback / No Match| E2[Default QR Destination]
    end

    subgraph Edge Response & Telemetry Worker
        E1 --> F[HTTP 307 Instant Redirect]
        E2 --> F
        F --> G[🚀 Visitor Arrives at Destination]
        
        B -.->|Non-Blocking Async| H[Telemetry & Session Worker]
        H --> I[Parse User-Agent & Headers]
        H --> J[Issue/Verify 'sf_sid' Cookie]
        I & J --> K[(PostgreSQL Database)]
    end

    subgraph Analytical Dashboard
        K --> L[Real-Time Analytics Engine]
        L --> M[📊 Overview KPI Metrics]
        L --> N[🗺️ Chronological Scan Journey Explorer]
        L --> O[📈 Campaign Attribution & Conversion Funnel]
    end
```

---

## Key Features

### ⚡ 1. Dynamic QR Code Engine
* **Instant Destination Updates**: Update where a physical QR points at any moment without reprinting.
* **Full Lifecycle Management**: Toggle between `Active`, `Paused` (shows customizable branded maintenance screen), and `Archived` states.
* **Live Customization & High-Res Export**: 
  * Custom foreground and background color styling.
  * Configurable Error Correction Levels (`L` - 7%, `M` - 15%, `Q` - 25%, `H` - 30%).
  * Vector SVG and high-resolution raster PNG export (512px, 1024px, 2048px, up to crisp **4K**).
* **One-Click Duplication**: Duplicate QR codes along with their routing configurations.

### 🎯 2. Smart Conditional Routing
* **Device Targeting**: Deliver specialized experiences for Mobile, Desktop, and Tablet users.
* **Mobile OS Routing**: Seamlessly forward iOS users to the Apple App Store and Android users to Google Play from a single universal QR code.
* **Geo-Location Rules**: Route visitors to region-specific storefronts or language landing pages based on their country.
* **Time-Based Windows**: Route to lunch/dinner menus or daytime/nighttime landing pages based on operating hours.
* **Deterministic Priority Engine**: Assign numerical priority to rules with graceful fallback to the default destination.

### 🗺️ 3. Visitor Scan Journey Tracker *(Standout Feature)*
* **Session Stitching**: Groups individual touchpoints into a unified visitor session using secure `sf_sid` cookies.
* **Chronological Timeline**: Step-by-step visual audit trail displaying the visitor's path from initial scan to eventual conversion.
* **Dwell & Conversion Metrics**: Measures time-to-convert, duration between scans, repeat visits, and bounce behaviors.

### 📊 4. Campaign Management & Attribution
* **Cross-Asset Grouping**: Aggregate multiple physical flyers, billboards, packaging inserts, and table tents under unified marketing campaigns.
* **Comparative ROI**: Track aggregate scans, unique visitors, total sessions, and conversion rates across active campaigns.
* **Direct QR Assignment**: Seamlessly assign and reassign QR codes to campaigns from the builder or campaign cards.

### 🛡️ 5. Multi-Tenant Security & 1-Click Recruiter Demo
* **Better Auth Integration**: Multi-tenant session authentication, password hashing, and CSRF protection.
* **Tenant Boundary Isolation**: Database queries strictly scoped to the authenticated tenant.
* **1-Click Demo Login**: Recruiter-friendly demo sign-in on the login page for instant sandbox evaluation.

---

## Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Server Components, Route Handlers, Proxy routing |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) | High-performance dynamic interfaces and design tokens |
| **Primitives** | [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/), [Radix](https://www.radix-ui.com/) | Accessible dialogs, drawers, dropdowns, and sheets |
| **Visualizations** | [Recharts](https://recharts.org/), [TanStack Table v9](https://tanstack.com/table) | Interactive area charts, telemetry trends, and data grids |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational store for QRs, routing logic, sessions, and events |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) & [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | Type-safe schema definitions, relationships, and push migrations |
| **Authentication** | [Better Auth](https://www.better-auth.com/) | Multi-tenant auth, session validation, route guards |
| **QR Engine** | [`qrcode`](https://www.npmjs.com/package/qrcode) | High-speed server-side and client-side vector/raster generation |
| **Testing** | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/) | Unit, integration, component, and coverage test runners |

---

## Quickstart & Local Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **PostgreSQL**: `v15+` (local, Docker, or hosted like Neon / Supabase)
* **Package Manager**: `npm`, `pnpm`, or `bun`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/scanflow.git
cd scanflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```

```env
# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scanflow"

# Better Auth Configuration
BETTER_AUTH_SECRET="your_32_character_random_secret_here"
BETTER_AUTH_URL="http://localhost:3323"

# Public Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3323"
```

### 4. Initialize Database Schema
Push the schema directly to PostgreSQL using Drizzle Kit:
```bash
npx drizzle-kit push
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3323](http://localhost:3323) in your browser.

> **Tip**: You can use the **1-Click Recruiter Demo Sign-In** button on the `/login` page to immediately explore the full dashboard without creating a new account.

---

## NPM Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `next dev -p 3323` | Starts the local dev server on port `3323` |
| `npm run build` | `next build` | Creates an optimized production build |
| `npm run start` | `next start` | Runs the compiled production build |
| `npm run test` | `vitest run` | Runs all unit and component tests |
| `npm run test:coverage` | `vitest run --coverage` | Executes tests with V8 code coverage report |
| `npm run lint` | `eslint` | Analyzes code for syntax and style issues |

---

## Database Schema

ScanFlow's relational data model is managed via Drizzle ORM in [`lib/db/schema.ts`](lib/db/schema.ts):

```
┌──────────────┐       1:N       ┌────────────────┐       1:N       ┌──────────────────┐
│    users     │ ──────────────> │    qr_codes    │ ──────────────> │   qr_rules       │
└──────────────┘                 └────────────────┘                 └──────────────────┘
       │ 1:N                            │ 1:N
       │                                │
       ▼ 1:N                            ▼ 1:N
┌──────────────┐                 ┌────────────────┐       1:N       ┌──────────────────┐
│  campaigns   │                 │    sessions    │ ──────────────> │  session_events  │
└──────────────┘                 └────────────────┘                 └──────────────────┘
```

* **`users` & `sessions`**: Better Auth tables handling user identities, hashed credentials, and authentication sessions.
* **`qr_codes`**: Primary QR metadata, slugs, destination URLs, styling config (colors, error correction), and status.
* **`qr_rules`**: Condition-based routing rules (Device, OS, Country, Time) evaluated deterministically per scan.
* **`campaigns`**: Marketing campaign groupings with budget, start/end dates, and performance aggregations.
* **`sessions` & `session_events`**: Chronological visitor touchpoints tracking referrer, user agent, IP hash, geo-location, and conversion status.

---

## Testing

ScanFlow maintains a comprehensive automated testing suite built with [Vitest](https://vitest.dev/) and [@testing-library/react](https://testing-library.com/).

```bash
# Run all tests
npm run test

# Run tests with code coverage
npm run test:coverage
```

### Test Coverage Highlights
* ✅ **QR Generation Engine**: SVG/PNG rasterization, slug formatting, error correction validation.
* ✅ **Dynamic Routing Logic**: Context extraction, priority evaluation, rule matching, and fallback handling.
* ✅ **API Route Handlers**: Multi-tenant CRUD operations, QR duplication, and campaign assignment.
* ✅ **Interactive Components**: Modal dialogs, export controllers, live preview rendering.

---

## Repository Structure

```
├── app/
│   ├── (auth)/             # Login & Register pages
│   ├── api/
│   │   ├── auth/           # Better Auth catch-all API handler
│   │   ├── campaigns/      # Campaigns CRUD & QR assignment
│   │   ├── qr-codes/       # QR CRUD, duplicate, & routing rules API
│   │   └── track/          # Telemetry & conversion tracking endpoint
│   ├── dashboard/
│   │   ├── campaigns/      # Marketing campaigns overview & cards
│   │   ├── journeys/       # Visual visitor scan journey explorer
│   │   ├── qr-codes/       # QR management (Grid & Table views)
│   │   └── page.tsx        # Overview dashboard with KPI cards & charts
│   └── r/[code]/           # High-speed redirect engine handler
├── components/
│   ├── campaigns/          # Campaign cards, dialogs, and summaries
│   ├── journeys/           # Step-by-step visitor journey sheet
│   ├── qr/                 # QR builder, live preview, export dialog, routing rules
│   └── ui/                 # Accessible shadcn / Base UI primitives
├── docs/                   # Product specs, plans, and task tracking
├── lib/
│   ├── analytics/          # Session tracking & journey computation
│   ├── db/                 # Drizzle PostgreSQL schema & client
│   ├── routing/            # Deterministic condition matching engine
│   ├── auth.ts             # Better Auth server configuration
│   └── qr.ts               # SVG & PNG QR code generation engine
├── tests/                  # Unit and component Vitest test suite
├── proxy.ts                # Next.js 16 route protection & session guards
└── drizzle.config.ts       # Drizzle Kit configuration
```

---

## Roadmap

- [x] **Phase 1: MVP Core Features**
  - [x] Multi-tenant Better Auth integration with 1-Click Demo Login
  - [x] Dynamic QR Generator with SVG & 4K PNG exports
  - [x] Deterministic condition routing engine (Device, OS, Country, Time)
  - [x] Non-blocking `/r/:code` redirect telemetry
  - [x] Interactive Visitor Scan Journey visualizer
  - [x] Marketing Campaigns management & QR attribution
- [ ] **Phase 2: Advanced Optimizations**
  - [ ] A/B Testing split engine with automated statistical winner selection
  - [ ] Custom conversion event triggers (SDK & webhooks)
  - [ ] Public Developer REST API with scoped API keys
  - [ ] Geo-fencing & radius-based proximity routing
  - [ ] Automated scheduled reports & Slack/Discord alerts

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Run tests (`npm run test`)
5. Push to the branch (`git push origin feat/amazing-feature`)
6. Open a Pull Request

---

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
