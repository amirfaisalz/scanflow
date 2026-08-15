"use client";

import * as React from "react";
import {
  FolderGit2,
  Plus,
  Search,
  RefreshCw,
  QrCode,
  BarChart3,
  Sparkles,
  Layers,
  Filter,
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
import { CampaignCard, CampaignData } from "@/components/campaigns/campaign-card";
import { CampaignDialog } from "@/components/campaigns/campaign-dialog";
import { toast } from "sonner";

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
    fetchCampaigns();
  }, [fetchCampaigns]);

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

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-sky-400" />
            <span>Campaigns Management</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Organize dynamic QR codes into cohesive promotional campaigns and track group performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchCampaigns}
            variant="outline"
            size="sm"
            className="border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="bg-sky-600 hover:bg-sky-500 text-white gap-1.5 h-9 font-medium shadow-md shadow-sky-950/40"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Campaigns</span>
            <FolderGit2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100 font-mono">
            {totalCampaigns}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Grouped marketing initiatives</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Campaigns</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {activeCampaigns}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Currently collecting traffic</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Campaign Scans</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-300 font-mono">
            {totalScans.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Across all assigned QR codes</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Avg Conv. Rate</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300 font-mono">
            {avgConversionRate}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Goal completion average</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search campaigns by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-200 text-sm placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-zinc-950/60 border-zinc-800 text-zinc-300 text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="paused">Paused Only</SelectItem>
              <SelectItem value="archived">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading && campaigns.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/40 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mb-3" />
          <span className="text-xs text-zinc-500 font-mono">Loading campaigns...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4">
            <FolderGit2 className="h-6 w-6 text-zinc-500" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">
            {searchQuery ? "No matching campaigns found" : "No campaigns created yet"}
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-5">
            {searchQuery
              ? "Try adjusting your search query or filter criteria."
              : "Create your first promotional campaign to organize QR codes and monitor collective performance."}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="bg-sky-600 hover:bg-sky-500 text-white gap-1.5 h-9"
            >
              <Plus className="h-4 w-4" />
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
