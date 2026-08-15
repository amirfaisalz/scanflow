import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { JourneysView } from "@/components/journeys/journeys-view";
import type { JourneySession } from "@/components/journeys/journeys-table";

export default async function JourneysPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch recent sessions on the server
  const [sessionRecords, allUserSessions] = await Promise.all([
    db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
      orderBy: [desc(sessions.startedAt)],
      limit: 50,
      with: {
        qrCode: true,
      },
    }),
    db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
      columns: {
        id: true,
        converted: true,
        durationSeconds: true,
      },
    }),
  ]);

  const journeys: JourneySession[] = sessionRecords.map((s) => ({
    id: s.id,
    qrCodeId: s.qrCodeId,
    qrName: s.qrCode?.name || "Unknown QR",
    qrSlug: s.qrCode?.slug || "",
    deviceType: (s.deviceType || "other") as "mobile" | "desktop" | "tablet" | "bot" | "other",
    os: s.os,
    browser: s.browser,
    country: s.country,
    city: s.city,
    referrer: s.referrer,
    startedAt: s.startedAt instanceof Date ? s.startedAt.toISOString() : String(s.startedAt),
    endedAt: s.endedAt ? (s.endedAt instanceof Date ? s.endedAt.toISOString() : String(s.endedAt)) : undefined,
    durationSeconds: s.durationSeconds,
    eventsCount: s.eventsCount,
    converted: s.converted,
    conversionEvent: s.conversionEvent,
    ipHash: s.ipHash,
    userAgent: s.userAgent,
  }));

  const totalSessions = allUserSessions.length;
  const convertedCount = allUserSessions.filter((s) => s.converted).length;
  const conversionRate =
    totalSessions > 0 ? Math.round((convertedCount / totalSessions) * 1000) / 10 : 0;
  const totalDuration = allUserSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;

  const metrics = {
    totalSessions,
    convertedCount,
    conversionRate,
    avgDuration,
  };

  // 2. Render Interactive Client Component with Server-Fetched Initial Data
  return <JourneysView initialJourneys={journeys} initialMetrics={metrics} />;
}
