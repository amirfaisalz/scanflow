"use client";

import * as React from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  QrCode,
  Sparkles,
  Target,
  DollarSign,
  Code,
  MousePointerClick,
  FileText,
  Globe,
  ExternalLink,
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

export interface ConversionGoalData {
  id: string;
  userId?: string;
  name: string;
  description?: string | null;
  eventType: string; // 'BUTTON_CLICK' | 'LINK_CLICK' | 'FORM_SUBMIT' | 'PAGE_VIEW' | 'CONVERSION' | string
  targetPattern?: string | null;
  qrCodeId?: string | null;
  campaignId?: string | null;
  monetaryValue: number; // in cents (e.g. 1500 = $15.00)
  currency?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  qrCode?: { id: string; name: string; slug?: string } | null;
  campaign?: { id: string; name: string } | null;
  totalConversions?: number;
  totalSessions?: number;
  conversionRate?: number;
  totalRevenue?: number;
}

export interface ConversionCardProps {
  goal: ConversionGoalData;
  onEdit: (goal: ConversionGoalData) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (id: string, newActiveState: boolean) => void;
  onViewSnippet?: (goal: ConversionGoalData) => void;
}

export function ConversionCard({
  goal,
  onEdit,
  onDelete,
  onStatusToggle,
  onViewSnippet,
}: ConversionCardProps) {
  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case "BUTTON_CLICK":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-semibold gap-1"
          >
            <MousePointerClick className="h-3 w-3 text-indigo-400" />
            BUTTON_CLICK
          </Badge>
        );
      case "FORM_SUBMIT":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
          >
            <FileText className="h-3 w-3 text-emerald-400" />
            FORM_SUBMIT
          </Badge>
        );
      case "PAGE_VIEW":
        return (
          <Badge
            variant="outline"
            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-semibold gap-1"
          >
            <Globe className="h-3 w-3 text-cyan-400" />
            PAGE_VIEW
          </Badge>
        );
      case "LINK_CLICK":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
          >
            <ExternalLink className="h-3 w-3 text-amber-400" />
            LINK_CLICK
          </Badge>
        );
      case "CONVERSION":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px] font-semibold gap-1"
          >
            <Target className="h-3 w-3 text-sky-400" />
            {eventType || "CONVERSION"}
          </Badge>
        );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] font-semibold gap-1"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        Inactive
      </Badge>
    );
  };

  const totalConversions = goal.totalConversions ?? 0;
  const conversionRate = goal.conversionRate ?? 0;
  const totalRevenue =
    goal.totalRevenue ??
    (totalConversions * (goal.monetaryValue || 0)) / 100;
  const formattedRevenue = `$${totalRevenue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const rateBarWidth = Math.min(100, Math.max(0, conversionRate));

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 shadow-lg transition-all hover:border-sky-500/40 hover:shadow-xl">
      {/* Header with Title, Badges & Actions Menu */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-zinc-100 group-hover:text-sky-400 transition-colors truncate">
                {goal.name}
              </h3>
              {getStatusBadge(goal.isActive)}
              {getEventTypeBadge(goal.eventType)}
            </div>

            {goal.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              data-slot="dropdown-menu-trigger"
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Actions"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200"
            >
              {onViewSnippet && (
                <DropdownMenuItem
                  onClick={() => onViewSnippet(goal)}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Code className="h-3.5 w-3.5 text-sky-400" />
                  Get Code Snippet
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEdit(goal)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusToggle(goal.id, !goal.isActive)}
                className="text-xs gap-2 cursor-pointer"
              >
                {goal.isActive ? (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-400" />
                    Deactivate Goal
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 text-emerald-400" />
                    Activate Goal
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => onDelete(goal.id)}
                className="text-xs text-red-400 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scope & Target Pattern Details */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          {goal.targetPattern && (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] font-mono text-zinc-300">
              <Code className="h-3 w-3 text-sky-400" />
              <span className="truncate max-w-[180px]">{goal.targetPattern}</span>
            </div>
          )}

          {goal.qrCode?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] text-zinc-300">
              <QrCode className="h-3 w-3 text-emerald-400" />
              <span className="truncate max-w-[140px]">{goal.qrCode.name}</span>
            </div>
          ) : null}

          {goal.campaign?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] text-zinc-300">
              <FolderGit2 className="h-3 w-3 text-purple-400" />
              <span className="truncate max-w-[140px]">{goal.campaign.name}</span>
            </div>
          ) : null}

          {!goal.qrCode?.name && !goal.campaign?.name && (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] text-zinc-400">
              <Globe className="h-3 w-3 text-zinc-400" />
              <span>All QR Codes (Global Scope)</span>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="my-4 space-y-2.5">
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3">
          {/* Conversions Count */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Target className="h-3 w-3 text-sky-400" />
              Conversions
            </span>
            <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {totalConversions.toLocaleString()}
            </span>
          </div>

          {/* Conversion Rate */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              Conv. Rate
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {conversionRate}%
            </span>
          </div>

          {/* Attributed Revenue */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-amber-400" />
              Revenue
            </span>
            <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {formattedRevenue}
            </span>
          </div>
        </div>

        {/* Rate Progress Bar */}
        <div className="space-y-1 px-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${rateBarWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info & Quick Actions */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-850">
        <span className="font-mono text-[11px]">
          Created {new Date(goal.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          {onViewSnippet && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewSnippet(goal)}
              className="h-7 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1 px-2"
            >
              <Code className="h-3.5 w-3.5 text-sky-400" />
              <span>Get Code Snippet</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(goal)}
            className="h-7 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1 px-2"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
