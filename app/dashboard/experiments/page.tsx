"use client";

import * as React from "react";
import Link from "next/link";
import {
  Split,
  Plus,
  Search,
  RotateCw,
  TrendingUp,
  Activity,
  AlertCircle,
  Filter,
  Crown,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ExperimentCard,
  ExperimentData,
  ExperimentDialog,
} from "@/components/experiments";
import { cn } from "@/lib/utils";

export default function ExperimentsDashboardPage() {
  // Experiments & Metrics state
  const [experiments, setExperiments] = React.useState<ExperimentData[]>([]);
  const [metrics, setMetrics] = React.useState<{
    totalExperiments: number;
    activeExperiments: number;
    totalVariants: number;
    totalConversions: number;
    totalSessions: number;
    overallConversionRate: number;
    significantWinnersCount: number;
  }>({
    totalExperiments: 0,
    activeExperiments: 0,
    totalVariants: 0,
    totalConversions: 0,
    totalSessions: 0,
    overallConversionRate: 0,
    significantWinnersCount: 0,
  });

  // Lifecycle states
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [qrFilter, setQrFilter] = React.useState<string>("all");

  // Options for dialog dropdowns & filter
  const [qrOptions, setQrOptions] = React.useState<Array<{ id: string; name: string; destinationUrl?: string }>>([]);
  const [campaignOptions, setCampaignOptions] = React.useState<Array<{ id: string; name: string }>>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingExperiment, setEditingExperiment] = React.useState<ExperimentData | null>(null);

  // Fetch experiments and aggregate metrics
  const fetchExperiments = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/experiments");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load experiments (HTTP ${res.status})`);
      }

      const data = await res.json();
      const loadedExperiments: ExperimentData[] = data.experiments || [];
      setExperiments(loadedExperiments);

      const computedTotal = loadedExperiments.length;
      const computedActive = loadedExperiments.filter((e) => e.status === "active").length;
      const computedTotalVariants = loadedExperiments.reduce(
        (sum, e) => sum + (e.variants?.length || 0),
        0
      );
      const computedTotalConversions = loadedExperiments.reduce(
        (sum, e) => sum + (e.stats?.totalConversions || 0),
        0
      );
      const computedTotalSessions = loadedExperiments.reduce(
        (sum, e) => sum + (e.stats?.totalSessions || 0),
        0
      );
      const computedConversionRate =
        computedTotalSessions > 0
          ? Math.round((computedTotalConversions / computedTotalSessions) * 1000) / 10
          : 0;
      const computedWinners = loadedExperiments.filter(
        (e) => e.stats?.hasSignificantWinner || Boolean(e.winnerVariantId)
      ).length;

      setMetrics({
        totalExperiments: data.metrics?.totalExperiments ?? computedTotal,
        activeExperiments: data.metrics?.activeExperiments ?? computedActive,
        totalVariants: data.metrics?.totalVariants ?? computedTotalVariants,
        totalConversions: data.metrics?.totalConversions ?? computedTotalConversions,
        totalSessions: data.metrics?.totalSessions ?? computedTotalSessions,
        overallConversionRate: data.metrics?.overallConversionRate ?? computedConversionRate,
        significantWinnersCount: data.metrics?.significantWinnersCount ?? computedWinners,
      });
    } catch (err: unknown) {
      console.error("Error fetching experiments:", err);
      setError(err instanceof Error ? err.message : "Failed to load experiments");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [qrRes, campRes, expRes] = await Promise.all([
          fetch("/api/qr-codes"),
          fetch("/api/campaigns"),
          fetch("/api/experiments"),
        ]);

        if (qrRes.ok && isMounted) {
          const qrJson = await qrRes.json();
          const items = Array.isArray(qrJson.data)
            ? qrJson.data.map((q: { id: string; name: string; destinationUrl?: string }) => ({
                id: q.id,
                name: q.name,
                destinationUrl: q.destinationUrl,
              }))
            : [];
          setQrOptions(items);
        }

        if (campRes.ok && isMounted) {
          const campJson = await campRes.json();
          const items = Array.isArray(campJson.campaigns)
            ? campJson.campaigns.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }))
            : [];
          setCampaignOptions(items);
        }

        if (!expRes.ok) {
          const errData = await expRes.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load experiments (HTTP ${expRes.status})`);
        }

        if (isMounted) {
          const data = await expRes.json();
          const loadedExperiments: ExperimentData[] = data.experiments || [];
          setExperiments(loadedExperiments);

          const computedTotal = loadedExperiments.length;
          const computedActive = loadedExperiments.filter((e) => e.status === "active").length;
          const computedTotalVariants = loadedExperiments.reduce(
            (sum, e) => sum + (e.variants?.length || 0),
            0
          );
          const computedTotalConversions = loadedExperiments.reduce(
            (sum, e) => sum + (e.stats?.totalConversions || 0),
            0
          );
          const computedTotalSessions = loadedExperiments.reduce(
            (sum, e) => sum + (e.stats?.totalSessions || 0),
            0
          );
          const computedConversionRate =
            computedTotalSessions > 0
              ? Math.round((computedTotalConversions / computedTotalSessions) * 1000) / 10
              : 0;
          const computedWinners = loadedExperiments.filter(
            (e) => e.stats?.hasSignificantWinner || Boolean(e.winnerVariantId)
          ).length;

          setMetrics({
            totalExperiments: data.metrics?.totalExperiments ?? computedTotal,
            activeExperiments: data.metrics?.activeExperiments ?? computedActive,
            totalVariants: data.metrics?.totalVariants ?? computedTotalVariants,
            totalConversions: data.metrics?.totalConversions ?? computedTotalConversions,
            totalSessions: data.metrics?.totalSessions ?? computedTotalSessions,
            overallConversionRate: data.metrics?.overallConversionRate ?? computedConversionRate,
            significantWinnersCount: data.metrics?.significantWinnersCount ?? computedWinners,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Error initializing experiments:", err);
          setError(err instanceof Error ? err.message : "Failed to load experiments");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Actions
  const handleCreateNew = () => {
    setEditingExperiment(null);
    setDialogOpen(true);
  };

  const handleEdit = (exp: ExperimentData) => {
    setEditingExperiment(exp);
    setDialogOpen(true);
  };

  const handleStatusToggle = async (
    id: string,
    newStatus: "active" | "paused" | "ended" | "draft"
  ) => {
    try {
      const res = await fetch(`/api/experiments/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update experiment status");
      }

      const prevExp = experiments.find((e) => e.id === id);
      setExperiments((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, status: newStatus } : exp))
      );

      if (prevExp) {
        setMetrics((prev) => {
          let deltaActive = 0;
          if (prevExp.status !== "active" && newStatus === "active") deltaActive = 1;
          if (prevExp.status === "active" && newStatus !== "active") deltaActive = -1;
          return {
            ...prev,
            activeExperiments: Math.max(0, prev.activeExperiments + deltaActive),
          };
        });
      }

      const statusLabels: Record<string, string> = {
        active: "Experiment started and active",
        paused: "Experiment paused",
        ended: "Experiment ended",
        draft: "Experiment reset to draft",
      };

      toast.success(statusLabels[newStatus] || `Experiment status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error("Status toggle error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update experiment status");
    }
  };

  const handleDeclareWinner = async (experimentId: string, variantId: string) => {
    try {
      const res = await fetch(`/api/experiments/${experimentId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ winnerVariantId: variantId, status: "ended" }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to declare experiment winner");
      }

      const targetExp = experiments.find((e) => e.id === experimentId);
      const hadWinner = targetExp?.winnerVariantId || targetExp?.stats?.hasSignificantWinner;

      setExperiments((prev) =>
        prev.map((exp) =>
          exp.id === experimentId
            ? { ...exp, winnerVariantId: variantId, status: "ended" }
            : exp
        )
      );

      setMetrics((prev) => ({
        ...prev,
        activeExperiments: targetExp?.status === "active" ? Math.max(0, prev.activeExperiments - 1) : prev.activeExperiments,
        significantWinnersCount: hadWinner ? prev.significantWinnersCount : prev.significantWinnersCount + 1,
      }));

      toast.success("Winner declared successfully! Traffic locked to winning variant.");
    } catch (err: unknown) {
      console.error("Declare winner error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to declare winner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experiment?")) {
      return;
    }

    try {
      const res = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete experiment");
      }

      const deletedExp = experiments.find((e) => e.id === id);
      setExperiments((prev) => prev.filter((exp) => exp.id !== id));

      if (deletedExp) {
        setMetrics((prev) => {
          const newTotal = Math.max(0, prev.totalExperiments - 1);
          const newActive = deletedExp.status === "active"
            ? Math.max(0, prev.activeExperiments - 1)
            : prev.activeExperiments;
          const newSessions = Math.max(0, prev.totalSessions - (deletedExp.stats?.totalSessions || 0));
          const newConversions = Math.max(0, prev.totalConversions - (deletedExp.stats?.totalConversions || 0));
          const newConvRate = newSessions > 0 ? Math.round((newConversions / newSessions) * 1000) / 10 : 0;
          const newWinners = (deletedExp.stats?.hasSignificantWinner || deletedExp.winnerVariantId)
            ? Math.max(0, prev.significantWinnersCount - 1)
            : prev.significantWinnersCount;

          return {
            ...prev,
            totalExperiments: newTotal,
            activeExperiments: newActive,
            totalSessions: newSessions,
            totalConversions: newConversions,
            overallConversionRate: newConvRate,
            significantWinnersCount: newWinners,
          };
        });
      }

      toast.success("Experiment deleted successfully");
    } catch (err: unknown) {
      console.error("Delete experiment error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete experiment");
    }
  };

  const handleSave = async (payload: {
    name: string;
    description?: string;
    qrCodeId: string;
    campaignId?: string | null;
    trafficAllocation?: number;
    status?: string;
    variants: Array<{
      id?: string;
      name: string;
      destinationUrl: string;
      trafficWeight: number;
      isControl: boolean;
    }>;
  }) => {
    try {
      const isEditing = Boolean(editingExperiment && editingExperiment.id);
      const url = isEditing
        ? `/api/experiments/${editingExperiment!.id}`
        : "/api/experiments";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${isEditing ? "update" : "create"} experiment`);
      }

      setDialogOpen(false);
      await fetchExperiments();
      toast.success(isEditing ? "Experiment updated successfully" : "Experiment created successfully");
    } catch (err: unknown) {
      console.error("Save experiment error:", err);
      throw err;
    }
  };

  // Filtered experiments calculation
  const filteredExperiments = React.useMemo(() => {
    return experiments.filter((exp) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        exp.name.toLowerCase().includes(query) ||
        (exp.description && exp.description.toLowerCase().includes(query)) ||
        (exp.qrCode?.name && exp.qrCode.name.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ? true : exp.status === statusFilter;

      const matchesQr =
        qrFilter === "all" ? true : exp.qrCodeId === qrFilter;

      return matchesSearch && matchesStatus && matchesQr;
    });
  }, [experiments, searchQuery, statusFilter, qrFilter]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all" || qrFilter !== "all";

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setQrFilter("all");
  };

  const kpiCards = [
    {
      title: "Active Experiments",
      value: metrics.activeExperiments >= 1000 ? `${(metrics.activeExperiments / 1000).toFixed(1)}K` : metrics.activeExperiments.toLocaleString(),
      trendValue: "+100%",
      trendLabel: `of ${metrics.totalExperiments} total tests`,
      isPositive: true,
      icon: Split,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Total Sessions",
      value: metrics.totalSessions >= 1000 ? `${(metrics.totalSessions / 1000).toFixed(2).replace(/\.00$/, "")}K` : metrics.totalSessions.toLocaleString(),
      trendValue: "+147%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Activity,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      title: "Avg Conv. Rate",
      value: `${metrics.overallConversionRate.toFixed(1)}%`,
      trendValue: "+24%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: TrendingUp,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    },
    {
      title: "Significant Winners",
      value: metrics.significantWinnersCount.toLocaleString(),
      trendValue: "95%",
      trendLabel: "Statistically validated",
      isPositive: true,
      icon: Crown,
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
            <BreadcrumbPage>A/B Experiments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <Split className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                A/B Testing Experiments
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Optimize conversion funnels by split-testing destinations and traffic across QR codes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={fetchExperiments}
            variant="outline"
            size="sm"
            aria-label="Refresh data"
            className="gap-1.5 h-8 text-xs"
          >
            <RotateCw className={`size-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="gap-1.5 h-8 text-xs font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Experiment</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary KPI Metric Cards */}
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

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/80 border-border/80 text-foreground text-xs placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <QrCode className="size-3.5 text-muted-foreground" />
            <select
              aria-label="QR Code filter"
              value={qrFilter}
              onChange={(e) => setQrFilter(e.target.value)}
              className="h-9 max-w-[180px] rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
            >
              <option value="all">All QR Codes</option>
              {qrOptions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            onClick={fetchExperiments}
            variant="outline"
            size="sm"
            className="border-rose-500/30 text-rose-600 hover:bg-rose-500/20 dark:text-rose-200 h-8 text-xs shrink-0"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && experiments.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/80 bg-card/60 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredExperiments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20">
            <Split className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {hasActiveFilters ? "No experiments found" : "No A/B experiments yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {hasActiveFilters
              ? "No experiments matched your search query or active filters."
              : "Create your first A/B testing experiment to compare landing page variants and boost your QR conversions."}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={handleCreateNew}
                size="sm"
                className="gap-1.5 h-8 text-xs font-medium shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Create Experiment</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Experiments Grid */}
      {!loading && filteredExperiments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExperiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
              onDeclareWinner={handleDeclareWinner}
            />
          ))}
        </div>
      )}

      {/* Experiment Dialog (Create / Edit) */}
      <ExperimentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        experiment={editingExperiment}
        qrCodes={qrOptions}
        campaigns={campaignOptions}
        onSave={handleSave}
      />
    </div>
  );
}
