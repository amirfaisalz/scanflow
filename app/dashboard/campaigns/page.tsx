import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureUserDemoData } from "@/lib/db/seed-user";
import { CampaignsView } from "@/components/campaigns/campaigns-view";

export default async function CampaignsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch campaigns with relations directly on the server
  let userCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.userId, user.id),
    orderBy: [desc(campaigns.createdAt)],
    with: {
      qrCodes: true,
      sessions: true,
    },
  });

  if (userCampaigns.length === 0) {
    await ensureUserDemoData(user.id, user.email);
    userCampaigns = await db.query.campaigns.findMany({
      where: eq(campaigns.userId, user.id),
      orderBy: [desc(campaigns.createdAt)],
      with: {
        qrCodes: true,
        sessions: true,
      },
    });
  }

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

  // 3. Render Interactive Client Component with Server-Fetched Initial Data
  return <CampaignsView initialCampaigns={enrichedCampaigns} />;
}
