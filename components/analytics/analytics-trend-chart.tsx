"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface AnalyticsTrendChartProps {
  timeSeries: Array<{
    timestamp: string;
    label: string;
    scans: number;
    sessions: number;
    conversions: number;
  }>;
  period: string;
}

export function AnalyticsTrendChart({
  timeSeries = [],
  period,
}: AnalyticsTrendChartProps) {
  const [activeMetric, setActiveMetric] = React.useState<"all" | "scans" | "sessions" | "conversions">("all");

  const isEmpty = !timeSeries || timeSeries.length === 0;

  const totalScans = React.useMemo(
    () => timeSeries.reduce((acc, curr) => acc + (curr.scans || 0), 0),
    [timeSeries]
  );

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md">
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-4 text-sky-500" />
            Scan &amp; Conversion Trends
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Performance over time ({period}) • {totalScans.toLocaleString()} total scans
          </CardDescription>
        </div>

        {!isEmpty && (
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setActiveMetric("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeMetric === "all"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Metrics
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("scans")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeMetric === "scans"
                  ? "bg-sky-500 text-white shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Scans
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("sessions")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeMetric === "sessions"
                  ? "bg-indigo-500 text-white shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sessions
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("conversions")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                activeMetric === "conversions"
                  ? "bg-emerald-500 text-white shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Conversions
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-2">
        {isEmpty ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 p-6 text-center bg-card/40">
            <BarChart2 className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              No scan data available for this time period
            </p>
            <p className="text-xs text-muted-foreground">
              Generate QR scans to visualize time series curves and conversion trends.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/60" />
                <XAxis
                  dataKey="label"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(9, 9, 11, 0.95)",
                    borderColor: "rgba(39, 39, 42, 0.8)",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#ffffff", fontSize: "12px" }}
                  labelStyle={{ color: "#a1a1aa", fontWeight: "bold", marginBottom: "4px" }}
                />
                {(activeMetric === "all" || activeMetric === "scans") && (
                  <Area
                    type="monotone"
                    dataKey="scans"
                    name="Scans"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scansGradient)"
                  />
                )}
                {(activeMetric === "all" || activeMetric === "sessions") && (
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessions"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sessionsGradient)"
                  />
                )}
                {(activeMetric === "all" || activeMetric === "conversions") && (
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    name="Conversions"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#conversionsGradient)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
