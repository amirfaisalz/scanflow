import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/campaigns/route";
import { GET as getCampaign, PATCH, DELETE } from "@/app/api/campaigns/[id]/route";
import { POST as assignQrCodes } from "@/app/api/campaigns/[id]/assign/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      campaigns: { findMany: vi.fn(), findFirst: vi.fn() },
      qrCodes: { findMany: vi.fn(), findFirst: vi.fn() },
      sessions: { findMany: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn(),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
  },
}));

describe("Campaigns Management API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({ id: "user-1", email: "user@scanflow.io" });
  });

  describe("GET /api/campaigns", () => {
    it("should return 401 when not authenticated", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/campaigns");
      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("should return campaigns with aggregate stats for the authorized user", async () => {
      (db.query.campaigns.findMany as any).mockResolvedValue([
        {
          id: "camp-1",
          userId: "user-1",
          name: "Summer Restaurant Promo 2026",
          description: "All summer table and flyer QR codes",
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          qrCodes: [
            { id: "qr-1", scanCount: 120 },
            { id: "qr-2", scanCount: 80 },
          ],
          sessions: [
            { id: "sess-1", converted: true },
            { id: "sess-2", converted: false },
          ],
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/campaigns");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaigns).toHaveLength(1);
      expect(data.campaigns[0].name).toBe("Summer Restaurant Promo 2026");
      expect(data.campaigns[0].qrCodesCount).toBe(2);
      expect(data.campaigns[0].totalScans).toBe(200);
      expect(data.campaigns[0].totalSessions).toBe(2);
      expect(data.campaigns[0].conversions).toBe(1);
      expect(data.campaigns[0].conversionRate).toBe(50);
    });
  });

  describe("POST /api/campaigns", () => {
    it("should validate campaign name is provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should create new campaign successfully", async () => {
      const createdCampaign = {
        id: "camp-new",
        userId: "user-1",
        name: "Black Friday 2026",
        description: "Special sales campaign",
        status: "active",
      };

      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdCampaign]),
      });
      (db.insert as any).mockReturnValue({ values: valuesMock });

      const req = new NextRequest("http://localhost:3000/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          name: "Black Friday 2026",
          description: "Special sales campaign",
          status: "active",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.name).toBe("Black Friday 2026");
    });
  });

  describe("GET /api/campaigns/[id]", () => {
    it("should return 404 when campaign not found", async () => {
      (db.query.campaigns.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/campaigns/camp-missing");
      const res = await getCampaign(req, { params: Promise.resolve({ id: "camp-missing" }) });
      expect(res.status).toBe(404);
    });

    it("should return single campaign with attached QR codes", async () => {
      (db.query.campaigns.findFirst as any).mockResolvedValue({
        id: "camp-1",
        userId: "user-1",
        name: "Summer Menu",
        qrCodes: [{ id: "qr-1", name: "Table 1", scanCount: 50 }],
        sessions: [{ id: "sess-1", converted: true }],
      });

      const req = new NextRequest("http://localhost:3000/api/campaigns/camp-1");
      const res = await getCampaign(req, { params: Promise.resolve({ id: "camp-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.name).toBe("Summer Menu");
      expect(data.campaign.qrCodes).toHaveLength(1);
    });
  });

  describe("PATCH /api/campaigns/[id]", () => {
    it("should update campaign details", async () => {
      (db.query.campaigns.findFirst as any).mockResolvedValue({
        id: "camp-1",
        userId: "user-1",
      });

      const updated = {
        id: "camp-1",
        name: "Updated Summer Menu",
        status: "paused",
      };

      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updated]),
        }),
      });
      (db.update as any).mockReturnValue({ set: setMock });

      const req = new NextRequest("http://localhost:3000/api/campaigns/camp-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Summer Menu", status: "paused" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "camp-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.status).toBe("paused");
    });
  });

  describe("DELETE /api/campaigns/[id]", () => {
    it("should delete campaign and clear associations", async () => {
      (db.query.campaigns.findFirst as any).mockResolvedValue({
        id: "camp-1",
        userId: "user-1",
      });

      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "camp-1" }]),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/campaigns/camp-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "camp-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe("POST /api/campaigns/[id]/assign", () => {
    it("should assign selected QR codes to campaign", async () => {
      (db.query.campaigns.findFirst as any).mockResolvedValue({
        id: "camp-1",
        userId: "user-1",
      });

      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      });
      (db.update as any).mockReturnValue({ set: setMock });

      const req = new NextRequest("http://localhost:3000/api/campaigns/camp-1/assign", {
        method: "POST",
        body: JSON.stringify({ qrCodeIds: ["qr-1", "qr-2"] }),
      });

      const res = await assignQrCodes(req, { params: Promise.resolve({ id: "camp-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
