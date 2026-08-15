# Design Specification: Open-Source README Enhancement for ScanFlow

**Date:** 2026-08-15  
**Topic:** Open-Source README Enhancement  
**Status:** Approved  

---

## 1. Overview & Objective

Transform the default Next.js starter `README.md` into an open-source repository documentation that serves both as a developer portfolio showcase and an engineering reference.

The README will clearly communicate:
1. What ScanFlow Analytics is and the core problem it solves (transforming static QR codes into programmable, dynamically routed entry points with real-time visitor journey tracking).
2. The architectural design and request lifecycle (non-blocking redirect telemetry, deterministic rule evaluator, cookie-based session journey tracking).
3. The comprehensive feature set spanning Dynamic QR building, multi-criteria routing, scan journey timelines, marketing campaign management, and multi-tenant security.
4. The full modern tech stack (Next.js 16, React 19, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, Tailwind CSS v4, Vitest).
5. Seamless local development setup (prerequisites, environment configuration, database migration, and test runner instructions).
6. Contribution guidelines, testing benchmarks, directory structure, and licensing.

---

## 2. Specification & Content Sections

### Section 1: Header, Badges & High-Level Summary
- **Repository Title**: ScanFlow Analytics
- **Tagline**: Modern Dynamic QR Management, Smart Routing & Visitor Journey Analytics Platform.
- **Shields & Badges**:
  - Next.js `v16.3`
  - React `v19`
  - TypeScript `v5`
  - PostgreSQL & Drizzle ORM
  - Better Auth
  - Tailwind CSS `v4`
  - Vitest (Automated Test Suite)
  - MIT License
- **1-Minute Quick Pitch**: Highlighting key capabilities—sub-millisecond conditional redirects, asynchronous scan event ingestion, and visual session replay journeys.

### Section 2: System Architecture & Data Flow
- **Mermaid Sequence / Flowchart**:
  - **Redirect Pipeline**: Visitor Scan -> `GET /r/:code` -> Client Context Extraction (Device, OS, Country, Time) -> Deterministic Rule Engine -> HTTP 307 Redirect to Destination + Asynchronous Event Ingestion with `sf_sid` Cookie Session Stamping.
  - **Analytics Pipeline**: `session_events` -> Real-time Aggregation -> Dashboard Charts & Visual Step-by-Step Journey Timeline (`/dashboard/journeys`).

### Section 3: Core Features
- **Dynamic QR Code Engine**:
  - Programmable destinations (URL change anytime without reprinting).
  - Lifecycle state machine (Active, Paused with branded splash, Archived, Missing 404).
  - Live preview customization (Colors, margins, Error Correction Levels L/M/Q/H).
  - High-res vector SVG & PNG rasterization up to 4K.
- **Smart Conditional Routing Engine**:
  - Device Targeting: Mobile, Desktop, Tablet.
  - OS Specific: iOS, Android, macOS, Windows, Linux.
  - Geo-Targeting: Country code detection via Cloudflare/Vercel headers.
  - Temporal Rules: Time windows and operating hours.
  - Prioritized fallback execution.
- **Visitor Scan Journey Visualizer**:
  - Step-by-step chronological audit trail for every scanned session.
  - Time-to-convert tracking and dwell duration calculation.
  - Session replay timeline sheet with device metadata.
- **Campaigns & Attribution Tracking**:
  - Organize QRs into thematic marketing campaigns (e.g., Summer Launch, Print Flyers).
  - Aggregate ROI metrics: Total Scans, Unique Sessions, Conversions, and Conversion Rate.
- **Multi-Tenant Security & Isolation**:
  - Secure authentication via Better Auth with PostgreSQL Drizzle adapter.
  - Strict tenant boundary isolation at the database query level.
  - Instant 1-Click Demo Recruiter Login for friction-free evaluation.

### Section 4: Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server Components, Route Handlers, Proxy routing |
| **Frontend UI** | React 19, Tailwind CSS v4 | Dynamic UI components, responsive theme styling |
| **Components** | shadcn/ui, Base UI, Radix | Accessible dialogs, sheets, dropdowns, tables |
| **Icons & Charts**| Lucide React, Recharts | Interactive area/bar charts, dashboard iconography |
| **Database** | PostgreSQL | Relational persistence for QRs, routing, and analytics |
| **ORM** | Drizzle ORM & Drizzle Kit | Type-safe schema definition, relations, migrations |
| **Authentication**| Better Auth | Session management, password hashing, route guards |
| **QR Generation**| `qrcode` engine | Vector SVG & raster PNG generation |
| **Testing** | Vitest, Testing Library | Fast unit and component test suites with v8 coverage |

### Section 5: Getting Started & Installation

#### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database instance (local or hosted e.g. Neon, Supabase, Docker)
- npm, pnpm, or bun

#### Step-by-Step Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/scanflow.git
   cd scanflow
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   *Required variables*: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`.
4. **Push database schema**:
   ```bash
   npx drizzle-kit push
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3323`.

#### Available Scripts
- `npm run dev`: Starts local server on port 3323 with Turbopack.
- `npm run build`: Compiles production build.
- `npm run start`: Starts production Next.js server.
- `npm run test`: Executes unit and integration tests with Vitest.
- `npm run test:coverage`: Generates code coverage report via Vitest v8.
- `npm run lint`: Runs ESLint analysis.

### Section 6: Project Directory Structure
Annotated overview of the repository hierarchy (`app/`, `components/`, `lib/`, `tests/`, `docs/`).

### Section 7: Testing & Verification
- Details on the Vitest suite covering QR generation, routing engine logic, API endpoints, and authentication guards.

### Section 8: Contributing & License
- Contribution guidelines (PR workflow, code formatting, running test suite).
- MIT License terms.

---

## 3. Spec Self-Review
- **Placeholder scan**: All environment variables, commands, and features reference actual code in the repository.
- **Internal consistency**: Architecture matches `lib/routing/engine.ts`, `app/r/[code]/route.ts`, and `lib/db/schema.ts`.
- **Scope check**: Well-defined single file rewrite (`README.md`).
- **Ambiguity check**: Clear step-by-step layout tailored to open-source portfolio repository standard.
