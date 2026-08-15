"use client";

import * as React from "react";
import {
  QrCode,
  Users,
  Activity,
  Sparkles,
  Clock,
  TrendingUp,
  Percent,
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
      icon: QrCode,
      iconColor: "text-sky-500",
      iconBg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Total Sessions",
      value: safeKpis.totalSessions.toLocaleString(),
      subtitle: `${safeKpis.bounceRate}% bounce rate (${safeKpis.bouncedSessions.toLocaleString()} bounced)`,
      icon: Activity,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Conversions",
      value: safeKpis.conversions.toLocaleString(),
      subtitle: `${safeKpis.conversionRate}% conv. rate`,
      icon: Sparkles,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Avg. Duration",
      value: formatDuration(safeKpis.avgDurationSeconds),
      subtitle: "Avg. time per active session",
      icon: Clock,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-5 shadow-xs transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {card.title}
              </span>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border",
                  card.iconBg
                )}
              >
                <Icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
            </div>

            <div className="mt-4">
              <div className="font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
