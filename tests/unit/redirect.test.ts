import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/r/[code]/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      qrCodes: { findFirst: vi.fn() },
      routingRules: { findMany: vi.fn() },
      sessions: { findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

describe("GET /r/[code] Redirect Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 HTML/Response when QR code is not found", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/r/unknown-slug");
    const res = await GET(req, { params: Promise.resolve({ code: "unknown-slug" }) });
    expect(res.status).toBe(404);
  });

  it("should return friendly paused status notice when QR is paused", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-paused",
      userId: "user-1",
      slug: "paused-qr",
      name: "Special Promo",
      destinationUrl: "https://restaurant.com/promo",
      status: "paused",
      scanCount: 5,
    });

    const req = new NextRequest("http://localhost:3000/r/paused-qr");
    const res = await GET(req, { params: Promise.resolve({ code: "paused-qr" }) });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Campaign Paused");
  });

  it("should return friendly archived status notice when QR is archived", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-archived",
      userId: "user-1",
      slug: "archived-qr",
      name: "Old Flyer",
      destinationUrl: "https://restaurant.com/old",
      status: "archived",
      scanCount: 12,
    });

    const req = new NextRequest("http://localhost:3000/r/archived-qr");
    const res = await GET(req, { params: Promise.resolve({ code: "archived-qr" }) });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("Campaign Archived");
  });

  it("should return 307 redirect, evaluate rules, and set sf_sid cookie for active QR code", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-123",
      userId: "user-1",
      campaignId: "camp-1",
      slug: "menu",
      name: "Table Menu",
      destinationUrl: "https://restaurant.com/menu",
      status: "active",
      scanCount: 10,
    });

    (db.query.routingRules.findMany as any).mockResolvedValue([
      {
        id: "rule-ios",
        qrCodeId: "qr-123",
        userId: "user-1",
        priority: 1,
        conditionType: "os",
        conditionValue: "ios",
        destinationUrl: "https://apps.apple.com/app/scanflow",
        isActive: true,
      },
    ]);

    const req = new NextRequest("http://localhost:3000/r/menu", {
      headers: {
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        "accept-language": "en-US",
        "x-vercel-ip-country": "US",
      },
    });

    const res = await GET(req, { params: Promise.resolve({ code: "menu" }) });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://apps.apple.com/app/scanflow");
    expect(res.headers.get("set-cookie")).toContain("sf_sid=");
  });

  it("should reuse existing session from sf_sid cookie if present", async () => {
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
      headers: {
        cookie: "sf_sid=existing_session_xyz123",
      },
    });

    const res = await GET(req, { params: Promise.resolve({ code: "menu" }) });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://restaurant.com/menu");
    expect(res.headers.get("set-cookie")).toContain("sf_sid=existing_session_xyz123");
  });
});
