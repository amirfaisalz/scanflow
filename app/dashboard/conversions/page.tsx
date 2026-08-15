import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { conversionGoals, sessions, qrCodes, campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ConversionsView } from "@/components/conversions/conversions-view";

export default async function ConversionsDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch conversion goals, sessions, and dropdown options on the server
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
