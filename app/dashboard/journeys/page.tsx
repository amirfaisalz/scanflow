import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { JourneysView } from "@/components/journeys/journeys-view";
import type { JourneySession } from "@/components/journeys/journeys-table";
import { Skeleton } from "@/components/ui/skeleton";

function JourneysSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Breadcrumb Navigation Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/40">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            <div className="my-3 space-y-1">
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/60 bg-card/40">
        <Skeleton className="h-9 w-full sm:w-80 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Journeys Table Skeleton */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
        <Skeleton className="h-8 w-full rounded-lg" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

async function JourneysDataLoader() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch recent sessions directly from DB on the server
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

export default function JourneysPage() {
  return (
    <Suspense fallback={<JourneysSkeleton />}>
      <JourneysDataLoader />
    </Suspense>
  );
}
