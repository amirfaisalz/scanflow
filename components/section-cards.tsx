"use client";

import * as React from "react";
import {
  QrCode,
  Users,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionCardsKpis {
  totalScans?: number;
  uniqueSessions?: number;
  activeQRCodes?: number;
  conversionRate?: number;
}

interface SectionCardsProps {
  kpis?: SectionCardsKpis;
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

export function SectionCards({ kpis }: SectionCardsProps) {
  const totalScans = kpis?.totalScans ?? 0;
  const uniqueSessions = kpis?.uniqueSessions ?? 0;
  const activeQRCodes = kpis?.activeQRCodes ?? 0;
  const conversionRate = kpis?.conversionRate ?? 0;

  const cards = [
    {
      title: "Total Scans",
      value: formatCompactNumber(totalScans),
      trendValue: "+147%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: QrCode,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Unique Visitors",
      value: formatCompactNumber(uniqueSessions),
      trendValue: "+84%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Users,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Active QR Codes",
      value: formatCompactNumber(activeQRCodes),
      trendValue: "+100%",
      trendLabel: "LIVE IN REGISTRY",
      isPositive: true,
      icon: Layers,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      trendValue: "+24%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Sparkles,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
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

            {/* Middle: Big Metric Value */}
            <div className="my-3">
              <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
                {card.value}
              </div>
            </div>

            {/* Bottom: Trend Arrow + Percentage + Comparison Label */}
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
                {card.trendLabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
