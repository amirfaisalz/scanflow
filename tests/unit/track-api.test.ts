import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/track/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findFirst: vi.fn() },
      qrCodes: { findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

describe("POST /api/track Ingestion Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when sessionId or eventType is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/track", {
      method: "POST",
      body: JSON.stringify({ eventType: "PAGE_VIEW" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 404 when session is not found", async () => {
    (db.query.sessions.findFirst as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/track", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "sess_non_existent",
        eventType: "PAGE_VIEW",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should record PAGE_VIEW event and update session duration", async () => {
    const startedAt = new Date(Date.now() - 45000); // 45s ago
    (db.query.sessions.findFirst as any).mockResolvedValue({
      id: "sess_123",
      qrCodeId: "qr-1",
      userId: "user-1",
      startedAt,
      eventsCount: 1,
      converted: false,
    });

    const req = new NextRequest("http://localhost:3000/api/track", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "sess_123",
        eventType: "PAGE_VIEW",
        eventData: { page: "/menu", title: "Summer Menu" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.eventType).toBe("PAGE_VIEW");
    expect(data.eventsCount).toBe(2);
  });

  it("should mark session converted when CONVERSION event is tracked", async () => {
    const startedAt = new Date(Date.now() - 60000); // 60s ago
    (db.query.sessions.findFirst as any).mockResolvedValue({
      id: "sess_123",
      qrCodeId: "qr-1",
      userId: "user-1",
      startedAt,
      eventsCount: 2,
      converted: false,
    });

    const req = new NextRequest("http://localhost:3000/api/track", {
      method: "POST",
      body: JSON.stringify({
        sessionId: "sess_123",
        eventType: "CONVERSION",
        eventData: { goal: "Order Complete", orderId: "ORD-99", amount: 28.50 },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.converted).toBe(true);
    expect(data.conversionEvent).toBe("Order Complete");
  });
});
