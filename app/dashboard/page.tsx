"use client";

import * as React from "react";
import Link from "next/link";
import { ChartAreaInteractive, type ScanChartDataPoint } from "@/components/chart-area-interactive";
import { DashboardOverviewTable } from "@/components/dashboard-overview-table";
import { SectionCards } from "@/components/section-cards";
import { QrCode, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useCachedState } from "@/lib/client-cache";
import DashboardLoading from "./loading";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

interface DashboardData {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  kpis: {
    totalScans: number;
    uniqueSessions: number;
    activeQRCodes: number;
    conversionRate: number;
  };
  chartPoints: ScanChartDataPoint[];
  qrCodes: QRCodeModel[];
  recentSessionsCount: number;
}

export default function DashboardPage() {
  const [data, setData, loading, setLoading] = useCachedState<DashboardData | null>(
    "/api/dashboard/overview",
    null
  );

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load dashboard overview:", err);
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !data) {
    return <DashboardLoading />;
  }

  const user = data?.user;
  const kpis = data?.kpis || {
    totalScans: 0,
    uniqueSessions: 0,
    activeQRCodes: 0,
    conversionRate: 0,
  };
  const chartPoints = data?.chartPoints || [];
  const qrCodes = data?.qrCodes || [];
  const recentSessionsCount = data?.recentSessionsCount || 0;

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
      <DashboardOverviewTable qrCodes={qrCodes} recentSessionsCount={recentSessionsCount} />
    </div>
  );
}
