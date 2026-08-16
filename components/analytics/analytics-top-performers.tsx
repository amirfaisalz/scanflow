"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  FolderGit2,
  ArrowUpRight,
  BarChart3,
  Compass,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface AnalyticsTopPerformersProps {
  topPerformers: {
    qrCodes: Array<{
      id: string;
      name: string;
      slug: string;
      scans: number;
      sessions: number;
      conversions: number;
      conversionRate: number;
    }>;
    campaigns: Array<{
      id: string;
      name: string;
      scans: number;
      sessions: number;
      conversions: number;
      conversionRate: number;
    }>;
  };
  onSelectQrCode?: (qrCodeId: string) => void;
  onSelectCampaign?: (campaignId: string) => void;
}

export function AnalyticsTopPerformers({
  topPerformers,
  onSelectQrCode,
  onSelectCampaign,
}: AnalyticsTopPerformersProps) {
  const qrCodes = topPerformers?.qrCodes ?? [];
  const campaigns = topPerformers?.campaigns ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Top Performing QR Codes */}
      <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <QrCode className="size-4 text-sky-500" />
              Top Performing QR Codes
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ranked by total scan engagement &amp; conversions
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {qrCodes.length} QR Codes
          </Badge>
        </CardHeader>

        <CardContent className="px-0 pb-2">
          {qrCodes.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
              <QrCode className="mb-2 size-6 text-muted-foreground" />
              <p className="font-medium text-foreground">No QR codes found</p>
              <p className="text-[11px] text-muted-foreground">Create active QR codes to track top performers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/80 hover:bg-transparent">
                    <TableHead className="w-12 text-center text-xs font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">QR Code</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Scans</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Sessions</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Conv. Rate</TableHead>
                    <TableHead className="w-24 text-right text-xs font-semibold text-muted-foreground pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes.map((qr, idx) => (
                    <TableRow
                      key={qr.id || idx}
                      className="border-border/60 transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="text-center font-mono text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onSelectQrCode?.(qr.id)}
                          className="flex flex-col text-left group/item cursor-pointer focus:outline-hidden"
                          title="Drill-down into QR analytics"
                        >
                          <span className="font-medium text-foreground line-clamp-1 group-hover/item:text-primary transition-colors">
                            {qr.name}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground truncate">
                            /r/{qr.slug}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {qr.scans.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {qr.sessions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[11px] ${
                            qr.conversionRate > 0
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-border/80 text-muted-foreground"
                          }`}
                        >
                          {qr.conversionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10"
                            onClick={() => onSelectQrCode?.(qr.id)}
                            title="Drill-down Analytics"
                          >
                            <BarChart3 className="size-3.5" />
                          </Button>
                          <Link
                            href={`/dashboard/journeys?qrCodeId=${qr.id}`}
                            title="View Visitor Journeys"
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                          >
                            <Compass className="size-3.5" />
                          </Link>
                          <Link
                            href="/dashboard/qr-codes"
                            title="View in QR Codes"
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Top Performing Campaigns */}
      <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <FolderGit2 className="size-4 text-purple-500" />
              Top Performing Campaigns
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Ranked campaign groupings by scan engagement
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {campaigns.length} Campaigns
          </Badge>
        </CardHeader>

        <CardContent className="px-0 pb-2">
          {campaigns.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
              <FolderGit2 className="mb-2 size-6 text-muted-foreground" />
              <p className="font-medium text-foreground">No campaigns found</p>
              <p className="text-[11px] text-muted-foreground">Organize your QR codes into campaigns to view aggregate leaders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/80 hover:bg-transparent">
                    <TableHead className="w-12 text-center text-xs font-semibold text-muted-foreground">#</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Campaign</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Scans</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Sessions</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">Conv. Rate</TableHead>
                    <TableHead className="w-20 text-right text-xs font-semibold text-muted-foreground pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((camp, idx) => (
                    <TableRow
                      key={camp.id || idx}
                      className="border-border/60 transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="text-center font-mono text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onSelectCampaign?.(camp.id)}
                          className="text-left group/item cursor-pointer focus:outline-hidden"
                          title="Drill-down into Campaign analytics"
                        >
                          <span className="font-medium text-foreground line-clamp-1 group-hover/item:text-primary transition-colors">
                            {camp.name}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        {camp.scans.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {camp.sessions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[11px] ${
                            camp.conversionRate > 0
                              ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : "border-border/80 text-muted-foreground"
                          }`}
                        >
                          {camp.conversionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="size-7 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10"
                            onClick={() => onSelectCampaign?.(camp.id)}
                            title="Drill-down Analytics"
                          >
                            <BarChart3 className="size-3.5" />
                          </Button>
                          <Link
                            href="/dashboard/campaigns"
                            title="View Campaign"
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
