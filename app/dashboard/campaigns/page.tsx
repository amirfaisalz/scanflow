"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  RefreshCw,
  BarChart3,
  Sparkles,
  Layers,
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
import { CampaignCard, CampaignData } from "@/components/campaigns/campaign-card";
import { CampaignDialog } from "@/components/campaigns/campaign-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<CampaignData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<CampaignData | null>(null);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok && isMounted) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error("Failed to load campaigns:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateNew = () => {
    setEditingCampaign(null);
    setDialogOpen(true);
  };

  const handleEdit = (camp: CampaignData) => {
    setEditingCampaign(camp);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? Associated QR codes will be unlinked.")) {
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        toast.success("Campaign deleted successfully");
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch {
      toast.error("Network error when deleting campaign");
    }
  };

  const handleStatusToggle = async (id: string, newStatus: "active" | "paused" | "archived") => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        toast.success(`Campaign marked as ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error updating status");
    }
  };

  const filteredCampaigns = React.useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ? true : c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Summary Metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalScans = campaigns.reduce((sum, c) => sum + (c.totalScans || 0), 0);
  const avgConversionRate =
    campaigns.length > 0
      ? Math.round(
          (campaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / campaigns.length) * 10
        ) / 10
      : 0;

  const kpiCards = [
    {
      title: "Total Campaigns",
      value: totalCampaigns >= 1000 ? `${(totalCampaigns / 1000).toFixed(1)}K` : totalCampaigns.toLocaleString(),
      trendValue: "+100%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: FolderGit2,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Active Campaigns",
      value: activeCampaigns >= 1000 ? `${(activeCampaigns / 1000).toFixed(1)}K` : activeCampaigns.toLocaleString(),
      trendValue: "+100%",
      trendLabel: "ACTIVE IN SYSTEM",
      isPositive: true,
      icon: Layers,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Campaign Scans",
      value: totalScans >= 1000 ? `${(totalScans / 1000).toFixed(2).replace(/\.00$/, "")}K` : totalScans.toLocaleString(),
      trendValue: "+147%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: BarChart3,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      title: "Avg Conv. Rate",
      value: `${avgConversionRate.toFixed(1)}%`,
      trendValue: "+18%",
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
            <BreadcrumbPage>Campaigns</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <FolderGit2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Campaigns Management
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize dynamic QR codes into promotional campaigns and monitor collective group metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchCampaigns}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="gap-1.5 h-8 text-xs font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards Row */}
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
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80 border-border/80 text-foreground text-xs placeholder:text-muted-foreground h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val); }}>
            <SelectTrigger className="w-[140px] bg-background/80 border-border/80 text-foreground text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="active" className="text-xs">Active Only</SelectItem>
              <SelectItem value="paused" className="text-xs">Paused Only</SelectItem>
              <SelectItem value="archived" className="text-xs">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading && campaigns.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/40 p-8">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
          <span className="text-xs text-muted-foreground font-mono">Loading campaigns...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
            <FolderGit2 className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchQuery ? "No matching campaigns found" : "No campaigns created yet"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-5">
            {searchQuery
              ? "Try adjusting your search query or filter criteria."
              : "Create your first promotional campaign to organize QR codes and monitor collective performance."}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="gap-1.5 h-8 text-xs font-medium shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Create Campaign</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Campaign Dialog */}
      <CampaignDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) fetchCampaigns();
        }}
        campaign={editingCampaign}
      />
    </div>
  );
}
