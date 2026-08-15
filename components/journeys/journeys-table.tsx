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
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 mb-4">
          <Globe className="h-6 w-6 text-zinc-500" />
        </div>
        <h3 className="text-base font-semibold text-zinc-100 mb-1">No visitor journeys recorded yet</h3>
        <p className="text-sm text-zinc-400 max-w-sm">
          Scans through your dynamic QR codes and visitor interactions will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="w-[180px] text-zinc-400 font-medium">Session / Visitor</TableHead>
            <TableHead className="text-zinc-400 font-medium">QR Code</TableHead>
            <TableHead className="text-zinc-400 font-medium">Device & OS</TableHead>
            <TableHead className="text-zinc-400 font-medium">Location</TableHead>
            <TableHead className="text-zinc-400 font-medium">Time</TableHead>
            <TableHead className="text-zinc-400 font-medium text-center">Steps</TableHead>
            <TableHead className="text-zinc-400 font-medium text-center">Duration</TableHead>
            <TableHead className="text-zinc-400 font-medium text-center">Outcome</TableHead>
            <TableHead className="w-[100px] text-right text-zinc-400 font-medium"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {journeys.map((journey) => (
            <TableRow
              key={journey.id}
              onClick={() => onSelectJourney(journey)}
              className="border-zinc-850 cursor-pointer hover:bg-zinc-900/40 transition-colors group"
            >
              {/* Session ID */}
              <TableCell className="font-mono text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span>{journey.id.slice(0, 14)}...</span>
                  <button
                    onClick={(e) => handleCopy(journey.id, e)}
                    className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800"
                    title="Copy Session ID"
                  >
                    {copiedId === journey.id ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </TableCell>

              {/* QR Code */}
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-zinc-100 group-hover:text-sky-400 transition-colors">
                    {journey.qrName}
                  </span>
                  {journey.qrSlug && (
                    <span className="text-[11px] text-zinc-500 font-mono">/r/{journey.qrSlug}</span>
                  )}
                </div>
              </TableCell>

              {/* Device & OS */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800">
                    {getDeviceIcon(journey.deviceType)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-200 capitalize">
                      {journey.deviceType} • {journey.os}
                    </span>
                    <span className="text-[11px] text-zinc-500">{journey.browser}</span>
                  </div>
                </div>
              </TableCell>

              {/* Location */}
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-medium text-zinc-300 px-1.5 py-0">
                    {journey.country}
                  </Badge>
                  {journey.city && <span className="text-zinc-400">{journey.city}</span>}
                </div>
              </TableCell>

              {/* Time */}
              <TableCell className="text-xs text-zinc-400 font-mono">
                {formatTimestamp(journey.startedAt)}
              </TableCell>

              {/* Steps */}
              <TableCell className="text-center">
                <Badge variant="secondary" className="bg-zinc-800/60 text-zinc-300 font-mono text-[11px]">
                  {journey.eventsCount} {journey.eventsCount === 1 ? "step" : "steps"}
                </Badge>
              </TableCell>

              {/* Duration */}
              <TableCell className="text-center text-xs font-mono text-zinc-400">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-zinc-500" />
                  <span>{formatDuration(journey.durationSeconds)}</span>
                </div>
              </TableCell>

              {/* Outcome / Conversion */}
              <TableCell className="text-center">
                {journey.converted ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Converted</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-zinc-800 bg-zinc-900/40 text-zinc-500 text-xs gap-1">
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
                  className="h-7 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1 px-2"
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
