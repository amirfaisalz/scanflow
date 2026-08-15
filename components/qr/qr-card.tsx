"use client";

import * as React from "react";
import {
  MoreVertical,
  Edit,
  Download,
  Copy,
  Check,
  Trash2,
  Files,
  Play,
  Pause,
  BarChart2,
  GitFork,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRPreview } from "@/components/qr/qr-preview";
import { QRExportDialog } from "@/components/qr/qr-export-dialog";
import { RoutingRulesDialog } from "@/components/qr/routing-rules-dialog";
import { buildRedirectUrl } from "@/lib/qr";
import { toast } from "sonner";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

export interface QRCardProps {
  qrCode: QRCodeModel;
  onEdit: (qrCode: QRCodeModel) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStatusToggle: (id: string, newStatus: "active" | "paused" | "archived") => void;
}

export function QRCard({
  qrCode,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusToggle,
}: QRCardProps) {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [rulesOpen, setRulesOpen] = React.useState(false);
  const [hasCopied, setHasCopied] = React.useState(false);

  const redirectUrl = buildRedirectUrl(qrCode.slug);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redirectUrl);
      setHasCopied(true);
      toast.success("Short URL copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Paused
          </Badge>
        );
      case "archived":
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] font-semibold">
            Archived
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-2xs hover:shadow-md transition-all hover:border-primary/40">
        {/* Top bar: Title, status, actions menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">
                {qrCode.name}
              </h3>
              {getStatusBadge(qrCode.status)}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              /r/<span className="text-foreground font-semibold">{qrCode.slug}</span>
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              data-slot="dropdown-menu-trigger"
              render={
                <Button variant="ghost" size="icon-sm" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setExportOpen(true)} className="text-xs gap-2">
                <Download className="size-3.5" />
                Export PNG / SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRulesOpen(true)} className="text-xs gap-2">
                <GitFork className="size-3.5 text-sky-400" />
                Dynamic Routing Rules
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(qrCode)} className="text-xs gap-2">
                <Edit className="size-3.5" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(qrCode.id)} className="text-xs gap-2">
                <Files className="size-3.5" />
                Duplicate QR
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onStatusToggle(
                    qrCode.id,
                    qrCode.status === "active" ? "paused" : "active"
                  )
                }
                className="text-xs gap-2"
              >
                {qrCode.status === "active" ? (
                  <>
                    <Pause className="size-3.5 text-amber-500" />
                    Pause QR Code
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 text-emerald-500" />
                    Activate QR Code
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(qrCode.id)}
                className="text-xs text-destructive gap-2 focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: QR Preview thumbnail */}
        <div className="my-4 flex items-center justify-center">
          <QRPreview
            value={qrCode.destinationUrl}
            slug={qrCode.slug}
            foregroundColor={qrCode.foregroundColor}
            backgroundColor={qrCode.backgroundColor}
            size={140}
            showActions={false}
            className="p-3 border-border/40 shadow-none bg-background/50 hover:bg-background"
          />
        </div>

        {/* Destination preview and stats */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[170px]" title={qrCode.destinationUrl}>
              🎯 {qrCode.destinationUrl.replace(/^https?:\/\//, "")}
            </span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <BarChart2 className="size-3.5 text-primary" />
              {qrCode.scanCount || 0} scans
            </span>
          </div>

          {/* Quick Action Footer */}
          <div className="flex items-center gap-1.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 h-8 text-xs gap-1.5"
            >
              {hasCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {hasCopied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setExportOpen(true)}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="size-3" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0"
              onClick={() => onEdit(qrCode)}
              title="Edit QR Code"
            >
              <Edit className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* High-Res Export Dialog */}
      <QRExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        name={qrCode.name}
        slug={qrCode.slug}
        destinationUrl={qrCode.destinationUrl}
        foregroundColor={qrCode.foregroundColor}
        backgroundColor={qrCode.backgroundColor}
      />

      {/* Dynamic Routing Rules Dialog */}
      <RoutingRulesDialog
        open={rulesOpen}
        onOpenChange={setRulesOpen}
        qrCode={qrCode}
      />
    </>
  );
}
