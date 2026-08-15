import Link from "next/link";
import { ChartAreaInteractive, type ScanChartDataPoint } from "@/components/chart-area-interactive";
import { DashboardOverviewTable } from "@/components/dashboard-overview-table";
import { SectionCards } from "@/components/section-cards";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview } from "@/lib/analytics/overview";
import { db } from "@/lib/db";
import { qrCodes, sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { QrCode, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch real analytics overview data (90-day window) for this tenant on the server
  const overviewData = await getAnalyticsOverview(user.id, { period: "90d" });

  // 2. Fetch user's real dynamic QR codes on the server
  const userQrCodes = await db.query.qrCodes.findMany({
    where: eq(qrCodes.userId, user.id),
    orderBy: [desc(qrCodes.createdAt)],
  });

  // 3. Fetch count of recent sessions on the server
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
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <LayoutDashboard className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {user?.name ? `${user.name}'s Workspace` : "Workspace Overview"}
              </h1>

              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {user?.email} • Real-time telemetry, routing performance, and conversion intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" nativeButton={false} render={<Link href="/dashboard/qr-codes" />} className="gap-1.5 h-8 text-xs shadow-xs">
            <QrCode className="size-3.5" />
            <span>Manage Dynamic QR Codes</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <SectionCards kpis={kpis} />

      {/* Interactive Scan Area Chart */}
      <ChartAreaInteractive data={chartPoints} />

      {/* Dynamic QR Codes & Activity Table */}
      <DashboardOverviewTable qrCodes={userQrCodes} recentSessionsCount={recentSessions.length} />
    </div>
  );
}
