"use client";

import * as React from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  QrCode,
  BarChart2,
  Sparkles,
  Layers,
  ArrowUpRight,
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

export interface CampaignData {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "paused" | "archived";
  qrCodesCount: number;
  totalScans: number;
  totalSessions: number;
  conversions: number;
  conversionRate: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CampaignCardProps {
  campaign: CampaignData;
  onEdit: (campaign: CampaignData) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (id: string, newStatus: "active" | "paused" | "archived") => void;
  onViewDetails?: (campaign: CampaignData) => void;
}

export function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  onStatusToggle,
  onViewDetails,
}: CampaignCardProps) {
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
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
      {/* Header with Title, Status & Actions Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {campaign.name}
            </h3>
            {getStatusBadge(campaign.status)}
          </div>
          {campaign.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            data-slot="dropdown-menu-trigger"
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Actions" className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onEdit(campaign)} className="text-xs gap-2 cursor-pointer">
              <Edit className="size-3.5" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onStatusToggle(
                  campaign.id,
                  campaign.status === "active" ? "paused" : "active"
                )
              }
              className="text-xs gap-2 cursor-pointer"
            >
              {campaign.status === "active" ? (
                <>
                  <Pause className="size-3.5 text-amber-500" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="size-3.5 text-emerald-500" />
                  Activate Campaign
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(campaign.id)}
              className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="my-4 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
        {/* Assigned QR codes */}
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <QrCode className="size-3" />
            QR Codes
          </span>
          <span className="mt-1 font-mono text-sm font-bold text-foreground">
            {campaign.qrCodesCount || 0}
          </span>
        </div>

        {/* Total Scans */}
        <div className="flex flex-col border-l border-border/60 pl-3">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <BarChart2 className="size-3 text-sky-500" />
            Total Scans
          </span>
          <span className="mt-1 font-mono text-sm font-bold text-foreground">
            {(campaign.totalScans || 0).toLocaleString()}
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="flex flex-col border-l border-border/60 pl-3">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Sparkles className="size-3 text-purple-500" />
            Conv. Rate
          </span>
          <span className="mt-1 font-mono text-sm font-bold text-purple-600 dark:text-purple-400">
            {campaign.conversionRate || 0}%
          </span>
        </div>
      </div>

      {/* Footer / Meta and View Action */}
      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
        <span className="text-[11px] text-muted-foreground">
          Updated {new Date(campaign.updatedAt).toLocaleDateString()}
        </span>

        {onViewDetails ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(campaign)}
            className="h-7 text-xs text-primary hover:text-primary gap-1 px-2"
          >
            <span>View QRs</span>
            <ArrowUpRight className="size-3.5" />
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Layers className="size-3" />
            <span>Group Active</span>
          </div>
        )}
      </div>
    </div>
  );
}
