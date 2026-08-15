import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { experiments, sessions, qrCodes, campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { computeExperimentMetrics } from "@/lib/experiments/engine";
import { ExperimentsView } from "@/components/experiments/experiments-view";

export default async function ExperimentsDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch experiments, sessions, and dropdown options on the server
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
