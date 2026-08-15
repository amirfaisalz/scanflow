import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getJourneys } from "@/app/api/analytics/journeys/route";
import { GET as getSessionDetail } from "@/app/api/analytics/sessions/[id]/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
}));

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

  describe("GET /api/analytics/journeys", () => {
    it("should return 401 when not authenticated", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/analytics/journeys");
      const res = await getJourneys(req);
      expect(res.status).toBe(401);
    });

    it("should return journeys list with summary metrics", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([
        {
          id: "sess_1",
          qrCodeId: "qr-1",
          userId: "user-1",
          deviceType: "mobile",
          os: "iOS",
          browser: "Safari",
          country: "ID",
          city: "Jakarta",
          durationSeconds: 45,
          eventsCount: 3,
          converted: true,
          conversionEvent: "Order Now",
          startedAt: new Date("2026-08-15T10:00:00Z"),
          endedAt: new Date("2026-08-15T10:00:45Z"),
          qrCode: {
            id: "qr-1",
            name: "Restaurant Menu",
            slug: "menu",
          },
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/analytics/journeys?device=mobile");
      const res = await getJourneys(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.journeys).toHaveLength(1);
      expect(data.journeys[0].id).toBe("sess_1");
      expect(data.journeys[0].qrName).toBe("Restaurant Menu");
      expect(data.metrics.totalSessions).toBe(1);
      expect(data.metrics.convertedCount).toBe(1);
      expect(data.metrics.conversionRate).toBe(100);
    });
  });

  describe("GET /api/analytics/sessions/[id]", () => {
    it("should return 404 when session does not exist or does not belong to user", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/analytics/sessions/sess_missing");
      const res = await getSessionDetail(req, { params: Promise.resolve({ id: "sess_missing" }) });
      expect(res.status).toBe(404);
    });

    it("should return complete session with chronological events timeline", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue({
        id: "sess_1",
        qrCodeId: "qr-1",
        userId: "user-1",
        deviceType: "mobile",
        os: "iOS",
        browser: "Safari",
        country: "ID",
        city: "Jakarta",
        durationSeconds: 72,
        eventsCount: 3,
        converted: true,
        conversionEvent: "Checkout",
        startedAt: new Date("2026-08-15T10:00:00Z"),
        qrCode: {
          id: "qr-1",
          name: "Summer Menu",
          slug: "summer-menu",
          destinationUrl: "https://restaurant.com/summer",
        },
        matchedRule: {
          id: "rule-1",
          conditionType: "os",
          conditionValue: "ios",
          destinationUrl: "https://apps.apple.com/app",
        },
      });

      (db.query.sessionEvents.findMany as any).mockResolvedValue([
        {
          id: "evt_1",
          sessionId: "sess_1",
          eventType: "QR_SCAN",
          eventData: { destinationUrl: "https://apps.apple.com/app" },
          timestamp: new Date("2026-08-15T10:00:00Z"),
        },
        {
          id: "evt_2",
          sessionId: "sess_1",
          eventType: "PAGE_VIEW",
          eventData: { page: "/menu" },
          timestamp: new Date("2026-08-15T10:00:15Z"),
        },
        {
          id: "evt_3",
          sessionId: "sess_1",
          eventType: "CONVERSION",
          eventData: { goal: "Checkout" },
          timestamp: new Date("2026-08-15T10:01:12Z"),
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/analytics/sessions/sess_1");
      const res = await getSessionDetail(req, { params: Promise.resolve({ id: "sess_1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.session.id).toBe("sess_1");
      expect(data.events).toHaveLength(3);
      expect(data.events[0].eventType).toBe("QR_SCAN");
      expect(data.events[2].eventType).toBe("CONVERSION");
    });
  });
});
