import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview } from "@/lib/analytics/overview";
import { db } from "@/lib/db";
import { qrCodes, sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch analytics overview (90-day window) for this tenant
    const overviewData = await getAnalyticsOverview(user.id, { period: "90d" });

    // 2. Fetch user's real dynamic QR codes
    const userQrCodes = await db.query.qrCodes.findMany({
      where: eq(qrCodes.userId, user.id),
      orderBy: [desc(qrCodes.createdAt)],
    });

    // 3. Fetch count of recent sessions
    const recentSessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
      orderBy: [desc(sessions.startedAt)],
      limit: 10,
    });

    // 4. Map time series to chart data points with device ratios
    const deviceRatio = overviewData.breakdowns.devices.find((d) => d.name === "Mobile");
    const mobilePercent = deviceRatio ? deviceRatio.percentage / 100 : 0.6;

    const chartPoints = (overviewData.timeSeries || []).map((t) => {
      const totalScans = t.scans || 0;
      const mobileScans = Math.round(totalScans * mobilePercent);
      const desktopScans = totalScans - mobileScans;
      return {
        date: t.timestamp.split("T")[0],
        desktop: desktopScans,
        mobile: mobileScans,
      };
    });

    // 5. Compute real tenant KPI metrics
    const activeQrCount = userQrCodes.filter((q) => q.status === "active").length;
    const kpis = {
      totalScans: overviewData.kpis.totalScans,
      uniqueSessions: overviewData.kpis.totalSessions,
      activeQRCodes: activeQrCount,
      conversionRate: overviewData.kpis.conversionRate,
    };

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        kpis,
        chartPoints,
        qrCodes: userQrCodes,
        recentSessionsCount: recentSessions.length,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Dashboard overview API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load dashboard overview" },
      { status: 500 }
    );
  }
}
