import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview } from "@/lib/analytics/overview";
import { db } from "@/lib/db";
import { qrCodes, campaigns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsDashboardPage() {
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
