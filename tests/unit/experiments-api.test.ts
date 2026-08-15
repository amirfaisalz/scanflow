import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/experiments/route";
import {
  GET as getExperiment,
  PATCH,
  DELETE,
} from "@/app/api/experiments/[id]/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      experiments: { findMany: vi.fn(), findFirst: vi.fn() },
      experimentVariants: { findMany: vi.fn(), findFirst: vi.fn() },
      sessions: { findMany: vi.fn() },
      qrCodes: { findMany: vi.fn(), findFirst: vi.fn() },
      campaigns: { findMany: vi.fn(), findFirst: vi.fn() },
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

describe("Experiments CRUD REST API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({
      id: "user-tenant-1",
      email: "tenant@scanflow.io",
    });
  });

  describe("GET /api/experiments", () => {
    it("should return 401 when user is unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments");
      const res = await GET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return list of experiments with computed live variant metrics and KPI summary", async () => {
      const mockExperiments = [
        {
          id: "exp-1",
          userId: "user-tenant-1",
          qrCodeId: "qr-1",
          campaignId: "camp-1",
          name: "Landing Page Test",
          description: "Test page A vs page B",
          status: "active",
          trafficAllocation: 100,
          winnerVariantId: null,
          startedAt: new Date("2026-08-01"),
          endedAt: null,
          createdAt: new Date("2026-08-01"),
          updatedAt: new Date("2026-08-01"),
          qrCode: { id: "qr-1", name: "Promo QR", slug: "promo-qr" },
          campaign: { id: "camp-1", name: "Summer Campaign" },
          variants: [
            {
              id: "var-1",
              experimentId: "exp-1",
              userId: "user-tenant-1",
              name: "Control (Original)",
              destinationUrl: "https://example.com/a",
              trafficWeight: 50,
              isControl: true,
            },
            {
              id: "var-2",
              experimentId: "exp-1",
              userId: "user-tenant-1",
              name: "Variant B (New Layout)",
              destinationUrl: "https://example.com/b",
              trafficWeight: 50,
              isControl: false,
            },
          ],
        },
      ];

      const mockSessions = [
        // 100 sessions for var-1, 10 converted (10%)
        ...Array.from({ length: 100 }, (_, i) => ({
          id: `s-1-${i}`,
          userId: "user-tenant-1",
          qrCodeId: "qr-1",
          experimentId: "exp-1",
          experimentVariantId: "var-1",
          converted: i < 10,
          eventsCount: 2,
        })),
        // 100 sessions for var-2, 25 converted (25%) -> significant lift
        ...Array.from({ length: 100 }, (_, i) => ({
          id: `s-2-${i}`,
          userId: "user-tenant-1",
          qrCodeId: "qr-1",
          experimentId: "exp-1",
          experimentVariantId: "var-2",
          converted: i < 25,
          eventsCount: 2,
        })),
      ];

      (db.query.experiments.findMany as any).mockResolvedValue(mockExperiments);
      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);

      const req = new NextRequest("http://localhost:3000/api/experiments");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.experiments).toHaveLength(1);

      const exp = body.experiments[0];
      expect(exp.id).toBe("exp-1");
      expect(exp.name).toBe("Landing Page Test");
      expect(exp.status).toBe("active");
      expect(exp.variants).toHaveLength(2);

      // Verify variant 1 stats
      const var1 = exp.variants.find((v: any) => v.id === "var-1");
      expect(var1.sessions).toBe(100);
      expect(var1.conversions).toBe(10);
      expect(var1.conversionRate).toBe(10);
      expect(var1.isControl).toBe(true);

      // Verify variant 2 stats
      const var2 = exp.variants.find((v: any) => v.id === "var-2");
      expect(var2.sessions).toBe(100);
      expect(var2.conversions).toBe(25);
      expect(var2.conversionRate).toBe(25);
      expect(var2.lift).toBe(150); // (25-10)/10 * 100 = 150%
      expect(var2.confidenceLevel).toBeGreaterThan(95);
      expect(var2.isSignificant).toBe(true);

      // Verify KPI metrics overview
      expect(body.metrics).toBeDefined();
      expect(body.metrics.totalExperiments).toBe(1);
      expect(body.metrics.activeExperiments).toBe(1);
      expect(body.metrics.totalVariants).toBe(2);
      expect(body.metrics.totalConversions).toBe(35);
      expect(body.metrics.totalSessions).toBe(200);
      expect(body.metrics.overallConversionRate).toBe(17.5);
      expect(body.metrics.significantWinnersCount).toBe(1);
    });

    it("should handle empty experiments list without division by zero errors", async () => {
      (db.query.experiments.findMany as any).mockResolvedValue([]);
      (db.query.sessions.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/experiments");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.experiments).toEqual([]);
      expect(body.metrics).toEqual({
        totalExperiments: 0,
        activeExperiments: 0,
        totalVariants: 0,
        totalConversions: 0,
        totalSessions: 0,
        overallConversionRate: 0,
        significantWinnersCount: 0,
      });
    });

    it("should handle database errors gracefully", async () => {
      (db.query.experiments.findMany as any).mockRejectedValue(
        new Error("Database connection failure")
      );

      const req = new NextRequest("http://localhost:3000/api/experiments");
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("POST /api/experiments", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "Test",
          qrCodeId: "qr-1",
          variants: [
            { name: "A", destinationUrl: "https://a.com", trafficWeight: 50 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 },
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("should return 400 when name is missing or empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "   ",
          qrCodeId: "qr-1",
          variants: [
            { name: "A", destinationUrl: "https://a.com", trafficWeight: 50 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 },
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/name is required/i);
    });

    it("should return 400 when qrCodeId is missing or empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "A/B Test",
          qrCodeId: "",
          variants: [
            { name: "A", destinationUrl: "https://a.com", trafficWeight: 50 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 },
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/qr code is required/i);
    });

    it("should return 404 when qrCodeId does not exist or belongs to another user", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "A/B Test",
          qrCodeId: "qr-unowned",
          variants: [
            { name: "A", destinationUrl: "https://a.com", trafficWeight: 50 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 },
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/qr code not found/i);
    });

    it("should return 400 when variants array has fewer than 2 variants", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({
        id: "qr-1",
        userId: "user-tenant-1",
      });

      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "A/B Test",
          qrCodeId: "qr-1",
          variants: [
            { name: "Only Variant", destinationUrl: "https://a.com", trafficWeight: 100 },
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/at least 2 variants/i);
    });

    it("should return 400 when variant traffic weights do not sum to 100%", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({
        id: "qr-1",
        userId: "user-tenant-1",
      });

      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "A/B Test",
          qrCodeId: "qr-1",
          variants: [
            { name: "A", destinationUrl: "https://a.com", trafficWeight: 60 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 }, // sums to 110%
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/sum to 100%/i);
    });

    it("should return 400 when a variant has invalid or missing destinationUrl", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({
        id: "qr-1",
        userId: "user-tenant-1",
      });

      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "A/B Test",
          qrCodeId: "qr-1",
          variants: [
            { name: "A", destinationUrl: "not-a-url", trafficWeight: 50 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 },
          ],
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/valid url/i);
    });

    it("should successfully create experiment and variants", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({
        id: "qr-1",
        userId: "user-tenant-1",
        campaignId: "camp-1",
      });

      const createdExp = {
        id: "exp_123456",
        userId: "user-tenant-1",
        qrCodeId: "qr-1",
        campaignId: "camp-1",
        name: "CTA Button Test",
        description: "Green vs Blue button",
        status: "draft",
        trafficAllocation: 100,
        winnerVariantId: null,
        startedAt: null,
        endedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdVariants = [
        {
          id: "var_1",
          experimentId: "exp_123456",
          userId: "user-tenant-1",
          name: "Control - Green",
          destinationUrl: "https://example.com/green",
          trafficWeight: 50,
          isControl: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "var_2",
          experimentId: "exp_123456",
          userId: "user-tenant-1",
          name: "Variant - Blue",
          destinationUrl: "https://example.com/blue",
          trafficWeight: 50,
          isControl: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const expValuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdExp]),
      });
      const varValuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(createdVariants),
      });

      let insertCallCount = 0;
      (db.insert as any).mockImplementation(() => {
        insertCallCount++;
        if (insertCallCount === 1) {
          return { values: expValuesMock };
        }
        return { values: varValuesMock };
      });

      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "CTA Button Test",
          description: "Green vs Blue button",
          qrCodeId: "qr-1",
          campaignId: "camp-1",
          trafficAllocation: 100,
          variants: [
            {
              name: "Control - Green",
              destinationUrl: "https://example.com/green",
              trafficWeight: 50,
              isControl: true,
            },
            {
              name: "Variant - Blue",
              destinationUrl: "https://example.com/blue",
              trafficWeight: 50,
              isControl: false,
            },
          ],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.experiment).toBeDefined();
      expect(body.experiment.name).toBe("CTA Button Test");
      expect(body.experiment.variants).toHaveLength(2);
    });

    it("should handle error during database creation", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({
        id: "qr-1",
        userId: "user-tenant-1",
      });

      const expValuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error("Insert failed")),
      });
      (db.insert as any).mockReturnValue({ values: expValuesMock });

      const req = new NextRequest("http://localhost:3000/api/experiments", {
        method: "POST",
        body: JSON.stringify({
          name: "CTA Button Test",
          qrCodeId: "qr-1",
          variants: [
            { name: "A", destinationUrl: "https://a.com", trafficWeight: 50 },
            { name: "B", destinationUrl: "https://b.com", trafficWeight: 50 },
          ],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("GET /api/experiments/[id]", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1");
      const res = await getExperiment(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 when experiment not found or belongs to another user", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments/exp-missing");
      const res = await getExperiment(req, {
        params: Promise.resolve({ id: "exp-missing" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/experiment not found/i);
    });

    it("should return experiment with enriched variants and statistical analysis", async () => {
      const mockExp = {
        id: "exp-1",
        userId: "user-tenant-1",
        qrCodeId: "qr-1",
        campaignId: "camp-1",
        name: "Headline Test",
        description: "Test headlines",
        status: "active",
        trafficAllocation: 100,
        winnerVariantId: null,
        startedAt: new Date("2026-08-01"),
        endedAt: null,
        createdAt: new Date("2026-08-01"),
        updatedAt: new Date("2026-08-01"),
        qrCode: { id: "qr-1", name: "Promo QR", slug: "promo-qr" },
        campaign: { id: "camp-1", name: "Summer Promo" },
        winnerVariant: null,
        variants: [
          {
            id: "var-1",
            experimentId: "exp-1",
            userId: "user-tenant-1",
            name: "Original Headline",
            destinationUrl: "https://example.com/h1",
            trafficWeight: 50,
            isControl: true,
          },
          {
            id: "var-2",
            experimentId: "exp-1",
            userId: "user-tenant-1",
            name: "New Headline",
            destinationUrl: "https://example.com/h2",
            trafficWeight: 50,
            isControl: false,
          },
        ],
      };

      const mockSessions = [
        ...Array.from({ length: 50 }, (_, i) => ({
          id: `s-1-${i}`,
          userId: "user-tenant-1",
          experimentId: "exp-1",
          experimentVariantId: "var-1",
          converted: i < 5,
          eventsCount: 2,
        })),
        ...Array.from({ length: 50 }, (_, i) => ({
          id: `s-2-${i}`,
          userId: "user-tenant-1",
          experimentId: "exp-1",
          experimentVariantId: "var-2",
          converted: i < 15,
          eventsCount: 2,
        })),
      ];

      (db.query.experiments.findFirst as any).mockResolvedValue(mockExp);
      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1");
      const res = await getExperiment(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.experiment).toBeDefined();
      expect(body.experiment.id).toBe("exp-1");
      expect(body.experiment.name).toBe("Headline Test");
      expect(body.experiment.stats).toBeDefined();
      expect(body.experiment.stats.totalSessions).toBe(100);
      expect(body.experiment.stats.totalConversions).toBe(20);
      expect(body.experiment.variants[1].conversionRate).toBe(30);
      expect(body.experiment.variants[0].conversionRate).toBe(10);
    });

    it("should handle error during retrieval", async () => {
      (db.query.experiments.findFirst as any).mockRejectedValue(
        new Error("DB error")
      );

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1");
      const res = await getExperiment(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("PATCH /api/experiments/[id]", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 when experiment not found", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(404);
    });

    it("should return 400 when name is empty string", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
        variants: [{ id: "v1" }, { id: "v2" }],
      });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "   " }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/name cannot be empty/i);
    });

    it("should return 400 when status is invalid", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
        variants: [{ id: "v1" }, { id: "v2" }],
      });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "invalid_status" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid status/i);
    });

    it("should return 400 when winnerVariantId does not belong to the experiment", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
        variants: [{ id: "v1" }, { id: "v2" }],
      });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ winnerVariantId: "v-foreign" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/winner variant does not belong/i);
    });

    it("should update status to active and set startedAt", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
        status: "draft",
        startedAt: null,
        variants: [{ id: "v1" }, { id: "v2" }],
      });

      const updatedExp = {
        id: "exp-1",
        userId: "user-tenant-1",
        name: "Landing Page Test",
        status: "active",
        startedAt: new Date(),
        endedAt: null,
      };

      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedExp]),
        }),
      });
      (db.update as any).mockReturnValue({ set: setMock });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "active" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.experiment.status).toBe("active");
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          startedAt: expect.any(Date),
        })
      );
    });

    it("should update status to ended and declare winnerVariantId", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
        status: "active",
        startedAt: new Date(),
        variants: [{ id: "v1" }, { id: "v2" }],
      });

      const updatedExp = {
        id: "exp-1",
        userId: "user-tenant-1",
        name: "Landing Page Test",
        status: "ended",
        winnerVariantId: "v2",
        endedAt: new Date(),
      };

      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedExp]),
        }),
      });
      (db.update as any).mockReturnValue({ set: setMock });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "ended", winnerVariantId: "v2" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.experiment.status).toBe("ended");
      expect(body.experiment.winnerVariantId).toBe("v2");
    });
  });

  describe("DELETE /api/experiments/[id]", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "DELETE",
      });
      const res = await DELETE(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 when experiment not found or belongs to another user", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/experiments/exp-missing", {
        method: "DELETE",
      });
      const res = await DELETE(req, {
        params: Promise.resolve({ id: "exp-missing" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toMatch(/experiment not found/i);
    });

    it("should delete experiment and return success", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
      });

      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "exp-1" }]),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toMatch(/deleted successfully/i);
    });

    it("should handle error during deletion", async () => {
      (db.query.experiments.findFirst as any).mockResolvedValue({
        id: "exp-1",
        userId: "user-tenant-1",
      });

      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error("DB delete failed")),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/experiments/exp-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "exp-1" }),
      });
      expect(res.status).toBe(500);
    });
  });
});
