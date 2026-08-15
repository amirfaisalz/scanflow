"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  TrendingUpIcon,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

      {/* Header Section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Compass className="h-6 w-6 text-sky-500" />
              <span>Scan Journeys</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Isolated Tenant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Trace individual visitor paths chronologically from QR scan to final goal conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchJourneys}
            variant="outline"
            size="sm"
            className="gap-2 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Journeys</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Row - Styled identically to /dashboard */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        {/* Total Sessions */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <Users className="size-3.5 text-primary" />
                Total Journeys
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs">
                  Visitor Flow
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 font-mono">
              {metrics.totalSessions.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Multi-step journey grouping</span>
            </div>
            <div>Recorded visitor sessions</div>
          </CardFooter>
        </Card>

        {/* Conversions */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                Conversions
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                  <TrendingUpIcon className="size-3 mr-1 text-emerald-500" />
                  Live Ingestion
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.convertedCount.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Goal completions reached</span>
            </div>
            <div>Attributed end outcomes</div>
          </CardFooter>
        </Card>

        {/* Conversion Rate */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <Sparkles className="size-3.5 text-primary" />
                Conversion Rate
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
                  <Sparkles className="size-3 mr-1" />
                  Outcome Ratio
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 font-mono">
              {metrics.conversionRate}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Conversions / Journeys</span>
            </div>
            <div>Visitor to goal completion ratio</div>
          </CardFooter>
        </Card>

        {/* Avg Duration */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <Clock className="size-3.5 text-amber-500" />
                Avg Duration
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/10">
                  Engagement
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 font-mono">
              {metrics.avgDuration > 0 ? `${metrics.avgDuration}s` : "< 5s"}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Active session lifetime</span>
            </div>
            <div>Time spent navigating destination</div>
          </CardFooter>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by QR, session, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Device Filter */}
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-[140px] bg-background border-input text-foreground text-xs h-9">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile Only</SelectItem>
              <SelectItem value="desktop">Desktop Only</SelectItem>
              <SelectItem value="tablet">Tablet Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Conversion Filter */}
          <Select value={convertedFilter} onValueChange={setConvertedFilter}>
            <SelectTrigger className="w-[140px] bg-background border-input text-foreground text-xs h-9">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="true">Converted Only</SelectItem>
              <SelectItem value="false">Drop-offs Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Journeys Table */}
      {loading && journeys.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-card/40 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
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
