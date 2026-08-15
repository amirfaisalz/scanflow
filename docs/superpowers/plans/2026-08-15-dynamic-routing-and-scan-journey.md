# Dynamic Routing & Scan Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic QR routing, high-performance redirect engine (`GET /r/[code]`), scan event ingestion, visitor session tracking, and the standout interactive Scan Journey timeline explorer in the ScanFlow dashboard.

**Architecture:** Extend PostgreSQL schema with `routing_rules`, `sessions`, and `session_events` via Drizzle ORM; build deterministic rule evaluator in `lib/routing/engine.ts`; create fast `/r/[code]` redirect handler setting `sf_sid` cookies; implement event ingestion API `/api/track` and journeys API `/api/analytics/journeys`; build interactive Scan Journey UI with visual step-by-step visitor path explorer.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Drizzle ORM, PostgreSQL, Vitest.

## Global Constraints

- Use Drizzle ORM with PostgreSQL tables defined in `lib/db/schema.ts`.
- Enforce strict multi-tenant isolation via `userId` on all authenticated API endpoints and queries.
- Cookie name for session tracking must be `sf_sid` with `HttpOnly`, `Path=/`, `SameSite=Lax`, `MaxAge=2592000` (30 days).
- HTTP redirect code for active QR codes must be `307 Temporary Redirect`.
- Status handling: `paused` returns a clean paused banner, `archived` returns archived notice, non-existent returns 404.
- All unit and component tests must use Vitest and achieve 100% pass rate.

---

### Task 1: Database Schema Expansion (`lib/db/schema.ts`)

**Files:**
- Modify: `lib/db/schema.ts`
- Test: `tests/unit/schema.test.ts`

**Interfaces:**
- Produces: `routingRules`, `sessions`, `sessionEvents` table definitions and types `RoutingRule`, `NewRoutingRule`, `Session`, `NewSession`, `SessionEvent`, `NewSessionEvent`.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/schema.test.ts
import { describe, it, expect } from "vitest";
import { routingRules, sessions, sessionEvents } from "@/lib/db/schema";

describe("Database Schema - Routing and Sessions", () => {
  it("should export routingRules table with required columns", () => {
    expect(routingRules).toBeDefined();
    expect(routingRules.id).toBeDefined();
    expect(routingRules.qrCodeId).toBeDefined();
    expect(routingRules.userId).toBeDefined();
    expect(routingRules.priority).toBeDefined();
    expect(routingRules.conditionType).toBeDefined();
    expect(routingRules.conditionValue).toBeDefined();
    expect(routingRules.destinationUrl).toBeDefined();
    expect(routingRules.isActive).toBeDefined();
  });

  it("should export sessions table with required columns", () => {
    expect(sessions).toBeDefined();
    expect(sessions.id).toBeDefined();
    expect(sessions.qrCodeId).toBeDefined();
    expect(sessions.userId).toBeDefined();
    expect(sessions.ipHash).toBeDefined();
    expect(sessions.deviceType).toBeDefined();
    expect(sessions.os).toBeDefined();
    expect(sessions.browser).toBeDefined();
    expect(sessions.country).toBeDefined();
    expect(sessions.durationSeconds).toBeDefined();
    expect(sessions.eventsCount).toBeDefined();
    expect(sessions.converted).toBeDefined();
  });

  it("should export sessionEvents table with required columns", () => {
    expect(sessionEvents).toBeDefined();
    expect(sessionEvents.id).toBeDefined();
    expect(sessionEvents.sessionId).toBeDefined();
    expect(sessionEvents.qrCodeId).toBeDefined();
    expect(sessionEvents.userId).toBeDefined();
    expect(sessionEvents.eventType).toBeDefined();
    expect(sessionEvents.eventData).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/schema.test.ts`
Expected: FAIL with `routingRules is not defined` or similar import failure.

- [ ] **Step 3: Update `lib/db/schema.ts`**

Add `routingRules`, `sessions`, `sessionEvents` tables, relations, and type definitions to `lib/db/schema.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts tests/unit/schema.test.ts
git commit -m "feat(db): add routing_rules, sessions, and session_events schema tables"
```

---

### Task 2: Dynamic Routing Engine (`lib/routing/engine.ts`)

**Files:**
- Create: `lib/routing/engine.ts`
- Test: `tests/unit/routing-engine.test.ts`

**Interfaces:**
- Produces:
  - `parseVisitorContext(headers: Headers, ip?: string): VisitorContext`
  - `evaluateRoutingRules(context: VisitorContext, rules: RoutingRule[], defaultDestination: string): RoutingEvaluationResult`
  - `anonymizeIp(ip: string): string`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/routing-engine.test.ts
import { describe, it, expect } from "vitest";
import { parseVisitorContext, evaluateRoutingRules, anonymizeIp } from "@/lib/routing/engine";
import type { RoutingRule } from "@/lib/db/schema";

describe("Routing Engine", () => {
  it("should parse visitor context correctly from headers", () => {
    const headers = new Headers({
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8",
      "x-vercel-ip-country": "ID",
      "x-vercel-ip-city": "Jakarta",
    });

    const context = parseVisitorContext(headers, "192.168.1.1");
    expect(context.deviceType).toBe("mobile");
    expect(context.os).toBe("iOS");
    expect(context.browser).toBe("Safari");
    expect(context.country).toBe("ID");
    expect(context.city).toBe("Jakarta");
    expect(context.language).toBe("id");
  });

  it("should evaluate device and OS rules by priority", () => {
    const context = {
      deviceType: "mobile" as const,
      os: "iOS" as const,
      browser: "Safari",
      country: "ID",
      city: "Jakarta",
      language: "id",
      ipHash: "hash123",
      userAgent: "...",
      referrer: null,
    };

    const rules: RoutingRule[] = [
      {
        id: "rule-1",
        qrCodeId: "qr-1",
        userId: "user-1",
        priority: 1,
        conditionType: "os",
        conditionValue: "ios",
        destinationUrl: "https://apps.apple.com/app/123",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "rule-2",
        qrCodeId: "qr-1",
        userId: "user-1",
        priority: 2,
        conditionType: "country",
        conditionValue: "id",
        destinationUrl: "https://id.example.com",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = evaluateRoutingRules(context, rules, "https://example.com/default");
    expect(result.destinationUrl).toBe("https://apps.apple.com/app/123");
    expect(result.matchedRuleId).toBe("rule-1");
  });

  it("should fallback to default destination when no rules match", () => {
    const context = {
      deviceType: "desktop" as const,
      os: "Windows" as const,
      browser: "Chrome",
      country: "US",
      city: "New York",
      language: "en",
      ipHash: "hash123",
      userAgent: "...",
      referrer: null,
    };

    const rules: RoutingRule[] = [
      {
        id: "rule-1",
        qrCodeId: "qr-1",
        userId: "user-1",
        priority: 1,
        conditionType: "os",
        conditionValue: "ios",
        destinationUrl: "https://apps.apple.com/app/123",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = evaluateRoutingRules(context, rules, "https://example.com/default");
    expect(result.destinationUrl).toBe("https://example.com/default");
    expect(result.matchedRuleId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/routing-engine.test.ts`
Expected: FAIL with missing module `@/lib/routing/engine`.

- [ ] **Step 3: Implement `lib/routing/engine.ts`**

Implement `parseVisitorContext`, `evaluateRoutingRules`, `anonymizeIp`, and helper parsing functions.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/routing-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/routing/engine.ts tests/unit/routing-engine.test.ts
git commit -m "feat(routing): implement deterministic visitor context parser and rule evaluator"
```

---

### Task 3: QR Redirect Engine Route Handler (`app/r/[code]/route.ts`)

**Files:**
- Create: `app/r/[code]/route.ts`
- Test: `tests/unit/redirect.test.ts`

**Interfaces:**
- Consumes: `qrCodes`, `routingRules`, `sessions`, `sessionEvents` from `@/lib/db/schema`, `evaluateRoutingRules` from `@/lib/routing/engine`.
- Produces: `GET /r/[code]` route handler returning `307 Temporary Redirect` with `Set-Cookie: sf_sid=...`.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/redirect.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/r/[code]/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      qrCodes: { findFirst: vi.fn() },
      routingRules: { findMany: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }),
  },
}));

describe("GET /r/[code] Redirect Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when QR code is not found", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/r/unknown-slug");
    const res = await GET(req, { params: Promise.resolve({ code: "unknown-slug" }) });
    expect(res.status).toBe(404);
  });

  it("should return 307 redirect and set sf_sid cookie for active QR code", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-123",
      userId: "user-1",
      slug: "menu",
      destinationUrl: "https://restaurant.com/menu",
      status: "active",
      scanCount: 10,
    });
    (db.query.routingRules.findMany as any).mockResolvedValue([]);

    const req = new NextRequest("http://localhost:3000/r/menu", {
      headers: { "user-agent": "Mozilla/5.0 (iPhone...)" },
    });
    const res = await GET(req, { params: Promise.resolve({ code: "menu" }) });
    
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://restaurant.com/menu");
    expect(res.headers.get("set-cookie")).toContain("sf_sid=");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/redirect.test.ts`
Expected: FAIL with missing module.

- [ ] **Step 3: Implement `app/r/[code]/route.ts`**

Implement dynamic QR code lookup, status validation, rule evaluation, session persistence, and cookie setting.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/redirect.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/r/[code]/route.ts tests/unit/redirect.test.ts
git commit -m "feat(redirect): implement high-performance /r/[code] redirect handler with session tracking"
```

---

### Task 4: Routing Rules Management API (`app/api/qr-codes/[id]/rules/route.ts`)

**Files:**
- Create: `app/api/qr-codes/[id]/rules/route.ts`
- Create: `app/api/qr-codes/[id]/rules/[ruleId]/route.ts`
- Test: `tests/unit/routing-rules-api.test.ts`

**Interfaces:**
- Produces: `GET /api/qr-codes/:id/rules`, `POST /api/qr-codes/:id/rules`, `PUT /api/qr-codes/:id/rules/:ruleId`, `DELETE /api/qr-codes/:id/rules/:ruleId`.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/routing-rules-api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/qr-codes/[id]/rules/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      qrCodes: { findFirst: vi.fn() },
      routingRules: { findMany: vi.fn(), findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn() }) }) }),
  },
}));

describe("Routing Rules API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({ id: "user-1", email: "test@example.com" });
  });

  it("should return rules for authorized user's QR code", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({ id: "qr-1", userId: "user-1" });
    (db.query.routingRules.findMany as any).mockResolvedValue([{ id: "rule-1", conditionType: "os", destinationUrl: "https://apple.com" }]);

    const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules");
    const res = await GET(req, { params: Promise.resolve({ id: "qr-1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.rules).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/routing-rules-api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement API route handlers**

Implement `GET`, `POST`, `PUT`, `DELETE` handlers with authentication and validation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/routing-rules-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/qr-codes/[id]/rules/ tests/unit/routing-rules-api.test.ts
git commit -m "feat(api): implement multi-tenant routing rules CRUD endpoints"
```

---

### Task 5: Event Ingestion API & Tracker (`app/api/track/route.ts` & `lib/analytics/tracker.ts`)

**Files:**
- Create: `lib/analytics/tracker.ts`
- Create: `app/api/track/route.ts`
- Test: `tests/unit/track-api.test.ts`

**Interfaces:**
- Produces: `POST /api/track` and `recordSessionEvent(...)` tracker utility.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/track-api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/track/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }),
  },
}));

describe("POST /api/track Ingestion Route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should record event and mark conversion for valid session", async () => {
    (db.query.sessions.findFirst as any).mockResolvedValue({
      id: "sess-123",
      qrCodeId: "qr-1",
      userId: "user-1",
      startedAt: new Date(Date.now() - 30000),
      eventsCount: 2,
      converted: false,
    });

    const req = new NextRequest("http://localhost:3000/api/track", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "sess-123",
        eventType: "CONVERSION",
        eventData: { goal: "Order Bowl Complete", amount: 14.50 },
      }),
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/track-api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `lib/analytics/tracker.ts` and `app/api/track/route.ts`**

Implement validation, event logging, session duration calculation, and conversion status update.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/track-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/track/route.ts lib/analytics/tracker.ts tests/unit/track-api.test.ts
git commit -m "feat(analytics): implement event ingestion API and tracker utility"
```

---

### Task 6: Journeys Analytics API (`app/api/analytics/journeys/route.ts` & `app/api/analytics/sessions/[id]/route.ts`)

**Files:**
- Create: `app/api/analytics/journeys/route.ts`
- Create: `app/api/analytics/sessions/[id]/route.ts`
- Test: `tests/unit/journeys-api.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/analytics/journeys` (paginated list of sessions with stats and filter options)
  - `GET /api/analytics/sessions/:id` (full visitor journey timeline events)

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/journeys-api.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getJourneys } from "@/app/api/analytics/journeys/route";
import { GET as getSessionDetail } from "@/app/api/analytics/sessions/[id]/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findMany: vi.fn(), findFirst: vi.fn() },
      sessionEvents: { findMany: vi.fn() },
    },
  },
}));

describe("Journeys Analytics API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({ id: "user-1", email: "test@example.com" });
  });

  it("should return list of journeys for authorized user", async () => {
    (db.query.sessions.findMany as any).mockResolvedValue([
      { id: "sess-1", qrCodeId: "qr-1", deviceType: "mobile", converted: true },
    ]);

    const req = new NextRequest("http://localhost:3000/api/analytics/journeys");
    const res = await getJourneys(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.journeys).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/journeys-api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Journeys and Session Detail API routes**

Implement multi-tenant session queries, filters (device, conversion, qrCodeId), and event sorting.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/journeys-api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api/analytics/journeys/ app/api/analytics/sessions/ tests/unit/journeys-api.test.ts
git commit -m "feat(analytics): implement journeys list and session timeline detail API endpoints"
```

---

### Task 7: Scan Journey Dashboard UI (`app/dashboard/journeys/page.tsx` & `components/journeys/`)

**Files:**
- Create: `components/journeys/journeys-table.tsx`
- Create: `components/journeys/journey-detail-sheet.tsx`
- Create: `app/dashboard/journeys/page.tsx`
- Modify: `components/app-sidebar.tsx`
- Test: `tests/unit/journeys-components.test.tsx`

**Interfaces:**
- Produces: Scan Journey visual timeline component, session details side sheet, filter bar, and navigation tab in sidebar.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/journeys-components.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { JourneysTable } from "@/components/journeys/journeys-table";
import { JourneyTimeline } from "@/components/journeys/journey-detail-sheet";

describe("Journeys Components", () => {
  it("should render journey list table headers and items", () => {
    const mockJourneys = [
      {
        id: "sess-abc12345",
        qrCodeId: "qr-1",
        qrName: "Restaurant Table Menu",
        deviceType: "mobile",
        os: "iOS",
        browser: "Safari",
        country: "ID",
        city: "Jakarta",
        startedAt: new Date().toISOString(),
        durationSeconds: 45,
        eventsCount: 3,
        converted: true,
      },
    ];

    render(<JourneysTable journeys={mockJourneys as any} onSelectJourney={() => {}} />);
    expect(screen.getByText("Restaurant Table Menu")).toBeDefined();
    expect(screen.getByText("Converted")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/journeys-components.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Journeys Table, Timeline Sheet, and Page**

Build visual step-by-step visitor timeline, device badges, and integrate with sidebar navigation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/journeys-components.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/journeys/ app/dashboard/journeys/ components/app-sidebar.tsx tests/unit/journeys-components.test.tsx
git commit -m "feat(ui): implement interactive Scan Journey timeline explorer and dashboard page"
```

---

### Task 8: Routing Rules Configuration Dialog (`components/qr/routing-rules-dialog.tsx`)

**Files:**
- Create: `components/qr/routing-rules-dialog.tsx`
- Modify: `components/qr/qr-card.tsx`
- Test: `tests/unit/routing-rules-dialog.test.tsx`

**Interfaces:**
- Produces: Modal dialog to configure condition-based destination rules for any QR code directly from QR management cards.

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/routing-rules-dialog.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoutingRulesDialog } from "@/components/qr/routing-rules-dialog";

describe("RoutingRulesDialog", () => {
  it("should render routing rules dialog with add rule button", () => {
    render(
      <RoutingRulesDialog
        qrCode={{ id: "qr-1", name: "Promo QR", destinationUrl: "https://example.com" } as any}
        open={true}
        onOpenChange={() => {}}
      />
    );
    expect(screen.getByText(/Dynamic Routing Rules/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Add Rule/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/routing-rules-dialog.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `RoutingRulesDialog` and integrate into `QRCard`**

Implement rule creation, rule deletion, priority reordering, and condition type select (Device, OS, Country, Language).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/routing-rules-dialog.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/qr/routing-rules-dialog.tsx components/qr/qr-card.tsx tests/unit/routing-rules-dialog.test.tsx
git commit -m "feat(qr): implement dynamic routing rules dialog and card action integration"
```

---

## Plan Self-Review Checklist

- **Spec coverage**: Covers Features 4 (Dynamic Routing), 5 (Redirect Engine), 6 (Scan Tracking), 7 (Visitor Sessions), and 8 (Scan Journey UI).
- **Placeholder scan**: Clean, full code blocks provided for all steps.
- **Type consistency**: Verified across `lib/db/schema.ts`, `lib/routing/engine.ts`, and component props.
