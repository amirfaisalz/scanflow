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

interface ExperimentsViewProps {
  initialExperiments: ExperimentData[];
  initialMetrics: {
    totalExperiments: number;
    activeExperiments: number;
    totalVariants: number;
    totalConversions: number;
    totalSessions: number;
    overallConversionRate: number;
    significantWinnersCount: number;
  };
  qrOptions: Array<{ id: string; name: string; destinationUrl?: string }>;
  campaignOptions: Array<{ id: string; name: string }>;
}

export function ExperimentsView({
  initialExperiments,
  initialMetrics,
  qrOptions,
  campaignOptions,
}: ExperimentsViewProps) {
  // Experiments & Metrics state
  const [experiments, setExperiments] = React.useState<ExperimentData[]>(initialExperiments);
  const [metrics, setMetrics] = React.useState(initialMetrics);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [qrFilter, setQrFilter] = React.useState<string>("all");

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

  // Action handlers
  const handleCreateNew = () => {
    setEditingExperiment(null);
    setDialogOpen(true);
  };

  const handleEdit = (exp: ExperimentData) => {
    setEditingExperiment(exp);
    setDialogOpen(true);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "draft" | "active" | "paused" | "ended"
  ) => {
    try {
      const res = await fetch(`/api/experiments/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setExperiments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(`Experiment status set to ${newStatus}`);
    } catch (err: unknown) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDeclareWinner = async (experimentId: string, variantId: string) => {
    try {
      const res = await fetch(`/api/experiments/${experimentId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          winnerVariantId: variantId,
          status: "completed",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to declare winner");
      }

      setExperiments((prev) =>
        prev.map((e) =>
          e.id === experimentId
            ? { ...e, winnerVariantId: variantId, status: "completed" as const }
            : e
        )
      );
      toast.success("Winner declared! Traffic is now locked to winning variant.");
    } catch (err: unknown) {
      console.error("Declare winner error:", err);
      toast.error("Failed to declare winner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this A/B experiment? Traffic will revert to default QR target.")) {
      return;
    }

    try {
      const res = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete experiment");
      }

      setExperiments((prev) => prev.filter((e) => e.id !== id));
      toast.success("Experiment deleted");
    } catch (err: unknown) {
      console.error("Delete experiment error:", err);
      toast.error("Failed to delete experiment");
    }
  };

  const handleSaveExperiment = async (payload: {
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 shadow-2xs hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
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

              <div className="my-3">
                <div className="text-3xl font-bold tracking-tight text-foreground font-sans">
                  {card.value}
                </div>
              </div>

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
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search experiments by title or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border/80 text-foreground text-xs placeholder:text-muted-foreground h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="experiments-status-filter"
              className="text-xs font-medium text-muted-foreground hidden sm:inline"
            >
              Status:
            </label>
            <select
              id="experiments-status-filter"
              aria-label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 pr-8 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary h-9"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active (Running)</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended / Won</option>
            </select>
          </div>

          {/* QR Code Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="experiments-qr-filter"
              className="text-xs font-medium text-muted-foreground hidden sm:inline"
            >
              QR Code:
            </label>
            <select
              id="experiments-qr-filter"
              aria-label="QR Code"
              value={qrFilter}
              onChange={(e) => setQrFilter(e.target.value)}
              className="appearance-none rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 pr-8 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary h-9 max-w-[180px] truncate"
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
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Error Fallback Banner */}
      {error && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Failed to load experiments</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExperiments}
            className="border-rose-500/30 text-xs font-medium text-rose-600 hover:bg-rose-500/20 dark:text-rose-200 h-8"
          >
            <RotateCw className="mr-1.5 size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {loading && experiments.length === 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-card/60" />
          ))}
        </div>
      ) : filteredExperiments.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
            <Split className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {hasActiveFilters
              ? "No matching experiments found"
              : "No A/B experiments created yet"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-5">
            {hasActiveFilters
              ? "Try adjusting your search terms or filter criteria."
              : "Set up multi-variant traffic splits on your dynamic QR codes to scientifically identify winning landing pages and lift conversions."}
          </p>
          {!hasActiveFilters && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="gap-1.5 h-8 text-xs font-medium shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Create A/B Experiment</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredExperiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusToggle={handleStatusChange}
              onDeclareWinner={handleDeclareWinner}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Experiment Modal Dialog */}
      <ExperimentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        experiment={editingExperiment}
        qrCodes={qrOptions}
        campaigns={campaignOptions}
        onSave={handleSaveExperiment}
      />
    </div>
  );
}
