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
} from "@/components/ui/dropdown-menu";

export interface ExperimentVariantData {
  id: string;
  experimentId?: string;
  name: string;
  destinationUrl: string;
  trafficWeight: number;
  isControl: boolean;
  scans?: number;
  sessions?: number;
  conversions?: number;
  conversionRate?: number;
  bounceRate?: number;
  lift?: number;
  confidenceLevel?: number;
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
  trafficAllocation?: number;
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
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Paused
          </Badge>
        );
      case "ended":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] font-semibold gap-1"
          >
            <CheckCircle2 className="size-3 text-purple-500" />
            Ended
          </Badge>
        );
      case "draft":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border text-[10px] font-semibold"
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

  const effectiveWinnerId =
    experiment.winnerVariantId ||
    experiment.stats?.winnerVariant?.id ||
    variants.find((v) => !v.isControl && v.isSignificant && (v.lift || 0) > 0)?.id;

  const maxConvRate = Math.max(
    ...variants.map((v) => v.conversionRate || 0),
    1
  );

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
      {/* Top Section */}
      <div>
        {/* Header with Title, Badges & Actions Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {experiment.name}
              </h3>
              {getStatusBadge(experiment.status)}
              {experiment.trafficAllocation && experiment.trafficAllocation < 100 && (
                <Badge
                  variant="outline"
                  className="bg-muted/40 border-border/60 text-muted-foreground text-[10px] font-semibold"
                >
                  <Percent className="size-2.5 mr-0.5" />
                  {experiment.trafficAllocation}% Traffic
                </Badge>
              )}
            </div>

            {experiment.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
              className="w-52"
            >
              <DropdownMenuItem
                onClick={() => onEdit(experiment)}
                className="text-xs gap-2 cursor-pointer"
              >
                <Edit className="size-3.5" />
                Edit Experiment
              </DropdownMenuItem>

              {experiment.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => onStatusToggle(experiment.id, "active")}
                  className="text-xs gap-2 cursor-pointer text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
                >
                  <Play className="size-3.5" />
                  Start Experiment
                </DropdownMenuItem>
              )}

              {experiment.status === "active" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "paused")}
                    className="text-xs gap-2 cursor-pointer text-amber-500 focus:text-amber-500 focus:bg-amber-500/10"
                  >
                    <Pause className="size-3.5" />
                    Pause Experiment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "ended")}
                    className="text-xs gap-2 cursor-pointer text-purple-500 focus:text-purple-500 focus:bg-purple-500/10"
                  >
                    <CheckCircle2 className="size-3.5" />
                    End Experiment
                  </DropdownMenuItem>
                </>
              )}

              {experiment.status === "paused" && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "active")}
                    className="text-xs gap-2 cursor-pointer text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10"
                  >
                    <Play className="size-3.5" />
                    Activate Experiment
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusToggle(experiment.id, "ended")}
                    className="text-xs gap-2 cursor-pointer text-purple-500 focus:text-purple-500 focus:bg-purple-500/10"
                  >
                    <CheckCircle2 className="size-3.5" />
                    End Experiment
                  </DropdownMenuItem>
                </>
              )}

              {onDeclareWinner && variants.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {variants.map((v) => (
                    <DropdownMenuItem
                      key={v.id}
                      onClick={() => onDeclareWinner(experiment.id, v.id)}
                      className="text-xs gap-2 cursor-pointer text-amber-500 focus:text-amber-400 focus:bg-amber-500/10"
                    >
                      <Crown className="size-3.5 text-amber-500" />
                      Declare Winner: {v.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(experiment.id)}
                className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Delete Experiment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scope & QR Code Association Details */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {experiment.qrCode?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] text-foreground">
              <QrCode className="size-3 text-sky-500" />
              <span className="truncate max-w-[160px]">
                {experiment.qrCode.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] text-muted-foreground">
              <QrCode className="size-3" />
              <span>QR: {experiment.qrCodeId}</span>
            </div>
          )}

          {experiment.campaign?.name ? (
            <div className="flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 border border-border/60 text-[11px] text-foreground">
              <FolderGit2 className="size-3 text-purple-500" />
              <span className="truncate max-w-[140px]">
                {experiment.campaign.name}
              </span>
            </div>
          ) : null}
        </div>

        {/* Aggregate Metrics Grid */}
        <div className="my-4 grid grid-cols-3 gap-2 rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <BarChart2 className="size-3 text-purple-500" />
              Total Scans
            </span>
            <span className="text-sm font-bold font-mono text-foreground mt-0.5">
              {totalScans.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col border-l border-border/60 pl-3">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Target className="size-3 text-sky-500" />
              Conversions
            </span>
            <span className="text-sm font-bold font-mono text-foreground mt-0.5">
              {totalConversions.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col border-l border-border/60 pl-3">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3 text-emerald-500" />
              Conv. Rate
            </span>
            <span className="text-sm font-bold font-mono text-emerald-500 mt-0.5">
              {overallConversionRate}%
            </span>
          </div>
        </div>

        {/* Variants Comparison Section */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
            <span className="flex items-center gap-1.5">
              <Split className="size-3.5 text-sky-500" />
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
                  className={`rounded-xl border p-3 transition-all ${
                    isWinner
                      ? "border-amber-500/40 bg-amber-500/5 shadow-inner"
                      : "border-border/60 bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs text-foreground">
                        {variant.name}
                      </span>
                      {variant.isControl && (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border text-[10px] py-0"
                        >
                          Control
                        </Badge>
                      )}
                      {isWinner && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold gap-1 py-0"
                        >
                          <Crown className="size-3 text-amber-500" />
                          Winner
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {variant.trafficWeight}%
                      </span>
                      {variant.destinationUrl && (
                        <a
                          href={variant.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title={variant.destinationUrl}
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex flex-col bg-background/60 rounded-lg p-2 border border-border/40">
                      <span className="text-[10px] text-muted-foreground">Scans</span>
                      <span className="font-mono font-bold text-foreground mt-0.5">
                        {(variant.scans || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col bg-background/60 rounded-lg p-2 border border-border/40">
                      <span className="text-[10px] text-muted-foreground">Conversions</span>
                      <span className="font-mono font-bold text-foreground mt-0.5">
                        {(variant.conversions || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col bg-background/60 rounded-lg p-2 border border-border/40">
                      <span className="text-[10px] text-muted-foreground">Conv. Rate</span>
                      <span className="font-mono font-bold text-emerald-500 mt-0.5">
                        {convRate}%
                      </span>
                    </div>

                    <div className="flex flex-col bg-background/60 rounded-lg p-2 border border-border/40">
                      <span className="text-[10px] text-muted-foreground">
                        {variant.isControl ? "Status" : "Lift"}
                      </span>
                      {variant.isControl ? (
                        <span className="font-mono text-muted-foreground text-[11px] mt-0.5">
                          Baseline
                        </span>
                      ) : variant.lift !== undefined ? (
                        <div className="flex items-center gap-1 font-mono font-bold text-[11px] mt-0.5">
                          {variant.lift > 0 ? (
                            <>
                              <TrendingUp className="size-3 text-emerald-500" />
                              <span className="text-emerald-500">
                                +{variant.lift}%
                              </span>
                            </>
                          ) : variant.lift < 0 ? (
                            <>
                              <TrendingDown className="size-3 text-rose-500" />
                              <span className="text-rose-500">
                                {variant.lift}%
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">0.0%</span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-muted-foreground text-[11px] mt-0.5">
                          --
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWinner
                          ? "bg-gradient-to-r from-amber-500 to-emerald-500"
                          : variant.isControl
                          ? "bg-muted-foreground/60"
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
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
        <span className="font-mono text-[11px]">
          Created {new Date(experiment.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => (onViewDetails ? onViewDetails(experiment) : onEdit(experiment))}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
          >
            <span>Manage</span>
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
