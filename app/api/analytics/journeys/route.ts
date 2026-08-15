import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const deviceFilter = searchParams.get("device");
    const qrCodeIdFilter = searchParams.get("qrCodeId");
    const convertedFilter = searchParams.get("converted");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const conditions = [eq(sessions.userId, user.id)];

    if (deviceFilter && deviceFilter !== "all") {
      conditions.push(eq(sessions.deviceType, deviceFilter.toLowerCase()));
    }

    if (qrCodeIdFilter && qrCodeIdFilter !== "all") {
      conditions.push(eq(sessions.qrCodeId, qrCodeIdFilter));
    }

    if (convertedFilter === "true") {
      conditions.push(eq(sessions.converted, true));
    } else if (convertedFilter === "false") {
      conditions.push(eq(sessions.converted, false));
    }

    const sessionRecords = await db.query.sessions.findMany({
      where: and(...conditions),
      orderBy: [desc(sessions.startedAt)],
      limit,
      with: {
        qrCode: true,
      },
    });

    const journeys = sessionRecords.map((s: any) => ({
      id: s.id,
      qrCodeId: s.qrCodeId,
      qrName: s.qrCode?.name || "Unknown QR",
      qrSlug: s.qrCode?.slug || "",
      deviceType: s.deviceType,
      os: s.os,
      browser: s.browser,
      country: s.country,
      city: s.city,
      referrer: s.referrer,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationSeconds: s.durationSeconds,
      eventsCount: s.eventsCount,
      converted: s.converted,
      conversionEvent: s.conversionEvent,
    }));

    // Calculate quick metrics for this tenant
    const totalSessions = journeys.length;
    const convertedCount = journeys.filter((j) => j.converted).length;
    const avgDuration =
      totalSessions > 0
        ? Math.round(journeys.reduce((sum, j) => sum + (j.durationSeconds || 0), 0) / totalSessions)
        : 0;
    const conversionRate =
      totalSessions > 0 ? Math.round((convertedCount / totalSessions) * 1000) / 10 : 0;

    return NextResponse.json({
      journeys,
      metrics: {
        totalSessions,
        convertedCount,
        conversionRate,
        avgDuration,
      },
    });
  } catch (error) {
    console.error("GET /api/analytics/journeys error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
