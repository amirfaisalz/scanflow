"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode,
  FolderGit2,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  ExternalLink,
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
}

export function AnalyticsTopPerformers({ topPerformers }: AnalyticsTopPerformersProps) {
  const qrCodes = topPerformers?.qrCodes ?? [];
  const campaigns = topPerformers?.campaigns ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Top Performing QR Codes */}
      <Card className="rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
              <QrCode className="h-4 w-4 text-sky-500" />
              Top Performing QR Codes
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Ranked by total scan engagement & conversions
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {qrCodes.length} QR Codes
          </Badge>
        </CardHeader>

        <CardContent className="px-0 pb-2">
          {qrCodes.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center p-6 text-center text-xs text-zinc-500">
              <QrCode className="mb-2 h-6 w-6 text-zinc-400 dark:text-zinc-600" />
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No QR codes found</p>
              <p className="text-[11px] text-zinc-400">Create active QR codes to track top performers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-100 hover:bg-transparent dark:border-zinc-850">
                    <TableHead className="w-12 text-center text-xs font-semibold">#</TableHead>
                    <TableHead className="text-xs font-semibold">QR Code</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Scans</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Sessions</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Conv. Rate</TableHead>
                    <TableHead className="w-12 text-center text-xs font-semibold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes.map((qr, idx) => (
                    <TableRow
                      key={qr.id || idx}
                      className="border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-850 dark:hover:bg-zinc-900/50"
                    >
                      <TableCell className="text-center font-mono text-xs font-bold text-zinc-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                            {qr.name}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-400 truncate">
                            {qr.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {qr.scans.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-zinc-500">
                        {qr.sessions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[11px] ${
                            qr.conversionRate > 0
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-zinc-200 text-zinc-400 dark:border-zinc-800"
                          }`}
                        >
                          {qr.conversionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/qr/${qr.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          title="View QR Code"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
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
      <Card className="rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
              <FolderGit2 className="h-4 w-4 text-purple-500" />
              Top Performing Campaigns
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Ranked campaign groupings by scan engagement
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {campaigns.length} Campaigns
          </Badge>
        </CardHeader>

        <CardContent className="px-0 pb-2">
          {campaigns.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center p-6 text-center text-xs text-zinc-500">
              <FolderGit2 className="mb-2 h-6 w-6 text-zinc-400 dark:text-zinc-600" />
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No campaigns found</p>
              <p className="text-[11px] text-zinc-400">Organize your QR codes into campaigns to view aggregate leaders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-100 hover:bg-transparent dark:border-zinc-850">
                    <TableHead className="w-12 text-center text-xs font-semibold">#</TableHead>
                    <TableHead className="text-xs font-semibold">Campaign</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Scans</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Sessions</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Conv. Rate</TableHead>
                    <TableHead className="w-12 text-center text-xs font-semibold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((camp, idx) => (
                    <TableRow
                      key={camp.id || idx}
                      className="border-zinc-100 transition-colors hover:bg-zinc-50/50 dark:border-zinc-850 dark:hover:bg-zinc-900/50"
                    >
                      <TableCell className="text-center font-mono text-xs font-bold text-zinc-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {camp.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {camp.scans.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-zinc-500">
                        {camp.sessions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[11px] ${
                            camp.conversionRate > 0
                              ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : "border-zinc-200 text-zinc-400 dark:border-zinc-800"
                          }`}
                        >
                          {camp.conversionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/campaigns`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          title="View Campaign"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
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
