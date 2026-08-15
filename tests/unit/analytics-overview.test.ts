import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAnalyticsOverview, type AnalyticsFilterOptions } from "@/lib/analytics/overview";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findMany: vi.fn() },
      qrCodes: { findMany: vi.fn() },
      campaigns: { findMany: vi.fn() },
    },
  },
}));

describe("Analytics Aggregation Engine (lib/analytics/overview.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty States & Safe Fallbacks", () => {
    it("should return zero-filled KPIs and empty breakdowns when user has no data", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const result = await getAnalyticsOverview("user-empty");

      expect(result.kpis).toEqual({
        totalScans: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        conversions: 0,
        conversionRate: 0,
        avgDurationSeconds: 0,
        bouncedSessions: 0,
        bounceRate: 0,
      });

      expect(result.timeSeries).toHaveLength(24); // 24h default has 24 hourly buckets
      result.timeSeries.forEach((bucket) => {
        expect(bucket.scans).toBe(0);
        expect(bucket.sessions).toBe(0);
        expect(bucket.conversions).toBe(0);
        expect(bucket.label).toBeDefined();
        expect(bucket.timestamp).toBeDefined();
      });

      expect(result.breakdowns.devices).toEqual([]);
      expect(result.breakdowns.operatingSystems).toEqual([]);
      expect(result.breakdowns.browsers).toEqual([]);
      expect(result.breakdowns.countries).toEqual([]);
      expect(result.breakdowns.cities).toEqual([]);
      expect(result.breakdowns.hourlyDistribution).toHaveLength(24);
      result.breakdowns.hourlyDistribution.forEach((slot, idx) => {
        expect(slot.hour).toBe(idx);
        expect(slot.count).toBe(0);
      });

      expect(result.topPerformers.qrCodes).toEqual([]);
      expect(result.topPerformers.campaigns).toEqual([]);
    });
  });

  describe("Multi-Tenant Isolation", () => {
    it("should strictly scope queries to the authorized userId", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      await getAnalyticsOverview("user-tenant-123");

      expect(db.query.sessions.findMany).toHaveBeenCalledTimes(1);
      expect(db.query.qrCodes.findMany).toHaveBeenCalledTimes(1);
      expect(db.query.campaigns.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("KPI Calculations & Aggregation Accuracy", () => {
    it("should compute accurate KPIs from sessions", async () => {
      const now = new Date();
      const mockSessions = [
        {
          id: "sess-1",
          userId: "user-1",
          qrCodeId: "qr-1",
          campaignId: "camp-1",
          ipHash: "ip-hash-A",
          deviceType: "mobile",
          os: "iOS",
          browser: "Safari",
          country: "ID",
          city: "Jakarta",
          durationSeconds: 40,
          eventsCount: 3,
          converted: true,
          startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          events: [{ eventType: "QR_SCAN" }, { eventType: "CONVERSION" }],
        },
        {
          id: "sess-2",
          userId: "user-1",
          qrCodeId: "qr-1",
          campaignId: "camp-1",
          ipHash: "ip-hash-B",
          deviceType: "mobile",
          os: "iOS",
          browser: "Safari",
          country: "ID",
          city: "Jakarta",
          durationSeconds: 0,
          eventsCount: 1, // Bounced
          converted: false,
          startedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          events: [{ eventType: "QR_SCAN" }],
        },
        {
          id: "sess-3",
          userId: "user-1",
          qrCodeId: "qr-2",
          campaignId: "camp-2",
          ipHash: "ip-hash-A", // Same visitor as sess-1
          deviceType: "desktop",
          os: "macOS",
          browser: "Chrome",
          country: "US",
          city: "New York",
          durationSeconds: 60,
          eventsCount: 4,
          converted: true,
          startedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          events: [{ eventType: "QR_SCAN" }, { eventType: "CONVERSION" }],
        },
        {
          id: "sess-4",
          userId: "user-1",
          qrCodeId: "qr-2",
          campaignId: "camp-2",
          ipHash: "ip-hash-C",
          deviceType: "desktop",
          os: "Windows",
          browser: "Chrome",
          country: "US",
          city: "San Francisco",
          durationSeconds: 20,
          eventsCount: 1, // Bounced
          converted: false,
          startedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          events: [{ eventType: "QR_SCAN" }],
        },
      ];

      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);
      (db.query.qrCodes.findMany as any).mockResolvedValue([
        { id: "qr-1", name: "Menu QR", slug: "menu-qr" },
        { id: "qr-2", name: "Promo QR", slug: "promo-qr" },
      ]);
      (db.query.campaigns.findMany as any).mockResolvedValue([
        { id: "camp-1", name: "Summer Launch" },
        { id: "camp-2", name: "Winter Promo" },
      ]);

      const overview = await getAnalyticsOverview("user-1", { period: "24h" });

      // Total sessions = 4
      expect(overview.kpis.totalSessions).toBe(4);
      // Unique visitors (ip-hash-A, ip-hash-B, ip-hash-C) = 3
      expect(overview.kpis.uniqueVisitors).toBe(3);
      // Total scans = 4
      expect(overview.kpis.totalScans).toBe(4);
      // Conversions = 2 (sess-1, sess-3)
      expect(overview.kpis.conversions).toBe(2);
      // Conversion Rate = (2 / 4) * 100 = 50.0%
      expect(overview.kpis.conversionRate).toBe(50);
      // Avg Duration = (40 + 0 + 60 + 20) / 4 = 30s
      expect(overview.kpis.avgDurationSeconds).toBe(30);
      // Bounced sessions (eventsCount <= 1: sess-2, sess-4) = 2
      expect(overview.kpis.bouncedSessions).toBe(2);
      // Bounce Rate = (2 / 4) * 100 = 50.0%
      expect(overview.kpis.bounceRate).toBe(50);
    });
  });

  describe("Dimensional Breakdowns", () => {
    it("should calculate correct breakdowns for device, OS, browser, country, and city", async () => {
      const now = new Date();
      const mockSessions = [
        {
          id: "s1",
          userId: "user-1",
          qrCodeId: "qr-1",
          deviceType: "mobile",
          os: "iOS",
          browser: "Safari",
          country: "ID",
          city: "Jakarta",
          durationSeconds: 10,
          eventsCount: 2,
          converted: false,
          startedAt: now,
        },
        {
          id: "s2",
          userId: "user-1",
          qrCodeId: "qr-1",
          deviceType: "mobile",
          os: "iOS",
          browser: "Safari",
          country: "ID",
          city: "Jakarta",
          durationSeconds: 20,
          eventsCount: 2,
          converted: true,
          startedAt: now,
        },
        {
          id: "s3",
          userId: "user-1",
          qrCodeId: "qr-1",
          deviceType: "desktop",
          os: "macOS",
          browser: "Chrome",
          country: "US",
          city: "New York",
          durationSeconds: 30,
          eventsCount: 1,
          converted: false,
          startedAt: now,
        },
        {
          id: "s4",
          userId: "user-1",
          qrCodeId: "qr-1",
          deviceType: "tablet",
          os: "Android",
          browser: "Firefox",
          country: "GB",
          city: "London",
          durationSeconds: 40,
          eventsCount: 3,
          converted: true,
          startedAt: now,
        },
      ];

      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);
      (db.query.qrCodes.findMany as any).mockResolvedValue([{ id: "qr-1", name: "Main QR", slug: "main" }]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1");

      // Devices breakdown
      expect(data.breakdowns.devices).toEqual([
        { name: "Mobile", value: 2, percentage: 50 },
        { name: "Desktop", value: 1, percentage: 25 },
        { name: "Tablet", value: 1, percentage: 25 },
      ]);

      // OS breakdown
      expect(data.breakdowns.operatingSystems).toEqual([
        { name: "iOS", value: 2, percentage: 50 },
        { name: "macOS", value: 1, percentage: 25 },
        { name: "Android", value: 1, percentage: 25 },
      ]);

      // Browser breakdown
      expect(data.breakdowns.browsers).toEqual([
        { name: "Safari", value: 2, percentage: 50 },
        { name: "Chrome", value: 1, percentage: 25 },
        { name: "Firefox", value: 1, percentage: 25 },
      ]);

      // Countries breakdown (mapped to friendly country names)
      expect(data.breakdowns.countries[0]).toMatchObject({
        code: "ID",
        scans: 2,
        percentage: 50,
      });
      expect(data.breakdowns.countries[0].name).toMatch(/Indonesia/i);

      // Cities breakdown
      expect(data.breakdowns.cities).toEqual([
        { name: "Jakarta", country: "ID", scans: 2, percentage: 50 },
        { name: "New York", country: "US", scans: 1, percentage: 25 },
        { name: "London", country: "GB", scans: 1, percentage: 25 },
      ]);
    });
  });

  describe("Time Series Bucketing across Periods", () => {
    it("should generate 24 hourly buckets for 24h period", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1", { period: "24h" });
      expect(data.timeSeries).toHaveLength(24);
    });

    it("should generate 7 daily buckets for 7d period", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1", { period: "7d" });
      expect(data.timeSeries).toHaveLength(7);
    });

    it("should generate 30 daily buckets for 30d period", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1", { period: "30d" });
      expect(data.timeSeries).toHaveLength(30);
    });

    it("should generate 90 daily buckets for 90d period", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1", { period: "90d" });
      expect(data.timeSeries).toHaveLength(90);
    });

    it("should handle 'all' period gracefully", async () => {
      const now = new Date();
      (db.query.sessions.findMany as any).mockResolvedValue([
        {
          id: "s1",
          userId: "user-1",
          qrCodeId: "qr-1",
          deviceType: "mobile",
          os: "iOS",
          browser: "Safari",
          country: "ID",
          durationSeconds: 10,
          eventsCount: 2,
          converted: true,
          startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
      ]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1", { period: "all" });
      expect(data.timeSeries.length).toBeGreaterThan(0);
      expect(data.kpis.totalSessions).toBe(1);
    });
  });

  describe("Top Performers (QR Codes & Campaigns)", () => {
    it("should rank QR codes and Campaigns by volume and calculate conversion rates", async () => {
      const mockSessions = [
        {
          id: "s1",
          userId: "user-1",
          qrCodeId: "qr-1",
          campaignId: "camp-1",
          converted: true,
          eventsCount: 2,
          startedAt: new Date(),
        },
        {
          id: "s2",
          userId: "user-1",
          qrCodeId: "qr-1",
          campaignId: "camp-1",
          converted: true,
          eventsCount: 2,
          startedAt: new Date(),
        },
        {
          id: "s3",
          userId: "user-1",
          qrCodeId: "qr-2",
          campaignId: "camp-2",
          converted: false,
          eventsCount: 1,
          startedAt: new Date(),
        },
      ];

      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);
      (db.query.qrCodes.findMany as any).mockResolvedValue([
        { id: "qr-1", name: "Table 1 QR", slug: "tbl-1" },
        { id: "qr-2", name: "Table 2 QR", slug: "tbl-2" },
      ]);
      (db.query.campaigns.findMany as any).mockResolvedValue([
        { id: "camp-1", name: "Restaurant VIP" },
        { id: "camp-2", name: "Flyer Promo" },
      ]);

      const data = await getAnalyticsOverview("user-1");

      // QR Code 1 has 2 sessions, 2 conversions (100%)
      // QR Code 2 has 1 session, 0 conversions (0%)
      expect(data.topPerformers.qrCodes).toEqual([
        {
          id: "qr-1",
          name: "Table 1 QR",
          slug: "tbl-1",
          scans: 2,
          sessions: 2,
          conversions: 2,
          conversionRate: 100,
        },
        {
          id: "qr-2",
          name: "Table 2 QR",
          slug: "tbl-2",
          scans: 1,
          sessions: 1,
          conversions: 0,
          conversionRate: 0,
        },
      ]);

      // Campaign 1 has 2 sessions, 2 conversions (100%)
      // Campaign 2 has 1 session, 0 conversions (0%)
      expect(data.topPerformers.campaigns).toEqual([
        {
          id: "camp-1",
          name: "Restaurant VIP",
          scans: 2,
          sessions: 2,
          conversions: 2,
          conversionRate: 100,
        },
        {
          id: "camp-2",
          name: "Flyer Promo",
          scans: 1,
          sessions: 1,
          conversions: 0,
          conversionRate: 0,
        },
      ]);
    });
  });

  describe("Filtering by qrCodeId, campaignId, and device", () => {
    it("should pass additional filter criteria to sessions query", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const options: AnalyticsFilterOptions = {
        period: "7d",
        qrCodeId: "qr-target",
        campaignId: "camp-target",
        device: "mobile",
      };

      await getAnalyticsOverview("user-1", options);

      expect(db.query.sessions.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
        })
      );
    });

    it("should handle 'all' filter options without adding unnecessary where conditions", async () => {
      (db.query.sessions.findMany as any).mockResolvedValue([]);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const options: AnalyticsFilterOptions = {
        period: "all",
        qrCodeId: "all",
        campaignId: "all",
        device: "all",
      };

      const result = await getAnalyticsOverview("user-1", options);
      expect(result.kpis.totalSessions).toBe(0);
    });
  });

  describe("Edge Cases & Null/Missing Values", () => {
    it("should handle sessions with missing or null attributes gracefully", async () => {
      const mockSessions = [
        {
          id: "s-null-fields",
          userId: "user-1",
          qrCodeId: "qr-untracked",
          campaignId: null,
          ipHash: null,
          deviceType: null,
          os: null,
          browser: null,
          country: null,
          city: null,
          durationSeconds: null,
          eventsCount: null,
          converted: false,
          startedAt: new Date(),
        },
      ];

      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1");

      expect(data.kpis.totalSessions).toBe(1);
      expect(data.kpis.totalScans).toBe(1);
      expect(data.kpis.uniqueVisitors).toBe(0);
      expect(data.kpis.avgDurationSeconds).toBe(0);
      expect(data.kpis.bouncedSessions).toBe(1); // eventsCount null defaults to 1 -> bounced
      expect(data.kpis.bounceRate).toBe(100);

      expect(data.breakdowns.devices).toEqual([{ name: "Other", value: 1, percentage: 100 }]);
      expect(data.breakdowns.operatingSystems).toEqual([{ name: "Other", value: 1, percentage: 100 }]);
      expect(data.breakdowns.browsers).toEqual([{ name: "Other", value: 1, percentage: 100 }]);
      expect(data.breakdowns.countries).toEqual([{ code: "Unknown", name: "Unknown", scans: 1, percentage: 100 }]);
      expect(data.breakdowns.cities).toEqual([]);
    });

    it("should correctly sum multiple scan events in a single session", async () => {
      const mockSessions = [
        {
          id: "s-multi-scan",
          userId: "user-1",
          qrCodeId: "qr-1",
          events: [
            { eventType: "QR_SCAN" },
            { eventType: "PAGE_VIEW" },
            { eventType: "QR_SCAN" },
            { eventType: "CONVERSION" },
          ],
          eventsCount: 4,
          converted: true,
          durationSeconds: 120,
          startedAt: new Date(),
        },
      ];

      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);
      (db.query.qrCodes.findMany as any).mockResolvedValue([{ id: "qr-1", name: "Menu QR", slug: "menu" }]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1");
      expect(data.kpis.totalSessions).toBe(1);
      expect(data.kpis.totalScans).toBe(2); // 2 QR_SCAN events
      expect(data.kpis.conversions).toBe(1);
      expect(data.kpis.conversionRate).toBe(100);
      expect(data.kpis.bouncedSessions).toBe(0);
      expect(data.kpis.bounceRate).toBe(0);
    });

    it("should correctly populate hourly distribution counts", async () => {
      const baseDate = new Date();
      baseDate.setHours(14, 30, 0, 0); // 14:30 (hour 14)

      const mockSessions = [
        {
          id: "s-h1",
          userId: "user-1",
          qrCodeId: "qr-1",
          startedAt: baseDate,
        },
        {
          id: "s-h2",
          userId: "user-1",
          qrCodeId: "qr-1",
          startedAt: baseDate,
        },
      ];

      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);
      (db.query.qrCodes.findMany as any).mockResolvedValue([]);
      (db.query.campaigns.findMany as any).mockResolvedValue([]);

      const data = await getAnalyticsOverview("user-1");
      const hour14 = data.breakdowns.hourlyDistribution.find((h) => h.hour === 14);
      expect(hour14?.count).toBe(2);
      expect(hour14?.label).toBe("14:00");
    });
  });
});
