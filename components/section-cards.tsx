"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, QrCode, Users, Layers, Activity, Sparkles } from "lucide-react";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* Total Scans Card */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <QrCode className="size-3.5 text-primary" />
              Total Scans
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                <TrendingUpIcon className="size-3 mr-1 text-emerald-500" />
                Live Ingestion
              </Badge>
            </CardAction>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            0
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Ready for incoming scan events</span>
          </div>
          <div>Dynamic routing active on all codes</div>
        </CardFooter>
      </Card>

      {/* Unique Sessions Card */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <Users className="size-3.5 text-primary" />
              Unique Sessions
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-xs">
                Visitor Flow
              </Badge>
            </CardAction>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            0
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Multi-step session grouping</span>
          </div>
          <div>Session lifetime tracking enabled</div>
        </CardFooter>
      </Card>

      {/* Active QR Codes Card */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <Layers className="size-3.5 text-primary" />
              Active QR Codes
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-xs">
                Programmable
              </Badge>
            </CardAction>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            0
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Deterministic routing rules</span>
          </div>
          <div>PNG & SVG export available</div>
        </CardFooter>
      </Card>

      {/* Conversion Rate Card */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardDescription className="flex items-center gap-1.5 font-medium">
              <Activity className="size-3.5 text-primary" />
              Conversion Rate
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
                <Sparkles className="size-3 mr-1" />
                A/B Ready
              </Badge>
            </CardAction>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mt-1">
            0.0%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span>Conversions / Sessions</span>
          </div>
          <div>Track button clicks & goal submits</div>
        </CardFooter>
      </Card>
    </div>
  );
}
