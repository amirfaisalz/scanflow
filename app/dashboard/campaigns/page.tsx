"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Search,
  RefreshCw,
  QrCode,
  BarChart3,
  Sparkles,
  Layers,
  TrendingUpIcon,
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

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FolderGit2 className="h-6 w-6 text-sky-500" />
              <span>Campaigns Management</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Isolated Tenant
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize dynamic QR codes into cohesive promotional campaigns and track group performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchCampaigns}
            variant="outline"
            size="sm"
            className="gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="gap-1.5 h-9 font-medium shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards Row - Styled identically to /dashboard */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        {/* Total Campaigns */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <FolderGit2 className="size-3.5 text-primary" />
                Total Campaigns
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs">
                  Organization
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 font-mono">
              {totalCampaigns}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Grouped promotional initiatives</span>
            </div>
            <div>Multi-QR campaign structures</div>
          </CardFooter>
        </Card>

        {/* Active Campaigns */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <Layers className="size-3.5 text-emerald-500" />
                Active Campaigns
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                  <TrendingUpIcon className="size-3 mr-1 text-emerald-500" />
                  Active Groups
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
              {activeCampaigns}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Currently collecting scans</span>
            </div>
            <div>Accepting live visitor traffic</div>
          </CardFooter>
        </Card>

        {/* Total Campaign Scans */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <BarChart3 className="size-3.5 text-sky-500" />
                Total Campaign Scans
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs">
                  Traffic Sum
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 font-mono">
              {totalScans.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Across all assigned QR codes</span>
            </div>
            <div>Dynamic redirect volume</div>
          </CardFooter>
        </Card>

        {/* Avg Conv. Rate */}
        <Card className="@container/card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardDescription className="flex items-center gap-1.5 font-medium">
                <Sparkles className="size-3.5 text-primary" />
                Avg Conv. Rate
              </CardDescription>
              <CardAction>
                <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
                  <Sparkles className="size-3 mr-1" />
                  Performance
                </Badge>
              </CardAction>
            </div>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1 font-mono">
              {avgConversionRate}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 font-medium text-foreground">
              <span>Goal completion average</span>
            </div>
            <div>Conversion event efficiency</div>
          </CardFooter>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background border-input text-foreground text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
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
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-card/40 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
          <span className="text-xs text-muted-foreground font-mono">Loading campaigns...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-border mb-4">
            <FolderGit2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchQuery ? "No matching campaigns found" : "No campaigns created yet"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-5">
            {searchQuery
              ? "Try adjusting your search query or filter criteria."
              : "Create your first promotional campaign to organize QR codes and monitor collective performance."}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleCreateNew}
              size="sm"
              className="gap-1.5 h-9 font-medium shadow-xs"
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
