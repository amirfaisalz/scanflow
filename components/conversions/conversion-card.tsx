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
  eventType: string;
  targetPattern?: string | null;
  qrCodeId?: string | null;
  campaignId?: string | null;
  monetaryValue: number;
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
            className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px] font-semibold gap-1"
          >
            <MousePointerClick className="size-3 text-indigo-500" />
            BUTTON_CLICK
          </Badge>
        );
      case "FORM_SUBMIT":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
          >
            <FileText className="size-3 text-emerald-500" />
            FORM_SUBMIT
          </Badge>
        );
      case "PAGE_VIEW":
        return (
          <Badge
            variant="outline"
            className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 text-[10px] font-semibold gap-1"
          >
            <Globe className="size-3 text-cyan-500" />
            PAGE_VIEW
          </Badge>
        );
      case "LINK_CLICK":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
          >
            <ExternalLink className="size-3 text-amber-500" />
            LINK_CLICK
          </Badge>
        );
      case "CONVERSION":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] font-semibold gap-1"
          >
            <Target className="size-3 text-sky-500" />
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
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-muted text-muted-foreground border-border text-[10px] font-semibold gap-1"
      >
        <span className="size-1.5 rounded-full bg-muted-foreground/60" />
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
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
      {/* Header with Title, Badges & Actions Menu */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {goal.name}
              </h3>
              {getStatusBadge(goal.isActive)}
              {getEventTypeBadge(goal.eventType)}
            </div>

            {goal.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
                  size="icon-sm"
                  aria-label="Actions"
                  className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-48"
            >
              {onViewSnippet && (
                <DropdownMenuItem
                  onClick={() => onViewSnippet(goal)}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Code className="size-3.5 text-sky-500" />
                  Get Code Snippet
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEdit(goal)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Edit className="size-3.5" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusToggle(goal.id, !goal.isActive)}
                className="text-xs gap-2 cursor-pointer"
              >
                {goal.isActive ? (
                  <>
                    <Pause className="size-3.5 text-amber-500" />
                    Deactivate Goal
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 text-emerald-500" />
                    Activate Goal
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(goal.id)}
                className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scope & Target Pattern Details */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {goal.targetPattern && (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] font-mono text-foreground">
              <Code className="size-3 text-sky-500" />
              <span className="truncate max-w-[180px]">{goal.targetPattern}</span>
            </div>
          )}

          {goal.qrCode?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] text-foreground">
              <QrCode className="size-3 text-emerald-500" />
              <span className="truncate max-w-[140px]">{goal.qrCode.name}</span>
            </div>
          ) : null}

          {goal.campaign?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] text-foreground">
              <FolderGit2 className="size-3 text-purple-500" />
              <span className="truncate max-w-[140px]">{goal.campaign.name}</span>
            </div>
          ) : null}

          {!goal.qrCode?.name && !goal.campaign?.name && (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] text-muted-foreground">
              <Globe className="size-3" />
              <span>All QR Codes (Global Scope)</span>
            </div>
          )}
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="my-4 space-y-2.5">
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
          {/* Conversions Count */}
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Target className="size-3 text-sky-500" />
              Conversions
            </span>
            <span className="text-sm font-bold font-mono text-foreground mt-0.5">
              {totalConversions.toLocaleString()}
            </span>
          </div>

          {/* Conversion Rate */}
          <div className="flex flex-col border-l border-border/60 pl-3">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3 text-emerald-500" />
              Conv. Rate
            </span>
            <span className="text-sm font-bold font-mono text-emerald-500 mt-0.5">
              {conversionRate}%
            </span>
          </div>

          {/* Attributed Revenue */}
          <div className="flex flex-col border-l border-border/60 pl-3">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <DollarSign className="size-3 text-amber-500" />
              Revenue
            </span>
            <span className="text-sm font-bold font-mono text-foreground mt-0.5">
              {formattedRevenue}
            </span>
          </div>
        </div>

        {/* Rate Progress Bar */}
        <div className="space-y-1 px-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${rateBarWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info & Quick Actions */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
        <span className="font-mono text-[11px]">
          Created {new Date(goal.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          {onViewSnippet && (
            <Button
              size="sm"
              variant="ghost"
              aria-label="Get code snippet"
              onClick={() => onViewSnippet(goal)}
              className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            >
              <Code className="size-3.5 text-sky-500" />
              <span>Snippet</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(goal)}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
          >
            <Edit className="size-3.5" />
            <span>Edit</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
