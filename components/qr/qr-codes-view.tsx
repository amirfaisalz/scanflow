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
import dynamic from "next/dynamic";
import { QRCard } from "@/components/qr/qr-card";

const QRBuilderDialog = dynamic(
  () => import("@/components/qr/qr-builder-dialog").then((m) => m.QRBuilderDialog),
  { ssr: false }
);

const QRExportDialog = dynamic(
  () => import("@/components/qr/qr-export-dialog").then((m) => m.QRExportDialog),
  { ssr: false }
);
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

interface QRCodesViewProps {
  initialQrCodes: QRCodeModel[];
}

export function QRCodesView({ initialQrCodes }: QRCodesViewProps) {
  const [qrCodes, setQrCodes] = React.useState<QRCodeModel[]>(initialQrCodes);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [isLoading, setIsLoading] = React.useState(false);

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

  const filteredCodes = React.useMemo(() => {
    return qrCodes.filter((qr) => {
      const matchesSearch =
        !searchQuery.trim() ||
        qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.destinationUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : qr.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [qrCodes, searchQuery, statusFilter]);

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
              Create, customize, and route dynamic smart QR codes with conditional intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchQrCodes(true)}
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            <span>Refresh</span>
          </Button>

          <Button onClick={handleCreateNew} size="sm" className="h-8 gap-1.5 text-xs shadow-xs">
            <Plus className="size-3.5" />
            <span>Create QR Code</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
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
            placeholder="Search by title, destination URL, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-background/50 border-border/80"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filter */}
          <Tabs
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
            className="h-9"
          >
            <TabsList className="h-9 p-1 bg-muted/40 rounded-xl border border-border/60">
              <TabsTrigger value="all" className="text-xs px-2.5 h-7 rounded-lg">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-2.5 h-7 rounded-lg">
                Active
              </TabsTrigger>
              <TabsTrigger value="paused" className="text-xs px-2.5 h-7 rounded-lg">
                Paused
              </TabsTrigger>
              <TabsTrigger value="archived" className="text-xs px-2.5 h-7 rounded-lg">
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border/80 rounded-xl p-1 bg-background/50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="size-7 rounded-lg"
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="size-7 rounded-lg"
              title="Table View"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main QR Content */}
      {filteredCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-md">
          <div className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <QrIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No QR codes found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search criteria or clearing filters."
              : "Get started by generating your first dynamic programmable QR code."}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button onClick={handleCreateNew} size="sm" className="mt-4 gap-1.5 h-8 text-xs">
              <Plus className="size-3.5" />
              Create QR Code
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60">
                <TableHead className="text-xs">QR Code / Title</TableHead>
                <TableHead className="text-xs">Destination</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Scans</TableHead>
                <TableHead className="text-xs text-right">Created</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.map((qr) => {
                const redirectUrl = buildRedirectUrl(qr.slug);
                return (
                  <TableRow key={qr.id} className="border-border/40 hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-center shrink-0">
                          <QrIcon className="size-4 text-sky-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            <span>{qr.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              /{qr.slug}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={qr.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 max-w-[200px] truncate"
                      >
                        <span className="truncate">{qr.destinationUrl}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          qr.status === "active"
                            ? "default"
                            : qr.status === "paused"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize text-[10px] h-5"
                      >
                        {qr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold">
                      {(qr.scanCount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(qr.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg"
                          onClick={() => {
                            navigator.clipboard.writeText(redirectUrl);
                            toast.success("Short link copied to clipboard");
                          }}
                          title="Copy Link"
                        >
                          <Copy className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg"
                          onClick={() => setExportQr(qr)}
                          title="Export / Download"
                        >
                          <Download className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg"
                          onClick={() => handleEdit(qr)}
                          title="Edit"
                        >
                          <Edit className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => handleDelete(qr.id)}
                          title="Delete"
                        >
                          <Trash2 className="size-3" />
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

      {/* Builder Dialog */}
      {builderOpen && (
        <QRBuilderDialog
          open={builderOpen}
          onOpenChange={(open) => {
            setBuilderOpen(open);
            if (!open) setEditingQr(null);
          }}
          initialData={editingQr}
          onSuccess={() => fetchQrCodes()}
        />
      )}

      {/* Export Dialog */}
      {exportQr && (
        <QRExportDialog
          open={Boolean(exportQr)}
          onOpenChange={(open) => {
            if (!open) setExportQr(null);
          }}
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
