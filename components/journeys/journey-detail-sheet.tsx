"use client";

import * as React from "react";
import {
  QrCode,
  Eye,
  MousePointerClick,
  Send,
  Trophy,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  GitFork,
  Copy,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JourneySession } from "./journeys-table";

export interface SessionTimelineEvent {
  id: string;
  eventType: string;
  eventData?: Record<string, any>;
  timestamp: string | Date;
}

interface JourneyTimelineProps {
  session: JourneySession;
  events: SessionTimelineEvent[];
}

export function JourneyTimeline({ session, events }: JourneyTimelineProps) {
  const getEventMeta = (eventType: string) => {
    switch (eventType.toUpperCase()) {
      case "QR_SCAN":
        return {
          title: "QR Scan Detected",
          icon: <QrCode className="h-4 w-4 text-sky-400" />,
          color: "bg-sky-500/10 border-sky-500/30 text-sky-400",
          railColor: "border-sky-500/40",
        };
      case "PAGE_VIEW":
        return {
          title: "Page View",
          icon: <Eye className="h-4 w-4 text-blue-400" />,
          color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
          railColor: "border-blue-500/40",
        };
      case "BUTTON_CLICK":
      case "LINK_CLICK":
        return {
          title: "User Interaction",
          icon: <MousePointerClick className="h-4 w-4 text-purple-400" />,
          color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
          railColor: "border-purple-500/40",
        };
      case "FORM_SUBMIT":
        return {
          title: "Form Submission",
          icon: <Send className="h-4 w-4 text-amber-400" />,
          color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          railColor: "border-amber-500/40",
        };
      case "CONVERSION":
        return {
          title: "Goal Conversion Achieved",
          icon: <Trophy className="h-4 w-4 text-emerald-400" />,
          color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          railColor: "border-emerald-500/40",
        };
      case "EXTERNAL_REDIRECT":
      default:
        return {
          title: "External Redirection",
          icon: <ExternalLink className="h-4 w-4 text-zinc-400" />,
          color: "bg-zinc-800 border-zinc-700 text-zinc-300",
          railColor: "border-zinc-700",
        };
    }
  };

  const calculateDelta = (eventTime: string | Date) => {
    const start = new Date(session.startedAt).getTime();
    const curr = new Date(eventTime).getTime();
    const diffSeconds = Math.max(0, Math.round((curr - start) / 1000));
    if (diffSeconds === 0) return "+0s (Entry)";
    if (diffSeconds < 60) return `+${diffSeconds}s`;
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return `+${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Session Overview Stats Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-300">
              {session.deviceType.toUpperCase()} • {session.os}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs border-zinc-700 text-zinc-300">
              {session.country} {session.city ? `(${session.city})` : ""}
            </Badge>
          </div>
          {session.converted ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
              <Sparkles className="h-3 w-3" />
              Converted
            </Badge>
          ) : (
            <Badge variant="outline" className="text-zinc-500 border-zinc-800 text-xs">
              Drop-off
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
          <div>
            <span className="text-zinc-500 block">QR Source</span>
            <span className="font-medium text-zinc-200 truncate block">{session.qrName}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">Total Duration</span>
            <span className="font-mono font-medium text-zinc-200">
              {session.durationSeconds > 0 ? `${session.durationSeconds}s` : "< 5s"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Total Steps</span>
            <span className="font-mono font-medium text-zinc-200">{events.length}</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Chronological Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:bottom-3 before:top-3 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-sky-500 before:via-purple-500 before:to-emerald-500/30">
        {events.map((event, index) => {
          const meta = getEventMeta(event.eventType);
          const data = event.eventData || {};
          const isLast = index === events.length - 1;

          return (
            <div key={event.id || index} className="relative group">
              {/* Event Dot Icon */}
              <div
                className={`absolute -left-[23px] top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-zinc-950 shadow-md ${meta.color}`}
              >
                {meta.icon}
              </div>

              {/* Event Card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 transition-all hover:border-zinc-700">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-100">{meta.title}</span>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-zinc-900 text-zinc-400">
                      {event.eventType}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded">
                    {calculateDelta(event.timestamp)}
                  </span>
                </div>

                {/* Event Details according to Event Type */}
                {event.eventType === "QR_SCAN" && (
                  <div className="mt-2 text-xs space-y-1.5 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                    {data.conditionMatched && (
                      <div className="flex items-center gap-1.5 text-sky-400 font-medium">
                        <GitFork className="h-3.5 w-3.5" />
                        <span>Matched Dynamic Rule: {data.conditionMatched}</span>
                      </div>
                    )}
                    {data.destinationUrl && (
                      <div className="text-zinc-400 truncate flex items-center gap-1">
                        <span className="text-zinc-500">Redirected to:</span>
                        <span className="text-zinc-300 font-mono underline">{data.destinationUrl}</span>
                      </div>
                    )}
                  </div>
                )}

                {event.eventType === "PAGE_VIEW" && (
                  <div className="mt-2 text-xs space-y-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <span className="text-zinc-500">Page:</span>
                      <span className="font-mono text-sky-300">{data.page || "/"}</span>
                    </div>
                    {data.title && <div className="text-zinc-400 text-[11px]">{data.title}</div>}
                  </div>
                )}

                {(event.eventType === "BUTTON_CLICK" || event.eventType === "LINK_CLICK") && (
                  <div className="mt-2 text-xs space-y-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-850">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <span className="text-zinc-500">Clicked Element:</span>
                      <span className="font-semibold text-purple-300">
                        {data.target || data.buttonId || "Interactive Button"}
                      </span>
                    </div>
                    {data.action && <div className="text-zinc-400 text-[11px]">Action: {data.action}</div>}
                  </div>
                )}

                {event.eventType === "CONVERSION" && (
                  <div className="mt-2 text-xs space-y-1.5 bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Trophy className="h-4 w-4" />
                      <span>Conversion Goal: {data.goal || session.conversionEvent || "Completed"}</span>
                    </div>
                    {data.amount && (
                      <div className="text-emerald-300/80 font-mono text-xs">
                        Value: ${Number(data.amount).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-zinc-400 font-mono text-right">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface JourneyDetailSheetProps {
  session: JourneySession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JourneyDetailSheet({ session, open, onOpenChange }: JourneyDetailSheetProps) {
  const [events, setEvents] = React.useState<SessionTimelineEvent[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!session || !open) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/analytics/sessions/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.events && data.events.length > 0) {
            setEvents(data.events);
          } else {
            // Fallback synthetic initial scan event if not populated
            setEvents([
              {
                id: `evt_init_${session.id}`,
                eventType: "QR_SCAN",
                eventData: { destinationUrl: session.qrSlug ? `/r/${session.qrSlug}` : "Destination" },
                timestamp: session.startedAt,
              },
            ]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load session events:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session, open]);

  if (!session) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full bg-zinc-950 border-zinc-800 overflow-y-auto text-zinc-100">
        <SheetHeader className="pb-2 border-b border-zinc-800">
          <SheetTitle className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-sky-400" />
            <span>Scan Journey Explorer</span>
          </SheetTitle>
          <SheetDescription className="text-zinc-400 text-xs font-mono">
            Session: {session.id}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <span className="text-xs text-zinc-500 font-mono">Tracing visitor path...</span>
          </div>
        ) : (
          <JourneyTimeline session={session} events={events} />
        )}
      </SheetContent>
    </Sheet>
  );
}
