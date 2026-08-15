import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/r/[code]/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      qrCodes: { findFirst: vi.fn() },
      routingRules: { findMany: vi.fn() },
      experiments: { findFirst: vi.fn() },
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
    (db.query.experiments.findFirst as any).mockResolvedValue(null);
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

  it("should route to experiment variant and set sticky cookie when active experiment exists", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-ab",
      userId: "user-1",
      campaignId: "camp-1",
      slug: "ab-landing",
      name: "A/B Test Campaign",
      destinationUrl: "https://example.com/original",
      status: "active",
      scanCount: 0,
    });

    (db.query.experiments.findFirst as any).mockResolvedValue({
      id: "exp-1",
      qrCodeId: "qr-ab",
      status: "active",
      variants: [
        {
          id: "var-control",
          name: "Control A",
          destinationUrl: "https://example.com/variant-a",
          trafficWeight: 100,
          isControl: true,
        },
        {
          id: "var-b",
          name: "Variant B",
          destinationUrl: "https://example.com/variant-b",
          trafficWeight: 0,
          isControl: false,
        },
      ],
    });

    const insertValuesSpy = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: insertValuesSpy });

    const req = new NextRequest("http://localhost:3000/r/ab-landing", {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const res = await GET(req, { params: Promise.resolve({ code: "ab-landing" }) });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/variant-a");
    expect(res.headers.get("set-cookie")).toContain("sf_exp_exp-1=var-control");

    // Verify sessions insert received experimentId and experimentVariantId
    expect(insertValuesSpy).toHaveBeenCalled();
    const sessionInsertCall = insertValuesSpy.mock.calls[0][0];
    expect(sessionInsertCall.experimentId).toBe("exp-1");
    expect(sessionInsertCall.experimentVariantId).toBe("var-control");
  });

  it("should honor sticky cookie sf_exp_<experimentId> for returning visitors", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-ab",
      userId: "user-1",
      slug: "ab-landing",
      name: "A/B Test Campaign",
      destinationUrl: "https://example.com/original",
      status: "active",
      scanCount: 5,
    });

    (db.query.experiments.findFirst as any).mockResolvedValue({
      id: "exp-1",
      qrCodeId: "qr-ab",
      status: "active",
      variants: [
        {
          id: "var-control",
          name: "Control A",
          destinationUrl: "https://example.com/variant-a",
          trafficWeight: 100,
          isControl: true,
        },
        {
          id: "var-b",
          name: "Variant B",
          destinationUrl: "https://example.com/variant-b",
          trafficWeight: 0,
          isControl: false,
        },
      ],
    });

    const insertValuesSpy = vi.fn().mockResolvedValue([]);
    (db.insert as any).mockReturnValue({ values: insertValuesSpy });

    const req = new NextRequest("http://localhost:3000/r/ab-landing", {
      headers: {
        cookie: "sf_exp_exp-1=var-b",
      },
    });

    const res = await GET(req, { params: Promise.resolve({ code: "ab-landing" }) });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/variant-b");
    expect(res.headers.get("set-cookie")).toContain("sf_exp_exp-1=var-b");

    const sessionInsertCall = insertValuesSpy.mock.calls[0][0];
    expect(sessionInsertCall.experimentId).toBe("exp-1");
    expect(sessionInsertCall.experimentVariantId).toBe("var-b");
  });

  it("should fallback to routing rules if experiment is paused or has no variants", async () => {
    (db.query.qrCodes.findFirst as any).mockResolvedValue({
      id: "qr-ab",
      userId: "user-1",
      slug: "ab-landing",
      name: "A/B Test Campaign",
      destinationUrl: "https://example.com/original",
      status: "active",
      scanCount: 5,
    });

    // Experiment query returns null (e.g. paused or no active experiment)
    (db.query.experiments.findFirst as any).mockResolvedValue(null);
    (db.query.routingRules.findMany as any).mockResolvedValue([]);

    const req = new NextRequest("http://localhost:3000/r/ab-landing");
    const res = await GET(req, { params: Promise.resolve({ code: "ab-landing" }) });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://example.com/original");
    expect(res.headers.get("set-cookie")).not.toContain("sf_exp_");
  });
});
