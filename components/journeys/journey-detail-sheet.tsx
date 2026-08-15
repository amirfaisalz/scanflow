"use client";

import * as React from "react";
import {
  QrCode,
  Eye,
  MousePointerClick,
  Send,
  Trophy,
  ExternalLink,
  Sparkles,
  GitFork,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { JourneySession } from "./journeys-table";

export interface SessionEventData {
  conditionMatched?: string;
  destinationUrl?: string;
  page?: string;
  title?: string;
  target?: string;
  buttonId?: string;
  action?: string;
  goal?: string;
  amount?: string | number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface SessionTimelineEvent {
  id: string;
  eventType: string;
  eventData?: SessionEventData;
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
          icon: <QrCode className="h-4 w-4 text-sky-500" />,
          color: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
          railColor: "border-sky-500/40",
        };
      case "PAGE_VIEW":
        return {
          title: "Page View",
          icon: <Eye className="h-4 w-4 text-blue-500" />,
          color: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
          railColor: "border-blue-500/40",
        };
      case "BUTTON_CLICK":
      case "LINK_CLICK":
        return {
          title: "User Interaction",
          icon: <MousePointerClick className="h-4 w-4 text-purple-500" />,
          color: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
          railColor: "border-purple-500/40",
        };
      case "FORM_SUBMIT":
        return {
          title: "Form Submission",
          icon: <Send className="h-4 w-4 text-amber-500" />,
          color: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          railColor: "border-amber-500/40",
        };
      case "CONVERSION":
        return {
          title: "Goal Conversion Achieved",
          icon: <Trophy className="h-4 w-4 text-emerald-500" />,
          color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
          railColor: "border-emerald-500/40",
        };
      case "EXTERNAL_REDIRECT":
      default:
        return {
          title: "External Redirection",
          icon: <ExternalLink className="h-4 w-4 text-muted-foreground" />,
          color: "bg-muted border-border text-foreground",
          railColor: "border-border",
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
      <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs border-border text-foreground">
              {session.deviceType.toUpperCase()} • {session.os}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs border-border text-foreground">
              {session.country} {session.city ? `(${session.city})` : ""}
            </Badge>
          </div>
          {session.converted ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
              <Sparkles className="h-3 w-3" />
              Converted
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground border-border text-xs">
              Drop-off
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/80 text-xs">
          <div>
            <span className="text-muted-foreground block">QR Source</span>
            <span className="font-medium text-foreground truncate block">{session.qrName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Total Duration</span>
            <span className="font-mono font-medium text-foreground">
              {session.durationSeconds > 0 ? `${session.durationSeconds}s` : "< 5s"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Total Steps</span>
            <span className="font-mono font-medium text-foreground">{events.length}</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Chronological Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:bottom-3 before:top-3 before:left-[11px] before:w-[2px] before:bg-linear-to-b before:from-sky-500 before:via-purple-500 before:to-emerald-500/30">
        {events.map((event, index) => {
          const meta = getEventMeta(event.eventType);
          const data = event.eventData || {};

          return (
            <div key={event.id || index} className="relative group">
              {/* Event Dot Icon */}
              <div
                className={`absolute -left-[23px] top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm ${meta.color}`}
              >
                {meta.icon}
              </div>

              {/* Event Card */}
              <div className="rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-border shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{meta.title}</span>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-muted text-muted-foreground">
                      {event.eventType}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {calculateDelta(event.timestamp)}
                  </span>
                </div>

                {/* Event Details according to Event Type */}
                {event.eventType === "QR_SCAN" && (
                  <div className="mt-2 text-xs space-y-1.5 bg-muted/40 p-2.5 rounded-lg border border-border/60">
                    {data.conditionMatched && (
                      <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
                        <GitFork className="h-3.5 w-3.5" />
                        <span>Matched Dynamic Rule: {data.conditionMatched}</span>
                      </div>
                    )}
                    {data.destinationUrl && (
                      <div className="text-muted-foreground truncate flex items-center gap-1">
                        <span className="text-muted-foreground">Redirected to:</span>
                        <span className="text-foreground font-mono underline">{data.destinationUrl}</span>
                      </div>
                    )}
                  </div>
                )}

                {event.eventType === "PAGE_VIEW" && (
                  <div className="mt-2 text-xs space-y-1 bg-muted/40 p-2.5 rounded-lg border border-border/60">
                    <div className="flex items-center gap-1 text-foreground">
                      <span className="text-muted-foreground">Page:</span>
                      <span className="font-mono text-sky-600 dark:text-sky-400">{data.page || "/"}</span>
                    </div>
                    {data.title && <div className="text-muted-foreground text-[11px]">{data.title}</div>}
                  </div>
                )}

                {(event.eventType === "BUTTON_CLICK" || event.eventType === "LINK_CLICK") && (
                  <div className="mt-2 text-xs space-y-1 bg-muted/40 p-2.5 rounded-lg border border-border/60">
                    <div className="flex items-center gap-1 text-foreground">
                      <span className="text-muted-foreground">Clicked Element:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {data.target || data.buttonId || "Interactive Button"}
                      </span>
                    </div>
                    {data.action && <div className="text-muted-foreground text-[11px]">Action: {data.action}</div>}
                  </div>
                )}

                {event.eventType === "CONVERSION" && (
                  <div className="mt-2 text-xs space-y-1.5 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Trophy className="h-4 w-4" />
                      <span>Conversion Goal: {data.goal || session.conversionEvent || "Completed"}</span>
                    </div>
                    {data.amount && (
                      <div className="text-emerald-600/80 dark:text-emerald-300/80 font-mono text-xs">
                        Value: ${Number(data.amount).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-muted-foreground font-mono text-right">
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
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/sessions/${session?.id}`);
        const data = await res.json();
        if (isMounted) {
          if (data.events && data.events.length > 0) {
            setEvents(data.events);
          } else {
            // Fallback synthetic initial scan event if not populated
            setEvents([
              {
                id: `evt_init_${session?.id}`,
                eventType: "QR_SCAN",
                eventData: { destinationUrl: session?.qrSlug ? `/r/${session.qrSlug}` : "Destination" },
                timestamp: session?.startedAt || new Date().toISOString(),
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load session events:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [session, open]);

  if (!session) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full bg-card border-border overflow-y-auto text-foreground">
        <SheetHeader className="pb-2 border-b border-border">
          <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <QrCode className="h-5 w-5 text-sky-500" />
            <span>Scan Journey Explorer</span>
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs font-mono">
            Session: {session.id}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground font-mono">Tracing visitor path...</span>
          </div>
        ) : (
          <JourneyTimeline session={session} events={events} />
        )}
      </SheetContent>
    </Sheet>
  );
}
