import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CampaignsView } from "@/components/campaigns/campaigns-view";
import { Skeleton } from "@/components/ui/skeleton";

function CampaignsSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/40">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
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
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/60 bg-card/40">
        <Skeleton className="h-9 w-full sm:w-80 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Campaign Cards List Skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-72" />
              </div>
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/40">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function CampaignsDataLoader() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch campaigns with relations directly from DB on the server (no seed fallback)
  const userCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.userId, user.id),
    orderBy: [desc(campaigns.createdAt)],
    with: {
      qrCodes: true,
      sessions: true,
    },
  });

  // 2. Compute enriched campaign metrics on the server
  const enrichedCampaigns = userCampaigns.map((camp) => {
    const qrList = camp.qrCodes || [];
    const sessionList = camp.sessions || [];

    const totalScans = qrList.reduce((sum, q) => sum + (q.scanCount || 0), 0);
    const totalSessions = sessionList.length;
    const conversions = sessionList.filter((s) => s.converted).length;
    const conversionRate =
      totalSessions > 0 ? Math.round((conversions / totalSessions) * 1000) / 10 : 0;

    return {
      id: camp.id,
      name: camp.name,
      description: camp.description,
      status: camp.status as "active" | "paused" | "archived",
      createdAt: camp.createdAt instanceof Date ? camp.createdAt.toISOString() : String(camp.createdAt),
      updatedAt: camp.updatedAt instanceof Date ? camp.updatedAt.toISOString() : String(camp.updatedAt),
      qrCodesCount: qrList.length,
      totalScans,
      totalSessions,
      conversions,
      conversionRate,
    };
  });

  // 3. Render Interactive Client Component with Server-Fetched DB Data
  return <CampaignsView initialCampaigns={enrichedCampaigns} />;
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsSkeleton />}>
      <CampaignsDataLoader />
    </Suspense>
  );
}
