import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { experiments, sessions, qrCodes, campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { computeExperimentMetrics } from "@/lib/experiments/engine";
import { ExperimentsView } from "@/components/experiments/experiments-view";
import { Skeleton } from "@/components/ui/skeleton";

function ExperimentsSkeleton() {
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
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
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
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card/40">
        <Skeleton className="h-9 w-full md:w-80 rounded-lg" />
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Experiments Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl bg-card/40" />
        ))}
      </div>
    </div>
  );
}

async function ExperimentsDataLoader() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch experiments, sessions, and dropdown options directly from DB
  const [userExperiments, userSessions, userQrCodes, userCampaigns] = await Promise.all([
    db.query.experiments.findMany({
      where: eq(experiments.userId, user.id),
      orderBy: [desc(experiments.createdAt)],
      with: {
        qrCode: true,
        campaign: true,
        variants: true,
        winnerVariant: true,
      },
    }),
    db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
    }),
    db.query.qrCodes.findMany({
      where: eq(qrCodes.userId, user.id),
      columns: { id: true, name: true, destinationUrl: true },
    }),
    db.query.campaigns.findMany({
      where: eq(campaigns.userId, user.id),
      columns: { id: true, name: true },
    }),
  ]);

  // 2. Compute enriched experiments and stats on the server
  const enrichedExperiments = userExperiments.map((exp) => {
    const relevantSessions = userSessions.filter(
      (s) => s.experimentId === exp.id
    );

    const stats = computeExperimentMetrics(
      exp,
      exp.variants || [],
      relevantSessions
    );

    return {
      id: exp.id,
      userId: exp.userId,
      qrCodeId: exp.qrCodeId,
      campaignId: exp.campaignId,
      name: exp.name,
      description: exp.description,
      status: exp.status as "draft" | "active" | "paused" | "completed",
      trafficAllocation: exp.trafficAllocation,
      winnerVariantId: exp.winnerVariantId,
      createdAt: exp.createdAt instanceof Date ? exp.createdAt.toISOString() : String(exp.createdAt),
      updatedAt: exp.updatedAt instanceof Date ? exp.updatedAt.toISOString() : String(exp.updatedAt),
      qrCode: exp.qrCode,
      campaign: exp.campaign,
      variants: stats.variants,
      winnerVariant: exp.winnerVariant,
      stats,
    };
  });

  const totalExperiments = enrichedExperiments.length;
  const activeExperiments = enrichedExperiments.filter(
    (e) => e.status === "active"
  ).length;
  const totalVariants = enrichedExperiments.reduce(
    (sum, e) => sum + (e.variants?.length || 0),
    0
  );
  const totalConversions = enrichedExperiments.reduce(
    (sum, e) => sum + (e.stats?.totalConversions || 0),
    0
  );
  const totalSessions = enrichedExperiments.reduce(
    (sum, e) => sum + (e.stats?.totalSessions || 0),
    0
  );
  const overallConversionRate =
    totalSessions > 0
      ? Math.round((totalConversions / totalSessions) * 1000) / 10
      : 0;
  const significantWinnersCount = enrichedExperiments.filter(
    (e) => e.stats?.hasSignificantWinner || Boolean(e.winnerVariantId)
  ).length;

  const metrics = {
    totalExperiments,
    activeExperiments,
    totalVariants,
    totalConversions,
    totalSessions,
    overallConversionRate,
    significantWinnersCount,
  };

  const qrOptions = userQrCodes.map((q) => ({
    id: q.id,
    name: q.name,
    destinationUrl: q.destinationUrl,
  }));
  const campaignOptions = userCampaigns.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // 3. Render Interactive Client Component with Server-Fetched Initial Data
  return (
    <ExperimentsView
      initialExperiments={enrichedExperiments}
      initialMetrics={metrics}
      qrOptions={qrOptions}
      campaignOptions={campaignOptions}
    />
  );
}

export default function ExperimentsDashboardPage() {
  return (
    <Suspense fallback={<ExperimentsSkeleton />}>
      <ExperimentsDataLoader />
    </Suspense>
  );
}
