# Feature 9: Campaigns Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full Campaigns Management (Feature 9) allowing users to group QR codes, track campaign aggregate metrics (scans, sessions, conversions, conversion rate), assign/unassign QR codes, and manage campaigns via API and UI.

**Architecture:** Multi-tenant PostgreSQL queries with Drizzle ORM to aggregate campaign stats across `campaigns`, `qr_codes`, and `sessions`; REST API endpoints for campaign CRUD and QR assignment; responsive UI components (`CampaignCard`, `CampaignDialog`) and full dashboard page `app/dashboard/campaigns/page.tsx`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Drizzle ORM, Vitest.

## Global Constraints

- Enforce strict multi-tenant isolation via `userId` on all authenticated API endpoints and queries.
- Campaign statuses must be one of: `active`, `paused`, `archived`.
- Deleting a campaign must safely nullify `campaignId` on associated QR codes and sessions without breaking data integrity.
- All unit and component tests must use Vitest and achieve 100% pass rate.

---

### Task 1: Campaigns CRUD API (`app/api/campaigns/route.ts` & `app/api/campaigns/[id]/route.ts`)

**Files:**
- Create: `app/api/campaigns/route.ts`
- Create: `app/api/campaigns/[id]/route.ts`
- Test: `tests/unit/campaigns-api.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/campaigns` (list user campaigns with aggregate metrics: qrCount, totalScans, totalSessions, conversions, conversionRate)
  - `POST /api/campaigns` (create new campaign)
  - `GET /api/campaigns/:id` (fetch campaign detail with attached QR codes)
  - `PATCH /api/campaigns/:id` (update campaign name, description, status)
  - `DELETE /api/campaigns/:id` (delete campaign)

---

### Task 2: Campaign QR Assignment API (`app/api/campaigns/[id]/assign/route.ts`)

**Files:**
- Create: `app/api/campaigns/[id]/assign/route.ts`
- Test: `tests/unit/campaigns-api.test.ts`

**Interfaces:**
- Produces: `POST /api/campaigns/:id/assign` (assign or unassign list of `qrCodeIds` to campaign with tenant check)

---

### Task 3: Campaign UI Components (`components/campaigns/`)

**Files:**
- Create: `components/campaigns/campaign-dialog.tsx`
- Create: `components/campaigns/campaign-card.tsx`
- Modify: `components/qr/qr-builder-dialog.tsx` (add Campaign selector dropdown)
- Test: `tests/unit/campaigns-components.test.tsx`

**Interfaces:**
- Produces: `CampaignCard`, `CampaignDialog`, and campaign assignment dropdown in QR builder.

---

### Task 4: Campaigns Dashboard Page (`app/dashboard/campaigns/page.tsx`)

**Files:**
- Create: `app/dashboard/campaigns/page.tsx`
- Test: `tests/unit/campaigns-components.test.tsx`

**Interfaces:**
- Produces: Full dashboard page with campaign metrics overview, search, status filter, Grid/List view toggle, and campaign CRUD triggers.
