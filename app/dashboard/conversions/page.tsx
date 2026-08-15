import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { conversionGoals, sessions, qrCodes, campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ConversionsView } from "@/components/conversions/conversions-view";
import { Skeleton } from "@/components/ui/skeleton";

function ConversionsSkeleton() {
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
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
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
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/60 bg-card/40">
        <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* Goals Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-56" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 bg-muted/20 rounded-xl space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="p-3 bg-muted/20 rounded-xl space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border/40">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function ConversionsDataLoader() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch conversion goals, sessions, and dropdown options directly from DB
  const [userGoals, userSessions, userQrCodes, userCampaigns] = await Promise.all([
    db.query.conversionGoals.findMany({
      where: eq(conversionGoals.userId, user.id),
      orderBy: [desc(conversionGoals.createdAt)],
      with: {
        qrCode: true,
        campaign: true,
      },
    }),
    db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
    }),
    db.query.qrCodes.findMany({
      where: eq(qrCodes.userId, user.id),
      columns: { id: true, name: true },
    }),
    db.query.campaigns.findMany({
      where: eq(campaigns.userId, user.id),
      columns: { id: true, name: true },
    }),
  ]);

  // 2. Compute enriched goals and metrics on the server
  const enrichedGoals = userGoals.map((goal) => {
    const relevantSessions = userSessions.filter((s) => {
      if (goal.qrCodeId && s.qrCodeId !== goal.qrCodeId) return false;
      if (goal.campaignId && s.campaignId !== goal.campaignId) return false;
      return true;
    });

    const totalSessions = relevantSessions.length;
    const convertedSessions = relevantSessions.filter(
      (s) => s.converted && s.conversionEvent === goal.name
    );
    const totalConversions = convertedSessions.length;
    const conversionRate =
      totalSessions > 0
        ? Math.round((totalConversions / totalSessions) * 1000) / 10
        : 0;

    const totalRevenue = (totalConversions * (goal.monetaryValue || 0)) / 100;

    return {
      id: goal.id,
      userId: goal.userId,
      qrCodeId: goal.qrCodeId,
      campaignId: goal.campaignId,
      name: goal.name,
      description: goal.description,
      eventType: goal.eventType,
      targetPattern: goal.targetPattern,
      monetaryValue: goal.monetaryValue,
      currency: goal.currency || "USD",
      isActive: goal.isActive,
      createdAt: goal.createdAt instanceof Date ? goal.createdAt.toISOString() : String(goal.createdAt),
      updatedAt: goal.updatedAt instanceof Date ? goal.updatedAt.toISOString() : String(goal.updatedAt),
      qrCodeName: goal.qrCode?.name,
      campaignName: goal.campaign?.name,
      totalConversions,
      totalRevenue,
      conversionRate,
      totalSessions,
    };
  });

  const totalConversions = enrichedGoals.reduce((sum, g) => sum + g.totalConversions, 0);
  const totalRevenue = enrichedGoals.reduce((sum, g) => sum + g.totalRevenue, 0);
  const activeGoalsCount = enrichedGoals.filter((g) => g.isActive).length;
  const overallConversionRate =
    enrichedGoals.length > 0
      ? Math.round(
          (enrichedGoals.reduce((sum, g) => sum + g.conversionRate, 0) /
            enrichedGoals.length) *
            10
        ) / 10
      : 0;

  const metrics = {
    totalConversions,
    totalRevenue,
    activeGoalsCount,
    overallConversionRate,
  };

  const qrOptions = userQrCodes.map((q) => ({ id: q.id, name: q.name }));
  const campaignOptions = userCampaigns.map((c) => ({ id: c.id, name: c.name }));

  // 3. Render Interactive Client Component with Server-Fetched Initial Data
  return (
    <ConversionsView
      initialGoals={enrichedGoals}
      initialMetrics={metrics}
      qrOptions={qrOptions}
      campaignOptions={campaignOptions}
    />
  );
}

export default function ConversionsDashboardPage() {
  return (
    <Suspense fallback={<ConversionsSkeleton />}>
      <ConversionsDataLoader />
    </Suspense>
  );
}
