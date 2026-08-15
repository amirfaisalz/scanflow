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

interface CampaignsViewProps {
  initialCampaigns: CampaignData[];
}

export function CampaignsView({ initialCampaigns }: CampaignsViewProps) {
  const [campaigns, setCampaigns] = React.useState<CampaignData[]>(initialCampaigns);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(false);

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

  const handleSaveCampaign = async (data: { name: string; description?: string; status: string }) => {
    try {
      const isEditing = Boolean(editingCampaign && editingCampaign.id);
      const url = isEditing ? `/api/campaigns/${editingCampaign!.id}` : "/api/campaigns";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save campaign");
      }

      setDialogOpen(false);
      await fetchCampaigns();
      toast.success(isEditing ? "Campaign updated successfully" : "Campaign created successfully");
    } catch (err) {
      console.error("Save campaign error:", err);
      toast.error("Failed to save campaign");
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
            className="h-8 gap-1 text-xs"
            disabled={loading}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button onClick={handleCreateNew} size="sm" className="h-8 gap-1.5 text-xs shadow-xs">
            <Plus className="size-3.5" />
            <span>New Campaign</span>
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
            placeholder="Search campaigns by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/80"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val); }}>
            <SelectTrigger className="w-36 h-9 text-xs rounded-xl bg-background/50 border-border/80">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Active Only
              </SelectItem>
              <SelectItem value="paused" className="text-xs">
                Paused Only
              </SelectItem>
              <SelectItem value="archived" className="text-xs">
                Archived Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-md">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <FolderGit2 className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No campaigns found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery || statusFilter !== "all"
              ? "Try clearing your search query or changing status filters."
              : "Group your QR codes into marketing campaigns to track collective performance."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={handleCreateNew} size="sm" className="mt-4 gap-1.5 h-8 text-xs">
              <Plus className="size-3.5" />
              New Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
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

      {/* Create / Edit Dialog */}
      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        onSave={handleSaveCampaign}
      />
    </div>
  );
}
