"use client";

import * as React from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
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

export interface JourneySession {
  id: string;
  qrCodeId: string;
  qrName: string;
  qrSlug: string;
  deviceType: "mobile" | "tablet" | "desktop" | "bot" | "other";
  os: string;
  browser: string;
  country: string;
  city?: string | null;
  referrer?: string | null;
  startedAt: string | Date;
  endedAt?: string | Date;
  durationSeconds: number;
  eventsCount: number;
  converted: boolean;
  conversionEvent?: string | null;
}

interface JourneysTableProps {
  journeys: JourneySession[];
  onSelectJourney: (journey: JourneySession) => void;
}

export function JourneysTable({ journeys, onSelectJourney }: JourneysTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4 text-sky-400" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-purple-400" />;
      case "desktop":
      default:
        return <Monitor className="h-4 w-4 text-emerald-400" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "< 5s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const remSecs = seconds % 60;
    return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins}m`;
  };

  const formatTimestamp = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (journeys.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card/40">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border border-border mb-4">
          <Globe className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">No visitor journeys recorded yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Scans through your dynamic QR codes and visitor interactions will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="w-[180px] text-muted-foreground font-medium text-xs">Session / Visitor</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs">QR Code</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs">Device & OS</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs">Location</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs">Time</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs text-center">Steps</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs text-center">Duration</TableHead>
            <TableHead className="text-muted-foreground font-medium text-xs text-center">Outcome</TableHead>
            <TableHead className="w-[100px] text-right text-muted-foreground font-medium text-xs"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {journeys.map((journey) => (
            <TableRow
              key={journey.id}
              onClick={() => onSelectJourney(journey)}
              className="border-border/60 cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              {/* Session ID */}
              <TableCell className="font-mono text-xs">
                <div className="flex items-center gap-1.5 text-foreground">
                  <span>{journey.id.slice(0, 14)}...</span>
                  <button
                    onClick={(e) => handleCopy(journey.id, e)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                    title="Copy Session ID"
                  >
                    {copiedId === journey.id ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </TableCell>

              {/* QR Code */}
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {journey.qrName}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    /r/{journey.qrSlug}
                  </span>
                </div>
              </TableCell>

              {/* Device & OS */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {getDeviceIcon(journey.deviceType)}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground capitalize">
                      {journey.deviceType}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {journey.os} • {journey.browser}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Location */}
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-foreground">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {journey.country}
                    {journey.city && <span className="text-muted-foreground font-normal">, {journey.city}</span>}
                  </span>
                </div>
              </TableCell>

              {/* Time */}
              <TableCell className="text-xs text-muted-foreground font-mono">
                {formatTimestamp(journey.startedAt)}
              </TableCell>

              {/* Steps */}
              <TableCell className="text-center">
                <Badge variant="secondary" className="bg-muted text-foreground font-mono text-[11px]">
                  {journey.eventsCount} {journey.eventsCount === 1 ? "step" : "steps"}
                </Badge>
              </TableCell>

              {/* Duration */}
              <TableCell className="text-center text-xs font-mono text-muted-foreground">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDuration(journey.durationSeconds)}</span>
                </div>
              </TableCell>

              {/* Outcome / Conversion */}
              <TableCell className="text-center">
                {journey.converted ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Converted</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-border/80 bg-muted/40 text-muted-foreground text-xs gap-1">
                    <XCircle className="h-3 w-3" />
                    <span>Drop-off</span>
                  </Badge>
                )}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 px-2"
                >
                  <span>View Journey</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
