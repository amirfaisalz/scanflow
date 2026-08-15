import Link from "next/link";
import { ChartAreaInteractive, type ScanChartDataPoint } from "@/components/chart-area-interactive";
import { DashboardOverviewTable } from "@/components/dashboard-overview-table";
import { SectionCards } from "@/components/section-cards";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview } from "@/lib/analytics/overview";
import { db } from "@/lib/db";
import { qrCodes, sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch real analytics overview data (90-day window) for this tenant
  const overviewData = await getAnalyticsOverview(user.id, { period: "90d" });

  // 2. Fetch user's real dynamic QR codes
  const userQrCodes = await db.query.qrCodes.findMany({
    where: eq(qrCodes.userId, user.id),
    orderBy: [desc(qrCodes.createdAt)],
  });

  // 3. Fetch count of recent sessions
  const recentSessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, user.id),
    orderBy: [desc(sessions.startedAt)],
    limit: 10,
  });

  // 4. Map time series to chart data points with device ratios
  const deviceRatio = overviewData.breakdowns.devices.find((d) => d.name === "Mobile");
  const mobilePercent = deviceRatio ? deviceRatio.percentage / 100 : 0.6;

  const chartPoints: ScanChartDataPoint[] = (overviewData.timeSeries || []).map((t) => {
    const totalScans = t.scans || 0;
    const mobileScans = Math.round(totalScans * mobilePercent);
    const desktopScans = totalScans - mobileScans;
    return {
      date: t.timestamp.split("T")[0],
      desktop: desktopScans,
      mobile: mobileScans,
    };
  });

  // 5. Compute real tenant KPI metrics
  const activeQrCount = userQrCodes.filter((q) => q.status === "active").length;
  const kpis = {
    totalScans: overviewData.kpis.totalScans,
    uniqueSessions: overviewData.kpis.totalSessions,
    activeQRCodes: activeQrCount,
    conversionRate: overviewData.kpis.conversionRate,
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Workspace Identity Banner */}
      <div className="mx-4 lg:mx-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {user?.name}&apos;s Workspace
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.email} • Tenant ID: <code className="text-[11px] font-mono">{user?.id?.slice(0, 10)}...</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/qr-codes" />} className="gap-1.5 text-xs shadow-xs">
            <QrCode className="size-3.5" />
            Manage Dynamic QR Codes
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Top Metric Cards (Real DB KPIs) */}
      <SectionCards kpis={kpis} />

      {/* Interactive Scan Area Chart (Real Tenant Time Series) */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={chartPoints} />
      </div>

      {/* Dynamic QR Codes & Activity Table (Real DB Records) */}
      <DashboardOverviewTable qrCodes={userQrCodes} recentSessionsCount={recentSessions.length} />
    </div>
  );
}
