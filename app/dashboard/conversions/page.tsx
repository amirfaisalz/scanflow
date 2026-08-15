"use client";

import * as React from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  RotateCw,
  Sparkles,
  DollarSign,
  TrendingUp,
  Activity,
  Code,
  LayoutGrid,
  List,
  AlertCircle,
  Filter,
  Layers,
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
  ConversionCard,
  ConversionGoalData,
  ConversionDialog,
  SnippetDialog,
} from "@/components/conversions";

export default function ConversionsDashboardPage() {
  // Goals & Metrics state
  const [goals, setGoals] = React.useState<ConversionGoalData[]>([]);
  const [metrics, setMetrics] = React.useState<{
    totalConversions: number;
    totalRevenue: number;
    activeGoalsCount: number;
    overallConversionRate: number;
  }>({
    totalConversions: 0,
    totalRevenue: 0,
    activeGoalsCount: 0,
    overallConversionRate: 0,
  });

  // Lifecycle states
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "paused">("all");
  const [scopeFilter, setScopeFilter] = React.useState<"all" | "global" | "qr_only" | "campaign_only">("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Options for modal dropdowns
  const [qrOptions, setQrOptions] = React.useState<Array<{ id: string; name: string }>>([]);
  const [campaignOptions, setCampaignOptions] = React.useState<Array<{ id: string; name: string }>>([]);

  // Dialog states
  const [conversionDialogOpen, setConversionDialogOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<ConversionGoalData | null>(null);
  const [snippetDialogOpen, setSnippetDialogOpen] = React.useState(false);
  const [snippetGoal, setSnippetGoal] = React.useState<ConversionGoalData | null>(null);

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
          ? qrJson.data.map((q: any) => ({ id: q.id, name: q.name }))
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
      console.error("Failed to load options for conversions:", err);
    }
  }, []);

  // Fetch Conversion Goals and aggregate metrics
  const fetchGoals = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/conversions");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load conversion goals (HTTP ${res.status})`);
      }

      const data = await res.json();
      const loadedGoals: ConversionGoalData[] = data.goals || [];
      setGoals(loadedGoals);

      // Compute or use server-provided aggregate metrics
      const computedTotalConversions =
        data.metrics?.totalConversions ??
        loadedGoals.reduce((sum, g) => sum + (g.totalConversions || 0), 0);
      const computedTotalRevenue =
        data.metrics?.totalRevenue ??
        loadedGoals.reduce((sum, g) => sum + (g.totalRevenue || 0), 0);
      const computedActiveGoals =
        data.metrics?.activeGoalsCount ??
        loadedGoals.filter((g) => g.isActive).length;
      const computedConversionRate =
        data.metrics?.overallConversionRate ??
        (loadedGoals.length > 0
          ? Math.round(
              (loadedGoals.reduce((sum, g) => sum + (g.conversionRate || 0), 0) /
                loadedGoals.length) *
                10
            ) / 10
          : 0);

      setMetrics({
        totalConversions: computedTotalConversions,
        totalRevenue: computedTotalRevenue,
        activeGoalsCount: computedActiveGoals,
        overallConversionRate: computedConversionRate,
      });
    } catch (err: any) {
      console.error("Error fetching conversion goals:", err);
      setError(err?.message || "Failed to load conversion goals");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFilterOptions();
    fetchGoals();
  }, [fetchFilterOptions, fetchGoals]);

  // Actions
  const handleCreateNew = () => {
    setEditingGoal(null);
    setConversionDialogOpen(true);
  };

  const handleEdit = (goal: ConversionGoalData) => {
    setEditingGoal(goal);
    setConversionDialogOpen(true);
  };

  const handleViewSnippet = (goal: ConversionGoalData) => {
    setSnippetGoal(goal);
    setSnippetDialogOpen(true);
  };

  const handleGlobalSnippet = () => {
    setSnippetGoal({
      id: "global",
      name: "Global Conversion Tracker",
      description: "Default workspace-wide conversion tracking event",
      eventType: "CONVERSION",
      monetaryValue: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setSnippetDialogOpen(true);
  };

  const handleStatusToggle = async (id: string, newActive: boolean) => {
    try {
      const res = await fetch(`/api/conversions/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (!res.ok) {
        throw new Error("Failed to update goal status");
      }

      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isActive: newActive } : g))
      );
      setMetrics((prev) => ({
        ...prev,
        activeGoalsCount: newActive
          ? prev.activeGoalsCount + 1
          : Math.max(0, prev.activeGoalsCount - 1),
      }));

      toast.success(newActive ? "Conversion goal activated" : "Conversion goal deactivated");
    } catch (err: any) {
      console.error("Status toggle error:", err);
      toast.error(err?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversion goal?")) {
      return;
    }

    try {
      const res = await fetch(`/api/conversions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete conversion goal");
      }

      const deletedGoal = goals.find((g) => g.id === id);
      setGoals((prev) => prev.filter((g) => g.id !== id));

      if (deletedGoal) {
        setMetrics((prev) => ({
          ...prev,
          totalConversions: Math.max(0, prev.totalConversions - (deletedGoal.totalConversions || 0)),
          totalRevenue: Math.max(0, prev.totalRevenue - (deletedGoal.totalRevenue || 0)),
          activeGoalsCount: deletedGoal.isActive
            ? Math.max(0, prev.activeGoalsCount - 1)
            : prev.activeGoalsCount,
        }));
      }

      toast.success("Conversion goal deleted successfully");
    } catch (err: any) {
      console.error("Delete conversion goal error:", err);
      toast.error(err?.message || "Failed to delete conversion goal");
    }
  };

  const handleSaveGoal = async (payload: any) => {
    try {
      const isEditing = Boolean(editingGoal && editingGoal.id);
      const url = isEditing
        ? `/api/conversions/${editingGoal!.id}`
        : "/api/conversions";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save conversion goal");
      }

      setConversionDialogOpen(false);
      await fetchGoals();
      toast.success(isEditing ? "Conversion goal updated" : "Conversion goal created");
    } catch (err: any) {
      console.error("Save goal error:", err);
      throw err;
    }
  };

  // Filtered goals calculation
  const filteredGoals = React.useMemo(() => {
    return goals.filter((g) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        g.name.toLowerCase().includes(query) ||
        (g.description && g.description.toLowerCase().includes(query)) ||
        (g.targetPattern && g.targetPattern.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? g.isActive
          : !g.isActive;

      const matchesScope =
        scopeFilter === "all"
          ? true
          : scopeFilter === "global"
          ? !g.qrCodeId && !g.campaignId
          : scopeFilter === "qr_only"
          ? Boolean(g.qrCodeId)
          : scopeFilter === "campaign_only"
          ? Boolean(g.campaignId)
          : true;

      return matchesSearch && matchesStatus && matchesScope;
    });
  }, [goals, searchQuery, statusFilter, scopeFilter]);

  const formattedRevenue = `$${metrics.totalRevenue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
            <BreadcrumbPage>Conversion Goals</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Target className="h-6 w-6 text-sky-500" />
              <span>Conversion Goals</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Isolated Tenant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track, attribute, and analyze high-value visitor conversion events across your QR campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleGlobalSnippet}
            variant="outline"
            size="sm"
            className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 gap-1.5 h-9"
          >
            <Code className="h-4 w-4 text-sky-500" />
            <span>Tracking Code</span>
          </Button>

          <Button
            onClick={fetchGoals}
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
            <span>New Goal</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversions */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Conversions</span>
            <Target className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {metrics.totalConversions.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Goal actions completed</span>
        </div>

        {/* Attributed Revenue */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Attributed Revenue</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {formattedRevenue}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Monetary value generated</span>
        </div>

        {/* Active Goals */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Goals</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics.activeGoalsCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Active tracking instances</span>
        </div>

        {/* Overall Conv. Rate */}
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Avg Conv. Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-300 font-mono">
            {metrics.overallConversionRate}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Visitor to goal completion</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search goals by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-xs placeholder:text-zinc-400 h-9"
          />
        </div>

        {/* Filters & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="conversions-status-filter"
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline"
            >
              Status:
            </label>
            <select
              id="conversions-status-filter"
              aria-label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-zinc-800 transition-colors focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 h-9"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="paused">Paused / Inactive</option>
            </select>
          </div>

          {/* Scope Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="conversions-scope-filter"
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hidden sm:inline"
            >
              Scope:
            </label>
            <select
              id="conversions-scope-filter"
              aria-label="Scope"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as any)}
              className="appearance-none rounded-lg border border-zinc-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-zinc-800 transition-colors focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 h-9"
            >
              <option value="all">All Scopes</option>
              <option value="global">Global Only</option>
              <option value="qr_only">QR Specific</option>
              <option value="campaign_only">Campaign Specific</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900 h-9">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-medium"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "list"
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-medium"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Fallback Banner */}
      {error && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800 shadow-sm backdrop-blur-md dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Failed to load conversion goals</p>
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGoals}
            className="border-rose-200 bg-white text-xs font-medium text-rose-700 hover:bg-rose-100 hover:text-rose-900 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Main Content Area: Loading Skeletons / Empty State / Goal Cards */}
      {loading && goals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center bg-white/40 dark:bg-zinc-950/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-4">
            <Target className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {searchQuery || statusFilter !== "all" || scopeFilter !== "all"
              ? "No matching conversion goals found"
              : "No conversion goals created yet"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-5">
            {searchQuery || statusFilter !== "all" || scopeFilter !== "all"
              ? "Try adjusting your search terms or filter criteria."
              : "Define custom action triggers to measure and attribute high-intent conversions generated by your QR code traffic."}
          </p>
          {!searchQuery && statusFilter === "all" && scopeFilter === "all" && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="bg-sky-600 hover:bg-sky-500 text-white gap-1.5 h-9"
            >
              <Plus className="h-4 w-4" />
              <span>Create Conversion Goal</span>
            </Button>
          )}
        </div>
      ) : (
        <div
          data-testid="conversions-container"
          data-view={viewMode}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "flex flex-col gap-4"
          }
        >
          {filteredGoals.map((goal) => (
            <ConversionCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
              onViewSnippet={handleViewSnippet}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Conversion Goal Modal Dialog */}
      <ConversionDialog
        open={conversionDialogOpen}
        onOpenChange={setConversionDialogOpen}
        goal={editingGoal}
        qrCodes={qrOptions}
        campaigns={campaignOptions}
        onSave={handleSaveGoal}
      />

      {/* Snippet Code Integration Modal Dialog */}
      <SnippetDialog
        open={snippetDialogOpen}
        onOpenChange={setSnippetDialogOpen}
        goal={snippetGoal}
      />
    </div>
  );
}
