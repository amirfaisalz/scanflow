"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart for scan activity"

export interface ScanChartDataPoint {
  date: string;
  desktop: number;
  mobile: number;
}

interface ChartAreaInteractiveProps {
  data?: ScanChartDataPoint[];
}

/**
 * Generates fallback rolling date buckets up to today if no scan activity exists yet.
 */
function generateDefaultRollingData(days = 90): ScanChartDataPoint[] {
  const points: ScanChartDataPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    points.push({
      date: d.toISOString().split("T")[0],
      desktop: 0,
      mobile: 0,
    });
  }
  return points;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [selectedRange, setSelectedRange] = React.useState<string | null>(null)
  const timeRange = selectedRange ?? (isMobile ? "7d" : "90d")

  const rawData = React.useMemo(() => {
    if (data && data.length > 0) return data;
    return generateDefaultRollingData(90);
  }, [data]);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract);
    return rawData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [rawData, timeRange]);

  const totalScansInRange = React.useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.desktop + item.mobile, 0);
  }, [filteredData]);

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base sm:text-lg font-semibold">Scan Volume &amp; Device Telemetry</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            <span>
              {totalScansInRange > 0
                ? `${totalScansInRange.toLocaleString()} total scans recorded in the selected period`
                : "Real-time desktop vs mobile scan event activity"}
            </span>
          </CardDescription>
        </div>
        <CardAction className="ml-0 sm:ml-auto">
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(val) => {
              if (val && val[0]) setSelectedRange(val[0])
            }}
            variant="outline"
            className="hidden sm:flex *:data-[slot=toggle-group-item]:px-3"
          >
            <ToggleGroupItem value="90d" className="text-xs">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="text-xs">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="text-xs">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value) setSelectedRange(value)
            }}
          >
            <SelectTrigger
              className="flex w-36 sm:hidden text-xs"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg text-xs">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg text-xs">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg text-xs">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[260px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
