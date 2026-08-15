"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JourneysTable, JourneySession } from "@/components/journeys/journeys-table";
import { JourneyDetailSheet } from "@/components/journeys/journey-detail-sheet";
import { cn } from "@/lib/utils";

export default function JourneysPage() {
  const [journeys, setJourneys] = React.useState<JourneySession[]>([]);
  const [metrics, setMetrics] = React.useState({
    totalSessions: 0,
    convertedCount: 0,
    conversionRate: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [deviceFilter, setDeviceFilter] = React.useState("all");
  const [convertedFilter, setConvertedFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedJourney, setSelectedJourney] = React.useState<JourneySession | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const fetchJourneys = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (deviceFilter !== "all") params.set("device", deviceFilter);
      if (convertedFilter !== "all") params.set("converted", convertedFilter);

      const res = await fetch(`/api/analytics/journeys?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJourneys(data.journeys || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (error) {
      console.error("Failed to fetch journeys:", error);
    } finally {
      setLoading(false);
    }
  }, [deviceFilter, convertedFilter]);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (deviceFilter !== "all") params.set("device", deviceFilter);
        if (convertedFilter !== "all") params.set("converted", convertedFilter);

        const res = await fetch(`/api/analytics/journeys?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setJourneys(data.journeys || []);
          if (data.metrics) {
            setMetrics(data.metrics);
          }
        }
      } catch (error) {
        console.error("Failed to fetch journeys:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [deviceFilter, convertedFilter]);

  const handleSelectJourney = (journey: JourneySession) => {
    setSelectedJourney(journey);
    setSheetOpen(true);
  };

  const filteredJourneys = React.useMemo(() => {
    if (!searchQuery.trim()) return journeys;
    const query = searchQuery.toLowerCase();
    return journeys.filter(
      (j) =>
        j.qrName.toLowerCase().includes(query) ||
        j.id.toLowerCase().includes(query) ||
        j.country.toLowerCase().includes(query) ||
        (j.city && j.city.toLowerCase().includes(query)) ||
        j.os.toLowerCase().includes(query)
    );
  }, [journeys, searchQuery]);

  const kpiCards = [
    {
      title: "Total Journeys",
      value: metrics.totalSessions >= 1000 ? `${(metrics.totalSessions / 1000).toFixed(2).replace(/\.00$/, "")}K` : metrics.totalSessions.toLocaleString(),
      trendValue: "+147%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Users,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Goal Completions",
      value: metrics.convertedCount >= 1000 ? `${(metrics.convertedCount / 1000).toFixed(1)}K` : metrics.convertedCount.toLocaleString(),
      trendValue: "+84%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: CheckCircle2,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      trendValue: "+24%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Sparkles,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Avg Duration",
      value: metrics.avgDuration > 0 ? `${metrics.avgDuration}s` : "< 5s",
      trendValue: "+18%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Clock,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
  ];

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
            <BreadcrumbPage>Scan Journeys</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Scan Journeys
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trace individual visitor paths chronologically from QR scan to final goal conversion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchJourneys}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => {
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
                  <TrendingUp className="size-3.5" />
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by QR, session, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border/80 text-foreground text-xs placeholder:text-muted-foreground h-9"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Device Filter */}
          <Select value={deviceFilter} onValueChange={(val) => { if (val) setDeviceFilter(val); }}>
            <SelectTrigger className="w-[140px] bg-background/80 border-border/80 text-foreground text-xs h-9">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Devices</SelectItem>
              <SelectItem value="mobile" className="text-xs">Mobile Only</SelectItem>
              <SelectItem value="desktop" className="text-xs">Desktop Only</SelectItem>
              <SelectItem value="tablet" className="text-xs">Tablet Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Conversion Filter */}
          <Select value={convertedFilter} onValueChange={(val) => { if (val) setConvertedFilter(val); }}>
            <SelectTrigger className="w-[140px] bg-background/80 border-border/80 text-foreground text-xs h-9">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Outcomes</SelectItem>
              <SelectItem value="true" className="text-xs">Converted Only</SelectItem>
              <SelectItem value="false" className="text-xs">Drop-offs Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Journeys Table */}
      {loading && journeys.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/40 p-8">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
          <span className="text-xs text-muted-foreground font-mono">Loading visitor journeys...</span>
        </div>
      ) : (
        <JourneysTable journeys={filteredJourneys} onSelectJourney={handleSelectJourney} />
      )}

      {/* Journey Detail Side Sheet */}
      <JourneyDetailSheet
        session={selectedJourney}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
