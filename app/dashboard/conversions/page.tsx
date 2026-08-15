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
import { cn } from "@/lib/utils";
import { useCachedState } from "@/lib/client-cache";

export default function ConversionsDashboardPage() {
  // Goals & Metrics state
  const [goals, setGoals, loading, setLoading] = useCachedState<ConversionGoalData[]>("/api/conversions/goals", []);
  const [metrics, setMetrics] = useCachedState<{
    totalConversions: number;
    totalRevenue: number;
    activeGoalsCount: number;
    overallConversionRate: number;
  }>("/api/conversions/metrics", {
    totalConversions: 0,
    totalRevenue: 0,
    activeGoalsCount: 0,
    overallConversionRate: 0,
  });

  // Lifecycle states
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "paused">("all");
  const [scopeFilter, setScopeFilter] = React.useState<"all" | "global" | "qr_only" | "campaign_only">("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Options for modal dropdowns
  const [qrOptions, setQrOptions] = useCachedState<Array<{ id: string; name: string }>>("/api/qr-codes-options", []);
  const [campaignOptions, setCampaignOptions] = useCachedState<Array<{ id: string; name: string }>>("/api/campaigns-options", []);

  // Dialog states
  const [conversionDialogOpen, setConversionDialogOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<ConversionGoalData | null>(null);
  const [snippetDialogOpen, setSnippetDialogOpen] = React.useState(false);
  const [snippetGoal, setSnippetGoal] = React.useState<ConversionGoalData | null>(null);

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
    } catch (err: unknown) {
      console.error("Error fetching conversion goals:", err);
      setError(err instanceof Error ? err.message : "Failed to load conversion goals");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [qrRes, campRes, convRes] = await Promise.all([
          fetch("/api/qr-codes"),
          fetch("/api/campaigns"),
          fetch("/api/conversions"),
        ]);

        if (qrRes.ok && isMounted) {
          const qrJson = await qrRes.json();
          const items = Array.isArray(qrJson.data)
            ? qrJson.data.map((q: { id: string; name: string }) => ({ id: q.id, name: q.name }))
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

        if (!convRes.ok) {
          const errData = await convRes.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to load conversion goals (HTTP ${convRes.status})`);
        }

        if (isMounted) {
          const data = await convRes.json();
          const loadedGoals: ConversionGoalData[] = data.goals || [];
          setGoals(loadedGoals);

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
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Error initializing conversion goals:", err);
          setError(err instanceof Error ? err.message : "Failed to load conversion goals");
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
    } catch (err: unknown) {
      console.error("Status toggle error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update status");
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
    } catch (err: unknown) {
      console.error("Delete conversion goal error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete conversion goal");
    }
  };

  const handleSaveGoal = async (payload: {
    name: string;
    description?: string;
    eventType: string;
    targetPattern?: string;
    qrCodeId?: string | null;
    campaignId?: string | null;
    monetaryValue?: number;
    currency?: string;
    isActive?: boolean;
  }) => {
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
    } catch (err: unknown) {
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

  const kpiCards = [
    {
      title: "Total Conversions",
      value: metrics.totalConversions >= 1000 ? `${(metrics.totalConversions / 1000).toFixed(2).replace(/\.00$/, "")}K` : metrics.totalConversions.toLocaleString(),
      trendValue: "+147%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Target,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Attributed Revenue",
      value: formattedRevenue,
      trendValue: "+182%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: DollarSign,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    },
    {
      title: "Active Goals",
      value: metrics.activeGoalsCount.toLocaleString(),
      trendValue: "+100%",
      trendLabel: "TRACKING LIVE",
      isPositive: true,
      icon: Activity,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Avg Conv. Rate",
      value: `${metrics.overallConversionRate.toFixed(1)}%`,
      trendValue: "+24%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: Sparkles,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
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
            <BreadcrumbPage>Conversion Goals</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <Target className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Conversion Goals
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track, attribute, and analyze high-value visitor conversion events across your QR campaigns.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleGlobalSnippet}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <Code className="size-3.5 text-primary" />
            <span>Tracking Code</span>
          </Button>

          <Button
            onClick={fetchGoals}
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
            <span>New Goal</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Summary Metric Cards */}
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

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search goals by name or pattern..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border/80 text-foreground text-xs placeholder:text-muted-foreground h-9"
          />
        </div>

        {/* Filters & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="conversions-status-filter"
              className="text-xs font-medium text-muted-foreground hidden sm:inline"
            >
              Status:
            </label>
            <select
              id="conversions-status-filter"
              aria-label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "paused")}
              className="appearance-none rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 pr-8 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary h-9"
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
              className="text-xs font-medium text-muted-foreground hidden sm:inline"
            >
              Scope:
            </label>
            <select
              id="conversions-scope-filter"
              aria-label="Scope"
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as "all" | "global" | "qr_only" | "campaign_only")}
              className="appearance-none rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 pr-8 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary h-9"
            >
              <option value="all">All Scopes</option>
              <option value="global">Global Only</option>
              <option value="qr_only">QR Specific</option>
              <option value="campaign_only">Campaign Specific</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border/80 bg-background/80 p-0.5 h-9">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "list"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Fallback Banner */}
      {error && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Failed to load conversion goals</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGoals}
            className="border-rose-500/30 text-xs font-medium text-rose-600 hover:bg-rose-500/20 dark:text-rose-200 h-8"
          >
            <RotateCw className="mr-1.5 size-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {loading && goals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl bg-card/60" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
            <Target className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchQuery || statusFilter !== "all" || scopeFilter !== "all"
              ? "No matching conversion goals found"
              : "No conversion goals created yet"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-5">
            {searchQuery || statusFilter !== "all" || scopeFilter !== "all"
              ? "Try adjusting your search terms or filter criteria."
              : "Define custom action triggers to measure and attribute conversions generated by your QR code traffic."}
          </p>
          {!searchQuery && statusFilter === "all" && scopeFilter === "all" && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="gap-1.5 h-8 text-xs font-medium shadow-xs"
            >
              <Plus className="size-3.5" />
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
