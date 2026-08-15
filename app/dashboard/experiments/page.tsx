"use client";

import * as React from "react";
import Link from "next/link";
import {
  Split,
  Plus,
  Search,
  RotateCw,
  Sparkles,
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

  // Fetch filter options (QR codes & Campaigns) on mount
  const fetchFilterOptions = React.useCallback(async () => {
    try {
      const [qrRes, campRes] = await Promise.all([
        fetch("/api/qr-codes"),
        fetch("/api/campaigns"),
      ]);

      if (qrRes.ok) {
        const qrJson = await qrRes.json();
        const items = Array.isArray(qrJson.data)
          ? qrJson.data.map((q: any) => ({
              id: q.id,
              name: q.name,
              destinationUrl: q.destinationUrl,
            }))
          : [];
        setQrOptions(items);
      }

      if (campRes.ok) {
        const campJson = await campRes.json();
        const items = Array.isArray(campJson.campaigns)
          ? campJson.campaigns.map((c: any) => ({ id: c.id, name: c.name }))
          : [];
        setCampaignOptions(items);
      }
    } catch (err) {
      console.error("Failed to load options for experiments:", err);
    }
  }, []);

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

      // Compute or use server-provided aggregate metrics
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
    } catch (err: any) {
      console.error("Error fetching experiments:", err);
      setError(err?.message || "Failed to load experiments");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFilterOptions();
    fetchExperiments();
  }, [fetchFilterOptions, fetchExperiments]);

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
    } catch (err: any) {
      console.error("Status toggle error:", err);
      toast.error(err?.message || "Failed to update experiment status");
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
    } catch (err: any) {
      console.error("Declare winner error:", err);
      toast.error(err?.message || "Failed to declare winner");
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
    } catch (err: any) {
      console.error("Delete experiment error:", err);
      toast.error(err?.message || "Failed to delete experiment");
    }
  };

  const handleSave = async (payload: any) => {
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
    } catch (err: any) {
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

      {/* Header Section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Split className="h-6 w-6 text-sky-500" />
              <span>A/B Testing Experiments</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Isolated Tenant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Optimize your conversion funnels by split-testing destinations and traffic across QR codes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={fetchExperiments}
            variant="outline"
            size="sm"
            aria-label="Refresh data"
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 gap-1.5 h-9"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-500" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="bg-sky-600 hover:bg-sky-500 text-white gap-1.5 h-9 font-medium shadow-md shadow-sky-950/40"
          >
            <Plus className="h-4 w-4" />
            <span>New Experiment</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Experiments */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Experiments</span>
            <Split className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {metrics.activeExperiments.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            of {metrics.totalExperiments} total tests
          </span>
        </div>

        {/* Total Sessions */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Sessions</span>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {metrics.totalSessions.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Tracked split sessions
          </span>
        </div>

        {/* Overall Conversion Rate */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Avg Conv. Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {metrics.overallConversionRate}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Across all experiments
          </span>
        </div>

        {/* Significant Winners */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Significant Winners</span>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {metrics.significantWinnersCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Statistically validated
          </span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white/50 p-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search experiments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <select
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <QrCode className="h-3.5 w-3.5 text-zinc-400" />
            <select
              aria-label="QR Code filter"
              value={qrFilter}
              onChange={(e) => setQrFilter(e.target.value)}
              className="h-9 max-w-[180px] rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 truncate"
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
              className="h-9 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            onClick={fetchExperiments}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-600 hover:bg-red-500/20 dark:text-red-300 h-8 text-xs shrink-0"
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
              className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40 bg-zinc-800" />
                <Skeleton className="h-5 w-16 bg-zinc-800" />
              </div>
              <Skeleton className="h-3 w-full bg-zinc-800" />
              <Skeleton className="h-3 w-3/4 bg-zinc-800" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-12 w-full bg-zinc-800" />
                <Skeleton className="h-12 w-full bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredExperiments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500 mb-4 border border-sky-500/20">
            <Split className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {hasActiveFilters ? "No experiments found" : "No A/B experiments yet"}
          </h3>
          <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {hasActiveFilters
              ? "No experiments matched your search query or active filters."
              : "Create your first A/B testing experiment to compare landing page variants and boost your QR conversions."}
          </p>
          <div className="mt-6 flex items-center gap-3">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 text-xs"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={handleCreateNew}
                size="sm"
                className="bg-sky-600 hover:bg-sky-500 text-white gap-1.5 h-9 font-medium shadow-md shadow-sky-950/40"
              >
                <Plus className="h-4 w-4" />
                <span>Create Experiment</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Experiments Grid */}
      {!loading && filteredExperiments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
