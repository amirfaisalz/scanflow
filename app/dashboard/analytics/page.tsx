import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview } from "@/lib/analytics/overview";
import { db } from "@/lib/db";
import { qrCodes, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { Skeleton } from "@/components/ui/skeleton";

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Breadcrumb Navigation Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-20" />
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
      </div>

      {/* Dimensional Filter Controls Toolbar Skeleton */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/60 bg-card/40">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* KPI 4 Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            <div className="my-3 space-y-1">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Trend Chart Skeleton */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-60" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>

      {/* Breakdowns Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2 pt-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between items-center py-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function AnalyticsDataLoader() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch initial overview (24h) directly on the server
  const initialOverview = await getAnalyticsOverview(user.id, { period: "24h" });

  // 2. Fetch dropdown filter options on the server
  const [userQrCodes, userCampaigns] = await Promise.all([
    db.query.qrCodes.findMany({
      where: eq(qrCodes.userId, user.id),
      columns: { id: true, name: true },
    }),
    db.query.campaigns.findMany({
      where: eq(campaigns.userId, user.id),
      columns: { id: true, name: true },
    }),
  ]);

  const qrOptions = userQrCodes.map((q) => ({ id: q.id, name: q.name }));
  const campaignOptions = userCampaigns.map((c) => ({ id: c.id, name: c.name }));

  // 3. Render Interactive Client Component with Server-Fetched Initial Data
  return (
    <AnalyticsView
      initialData={initialOverview}
      qrOptions={qrOptions}
      campaignOptions={campaignOptions}
    />
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsDataLoader />
    </Suspense>
  );
}
