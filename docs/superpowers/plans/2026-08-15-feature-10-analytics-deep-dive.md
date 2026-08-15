# Feature 10: Analytics Deep-Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Analytics Deep-Dive system for ScanFlow comprising a high-performance aggregation engine, a unified multi-tenant REST API endpoint (`GET /api/analytics/overview`), and an interactive visual dashboard (`/dashboard/analytics`) with time-series charts, dimensional breakdowns (device, OS, browser, geography, time of day), top performers, filters, and data export.

**Architecture:** A robust server-side analytics aggregation engine in `lib/analytics/overview.ts` queries PostgreSQL tables (`sessions`, `session_events`, `qr_codes`, `campaigns`) with strict tenant scoping. The unified API endpoint handles query params for period and dimension filters. A modular React dashboard page utilizes Recharts and Radix/shadcn components for clear, fluid data visualization.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Drizzle ORM, PostgreSQL, Vitest.

## Global Constraints

- Enforce strict multi-tenant isolation via `userId` on all database queries.
- Support time window periods: `24h` (hourly buckets), `7d` (daily), `30d` (daily), `90d` (daily), `all` (monthly/weekly).
- Safe fallbacks for empty states without division-by-zero errors.
- Export formats supported: JSON and CSV format downloads.
- 100% Vitest test coverage for all new APIs, business logic, and UI components.

---

### Task 1: Analytics Aggregation Engine (`lib/analytics/overview.ts`)

**Files:**
- Create: `lib/analytics/overview.ts`
- Test: `tests/unit/analytics-overview.test.ts`

**Interfaces:**
- Consumes: `sessions`, `session_events`, `qr_codes`, `campaigns` from `lib/db/schema.ts` and `db` from `lib/db`.
- Produces:
  ```typescript
  export interface AnalyticsFilterOptions {
    period?: "24h" | "7d" | "30d" | "90d" | "all";
    qrCodeId?: string;
    campaignId?: string;
    device?: string;
  }

  export interface AnalyticsOverviewData {
    kpis: {
      totalScans: number;
      uniqueVisitors: number;
      totalSessions: number;
      conversions: number;
      conversionRate: number;
      avgDurationSeconds: number;
      bouncedSessions: number;
      bounceRate: number;
    };
    timeSeries: Array<{
      timestamp: string;
      label: string;
      scans: number;
      sessions: number;
      conversions: number;
    }>;
    breakdowns: {
      devices: Array<{ name: string; value: number; percentage: number }>;
      operatingSystems: Array<{ name: string; value: number; percentage: number }>;
      browsers: Array<{ name: string; value: number; percentage: number }>;
      countries: Array<{ code: string; name: string; scans: number; percentage: number }>;
      cities: Array<{ name: string; country: string; scans: number; percentage: number }>;
      hourlyDistribution: Array<{ hour: number; label: string; count: number }>;
    };
    topPerformers: {
      qrCodes: Array<{
        id: string;
        name: string;
        slug: string;
        scans: number;
        sessions: number;
        conversions: number;
        conversionRate: number;
      }>;
      campaigns: Array<{
        id: string;
        name: string;
        scans: number;
        sessions: number;
        conversions: number;
        conversionRate: number;
      }>;
    };
  }

  export async function getAnalyticsOverview(
    userId: string,
    options?: AnalyticsFilterOptions
  ): Promise<AnalyticsOverviewData>;
  ```

- [ ] **Step 1: Write unit tests for analytics aggregation engine** in `tests/unit/analytics-overview.test.ts`
- [ ] **Step 2: Run test to verify it fails** (`npx vitest run tests/unit/analytics-overview.test.ts`)
- [ ] **Step 3: Implement `lib/analytics/overview.ts`** with period bucket generation, filter evaluation, KPI calculation, and breakdown calculations.
- [ ] **Step 4: Run test to verify it passes** (`npx vitest run tests/unit/analytics-overview.test.ts`)

---

### Task 2: Analytics Overview API Route (`app/api/analytics/overview/route.ts`)

**Files:**
- Create: `app/api/analytics/overview/route.ts`
- Test: `tests/unit/analytics-overview-api.test.ts`

**Interfaces:**
- Consumes: `getCurrentUser` from `lib/auth-helpers.ts`, `getAnalyticsOverview` from `lib/analytics/overview.ts`.
- Produces: `GET /api/analytics/overview` HTTP Route Handler returning `{ data: AnalyticsOverviewData }` or error.

- [ ] **Step 1: Write unit tests for the API route** in `tests/unit/analytics-overview-api.test.ts` testing auth protection, parameter parsing, query filtering, and JSON structure.
- [ ] **Step 2: Run test to verify it fails** (`npx vitest run tests/unit/analytics-overview-api.test.ts`)
- [ ] **Step 3: Implement `app/api/analytics/overview/route.ts`** parsing `period`, `qrCodeId`, `campaignId`, and `device` query parameters.
- [ ] **Step 4: Run test to verify it passes** (`npx vitest run tests/unit/analytics-overview-api.test.ts`)

---

### Task 3: Analytics Dashboard UI Components (`components/analytics/`)

**Files:**
- Create: `components/analytics/analytics-filters.tsx` (Period, QR, Campaign, Device selector controls & Export buttons)
- Create: `components/analytics/analytics-kpi-cards.tsx` (Summary metrics grid)
- Create: `components/analytics/analytics-trend-chart.tsx` (Recharts area/bar composite chart)
- Create: `components/analytics/analytics-breakdowns.tsx` (Device distribution, OS/Browser bars, Geo table, Time of day)
- Create: `components/analytics/analytics-top-performers.tsx` (Top QR codes & Campaigns table)
- Test: `tests/unit/analytics-components.test.tsx`

**Interfaces:**
- Produces: Clean, modular, decoupled visual components rendering metrics, empty states, and visual progress bars.

- [ ] **Step 1: Write component tests** in `tests/unit/analytics-components.test.tsx` testing rendering, formatting, and user interaction.
- [ ] **Step 2: Run component tests to verify they fail**
- [ ] **Step 3: Implement the analytics UI component suite** in `components/analytics/`
- [ ] **Step 4: Run component tests to verify they pass**

---

### Task 4: Analytics Dashboard Page (`app/dashboard/analytics/page.tsx`)

**Files:**
- Create: `app/dashboard/analytics/page.tsx`
- Test: `tests/unit/analytics-page.test.tsx`

**Interfaces:**
- Produces: Full dashboard page at `/dashboard/analytics` with async state management, filter syncing, CSV/JSON export trigger, error handling, and refresh button.

- [ ] **Step 1: Write tests for the analytics page** in `tests/unit/analytics-page.test.tsx`
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `app/dashboard/analytics/page.tsx`** with export helpers, filter state, and integrated component layout.
- [ ] **Step 4: Run test to verify it passes**

---

### Task 5: Integration Verification & Documentation

**Files:**
- Modify: `docs/task_tracking.md` (Mark Feature 10 completed)
- Test: Full Vitest suite (`npm run test`)

- [ ] **Step 1: Run complete test suite** to ensure 100% test pass rate across all files.
- [ ] **Step 2: Update `docs/task_tracking.md`** to reflect Feature 10 completion.
