import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/analytics/overview/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview, type AnalyticsOverviewData } from "@/lib/analytics/overview";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/analytics/overview", () => ({
  getAnalyticsOverview: vi.fn(),
}));

describe("Analytics Overview API Route (GET /api/analytics/overview)", () => {
  const mockOverviewData: AnalyticsOverviewData = {
    kpis: {
      totalScans: 150,
      uniqueVisitors: 120,
      totalSessions: 140,
      conversions: 35,
      conversionRate: 25.0,
      avgDurationSeconds: 48,
      bouncedSessions: 20,
      bounceRate: 14.3,
    },
    timeSeries: [
      {
        timestamp: "2026-08-15T00:00:00.000Z",
        label: "00:00",
        scans: 10,
        sessions: 8,
        conversions: 2,
      },
    ],
    breakdowns: {
      devices: [{ name: "Mobile", value: 100, percentage: 71.4 }],
      operatingSystems: [{ name: "iOS", value: 80, percentage: 57.1 }],
      browsers: [{ name: "Safari", value: 75, percentage: 53.6 }],
      countries: [{ code: "US", name: "United States", scans: 90, percentage: 64.3 }],
      cities: [{ name: "New York", country: "US", scans: 45, percentage: 32.1 }],
      hourlyDistribution: [{ hour: 0, label: "00:00", count: 8 }],
    },
    topPerformers: {
      qrCodes: [
        {
          id: "qr-1",
          name: "Main Menu",
          slug: "main-menu",
          scans: 100,
          sessions: 90,
          conversions: 25,
          conversionRate: 27.8,
        },
      ],
      campaigns: [
        {
          id: "camp-1",
          name: "Summer Promo",
          scans: 120,
          sessions: 110,
          conversions: 30,
          conversionRate: 27.3,
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({ id: "user_test_123", email: "user@scanflow.io" });
    (getAnalyticsOverview as any).mockResolvedValue(mockOverviewData);
  });

  describe("Authentication", () => {
    it("should return 401 Unauthorized when user is not authenticated", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/analytics/overview");

      const res = await GET(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json).toEqual({ error: "Unauthorized" });
      expect(getAnalyticsOverview).not.toHaveBeenCalled();
    });
  });

  describe("Query Parameter Handling & Data Retrieval", () => {
    it("should fetch overview with default period (24h) when no query parameters are provided", async () => {
      const req = new NextRequest("http://localhost:3000/api/analytics/overview");

      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ data: mockOverviewData });
      expect(getAnalyticsOverview).toHaveBeenCalledWith("user_test_123", {
        period: "24h",
        qrCodeId: undefined,
        campaignId: undefined,
        device: undefined,
      });
    });

    it("should pass custom period and filter options to getAnalyticsOverview", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/analytics/overview?period=7d&qrCodeId=qr_999&campaignId=camp_888&device=mobile"
      );

      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockOverviewData);
      expect(getAnalyticsOverview).toHaveBeenCalledWith("user_test_123", {
        period: "7d",
        qrCodeId: "qr_999",
        campaignId: "camp_888",
        device: "mobile",
      });
    });

    it("should fallback to 24h period if invalid period is supplied", async () => {
      const req = new NextRequest("http://localhost:3000/api/analytics/overview?period=invalid_range");

      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(getAnalyticsOverview).toHaveBeenCalledWith(
        "user_test_123",
        expect.objectContaining({
          period: "24h",
        })
      );
    });

    it("should support all valid period options (24h, 7d, 30d, 90d, all)", async () => {
      const periods = ["24h", "7d", "30d", "90d", "all"] as const;

      for (const period of periods) {
        vi.clearAllMocks();
        (getCurrentUser as any).mockResolvedValue({ id: "user_test_123" });
        (getAnalyticsOverview as any).mockResolvedValue(mockOverviewData);

        const req = new NextRequest(`http://localhost:3000/api/analytics/overview?period=${period}`);
        const res = await GET(req);

        expect(res.status).toBe(200);
        expect(getAnalyticsOverview).toHaveBeenCalledWith("user_test_123", {
          period,
          qrCodeId: undefined,
          campaignId: undefined,
          device: undefined,
        });
      }
    });

    it("should handle 'all' filter parameters correctly", async () => {
      const req = new NextRequest(
        "http://localhost:3000/api/analytics/overview?period=30d&qrCodeId=all&campaignId=all&device=all"
      );

      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(getAnalyticsOverview).toHaveBeenCalledWith("user_test_123", {
        period: "30d",
        qrCodeId: "all",
        campaignId: "all",
        device: "all",
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 500 Internal Server Error when getAnalyticsOverview throws an exception", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      (getAnalyticsOverview as any).mockRejectedValue(new Error("Database connection failure"));

      const req = new NextRequest("http://localhost:3000/api/analytics/overview");
      const res = await GET(req);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json).toEqual({ error: "Internal Server Error" });

      consoleErrorSpy.mockRestore();
    });
  });
});
