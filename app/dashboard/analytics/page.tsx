"use client";

import * as React from "react";
import Link from "next/link";
import {
  BarChart3,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { AnalyticsKpiCards } from "@/components/analytics/analytics-kpi-cards";
import { AnalyticsTrendChart } from "@/components/analytics/analytics-trend-chart";
import { AnalyticsBreakdowns } from "@/components/analytics/analytics-breakdowns";
import { AnalyticsTopPerformers } from "@/components/analytics/analytics-top-performers";
import type { AnalyticsOverviewData } from "@/lib/analytics/overview";
import { useCachedState } from "@/lib/client-cache";

/**
 * Constructs a comprehensive CSV report from the analytics overview data.
 */
function generateAnalyticsCsv(data: AnalyticsOverviewData, period: string): string {
  const lines: string[] = [];

  const escapeCell = (val: unknown) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  // 1. Report Metadata
  lines.push("SCANFLOW ANALYTICS REPORT");
  lines.push(`Generated At,${escapeCell(new Date().toISOString())}`);
  lines.push(`Time Period,${escapeCell(period)}`);
  lines.push("");

  // 2. Key Performance Indicators
  lines.push("--- KEY PERFORMANCE INDICATORS ---");
  lines.push("Metric,Value,Notes");
  lines.push(`Total Scans,${data.kpis?.totalScans ?? 0},"${data.kpis?.uniqueVisitors ?? 0} unique visitors"`);
  lines.push(`Unique Visitors,${data.kpis?.uniqueVisitors ?? 0},`);
  lines.push(`Total Sessions,${data.kpis?.totalSessions ?? 0},"${data.kpis?.bounceRate ?? 0}% bounce rate"`);
  lines.push(`Conversions,${data.kpis?.conversions ?? 0},"${data.kpis?.conversionRate ?? 0}% conversion rate"`);
  lines.push(`Conversion Rate,${data.kpis?.conversionRate ?? 0}%,`);
  lines.push(`Avg Session Duration (sec),${data.kpis?.avgDurationSeconds ?? 0},`);
  lines.push(`Bounced Sessions,${data.kpis?.bouncedSessions ?? 0},`);
  lines.push(`Bounce Rate,${data.kpis?.bounceRate ?? 0}%,`);
  lines.push("");

  // 3. Time Series Trends
  lines.push("--- TIME SERIES TRENDS ---");
  lines.push("Timestamp,Label,Scans,Sessions,Conversions");
  for (const item of data.timeSeries || []) {
    lines.push(
      `${escapeCell(item.timestamp)},${escapeCell(item.label)},${item.scans},${item.sessions},${item.conversions}`
    );
  }
  lines.push("");

  // 4. Device Hardware Breakdown
  lines.push("--- DEVICE BREAKDOWN ---");
  lines.push("Device,Scans,Percentage");
  for (const d of data.breakdowns?.devices || []) {
    lines.push(`${escapeCell(d.name)},${d.value},${d.percentage}%`);
  }
  lines.push("");

  // 5. Operating Systems Breakdown
  lines.push("--- OPERATING SYSTEM BREAKDOWN ---");
  lines.push("OS,Scans,Percentage");
  for (const os of data.breakdowns?.operatingSystems || []) {
    lines.push(`${escapeCell(os.name)},${os.value},${os.percentage}%`);
  }
  lines.push("");

  // 6. Web Browser Breakdown
  lines.push("--- BROWSER BREAKDOWN ---");
  lines.push("Browser,Scans,Percentage");
  for (const b of data.breakdowns?.browsers || []) {
    lines.push(`${escapeCell(b.name)},${b.value},${b.percentage}%`);
  }
  lines.push("");

  // 7. Geographic Countries Breakdown
  lines.push("--- GEOGRAPHIC COUNTRIES ---");
  lines.push("Country Code,Country Name,Scans,Percentage");
  for (const c of data.breakdowns?.countries || []) {
    lines.push(`${escapeCell(c.code)},${escapeCell(c.name)},${c.scans},${c.percentage}%`);
  }
  lines.push("");

  // 8. Geographic Cities Breakdown
  lines.push("--- GEOGRAPHIC CITIES ---");
  lines.push("City,Country,Scans,Percentage");
  for (const city of data.breakdowns?.cities || []) {
    lines.push(`${escapeCell(city.name)},${escapeCell(city.country)},${city.scans},${city.percentage}%`);
  }
  lines.push("");

  // 9. Hourly Scan Distribution
  lines.push("--- HOURLY SCAN DISTRIBUTION ---");
  lines.push("Hour,Time Label,Scans");
  for (const h of data.breakdowns?.hourlyDistribution || []) {
    lines.push(`${h.hour},${escapeCell(h.label)},${h.count}`);
  }
  lines.push("");

  // 10. Top Performing QR Codes
  lines.push("--- TOP PERFORMING QR CODES ---");
  lines.push("ID,Name,Slug,Scans,Sessions,Conversions,Conversion Rate");
  for (const qr of data.topPerformers?.qrCodes || []) {
    lines.push(
      `${escapeCell(qr.id)},${escapeCell(qr.name)},${escapeCell(qr.slug)},${qr.scans},${qr.sessions},${qr.conversions},${qr.conversionRate}%`
    );
  }
  lines.push("");

  // 11. Top Performing Campaigns
  lines.push("--- TOP PERFORMING CAMPAIGNS ---");
  lines.push("ID,Name,Scans,Sessions,Conversions,Conversion Rate");
  for (const camp of data.topPerformers?.campaigns || []) {
    lines.push(
      `${escapeCell(camp.id)},${escapeCell(camp.name)},${camp.scans},${camp.sessions},${camp.conversions},${camp.conversionRate}%`
    );
  }

  return lines.join("\n");
}

/**
 * Triggers a browser file download using an in-memory blob.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AnalyticsDashboardPage() {
  // Filter States
  const [period, setPeriod] = React.useState<"24h" | "7d" | "30d" | "90d" | "all">("24h");
  const [qrCodeId, setQrCodeId] = React.useState<string>("all");
  const [campaignId, setCampaignId] = React.useState<string>("all");
  const [device, setDevice] = React.useState<string>("all");

  // Option lists for dropdowns (cached)
  const [qrOptions, setQrOptions] = useCachedState<Array<{ id: string; name: string }>>("/api/qr-codes-options", []);
  const [campaignOptions, setCampaignOptions] = useCachedState<Array<{ id: string; name: string }>>("/api/campaigns-options", []);

  // Data & Lifecycle States (cached per filter combination)
  const overviewCacheKey = `/api/analytics/overview?period=${period}&qrCodeId=${qrCodeId}&campaignId=${campaignId}&device=${device}`;
  const [overviewData, setOverviewData, loading, setLoading] = useCachedState<AnalyticsOverviewData | null>(overviewCacheKey, null);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch filter dropdown options on mount
  React.useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [qrRes, campRes] = await Promise.all([
          fetch("/api/qr-codes"),
          fetch("/api/campaigns"),
        ]);

        if (qrRes.ok) {
          const qrData = await qrRes.json();
          const items = Array.isArray(qrData.data)
            ? qrData.data.map((q: { id: string; name: string }) => ({ id: q.id, name: q.name }))
            : [];
          setQrOptions(items);
        }

        if (campRes.ok) {
          const campData = await campRes.json();
          const items = Array.isArray(campData.campaigns)
            ? campData.campaigns.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
            : [];
          setCampaignOptions(items);
        }
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    }

    loadFilterOptions();
  }, []);

  // Fetch Analytics Overview Data
  const fetchOverview = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("period", period);
      if (qrCodeId && qrCodeId !== "all") params.set("qrCodeId", qrCodeId);
      if (campaignId && campaignId !== "all") params.set("campaignId", campaignId);
      if (device && device !== "all") params.set("device", device);

      const res = await fetch(`/api/analytics/overview?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics overview (HTTP ${res.status})`);
      }

      const json = await res.json();
      setOverviewData(json.data || null);
    } catch (err: unknown) {
      console.error("Error fetching analytics overview:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics overview");
    } finally {
      setLoading(false);
    }
  }, [period, qrCodeId, campaignId, device]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("period", period);
        if (qrCodeId && qrCodeId !== "all") params.set("qrCodeId", qrCodeId);
        if (campaignId && campaignId !== "all") params.set("campaignId", campaignId);
        if (device && device !== "all") params.set("device", device);

        const res = await fetch(`/api/analytics/overview?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load analytics overview (HTTP ${res.status})`);
        }

        const json = await res.json();
        if (isMounted) {
          setOverviewData(json.data || null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Error fetching analytics overview:", err);
          setError(err instanceof Error ? err.message : "Failed to load analytics overview");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [period, qrCodeId, campaignId, device]);

  // Export handlers
  const handleExport = (format: "csv" | "json") => {
    if (!overviewData) {
      toast.error("No analytics data available to export");
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const csv = generateAnalyticsCsv(overviewData, period);
      downloadFile(csv, `scanflow-analytics-${period}-${dateStr}.csv`, "text/csv;charset=utf-8;");
      toast.success("CSV export downloaded successfully");
    } else {
      const jsonStr = JSON.stringify(overviewData, null, 2);
      downloadFile(
        jsonStr,
        `scanflow-analytics-${period}-${dateStr}.json`,
        "application/json;charset=utf-8;"
      );
      toast.success("JSON export downloaded successfully");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Analytics Deep-Dive
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-dimensional scan intelligence, visitor funnel performance, device telemetry, and location insights.
            </p>
          </div>
        </div>
      </div>

      {/* Dimensional Filter Controls */}
      <AnalyticsFilters
        period={period}
        onPeriodChange={setPeriod}
        qrCodeId={qrCodeId}
        onQrCodeChange={setQrCodeId}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
        device={device}
        onDeviceChange={setDevice}
        qrOptions={qrOptions}
        campaignOptions={campaignOptions}
        onExport={handleExport}
        onRefresh={fetchOverview}
        isLoading={loading}
      />

      {/* Error Fallback Banner */}
      {error && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Failed to load analytics overview</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            className="border-rose-500/30 text-xs font-medium text-rose-600 hover:bg-rose-500/20 dark:text-rose-200 h-8"
          >
            <RotateCw className="mr-1.5 size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !overviewData ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-card/60" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl bg-card/60" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-2xl bg-card/60" />
            <Skeleton className="h-72 rounded-2xl bg-card/60" />
            <Skeleton className="h-72 rounded-2xl bg-card/60" />
            <Skeleton className="h-72 rounded-2xl bg-card/60" />
          </div>
        </div>
      ) : overviewData ? (
        <div className="flex flex-col gap-6">
          {/* Section 1: KPI Cards */}
          <AnalyticsKpiCards kpis={overviewData.kpis} />

          {/* Section 2: Time Series Trend Chart */}
          <AnalyticsTrendChart timeSeries={overviewData.timeSeries} period={period} />

          {/* Section 3: Dimensional Breakdowns */}
          <AnalyticsBreakdowns breakdowns={overviewData.breakdowns} />

          {/* Section 4: Top Performing QR Codes & Campaigns */}
          <AnalyticsTopPerformers topPerformers={overviewData.topPerformers} />
        </div>
      ) : null}
    </div>
  );
}
