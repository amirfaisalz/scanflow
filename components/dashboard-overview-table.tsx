"use client";

import * as React from "react";
import Link from "next/link";
import {
  QrCode as QrIcon,
  ExternalLink,
  Copy,
  Plus,
  ArrowRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { buildRedirectUrl } from "@/lib/qr";
import { toast } from "sonner";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

interface DashboardOverviewTableProps {
  qrCodes: QRCodeModel[];
  recentSessionsCount?: number;
}

export function DashboardOverviewTable({
  qrCodes,
}: DashboardOverviewTableProps) {
  const hasQrCodes = qrCodes && qrCodes.length > 0;

  const handleCopy = (slug: string) => {
    const url = buildRedirectUrl(slug);
    navigator.clipboard.writeText(url);
    toast.success("Short URL copied to clipboard");
  };

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <span>Your Dynamic QR Codes</span>
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px]">
                {qrCodes.length} Active
              </Badge>
            </div>
            <CardDescription className="text-xs sm:text-sm mt-0.5">
              Live programmable entry points and real-time scan metrics.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/analytics">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                <BarChart3 className="size-3.5" />
                <span>Full Analytics</span>
              </Button>
            </Link>
            <Link href="/dashboard/qr-codes">
              <Button size="sm" className="text-xs gap-1.5 h-8">
                <Plus className="size-3.5" />
                <span>New QR Code</span>
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {!hasQrCodes ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-t border-border/60">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <QrIcon className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No QR codes created yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
                Generate your first programmable dynamic QR code to start tracking visitor scans, A/B testing destinations, and recording journey timelines.
              </p>
              <Link href="/dashboard/qr-codes">
                <Button size="sm" className="gap-1.5 text-xs shadow-xs">
                  <Plus className="size-3.5" />
                  Create Your First QR Code
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border-t border-border/60 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[240px] text-xs font-semibold">QR Code &amp; Short Link</TableHead>
                    <TableHead className="text-xs font-semibold">Destination URL</TableHead>
                    <TableHead className="w-[110px] text-xs font-semibold">Status</TableHead>
                    <TableHead className="w-[90px] text-right text-xs font-semibold">Total Scans</TableHead>
                    <TableHead className="w-[120px] text-right text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrCodes.slice(0, 8).map((qr) => {
                    return (
                      <TableRow key={qr.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="size-8 rounded-lg border p-0.5 shrink-0 flex items-center justify-center shadow-2xs"
                              style={{ backgroundColor: qr.backgroundColor || "#ffffff" }}
                            >
                              <QrIcon className="size-5" style={{ color: qr.foregroundColor || "#000000" }} />
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-xs text-foreground truncate">{qr.name}</div>
                              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                <span>/r/{qr.slug}</span>
                              </div>
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
                            <span className="truncate">{qr.destinationUrl}</span>
                            <ExternalLink className="size-3 shrink-0 opacity-70" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${
                              qr.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : qr.status === "paused"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {qr.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs tabular-nums">
                          {(qr.scanCount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="size-7"
                              onClick={() => handleCopy(qr.slug)}
                              title="Copy Short URL"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                            <Link href={`/dashboard/analytics?qrCodeId=${qr.id}`}>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-7"
                                title="View QR Analytics"
                              >
                                <BarChart3 className="size-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {hasQrCodes && qrCodes.length > 8 && (
            <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground px-4">
              <span>Showing 8 of {qrCodes.length} QR codes</span>
              <Link href="/dashboard/qr-codes" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                View all QR codes
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
