"use client";

import * as React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Dynamic QR Codes
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {filteredCodes.length} Total
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Create, customize, and route visitors with dynamic redirect destinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCreateNew} className="gap-2 shadow-sm">
            <Plus className="size-4" />
            Create QR Code
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card/60">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, slug, or destination URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="h-9">
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
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              className="size-7"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon-sm"
              className="size-7"
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List className="size-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9"
            onClick={() => fetchQrCodes()}
            title="Refresh list"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-border/60 bg-muted/20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCodes.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 my-6">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <QrIcon className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No QR codes found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
            {searchQuery || statusFilter !== "all"
              ? "No QR codes match your active filters. Try adjusting search or status criteria."
              : "Generate your first dynamic QR code to start tracking scans and routing visitors dynamically."}
          </p>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="size-4" />
            Create Your First QR Code
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
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">QR Code & Slug</TableHead>
                <TableHead>Destination URL</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[90px] text-right">Scans</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCodes.map((qr) => {
                const redirectUrl = buildRedirectUrl(qr.slug);
                return (
                  <TableRow key={qr.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="size-8 rounded border p-0.5 shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: qr.backgroundColor }}
                        >
                          <QrIcon className="size-5" style={{ color: qr.foregroundColor }} />
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
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : qr.status === "paused"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {qr.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs">
                      {qr.scanCount || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7"
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
                          className="size-7"
                          onClick={() => setExportQr(qr)}
                          title="Export PNG / SVG"
                        >
                          <Download className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-7"
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
