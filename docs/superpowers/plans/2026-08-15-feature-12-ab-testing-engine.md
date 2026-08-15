# Feature 12: A/B Testing Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready A/B Testing Engine for ScanFlow allowing users to split traffic between destinations on any QR code, maintain sticky visitor variant persistence, calculate real-time conversion rates and statistical significance (Chi-Square test, p-value, confidence level, conversion lift), and manage experiments in a dedicated dashboard (`/dashboard/experiments`).

**Architecture:** PostgreSQL schema tables `experiments` and `experiment_variants` via Drizzle ORM; split testing and statistical engine in `lib/experiments/engine.ts`; redirect integration in `app/r/[code]/route.ts`; REST API endpoints in `app/api/experiments/`; and a comprehensive dashboard with variant comparison bars, winner badges, and creation dialogs.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Drizzle ORM, PostgreSQL, Vitest.

## Global Constraints

- Enforce strict multi-tenant isolation via `userId` on all database queries and mutations.
- Variant traffic weights must sum to 100%.
- Sticky visitor assignment must be preserved across repeat scans using cookies (`sf_exp_<id>`).
- Statistical significance threshold for declaring a winner is 95% confidence level ($p \le 0.05$).
- 100% Vitest test coverage for all schema, engine logic, APIs, and UI components.

---

### Task 1: Database Schema & Relations (`lib/db/schema.ts`)

**Files:**
- Modify: `lib/db/schema.ts`
- Modify: `tests/unit/schema.test.ts`

**Interfaces:**
- Produces: `experiments`, `experimentVariants` tables, `sessions.experimentId`, `sessions.experimentVariantId`, relations, and types `Experiment`, `NewExperiment`, `ExperimentVariant`, `NewExperimentVariant`.

- [ ] **Step 1: Update `tests/unit/schema.test.ts`** to test `experiments` and `experimentVariants` tables, fields, and relations.
- [ ] **Step 2: Run test to verify failure** (`npx vitest run tests/unit/schema.test.ts`).
- [ ] **Step 3: Implement `experiments` and `experimentVariants` in `lib/db/schema.ts`**.
- [ ] **Step 4: Run test to verify pass** (`npx vitest run tests/unit/schema.test.ts`).

---

### Task 2: Assignment & Statistical Significance Engine (`lib/experiments/engine.ts`)

**Files:**
- Create: `lib/experiments/engine.ts`
- Create: `tests/unit/experiments-engine.test.ts`

**Interfaces:**
- `selectExperimentVariant(variants, cookieVariantId?, visitorSeed?)`: returns chosen variant.
- `calculateStatisticalSignificance(controlSessions, controlConversions, variantSessions, variantConversions)`: returns `{ confidenceLevel, isSignificant, pValue, lift }`.
- `computeExperimentMetrics(experiment, variants, sessionList)`: computes enriched variant metrics and overall experiment stats.

- [ ] **Step 1: Write unit tests in `tests/unit/experiments-engine.test.ts`**.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Implement `lib/experiments/engine.ts`**.
- [ ] **Step 4: Run tests to verify pass** (`npx vitest run tests/unit/experiments-engine.test.ts`).

---

### Task 3: QR Redirect Engine Experiment Integration (`app/r/[code]/route.ts`)

**Files:**
- Modify: `app/r/[code]/route.ts`
- Modify: `tests/unit/redirect.test.ts`

**Interfaces:**
- Evaluates active experiments on scanned QR code, assigns variant via `selectExperimentVariant`, sets cookie `sf_exp_<expId>`, and redirects to variant destination.

- [ ] **Step 1: Update `tests/unit/redirect.test.ts`** with experiment redirect test cases.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Update `app/r/[code]/route.ts`** to evaluate active experiments.
- [ ] **Step 4: Run tests to verify pass** (`npx vitest run tests/unit/redirect.test.ts`).

---

### Task 4: Experiments CRUD REST API (`app/api/experiments/`)

**Files:**
- Create: `app/api/experiments/route.ts`
- Create: `app/api/experiments/[id]/route.ts`
- Create: `tests/unit/experiments-api.test.ts`

**Interfaces:**
- `GET /api/experiments`: List user experiments with real-time variant metrics.
- `POST /api/experiments`: Create experiment with variants (validates weights sum to 100%).
- `GET /api/experiments/[id]`: Detailed experiment statistics and statistical analysis.
- `PATCH /api/experiments/[id]`: Update status (`active`, `paused`, `ended`) or winner.
- `DELETE /api/experiments/[id]`: Delete experiment.

- [ ] **Step 1: Write unit tests in `tests/unit/experiments-api.test.ts`**.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Implement `app/api/experiments/route.ts` and `app/api/experiments/[id]/route.ts`**.
- [ ] **Step 4: Run tests to verify pass** (`npx vitest run tests/unit/experiments-api.test.ts`).

---

### Task 5: Experiments UI Components (`components/experiments/`)

**Files:**
- Create: `components/experiments/experiment-card.tsx`
- Create: `components/experiments/experiment-dialog.tsx`
- Create: `components/experiments/index.ts`
- Create: `tests/unit/experiments-components.test.tsx`

- [ ] **Step 1: Write component tests in `tests/unit/experiments-components.test.tsx`**.
- [ ] **Step 2: Run component tests to verify failure**.
- [ ] **Step 3: Implement components in `components/experiments/`**.
- [ ] **Step 4: Run component tests to verify pass** (`npx vitest run tests/unit/experiments-components.test.tsx`).

---

### Task 6: Experiments Dashboard Page (`app/dashboard/experiments/page.tsx`)

**Files:**
- Create: `app/dashboard/experiments/page.tsx`
- Create: `tests/unit/experiments-page.test.tsx`

- [ ] **Step 1: Write page tests in `tests/unit/experiments-page.test.tsx`**.
- [ ] **Step 2: Run tests to verify failure**.
- [ ] **Step 3: Implement `app/dashboard/experiments/page.tsx`**.
- [ ] **Step 4: Run tests to verify pass** (`npx vitest run tests/unit/experiments-page.test.tsx`).

---

### Task 7: Full Phase 1 Integration Verification & Documentation

**Files:**
- Modify: `docs/task_tracking.md` (Mark Feature 12 completed and Phase 1 MVP 100% completed)
- Test: Full workspace test suite (`npm run test`)

- [ ] **Step 1: Run complete test suite** to ensure 100% test pass rate across all suites.
- [ ] **Step 2: Update `docs/task_tracking.md`** to reflect Phase 1 100% completion.
