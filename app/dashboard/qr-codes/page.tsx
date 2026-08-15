"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  QrCode as QrIcon,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  BarChart3,
  Layers,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { QRCard } from "@/components/qr/qr-card";
import { QRBuilderDialog } from "@/components/qr/qr-builder-dialog";
import { QRExportDialog } from "@/components/qr/qr-export-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildRedirectUrl } from "@/lib/qr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = React.useState<QRCodeModel[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Dialog states
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [editingQr, setEditingQr] = React.useState<QRCodeModel | null>(null);
  const [exportQr, setExportQr] = React.useState<QRCodeModel | null>(null);

  const fetchQrCodes = React.useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/qr-codes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch QR codes");
      const json = await res.json();
      setQrCodes(json.data || []);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast.error("Failed to load QR codes");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  React.useEffect(() => {
    let ignore = false;
    const load = async () => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      try {
        const res = await fetch(`/api/qr-codes?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch QR codes");
        const json = await res.json();
        if (!ignore) {
          setQrCodes(json.data || []);
        }
      } catch (err) {
        console.error("Error loading QR codes:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [searchQuery, statusFilter]);

  const handleCreateNew = () => {
    setEditingQr(null);
    setBuilderOpen(true);
  };

  const handleEdit = (qr: QRCodeModel) => {
    setEditingQr(qr);
    setBuilderOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code? Existing dynamic redirects will stop working.")) {
      return;
    }

    try {
      const res = await fetch(`/api/qr-codes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete QR code");

      toast.success("QR Code deleted successfully");
      setQrCodes((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete QR code");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/qr-codes/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to duplicate QR code");
      const json = await res.json();

      toast.success("QR Code duplicated!");
      setQrCodes((prev) => [json.data, ...prev]);
    } catch (error) {
      console.error("Duplicate error:", error);
      toast.error("Failed to duplicate QR code");
    }
  };

  const handleStatusToggle = async (id: string, newStatus: "active" | "paused" | "archived") => {
    try {
      const res = await fetch(`/api/qr-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const json = await res.json();

      toast.success(`QR code status updated to ${newStatus}`);
      setQrCodes((prev) => prev.map((q) => (q.id === id ? json.data : q)));
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredCodes = qrCodes;

  // KPI calculations
  const totalCount = qrCodes.length;
  const activeCount = qrCodes.filter((q) => q.status === "active").length;
  const totalScans = qrCodes.reduce((sum, q) => sum + (q.scanCount || 0), 0);
  const dynamicCount = qrCodes.length;

  const kpiCards = [
    {
      title: "Total QR Codes",
      value: totalCount >= 1000 ? `${(totalCount / 1000).toFixed(1)}K` : totalCount.toLocaleString(),
      trendValue: "+100%",
      trendLabel: "IN REGISTRY",
      isPositive: true,
      icon: QrIcon,
      iconColor: "text-rose-500 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-500/15",
    },
    {
      title: "Active Codes",
      value: activeCount >= 1000 ? `${(activeCount / 1000).toFixed(1)}K` : activeCount.toLocaleString(),
      trendValue: "+100%",
      trendLabel: "LIVE ROUTING",
      isPositive: true,
      icon: Layers,
      iconColor: "text-sky-500 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-500/15",
    },
    {
      title: "Total Scans",
      value: totalScans >= 1000 ? `${(totalScans / 1000).toFixed(2).replace(/\.00$/, "")}K` : totalScans.toLocaleString(),
      trendValue: "+147%",
      trendLabel: "VS PREV. 28 DAYS",
      isPositive: true,
      icon: BarChart3,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    },
    {
      title: "Dynamic Routing",
      value: dynamicCount.toLocaleString(),
      trendValue: "100%",
      trendLabel: "PROGRAMMABLE",
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
            <BreadcrumbPage>QR Codes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center font-bold text-sm">
            <QrIcon className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Dynamic QR Codes
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create, customize, and route visitors with dynamic redirect destinations and custom branding.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchQrCodes(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleCreateNew}
            size="sm"
            className="gap-1.5 h-8 text-xs font-medium shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>Create QR Code</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
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

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, or destination URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background/80 border-border/80 text-foreground text-xs placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="h-9 bg-muted/60">
              <TabsTrigger value="all" className="text-xs px-2.5">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-2.5">
                Active
              </TabsTrigger>
              <TabsTrigger value="paused" className="text-xs px-2.5">
                Paused
              </TabsTrigger>
              <TabsTrigger value="archived" className="text-xs px-2.5">
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View Toggle */}
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
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-border/60 bg-card/40 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCodes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 my-2">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
            <QrIcon className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No QR codes found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-5">
            {searchQuery || statusFilter !== "all"
              ? "No QR codes match your active filters. Try adjusting search or status criteria."
              : "Generate your first dynamic QR code to start tracking scans and routing visitors dynamically."}
          </p>
          <Button onClick={handleCreateNew} size="sm" className="gap-1.5 h-8 text-xs font-medium shadow-xs">
            <Plus className="size-3.5" />
            <span>Create Your First QR Code</span>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCodes.map((qr) => (
            <QRCard
              key={qr.id}
              qrCode={qr}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      ) : (
        /* Compact Table View */
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead className="w-[240px] text-muted-foreground font-semibold text-xs">QR Code &amp; Slug</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Destination URL</TableHead>
                <TableHead className="w-[100px] text-muted-foreground font-semibold text-xs">Status</TableHead>
                <TableHead className="w-[90px] text-right text-muted-foreground font-semibold text-xs">Scans</TableHead>
                <TableHead className="w-[140px] text-right text-muted-foreground font-semibold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.map((qr) => {
                const redirectUrl = buildRedirectUrl(qr.slug);
                return (
                  <TableRow key={qr.id} className="border-border/60 hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="size-8 rounded-lg border border-border/60 p-0.5 shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: qr.backgroundColor }}
                        >
                          <QrIcon className="size-4" style={{ color: qr.foregroundColor }} />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-foreground truncate">{qr.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">/r/{qr.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={qr.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline font-mono truncate max-w-[280px] inline-flex items-center gap-1"
                      >
                        {qr.destinationUrl}
                        <ExternalLink className="size-3 shrink-0 opacity-70" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          qr.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : qr.status === "paused"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {qr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs font-mono">
                      {qr.scanCount || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(redirectUrl);
                            toast.success("Short URL copied");
                          }}
                          title="Copy Link"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setExportQr(qr)}
                          title="Export PNG / SVG"
                        >
                          <Download className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEdit(qr)}
                          title="Edit"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(qr.id)}
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* QR Builder Modal */}
      <QRBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        initialData={editingQr}
        onSuccess={() => fetchQrCodes()}
      />

      {/* QR Export Modal */}
      {exportQr && (
        <QRExportDialog
          open={Boolean(exportQr)}
          onOpenChange={(open) => !open && setExportQr(null)}
          name={exportQr.name}
          slug={exportQr.slug}
          destinationUrl={exportQr.destinationUrl}
          foregroundColor={exportQr.foregroundColor}
          backgroundColor={exportQr.backgroundColor}
        />
      )}
    </div>
  );
}
