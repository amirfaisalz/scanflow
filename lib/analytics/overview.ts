import { db } from "@/lib/db";
import { sessions, qrCodes, campaigns } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export interface AnalyticsFilterOptions {
  period?: "24h" | "7d" | "30d" | "90d" | "all";
  qrCodeId?: string;
  campaignId?: string;
  device?: string;
}

export interface AnalyticsOverviewData {
  kpis: {
    totalScans: number;
    uniqueVisitors: number;
    totalSessions: number;
    conversions: number;
    conversionRate: number;
    avgDurationSeconds: number;
    bouncedSessions: number;
    bounceRate: number;
  };
  timeSeries: Array<{
    timestamp: string;
    label: string;
    scans: number;
    sessions: number;
    conversions: number;
  }>;
  breakdowns: {
    devices: Array<{ name: string; value: number; percentage: number }>;
    operatingSystems: Array<{ name: string; value: number; percentage: number }>;
    browsers: Array<{ name: string; value: number; percentage: number }>;
    countries: Array<{ code: string; name: string; scans: number; percentage: number }>;
    cities: Array<{ name: string; country: string; scans: number; percentage: number }>;
    hourlyDistribution: Array<{ hour: number; label: string; count: number }>;
  };
  topPerformers: {
    qrCodes: Array<{
      id: string;
      name: string;
      slug: string;
      scans: number;
      sessions: number;
      conversions: number;
      conversionRate: number;
    }>;
    campaigns: Array<{
      id: string;
      name: string;
      scans: number;
      sessions: number;
      conversions: number;
      conversionRate: number;
    }>;
  };
}

/**
 * Helper to resolve country ISO Alpha-2 code to display name.
 */
function getCountryName(code: string): string {
  if (!code || code === "Unknown") return "Unknown";
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

/**
 * Helper to format device type strings for display.
 */
function formatDeviceName(deviceType: string): string {
  if (!deviceType) return "Other";
  const normalized = deviceType.toLowerCase();
  if (normalized === "mobile") return "Mobile";
  if (normalized === "desktop") return "Desktop";
  if (normalized === "tablet") return "Tablet";
  if (normalized === "bot") return "Bot";
  return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
}

/**
 * Generate time series bucket definitions based on requested period.
 */
function generateTimeBuckets(period: AnalyticsFilterOptions["period"] = "24h", earliestDate?: Date) {
  const now = new Date();
  const buckets: Array<{
    timestamp: string;
    label: string;
    matches: (d: Date) => boolean;
  }> = [];

  if (period === "24h") {
    for (let i = 23; i >= 0; i--) {
      const bucketDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      bucketDate.setMinutes(0, 0, 0);
      const targetYear = bucketDate.getFullYear();
      const targetMonth = bucketDate.getMonth();
      const targetDay = bucketDate.getDate();
      const targetHour = bucketDate.getHours();

      buckets.push({
        timestamp: bucketDate.toISOString(),
        label: `${String(targetHour).padStart(2, "0")}:00`,
        matches: (d: Date) =>
          d.getFullYear() === targetYear &&
          d.getMonth() === targetMonth &&
          d.getDate() === targetDay &&
          d.getHours() === targetHour,
      });
    }
  } else if (period === "7d" || period === "30d" || period === "90d") {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const bucketDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
      const targetYear = bucketDate.getFullYear();
      const targetMonth = bucketDate.getMonth();
      const targetDay = bucketDate.getDate();

      buckets.push({
        timestamp: bucketDate.toISOString().split("T")[0],
        label: bucketDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        matches: (d: Date) =>
          d.getFullYear() === targetYear &&
          d.getMonth() === targetMonth &&
          d.getDate() === targetDay,
      });
    }
  } else {
    // "all" period
    const start = earliestDate ? new Date(earliestDate) : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const dayDiff = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));

    if (dayDiff <= 31) {
      for (let i = dayDiff - 1; i >= 0; i--) {
        const bucketDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0);
        const targetYear = bucketDate.getFullYear();
        const targetMonth = bucketDate.getMonth();
        const targetDay = bucketDate.getDate();

        buckets.push({
          timestamp: bucketDate.toISOString().split("T")[0],
          label: bucketDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          matches: (d: Date) =>
            d.getFullYear() === targetYear &&
            d.getMonth() === targetMonth &&
            d.getDate() === targetDay,
        });
      }
    } else {
      // Monthly buckets
      let cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);

      while (cur <= end) {
        const targetYear = cur.getFullYear();
        const targetMonth = cur.getMonth();
        const label = cur.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        const timestamp = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;

        buckets.push({
          timestamp,
          label,
          matches: (d: Date) => d.getFullYear() === targetYear && d.getMonth() === targetMonth,
        });

        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      }
    }
  }

  return buckets;
}

/**
 * Aggregates analytics overview metrics for a tenant with optional filtering.
 */
export async function getAnalyticsOverview(
  userId: string,
  options: AnalyticsFilterOptions = {}
): Promise<AnalyticsOverviewData> {
  const { period = "24h", qrCodeId, campaignId, device } = options;

  // 1. Build query filters with strict tenant isolation
  const sessionConditions = [eq(sessions.userId, userId)];

  const now = Date.now();
  if (period === "24h") {
    sessionConditions.push(gte(sessions.startedAt, new Date(now - 24 * 60 * 60 * 1000)));
  } else if (period === "7d") {
    sessionConditions.push(gte(sessions.startedAt, new Date(now - 7 * 24 * 60 * 60 * 1000)));
  } else if (period === "30d") {
    sessionConditions.push(gte(sessions.startedAt, new Date(now - 30 * 24 * 60 * 60 * 1000)));
  } else if (period === "90d") {
    sessionConditions.push(gte(sessions.startedAt, new Date(now - 90 * 24 * 60 * 60 * 1000)));
  }

  if (qrCodeId && qrCodeId !== "all") {
    sessionConditions.push(eq(sessions.qrCodeId, qrCodeId));
  }

  if (campaignId && campaignId !== "all") {
    sessionConditions.push(eq(sessions.campaignId, campaignId));
  }

  if (device && device !== "all") {
    sessionConditions.push(eq(sessions.deviceType, device.toLowerCase()));
  }

  // 2. Fetch Sessions, QR Codes, and Campaigns in parallel
  const [sessionList, userQrCodes, userCampaigns] = await Promise.all([
    db.query.sessions.findMany({
      where: and(...sessionConditions),
      orderBy: [desc(sessions.startedAt)],
      with: {
        qrCode: true,
      },
    }),
    db.query.qrCodes.findMany({
      where: eq(qrCodes.userId, userId),
      orderBy: [desc(qrCodes.scanCount)],
    }),
    db.query.campaigns.findMany({
      where: eq(campaigns.userId, userId),
      orderBy: [desc(campaigns.createdAt)],
    }),
  ]);

  const totalSessions = sessionList.length;

  // 3. Compute KPI metrics
  let totalScans = 0;
  for (const s of sessionList) {
    const sEvents = (s as unknown as { events?: Array<{ eventType?: string }> }).events;
    const scanEvts = sEvents?.filter((e) => e.eventType === "QR_SCAN").length;
    totalScans += scanEvts && scanEvts > 0 ? scanEvts : 1;
  }

  const uniqueVisitors = new Set(
    sessionList.map((s) => s.ipHash).filter((h): h is string => Boolean(h))
  ).size;

  const conversions = sessionList.filter((s) => Boolean(s.converted)).length;
  const conversionRate =
    totalSessions > 0 ? Math.round((conversions / totalSessions) * 1000) / 10 : 0;

  const totalDuration = sessionList.reduce(
    (sum: number, s) => sum + (s.durationSeconds || 0),
    0
  );
  const avgDurationSeconds =
    totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

  const bouncedSessions = sessionList.filter(
    (s) => (s.eventsCount || 1) <= 1
  ).length;
  const bounceRate =
    totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 1000) / 10 : 0;

  // 4. Generate Time Series
  const earliestDate = sessionList.length > 0
    ? new Date(Math.min(...sessionList.map((s) => new Date(s.startedAt).getTime())))
    : undefined;

  const buckets = generateTimeBuckets(period, earliestDate);

  const timeSeries = buckets.map((bucket) => {
    const matchingSessions = sessionList.filter((s) =>
      bucket.matches(new Date(s.startedAt))
    );

    let scans = 0;
    for (const s of matchingSessions) {
      const sEvents = (s as unknown as { events?: Array<{ eventType?: string }> }).events;
      const scanEvts = sEvents?.filter((e) => e.eventType === "QR_SCAN").length;
      scans += scanEvts && scanEvts > 0 ? scanEvts : 1;
    }

    const sessCount = matchingSessions.length;
    const convCount = matchingSessions.filter((s) => Boolean(s.converted)).length;

    return {
      timestamp: bucket.timestamp,
      label: bucket.label,
      scans,
      sessions: sessCount,
      conversions: convCount,
    };
  });

  // 5. Dimensional Breakdowns
  // Device Breakdown
  const deviceCounts: Record<string, number> = {};
  for (const s of sessionList) {
    const name = formatDeviceName(s.deviceType);
    deviceCounts[name] = (deviceCounts[name] || 0) + 1;
  }
  const devices = Object.entries(deviceCounts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSessions > 0 ? Math.round((value / totalSessions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // OS Breakdown
  const osCounts: Record<string, number> = {};
  for (const s of sessionList) {
    const name = s.os || "Other";
    osCounts[name] = (osCounts[name] || 0) + 1;
  }
  const operatingSystems = Object.entries(osCounts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSessions > 0 ? Math.round((value / totalSessions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Browser Breakdown
  const browserCounts: Record<string, number> = {};
  for (const s of sessionList) {
    const name = s.browser || "Other";
    browserCounts[name] = (browserCounts[name] || 0) + 1;
  }
  const browsers = Object.entries(browserCounts)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSessions > 0 ? Math.round((value / totalSessions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Country Breakdown
  const countryCounts: Record<string, number> = {};
  for (const s of sessionList) {
    const code = s.country || "Unknown";
    countryCounts[code] = (countryCounts[code] || 0) + 1;
  }
  const countries = Object.entries(countryCounts)
    .map(([code, scans]) => ({
      code,
      name: getCountryName(code),
      scans,
      percentage: totalSessions > 0 ? Math.round((scans / totalSessions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.scans - a.scans);

  // City Breakdown
  const cityCounts: Record<string, { country: string; scans: number }> = {};
  for (const s of sessionList) {
    if (s.city) {
      const key = `${s.city}|${s.country || "Unknown"}`;
      if (!cityCounts[key]) {
        cityCounts[key] = { country: s.country || "Unknown", scans: 0 };
      }
      cityCounts[key].scans += 1;
    }
  }
  const cities = Object.entries(cityCounts)
    .map(([key, data]) => {
      const cityName = key.split("|")[0];
      return {
        name: cityName,
        country: data.country,
        scans: data.scans,
        percentage: totalSessions > 0 ? Math.round((data.scans / totalSessions) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.scans - a.scans);

  // Hourly Distribution Breakdown (0 - 23)
  const hourCounts: number[] = new Array(24).fill(0);
  for (const s of sessionList) {
    const h = new Date(s.startedAt).getHours();
    if (h >= 0 && h < 24) {
      hourCounts[h] += 1;
    }
  }
  const hourlyDistribution = hourCounts.map((count, hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    count,
  }));

  // 6. Top Performers (QR Codes & Campaigns)
  const qrPerformanceMap = new Map<string, {
    id: string;
    name: string;
    slug: string;
    scans: number;
    sessions: number;
    conversions: number;
  }>();

  // Populate from known user QR codes
  for (const qr of userQrCodes) {
    qrPerformanceMap.set(qr.id, {
      id: qr.id,
      name: qr.name,
      slug: qr.slug,
      scans: 0,
      sessions: 0,
      conversions: 0,
    });
  }

  // Aggregate stats from matching sessions
  for (const s of sessionList) {
    let entry = qrPerformanceMap.get(s.qrCodeId);
    if (!entry) {
      entry = {
        id: s.qrCodeId,
        name: s.qrCode?.name || "Unknown QR",
        slug: s.qrCode?.slug || "",
        scans: 0,
        sessions: 0,
        conversions: 0,
      };
      qrPerformanceMap.set(s.qrCodeId, entry);
    }
    const sEvents = (s as unknown as { events?: Array<{ eventType?: string }> }).events;
    const scanEvts = sEvents?.filter((e) => e.eventType === "QR_SCAN").length;
    entry.scans += scanEvts && scanEvts > 0 ? scanEvts : 1;
    entry.sessions += 1;
    if (s.converted) {
      entry.conversions += 1;
    }
  }

  const topQrCodes = Array.from(qrPerformanceMap.values())
    .filter((q) => (userQrCodes.length === 0 ? true : q.sessions > 0 || userQrCodes.some((u) => u.id === q.id)))
    .map((q) => ({
      ...q,
      conversionRate: q.sessions > 0 ? Math.round((q.conversions / q.sessions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.scans - a.scans || b.sessions - a.sessions);

  // Campaigns Top Performers
  const campaignPerformanceMap = new Map<string, {
    id: string;
    name: string;
    scans: number;
    sessions: number;
    conversions: number;
  }>();

  for (const camp of userCampaigns) {
    campaignPerformanceMap.set(camp.id, {
      id: camp.id,
      name: camp.name,
      scans: 0,
      sessions: 0,
      conversions: 0,
    });
  }

  for (const s of sessionList) {
    if (!s.campaignId) continue;
    let entry = campaignPerformanceMap.get(s.campaignId);
    if (!entry) {
      entry = {
        id: s.campaignId,
        name: "Unknown Campaign",
        scans: 0,
        sessions: 0,
        conversions: 0,
      };
      campaignPerformanceMap.set(s.campaignId, entry);
    }
    const sEvents = (s as unknown as { events?: Array<{ eventType?: string }> }).events;
    const scanEvts = sEvents?.filter((e) => e.eventType === "QR_SCAN").length;
    entry.scans += scanEvts && scanEvts > 0 ? scanEvts : 1;
    entry.sessions += 1;
    if (s.converted) {
      entry.conversions += 1;
    }
  }

  const topCampaigns = Array.from(campaignPerformanceMap.values())
    .filter((c) => (userCampaigns.length === 0 ? true : c.sessions > 0 || userCampaigns.some((u) => u.id === c.id)))
    .map((c) => ({
      ...c,
      conversionRate: c.sessions > 0 ? Math.round((c.conversions / c.sessions) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.scans - a.scans || b.sessions - a.sessions);

  return {
    kpis: {
      totalScans,
      uniqueVisitors,
      totalSessions,
      conversions,
      conversionRate,
      avgDurationSeconds,
      bouncedSessions,
      bounceRate,
    },
    timeSeries,
    breakdowns: {
      devices,
      operatingSystems,
      browsers,
      countries,
      cities,
      hourlyDistribution,
    },
    topPerformers: {
      qrCodes: topQrCodes,
      campaigns: topCampaigns,
    },
  };
}
