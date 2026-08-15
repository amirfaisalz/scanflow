# Feature 11: Conversion Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Conversion Tracking system for ScanFlow allowing users to define custom conversion goals (e.g., Order Now, Menu Download, Form Submit), automatically evaluate incoming visitor session events, calculate real-time conversion rates (`Conversions / Sessions * 100`) and attributed revenue, and manage conversion goals in a dedicated dashboard (`/dashboard/conversions`).

**Architecture:** Database table `conversion_goals` in PostgreSQL via Drizzle ORM; real-time event evaluator in `lib/analytics/tracker.ts`; REST API endpoints for conversion goal CRUD and performance aggregates (`/api/conversions`); and a polished React dashboard with goal cards, creation dialogs, and embeddable tracking snippet helpers.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Drizzle ORM, PostgreSQL, Vitest.

## Global Constraints

- Enforce strict multi-tenant isolation via `userId` on all queries and mutations.
- Real-time conversion rate formula: `(Conversions / Sessions) * 100`.
- Monetary value stored in cents (integer) and formatted cleanly as currency ($).
- 100% Vitest test coverage for all schema definitions, APIs, tracker logic, and UI components.

---

### Task 1: Database Schema & Relations (`lib/db/schema.ts`)

**Files:**
- Modify: `lib/db/schema.ts`
- Modify: `tests/unit/schema.test.ts`

**Interfaces:**
- Produces: `conversionGoals` table, `conversionGoalsRelations`, `ConversionGoal`, `NewConversionGoal` types.

- [ ] **Step 1: Update `tests/unit/schema.test.ts`** to test `conversionGoals` table and relations.
- [ ] **Step 2: Run test to verify it fails** (`npx vitest run tests/unit/schema.test.ts`).
- [ ] **Step 3: Implement `conversionGoals` table and relations** in `lib/db/schema.ts`.
- [ ] **Step 4: Run test to verify it passes** (`npx vitest run tests/unit/schema.test.ts`).

---

### Task 2: Automatic Conversion Evaluation in Tracker Engine (`lib/analytics/tracker.ts`)

**Files:**
- Modify: `lib/analytics/tracker.ts`
- Create: `tests/unit/conversion-tracker.test.ts`

**Interfaces:**
- Evaluates incoming session events against active `conversionGoals` for that tenant.
- Sets `session.converted = true` and `session.conversionEvent = goal.name` when matched.

- [ ] **Step 1: Write unit tests in `tests/unit/conversion-tracker.test.ts`** testing event matching (by eventType, qrCodeId, campaignId, targetPattern).
- [ ] **Step 2: Run test to verify it fails**.
- [ ] **Step 3: Update `lib/analytics/tracker.ts`** to evaluate active goals during `recordSessionEvent`.
- [ ] **Step 4: Run test to verify it passes** (`npx vitest run tests/unit/conversion-tracker.test.ts`).

---

### Task 3: Conversion Goals CRUD REST API (`app/api/conversions/`)

**Files:**
- Create: `app/api/conversions/route.ts`
- Create: `app/api/conversions/[id]/route.ts`
- Create: `tests/unit/conversions-api.test.ts`

**Interfaces:**
- `GET /api/conversions`: List goals with aggregate metrics (`totalConversions`, `totalSessions`, `conversionRate`, `totalRevenue`).
- `POST /api/conversions`: Create new goal with validation.
- `GET /api/conversions/[id]`: Goal details.
- `PATCH /api/conversions/[id]`: Update goal properties.
- `DELETE /api/conversions/[id]`: Delete goal.

- [ ] **Step 1: Write unit tests in `tests/unit/conversions-api.test.ts`** testing auth, CRUD, multi-tenant isolation, and metrics calculation.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Implement `app/api/conversions/route.ts` and `app/api/conversions/[id]/route.ts`**.
- [ ] **Step 4: Run tests to verify pass** (`npx vitest run tests/unit/conversions-api.test.ts`).

---

### Task 4: Conversions UI Components & Navigation (`components/conversions/` & `components/app-sidebar.tsx`)

**Files:**
- Modify: `components/app-sidebar.tsx` (Add Conversions navigation item)
- Create: `components/conversions/conversion-dialog.tsx`
- Create: `components/conversions/conversion-card.tsx`
- Create: `components/conversions/snippet-dialog.tsx`
- Create: `components/conversions/index.ts`
- Create: `tests/unit/conversions-components.test.tsx`

- [ ] **Step 1: Write component tests in `tests/unit/conversions-components.test.tsx`**.
- [ ] **Step 2: Run component tests to verify failure**.
- [ ] **Step 3: Implement UI components in `components/conversions/` and update `components/app-sidebar.tsx`**.
- [ ] **Step 4: Run component tests to verify pass**.

---

### Task 5: Conversions Dashboard Page (`app/dashboard/conversions/page.tsx`)

**Files:**
- Create: `app/dashboard/conversions/page.tsx`
- Create: `tests/unit/conversions-page.test.tsx`

- [ ] **Step 1: Write page tests in `tests/unit/conversions-page.test.tsx`**.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Implement `app/dashboard/conversions/page.tsx`** with search, filters, KPI cards, goal grid, and modal triggers.
- [ ] **Step 4: Run tests to verify pass** (`npx vitest run tests/unit/conversions-page.test.tsx`).

---

### Task 6: Integration Verification & Documentation

**Files:**
- Modify: `docs/task_tracking.md`
- Test: Full Vitest suite (`npm run test`)

- [ ] **Step 1: Run complete test suite** to ensure 100% test pass rate across all suites.
- [ ] **Step 2: Update `docs/task_tracking.md`** to mark Feature 11 Completed.
