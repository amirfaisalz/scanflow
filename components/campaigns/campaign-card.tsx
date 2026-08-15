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
  FolderGit2,
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
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Paused
          </Badge>
        );
      case "archived":
      default:
        return (
          <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] font-semibold">
            Archived
          </Badge>
        );
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 shadow-lg transition-all hover:border-sky-500/40 hover:shadow-xl">
      {/* Header with Title, Status & Actions Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base text-zinc-100 group-hover:text-sky-400 transition-colors truncate">
              {campaign.name}
            </h3>
            {getStatusBadge(campaign.status)}
          </div>
          {campaign.description && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            data-slot="dropdown-menu-trigger"
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44 bg-zinc-950 border-zinc-800 text-zinc-200">
            <DropdownMenuItem onClick={() => onEdit(campaign)} className="text-xs gap-2 cursor-pointer">
              <Edit className="h-3.5 w-3.5" />
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
                  <Pause className="h-3.5 w-3.5 text-amber-400" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  Activate Campaign
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => onDelete(campaign.id)}
              className="text-xs text-red-400 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="my-5 grid grid-cols-3 gap-2 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3">
        {/* Assigned QR codes */}
        <div className="flex flex-col">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <QrCode className="h-3 w-3 text-sky-400" />
            QR Codes
          </span>
          <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
            {campaign.qrCodesCount || 0}
          </span>
        </div>

        {/* Total Scans */}
        <div className="flex flex-col">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <BarChart2 className="h-3 w-3 text-purple-400" />
            Total Scans
          </span>
          <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
            {(campaign.totalScans || 0).toLocaleString()}
          </span>
        </div>

        {/* Conversion Rate */}
        <div className="flex flex-col">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Conv. Rate
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {campaign.conversionRate || 0}%
          </span>
        </div>
      </div>

      {/* Footer Info & Quick Link */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-850">
        <span className="font-mono text-[11px]">
          Created {new Date(campaign.createdAt).toLocaleDateString()}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (onViewDetails ? onViewDetails(campaign) : onEdit(campaign))}
          className="h-7 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1 px-2"
        >
          <span>Manage Campaign</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
