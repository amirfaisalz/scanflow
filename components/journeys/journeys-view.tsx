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

interface JourneysViewProps {
  initialJourneys: JourneySession[];
  initialMetrics: {
    totalSessions: number;
    convertedCount: number;
    conversionRate: number;
    avgDuration: number;
  };
}

export function JourneysView({ initialJourneys, initialMetrics }: JourneysViewProps) {
  const [deviceFilter, setDeviceFilter] = React.useState("all");
  const [convertedFilter, setConvertedFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const [journeys, setJourneys] = React.useState<JourneySession[]>(initialJourneys);
  const [metrics, setMetrics] = React.useState(initialMetrics);
  const [loading, setLoading] = React.useState(false);
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

  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchJourneys();
  }, [fetchJourneys]);

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
      trendValue: "+182%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: CheckCircle2,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate.toFixed(1)}%`,
      trendValue: "+24%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Sparkles,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      title: "Avg Duration",
      value: `${metrics.avgDuration}s`,
      trendValue: "+12s",
      trendLabel: "ENGAGEMENT TIME",
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
            <BreadcrumbPage>Visitor Journeys</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Visitor Journeys
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspect granular chronological clickstreams, hardware footprints, and goal conversions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchJourneys}
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={loading}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md shadow-2xs transition-all hover:border-border/90 hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground tracking-tight">
                  {card.title}
                </span>
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl border border-border/50",
                    card.iconBg,
                    card.iconColor
                  )}
                >
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {card.value}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3 stroke-[2.5]" />
                <span>{card.trendValue}</span>
                <span className="text-[10px] text-muted-foreground ml-1">
                  {card.trendLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by QR name, country, city, OS, or Session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/80"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={deviceFilter} onValueChange={(val) => { if (val) setDeviceFilter(val); }}>
            <SelectTrigger className="w-32 h-9 text-xs rounded-xl bg-background/50 border-border/80">
              <SelectValue placeholder="All Devices" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">
                All Devices
              </SelectItem>
              <SelectItem value="mobile" className="text-xs">
                Mobile
              </SelectItem>
              <SelectItem value="desktop" className="text-xs">
                Desktop
              </SelectItem>
              <SelectItem value="tablet" className="text-xs">
                Tablet
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={convertedFilter} onValueChange={(val) => { if (val) setConvertedFilter(val); }}>
            <SelectTrigger className="w-32 h-9 text-xs rounded-xl bg-background/50 border-border/80">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">
                All Sessions
              </SelectItem>
              <SelectItem value="true" className="text-xs">
                Converted Only
              </SelectItem>
              <SelectItem value="false" className="text-xs">
                Unconverted
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Journeys Table */}
      <JourneysTable
        journeys={filteredJourneys}
        onSelectJourney={handleSelectJourney}
      />

      {/* Journey Detail Sheet */}
      <JourneyDetailSheet
        session={selectedJourney}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
