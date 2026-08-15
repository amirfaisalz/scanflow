import { Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
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
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            <div className="space-y-1 my-3">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-70 w-full rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2 pt-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function DashboardOverviewData() {
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
    <>
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
    </>
  );
}

export default function DashboardPage() {
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

      {/* Dynamic Data Content wrapped in Suspense so UI shell is never blocked */}
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardOverviewData />
      </Suspense>
    </div>
  );
}
