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
  BarChart2,
  ExternalLink,
  Crown,
  Trophy,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  FolderGit2,
  ArrowUpRight,
  Split,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export interface ExperimentVariantData {
  id: string;
  experimentId?: string;
  name: string;
  destinationUrl: string;
  trafficWeight: number; // 0 - 100
  isControl: boolean;
  scans?: number;
  sessions?: number;
  conversions?: number;
  conversionRate?: number; // %
  bounceRate?: number; // %
  lift?: number; // % relative to control
  confidenceLevel?: number; // % e.g. 96.5%
  isSignificant?: boolean;
  pValue?: number;
}

export interface ExperimentData {
  id: string;
  userId?: string;
  name: string;
  description?: string | null;
  status: "draft" | "active" | "paused" | "ended" | string;
  qrCodeId: string;
  campaignId?: string | null;
  trafficAllocation?: number; // 1-100%
  winnerVariantId?: string | null;
  startedAt?: string | Date | null;
  endedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  qrCode?: {
    id: string;
    name: string;
    slug?: string;
    destinationUrl?: string;
  } | null;
  campaign?: {
    id: string;
    name: string;
  } | null;
  variants: ExperimentVariantData[];
  stats?: {
    totalScans: number;
    totalSessions: number;
    totalConversions: number;
    conversionRate: number;
    hasSignificantWinner?: boolean;
    winnerVariant?: ExperimentVariantData | null;
  };
}

export interface ExperimentCardProps {
  experiment: ExperimentData;
  onEdit: (experiment: ExperimentData) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (id: string, newStatus: "active" | "paused" | "ended" | "draft") => void;
  onDeclareWinner?: (experimentId: string, variantId: string) => void;
  onViewDetails?: (experiment: ExperimentData) => void;
}

export function ExperimentCard({
  experiment,
  onEdit,
  onDelete,
  onStatusToggle,
  onDeclareWinner,
  onViewDetails,
}: ExperimentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Paused
          </Badge>
        );
      case "ended":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-semibold gap-1"
          >
            <CheckCircle2 className="h-3 w-3 text-purple-400" />
            Ended
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] font-semibold"
          >
            Draft
          </Badge>
        );
    }
  };

  const variants = experiment.variants || [];
  const totalScans =
    experiment.stats?.totalScans ??
    variants.reduce((sum, v) => sum + (v.scans || 0), 0);
  const totalConversions =
    experiment.stats?.totalConversions ??
    variants.reduce((sum, v) => sum + (v.conversions || 0), 0);
  const totalSessions =
    experiment.stats?.totalSessions ??
    variants.reduce((sum, v) => sum + (v.sessions || 0), 0);
  const overallConversionRate =
    experiment.stats?.conversionRate ??
    (totalSessions > 0
      ? Number(((totalConversions / totalSessions) * 100).toFixed(1))
      : 0);

  // Determine winner variant ID
  const effectiveWinnerId =
    experiment.winnerVariantId ||
    experiment.stats?.winnerVariant?.id ||
    variants.find((v) => !v.isControl && v.isSignificant && (v.lift || 0) > 0)?.id;

  const maxConvRate = Math.max(
    ...variants.map((v) => v.conversionRate || 0),
    1
  );

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-5 shadow-lg transition-all hover:border-sky-500/40 hover:shadow-xl">
      {/* Top Section */}
      <div>
        {/* Header with Title, Badges & Actions Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-zinc-100 group-hover:text-sky-400 transition-colors truncate">
                {experiment.name}
              </h3>
              {getStatusBadge(experiment.status)}
              {experiment.trafficAllocation && experiment.trafficAllocation < 100 && (
                <Badge
                  variant="outline"
                  className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[10px] font-semibold"
                >
                  <Percent className="h-2.5 w-2.5 mr-0.5" />
                  {experiment.trafficAllocation}% Traffic
                </Badge>
              )}
            </div>

            {experiment.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {experiment.description}
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
              className="w-52 bg-zinc-950 border-zinc-800 text-zinc-200"
            >
              <DropdownMenuItem
                onClick={() => onEdit(experiment)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit Experiment
              </DropdownMenuItem>

              {/* Status toggles */}
              {experiment.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => onStatusToggle(experiment.id, "active")}
                  className="text-xs gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Experiment
                </DropdownMenuItem>
              )}

              {experiment.status === "active" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "paused")}
                    className="text-xs gap-2 cursor-pointer text-amber-400 focus:text-amber-400 focus:bg-amber-500/10"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Pause Experiment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "ended")}
                    className="text-xs gap-2 cursor-pointer text-purple-400 focus:text-purple-400 focus:bg-purple-500/10"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    End Experiment
                  </DropdownMenuItem>
                </>
              )}

              {experiment.status === "paused" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "active")}
                    className="text-xs gap-2 cursor-pointer text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Activate Experiment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "ended")}
                    className="text-xs gap-2 cursor-pointer text-purple-400 focus:text-purple-400 focus:bg-purple-500/10"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    End Experiment
                  </DropdownMenuItem>
                </>
              )}

              {/* Declare winner actions */}
              {onDeclareWinner && variants.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  {variants.map((v) => (
                    <DropdownMenuItem
                      key={v.id}
                      onClick={() => onDeclareWinner(experiment.id, v.id)}
                      className="text-xs gap-2 cursor-pointer text-amber-400 focus:text-amber-300 focus:bg-amber-500/10"
                    >
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      Declare Winner: {v.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => onDelete(experiment.id)}
                className="text-xs text-red-400 focus:text-red-400 focus:bg-red-500/10 gap-2 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Experiment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scope & QR Code Association Details */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          {experiment.qrCode?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] text-zinc-300">
              <QrCode className="h-3 w-3 text-sky-400" />
              <span className="truncate max-w-[160px]">
                {experiment.qrCode.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] text-zinc-400">
              <QrCode className="h-3 w-3 text-zinc-400" />
              <span>QR: {experiment.qrCodeId}</span>
            </div>
          )}

          {experiment.campaign?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-900/80 px-2 py-1 border border-zinc-800 text-[11px] text-zinc-300">
              <FolderGit2 className="h-3 w-3 text-purple-400" />
              <span className="truncate max-w-[140px]">
                {experiment.campaign.name}
              </span>
            </div>
          ) : null}
        </div>

        {/* Aggregate Metrics Grid */}
        <div className="my-4 grid grid-cols-3 gap-2 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3">
          {/* Total Scans */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <BarChart2 className="h-3 w-3 text-purple-400" />
              Total Scans
            </span>
            <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {totalScans.toLocaleString()}
            </span>
          </div>

          {/* Total Conversions */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Target className="h-3 w-3 text-sky-400" />
              Conversions
            </span>
            <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {totalConversions.toLocaleString()}
            </span>
          </div>

          {/* Overall Conv. Rate */}
          <div className="flex flex-col">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              Conv. Rate
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {overallConversionRate}%
            </span>
          </div>
        </div>

        {/* Variants Comparison Section */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-0.5">
            <span className="flex items-center gap-1.5">
              <Split className="h-3.5 w-3.5 text-sky-400" />
              Variant Breakdown ({variants.length})
            </span>
            <span>Split Weight</span>
          </div>

          <div className="space-y-2.5">
            {variants.map((variant) => {
              const isWinner = effectiveWinnerId === variant.id;
              const convRate = variant.conversionRate ?? 0;
              const barWidthPercent =
                maxConvRate > 0 ? Math.max(8, (convRate / maxConvRate) * 100) : 8;

              return (
                <div
                  key={variant.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isWinner
                      ? "border-amber-500/40 bg-amber-500/5 shadow-inner"
                      : "border-zinc-800 bg-zinc-900/50"
                  }`}
                >
                  {/* Variant Top Row: Name, Badges & Destination */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-zinc-200">
                        {variant.name}
                      </span>
                      {variant.isControl && (
                        <Badge
                          variant="outline"
                          className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] py-0"
                        >
                          Control
                        </Badge>
                      )}
                      {isWinner && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-semibold gap-1 py-0"
                        >
                          <Crown className="h-3 w-3 text-amber-400" />
                          Winner
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">
                        {variant.trafficWeight}%
                      </span>
                      {variant.destinationUrl && (
                        <a
                          href={variant.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-sky-400 transition-colors"
                          title={variant.destinationUrl}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Variant Metrics & Significance */}
                  <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* Scans / Sessions */}
                    <div className="flex flex-col bg-zinc-950/60 rounded-lg p-2 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500">Scans</span>
                      <span className="font-mono font-bold text-zinc-200 mt-0.5">
                        {(variant.scans || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Conversions */}
                    <div className="flex flex-col bg-zinc-950/60 rounded-lg p-2 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500">Conversions</span>
                      <span className="font-mono font-bold text-zinc-200 mt-0.5">
                        {(variant.conversions || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Conv Rate */}
                    <div className="flex flex-col bg-zinc-950/60 rounded-lg p-2 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500">Conv. Rate</span>
                      <span className="font-mono font-bold text-emerald-400 mt-0.5">
                        {convRate}%
                      </span>
                    </div>

                    {/* Lift / Significance */}
                    <div className="flex flex-col bg-zinc-950/60 rounded-lg p-2 border border-zinc-850">
                      <span className="text-[10px] text-zinc-500">
                        {variant.isControl ? "Status" : "Lift"}
                      </span>
                      {variant.isControl ? (
                        <span className="font-mono text-zinc-400 text-[11px] mt-0.5">
                          Baseline
                        </span>
                      ) : variant.lift !== undefined ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-[11px] mt-0.5">
                          {variant.lift > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">
                                +{variant.lift}%
                              </span>
                            </>
                          ) : variant.lift < 0 ? (
                            <>
                              <TrendingDown className="h-3 w-3 text-rose-400" />
                              <span className="text-rose-400">
                                {variant.lift}%
                              </span>
                            </>
                          ) : (
                            <span className="text-zinc-400">0.0%</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-zinc-500 text-[11px] mt-0.5">
                          --
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Significance Badge indicator */}
                  {!variant.isControl && (
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      {variant.isSignificant || (variant.confidenceLevel && variant.confidenceLevel >= 95) ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          <span>
                            {variant.confidenceLevel
                              ? `${variant.confidenceLevel}% Confident (Significant)`
                              : "Statistically Significant"}
                          </span>
                        </div>
                      ) : (variant.sessions || variant.scans || 0) > 0 ? (
                        <span className="text-zinc-500">
                          {variant.confidenceLevel
                            ? `${variant.confidenceLevel}% Confident (Collecting Data)`
                            : "Collecting data..."}
                        </span>
                      ) : (
                        <span className="text-zinc-600">Awaiting visitor scans</span>
                      )}
                    </div>
                  )}

                  {/* Visual Progress Bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner
                          ? "bg-gradient-to-r from-amber-500 to-emerald-400"
                          : variant.isControl
                          ? "bg-zinc-500"
                          : "bg-sky-500"
                      }`}
                      style={{ width: `${Math.min(100, barWidthPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info & Quick Link */}
      <div className="mt-5 flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-850">
        <span className="font-mono text-[11px]">
          Created {new Date(experiment.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => (onViewDetails ? onViewDetails(experiment) : onEdit(experiment))}
            className="h-7 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1 px-2"
          >
            <span>Manage Experiment</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
