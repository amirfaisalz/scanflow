"use client";

import * as React from "react";
import {
  Compass,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Compass className="h-6 w-6 text-sky-400" />
              <span>Scan Journeys</span>
            </h1>
            <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/20">
              Standout Feature
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Trace individual visitor paths chronologically from QR scan to final goal conversion.
          </p>
        </div>

        <Button
          onClick={fetchJourneys}
          variant="outline"
          size="sm"
          className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-2 h-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Journeys</span>
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Journeys</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100 font-mono">
            {metrics.totalSessions.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Recorded visitor sessions</span>
        </div>

        {/* Conversions */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Conversions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {metrics.convertedCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Completed end goals</span>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Conversion Rate</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-300 font-mono">
            {metrics.conversionRate}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Visitor to goal ratio</span>
        </div>

        {/* Avg Duration */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Avg Duration</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300 font-mono">
            {metrics.avgDuration > 0 ? `${metrics.avgDuration}s` : "< 5s"}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Time spent on site</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by QR, session, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-200 text-sm placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Device Filter */}
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-[140px] bg-zinc-950/60 border-zinc-800 text-zinc-300 text-xs h-9">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile Only</SelectItem>
              <SelectItem value="desktop">Desktop Only</SelectItem>
              <SelectItem value="tablet">Tablet Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Conversion Filter */}
          <Select value={convertedFilter} onValueChange={setConvertedFilter}>
            <SelectTrigger className="w-[140px] bg-zinc-950/60 border-zinc-800 text-zinc-300 text-xs h-9">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="true">Converted Only</SelectItem>
              <SelectItem value="false">Drop-offs Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Journeys Table */}
      {loading && journeys.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mb-3" />
          <span className="text-xs text-zinc-500 font-mono">Loading visitor journeys...</span>
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
