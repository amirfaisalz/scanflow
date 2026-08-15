"use client";

import * as React from "react";
import {
  QrCode,
  Activity,
  Sparkles,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalyticsKpiCardsProps {
  kpis: {
    totalScans: number;
    uniqueVisitors: number;
    totalSessions: number;
    conversions: number;
    conversionRate: number;
    avgDurationSeconds: number;
    bouncedSessions: number;
    bounceRate: number;
  };
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M";
  }
  if (num >= 10_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function formatDuration(seconds: number = 0): string {
  if (!seconds || seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function AnalyticsKpiCards({ kpis }: AnalyticsKpiCardsProps) {
  const safeKpis = {
    totalScans: kpis?.totalScans ?? 0,
    uniqueVisitors: kpis?.uniqueVisitors ?? 0,
    totalSessions: kpis?.totalSessions ?? 0,
    conversions: kpis?.conversions ?? 0,
    conversionRate: kpis?.conversionRate ?? 0,
    avgDurationSeconds: kpis?.avgDurationSeconds ?? 0,
    bouncedSessions: kpis?.bouncedSessions ?? 0,
    bounceRate: kpis?.bounceRate ?? 0,
  };

  const cards = [
    {
      title: "Total Scans",
      value: safeKpis.totalScans.toLocaleString(),
      subtitle: `${safeKpis.uniqueVisitors.toLocaleString()} unique visitors`,
      trendValue: "+147%",
      isPositive: true,
      icon: QrCode,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Total Sessions",
      value: safeKpis.totalSessions.toLocaleString(),
      subtitle: `${safeKpis.bounceRate}% bounce rate`,
      trendValue: "+84%",
      isPositive: true,
      icon: Activity,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Conversions",
      value: safeKpis.conversions.toLocaleString(),
      subtitle: `${safeKpis.conversionRate}% conv. rate`,
      trendValue: "+32%",
      isPositive: true,
      icon: Sparkles,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      title: "Avg. Duration",
      value: formatDuration(safeKpis.avgDurationSeconds),
      subtitle: "Avg. Engagement",
      trendValue: "+18%",
      isPositive: true,
      icon: Clock,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 shadow-2xs hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Top Row: Title & Circular Icon Pill */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground tracking-tight">
                {card.title}
              </span>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-transform group-hover:scale-105",
                  card.iconBg
                )}
              >
                <Icon className={cn("size-4", card.iconColor)} />
              </div>
            </div>

            {/* Middle: Big Metric Value & Subtitle */}
            <div className="my-3 space-y-1">
              <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {card.subtitle}
              </div>
            </div>

            {/* Bottom: Trend Arrow + Percentage */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                {card.isPositive ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5 text-rose-500" />
                )}
                <span>{card.trendValue}</span>
              </div>
              <span className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground">
                VS PREV. PERIOD
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
